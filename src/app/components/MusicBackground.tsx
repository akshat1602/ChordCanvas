"use client";

import { useEffect, useState } from "react";
import { useBackground } from "@/app/context/BackgroundContext";

const FLOATING_NOTES = [
  { symbol: "♪", left: "5%", size: "text-2xl", duration: "32s", delay: "0s" },
  { symbol: "♫", left: "18%", size: "text-3xl", duration: "40s", delay: "6s" },
  { symbol: "♯", left: "32%", size: "text-xl", duration: "36s", delay: "2s" },
  { symbol: "♭", left: "48%", size: "text-2xl", duration: "45s", delay: "8s" },
  { symbol: "♪", left: "62%", size: "text-3xl", duration: "38s", delay: "3s" },
  { symbol: "♫", left: "75%", size: "text-xl", duration: "42s", delay: "5s" },
  { symbol: "♯", left: "88%", size: "text-2xl", duration: "35s", delay: "1s" },
  { symbol: "♭", left: "95%", size: "text-3xl", duration: "48s", delay: "10s" },
];

export default function MusicBackground() {
  const { bgTheme, pulseKey } = useBackground();
  const [mousePos, setMousePos] = useState({ x: -300, y: -300 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getAmbientTone = () => {
    switch (bgTheme) {
      case "acoustic":
        return "bg-gradient-to-tr from-amber-600/10 via-orange-600/5 to-amber-700/10 blur-[180px]";
      case "electric":
        return "bg-gradient-to-tr from-cyan-500/10 via-indigo-600/10 to-violet-600/5 blur-[180px]";
      default:
        return "bg-indigo-500/[0.03] blur-[160px]";
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-1000">
      {/* Slow Center-Outward Expanding Fluid Wave / Bloom on Theme Switch */}
      {pulseKey > 0 && (
        <div
          key={pulseKey}
          className={`absolute inset-0 z-0 animate-center-bloom pointer-events-none ${
            bgTheme === "acoustic"
              ? "bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18)_0%,rgba(234,88,12,0.08)_40%,transparent_75%)]"
              : "bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18)_0%,rgba(99,102,241,0.08)_40%,transparent_75%)]"
          }`}
        />
      )}

      {/* Gentle Soft Mouse Follower */}
      <div 
        className={`absolute w-[800px] h-[800px] rounded-full transition-all duration-1000 ease-out -translate-x-1/2 -translate-y-1/2 opacity-70 ${getAmbientTone()}`}
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      />
      
      {/* Faint Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      {/* Floating Musical Notes (Slightly bumped visibility to /50) */}
      <div className="absolute inset-0 overflow-hidden">
        {FLOATING_NOTES.map((note, idx) => (
          <div
            key={idx}
            className={`absolute font-serif font-light select-none animate-float-notes ${note.size} ${
              bgTheme === "acoustic" 
                ? "text-amber-300/50" 
                : bgTheme === "electric" 
                ? "text-cyan-300/50" 
                : "text-indigo-300/50"
            }`}
            style={{
              left: note.left,
              animationDuration: note.duration,
              animationDelay: note.delay,
            }}
          >
            {note.symbol}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes centerBloom {
          0% {
            transform: scale(0.2);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .animate-center-bloom {
          animation: centerBloom 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}