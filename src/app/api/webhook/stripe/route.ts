
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendPaymentConfirmationEmail } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET;

    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: "Stripe secret key not configured" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-01-28.clover",
    });
    const body = await req.text();
    const sig = headers().get("stripe-signature");

    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) {
            console.error("Webhook signature or secret missing", { sig: !!sig, secret: !!endpointSecret });
            return NextResponse.json({ error: "Webhook secret not configured or signature missing" }, { status: 400 });
        }
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Helper: notify Botpress about a tier change
    const notifyBotpress = async (payload: Record<string, unknown>) => {
        const url = process.env.BOTPRESS_WEBHOOK_URL;
        if (!url) return;
        try {
            await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        } catch (err) {
            console.error("[Botpress] Webhook notification failed:", err);
        }
    };

    switch (event.type as string) {

        // ─── CHECKOUT COMPLETED ───────────────────────────────────────────────────
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId    = session.client_reference_id || session.metadata?.userId;
            const productId = session.metadata?.productId;
            const customerEmail = session.customer_details?.email;

            console.log(`[Stripe] checkout.session.completed — User: ${userId}, Product: ${productId}`);

            if (!userId) {
                console.warn("[Stripe Webhook] No userId found in session. Skipping profile update.");
                break;
            }

            const supabaseAdmin = createAdminClient();

            // ── CASE 1: Premium Monthly Subscription ──────────────────────────────
            if (productId === "premium") {
                try {
                    let subscriptionStatus = "active";
                    let subscriptionEnd: string | null = null;

                    if (session.subscription) {
                        const subscription: any = await stripe.subscriptions.retrieve(session.subscription as string);
                        subscriptionStatus = subscription.status;

                        const rawEnd = subscription.current_period_end ||
                                       subscription.items?.data?.[0]?.current_period_end;
                        const seconds = rawEnd || Math.floor(Date.now() / 1000) + (31 * 24 * 60 * 60);
                        subscriptionEnd = new Date(seconds * 1000).toISOString();

                        console.log(`[Stripe Webhook] Premium subscriptionEnd: ${subscriptionEnd}`);
                    } else {
                        console.warn(`[Stripe Webhook] Session ${session.id} has no subscription ID.`);
                    }

                    const updateData: any = {
                        plan: "premium",
                        subscription_status: subscriptionStatus,
                        stripe_customer_id: session.customer as string | null,
                        stripe_subscription_id: session.subscription as string | null,
                        updated_at: new Date().toISOString(),
                    };
                    if (subscriptionEnd) updateData.subscription_end = subscriptionEnd;

                    const { error } = await supabaseAdmin.from("profiles").update(updateData).eq("id", userId);

                    if (error) {
                        console.error("[Stripe Webhook] Failed to update premium profile:", error);
                    } else {
                        console.log(`[Stripe Webhook] ✅ User ${userId} → premium`);
                        
                        // Send confirmation email after successful DB update
                        if (customerEmail) {
                            sendPaymentConfirmationEmail(customerEmail, "premium")
                                .catch(err => console.error("Failed to send payment email:", err));
                        }

                        await notifyBotpress({ userId, email: customerEmail, action: "tier_upgraded", newTier: "premium" });
                    }
                } catch (err) {
                    console.error("[Stripe Webhook] Error processing premium purchase:", err);
                }

            // ── CASE 2: user-500 or user-1000 One-Time Message Packs ─────────────
            } else if (productId === "user-500" || productId === "user-1000") {
                try {
                    const creditsToAdd = productId === "user-500" ? 500 : 1000;
                    
                    // Fetch existing credits
                    const { data: profile } = await supabaseAdmin
                        .from("profiles")
                        .select("message_credits")
                        .eq("id", userId)
                        .single();
                        
                    const existingCredits = profile?.message_credits || 0;
                    const newCredits = existingCredits + creditsToAdd;

                    const { error } = await supabaseAdmin
                        .from("profiles")
                        .update({
                            message_credits: newCredits,
                            stripe_customer_id: session.customer as string | null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", userId);

                    if (error) {
                        console.error(`[Stripe Webhook] Failed to add ${creditsToAdd} credits for ${userId}:`, error);
                    } else {
                        console.log(`[Stripe Webhook] ✅ User ${userId} purchased ${creditsToAdd} credits. Total: ${newCredits}`);
                        await notifyBotpress({ userId, email: customerEmail, action: "add_credits", credits: creditsToAdd });
                    }
                } catch (err) {
                    console.error(`[Stripe Webhook] Error processing ${productId} purchase:`, err);
                }

            // ── CASE 3: Other one-time products (guides etc.) ─────────────────────
            } else if (productId) {
                console.log(`[Stripe Webhook] One-time product: ${productId}. No plan update needed.`);
            }

            break;
        }

        // ─── SUBSCRIPTION RENEWED / UPDATED ──────────────────────────────────────
        case "customer.subscription.updated": {
            const sub: any = event.data.object;
            const customerId = sub.customer;

            console.log(`[Stripe] subscription.updated — ${sub.id}, Status: ${sub.status}`);

            try {
                const supabaseAdmin = createAdminClient();
                const { data: profile } = await supabaseAdmin
                    .from("profiles")
                    .select("id")
                    .eq("stripe_customer_id", customerId)
                    .maybeSingle();

                if (profile?.id) {
                    const rawEnd = sub.current_period_end || sub.items?.data?.[0]?.current_period_end || null;
                    const subscriptionEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : null;

                    await supabaseAdmin.from("profiles").update({
                        subscription_status: sub.status,
                        subscription_end: subscriptionEnd,
                        stripe_subscription_id: sub.id,
                    }).eq("id", profile.id);

                    console.log(`[Stripe Webhook] Updated profile ${profile.id} → status: ${sub.status}`);

                    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
                    await notifyBotpress({ userId: profile.id, email: customer.email, action: "subscription_updated", status: sub.status });
                }
            } catch (err) {
                console.error("[Stripe Webhook] Failed to handle subscription.updated:", err);
            }
            break;
        }

        // ─── SUBSCRIPTION CANCELLED / EXPIRED ────────────────────────────────────
        case "customer.subscription.deleted": {
            const sub: any = event.data.object;
            const customerId = sub.customer;

            console.log(`[Stripe] subscription.deleted — ${sub.id}`);

            try {
                const supabaseAdmin = createAdminClient();
                const { data: profile } = await supabaseAdmin
                    .from("profiles")
                    .select("id")
                    .eq("stripe_customer_id", customerId)
                    .maybeSingle();

                if (profile?.id) {
                    await supabaseAdmin.from("profiles").update({
                        plan: "free",
                        subscription_status: null,
                        subscription_end: null,
                        message_credits: 0,
                    }).eq("id", profile.id);

                    console.log(`[Stripe Webhook] Reverted ${profile.id} to free`);

                    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
                    await notifyBotpress({ userId: profile.id, email: customer.email, action: "cancel_subscription" });
                }
            } catch (err) {
                console.error("[Stripe Webhook] Failed to handle subscription.deleted:", err);
            }
            break;
        }

        // ─── INVOICE PAID (renewal sync) ─────────────────────────────────────────
        case "invoice.paid":
        case "invoice.payment_succeeded": {
            const invoice = event.data.object as any;
            console.log(`[Stripe] ${event.type} — Invoice: ${invoice.id}, Customer: ${invoice.customer}`);

            if (invoice.customer && invoice.subscription) {
                try {
                    const supabaseAdmin = createAdminClient();
                    const subscription: any = await stripe.subscriptions.retrieve(invoice.subscription as string);

                    // 1. Find by stripe_customer_id
                    let { data: profile } = await supabaseAdmin
                        .from("profiles").select("id").eq("stripe_customer_id", invoice.customer).maybeSingle();

                    // 2. Fallback: find by email
                    if (!profile) {
                        const customer = await stripe.customers.retrieve(invoice.customer) as Stripe.Customer;
                        if (customer.email) {
                            const { data: ep } = await supabaseAdmin
                                .from("profiles").select("id").eq("email", customer.email).maybeSingle();
                            profile = ep;
                        }
                    }

                    if (profile?.id) {
                        const rawEnd = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end;
                        const seconds = rawEnd || Math.floor(Date.now() / 1000) + (31 * 24 * 60 * 60);
                        const subscriptionEnd = new Date(seconds * 1000).toISOString();

                        await supabaseAdmin.from("profiles").update({
                            subscription_status: subscription.status,
                            subscription_end: subscriptionEnd,
                            stripe_customer_id: invoice.customer,
                        }).eq("id", profile.id);

                        console.log(`[Stripe Webhook] ✅ Synced renewal for ${profile.id} → ${subscriptionEnd}`);
                    }
                } catch (err) {
                    console.error("[Stripe Webhook] Failed to handle invoice.paid:", err);
                }
            }
            break;
        }

        // ─── PAYMENT FAILED ───────────────────────────────────────────────────────
        case "invoice.payment_failed": {
            const invoice = event.data.object as any;
            console.log(`[Stripe] invoice.payment_failed — ${invoice.id}`);

            if (invoice.customer) {
                try {
                    const supabaseAdmin = createAdminClient();
                    const { data: profile } = await supabaseAdmin
                        .from("profiles").select("id").eq("stripe_customer_id", invoice.customer).maybeSingle();

                    if (profile?.id) {
                        await supabaseAdmin.from("profiles").update({ subscription_status: "past_due" }).eq("id", profile.id);
                        console.log(`[Stripe Webhook] Flagged ${profile.id} as past_due`);
                    }
                } catch (err) {
                    console.error("[Stripe Webhook] Failed to handle invoice.payment_failed:", err);
                }
            }
            break;
        }

        // ─── KNOWN LIFECYCLE EVENTS (no action needed) ───────────────────────────
        case "charge.succeeded":
        case "payment_method.attached":
        case "customer.subscription.created":
        case "payment_intent.succeeded":
        case "payment_intent.created":
        case "invoice.created":
        case "invoice.finalized":
        case "invoice.updated":
        case "invoice_payment.paid":
        case "invoice_payment.succeeded":
            console.log(`[Stripe Webhook] Acknowledged: ${event.type}`);
            break;

        default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
