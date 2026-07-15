import { db } from "@/libs/db";
import { Song } from "@/types";

const getSongs = async (): Promise<Song[]> => {
  try {
    const songs = await db.song.findMany({
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
    console.error("Error in getSongs server action:", error);
    return [];
  }
};

export default getSongs;
