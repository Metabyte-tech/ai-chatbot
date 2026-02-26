export async function GET() {
    return Response.json({
        AUTH_SECRET: process.env.AUTH_SECRET,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NODE_ENV: process.env.NODE_ENV,
    })
}
