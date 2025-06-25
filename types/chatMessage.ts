import { LLMResponse } from "./LLMResponse";

export type ChatMessage = {
    role: "user" | "assistant";
    content: string | LLMResponse;
};