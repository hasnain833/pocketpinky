"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

declare global {
    interface Window {
        botpressWebChat: any;
        botpressWebchat: any;
        botpress: any;
        isPinkyAuthenticated: boolean;
        pinkyUserEmail: string | undefined;
        pinkyUserId: string | undefined;
        pinkySubscriptionTier: string | undefined;
    }
}

export const BotpressWebchat = () => {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const configUrl = process.env.NEXT_PUBLIC_BOTPRESS_CONFIG_SCRIPT_URL;

    useEffect(() => {
        const supabase = createClient();
        if (!supabase) return;

        supabase.auth.refreshSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session);
            setUser(session?.user ?? null);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).isPinkyAuthenticated = !!user;
            (window as any).pinkyUserEmail = user?.email;
            (window as any).pinkyUserId = user?.id;
            // Do NOT trust metadata for tier; start as free,
            // then let /api/check-subscription override it in syncUser.
            (window as any).pinkySubscriptionTier = 'free';
        }
    }, [user]);

    useEffect(() => {
        const syncUser = () => {
            const bp = window.botpressWebChat || window.botpressWebchat || window.botpress;

            if (bp && user) {
                console.log('Botpress Identifying User:', user.email);

                // Start with "free"; override with server truth from check-subscription
                let subscriptionTier = 'free';

                (async () => {
                    try {
                        const res = await fetch(`/api/check-subscription?userId=${encodeURIComponent(user.id)}`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data?.plan) {
                                subscriptionTier = data.plan;
                                console.log('Botpress Debug: Server plan override:', subscriptionTier);
                            }
                        }
                    } catch (err) {
                        console.error('Error calling /api/check-subscription:', err);
                    }

                    // Keep global window state in sync so Botpress init script sees the same tier
                    if (typeof window !== 'undefined') {
                        (window as any).pinkySubscriptionTier = subscriptionTier;
                    }

                    try {
                        bp.updateUser({
                            data: {
                                externalId: user.id,
                                email: user.email,
                                subscriptionTier: subscriptionTier
                            },
                            tags: {
                                email: user.email,
                                userId: user.id,
                                subscriptionTier: subscriptionTier
                            }
                        });
                        console.log('Botpress User Data Updated with tier:', subscriptionTier);
                    } catch (err) {
                        console.error('Error calling botpress.updateUser:', err);
                    }
                })();
            }
        };

        syncUser();
        const interval = setInterval(syncUser, 30000);

        return () => {
            clearInterval(interval);
        };
    }, [user]);

    const initBotpressSettings = `
        var checkBotpress = setInterval(function() {
            var bp = window.botpressWebChat || window.botpressWebchat || window.botpress;
            if (bp) {
                clearInterval(checkBotpress);
                
                // Use the official initialization listener
                bp.on('webchat:initialized', function() {
                    console.log('Pinky Chat Initialized');
                    
                    // Identify user as soon as initialized if email is available
                    if (window.pinkyUserEmail) {
                        console.log('Botpress Script: Syncing Identity', window.pinkyUserEmail);
                        var tier = window.pinkySubscriptionTier || 'free';
                        bp.updateUser({
                            data: {
                                email: window.pinkyUserEmail,
                                externalId: window.pinkyUserId,
                                subscriptionTier: tier
                            },
                            tags: {
                                email: window.pinkyUserEmail,
                                subscriptionTier: tier
                            }
                        });
                    }
                });

                // Ensure messages auto-scroll to bottom on every new message
                // Use the standard 'message' listener, which is supported in v3 webchat
                if (typeof bp.on === 'function') {
                    bp.on('message', function (_message) {
                        setTimeout(function () {
                            // Ask webchat to scroll – this is the documented event name
                            bp.sendEvent && bp.sendEvent({ type: 'webchat:scrollToBottom' });
                        }, 250);
                    });
                }

                // Support for custom toggle events
                window.addEventListener('open-pinky-chat', function() {
                    bp.sendEvent({ type: 'show' });
                    bp.sendEvent({ type: 'open' });
                });

                // Ensure identity is re-synced every time the chat is opened
                bp.on('webchat:opened', function() {
                    console.log('Pinky Chat Opened');
                    if (window.pinkyUserEmail && bp.updateUser) {
                        var tier = window.pinkySubscriptionTier || 'free';
                        bp.updateUser({
                            data: { 
                                email: window.pinkyUserEmail,
                                subscriptionTier: tier
                            },
                            tags: { 
                                email: window.pinkyUserEmail,
                                subscriptionTier: tier
                            }
                        });
                    }
                    
                    if (!window.isPinkyAuthenticated) {
                        bp.sendEvent({ type: 'close' });
                        // Dispatch event to open auth modal
                        window.dispatchEvent(new CustomEvent('open-auth-modal', { 
                            detail: { mode: 'login', message: 'Please log in to chat with Pinky.' }
                        }));
                    }
                });
            }
        }, 500);
    `;

    if (!configUrl) {
        console.error('Botpress config URL is missing!');
        return null;
    }

    return (
        <>
            <Script
                src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"
                strategy="afterInteractive"
            />
            <Script
                src={configUrl}
                strategy="afterInteractive"
            />
            <Script id="botpress-auto-scroll" strategy="afterInteractive">
                {initBotpressSettings}
            </Script>
        </>
    );
};
