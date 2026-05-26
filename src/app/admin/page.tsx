"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, CreditCard, Activity, 
    LogOut, Shield, MessageCircle,
    Crown, Zap, Search, RefreshCw, ChevronDown,
    Calendar, Mail, Star, Package, Filter, MoreHorizontal
} from "lucide-react";

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string; price: number }> = {
    free: { label: "Free", color: "text-slate-400", bg: "bg-slate-500/10", price: 0 },
    premium: { label: "Premium", color: "text-pink-400", bg: "bg-pink-500/10", price: 24.97 },
    ultra_premium: { label: "Ultra", color: "text-amber-400", bg: "bg-amber-500/10", price: 99.00 },
    "user-500": { label: "500 Pack", color: "text-blue-400", bg: "bg-blue-500/10", price: 50.00 },
    "user-1000": { label: "1000 Pack", color: "text-purple-400", bg: "bg-purple-500/10", price: 80.00 },
    testing: { label: "Testing", color: "text-emerald-400", bg: "bg-emerald-500/10", price: 0 },
};

function PlanBadge({ plan }: { plan: string }) {
    const cfg = PLAN_LABELS[plan] || { label: plan, color: "text-slate-400", bg: "bg-slate-500/10", price: 0 };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-white/5 ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, color, prefix = "" }: any) {
    return (
        <div className="bg-[#16141A] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 ${color}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-white text-2xl font-bold tracking-tight">{prefix}{value}</p>
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

    const creditUsers = users.filter(u => u.message_credits > 0 || u.credits_used > 0);
    const activityUsers = [...users]
        .filter(u => u.last_sign_in_at)
        .sort((a, b) => new Date(b.last_sign_in_at).getTime() - new Date(a.last_sign_in_at).getTime());
    const subscribedUsers = users.filter(u => u.plan && u.plan !== "free");

    // Calculate Stats
    const totalRevenue = subscribedUsers.reduce((acc, u) => acc + (PLAN_LABELS[u.plan]?.price || 0), 0);
    const premiumMemberCount = subscribedUsers.length;
    const activePacksCount = users.filter(u => (u.message_credits || 0) > (u.credits_used || 0)).length;
    
    const thisMonthPremium = subscribedUsers.filter(u => {
        if (!u.created_at) return false;
        const joined = new Date(u.created_at);
        const now = new Date();
        return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length;

    const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
        { id: "users", label: "Users", icon: Users, count: stats.totalUsers },
        { id: "credits", label: "Credits", icon: CreditCard, count: creditUsers.length },
        { id: "activity", label: "Activity", icon: Activity, count: activityUsers.length },
        { id: "payments", label: "Revenue", icon: Crown, count: subscribedUsers.length },
    ];

    const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
    const fmtTime = (d: string | null) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D0B12] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D0B12] text-white font-sans">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#16141A] border-r border-white/5 flex flex-col z-50">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                            <Shield size={20} className="text-white" />
                        </div>
                        <h2 className="text-white font-bold text-lg tracking-tight">Admin Portal</h2>
                    </div>

                    <nav className="space-y-1">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                                    tab === t.id
                                        ? "bg-white/5 text-pink-500"
                                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.02]"
                                }`}
                            >
                                <span className="flex items-center gap-3 text-sm font-medium">
                                    <t.icon size={18} />
                                    {t.label}
                                </span>
                                {t.count !== undefined && (
                                    <span className="text-[10px] font-bold opacity-50">{t.count}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-sm font-medium"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 min-h-screen flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-[#0D0B12]/80 backdrop-blur-md border-b border-white/5 px-8 py-5 flex items-center justify-between">
                    <h1 className="text-white font-bold text-xl">{tabs.find(t => t.id === tab)?.label}</h1>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                            <input 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search users..."
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 w-64 transition-all"
                            />
                        </div>

                        <button
                            onClick={handleRefresh}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10"
                        >
                            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                        </button>
                    </div>
                </header>

                <div className="p-8 flex-1">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard icon={Users} label="Total Users" value={stats.totalUsers || 0} color="text-blue-400" />
                        <StatCard icon={Crown} label="Premium Members" value={premiumMemberCount} color="text-pink-400" />
                        <StatCard icon={Zap} label="New This Month" value={thisMonthPremium} color="text-amber-400" />
                        <StatCard icon={Shield} label="Total Revenue" value={totalRevenue.toFixed(2)} prefix="$" color="text-emerald-400" />
                    </div>

                    {/* Content Area */}
                    <div className="bg-[#16141A] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-white/40" />
                                <span className="text-white/60 font-medium text-sm">Filters</span>
                            </div>
                            
                            {(tab === "users" || tab === "payments") && (
                                <div className="relative">
                                    <select
                                        value={planFilter}
                                        onChange={e => setPlanFilter(e.target.value)}
                                        className="appearance-none bg-[#16141A] border border-white/10 rounded-lg pl-4 pr-10 py-1.5 text-white/70 text-xs font-medium outline-none focus:border-pink-500/50 cursor-pointer"
                                    >
                                        <option value="all" className="bg-[#16141A]">All Plans</option>
                                        <option value="free" className="bg-[#16141A]">Free</option>
                                        <option value="testing" className="bg-[#16141A]">Testing</option>
                                        <option value="premium" className="bg-[#16141A]">Premium</option>
                                        <option value="ultra_premium" className="bg-[#16141A]">Ultra</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                                </div>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={tab}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {tab === "users" && (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                                    <th className="px-6 py-4 text-xs font-bold text-white/30 uppercase tracking-wider">User</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-white/30 uppercase tracking-wider">Plan</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-white/30 uppercase tracking-wider">Messages</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-white/30 uppercase tracking-wider">Joined</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-white/30 uppercase tracking-wider text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.03]">
                                                {filtered.map((u) => (
                                                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <p className="text-white text-sm font-medium">{u.full_name || "—"}</p>
                                                                <p className="text-white/30 text-xs">{u.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4"><PlanBadge plan={u.plan || "free"} /></td>
                                                        <td className="px-6 py-4 text-white/70 text-sm">{u.total_messages || 0}</td>
                                                        <td className="px-6 py-4 text-white/40 text-sm">{fmt(u.created_at)}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${u.email_confirmed_at ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
                                                                {u.email_confirmed_at ? "VERIFIED" : "PENDING"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {tab === "credits" && (
                                        <div className="p-6 space-y-4">
                                            {creditUsers.map((u) => {
                                                const remaining = Math.max(0, (u.message_credits || 0) - (u.credits_used || 0));
                                                const pct = u.message_credits > 0 ? (remaining / u.message_credits) * 100 : 0;
                                                return (
                                                    <div key={u.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-6">
                                                        <div className="flex-1">
                                                            <p className="text-white font-medium text-sm">{u.full_name || u.email}</p>
                                                            <p className="text-white/30 text-xs">{u.email}</p>
                                                        </div>
                                                        <div className="flex items-center gap-8">
                                                            <div className="text-center">
                                                                <p className="text-white/20 text-[10px] font-bold uppercase mb-1">Quota</p>
                                                                <p className="text-white font-bold">{u.message_credits || 0}</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-white/20 text-[10px] font-bold uppercase mb-1">Spent</p>
                                                                <p className="text-pink-500 font-bold">{u.credits_used || 0}</p>
                                                            </div>
                                                            <div className="w-40">
                                                                <div className="flex justify-between items-center mb-1.5">
                                                                    <p className="text-white/20 text-[10px] font-bold uppercase">Health</p>
                                                                    <p className="text-emerald-500 text-[10px] font-bold">{Math.round(pct)}%</p>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-pink-500 rounded-full" style={{ width: `${pct}%` }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {tab === "activity" && (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                                    <th className="px-6 py-4 text-xs font-bold text-white/30 uppercase tracking-wider">User</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-white/30 uppercase tracking-wider">Last Active</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-white/30 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-white/30 uppercase tracking-wider text-right">Messages</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.03]">
                                                {activityUsers.map((u) => {
                                                    const isActive = u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                                                    return (
                                                        <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                                                            <td className="px-6 py-4">
                                                                <p className="text-white text-sm font-medium">{u.full_name || "—"}</p>
                                                                <p className="text-white/30 text-xs">{u.email}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-white/60 text-sm tabular-nums">{fmtTime(u.last_sign_in_at)}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`flex items-center gap-1.5 text-[10px] font-bold ${isActive ? "text-emerald-500" : "text-white/20"}`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-white/20"}`} />
                                                                    {isActive ? "ACTIVE" : "INACTIVE"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right text-white/70 text-sm font-medium">{u.daily_message_count || 0}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}

                                    {tab === "payments" && (
                                        <div className="p-6 space-y-4">
                                            {subscribedUsers
                                                .filter(u => planFilter === "all" || u.plan === planFilter)
                                                .map((u) => (
                                                <div key={u.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.03] transition-all">
                                                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                                                        <div className="flex-1 min-w-[240px]">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <p className="text-white font-bold text-base tracking-tight">{u.full_name || "Anonymous"}</p>
                                                                <PlanBadge plan={u.plan} />
                                                            </div>
                                                            <p className="text-white/30 text-xs font-medium">{u.email}</p>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 flex-[2] gap-8">
                                                            <div className="space-y-1">
                                                                <p className="text-white/20 text-[10px] font-bold uppercase tracking-wider">Credits</p>
                                                                <p className="text-white text-sm font-bold tabular-nums">
                                                                    {Math.max(0, (u.message_credits || 0) - (u.credits_used || 0))} 
                                                                    <span className="text-white/20 font-normal ml-1">/ {u.message_credits || 0}</span>
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-white/20 text-[10px] font-bold uppercase tracking-wider">Monthly</p>
                                                                <p className="text-emerald-400 text-sm font-bold tabular-nums">${PLAN_LABELS[u.plan]?.price || 0}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-white/20 text-[10px] font-bold uppercase tracking-wider">Renewal</p>
                                                                <p className="text-white/70 text-sm font-medium">
                                                                    {u.plan === "ultra_premium" ? "Never" : fmt(u.subscription_end)}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1 text-right md:text-left">
                                                                <p className="text-white/20 text-[10px] font-bold uppercase tracking-wider">Status</p>
                                                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${u.subscription_status === "active" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"}`}>
                                                                    {(u.subscription_status || "ACTIVE").toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
