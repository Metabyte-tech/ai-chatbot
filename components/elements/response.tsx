"use client";

import type { ComponentProps } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import { ProductCarousel, type Product } from "../product-carousel";
import { ProductGrid } from "../product-grid";
import { AccioProductGrid } from "../accio-product-grid";
import { usePathname } from "next/navigation";

type ResponseProps = ComponentProps<typeof Streamdown>;

export function Response({ className, children, ...props }: ResponseProps) {
  const pathname = usePathname();
  const isSearchPage = pathname === "/search";

  if (typeof children !== "string") {
    return (
      <Streamdown className={cn("size-full", className)} {...props}>
        {children}
      </Streamdown>
    );
  }

  // Debugging logs for search page issues
  console.log("[Response] isSearchPage:", isSearchPage, "Children length:", children.length);

  // Regex to find <product_carousel>[JSON]</product_carousel>
  const carouselRegex = /<\s*product_carousel\s*>([\s\S]*?)(?:<\/\s*product_carousel\s*>|$)/gi;
  const gridRegex = /<\s*product_grid\s*>([\s\S]*?)(?:<\/\s*product_grid\s*>|$)/gi;

  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;

  // First pass: extract carousels
  while ((match = carouselRegex.exec(children)) !== null) {
    if (match.index > lastIndex) {
      parts.push(children.substring(lastIndex, match.index));
    }

    const content = match[1].trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    let products: Product[] = [];
    try {
      if (content) {
        // Basic heuristic to fix single-quoted JSON from Python str(dict) or AI hallucinations
        let fixedContent = content;
        if (content.includes("'") && !content.includes('"')) {
          fixedContent = content.replace(/'/g, '"');
        }
        products = JSON.parse(fixedContent);
        if (!Array.isArray(products)) products = [products];
      }
    } catch (e) {
      // Incomplete JSON during streaming
    }

    if (products.length > 0) {
      if (isSearchPage) {
        parts.push(<AccioProductGrid key={`carousel-${match.index}`} products={products} />);
      } else {
        parts.push(<ProductCarousel key={`carousel-${match.index}`} products={products} />);
      }
    } else {
      parts.push(<div key={`loading-${match.index}`} className="animate-pulse h-10 w-full bg-muted rounded" />);
    }

    lastIndex = carouselRegex.lastIndex;
  }

  if (lastIndex < children.length) {
    parts.push(children.substring(lastIndex));
  }

  // Second pass: process string parts for grids
  const processedParts: (string | React.ReactNode)[] = [];
  for (const part of parts) {
    if (typeof part !== "string") {
      processedParts.push(part);
      continue;
    }

    let gridLastIndex = 0;
    let gridMatch;
    gridRegex.lastIndex = 0;
    while ((gridMatch = gridRegex.exec(part)) !== null) {
      if (gridMatch.index > gridLastIndex) {
        processedParts.push(part.substring(gridLastIndex, gridMatch.index));
      }

      const gridContent = gridMatch[1].trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      let products: Product[] = [];
      try {
        if (gridContent) {
          let fixedGridContent = gridContent;
          if (gridContent.includes("'") && !gridContent.includes('"')) {
            fixedGridContent = gridContent.replace(/'/g, '"');
          }
          products = JSON.parse(fixedGridContent);
          if (!Array.isArray(products)) products = [products];
        }
      } catch (e) {
        // Incomplete JSON during streaming
      }

      if (products.length > 0) {
        if (isSearchPage) {
          processedParts.push(<AccioProductGrid key={`grid-${gridMatch.index}`} products={products} />);
        } else {
          processedParts.push(<ProductGrid key={`grid-${gridMatch.index}`} products={products} />);
        }
      } else {
        processedParts.push(<div key={`loading-grid-${gridMatch.index}`} className="animate-pulse h-40 w-full bg-muted rounded-xl" />);
      }

      gridLastIndex = gridRegex.lastIndex;
    }
    if (gridLastIndex < part.length) {
      processedParts.push(part.substring(gridLastIndex));
    }
  }

  return (
    <div className={cn("group/response flex flex-col gap-4", className)}>
      {processedParts
        .filter((part) => typeof part !== "string" || part.trim().length > 0)
        .map((part, i) => {
          if (typeof part === "string") {
            return (
              <Streamdown
                key={i}
                className="size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto"
                components={{ p: "div" }}
                {...props}
              >
                {part}
              </Streamdown>
            );
          }
          return part;
        })}
    </div>
  );
}
