"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const BotpressWebchat = () => {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const configUrl = process.env.NEXT_PUBLIC_BOTPRESS_CONFIG_SCRIPT_URL;

    useEffect(() => {
        const supabase = createClient();
        if (!supabase) return;

        // Force refresh session to get latest metadata from server
        supabase.auth.refreshSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session);
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Keep auth state in sync for the browser script
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).isPinkyAuthenticated = !!user;
        }
    }, [user]);

    // Configuration for auto-scroll and better UX
    const initBotpressSettings = `
        var checkBotpress = setInterval(function() {
            if (window.botpressWebchat) {
                clearInterval(checkBotpress);
                
                // Use the official initialization listener
                window.botpressWebchat.on('webchat:initialized', function() {
                    console.log('Pinky Chat Initialized: Syncing user data...');
                    
                    // Official way to send user data to Botpress Studio
                    window.botpressWebchat.updateUser({
                        data: {
                            externalId: "${user?.id || ''}",
                            email: "${user?.email || ''}",
                            plan: "${user?.app_metadata?.plan || user?.user_metadata?.plan || 'free'}"
                        }
                    });
                });

                // Ensure messages auto-scroll to bottom on every new message
                window.botpressWebchat.onEvent(function(event) {
                    if (event.type === 'MESSAGE.RECEIVED') {
                        setTimeout(() => {
                            window.botpressWebchat.sendEvent({ type: 'scrollToBottom' });
                        }, 250);
                    }
                }, ['MESSAGE.RECEIVED']);

                // Support for custom toggle events
                window.addEventListener('open-pinky-chat', function() {
                    window.botpressWebchat.sendEvent({ type: 'show' });
                    window.botpressWebchat.sendEvent({ type: 'open' });
                });

                // Restrict access to logged in users
                window.botpressWebchat.on('webchat:opened', function() {
                    console.log('Chat opened, checking auth:', window.isPinkyAuthenticated);
                    if (!window.isPinkyAuthenticated) {
                        window.botpressWebchat.sendEvent({ type: 'close' });
                        // Dispatch event to open auth modal
                        window.dispatchEvent(new CustomEvent('open-auth-modal', { 
                            detail: { mode: 'login', message: 'Please log in to chat with Pinky.' }
                        }));
                    }
                });
            }
        }, 500);
    `;

    // Debug logging
    useEffect(() => {
        console.log('Botpress Debug:', {
            configUrl: !!configUrl,
            isAuthenticated,
            hasUser: !!user,
            userEmail: user?.email
        });
    }, [configUrl, isAuthenticated, user]);

    if (!configUrl) {
        console.error('Botpress config URL is missing!');
        return null;
    }

    // Always show for everyone, but access is restricted in the script above


    return (
        <>
            <Script
                src="https://cdn.botpress.cloud/webchat/v3.5/inject.js"
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
