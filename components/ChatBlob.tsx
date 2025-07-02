import { LLMResponse } from "@/types/LLMResponse";
import ReactMarkdown from "react-markdown";

type Props = {
  text: string | LLMResponse;
  sender: "user" | "assistant";
};

export default function ChatBlob({ text, sender }: Props) {
  const isUser = sender === "user";
  const isThinking = text === "thinking";
  return (
    <div
      className={`px-4 py-2 rounded max-w-xs ${
        isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
      }`}
    >
      {isThinking ? (
        <div className="flex space-x-1 animate-pulse">
          <span>Thinking</span>
          <span className="animate-pulse delay-100">.</span>
          <span className="animate-pulse delay-200">.</span>
          <span className="animate-pulse delay-300">.</span>
        </div>
      ) : typeof text === "string" ? (
        <ReactMarkdown>{text}</ReactMarkdown>
      ) : (
        "I rendered some places on the map!"
      )}
    </div>
  );
}
