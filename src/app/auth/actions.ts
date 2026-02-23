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

// Create SendGrid transporter
const createSendGridTransporter = () => {
    return nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "apikey", // This is literally the string "apikey" for SendGrid
            pass: process.env.SENDGRID_API_KEY,
        },
    });
};

export async function handleSignUp({
    email,
    password,
    name,
}: {
    email: string;
    password: string;
    name?: string;
}) {
    console.log('[Signup] Starting signup process for:', email);
    try {
        const supabase = createAdminClient();
        const headersList = await headers();
        const host = headersList.get("host") || "";
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

        const token_hash = data?.properties?.hashed_token;
        if (!token_hash) {
            throw new Error('Failed to generate confirmation token');
        }

        const confirmLink = `${origin}/auth/callback?token_hash=${token_hash}&type=signup`;

        console.log('Token hash flow used');
        console.log('Action link generated successfully');

        // 3. Send email via SendGrid SMTP
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key not configured');
        }

        const transporter = createSendGridTransporter();

        const mailOptions = {
            from: {
                name: "Pinky Pill",
                address: process.env.SENDGRID_FROM_EMAIL || "noreply@pinkypill.com"
            },
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

        console.log('[Signup] Attempting to send confirmation email via SendGrid to:', email);
        const sendResult = await transporter.sendMail(mailOptions);
        console.log('[Signup] SendGrid response:', sendResult);

        return { success: true, message: "Check your email for the confirmation link." };
    } catch (err: any) {
        console.error('[Signup] Error occurred:', err);
        return { success: false, error: err.message || "Something went wrong." };
    }
}

export async function sendPaymentConfirmationEmail(email: string, productId: string = "premium") {
    console.log('[PaymentEmail] Starting to send confirmation email for:', email, 'Product:', productId);
    try {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key not configured');
        }

        const PRODUCT_TEMPLATES: Record<string, { subject: string, title: string, body: string, features: string[] }> = {
            premium: {
                subject: "Welcome to Premium | Pinky Pill",
                title: "Access Granted.",
                body: "Your Premium subscription is now active. You have full, unlimited access to Pinky Pill's entire ecosystem.",
                features: ["Ask unlimited questions", "Access all vetting modes", "Explore the 49 Pattern Library", "Use Swirling Mode for IR expertise"]
            },
            patterns: {
                subject: "Your 49 Patterns Guide | Pinky Pill",
                title: "Master the Patterns.",
                body: "Thank you for purchasing the 49 Patterns Field Guide. Your digital copy is ready for exploration.",
                features: ["Comprehensive pattern breakdown", "Red flag spotting techniques", "Real-world examples", "Updated monthly insights"]
            },
            swirling: {
                subject: "Your Swirling Success Guide | Pinky Pill",
                title: "Expertise Awaits.",
                body: "Thank you for purchasing the Swirling Success Guide. You're now equipped with IR expertise.",
                features: ["Interpersonal relationship strategies", "Communication blueprints", "Psychology-backed insights", "Actionable success steps"]
            },
            bundle: {
                subject: "Your Ultimate Guide Bundle | Pinky Pill",
                title: "The Full Arsenal.",
                body: "You've unlocked both the 49 Patterns and Swirling Success guides. Your journey to clarity starts now.",
                features: ["49 Patterns Field Guide", "Swirling Success Guide", "Bonus integration strategies", "Lifetime updates"]
            }
        };

        const template = PRODUCT_TEMPLATES[productId] || PRODUCT_TEMPLATES.premium;
        const transporter = createSendGridTransporter();

        const mailOptions = {
            from: {
                name: "Pinky Pill",
                address: process.env.SENDGRID_FROM_EMAIL || "noreply@pinkypill.com"
            },
            to: email,
            subject: template.subject,
            html: emailWrapper(`
                <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; color: ${COLORS.charcoal}; margin-top: 0;">${template.title}</h2>
                <p style="font-size: 15px; color: #4a4a4a; margin-bottom: 25px;">
                    ${template.body}
                </p>
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pinkypill.com'}" style="display: inline-block; background-color: ${COLORS.charcoal}; color: ${COLORS.cream}; padding: 18px 36px; text-decoration: none; border-radius: 2px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s;">
                        Start Reading
                    </a>
                </div>
                <p style="font-size: 14px; color: #4a4a4a;">
                    What's included in your purchase:
                    <ul style="text-align: left; display: inline-block; margin-top: 10px;">
                        ${template.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </p>
                <p style="font-size: 13px; color: ${COLORS.textMuted}; text-align: center; margin-top: 30px;">
                    Stay sharp. Trust Pinky.
                </p>
            `),
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('[PaymentEmail] Confirmation email sent successfully:', result);
        return { success: true };
    } catch (err: any) {
        console.error('[PaymentEmail] Error sending confirmation email:', err);
        return { success: false, error: err.message };
    }
}

export async function handleResetPassword(email: string) {
    try {
        const supabase = createAdminClient();
        const headersList = await headers();
        const host = headersList.get("host") || "";
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

        const token_hash = data?.properties?.hashed_token;
        if (!token_hash) {
            throw new Error('Failed to generate recovery token');
        }

        const confirmLink = `${origin}/auth/callback?token_hash=${token_hash}&type=recovery&next=/auth/reset-password`;

        console.log('Token hash flow used for recovery');
        console.log('Recovery link generated successfully');

        // 2. Send email via SendGrid SMTP
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key not configured');
        }

        const transporter = createSendGridTransporter();

        const mailOptions = {
            from: {
                name: "Pinky Pill",
                address: process.env.SENDGRID_FROM_EMAIL || "noreply@pinkypill.com" // Set your verified sender email
            },
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