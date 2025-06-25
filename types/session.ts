// types/Session.ts
import { LLMResponse } from "./LLMResponse";
import { ChatMessage } from "./chatMessage";

export interface SessionState {
    messages: { role: "user" | "assistant"; content: string }[];
    lastLLMResponse: LLMResponse | null;
}
  