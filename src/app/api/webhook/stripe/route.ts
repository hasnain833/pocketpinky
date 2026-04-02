
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

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.client_reference_id || session.metadata?.userId;
            const productId = session.metadata?.productId;
            const customerEmail = session.customer_details?.email;

            console.log(`Payment successful for session ID: ${session.id}, User: ${userId}, Product: ${productId}, Email: ${customerEmail}`);

            if (customerEmail) {
                // Send confirmation email asynchronously with specific product ID
                sendPaymentConfirmationEmail(customerEmail, productId || 'premium')
                    .catch(err => console.error('Failed to send payment email:', err));
            }

            if (userId && productId === 'premium') {
                try {
                    const supabaseAdmin = createAdminClient();

                    // Fetch subscription details if this is a subscription
                    let subscriptionStatus = 'active';
                    let subscriptionEnd = null;

                    if (session.subscription) {
                        const subscription: any = await stripe.subscriptions.retrieve(session.subscription as string);
                        subscriptionStatus = subscription.status;
                        subscriptionEnd = subscription.current_period_end || null;
                        console.log(`[Stripe Webhook] Retrieved subscription: ${subscription.id}, current_period_end: ${subscriptionEnd}`);
                    } else {
                        console.warn(`[Stripe Webhook] Session ${session.id} is missing subscription ID.`);
                    }

                    // Update our own profiles table as the single source of truth
                    // Ensure we don't overwrite if subscription_end is missing for some reason
                    const upsertData: any = {
                        id: userId,
                        plan: "premium",
                        subscription_status: subscriptionStatus,
                        stripe_customer_id: session.customer as string | null,
                        stripe_subscription_id: session.subscription as string | null,
                    };

                    if (subscriptionEnd) {
                        upsertData.subscription_end = subscriptionEnd;
                    }

                    const { error } = await supabaseAdmin
                        .from("profiles")
                        .upsert(upsertData, { onConflict: "id" });

                    if (error) {
                        console.error("[Stripe Webhook] Supabase upsert error:", error);
                    } else {
                        console.log(`[Stripe Webhook] Successfully updated user ${userId} to premium. subscriptionEnd: ${subscriptionEnd}`);
                    }
                } catch (err) {
                    console.error("Failed to update user plan:", err);
                }
            } else if (productId) {
                console.log(`One-time purchase for product: ${productId}. No plan update needed.`);
            }
            break;

        case "customer.subscription.updated":
            const updatedSubscription: any = event.data.object;
            const customerId = updatedSubscription.customer;

            console.log(`Subscription updated: ${updatedSubscription.id}, Status: ${updatedSubscription.status}`);

            try {
                const supabaseAdmin = createAdminClient();
                // Find profile by stored stripe_customer_id
                const { data: profiles } = await supabaseAdmin
                    .from("profiles")
                    .select("id, stripe_customer_id")
                    .eq("stripe_customer_id", customerId)
                    .maybeSingle();

                if (profiles?.id) {
                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            subscription_status: updatedSubscription.status,
                            subscription_end: updatedSubscription.current_period_end || null,
                            stripe_subscription_id: updatedSubscription.id,
                        })
                        .eq("id", profiles.id);
                    console.log(`Updated profile ${profiles.id} subscription status to: ${updatedSubscription.status}`);

                    // Send Webhook to Botpress for updates as well (covers trial to active, etc.)
                    const botpressWebhookUrl = process.env.BOTPRESS_WEBHOOK_URL;
                    if (botpressWebhookUrl) {
                        try {
                            const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
                            await fetch(botpressWebhookUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId: profiles.id,
                                    email: customer.email,
                                    action: 'subscription_updated',
                                    status: updatedSubscription.status
                                })
                            });
                        } catch (err) {
                            console.error('Failed to send update webhook to Botpress:', err);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to update subscription status:", err);
            }
            break;

        case "customer.subscription.deleted":
            const deletedSubscription: any = event.data.object;
            const deletedCustomerId = deletedSubscription.customer;

            console.log(`Subscription deleted: ${deletedSubscription.id}`);

            try {
                const supabaseAdmin = createAdminClient();
                const { data: profiles } = await supabaseAdmin
                    .from("profiles")
                    .select("id, stripe_customer_id")
                    .eq("stripe_customer_id", deletedCustomerId)
                    .maybeSingle();

                if (profiles?.id) {
                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            plan: "free",
                            subscription_status: null,
                            subscription_end: null,
                        })
                        .eq("id", profiles.id);
                    console.log(`Reverted profile ${profiles.id} to free plan`);

                    // Send Webhook to Botpress to downgrade the user when subscription expires
                    const botpressWebhookUrl = process.env.BOTPRESS_WEBHOOK_URL;
                    if (botpressWebhookUrl && profiles.id) {
                        try {
                            // Get customer email from Stripe for better identification
                            const customer = await stripe.customers.retrieve(deletedCustomerId) as Stripe.Customer;
                            
                            await fetch(botpressWebhookUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId: profiles.id, // Supabase ID mapped to Botpress User ID
                                    email: customer.email,
                                    action: 'cancel_subscription' // Uses the same action for both explicit cancellation and Stripe expiry
                                })
                            });
                            console.log(`Sent cancel_subscription webhook to Botpress for expired user ${profiles.id} (${customer.email})`);
                        } catch (err) {
                            console.error('Failed to send webhook to Botpress for expiry:', err);
                        }
                    }

                }
            } catch (err) {
                console.error("Failed to revert user to free plan:", err);
            }
            break;

        case "invoice.paid":
        case "invoice.payment_succeeded":
            const invoice = event.data.object as any;
            console.log(`[Stripe Webhook] Invoice paid: ${invoice.id}, Customer: ${invoice.customer}`);

            if (invoice.customer && invoice.subscription) {
                try {
                    const supabaseAdmin = createAdminClient();
                    const subscription: any = await stripe.subscriptions.retrieve(invoice.subscription as string);

                    // Find profile by stored stripe_customer_id
                    const { data: profiles } = await supabaseAdmin
                        .from("profiles")
                        .select("id")
                        .eq("stripe_customer_id", invoice.customer as string)
                        .maybeSingle();

                    if (profiles?.id) {
                        const { error: updateError } = await supabaseAdmin
                            .from("profiles")
                            .update({
                                subscription_status: subscription.status,
                                subscription_end: subscription.current_period_end || null,
                            })
                            .eq("id", profiles.id);

                        if (updateError) {
                            console.error(`[Stripe Webhook] Error updating profile ${profiles.id} on invoice paid:`, updateError);
                        } else {
                            console.log(`[Stripe Webhook] Successfully extended subscription for user ${profiles.id} to ${subscription.current_period_end}`);
                        }
                    }
                } catch (err) {
                    console.error("[Stripe Webhook] Failed to handle invoice.paid:", err);
                }
            }
            break;

        case "invoice.payment_failed":
            const failedInvoice = event.data.object as any;
            console.log(`[Stripe Webhook] Invoice payment failed: ${failedInvoice.id}, Customer: ${failedInvoice.customer}`);

            if (failedInvoice.customer) {
                try {
                    const supabaseAdmin = createAdminClient();
                    const { data: profiles } = await supabaseAdmin
                        .from("profiles")
                        .select("id")
                        .eq("stripe_customer_id", failedInvoice.customer as string)
                        .maybeSingle();

                    if (profiles?.id) {
                        // Mark as past_due so the user sees a warning, but don't cut them off yet (Standard Industry Practice)
                        await supabaseAdmin
                            .from("profiles")
                            .update({
                                subscription_status: "past_due",
                            })
                            .eq("id", profiles.id);
                        
                        console.log(`[Stripe Webhook] Flagged user ${profiles.id} as past_due due to failed payment.`);
                    }
                } catch (err) {
                    console.error("[Stripe Webhook] Failed to handle invoice.payment_failed:", err);
                }
            }
            break;

        default:
            console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
