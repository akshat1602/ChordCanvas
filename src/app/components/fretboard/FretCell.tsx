"use client";

import { memo } from "react";

interface FretCellProps {
  isActive: boolean;
  noteLabel?: string;
  isRoot?: boolean;
  mode?: "acoustic" | "electric";
  onClick: () => void;
}

export const FretCell = memo(function FretCell({
  isActive,
  noteLabel = "",
  isRoot = false,
  mode = "acoustic",
  onClick,
}: FretCellProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-full h-full flex items-center justify-center group outline-none cursor-pointer"
    >
      <div
        className={`
          absolute z-10 flex items-center justify-center text-[11px] font-mono tracking-tighter transition-all duration-300 ease-out
          w-7 h-7 rounded-full select-none backdrop-blur-md
          ${isActive 
            ? "scale-100 opacity-100 active:scale-75 shadow-lg translate-y-0" 
            : "scale-40 opacity-0 group-hover:scale-75 group-hover:opacity-40 group-hover:bg-zinc-700/50 translate-y-1 group-hover:translate-y-0"
          }
          ${isActive && isRoot 
            ? "bg-amber-400 text-zinc-950 font-black shadow-[0_0_16px_rgba(251,191,36,0.8)] border border-amber-200" 
            : isActive && mode === "electric"
              ? "bg-cyan-400 text-zinc-950 font-black shadow-[0_0_16px_rgba(34,211,238,0.8)] border border-cyan-200"
            : isActive 
              ? "bg-[#5b5fd8] text-white font-extrabold shadow-[0_0_16px_rgba(91,95,216,0.8)] border border-indigo-300" 
              : ""
          }
        `}
      >
        {noteLabel}
      </div>
    </button>
  );
});