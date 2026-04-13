export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    try {
        /* ORIGINAL LOGIC COMMENTED OUT FOR TESTING
        const body = await req.json();
        const { userId, totalUsed } = body;

        console.log(`[Exhaust Credits] Received request to zero out credits for userId=${userId}. Total Used reported from Botpress: ${totalUsed}`);

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient();

        // Ensure user actually exists before wiping credits
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id, message_credits")
            .eq("id", userId)
            .maybeSingle();

        if (profileError || !profile) {
            console.error(`[Exhaust Credits] User not found: ${userId}`);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Wipe their credits out in the DB to sync up with Botpress telling us they are out
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ 
                message_credits: 0, 
                updated_at: new Date().toISOString() 
            })
            .eq("id", userId);

        if (updateError) {
             console.error(`[Exhaust Credits] Failed to update credits for ${userId}:`, updateError);
             return NextResponse.json({ error: "Failed to update DB" }, { status: 500 });
        }

        console.log(`[Exhaust Credits] Successfully zeroed credits for ${userId}. DB is now synchronized with Botpress limits.`);

        return NextResponse.json({
            success: true,
            action: "credits_exhausted",
            message: "Message credits have been zeroed out successfully.",
        });
        */

        // BYPASS ACTIVE: Credit system is currently disabled for testing
        return NextResponse.json({
            success: true,
            action: "credits_exhausted_bypassed",
            message: "Credit system is disabled. No records were changed.",
        });

    } catch (err: any) {
        console.error("[Exhaust Credits] Unexpected error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
