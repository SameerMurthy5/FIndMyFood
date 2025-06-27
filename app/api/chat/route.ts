// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; 
import { parseQueryWithLLM } from "@/lib/newLLM/chatLLM";
import { getMessages, addMessage, setLastAIResponse, getLastAIResponse } from "@/lib/redis/functions";
import { ChatMessage } from "@/types/chatMessage";
import { searchbyTextGoogle } from "@/lib/newGoogleMaps/google";


export async function POST(req: NextRequest) {
  try {
    const { query, curLoc} = await req.json();
    console.log("Chat query:", query, "Current location:", curLoc);

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 });
    } 
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if ( error ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = data.user.id;

    const userChatMessage: ChatMessage = { role: "user", content: query };
    // Push the user message
    await addMessage(userId, userChatMessage);

    // get the last AI response from Redis
    const lastAIResponse = await getLastAIResponse(userId);
    
    console.log("context AI Response:", lastAIResponse);
    // Run the LLM logic
    const aiResponse = await parseQueryWithLLM(query, lastAIResponse);
    setLastAIResponse(userId, aiResponse) // store the last AI response separately
    console.log("new AI response:", aiResponse);
    
    const assistantChatMessage: ChatMessage = { role: "assistant", content: aiResponse };

    // Push the assistant response
    await addMessage(userId, assistantChatMessage);


    //check if added correctly
    const messages = await getMessages(userId);
    console.log("Session messages:", messages);

    // perform search
    const {OGplaces, places, center} = await searchbyTextGoogle(aiResponse, curLoc);
    return NextResponse.json({message: query, parsed: aiResponse, filteredoutput: places, OGplaces: OGplaces, center: center});


  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}