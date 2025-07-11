"use client";

import { useState } from "react";
import { useMap } from "@/contexts/MapContext";
import { ChatMessage } from "@/types/chatMessage";

export default function TestForm() {
  const { setResturants, updateCenter, setMessages, Messages, resturants } =
    useMap();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Shared location retrieval logic
  const getCurrentLocation = async (): Promise<{
    lat: number;
    lng: number;
  } | null> => {
    try {
      return await new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          () => resolve(null), // ignore error
          { timeout: 5000 }
        );
      });
    } catch {
      return null;
    }
  };

  // Submit to /api/chat
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    const currentLocation = await getCurrentLocation();

    // Show user input + "thinking" placeholder
    const userMsg: ChatMessage = { role: "user", content: input };
    const aiPlaceholder: ChatMessage = {
      role: "assistant",
      content: "Thinking...",
    };
    setMessages([...Messages, userMsg, aiPlaceholder]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, curLoc: currentLocation }),
      });

      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();

      setResturants(data.filteredoutput);
      updateCenter(data.center);

      const messages = await fetch("/api/chat", { method: "GET" });
      const messagesData = await messages.json();
      setMessages(messagesData.msg);
    } catch {
      alert("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit to /api/ask
  const handleAsk = async () => {
    setLoading(true);
    setError("");

    const userMsg: ChatMessage = { role: "user", content: input };
    const aiPlaceholder: ChatMessage = {
      role: "assistant",
      content: "Thinking...",
    };
    setMessages([...Messages, userMsg, aiPlaceholder]);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, restaurants: resturants }),
      });

      if (!response.ok) throw new Error("Ask failed");
      const data = await response.json();

      console.log("Answer:", data.message);

      const messages = await fetch("/api/chat", { method: "GET" });
      const messagesData = await messages.json();
      setMessages(messagesData.msg);
    } catch {
      setError("Could not get an answer. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
        setInput("");
      }}
      className="mb-4"
    >
      <div className="flex justify-center mb-2 my-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Try 'indian food near me'"
          className="px-2 py-1 mr-2 w-80 text-center rounded outline"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
        <button
          type="button"
          className="bg-gray-600 text-white px-3 py-1 rounded"
          disabled={loading}
          onClick={handleAsk}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>
      {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
    </form>
  );
}
