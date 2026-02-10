import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "./providers";
import { RouteProgressBar } from "@/components/RouteProgressBar";
import { BotpressWebchat } from "@/components/BotpressWebchat";
import "@/app/globals.css";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: "The Pink Pill | AI Vetting Agent for Women Who Want Clarity",
  description:
    "Pinky spots manipulation patterns, decodes his texts, and gives you a verdict — instantly. Stop wasting months on men who aren't serious.",
  authors: [{ name: "The Pink Pill" }],
  openGraph: {
    title: "The Pink Pill | AI Vetting Agent for Women Who Want Clarity",
    description:
      "Pinky spots manipulation patterns, decodes his texts, and gives you a verdict — instantly.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Pink Pill | AI Vetting Agent for Women Who Want Clarity",
    description: "Stop wasting months on men who aren't serious. Get clarity instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <RouteProgressBar />
        <Providers>
          {children}
          <BotpressWebchat />
        </Providers>
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-config" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
