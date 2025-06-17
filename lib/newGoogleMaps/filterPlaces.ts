import { Place } from "@/types/Place";

export type Filters = {
  minRating?: number;
  maxPriceLevel?: number;
  minPriceLevel?: number;
  includeTypes?: string[];
  excludeTypes?: string[];
};

export function filterPlaces(places: Place[], filters: Filters): Place[] {
  // filters out places based on the provided criteria
  return places.filter((place) => {
    const rating = place.rating ?? 0;
    const price = place.priceLevel ?? 0;
    const types = place.types ?? [];

    if (filters.minRating && rating < filters.minRating) return false;
    if (filters.minPriceLevel && price < filters.minPriceLevel) return false;
    if (filters.maxPriceLevel && price > filters.maxPriceLevel) return false;

    if (filters.excludeTypes && filters.excludeTypes.some(t => types.includes(t))) return false;
    if (filters.includeTypes && !filters.includeTypes.some(t => types.includes(t))) return false;

    return true;
  });
}
