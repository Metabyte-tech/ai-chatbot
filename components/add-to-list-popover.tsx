"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ListPlus, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
    getUserListsAction,
    createListAction,
    saveProductToListAction
} from "@/lib/actions/lists";
import type { Product } from "./product-carousel";

interface AddToListPopoverProps {
    products: Product | Product[];
    children: React.ReactNode;
}

export function AddToListPopover({ products, children }: AddToListPopoverProps) {
    const [open, setOpen] = useState(false);
    const [lists, setLists] = useState<any[]>([]);
    const [loadingLists, setLoadingLists] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [savingToListId, setSavingToListId] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            loadLists();
            setIsCreatingNew(false);
            setNewListName("");
        }
    }, [open]);

    const loadLists = async () => {
        setLoadingLists(true);
        try {
            const data = await getUserListsAction();
            setLists(data);
        } catch (error) {
            toast.error("Failed to load your lists");
        } finally {
            setLoadingLists(false);
        }
    };

    const handleCreateAndSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        try {
            setSavingToListId("new");
            const newList = await createListAction(newListName.trim());

            const productsArray = Array.isArray(products) ? products : [products];
            for (const p of productsArray) {
                await saveProductToListAction(newList.id, p);
            }

            toast.success(`Saved ${productsArray.length} ${productsArray.length === 1 ? 'product' : 'products'} to new list`);
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to create and save");
        } finally {
            setSavingToListId(null);
        }
    };

    const handleSaveToList = async (listId: string) => {
        try {
            setSavingToListId(listId);
            const productsArray = Array.isArray(products) ? products : [products];

            for (const p of productsArray) {
                await saveProductToListAction(listId, p);
            }

            toast.success(`Saved ${productsArray.length} ${productsArray.length === 1 ? 'product' : 'products'} to list`);
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to save");
        } finally {
            setSavingToListId(null);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 rounded-xl shadow-xl border border-zinc-200" align="end" onClick={(e) => e.stopPropagation()}>
                <div className="px-2 py-1.5 border-b border-zinc-100 mb-1">
                    <h4 className="font-semibold text-sm text-zinc-900">Add to list</h4>
                </div>

                <div className="flex flex-col max-h-[200px] overflow-y-auto mb-1">
                    {loadingLists ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                        </div>
                    ) : lists.length > 0 ? (
                        lists.map(list => (
                            <button
                                key={list.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSaveToList(list.id);
                                }}
                                disabled={savingToListId === list.id}
                                className="flex items-center text-sm px-2 py-2 text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors text-left"
                            >
                                {list.name}
                                {savingToListId === list.id && <Loader2 className="ml-auto h-3 w-3 animate-spin" />}
                            </button>
                        ))
                    ) : (
                        !isCreatingNew && (
                            <div className="text-xs text-zinc-500 italic p-2 px-2">No lists found.</div>
                        )
                    )}
                </div>

                {isCreatingNew ? (
                    <form onSubmit={handleCreateAndSave} className="flex items-center gap-1 p-1">
                        <Input
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="List name..."
                            className="h-8 text-xs rounded-md shadow-none focus-visible:ring-emerald-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-8 w-8 rounded-md bg-zinc-900 text-white shrink-0 hover:bg-zinc-800"
                            disabled={!newListName.trim() || savingToListId === "new"}
                        >
                            {savingToListId === "new" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        </Button>
                    </form>
                ) : (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsCreatingNew(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 text-[13px] font-medium px-2 py-2 text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors mt-1"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add to a new list
                    </button>
                )}
            </PopoverContent>
        </Popover>
    );
}
