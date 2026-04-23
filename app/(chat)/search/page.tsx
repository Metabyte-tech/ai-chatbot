"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Loader2, Brain } from "lucide-react";
import { AccioProductGrid } from "@/components/accio-product-grid";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { generateUUID } from "@/lib/utils";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import type { Product } from "@/components/product-carousel";

// ─── Landing hero (no query yet) ────────────────────────────────────────────

const SAMPLES = [
    "Find foldable camping chairs under $15.",
    "Minimalist desk lamp with CE certification.",
    "Eco-friendly gifts for new hires, customizable with logo.",
];

function SearchLanding({ onSearch }: { onSearch: (q: string) => void }) {
    const [draft, setDraft] = useState("");

    const submit = () => {
        const q = draft.trim();
        if (!q) return;
        onSearch(q);
    };

    return (
        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-10 max-w-3xl mx-auto w-full">
            {/* Chat bubble */}
            <div className="flex justify-end mb-8">
                <div className="rounded-2xl bg-[#00D49C]/10 text-[#00D49C] px-5 py-3 text-sm font-bold border border-[#00D49C]/20">
                    Thinking
                </div>
            </div>

            <div className="flex flex-col gap-5">
                <p className="text-zinc-900 font-bold text-lg">Got it!</p>
                <p className="text-zinc-600 text-sm leading-relaxed">
                    Tell me what you need or{" "}
                    <span className="underline underline-offset-2 cursor-pointer hover:text-zinc-900">
                        upload a product photo
                    </span>{" "}
                    — I'll hunt through <strong>Alibaba</strong>, <strong>AliExpress</strong>,{" "}
                    <strong>1688</strong>, and <strong>Google</strong> to find your ideal products.
                </p>

                {/* Input */}
                <div className="mt-2 flex flex-col gap-2">
                    <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
                        }}
                        placeholder="What are you looking for?"
                        rows={3}
                        className="w-full resize-none text-sm text-zinc-700 placeholder-zinc-400 bg-zinc-50 border border-[#00D49C]/30 rounded-xl px-4 py-3 outline-none focus:border-[#00D49C] transition-all"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={submit}
                            disabled={!draft.trim()}
                            className="h-9 px-6 rounded-full bg-[#00D49C] text-white text-sm font-bold hover:bg-[#00b283] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            <Search className="h-3.5 w-3.5" /> Search
                        </button>
                    </div>
                </div>

                {/* Samples */}
                <div className="flex flex-col gap-4 mt-2">
                    <p className="text-sm font-bold text-zinc-800">CLICK A SAMPLE TO START 👇</p>
                    <div className="flex flex-col gap-2">
                        {SAMPLES.map((sample) => (
                            <button
                                key={sample}
                                onClick={() => onSearch(sample)}
                                className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white px-5 py-4 text-left text-[14px] text-zinc-600 font-medium hover:border-emerald-200 hover:bg-emerald-50/30 hover:text-emerald-700 transition-all"
                            >
                                <span className="text-emerald-500 font-bold">•</span>
                                {sample}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── IndexedDB Cache ────────────────────────────────────────────────────────

const DB_NAME = "AccioProductCache";
const STORE_NAME = "searches";

async function getCache(key: string): Promise<any> {
    return new Promise((resolve) => {
        try {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
            req.onsuccess = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) return resolve(null);
                const tx = db.transaction(STORE_NAME, "readonly");
                const store = tx.objectStore(STORE_NAME);
                const getReq = store.get(key);
                getReq.onsuccess = () => resolve(getReq.result);
                getReq.onerror = () => resolve(null);
            };
            req.onerror = () => resolve(null);
        } catch (e) { resolve(null); }
    });
}

async function setCache(key: string, data: any): Promise<void> {
    return new Promise((resolve) => {
        try {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
            req.onsuccess = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) return resolve();
                const tx = db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                store.put(data, key);
                tx.oncomplete = () => resolve();
            };
            req.onerror = () => resolve();
        } catch (e) { resolve(); }
    });
}

// ─── Agent product grid results ───────────────────────────────────────────────

function SearchResults({ query }: { query: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [thought, setThought] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchedRef = useRef<string>("");

    const fetchProducts = useCallback(async (q: string) => {
        if (fetchedRef.current === q) return;
        fetchedRef.current = q;

        try {
            const data = await getCache(`product_search_${q}`);
            if (data && data.products) {
                setProducts(data.products);
                setThought(data.thought || "");
                setLoading(false);
                return;
            }
        } catch (e) {
            // Ignore cache errors
        }

        setLoading(true);
        setError(null);
        setProducts([]);
        setThought("");

        try {
            const res = await fetch(`/api/product-search?q=${encodeURIComponent(q)}`);
            if (!res.ok) throw new Error(`Search failed (${res.status})`);
            const data = await res.json();

            setProducts(data.products || []);
            setThought(data.thought || "");

            try {
                await setCache(`product_search_${q}`, data);
            } catch (e) { }

        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (query) fetchProducts(query);
    }, [query, fetchProducts]);

    if (loading) {
        return (
            <div className="flex flex-col items-start justify-start flex-1 gap-4 py-8 px-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 text-emerald-500">
                    <Brain className="h-5 w-5 animate-pulse" />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-800 uppercase tracking-widest">Thinking...</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1.5 ml-7">
                    <p className="text-xs text-zinc-400 font-medium">Connecting to global sourcing networks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-24 text-zinc-500">
                <p className="font-semibold text-zinc-700">Search failed</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-24 text-zinc-500">
                <p className="font-semibold text-zinc-700">No products found</p>
                <p className="text-sm">Try a different search term.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
            <div className="flex flex-col gap-1 mb-6">
                <p className="text-xs text-zinc-400 font-medium">
                    {products.length} results for <span className="font-bold text-zinc-700">"{query}"</span>
                </p>
                {thought && (
                    <div className="mt-3 p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl">
                        <p className="text-[14px] text-zinc-700 leading-relaxed font-medium">
                            {thought}
                        </p>
                    </div>
                )}
            </div>
            <AccioProductGrid products={products} />
        </div>
    );
}

// ─── Shell ───────────────────────────────────────────────────────────────────

function ProductSearchShell() {
    const searchParams = useSearchParams();

    // mode=agent → show Accio product grid
    const agentQuery = searchParams.get("mode") === "agent" ? (searchParams.get("q") || "") : "";

    // Inline chat state: triggered by the landing hero search
    const [inlineChatQuery, setInlineChatQuery] = useState<string | null>(null);
    const [chatId] = useState(() => generateUUID());

    // Model from cookie (client-side read)
    const [modelId, setModelId] = useState<string>(DEFAULT_CHAT_MODEL);
    useEffect(() => {
        const cookie = document.cookie
            .split("; ")
            .find((c) => c.startsWith("chat-model="));
        if (cookie) {
            setModelId(decodeURIComponent(cookie.split("=")[1]));
        }
    }, []);

    // Determine current view
    const isAgentMode = !!agentQuery;
    const isChatMode = !!inlineChatQuery;

    // For agent mode: header search bar state
    const [inputValue, setInputValue] = useState(agentQuery);
    useEffect(() => { setInputValue(agentQuery); }, [agentQuery]);

    return (
        <div className="flex flex-col h-dvh bg-white overflow-hidden w-full">
            {/* ── Header (only shown in agent/results mode) ── */}
            {isAgentMode && (
                <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-2.5 shrink-0 bg-white z-20 h-[60px]">
                    <div className="flex-1 relative flex items-center group max-w-2xl">
                        <Search className="absolute left-3.5 h-4 w-4 text-zinc-400 group-focus-within:text-[#00D49C] transition-colors pointer-events-none" />
                        <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && inputValue.trim()) {
                                    const params = new URLSearchParams({ q: inputValue.trim(), mode: "agent" });
                                    window.history.pushState({}, "", `/search?${params.toString()}`);
                                    // Force re-render by navigating
                                    window.location.href = `/search?${params.toString()}`;
                                }
                            }}
                            placeholder="Search for products..."
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-full py-2 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#00D49C]/20 focus:border-[#00D49C]/60 transition-all font-medium"
                        />
                        {inputValue && (
                            <button
                                onClick={() => setInputValue("")}
                                className="absolute right-3 p-0.5 hover:bg-zinc-200 rounded-full transition-colors"
                            >
                                <X className="h-3.5 w-3.5 text-zinc-400" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            if (!inputValue.trim()) return;
                            const params = new URLSearchParams({ q: inputValue.trim(), mode: "agent" });
                            window.location.href = `/search?${params.toString()}`;
                        }}
                        disabled={!inputValue.trim()}
                        className="h-9 px-5 rounded-full bg-[#00D49C] text-white text-xs font-bold hover:bg-[#00b283] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0"
                    >
                        <Search className="h-3.5 w-3.5" />
                        Search
                    </button>
                </div>
            )}

            {/* ── Content area ── */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {isAgentMode ? (
                    // Sidebar modal search → Accio product grid
                    <SearchResults key={agentQuery} query={agentQuery} />
                ) : isChatMode ? (
                    // Landing page search → Full inline chat (same page, no navigation)
                    <>
                        <Chat
                            key={chatId}
                            id={chatId}
                            initialMessages={[]}
                            initialChatModel={modelId}
                            initialVisibilityType="private"
                            isReadonly={false}
                            autoResume={false}
                            autoQuery={inlineChatQuery}
                        />
                        <DataStreamHandler />
                    </>
                ) : (
                    // No query yet → show landing hero
                    <SearchLanding onSearch={(q) => setInlineChatQuery(q)} />
                )}
            </div>
        </div>
    );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function ProductSearchPage() {
    return (
        <Suspense fallback={<div className="flex h-dvh items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-300" /></div>}>
            <ProductSearchShell />
        </Suspense>
    );
}
