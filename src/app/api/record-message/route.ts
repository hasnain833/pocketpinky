export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * Core logic to record a message and update user stats.
 * Supports both UUID and Email for userId.
 */
async function recordMessage(userId: string | null, messageId?: string) {
    try {
        console.log(`[Record Message] Request for userId=${userId}, messageId=${messageId ?? 'N/A'}`);

        // Handle cases where Botpress might send literal strings "undefined" or "null"
        if (!userId || userId === "undefined" || userId === "null") {
            console.error("[Record Message] Missing or invalid userId received.");
            return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Resolve User (by Email or ID)
        let query = supabase.from("profiles").select("id, total_messages, daily_message_count, credits_used, message_credits");
        
        const isEmail = userId.includes('@');
        if (isEmail) {
            console.log(`[Record Message] Searching by email: ${userId}`);
            query = query.eq("email", userId.toLowerCase());
        } else {
            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(userId)) {
                console.log(`[Record Message] Searching by UUID: ${userId}`);
                query = query.eq("id", userId);
            } else {
                console.error(`[Record Message] userId is not a valid UUID or Email: ${userId}`);
                return NextResponse.json({ 
                    error: "Invalid userId format. Must be a valid UUID or Email address.",
                    received: userId
                }, { status: 400 });
            }
        }

        const { data: profile, error: profileError } = await query.maybeSingle();

        if (profileError) {
            console.error(`[Record Message] Database query error for ${userId}:`, profileError);
            return NextResponse.json({ error: "Database error during lookup", details: profileError.message }, { status: 500 });
        }

        if (!profile) {
            console.error(`[Record Message] User not found: ${userId}`);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const resolvedUserId = profile.id;

        // 2. Idempotency Check (Prevent double counting if messageId is provided)
        if (messageId && messageId !== "undefined" && messageId !== "null") {
            const { data: existing } = await supabase
                .from("message_logs")
                .select("id")
                .eq("message_id", messageId)
                .maybeSingle();

            if (existing) {
                console.log(`[Record Message] Duplicate suppressed for messageId: ${messageId}`);
                return NextResponse.json({ success: true, message: "Duplicate suppressed" });
            }

            await supabase.from("message_logs").insert({
                message_id: messageId,
                user_id: resolvedUserId
            });
        }

        // 3. Update Stats
        // Attempt to use RPC for atomic transaction
        const { error: updateError } = await supabase.rpc('increment_message_stats', {
            target_user_id: resolvedUserId
        });

        if (updateError) {
            console.warn("[Record Message] RPC failed, falling back to manual update:", updateError.message);
            // Manual fallback update
            const { error: manualError } = await supabase
                .from("profiles")
                .update({
                    total_messages: (profile.total_messages || 0) + 1,
                    daily_message_count: (profile.daily_message_count || 0) + 1,
                    credits_used: (profile.credits_used || 0) + 1,
                    message_credits: Math.max(0, (profile.message_credits || 0) - 1),
                    last_message_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq("id", resolvedUserId);

            if (manualError) {
                console.error("[Record Message] Manual update also failed:", manualError);
                return NextResponse.json({ error: "Failed to update stats", details: manualError.message }, { status: 500 });
            }
        }

        console.log(`[Record Message] Successfully updated stats for user ${resolvedUserId}`);
        return NextResponse.json({ success: true, userId: resolvedUserId });

    } catch (err: any) {
        console.error("[Record Message] Unexpected error:", err);
        return NextResponse.json({ 
            error: "Internal server error", 
            details: err instanceof Error ? err.message : String(err) 
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const messageId = searchParams.get("messageId");
    
    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    return await recordMessage(userId, messageId || undefined);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, messageId } = body;
        
        if (!userId) {
            return NextResponse.json({ error: "Missing userId in request body" }, { status: 400 });
        }

        return await recordMessage(userId, messageId);
    } catch (err) {
        console.error("[Record Message] Failed to parse POST body:", err);
        return NextResponse.json({ error: "Invalid JSON body or empty request" }, { status: 400 });
    }
}
