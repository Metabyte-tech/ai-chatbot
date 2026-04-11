"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { type Product } from "@/components/product-carousel";

interface SelectedProductsContextType {
    selectedProducts: Product[];
    toggleProduct: (product: Product) => void;
    clearSelection: () => void;
    isSelected: (productId: string) => boolean;
}

const SelectedProductsContext = createContext<SelectedProductsContextType | undefined>(
    undefined
);

export function SelectedProductsProvider({ children }: { children: React.ReactNode }) {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

    const toggleProduct = useCallback((product: Product) => {
        setSelectedProducts((prev) => {
            const isAlreadySelected = prev.some((p) => p.name === product.name);
            if (isAlreadySelected) {
                return prev.filter((p) => p.name !== product.name);
            }
            return [...prev, product];
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedProducts([]);
    }, []);

    const isSelected = useCallback(
        (productName: string) => {
            return selectedProducts.some((p) => p.name === productName);
        },
        [selectedProducts]
    );

    return (
        <SelectedProductsContext.Provider
            value={{ selectedProducts, toggleProduct, clearSelection, isSelected }}
        >
            {children}
        </SelectedProductsContext.Provider>
    );
}

export function useSelectedProducts() {
    const context = useContext(SelectedProductsContext);
    if (context === undefined) {
        throw new Error(
            "useSelectedProducts must be used within a SelectedProductsProvider"
        );
    }
    return context;
}
