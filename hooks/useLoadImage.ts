import { Song } from "@/types";

const useLoadImage = (song: Song) => {
  if (!song || !song.image_path) {
    return null;
  }

  if (song.image_path.startsWith("/") || song.image_path.startsWith("http")) {
    return song.image_path;
  }

  return `/uploads/images/${song.image_path}`;
};

export default useLoadImage;
