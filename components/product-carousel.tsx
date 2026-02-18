"use client";

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
import { ExternalLinkIcon } from "lucide-react";

export type Product = {
    name: string;
    brand: string;
    price: string;
    image_url: string;
    source_url: string;
    details: string;
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

export function ProductCarousel({ products }: ProductCarouselProps) {
    if (!products || products.length === 0) return null;

    console.log("Rendering Carousel with Products:", products);

    return (
        <div className="w-full relative px-10 py-4">
            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {products.map((product, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                            <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all group h-full">
                                <CardContent className="p-0 flex flex-col h-full">
                                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                                        <Image
                                            src={sanitizeUrl(product.image_url, true)}
                                            alt={product.name}
                                            fill
                                            unoptimized
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="secondary" className="font-bold text-sm shadow-sm bg-background/80 backdrop-blur-sm">
                                                {product.price}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1 gap-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                {product.brand}
                                            </span>
                                            <h3 className="font-bold text-base line-clamp-1 leading-tight">
                                                {product.name}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                                            {product.details}
                                        </p>
                                        <div className="mt-auto pt-2">
                                            <Button asChild className="w-full gap-2 font-semibold" size="sm">
                                                <a href={sanitizeUrl(product.source_url)} target="_blank" rel="noopener">
                                                    View Dealing
                                                    <ExternalLinkIcon size={14} />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="-left-8 border-2" />
                <CarouselNext className="-right-8 border-2" />
            </Carousel>
        </div>
    );
}
