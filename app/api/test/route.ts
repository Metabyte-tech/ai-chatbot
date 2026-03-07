import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        message: "Test route active on this instance",
        backend_url: process.env.BACKEND_URL || "NOT SET (defaults to localhost:8000)",
        node_env: process.env.NODE_ENV
    });
}
