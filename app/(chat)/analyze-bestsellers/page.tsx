"use client";

import { useRouter } from "next/navigation";
import { Star, CornerDownLeft, Settings2, ArrowUpRight } from "lucide-react";

const SAMPLES = [
    "Analyze top-selling yoga mats on Amazon this month.",
    "Analyze top-selling wireless earbuds and their key features.",
    "Analyze the top 5 best-selling travel backpacks and suggest improvements for security and convenience.",
];

export default function AnalyzeBestsellersPage() {
    const router = useRouter();

    const handleSample = (text: string) => {
        router.push(`/?query=${encodeURIComponent(text)}`);
    };

    return (
        <div className="flex flex-col h-dvh bg-background">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-3">
                <span className="text-sm font-medium text-zinc-700">Analyze bestsellers</span>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">My lists <ArrowUpRight className="h-3.5 w-3.5" /></button>
                    <button className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">Share <ArrowUpRight className="h-3.5 w-3.5" /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">
                <div className="flex justify-end mb-6">
                    <div className="rounded-2xl bg-emerald-500 text-white px-4 py-2.5 text-sm font-medium max-w-xs">
                        Analyze bestsellers
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    <p className="text-zinc-900 font-medium text-base">Got it !</p>
                    <p className="text-zinc-700 text-sm leading-relaxed">
                        Tell me a <strong>product category</strong> (e.g., earbuds)—I'll analyze bestsellers and break down what makes them successful.
                    </p>

                    <div className="flex flex-col gap-3 mt-2">
                        <p className="text-sm font-semibold text-zinc-800">Click a sample to start 👇</p>
                        <div className="flex flex-col gap-2">
                            {SAMPLES.map((sample) => (
                                <button
                                    key={sample}
                                    onClick={() => handleSample(sample)}
                                    className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 text-left text-sm text-zinc-700 transition-all hover:border-amber-200 hover:bg-amber-50/50 hover:shadow-sm group"
                                >
                                    <CornerDownLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-300 group-hover:text-amber-400 transition-colors" />
                                    {sample}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4 border-t border-zinc-100 pt-4">
                        <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <span className="text-rose-400">●</span>
                            Want more tailored results every time?{" "}
                            <span className="underline cursor-pointer hover:text-zinc-600">Add a long-term preference.</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-zinc-400">Rate this response to earn task credits</p>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-3 w-3 text-zinc-200 fill-zinc-200" />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-zinc-100 px-6 py-4 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-3">
                        <input
                            className="flex-1 bg-transparent text-sm text-zinc-700 placeholder-zinc-400 outline-none"
                            placeholder="Describe your needs..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                                    handleSample((e.target as HTMLInputElement).value.trim());
                                }
                            }}
                        />
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600">
                                <Settings2 className="h-3.5 w-3.5" /> Fast
                            </button>
                            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors">
                                <ArrowUpRight className="h-3.5 w-3.5 -rotate-45" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
