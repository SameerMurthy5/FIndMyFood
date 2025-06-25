"use client";

import Maps from "@/components/Maps";
import Testform from "@/components/TestForm";

export default function MapAndChat() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Map Section */}
      <div className="w-2/3 h-full">
        <Maps heightClass="h-[1200px]" widthClass="w-full" />
      </div>

      {/* Chat Section */}
      <div className="w-1/2 h-full border-l border-gray-300 bg-black flex flex-col rounded">
        <Testform />
      </div>
    </div>
  );
}
