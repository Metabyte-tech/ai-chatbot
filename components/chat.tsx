"use client";

import { useChat } from "@ai-sdk/react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { useSession } from "next-auth/react";
import { ChatHeader } from "@/components/chat-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import type { Vote } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { Attachment, ChatMessage } from "@/lib/types";
import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { ChevronDown, Search, Sparkles, ArrowRight } from "lucide-react";
import { Artifact } from "./artifact";
import { useDataStream } from "./data-stream-provider";
import { ArrowUpIcon } from "./icons";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import { toast } from "./toast";
import { LoginModal } from "./login-modal";
import { Button } from "./ui/button";
import type { VisibilityType } from "./visibility-selector";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
}) {
  const router = useRouter();

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { data: session, status: sessionStatus } = useSession();
  const { mutate } = useSWRConfig();

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // When user navigates back/forward, refresh to sync with URL
      router.refresh();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>("");
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);

  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
    addToolApprovalResponse,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    generateId: generateUUID,
    sendAutomaticallyWhen: ({ messages: currentMessages }) => {
      const lastMessage = currentMessages.at(-1);
      const shouldContinue =
        lastMessage?.parts?.some(
          (part) =>
            "state" in part &&
            part.state === "approval-responded" &&
            "approval" in part &&
            (part.approval as { approved?: boolean })?.approved === true
        ) ?? false;
      return shouldContinue;
    },
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        const lastMessage = request.messages.at(-1);
        const isToolApprovalContinuation =
          lastMessage?.role !== "user" ||
          request.messages.some((msg) =>
            msg.parts?.some((part) => {
              const state = (part as { state?: string }).state;
              return (
                state === "approval-responded" || state === "output-denied"
              );
            })
          );

        return {
          body: {
            id: request.id,
            ...(isToolApprovalContinuation
              ? { messages: request.messages }
              : { message: lastMessage }),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        if (
          error.message?.includes("AI Gateway requires a valid credit card")
        ) {
          setShowCreditCardAlert(true);
        } else {
          toast({
            type: "error",
            description: error.message,
          });
        }
      }
    },
  });

  const handleSendMessage = async (
    ...args: Parameters<UseChatHelpers<ChatMessage>["sendMessage"]>
  ) => {
    if (!session?.user || (session.user as any).type === "guest") {
      setLoginModalOpen(true);
      return;
    }
    return sendMessage(...args);
  };

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Vote[]>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  const isHero = messages.length === 0;

  return (
    <>
      <div className={`overscroll-behavior-contain flex min-w-0 touch-pan-y flex-col bg-background ${isHero ? "bg-hero-glow items-center justify-center relative min-h-dvh pb-20" : "h-dvh"}`}>
        {!isHero && (
          <ChatHeader
            chatId={id}
            isReadonly={isReadonly}
            selectedVisibilityType={initialVisibilityType}
          />
        )}

        {isHero && (
          <div className="flex flex-col items-center gap-12 px-4 text-center">
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-6xl font-extrabold tracking-tighter text-foreground sm:text-7xl">
                Accio
              </h1>
              <p className="max-w-xl text-xl font-medium text-muted-foreground">
                All tasks in one ask, smart sourcing with AI
              </p>
            </div>
          </div>
        )}

        {!isHero && (
          <Messages
            addToolApprovalResponse={addToolApprovalResponse}
            chatId={id}
            isArtifactVisible={isArtifactVisible}
            isReadonly={isReadonly}
            messages={messages}
            regenerate={regenerate}
            selectedModelId={initialChatModel}
            setMessages={setMessages}
            status={status}
            votes={votes}
          />
        )}

        <div className={isHero ? "mt-8 w-full max-w-3xl px-4 flex flex-col items-center gap-8" : "sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4"}>
          {!isReadonly && (
            <MultimodalInput
              attachments={attachments}
              chatId={id}
              input={input}
              messages={messages}
              onModelChange={setCurrentModelId}
              selectedModelId={currentModelId}
              selectedVisibilityType={visibilityType}
              sendMessage={handleSendMessage}
              setAttachments={setAttachments}
              setInput={setInput}
              setMessages={setMessages}
              status={status}
              stop={stop}
              onShowLogin={() => setLoginModalOpen(true)}
            />
          )}

          <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
        </div>

        {isHero && (
          <div className="mt-6 flex flex-col items-center gap-3 relative z-10 w-full max-w-3xl px-4">
            <div className="absolute inset-0 -top-8 bg-gradient-to-b from-teal-400/10 via-cyan-400/5 to-transparent blur-2xl -z-10 rounded-full" />

            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                className="rounded-full bg-white border-zinc-200/50 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 text-[13px] font-medium transition-all flex items-center h-[34px] px-3 gap-2"
                onClick={() => router.push("/search")}
              >
                <Search className="h-4 w-4 text-emerald-500" />
                <span className="text-zinc-700">Global product search</span>
              </Button>

              <Button
                variant="outline"
                className="rounded-full bg-white border-zinc-200/50 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 text-[13px] font-medium transition-all flex items-center h-[34px] px-3 gap-2"
                onClick={() => router.push("/design-with-ai")}
              >
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span className="text-zinc-700">Design with AI</span>
              </Button>

              <Button
                variant="outline"
                className="rounded-full bg-white border-zinc-200/50 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 text-[13px] font-medium transition-all h-[34px] px-4"
                onClick={() => {
                  setInput("Scan TikTok for viral potential");
                  handleSendMessage({ role: "user", parts: [{ type: "text", text: "Scan TikTok for viral potential" }] });
                }}
              >
                <span className="text-zinc-600">Scan TikTok for viral potential</span>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                className="rounded-full bg-white border-zinc-200/50 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 text-[13px] font-medium transition-all h-[34px] px-4"
                onClick={() => router.push("/supplier-search")}
              >
                <span className="text-zinc-600">Multi-platform supplier search</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-full bg-white border-zinc-200/50 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 text-[13px] font-medium transition-all h-[34px] px-4"
                onClick={() => router.push("/analyze-bestsellers")}
              >
                <span className="text-zinc-600">Analyze bestsellers</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-full bg-white border-zinc-200/50 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 text-[13px] font-medium transition-all h-[34px] px-4"
                onClick={() => router.push("/evaluate-market")}
              >
                <span className="text-zinc-600">Evaluate market potential</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-full bg-white border-zinc-200/50 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 text-[13px] font-medium transition-all h-[34px] px-4"
                onClick={() => router.push("/discover-trends")}
              >
                <span className="text-zinc-600">Discover trends</span>
              </Button>
            </div>
          </div>
        )}

        {isHero && (
          <div className="mt-8 flex w-full max-w-2xl justify-center z-10 px-4">
            <div className="group relative flex w-full max-w-[560px] items-center rounded-2xl bg-white shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-zinc-100/80 p-1.5 pr-6 transition-all hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] cursor-pointer overflow-hidden">
              <div className="flex items-center gap-4 relative z-10 w-full">
                {/* Left side graphical blob mimicking the image */}
                <div className="h-16 w-40 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-300 to-cyan-300 flex flex-col items-center justify-center overflow-hidden relative shrink-0">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                  <div className="flex gap-1.5 mb-1.5 z-10">
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-white/90 shadow-sm flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                    </div>
                    <div className="w-8 h-4 mt-0.5 rounded-full bg-white/70 shadow-sm"></div>
                  </div>
                  <div className="w-24 h-2 rounded-full bg-white/50 z-10"></div>
                </div>
                {/* Right side text */}
                <div className="flex flex-col gap-0.5 flex-1 py-1">
                  <h3 className="font-semibold text-zinc-900 text-[15px] leading-tight">The AI agent platform built for real business</h3>
                  <p className="text-[13px] text-zinc-500 leading-[1.3] pr-4">Beyond chat, a proactive agent team that run real business from store operations to sourcing.</p>
                </div>
                {/* Arrow */}
                <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </div>
          </div>
        )}

        {isHero && (
          <div className="absolute top-6 right-8 flex items-center gap-6 text-sm font-medium text-muted-foreground/80">
            <div className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              English - USD
              <ChevronDown className="h-3 w-3" />
            </div>
            <Button
              variant="default"
              className="rounded-full px-6 bg-black text-white hover:bg-black/80 font-semibold h-10 cursor-pointer"
              onClick={() => setLoginModalOpen(true)}
            >
              Sign in/sign up
            </Button>
          </div>
        )}

        {isHero && (
          <div className="absolute bottom-8 text-xs text-muted-foreground/50 flex flex-col items-center gap-2 cursor-pointer hover:text-muted-foreground transition-colors">
            <span>Scroll down or click to view examples</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </div>
        )}
      </div>

      <Artifact
        addToolApprovalResponse={addToolApprovalResponse}
        attachments={attachments}
        chatId={id}
        input={input}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedModelId={currentModelId}
        selectedVisibilityType={visibilityType}
        sendMessage={handleSendMessage}
        setAttachments={setAttachments}
        setInput={setInput}
        setMessages={setMessages}
        status={status}
        stop={stop}
        votes={votes}
      />

      <AlertDialog
        onOpenChange={setShowCreditCardAlert}
        open={showCreditCardAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              This application requires{" "}
              {process.env.NODE_ENV === "production" ? "the owner" : "you"} to
              activate Vercel AI Gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open(
                  "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
                  "_blank"
                );
                window.location.href = "/";
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
