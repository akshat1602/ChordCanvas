"use client";

interface ChordDisplayProps {
  chords: string[];
}

export function ChordDisplay({ chords }: ChordDisplayProps) {
  if (chords.length === 0) {
    return (
      <div className="h-24 flex flex-col justify-center items-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl mb-6 bg-zinc-900/30">
        <p className="text-sm">Click frets to detect a chord...</p>
      </div>
    );
  }

  const [primaryChord, ...alternativeChords] = chords;

  return (
    <div className="h-24 flex flex-col justify-center items-center border border-zinc-800 rounded-xl mb-6 bg-zinc-900">
      <h2 className="text-4xl font-bold text-white tracking-tighter">
        {primaryChord}
      </h2>
      {alternativeChords.length > 0 && (
        <p className="text-xs text-zinc-500 mt-1">
          aka: {alternativeChords.join(" • ")}
        </p>
      )}
    </div>
  );
}