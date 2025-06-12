export interface Place  {
    displayName: string;
    location: {
      latitude: number;
      longitude: number;
    };
    businessStatus?: string;
    types?: string[];
    priceLevel?: number;
    rating?: number;
}
  