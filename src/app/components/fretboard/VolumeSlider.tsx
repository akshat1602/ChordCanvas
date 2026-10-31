"use client";

import { Volume2, VolumeX } from "lucide-react";
import type { Mode } from "@/lib/types";

interface VolumeSliderProps {
  value: number;
  onChange: (val: number) => void;
  mode?: Mode;
}

export default function VolumeSlider({ value, onChange, mode = "acoustic" }: VolumeSliderProps) {
  const isElectric = mode === "electric";

  return (
    <div className="flex items-center gap-3 px-3.5 py-1.5 bg-zinc-900/90 border border-zinc-800/80 rounded-xl backdrop-blur-md shadow-inner">
      <button 
        onClick={() => onChange(value > 0 ? 0 : 80)}
        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
        title={value === 0 ? "Unmute" : "Mute"}
      >
        {value === 0 ? (
          <VolumeX className="w-4 h-4 text-red-400" />
        ) : (
          <Volume2 className={`w-4 h-4 ${isElectric ? "text-cyan-400" : "text-amber-400"}`} />
        )}
      </button>

      <div className="flex flex-col gap-1 w-24">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
          <span>Vol</span>
          <span className="text-zinc-200 font-bold">{value}%</span>
        </div>
        <div className="relative flex items-center h-2">
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`
              w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-800 focus:outline-none transition-all
              ${isElectric 
                ? "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.9)]" 
                : "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(251,191,36,0.9)]"
              }
            `}
          />
        </div>
      </div>
    </div>
  );
}