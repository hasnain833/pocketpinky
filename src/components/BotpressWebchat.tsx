"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface BotpressInstance {
    open?: () => void;
    close?: () => void;
    sendEvent?: (event: { type: string; payload?: unknown }) => void;
    sendPayload?: (event: { type: string; payload?: unknown }) => void;
    updateUser?: (options: { data: Record<string, unknown>; tags: Record<string, unknown> }) => Promise<void>;
    on?: (event: string, callback: (payload?: unknown) => void) => void;
    configure?: (config: Record<string, unknown>) => void;
}

declare global {
    interface Window {
        botpressWebChat?: BotpressInstance;
        botpressWebchat?: BotpressInstance;
        botpress?: BotpressInstance;
        isPinkyAuthenticated: boolean;
        pinkyUserEmail: string | undefined;
        pinkyUserId: string | undefined;
        pinkySubscriptionTier: string | undefined;
        pinkyMessageCredits: number | undefined;
        pinkyDailyCount: number | undefined;
        pinkyIsSuccess?: boolean;
    }
}

export const BotpressWebchat = () => {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const configUrl = process.env.NEXT_PUBLIC_BOTPRESS_CONFIG_SCRIPT_URL;
    const lastSyncedTier = useRef<string | null>(null);

    useEffect(() => {
        const supabase = createClient();
        if (!supabase || pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) return;

        const updateIdentity = (session: Session | null) => {
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
    }, [pathname]);

    useEffect(() => {
        if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) return;
        if (typeof window === 'undefined') return;

        const currentUserId = window.pinkyUserId ?? null;
        const lastUserId = localStorage.getItem('pinky_last_user_id');

        if (currentUserId) {
            if (lastUserId && lastUserId !== "null" && lastUserId !== currentUserId) {
                saveBotpressTokens(lastUserId);
                restoreBotpressTokens(currentUserId);
            } else if (!lastUserId || lastUserId === "null") {
                restoreBotpressTokens(currentUserId);
            }
            localStorage.setItem('pinky_last_user_id', currentUserId);
        }
    }, [user, pathname]);

    useEffect(() => {
        if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) return;
        const shieldId = 'pinky-chat-shield';
        const updateShield = () => {
            const isAuth = window.isPinkyAuthenticated;
            let shield = document.getElementById(shieldId);

            if (!isAuth) {
                const bp = window.botpressWebChat ?? window.botpressWebchat ?? window.botpress;
                if (bp) {
                    if (bp.close) bp.close();
                    if (bp.sendEvent) bp.sendEvent({ type: 'hide' });
                }

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
    }, [user, pathname]);

    useEffect(() => {
        if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) return;
        let retryCount = 0;
        const handler = () => {
            const bp = window.botpressWebChat ?? window.botpressWebchat ?? window.botpress;

            if (!window.isPinkyAuthenticated) {
                window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }));
                return;
            }

            if (bp) {
                if (bp.open) {
                    bp.open();
                } else if (bp.sendEvent || bp.sendPayload) {
                    const send = bp.sendEvent || bp.sendPayload;
                    if (send) {
                        send({ type: 'show' });
                        setTimeout(() => send({ type: 'open' }), 50);
                    }
                }
                retryCount = 0;
            } else if (retryCount < 5) {
                retryCount++;
                setTimeout(handler, 500);
            }
        };

        window.addEventListener('open-pinky-chat', handler);
        return () => window.removeEventListener('open-pinky-chat', handler);
    }, [user, pathname]);

    useEffect(() => {
        if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) return;
        const searchParams = new URLSearchParams(window.location.search);
        const isSuccess = searchParams.get('success') === 'true';
        const sessionId = searchParams.get('session_id');

        if (isSuccess) window.pinkyIsSuccess = true;

        if (isSuccess && sessionId) {
            toast.success("Welcome to Premium!", {
                description: "Your account is now active. Refreshing chat...",
                duration: 5000,
            });

            const bp = window.botpressWebChat ?? window.botpressWebchat ?? window.botpress;
            if (bp?.sendEvent) {
                bp.sendEvent({ type: 'hide' });
                if (bp.close) bp.close();
            }

            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [pathname]);

    useEffect(() => {
        if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) return;
        const handler = async (e: Event) => {
            const detail = (e as CustomEvent).detail;
            const newTier = detail?.tier ?? 'free';
            const messageCredits = detail?.messageCredits ?? 0;
            const dailyCount = detail?.dailyCount ?? 0;
            window.pinkySubscriptionTier = newTier;
            window.pinkyMessageCredits = messageCredits;
            window.pinkyDailyCount = dailyCount;
            lastSyncedTier.current = null;

            const bp = window.botpressWebChat ?? window.botpressWebchat ?? window.botpress;
            if (!bp || !user || !bp.updateUser) return;

            const timestamp = new Date().toISOString();
            try {
                await bp.updateUser({
                    data: {
                        externalId: user.id,
                        email: user.email || '',
                        subscriptionTier: String(newTier),
                        subscription_tier: String(newTier),
                        messageCredits: String(messageCredits),
                        message_credits: String(messageCredits),
                        dailyCount: String(dailyCount),
                        daily_message_count: String(dailyCount),
                        lastUpdated: timestamp,
                    },
                    tags: {
                        email: user.email || '',
                        userId: user.id,
                        subscriptionTier: String(newTier),
                        subscription_tier: String(newTier),
                        messageCredits: String(messageCredits),
                        message_credits: String(messageCredits),
                        dailyCount: String(dailyCount),
                        daily_message_count: String(dailyCount),
                        lastUpdated: timestamp,
                    },
                });
                console.log(`[Pinky] Tags updated: subscriptionTier = ${newTier}`);
            } catch (err) {
                console.error('[Pinky] bp.updateUser failed:', err);
            }
            try {
                if (bp.sendEvent) {
                    bp.sendEvent({
                        type: 'trigger',
                        payload: {
                            action: 'tier_sync',
                            tier: newTier,
                            dailyCount: dailyCount,
                            messageCredits: messageCredits
                        }
                    });
                    console.log(`[Pinky] Silent tier-sync event sent`);
                }
            } catch (err) {
                console.error('[Pinky] Silent trigger failed:', err);
            }
        };

        window.addEventListener('pinky-tier-changed', handler);
        return () => window.removeEventListener('pinky-tier-changed', handler);
    }, [user, pathname]);

    useEffect(() => {
        if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) return;
        const syncUser = async () => {
            const bp = window.botpressWebChat ?? window.botpressWebchat ?? window.botpress;
            if (!bp || !user) {
                window.pinkySubscriptionTier = 'free';
                return;
            }

            try {
                const res = await fetch(`/api/check-subscription?userId=${encodeURIComponent(user.id)}`);
                const data = await res.json();
                const currentTier = data?.tier || 'free';
                const messageCredits = data?.message_credits || 0;
                const dailyCount = data?.daily_message_count || 0;

                const previousTier = localStorage.getItem('pinky_last_tier');
                if (previousTier && previousTier !== currentTier) {
                    console.log(`[Pinky] Tier sync: ${previousTier} -> ${currentTier}`);
                    localStorage.setItem('pinky_last_tier', currentTier);
                }

                window.pinkySubscriptionTier = currentTier;
                window.pinkyMessageCredits = messageCredits;
                window.pinkyDailyCount = dailyCount;

                if (lastSyncedTier.current !== currentTier && bp.updateUser) {
                    bp.updateUser({
                        data: {
                            externalId: user.id,
                            email: user.email || '',
                            subscriptionTier: String(currentTier),
                            messageCredits: String(messageCredits),
                            dailyCount: String(dailyCount),
                        },
                        tags: {
                            email: user.email || '',
                            userId: user.id,
                            subscriptionTier: String(currentTier),
                            messageCredits: String(messageCredits),
                            dailyCount: String(dailyCount),
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
    }, [user, pathname]);

    const initBotpressSettings = `
        var checkBotpress = setInterval(function() {
            var bp = window.botpressWebChat || window.botpressWebchat || window.botpress;
            if (bp) {
                clearInterval(checkBotpress);
                
                var email = window.pinkyUserEmail;
                var userId = window.pinkyUserId;
                var tier = window.pinkySubscriptionTier || 'free';
                var credits = window.pinkyMessageCredits || 0;
                var dailyCount = window.pinkyDailyCount || 0;

                const searchParams = new URLSearchParams(window.location.search);
                const isSuccess = (searchParams.get('success') === 'true') || window.pinkyIsSuccess;

                bp.on('webchat:initialized', function() {
                    if (email && userId) {
                        bp.updateUser({
                            data: { 
                                email: email, 
                                externalId: userId, 
                                subscriptionTier: String(tier), 
                                messageCredits: String(credits),
                                dailyCount: String(dailyCount),
                            },
                            tags: { 
                                email: email, 
                                userId: userId, 
                                subscriptionTier: String(tier), 
                                messageCredits: String(credits),
                                dailyCount: String(dailyCount),
                            }
                        });
                    }
                    
                    if (isSuccess) {
                        if (bp.sendEvent) bp.sendEvent({ type: 'hide' });
                        if (bp.close) bp.close();
                        setTimeout(function() {
                            if (bp.sendEvent) bp.sendEvent({ type: 'hide' });
                        }, 500);
                    }
                });

                if (typeof bp.on === 'function') {
                    if (bp.configure) {
                        bp.configure({
                            enableConversationList: true,
                            showConversationList: true
                        });
                    }

                    bp.on('message', function(payload) {
                        setTimeout(function() { bp.sendEvent && bp.sendEvent({ type: 'webchat:scrollToBottom' }); }, 250);
                    });
                }

                bp.on('webchat:opened', function() {
                    if (!window.isPinkyAuthenticated) {
                        bp.sendEvent && bp.sendEvent({ type: 'close' });
                        window.dispatchEvent(new CustomEvent('open-auth-modal', { 
                            detail: { mode: 'login', message: 'Please log in to chat with Pinky.' }
                        }));
                    }
                });
            }
        }, 300);
    `;

    const getBotpressKeys = (): string[] => {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.startsWith('bp/') ||
                key.startsWith('botpress') ||
                key.includes('webchat') ||
                key.includes('conversation') ||
                key.includes('userId')
            ) && !key.startsWith('pinky_')) {
                keys.push(key);
            }
        }
        return keys;
    };

    const saveBotpressTokens = (userId: string) => {
        const snapshot: Record<string, string> = {};
        getBotpressKeys().forEach(key => {
            const val = localStorage.getItem(key);
            if (val !== null) snapshot[key] = val;
        });
        localStorage.setItem(`pinky_bp_snapshot_${userId}`, JSON.stringify(snapshot));
    };

    const restoreBotpressTokens = (userId: string) => {
        getBotpressKeys().forEach(key => localStorage.removeItem(key));
        lastSyncedTier.current = null;

        const raw = localStorage.getItem(`pinky_bp_snapshot_${userId}`);
        if (raw) {
            try {
                const snapshot: Record<string, string> = JSON.parse(raw);
                Object.entries(snapshot).forEach(([key, val]) => localStorage.setItem(key, val));
            } catch {
            }
        }
        const bpIframe = document.querySelector<HTMLIFrameElement>(
            'iframe[id*="botpress"], iframe[src*="botpress"], iframe[src*="cdn.botpress"]'
        );
        if (bpIframe && bpIframe.src) {
            const src = bpIframe.src;
            bpIframe.src = '';
            setTimeout(() => { bpIframe.src = src; }, 100);
        }
    };

    if (!configUrl) return null;
    if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) return null;

    return (
        <div style={{ display: 'contents' }}>
            <Script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js" strategy="afterInteractive" />
            <Script src={configUrl} strategy="afterInteractive" />
            <Script id="botpress-auto-scroll" strategy="afterInteractive">{initBotpressSettings}</Script>
        </div>
    );
};