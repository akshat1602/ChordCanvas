"use client";

import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";
import { UploadCloud, Loader2, FileText } from "lucide-react";
import { extractChords } from "@/lib/chord-parser";
import { SongStepper } from "./SongStepper";
import { type ChordShape } from "@/lib/shape-library";

interface OcrDropzoneProps {
  onChordChange: (shape: ChordShape | null) => void;
}

export function OcrDropzone({ onChordChange }: OcrDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawText, setRawText] = useState("");
  const [progress, setProgress] = useState(0);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setRawText("");
    setProgress(0);
    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      const ret = await worker.recognize(file);
      setRawText(ret.data.text);
      await worker.terminate();
    } catch (error) {
      console.error(error);
      setRawText("Error processing image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) processImage(file);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const parsedChords = extractChords(rawText);

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 flex flex-col gap-6">
      <header className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Learning Mode: Song Scanner</h2>
        <p className="text-zinc-400 text-sm">Upload a chord chart. Text is extracted 100% locally.</p>
      </header>
      
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`w-full p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${
          isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50"
        }`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center text-zinc-400">
            <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
            <p>Scanning chord chart... {progress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-zinc-500">
            <UploadCloud size={48} className="mb-4" />
            <p className="mb-2 text-zinc-300 font-medium">Drag & drop a chord chart screenshot</p>
            <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md cursor-pointer transition-colors text-sm mt-4">
              Select Image
              <input type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
            </label>
          </div>
        )}
      </div>

      {rawText && (
        <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-2 mb-4 text-zinc-400">
            <FileText size={18} />
            <h3 className="font-semibold text-white">Raw OCR Text</h3>
          </div>
          <pre className="whitespace-pre-wrap text-zinc-300 text-sm font-mono bg-[#121212] p-4 rounded-md border border-zinc-800 max-h-60 overflow-y-auto">
            {rawText}
          </pre>
        </div>
      )}

      {parsedChords.length > 0 && (
        <SongStepper chords={parsedChords} onChordChange={onChordChange} />
      )}
    </div>
  );
}