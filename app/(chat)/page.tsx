import { cookies } from "next/headers";
import { Suspense } from "react";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <NewChatPage searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

async function NewChatPage({ searchParams }: { searchParams: { q?: string } }) {
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const id = generateUUID();
  const autoQuery = typeof searchParams.q === 'string' ? decodeURIComponent(searchParams.q) : undefined;

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={modelIdFromCookie?.value || DEFAULT_CHAT_MODEL}
        initialMessages={[]}
        initialVisibilityType="private"
        isReadonly={false}
        key={id}
        autoQuery={autoQuery}
      />
      <DataStreamHandler />
    </>
  );
}
