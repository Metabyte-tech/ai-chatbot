"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2, FolderHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getUserListsAction, getListWithProductsAction } from "@/lib/actions/lists";
import { ProductGrid } from "@/components/product-grid";
import { toast } from "sonner";

export default function MyListsPage() {
    const [activeTab, setActiveTab] = useState<"products" | "suppliers">("products");
    const [lists, setLists] = useState<any[]>([]);
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [loadingLists, setLoadingLists] = useState(true);
    const [listData, setListData] = useState<any>(null);
    const [loadingListData, setLoadingListData] = useState(false);

    useEffect(() => {
        loadLists();
    }, []);

    useEffect(() => {
        if (activeListId) {
            loadListDetails(activeListId);
        } else {
            setListData(null);
        }
    }, [activeListId]);

    const loadLists = async () => {
        setLoadingLists(true);
        try {
            const data = await getUserListsAction();
            setLists(data);
            if (data.length > 0 && !activeListId) {
                setActiveListId(data[0].id);
            }
        } catch (error) {
            console.error("Failed to load lists", error);
        } finally {
            setLoadingLists(false);
        }
    };

    const loadListDetails = async (id: string) => {
        setLoadingListData(true);
        try {
            const data = await getListWithProductsAction(id);
            // Parse productData back from JSON strings if needed
            const parsedProducts = data.savedProducts.map((sp: any) =>
                typeof sp.productData === 'string' ? JSON.parse(sp.productData) : sp.productData
            );
            setListData({ ...data.list, products: parsedProducts });
        } catch (error) {
            console.error("Failed to load list details", error);
            toast.error("Failed to load list content");
        } finally {
            setLoadingListData(false);
        }
    };

    return (
        <div className="flex h-screen bg-white">
            {/* Page Content Container - Side-by-side Layout */}
            <div className="flex w-full max-w-[1400px] mx-auto p-8 gap-8 overflow-hidden h-full">

                {/* Internal Navigation Sidebar */}
                <div className="w-64 flex flex-col shrink-0 h-full">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-1 rounded bg-zinc-100">
                            <FolderHeart size={16} className="text-zinc-600" />
                        </div>
                        <h1 className="text-base font-semibold text-zinc-900">My lists</h1>
                    </div>

                    <nav className="flex flex-col gap-1 overflow-y-auto flex-1 custom-scrollbar pr-2">
                        <button
                            onClick={() => setActiveListId(null)}
                            className={cn(
                                "flex items-center w-full px-4 py-2.5 rounded-xl font-medium text-sm text-left transition-colors",
                                activeListId === null ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-50"
                            )}
                        >
                            All Saved
                        </button>

                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-6 mb-2 px-2">Folders</div>

                        {loadingLists ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
                            </div>
                        ) : lists.map((list) => (
                            <button
                                key={list.id}
                                onClick={() => setActiveListId(list.id)}
                                className={cn(
                                    "flex items-center w-full px-4 py-2.5 rounded-xl font-medium text-sm text-left transition-all",
                                    activeListId === list.id ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" : "text-zinc-600 hover:bg-zinc-50 border border-transparent"
                                )}
                            >
                                {list.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 border border-zinc-100 rounded-3xl bg-zinc-50/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden relative">

                    {/* Header with Tabs */}
                    <div className="flex items-center justify-between px-8 py-4 border-b border-zinc-100 bg-white shadow-sm z-10">
                        <div className="flex gap-8">
                            <button
                                onClick={() => setActiveTab("products")}
                                className={cn(
                                    "py-2 text-sm font-semibold transition-all relative outline-none",
                                    activeTab === "products" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                Products
                                {activeTab === "products" && (
                                    <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-black rounded-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("suppliers")}
                                className={cn(
                                    "py-2 text-sm font-semibold transition-all relative outline-none",
                                    activeTab === "suppliers" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                Suppliers
                                {activeTab === "suppliers" && (
                                    <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-black rounded-full" />
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="font-semibold text-sm text-zinc-900 px-4 py-1.5 bg-zinc-100 rounded-lg">
                                {listData ? listData.name : "All Products"}
                            </div>
                            <div className="mx-2 h-4 w-px bg-zinc-200" />
                            <Link href="/">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100">
                                    <X size={20} />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                        {loadingListData ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 w-full h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
                            </div>
                        ) : listData?.products?.length > 0 ? (
                            <div className="p-8 pb-32">
                                <ProductGrid products={listData.products} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center h-full pb-32">
                                <div className="mb-8 opacity-20 transform scale-125">
                                    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="0" y="0" width="180" height="15" rx="7.5" fill="#E4E4E7" />
                                        <rect x="0" y="21" width="180" height="15" rx="7.5" fill="#F4F4F5" />
                                        <rect x="0" y="42" width="180" height="15" rx="7.5" fill="#E4E4E7" />
                                        <rect x="0" y="63" width="180" height="15" rx="7.5" fill="#FAFAFA" />
                                        <rect x="0" y="84" width="180" height="15" rx="7.5" fill="#E4E4E7" />
                                        <rect x="0" y="105" width="180" height="15" rx="7.5" fill="#F4F4F5" />
                                        <rect x="20" y="21" width="140" height="15" rx="7.5" fill="#00D49C" fillOpacity="0.1" />
                                        <rect x="20" y="63" width="140" height="15" rx="7.5" fill="#00D49C" fillOpacity="0.1" />
                                    </svg>
                                </div>
                                <h2 className="text-base font-semibold text-zinc-900 mb-6 max-w-sm">
                                    You haven't added any items to this list. Please start sourcing with Retails Store.
                                </h2>
                                <Link href="/">
                                    <Button className="bg-[#18181B] hover:bg-black text-white px-8 py-6 h-auto rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105">
                                        Start sourcing
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
