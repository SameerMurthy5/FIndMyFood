import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { askLLM } from '@/lib/newLLM/askLLM';
import { addMessage, addToContext, getContextQuestions } from '@/lib/redis/functions';
import { ChatMessage } from '@/types/chatMessage';
import { Ratelimit } from '@upstash/ratelimit';
import { redisClient } from '@/lib/redis/client';

// Allow 5 requests every 60 seconds per user
const ratelimit = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.fixedWindow(5, "60s"),
});

export async function POST(req: NextRequest) {

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if ( error ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = data.user.id;

    const { success, reset } = await ratelimit.limit(userId);
        if (!success) {
        return NextResponse.json(
            { error: `Rate limit exceeded. Try again in ${reset} seconds.` },
            { status: 429 }
        );
    }
    


    const {query, restaurants} = await req.json();
    console.log("Ask query:", query);

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    //push user message
    const userChatMessage: ChatMessage = { role: "user", content: query };
    await addMessage(userId, userChatMessage);
    await addToContext(userId, userChatMessage);

    // get context questions from redis
    const context = getContextQuestions(userId);

    const restaurantList = JSON.stringify(restaurants, null, 2);
    const res = await askLLM(query, restaurantList, JSON.stringify(context, null, 2));
    console.log("LLM response:", res);

    // push ai response to chat and context
    const assistantChatMessage: ChatMessage = { role: "assistant", content: res };
    await addMessage(userId, assistantChatMessage);
    await addToContext(userId, assistantChatMessage);

    console.log("Context after ask:", await getContextQuestions(userId));



    return NextResponse.json({message: res })

}