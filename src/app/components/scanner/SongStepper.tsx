"use client";

import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { type ChordShape, SHAPE_LIBRARY } from "@/lib/shape-library";

interface SongStepperProps {
  chords: string[];
  onChordChange: (shape: ChordShape | null) => void;
}

export function SongStepper({ chords, onChordChange }: SongStepperProps) {
  const [step, setStep] = useState(0);
  const [editableChords, setEditableChords] = useState<string[]>(chords);

  // Sync prop to state if a new scan happens
  useEffect(() => {
    setEditableChords(chords);
    setStep(0);
  }, [chords]);

  // Push the current chord shape up to the fretboard
  useEffect(() => {
    const currentChordName = editableChords[step];
    const shape = SHAPE_LIBRARY[currentChordName];
    onChordChange(shape || null);
  }, [step, editableChords, onChordChange]);

  // Core Spacebar handler[cite: 11]
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.code !== 'Space' || /INPUT|TEXTAREA/.test(t.tagName)) return;
      e.preventDefault();
      setStep((i) => Math.min(i + 1, editableChords.length - 1));
    };
    
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editableChords.length]);

  const removeChord = (indexToRemove: number) => {
    setEditableChords(prev => prev.filter((_, i) => i !== indexToRemove));
    if (step >= editableChords.length - 1) setStep(Math.max(0, step - 1));
  };

  if (editableChords.length === 0) return null;

  return (
    <div className="w-full p-6 bg-zinc-900 rounded-xl border border-zinc-800 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Play size={18} className="text-indigo-400" />
          Lesson Track
        </h3>
        <p className="text-xs text-zinc-500">Press <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">Space</kbd> to advance</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {editableChords.map((chord, i) => {
          const isSupported = !!SHAPE_LIBRARY[chord];
          return (
            <div 
              key={`${chord}-${i}`}
              onClick={() => setStep(i)}
              className={`group flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all ${
                step === i 
                  ? "bg-indigo-500 text-white shadow-lg scale-105" 
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              } ${!isSupported && "border border-red-500/50"}`}
            >
              <span className="font-bold text-lg">{chord}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); removeChord(i); }}
                className="ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500 mt-4">
        * Red outlines indicate chords missing from the V1 shape library.
      </p>
    </div>
  );
}