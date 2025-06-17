"use client";

import { useState } from "react";
import { useMap } from "@/contexts/MapContext";

export default function TestForm() {
  const { setResturants, updateCenter } = useMap();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Try to get user location if available
    let currentLocation = null;
    try {
      currentLocation = await new Promise<{ lat: number; lng: number } | null>(
        (resolve, reject) => {
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
        }
      );
    } catch (e) {
      console.warn("Could not get location", e);
    }

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input, curLoc: currentLocation }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      console.log("Backend response:", data);

      setResturants(data.filteredoutput);
      updateCenter(data.center);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </form>
  );
}
