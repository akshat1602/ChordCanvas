import { Chord, Note } from '@tonaljs/tonal';
import type { FretMatrix, StringStatus } from './types';

const OPEN = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] as const; 

export function pitchAt(s: number, f: number): string {
  return Note.fromMidi(Note.midi(OPEN[s])! + f + 1);
}

// Updated to accept explicit open string overrides
export function activePitches(m: FretMatrix, stringStatuses: StringStatus[]): string[] {
  const out: string[] = [];
  for (let s = 0; s < 6; s++) {
    let stringHasFrettedNote = false;
    for (let f = 0; f < 12; f++) {
      if (m[s][f]) {
        out.push(pitchAt(s, f));
        stringHasFrettedNote = true;
      }
    }
    // If no frets are pressed AND the user explicitly marked it open
    if (!stringHasFrettedNote && stringStatuses[s] === 'open') {
      out.push(OPEN[s]);
    }
  }
  return out; 
}

export function detectChords(m: FretMatrix, stringStatuses: StringStatus[]): string[] {
  const pcs = activePitches(m, stringStatuses).map(Note.pitchClass);
  return pcs.length >= 2 ? Chord.detect(pcs) : []; 
}