"use client";
// context/MapContext.tsx
import { createContext, useContext, useState } from "react";

type MapContextType = {
  map: google.maps.Map | null;
  setMap: (map: google.maps.Map) => void;
  updateCenter: (center: google.maps.LatLngLiteral) => void;
  llmResponse: LLMResponse | null;
  setLLMResponse: (response: LLMResponse | null) => void;
  markers: google.maps.marker.AdvancedMarkerElement[] | null;
  setMarkers: (
    markers: google.maps.marker.AdvancedMarkerElement[] | null
  ) => void;
};

type LLMResponse = {
  search_text: string;
  location?: string;
  use_current_location: boolean;
  radius_meters: number;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [llmResponse, setLLMResponse] = useState<LLMResponse | null>(null);
  const [markers, setMarkers] = useState<
    google.maps.marker.AdvancedMarkerElement[] | null
  >(null);

  const updateCenter = (center: google.maps.LatLngLiteral) => {
    map?.setCenter(center);
    map?.setZoom(14);
  };

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        updateCenter,
        llmResponse,
        setLLMResponse,
        markers,
        setMarkers,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) throw new Error("MapProvider");
  return context;
};
