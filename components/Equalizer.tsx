"use client";

import React, { useState } from "react";
import Slider from "./Slider";

interface EqualizerProps {
  filters: BiquadFilterNode[];
  onFilterChange: (index: number, val: number) => void;
}

const BANDS = [
  { label: "Bass", freq: "60Hz" },
  { label: "Low-Mid", freq: "250Hz" },
  { label: "Mids", freq: "1kHz" },
  { label: "High-Mid", freq: "4kHz" },
  { label: "Treble", freq: "16kHz" },
];

const PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0],
  "Bass Booster": [8, 5, 0, -1, -2],
  "Vocal Booster": [-2, 1, 6, 4, 1],
  Electronic: [5, 3, -1, 3, 4],
  Pop: [3, 2, -2, 2, 3],
};

const Equalizer: React.FC<EqualizerProps> = ({ filters, onFilterChange }) => {
  const [gains, setGains] = useState<number[]>([0, 0, 0, 0, 0]);
  const [currentPreset, setCurrentPreset] = useState("Flat");

  const handleGainChange = (index: number, val: number) => {
    // Map Slider value (0 to 1) to gain range (-12dB to +12dB)
    const dbValue = Math.round((val - 0.5) * 24);
    
    const newGains = [...gains];
    newGains[index] = dbValue;
    setGains(newGains);
    setCurrentPreset("Custom");

    onFilterChange(index, dbValue);
  };

  const applyPreset = (presetName: string) => {
    const presetGains = PRESETS[presetName];
    if (!presetGains) return;

    setGains(presetGains);
    setCurrentPreset(presetName);

    presetGains.forEach((dbValue, index) => {
      onFilterChange(index, dbValue);
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl shadow-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-sm font-semibold tracking-wider">AUDIO EQUALIZER</h3>
        
        {/* Presets Select */}
        <select
          value={currentPreset}
          onChange={(e) => applyPreset(e.target.value)}
          className="bg-neutral-800 text-neutral-300 text-xs px-3 py-1.5 rounded border border-neutral-700 focus:outline-none focus:border-green-500 cursor-pointer"
        >
          <option value="Custom" disabled>Presets</option>
          {Object.keys(PRESETS).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Sliders Grid */}
      <div className="flex justify-between items-center gap-2 h-44 mt-6">
        {BANDS.map((band, idx) => {
          // Normalize DB value (-12 to +12) to Slider range (0 to 1)
          const sliderVal = (gains[idx] + 12) / 24;

          return (
            <div key={band.label} className="flex flex-col items-center h-full flex-1 gap-y-2">
              {/* Slider (vertical feeling UI) */}
              <div className="h-28 flex items-center justify-center relative w-6">
                <div className="h-full flex items-center">
                  <Slider
                    value={sliderVal}
                    onChange={(val) => handleGainChange(idx, val)}
                  />
                </div>
              </div>

              {/* Db label */}
              <span className="text-[10px] font-mono text-green-400">
                {gains[idx] > 0 ? `+${gains[idx]}` : gains[idx]}dB
              </span>

              {/* Freq Label */}
              <div className="text-center mt-1 select-none">
                <div className="text-white font-medium text-[10px]">{band.label}</div>
                <div className="text-neutral-500 text-[9px] font-mono">{band.freq}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Equalizer;
