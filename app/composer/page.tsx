"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { BsPlayFill, BsPauseFill, BsTrash, BsShuffle } from "react-icons/bs";
import { toast } from "react-hot-toast";

const TRACK_NAMES = ["Kick", "Snare", "Hi-Hat", "Synth"];
const STEPS = 16;
const DEFAULT_BPM = 120;

// Simple Web Audio API Synthesizer
class SoundSynth {
  ctx: AudioContext | null = null;

  constructor() {
    // Lazy initialized on first user interaction to comply with browser autoplay policies
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  playSnare(time: number) {
    if (!this.ctx) return;
    // Generate white noise buffer
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1000;

    const gain = this.ctx.createGain();

    noise.connect(noiseFilter);
    noiseFilter.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

    noise.start(time);
    noise.stop(time + 0.25);
  }

  playHihat(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.frequency.setValueAtTime(10000, time);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  playSynth(time: number, stepIndex: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pentatonic scale frequencies based on step index to ensure it always sounds pleasant
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const note = notes[stepIndex % notes.length];

    osc.type = "sine";
    osc.frequency.setValueAtTime(note, time);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.start(time);
    osc.stop(time + 0.15);
  }
}

const ComposerPage = () => {
  const [grid, setGrid] = useState<boolean[][]>(
    Array(TRACK_NAMES.length).fill(null).map(() => Array(STEPS).fill(false))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [currentStep, setCurrentStep] = useState(0);

  const synthRef = useRef<SoundSynth | null>(null);
  const nextNoteTimeRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);

  useEffect(() => {
    synthRef.current = new SoundSynth();
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
    };
  }, []);

  const handleCellClick = (trackIndex: number, stepIndex: number) => {
    if (synthRef.current) {
      synthRef.current.init();
    }
    const newGrid = grid.map((track, tIdx) =>
      track.map((cell, sIdx) => {
        if (tIdx === trackIndex && sIdx === stepIndex) {
          return !cell;
        }
        return cell;
      })
    );
    setGrid(newGrid);
  };

  const clearGrid = () => {
    setGrid(Array(TRACK_NAMES.length).fill(null).map(() => Array(STEPS).fill(false)));
    toast.success("Grid cleared");
  };

  const randomizeGrid = () => {
    if (synthRef.current) {
      synthRef.current.init();
    }
    const newGrid = Array(TRACK_NAMES.length)
      .fill(null)
      .map(() => Array(STEPS).fill(null).map(() => Math.random() > 0.8));
    setGrid(newGrid);
    toast.success("Randomized beat pattern");
  };

  const togglePlayback = () => {
    if (synthRef.current) {
      synthRef.current.init();
    }

    if (!isPlaying) {
      nextNoteTimeRef.current = synthRef.current?.ctx?.currentTime || 0;
      setIsPlaying(true);
      scheduler();
    } else {
      setIsPlaying(false);
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      setCurrentStep(0);
    }
  };

  const scheduler = () => {
    const synth = synthRef.current;
    if (!synth || !synth.ctx) return;

    while (nextNoteTimeRef.current < synth.ctx.currentTime + 0.1) {
      scheduleNote(currentStep, nextNoteTimeRef.current);
      advanceStep();
    }
    timerIdRef.current = window.setTimeout(scheduler, 25.0);
  };

  const scheduleNote = (step: number, time: number) => {
    const synth = synthRef.current;
    if (!synth) return;

    // Check Kick
    if (grid[0][step]) synth.playKick(time);
    // Check Snare
    if (grid[1][step]) synth.playSnare(time);
    // Check Hi-Hat
    if (grid[2][step]) synth.playHihat(time);
    // Check Synth
    if (grid[3][step]) synth.playSynth(time, step);
  };

  const advanceStep = () => {
    const synth = synthRef.current;
    if (!synth || !synth.ctx) return;

    const secondsPerBeat = 60.0 / bpm;
    const stepDuration = secondsPerBeat / 4; // 16th notes
    nextNoteTimeRef.current += stepDuration;

    setCurrentStep((prevStep) => (prevStep + 1) % STEPS);
  };

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header className="from-purple-900">
        <div className="mb-2">
          <h1 className="text-white text-3xl font-bold">Music Composer</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Build your own beat using our built-in real-time step sequencer.
          </p>
        </div>
      </Header>

      <div className="px-6 py-6 flex flex-col items-center justify-center">
        {/* Controls Panel */}
        <div className="w-full max-w-4xl bg-neutral-800/40 backdrop-blur-md rounded-xl p-6 border border-neutral-700/50 flex flex-wrap gap-6 items-center justify-between mb-8 shadow-xl">
          <div className="flex items-center gap-4">
            <Button
              onClick={togglePlayback}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition"
            >
              {isPlaying ? (
                <>
                  <BsPauseFill size={20} /> Pause
                </>
              ) : (
                <>
                  <BsPlayFill size={20} /> Play Beat
                </>
              )}
            </Button>

            <Button
              onClick={randomizeGrid}
              className="bg-transparent hover:bg-neutral-700/50 text-white border border-neutral-600 px-4 py-3 rounded-full flex items-center gap-2 transition"
            >
              <BsShuffle size={16} /> Random
            </Button>

            <Button
              onClick={clearGrid}
              className="bg-transparent hover:bg-neutral-700/50 text-white border border-neutral-600 px-4 py-3 rounded-full flex items-center gap-2 transition"
            >
              <BsTrash size={16} /> Clear
            </Button>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <span className="text-neutral-300 font-semibold text-sm">Tempo (BPM):</span>
            <input
              type="range"
              min="60"
              max="200"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-green-500 w-32"
            />
            <span className="text-white font-mono bg-neutral-900 px-3 py-1.5 rounded border border-neutral-700 text-sm">
              {bpm}
            </span>
          </div>
        </div>

        {/* Sequencer Grid */}
        <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-2xl relative overflow-x-auto">
          <div className="min-w-[650px] flex flex-col gap-4">
            {TRACK_NAMES.map((trackName, trackIdx) => (
              <div key={trackName} className="flex items-center gap-4">
                {/* Track Label */}
                <div className="w-20 text-neutral-300 font-semibold text-sm select-none">
                  {trackName}
                </div>

                {/* Steps */}
                <div className="flex-1 grid grid-cols-16 gap-1.5">
                  {grid[trackIdx].map((isActive, stepIdx) => {
                    const isPlayhead = isPlaying && currentStep === stepIdx;
                    return (
                      <button
                        key={stepIdx}
                        onClick={() => handleCellClick(trackIdx, stepIdx)}
                        className={`
                          h-10 rounded transition-all duration-100 border relative
                          ${isActive 
                            ? "bg-purple-600 border-purple-400 shadow-[0_0_10px_#9333ea] hover:bg-purple-500" 
                            : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
                          }
                          ${isPlayhead ? "ring-2 ring-green-400 scale-[1.08] z-10" : ""}
                        `}
                      >
                        {/* Pulse visual effect when step matches current playhead */}
                        {isPlayhead && (
                          <span className="absolute inset-0 bg-white/20 rounded animate-ping pointer-events-none" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Grid Indicators */}
          <div className="min-w-[650px] flex items-center gap-4 mt-4 pl-20">
            <div className="flex-1 grid grid-cols-16 gap-1.5 text-center text-[10px] text-neutral-500 font-mono">
              {Array(STEPS).fill(0).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`py-0.5 rounded transition ${
                    isPlaying && currentStep === idx ? "text-green-400 font-bold" : ""
                  }`}
                >
                  {(idx % 4 === 0) ? `|` : ""} {idx + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposerPage;
