import { createClient } from './supabase';
import type { FretMatrix } from './types';

const supabase = createClient();

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  if (error) {
    console.error("Google Auth Error:", error.message);
  }
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.reload();
}

export async function saveProgression(
  title: string, 
  mode: 'acoustic' | 'electric', 
  chords: { name: string, matrix: FretMatrix, openOverrides: Record<number, boolean> }[]
) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Must be logged in to save.");

  const { data: progression, error: progErr } = await supabase
    .from('progressions')
    .insert({
      user_id: userData.user.id,
      title,
      instrument_mode: mode
    })
    .select()
    .single();

  if (progErr || !progression) throw progErr;

  const chordInserts = chords.map((chord, index) => ({
    progression_id: progression.id,
    position: index,
    chord_name: chord.name,
    fret_matrix: { matrix: chord.matrix, openOverrides: chord.openOverrides }
  }));

  const { error: chordErr } = await supabase
    .from('chords')
    .insert(chordInserts);

  if (chordErr) throw chordErr;
  return progression;
}