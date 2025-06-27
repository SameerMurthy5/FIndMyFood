import { redisClient } from '@/lib/redis/client';
import { ChatMessage } from '@/types/chatMessage';
import { LLMResponse } from '@/types/LLMResponse';

export async function addMessage(userId: string, message: ChatMessage) {
    const key = `chat:${userId}`;  
    //console.log("addMessage(): Writing to Redis:", serialized);
  
    await redisClient.rpush(key, message);
}

// get all messages from a chat session
export async function getMessages(userId: string): Promise<ChatMessage[]> {
    const key = `chat:${userId}`;
    const entries = await redisClient.lrange<ChatMessage>(key, 0, -1);
    return entries;
}

export async function clearMessages(userId: string) {
    await redisClient.del(`chat:${userId}`);
}


export async function getContext(userId: string) {
    const len = await redisClient.llen(`chat:${userId}`);
    if (len < 0) {
        return await redisClient.lrange<ChatMessage>(`chat:${userId}`, 0, -1);
    }
    else {
        return await redisClient.lrange<ChatMessage>(`chat:${userId}`, -5, -1);
    }
}

export async function setLastAIResponse(userId: string, response: LLMResponse) {
    await redisClient.set(`chat:${userId}:lastAIResponse`, response);
}

export async function getLastAIResponse(userId: string): Promise<LLMResponse | null> {
    const response = await redisClient.get<LLMResponse>(`chat:${userId}:lastAIResponse`);
    if (response) {
        console.log("Last AI response found in Redis:", response);
        return response;
    } else {
        console.log("No previous AI response found in Redis.");
        return null; 
    }
}

export async function clearLastAIResponse(userId: string) {
    await redisClient.del(`chat:${userId}:lastAIResponse`);
}