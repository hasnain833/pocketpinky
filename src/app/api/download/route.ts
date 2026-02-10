
import { NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const FILES = {
    patterns: "49-patterns-field-guide.pdf",
    swirling: "swirling-success-guide-v2.pdf",
};

export async function GET(req: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: "Stripe secret key not configured" }, { status: 500 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2026-01-28.clover",
        });

        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("session_id");
        const fileKey = searchParams.get("file");

        if (!sessionId || !fileKey || !FILES[fileKey as keyof typeof FILES]) {
            return NextResponse.json({ error: "Missing session ID or file key" }, { status: 400 });
        }

        let isPaid = false;
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            if (session.payment_status === "paid" || session.payment_status === "no_payment_required") { // Handle zero amount if needed
                isPaid = true;
            }
        } catch (e) {
            console.error("Stripe session error:", e);
            if (process.env.NODE_ENV === "development" && !process.env.STRIPE_SECRET_KEY) {
                isPaid = true;
            } else {
                return NextResponse.json({ error: "Invalid payment session" }, { status: 403 });
            }
        }

        if (!isPaid) {
            return NextResponse.json({ error: "Payment required" }, { status: 402 });
        }

        const fileName = FILES[fileKey as keyof typeof FILES];
        const filePath = path.join(process.cwd(), "src/assets/secure-pdfs", fileName);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${fileName}"`,
            },
        });
    } catch (err: any) {
        console.error("Download error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
