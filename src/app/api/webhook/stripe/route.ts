
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
    switch (event.type as string) {
        case "checkout.session.completed": {
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
                        
                        // DEEP DEBUG LOG - Keeping for now to verify the fix
                        console.log(`[Stripe Debug] Full Subscription Object for ${subscription.id}:`, JSON.stringify(subscription, null, 2));

                        subscriptionStatus = subscription.status;
                        
                        // Clover-version fix: Access current_period_end from the first item if missing at top level
                        // Fallback: If both are missing, default to 31 days from the subscription start (start_date)
                        const rawEnd = subscription.current_period_end || 
                                       subscription.items?.data?.[0]?.current_period_end;
                        
                        const seconds = rawEnd || (subscription.start_date ? subscription.start_date + (31 * 24 * 60 * 60) : Math.floor(Date.now() / 1000) + (31 * 24 * 60 * 60));
                        subscriptionEnd = new Date(seconds * 1000).toISOString();
                                          
                        console.log(`[Stripe Webhook] Calculated subscriptionEnd: ${subscriptionEnd} (Raw top-level: ${subscription.current_period_end})`);
                    } else {
                        console.warn(`[Stripe Webhook] Session ${session.id} is missing subscription ID.`);
                    }

                    // Use UPDATE (not upsert) to avoid wiping other profile fields like email
                    // which can cause session issues on production
                    const updateData: any = {
                        plan: "premium",
                        subscription_status: subscriptionStatus,
                        stripe_customer_id: session.customer as string | null,
                        stripe_subscription_id: session.subscription as string | null,
                        updated_at: new Date().toISOString(),
                    };

                    if (subscriptionEnd) {
                        updateData.subscription_end = subscriptionEnd;
                    }

                    const { error } = await supabaseAdmin
                        .from("profiles")
                        .update(updateData)
                        .eq("id", userId);

                    if (error) {
                        console.error("[Stripe Webhook] Supabase update error:", error);
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
        }

        case "customer.subscription.updated": {
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
                    const rawEnd = updatedSubscription.current_period_end || 
                                          updatedSubscription.items?.data?.[0]?.current_period_end || 
                                          null;
                    const subscriptionEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : null;
                                              
                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            subscription_status: updatedSubscription.status,
                            subscription_end: subscriptionEnd,
                            stripe_subscription_id: updatedSubscription.id,
                        })
                        .eq("id", profiles.id);
                    console.log(`Updated profile ${profiles.id} status to ${updatedSubscription.status}, end to ${subscriptionEnd}`);

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
        }

        case "customer.subscription.deleted": {
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
        }

        case "invoice.paid":
        case "invoice.payment_succeeded": {
            // NOTE: invoice_payment.paid is intentionally excluded — it has a different object
            // structure (customer is undefined) and invoice.paid already covers this event.
            const invoice = event.data.object as any;
            console.log(`[Stripe Webhook] Invoice paid (${event.type}): ${invoice.id}, Customer: ${invoice.customer}`);

            if (invoice.customer && invoice.subscription) {
                try {
                    const supabaseAdmin = createAdminClient();
                    const subscription: any = await stripe.subscriptions.retrieve(invoice.subscription as string);

                    // 1. Try to find profile by stored stripe_customer_id
                    let { data: profile } = await supabaseAdmin
                        .from("profiles")
                        .select("id")
                        .eq("stripe_customer_id", invoice.customer as string)
                        .maybeSingle();

                    // 2. FALLBACK: If not found (common for new users), find by email
                    if (!profile) {
                        const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
                        if (customer.email) {
                            console.log(`[Stripe Webhook] Customer ID not linked yet. Trying email fallback: ${customer.email}`);
                            const { data: emailProfile } = await supabaseAdmin
                                .from("profiles")
                                .select("id")
                                .eq("email", customer.email)
                                .maybeSingle();
                            profile = emailProfile;
                        }
                    }

                    if (profile?.id) {
                        const rawEnd = subscription.current_period_end || 
                                       subscription.items?.data?.[0]?.current_period_end;
                        
                        const seconds = rawEnd || (subscription.start_date ? subscription.start_date + (31 * 24 * 60 * 60) : Math.floor(Date.now() / 1000) + (31 * 24 * 60 * 60));
                        const subscriptionEnd = new Date(seconds * 1000).toISOString();
                                              
                        const { error: updateError } = await supabaseAdmin
                            .from("profiles")
                            .update({
                                subscription_status: subscription.status,
                                subscription_end: subscriptionEnd,
                                stripe_customer_id: invoice.customer as string, // Link it now if it wasn't
                            })
                            .eq("id", profile.id);

                        if (updateError) {
                            console.error(`[Stripe Webhook] Error updating profile ${profile.id} on invoice paid:`, updateError);
                        } else {
                            console.log(`[Stripe Webhook] Successfully sync'd subscription for user ${profile.id} to ${subscriptionEnd}`);
                        }
                    } else {
                        console.warn(`[Stripe Webhook] Could not find profile for customer ${invoice.customer} or email.`);
                    }
                } catch (err) {
                    console.error("[Stripe Webhook] Failed to handle invoice.paid:", err);
                }
            }
            break;
        }

        case "invoice.payment_failed": {
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
        }

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
            // These are standard lifecycle events we don't need to act on specifically, 
            // but we handle them here to keep the logs clean.
            console.log(`[Stripe Webhook] Acknowledged: ${event.type}`);
            break;

        default:
            console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
