"use client";

import React from "react";
import Image from "next/image";
import { X, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function ProductCompareModal({ open, onOpenChange }: ProductCompareModalProps) {
    const { selectedProducts, toggleProduct } = useSelectedProducts();

    const attributes = [
        { label: "Price", key: "price", category: "Product information" },
        { label: "Min.order", key: "moq", category: "Product information", default: "1 piece" },
        { label: "Delivery time", key: "delivery_time", category: "Product information", default: "-" },
        { label: "Wireless Delay Time", key: "delay", category: "Product attributes", default: "30 Ms" },
        { label: "Headphone Form Factor", key: "form_factor", category: "Product attributes", default: "Over Ear" },
        { label: "Feature", key: "feature", category: "Product attributes", default: "High Quality" },
        { label: "Frequency Range", key: "frequency", category: "Product attributes", default: "2.401-2.480GHz" },
        { label: "Cord Length", key: "cord", category: "Product attributes", default: "Wireless" },
    ];

    // Helper to extract nested info or defaults
    const getAttrValue = (product: any, attr: any) => {
        return product[attr.key] || attr.default || "-";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between shrink-0">
                    <DialogTitle className="text-sm font-semibold text-zinc-900">Compare Products</DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => onOpenChange(false)}
                    >
                        <X size={18} />
                    </Button>
                </DialogHeader>

                <div className="flex-1 overflow-x-auto overflow-y-auto">
                    <div className="min-w-max p-6">
                        <div className="flex gap-8 mb-12">
                            {/* Spacer for attribute labels column */}
                            <div className="w-[200px] shrink-0" />

                            {selectedProducts.map((product, idx) => (
                                <div key={idx} className="w-[280px] flex flex-col items-center gap-4 relative group">
                                    <div className="relative aspect-square w-48 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 p-4">
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-2"
                                            unoptimized
                                        />
                                    </div>
                                    <h3 className="text-xs font-medium text-zinc-900 line-clamp-2 text-center h-8 leading-tight px-4">
                                        {product.name}
                                    </h3>

                                    <div className="flex items-center gap-2 w-full px-4">
                                        <Button className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold h-9 rounded-full">
                                            <Mail size={14} className="mr-2" />
                                            Send inquiry
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0 h-9 w-9 rounded-full border-zinc-200 text-zinc-500 hover:text-red-500 hover:border-red-200"
                                            onClick={() => toggleProduct(product)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Comparison Rows */}
                        <div className="flex flex-col gap-10">
                            {["Product information", "Product attributes"].map((category) => (
                                <div key={category} className="flex flex-col gap-4">
                                    <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">{category}</h4>
                                    <div className="flex flex-col gap-6">
                                        {attributes.filter(a => a.category === category).map((attr) => (
                                            <div key={attr.label} className="flex gap-8 group/row">
                                                <div className="w-[200px] shrink-0 text-xs text-zinc-500 py-1">
                                                    {attr.label}
                                                </div>
                                                {selectedProducts.map((product, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-[280px] text-xs font-bold text-zinc-900 py-1"
                                                        style={{ color: attr.key === 'price' ? '#10b981' : undefined }}
                                                    >
                                                        {getAttrValue(product, attr)}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
