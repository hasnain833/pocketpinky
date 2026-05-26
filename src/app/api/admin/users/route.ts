export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

function isAdminAuthenticated(request: Request) {
    const cookieHeader = request.headers.get("cookie") || "";
    return cookieHeader.includes("admin_session=authenticated");
}

/** Fetches ALL auth users by paginating through Supabase's 1000-per-page limit. */
async function listAllAuthUsers(supabase: ReturnType<typeof createAdminClient>) {
    const allUsers: any[] = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({
            page,
            perPage,
        });
        if (error) throw error;
        allUsers.push(...data.users);
        // Stop when we've received fewer records than requested (last page)
        if (data.users.length < perPage) break;
        page++;
    }

    return allUsers;
}

export async function GET(request: Request) {
    if (!isAdminAuthenticated(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = createAdminClient();

        // Fetch all profiles with full data
        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Get ALL auth users (paginated to avoid 50-user default cap)
        const authUsers = await listAllAuthUsers(supabase);
        const authUsersMap = new Map(authUsers.map((u) => [u.id, u]));

        const enrichedProfiles = (profiles ?? []).map((profile) => {
            const authUser = authUsersMap.get(profile.id);
            return {
                ...profile,
                last_sign_in_at: authUser?.last_sign_in_at ?? null,
                email_confirmed_at: authUser?.email_confirmed_at ?? null,
                user_metadata: authUser?.user_metadata ?? {},
            };
        });

        // Build stats
        const totalUsers = enrichedProfiles.length;
        const premiumUsers = enrichedProfiles.filter((p) => p.plan && p.plan !== "free").length;
        const freeUsers = enrichedProfiles.filter((p) => !p.plan || p.plan === "free").length;
        const ultraUsers = enrichedProfiles.filter((p) => p.plan === "ultra_premium").length;

        // Active last 24 h — compare as Date objects, not strings
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeToday = enrichedProfiles.filter((p) => {
            if (!p.last_sign_in_at) return false;
            return new Date(p.last_sign_in_at) > yesterday;
        }).length;

        // Total messages
        const totalMessages = enrichedProfiles.reduce(
            (sum, p) => sum + (p.total_messages || 0),
            0
        );

        return NextResponse.json({
            users: enrichedProfiles,
            stats: {
                totalUsers,
                premiumUsers,
                freeUsers,
                ultraUsers,
                activeToday,
                totalMessages,
            },
        });
    } catch (err: any) {
        console.error("[Admin] Error fetching users:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
