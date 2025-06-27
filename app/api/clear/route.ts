import { clearMessages, getLastAIResponse, getMessages, clearLastAIResponse } from "@/lib/redis/functions";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userId = data.user.id;

    console.log("before: ", await getMessages(userId));
    console.log("before aiclear", await getLastAIResponse(userId))

    await clearMessages(userId);
    // clear the last AI response as well
    await clearLastAIResponse(userId);

    console.log("after aiclear", await getLastAIResponse(userId))
    console.log("after: ", await getMessages(userId));
    return NextResponse.json({ message: "Messages cleared" }, { status: 200 });
}
