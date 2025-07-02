// test openai chat
import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { LLMResponse } from "@/types/LLMResponse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const allowedVibes = [
    "romantic",
    "casual",
    "family-friendly",
    "fancy",
    "fast_food",
    "",
] as const;


export const LLMResponseSchema = z.object({
    cuisine: z.string(),
    vibe: z.enum(allowedVibes),
    location: z.string(),
    budget: z.enum(["cheap", "moderate", "expensive", ""]),
    use_current_location: z.boolean(),
    open_now: z.boolean(),
    radius_meters: z.number().default(5000), // default to 5km
});

export async function parseQueryWithLLM(userPrompt: string, context: any): Promise<LLMResponse> {
    const response = await openai.responses.parse({
      model: "gpt-4.1-nano",
      input: [
        {
          role: "system",
          content:
            `You are a restaurant search assistant that converts natural language queries into structured filters for a map-based restaurant search app.

            The structured output must follow this schema:
            - cuisine: string
            - vibe: one of ["romantic", "casual", "family-friendly", "fancy", "fast_food", ""]
            - location: string (or "" if using current location)
            - budget: one of ["cheap", "moderate", "expensive", ""]
            - use_current_location: boolean
            - open_now: boolean
            - radius_meters: number (always include)

            You will be given:
            1. The user's latest query
            2. A JSON object representing the previous structured response (if available)

            If the user is making a follow-up request, **only update the fields they asked to change**. All other fields must retain their previous values.

            Strictly follow these rules:
            - Do not invent or remove fields.
            - If no context is given, treat the query as a new search.
            - If context is given, return a modified version of the previous JSON object, changing only the specified fields.
            - Always return a full and valid JSON object matching the schema above.

            If the user does **not specify a radius**, do not default to 1000 meters.
                        - Use **1000m** only if the location is clearly in a **dense urban area** (e.g., downtown NYC).
                        - Use **5000m** (or more if needed) if the location is a **moderate-sized city or town**.
                        - Use **8000m to 15000m** for **rural or suburban** areas.
                        - If the user specifies a radius, use that value directly.
                        - If the user specifies a radius in any units other than meters, convert to meters.
            
            Do not set use_current_location to true unless the user explicitly asks for it or provides no location information. (ex. near me, around me, etc.)
            if a user specifies a location in previous context, use that location as the default unless they specify otherwise, 

            Be precise, and only modify what the user clearly requests. `
        },
        {
          role: "user",
          content: `Previous LLMResponse:\n ${JSON.stringify(context, null, 2)}`,
        },
        {
            role: "user",
            content: `User query:\n ${userPrompt}`,
        }
      ],
      text: {
        format: zodTextFormat(LLMResponseSchema, "query"),
      },
    });

    const parsed = response.output_parsed;
    
    if (!parsed) {
      throw new Error("Failed to parse LLM response");
    }
    return parsed;
  }
  

