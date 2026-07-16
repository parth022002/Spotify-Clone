export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/libs/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get("id");

    if (!songId) {
      return new NextResponse("Missing song ID", { status: 400 });
    }

    // Handle iTunes track lookup
    if (songId.startsWith("itunes-")) {
      const trackId = songId.replace("itunes-", "");
      try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${trackId}`);
        if (response.ok) {
          const data = await response.json();
          const track = data.results?.[0];
          if (track) {
            let finalSongPath = track.previewUrl || "";
            try {
              const query = `${track.artistName} - ${track.trackName}`;
              const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
              const searchRes = await fetch(searchUrl, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
              });
              if (searchRes.ok) {
                const html = await searchRes.text();
                const regex = /"videoId":"([^"]+)"/;
                const match = html.match(regex);
                const videoId = match ? match[1] : null;
                
                if (videoId) {
                  const api = "https://api.cobalt.liubquanti.click/";
                  const cobaltRes = await fetch(api, {
                    method: "POST",
                    headers: {
                      "Accept": "application/json",
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      url: `https://www.youtube.com/watch?v=${videoId}`,
                      audioFormat: "mp3",
                      audioBitrate: "128"
                    })
                  });
                  if (cobaltRes.ok) {
                    const cobaltData = await cobaltRes.json();
                    if (cobaltData.url) {
                      finalSongPath = cobaltData.url;
                    }
                  }
                }
              }
            } catch (resolveError) {
              console.error("Failed to resolve full song, falling back to iTunes preview:", resolveError);
            }

            return NextResponse.json({
              id: songId,
              user_id: "system-user-account",
              author: track.artistName || "Unknown Artist",
              title: track.trackName || "Unknown Title",
              song_path: finalSongPath,
              image_path: track.artworkUrl100
                ? track.artworkUrl100.replace("100x100bb", "500x500bb")
                : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&h=300&fit=crop",
            });
          }
        }
      } catch (apiError) {
        console.error("Error looking up iTunes track details:", apiError);
      }
      return new NextResponse("Song not found", { status: 404 });
    }

    // Handle local database lookup
    const id = parseInt(songId);
    if (isNaN(id)) {
      return new NextResponse("Invalid song ID format", { status: 400 });
    }

    const song = await db.song.findUnique({
      where: { id },
    });

    if (!song) {
      return new NextResponse("Song not found", { status: 404 });
    }

    return NextResponse.json({
      id: String(song.id),
      user_id: song.user_id,
      author: song.author || '',
      title: song.title || '',
      song_path: song.song_path || '',
      image_path: song.image_path || '',
    });
  } catch (error: any) {
    console.error("[SONG_DETAILS_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
