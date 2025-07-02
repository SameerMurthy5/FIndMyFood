"use client";
import { useMap } from "@/contexts/MapContext";

import React from "react";

const ClearMessagesButton = () => {
  const { setMessages } = useMap();

  async function handleClearMessages() {
    const res = await fetch("/api/chat", {
      method: "DELETE",
    });

    console.log("Clear messages response:", res);
    setMessages([]);
  }

  return (
    <button className="btn btn-error" onClick={handleClearMessages}>
      Clear Conversation
    </button>
  );
};

export default ClearMessagesButton;
