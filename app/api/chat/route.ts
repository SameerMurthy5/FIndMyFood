// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; 
import { parseQueryWithLLM } from "@/lib/newLLM/chatLLM";
import { getMessages, addMessage, setLastAIResponse, getLastAIResponse, clearMessages, clearLastAIResponse, clearContext } from "@/lib/redis/functions";
import { ChatMessage } from "@/types/chatMessage";
import { searchbyTextGoogle } from "@/lib/newGoogleMaps/google";
import { Ratelimit } from "@upstash/ratelimit";
import { redisClient } from "@/lib/redis/client";

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

  try {
    const { query, curLoc} = await req.json();
    console.log("Chat query:", query, "Current location:", curLoc);

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 });
    } 
    

    const userChatMessage: ChatMessage = { role: "user", content: query };
    // Push the user message
    await addMessage(userId, userChatMessage);

    // get the last AI response from Redis
    const lastAIResponse = await getLastAIResponse(userId);
    
    //console.log("context AI Response:", lastAIResponse);
    // Run the LLM logic
    const aiResponse = await parseQueryWithLLM(query, lastAIResponse);
    setLastAIResponse(userId, aiResponse) // store the last AI response separately
    //console.log("new AI response:", aiResponse);
    
    const assistantChatMessage: ChatMessage = { role: "assistant", content: aiResponse };

    // Push the assistant response
    await addMessage(userId, assistantChatMessage);


    //check if added correctly
    // const messages = await getMessages(userId);
    //console.log("Session messages:", messages);

    // perform search
    const {OGplaces, places, center} = await searchbyTextGoogle(aiResponse, curLoc);
    return NextResponse.json({message: query, parsed: aiResponse, filteredoutput: places, OGplaces: OGplaces, center: center});


  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = data.user.id;
    const messages = await getMessages(userId);

    //console.log("Retrieved messages:", messages);
    return NextResponse.json({msg: messages});
  } catch (err) {
    console.error("Error retrieving messages:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function DELETE() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userId = data.user.id;

    console.log("before: ", await getMessages(userId));
    console.log("before aiclear", await getLastAIResponse(userId))

    await clearMessages(userId);
    clearContext(userId); 
    // clear the last AI response as well
    await clearLastAIResponse(userId);

    console.log("after aiclear", await getLastAIResponse(userId))
    console.log("after: ", await getMessages(userId));
    return NextResponse.json({ message: "Messages cleared" }, { status: 200 });
}