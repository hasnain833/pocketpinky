"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
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
    const configUrl = process.env.NEXT_PUBLIC_BOTPRESS_CONFIG_SCRIPT_URL;
    const lastSyncedTier = useRef<string | null>(null);

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

    // SMART LISTENER: Handles early clicks and API expansion
    useEffect(() => {
        let retryCount = 0;
        const MAX_RETRIES = 5;

        const handler = () => {
            // console.log('[Pinky] Open chat requested');
            const bp = window.botpressWebChat || window.botpressWebchat || window.botpress;

            if (!window.isPinkyAuthenticated) {
                // console.log('[Pinky] User not logged in, triggering modal');
                window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }));
                return;
            }

            if (bp) {
                // console.log('[Pinky] Botpress found, triggering open sequence');
                if (bp.open) {
                    bp.open();
                } else if (bp.sendEvent || bp.sendPayload) {
                    const send = bp.sendEvent || bp.sendPayload;
                    send({ type: 'show' });
                    setTimeout(() => send({ type: 'open' }), 50);
                }
                retryCount = 0; // Reset on success
            } else if (retryCount < MAX_RETRIES) {
                console.warn('[Pinky] Botpress not ready yet, retrying in 500ms...');
                retryCount++;
                setTimeout(handler, 500);
            } else {
                console.error('[Pinky] Botpress failed to load after multiple retries.');
            }
        };

        window.addEventListener('open-pinky-chat', handler);
        return () => window.removeEventListener('open-pinky-chat', handler);
    }, []);

    // SMART SYNC: Only update Botpress if tier actually changes
    useEffect(() => {
        const syncUser = async () => {
            const bp = window.botpressWebChat || window.botpressWebchat || window.botpress;
            if (!bp || !user) return;

            try {
                const res = await fetch(`/api/check-subscription?userId=${encodeURIComponent(user.id)}`);
                const data = await res.json();
                const currentTier = data?.plan || 'free';

                const previousTier = localStorage.getItem('pinky_last_tier');
                if (previousTier && previousTier !== currentTier) {
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('bp-') || key.includes('botpress')) localStorage.removeItem(key);
                    });
                    localStorage.setItem('pinky_last_tier', currentTier);
                    window.location.reload();
                    return;
                }
                localStorage.setItem('pinky_last_tier', currentTier);
                window.pinkySubscriptionTier = currentTier;

                if (lastSyncedTier.current !== currentTier) {
                    bp.updateUser({
                        data: { externalId: user.id, email: user.email, subscriptionTier: currentTier },
                        tags: { email: user.email, userId: user.id, subscriptionTier: currentTier }
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
                
                bp.on('webchat:initialized', function() {
                    if (window.pinkyUserEmail) {
                        var tier = window.pinkySubscriptionTier || 'free';
                        bp.updateUser({
                            data: { email: window.pinkyUserEmail, externalId: window.pinkyUserId, subscriptionTier: tier },
                            tags: { email: window.pinkyUserEmail, subscriptionTier: tier }
                        });
                    }
                });

                if (typeof bp.on === 'function') {
                    bp.on('message', function() {
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
        }, 500);
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