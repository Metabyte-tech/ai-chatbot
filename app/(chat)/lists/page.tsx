"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function MyListsPage() {
    const [activeTab, setActiveTab] = useState<"products" | "suppliers">("products");

    return (
        <div className="flex h-screen bg-white">
            {/* Page Content Container - Side-by-side Layout */}
            <div className="flex w-full max-w-[1400px] mx-auto p-8 gap-8 overflow-hidden">

                {/* Internal Navigation Sidebar */}
                <div className="w-64 flex flex-col gap-6 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 rounded bg-zinc-100">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                        </div>
                        <h1 className="text-base font-semibold text-zinc-900">My lists</h1>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-11 border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl font-medium"
                    >
                        <Plus size={18} />
                        Create new list
                    </Button>

                    <nav className="flex flex-col gap-1">
                        <button className="flex items-center w-full px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-900 font-medium text-sm text-left">
                            All
                        </button>
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 border border-zinc-100 rounded-3xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden relative">

                    {/* Header with Tabs */}
                    <div className="flex items-center justify-between px-8 py-4 border-b border-zinc-50">
                        <div className="flex gap-8">
                            <button
                                onClick={() => setActiveTab("products")}
                                className={cn(
                                    "py-2 text-sm font-semibold transition-all relative",
                                    activeTab === "products" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                Products
                                {activeTab === "products" && (
                                    <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-black rounded-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("suppliers")}
                                className={cn(
                                    "py-2 text-sm font-semibold transition-all relative",
                                    activeTab === "suppliers" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                Suppliers
                                {activeTab === "suppliers" && (
                                    <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-black rounded-full" />
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </Button>
                            <div className="mx-2 h-4 w-px bg-zinc-100" />
                            <Link href="/">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                                    <X size={20} />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Empty State Content */}
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="mb-8 opacity-20 transform scale-125">
                            {/* Custom SVG for the list skeleton/empty state icon */}
                            <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0" y="0" width="180" height="15" rx="7.5" fill="#E4E4E7" />
                                <rect x="0" y="21" width="180" height="15" rx="7.5" fill="#F4F4F5" />
                                <rect x="0" y="42" width="180" height="15" rx="7.5" fill="#E4E4E7" />
                                <rect x="0" y="63" width="180" height="15" rx="7.5" fill="#FAFAFA" />
                                <rect x="0" y="84" width="180" height="15" rx="7.5" fill="#E4E4E7" />
                                <rect x="0" y="105" width="180" height="15" rx="7.5" fill="#F4F4F5" />
                                {/* Cyan highlighting to simulate Retails Store style */}
                                <rect x="20" y="21" width="140" height="15" rx="7.5" fill="#00D49C" fillOpacity="0.1" />
                                <rect x="20" y="63" width="140" height="15" rx="7.5" fill="#00D49C" fillOpacity="0.1" />
                            </svg>
                        </div>

                        <h2 className="text-base font-semibold text-zinc-900 mb-6 max-w-sm">
                            You haven't add any item to the list. Please start sourcing with Retails Store
                        </h2>

                        <Link href="/">
                            <Button className="bg-[#18181B] hover:bg-black text-white px-8 py-6 h-auto rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105">
                                Start sourcing
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
