import { LLMResponse } from "@/types/LLMResponse";

type Props = {
  text: string | LLMResponse;
  sender: "user" | "assistant";
};

export default function ChatBlob({ text, sender }: Props) {
  const isUser = sender === "user";
  const isText = text && typeof text === "string";

  return (
    <div
      className={`px-4 py-2 rounded max-w-xs ${
        isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
      }`}
    >
      {isText ? text : "I rendered some places on the map!"}
    </div>
  );
}
