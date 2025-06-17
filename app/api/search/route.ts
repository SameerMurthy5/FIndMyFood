import { NextRequest, NextResponse } from "next/server";
import { searchbyTextGoogle } from "@/lib/newGoogleMaps/google";
import { LLMResponse } from '@/types/LLMResponse';

export async function POST(req: NextRequest) {
    const { query } = await req.json();

    const structuredIntent: LLMResponse = { // returned by LLM 
        cuisine: "italian",
        vibe: "casual",
        location: "West Lafayette, IN",
        use_current_location: false,
        open_now: false,
        radius_meters: 10000,
    };

    const {OGplaces, places, center} = await searchbyTextGoogle(structuredIntent);
    return NextResponse.json({message: query, parsed: structuredIntent, filteredoutput: places, OGplaces: OGplaces, center: center});
}