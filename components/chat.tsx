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
import { UserMenu } from "./user-menu";
import { Button } from "./ui/button";
import { ProductCarousel } from "./product-carousel";
import type { VisibilityType } from "./visibility-selector";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  renderCustomEmptyState,
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
}) {
  const router = useRouter();

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
  const [templateCategories, setTemplateCategories] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [agentPlan, setAgentPlan] = useState<string[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/templates");
        const data = await res.json();
        setTemplateCategories(data.categories || []);
      } catch (e) {
        console.error("Failed to fetch templates", e);
      }
    }
    fetchTemplates();
  }, []);

  const handleTemplateClick = async (template: any) => {
    openTemplateModal(template);
  };

  const openTemplateModal = async (template: any) => {
    setSelectedTemplate(template);
    setIsPlanning(true);
    setAgentPlan([]); // Clear previous plan

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        body: JSON.stringify({
          query: template.title,
          template_id: template.id
        }),
      });
      const data = await res.json();
      setAgentPlan(data.plan || []);
    } catch (e) {
      console.error("Failed to generate plan", e);
      setAgentPlan(["Analyze request", "Research data", "Generate report"]);
    }
  };

  const startAgentTask = () => {
    if (!selectedTemplate) return;

    const subject = input || "latest market data";
    const expertPrompt = selectedTemplate.prompt.replace("{query}", subject);

    // Clear input to give visual feedback that task started
    setInput("");

    handleSendMessage({
      role: "user",
      parts: [{ type: "text", text: expertPrompt }]
    }, {
      body: {
        template_id: selectedTemplate.id,
        subject: subject
      }
    });

    setIsPlanning(false);
    setSelectedTemplate(null);
  };

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
              const state = part && typeof part === 'object' && "state" in part ? (part as any).state : undefined;
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
            template_id: selectedTemplate?.id,
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

  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const templateIdParam = searchParams.get("template");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);
  const [templateLoaded, setTemplateLoaded] = useState(false);



  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);

      if (window.history.state && !window.history.state.tree) {
        window.location.replace(`/chat/${id}`);
      } else {
        router.replace(`/chat/${id}`, { scroll: false });
      }
    }
  }, [query, sendMessage, hasAppendedQuery, id, router]);

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

              <div className="mt-8 flex flex-col items-center gap-3 relative z-10 w-full max-w-3xl px-4">
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

              <div className="mt-12 flex w-full max-w-2xl justify-center z-10 px-4">
                <div className="group relative flex w-full max-w-[560px] items-center rounded-2xl bg-white shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-zinc-100/80 p-1.5 pr-6 transition-all hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] cursor-pointer overflow-hidden">
                  <div className="flex items-center gap-4 relative z-10 w-full">
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
                    <div className="flex flex-col gap-0.5 flex-1 py-1">
                      <h3 className="font-semibold text-zinc-900 text-[15px] leading-tight">The AI agent platform built for real business</h3>
                      <p className="text-[13px] text-zinc-500 leading-[1.3] pr-4">Beyond chat, a proactive agent team that run real business from store operations to sourcing.</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-12 text-xs text-muted-foreground/50 flex flex-col items-center gap-2 cursor-pointer hover:text-muted-foreground transition-colors group">
                <span>Scroll down or click to view examples</span>
                <ChevronDown className="h-4 w-4 animate-bounce" />
              </div>
            </div>
          )
        ) : (
          <>
            <ChatHeader
              chatId={id}
              isReadonly={isReadonly}
              selectedVisibilityType={initialVisibilityType}
            />
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
          </>
        )}

        {!renderCustomEmptyState && isHero && !isPlanning && (
          <div className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 min-h-screen">
            <TemplateGrid
              categories={templateCategories}
              onTemplateClick={handleTemplateClick}
            />
          </div>
        )}

        {!renderCustomEmptyState && isHero && isPlanning && (
          <div className="flex flex-col items-center justify-center min-h-dvh w-full px-4 animate-in fade-in zoom-in duration-300">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-zinc-100 p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 text-emerald-600 font-semibold mb-2">
                <Sparkles className="h-5 w-5" />
                <span>Agent Task Planning</span>
              </div>

              <h2 className="text-2xl font-bold text-zinc-900">{selectedTemplate?.title}</h2>
              <p className="text-zinc-500">{selectedTemplate?.description}</p>

              <div className="flex flex-col gap-4 mt-4">
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Execution Plan</p>
                {agentPlan.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-4 bg-zinc-100 animate-pulse rounded-full w-full" />
                    ))}
                    <p className="text-xs text-zinc-400 italic mt-2 animate-pulse">Thinking through your request to create the most effective approach...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {agentPlan.map((step, i) => (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-zinc-50 border border-zinc-100/50">
                        <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <span className="text-zinc-700 font-medium leading-tight">{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-100">
                <Button
                  variant="ghost"
                  className="rounded-xl text-zinc-500 hover:text-zinc-900"
                  onClick={() => setIsPlanning(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 shadow-lg shadow-emerald-200"
                  disabled={agentPlan.length === 0}
                  onClick={startAgentTask}
                >
                  Start Agent Mode Task
                </Button>
              </div>
            </div>
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

function TemplateGrid({ categories, onTemplateClick }: { categories: any[], onTemplateClick: (t: any) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredCategories = selectedCategory === "All"
    ? categories
    : categories.filter(c => c.name === selectedCategory);

  if (!categories || categories.length === 0) return null;

  const categoryNames = ["All", ...categories.map(c => c.name)];

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto py-20 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Expert Agent Templates</h2>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {categoryNames.map(name => (
            <Button
              key={name}
              variant={selectedCategory === name ? "default" : "outline"}
              className={`rounded-full px-5 h-9 text-sm font-semibold transition-all ${selectedCategory === name
                ? "bg-zinc-900 text-white shadow-md"
                : "bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              onClick={() => setSelectedCategory(name)}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCategories.flatMap(cat => cat.templates).map((template: any) => (
          <div
            key={template.id}
            className="group relative flex flex-col gap-4 p-6 rounded-3xl bg-white border border-zinc-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all cursor-pointer ring-1 ring-zinc-200/50 hover:ring-emerald-500/30"
            onClick={() => onTemplateClick(template)}
          >
            <div className="flex items-center justify-between">
              <div className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {template.id.split('_')[0]}
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-zinc-900 leading-tight pr-4">{template.title}</h4>
              <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">{template.description}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-50">
              <span className="text-[11px] font-bold text-emerald-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                View Result <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
