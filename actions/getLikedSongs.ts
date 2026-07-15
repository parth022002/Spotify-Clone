import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/libs/db";
import { Song } from "@/types";

const getLikedSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return [];
  }

  try {
    const likedSongs = await db.likedSong.findMany({
      where: {
        user_id: session.user.id,
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
