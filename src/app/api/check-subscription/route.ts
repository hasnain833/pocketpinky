
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        // We ignore email/userId now and always use the current session user
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error("check-subscription getUser error:", userError);
        }

        if (!user) {
            // No authenticated user: treat as free
            return NextResponse.json({
                plan: "free",
                isSubscribed: false,
                trialExpired: true,
            }, { status: 401 });
        }

        // Use profiles.plan as single source of truth for THIS user
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("plan, subscription_end")
            .eq("id", user.id)
            .maybeSingle();

        // console.log(`[Subscription API] DB Response for ${user.id}:`, { profile, error });

        if (error) {
            console.error("check-subscription profiles error:", error);
            return NextResponse.json({
                plan: "free",
                isSubscribed: false,
                trialExpired: true,
            }, { status: 500 });
        }

        const rawPlan = (profile?.plan as string | undefined) || "free";
        const subscriptionEnd = profile?.subscription_end;

        let plan = rawPlan.toLowerCase();
        let isSubscribed = plan === "premium";
        if (isSubscribed && subscriptionEnd) {
            const now = new Date();
            const expiry = new Date(subscriptionEnd);

            if (now > expiry) {
                // console.log(`[Subscription API] User ${user.id} has expired (End: ${subscriptionEnd}). Overriding status to 'free'.`);
                plan = "free";
                isSubscribed = false;
            }
        }

        return NextResponse.json({
            plan,
            isSubscribed: isSubscribed,
            trialExpired: isSubscribed ? false : true,
            subscription_end: subscriptionEnd
        });

    } catch (error: any) {
        console.error("Check subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
