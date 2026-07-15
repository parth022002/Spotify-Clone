import { Song } from "@/types";

const useLoadSongUrl = (song: Song) => {
  if (!song || !song.song_path) {
    return "";
  }

  if (song.song_path.startsWith("/") || song.song_path.startsWith("http")) {
    return song.song_path;
  }

  return `/uploads/songs/${song.song_path}`;
};

export default useLoadSongUrl;
