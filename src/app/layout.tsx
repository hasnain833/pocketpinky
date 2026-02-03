import type { Metadata } from "next";
import { Providers } from "./providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Pocket Pinky — Your AI Big Sister for Dating Clarity",
  description:
    "Vet men, decode texts, and date with standards. Real talk for women who are done settling.",
  authors: [{ name: "Pocket Pinky" }],
  openGraph: {
    title: "Pocket Pinky — Your AI Big Sister for Dating Clarity",
    description:
      "Vet men, decode texts, and date with standards. Real talk for women who are done settling.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pocket Pinky — Your AI Big Sister for Dating Clarity",
    description: "Vet men, decode texts, and date with standards.",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
