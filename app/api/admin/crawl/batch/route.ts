import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const urls = body.urls;

        if (!urls || urls.length === 0) {
            return NextResponse.json({ detail: "No URL(s) provided" }, { status: 400 });
        }

        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
        console.log(`[Admin Crawl Proxy] Forwarding tracked batch request for ${urls.length} URL(s)`);

        const response = await fetch(`${backendUrl}/admin/crawl/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls }),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error("[Admin Crawl Proxy] Error:", error);
        return NextResponse.json(
            { detail: "Backend scraping server is unreachable." },
            { status: 502 }
        );
    }
}
