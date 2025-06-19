import { LLMResponse } from "@/types/LLMResponse";
  
export type BuiltQuery = {
    textQuery: string;
    filters: {
        minRating?: number;
        maxPriceLevel?: number;
        minPriceLevel?: number;
        includeTypes?: string[];
        excludeTypes?: string[];
    };
    resolvedLocation: string;
};

export function buildQuery(intent: LLMResponse): BuiltQuery {
    const { cuisine, vibe, location = "", radius_meters } = intent;

    const queryParts: string[] = [];
    const filters: BuiltQuery["filters"] = {};

    // Vibe-specific mappings
    switch (vibe) {
        case "fancy":
            queryParts.push("fine dining");
            filters.minPriceLevel = 3;
            filters.minRating = 4.0;
        break;
        case "casual":
            queryParts.push("casual dining");
            filters.maxPriceLevel = 2;
        break;
        case "romantic":
            queryParts.push("romantic");
            filters.excludeTypes = ["bar", "night_club"];
        break;
        case "family-friendly":
            queryParts.push("family friendly");
            filters.excludeTypes = ["bar"];
        break;
        case "fast_food":
            queryParts.push("fast food");
            filters.includeTypes = ["restaurant", "meal_takeaway"];
            filters.maxPriceLevel = 1;
        default:
            // warning
            console.warn("unhandled vibe:", vibe);  
            // write to a log file          
        break;
    }

    if (cuisine) queryParts.push(cuisine);
    queryParts.push("restaurant");

    return {
        textQuery: queryParts.join(" "),
        filters,
        resolvedLocation: location,
    };
}
  