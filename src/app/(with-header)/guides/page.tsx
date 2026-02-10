"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Check, Plus, Minus } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "@/components/AuthModal";

const AccordionItem = ({ title, content }: { title: string; content: string }) => {
    const [isOpen, setIsOpen] = useState(false);


    return (
        <div className="border-b border-[hsl(var(--divider))] text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center group transition-colors hover:text-[hsl(var(--wine))]"
            >
                <span className="font-serif text-xl sm:text-2xl text-[hsl(var(--charcoal))] group-hover:text-[hsl(var(--wine))] transition-colors">
                    {title}
                </span>
                <span className="text-[hsl(var(--gold))]">
                    {isOpen ? <Minus size={24} /> : <Plus size={24} />}
                </span>
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                className="overflow-hidden"
            >
                <p className="pb-6 text-[hsl(var(--text-secondary))] leading-relaxed">
                    {content}
                </p>
            </motion.div>
        </div>
    );
};

// Stagger variants for lists and grids
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
} as any;


const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.21, 0.47, 0.32, 0.98],
        },
    },
} as any;

export default function GuidesPage() {
    const [user, setUser] = useState<any>(null);
    const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "signup" }>({
        isOpen: false,
        mode: "signup"
    });
    const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();
        if (!supabase) return;

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleCheckout = async (productId: string) => {
        if (!user) {
            setAuthModal({ isOpen: true, mode: "signup" });
            return;
        }

        setLoadingProductId(productId);
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId,
                    userId: user.id,
                    userEmail: user.email
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("Checkout error:", data.error);
                alert("Something went wrong. Please try again.");
                setLoadingProductId(null);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Something went wrong. Please try again.");
            setLoadingProductId(null);
        }
    };

    const problemItems = [
        "He says all the right things but never follows through. You want to believe him — but something feels off.",
        "You Google \"is this normal?\" at 2am because you can't tell if it's a red flag or you're overthinking.",
        "You've wasted months — maybe years — on men who were never going to commit.",
        "You're dating interracially and can't tell if it's genuine interest or fetishization."
    ];

    const categories = [
        { letter: "A", title: "Dark Triad Patterns", desc: "The most dangerous personality patterns — hardwired, not situational", count: "3 Patterns" },
        { letter: "B", title: "Red Pill / Manosphere Tactics", desc: "Strategies men are explicitly taught online to manipulate women", count: "5 Patterns" },
        { letter: "C", title: "Modern Manipulation", desc: "The tactics you'll encounter most in modern dating", count: "7 Patterns" },
        { letter: "D", title: "Commitment Avoidance", desc: "Men who want the benefits without the commitment", count: "10 Patterns" },
        { letter: "E", title: "Attachment-Based Patterns", desc: "Patterns rooted in attachment style dynamics", count: "4 Patterns" },
        { letter: "F", title: "Character Issue Patterns", desc: "Fundamental character problems that show up in relationships", count: "9 Patterns" },
        { letter: "G", title: "Investment Patterns", desc: "Patterns around time, money, and emotional investment", count: "8 Patterns" },
        { letter: "H", title: "Interracial-Specific Patterns", desc: "Patterns specific to interracial dating situations", count: "3 Patterns" }
    ];

    const faqs = [
        { title: "What format are the guides?", content: "Both guides are delivered as PDF files that you can read on any device — phone, tablet, or computer. Once purchased, they're yours to keep forever. No subscriptions, no expiring access." },
        { title: "How are these different from the Pinky AI bot?", content: "Pinky (the AI) is your real-time vetting partner — paste his texts, describe a situation, get instant analysis. The PDF guides are your offline reference library. Use the guides to study the patterns on your own time, then use Pinky when you need real-time help in the moment. They complement each other perfectly." },
        { title: "Do I need both guides?", content: "The 49 Patterns Field Guide is for every woman who's dating — it covers universal manipulation patterns and red flags. The Swirling Success Guide is specifically for women who are dating (or considering dating) interracially. If that's you, the bundle gives you complete coverage at the best price." },
        { title: "Who is Christelyn Karazin?", content: "Christelyn is the co-author of Swirling: How to Date, Mate, and Relate Mixing Race, Culture, and Creed (Simon & Schuster), the creator of the Pink Pill methodology, and has spent over a decade coaching women on dating strategy. These guides are built on real coaching experience with thousands of women." },
        { title: "What's the refund policy?", content: "Due to the digital nature of these guides, all sales are final. However, we're confident in the value — these guides contain actionable scripts and strategies you can use immediately." }
    ];

    return (
        <div className="pt-20 bg-[hsl(var(--cream))] min-h-screen text-[hsl(var(--text-primary))]">
            {/* Hero */}
            <section className="py-20 px-[5%] text-center bg-gradient-to-b from-[hsl(var(--cream))] to-[hsl(var(--cream-dark))] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[hsl(var(--pink-accent))] rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[hsl(var(--gold))] rounded-full blur-[100px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="max-w-[1000px] mx-auto relative z-10"
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-block px-5 py-2 mb-6 text-[0.75rem] font-bold tracking-[2px] uppercase text-[hsl(var(--wine))] bg-[hsl(var(--wine))]/10 rounded-sm"
                    >
                        From the Creator of Pink Pill
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="font-serif text-5xl md:text-7xl leading-tight text-[hsl(var(--charcoal))] mb-4"
                    >
                        Know Every Pattern.<br />
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="italic text-[hsl(var(--wine))] inline-block"
                        >
                            Before He Plays It.
                        </motion.span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="max-w-2xl mx-auto text-lg md:text-xl text-[hsl(var(--text-secondary))] mb-10 leading-relaxed"
                    >
                        Two field guides covering <strong className="text-[hsl(var(--text-primary))]">49 manipulation patterns</strong>, interracial dating strategy, red flag scripts, and the exact words to say — yours to keep forever.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                    >
                        <Link href="#pricing" className="btn-primary flex items-center justify-center gap-2 group">
                            Get Both Guides — $37 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="#guides" className="btn-secondary">
                            See What's Inside
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 1 }}
                        className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-[hsl(var(--text-muted))]"
                    >
                        <span className="flex items-center gap-2"><Check size={14} className="text-[hsl(var(--gold))]" /> Instant PDF download</span>
                        <span className="hidden md:block w-1.5 h-1.5 bg-[hsl(var(--gold))] rounded-full"></span>
                        <span className="flex items-center gap-2"><Check size={14} className="text-[hsl(var(--gold))]" /> Yours forever</span>
                        <span className="hidden md:block w-1.5 h-1.5 bg-[hsl(var(--gold))] rounded-full"></span>
                        <span className="flex items-center gap-2"><Check size={14} className="text-[hsl(var(--gold))]" /> By Christelyn Karazin</span>
                    </motion.div>
                </motion.div>
            </section>

            {/* Authority Strip */}
            <section className="py-8 bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] border-y border-[hsl(var(--gold))]/20 shadow-lg relative z-20">
                <div className="max-w-[1200px] mx-auto px-[5%] flex flex-wrap justify-center gap-8 md:gap-16">
                    {[
                        "Co-author of Swirling (Simon & Schuster)",
                        "10+ Years Coaching Women",
                        "100K+ Community",
                        "Pink Pill Method Creator"
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="flex items-center gap-3 text-xs md:text-sm font-medium tracking-[0.8px] uppercase"
                        >
                            <span className="text-[hsl(var(--gold))] text-lg">✦</span> {item}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* The Reality */}
            <section className="py-24 px-[5%] bg-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <ScrollReveal>
                        <span className="text-[0.75rem] font-bold tracking-[1.5px] uppercase text-[hsl(var(--gold))] mb-4 block">The Reality</span>
                        <h2 className="font-serif text-4xl md:text-6xl text-[hsl(var(--charcoal))] mb-12 leading-tight">
                            You've Seen the Signs.<br />
                            <span className="italic text-[hsl(var(--wine))]">You Just Couldn't Name Them.</span>
                        </h2>
                    </ScrollReveal>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-10%" }}
                        className="grid sm:grid-cols-2 gap-8 text-left"
                    >
                        {problemItems.map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className="p-10 bg-[hsl(var(--cream))] rounded-sm flex gap-6 border border-[hsl(var(--divider))] hover:border-[hsl(var(--pink-soft))] transition-all duration-500 hover:shadow-card group"
                            >
                                <span className="text-[hsl(var(--wine))] font-bold text-2xl py-1 group-hover:scale-110 transition-transform">→</span>
                                <p className="text-[hsl(var(--text-primary))] leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: item.replace(/(\*\*)(.*?)(\*\*)/g, '<strong class="text-[hsl(var(--wine))] font-semibold">$2</strong>') }} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Guide Showcases */}
            <section id="guides" className="py-24 px-[5%] bg-[hsl(var(--cream))] relative overflow-hidden">
                {/* Abstract background elements */}
                <div className="absolute top-1/4 left-0 w-64 h-64 bg-[hsl(var(--pink-soft))]/10 rounded-full blur-3xl -translate-x-1/2" />
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[hsl(var(--gold-pale))]/20 rounded-full blur-3xl translate-x-1/2" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <ScrollReveal>
                        <div className="text-center mb-20">
                            <span className="text-[0.75rem] font-bold tracking-[1.5px] uppercase text-[hsl(var(--gold))] mb-4 block">The Guides</span>
                            <h2 className="font-serif text-4xl md:text-6xl text-[hsl(var(--charcoal))] mb-6">Your Complete Dating Defense System</h2>
                            <p className="text-[hsl(var(--text-secondary))] text-lg max-w-2xl mx-auto leading-relaxed">Two reference guides. Every pattern named. Every script written. Yours to keep.</p>
                        </div>
                    </ScrollReveal>

                    <div className="space-y-24">
                        {/* Guide 1: 49 Patterns */}
                        <ScrollReveal direction="up" distance={50}>
                            <div className="grid md:grid-cols-2 bg-white rounded-sm overflow-hidden border border-[hsl(var(--divider))] shadow-card group hover:shadow-xl transition-shadow duration-500">
                                <div className="p-12 md:p-16 flex flex-col justify-center items-center bg-gradient-to-br from-[#F5D0D0] via-[#FFF0F0] to-[#FDF8F3] relative min-h-[450px]">
                                    {/* Mock Book */}
                                    <motion.div
                                        whileHover={{ y: -10, rotateY: 8, rotateX: 2 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="w-64 h-[350px] bg-gradient-to-br from-[#3D1A22] via-[#722F37] to-[#2E1218] rounded-[3px] shadow-2xl p-8 relative flex flex-col items-center justify-center text-center border border-white/5 perspective-1000"
                                    >
                                        <div className="absolute top-0 left-0 w-2 h-full bg-black/30" />
                                        <div className="absolute inset-4 border border-[hsl(var(--gold))]/30 pointer-events-none" />
                                        <span className="absolute top-3 left-3 right-3 flex justify-between px-1">
                                            <span className="w-5 h-5 border-t-2 border-l-2 border-[hsl(var(--gold))]" />
                                            <span className="w-5 h-5 border-t-2 border-r-2 border-[hsl(var(--gold))]" />
                                        </span>
                                        <span className="absolute bottom-3 left-3 right-3 flex justify-between px-1">
                                            <span className="w-5 h-5 border-b-2 border-l-2 border-[hsl(var(--gold))]" />
                                            <span className="w-5 h-5 border-b-2 border-r-2 border-[hsl(var(--gold))]" />
                                        </span>

                                        <span className="text-[0.55rem] font-bold tracking-[3px] text-white/80 border border-[hsl(var(--gold))]/50 px-4 py-1.5 rounded-full mb-8 uppercase">THE PINK PILL</span>
                                        <p className="font-serif italic text-white/85 mb-1 text-lg">The</p>
                                        <h3 className="font-serif text-4xl font-bold text-white tracking-[4px] leading-none mb-4 uppercase">
                                            <span className="text-[hsl(var(--gold))]">49</span><br />PATTERNS
                                        </h3>
                                        <div className="w-16 h-[1.5px] bg-[hsl(var(--gold))]/40 relative my-4">
                                            <span className="absolute inset-x-0 -top-[4.5px] text-[0.6rem] text-[hsl(var(--gold))]">◆</span>
                                        </div>
                                        <p className="font-serif text-2xl tracking-[4px] uppercase text-white font-light">Field Guide</p>
                                        <p className="mt-auto pt-6 text-[0.5rem] text-white/50 tracking-[2px] uppercase">
                                            BY<strong className="block text-white/90 font-serif text-[0.75rem] mt-1.5 uppercase letter-spacing-[1px]">Christelyn Karazin</strong>
                                        </p>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        className="absolute bottom-8 px-6 py-2.5 bg-[hsl(var(--charcoal))]/5 backdrop-blur-md border border-[hsl(var(--charcoal))]/10 text-[hsl(var(--charcoal))] font-bold text-[0.8rem] tracking-[1.5px] rounded-full uppercase"
                                    >
                                        60 Pages • 8 Categories
                                    </motion.div>
                                </div>
                                <div className="p-12 md:p-16 lg:p-20 flex flex-col justify-center">
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        className="inline-block px-4 py-1.5 mb-6 text-[0.7rem] font-bold tracking-[1.5px] uppercase text-[hsl(var(--wine))] bg-[hsl(var(--blush))] rounded-sm w-fit"
                                    >
                                        Flagship Guide
                                    </motion.span>
                                    <h3 className="font-serif text-4xl text-[hsl(var(--charcoal))] mb-6">The 49 Patterns Field Guide</h3>
                                    <p className="text-[hsl(var(--text-secondary))] text-lg leading-relaxed mb-8">
                                        The complete reference to every manipulation pattern, red flag, and commitment-avoidance tactic. From Dark Triad personalities to modern dating games — if he's playing it, it's in here.
                                    </p>
                                    <motion.ul
                                        variants={containerVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        className="space-y-4 mb-10"
                                    >
                                        {[
                                            "All 49 named patterns across 8 categories",
                                            "Exact phrases he'll use for each pattern",
                                            "What it looks like in texts (digital red flags)",
                                            "Your script — the exact words to respond with",
                                            "Clear verdict for every pattern: EXIT, CAUTION, or WORKABLE"
                                        ].map((li, i) => (
                                            <motion.li key={i} variants={itemVariants} className="flex gap-4 text-[hsl(var(--text-primary))] items-start text-lg">
                                                <div className="w-6 h-6 rounded-full bg-[hsl(var(--gold-pale))] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Check size={14} className="text-[hsl(var(--gold))] font-bold" />
                                                </div>
                                                {li}
                                            </motion.li>
                                        ))}
                                    </motion.ul>
                                    <div className="flex items-baseline gap-3 mb-8">
                                        <span className="font-serif text-5xl font-bold text-[hsl(var(--charcoal))]">$27</span>
                                        <span className="text-lg text-[hsl(var(--text-muted))]">one-time • yours forever</span>
                                    </div>
                                    <Link href="#pricing" className="btn-wine text-center w-full shadow-lg text-lg py-5 group">
                                        Get This Guide <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Guide 2: Swirling */}
                        <ScrollReveal direction="up" distance={50} delay={0.2}>
                            <div className="grid md:grid-cols-2 bg-white rounded-sm overflow-hidden border border-[hsl(var(--divider))] shadow-card group hover:shadow-xl transition-shadow duration-500">
                                <div className="p-12 md:p-16 lg:p-20 flex flex-col justify-center md:order-1 order-2">
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        className="inline-block px-4 py-1.5 mb-6 text-[0.7rem] font-bold tracking-[1.5px] uppercase text-[hsl(var(--charcoal))] bg-[hsl(var(--gold-pale))] rounded-sm w-fit"
                                    >
                                        IR Dating Guide
                                    </motion.span>
                                    <h3 className="font-serif text-4xl text-[hsl(var(--charcoal))] mb-6">The Swirling Success Guide</h3>
                                    <p className="text-[hsl(var(--text-secondary))] text-lg leading-relaxed mb-8">
                                        Your complete guide to interracial dating done right. Written by the co-author of <em>Swirling</em> (Simon & Schuster), drawing from over a decade of coaching.
                                    </p>
                                    <motion.ul
                                        variants={containerVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        className="space-y-4 mb-10"
                                    >
                                        {[
                                            "Top 15 places to meet quality men open to IR dating",
                                            "Best cities for swirling (with intermarriage data)",
                                            "3-date vetting checklist for IR-specific red flags",
                                            "The 3 green flags that predict success",
                                            "Scripts for dates, family, and public comments"
                                        ].map((li, i) => (
                                            <motion.li key={i} variants={itemVariants} className="flex gap-4 text-[hsl(var(--text-primary))] items-start text-lg">
                                                <div className="w-6 h-6 rounded-full bg-[hsl(var(--gold-pale))] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Check size={14} className="text-[hsl(var(--gold))] font-bold" />
                                                </div>
                                                {li}
                                            </motion.li>
                                        ))}
                                    </motion.ul>
                                    <div className="flex items-baseline gap-3 mb-8">
                                        <span className="font-serif text-5xl font-bold text-[hsl(var(--charcoal))]">$19</span>
                                        <span className="text-lg text-[hsl(var(--text-muted))]">one-time • yours forever</span>
                                    </div>
                                    <Link href="#pricing" className="btn-wine text-center w-full shadow-lg text-lg py-5 group">
                                        Get This Guide <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                                <div className="p-12 md:p-16 flex flex-col justify-center items-center bg-gradient-to-br from-[#F9F3E3] via-[#E8D5A8] to-[#F9F3E3] relative min-h-[450px] md:order-2 order-1">
                                    {/* Mock Book */}
                                    <motion.div
                                        whileHover={{ y: -10, rotateY: -8, rotateX: 2 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="w-64 h-[350px] bg-gradient-to-br from-[#3D1A22] via-[#722F37] to-[#2E1218] rounded-[3px] shadow-2xl p-8 relative flex flex-col items-center justify-center text-center border border-white/5 perspective-1000"
                                    >
                                        <div className="absolute top-0 left-0 w-2 h-full bg-black/30" />
                                        <div className="absolute inset-4 border border-[hsl(var(--gold))]/30 pointer-events-none" />
                                        <span className="absolute top-3 left-3 right-3 flex justify-between px-1">
                                            <span className="w-5 h-5 border-t-2 border-l-2 border-[hsl(var(--gold))]" />
                                            <span className="w-5 h-5 border-t-2 border-r-2 border-[hsl(var(--gold))]" />
                                        </span>
                                        <span className="absolute bottom-3 left-3 right-3 flex justify-between px-1">
                                            <span className="w-5 h-5 border-b-2 border-l-2 border-[hsl(var(--gold))]" />
                                            <span className="w-5 h-5 border-b-2 border-r-2 border-[hsl(var(--gold))]" />
                                        </span>

                                        <span className="text-[0.55rem] font-bold tracking-[3px] text-white/80 border border-[hsl(var(--gold))]/50 px-4 py-1.5 rounded-full mb-8 uppercase">THE PINK PILL</span>
                                        <p className="font-serif italic text-white/85 mb-1 text-lg">The</p>
                                        <h3 className="font-serif text-3xl font-bold text-white tracking-[3px] leading-tight mb-4 uppercase">
                                            SWIRLING<br /><span className="text-[hsl(var(--gold))]">SUCCESS</span><br />GUIDE
                                        </h3>
                                        <div className="w-16 h-[1.5px] bg-[hsl(var(--gold))]/40 relative my-4">
                                            <span className="absolute inset-x-0 -top-[4.5px] text-[0.6rem] text-[hsl(var(--gold))]">◆</span>
                                        </div>
                                        <p className="text-[0.55rem] italic text-white/70 mb-10 max-w-[180px] leading-relaxed tracking-wider uppercase">Your Complete Guide to Interracial Dating Done Right</p>
                                        <p className="mt-auto pt-6 text-[0.5rem] text-white/50 tracking-[2px] uppercase">
                                            BY<strong className="block text-white/90 font-serif text-[0.75rem] mt-1.5 uppercase letter-spacing-[1px]">Christelyn Karazin</strong>
                                        </p>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        className="absolute bottom-8 px-6 py-2.5 bg-[hsl(var(--charcoal))]/5 backdrop-blur-md border border-[hsl(var(--charcoal))]/10 text-[hsl(var(--charcoal))] font-bold text-[0.8rem] tracking-[1.5px] rounded-full uppercase"
                                    >
                                        26 Pages • 9 Chapters
                                    </motion.div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Sneak Peek */}
            <section className="py-24 px-[5%] bg-white relative overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <ScrollReveal>
                        <span className="text-[0.75rem] font-bold tracking-[1.5px] uppercase text-[hsl(var(--gold))] mb-4 block">Sneak Peek</span>
                        <h2 className="font-serif text-4xl md:text-6xl text-[hsl(var(--charcoal))] mb-4 leading-tight">A Taste of the 49 Patterns</h2>
                        <p className="text-[hsl(var(--text-secondary))] text-lg mb-16 max-w-2xl mx-auto">Here's what three of the patterns look like. The full guide covers all 49. Each comes with a full breakdown, scripts, and verdict.</p>
                    </ScrollReveal>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-10%" }}
                        className="grid sm:grid-cols-3 gap-8 mb-20 px-4 sm:px-0"
                    >
                        {[
                            { num: "#6", title: "Push-Pull", quote: "I've never felt this way → I need space", verdict: "EXIT" },
                            { num: "#16", title: "The Situationship Holder", quote: "Labels are just words. Why do we need to put a title on it?", verdict: "EXIT" },
                            { num: "#9", title: "Love Bombing", quote: "You're my soulmate — week one, before he really knows you", verdict: "CAUTION" }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="p-10 bg-[hsl(var(--cream))] rounded-sm border border-[hsl(var(--divider))] text-left hover:border-[hsl(var(--pink-accent))] transition-all duration-500 group relative"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-6xl text-[hsl(var(--charcoal))] pointer-events-none group-hover:opacity-20 transition-opacity">{card.num}</div>
                                <div className="font-serif text-4xl text-[hsl(var(--pink-soft))] group-hover:text-[hsl(var(--pink-accent))] mb-6 transition-colors leading-none">{card.num}</div>
                                <h4 className="font-serif text-2xl text-[hsl(var(--charcoal))] mb-4">{card.title}</h4>
                                <p className="text-[hsl(var(--text-secondary))] italic text-lg mb-8 leading-relaxed relative min-h-[80px]">
                                    <span className="text-3xl text-[hsl(var(--gold-light))] leading-none absolute -left-4 -top-2 opacity-50">"</span>
                                    {card.quote}
                                    <span className="text-3xl text-[hsl(var(--gold-light))] leading-none absolute -bottom-4 opacity-50">"</span>
                                </p>
                                <span className={`text-[0.75rem] font-bold tracking-[2px] uppercase px-4 py-1.5 rounded-full inline-block shadow-sm ${card.verdict === 'EXIT' ? 'bg-[hsl(var(--blush))] text-[hsl(var(--wine))]' : 'bg-[hsl(var(--gold-pale))] text-[hsl(var(--gold))]'}`}>
                                    {card.verdict} Verdict
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>

                    <ScrollReveal delay={0.3}>
                        <div className="max-w-3xl mx-auto py-12 px-8 bg-[hsl(var(--cream))] rounded-sm border border-[hsl(var(--gold))]/10 relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 opacity-5 -rotate-12 translate-x-1/4 translate-y-1/4">
                                <Check size={200} className="text-[hsl(var(--charcoal))]" />
                            </div>
                            <p className="text-[hsl(var(--text-primary))] text-xl mb-10 leading-relaxed relative z-10">
                                Each pattern includes <strong className="text-[hsl(var(--wine))] font-semibold">what he says</strong>, what it looks like in texts, <strong className="text-[hsl(var(--gold))] font-semibold">your script</strong>, and a clear tactical verdict.
                            </p>
                            <Link href="#pricing" className="btn-primary px-12 py-5 text-lg relative z-10 hover:shadow-glow transition-all">
                                Get the Full 49 Pattern Guide →
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Categories Overview */}
            <section className="py-32 px-[5%] bg-[hsl(var(--cream))] relative">
                <div className="max-w-4xl mx-auto relative z-10">
                    <ScrollReveal>
                        <div className="text-center mb-20">
                            <span className="text-[0.75rem] font-bold tracking-[1.5px] uppercase text-[hsl(var(--gold))] mb-4 block">Complete Coverage</span>
                            <h2 className="font-serif text-4xl md:text-6xl text-[hsl(var(--charcoal))] leading-tight">8 Categories. 49 Patterns.</h2>
                        </div>
                    </ScrollReveal>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        {categories.map((cat, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className="flex items-center gap-8 py-8 border-b border-[hsl(var(--divider))] hover:bg-white/60 transition-all duration-500 px-8 group rounded-sm"
                            >
                                <div className="font-serif text-4xl font-bold text-[hsl(var(--wine))] opacity-70 w-12 text-center group-hover:scale-125 group-hover:opacity-100 transition-all">{cat.letter}</div>
                                <div className="flex-1">
                                    <h4 className="font-serif text-2xl text-[hsl(var(--charcoal))] group-hover:text-[hsl(var(--wine))] transition-colors mb-2">{cat.title}</h4>
                                    <p className="text-base text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--text-secondary))] transition-colors">{cat.desc}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2 hidden sm:flex">
                                    <span className="text-[0.8rem] font-bold text-[hsl(var(--gold))] uppercase tracking-[2px] whitespace-nowrap">
                                        {cat.count}
                                    </span>
                                    <div className="w-12 h-1 bg-[hsl(var(--divider))] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "100%" }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                                            className="h-full bg-[hsl(var(--gold))]"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Inside the Guide - Deep Dive */}
            <section className="py-32 px-[5%] bg-white relative">
                <div className="max-w-4xl mx-auto relative z-10">
                    <ScrollReveal>
                        <div className="text-center mb-20">
                            <span className="text-[0.75rem] font-bold tracking-[1.5px] uppercase text-[hsl(var(--gold))] mb-4 block">Actionable Insight</span>
                            <h2 className="font-serif text-4xl md:text-6xl text-[hsl(var(--charcoal))] mb-6 leading-tight">What Each Pattern Gives You</h2>
                            <p className="text-[hsl(var(--text-secondary))] text-lg max-w-2xl mx-auto leading-relaxed">Every pattern follows this diagnostic format so you can recognize it and respond with total confidence immediately.</p>
                        </div>
                    </ScrollReveal>

                    <div className="space-y-12">
                        {[
                            { cat: "He Says / He Does", title: "Pattern #11 — The Breadcrumber", content: '"Hey you 😏" ... "We should hang out sometime" ... likes your posts but never actually makes plans', script: '"I don\'t do breadcrumbs. Either you\'re interested enough to make plans or you\'re not. Let me know if that changes."', iconColor: "hsl(var(--wine))", bgColor: "hsl(var(--blush))" },
                            { cat: "He Says / He Does", title: "Pattern #47 — The Fetishizer", content: '"I just love chocolate/exotic women" ... obsessed with your race, not you as a person', script: '"I notice you keep bringing up my race. What do you actually know about ME as a person? I\'m looking for a connection, not a category."', iconColor: "hsl(var(--gold))", bgColor: "hsl(var(--gold-pale))" }
                        ].map((item, i) => (
                            <ScrollReveal key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.2}>
                                <div className="overflow-hidden rounded-sm border-l-8 bg-white shadow-card border border-y border-r border-[hsl(var(--divider))] group hover:shadow-xl transition-shadow duration-500" style={{ borderLeftColor: item.iconColor }}>
                                    <div className="p-10 md:p-14">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.iconColor }} />
                                            <span className="text-[0.75rem] font-bold tracking-[3px] uppercase text-[hsl(var(--text-muted))]">{item.cat}</span>
                                        </div>
                                        <h4 className="font-serif text-3xl sm:text-4xl text-[hsl(var(--charcoal))] mb-8">{item.title}</h4>

                                        <div className="grid md:grid-cols-2 gap-10">
                                            <div>
                                                <span className="text-[0.7rem] font-bold tracking-[2px] uppercase text-[hsl(var(--wine))] mb-4 block opacity-70">The Recognition</span>
                                                <div className="p-6 rounded-sm text-[hsl(var(--wine))] italic text-xl border border-[hsl(var(--pink-soft))]/30 bg-gradient-to-br from-[hsl(var(--blush))] to-white leading-relaxed">
                                                    {item.content}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[0.7rem] font-bold tracking-[2px] uppercase text-[hsl(var(--gold))] mb-4 block opacity-70">The Tactical Script</span>
                                                <div className="p-6 rounded-sm text-[hsl(var(--text-primary))] text-lg font-medium border border-[hsl(var(--gold-pale))] bg-gradient-to-br from-[hsl(var(--gold-pale))] to-white leading-relaxed">
                                                    {item.script}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing - Strategic Comparison */}
            <section id="pricing" className="py-32 px-[5%] bg-[hsl(var(--cream-dark))] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[50%] h-full bg-[hsl(var(--cream))]/50 skew-x-[-15deg] translate-x-1/4 pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <ScrollReveal>
                        <div className="text-center mb-24">
                            <span className="text-[0.75rem] font-bold tracking-[2px] uppercase text-[hsl(var(--gold))] mb-4 block">Investment</span>
                            <h2 className="font-serif text-5xl md:text-7xl text-[hsl(var(--charcoal))] mb-6 leading-tight">Invest in <span className="italic text-[hsl(var(--wine))]">Total Clarity</span></h2>
                            <p className="text-[hsl(var(--text-secondary))] text-xl max-w-2xl mx-auto leading-relaxed">One-time purchase. Instant download. Yours to keep forever. The best money you'll ever spend on your peace of mind.</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-3 gap-8 items-stretch">
                        {/* 49 Patterns Card */}
                        <ScrollReveal direction="up" distance={30} className="h-full" fullHeight>
                            <div className="p-12 bg-[hsl(var(--cream))] rounded-sm border border-[hsl(var(--divider))] flex flex-col h-full hover:shadow-2xl transition-all duration-500 group relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-[hsl(var(--pink-soft))] opacity-50" />
                                <h4 className="font-serif text-2xl text-[hsl(var(--charcoal))] mb-6 font-semibold">49 Patterns Field Guide</h4>
                                <div className="font-serif text-6xl font-bold text-[hsl(var(--charcoal))] mb-2">$27</div>
                                <p className="text-base text-[hsl(var(--text-muted))] mb-10 leading-relaxed capitalize">The essential toolkit for spotting red flags instantly.</p>
                                <ul className="space-y-5 mb-12 flex-grow">
                                    {["49 named patterns", "8 categories of manipulation", "Exact phrases he'll use", "Scripts for every pattern", "60-page PDF reference"].map((f, i) => (
                                        <li key={i} className="flex gap-4 text-base text-[hsl(var(--text-primary))] items-center border-b border-[hsl(var(--divider))]/50 pb-3">
                                            <div className="w-5 h-5 rounded-full bg-[hsl(var(--blush))] flex items-center justify-center">
                                                <Check size={12} className="text-[hsl(var(--wine))] font-bold" />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleCheckout("patterns")}
                                    disabled={loadingProductId !== null}
                                    className="btn-wine w-full py-5 text-lg font-bold shadow-soft hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingProductId === "patterns" ? "Processing..." : "Buy for $27"}
                                </button>
                            </div>
                        </ScrollReveal>

                        {/* Bundle Featured Card */}
                        <ScrollReveal direction="up" distance={50} delay={0.1} className="h-full" fullHeight>
                            <div className="p-10 bg-white rounded-sm border-2 border-[hsl(var(--gold))] flex flex-col h-full relative shadow-xl z-20 overflow-visible transition-all duration-300 hover:-translate-y-1">
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[hsl(var(--gold))] text-[hsl(var(--charcoal))] px-4 py-1 text-[0.65rem] font-bold uppercase tracking-[1px] rounded-[2px] whitespace-nowrap shadow-sm z-30">
                                    Best Value
                                </span>
                                <h4 className="font-serif text-2xl text-[hsl(var(--charcoal))] mb-4 text-center">Both Guides Bundle</h4>
                                <div className="font-serif text-6xl font-bold text-[hsl(var(--charcoal))] mb-2 text-center">$37</div>
                                <div className="text-[0.8rem] text-[hsl(var(--text-muted))] mb-2 text-center">
                                    Separately: <span className="line-through text-[hsl(var(--pink-accent))]">$46</span> — You save $9
                                </div>
                                <p className="text-[0.85rem] text-[hsl(var(--text-secondary))] mb-8 leading-relaxed text-center">Complete dating defense system</p>
                                <ul className="space-y-3 mb-10 flex-grow relative z-10">
                                    {[
                                        "Everything in the 49 Patterns Guide",
                                        "Everything in the Swirling Guide",
                                        "49 patterns + IR-specific vetting",
                                        "75+ pages of scripts & strategies",
                                        "Best cities & venues for meeting men",
                                        "Family navigation playbook"
                                    ].map((f, i) => (
                                        <li key={i} className="flex gap-4 text-[0.85rem] text-[hsl(var(--text-primary))] items-center border-b border-[hsl(var(--divider))] pb-3">
                                            <span className="text-[hsl(var(--gold))] font-bold text-lg leading-none">✓</span>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleCheckout("bundle")}
                                    disabled={loadingProductId !== null}
                                    className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingProductId === "bundle" ? "Processing..." : "Get Both for $37"}
                                </button>
                            </div>
                        </ScrollReveal>

                        {/* Swirling Card */}
                        <ScrollReveal direction="up" distance={30} delay={0.2} className="h-full" fullHeight>
                            <div className="p-12 bg-[hsl(var(--cream))] rounded-sm border border-[hsl(var(--divider))] flex flex-col h-full hover:shadow-2xl transition-all duration-500 group relative">
                                <div className="absolute top-0 right-0 w-full h-1 bg-[hsl(var(--gold-light))] opacity-50" />
                                <h4 className="font-serif text-2xl text-[hsl(var(--charcoal))] mb-6 font-semibold">Swirling Success Guide</h4>
                                <div className="font-serif text-6xl font-bold text-[hsl(var(--charcoal))] mb-2">$19</div>
                                <p className="text-base text-[hsl(var(--text-muted))] mb-10 leading-relaxed capitalize">Your roadmap to interracial dating excellence.</p>
                                <ul className="space-y-5 mb-12 flex-grow">
                                    {["Where to meet quality men", "Best IR-friendly cities", "3-date IR vetting checklist", "Family dynamics navigation", "26-page PDF reference"].map((f, i) => (
                                        <li key={i} className="flex gap-4 text-base text-[hsl(var(--text-primary))] items-center border-b border-[hsl(var(--divider))]/50 pb-3">
                                            <div className="w-5 h-5 rounded-full bg-[hsl(var(--gold-pale))] flex items-center justify-center">
                                                <Check size={12} className="text-[hsl(var(--gold))] font-bold" />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleCheckout("swirling")}
                                    disabled={loadingProductId !== null}
                                    className="btn-wine w-full py-5 text-lg font-bold shadow-soft hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingProductId === "swirling" ? "Processing..." : "Buy for $19"}
                                </button>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 px-[5%] bg-white relative">
                <div className="max-w-4xl mx-auto relative z-10">
                    <ScrollReveal>
                        <div className="text-center mb-24">
                            <span className="text-[0.75rem] font-bold tracking-[2px] uppercase text-[hsl(var(--gold))] mb-4 block">Questions</span>
                            <h2 className="font-serif text-4xl md:text-6xl text-[hsl(var(--charcoal))] leading-tight">Frequently Asked</h2>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal direction="up" distance={30}>
                        <div className="space-y-2 border-t border-[hsl(var(--divider))] pt-2">
                            {faqs.map((faq, i) => (
                                <AccordionItem key={i} title={faq.title} content={faq.content} />
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section >

            {/* Final CTA - Cinematic */}
            < section className="py-32 px-[5%] bg-[hsl(var(--charcoal))] relative overflow-hidden text-center min-h-[500px] flex items-center" >
                {/* Animated texture background */}
                < div className="absolute inset-0 opacity-10 pointer-events-none" >
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </div >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[hsl(var(--wine))]/20 rounded-full blur-[150px] -translate-y-1/2" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-[hsl(var(--gold))]/10 rounded-full blur-[200px] translate-y-1/2" />

                <div className="max-w-3xl mx-auto relative z-10 px-6">
                    <ScrollReveal>
                        <h2 className="font-serif text-5xl md:text-8xl text-[hsl(var(--cream))] mb-10 leading-none">
                            Patterns Predict <br />
                            <motion.span
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 1 }}
                                className="italic text-[hsl(var(--gold))] inline-block mt-4"
                            >
                                the Future.
                            </motion.span>
                        </h2>
                        <p className="text-[hsl(var(--cream))] opacity-80 mb-14 text-xl md:text-2xl leading-relaxed font-light">
                            If you see it once, note it. If you see it twice, believe it. <br className="hidden md:block" />
                            If you see it three times, <strong className="text-[hsl(var(--gold))] font-semibold">you have your answer.</strong>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link href="#pricing" className="inline-block px-14 py-6 bg-[hsl(var(--gold))] text-[hsl(var(--charcoal))] font-black uppercase tracking-[3px] text-lg rounded-sm transition-all hover:bg-[hsl(var(--gold-light))] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(201,165,92,0.5)] active:scale-95 group">
                                Begin Your Defense <ArrowRight className="inline ml-3 group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                        <p className="mt-8 text-[hsl(var(--cream))] opacity-40 text-xs uppercase tracking-[4px]">Verified Secure Checkout • 100% Personal Privacy</p>
                    </ScrollReveal>
                </div>
            </section >

            {/* Footer Branding - Premium Dark */}
            < section className="py-20 bg-[hsl(var(--charcoal))] border-t border-white/5 text-center relative z-10" >
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-[1200px] mx-auto px-[5%]"
                >
                    <div className="font-serif text-3xl text-[hsl(var(--cream))] mb-10 tracking-[1px] opacity-90">The Pink Pill</div>
                    <div className="flex flex-wrap justify-center gap-10 md:gap-16 mb-12">
                        {["About", "Privacy Policy", "Terms of Service", "Contact"].map((link, i) => (
                            <Link
                                key={i}
                                href={`/${link.toLowerCase().replace(/ /g, '-')}`}
                                className="text-white/40 text-xs uppercase tracking-[3px] font-bold hover:text-[hsl(var(--gold))] transition-all duration-300 relative group overflow-hidden"
                            >
                                <span className="relative z-10">{link}</span>
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[hsl(var(--gold))] transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </div>
                    <div className="w-20 h-[1px] bg-white/10 mx-auto mb-10" />
                    <p className="text-[0.65rem] text-white/20 uppercase tracking-[5px] max-w-lg mx-auto leading-loose">
                        © 2025 Christelyn Karazin / Pink Pill. All rights reserved. <br />
                        For personal use only. Distribution of this content is strictly prohibited.
                    </p>
                </motion.div>
            </section >

            <AuthModal
                isOpen={authModal.isOpen}
                onClose={() => setAuthModal({ ...authModal, isOpen: false })}
                initialMode={authModal.mode}
            />
        </div >
    );
}
