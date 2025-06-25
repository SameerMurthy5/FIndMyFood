import { redisClient } from '@/lib/redis/client';
import { ChatMessage } from '@/types/chatMessage';

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