import { db } from "@/libs/db";
import { Song } from "@/types";
import getSongs from "./getSongs";

const getSongsByTitle = async (title: string): Promise<Song[]> => {
  if (!title) {
    const allSongs = await getSongs();
    return allSongs;
  }

  try {
    const songs = await db.song.findMany({
      where: {
        title: {
          contains: title,
          mode: 'insensitive',
        },
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
    console.error("Error in getSongsByTitle:", error);
    return [];
  }
};

export default getSongsByTitle;
