export type FretMatrix = boolean[][];          
export type Mode = 'acoustic' | 'electric';
export type StringStatus = 'open' | 'muted' | 'fretted';

export const emptyMatrix = (): FretMatrix =>
  Array.from({ length: 6 }, () => Array<boolean>(12).fill(false));

export const toggle = (m: FretMatrix, s: number, f: number): FretMatrix =>
  m.map((row, i) => (i === s ? row.map((v, j) => (j === f ? !v : v)) : row));

// Helper to determine string status based on the fret matrix
export const getStringStatus = (m: FretMatrix, stringIndex: number): StringStatus => {
  return m[stringIndex].some(fret => fret) ? 'fretted' : 'muted';
};