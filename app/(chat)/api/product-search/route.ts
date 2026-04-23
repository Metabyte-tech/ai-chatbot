import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get("q");
    if (!query) {
        return NextResponse.json({ products: [] }, { status: 400 });
    }

    try {
        const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${backendUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: query.trim(),
            }),
            // Allow up to 30 seconds for the backend to respond
            signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        const rawResponse: string = data.response || "";

        // Extract <product_grid>...</product_grid> JSON
        const gridMatch = rawResponse.match(/<product_grid>([\s\S]*?)<\/product_grid>/);
        let products = [];
        let thought = rawResponse;

        if (gridMatch) {
            try {
                products = JSON.parse(gridMatch[1]);
                // Remove the grid part from the response to get the "thought" text
                thought = rawResponse.replace(/<product_grid>[\s\S]*?<\/product_grid>/, "").trim();
            } catch (err) {
                console.error("Parse error in grid content:", err);
            }
        }

        return NextResponse.json({
            products,
            thought,
            intent: data.intent
        });
    } catch (error: any) {
        console.error("Product search error:", error);
        return NextResponse.json({ products: [], error: error.message }, { status: 500 });
    }
}
