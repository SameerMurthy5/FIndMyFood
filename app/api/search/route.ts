import { NextRequest, NextResponse } from "next/server";
import { searchbyTextGoogle } from "@/lib/newGoogleMaps/google";
import { LLMResponse } from '@/types/LLMResponse';
import { parseQueryWithLLM } from "@/lib/newGoogleMaps/llm";

export async function POST(req: NextRequest) {
    const { query, curLoc } = await req.json();
    console.log("current location:", curLoc);

    const structuredIntent: LLMResponse = { // returned by LLM 
        cuisine: "italian",
        vibe: "",
        location: "West Lafayette, IN",
        use_current_location: true,
        open_now: false,
        radius_meters: 10000,
    };

    const intent = await parseQueryWithLLM(query);
    console.log("Parsed intent:", intent);

    const {OGplaces, places, center} = await searchbyTextGoogle(structuredIntent, curLoc);
    return NextResponse.json({message: query, parsed: structuredIntent, filteredoutput: places, OGplaces: OGplaces, center: center});
}