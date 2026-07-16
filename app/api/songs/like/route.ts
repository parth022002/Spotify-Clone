export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/libs/db";

async function getOrCreateItunesSongId(songId: string, onlyCheck: boolean = false): Promise<number | null> {
  if (!songId.startsWith("itunes-")) {
    const id = parseInt(songId);
    return isNaN(id) ? null : id;
  }

  const trackId = songId.replace("itunes-", "");
  if (!trackId) return null;

  try {
    const response = await fetch(`https://itunes.apple.com/lookup?id=${trackId}`);
    if (response.ok) {
      const data = await response.json();
      const track = data.results?.[0];
      if (track && track.previewUrl) {
        // Search if we already have it in the database
        const existingSong = await db.song.findFirst({
          where: { song_path: track.previewUrl },
        });

        if (existingSong) {
          return existingSong.id;
        }

        // If checking only, and it doesn't exist, it means it is not liked!
        if (onlyCheck) {
          return null;
        }

        // Create the song record in the database under system user account
        const systemUserId = "system-user-account";
        
        // Ensure system user exists
        await db.user.upsert({
          where: { id: systemUserId },
          update: {},
          create: {
            id: systemUserId,
            email: "system@spotify.com",
            full_name: "Spotify System DJ",
          },
        });

        const newSong = await db.song.create({
          data: {
            user_id: systemUserId,
            title: track.trackName || "Unknown Title",
            author: track.artistName || "Unknown Artist",
            song_path: track.previewUrl,
            image_path: track.artworkUrl100
              ? track.artworkUrl100.replace("100x100bb", "500x500bb")
              : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&h=300&fit=crop",
          },
        });

        return newSong.id;
      }
    }
  } catch (error) {
    console.error("Error in getOrCreateItunesSongId:", error);
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const songId = searchParams.get("songId");

    if (!userId || !songId) {
      return new NextResponse("Missing params", { status: 400 });
    }

    const resolvedSongId = await getOrCreateItunesSongId(songId, true);
    if (!resolvedSongId) {
      return NextResponse.json({ liked: false });
    }

    const like = await db.likedSong.findUnique({
      where: {
        song_id_user_id: {
          song_id: resolvedSongId,
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

    const resolvedSongId = await getOrCreateItunesSongId(songId, false);
    if (!resolvedSongId) {
      return new NextResponse("Invalid song ID", { status: 400 });
    }

    const like = await db.likedSong.upsert({
      where: {
        song_id_user_id: {
          song_id: resolvedSongId,
          user_id: userId,
        },
      },
      update: {},
      create: {
        song_id: resolvedSongId,
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

    const resolvedSongId = await getOrCreateItunesSongId(songId, true);
    if (!resolvedSongId) {
      return new NextResponse("Invalid song ID", { status: 400 });
    }

    await db.likedSong.delete({
      where: {
        song_id_user_id: {
          song_id: resolvedSongId,
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
