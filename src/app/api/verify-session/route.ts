
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: "Stripe secret key not configured" }, { status: 500 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2026-01-28.clover",
        });

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return NextResponse.json({
            status: session.payment_status,
            productId: session.metadata?.productId,
        });
    } catch (err: unknown) {
        console.error("Error verifying Stripe session:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "Verification error" }, { status: 500 });
    }
}
