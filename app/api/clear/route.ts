import { clearMessages, getMessages } from "@/lib/redis/functions";
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

    await clearMessages(userId);

    console.log("after: ", await getMessages(userId));
    return NextResponse.json({ message: "Messages cleared" }, { status: 200 });
}
