import { db } from "@/libs/db";
import { Song } from "@/types";

const getSongById = async (id: string): Promise<Song> => {
  if (!id) {
    return [] as any;
  }

  try {
    const song = await db.song.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!song) return [] as any;

    return {
      id: String(song.id),
      user_id: song.user_id,
      author: song.author || '',
      title: song.title || '',
      song_path: song.song_path || '',
      image_path: song.image_path || '',
    };
  } catch (error) {
    console.error("Error in getSongById:", error);
    return [] as any;
  }
};

export default getSongById;
