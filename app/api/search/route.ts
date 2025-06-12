import { NextRequest, NextResponse } from "next/server";
import { searchbyTextGoogle } from "./google";
import { LLMResponse } from '@/types/LLMResponse';

export async function POST(req: NextRequest) {
    const { query } = await req.json();

    const structuredIntent: LLMResponse = {
        cuisine: "italian",
        vibe: "fancy",
        location: "West Lafayette, IN",
        use_current_location: false,
        open_now: false,
        radius_meters: 10000,
    };

    const {places, center} = await searchbyTextGoogle(structuredIntent);
    return NextResponse.json({message: query, parsed: structuredIntent, output: places, center: center});
}