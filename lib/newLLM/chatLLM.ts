// test openai chat
import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { LLMResponse } from "@/types/LLMResponse";
import { ChatMessage } from "@/types/chatMessage";

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

export async function parseQueryWithLLM(userPrompt: string, context: ChatMessage[]): Promise<LLMResponse> {
    const response = await openai.responses.parse({
      model: "gpt-4.1-nano",
      input: [
        {
          role: "system",
          content:
            `You are a restaurant search assistant that translates natural language queries into structured filters for a map-based restaurant search app. 

            The goal is to extract fields such as cuisine, vibe, location, whether to use the user's current location, whether restaurants should be open now, and an appropriate search radius in meters.

            Previous chat history with the user will also be provided as context to help understand follow-up queries.

            Follow these rules carefully:

            1. If the user does **not specify a radius**, do not default to 1000 meters.
            - Use **1000m** only if the location is clearly in a **dense urban area** (e.g., downtown NYC).
            - Use **5000m** (or more if needed) if the location is a **moderate-sized city or town**.
            - Use **8000m to 15000m** for **rural or suburban** areas.
            - If the user specifies a radius, use that value directly.
            - If the user specifies a radius in any units other than meters, convert to meters.

            2. If the cuisine is uncommon (e.g., Ethiopian, Indian in rural areas), increase the radius to ensure at least 5 strong matches. For common cuisines (e.g., pizza, burgers), the default radius for the area may be sufficient.

            3. Try to return at least 5 good matches, so adjust the radius accordingly based on the assumed population density or specificity of the cuisine.

            4. If a location is not specified, set use_current_location to true and infer the radius from typical user context (e.g., suburban → 8000m).

            5. Always return radius_meters explicitly, even if the user did not specify it.

            6. Include a vibe field (e.g., romantic, casual, fast_food) only if clearly implied. Use one of the allowed values: ["romantic", "casual", "family-friendly", "fancy", "fast_food"].
            
            7. If the user expresses a budget preference (e.g., cheap, fancy, expensive), include a budget field. Allowed values: "cheap", "moderate", "expensive".

            8. If the user provides a follow-up, assume context from previous message unless overridden. modify fields of query that were asked to be change by the user`
        },
        {
          role: "user",
          content: userPrompt,
        },
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
  

