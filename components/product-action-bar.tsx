"use client";

import React, { useState } from "react";
import { X, MessageSquare, ListPlus, Mail, Columns2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelectedProducts } from "@/lib/contexts/selected-products-context";
import { cn } from "@/lib/utils";
import { ProductCompareModal } from "./product-compare-modal";
import { AddToListPopover } from "./add-to-list-popover";

export function ProductActionBar() {
    const { selectedProducts, clearSelection } = useSelectedProducts();
    const [isCompareOpen, setIsCompareOpen] = useState(false);

    if (selectedProducts.length === 0) return null;

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-zinc-900 text-white rounded-full px-6 py-2 shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-2 border-r border-white/20 pr-6">
                        <span className="text-sm font-bold min-w-[80px]">
                            {selectedProducts.length} selected
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-sm font-medium hover:text-emerald-400 transition-colors">
                            <MessageSquare size={16} />
                            Ask Accio
                        </button>
                        <div className="w-px h-4 bg-white/20" />

                        <AddToListPopover products={selectedProducts}>
                            <button className="flex items-center gap-2 text-sm font-medium hover:text-emerald-400 transition-colors">
                                <ListPlus size={16} />
                                Add to list
                            </button>
                        </AddToListPopover>
                        <div className="w-px h-4 bg-white/20" />

                        <button className="flex items-center gap-2 text-sm font-medium hover:text-emerald-400 transition-colors">
                            <Mail size={16} />
                            Send inquiry
                        </button>

                        {selectedProducts.length >= 2 && (
                            <>
                                <div className="w-px h-4 bg-white/20" />
                                <button
                                    onClick={() => setIsCompareOpen(true)}
                                    className="flex items-center gap-2 text-sm font-black text-white px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 transition-all border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                >
                                    <Columns2 size={16} strokeWidth={3} />
                                    Compare
                                </button>
                            </>
                        )}

                        <div className="w-px h-4 bg-white/20 ml-2" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-white/10 -mr-2"
                            onClick={clearSelection}
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </div>
            </div>

            <ProductCompareModal
                open={isCompareOpen}
                onOpenChange={setIsCompareOpen}
            />
        </>
    );
}
