import Maps from "@/components/Maps";
import TestForm from "@/components/TestForm";
import { MapProvider } from "@/contexts/MapContext";
import React from "react";

const page = () => {
  return (
    <MapProvider>
      <div className="mx-5 my-4">
        Test Page
        <Maps />
        <TestForm />
      </div>
    </MapProvider>
  );
};

export default page;
