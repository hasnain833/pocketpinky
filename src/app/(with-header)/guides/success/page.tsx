
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

function SuccessPageContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("loading");
    const [productId, setProductId] = useState<string | null>(null);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    // Capture session ID on mount
    useEffect(() => {
        const id = searchParams.get("session_id");
        if (id) {
            setActiveSessionId(id);
        } else if (status === "loading") {
            setStatus("error");
        }
    }, []);

    useEffect(() => {
        if (!activeSessionId) return;

        const verifySession = async () => {
            try {
                const response = await fetch(`/api/verify-session?session_id=${activeSessionId}`);
                const data = await response.json();

                if (data.status === 'paid' || data.status === 'no_payment_required') {
                    setStatus("succeeded");
                    setProductId(data.productId);
                } else {
                    setStatus("error");
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
            }
        };

        verifySession();
    }, [activeSessionId]);

    useEffect(() => {
        // Clean URL but keep session_id available in state
        window.history.replaceState(null, "", "/guides#pricing");
        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {
            window.location.href = "/guides#pricing";
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    useEffect(() => {
        if (status === "succeeded" && productId && activeSessionId) {
            const triggerDownload = (file: string) => {
                const link = document.createElement("a");
                link.href = `/api/download?file=${file}&session_id=${activeSessionId}`;
                link.setAttribute("download", "");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            const timer = setTimeout(() => {
                if (productId === 'patterns' || productId === 'bundle') {
                    triggerDownload('patterns');
                }

                if (productId === 'bundle') {
                    setTimeout(() => triggerDownload('swirling'), 1000);
                } else if (productId === 'swirling') {
                    triggerDownload('swirling');
                }
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [status, productId, activeSessionId]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--cream))]">
                <div className="text-[hsl(var(--charcoal))] font-serif text-xl animate-pulse">Verifying purchase...</div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--cream))] p-6 text-center">
                <h1 className="font-serif text-3xl text-[hsl(var(--wine))] mb-4">Something went wrong</h1>
                <p className="text-[hsl(var(--text-secondary))] mb-8">We couldn't verify your purchase. Please contact support.</p>
                <Link href="/guides" className="btn-primary">Return to Guides</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-24 px-6 bg-[hsl(var(--cream))]">
            <div className="max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 bg-[hsl(var(--gold))] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <Check size={40} className="text-[hsl(var(--charcoal))]" />
                </div>
                <h1 className="font-serif text-4xl md:text-5xl text-[hsl(var(--charcoal))] mb-6">
                    {status === "succeeded" ? "Your Download is Starting!" : "Thank You for Your Order!"}
                </h1>
                <p className="text-[hsl(var(--text-secondary))] text-lg mb-12">
                    {status === "succeeded"
                        ? "Your PDF should start downloading automatically. If it doesn't, please click the links below."
                        : "Your guides are ready. Please save them to your device."
                    }
                </p>

                <div className="space-y-6 max-w-md mx-auto">
                    {(productId === 'patterns' || productId === 'bundle') && (
                        <div className="p-6 bg-white rounded-lg border border-[hsl(var(--divider))] shadow-sm">
                            <h3 className="font-serif text-xl text-[hsl(var(--charcoal))] mb-4">49 Patterns Field Guide</h3>
                            <a
                                href={`/api/download?file=patterns&session_id=${activeSessionId}`}
                                className="btn-wine w-full block text-center"
                            >
                                Download Link 1
                            </a>
                        </div>
                    )}

                    {(productId === 'swirling' || productId === 'bundle') && (
                        <div className="p-6 bg-white rounded-lg border border-[hsl(var(--divider))] shadow-sm">
                            <h3 className="font-serif text-xl text-[hsl(var(--charcoal))] mb-4">Swirling Success Guide</h3>
                            <a
                                href={`/api/download?file=swirling&session_id=${activeSessionId}`}
                                className="btn-wine w-full block text-center"
                            >
                                Download Link 2
                            </a>
                        </div>
                    )}
                </div>

                <div className="mt-16 pt-8 border-t border-[hsl(var(--divider))]">
                    <p className="text-[hsl(var(--text-muted))] text-sm mb-4">Need help? Contact support@pinkypill.com</p>
                    <Link href="/guides" className="text-[hsl(var(--wine))] hover:underline font-medium">
                        ← Back to Guides
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--cream))]">
                <div className="text-[hsl(var(--charcoal))] font-serif text-xl animate-pulse">Loading...</div>
            </div>
        }>
            <SuccessPageContent />
        </Suspense>
    );
}
