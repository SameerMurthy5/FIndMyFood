"use client";

import { useState, useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
      });

      const { Map } = await loader.importLibrary("maps");

      const center = new google.maps.LatLng(37.7749, -122.4194); // San Francisco

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
      if (!map) return; // wait until map is ready

      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
      });

      const { AdvancedMarkerElement } = await loader.importLibrary("marker");
      const { Place } = await loader.importLibrary("places");

      const center = map.getCenter();

      const request = {
        fields: ["displayName", "location", "businessStatus"],
        locationRestriction: {
          center: center!,
          radius: 1000,
        },
        includedPrimaryTypes: ["restaurant"],
        language: "en-US",
        region: "us",
      };

      const { places } = await Place.searchNearby(request);

      places.forEach((place) => {
        if (place.location) {
          new AdvancedMarkerElement({
            map,
            position: place.location,
            title: place.displayName,
          });
        }
      });
    };

    searchNearbyRestaurants();
  }, [map]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-lg shadow" />;
}
