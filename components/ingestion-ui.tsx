"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, Trash2, Info } from "lucide-react";

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

        // Use the new tracked batch endpoint for deep crawls
        const endpoint = isDeep ? "/api/admin/crawl/batch" : "/api/crawl";

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls, isDeep }),
            });

            const data = await response.json();

            if (response.ok) {
                const count = urls.length;
                toast.success(
                    data.message || `Ingestion started for ${count} URL${count > 1 ? "s" : ""}`
                );
                setProgress(`✅ ${count} URL${count > 1 ? "s" : ""} queued successfully`);
                if (!isDeep) setRawInput("");

                // Refresh batches list if it was a tracked crawl
                if (isDeep) fetchBatches();
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

    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
    const [batchDetailsMap, setBatchDetailsMap] = useState<Record<string, any>>({});
    const [isFetchingBatches, setIsFetchingBatches] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchBatches = useCallback(async () => {
        setIsFetchingBatches(true);
        try {
            const res = await fetch(`/api/admin/crawl?t=${Date.now()}`);
            const data = await res.json();
            if (data.batches) setBatches(data.batches);
        } catch (e) {
            console.error("Failed to fetch batches", e);
        } finally {
            setIsFetchingBatches(false);
        }
    }, []);

    const fetchBatchDetails = async (batchId: string) => {
        if (selectedBatch === batchId) {
            setSelectedBatch(null);
            return;
        }

        setSelectedBatch(batchId);
        // Only fetch if not already cached
        if (batchDetailsMap[batchId]) return;

        setIsFetchingDetails(batchId);
        try {
            const res = await fetch(`/api/admin/crawl/${batchId}?t=${Date.now()}`);
            const data = await res.json();
            setBatchDetailsMap(prev => ({ ...prev, [batchId]: data }));
        } catch (e) {
            console.error("Failed to fetch batch details", e);
        } finally {
            setIsFetchingDetails(null);
        }
    };

    const handleDeleteBatch = (e: React.MouseEvent, batchId: string) => {
        e.stopPropagation();
        setConfirmDeleteId(batchId);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/crawl/${confirmDeleteId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Batch deleted successfully");
                setBatches(prev => prev.filter(b => b.batch_id !== confirmDeleteId));
                setBatchDetailsMap(prev => { const m = { ...prev }; delete m[confirmDeleteId!]; return m; });
                if (selectedBatch === confirmDeleteId) setSelectedBatch(null);
            } else {
                toast.error("Failed to delete batch");
            }
        } catch (err) {
            console.error("Delete batch error:", err);
            toast.error("Could not delete batch");
        } finally {
            setIsDeleting(false);
            setConfirmDeleteId(null);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [fetchBatches]);

    const urlCount = parseUrls().length;

    return (
        <div className="flex flex-col gap-4">
            {/* Delete Confirmation Modal */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setConfirmDeleteId(null)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl border border-zinc-200 p-6 mx-4 w-full max-w-sm flex flex-col gap-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                <Trash2 size={18} className="text-red-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-semibold text-zinc-800">Delete Crawl Batch?</p>
                                <p className="text-xs text-zinc-500">
                                    This will permanently remove batch{" "}
                                    <span className="font-mono font-bold text-zinc-700">
                                        {confirmDeleteId.split("_").slice(1).join("_")}
                                    </span>{" "}
                                    and all its tracked URLs. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                            >
                                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                {isDeleting ? "Deleting…" : "Delete Batch"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

            {/* Recent Crawls Section */}
            <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Recent Manual Crawls
                    </label>
                    <button
                        onClick={fetchBatches}
                        className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors uppercase font-bold tracking-widest"
                    >
                        {isFetchingBatches ? "Updating..." : "Refresh"}
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {batches.length === 0 ? (
                        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-center">
                            <p className="text-[11px] text-zinc-400 italic">No recent crawl batches found</p>
                        </div>
                    ) : (
                        batches.map((batch) => (
                            <div key={batch.batch_id} className="flex flex-col gap-1">
                                <div
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left cursor-pointer",
                                        selectedBatch === batch.batch_id
                                            ? "bg-zinc-50 border-zinc-300"
                                            : "bg-white border-zinc-100 hover:border-zinc-200"
                                    )}
                                    onClick={() => fetchBatchDetails(batch.batch_id)}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-semibold text-zinc-700">
                                            Batch: {batch.batch_id.split('_').slice(1).join('_')}
                                        </span>
                                        <span className="text-[10px] text-zinc-400">
                                            {batch.total_urls} URL(s) • {new Date(parseFloat(batch.start_time) * 1000).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                            batch.status === "finished" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                                        )}>
                                            {batch.status}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={(e) => handleDeleteBatch(e, batch.batch_id)}
                                                className="p-1 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors text-zinc-300"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                            {selectedBatch === batch.batch_id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </div>
                                    </div>
                                </div>

                                {selectedBatch === batch.batch_id && (
                                    <div className="bg-zinc-50/50 border-x border-b border-zinc-100 rounded-b-xl -mt-2 p-3 pt-4 flex flex-col gap-2">
                                        {isFetchingDetails === batch.batch_id ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="animate-spin text-zinc-300" size={16} />
                                            </div>
                                        ) : batchDetailsMap[batch.batch_id] ? (
                                            <>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">URL Results</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setBatchDetailsMap(prev => { const m = { ...prev }; delete m[batch.batch_id]; return m; });
                                                            setIsFetchingDetails(batch.batch_id);
                                                            fetch(`/api/admin/crawl/${batch.batch_id}?t=${Date.now()}`)
                                                                .then(r => r.json())
                                                                .then(data => setBatchDetailsMap(prev => ({ ...prev, [batch.batch_id]: data })))
                                                                .finally(() => setIsFetchingDetails(null));
                                                        }}
                                                        className="text-[9px] text-zinc-400 hover:text-zinc-600 uppercase font-bold tracking-widest transition-colors"
                                                    >
                                                        ↻ Refresh
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mb-1">
                                                    <div className="bg-white p-2 rounded-lg border border-zinc-100 flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-green-600">SUCCESS</span>
                                                        <span className="text-xs font-bold">{batchDetailsMap[batch.batch_id].summary?.total_success ?? 0}</span>
                                                    </div>
                                                    <div className="bg-white p-2 rounded-lg border border-zinc-100 flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-red-600">FAILED</span>
                                                        <span className="text-xs font-bold">{batchDetailsMap[batch.batch_id].summary?.total_failed ?? 0}</span>
                                                    </div>
                                                </div>
                                                {batchDetailsMap[batch.batch_id].results?.length > 0 ? (
                                                    <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                                                        {batchDetailsMap[batch.batch_id].results.map((res: any, idx: number) => (
                                                            <div key={idx} className="flex items-start gap-2 bg-white/50 p-2 rounded-lg border border-zinc-50 group">
                                                                {res.status === "success" ? (
                                                                    <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={12} />
                                                                ) : res.status === "failed" ? (
                                                                    <XCircle className="text-red-500 mt-0.5 shrink-0" size={12} />
                                                                ) : (
                                                                    <Loader2 className="text-blue-500 animate-spin mt-0.5 shrink-0" size={12} />
                                                                )}
                                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                                    <span className="text-[11px] text-zinc-600 truncate font-mono">
                                                                        {res.url}
                                                                    </span>
                                                                    {res.reason && (
                                                                        <span className="text-[9px] text-red-400 font-medium">
                                                                            {res.reason}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-[10px] text-zinc-400 italic text-center py-2">No URL status data — crawl may have been queued while worker was offline.</p>
                                                )}
                                            </>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
