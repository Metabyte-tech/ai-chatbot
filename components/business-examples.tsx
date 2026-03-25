"use client";

import { Button } from "./ui/button";
import { Briefcase, Image as ImageIcon, Search, BarChart, TrendingUp, Filter } from "lucide-react";
import { ArrowUpIcon } from "./icons";
import { toast } from "sonner";

const EXAMPLES = [
    {
        title: "Global product search",
        description: "Search for products across global platforms like Amazon, Alibaba, and more.",
        icon: <Search className="h-6 w-6 text-blue-500" />,
        tag: "Product Sourcing"
    },
    {
        title: "Design with AI",
        description: "Generate product designs and variations using advanced AI models.",
        icon: <ImageIcon className="h-6 w-6 text-purple-500" />,
        tag: "Creativity"
    },
    {
        title: "Analyze bestsellers",
        description: "Get insights into trending products and market gaps.",
        icon: <BarChart className="h-6 w-6 text-green-500" />,
        tag: "Market Analysis"
    },
    {
        title: "Multi-platform supplier search",
        description: "Find and compare suppliers from different regions and platforms.",
        icon: <Filter className="h-6 w-6 text-orange-500" />,
        tag: "Supply Chain"
    }
];

export function BusinessExamples({ onSolutionClick }: { onSolutionClick?: (solution: string) => void }) {
    return (
        <div className="mt-24 w-full max-w-6xl px-4 pb-24">
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Business Solutions</h2>
                    <Button variant="link" className="text-zinc-500 hover:text-foreground" onClick={() => toast.info("Please sign in to view all examples")}>View all examples</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {EXAMPLES.map((example) => (
                        <div
                            key={example.title}
                            onClick={() => onSolutionClick?.(example.title)}
                            className="group relative flex flex-col gap-4 rounded-3xl border border-zinc-200/50 bg-white/50 p-6 transition-all hover:bg-white hover:shadow-xl hover:border-zinc-300 cursor-pointer"
                        >
                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 transition-colors group-hover:bg-zinc-50">
                                {example.icon}
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{example.tag}</span>
                                <h3 className="font-semibold text-lg leading-tight">{example.title}</h3>
                                <p className="text-sm text-zinc-500 line-clamp-2">{example.description}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full px-4 h-8 text-xs bg-zinc-100 hover:bg-zinc-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSolutionClick?.(example.title);
                                    }}
                                >
                                    View Result
                                </Button>
                                <ArrowUpIcon className="h-4 w-4 rotate-90 text-zinc-300 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
