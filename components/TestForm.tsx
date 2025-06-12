"use client";

import { useState } from "react";
import { useMap } from "@/contexts/MapContext";

export default function TestForm() {
  const { setResturants, updateCenter } = useMap();
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // api route test
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: input }),
    });

    const data = await response.json();
    console.log("Backend response:", data);
    setResturants(data.output);
    updateCenter(data.center);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Try 'indian food'"
        className="border px-2 py-1 mr-2"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        Search
      </button>
    </form>
  );
}
