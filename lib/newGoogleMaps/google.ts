import { Place } from '@/types/Place';
import { LLMResponse } from '@/types/LLMResponse';
import { buildQuery } from '@/lib/newGoogleMaps/queryBuilder';
import { filterPlaces } from '@/lib/newGoogleMaps/filterPlaces';


export async function searchbyTextGoogle(intent: LLMResponse, currentLocation: any): Promise<{OGplaces: Place[], places: Place[], center: { lat: number; lng: number }}> {
    const { radius_meters, use_current_location } = intent;

    // build textQuery from LLMResponse
    const BuiltQuery = buildQuery(intent);
    console.log("Built query from intent:", BuiltQuery);
    const { textQuery, resolvedLocation, filters } = BuiltQuery;

    // Geolocate position using browser or google api
    const center = await resolveLocationCenter(resolvedLocation, use_current_location, currentLocation);
    const bounds = computeBoundingBox(center, radius_meters);


    // buid request
    const req_restricted = {
        textQuery: textQuery,
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

    // filter out irrelevent locations
    const filteredPlaces = filterPlaces(places, filters);

    return {OGplaces: places, center: center, places: filteredPlaces};
}

export async function resolveLocationCenter(
  intentLoc: string | undefined,
  useCurrentLocation: boolean,
  currentLocation: any
): Promise<{ lat: number; lng: number }> {

  const fallbackCenter = { lat: 42.3601, lng: -71.0589 }; // Boston fallback
  if (useCurrentLocation && currentLocation) {
    return currentLocation
  }

  if (intentLoc) {
    return await geocodeLocation(intentLoc).catch(() => fallbackCenter);
  }

  return fallbackCenter;
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
