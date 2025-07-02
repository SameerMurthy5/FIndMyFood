// types/Session.ts
import { LLMResponse } from "./LLMResponse";

export interface SessionState {
    messages: { role: "user" | "assistant"; content: string }[];
    lastLLMResponse: LLMResponse | null;
}