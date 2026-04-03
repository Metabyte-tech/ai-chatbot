"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import {
    User as UserIcon,
    Settings,
    Sliders,
    Zap,
    HeadphonesIcon,
    Home,
    HelpCircle,
    Smartphone,
    MessageSquare,
    LogOut,
    Share2,
    CreditCard
} from "lucide-react";
import { SettingsModal } from "./settings-modal";

type SettingsTab = "account" | "subscription" | "settings" | "personalization" | "skills" | "contact";

function getInitials(name?: string | null, email?: string | null): string {
    if (name) {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }
    if (email) return email[0].toUpperCase();
    return "U";
}

function maskEmail(email?: string | null): string {
    if (!email) return "";
    const [local, domain] = email.split("@");
    const visible = local.slice(0, 2);
    const masked = "*".repeat(Math.min(8, local.length - 2));
    return `${visible}${masked}@${domain.slice(0, 2)}...`;
}

export function UserMenu() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<SettingsTab>("account");
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!session?.user || (session.user as any).type === "guest") return null;

    const user = session.user;
    const initials = getInitials(user.name, user.email);

    const openSettings = (tab: SettingsTab) => {
        setActiveTab(tab);
        setSettingsOpen(true);
        setOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            {/* Avatar trigger — always show initials circle */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 cursor-pointer select-none"
                aria-label="User menu"
            >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3a6b4a] text-white text-sm font-bold border-2 border-white shadow ring-2 ring-[#3a6b4a]/30 select-none">
                    {initials}
                </div>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-12 z-[200] w-72 rounded-2xl bg-white shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header: share + badge */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <button type="button" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition">
                            <Share2 className="h-3.5 w-3.5" />
                            Share
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                                <span className="text-sm">📋</span> 10
                            </span>
                            <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-bold text-white">
                                ✦ Free trial
                            </span>
                        </div>
                    </div>

                    {/* User info */}
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3a6b4a] text-white font-bold text-base border-2 border-[#3a6b4a] shrink-0 select-none">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-zinc-900 text-sm truncate">{user.name ?? "User"}</p>
                            <p className="text-xs text-zinc-400 truncate">{maskEmail(user.email)}</p>
                        </div>
                    </div>

                    {/* Plan row */}
                    <div className="mx-3 mb-3 flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-2.5">
                        <span className="text-sm font-semibold text-zinc-800">Free</span>
                        <button
                            type="button"
                            onClick={() => openSettings("subscription")}
                            className="rounded-full bg-zinc-900 px-4 py-1 text-xs font-semibold text-white hover:bg-zinc-700 transition"
                        >
                            Upgrade
                        </button>
                    </div>

                    {/* Agent task row */}
                    <div className="mx-3 mb-3 flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-2.5">
                        <span className="text-sm text-zinc-600">Agent task</span>
                        <span className="text-sm font-bold text-zinc-900">10</span>
                    </div>

                    <div className="h-px bg-zinc-100 mx-3" />

                    {/* Nav links */}
                    <nav className="px-1 py-2 flex flex-col gap-0.5">
                        {[
                            { icon: UserIcon, label: "Account", id: "account" },
                            { icon: Settings, label: "Settings", id: "settings" },
                            { icon: Sliders, label: "Personalization", id: "personalization" },
                            { icon: Zap, label: "Skills", id: "skills" },
                            { icon: HeadphonesIcon, label: "Contact us", id: "contact" },
                        ].map(({ icon: Icon, label, id }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => openSettings(id as SettingsTab)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors w-full text-left"
                            >
                                <Icon className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="h-px bg-zinc-100 mx-3" />

                    <nav className="px-1 py-2 flex flex-col gap-0.5">
                        {[
                            { icon: Home, label: "About Retails Store", href: "https://retailsstore.ai/about" },
                            { icon: HelpCircle, label: "Help Center", href: "https://help.retailsstore.ai" },
                            { icon: Smartphone, label: "Get Retails Store App", href: "#" },
                            { icon: MessageSquare, label: "Join Discord", href: "https://discord.gg/retailsstore" },
                        ].map(({ icon: Icon, label, href }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => {
                                    if (href !== "#") window.open(href, "_blank");
                                    setOpen(false);
                                }}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors w-full text-left"
                            >
                                <Icon className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="h-px bg-zinc-100 mx-3" />

                    {/* Log out */}
                    <div className="px-1 py-2">
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
                        >
                            <LogOut className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                            Log out
                        </button>
                    </div>
                </div>
            )}

            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                defaultTab={activeTab}
            />
        </div>
    );
}
