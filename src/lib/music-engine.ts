import { Chord, Note } from '@tonaljs/tonal';
import type { FretMatrix } from './types';

const OPEN = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] as const; // index 0 = low E

export function pitchAt(s: number, f: number): string {
  return Note.fromMidi(Note.midi(OPEN[s])! + f + 1);
}

export function activePitches(m: FretMatrix): string[] {
  const out: string[] = [];
  if (!m || !Array.isArray(m)) return out;

  for (let s = 0; s < m.length; s++) {
    if (!m[s] || !Array.isArray(m[s])) continue;
    for (let f = 0; f < m[s].length; f++) {
      if (m[s][f]) {
        out.push(pitchAt(s, f));
      }
    }
  }
  return out;
}

export function detectChords(m: FretMatrix): string[] {
  const pcs = activePitches(m).map(Note.pitchClass);
  return pcs.length >= 2 ? Chord.detect(pcs) : [];
}