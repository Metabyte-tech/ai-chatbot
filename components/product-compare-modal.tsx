"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { X, Trash2, ExternalLink, Star, Award, TrendingDown, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@/components/product-carousel";
import { useSelectedProducts } from "@/lib/contexts/selected-products-context";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ProductCompareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function sanitizeUrl(url: string, isImage = false) {
    if (!url) return isImage ? "https://placehold.co/400x400?text=No+Image" : "";
    const t = url.trim();
    if (isImage) {
        const isInternal = t.includes("amazonaws.com") || t.startsWith("data:") || t.startsWith("/") || t.includes("placehold.co");
        if (!isInternal && t.startsWith("http")) return `/api/proxy/image?url=${encodeURIComponent(t)}`;
    }
    if (t.startsWith("http")) return t;
    if (t.startsWith("//")) return `https:${t}`;
    return t;
}

const STORE_COLORS: Record<string, string> = {
    "amazon": "from-orange-500 to-amber-400",
    "ebay": "from-blue-600 to-blue-400",
    "flipkart": "from-blue-700 to-indigo-500",
    "walmart": "from-blue-500 to-cyan-400",
};

function getStoreColor(source: string) {
    const key = (source || "").toLowerCase();
    for (const [k, v] of Object.entries(STORE_COLORS)) {
        if (key.includes(k)) return v;
    }
    return "from-emerald-500 to-teal-400";
}

function StarRating({ value }: { value: string | number | null | undefined }) {
    const num = parseFloat(String(value || "0"));
    if (!num) return <span className="text-zinc-400 text-xs">N/A</span>;
    const stars = Math.round(num);
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                        key={i}
                        size={13}
                        className={i <= stars ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}
                    />
                ))}
            </div>
            <span className="text-xs font-bold text-zinc-800">{num.toFixed(1)}</span>
        </div>
    );
}

function parsePrice(p: any): number {
    if (!p || typeof p !== "string") return Infinity;
    const m = p.match(/[\d,.]+/);
    if (!m) return Infinity;
    return parseFloat(m[0].replace(/,/g, ""));
}

/** Makes URLs in text clickable */
function linkifyText(text: string): React.ReactNode {
    const urlRegex = /(https?:\/\/[^\s,]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
        urlRegex.test(part) ? (
            <a key={i} href={part} target="_blank" rel="noopener" className="text-emerald-600 underline hover:text-emerald-700 break-all">
                {part}
            </a>
        ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
        )
    );
}

/** Returns the display price or a friendly fallback */
function displayPrice(price: any): string {
    const p = (price || "").toString().trim().toLowerCase();
    if (p && p !== "check site" && p !== "request price" && p !== "request quote") {
        return (price as string).trim();
    }
    return "Request Price";
}

export function ProductCompareModal({ open, onOpenChange }: ProductCompareModalProps) {
    const { selectedProducts, toggleProduct } = useSelectedProducts();
    const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});

    const prices = selectedProducts.map((p) => parsePrice(p.price));
    const minPrice = Math.min(...prices.filter((x) => isFinite(x)));
    const maxRating = Math.max(...selectedProducts.map((p) => parseFloat(String(p.rating_avg || "0"))));

    const attrs = [
        { label: "Price", key: "price" },
        { label: "Brand", key: "brand" },
        { label: "Platform", key: "source" },
        { label: "Rating", key: "rating_avg" },
        { label: "Reviews", key: "rating_count" },
        { label: "Details", key: "details" },
    ];

    const toggleDetails = (idx: number) => {
        setExpandedDetails((prev) => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-gradient-to-br from-zinc-50 to-white">
                {/* Header */}
                <DialogHeader className="shrink-0 px-7 pt-6 pb-4 border-b border-zinc-100 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-lg font-extrabold text-zinc-900 tracking-tight">
                                Compare Products
                            </DialogTitle>
                            <p className="text-xs text-zinc-400 mt-0.5">{selectedProducts.length} products selected for comparison</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[11px] font-bold px-3 py-1">
                                <Award size={12} className="mr-1" /> AI Comparison
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-x-auto overflow-y-auto">
                    <div className="min-w-max p-6 space-y-8">

                        {/* Product Cards Row */}
                        <div className="flex gap-6 pl-[200px]">
                            {selectedProducts.map((product, idx) => {
                                const price = prices[idx];
                                const isCheapest = isFinite(price) && price === minPrice && selectedProducts.length > 1;
                                const isTopRated = parseFloat(String(product.rating_avg || 0)) === maxRating && maxRating > 0 && selectedProducts.length > 1;
                                const storeGrad = getStoreColor(product.source || "");

                                return (
                                    <div key={idx} className="w-[240px] flex flex-col rounded-2xl overflow-hidden shadow-md border border-zinc-100 bg-white group relative">
                                        {/* Badges */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                            {isCheapest && (
                                                <Badge className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                                    <TrendingDown size={10} className="mr-1" /> Best Price
                                                </Badge>
                                            )}
                                            {isTopRated && (
                                                <Badge className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                                    <Star size={10} className="mr-1 fill-white" /> Top Rated
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Product reference letter */}
                                        <div className="absolute top-2 right-2 z-10">
                                            <span className="bg-zinc-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center justify-center">
                                                Option {String.fromCharCode(65 + idx)}
                                            </span>
                                        </div>

                                        {/* Store gradient header */}
                                        <div className={`h-1.5 w-full bg-gradient-to-r ${storeGrad}`} />

                                        {/* Image */}
                                        <div className="relative aspect-square w-full bg-zinc-50 border-b border-zinc-100 p-4">
                                            <Image
                                                src={sanitizeUrl(product.image_url, true)}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-2"
                                                unoptimized
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=No+Image";
                                                }}
                                            />
                                        </div>

                                        {/* Name + actions */}
                                        <div className="p-3 flex flex-col gap-2 flex-1">
                                            <p className="text-[12px] font-semibold text-zinc-800 line-clamp-2 leading-tight">{product.name}</p>
                                            <div className="text-xl font-black text-emerald-600 leading-none">{displayPrice(product.price)}</div>

                                            <div className="mt-auto flex gap-2 pt-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="flex-1 h-8 text-[11px] font-bold rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white"
                                                >
                                                    <a href={sanitizeUrl(product.source_url)} target="_blank" rel="noopener">
                                                        <ExternalLink size={12} className="mr-1" /> View
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-xl border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 shrink-0"
                                                    onClick={() => toggleProduct(product)}
                                                >
                                                    <Trash2 size={13} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Comparison table */}
                        <div className="rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
                            {/* Section header */}
                            <div className="bg-gradient-to-r from-zinc-900 to-zinc-700 px-6 py-3">
                                <span className="text-white text-xs font-bold uppercase tracking-widest">Specification Comparison</span>
                            </div>

                            <div className="divide-y divide-zinc-100">
                                {/* Product Reference Header Row */}
                                <div className="flex bg-zinc-100/50 border-b border-zinc-200 sticky top-0 z-10">
                                    <div className="w-[200px] shrink-0 flex items-center px-6 py-2.5 border-r border-zinc-200 bg-zinc-100/80">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Attribute</span>
                                    </div>
                                    {selectedProducts.map((product, idx) => (
                                        <div key={idx} className="w-[240px] flex items-center gap-2 px-5 py-2.5 border-r border-zinc-200 last:border-r-0 bg-zinc-100/80">
                                            <span className="bg-zinc-800 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="text-[11px] font-bold text-zinc-800 line-clamp-1">{product.name}</span>
                                        </div>
                                    ))}
                                </div>

                                {attrs.map((attr, attrIdx) => (
                                    <div
                                        key={attr.key}
                                        className={`flex ${attr.key === "details" ? "min-h-[52px]" : "min-h-[52px]"} ${attrIdx % 2 === 0 ? "bg-white" : "bg-zinc-50/60"}`}
                                    >
                                        {/* Label */}
                                        <div className="w-[200px] shrink-0 flex items-center px-6 py-3 border-r border-zinc-100">
                                            {attr.key === "details" ? (
                                                <button
                                                    onClick={() => {
                                                        // Toggle all details at once
                                                        const allExpanded = selectedProducts.every((_, i) => expandedDetails[i]);
                                                        const next: Record<number, boolean> = {};
                                                        selectedProducts.forEach((_, i) => { next[i] = !allExpanded; });
                                                        setExpandedDetails(next);
                                                    }}
                                                    className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-wide hover:text-emerald-700 transition-colors cursor-pointer"
                                                >
                                                    {attr.label}
                                                    {selectedProducts.every((_, i) => expandedDetails[i])
                                                        ? <ChevronUp size={12} />
                                                        : <ChevronDown size={12} />
                                                    }
                                                </button>
                                            ) : (
                                                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">{attr.label}</span>
                                            )}
                                        </div>

                                        {/* Values */}
                                        {selectedProducts.map((product, idx) => {
                                            const price = prices[idx];
                                            const isBestPrice = attr.key === "price" && isFinite(price) && price === minPrice && selectedProducts.length > 1;
                                            const isTopRating = attr.key === "rating_avg" && parseFloat(String(product.rating_avg || 0)) === maxRating && maxRating > 0 && selectedProducts.length > 1;

                                            let value: React.ReactNode = "-";

                                            if (attr.key === "rating_avg") {
                                                value = <StarRating value={product.rating_avg} />;
                                            } else if (attr.key === "rating_count") {
                                                const count = product.rating_count;
                                                value = count ? (
                                                    <span className="text-xs text-zinc-600">{count} reviews</span>
                                                ) : <span className="text-zinc-400 text-xs font-medium">N/A</span>;
                                            } else if (attr.key === "details") {
                                                const details = (product as any).details || "—";
                                                const isExpanded = expandedDetails[idx];
                                                value = (
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <button
                                                            onClick={() => toggleDetails(idx)}
                                                            className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold hover:text-emerald-700 transition-colors cursor-pointer text-left"
                                                        >
                                                            {isExpanded ? "Hide details" : "Show details"}
                                                            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                                        </button>
                                                        {isExpanded && (
                                                            <span className="text-[11px] text-zinc-500 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                                                                {linkifyText(details)}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            } else if (attr.key === "brand") {
                                                value = (
                                                    <div className="flex items-center gap-1.5">
                                                        <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                                                        <span className="text-xs font-semibold text-zinc-800">
                                                            {(product as any).brand || "—"}
                                                        </span>
                                                    </div>
                                                );
                                            } else if (attr.key === "source") {
                                                const storeGrad = getStoreColor(product.source || "");
                                                value = (
                                                    <Badge className={`bg-gradient-to-r ${storeGrad} text-white text-[10px] font-bold px-2 py-0.5 border-none`}>
                                                        {product.source || "Web"}
                                                    </Badge>
                                                );
                                            } else if (attr.key === "price") {
                                                const priceText = displayPrice(product.price);
                                                value = (
                                                    <span className={`text-sm font-extrabold ${isBestPrice ? "text-emerald-600" : "text-zinc-800"}`}>
                                                        {priceText}
                                                        {isBestPrice && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 font-bold">Cheapest</span>}
                                                    </span>
                                                );
                                            } else {
                                                const raw = (product as any)[attr.key];
                                                value = raw ? (
                                                    <span className="text-xs text-zinc-700">{raw}</span>
                                                ) : <span className="text-zinc-300 text-xs">—</span>;
                                            }

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`w-[240px] flex items-center px-5 py-3 border-r border-zinc-100 last:border-r-0 ${isBestPrice || isTopRating ? "bg-emerald-50/30" : ""}`}
                                                >
                                                    {value}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
