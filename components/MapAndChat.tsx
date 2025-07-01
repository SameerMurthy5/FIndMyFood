"use client";

import Maps from "@/components/Maps";
import Testform from "@/components/TestForm";
import ChatBox from "./ChatBox";

export default function MapAndChat() {
  return (
    <div className="flex h-screen w-screen">
      {/* Map Section */}
      <div className="w-2/3 h-full">
        <Maps heightClass="h-[1200px]" widthClass="w-full" />
      </div>

      {/* Chat Section */}
      <div className="w-1/2 h-full">
        <div className="flex flex-col h-11/12 px-4 py-2 ">
          <ChatBox />
        </div>

        <Testform />
      </div>
    </div>
  );
}
