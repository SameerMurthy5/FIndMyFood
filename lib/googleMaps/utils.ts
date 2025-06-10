import loader from "./loader";

// function to get  bounds (LatLngBounds) from a center point and radius
export async function getBoundsFromRadius(
    center: google.maps.LatLngLiteral,
    radiusMeters: number
  ): Promise<google.maps.LatLngBounds> {
    const { spherical } = await loader.importLibrary("geometry");
    const centerPoint = new google.maps.LatLng(center.lat, center.lng);
  
    const north = spherical.computeOffset(centerPoint, radiusMeters, 0);
    const south = spherical.computeOffset(centerPoint, radiusMeters, 180);
    const east = spherical.computeOffset(centerPoint, radiusMeters, 90);
    const west = spherical.computeOffset(centerPoint, radiusMeters, 270);
  
    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(south.lat(), west.lng()),
      new google.maps.LatLng(north.lat(), east.lng())
    );
  
    return bounds;
  }


// TODO function to convert chatGPT response to Google Maps API request
interface LLMResponse {
    search_text: string;
    location?: string;
    use_current_location: boolean;
    radius_meters: number;
}

export async function LLMToRequest(
    LLMResponse: LLMResponse, 
    onUpdateCenter: (center: google.maps.LatLngLiteral) => void,
    currentLocation?: google.maps.LatLngLiteral
    ) {
    const { search_text, location, use_current_location, radius_meters } = LLMResponse;

    let center: google.maps.LatLngLiteral;

    // if use_current_location is true, use location parameter
    if (use_current_location && currentLocation) {
      center = currentLocation;
    } else if (location) {
      const { Geocoder } = await loader.importLibrary('geocoding');
      const geocoder = new Geocoder();
  
      const results = await geocoder.geocode({ address: location });
      if (!results.results[0]) throw new Error("Location not found");
  
      center = {
        lat: results.results[0].geometry.location.lat(),
        lng: results.results[0].geometry.location.lng(),
      };
    } else {
      throw new Error("No valid location provided");
    }
    onUpdateCenter(center); // update center in parent component
  
    const bounds = await getBoundsFromRadius(center, radius_meters);
  
    return {
      textQuery: search_text,
      locationRestriction: bounds,
      fields: ['displayName', 'location', 'businessStatus'],
      includedType: 'restaurant',
    };
}