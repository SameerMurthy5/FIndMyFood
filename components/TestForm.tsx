"use client";

import { useState } from "react";
import { useMap } from "@/contexts/MapContext";

export default function TestForm() {
  const { setLLMResponse } = useMap();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLLMResponse({
      search_text: input,
      location: "Boston, MA",
      use_current_location: false,
      radius_meters: 1600,
    });
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
