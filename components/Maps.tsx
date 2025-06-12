"use client";

import { useState, useEffect, useRef } from "react";
import loader from "@/lib/googleMaps/loader";
import { useMap } from "@/contexts/MapContext";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const {
    setMap,
    center,
    setCenter,
    map,
    llmResponse,
    markers,
    setMarkers,
    resturants,
    setResturants,
  } = useMap();

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
    const renderMarkers = async () => {
      if (!map || !resturants || resturants.length == 0) return; // wait until map is ready and resturants are available

      const { AdvancedMarkerElement } = await loader.importLibrary("marker");

      // clear previous markers
      if (markers && markers.length > 0) {
        markers.forEach((marker) => {
          marker.map = null; // this removes it from the map
        });
        setMarkers([]);
      }

      const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

      console.log("Rendering markers for restaurants:", resturants);

      resturants.forEach((my_place) => {
        if (my_place.location) {
          const marker = new AdvancedMarkerElement({
            map,
            position: {
              lat: my_place.location.latitude,
              lng: my_place.location.longitude,
            },
            title: my_place.displayName,
          });
          newMarkers.push(marker);
        }
      });

      setMarkers(newMarkers);
    };

    renderMarkers();
  }, [map, resturants]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-lg shadow" />;
}
