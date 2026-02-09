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
    DialogTitle
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
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(true);

    // Placeholder data - in a real app this would come from a subscription hook or Stripe API
    const plan = "Free";
    const status = "Active";
    const renewalDate = "—";
    const hasPremiumGuides = false;

    useEffect(() => {
        if (!isOpen) return;

        const supabase = createClient();
        if (!supabase) return;

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUserEmail(session.user.email ?? null);
            }
            setLoading(false);
        });
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[hsl(var(--cream))] border-[hsl(var(--divider))] sm:max-w-[480px] p-0 overflow-hidden">
                <div className="p-5 md:p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="font-serif text-2xl text-[hsl(var(--charcoal))] flex items-center gap-3">
                            <User className="w-6 h-6 text-[hsl(var(--gold))]" />
                            My Account
                        </DialogTitle>
                    </DialogHeader>

                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--pink-accent))]/30 border-t-[hsl(var(--gold))] animate-spin" />
                        </div>
                    ) : (
                        <ScrollArea className="max-h-[70vh] -mx-5 px-5 md:-mx-6 md:px-6">
                            <div className="space-y-4 pb-1">
                                {/* User Info */}
                                <div className="bg-white/50 border border-[hsl(var(--divider))] rounded-lg p-3">
                                    <p className="text-xs text-[hsl(var(--text-muted))] uppercase tracking-wider font-semibold mb-1">Signed in as</p>
                                    <p className="text-[hsl(var(--charcoal))] font-medium break-all text-sm">{userEmail}</p>
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
                                            <span className="text-green-600 font-medium">{status}</span>
                                        </div>
                                    </div>
                                    <Button variant="heroOutline" size="sm" className="w-full text-[10px] h-8 border-[hsl(var(--charcoal))] text-[hsl(var(--charcoal))] hover:bg-[hsl(var(--charcoal))] hover:text-white" asChild>
                                        <a
                                            href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2"
                                        >
                                            Manage Billing <ExternalLink size={14} />
                                        </a>
                                    </Button>
                                </div>

                                {/* Content & Newsletter */}
                                <div className="grid grid-cols-1 gap-3">
                                    {/* Resources Section */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[11px] font-semibold text-[hsl(var(--charcoal))] uppercase tracking-wide">
                                            <FileText className="w-3.5 h-3.5 text-[hsl(var(--gold))]" />
                                            Premium Guides
                                        </div>
                                        <div className="bg-white border border-[hsl(var(--divider))] rounded-lg divide-y divide-[hsl(var(--divider))]">
                                            <a
                                                href="/49-patterns-field-guide.pdf"
                                                target="_blank"
                                                className="flex items-center justify-between p-2 hover:bg-[hsl(var(--cream))] transition-colors group"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded bg-[hsl(var(--blush))] flex items-center justify-center text-[hsl(var(--pink-accent))]">
                                                        <Download size={14} />
                                                    </div>
                                                    <span className="text-xs font-medium text-[hsl(var(--charcoal))]">49 Patterns Field Guide</span>
                                                </div>
                                                <ExternalLink size={12} className="text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--gold))]" />
                                            </a>
                                            <a
                                                href="/swirling-success-guide-v2.pdf"
                                                target="_blank"
                                                className="flex items-center justify-between p-2 hover:bg-[hsl(var(--cream))] transition-colors group"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded bg-[hsl(var(--gold-pale))] flex items-center justify-center text-[hsl(var(--gold))]">
                                                        <Download size={14} />
                                                    </div>
                                                    <span className="text-xs font-medium text-[hsl(var(--charcoal))]">Swirling Success Guide</span>
                                                </div>
                                                <ExternalLink size={12} className="text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--gold))]" />
                                            </a>
                                        </div>
                                    </div>

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
                                </div>

                                {/* Secondary Actions */}
                                <div className="pt-3 border-t border-[hsl(var(--divider))] grid grid-cols-2 gap-2">
                                    <Button variant="ghost" size="sm" className="text-[10px] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--pink-accent))] h-8 px-2" asChild>
                                        <a href="/#chatbot" onClick={onClose} className="flex items-center gap-2">
                                            <MessageCircle size={14} /> Help Chat
                                        </a>
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
