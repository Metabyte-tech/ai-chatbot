"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function IngestionUI() {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleIngest = async (isDeep: boolean) => {
        if (!url) {
            toast.error("Please enter a URL");
            return;
        }

        setIsLoading(true);
        // Pointing directly to the backend on port 8000
        const endpoint = isDeep ? "http://localhost:8000/crawl/deep" : "http://localhost:8000/crawl";

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url, isDeep }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Ingestion started successfully");
                if (!isDeep) setUrl("");
            } else {
                toast.error(data.detail || data.message || "Failed to start ingestion");
            }
        } catch (error) {
            console.error("Ingestion error:", error);
            toast.error("Could not connect to the ingestion server proxy");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Manual Web Ingestion
                </label>
                <Input
                    placeholder="https://example.com/page"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-white border-zinc-200 text-sm h-11 rounded-xl focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-black"
                    disabled={isLoading}
                />
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
                        {isLoading ? "Ingesting..." : "Ingest Site"}
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
                        {isLoading ? "Crawling..." : "Deep Ingest"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            </div>
        </div>
    );
}
