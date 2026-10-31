// Strict regex anchored to ignore lyrics
const CHORD_RE_STRICT = /(?<![A-Za-z])([A-G][#b]?(?:maj|min|m|M|aug|dim|sus)?[0-9]*(?:\/[A-G][#b]?)?)(?![A-Za-z])/g;

export function extractChords(rawText: string): string[] {
  const matches = rawText.match(CHORD_RE_STRICT);
  return matches ? matches : [];
}