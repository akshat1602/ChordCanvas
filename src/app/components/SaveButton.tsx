"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import type { FretMatrix, Mode } from "@/lib/types";

interface SaveButtonProps {
  matrix: FretMatrix;
  chordName: string;
  mode: Mode;
}

export default function SaveButton({ matrix, chordName, mode }: SaveButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Please sign in to save your progressions.");
      return;
    }

    setSaving(true);

    try {
      const { data: progData, error: progError } = await supabase
        .from("progressions")
        .insert({
          user_id: session.user.id,
          title: chordName ? `${chordName} Progression` : "Custom Fretboard Shape",
          instrument_mode: mode,
        })
        .select()
        .single();

      if (progError) throw progError;

      const { error: chordError } = await supabase
        .from("chords")
        .insert({
          progression_id: progData.id,
          position: 0,
          chord_name: chordName || "Custom",
          fret_matrix: matrix,
        });

      if (chordError) throw chordError;

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      console.error("Save error:", err.message);
      alert("Failed to save progression.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving || saved}
      className={`
        flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer
        ${saved 
          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300" 
          : "bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white"
        }
        disabled:cursor-not-allowed
      `}
      title="Save current chord to dashboard"
    >
      {saving ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
      ) : saved ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
      )}
      <span>{saved ? "Saved!" : "Save"}</span>
    </button>
  );
}