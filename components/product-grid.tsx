"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ExternalLinkIcon, MessageSquare, Star, ShoppingCart, CheckCircle2, MapPin } from "lucide-react";
import { type Product } from "./product-carousel";

interface ProductGridProps {
    products: Product[];
}

function sanitizeUrl(url: string, isImage: boolean = false) {
    if (!url) return isImage ? "https://placehold.co/600x600?text=No+Image" : "";
    let trimmed = url.trim();

    if (isImage) {
        // Don't proxy S3, data and local URLs
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

function ProductImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
    const [imgSrc, setImgSrc] = useState(src);
    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            unoptimized
            className={`object-cover ${className}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => {
                setImgSrc("https://placehold.co/600x600?text=No+Image");
            }}
        />
    );
}

export function ProductGrid({ products }: ProductGridProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    if (!products || products.length === 0) return null;

    return (
        <div className="w-full py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, index) => (
                    <Card
                        key={`${product.name}-${index}`}
                        className="group relative flex flex-col h-full bg-white border-zinc-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                    >
                        {/* Image Container */}
                        <div className="relative aspect-square w-full overflow-hidden bg-zinc-50 border-b border-zinc-100">
                            <ProductImage
                                src={sanitizeUrl(product.image_url, true)}
                                alt={product.name}
                                className="group-hover:scale-110 transition-transform duration-500"
                            />

                            {/* Badges Overlay */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                {product.is_verified && (
                                    <div className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                        Verified
                                    </div>
                                )}
                                {product.supplier_years && (
                                    <div className="bg-white/90 backdrop-blur-sm text-zinc-700 px-2 py-0.5 rounded-full text-[9px] font-bold border border-zinc-200/50 shadow-sm">
                                        {product.supplier_years}
                                    </div>
                                )}
                            </div>

                            {product.location && (
                                <div className="absolute bottom-2 left-2 z-10 bg-black/40 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[9px] font-semibold flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5" />
                                    {product.location}
                                </div>
                            )}
                        </div>

                        {/* Content Container */}
                        <div className="p-4 flex flex-col flex-1 gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest truncate">
                                    {product.brand}
                                </span>
                                <h3 className="font-bold text-[13px] line-clamp-2 leading-tight text-zinc-900 group-hover:text-emerald-700 transition-colors">
                                    {product.name}
                                </h3>
                            </div>

                            <div className="mt-auto flex flex-col gap-2">
                                <div className="flex items-baseline justify-between gap-2">
                                    <span className="text-base font-black text-zinc-900">
                                        {product.price || "Check Price"}
                                    </span>
                                    {product.moq && (
                                        <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">
                                            Min: <span className="text-zinc-700 font-bold">{product.moq}</span>
                                        </span>
                                    )}
                                </div>

                                {/* Action Buttons (only visible or prominent on hover) */}
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-lg text-[10px] font-bold border-zinc-200 hover:bg-zinc-50 hover:text-emerald-700 transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(sanitizeUrl(product.source_url), '_blank');
                                        }}
                                    >
                                        Source
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="h-8 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                                    >
                                        Chat now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Product Detail Dialog (Reusing existing logic) */}
            <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                    {selectedProduct && (
                        <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:h-[600px]">
                            {/* Left Image Section */}
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

                            {/* Right Content Section */}
                            <div className="md:w-1/2 flex flex-col p-8 bg-white overflow-y-auto">
                                <DialogHeader className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/50 font-bold px-3 py-1 text-xs">
                                            {selectedProduct.brand}
                                        </Badge>
                                        <div className="flex items-center gap-1 ml-auto">
                                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-bold text-zinc-900">{selectedProduct.rating_avg || "N/A"}</span>
                                            <span className="text-xs text-zinc-400 font-medium">({selectedProduct.rating_count || 0} reviews)</span>
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

                                {/* Action Buttons */}
                                <div className="mt-auto flex flex-col gap-3">
                                    <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-14 shadow-lg shadow-emerald-500/20 group">
                                        <a href={sanitizeUrl(selectedProduct.source_url)} target="_blank" rel="noopener" className="flex items-center justify-center gap-2">
                                            <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                                            Visit Supplier Page
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
