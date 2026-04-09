export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";

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
    },
    "user-500": {
        name: "500 Message Pack",
        amount: 5000, // $50.00
        mode: "payment" as const,
        priceId: undefined as string | undefined,
    },
    "user-1000": {
        name: "1000 Message Pack",
        amount: 8000, // $80.00
        mode: "payment" as const,
        priceId: undefined as string | undefined,
    },
};

export async function POST(req: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: "Stripe secret key not configured" }, { status: 500 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2026-01-28.clover",
        });

        const { productId, userId, userEmail } = await req.json();

        if (!productId || !PRICES[productId as keyof typeof PRICES]) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        const startUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const product = PRICES[productId as keyof typeof PRICES];

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

        if (userEmail) {
            const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
            if (customers.data.length > 0) {
                stripeCustomerId = customers.data[0].id;
            } else {
                const customer = await stripe.customers.create({ email: userEmail, metadata: { supabaseUserId: userId } });
                stripeCustomerId = customer.id;
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [lineItem],
            mode: product.mode,
            customer: stripeCustomerId,
            customer_update: { address: "auto" },
            success_url: `${startUrl}/?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: product.mode === "subscription" ? `${startUrl}/#pricing` : startUrl,
            client_reference_id: String(userId),
            metadata: { productId: String(productId), userId: String(userId) },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("Error creating checkout session:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Support for direct links (GET) from Botpress
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");
        const userId = searchParams.get("userId");

        if (!productId || !userId || !PRICES[productId as keyof typeof PRICES]) {
            return NextResponse.json({ error: "Missing or invalid productId/userId" }, { status: 400 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" });
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabaseAdmin = createAdminClient();
        const { data: profile } = await supabaseAdmin.from("profiles").select("email, stripe_customer_id").eq("id", userId).maybeSingle();

        if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

        const product = PRICES[productId as keyof typeof PRICES];
        const startUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        let stripeCustomerId = profile.stripe_customer_id;
        if (!stripeCustomerId && profile.email) {
            const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
            stripeCustomerId = customers.data[0]?.id || (await stripe.customers.create({ email: profile.email, metadata: { supabaseUserId: userId } })).id;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: { name: product.name },
                    unit_amount: product.amount,
                },
                quantity: 1,
            }],
            mode: product.mode,
            customer: stripeCustomerId,
            customer_update: { address: "auto" },
            success_url: `${startUrl}/?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: startUrl,
            client_reference_id: String(userId),
            metadata: { productId: String(productId), userId: String(userId) },
        });

        return session.url ? NextResponse.redirect(session.url) : NextResponse.json({ error: "No URL" }, { status: 500 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
