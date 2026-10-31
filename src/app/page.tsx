"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Fretboard from "@/app/components/fretboard/Fretboard";
import VolumeSlider from "@/app/components/fretboard/VolumeSlider";
import SaveButton from "@/app/components/SaveButton";
import { emptyMatrix, type FretMatrix, type Mode } from "@/lib/types";
import { activePitches, detectChords } from "@/lib/music-engine";
import { initAudio, play, strum, setMasterVolume } from "@/lib/audio-synth";
import { useBackground } from "@/app/context/BackgroundContext";
import { Chord } from "@tonaljs/tonal";
import { RotateCcw, Play } from "lucide-react";

export default function Home() {
  const [matrix, setMatrix] = useState<FretMatrix>(emptyMatrix());
  const [mode, setMode] = useState<Mode>("acoustic");
  const [volume, setVolume] = useState(80);
  const { setBgTheme, triggerPulse } = useBackground();

  useEffect(() => {
    setBgTheme(mode);
  }, [mode, setBgTheme]);

  const handleModeChange = async (selectedMode: Mode) => {
    await initAudio(selectedMode);
    setMasterVolume(volume);
    setMode(selectedMode);
    setBgTheme(selectedMode);
    triggerPulse();
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setMasterVolume(newVol);
  };

  const handleClear = () => {
    setMatrix(emptyMatrix());
  };

  const pitches = useMemo(() => activePitches(matrix), [matrix]);
  const detected = useMemo(() => detectChords(matrix), [matrix]);
  const primaryChord = detected[0] ? Chord.get(detected[0]) : null;

  const handleMatrixChange = useCallback(async (newMatrix: FretMatrix) => {
    setMatrix(newMatrix);
    const updatedPitches = activePitches(newMatrix);
    if (updatedPitches.length > 0) {
      await play(updatedPitches);
    }
  }, []);

  const handleStrum = async () => {
    if (pitches.length > 0) {
      await strum(pitches);
    }
  };

  const isElectric = mode === "electric";
  // Dimmed border and shadow values
  const borderThemeClass = isElectric ? "border-cyan-500/15 shadow-cyan-500/5" : "border-amber-500/15 shadow-amber-500/5";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 sm:gap-8 w-full">
      {/* Responsive Studio Console Toolbar */}
      <div className={`
        flex flex-col lg:flex-row lg:items-center justify-between gap-4 
        bg-zinc-950/70 p-4 sm:p-5 rounded-2xl backdrop-blur-2xl shadow-xl transition-colors duration-700 border ${borderThemeClass}
      `}>
        <div className="flex items-center justify-between lg:justify-start gap-3">
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-300 uppercase bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 shadow-sm">
            Creation Mode
          </span>
          <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
            Click frets to lookup chords
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleStrum}
            disabled={pitches.length === 0}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer border
              ${isElectric
                ? "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-300"
                : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300"
              }
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            <Play className={`w-3.5 h-3.5 ${isElectric ? "fill-cyan-400 text-cyan-400" : "fill-amber-400 text-amber-400"}`} />
            Strum
          </button>

          <SaveButton matrix={matrix} chordName={detected[0] || ""} mode={mode} />

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            Clear
          </button>

          <VolumeSlider value={volume} onChange={handleVolumeChange} mode={mode} />

          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800/90 p-1 rounded-xl shadow-inner w-full sm:w-auto justify-center">
            <button
              onClick={() => handleModeChange("acoustic")}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !isElectric 
                  ? "bg-amber-500 text-zinc-950 font-black shadow-lg shadow-amber-500/30" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Acoustic
            </button>
            <button
              onClick={() => handleModeChange("electric")}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isElectric 
                  ? "bg-cyan-400 text-zinc-950 font-black shadow-lg shadow-cyan-400/30" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Electric
            </button>
          </div>
        </div>
      </div>

      <Fretboard matrix={matrix} onChange={handleMatrixChange} mode={mode} />

      {/* Chord Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        <div className={`bg-zinc-950/60 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between shadow-xl transition-colors duration-700 border ${borderThemeClass}`}>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Detected Chord</span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
              {detected[0] || "—"}
            </div>
          </div>
          {primaryChord && (
            <p className="text-xs text-zinc-400 mt-4 font-medium">
              Type: <span className="text-zinc-200 capitalize font-semibold">{primaryChord.name}</span>
            </p>
          )}
        </div>

        <div className={`bg-zinc-950/60 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between shadow-xl transition-colors duration-700 border ${borderThemeClass}`}>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Active Pitches</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {pitches.length > 0 ? (
                pitches.map((note, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono font-semibold text-zinc-200 shadow-sm">
                    {note}
                  </span>
                ))
              ) : (
                <span className="text-sm text-zinc-600 italic">No notes fretted</span>
              )}
            </div>
          </div>
          <span className="text-xs text-zinc-500 mt-4">Low string → High string</span>
        </div>

        <div className={`bg-zinc-950/60 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between shadow-xl transition-colors duration-700 border ${borderThemeClass}`}>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Alternatives & Inversions</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {detected.length > 1 ? (
                detected.slice(1).map((chord, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-medium shadow-sm">
                    {chord}
                  </span>
                ))
              ) : (
                <span className="text-sm text-zinc-600 italic">None detected</span>
              )}
            </div>
          </div>
          <span className="text-xs text-zinc-500 mt-4">Computed via Tonal.js</span>
        </div>
      </div>
    </div>
  );
}