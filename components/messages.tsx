import type { UseChatHelpers } from "@ai-sdk/react";
import { ArrowDownIcon } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { useDataStream } from "./data-stream-provider";
import { Greeting } from "./greeting";
import { PreviewMessage, ThinkingMessage } from "./message";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

type MessagesProps = {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedModelId: string;
};

function PureMessages({
  addToolApprovalResponse,
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
  selectedModelId: _selectedModelId,
}: MessagesProps) {
  const pathname = usePathname();
  const isSearchPage = pathname === "/search";

  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
  } = useMessages({
    status,
  });

  useDataStream();

  return (
    <div className="relative flex-1">
      <div
        className="absolute inset-0 touch-pan-y overflow-y-auto"
        ref={messagesContainerRef}
      >
        <div className={cn(
          "mx-auto flex min-w-0 flex-col gap-4 px-2 py-4 md:gap-6 md:px-4",
          isSearchPage ? "max-w-[100%] w-full" : "max-w-4xl"
        )}>
          {isSearchPage && messages.length > 0 && (
            <div className="w-full flex justify-center mb-6 sticky top-0 z-20 pt-2 pb-4 bg-white/80 backdrop-blur-md px-4">
              <div className="w-full max-w-2xl relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search for more products..."
                  className="w-full h-11 pl-10 pr-4 rounded-full border border-zinc-200 bg-white shadow-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        // Assuming the parent handles the message stream. 
                        // For simplicity in this component, we might need a prop or just let it be.
                        // But since we are using Chat, we can find the input and trigger it or just use window dispatch.
                        // However, a better way is to pass handleSendMessage down.
                        (window as any).__ACCIO_SEARCH?.(val);
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {messages.length === 0 && <Greeting />}

          {messages
            .filter((message) => !isSearchPage || message.role !== 'user')
            .map((message, index) => (
              <PreviewMessage
                addToolApprovalResponse={addToolApprovalResponse}
                chatId={chatId}
                isLoading={
                  status === "streaming" && messages.length - 1 === index
                }
                isReadonly={isReadonly}
                key={message.id}
                message={message}
                regenerate={regenerate}
                requiresScrollPadding={
                  hasSentMessage && index === messages.length - 1
                }
                setMessages={setMessages}
                vote={
                  votes
                    ? votes.find((vote) => vote.messageId === message.id)
                    : undefined
                }
              />
            ))}

          {status === "submitted" &&
            !messages.some((msg) =>
              msg.parts?.some(
                (part) => part && "state" in part && part.state === "approval-responded"
              )
            ) && <ThinkingMessage />}

          <div
            className="min-h-[24px] min-w-[24px] shrink-0"
            ref={messagesEndRef}
          />
        </div>
      </div>

      <button
        aria-label="Scroll to bottom"
        className={`absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border bg-background p-2 shadow-lg transition-all hover:bg-muted ${isAtBottom
          ? "pointer-events-none scale-0 opacity-0"
          : "pointer-events-auto scale-100 opacity-100"
          }`}
        onClick={() => scrollToBottom("smooth")}
        type="button"
      >
        <ArrowDownIcon className="size-4" />
      </button>
    </div>
  );
}

// Ensure cn is imported
import { cn } from "@/lib/utils";


export const Messages = PureMessages;
