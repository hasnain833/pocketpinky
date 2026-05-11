"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Users, CreditCard, Activity, History,
    LogOut, Shield, TrendingUp, MessageCircle,
    Crown, Zap, Search, RefreshCw, ChevronDown,
    Calendar, Mail, Star, Package, AlertCircle
} from "lucide-react";

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    free: { label: "Free", color: "text-slate-400", bg: "bg-slate-800" },
    premium: { label: "Premium", color: "text-pink-400", bg: "bg-pink-900/40" },
    ultra_premium: { label: "Ultra", color: "text-amber-400", bg: "bg-amber-900/40" },
    "user-500": { label: "500 Pack", color: "text-blue-400", bg: "bg-blue-900/40" },
    "user-1000": { label: "1000 Pack", color: "text-purple-400", bg: "bg-purple-900/40" },
};

function PlanBadge({ plan }: { plan: string }) {
    const cfg = PLAN_LABELS[plan] || { label: plan, color: "text-slate-400", bg: "bg-slate-800" };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
            {plan === "ultra_premium" && <Crown size={9} />}
            {plan === "premium" && <Star size={9} />}
            {plan?.startsWith("user-") && <Package size={9} />}
            {cfg.label}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
    return (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} className="text-white" />
            </div>
            <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
                {sub && <p className="text-white/30 text-[10px] mt-1">{sub}</p>}
            </div>
        </div>
    );
}

type Tab = "users" | "credits" | "activity" | "payments";

export default function AdminDashboard() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("users");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState("all");
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.status === 401) { router.push("/"); return; }
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRefresh = () => { setRefreshing(true); fetchData(); };

    const handleSignOut = async () => {
        await fetch("/api/admin/auth", { method: "DELETE" });
        router.push("/");
    };

    const users: any[] = data?.users || [];
    const stats = data?.stats || {};

    const filtered = users.filter(u => {
        const matchSearch = !search ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.full_name?.toLowerCase().includes(search.toLowerCase());
        const matchPlan = planFilter === "all" || u.plan === planFilter;
        return matchSearch && matchPlan;
    });

    // Credit history: users with message_credits > 0
    const creditUsers = users.filter(u => u.message_credits > 0 || u.credits_used > 0);

    // Activity: sorted by last_sign_in_at
    const activityUsers = [...users]
        .filter(u => u.last_sign_in_at)
        .sort((a, b) => new Date(b.last_sign_in_at).getTime() - new Date(a.last_sign_in_at).getTime());

    // Payment / subscribed users
    const subscribedUsers = users.filter(u => u.plan && u.plan !== "free");

    const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
        { id: "users", label: "All Users", icon: Users, count: stats.totalUsers },
        { id: "credits", label: "Credit History", icon: CreditCard, count: creditUsers.length },
        { id: "activity", label: "User Activity", icon: Activity, count: activityUsers.length },
        { id: "payments", label: "Subscriptions", icon: Crown, count: subscribedUsers.length },
    ];

    const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
    const fmtTime = (d: string | null) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D0B12] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-white/10 border-t-[#D4737A] rounded-full animate-spin" />
                    <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Loading Dashboard</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D0B12] text-white">
            {/* Background glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#D4737A]/5 blur-[120px] pointer-events-none" />

            {/* Sidebar */}
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white/[0.03] border-r border-white/8 flex flex-col z-30">
                {/* Logo */}
                <div className="p-6 border-b border-white/8">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4737A] to-[#8B3A4C] flex items-center justify-center shadow-[0_0_20px_rgba(212,115,122,0.3)]">
                            <Shield size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm tracking-wide">Pinky Pill</p>
                            <p className="text-white/30 text-[9px] uppercase tracking-widest">Admin Portal</p>
                        </div>
                    </div>
                </div>

                {/* Nav Tabs */}
                <nav className="flex-1 p-4 space-y-1">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab === t.id
                                ? "bg-gradient-to-r from-[#D4737A]/20 to-[#8B3A4C]/20 text-white border border-[#D4737A]/20"
                                : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <t.icon size={16} />
                                {t.label}
                            </span>
                            {t.count !== undefined && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tab === t.id ? "bg-[#D4737A]/30 text-[#D4737A]" : "bg-white/10 text-white/40"}`}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/8">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 min-h-screen flex flex-col">
                {/* Top Bar */}
                <div className="sticky top-0 z-20 bg-[#0D0B12]/90 backdrop-blur-xl border-b border-white/8 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-white font-bold text-lg">{tabs.find(t => t.id === tab)?.label}</h1>
                        <p className="text-white/30 text-xs mt-0.5">
                            {tab === "users" && `${stats.totalUsers || 0} total registered users`}
                            {tab === "credits" && `${creditUsers.length} users with credit activity`}
                            {tab === "activity" && `${activityUsers.length} users with recorded sessions`}
                            {tab === "payments" && `${subscribedUsers.length} active paid subscribers`}
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all text-xs font-medium border border-white/10"
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                <div className="p-8 flex-1">
                    {/* Stats Row - shown on all tabs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard icon={Users} label="Total Users" value={stats.totalUsers || 0} sub="All time" color="bg-blue-600/80" />
                        <StatCard icon={Crown} label="Paid Users" value={stats.premiumUsers || 0} sub={`${stats.ultraUsers || 0} ultra`} color="bg-[#D4737A]/80" />
                        <StatCard icon={Activity} label="Active Today" value={stats.activeToday || 0} sub="Last 24 hours" color="bg-emerald-600/80" />
                        <StatCard icon={MessageCircle} label="Total Messages" value={stats.totalMessages?.toLocaleString() || 0} sub="All users" color="bg-amber-600/80" />
                    </div>

                    {/* Filters (for users tab) */}
                    {tab === "users" && (
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#D4737A]/40 transition-all"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={planFilter}
                                    onChange={e => setPlanFilter(e.target.value)}
                                    className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-4 pr-8 py-2.5 text-white text-sm outline-none focus:border-[#D4737A]/40 transition-all cursor-pointer"
                                >
                                    <option value="all">All Plans</option>
                                    <option value="free">Free</option>
                                    <option value="premium">Premium</option>
                                    <option value="ultra_premium">Ultra</option>
                                    <option value="user-500">500 Pack</option>
                                    <option value="user-1000">1000 Pack</option>
                                </select>
                                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* ===== ALL USERS TAB ===== */}
                    {tab === "users" && (
                        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/8">
                                        <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">User</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Plan</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Messages</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Joined</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-12 text-white/30 text-sm">No users found</td></tr>
                                    )}
                                    {filtered.map((u: any) => (
                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4737A]/30 to-[#8B3A4C]/30 flex items-center justify-center text-xs font-bold text-white/60">
                                                        {(u.full_name || u.email || "?")[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-medium">{u.full_name || "—"}</p>
                                                        <p className="text-white/40 text-[11px]">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><PlanBadge plan={u.plan || "free"} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MessageCircle size={12} className="text-white/30" />
                                                    <span className="text-white/70 text-sm">{u.total_messages || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white/40 text-sm">{fmt(u.created_at)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${u.email_confirmed_at ? "bg-emerald-900/40 text-emerald-400" : "bg-yellow-900/40 text-yellow-400"}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${u.email_confirmed_at ? "bg-emerald-400" : "bg-yellow-400"}`} />
                                                    {u.email_confirmed_at ? "Verified" : "Pending"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ===== CREDIT HISTORY TAB ===== */}
                    {tab === "credits" && (
                        <div className="space-y-3">
                            {creditUsers.length === 0 && (
                                <div className="text-center py-20 text-white/30">
                                    <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
                                    <p>No credit activity yet</p>
                                </div>
                            )}
                            {creditUsers.map((u: any) => {
                                const remaining = Math.max(0, (u.message_credits || 0) - (u.credits_used || 0));
                                const pct = u.message_credits > 0 ? (remaining / u.message_credits) * 100 : 0;
                                return (
                                    <div key={u.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4737A]/30 to-[#8B3A4C]/30 flex items-center justify-center text-sm font-bold text-white/60 flex-shrink-0">
                                                {(u.full_name || u.email || "?")[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-medium text-sm truncate">{u.full_name || u.email}</p>
                                                <p className="text-white/40 text-[11px] truncate">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 flex-shrink-0">
                                            <div className="text-center">
                                                <p className="text-white/30 text-[9px] uppercase tracking-widest mb-0.5">Total Credits</p>
                                                <p className="text-white font-bold">{u.message_credits || 0}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white/30 text-[9px] uppercase tracking-widest mb-0.5">Used</p>
                                                <p className="text-amber-400 font-bold">{u.credits_used || 0}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white/30 text-[9px] uppercase tracking-widest mb-0.5">Remaining</p>
                                                <p className="text-emerald-400 font-bold">{remaining}</p>
                                            </div>
                                            <div className="w-24">
                                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#D4737A] to-[#8B3A4C] rounded-full transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <p className="text-white/30 text-[9px] mt-1 text-right">{Math.round(pct)}% left</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ===== USER ACTIVITY TAB ===== */}
                    {tab === "activity" && (
                        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/8">
                                        <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">User</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Last Active</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Last Message</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Daily Count</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Total Msgs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {activityUsers.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-12 text-white/30 text-sm">No activity data yet</td></tr>
                                    )}
                                    {activityUsers.map((u: any) => {
                                        const isRecentlyActive = u.last_sign_in_at &&
                                            new Date(u.last_sign_in_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                                        return (
                                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4737A]/30 to-[#8B3A4C]/30 flex items-center justify-center text-xs font-bold text-white/60">
                                                                {(u.full_name || u.email || "?")[0].toUpperCase()}
                                                            </div>
                                                            {isRecentlyActive && (
                                                                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#0D0B12]" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-white text-sm font-medium">{u.full_name || "—"}</p>
                                                            <p className="text-white/40 text-[11px]">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-white/60 text-sm">{fmtTime(u.last_sign_in_at)}</td>
                                                <td className="px-6 py-4 text-white/60 text-sm">{fmtTime(u.last_message_at)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1.5 text-amber-400 text-sm font-bold">
                                                        <Zap size={12} />
                                                        {u.daily_message_count || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-white/60 text-sm">{u.total_messages || 0}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ===== SUBSCRIPTIONS / PAYMENT HISTORY TAB ===== */}
                    {tab === "payments" && (
                        <div className="space-y-3">
                            {subscribedUsers.length === 0 && (
                                <div className="text-center py-20 text-white/30">
                                    <Crown size={32} className="mx-auto mb-3 opacity-30" />
                                    <p>No paid subscribers yet</p>
                                </div>
                            )}
                            {subscribedUsers.map((u: any) => (
                                <div key={u.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4737A]/30 to-[#8B3A4C]/30 flex items-center justify-center text-sm font-bold text-white/60">
                                                {(u.full_name || u.email || "?")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{u.full_name || "—"}</p>
                                                <p className="text-white/40 text-xs flex items-center gap-1.5 mt-0.5">
                                                    <Mail size={10} />
                                                    {u.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <PlanBadge plan={u.plan} />
                                            <div className="text-center">
                                                <p className="text-white/30 text-[9px] uppercase tracking-widest">Subscribed</p>
                                                <p className="text-white/70 text-xs font-medium mt-0.5 flex items-center gap-1">
                                                    <Calendar size={10} className="text-white/30" />
                                                    {fmt(u.created_at)}
                                                </p>
                                            </div>
                                            {u.subscription_end && (
                                                <div className="text-center">
                                                    <p className="text-white/30 text-[9px] uppercase tracking-widest">Renews</p>
                                                    <p className="text-white/70 text-xs font-medium mt-0.5">{fmt(u.subscription_end)}</p>
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <p className="text-white/30 text-[9px] uppercase tracking-widest">Status</p>
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-0.5 inline-block ${u.subscription_status === "active"
                                                    ? "bg-emerald-900/40 text-emerald-400"
                                                    : u.subscription_status === "canceled"
                                                        ? "bg-red-900/40 text-red-400"
                                                        : "bg-blue-900/40 text-blue-400"
                                                    }`}>
                                                    {u.subscription_status || "active"}
                                                </span>
                                            </div>
                                            {u.stripe_subscription_id && (
                                                <div className="text-center">
                                                    <p className="text-white/30 text-[9px] uppercase tracking-widest">Stripe ID</p>
                                                    <p className="text-white/40 text-[10px] font-mono mt-0.5">{u.stripe_subscription_id.slice(0, 14)}…</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
