
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
            // Debug payload so we can see what's happening in production
            return NextResponse.json({
                plan: "free",
                isSubscribed: false,
                trialExpired: true, // Default to true if user not found to be safe
                debug: {
                    found: false,
                    email,
                    userId,
                }
            });
        }

        // Normalize plan to lowercase so variants like "Premium" or "PREMIUM" are treated the same
        const rawPlan = (user.app_metadata?.plan as string | undefined) || "free";
        const plan = rawPlan.toLowerCase();
        const isPremium = plan === "premium";

        return NextResponse.json({
            plan: plan,
            isSubscribed: isPremium,
            // You can add more complex logic here if needed
            trialExpired: isPremium ? false : undefined, // Let the bot calculate if free
            debug: {
                found: true,
                email,
                userId,
                userIdFound: user.id,
                appMetadata: user.app_metadata,
                rawPlan,
            }
        });

    } catch (error: any) {
        console.error("Check subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
