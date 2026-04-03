"use client";

import { useState, useEffect } from "react";
import {
    User,
    CreditCard,
    FileText,
    Mail,
    MessageCircle,
    Download,
    Bell,
    ExternalLink,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignOut: () => void;
}

export const AccountModal = ({ isOpen, onClose, onSignOut }: AccountModalProps) => {
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [plan, setPlan] = useState<string>("Free");
    const [subscriptionStatus, setSubscriptionStatus] = useState<string>("active");
    const [subscriptionEnd, setSubscriptionEnd] = useState<string | number | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [memberSince, setMemberSince] = useState<string | null>(null);
    // const [newsletterSubscribed, setNewsletterSubscribed] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const supabase = createClient();
        if (!supabase) return;

        // Force refresh session to get latest user, then load subscription from profiles table
        supabase.auth.refreshSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                setUserEmail(session.user.email ?? null);
                setUserId(session.user.id ?? null);

                // Load plan and subscription details from profiles table (single source of truth)
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("plan, subscription_status, subscription_end, full_name, created_at")
                    .eq("id", session.user.id)
                    .maybeSingle();

                if (profile) {
                    setFullName(profile.full_name ?? null);
                    setMemberSince(profile.created_at ?? null);
                }

                const userPlan = (profile?.plan as string | undefined) || "free";
                setPlan(userPlan === "premium" ? "Premium" : "Free");

                const status = (profile?.subscription_status as string | undefined) || "active";
                setSubscriptionStatus(status);

                const end = profile?.subscription_end ?? null;
                setSubscriptionEnd(end);
            }
            setLoading(false);
        });
    }, [isOpen]);

    // Determine display status
    const getStatusDisplay = () => {
        if (plan === "Free") return { text: "None", color: "text-[hsl(var(--text-muted))]" };

        if (subscriptionEnd) {
            const now = new Date();
            const expiry = new Date(subscriptionEnd);
            if (now > expiry) {
                return { text: "Expired", color: "text-red-600" };
            }
        }

        if (subscriptionStatus === "active") return { text: "Active", color: "text-green-600" };
        if (subscriptionStatus === "canceled") return { text: "Cancelled", color: "text-orange-600" };
        if (subscriptionStatus === "past_due") return { text: "Past Due", color: "text-red-600" };

        return { text: "Active", color: "text-green-600" };
    };

    const statusDisplay = getStatusDisplay();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent 
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="bg-[hsl(var(--cream))] border-[hsl(var(--divider))] sm:max-w-[480px] p-0 overflow-hidden"
            >
                <div className="p-5 md:p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="font-serif text-2xl text-[hsl(var(--charcoal))] flex items-center gap-3">
                            <User className="w-6 h-6 text-[hsl(var(--gold))]" />
                            My Account
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[hsl(var(--text-muted))]">
                            Manage your profile settings and subscription plan.
                        </DialogDescription>
                    </DialogHeader>

                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--pink-accent))]/30 border-t-[hsl(var(--gold))] animate-spin" />
                        </div>
                    ) : (
                        <ScrollArea className="max-h-[70vh] -mx-5 px-5 md:-mx-6 md:px-6">
                            <div className="space-y-4 pb-1">
                                {/* User Info */}
                                <div className="bg-white/50 border border-[hsl(var(--divider))] rounded-lg p-3.5 space-y-0.5">
                                    <h3 className="text-xl font-serif text-[hsl(var(--charcoal))]">{fullName || "User"}</h3>
                                    <p className="text-xs text-[hsl(var(--text-muted))] font-medium break-all">{userEmail}</p>
                                </div>

                                {/* Subscription Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[hsl(var(--charcoal))] uppercase tracking-wide">
                                        <CreditCard className="w-3.5 h-3.5 text-[hsl(var(--gold))]" />
                                        Subscription
                                    </div>
                                    <div className="bg-white border border-[hsl(var(--divider))] rounded-lg divide-y divide-[hsl(var(--divider))] text-sm">
                                        <div className="flex justify-between p-2.5">
                                            <span className="text-[hsl(var(--text-secondary))]">Current Plan</span>
                                            <span className="font-semibold text-[hsl(var(--charcoal))]">{plan}</span>
                                        </div>
                                        <div className="flex justify-between p-2.5">
                                            <span className="text-[hsl(var(--text-secondary))]">Status</span>
                                            <span className={`font-medium ${statusDisplay.color}`}>{statusDisplay.text}</span>
                                        </div>
                                        {plan !== "Free" && subscriptionEnd && (
                                            <div className="flex justify-between p-2.5">
                                                <span className="text-[hsl(var(--text-secondary)) px-0]">
                                                    {subscriptionStatus === "canceled" ? "Expires on" : "Renews on"}
                                                </span>
                                                <span className="font-medium text-[hsl(var(--charcoal))]">
                                                    {new Date(subscriptionEnd).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content & Newsletter */}
                                {/* <div className="grid grid-cols-1 gap-3">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[11px] font-semibold text-[hsl(var(--charcoal))] uppercase tracking-wide">
                                            <Bell className="w-3.5 h-3.5 text-[hsl(var(--gold))]" />
                                            Preferences
                                        </div>
                                        <div className="bg-white border border-[hsl(var(--divider))] rounded-lg p-2.5 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-[hsl(var(--charcoal))]">Newsletter</p>
                                                <p className="text-[10px] text-[hsl(var(--text-muted))]">Tips & dating clarity updates</p>
                                            </div>
                                            <Switch
                                                checked={newsletterSubscribed}
                                                onCheckedChange={setNewsletterSubscribed}
                                                className="scale-[0.7] data-[state=checked]:bg-[hsl(var(--gold))]"
                                            />
                                        </div>
                                    </div>
                                </div> */}

                                {/* Secondary Actions */}
                                <div className="pt-3 border-t border-[hsl(var(--divider))] grid grid-cols-2 gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[10px] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--pink-accent))] h-8 px-2"
                                        onClick={() => {
                                            onClose();
                                            window.dispatchEvent(new CustomEvent('open-pinky-chat'));
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <MessageCircle size={14} /> Help Chat
                                        </div>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-[10px] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--charcoal))] h-8 px-2" onClick={onSignOut}>
                                        <LogOut size={14} className="mr-1.5" /> Log Out
                                    </Button>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
