import { cookies } from "next/headers";
import { db } from "@/libs/db";
import { Song } from "@/types";
import { verifySession } from "@/libs/session";

const getSongsByUserId = async (): Promise<Song[]> => {
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
    const songs = await db.song.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return songs.map((song) => ({
      id: String(song.id),
      user_id: song.user_id,
      author: song.author || '',
      title: song.title || '',
      song_path: song.song_path || '',
      image_path: song.image_path || '',
    }));
  } catch (error) {
    console.error("Error in getSongsByUserId:", error);
    return [];
  }
};

export default getSongsByUserId;
