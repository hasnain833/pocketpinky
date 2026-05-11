export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

// Called after successful Supabase login to check if user is admin & set cookie
export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            return NextResponse.json({ isAdmin: false }, { status: 200 });
        }

        const isAdmin = email === adminEmail && password === adminPassword;

        if (!isAdmin) {
            return NextResponse.json({ isAdmin: false }, { status: 200 });
        }

        const response = NextResponse.json({ isAdmin: true });
        response.cookies.set("admin_session", "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 8, // 8 hours
            path: "/",
        });

        return response;
    } catch (err) {
        return NextResponse.json({ isAdmin: false }, { status: 200 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("admin_session");
    return response;
}
