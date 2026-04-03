"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InquiriesPage() {
    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden p-8">
            <div className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto border border-zinc-100 rounded-3xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-50">
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900">Inquiries</h1>

                    <div className="flex items-center gap-2 text-zinc-400">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-zinc-900">
                                <X size={20} />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="mb-8 opacity-20 transform scale-125">
                        {/* Custom SVG for the paper/inquiry empty state icon matching Retails Store */}
                        <svg width="120" height="150" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 0H80L110 30V140C110 145.523 105.523 150 100 150H10C4.47715 150 0 145.523 0 140V10C0 4.47715 4.47715 0 10 0Z" fill="#E4E4E7" />
                            <path d="M80 0V20C80 25.5228 84.4772 30 90 30H110L80 0Z" fill="#D4D4D8" />
                            <rect x="20" y="50" width="80" height="8" rx="4" fill="#F4F4F5" />
                            <rect x="20" y="75" width="80" height="8" rx="4" fill="#F4F4F5" />
                            <rect x="20" y="100" width="80" height="8" rx="4" fill="#F4F4F5" />
                            <rect x="20" y="125" width="40" height="8" rx="4" fill="#F4F4F5" />
                        </svg>
                    </div>

                    <div className="max-w-md space-y-4">
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                            You haven't sent any inquiries yet
                        </h2>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto">
                            Send requirements to multiple suppliers at once, and let AI handle the follow-ups for you.
                        </p>
                    </div>

                    <Link href="/" className="mt-10">
                        <Button className="bg-[#18181B] hover:bg-black text-white px-8 py-6 h-auto rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105">
                            Start sourcing
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
