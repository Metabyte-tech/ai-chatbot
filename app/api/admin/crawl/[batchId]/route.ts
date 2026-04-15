import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    const { batchId } = await params;

    try {
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/admin/crawl/batch/${batchId}`, {
            cache: 'no-store'
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error(`[Admin Crawl Batch Proxy] Error for ${batchId}:`, error);
        return NextResponse.json(
            { detail: "Backend scraping server is unreachable." },
            { status: 502 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    const { batchId } = await params;

    try {
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/admin/crawl/batch/${batchId}`, {
            method: "DELETE",
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error(`[Admin Crawl Batch Proxy DELETE] Error for ${batchId}:`, error);
        return NextResponse.json(
            { detail: "Backend scraping server is unreachable." },
            { status: 502 }
        );
    }
}
