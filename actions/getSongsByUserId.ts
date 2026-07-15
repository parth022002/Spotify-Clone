import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/libs/db";
import { Song } from "@/types";

const getSongsByUserId = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.user.id) {
    return [];
  }

  try {
    const songs = await db.song.findMany({
      where: {
        user_id: sessionData.session.user.id,
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
