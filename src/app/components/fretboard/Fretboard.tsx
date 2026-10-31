"use client";

import { useCallback } from "react";
import { FretCell } from "./FretCell";
import { pitchAt } from "@/lib/music-engine";
import { Note } from "@tonaljs/tonal";
import type { FretMatrix, Mode } from "@/lib/types";

interface FretboardProps {
  matrix: FretMatrix;
  onChange: (matrix: FretMatrix) => void;
  mode?: Mode;
}

const STRING_TUNINGS = [
  { index: 5, note: "e" }, // High E (1st string)
  { index: 4, note: "B" }, // B (2nd string)
  { index: 3, note: "G" }, // G (3rd string)
  { index: 2, note: "D" }, // D (4th string)
  { index: 1, note: "A" }, // A (5th string)
  { index: 0, note: "E" }, // Low E (6th string)
];

const STRING_GAUGES = [
  { index: 5, thickness: "h-[1px]" },
  { index: 4, thickness: "h-[2px]" },
  { index: 3, thickness: "h-[3px]" },
  { index: 2, thickness: "h-1" },
  { index: 1, thickness: "h-[5px]" },
  { index: 0, thickness: "h-1.5" },
];

const FRET_MARKERS = [3, 5, 7, 9];
const DOUBLE_MARKER = 12;

export default function Fretboard({ 
  matrix, 
  onChange, 
  mode = "acoustic" 
}: FretboardProps) {

  const handleCellClick = useCallback((stringIndex: number, fretIndex: number) => {
    if (!matrix || !matrix[stringIndex]) return;
    const newMatrix = matrix.map((row, sIdx) =>
      sIdx === stringIndex
        ? row.map((val, fIdx) => (fIdx === fretIndex ? !val : val))
        : row
    );
    onChange(newMatrix);
  }, [matrix, onChange]);

  return (
    <div className="w-full overflow-x-auto pb-4 flex flex-col gap-3 select-none">
      {/* Fret Numbers Header */}
      <div className="flex ml-14 pr-3 text-center text-xs font-mono font-medium text-zinc-400 tracking-wider">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 transition-colors hover:text-white">
            {i + 1}
          </div>
        ))}
      </div>

      <div className="flex items-center">
        {/* String Names Badges */}
        <div className="flex flex-col justify-between py-5 pr-3 gap-6">
          {STRING_TUNINGS.map((s) => (
            <div key={s.index} className="h-6 flex items-center justify-end w-6">
              <span className="flex items-center justify-center w-6 h-6 bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 rounded-md text-[11px] font-mono font-bold text-zinc-300 shadow-sm">
                {s.note}
              </span>
            </div>
          ))}
        </div>

        {/* Main Fretboard Container */}
        <div 
          className={`
            relative flex-1 min-w-[760px] flex flex-col rounded-2xl shadow-2xl transition-all duration-700 overflow-hidden border backdrop-blur-xl
            ${mode === "acoustic" 
              ? "bg-gradient-to-r from-[#201007]/90 via-[#331608]/90 to-[#201007]/90 border-amber-900/30 shadow-amber-950/30" 
              : "bg-gradient-to-r from-[#111114]/95 via-[#08080a]/95 to-[#111114]/95 border-zinc-800/80 shadow-black/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
            }
          `}
        >
          {/* Fret Nut (Fret 0) */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-400 z-10 shadow-lg"></div>

          {/* Fret Inlay Markers & Grid Lines */}
          <div className="absolute inset-0 ml-4 flex pointer-events-none">
            {Array.from({ length: 12 }).map((_, fretIdx) => {
              const fretNumber = fretIdx + 1;
              return (
                <div key={fretIdx} className="relative flex-1 border-r border-zinc-700/20 flex items-center justify-center">
                  {FRET_MARKERS.includes(fretNumber) && (
                    <div className="absolute w-3.5 h-3.5 rounded-full bg-zinc-400/10 shadow-inner backdrop-blur-[2px]"></div>
                  )}
                  {fretNumber === DOUBLE_MARKER && (
                    <div className="absolute flex flex-col gap-10">
                      <div className="w-3.5 h-3.5 rounded-full bg-zinc-400/10 shadow-inner backdrop-blur-[2px]"></div>
                      <div className="w-3.5 h-3.5 rounded-full bg-zinc-400/10 shadow-inner backdrop-blur-[2px]"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Strings & Interactive Cells Layer */}
          <div className="relative z-20 flex flex-col justify-between py-5 gap-6 ml-4">
            {STRING_TUNINGS.map((string) => {
              const gauge = STRING_GAUGES.find(g => g.index === string.index)!;
              return (
                <div key={string.index} className="relative flex items-center h-6">
                  {/* Metal String Line */}
                  <div className={`absolute left-0 right-0 ${gauge.thickness} bg-gradient-to-b from-zinc-100 via-zinc-300 to-zinc-500 shadow-[0_1px_3px_rgba(0,0,0,0.7)] opacity-90`} />
                  
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 12 }).map((_, fretIdx) => {
                      const isActive = matrix && matrix[string.index] ? matrix[string.index][fretIdx] : false;
                      const pitch = isActive ? pitchAt(string.index, fretIdx) : "";
                      const noteName = pitch ? Note.pitchClass(pitch) : "";
                      const isRoot = isActive && string.index === 0 && fretIdx === 0; 
                      
                      return (
                        <div key={fretIdx} className="flex-1">
                          <FretCell
                            isActive={isActive}
                            noteLabel={noteName}
                            isRoot={isRoot}
                            mode={mode}
                            onClick={() => handleCellClick(string.index, fretIdx)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}