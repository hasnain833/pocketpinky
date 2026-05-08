"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    CreditCard,
    MessageCircle,
    Activity,
    LogOut,
    Zap,
    History,
    ShieldCheck,
    ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function AccountPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();
        if (!supabase) return;

        let profileChannel: any = null;

        const setupUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/");
                return;
            }
            setUser(session.user);
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .maybeSingle();

            if (data) {
                setProfile(data);
            }
            setLoading(false);
            profileChannel = supabase
                .channel(`profile-${session.user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${session.user.id}`
                    },
                    (payload: any) => {
                        setProfile((prev: any) => ({ ...prev, ...payload.new }));
                    }
                )
                .subscribe();
        };

        setupUser();

        return () => {
            if (profileChannel) {
                supabase.removeChannel(profileChannel);
            }
        };
    }, [router]);

    const handleSignOut = async () => {
        const supabase = createClient();
        if (supabase) await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[hsl(var(--cream))] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-[hsl(var(--pink-accent))]/20 border-t-[hsl(var(--gold))] animate-spin" />
            </div>
        );
    }

    const planLabels: Record<string, string> = {
        "free": "Free Trial",
        "user-500": "500 Message Pack",
        "user-1000": "1000 Message Pack",
        "premium": "Premium Monthly",
        "ultra_premium": "Ultra Premium (Lifetime)",
    };

    const getStatusDisplay = () => {
        const plan = profile?.plan || "free";
        const status = profile?.subscription_status || "active";
        const end = profile?.subscription_end;
        const createdAt = profile?.created_at;

        if (plan === "free") {
            if (createdAt) {
                const trialEnd = new Date(createdAt);
                trialEnd.setDate(trialEnd.getDate() + 7);
                const now = new Date();
                if (now > trialEnd) return { text: "Trial Expired", color: "text-red-500", bg: "bg-red-50" };
                const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return { text: `${daysLeft} days left`, color: "text-blue-500", bg: "bg-blue-50" };
            }
            return { text: "Free Trial", color: "text-blue-500", bg: "bg-blue-50" };
        }
        if (plan === "ultra_premium") return { text: "Lifetime", color: "text-[hsl(var(--gold))]", bg: "bg-[hsl(var(--gold))]/10" };

        if (end) {
            const now = new Date();
            const expiry = new Date(end);
            if (now > expiry) return { text: "Expired", color: "text-red-500", bg: "bg-red-50" };
        }

        if (status === "active") return { text: "Active", color: "text-emerald-500", bg: "bg-emerald-50" };
        if (status === "canceled") return { text: "Canceled", color: "text-orange-500", bg: "bg-orange-50" };
        return { text: "Active", color: "text-emerald-500", bg: "bg-emerald-50" };
    };

    const statusDisplay = getStatusDisplay();

    // Calculate real active days
    const activeDays = profile?.created_at
        ? Math.max(1, Math.ceil((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;

    const isPremium = profile?.plan && (profile.plan.includes('premium') || profile.plan.includes('user-'));
    const isUltra = profile?.plan === 'ultra_premium';

    // Daily Limit Logic
    const getDailyLimit = () => {
        if (isUltra) return Infinity;
        if (isPremium) return 20;
        return 10;
    };

    const dailyLimit = getDailyLimit();
    const dailyCount = profile?.daily_message_count || 0;

    return (
        <main className="min-h-screen bg-[hsl(var(--cream))] pt-20 pb-20">
            {/* Header / Hero Section - Balanced with Gradient */}
            <div className="bg-gradient-to-br from-white via-[hsl(var(--cream))] to-[hsl(var(--pink-accent))]/10 border-b border-[hsl(var(--divider))] pt-12 pb-12 mb-10 shadow-sm">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-pink-gradient p-0.5 shadow-soft transition-transform group-hover:scale-105 duration-500">
                                    <div className="w-full h-full rounded-[1.9rem] bg-white flex items-center justify-center">
                                        <User className="w-10 h-10 text-[hsl(var(--pink-accent))]" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border border-[hsl(var(--divider))] flex items-center justify-center shadow-sm">
                                    <ShieldCheck className="w-4 h-4 text-[hsl(var(--gold))]" />
                                </div>
                            </div>
                            <div className="space-y-1 text-center md:text-left">
                                <h1 className="font-serif text-3xl md:text-4xl text-[hsl(var(--charcoal))]">{profile?.full_name || "User Profile"}</h1>
                                <p className="text-[hsl(var(--text-muted))] text-sm font-medium">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusDisplay.bg} ${statusDisplay.color} border border-current/10 shadow-sm`}>
                                        {statusDisplay.text}
                                    </span>
                                    <span className="text-[10px] text-[hsl(var(--text-muted))] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/50 rounded-full border border-[hsl(var(--divider))] shadow-sm backdrop-blur-sm">
                                        Member Since {profile?.created_at ? new Date(profile.created_at).getFullYear() : "2024"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={handleSignOut} className="h-11 px-6 rounded-xl text-[hsl(var(--text-muted))] hover:text-red-600 hover:bg-red-50 font-bold text-xs uppercase tracking-widest transition-colors">
                                <LogOut size={14} className="mr-2" /> Log Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Plan */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    label: "Daily Usage",
                                    value: `${dailyCount}/${dailyLimit === Infinity ? "∞" : dailyLimit}`,
                                    icon: Zap,
                                    color: "text-amber-500",
                                    bg: "bg-amber-50"
                                },
                                {
                                    label: "Credits Package",
                                    value: profile?.message_credits 
                                        ? `${Math.max(0, profile.message_credits - (profile.credits_used || 0))} / ${profile.message_credits}`
                                        : "0",
                                    icon: CreditCard,
                                    color: "text-pink-500",
                                    bg: "bg-pink-50"
                                },
                                {
                                    label: "Total Msgs",
                                    value: profile?.total_messages || 0,
                                    icon: MessageCircle,
                                    color: "text-blue-500",
                                    bg: "bg-blue-50"
                                },
                                {
                                    label: "Active Days",
                                    value: activeDays,
                                    icon: Activity,
                                    color: "text-emerald-500",
                                    bg: "bg-emerald-50"
                                }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-5 rounded-3xl border border-[hsl(var(--divider))] shadow-soft hover:shadow-card transition-all group"
                                >
                                    <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={18} />
                                    </div>
                                    <p className="text-[9px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-widest mb-1">{stat.label}</p>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-xl font-bold text-[hsl(var(--charcoal))] truncate">{stat.value}</h3>
                                        <ArrowUpRight size={12} className="text-[hsl(var(--divider))] group-hover:text-[hsl(var(--pink-accent))] transition-colors" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Subscription Card - Highlighted but clean */}
                        <div className="bg-[hsl(var(--charcoal))] text-white rounded-[2.5rem] p-8 md:p-10 shadow-card relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                            <ShieldCheck size={18} className="text-[hsl(var(--gold))]" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--gold))]">Current Protection</span>
                                    </div>
                                    <h2 className="font-serif text-3xl md:text-5xl">{planLabels[profile?.plan] || "Free Trial"}</h2>
                                    <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                                        You have <span className="text-white font-bold">{profile?.message_credits || 0} message credits</span> remaining.
                                        {!isPremium && "Upgrade to Premium for unlimited vettings and advanced detection."}
                                        {isPremium && profile?.plan === 'premium' && "Your subscription is active. Thank you for being a Premium member!"}
                                        {isPremium && profile?.plan === 'ultra_premium' && "You have lifetime access to all Pink Pill features."}
                                    </p>
                                </div>
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-pink-accent/10 rounded-full blur-[60px] group-hover:bg-pink-accent/20 transition-all duration-700" />
                        </div>
                    </div>

                    {/* Right Column: Activity & Account */}
                    <div className="space-y-8">
                        {/* Activity Feed */}
                        <div className="bg-white rounded-[2rem] border border-[hsl(var(--divider))] shadow-soft overflow-hidden">
                            <div className="px-8 py-6 border-b border-[hsl(var(--divider))] flex justify-between items-center">
                                <h3 className="font-serif text-xl text-[hsl(var(--charcoal))]">Account Milestones</h3>
                                <History size={16} className="text-[hsl(var(--gold))]" />
                            </div>
                            <div className="p-4 space-y-1">
                                {[
                                    {
                                        event: "Last Message",
                                        detail: profile?.last_message_at ? `Sent on ${new Date(profile.last_message_at).toLocaleDateString()}` : "No messages sent yet",
                                        date: profile?.last_message_at ? "Recent" : "N/A",
                                        color: "text-emerald-500"
                                    },
                                    {
                                        event: "Last Login",
                                        detail: profile?.last_sign_in ? `Active at ${new Date(profile.last_sign_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "First session active",
                                        date: profile?.last_sign_in ? "Today" : "Just now",
                                        color: "text-blue-500"
                                    },
                                    {
                                        event: "Account Created",
                                        detail: `Joined the Pink Pill community`,
                                        date: profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : "Recently",
                                        color: "text-amber-500"
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all group cursor-pointer">
                                        <div className={`w-2 h-2 rounded-full ${item.color.replace('text', 'bg')} flex-shrink-0 group-hover:scale-125 transition-transform`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-[hsl(var(--charcoal))] truncate">{item.event}</p>
                                            <p className="text-[10px] text-[hsl(var(--text-muted))] truncate font-medium">{item.detail}</p>
                                        </div>
                                        <p className="text-[9px] font-bold text-[hsl(var(--text-muted))] uppercase whitespace-nowrap">{item.date}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="px-8 py-4 bg-gray-50 text-center">
                                <p className="text-[10px] text-[hsl(var(--text-muted))] font-medium">Activity is logged in real-time to ensure your vetting clarity.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
