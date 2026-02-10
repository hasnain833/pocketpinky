import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
    try {
        // Get authenticated user
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Get subscription ID from user metadata
        const subscriptionId = session.user.app_metadata?.stripe_subscription_id;

        if (!subscriptionId) {
            return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
        }

        console.log(`Cancelling subscription ${subscriptionId} for user ${userId} immediately`);

        // Cancel subscription immediately as requested by user
        const subscription: any = await stripe.subscriptions.cancel(subscriptionId);

        console.log(`Subscription ${subscriptionId} cancelled immediately.`);

        // Update user metadata to reflect immediate revert to free plan
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            {
                app_metadata: {
                    plan: "free",
                    subscription_status: "canceled",
                    subscription_end: null,
                    cancel_at_period_end: false,
                    stripe_subscription_id: null,
                }
            }
        );

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
