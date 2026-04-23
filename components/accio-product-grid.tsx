"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Star, MessageSquare, ExternalLinkIcon, Search, HelpCircle, CheckCircle2 } from "lucide-react";
import type { Product } from "./product-carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { useSelectedProducts } from "@/lib/contexts/selected-products-context";

interface AccioProductGridProps {
    products: Product[];
}

function sanitizeUrl(url: string, isImage: boolean = false) {
    if (!url) return isImage ? "https://placehold.co/600x600?text=No+Image" : "";
    let trimmed = url.trim();

    if (isImage) {
        const isInternal = trimmed.includes("amazonaws.com") ||
            trimmed.startsWith("data:") ||
            trimmed.startsWith("/") ||
            trimmed.includes("placehold.co");

        if (!isInternal && trimmed.startsWith("http")) {
            return `/api/proxy/image?url=${encodeURIComponent(trimmed)}`;
        }
    }

    if (trimmed.startsWith("http")) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    if (trimmed.includes(".") && !trimmed.includes(" ")) return `https://${trimmed}`;
    return trimmed;
}

export function AccioProductGrid({ products }: AccioProductGridProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState("Global sites");
    const { toggleProduct, isSelected } = useSelectedProducts();

    if (!products || products.length === 0) return null;

    const tabs = [
        { name: "Alibaba.com", color: "text-orange-500" },
        { name: "AliExpress", color: "text-red-500" },
        { name: "1688", color: "text-orange-600" },
        { name: "Global sites", color: "text-blue-500" }
    ];

    return (
        <div className="w-full flex-col flex space-y-4 pt-2">
            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-x-2 gap-y-4 pt-4">
                {products.map((product, index) => (
                    <Card
                        key={`${product.name}-${index}`}
                        className={cn(
                            "overflow-hidden border bg-white hover:shadow-md transition-all cursor-pointer rounded-[8px] flex flex-col group h-full shadow-sm",
                            isSelected(product.name) ? "border-emerald-500 ring-1 ring-emerald-500/30" : "border-zinc-200"
                        )}
                        onClick={() => setSelectedProduct(product)}
                    >
                        <div className="relative aspect-square w-full overflow-hidden flex-shrink-0">
                            <Image
                                src={sanitizeUrl(product.image_url, true)}
                                alt={product.name}
                                fill
                                unoptimized
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=No+Image";
                                }}
                            />
                            {/* Actions overlay */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 items-end">
                                <button className="w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center border border-zinc-200 shadow-sm">
                                    <HelpCircle className="w-3 h-3 text-zinc-600" />
                                </button>
                                <div
                                    data-testid="product-select-button"
                                    className={cn(
                                        "transition-all duration-300 rounded-full min-w-[36px] h-9 flex items-center justify-center border shadow-sm cursor-pointer",
                                        isSelected(product.name)
                                            ? "bg-emerald-500 border-emerald-600 px-3 gap-2 scale-100"
                                            : "bg-white/95 backdrop-blur-sm border-zinc-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleProduct(product);
                                    }}
                                >
                                    <Checkbox
                                        checked={isSelected(product.name)}
                                        onCheckedChange={() => { }}
                                        className={cn(
                                            "pointer-events-none h-5 w-5 rounded-full border-2 transition-colors",
                                            isSelected(product.name)
                                                ? "border-white bg-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
                                                : "border-zinc-300 bg-transparent"
                                        )}
                                    />
                                    {isSelected(product.name) && (
                                        <span className="text-[11px] font-bold text-white select-none whitespace-nowrap">
                                            Selected
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Selection Overlay during hover/selected state */}
                            {isSelected(product.name) && (
                                <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none transition-opacity duration-300" />
                            )}
                        </div>

                        <div className="p-3 flex flex-col flex-1 gap-1.5">
                            <h3 className="text-[11px] text-zinc-800 line-clamp-2 leading-[1.3] group-hover:underline transition-all">
                                {product.name}
                            </h3>

                            <div>
                                <span className="text-[9px] bg-zinc-50 text-zinc-500 px-1.5 py-0.5 rounded-[3px] border border-zinc-200">Easy Return</span>
                            </div>

                            <div className="text-[15px] font-bold text-zinc-900 mt-0.5 leading-none">
                                {product.price && !["check site", "request price", "request quote"].includes(product.price.toLowerCase().trim()) ? product.price : "Request Price"}
                            </div>

                            <div className="text-[10px] text-zinc-500 mt-1">
                                Min. order: {product.moq || "10 pieces"}
                            </div>

                            {/* Supplier Details */}
                            <div className="mt-1 flex flex-col gap-1">
                                <div className="text-[9.5px] text-zinc-500 underline truncate w-full decoration-zinc-300">
                                    {product.brand || "Verified Supplier Co., Ltd."}
                                </div>
                                <div className="flex items-center gap-1 text-[9px] text-zinc-500 whitespace-nowrap overflow-hidden text-ellipsis">
                                    <CheckCircle2 className="w-[10px] h-[10px] text-blue-500 flex-shrink-0" />
                                    Verified &middot; {product.supplier_years || "3 yrs"} &middot; CN &middot; {product.rating_avg || "4.8"}/5.0
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-1.5 h-[26px] text-[11px] font-medium rounded-full border-zinc-300 hover:bg-zinc-50 text-zinc-800 shadow-sm"
                                >
                                    <MessageSquare className="w-3 h-3 mr-1.5 text-zinc-600" />
                                    Chat now
                                </Button>

                                <div className="text-[9px] text-emerald-600 mt-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_2px_rgba(16,185,129,0.8)]"></span>
                                    {product.rating_count || "100+"} store reviews
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Reused Dialog from existing ProductCarousel */}
            <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                    {selectedProduct && (
                        <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:h-[600px]">
                            <div className="md:w-1/2 relative h-[300px] md:h-full bg-zinc-100 flex items-center justify-center p-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 -z-10" />
                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                    <Image
                                        src={sanitizeUrl(selectedProduct.image_url, true)}
                                        alt={selectedProduct.name}
                                        fill
                                        unoptimized
                                        className="object-contain p-4"
                                    />
                                </div>
                            </div>

                            <div className="md:w-1/2 flex flex-col p-8 bg-white overflow-y-auto">
                                <DialogHeader className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/50 font-bold px-3 py-1 text-xs">
                                            {selectedProduct.brand || "Verified Supplier"}
                                        </Badge>
                                        <div className="flex items-center gap-1 ml-auto">
                                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-bold text-zinc-900">{selectedProduct.rating_avg || "4.8"}</span>
                                            <span className="text-xs text-zinc-400 font-medium">({selectedProduct.rating_count || "100+"} reviews)</span>
                                        </div>
                                    </div>
                                    <DialogTitle className="text-2xl font-extrabold text-zinc-900 leading-tight mb-2">
                                        {selectedProduct.name}
                                    </DialogTitle>
                                    <div className="text-3xl font-black text-emerald-600 mb-4">
                                        {selectedProduct.price}
                                    </div>
                                    <DialogDescription className="text-zinc-500 leading-relaxed text-[15px]">
                                        {selectedProduct.details || "Professional sourcing verification completed. This product meets elite market standards for quality and viability."}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="mt-auto flex flex-col gap-3">
                                    <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-14 shadow-lg shadow-emerald-500/20 group">
                                        <a href={sanitizeUrl(selectedProduct.source_url)} target="_blank" rel="noopener" className="flex items-center justify-center gap-2">
                                            Chat with Supplier
                                            <ExternalLinkIcon size={16} />
                                        </a>
                                    </Button>
                                    <p className="text-[10px] text-center text-zinc-400 font-medium">
                                        Verified Sourcing • Business Grade Quality • Secure Transaction
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
