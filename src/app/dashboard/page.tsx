"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { analyseProgression, type AnalysisResult } from "@/app/actions/ai-copilot";
import { useBackground } from "@/app/context/BackgroundContext";
import { Sparkles, Music, Trash2, ArrowLeft, Loader2, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [progressions, setProgressions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<string>("all");
  
  const { setBgTheme, triggerPulse } = useBackground();

  const handleModeFilter = (mode: string) => {
    setFilterMode(mode);
    if (mode === "acoustic") {
      setBgTheme("acoustic");
      triggerPulse();
    } else if (mode === "electric") {
      setBgTheme("electric");
      triggerPulse();
    } else {
      setBgTheme("neutral");
      triggerPulse();
    }
  };

  useEffect(() => {
    if (filterMode === "acoustic") setBgTheme("acoustic");
    else if (filterMode === "electric") setBgTheme("electric");
    else setBgTheme("neutral");
  }, [filterMode, setBgTheme]);

  const [analyses, setAnalyses] = useState<Record<string, AnalysisResult>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(session.user);

        const { data, error } = await supabase
          .from("progressions")
          .select("*, chords(*)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProgressions(data || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadData();
      else setProgressions([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("progressions").delete().eq("id", id);
    if (!error) {
      setProgressions(prev => prev.filter(p => p.id !== id));
    } else {
      alert("Failed to delete progression");
    }
  };

  const handleAnalyze = async (progId: string, chords: string[]) => {
    setAnalyzingId(progId);
    try {
      const res = await analyseProgression(chords);
      if (res.ok) {
        setAnalyses(prev => ({ ...prev, [progId]: res.data }));
      } else {
        alert(res.error || "AI analysis failed");
      }
    } catch (err) {
      console.error("AI analysis error:", err);
      alert("Failed to contact AI co-producer.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const filteredProgressions = progressions.filter(p => {
    if (filterMode === "all") return true;
    return p.instrument_mode === filterMode;
  });

  const isElectric = filterMode === "electric";
  const isAcoustic = filterMode === "acoustic";
  
  // Dimmed border logic for dashboard
  const borderThemeClass = isElectric 
    ? "border-cyan-500/15 shadow-cyan-500/5" 
    : isAcoustic 
    ? "border-amber-500/15 shadow-amber-500/5" 
    : "border-indigo-500/15 shadow-indigo-500/5"; // Neutral state boundary

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4 bg-zinc-950/70 border border-zinc-800/80 rounded-3xl backdrop-blur-xl shadow-2xl my-auto">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-xl">
          <ShieldAlert className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Authentication Required</h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Please sign in using the top navigation bar to access your saved chord progressions and AI co-producer insights.
        </p>
        <Link 
          href="/"
          className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Fretboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-6xl mx-auto">
      {/* Unified Studio Dashboard Header */}
      <div className={`
        flex flex-col sm:flex-row sm:items-center justify-between gap-4 
        bg-zinc-950/70 p-5 sm:p-6 rounded-2xl backdrop-blur-2xl shadow-xl transition-colors duration-700 border ${borderThemeClass}
      `}>
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-300 uppercase bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 shadow-sm">
            Library Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">Your Dashboard</h1>
          <p className="text-xs sm:text-sm font-medium text-zinc-400 mt-1">
            Manage, review, and analyze your saved guitar progressions with the AI co-producer.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800/90 p-1 rounded-xl shadow-inner self-start sm:self-auto">
          <button
            onClick={() => handleModeFilter("all")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
              filterMode === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleModeFilter("acoustic")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
              filterMode === "acoustic"
                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30 font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Acoustic
          </button>
          <button
            onClick={() => handleModeFilter("electric")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
              filterMode === "electric"
                ? "bg-cyan-400 text-zinc-950 shadow-md shadow-cyan-400/30 font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Electric
          </button>
        </div>
      </div>

      {/* Progressions Grid (or Empty State) */}
      {filteredProgressions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredProgressions.map((prog) => {
            const chordNames = prog.chords?.map((c: any) => c.chord_name) || [];
            const analysis = analyses[prog.id];
            const isAnalyzing = analyzingId === prog.id;

            return (
              <div 
                key={prog.id}
                className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between gap-6 shadow-xl hover:border-zinc-700 transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-indigo-300 font-semibold shadow-sm">
                      {prog.instrument_mode}
                    </span>
                    <button
                      onClick={() => handleDelete(prog.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                      title="Delete progression"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">{prog.title}</h3>
                  <span className="text-xs text-zinc-500">
                    Created {new Date(prog.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {chordNames.length > 0 ? (
                      chordNames.map((name: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono font-semibold text-zinc-200 shadow-sm">
                          {name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-600 italic">No chords recorded</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900/80 flex flex-col gap-3">
                  {analysis ? (
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-2.5 text-xs shadow-inner">
                      <div className="flex items-center justify-between text-indigo-400 font-bold">
                        <span>Key: {analysis.theory.detected_key}</span>
                        <span className="font-mono text-[10px]">{analysis.theory.roman_numeral_analysis.join(" - ")}</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{analysis.theory.harmonic_summary}</p>
                      <div className="text-zinc-400 mt-1">
                        <strong className="text-zinc-200">Scales:</strong> {analysis.songwriting.recommended_scales.join(", ")}
                      </div>
                      <div className="text-zinc-400">
                        <strong className="text-zinc-200">Tip:</strong> {analysis.songwriting.vocal_melody_tip}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAnalyze(prog.id, chordNames)}
                      disabled={isAnalyzing || chordNames.length === 0}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 rounded-xl text-xs font-semibold text-indigo-300 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Analyze with AI Co-Producer
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`bg-zinc-950/60 rounded-2xl p-8 sm:p-14 text-center flex flex-col items-center gap-4 backdrop-blur-xl shadow-xl transition-colors duration-700 border ${borderThemeClass}`}>
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner">
            <Music className="w-6 h-6 text-zinc-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">No saved progressions found</h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
            Head over to the Fretboard, build your favorite chord shapes, and click Save to store them here.
          </p>
          <Link
            href="/"
            className="mt-2 flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Go to Fretboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}