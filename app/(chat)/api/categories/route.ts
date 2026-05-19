import { NextResponse } from "next/server";

export async function GET() {
    try {
        const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${backendUrl}/api/categories`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            // Allow up to 10 seconds for the backend to respond
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Categories fetch error:", error);
        return NextResponse.json({ categories: [], error: error.message }, { status: 500 });
    }
}
