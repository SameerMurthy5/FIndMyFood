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
] as const;

export const LLMResponseSchema = z.object({
    cuisine: z.string(),
    vibe: z.enum(allowedVibes),
    location: z.string(),
    use_current_location: z.boolean(),
    open_now: z.boolean(),
    radius_meters: z.number(),
});

export async function parseQueryWithLLM(userPrompt: string): Promise<LLMResponse> {
    const response = await openai.responses.parse({
      model: "gpt-4.1-nano",
      input: [
        {
          role: "system",
          content:
            "You are a food discovery assistant. Extract structured search parameters from user queries for restaurant discovery.",
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
  

