"use client";
import MapAndChat from "@/components/MapAndChat";
import TestFormChat from "@/components/TestFormChat";
import { MapProvider } from "@/contexts/MapContext";
import { signOut } from "@/lib/actions";

import React from "react";

async function handleClearMessages() {
  const res = await fetch("/api/clear", {
    method: "DELETE",
  });

  console.log("Clear messages response:", res);
}

const page = () => {
  return (
    <MapProvider>
      <div className="mx-5 my-4">
        Test Page
        <MapAndChat />
        <div className="my-10 flex gap-4">
          <button className="btn btn-primary " onClick={signOut}>
            Sign Out
          </button>

          <button className="btn btn-error" onClick={handleClearMessages}>
            clear message history
          </button>
        </div>
      </div>
    </MapProvider>
  );
};

export default page;
