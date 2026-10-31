"use client";

import { useEffect, useState } from "react";
import { useBackground } from "@/app/context/BackgroundContext";
import { UploadCloud, FileText, Sparkles, Music, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function SongScannerPage() {
  const { setBgTheme } = useBackground();

  useEffect(() => {
    setBgTheme("neutral");
  }, [setBgTheme]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 shadow-sm">
            Learning Mode
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Song Scanner</h1>
        <p className="text-xs sm:text-sm font-medium text-zinc-400">
          Upload a chord chart screenshot. The local OCR engine will extract the chords and create a step-by-step interactive lesson.
        </p>
      </div>

      {/* Scanner Workspace Box */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-6 sm:p-12 backdrop-blur-2xl shadow-2xl shadow-black/60 flex flex-col items-center justify-center text-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shadow-inner animate-pulse">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-2 max-w-md">
          <h3 className="text-lg font-bold text-white tracking-tight">Drop your chord chart here</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Drag and drop an image of chord sheets or tabs. Processing runs 100% locally in your browser using tesseract.js worker threads.
          </p>
        </div>

        <label className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Browse Screenshot</span>
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>

      {/* Info Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950/50 border border-zinc-800/70 rounded-xl p-5 backdrop-blur-md flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Local OCR Engine
          </span>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Runs client-side in a Web Worker to ensure zero server payload limits and instant text extraction.
          </p>
        </div>
        <div className="bg-zinc-950/50 border border-zinc-800/70 rounded-xl p-5 backdrop-blur-md flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-amber-400" /> Spacebar Stepper
          </span>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Press the Spacebar while playing to advance through each chord shape on the interactive fretboard.
          </p>
        </div>
        <div className="bg-zinc-950/50 border border-zinc-800/70 rounded-xl p-5 backdrop-blur-md flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" /> Instant Validation
          </span>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Regex filters automatically strip lyric text so only valid chord symbols populate your progression.
          </p>
        </div>
      </div>
    </div>
  );
}