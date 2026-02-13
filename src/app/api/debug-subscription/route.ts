import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // 1) Get the currently logged-in user from the anon client
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("debug-subscription getUser error:", userError);
    }
    if (!user) {
      return NextResponse.json({ error: "No session user" }, { status: 401 });
    }

    // 2) Read profiles row for this user using anon client (no service role)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan, subscription_status, subscription_end")
      .eq("id", user.id)
      .maybeSingle();

    // 3) What your main API currently says for the same user (via relative call)
    const url = new URL(req.url);
    url.pathname = "/api/check-subscription";
    url.search = `?userId=${encodeURIComponent(user.id)}`;

    const apiRes = await fetch(url.toString(), { cache: "no-store" });
    const apiJson = await apiRes.json().catch(() => null);

    return NextResponse.json({
      sessionUser: {
        id: user.id,
        email: user.email,
      },
      profileRow: profile,
      profileError,
      checkSubscriptionResponse: apiJson,
    });
  } catch (err: any) {
    console.error("debug-subscription error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}