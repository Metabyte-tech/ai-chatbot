async function sniff() {
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ 
        id: 'debug-id',
        message: { role: 'user', content: 'hi', id: 'msg-id', parts: [{ type: 'text', text: 'hi' }] },
        selectedChatModel: 'gpt-4o',
        selectedVisibilityType: 'private'
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const text = await res.text();
    console.log("STREAM OUTPUT:");
    console.log(text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

sniff();
