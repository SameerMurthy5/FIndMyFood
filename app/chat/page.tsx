"use client";
import ClearMessagesButton from "@/components/ClearMessagesButton";
import MapAndChat from "@/components/MapAndChat";
import { MapProvider, useMap } from "@/contexts/MapContext";
import { signOut } from "@/lib/actions";

import React from "react";

const page = () => {
  return (
    <MapProvider>
      <div className="mx-5 my-4">
        <MapAndChat />
        <div className="my-10 flex gap-4">
          <button className="btn btn-primary " onClick={signOut}>
            Sign Out
          </button>

          <ClearMessagesButton />
        </div>
      </div>
    </MapProvider>
  );
};

export default page;
