"use client";

import type { ComponentProps } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import { ProductCarousel, type Product } from "../product-carousel";

type ResponseProps = ComponentProps<typeof Streamdown>;

export function Response({ className, children, ...props }: ResponseProps) {
  if (typeof children !== "string") {
    return (
      <Streamdown className={cn("size-full", className)} {...props}>
        {children}
      </Streamdown>
    );
  }

  // Regex to find <product_carousel>[JSON]</product_carousel>
  const carouselRegex = /<product_carousel>([\s\S]*?)<\/product_carousel>/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = carouselRegex.exec(children)) !== null) {
    // Push text before the tag
    if (match.index > lastIndex) {
      parts.push(children.substring(lastIndex, match.index));
    }

    // Parse JSON and push Carousel component
    try {
      console.log("Response component parsing carousel tag...");
      const content = match[1].trim();
      let products: Product[] = [];

      if (content.startsWith("[") || content.startsWith("{")) {
        products = JSON.parse(content);
        if (!Array.isArray(products)) products = [products];
      } else {
        // Smart Fallback: AI sent plain text instead of JSON
        // Example: "Product: Nike Shoes. Brand: Nike. Price: ₹ 1000..."
        // Split by newlines, periods followed by space, or double spaces
        const entries = content.split(/\n|\.\s+/);
        const product: any = {};
        entries.forEach(entry => {
          const colonIndex = entry.indexOf(':');
          if (colonIndex > -1) {
            const k = entry.substring(0, colonIndex).trim().toLowerCase();
            const v = entry.substring(colonIndex + 1).trim();
            if (k.includes('product') || k === 'name') product.name = v;
            if (k.includes('brand')) product.brand = v;
            if (k.includes('price')) product.price = v;
            if (k.includes('image')) product.image_url = v;
            if (k.includes('details') || k.includes('description')) product.details = v;
            if (k.includes('source') || k.includes('url')) product.source_url = v;
          }
        });

        // Ensure image_url has a fallback if missing
        if (product.name && !product.image_url) {
          product.image_url = "https://placehold.co/600x600?text=No+Image";
        }

        if (product.name) products = [product as Product];
      }

      if (products.length > 0) {
        parts.push(<ProductCarousel key={`carousel-${match.index}`} products={products} />);
      } else {
        parts.push(match[0]); // Fallback to raw text if no name found
      }
    } catch (e) {
      // Quietly fallback instead of logging a loud error
      parts.push(match[0]);
    }

    lastIndex = carouselRegex.lastIndex;
  }

  // Push remaining text
  if (lastIndex < children.length) {
    parts.push(children.substring(lastIndex));
  }

  if (parts.length === 0) {
    return (
      <Streamdown className={cn("size-full", className)} {...props}>
        {children}
      </Streamdown>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <Streamdown
            key={i}
            className="size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto"
            {...props}
          >
            {part}
          </Streamdown>
        ) : (
          part
        )
      )}
    </div>
  );
}
