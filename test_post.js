const body = {
  message: {
    id: "c1df0c08-0131-4a1v-b097-abfe340abcde",
    role: "user",
    content: "car toys"
  },
  id: "2201b107-1011-4a11-b097-abfe340abcde",
  selectedChatModel: "gemini",
  selectedVisibilityType: "public"
};

fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
});
