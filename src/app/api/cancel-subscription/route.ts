import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: "Stripe secret key not configured" }, { status: 500 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2026-01-28.clover",
        });

        // Get authenticated user
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Get subscription ID from profiles table for this user (session-based)
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("stripe_subscription_id")
            .eq("id", userId)
            .maybeSingle();

        if (profileError) {
            console.error("Error loading profile for cancellation:", profileError);
            return NextResponse.json({ error: "Profile not found" }, { status: 400 });
        }

        const subscriptionId = profile?.stripe_subscription_id as string | null;

        if (!subscriptionId) {
            return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
        }

        console.log(`Cancelling subscription ${subscriptionId} for user ${userId} immediately`);

        // Cancel subscription immediately as requested by user
        const subscription: any = await stripe.subscriptions.cancel(subscriptionId);

        console.log(`Subscription ${subscriptionId} cancelled immediately.`);

        // Update profiles table to reflect immediate revert to free plan
        const { error } = await supabase
            .from("profiles")
            .update({
                plan: "free",
                subscription_status: "canceled",
                subscription_end: null,
                cancel_at_period_end: false,
                stripe_subscription_id: null,
            })
            .eq("id", userId);

        if (error) {
            console.error("Error updating user metadata:", error);
            return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
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
