"use client";

import { memo } from "react";

interface FretCellProps {
  stringIndex: number;
  fretIndex: number;
  isActive: boolean;
  onToggle: (s: number, f: number) => void;
  activeColorClass?: string;
}

export const FretCell = memo(function FretCell({ 
  stringIndex, 
  fretIndex, 
  isActive, 
  onToggle,
  activeColorClass = 'bg-[#5b5fd8] shadow-[0_0_12px_rgba(91,95,216,0.8)]'
}: FretCellProps) {
  return (
    <div
      onClick={() => onToggle(stringIndex, fretIndex)}
      className="flex-1 h-12 border-r border-zinc-800 flex justify-center items-center cursor-pointer relative z-10 hover:bg-zinc-800/30 transition-colors"
    >
      {isActive && (
        <div className={`w-5 h-5 rounded-full animate-in fade-in zoom-in duration-150 ${activeColorClass}`} />
      )}
    </div>
  );
});