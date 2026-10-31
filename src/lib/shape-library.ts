import { emptyMatrix, type FretMatrix } from "./types";

export interface ChordShape {
  matrix: FretMatrix;
  openOverrides: Record<number, boolean>;
}

// Helper to quickly generate a matrix from an array of fret positions (0 = open/muted, 1-12 = fretted)
// Array order: [low E, A, D, G, B, high E]
function buildShape(frets: number[], openStrings: number[]): ChordShape {
  const m = emptyMatrix();
  frets.forEach((fret, stringIndex) => {
    if (fret > 0) m[stringIndex][fret - 1] = true;
  });
  
  const openOverrides: Record<number, boolean> = {};
  openStrings.forEach(stringIndex => {
    openOverrides[stringIndex] = true;
  });

  return { matrix: m, openOverrides };
}

// Initial V1 Library (Expand this up to 30-40 common chords[cite: 11])
export const SHAPE_LIBRARY: Record<string, ChordShape> = {
  "C": buildShape([0, 3, 2, 0, 1, 0], [3, 5]), // Mutes low E (0), open G (3) and high E (5)
  "G": buildShape([3, 2, 0, 0, 0, 3], [2, 3, 4]),
  "D": buildShape([0, 0, 0, 2, 3, 2], [2]),
  "Am": buildShape([0, 0, 2, 2, 1, 0], [1, 5]),
  "E": buildShape([0, 2, 2, 1, 0, 0], [0, 4, 5]),
  "Em": buildShape([0, 2, 2, 0, 0, 0], [0, 3, 4, 5]),
  "F": buildShape([1, 3, 3, 2, 1, 1], []), // Barre chord, no open strings
};