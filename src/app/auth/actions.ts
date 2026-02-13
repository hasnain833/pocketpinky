"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";
import { headers } from "next/headers";

const COLORS = {
    cream: "#FFFCF9",
    charcoal: "#2D2A27",
    pink: "#D4737A",
    wine: "#8B3A4C",
    gold: "#C9A55C",
    divider: "#EDE8E3",
    textMuted: "#9B9590",
};

const emailWrapper = (content: string) => `
    <div style="background-color: ${COLORS.cream}; padding: 40px 20px; font-family: 'Montserrat', Helvetica, Arial, sans-serif; color: ${COLORS.charcoal}; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid ${COLORS.divider}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="padding: 40px; text-align: center; border-bottom: 1px solid ${COLORS.divider};">
                <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Pinky Pill</h1>
                <p style="font-size: 10px; color: ${COLORS.pink}; margin-top: 5px; letter-spacing: 1px; font-weight: bold;">YOUR AI BIG SISTER FOR DATING CLARITY</p>
            </div>
            <div style="padding: 40px;">
                ${content}
            </div>
            <div style="padding: 30px; background-color: #fafafa; border-top: 1px solid ${COLORS.divider}; text-align: center;">
                <p style="font-size: 11px; color: ${COLORS.textMuted}; margin: 0;">
                    &copy; ${new Date().getFullYear()} Pinky Pill. All rights reserved.
                </p>
                <p style="font-size: 10px; color: ${COLORS.textMuted}; margin-top: 10px;">
                    Stay sharp. Trust Pinky.
                </p>
            </div>
        </div>
    </div>
`;

export async function handleSignUp({
    email,
    password,
    name,
}: {
    email: string;
    password: string;
    name?: string;
}) {
    try {
        const supabase = createAdminClient();
        const host = headers().get("host");
        const protocol = host?.includes("localhost") ? "http" : "https";
        const origin = `${protocol}://${host}`;

        console.log('SignUp request for:', email);
        console.log('Detected origin:', origin);

        // 1. Create the user first with email confirmation disabled
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: false,
            user_metadata: {
                full_name: name || undefined,
            },
        });

        if (createError) {
            console.error('User creation error:', createError);
            throw createError;
        }

        if (!userData.user) {
            throw new Error('Failed to create user');
        }

        console.log('User created successfully:', userData.user.id);

        // 2. Generate confirmation link for the created user
        const { data, error: linkError } = await supabase.auth.admin.generateLink({
            type: "signup",
            email,
            password: "", 
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        });

        if (linkError) {
            console.error('Link generation error:', linkError);
            throw linkError;
        }

        const token_hash = data.properties.hashed_token;
        const confirmLink = `${origin}/auth/callback?token_hash=${token_hash}&type=signup`;

        console.log('Token hash flow used');
        console.log('Action link generated successfully');

        // 2. Send email via Nodemailer (Gmail SMTP)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Pinky Pill" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Confirm your signup | Pinky Pill",
            html: emailWrapper(`
                <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; color: ${COLORS.charcoal}; margin-top: 0;">Welcome to clarity.</h2>
                <p style="font-size: 15px; color: #4a4a4a; margin-bottom: 25px;">
                    Thank you for joining Pinky Pill. You're one step away from spotting patterns and getting the verdicts you deserve.
                </p>
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${confirmLink}" style="display: inline-block; background-color: ${COLORS.charcoal}; color: ${COLORS.cream}; padding: 18px 36px; text-decoration: none; border-radius: 2px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s;">
                        Activate Account
                    </a>
                </div>
                <p style="font-size: 13px; color: ${COLORS.textMuted}; text-align: center;">
                    If the button above doesn't work, copy and paste this link:<br/>
                    <a href="${confirmLink}" style="color: ${COLORS.pink}; word-break: break-all; text-decoration: none;">${confirmLink}</a>
                </p>
            `),
        };

        await transporter.sendMail(mailOptions);

        return { success: true, message: "Check your email for the confirmation link." };
    } catch (err: any) {
        console.error('Signup error:', err);
        return { success: false, error: err.message || "Something went wrong." };
    }
}

export async function handleResetPassword(email: string) {
    try {
        const supabase = createAdminClient();
        const host = headers().get("host");
        const protocol = host?.includes("localhost") ? "http" : "https";
        const origin = `${protocol}://${host}`;

        console.log('Password reset request for:', email);

        // 1. Generate the recovery link via admin.generateLink
        const { data, error: linkError } = await supabase.auth.admin.generateLink({
            type: "recovery",
            email,
            options: {
                redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
            },
        });

        if (linkError) {
            console.error('Link generation error:', linkError);
            throw linkError;
        }

        const token_hash = data.properties.hashed_token;
        const confirmLink = `${origin}/auth/callback?token_hash=${token_hash}&type=recovery&next=/auth/reset-password`;

        console.log('Token hash flow used for recovery');
        console.log('Recovery link generated successfully');

        // 2. Send email via Nodemailer (Gmail SMTP)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Pinky Pill" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Reset your password | Pinky Pill",
            html: emailWrapper(`
                <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; color: ${COLORS.charcoal}; margin-top: 0;">Access Request</h2>
                <p style="font-size: 15px; color: #4a4a4a; margin-bottom: 25px;">
                    We received a request to reset your password. If you didn't initiate this, you can safely ignore this email.
                </p>
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${confirmLink}" style="display: inline-block; background-color: ${COLORS.charcoal}; color: ${COLORS.cream}; padding: 18px 36px; text-decoration: none; border-radius: 2px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s;">
                        Reset Password
                    </a>
                </div>
                <p style="font-size: 13px; color: ${COLORS.textMuted}; text-align: center;">
                    If the button above doesn't work, copy and paste this link:<br/>
                    <a href="${confirmLink}" style="color: ${COLORS.pink}; word-break: break-all; text-decoration: none;">${confirmLink}</a>
                </p>
            `),
        };

        await transporter.sendMail(mailOptions);

        return { success: true, message: "Check your email for the password reset link." };
    } catch (err: any) {
        console.error('Reset password error:', err);
        return { success: false, error: err.message || "Something went wrong." };
    }
}
