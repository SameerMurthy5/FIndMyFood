"use client";

import { useMap } from "@/contexts/MapContext";
import ChatBlob from "./ChatBlob";
import { useEffect } from "react";

export default function ChatBox() {
  const { Messages, setMessages } = useMap();

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch("/api/chat", { method: "GET" });
      const data = await res.json();
      console.log("Fetched messages:", data);
      setMessages(data.msg);
    };

    fetchMessages();
  }, []);

  return (
    <div className="rounded-lg p-4 h-full outline w-full">
      <h2 className="text-lg font-semibold mb-2 text-center">Conversation</h2>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {Messages.map((msg, idx) => (
          <div
            key={idx}
            className={`px-3 py-2 rounded ${
              msg.role === "user" ? "flex justify-end" : "flex justify-start"
            }`}
          >
            <ChatBlob sender={msg.role} text={msg.content} />
          </div>
        ))}
      </div>
    </div>
  );
}
