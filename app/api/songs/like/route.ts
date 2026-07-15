import { NextResponse } from "next/server";
import { db } from "@/libs/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const songId = searchParams.get("songId");

    if (!userId || !songId) {
      return new NextResponse("Missing params", { status: 400 });
    }

    const like = await db.likedSong.findUnique({
      where: {
        song_id_user_id: {
          song_id: parseInt(songId),
          user_id: userId,
        },
      },
    });

    return NextResponse.json({ liked: !!like });
  } catch (error: any) {
    console.error("[LIKE_GET_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, songId } = await request.json();

    if (!userId || !songId) {
      return new NextResponse("Missing params", { status: 400 });
    }

    const like = await db.likedSong.upsert({
      where: {
        song_id_user_id: {
          song_id: parseInt(songId),
          user_id: userId,
        },
      },
      update: {},
      create: {
        song_id: parseInt(songId),
        user_id: userId,
      },
    });

    return NextResponse.json(like);
  } catch (error: any) {
    console.error("[LIKE_POST_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, songId } = await request.json();

    if (!userId || !songId) {
      return new NextResponse("Missing params", { status: 400 });
    }

    await db.likedSong.delete({
      where: {
        song_id_user_id: {
          song_id: parseInt(songId),
          user_id: userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[LIKE_DELETE_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
