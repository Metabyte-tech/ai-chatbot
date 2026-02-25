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
        const endpoint = isDeep ? "/crawl/deep" : "/crawl";
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

        try {
            const response = await fetch(`${backendUrl}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
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
            toast.error("Could not connect to the ingestion server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 border-t border-border mt-2">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Manual Web Ingestion
                </label>
                <Input
                    placeholder="https://example.com/page"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-background/50 border-border focus:ring-primary"
                    disabled={isLoading}
                />
            </div>

            <div className="flex gap-3">
                <Button
                    onClick={() => handleIngest(false)}
                    disabled={isLoading}
                    className={cn(
                        "flex-1 relative h-10 rounded-xl font-semibold transition-all duration-300",
                        "bg-orange-500/10 text-orange-400 border border-orange-500/30",
                        "hover:bg-orange-500/20 hover:border-orange-500/50 hover:shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    <span className="relative z-10">
                        {isLoading ? "Ingesting..." : "Ingest Site"}
                    </span>
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button
                    onClick={() => handleIngest(true)}
                    disabled={isLoading}
                    className={cn(
                        "flex-1 relative h-10 rounded-xl font-semibold transition-all duration-300",
                        "bg-purple-500/10 text-purple-400 border border-purple-500/30",
                        "hover:bg-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    <span className="relative z-10">
                        {isLoading ? "Crawl..." : "Deep Ingest"}
                    </span>
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            </div>
        </div>
    );
}
