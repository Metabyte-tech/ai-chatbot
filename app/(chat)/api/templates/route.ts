import { NextResponse } from "next/server";

export async function GET() {
    try {
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/templates`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json({ categories: [] }, { status: 500 });
    }
}
