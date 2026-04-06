"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ExternalLinkIcon, MessageSquare, Star, ShoppingCart, Info } from "lucide-react";

export type Product = {
    name: string;
    brand: string;
    price: string;
    image_url: string;
    source_url: string;
    details: string;
    rating_avg?: string | number;
    rating_count?: string | number;
    reviews?: { user: string; comment: string; rating: number }[];
    moq?: string;
    supplier_years?: string;
    location?: string;
    is_verified?: boolean;
};

interface ProductCarouselProps {
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
    const [triedRaw, setTriedRaw] = useState(false);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            unoptimized
            className={`object-cover ${className}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => {
                if (imgSrc.includes('/api/proxy/image') && !triedRaw) {
                    try {
                        const urlParams = new URL(imgSrc, window.location.origin).searchParams;
                        const originalUrl = urlParams.get('url');
                        if (originalUrl) {
                            setTriedRaw(true);
                            setImgSrc(originalUrl);
                            return;
                        }
                    } catch (e) {
                        // ignore parsing error
                    }
                }
                setImgSrc("https://placehold.co/600x600?text=No+Image");
            }}
        />
    );
}

export function ProductCarousel({ products }: ProductCarouselProps) {
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        const handleImageFailure = (e: any) => {
            setFailedImages(prev => {
                const newSet = new Set(prev);
                newSet.add(e.detail.src);
                return newSet;
            });
        };

        window.addEventListener('productImageFailed', handleImageFailure);
        return () => {
            window.removeEventListener('productImageFailed', handleImageFailure);
        };
    }, []);

    if (!products || products.length === 0) return null;

    // Sort products: those that haven't failed first, those that have failed last
    const sortedProducts = [...products].sort((a, b) => {
        const aFailed = failedImages.has(sanitizeUrl(a.image_url, true));
        const bFailed = failedImages.has(sanitizeUrl(b.image_url, true));
        if (aFailed && !bFailed) return 1;
        if (!aFailed && bFailed) return -1;
        return 0;
    });

    const mockComments = [
        { id: 1, user: "Alex J.", text: "Exactly what I was looking for! Perfect quality.", rating: 5 },
        { id: 2, user: "Sarah M.", text: "Great value for the price. Fast shipping too.", rating: 4 },
        { id: 3, user: "Mike R.", text: "Impressive attention to detail. Highly recommend.", rating: 5 },
    ];

    return (
        <div className="w-full relative px-10 py-4">
            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4 md:-ml-6">
                    {sortedProducts.map((product, index) => (
                        <CarouselItem key={`${product.name}-${index}`} className="pl-4 md:pl-6 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                            <Card
                                className="overflow-hidden border-2 hover:border-emerald-500/50 transition-all group h-full cursor-pointer shadow-sm hover:shadow-md"
                                onClick={() => setSelectedProduct(product)}
                            >
                                <CardContent className="p-0 flex flex-col h-full">
                                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                                        <ProductImage
                                            src={sanitizeUrl(product.image_url, true)}
                                            alt={product.name}
                                            className="group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
                                            <Badge variant="secondary" className="font-bold text-sm shadow-sm bg-background/90 backdrop-blur-sm border-none text-emerald-600">
                                                {product.price}
                                            </Badge>
                                            {product.is_verified && (
                                                <Badge className="bg-emerald-500 text-white border-none py-0 px-1.5 text-[9px] font-black uppercase tracking-tighter">
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {product.location && (
                                                <Badge variant="outline" className="bg-black/40 text-white border-none backdrop-blur-md py-0 px-1.5 text-[10px] font-bold">
                                                    {product.location}
                                                </Badge>
                                            )}
                                            {product.supplier_years && (
                                                <Badge variant="outline" className="bg-emerald-500/80 text-white border-none backdrop-blur-md py-0 px-1.5 text-[10px] font-bold">
                                                    {product.supplier_years}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
                                            <button className="w-full bg-white text-black text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                                                <Info size={12} />
                                                Quick View
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1 gap-2 bg-gradient-to-b from-white to-zinc-50/50">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                                                {product.brand}
                                            </span>
                                            <h3 className="font-bold text-base line-clamp-1 leading-tight text-zinc-900">
                                                {product.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={10}
                                                        className={i < Math.floor(Number(product.rating_avg) || 0) ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"}
                                                    />
                                                ))}
                                                <span className="text-[10px] text-zinc-400 font-medium">({product.rating_count || 0})</span>
                                            </div>
                                            {product.moq && (
                                                <span className="text-[10px] font-bold text-zinc-400">
                                                    MOQ: <span className="text-zinc-600">{product.moq}</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                                            {product.details || "Finding live information and best prices for this selection..."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="-left-8 border-2 bg-white hover:bg-zinc-50" />
                <CarouselNext className="-right-8 border-2 bg-white hover:bg-zinc-50" />
            </Carousel>

            <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                    {selectedProduct && (
                        <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:h-[600px]">
                            {/* Left Image Section */}
                            <div className="md:w-1/2 relative h-[300px] md:h-full bg-zinc-100 flex items-center justify-center p-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 -z-10" />
                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                    <ProductImage
                                        src={sanitizeUrl(selectedProduct.image_url, true)}
                                        alt={selectedProduct.name}
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
                                            <span className="text-sm font-bold text-zinc-900">{selectedProduct.rating_avg}</span>
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
                                        {selectedProduct.details}. Experience the premium quality and design that sets this apart. Our experts have verified this selection for durability and style.
                                    </DialogDescription>
                                </DialogHeader>

                                {/* Comments Section */}
                                <div className="flex flex-col gap-4 mb-8">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <MessageSquare size={16} className="text-emerald-500" />
                                        <span className="font-bold text-zinc-800 text-sm">Recent Feedback</span>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                                            selectedProduct.reviews.map((comment, i) => (
                                                <div key={i} className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-zinc-900">{comment.user || "Verified Buyer"}</span>
                                                        <div className="flex gap-0.5">
                                                            {Array.from({ length: Math.min(5, comment.rating || 5) }).map((_, i) => (
                                                                <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 italic">"{comment.comment}"</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-zinc-50 border border-dashed border-zinc-200">
                                                <Info size={24} className="text-zinc-300 mb-2" />
                                                <p className="text-xs text-zinc-400 text-center font-medium">No recent reviews available for this product.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-auto flex flex-col gap-3">
                                    <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-14 shadow-lg shadow-emerald-500/20 group">
                                        <a href={sanitizeUrl(selectedProduct.source_url)} target="_blank" rel="noopener" className="flex items-center justify-center gap-2">
                                            <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                                            Secure Checkout
                                            <ExternalLinkIcon size={16} />
                                        </a>
                                    </Button>
                                    <p className="text-[10px] text-center text-zinc-400 font-medium">
                                        Ships globally • 30-day money-back guarantee • Secure payments
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
