"use client";

import useSound from "use-sound";
import { useEffect, useState, useRef } from "react";
import { BsPauseFill, BsPlayFill, BsSliders } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { twMerge } from "tailwind-merge";

import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import Slider from "./Slider";
import Visualizer from "./Visualizer";
import Equalizer from "./Equalizer";

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ 
  song, 
  songUrl
}) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEQ, setShowEQ] = useState(false);
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeekChange = (value: number) => {
    if (sound) {
      sound.seek(value);
      setSeek(value);
    }
  };

  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [filters, setFilters] = useState<BiquadFilterNode[]>([]);
  const audioPipelineSetupRef = useRef(false);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  const onPlayNext = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if (!nextSong) {
      return player.setId(player.ids[0]);
    }

    player.setId(nextSong);
  }

  const onPlayPrevious = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];

    if (!previousSong) {
      return player.setId(player.ids[player.ids.length - 1]);
    }

    player.setId(previousSong);
  }

  const [play, { pause, sound }] = useSound(
    songUrl,
    { 
      volume: volume,
      onplay: () => setIsPlaying(true),
      onend: () => {
        setIsPlaying(false);
        onPlayNext();
      },
      onpause: () => setIsPlaying(false),
      format: ['mp3', 'm4a', 'aac', 'mp4']
    }
  );

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Howler) {
      const Howler = (window as any).Howler;
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx.resume();
      }
    }

    sound?.play();
    
    return () => {
      sound?.unload();
    }
  }, [sound]);

  // Update duration when sound loads
  useEffect(() => {
    if (sound) {
      setDuration(sound.duration());
    }
  }, [sound]);

  // Request animation frame loop to update current seek position
  useEffect(() => {
    let animationFrameId: number;

    const updateSeek = () => {
      if (sound && isPlaying) {
        const currentSeek = sound.seek();
        setSeek(typeof currentSeek === "number" ? currentSeek : 0);
        if (duration === 0) {
          setDuration(sound.duration());
        }
      }
      animationFrameId = requestAnimationFrame(updateSeek);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateSeek);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [sound, isPlaying, duration]);

  // Hook equalizer filters and analyser into Howler pipeline
  useEffect(() => {
    if (!sound) return;

    // Check if pipeline has been set up already for the active audio context
    if (audioPipelineSetupRef.current) return;

    if (typeof window !== "undefined" && (window as any).Howler) {
      const Howler = (window as any).Howler;
      const ctx = Howler.ctx;

      if (ctx && Howler.masterGain) {
        audioPipelineSetupRef.current = true;

        // 1. Create AnalyserNode
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 128; // Compact size for faster updates
        setAnalyser(analyserNode);

        // 2. Create 5 BiquadFilterNodes
        const freqs = [60, 250, 1000, 4000, 16000];
        const filterNodes = freqs.map((freq, i) => {
          const filter = ctx.createBiquadFilter();
          if (i === 0) {
            filter.type = "lowshelf";
          } else if (i === freqs.length - 1) {
            filter.type = "highshelf";
          } else {
            filter.type = "peaking";
            filter.Q.value = 1.0;
          }
          filter.frequency.value = freq;
          filter.gain.value = 0;
          return filter;
        });

        setFilters(filterNodes);

        // 3. Connect pipeline: masterGain -> filters -> analyser -> destination
        try {
          Howler.masterGain.disconnect();
          
          let currentNode = Howler.masterGain;
          filterNodes.forEach(filter => {
            currentNode.connect(filter);
            currentNode = filter;
          });
          
          currentNode.connect(analyserNode);
          analyserNode.connect(ctx.destination);
        } catch (err) {
          console.error("Failed to connect audio filters:", err);
        }
      }
    }
  }, [sound]);

  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  }

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  }

  const handleFilterChange = (index: number, dbVal: number) => {
    if (filters[index]) {
      filters[index].gain.value = dbVal;
    }
  };

  return ( 
    <div className="grid grid-cols-2 md:grid-cols-3 h-full items-center relative">
      {/* Song Details */}
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>

      {/* Mobile play/pause controls */}
      <div 
        className="
          flex 
          md:hidden 
          col-auto 
          w-full 
          justify-end 
          items-center
          gap-x-4
        "
      >
        <BsSliders
          size={20}
          onClick={() => setShowEQ(!showEQ)}
          className={twMerge(
            "cursor-pointer hover:text-white transition",
            showEQ ? "text-green-500" : "text-neutral-400"
          )}
        />
        <div 
          onClick={handlePlay} 
          className="
            h-10
            w-10
            flex 
            items-center 
            justify-center 
            rounded-full 
            bg-white 
            p-1 
            cursor-pointer
          "
        >
          <Icon size={30} className="text-black" />
        </div>
      </div>

      {/* Desktop player controls */}
      <div 
        className="
          hidden
          h-full
          md:flex 
          flex-col
          justify-center 
          items-center 
          w-full 
          max-w-[722px] 
          gap-y-1.5
        "
      >
        {/* Buttons Row */}
        <div className="flex items-center gap-x-6 mt-1">
          <AiFillStepBackward
            onClick={onPlayPrevious}
            size={24} 
            className="
              text-neutral-400 
              cursor-pointer 
              hover:text-white 
              transition
            "
          />
          <div 
            onClick={handlePlay} 
            className="
              flex 
              items-center 
              justify-center
              h-8
              w-8 
              rounded-full 
              bg-white 
              p-1 
              cursor-pointer
              hover:scale-105
              transition
            "
          >
            <Icon size={22} className="text-black" />
          </div>
          <AiFillStepForward
            onClick={onPlayNext}
            size={24} 
            className="
              text-neutral-400 
              cursor-pointer 
              hover:text-white 
              transition
            " 
          />
        </div>

        {/* Progress Timeline Row */}
        <div className="flex items-center gap-x-3 w-full text-xs text-neutral-400 select-none">
          <span className="w-10 text-right font-mono text-[10px] text-neutral-400">{formatTime(seek)}</span>
          <Slider
            value={seek}
            onChange={handleSeekChange}
            max={duration || 1}
            step={0.1}
            ariaLabel="Progress"
          />
          <span className="w-10 text-left font-mono text-[10px] text-neutral-400">
            {duration ? `-${formatTime(duration - seek)}` : "0:00"}
          </span>
        </div>
      </div>

      {/* Volume and Equalizer panels */}
      <div className="hidden md:flex w-full justify-end pr-2 items-center gap-x-4">
        <BsSliders
          size={20}
          onClick={() => setShowEQ(!showEQ)}
          className={twMerge(
            "cursor-pointer hover:text-white transition",
            showEQ ? "text-green-500" : "text-neutral-400"
          )}
        />
        <div className="flex items-center gap-x-2 w-[120px]">
          <VolumeIcon 
            onClick={toggleMute} 
            className="cursor-pointer" 
            size={34} 
          />
          <Slider 
            value={volume} 
            onChange={(value) => setVolume(value)}
          />
        </div>
      </div>

      {/* Glassmorphic Equalizer & Visualizer Dashboard Drawer */}
      {showEQ && (
        <div 
          className="
            fixed 
            bottom-24 
            right-4 
            w-[350px] 
            max-w-[calc(100vw-2rem)] 
            bg-neutral-900/95 
            backdrop-blur-md 
            border 
            border-neutral-800 
            p-5 
            rounded-2xl 
            shadow-[0_10px_30px_rgba(0,0,0,0.5)] 
            z-50 
            flex 
            flex-col 
            gap-y-4
            transition-all
            duration-300
          "
        >
          <div className="h-28">
            <Visualizer analyser={analyser} isPlaying={isPlaying} />
          </div>
          <Equalizer filters={filters} onFilterChange={handleFilterChange} />
        </div>
      )}

    </div>
  );
}

export default PlayerContent;