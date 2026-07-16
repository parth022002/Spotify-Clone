"use client";

import Image from "next/image";
import { twMerge } from "tailwind-merge";

import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

import PlayButton from "./PlayButton";

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
}

const SongItem: React.FC<SongItemProps> = ({
  data,
  onClick
}) => {
  const imagePath = useLoadImage(data);
  const player = usePlayer();
  const isActive = player.activeId === data.id;

  return (
    <div
      onClick={() => onClick(data.id)}
      className="
        relative 
        group 
        flex 
        flex-col 
        items-center 
        justify-center 
        rounded-md 
        overflow-hidden 
        gap-x-4 
        bg-neutral-400/5 
        cursor-pointer 
        hover:bg-neutral-400/10 
        transition 
        p-3
      "
    >
      <div
        className="
          relative 
          aspect-square 
          w-full
          h-full 
          rounded-md 
          overflow-hidden
        "
      >
        <Image
          className="object-cover"
          src={imagePath || '/images/music-placeholder.png'}
          fill
          alt="Image"
        />
        {isActive && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-x-1 transition-all duration-300">
            <div className="bg-green-500 w-1.5 h-8 rounded-sm animate-equalizer-bar" style={{ animationDelay: '0.1s' }} />
            <div className="bg-green-500 w-1.5 h-8 rounded-sm animate-equalizer-bar" style={{ animationDelay: '0.3s' }} />
            <div className="bg-green-500 w-1.5 h-8 rounded-sm animate-equalizer-bar" style={{ animationDelay: '0.5s' }} />
            <div className="bg-green-500 w-1.5 h-8 rounded-sm animate-equalizer-bar" style={{ animationDelay: '0.2s' }} />
          </div>
        )}
      </div>
      <div className="flex flex-col items-start w-full pt-4 gap-y-1">
        <p className={twMerge(
          "font-semibold truncate w-full transition-colors",
          isActive ? "text-green-500" : "text-white"
        )}>
          {data.title}
        </p>
        <p
          className="
            text-neutral-400 
            text-sm 
            pb-4 
            w-full 
            truncate
          "
        >
          By {data.author}
        </p>
      </div>
      <div
        className="
          absolute 
          bottom-24 
          right-5
        "
      >
        <PlayButton />
      </div>
    </div>
  );
}

export default SongItem;
