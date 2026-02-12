
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");
        const userId = searchParams.get("userId");

        if (!email && !userId) {
            return NextResponse.json({ error: "Email or UserID required" }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient();
        let user;

        if (userId) {
            const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
            if (error) throw error;
            user = data.user;
        } else if (email) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers();
            if (error) throw error;
            user = (data.users as any[]).find(u => u.email?.toLowerCase() === email.toLowerCase());
        }

        if (!user) {
            return NextResponse.json({
                plan: "free",
                isSubscribed: false,
                trialExpired: true,
            });
        }

        // FINAL: use profiles.plan as single source of truth
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("plan")
            .eq("id", user.id)
            .maybeSingle();

        const rawPlan = (profile?.plan as string | undefined) || "free";
        const plan = rawPlan.toLowerCase();
        const isPremium = plan === "premium";

        return NextResponse.json({
            plan,
            isSubscribed: isPremium,
            trialExpired: isPremium ? false : true,
        });

    } catch (error: any) {
        console.error("Check subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
