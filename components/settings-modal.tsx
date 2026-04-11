"use client";

import * as React from "react";
import {
    X,
    User,
    CreditCard,
    Settings as SettingsIcon,
    Sliders,
    Zap,
    HeadphonesIcon,
    Pencil,
    ChevronRight,
    Plus,
    Search,
    MoreVertical,
    LogOut,
    Mail,
    Globe,
    MessageSquare,
    Database
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { IngestionUI } from "./ingestion-ui";
import { toast } from "sonner";

type SettingsTab = "account" | "subscription" | "settings" | "personalization" | "skills" | "data_sources" | "contact";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: SettingsTab;
}

export function SettingsModal({ isOpen, onClose, defaultTab = "account" }: SettingsModalProps) {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = React.useState<SettingsTab>(defaultTab);

    const [adminPassword, setAdminPassword] = React.useState("");

    React.useEffect(() => {
        if (isOpen && defaultTab) {
            setActiveTab(defaultTab);
        }
    }, [isOpen, defaultTab]);

    if (!session?.user) return null;

    const user = session.user;
    const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

    const tabs = [
        { id: "account", label: "Account", icon: User },
        { id: "subscription", label: "Subscription", icon: CreditCard },
        { id: "settings", label: "Settings", icon: SettingsIcon },
        { id: "personalization", label: "Personalization", icon: Sliders },
        { id: "skills", label: "Skills", icon: Zap },
        { id: "data_sources", label: "Data Sources", icon: Database },
        { id: "contact", label: "Contact us", icon: HeadphonesIcon },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-white h-[80vh] flex flex-row">
                <DialogTitle className="sr-only">Profile Settings</DialogTitle>

                {/* Sidebar */}
                <div className="w-[240px] border-r border-zinc-100 bg-[#F9FAFB] p-6 flex flex-col gap-6">
                    <div className="flex items-center px-2">
                        <span className="text-xl font-bold tracking-tight text-black">Retails Store</span>
                    </div>

                    <nav className="flex-1 flex flex-col gap-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                                        isActive
                                            ? "bg-zinc-200/60 text-black font-semibold"
                                            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", isActive ? "text-black" : "text-zinc-400")} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-50">
                        <h2 className="text-lg font-bold tracking-tight text-zinc-900 capitalize">
                            {tabs.find(t => t.id === activeTab)?.label || activeTab}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === "account" && (
                            <div className="space-y-8">
                                {/* User Profile */}
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-[#3a6b4a] flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-sm ring-2 ring-[#3a6b4a]/20">
                                        {initials}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-zinc-900">{user.name}</h3>
                                            <button className="p-1 hover:bg-zinc-100 rounded text-zinc-400">
                                                <Pencil size={14} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-zinc-400">{user.email}</p>
                                    </div>
                                </div>

                                {/* Plan Status Card */}
                                <div className="rounded-2xl border border-zinc-100 bg-[#F9FAFB] p-6">
                                    <div className="flex flex-row gap-6">
                                        <div className="flex-1">
                                            <span className="text-sm font-bold text-zinc-800">Free</span>
                                        </div>
                                        <div className="flex-[2] bg-white rounded-xl border border-zinc-100 p-4 space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-zinc-500">Agent task</span>
                                                <span className="font-bold">10</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-zinc-500">Free Plan tasks <span className="text-[10px] text-zinc-300">(daily refresh)</span></span>
                                                <span className="font-bold">10</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-zinc-500">Referral tasks</span>
                                                <span className="font-bold">0</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-zinc-200/50 flex items-center justify-between">
                                        <p className="text-sm text-zinc-500">Upgrade to <span className="font-bold text-zinc-800">Retails Store Starter</span> for more tasks and priority task line</p>
                                        <Button className="bg-black hover:bg-zinc-800 text-white rounded-full px-6 py-2 text-xs font-bold transition-transform hover:scale-105">
                                            Upgrade
                                        </Button>
                                    </div>
                                </div>

                                {/* Other Info */}
                                <div className="space-y-6 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Email</p>
                                            <p className="text-sm text-zinc-700">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Deliver to</p>
                                            <p className="text-sm text-zinc-700">United States</p>
                                        </div>
                                        <Button variant="outline" className="rounded-full px-4 text-xs h-8 border-zinc-200">Change</Button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Invite friends & earn</p>
                                            <p className="text-sm text-zinc-500">You and your friend each get 3 Agent tasks when they sign up.</p>
                                        </div>
                                        <Button variant="outline" className="rounded-full px-4 text-xs h-8 border-zinc-200">Invite</Button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-100">
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-500 transition-colors"
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "subscription" && (
                            <div className="space-y-8">
                                {/* Re-use Plan card logic or show detail */}
                                <div className="rounded-2xl border border-zinc-100 bg-[#F9FAFB] p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-zinc-900">Active Plan</h3>
                                        <Button variant="outline" className="rounded-full px-4 text-xs h-8 border-zinc-200">Manage plan</Button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-zinc-100">
                                            <p className="text-xs text-zinc-400 mb-1">Monthly tasks</p>
                                            <p className="text-lg font-bold">10 / 10</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-zinc-100">
                                            <p className="text-xs text-zinc-400 mb-1">Current status</p>
                                            <p className="text-lg font-bold text-emerald-600">Active</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-zinc-100">
                                            <p className="text-xs text-zinc-400 mb-1">Next reset</p>
                                            <p className="text-lg font-bold">In 24h</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-4">Billing History</h3>
                                    <div className="rounded-2xl border border-zinc-100 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-[#F9FAFB] border-b border-zinc-100 text-zinc-500">
                                                <tr>
                                                    <th className="px-6 py-4 text-left font-semibold">Due date</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Description</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Invoice total</th>
                                                    <th className="px-6 py-4 text-right font-semibold">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-50">
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 italic">
                                                        No billing data available yet.
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-800">Language</label>
                                        <div className="relative">
                                            <Button variant="outline" className="w-full justify-between items-center rounded-xl h-12 border-zinc-100">
                                                <span>English</span>
                                                <ChevronRight size={14} className="rotate-90 text-zinc-300" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-800">Currency</label>
                                        <div className="relative">
                                            <Button variant="outline" className="w-full justify-between items-center rounded-xl h-12 border-zinc-100">
                                                <span>USD - US Dollar</span>
                                                <ChevronRight size={14} className="rotate-90 text-zinc-300" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-zinc-800">Accounts authorization</h3>
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Inquiry Accounts</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl border border-zinc-100 bg-[#F9FAFB] flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-white border border-zinc-100 rounded-lg flex items-center justify-center">
                                                        <Mail size={16} className="text-red-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">Gmail</p>
                                                        <p className="text-xs text-zinc-400">@Gmail</p>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-4 bg-zinc-200 rounded-full relative">
                                                    <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                                                Only use read authorization, aimed at communicate with global suppliers.
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-2xl border border-zinc-100 bg-[#F9FAFB] flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-white border border-zinc-100 rounded-lg flex items-center justify-center">
                                                        <Globe size={16} className="text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">Alibaba.com</p>
                                                        <p className="text-xs text-zinc-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                                                Only use write and read authorization, aimed at communicate with global suppliers.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-zinc-800">Notification emails</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold">Communication Email Alerts</p>
                                                <p className="text-xs text-zinc-400">Receive email alerts for unread messages from merchants</p>
                                            </div>
                                            <div className="w-10 h-5 bg-zinc-900 rounded-full relative">
                                                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold">Recommendations</p>
                                                <p className="text-xs text-zinc-400">Receive emails with recommended products, topics, deals, and service offerings tailored to your interests.</p>
                                            </div>
                                            <div className="w-10 h-5 bg-zinc-900 rounded-full relative">
                                                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "personalization" && (
                            <div className="space-y-6">
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    Share details about your role, goals, or style — Retails Store will use them to make every future response more relevant and tailored to you.
                                </p>
                                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 space-y-2">
                                    <p className="text-xs font-bold text-emerald-800">Examples:</p>
                                    <ul className="text-xs text-emerald-700 space-y-1 ml-4 list-disc">
                                        <li>Role: "I am a Danish e-commerce manager focusing on high-end kitchenware."</li>
                                        <li>Style: "Always start with key takeaways. For product designs, propose 3 concepts."</li>
                                    </ul>
                                </div>
                                <textarea
                                    placeholder="e.g., I prefer concise, data-driven reports that start with the main conclusion."
                                    className="w-full h-40 p-6 rounded-2xl border border-zinc-100 bg-[#F9FAFB] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                        )}

                        {activeTab === "skills" && (
                            <div className="space-y-6">
                                <p className="text-sm text-zinc-400">Equip Retails Store with expert-level skills to handle complex tasks</p>

                                <div className="flex items-center justify-between border-b border-zinc-50 pb-2">
                                    <div className="flex items-center gap-6">
                                        <button className="text-sm font-bold border-b-2 border-black pb-2">My skills</button>
                                        <button className="text-sm text-zinc-400 pb-2">Skill hub</button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button variant="outline" className="rounded-full px-4 h-9 text-xs border-zinc-100 bg-[#F9FAFB]">
                                        All types <ChevronRight size={12} className="rotate-90 ml-2" />
                                    </Button>
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={14} />
                                        <input
                                            placeholder="Search skill"
                                            className="w-full bg-[#F9FAFB] border border-zinc-100 rounded-full h-9 pl-10 text-xs focus:outline-none"
                                        />
                                    </div>
                                    <Button className="bg-black hover:bg-zinc-800 text-white rounded-full px-4 h-9 text-xs font-bold flex items-center gap-1.5">
                                        <Plus size={14} /> Add
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: "product-designer", title: "ai-product-designer", desc: "Go from idea to real product concepts in minutes. Get three distinct, market-informed..." },
                                        { id: "market-insight", title: "market-insight-product-selecti...", desc: "Identify winning products using real-time trends and customer feedback. Analyze..." },
                                        { id: "jungle-scout", title: "jungle-scout-deep-dive-analyzer", desc: "Perform end-to-end product feasibility analysis using real-time Jungle Scout API data across 8..." },
                                        { id: "tech-pack", title: "tech-pack-generation", desc: "Transform your product images into production-ready technical documents. This..." }
                                    ].map(skill => (
                                        <div key={skill.id} className="p-5 rounded-2xl border border-zinc-100 bg-[#F9FAFB] hover:border-zinc-200 transition-colors space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-white border border-zinc-100 rounded-xl flex items-center justify-center">
                                                        <Zap size={18} className="text-zinc-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900">{skill.title}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                                            <span className="flex items-center gap-1"><span className="text-emerald-500 text-[8px]">●</span> Official</span>
                                                            <span>•</span>
                                                            <span>Mar 26, 2026</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-zinc-400">Auto</span>
                                                    <div className="w-8 h-4 bg-emerald-500 rounded-full relative">
                                                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                                                {skill.desc}
                                            </p>
                                            <div className="flex items-center justify-between pt-2">
                                                <Button variant="outline" className="rounded-full px-4 h-8 text-[10px] font-bold border-zinc-200 bg-white">
                                                    Try it out
                                                </Button>
                                                <button className="text-zinc-300 hover:text-zinc-600">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "data_sources" && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-zinc-900">Knowledge Base</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">
                                        Import web pages directly into Retails Store's vector database. This allows the AI to search and reference specific data from these sources when answering your questions.
                                    </p>
                                </div>
                                <div className="space-y-4 bg-[#F9FAFB] rounded-2xl border border-zinc-100 p-4">
                                    <div className="flex flex-col gap-2 border-b border-zinc-200/50 pb-4">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                            Admin Authorization
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Enter admin password to unlock data sources"
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                            className="w-full bg-white border border-zinc-200 rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                    <IngestionUI
                                        onAuthCheck={() => {
                                            if (adminPassword !== "admin123") {
                                                toast.error("Unauthorized: Invalid admin password");
                                                return false;
                                            }
                                            return true;
                                        }}
                                    />
                                </div>
                                <div className="pt-4 border-t border-zinc-100">
                                    <h4 className="text-sm font-bold text-zinc-900 mb-2">Memory Management</h4>
                                    <p className="text-xs text-zinc-400 mb-4">
                                        Clear all cached search results and vector data. This will reset the AI's learned product knowledge.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-4 text-xs font-bold"
                                        onClick={async () => {
                                            if (adminPassword !== "admin123") {
                                                toast.error("Unauthorized: Invalid admin password");
                                                return;
                                            }
                                            try {
                                                const response = await fetch("http://localhost:8000/clear", { method: "POST" });
                                                if (response.ok) {
                                                    toast.success("Memory cleared successfully");
                                                } else {
                                                    toast.error("Failed to clear memory");
                                                }
                                            } catch (error) {
                                                toast.error("Could not connect to the backend");
                                            }
                                        }}
                                    >
                                        Clear Search Memory
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === "contact" && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <HeadphonesIcon size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-zinc-900">How can we help?</h3>
                                    <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                                        Our team is here to support your sourcing journey. Choose a way to connect below.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 w-full max-w-sm gap-3">
                                    <Button variant="outline" className="h-14 rounded-2xl border-zinc-100 justify-start px-6 gap-4">
                                        <Mail className="text-zinc-400" />
                                        <div className="text-left">
                                            <p className="text-sm font-bold">Email support</p>
                                            <p className="text-xs text-zinc-400">Response within 24 hours</p>
                                        </div>
                                    </Button>
                                    <Button variant="outline" className="h-14 rounded-2xl border-zinc-100 justify-start px-6 gap-4">
                                        <MessageSquare className="text-zinc-400" />
                                        <div className="text-left">
                                            <p className="text-sm font-bold">Discord community</p>
                                            <p className="text-xs text-zinc-400">Real-time help from users</p>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
