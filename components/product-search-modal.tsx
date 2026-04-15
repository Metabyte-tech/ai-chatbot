"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateUUID } from "@/lib/utils";

interface ProductSearchModalProps {
    children: React.ReactNode;
}

export function ProductSearchModal({ children }: ProductSearchModalProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const router = useRouter();

    const handleOpen = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleClose = () => {
        setOpen(false);
        setQuery("");
    };

    const handleSearch = () => {
        if (!query.trim()) return;
        // Encode the query and redirect to /search with it pre-filled as a query param
        // The /search page will pick it up and directly send the message
        const params = new URLSearchParams({ q: encodeURIComponent(query.trim()) });
        router.push(`/search?${params.toString()}`);
        handleClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
        if (e.key === "Escape") {
            handleClose();
        }
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <>
            {/* Trigger */}
            <div onClick={handleOpen} className="w-full cursor-pointer">
                {children}
            </div>

            {/* Modal Overlay */}
            {open && mounted && createPortal(
                <div className="relative z-[9999]">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Dialog */}
                    <div className="fixed left-1/2 top-1/3 z-[10000] -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl mx-auto px-4">
                        <div className="bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                                <div className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-zinc-500" />
                                    <h2 className="text-sm font-semibold text-zinc-800">Product search</h2>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Input area */}
                            <div className="px-5 pb-4">
                                <textarea
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="What are you looking for?"
                                    rows={6}
                                    className="w-full resize-none text-sm text-zinc-700 placeholder-zinc-400 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                                />

                                {/* Footer actions */}
                                <div className="flex items-center justify-between mt-3">
                                    <button
                                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                                        title="Upload image"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                    </button>

                                    <Button
                                        onClick={handleSearch}
                                        disabled={!query.trim()}
                                        className="h-8 px-5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Search className="h-3.5 w-3.5 mr-1.5" />
                                        Search
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
