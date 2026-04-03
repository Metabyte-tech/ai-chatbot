"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";
import {
  Heart,
  History,
  Mail,
  MessageCircle,
  SquarePen,
  Search,
  Trash2,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarHistory } from "./sidebar-history";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, setOpen, state } = useSidebar();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isHistoryHovered, setIsHistoryHovered] = useState(false);

  const isCollapsed = state === "collapsed";
  const isGuest = !user || (user as any).type === "guest";

  const handleDeleteAll = () => {
    toast.success("All chats deleted successfully");
    setShowDeleteAllDialog(false);
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
        <SidebarHeader className="pt-6">
          <SidebarMenu>
            <SidebarMenuItem>
              {isCollapsed ? (
                <div
                  className="flex h-10 w-full items-center justify-center cursor-pointer transition-colors hover:bg-zinc-100 rounded-md"
                  onMouseEnter={() => setIsLogoHovered(true)}
                  onMouseLeave={() => setIsLogoHovered(false)}
                  onClick={() => setOpen(true)}
                >
                  {isLogoHovered ? (
                    <PanelLeft size={20} className="text-zinc-600" />
                  ) : (
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-zinc-900"
                    >
                      <path d="M12 2L2 22h4l2-4h8l2 4h4L12 2zm-4 12l4-8 4 8H8z" fill="currentColor" />
                      <path d="M12 10l-2 4h4l-2-4z" fill="#00D49C" />
                    </svg>
                  )}
                </div>
              ) : (
                <div className="flex h-10 w-full items-center justify-between px-2 mb-2">
                  <Link
                    href="/"
                    onClick={() => {
                      setOpenMobile(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-zinc-900"
                    >
                      <path d="M12 2L2 22h4l2-4h8l2 4h4L12 2zm-4 12l4-8 4 8H8z" fill="currentColor" />
                      <path d="M12 10l-2 4h4l-2-4z" fill="#00D49C" />
                    </svg>
                    <span className="font-bold text-2xl tracking-tight text-zinc-900">Retails Store</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-900"
                    onClick={() => setOpen(false)}
                  >
                    <PanelLeft size={20} />
                  </Button>
                </div>
              )}
            </SidebarMenuItem>

            <SidebarMenuItem className={!isCollapsed ? "px-2" : ""}>
              <SidebarMenuButton
                asChild
                tooltip="New chat"
                className="bg-zinc-100/80 text-zinc-900 hover:bg-zinc-200 mt-2 font-medium h-10"
              >
                <Link
                  href="/"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push("/");
                    router.refresh();
                  }}
                >
                  <SquarePen />
                  <span>New chat</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="px-2 gap-1 mt-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Product Search"
                className="h-10 text-muted-foreground hover:text-zinc-900"
              >
                <Link href="/search">
                  <Search />
                  <span>Product Search</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="My lists"
                className="h-10 text-muted-foreground hover:text-zinc-900"
              >
                <Link href="/lists">
                  <Heart />
                  <span>My lists</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Inquiries"
                className="h-10 text-muted-foreground hover:text-zinc-900"
              >
                <Link href="/inquiries">
                  <Mail />
                  <span>Inquiries</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem className="relative group/history">
              <SidebarMenuButton
                asChild
                tooltip={isCollapsed ? undefined : "History"}
                className="h-10 text-muted-foreground hover:text-zinc-900"
                onMouseEnter={() => isCollapsed && setIsHistoryHovered(true)}
                onMouseLeave={() => isCollapsed && setIsHistoryHovered(false)}
              >
                <div className="flex items-center gap-2 cursor-pointer w-full">
                  <History />
                  <span>History</span>
                </div>
              </SidebarMenuButton>

              {/* Hover Panel for History (only in collapsed state) */}
              {isCollapsed && isHistoryHovered && (
                <div
                  className="fixed left-[70px] top-10 z-[100] w-72 rounded-2xl bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-zinc-100 py-4 animate-in fade-in slide-in-from-left-2 duration-200 text-zinc-900"
                  onMouseEnter={() => setIsHistoryHovered(true)}
                  onMouseLeave={() => setIsHistoryHovered(false)}
                >
                  <div className="px-5 pb-4 border-b border-zinc-50 mb-2">
                    <h3 className="font-bold text-zinc-900 text-sm">Recent history</h3>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                    <SidebarHistory user={user} forceDisplay={true} />
                  </div>
                </div>
              )}
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Messages"
                className="h-10 text-muted-foreground hover:text-zinc-900"
              >
                <Link href="/messages">
                  <MessageCircle />
                  <span>Messages</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="mt-4">
            {!isCollapsed && !isGuest && (
              <div className="text-sm font-semibold text-zinc-500 mb-1 px-4">
                Chat history
              </div>
            )}
            <SidebarHistory user={user} />
          </div>
        </SidebarContent>

        <SidebarFooter className="pb-6">
          <SidebarMenu>
            <SidebarMenuItem className="flex justify-center">
              {!isGuest ? (
                <SidebarMenuButton
                  tooltip="Delete All Chats"
                  className="h-10 w-fit px-3 rounded-xl hover:bg-destructive/10 hover:text-destructive text-zinc-400"
                  onClick={() => setShowDeleteAllDialog(true)}
                >
                  <Trash2 />
                  <span>Delete All Chats</span>
                </SidebarMenuButton>
              ) : (
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-100 font-bold hover:bg-zinc-700 cursor-pointer ${!isCollapsed ? "w-full rounded-md" : ""
                    }`}
                  onClick={() => toast("Please sign in")}
                >
                  {!isCollapsed ? "Sign in / Sign up" : "N"}
                </div>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your chats and remove them from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
