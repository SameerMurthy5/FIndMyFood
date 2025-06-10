"use client";

import { useState, useEffect, useRef } from "react";
import loader from "@/lib/googleMaps/loader";
import { LLMToRequest } from "@/lib/googleMaps/utils";
import { useMap } from "@/contexts/MapContext";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { setMap, updateCenter, map, llmResponse, markers, setMarkers } =
    useMap();

  useEffect(() => {
    const initializeMap = async () => {
      const { Map } = await loader.importLibrary("maps");

      const center = new google.maps.LatLng(42.352312, -71.042877); // Boston (default)

      const mapInstance = new Map(mapRef.current!, {
        center,
        zoom: 13,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
      });

      setMap(mapInstance); // set map instance to state to use later
    };

    initializeMap();
  }, []);

  useEffect(() => {
    const searchNearbyRestaurants = async () => {
      if (!map || !llmResponse) return; // wait until map is ready and LLM response is available

      // Clear previous markers
      if (markers && markers.length > 0) {
        markers.forEach((marker) => {
          marker.map = null; // this removes it from the map
        });
        setMarkers([]);
      }

      const { AdvancedMarkerElement } = await loader.importLibrary("marker");
      const { Place } = await loader.importLibrary("places");

      const center = map.getCenter()!;

      const centerLatLng: google.maps.LatLngLiteral = {
        lat: center.lat(),
        lng: center.lng(),
      };

      const requestfromLLM = await LLMToRequest(
        llmResponse,
        updateCenter,
        centerLatLng
      );

      console.log("Request from LLM:", requestfromLLM);

      const { places } = await Place.searchByText(requestfromLLM);
      console.log("Places found:", places);

      const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

      places.forEach((place) => {
        if (place.location) {
          const marker = new AdvancedMarkerElement({
            map,
            position: place.location,
            title: place.displayName,
          });
          newMarkers.push(marker);
        }
      });

      setMarkers(newMarkers);
    };

    searchNearbyRestaurants();
  }, [map, llmResponse]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-lg shadow" />;
}
