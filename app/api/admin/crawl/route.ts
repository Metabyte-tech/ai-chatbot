import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    try {
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/admin/crawl/batches`, {
            cache: 'no-store'
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error("[Admin Crawl Batches Proxy] Error:", error);
        return NextResponse.json(
            { detail: "Backend scraping server is unreachable." },
            { status: 502 }
        );
    }
}
