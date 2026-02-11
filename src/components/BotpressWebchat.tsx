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
        }
    }, [user]);
    useEffect(() => {
        const syncUser = () => {
            const bp = window.botpressWebChat || window.botpressWebchat || window.botpress;

            if (bp && user) {
                console.log('Botpress Identifying User:', user.email);

                try {
                    bp.updateUser({
                        data: {
                            externalId: user.id,
                            email: user.email
                        },
                        tags: {
                            email: user.email,
                            userId: user.id
                        }
                    });
                } catch (err) {
                    console.error('Error calling botpress.updateUser:', err);
                }
            }
        };

        syncUser();
        const interval = setInterval(syncUser, 3000);

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
                });

                // Ensure messages auto-scroll to bottom on every new message
                if (typeof bp.onEvent === 'function') {
                    bp.onEvent(function(event) {
                        if (event.type === 'MESSAGE.RECEIVED') {
                            setTimeout(() => {
                                bp.sendEvent({ type: 'scrollToBottom' });
                            }, 250);
                        }
                    }, ['MESSAGE.RECEIVED']);
                }

                // Support for custom toggle events
                window.addEventListener('open-pinky-chat', function() {
                    bp.sendEvent({ type: 'show' });
                    bp.sendEvent({ type: 'open' });
                });

                // Restrict access to logged in users
                bp.on('webchat:opened', function() {
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

    useEffect(() => {
        if (user) {
            console.log('Botpress Debug: User authenticated with plan', user.app_metadata?.plan);
        }
    }, [configUrl, isAuthenticated, user]);

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
