import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as any;
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get("next") ?? "/";

    console.log('Auth callback hit');
    console.log('Origin:', origin);
    console.log('Code present:', !!code);
    console.log('Token hash present:', !!token_hash);

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            console.log('Session exchanged successfully, redirecting to:', next);
            return NextResponse.redirect(`${origin}${next}`);
        }
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`);
    }

    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type,
        });
        if (!error) {
            console.log('OTP verified successfully, redirecting to:', next);
            return NextResponse.redirect(`${origin}${next}`);
        }
        console.error('Error verifying OTP:', error);
        return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`);
    }

    console.warn('No code or token_hash provided in auth callback');
    return NextResponse.redirect(`${origin}/?error=no_code_or_token`);
}
