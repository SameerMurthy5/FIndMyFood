"use client";
import React from "react";
import { useLoadScript, GoogleMap, Libraries } from "@react-google-maps/api";

const libraries: Libraries = ["places"];

const Maps = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "1000px" }}
      center={{ lat: 40.7128, lng: -74.006 }}
      zoom={20}
    >
      {/* Any children like markers go here */}
    </GoogleMap>
  );
};

export default Maps;
