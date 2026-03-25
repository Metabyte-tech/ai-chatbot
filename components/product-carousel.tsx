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
import { ExternalLinkIcon, StarIcon, BookmarkIcon, HeartIcon } from "lucide-react";

export type Product = {
    name: string;
    brand: string;
    price: string;
    image_url: string;
    source_url: string;
    details: string;
    rating?: string;
    offers?: string;
    source?: string;
};

interface ProductCarouselProps {
    products: Product[];
}

function sanitizeUrl(url: string, isImage: boolean = false) {
    if (!url) return isImage ? "https://placehold.co/600x600?text=No+Image" : "";
    let trimmed = url.trim();

    // Force HTTPS for Ajio and others to avoid redirect blocks
    if (trimmed.includes("ajio.com") && !trimmed.startsWith("https://")) {
        trimmed = trimmed.replace(/^http:\/\//, "");
        trimmed = "https://" + (trimmed.startsWith("www.") ? "" : "www.") + trimmed;
    }

    if (trimmed.startsWith("http")) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;

    if (trimmed.includes(".") && !trimmed.includes(" ")) {
        return `https://${trimmed}`;
    }
    return trimmed;
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasFallbackTried, setHasFallbackTried] = useState(false);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => {
                if (!hasFallbackTried && src && !src.includes("placehold.co")) {
                    // Try proxy fallback (weserv.nl is reliable and fast)
                    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&default=https://placehold.co/600x600?text=No+Image`;
                    setImgSrc(proxyUrl);
                    setHasFallbackTried(true);
                } else {
                    setImgSrc("https://placehold.co/600x600?text=No+Image");
                }

                if (window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('productImageFailed', { detail: { src, hasFallbackTried } }));
                }
            }}
        />
    );
}

export function ProductCarousel({ products }: ProductCarouselProps) {
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

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

    return (
        <div className="w-full relative px-6 py-8">
            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {sortedProducts.map((product, index) => (
                        <CarouselItem key={`${product.name}-${index}`} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                            <Card className="overflow-hidden border border-border bg-background transition-all duration-300 group h-full rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1">
                                <CardContent className="p-0 flex flex-col h-full">
                                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary/30">
                                        <ProductImage
                                            src={sanitizeUrl(product.image_url, true)}
                                            alt={product.name}
                                        />
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button className="p-2 rounded-full bg-background/80 blur-0 backdrop-blur-md shadow-sm hover:bg-background transition-colors">
                                                <HeartIcon size={16} className="text-foreground" />
                                            </button>
                                        </div>
                                        {product.offers && (
                                            <div className="absolute bottom-3 left-3">
                                                <Badge className="bg-accent text-accent-foreground text-[10px] font-bold h-6 px-2 border-0 shadow-sm">
                                                    {product.offers}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-1 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                                {product.source || "Supplier"}
                                            </p>
                                            <h3 className="font-semibold text-base line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                                                {product.brand && <span className="opacity-70 mr-1.5">{product.brand}</span>}
                                                {product.name}
                                            </h3>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-xl text-foreground">{product.price}</span>
                                                {product.rating && (
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground mt-0.5">
                                                        <StarIcon size={12} className="fill-yellow-400 text-yellow-400" />
                                                        <span>{product.rating}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Button asChild className="h-10 w-10 px-0 rounded-xl bg-accent text-accent-foreground shadow-sm transition-all hover:bg-accent/90" size="sm">
                                                <a href={sanitizeUrl(product.source_url)} target="_blank" rel="noopener">
                                                    <ExternalLinkIcon size={16} />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4 h-10 w-10 border border-border bg-background shadow-md hover:bg-secondary" />
                <CarouselNext className="-right-4 h-10 w-10 border border-border bg-background shadow-md hover:bg-secondary" />
            </Carousel>
        </div>
    );
}
