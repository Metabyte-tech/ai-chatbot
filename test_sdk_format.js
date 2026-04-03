import { createUIMessageStream } from 'ai';

async function test() {
  const stream = createUIMessageStream({
    async execute({ writer }) {
      writer.write({
        type: "text-start",
        id: "msg-123"
      });
      writer.write({
        type: "text-delta",
        id: "msg-123",
        delta: "Hello Vercel AI SDK"
      });
    }
  });

  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // value is a string from ui message stream
    console.log("Chunk:", value);
  }
}

test().catch(console.error);
