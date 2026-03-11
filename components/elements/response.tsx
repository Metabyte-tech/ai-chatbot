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

  // Regex to find <product_carousel>[JSON]</product_carousel> (handles LLM spacing quirks)
  const carouselRegex = /<\s*product_carousel\s*>([\s\S]*?)<\/\s*product_carousel\s*>/gi;
  const parts = [];
  let lastIndex = 0;
  let match;

  console.log("====== RESPONSE RENDER ======");
  console.log("Children snippet:", children.substring(0, 200) + (children.length > 200 ? "..." : ""));
  console.log("Includes <product_carousel>:", children.includes("<product_carousel>"));

  while ((match = carouselRegex.exec(children)) !== null) {
    console.log("Matched carousel!", match[0].substring(0, 50));
    // Push text before the tag
    if (match.index > lastIndex) {
      parts.push(children.substring(lastIndex, match.index));
    }

    // Parse JSON and push Carousel component
    try {
      console.log("Response component parsing carousel tag...");
      // Remove any surrounding markdown code blocks (e.g. ```json \n ... \n ```) hallucinaged by the LLM
      let content = match[1].trim();
      content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

      let products: Product[] = [];

      // Helper to try and fix common JSON issues from LLMs
      const cleanAndParseJSON = (str: string) => {
        try {
          // Attempt 1: Direct parse
          return JSON.parse(str);
        } catch (e) {
          try {
            // Attempt 2: Remove potential trailing commas or markdown artifacts
            let cleaned = str.trim();
            if (cleaned.endsWith(',')) cleaned = cleaned.slice(0, -1);
            // Handle some common LLM escaping errors in URLs
            cleaned = cleaned.replace(/\\&/g, '&').replace(/\\_/g, '_');

            // Attempt 3: If it looks like comma-separated JSON objects { ... }, { ... } but missing array brackets
            if (cleaned.startsWith('{') && cleaned.endsWith('}') && !cleaned.startsWith('[') && cleaned.includes('},{') || cleaned.includes('}, {') || cleaned.includes('},\n{')) {
              try {
                return JSON.parse(`[${cleaned}]`);
              } catch (e3) {
                // If it still fails, fall through to the direct parse attempt
              }
            }

            return JSON.parse(cleaned);
          } catch (e2) {
            console.error("JSON Fix failed:", e2);
            throw e2;
          }
        }
      };

      if (content.startsWith("[") || content.startsWith("{")) {
        products = cleanAndParseJSON(content);
        if (!Array.isArray(products)) products = [products];
      } else {
        // Smart Fallback: AI sent plain text instead of JSON
        // ... (rest of the existing fallback logic)
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

        if (product.name && !product.image_url) {
          product.image_url = "https://placehold.co/600x600?text=No+Image";
        }
        if (product.name) products = [product as Product];
      }

      if (products.length > 0) {
        parts.push(<ProductCarousel key={`carousel-${match.index}`} products={products} />);
      } else {
        parts.push(match[0]);
      }
    } catch (e) {
      console.error("Carousel parsing error:", e);
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
