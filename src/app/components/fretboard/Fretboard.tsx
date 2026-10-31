"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { emptyMatrix, toggle, getStringStatus, type FretMatrix, type Mode, type StringStatus } from "@/lib/types";
import { detectChords, activePitches } from "@/lib/music-engine";
import { initAudio, play, setGlobalVolume } from "@/lib/audio-synth";
import { FretCell } from "./FretCell";
import { ThemeSwitch } from "./ThemeSwitch";
import { ChordDisplay } from "../analysis/ChordDisplay";
import { Play, Volume2, Save, LogIn, LogOut } from "lucide-react";
import { type ChordShape } from "@/lib/shape-library";
import { createClient } from "@/lib/supabase";
import { signInWithGoogle, signOut, saveProgression } from "@/lib/db-actions";

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

interface FretboardProps {
  forcedShape?: ChordShape | null;
}

export default function Fretboard({ forcedShape }: FretboardProps) {
  const [matrix, setMatrix] = useState<FretMatrix>(emptyMatrix());
  const [mode, setMode] = useState<Mode>('acoustic');
  const [openOverrides, setOpenOverrides] = useState<Record<number, boolean>>({});
  const [audioReady, setAudioReady] = useState(false);
  const [volume, setVolume] = useState(-12);
  
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleModeChange = async (newMode: Mode) => {
    setMode(newMode);
    await initAudio(newMode);
    setAudioReady(true);
  };

  const ensureAudio = async () => {
    if (!audioReady) {
      await initAudio(mode);
      setAudioReady(true);
    }
  };

  useEffect(() => {
    if (forcedShape) {
      setMatrix(forcedShape.matrix);
      setOpenOverrides(forcedShape.openOverrides);
      ensureAudio(); 
    }
  }, [forcedShape]);

  const handleToggle = useCallback((s: number, f: number) => {
    ensureAudio();
    setMatrix((prev) => {
      const newMatrix = toggle(prev, s, f);
      if (newMatrix[s][f]) {
        setOpenOverrides(curr => {
          const next = { ...curr };
          delete next[s];
          return next;
        });
      }
      return newMatrix;
    });
  }, [audioReady]);

  const toggleStringOpen = (s: number) => {
    if (getStringStatus(matrix, s) === 'fretted') return;
    ensureAudio();
    setOpenOverrides(prev => ({ ...prev, [s]: !prev[s] }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setGlobalVolume(newVol);
  };

  const activeColorClass = mode === 'acoustic' 
    ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]' 
    : 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]';

  const stringStatuses = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      if (getStringStatus(matrix, i) === 'fretted') return 'fretted';
      return openOverrides[i] ? 'open' : 'muted';
    }) as StringStatus[];
  }, [matrix, openOverrides]);

  const currentPitches = useMemo(() => activePitches(matrix, stringStatuses), [matrix, stringStatuses]);
  const detectedChords = useMemo(() => detectChords(matrix, stringStatuses), [matrix, stringStatuses]);

  const handleClear = () => {
    setMatrix(emptyMatrix());
    setOpenOverrides({});
  };

  const handleStrum = async () => {
    await ensureAudio();
    if (currentPitches.length > 0) {
      play(currentPitches);
    }
  };

  const handleSave = async () => {
    if (!user || detectedChords.length === 0) return;
    setIsSaving(true);
    try {
      await saveProgression("My Progression", mode, [{
        name: detectedChords[0],
        matrix,
        openOverrides
      }]);
      alert("Progression saved securely!");
    } catch (error) {
      console.error(error);
      alert("Error saving progression.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto">
      <ChordDisplay chords={detectedChords} />

      <div className="flex justify-between items-center w-full mb-6">
         <ThemeSwitch mode={mode} onModeChange={handleModeChange} />
         
         <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
             {!mounted ? (
               <div className="h-8 w-24 bg-zinc-800/50 animate-pulse rounded" />
             ) : user ? (
               <>
                 <button onClick={handleSave} disabled={isSaving || detectedChords.length === 0} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 rounded transition-colors disabled:opacity-50">
                   <Save size={14} /> {isSaving ? "Saving..." : "Save"}
                 </button>
                 <button onClick={signOut} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
                   <LogOut size={14} /> Logout
                 </button>
               </>
             ) : (
               <button onClick={signInWithGoogle} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors">
                 <LogIn size={14} /> Sign in with Google
               </button>
             )}
           </div>

           <div className="flex items-center gap-2">
             <Volume2 size={16} className="text-zinc-500" />
             <input
               type="range"
               min="-60"
               max="0"
               value={volume}
               onChange={handleVolumeChange}
               className="w-24 accent-zinc-500 hover:accent-zinc-400 cursor-pointer"
             />
           </div>

           <div className="flex items-center gap-4">
             <button
               onClick={handleStrum}
               disabled={currentPitches.length === 0}
               className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
             >
               <Play size={16} />
               Strum Chord
             </button>
             <button 
               onClick={handleClear}
               className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
             >
               Clear Board
             </button>
           </div>
         </div>
      </div>

      <div className="w-full p-6 bg-[#121212] rounded-xl border border-zinc-800 overflow-x-auto">
        <div className="flex flex-col min-w-[650px]">
          {matrix.map((stringRow, stringIndex) => {
            const status = stringStatuses[stringIndex];
            
            return (
              <div key={`string-${stringIndex}`} className="flex relative w-full items-center">
                <div className="w-8 flex-shrink-0 text-zinc-500 font-mono text-sm font-bold text-left select-none">
                  {STRING_LABELS[stringIndex]}
                </div>
                <div 
                  onClick={() => toggleStringOpen(stringIndex)}
                  className={`w-8 mr-2 flex-shrink-0 flex justify-center items-center font-mono text-xs font-bold cursor-pointer transition-colors ${
                    status === 'fretted' ? 'text-zinc-700 cursor-default' : 
                    status === 'open' ? 'text-green-500' : 'text-red-500/70 hover:text-green-500/50'
                  }`}
                >
                  {status === 'fretted' ? '-' : status === 'open' ? 'O' : 'X'}
                </div>
                <div className="flex flex-1 relative border-l-4 border-zinc-400">
                  <div className="absolute w-full h-[1px] bg-zinc-800 top-1/2 -translate-y-1/2 z-0" />
                  
                  {stringRow.map((isActive, fretIndex) => (
                    <FretCell
                      key={`fret-${stringIndex}-${fretIndex}`}
                      stringIndex={stringIndex}
                      fretIndex={fretIndex}
                      isActive={isActive}
                      onToggle={handleToggle}
                      activeColorClass={activeColorClass}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex relative w-full items-center mt-3">
            <div className="w-16 flex-shrink-0 mr-2" /> 
            <div className="flex flex-1 text-zinc-600 text-xs font-mono select-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`marker-${i}`} className="flex-1 text-center">
                  {[2, 4, 6, 8, 11].includes(i) ? (i === 11 ? "12" : "•") : ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}