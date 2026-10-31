"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { analyseProgression, type AnalysisResult } from "@/app/actions/ai-copilot";
import { Sparkles, Music, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [progressions, setProgressions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProg, setSelectedProg] = useState<any | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        window.location.href = "/";
        return;
      }

      const { data, error } = await supabase
        .from('progressions')
        .select(`*, chords (*)`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProgressions(data);
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const handleAnalyze = async (chords: string[]) => {
    setAnalyzing(true);
    setAnalysis(null);
    const res = await analyseProgression(chords);
    if (res.ok) {
      setAnalysis(res.data);
    } else {
      alert(res.error);
    }
    setAnalyzing(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('progressions').delete().eq('id', id);
    if (!error) {
      setProgressions(prev => prev.filter(p => p.id !== id));
      if (selectedProg?.id === id) setSelectedProg(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#121212] text-zinc-400 flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <main className="min-h-screen bg-[#121212] text-zinc-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-300 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white">ChordCanvas Dashboard</h1>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-zinc-300">Your Progressions</h2>
            {progressions.length === 0 ? (
              <p className="text-sm text-zinc-500">No saved progressions yet.</p>
            ) : (
              progressions.map((prog) => (
                <div 
                  key={prog.id}
                  onClick={() => { setSelectedProg(prog); setAnalysis(null); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                    selectedProg?.id === prog.id ? "bg-indigo-600/10 border-indigo-500" : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-white">{prog.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1 capitalize">{prog.instrument_mode}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(prog.id); }}
                    className="text-zinc-500 hover:text-red-400 p-2 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="md:col-span-2 flex flex-col gap-6">
            {selectedProg ? (
              <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedProg.title}</h2>
                  <p className="text-xs text-zinc-400 capitalize">Mode: {selectedProg.instrument_mode}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 mb-2">Chords:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProg.chords?.sort((a: any, b: any) => a.position - b.position).map((c: any, i: number) => (
                      <div key={i} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-white font-mono font-bold text-sm">
                        {c.chord_name}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleAnalyze(selectedProg.chords.map((c: any) => c.chord_name))}
                  disabled={analyzing}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <Sparkles size={18} />
                  {analyzing ? "Analyzing with Groq..." : "Run AI Theory & Songwriting Analysis"}
                </button>

                {analysis && (
                  <div className="flex flex-col gap-4 mt-4 animate-in fade-in duration-300 border-t border-zinc-800 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#121212] rounded-lg border border-zinc-800">
                        <h4 className="text-xs font-semibold text-indigo-400 uppercase mb-2">Theory Analysis</h4>
                        <p className="text-sm text-zinc-300"><strong>Key:</strong> {analysis.theory.detected_key}</p>
                        <p className="text-sm text-zinc-300 mt-1"><strong>Numerals:</strong> {analysis.theory.roman_numeral_analysis.join(" - ")}</p>
                        <p className="text-xs text-zinc-400 mt-2">{analysis.theory.harmonic_summary}</p>
                      </div>

                      <div className="p-4 bg-[#121212] rounded-lg border border-zinc-800">
                        <h4 className="text-xs font-semibold text-emerald-400 uppercase mb-2">Songwriting</h4>
                        <p className="text-sm text-zinc-300"><strong>Scales:</strong> {analysis.songwriting.recommended_scales.join(", ")}</p>
                        <p className="text-sm text-zinc-300 mt-1"><strong>Themes:</strong> {analysis.songwriting.lyrical_themes.join(", ")}</p>
                        <p className="text-xs text-zinc-400 mt-2"><strong>Tip:</strong> {analysis.songwriting.vocal_melody_tip}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-500 h-full min-h-[300px]">
                <Music size={48} className="mb-4 opacity-50" />
                <p>Select a saved progression to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}