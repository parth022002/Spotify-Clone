"use client";

import usePlayer from "@/hooks/usePlayer";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import useGetSongById from "@/hooks/useGetSongById";

import PlayerContent from "./PlayerContent";

const Player = () => {
  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);

  const songUrl = useLoadSongUrl(song!);

  if (!song || !songUrl || !player.activeId) {
    return null;
  }

  return (
    <div
      className="
        fixed 
        bottom-[65px]
        md:bottom-0
        bg-neutral-950/80 
        backdrop-blur-xl 
        border-t 
        border-white/5 
        w-full 
        py-2 
        h-[80px] 
        px-4
        z-40
        shadow-[0_-5px_20px_rgba(0,0,0,0.5)]
      "
    >
      <PlayerContent key={songUrl} song={song} songUrl={songUrl} />
    </div>
  );
}

export default Player;
