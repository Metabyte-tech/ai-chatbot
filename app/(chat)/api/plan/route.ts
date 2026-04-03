import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

        const response = await fetch(`${backendUrl}/api/plan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error generating plan:", error);
        return NextResponse.json({ plan: [] }, { status: 500 });
    }
}
