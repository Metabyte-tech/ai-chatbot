"use client";

import { useChat } from "@ai-sdk/react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
const useChatTransport = false; // Temporarily disabled to sniff working protocol
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
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
import { ArrowRight, ChevronDown } from "lucide-react";
import { Artifact } from "./artifact";
import { useDataStream } from "./data-stream-provider";
import { ArrowUpIcon } from "./icons";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import { toast } from "./toast";
import { LoginModal } from "./login-modal";
import { UserMenu } from "./user-menu";
import { Button } from "./ui/button";
import { ProductCarousel } from "./product-carousel";
import type { VisibilityType } from "./visibility-selector";
import { CategoryGrid } from "./category-grid";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  renderCustomEmptyState,
  autoQuery,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  renderCustomEmptyState?: (props: {
    sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
    setInput: Dispatch<SetStateAction<string>>;
    chatId: string;
  }) => React.ReactNode;
  autoQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isSearchPage = pathname === "/search";

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { data: session, status: sessionStatus } = useSession();
  const { mutate } = useSWRConfig();

  // Handle browser back/forward navigation

  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>("");
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);


  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  const chatHelpers = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    generateId: generateUUID,
    sendAutomaticallyWhen: ({ messages: currentMessages }) => {
      const lastMessage = currentMessages.at(-1);
      const shouldContinue =
        lastMessage?.parts?.some(
          (part) =>
            part &&
            "state" in part &&
            (part as any).state === "approval-responded" &&
            (part as { approval?: { approved?: boolean } })?.approval?.approved === true
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
              if (!part || typeof part !== 'object' || !("state" in part)) return false;
              const state = (part as any).state;
              return (
                state === "approval-responded" || state === "output-denied"
              );
            })
          ) || false;

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
      if (typeof window !== "undefined" && (pathname === "/" || pathname === "/search")) {
        window.history.replaceState({}, "", `/chat/${id}`);
      }
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

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
    addToolApprovalResponse,
  } = chatHelpers;

  const reload = (chatHelpers as any).reload || chatHelpers.regenerate;

  const handleSendMessage = async (
    ...args: Parameters<UseChatHelpers<ChatMessage>["sendMessage"]>
  ) => {
    if (!session?.user || (session.user as any).type === "guest") {
      // setLoginModalOpen(true);
      // return;
    }
    return sendMessage(...args);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && isSearchPage) {
      (window as any).__ACCIO_SEARCH = (text: string) => {
        handleSendMessage({ role: "user", parts: [{ type: "text", text }] });
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__ACCIO_SEARCH;
      }
    };
  }, [isSearchPage, handleSendMessage]);

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const hasAppendedRef = useRef(false);



  useEffect(() => {
    const effectiveQuery = query || autoQuery;
    if (effectiveQuery && !hasAppendedRef.current) {
      hasAppendedRef.current = true;

      // Change the URL bar WITHOUT triggering a Next.js navigation.
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", `/chat/${id}`);
      }

      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: effectiveQuery }],
      });
    }
  }, [query, autoQuery, sendMessage, id]);

  const { data: votes } = useSWR<Vote[]>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    reload,
    setMessages,
  });

  const isHero = messages.length === 0;

  return (
    <>
      <div className={`overscroll-behavior-contain flex min-w-0 touch-pan-y flex-col bg-background ${isHero ? "bg-hero-glow" : "h-dvh overflow-hidden"}`}>
        {isHero ? (
          renderCustomEmptyState ? (
            renderCustomEmptyState({ sendMessage: handleSendMessage, setInput, chatId: id })
          ) : (
            <div className="flex flex-col items-center justify-center min-h-dvh w-full relative">
              {/* Header elements (Language, Login) */}
              <div className="absolute top-6 right-8 flex items-center gap-6 text-sm font-medium text-muted-foreground/80 z-20">
                <div className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  English - USD
                  <ChevronDown className="h-3 w-3" />
                </div>
                {session?.user && (session.user as any).type !== "guest" ? (
                  <UserMenu />
                ) : (
                  <Button
                    variant="default"
                    className="rounded-full px-6 bg-black text-white hover:bg-black/80 font-semibold h-10 cursor-pointer"
                    onClick={() => setLoginModalOpen(true)}
                  >
                    Sign in/sign up
                  </Button>
                )}
              </div>

              {/* Main Hero Content */}
              <div className="flex flex-col items-center gap-4 text-center mb-8 px-4">
                <h1 className="text-6xl font-extrabold tracking-tighter text-foreground sm:text-7xl">
                  Retails Store
                </h1>
                <p className="max-w-xl text-xl font-medium text-muted-foreground">
                  All tasks in one ask, smart sourcing with AI
                </p>
              </div>

              <div className="w-full max-w-3xl px-4 flex flex-col items-center gap-8">
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

              <CategoryGrid
                onQuery={(text) => handleSendMessage({ role: 'user', parts: [{ type: 'text', text }] })}
              />

              <div className="absolute bottom-12 text-xs text-muted-foreground/50 flex flex-col items-center gap-2 cursor-pointer hover:text-muted-foreground transition-colors group">
                <span>Explore universal categories above</span>
                <ChevronDown className="h-4 w-4 animate-bounce" />
              </div>
            </div>
          )
        ) : (
          <>
            {!isSearchPage && (
              <ChatHeader
                chatId={id}
                isReadonly={isReadonly}
                selectedVisibilityType={initialVisibilityType}
              />
            )}
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
            {!isSearchPage && (
              <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
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
            )}
          </>
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

