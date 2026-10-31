"use client";

import { useState } from "react";
import Fretboard from "./components/fretboard/Fretboard";
import { OcrDropzone } from "./components/scanner/OcrDropzone";
import { type ChordShape } from "@/lib/shape-library";

export default function Home() {
  const [lessonShape, setLessonShape] = useState<ChordShape | null>(null);

  return (
    <main className="min-h-screen bg-[#121212] text-zinc-100 flex flex-col items-center py-12 px-4 font-sans">
      <header className="w-full max-w-5xl mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          ChordCanvas
        </h1>
        <p className="text-zinc-400 text-lg">
          Creation Mode: Interactive theory engine & visualizer.
        </p>
      </header>

      <section className="w-full max-w-5xl flex flex-col gap-6">
        <Fretboard forcedShape={lessonShape} />
      </section>

      <section className="w-full max-w-5xl flex flex-col gap-6 mb-24">
        <OcrDropzone onChordChange={setLessonShape} />
      </section>
    </main>
  );
}