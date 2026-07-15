import { cookies } from "next/headers";
import { db } from "@/libs/db";
import { Song } from "@/types";
import { verifySession } from "@/libs/session";

const getLikedSongs = async (): Promise<Song[]> => {
  const cookieStore = cookies();
  const token = cookieStore.get("spotify_session")?.value;

  if (!token) {
    return [];
  }

  const userId = verifySession(token);

  if (!userId) {
    return [];
  }

  try {
    const likedSongs = await db.likedSong.findMany({
      where: {
        user_id: userId,
      },
      include: {
        song: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return likedSongs
      .filter((item) => !!item.song)
      .map((item) => ({
        id: String(item.song.id),
        user_id: item.song.user_id,
        author: item.song.author || '',
        title: item.song.title || '',
        song_path: item.song.song_path || '',
        image_path: item.song.image_path || '',
      }));
  } catch (error) {
    console.error("Error in getLikedSongs:", error);
    return [];
  }
};

export default getLikedSongs;
