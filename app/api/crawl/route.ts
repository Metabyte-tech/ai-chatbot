import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { url, isDeep } = body;

        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
        const endpoint = isDeep ? "/crawl/deep" : "/crawl";

        console.log(`[Crawl Proxy] Forwarding ${isDeep ? 'deep ' : ''}request for ${url} to ${backendUrl}${endpoint}`);

        const response = await fetch(`${backendUrl}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error("[Crawl Proxy] Error:", error);
        return NextResponse.json(
            { detail: "Backend scraping server is unreachable. Check if EC2 is running." },
            { status: 502 }
        );
    }
}
