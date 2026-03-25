"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2, X } from "lucide-react";

function MicrosoftIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
    );
}

function AlibabaIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#FF6A00" />
            <text x="8" y="21" fontSize="14" fontWeight="bold" fill="white" fontFamily="Arial">a</text>
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleOAuth = async (provider: string) => {
        setLoadingProvider(provider);
        await signIn(provider, { callbackUrl: "/" });
    };

    const handleEmailContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        router.push(`/register?email=${encodeURIComponent(email)}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative flex w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 z-[110] flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-zinc-500 shadow-sm hover:bg-white hover:text-zinc-900 transition-colors"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Left panel – gradient branding */}
                <div className="hidden md:flex w-[46%] flex-col items-start justify-between bg-gradient-to-br from-[#0a1628] via-[#0f2a5e] to-[#0d3b4e] px-10 py-10 text-white relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-teal-400/20 via-transparent to-transparent pointer-events-none" />

                    <div className="flex items-center gap-2 z-10">
                        <span className="text-sm font-medium text-white/60">Welcome to</span>
                        <span className="font-bold text-lg tracking-tight text-white">Accio</span>
                    </div>

                    <div className="z-10 flex flex-col gap-6 pb-4">
                        <h2 className="text-3xl font-extrabold leading-tight">
                            100 things you<br />can do with<br />
                            <span className="text-emerald-400">Accio</span>
                        </h2>
                        <div className="relative h-36 w-56">
                            <div className="absolute bottom-0 left-0 h-28 w-32 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-[10px] text-white/50 shadow-lg px-3 text-center">
                                Split Data<br />Collection
                            </div>
                            <div className="absolute bottom-5 left-12 h-28 w-36 rounded-xl bg-white shadow-xl flex flex-col gap-1 p-3 border border-white/20 z-10">
                                <div className="text-[9px] font-bold text-zinc-800 leading-tight">New Product Development</div>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {["👗", "🧢", "👟", "👜"].map(e => (
                                        <span key={e} className="text-sm">{e}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute -right-2 top-0 h-24 w-28 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-[9px] text-white/50 shadow-lg text-center px-2">
                                Amazon Report Analysis
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right panel – sign in form */}
                <div className="flex flex-1 flex-col bg-white px-8 py-10 md:px-10">
                    <h1 className="text-xl font-bold text-zinc-900">Sign in or sign up for AI sourcing</h1>
                    <p className="mt-1.5 text-sm text-zinc-500">Join Accio for daily agent tasks and start your free trial</p>

                    <div className="mt-8 flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => handleOAuth("google")}
                            disabled={!!loadingProvider}
                            className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60 cursor-pointer"
                        >
                            {loadingProvider === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                            Continue with Google
                        </button>

                        <button
                            type="button"
                            onClick={() => handleOAuth("microsoft-entra-id")}
                            disabled={!!loadingProvider}
                            className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60 cursor-pointer"
                        >
                            {loadingProvider === "microsoft-entra-id" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MicrosoftIcon />}
                            Continue with Microsoft
                        </button>

                        <button
                            type="button"
                            disabled
                            className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-400 cursor-not-allowed opacity-60"
                        >
                            <AlibabaIcon />
                            Continue with Alibaba.com
                        </button>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-zinc-100" />
                        <span className="text-xs text-zinc-400">Or</span>
                        <div className="h-px flex-1 bg-zinc-100" />
                    </div>

                    <form onSubmit={handleEmailContinue} className="mt-4 flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 w-full rounded-lg border border-zinc-200 px-4 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition"
                            required
                        />
                        <button
                            type="submit"
                            className="h-11 w-full rounded-lg bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-700"
                        >
                            Continue
                        </button>
                    </form>

                    <p className="mt-5 text-[11px] text-zinc-400 leading-relaxed">
                        By signing up using your third-party external account you agree to Accio&apos;s{" "}
                        <a href="#" className="underline hover:text-zinc-600">Terms of use</a>{" "}
                        and{" "}
                        <a href="#" className="underline hover:text-zinc-600">Privacy Policy</a>.
                    </p>

                    <p className="mt-6 text-center text-xs text-zinc-400">Partnered with Alibaba.com</p>
                </div>
            </div>
        </div>
    );
}
