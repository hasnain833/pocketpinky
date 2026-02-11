"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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

export default function ResetPasswordPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const passwordRequirements = checkPasswordRequirements(password);
    const passwordsMatch = confirmPassword.length === 0 ? null : password === confirmPassword;
    const isValid = passwordRequirements.all && passwordsMatch;

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!supabase) return;
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            toast.success("Password updated successfully!");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--cream))] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[hsl(var(--divider))] overflow-hidden"
            >
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-3xl text-[hsl(var(--charcoal))] mb-2">Set New Password</h1>
                        <p className="text-sm text-[hsl(var(--text-muted))]">Please enter your new password below.</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white border-[hsl(var(--divider))] pr-10 h-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))]"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <ul className="text-[11px] flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
                                <li className={`flex items-center gap-1.5 ${passwordRequirements.length ? "text-green-600" : "text-[hsl(var(--text-muted))]"}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.length ? "bg-green-600" : "bg-[hsl(var(--divider))]"}`} /> 8+ characters
                                </li>
                                <li className={`flex items-center gap-1.5 ${passwordRequirements.uppercase ? "text-green-600" : "text-[hsl(var(--text-muted))]"}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.uppercase ? "bg-green-600" : "bg-[hsl(var(--divider))]"}`} /> One uppercase
                                </li>
                                <li className={`flex items-center gap-1.5 ${passwordRequirements.special ? "text-green-600" : "text-[hsl(var(--text-muted))]"}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.special ? "bg-green-600" : "bg-[hsl(var(--divider))]"}`} /> One special char
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-white border-[hsl(var(--divider))] h-11"
                            />
                            {confirmPassword.length > 0 && !passwordsMatch && (
                                <p className="text-[11px] text-red-500">Passwords don&apos;t match</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !isValid}
                            className="w-full btn-primary h-12 text-base"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
