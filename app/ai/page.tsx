"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { BsMagic, BsPlayFill, BsMusicNoteBeamed } from "react-icons/bs";
import { ClipLoader } from "react-spinners";
import SongItem from "@/components/SongItem";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { toast } from "react-hot-toast";

const AIPage = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const player = usePlayer();

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }

      const data = await response.json();
      setRecommendations(data);
      if (data.length > 0) {
        toast.success(`Found ${data.length} recommendations!`);
      } else {
        toast.error("No matching songs found.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const playAllRecommendations = () => {
    if (recommendations.length === 0) return;
    
    const ids = recommendations.map(song => song.id);
    player.setIds(ids);
    player.setId(ids[0]);
    toast.success("Playing AI Playlist!");
  };

  return (
    <div className="bg-neutral-950/65 backdrop-blur-xl border border-neutral-800/40 rounded-2xl h-full w-full overflow-hidden overflow-y-auto shadow-2xl">
      <Header className="from-neutral-950/40">
        <div className="mb-2">
          <h1 className="text-white text-3xl font-bold">AI DJ Assistant</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Describe your mood, vibe, or current activity to generate a personalized playlist instantly.
          </p>
        </div>
      </Header>

      <div className="px-6 py-8 flex flex-col items-center">
        {/* Prompt Input Form */}
        <form onSubmit={handleRecommend} className="w-full max-w-2xl mb-10">
          <div className="flex gap-x-3 bg-neutral-800/40 backdrop-blur-md p-4 rounded-xl border border-neutral-700/50 shadow-xl items-center">
            <BsMagic className="text-purple-400 animate-pulse ml-2" size={24} />
            <Input
              id="prompt"
              disabled={isLoading}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Chill acoustic songs for a rainy Sunday morning..."
              className="bg-transparent border-0 focus:ring-0 focus:outline-none placeholder-neutral-500 text-white text-base flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-full transition flex items-center gap-2"
            >
              {isLoading ? <ClipLoader color="#ffffff" size={18} /> : "Ask DJ"}
            </Button>
          </div>
        </form>

        {/* Results Section */}
        {hasSearched && (
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                <BsMusicNoteBeamed className="text-purple-400" /> AI Recommendations
              </h2>
              {recommendations.length > 0 && (
                <Button
                  onClick={playAllRecommendations}
                  className="bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2 rounded-full flex items-center gap-2 shadow-lg transition"
                >
                  <BsPlayFill size={20} /> Play Playlist
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <ClipLoader color="#9333ea" size={50} />
                <p className="text-neutral-400 text-sm animate-pulse">AI is mixing your playlist...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recommendations.map((song) => (
                  <SongItem
                    key={song.id}
                    onClick={(id) => {
                      player.setId(id);
                      player.setIds(recommendations.map(s => s.id));
                    }}
                    data={song}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-neutral-400 border border-dashed border-neutral-700 rounded-xl">
                No matching tracks found in the catalog. Try another description!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPage;
