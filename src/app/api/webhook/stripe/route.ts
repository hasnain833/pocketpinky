
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
                        subscriptionEnd = subscription.current_period_end;
                    }

                    // Update our own profiles table as the single source of truth
                    const { error } = await supabaseAdmin
                        .from("profiles")
                        .upsert(
                            {
                                id: userId,
                                plan: "premium",
                                subscription_status: subscriptionStatus,
                                subscription_end: subscriptionEnd,
                                stripe_customer_id: session.customer as string | null,
                                stripe_subscription_id: session.subscription as string | null,
                            },
                            { onConflict: "id" }
                        );

                    if (error) {
                        console.error("Error updating user metadata via Admin API:", error);
                        // Still returning 200 to Stripe as we received the event, but logging the error
                    } else {
                        console.log(`Successfully updated user ${userId} to premium plan with status: ${subscriptionStatus}`);
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
                            subscription_end: updatedSubscription.current_period_end,
                            stripe_subscription_id: updatedSubscription.id,
                        })
                        .eq("id", profiles.id);
                    console.log(`Updated profile ${profiles.id} subscription status to: ${updatedSubscription.status}, cancel_at_period_end: ${updatedSubscription.cancel_at_period_end}`);
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
                }
            } catch (err) {
                console.error("Failed to revert user to free plan:", err);
            }
            break;

        case "invoice.paid":
        case "invoice.payment_succeeded":
            console.log(`Invoice paid: ${(event.data.object as Stripe.Invoice).id}`);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
