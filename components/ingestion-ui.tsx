"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface IngestionUIProps {
    onAuthCheck?: () => boolean;
}

export function IngestionUI({ onAuthCheck }: IngestionUIProps = {}) {
    const [rawInput, setRawInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<string | null>(null);

    const parseUrls = () =>
        rawInput
            .split("\n")
            .map((u) => u.trim())
            .filter((u) => u.startsWith("http"));

    const handleIngest = async (isDeep: boolean) => {
        if (onAuthCheck && !onAuthCheck()) return;

        const urls = parseUrls();

        if (urls.length === 0) {
            toast.error("Please enter at least one valid URL (starting with http/https)");
            return;
        }

        setIsLoading(true);
        setProgress(`Starting ingestion for ${urls.length} URL(s)…`);

        const endpoint = isDeep
            ? "http://localhost:8000/crawl/deep/batch"
            : "http://localhost:8000/crawl/batch";

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls }),
            });

            const data = await response.json();

            if (response.ok) {
                const count = urls.length;
                toast.success(
                    data.message || `Ingestion started for ${count} URL${count > 1 ? "s" : ""}`
                );
                setProgress(`✅ ${count} URL${count > 1 ? "s" : ""} queued successfully`);
                if (!isDeep) setRawInput("");
            } else {
                toast.error(data.detail || data.message || "Failed to start ingestion");
                setProgress(null);
            }
        } catch (error) {
            console.error("Ingestion error:", error);
            toast.error("Could not connect to the ingestion server");
            setProgress(null);
        } finally {
            setIsLoading(false);
        }
    };

    const urlCount = parseUrls().length;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Manual Web Ingestion
                    </label>
                    {urlCount > 0 && (
                        <span className="text-[10px] text-zinc-400">
                            {urlCount} URL{urlCount > 1 ? "s" : ""} detected
                        </span>
                    )}
                </div>
                <Textarea
                    placeholder={`Paste one URL per line:\nhttps://example.com/page1\nhttps://example.com/page2\nhttps://store.com/product`}
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    className="bg-white border-zinc-200 text-sm rounded-xl focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-black min-h-[120px] resize-none font-mono text-xs"
                    disabled={isLoading}
                />
                {progress && (
                    <p className="text-[11px] text-zinc-500">{progress}</p>
                )}
            </div>

            <div className="flex gap-3">
                <Button
                    onClick={() => handleIngest(false)}
                    disabled={isLoading}
                    className={cn(
                        "flex-1 relative h-11 rounded-xl text-sm font-bold transition-all duration-300",
                        "bg-orange-50 text-orange-600 border border-orange-200",
                        "hover:bg-orange-100/80 hover:border-orange-300",
                        "disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                    )}
                >
                    <span className="relative z-10 w-full text-center">
                        {isLoading ? "Ingesting…" : `Ingest Site${urlCount > 1 ? "s" : ""}`}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button
                    onClick={() => handleIngest(true)}
                    disabled={isLoading}
                    className={cn(
                        "flex-1 relative h-11 rounded-xl text-sm font-bold transition-all duration-300",
                        "bg-purple-50 text-purple-600 border border-purple-200",
                        "hover:bg-purple-100/80 hover:border-purple-300",
                        "disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                    )}
                >
                    <span className="relative z-10 w-full text-center">
                        {isLoading ? "Crawling…" : `Deep Ingest${urlCount > 1 ? "s" : ""}`}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            </div>
        </div>
    );
}
