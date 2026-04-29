export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function exhaustCredits(userId: string, totalUsed?: number) {
    try {
        console.log(`[Exhaust Credits] Received request for userId=${userId}. totalUsed: ${totalUsed ?? 'N/A'}`);

        // Handle cases where Botpress might send literal strings "undefined" or "null"
        if (!userId || userId === "undefined" || userId === "null") {
            console.error("[Exhaust Credits] Missing or invalid userId received.");
            return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient();

        // 1. Determine if we should search by ID or Email
        let query = supabaseAdmin.from("profiles").select("id, message_credits, email");
        
        const isEmail = userId.includes('@');
        if (isEmail) {
            console.log(`[Exhaust Credits] Searching by email: ${userId}`);
            query = query.eq("email", userId.toLowerCase());
        } else {
            // Validate UUID format to prevent Postgres syntax errors
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(userId)) {
                console.log(`[Exhaust Credits] Searching by UUID: ${userId}`);
                query = query.eq("id", userId);
            } else {
                console.error(`[Exhaust Credits] userId is not a valid UUID or Email: ${userId}`);
                return NextResponse.json({ 
                    error: "Invalid userId format. Must be a valid Supabase UUID or Email address.",
                    received: userId
                }, { status: 400 });
            }
        }

        const { data: profile, error: profileError } = await query.maybeSingle();

        if (profileError) {
            console.error(`[Exhaust Credits] Database query error for ${userId}:`, profileError);
            return NextResponse.json({ error: "Database error during lookup", details: profileError.message }, { status: 500 });
        }

        if (!profile) {
            console.error(`[Exhaust Credits] User not found in 'profiles' table: ${userId}`);
            return NextResponse.json({ 
                error: "User not found", 
                message: "No profile matches the provided ID or Email." 
            }, { status: 404 });
        }

        // 2. Wipe credits in DB
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ 
                message_credits: 0, 
                updated_at: new Date().toISOString() 
            })
            .eq("id", profile.id);

        if (updateError) {
             console.error(`[Exhaust Credits] Failed to update credits for user ${profile.id}:`, updateError);
             return NextResponse.json({ error: "Failed to update DB", details: updateError.message }, { status: 500 });
        }

        console.log(`[Exhaust Credits] Successfully zeroed credits for ${profile.id} (${profile.email ?? 'no email'}).`);

        return NextResponse.json({
            success: true,
            action: "credits_exhausted",
            userId: profile.id,
            message: "Message credits have been zeroed out successfully.",
        });

    } catch (err: unknown) {
        console.error("[Exhaust Credits] Unexpected error:", err);
        return NextResponse.json({ 
            error: "Internal server error", 
            details: err instanceof Error ? err.message : String(err) 
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const totalUsed = searchParams.get("totalUsed");
    
    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    return await exhaustCredits(userId, totalUsed ? parseInt(totalUsed) : undefined);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, totalUsed } = body;
        
        if (!userId) {
            console.warn("[Exhaust Credits] POST request received with no userId in body.");
            return NextResponse.json({ error: "Missing userId in request body" }, { status: 400 });
        }

        return await exhaustCredits(userId, totalUsed);
    } catch (err) {
        console.error("[Exhaust Credits] Failed to parse POST body:", err);
        return NextResponse.json({ error: "Invalid JSON body or empty request" }, { status: 400 });
    }
}
