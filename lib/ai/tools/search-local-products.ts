import { tool } from "ai";
import { z } from "zod";

export const searchLocalProducts = tool({
    description: "Search for local products, stores, and shopping info in the local vector database. Use this for specific product queries related to shopping and local discovery.",
    inputSchema: z.object({
        query: z.string().describe("The user's query about products or locations"),
    }),
    execute: async ({ query }) => {
        try {
            const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
            const response = await fetch(`${backendUrl}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: query }),
            });

            if (!response.ok) {
                return { error: "Failed to connect to the local product database." };
            }

            const data = await response.json();
            return { results: data.response };
        } catch (error) {
            return { error: "Local product database is currently offline." };
        }
    },
});
