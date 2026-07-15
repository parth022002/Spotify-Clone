export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/libs/db";

export async function POST(request: Request) {
  try {
    const { user_id, title, author, image_path, song_path } = await request.json();

    if (!user_id || !title || !author || !image_path || !song_path) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const song = await db.song.create({
      data: {
        user_id,
        title,
        author,
        image_path,
        song_path,
      },
    });

    return NextResponse.json(song);
  } catch (error: any) {
    console.error("[SONG_CREATE_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
