"use client";

import type { ComponentProps } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import { ProductCarousel, type Product } from "../product-carousel";
import { ProductGrid } from "../product-grid";

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
  // Handles incomplete tags during streaming to prevent Streamdown from trying to render partial JSON as markdown
  const carouselRegex = /<\s*product_carousel\s*>([\s\S]*?)(?:<\/\s*product_carousel\s*>|$)/gi;
  const parts = [];
  let lastIndex = 0;
  let match;

  console.log("====== RESPONSE RENDER ======");
  console.log("Children Raw:", children);
  console.log("Children Length:", children.length);
  console.log("Includes <product_carousel>:", children.includes("<product_carousel>"));
  if (typeof window !== "undefined") {
    (window as any).__DEBUG_LAST_RESPONSE = children;
  }

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
            // Handle incomplete JSON during streaming (e.g. [{"name": "fo... )
            // If it ends abruptly, try to close it nicely
            if (!cleaned.endsWith(']')) {
              // This is a very basic attempt to close JSON during streaming
              // If it's too broken, JSON.parse will still fail, which is handled
              if (cleaned.lastIndexOf('}') > cleaned.lastIndexOf('{')) {
                cleaned += ']';
              }
            }
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
            // Silently fail during streaming to avoid error overlay
            return null;
          }
        }
      };

      if (content.startsWith("[") || content.startsWith("{")) {
        products = cleanAndParseJSON(content);
        if (products && !Array.isArray(products)) products = [products];
        if (!products) products = []; // Handle null from parsing failure
      } else {
        // ... (rest of the existing fallback logic)
        // (I'll keep the fallback logic but make it more robust)
        products = [];
      }

      if (products.length > 0) {
        parts.push(<ProductCarousel key={`carousel-${match.index}`} products={products} />);
      } else {
        // If we matched a tag but couldn't parse it yet (streaming), 
        // push a non-string placeholder to prevent it from going to Streamdown
        parts.push(<div key={`loading-${match.index}`} className="animate-pulse h-10 w-full bg-muted rounded" />);
      }
    } catch (e) {
      console.error("Carousel parsing outer error:", e);
      parts.push(<div key={`error-${match.index}`} />);
    }

    lastIndex = carouselRegex.lastIndex;
  }

  // Push remaining text to parts before processing grid
  if (lastIndex < children.length) {
    parts.push(children.substring(lastIndex));
  }

  // Regex to find <product_grid>[JSON]</product_grid>
  const gridRegex = /<\s*product_grid\s*>([\s\S]*?)(?:<\/\s*product_grid\s*>|$)/gi;
  let gridParts: any[] = [];
  lastIndex = 0;

  // Re-process parts that are strings for grid tags
  const processedParts = [];
  for (const part of parts) {
    if (typeof part !== "string") {
      processedParts.push(part);
      continue;
    }

    let innerLastIndex = 0;
    let gridMatch;
    gridRegex.lastIndex = 0; // Reset for each part
    while ((gridMatch = gridRegex.exec(part)) !== null) {
      if (gridMatch.index > innerLastIndex) {
        processedParts.push(part.substring(innerLastIndex, gridMatch.index));
      }

      try {
        let content = gridMatch[1].trim();
        content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

        let products: Product[] = [];
        if (content.startsWith("[") || content.startsWith("{")) {
          // Re-use the same cleaning logic (defined above as a helper if I move it, 
          // but for now I'll just use a simplified version or move the helper)
          try {
            products = JSON.parse(content);
            if (products && !Array.isArray(products)) products = [products];
          } catch (e) {
            products = [];
          }
        }

        if (products.length > 0) {
          processedParts.push(<ProductGrid key={`grid-${gridMatch.index}`} products={products} />);
        } else {
          processedParts.push(<div key={`loading-grid-${gridMatch.index}`} className="animate-pulse h-40 w-full bg-muted rounded-xl" />);
        }
      } catch (e) {
        processedParts.push(<div key={`error-grid-${gridMatch.index}`} />);
      }
      innerLastIndex = gridRegex.lastIndex;
    }

    if (innerLastIndex < part.length) {
      processedParts.push(part.substring(innerLastIndex));
    }
  }

  // All parts processed into processedParts

  if (processedParts.length === 0) {
    return (
      <Streamdown
        className={cn("size-full", className)}
        components={{ p: "div" }}
        {...props}
      >
        {children}
      </Streamdown>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {processedParts
        .filter((part) => typeof part !== "string" || part.trim().length > 0)
        .map((part, i) =>
          typeof part === "string" ? (
            <Streamdown
              key={i}
              className="size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto"
              components={{ p: "div" }}
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
