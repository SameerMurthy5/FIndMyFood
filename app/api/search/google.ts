import { Place } from '@/types/Place';
import { LLMResponse } from '@/types/LLMResponse';

export async function searchbyTextGoogle(intent: LLMResponse): Promise<{places: Place[], center: { lat: number; lng: number }}> {
    const {cuisine, vibe, location, use_current_location, radius_meters} = intent;

    // Build textQuery based on intent fields
    // TODO : replace this with AI
    const queryParts = [];
    if (vibe === "fancy") queryParts.push("fine dining");
    if (cuisine) queryParts.push(cuisine);
    queryParts.push("restaurant");

    const textQuery = queryParts.join(" "); // or do "Italian resturant" for testing, must be textQuery field:

    const textQuery2 = "Italian restaurant";

    const center = await resolveLocationCenter(intent);
    //console.log("Resolved center:", center);
    const bounds = computeBoundingBox(center, radius_meters);
    //console.log("Computed bounding box:", bounds);

    const req_restricted = {
        textQuery: textQuery2,
        locationRestriction: {
            rectangle: {
              low: {
                latitude: bounds.low.latitude,
                longitude: bounds.low.longitude
              },
              high: {
                latitude: bounds.high.latitude,
                longitude: bounds.high.longitude
              }
            }
          }
    }

    console.log("Request body for Google Places API:", req_restricted);

    //console.log("Request body for Google Places API:", requestBody);

    const res = await fetch(
        `https://places.googleapis.com/v1/places:searchText`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
            "X-Goog-FieldMask": "places.displayName,places.location,places.businessStatus,places.types,places.priceLevel,places.rating"

        },
          body: JSON.stringify(req_restricted),
        }
    );

    const data = await res.json();
    //console.log("Response from Google Places API: " + data.error_message + data.status);


    const places: Place[] = (data.places || []).map((p: any) => ({
        displayName: p.displayName?.text || "",
        location: {
          latitude: p.location.latitude,
          longitude: p.location.longitude
        },
        businessStatus: p.businessStatus,
        types: p.types || [],
        priceLevel: p.priceLevel,
        rating: p.rating
    }));

    return {places, center};
}

export async function resolveLocationCenter(intent: LLMResponse): Promise<{ lat: number; lng: number }> {
    if (intent.location) {
      const geocoded = await geocodeLocation(intent.location);
      return geocoded;
    } else {
      // Fallback default (boston)
      return { lat: 42.3601, lng: -71.0589 };
    }
}

async function geocodeLocation(locationText: string): Promise<{ lat: number; lng: number }> {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationText)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
  
    const data = await res.json();
    if (data.status !== "OK" || data.results.length === 0) {
      throw new Error("Failed to geocode location: " + data.status + data.errormessage );
    }
  
    const { lat, lng } = data.results[0].geometry.location;
    return { lat: lat, lng: lng };
}

export function computeBoundingBox(center: { lat: number; lng: number }, radiusMeters: number) {
    const earthRadius = 6378137; // meters
  
    const deltaLat = (radiusMeters / earthRadius) * (180 / Math.PI);
    const deltaLng = (radiusMeters / earthRadius) * (180 / Math.PI) / Math.cos(center.lat * Math.PI / 180);
  
    return {
      low: {
        latitude: center.lat - deltaLat,
        longitude: center.lng - deltaLng
      },
      high: {
        latitude: center.lat + deltaLat,
        longitude: center.lng + deltaLng
      }
    };
}