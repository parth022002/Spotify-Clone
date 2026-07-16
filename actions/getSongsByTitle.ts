import { db } from "@/libs/db";
import { Song } from "@/types";
import getSongs from "./getSongs";

const getSongsByTitle = async (title: string): Promise<Song[]> => {
  if (!title) {
    const allSongs = await getSongs();
    return allSongs;
  }

  try {
    // 1. Fetch matching songs from our local database
    const localSongs = await db.song.findMany({
      where: {
        OR: [
          {
            title: {
              contains: title,
              mode: 'insensitive',
            },
          },
          {
            author: {
              contains: title,
              mode: 'insensitive',
            },
          }
        ]
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const mappedLocalSongs: Song[] = localSongs.map((song) => ({
      id: String(song.id),
      user_id: song.user_id,
      author: song.author || '',
      title: song.title || '',
      song_path: song.song_path || '',
      image_path: song.image_path || '',
    }));

    // 2. Fetch search results from the iTunes Search API on the internet
    let internetSongs: Song[] = [];
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=music&limit=25`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.results && Array.isArray(data.results)) {
          internetSongs = data.results
            .filter((track: any) => track.previewUrl) // Only tracks with play previews
            .map((track: any, index: number) => ({
              id: `itunes-${track.trackId || index}`,
              user_id: "system-user-account",
              author: track.artistName || "Unknown Artist",
              title: track.trackName || "Unknown Title",
              // Use direct audio preview URL
              song_path: track.previewUrl,
              // Convert thumbnail artwork to high resolution
              image_path: track.artworkUrl100
                ? track.artworkUrl100.replace("100x100bb", "500x500bb")
                : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&h=300&fit=crop",
            }));
        }
      }
    } catch (apiError) {
      console.error("Error fetching from iTunes Search API:", apiError);
    }

    // Combine local and internet songs, placing local matches first
    return [...mappedLocalSongs, ...internetSongs];
  } catch (error) {
    console.error("Error in getSongsByTitle:", error);
    return [];
  }
};

export default getSongsByTitle;
