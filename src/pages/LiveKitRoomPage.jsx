import { useState, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://api.adinkramedia.com";

export default function LiveKitRoomPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ancestor/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMsg] }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botText = "";

      // Add placeholder for assistant
      setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk === undefined) continue;

        botText += chunk;

        // Update last assistant message
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", text: botText };
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Ancestor AI is unavailable." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      <header className="p-4 text-center border-b border-gray-800 bg-gray-900">
        <h1 className="text-lg font-semibold text-yellow-400">
          Ancestor AI Live Chat
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] p-3 rounded-2xl break-words text-sm sm:text-base ${
              msg.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-gray-800 text-gray-200"
            }`}
          >
            {msg.role === "assistant" && msg.text === "" ? (
              <span className="italic">
                Ancestor is thinking<span className="animate-pulse">...</span>
              </span>
            ) : (
              msg.text
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-3 border-t border-gray-800 bg-gray-900 flex">
        <input
          className="flex-1 p-2 rounded-l-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
          placeholder="Ask Ancestor AI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-yellow-400 text-black px-4 rounded-r-lg font-semibold hover:bg-yellow-300 disabled:opacity-50 text-sm sm:text-base"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </footer>
    </div>
  );
}
