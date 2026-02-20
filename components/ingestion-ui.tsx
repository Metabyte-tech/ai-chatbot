"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

            <div className="flex gap-2">
                <Button
                    onClick={() => handleIngest(false)}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-90 text-white border-0 transition-opacity"
                >
                    {isLoading ? "Ingesting..." : "Ingest Site"}
                </Button>
                <Button
                    onClick={() => handleIngest(true)}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white border-0 transition-opacity"
                >
                    {isLoading ? "Crawl..." : "Deep Ingest"}
                </Button>
            </div>
        </div>
    );
}
