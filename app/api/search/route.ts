import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const query = body.query;
    return NextResponse.json({message: "you sent: " + query});
}