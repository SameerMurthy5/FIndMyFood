"use client";

import React, { useState } from "react";

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

const TestFormChat = () => {
  const [input, setInput] = useState("");
  const [chatResponse, setChatResponse] = useState<string | null>(null);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentLocation = await getCurrentLocation();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, curLoc: currentLocation }),
      });

      if (!response.ok) throw new Error("Chat request failed");
      const data = await response.json();
      setChatResponse(data.message);
      console.log("Chat response:", data);
    } catch (err) {
      console.error("Error sending chat message:", err);
      setChatResponse("Failed to get response.");
    }
  };

  return (
    <form onSubmit={handleChat} className="mb-4">
      <div className="flex justify-center items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something like: is this place vegetarian?"
          className="border px-3 py-2 rounded w-80"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-3 py-2 rounded"
        >
          Ask
        </button>
      </div>
      {chatResponse && (
        <p className="mt-4 text-center text-gray-800">{chatResponse}</p>
      )}
    </form>
  );
};

export default TestFormChat;
