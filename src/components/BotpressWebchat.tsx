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
        pinkyBotpressConversationId: string | undefined;
        pinkyAllBotpressConversationIds: string[] | undefined;
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
            (window as any).pinkySubscriptionTier = 'free';
        }
    }, [user]);

    useEffect(() => {
        const syncUser = () => {
            const bp = window.botpressWebChat || window.botpressWebchat || window.botpress;

            if (bp && user) {
                console.log('Botpress Identifying User:', user.email);
                let subscriptionTier = 'free';

                (async () => {
                    try {
                        const cacheBuster = Date.now();
                        const res = await fetch(`/api/check-subscription?userId=${encodeURIComponent(user.id)}&_t=${cacheBuster}`, {
                            cache: 'no-store',
                            headers: {
                                'Cache-Control': 'no-cache',
                                'Pragma': 'no-cache'
                            }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data?.plan) {
                                subscriptionTier = data.plan;
                                // console.log('Botpress Debug: Server plan override:', subscriptionTier);
                            }
                        }

                        const localTierKey = 'pinky_last_tier';
                        const previousLocalTier = localStorage.getItem(localTierKey);

                        if (previousLocalTier && previousLocalTier !== subscriptionTier) {
                            console.log(`Plan changed: ${previousLocalTier} -> ${subscriptionTier}`);

                            if (bp.sendEvent) {
                                bp.sendEvent({
                                    type: "subscription-updated",
                                    payload: {
                                        previousTier: previousLocalTier,
                                        newTier: subscriptionTier,
                                        userId: user.id,
                                        email: user.email
                                    }
                                });
                                console.log('Sent subscription-updated event to Botpress!');
                            }

                            localStorage.setItem(localTierKey, subscriptionTier);
                        }

                        localStorage.setItem(localTierKey, subscriptionTier);

                    } catch (err) {
                        console.error('Error calling /api/check-subscription:', err);
                    }

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
                        // console.log('Botpress User Data Updated with tier:', subscriptionTier);
                    } catch (err) {
                        console.error('Error calling botpress.updateUser:', err);
                    }
                })();
            }
        };

        syncUser();
        const interval = setInterval(syncUser, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [user]);

    const initBotpressSettings = `
        var checkBotpress = setInterval(function() {
            var bp = window.botpressWebChat || window.botpressWebchat || window.botpress;
            if (bp) {
                clearInterval(checkBotpress);
                
                bp.on('webchat:initialized', function() {
                    // console.log('Pinky Chat Initialized');
                    if (window.pinkyUserEmail) {
                        // console.log('Botpress Script: Syncing Identity', window.pinkyUserEmail);
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

                // Capture conversation ID by scanning localStorage for 'bp-webchat-message-history-conv_'
                function captureConversationId() {
                    try {
                        var keys = Object.keys(localStorage);
                        window.pinkyAllBotpressConversationIds = [];
                        var latestId = null;

                        for (var i = 0; i < keys.length; i++) {
                            var k = keys[i];
                            if (k.startsWith('bp-webchat-message-history-conv_')) {
                                var convId = k.replace('bp-webchat-message-history-conv_', '').trim();
                                if (convId) {
                                    window.pinkyAllBotpressConversationIds.push(convId);
                                    latestId = convId; // Keep the last one as fallback default
                                }
                            }
                        }

                        if (window.pinkyAllBotpressConversationIds.length > 0) {
                            window.pinkyBotpressConversationId = window.pinkyAllBotpressConversationIds[window.pinkyAllBotpressConversationIds.length - 1];
                        }
                    } catch(e) { console.error('Error scanning localStorage for conversationId:', e); }
                }

                // Try known event names as backup
                ['conversation', 'conversation:loaded', 'webchat:conversation', 'conversationStarted'].forEach(function(evtName) {
                    bp.on(evtName, function(data) {
                        var id = (data && (data.id || data.conversationId));
                        if (id) {
                            window.pinkyBotpressConversationId = id;
                            if (!window.pinkyAllBotpressConversationIds) window.pinkyAllBotpressConversationIds = [];
                            if (window.pinkyAllBotpressConversationIds.indexOf(id) === -1) {
                                window.pinkyAllBotpressConversationIds.push(id);
                            }
                        }
                    });
                });

                // Scan localStorage periodically to catch newly created conversations
                setInterval(captureConversationId, 5000);
                setTimeout(captureConversationId, 1000);

                if (typeof bp.on === 'function') {
                    bp.on('message', function (_message) {
                        setTimeout(function () {
                            bp.sendEvent && bp.sendEvent({ type: 'webchat:scrollToBottom' });
                        }, 250);
                    });
                }

                window.addEventListener('open-pinky-chat', function() {
                    bp.sendEvent({ type: 'show' });
                    bp.sendEvent({ type: 'open' });
                });

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

    // if (!isAuthenticated) {
    //     return null;
    // }

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
