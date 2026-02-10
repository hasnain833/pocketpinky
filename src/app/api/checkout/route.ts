
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover", // Use latest API version or valid one
});

const PRICES = {
    patterns: {
        name: "49 Patterns Field Guide",
        amount: 2700, // $27.00
        mode: "payment" as const,
        priceId: undefined as string | undefined,
    },
    bundle: {
        name: "Both Guides Bundle",
        amount: 3700, // $37.00
        mode: "payment" as const,
        priceId: undefined as string | undefined,
    },
    swirling: {
        name: "Swirling Success Guide",
        amount: 1900, // $19.00
        mode: "payment" as const,
        priceId: undefined as string | undefined,
    },
    premium: {
        name: "Pinky Premium Subscription",
        amount: 2497, // $24.97
        mode: "subscription" as const,
        priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    }
};

export async function POST(req: Request) {
    try {
        const { productId, userId, userEmail } = await req.json();

        if (!productId || !PRICES[productId as keyof typeof PRICES]) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        const startUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const product = PRICES[productId as keyof typeof PRICES];

        // For subscriptions, it's safer to use Price IDs from Stripe Dashboard
        const lineItem = product.priceId ? {
            price: product.priceId,
            quantity: 1,
        } : {
            price_data: {
                currency: "usd",
                product_data: {
                    name: product.name,
                    images: ["https://placehold.co/600x400/png"],
                },
                unit_amount: product.amount,
                ...(product.mode === "subscription" ? {
                    recurring: { interval: "month" as const }
                } : {}),
            },
            quantity: 1,
        };

        let stripeCustomerId: string | undefined;

        // Try to find existing customer by email
        if (userEmail) {
            const customers = await stripe.customers.list({
                email: userEmail,
                limit: 1,
            });

            if (customers.data.length > 0) {
                stripeCustomerId = customers.data[0].id;
            } else {
                // Create new customer if not found
                const customer = await stripe.customers.create({
                    email: userEmail,
                    metadata: {
                        supabaseUserId: userId,
                    },
                });
                stripeCustomerId = customer.id;
            }
        }

        console.log("Creating Stripe Checkout Session with:", {
            productId,
            userId,
            stripeCustomerId,
            mode: product.mode,
            priceId: product.priceId
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [lineItem],
            mode: product.mode,
            customer: stripeCustomerId,
            customer_update: {
                address: "auto",
            },
            success_url: product.mode === "subscription"
                ? `${startUrl}/?session_id={CHECKOUT_SESSION_ID}&success=true`
                : `${startUrl}/guides/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: product.mode === "subscription"
                ? `${startUrl}/#pricing`
                : `${startUrl}/guides`,
            client_reference_id: String(userId), // Critical for mapping to the user in webhook
            metadata: {
                productId: String(productId),
                userId: String(userId),
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("Error creating checkout session:", err);
        // Log the detailed Stripe error if available
        if (err.raw) console.error("Stripe Raw Error:", err.raw);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
