"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderHeart, Loader2, ChevronRight } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar";
import { getUserListsAction } from "@/lib/actions/lists";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function SidebarLists({ user }: { user: any }) {
    const { state } = useSidebar();
    const [lists, setLists] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (user) {
            loadLists();
        }
    }, [user]);

    const loadLists = async () => {
        setLoading(true);
        try {
            const data = await getUserListsAction();
            setLists(data);
        } catch (error) {
            console.error("Failed to load lists in sidebar", error);
        } finally {
            setLoading(false);
        }
    };

    if (state === "collapsed" || !user) return null;

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between pr-2">
                <span>My Lists</span>
                <Link href="/lists" className="text-[10px] text-zinc-400 hover:text-zinc-900 transition-colors uppercase font-bold tracking-tighter">
                    View all
                </Link>
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {loading ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
                        </div>
                    ) : lists.length > 0 ? (
                        lists.slice(0, 5).map((list) => (
                            <SidebarMenuItem key={list.id}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === `/lists/${list.id}`}
                                    className={cn(
                                        "h-9 px-3 rounded-lg transition-all",
                                        pathname === `/lists/${list.id}` ? "bg-emerald-50 text-emerald-700 font-medium" : "text-zinc-500 hover:text-zinc-900"
                                    )}
                                >
                                    <Link href={`/lists`}>
                                        <FolderHeart className={cn("size-4", pathname === `/lists/${list.id}` ? "text-emerald-600" : "text-zinc-400")} />
                                        <span className="truncate">{list.name}</span>
                                        <ChevronRight className="ml-auto size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-xs text-zinc-400 italic">
                            No lists yet
                        </div>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
