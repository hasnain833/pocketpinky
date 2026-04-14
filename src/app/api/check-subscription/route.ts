
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// All tiers that grant chatbot access beyond free trial
const PAID_TIERS = ["premium", "ultra_premium"];

// Free trial: 7 days from account creation
const TRIAL_DAYS = 7;

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(req.url);
        const queryUserId = searchParams.get("userId");

        let targetUserId = queryUserId;

        // If no userId in query, try to get from session
        if (!targetUserId) {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (user) {
                targetUserId = user.id;
            }
        }

        if (!targetUserId) {
            return NextResponse.json({
                plan: "free",
                tier: "free",
                message_credits: 0,
                isSubscribed: false,
                trialActive: false,
                trialExpired: true,
            }, { status: 401 });
        }

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("plan, message_credits, subscription_status, subscription_end, created_at")
            .eq("id", targetUserId)
            .maybeSingle();

        if (error) {
            console.error("check-subscription profiles error:", error);
            return NextResponse.json({
                plan: "free",
                tier: "free",
                message_credits: 0,
                isSubscribed: false,
                trialActive: false,
                trialExpired: true,
            }, { status: 500 });
        }

        const rawPlan = (profile?.plan as string | undefined) || "free";
        const messageCredits = profile?.message_credits || 0;
        const subscriptionEnd = profile?.subscription_end;
        const createdAt = profile?.created_at;

        let plan = rawPlan.toLowerCase();

        // ── Trial check (free users only) ─────────────────────────────────────────
        let trialActive = false;
        let trialExpired = true;

        if (plan === "free" && createdAt) {
            const trialEnd = new Date(createdAt);
            trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
            const now = new Date();

            if (now <= trialEnd) {
                trialActive = true;
                trialExpired = false;
            }
        }

        // ── Subscription expiry check (premium only) ──────────────────────────────
        let isSubscribed = PAID_TIERS.includes(plan);

        if (plan === "premium" && subscriptionEnd) {
            const now = new Date();
            const expiry = new Date(subscriptionEnd);
            if (now > expiry) {
                // Subscription lapsed — treat as free
                plan = "free";
                isSubscribed = false;
                trialExpired = true;
            }
        }

        // ultra_premium is lifetime — never expires
        if (plan === "ultra_premium") {
            isSubscribed = true;
            trialExpired = false;
        }

        return NextResponse.json({
            plan,
            tier: plan,          // explicit alias for Botpress clarity
            message_credits: messageCredits,
            isSubscribed,
            trialActive,
            trialExpired: isSubscribed ? false : trialExpired,
            subscription_end: subscriptionEnd ?? null,
        });

    } catch (error: any) {
        console.error("Check subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
