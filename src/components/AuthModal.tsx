"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_HAS_UPPERCASE = /[A-Z]/;
const PASSWORD_HAS_SPECIAL = /[^A-Za-z0-9]/;

function checkPasswordRequirements(password: string) {
    return {
        length: password.length >= MIN_PASSWORD_LENGTH,
        uppercase: PASSWORD_HAS_UPPERCASE.test(password),
        special: PASSWORD_HAS_SPECIAL.test(password),
        all:
            password.length >= MIN_PASSWORD_LENGTH &&
            PASSWORD_HAS_UPPERCASE.test(password) &&
            PASSWORD_HAS_SPECIAL.test(password),
    };
}

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
}

export const AuthModal = ({ isOpen, onClose, initialMode = "login" }: AuthModalProps) => {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "signup">(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const passwordRequirements = checkPasswordRequirements(form.password);
    const passwordsMatch =
        form.confirmPassword.length === 0
            ? null
            : form.password === form.confirmPassword;

    const isSignup = mode === "signup";
    const signupFormValid =
        form.email.trim() &&
        passwordRequirements.all &&
        form.password === form.confirmPassword &&
        form.confirmPassword.length > 0;

    const supabase = createClient();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setMessage(null);
        if (!supabase) {
            setError("Auth is not configured.");
            return;
        }
        setLoading(true);

        try {
            if (isSignup) {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: form.email,
                    password: form.password,
                    options: { data: { full_name: form.name || undefined } },
                });
                if (signUpError) throw signUpError;
                if (data.user && !data.session) {
                    setMessage("Check your email for the confirmation link.");
                } else {
                    onClose();
                    router.refresh();
                }
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: form.email,
                    password: form.password,
                });
                if (signInError) throw signInError;
                onClose();
                router.refresh();
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[hsl(var(--cream))] border-[hsl(var(--divider))] sm:max-w-[450px] p-0 overflow-hidden">
                <div className="p-5">
                    <DialogHeader className="mb-3">
                        <DialogTitle className="font-serif text-xl text-[hsl(var(--charcoal))] text-center">
                            {isSignup ? "Create account" : "Welcome back"}
                        </DialogTitle>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded text-xs text-red-600">
                                    {error}
                                </div>
                            )}
                            {message && (
                                <div className="mb-4 p-3 bg-[hsl(var(--pink-soft))] border border-[hsl(var(--pink-accent))]/20 rounded text-xs text-[hsl(var(--wine))]">
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-3">
                                {isSignup && (
                                    <div className="space-y-1">
                                        <Label htmlFor="modal-name" className="text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--text-muted))]">Name</Label>
                                        <Input
                                            id="modal-name"
                                            placeholder="Your name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="bg-white border-[hsl(var(--divider))] h-9 text-sm"
                                        />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <Label htmlFor="modal-email" className="text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--text-muted))]">Email</Label>
                                    <Input
                                        id="modal-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="bg-white border-[hsl(var(--divider))] h-9 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="modal-password" dangerouslySetInnerHTML={{ __html: 'Password' }} className="text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--text-muted))]" />
                                    <div className="relative">
                                        <Input
                                            id="modal-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="bg-white border-[hsl(var(--divider))] pr-10 h-9 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))]"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {isSignup && (
                                        <ul className="text-[9px] flex gap-3 mt-1.5 px-1">
                                            <li className={`flex items-center gap-1 ${passwordRequirements.length ? "text-green-600" : "text-[hsl(var(--text-muted))]"}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.length ? "bg-green-600" : "bg-[hsl(var(--divider))]"}`} /> 8+ chars
                                            </li>
                                            <li className={`flex items-center gap-1 ${passwordRequirements.uppercase ? "text-green-600" : "text-[hsl(var(--text-muted))]"}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.uppercase ? "bg-green-600" : "bg-[hsl(var(--divider))]"}`} /> Capital
                                            </li>
                                            <li className={`flex items-center gap-1 ${passwordRequirements.special ? "text-green-600" : "text-[hsl(var(--text-muted))]"}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.special ? "bg-green-600" : "bg-[hsl(var(--divider))]"}`} /> Special
                                            </li>
                                        </ul>
                                    )}
                                </div>

                                {isSignup && (
                                    <div className="space-y-1">
                                        <Label htmlFor="modal-confirm" className="text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--text-muted))]">Confirm Password</Label>
                                        <Input
                                            id="modal-confirm"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={form.confirmPassword}
                                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                            className="bg-white border-[hsl(var(--divider))] h-9 text-sm"
                                        />
                                        {form.confirmPassword.length > 0 && !passwordsMatch && (
                                            <p className="text-[10px] text-red-500">Passwords don&apos;t match</p>
                                        )}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading || (isSignup && !signupFormValid)}
                                    className="w-full btn-primary py-2 h-10 mt-2"
                                >
                                    {loading ? "Please wait..." : (isSignup ? "Sign up" : "Log in")}
                                </Button>
                            </form>

                            <div className="mt-5 text-center text-[13px] text-[hsl(var(--text-secondary))]">
                                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                                <button
                                    onClick={() => setMode(isSignup ? "login" : "signup")}
                                    className="text-[hsl(var(--pink-accent))] font-semibold hover:underline"
                                >
                                    {isSignup ? "Log in" : "Sign up"}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};
