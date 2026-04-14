"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
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
        pinkyMessageCredits: number | undefined;
    }
}

export const BotpressWebchat = () => {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const configUrl = process.env.NEXT_PUBLIC_BOTPRESS_CONFIG_SCRIPT_URL;
    const lastSyncedTier = useRef<string | null>(null);

    // Hide on specific pages (authentication, callback, etc.)
    if (pathname?.startsWith("/auth")) {
        return null;
    }

    useEffect(() => {
        const supabase = createClient();
        if (!supabase) return;

        const updateIdentity = (session: any) => {
            const isAuth = !!session;
            const currentUser = session?.user ?? null;

            setUser(currentUser);
            if (typeof window !== 'undefined') {
                window.isPinkyAuthenticated = isAuth;
                window.pinkyUserEmail = currentUser?.email;
                window.pinkyUserId = currentUser?.id;
            }
        };

        supabase.auth.refreshSession().then(({ data: { session } }) => updateIdentity(session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => updateIdentity(session));

        return () => subscription.unsubscribe();
    }, []);

    // GUEST SHIELD: Blocks clicks for unauthenticated users
    useEffect(() => {
        const shieldId = 'pinky-chat-shield';
        const updateShield = () => {
            const isAuth = (window as any).isPinkyAuthenticated;
            let shield = document.getElementById(shieldId);

            if (!isAuth) {
                if (!shield) {
                    shield = document.createElement('div');
                    shield.id = shieldId;
                    Object.assign(shield.style, {
                        position: 'fixed', bottom: '15px', right: '15px',
                        width: '75px', height: '75px', borderRadius: '50%',
                        zIndex: '99999',
                        cursor: 'pointer', backgroundColor: 'transparent'
                    });
                    shield.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.dispatchEvent(new CustomEvent('open-auth-modal', {
                            detail: { mode: 'login', message: 'Please log in to chat with Pinky.' }
                        }));
                    };
                    document.body.appendChild(shield);
                }
            } else {
                if (shield) shield.remove();
            }
        };

        const interval = setInterval(updateShield, 1000);
        updateShield();
        return () => {
            clearInterval(interval);
            document.getElementById(shieldId)?.remove();
        };
    }, [user]);

    useEffect(() => {
        let retryCount = 0;
        const handler = () => {
            const bp = window.botpressWebChat || window.botpressWebchat || window.botpress;

            if (!window.isPinkyAuthenticated) {
                window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }));
                return;
            }

            if (bp) {
                if (bp.open) {
                    bp.open();
                } else if (bp.sendEvent || bp.sendPayload) {
                    const send = bp.sendEvent || bp.sendPayload;
                    send({ type: 'show' });
                    setTimeout(() => send({ type: 'open' }), 50);
                }
                retryCount = 0;
            } else if (retryCount < 5) {
                retryCount++;
                setTimeout(handler, 500);
            }
        };

        window.addEventListener('open-pinky-chat', handler);
        return () => window.removeEventListener('open-pinky-chat', handler);
    }, [user]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const isSuccess = searchParams.get('success') === 'true';
        const sessionId = searchParams.get('session_id');

        // Store globally so the init script can see them even after URL cleanup
        if (isSuccess) (window as any).pinkyIsSuccess = true;

        if (isSuccess && sessionId) {
            const { toast } = require("sonner");
            toast.success("Welcome to Premium!", {
                description: "Your account is now active. Refreshing chat...",
                duration: 5000,
            });

            const bp = window.botpressWebChat || window.botpressWebchat || window.botpress;
            if (bp && bp.sendEvent) {
                bp.sendEvent({ type: 'hide' });
                if (bp.close) bp.close();
            }

            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, []);

    useEffect(() => {
        const handler = async (e: CustomEvent) => {
            const newTier = e.detail?.tier ?? 'free';
            const messageCredits = e.detail?.messageCredits ?? 0;
            window.pinkySubscriptionTier = newTier;
            window.pinkyMessageCredits = messageCredits;
            lastSyncedTier.current = null;

            const bp = window.botpressWebChat || window.botpressWebchat || window.botpress;
            if (!bp || !user) return;

            const timestamp = new Date().toISOString();
            try {
                await bp.updateUser({
                    data: {
                        externalId: user.id,
                        email: user.email,
                        // subscriptionTier: newTier, // Commented out for testing
                        // messageCredits: messageCredits, // Commented out for testing
                        lastUpdated: timestamp,
                    },
                    tags: {
                        email: user.email,
                        userId: user.id,
                        // subscriptionTier: newTier, // Commented out for testing
                        // messageCredits: messageCredits, // Commented out for testing
                        lastUpdated: timestamp,
                    },
                });
                console.log(`[Pinky] Tags updated: subscriptionTier = ${newTier}`);
            } catch (err) {
                console.error('[Pinky] bp.updateUser failed:', err);
            }

            // The Silent Trigger: Tells Botpress to re-read the tags 
            // WITHOUT opening the widget or showing a message
            try {
                if (bp.sendEvent) {
                    bp.sendEvent({
                        type: 'trigger',
                        payload: { action: 'tier_sync', tier: newTier }
                    });
                    console.log(`[Pinky] Silent tier-sync event sent`);
                }
            } catch (err) {
                console.error('[Pinky] Silent trigger failed:', err);
            }
        };

        window.addEventListener('pinky-tier-changed', handler as EventListener);
        return () => window.removeEventListener('pinky-tier-changed', handler as EventListener);
    }, [user]);

    useEffect(() => {
        const syncUser = async () => {
            const bp = window.botpressWebChat || window.botpressWebchat || window.botpress;
            if (!bp || !user) {
                window.pinkySubscriptionTier = 'free';
                return;
            }

            try {
                const res = await fetch(`/api/check-subscription?userId=${encodeURIComponent(user.id)}`);
                const data = await res.json();
                const currentTier = data?.tier || 'free';
                const messageCredits = data?.message_credits || 0;

                const previousTier = localStorage.getItem('pinky_last_tier');
                if (previousTier && previousTier !== currentTier) {
                    console.log(`[Pinky] Tier sync: ${previousTier} -> ${currentTier}`);
                    localStorage.setItem('pinky_last_tier', currentTier);
                }

                window.pinkySubscriptionTier = currentTier;
                window.pinkyMessageCredits = messageCredits;

                if (lastSyncedTier.current !== currentTier) {
                    bp.updateUser({
                        data: {
                            externalId: user.id,
                            email: user.email,
                            subscriptionTier: currentTier, // Commented out for testing
                            // messageCredits: messageCredits, // Commented out for testing
                            lastUpdated: new Date().toISOString()
                        },
                        tags: {
                            email: user.email,
                            userId: user.id,
                            subscriptionTier: currentTier, // Commented out for testing
                            // messageCredits: messageCredits, // Commented out for testing
                            lastUpdated: new Date().toISOString()
                        }
                    });
                    lastSyncedTier.current = currentTier;
                }
            } catch (err) {
                console.error('Botpress Sync Error:', err);
            }
        };

        syncUser();
        const interval = setInterval(syncUser, 120000);
        return () => clearInterval(interval);
    }, [user]);

    const initBotpressSettings = `
        var checkBotpress = setInterval(function() {
            var bp = window.botpressWebChat || window.botpressWebchat || window.botpress;
            if (bp) {
                clearInterval(checkBotpress);
                
                // PRE-IDENTITY: If we have user info in window, use it for the very first event
                var email = window.pinkyUserEmail;
                var userId = window.pinkyUserId;
                var tier = window.pinkySubscriptionTier || 'free';
                var credits = window.pinkyMessageCredits || 0;

                const searchParams = new URLSearchParams(window.location.search);
                const isSuccess = (searchParams.get('success') === 'true') || window.pinkyIsSuccess;

                bp.on('webchat:initialized', function() {
                    // console.log('[Pinky] Webchat Initialized. Identity:', email || 'Guest');
                    if (email && userId) {
                        bp.updateUser({
                            data: { 
                                email: email, 
                                externalId: userId, 
                                // subscriptionTier: tier, // Commented out for testing
                                // messageCredits: credits, // Commented out for testing
                                lastUpdated: new Date().toISOString() 
                            },
                            tags: { 
                                email: email, 
                                userId: userId, 
                                // subscriptionTier: tier, // Commented out for testing 
                                // messageCredits: credits, // Commented out for testing
                                lastUpdated: new Date().toISOString() 
                            }
                        });
                    }
                    
                    if (isSuccess) {
                        // console.log('[Pinky] Success detected - forcing HIDE');
                        if (bp.sendEvent) bp.sendEvent({ type: 'hide' });
                        if (bp.close) bp.close();
                        setTimeout(function() {
                            if (bp.sendEvent) bp.sendEvent({ type: 'hide' });
                        }, 500);
                    }
                });

                if (typeof bp.on === 'function') {
                    // Force the conversation list to be enabled if supported via API
                    if (bp.configure) {
                        bp.configure({
                            enableConversationList: true,
                            showConversationList: true
                        });
                    }

                    bp.on('message', function(payload) {
                        // console.log('[Pinky] Message received:', payload);
                        setTimeout(function() { bp.sendEvent && bp.sendEvent({ type: 'webchat:scrollToBottom' }); }, 250);
                    });
                }

                bp.on('webchat:opened', function() {
                    // console.log('[Pinky] Webchat manually opened');
                    if (!window.isPinkyAuthenticated) {
                        // console.log('[Pinky] Unauthenticated open detected - blocking');
                        bp.sendEvent && bp.sendEvent({ type: 'close' });
                        window.dispatchEvent(new CustomEvent('open-auth-modal', { 
                            detail: { mode: 'login', message: 'Please log in to chat with Pinky.' }
                        }));
                    }
                });
            }
        }, 300);
    `;

    if (!configUrl) return null;

    return (
        <div style={{ display: 'contents' }}>
            <Script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js" strategy="afterInteractive" />
            <Script src={configUrl} strategy="afterInteractive" />
            <Script id="botpress-auto-scroll" strategy="afterInteractive">{initBotpressSettings}</Script>
        </div>
    );
};