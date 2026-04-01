import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        // Read body once at the top (can only be consumed once per request)
        const body = await req.json().catch(() => ({})) as { conversationIds?: string[] };
        const botpressConversationIds = body?.conversationIds && Array.isArray(body.conversationIds) ? body.conversationIds : [];

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: "Stripe secret key not configured" }, { status: 500 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2026-01-28.clover",
        });

        // Get authenticated user
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error("cancel-subscription getUser error:", userError);
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user.id;

        // Get subscription ID from profiles table for this user (session-based)
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("stripe_subscription_id, stripe_customer_id")
            .eq("id", userId)
            .maybeSingle();

        if (profileError) {
            console.error("Error loading profile for cancellation:", profileError);
            return NextResponse.json({ error: "Profile not found" }, { status: 400 });
        }

        let subscriptionId = profile?.stripe_subscription_id as string | null;
        const stripeCustomerId = profile?.stripe_customer_id as string | null;

        if (!subscriptionId) {
            console.log(`No subscription ID found in DB for user ${userId}. Checking Stripe for customer ${stripeCustomerId}...`);

            if (stripeCustomerId) {
                // Fallback: Try to find an active subscription for this customer in Stripe
                const subscriptions = await stripe.subscriptions.list({
                    customer: stripeCustomerId,
                    status: 'active',
                    limit: 1,
                });

                if (subscriptions.data.length > 0) {
                    subscriptionId = subscriptions.data[0].id;
                    console.log(`Found active subscription ${subscriptionId} in Stripe for customer ${stripeCustomerId}`);

                    // Proactively update the database with this ID for future use
                    const supabaseAdmin = createAdminClient();
                    await supabaseAdmin
                        .from("profiles")
                        .update({ stripe_subscription_id: subscriptionId })
                        .eq("id", userId);
                }
            }
        }

        if (!subscriptionId) {
            return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
        }

        console.log(`Cancelling subscription ${subscriptionId} for user ${userId} immediately`);

        // Cancel the Stripe subscription immediately
        try {
            console.log(`Cancelling subscription ${subscriptionId} for user ${userId} immediately`);
            await stripe.subscriptions.cancel(subscriptionId);
            console.log(`Subscription ${subscriptionId} cancelled immediately.`);
        } catch (stripeError: any) {
            console.error("Stripe cancellation error:", stripeError);

            if (stripeError.code === 'resource_missing' || stripeError.statusCode === 404) {
                 console.log("Subscription not found in Stripe, may already be cancelled.");
            } else {
                 return NextResponse.json({ error: "Failed to cancel subscription with payment provider" }, { status: 500 });
            }
        }

        // --- IMPORTANT: Immediately update the DB to "free" to forcefully downgrade ---
        const adminSupabase = createAdminClient();
        const { error: dbError } = await adminSupabase
            .from('profiles')
            .update({
                plan: 'free',
                subscription_status: 'canceled',
                subscription_end: null,
                cancel_at_period_end: false,
                stripe_subscription_id: null
            })
            .eq('id', userId);

        if (dbError) {
            console.error('Failed to forcefully downgrade user plan in DB:', dbError);
        }

        // Notify Botpress Webhook to securely downgrade user immediately
        const botpressWebhookUrl = process.env.BOTPRESS_WEBHOOK_URL;
        if (botpressWebhookUrl) {
            try {
                await fetch(botpressWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userId,
                        email: user.email,
                        action: 'cancel_subscription'
                    })
                });
                console.log(`Sent cancel_subscription webhook to Botpress for user ${userId}`);
            } catch (err) {
                console.error('Failed to send webhook to Botpress:', err);
            }
        } else {
            console.log('BOTPRESS_WEBHOOK_URL is not set, skipping Botpress sync.');
        }

        // --- Nuke All Conversations in Botpress Cloud ---
        const botpressApiToken = process.env.BOTPRESS_API_TOKEN;
        const botpressWebhookBotId = process.env.BOTPRESS_BOT_ID || '';
        const bpHeaders: Record<string, string> = {
            'Authorization': `Bearer ${botpressApiToken}`,
            'x-bot-id': botpressWebhookBotId,
            'Content-Type': 'application/json'
        };

        if (botpressApiToken) {
            try {
                console.log(`[Botpress Server Sync] Attempting to permanently nuke conversations: ${botpressConversationIds.length}`);
                
                for (const convId of botpressConversationIds) {
                    const bpRes = await fetch(
                        `https://api.botpress.cloud/v1/chat/conversations/${convId}`,
                        { method: 'DELETE', headers: bpHeaders }
                    );
                    if (bpRes.ok) {
                         console.log(`[Botpress Sync] Nuked Botpress conversation on cloud: ${convId}`);
                    }
                }
            } catch (err) {
                console.error('[Botpress Sync] Error deleting Botpress conversations:', err);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Subscription cancelled successfully. You have been reverted to the free plan.",
        });

    } catch (err: any) {
        console.error("Error cancelling subscription:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
