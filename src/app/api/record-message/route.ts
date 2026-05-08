export const dynamic = "force-dynamic";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

async function recordMessage(userId: string | null, messageId?: string) {
    try {
        if (!userId || userId === "undefined" || userId === "null") {
            return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // One single call to handle EVERYTHING (Lookup, Duplicates, Limits, Stats)
        const { data, error } = await supabase.rpc('record_message_high_perf', {
            input_user_val: userId,
            input_msg_id: messageId || null
        });

        if (error) {
            console.error("[Record Message] RPC Error:", error.message);
            return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
        }

        if (data && data.success === false) {
            return NextResponse.json({ error: data.error }, { status: 404 });
        }

        return NextResponse.json(data);

    } catch (err: any) {
        console.error("[Record Message] Unexpected Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
