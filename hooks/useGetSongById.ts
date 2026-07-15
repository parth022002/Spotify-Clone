import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { Song } from "@/types";

const useSongById = (id?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [song, setSong] = useState<Song | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      return;
    }

    setIsLoading(true);

    const fetchSong = async () => {
      try {
        const response = await fetch(`/api/songs/details?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to load song details");
        }
        const data = await response.json();
        setSong(data as Song);
      } catch (err: any) {
        toast.error(err.message || "Error loading song details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSong();
  }, [id]);

  return useMemo(() => ({
    isLoading,
    song
  }), [isLoading, song]);
};

export default useSongById;
