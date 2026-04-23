"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, X, Image as ImageIcon, Loader2, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { cn, generateUUID } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AccioProductGrid } from "./accio-product-grid";
import type { Product } from "./product-carousel";

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
        const params = new URLSearchParams({
            q: query.trim(),
            mode: 'agent'
        });
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
                    <div className="fixed left-1/2 top-1/2 z-[10000] -translate-x-1/2 -translate-y-1/2 w-full max-w-xl mx-auto px-4">
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
                                    rows={5}
                                    className="w-full resize-none text-sm text-zinc-700 placeholder-zinc-400 bg-zinc-50/50 border border-[#00D49C]/30 rounded-xl px-4 py-3 outline-none focus:border-[#00D49C] transition-all"
                                />

                                {/* Footer actions */}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-1.5 p-1 hover:bg-zinc-100 rounded-md cursor-pointer transition-colors">
                                        <ImageIcon className="h-4 w-4 text-zinc-400" />
                                    </div>

                                    <Button
                                        onClick={handleSearch}
                                        disabled={!query.trim()}
                                        className="h-8 px-5 rounded-full bg-[#00D49C]/10 text-[#008F69] text-xs font-bold hover:bg-[#00D49C]/20 border border-[#00D49C]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Search className="h-3.5 w-3.5 mr-1.5 font-bold" />
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
