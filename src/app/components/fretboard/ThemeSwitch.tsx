"use client";

import { type Mode } from "@/lib/types";
import { Guitar, Zap } from "lucide-react";

interface ThemeSwitchProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export function ThemeSwitch({ mode, onModeChange }: ThemeSwitchProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-lg border border-zinc-800 self-center md:self-start">
      <button
        onClick={() => onModeChange('acoustic')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'acoustic' 
            ? 'bg-amber-600/20 text-amber-500' 
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Guitar size={16} />
        Acoustic
      </button>
      <button
        onClick={() => onModeChange('electric')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'electric' 
            ? 'bg-cyan-500/20 text-cyan-400' 
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Zap size={16} />
        Electric
      </button>
    </div>
  );
}