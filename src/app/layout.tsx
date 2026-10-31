"use client";

import { useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import MusicBackground from "@/app/components/MusicBackground";
import AuthButton from "@/app/components/AuthButton";
import { BackgroundProvider } from "@/app/context/BackgroundContext";
import { Menu, X, Music, Sparkles, LayoutDashboard } from "lucide-react";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#121212] text-zinc-100 relative selection:bg-indigo-500/30 overflow-x-hidden font-sans">
        <BackgroundProvider>
          {/* Persistent Interactive Musical Background */}
          <MusicBackground />

          {/* Frosted Glass Navigation Bar */}
          <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#121212]/80 backdrop-blur-2xl border-b border-zinc-800/80 shadow-lg">
            <Link href="/" className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.9)] animate-pulse"></span>
              ChordCanvas
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wide text-zinc-400">
              <Link href="/" className="hover:text-white transition-colors duration-200">Fretboard</Link>
              <Link href="/dashboard/scanner" className="hover:text-white transition-colors duration-200">Song Scanner</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors duration-200">Dashboard</Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <AuthButton />
            </div>

            {/* Mobile Menu & Auth Toggle */}
            <div className="flex md:hidden items-center gap-3">
              <AuthButton />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>

          {/* Mobile Dropdown Menu Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-x-0 top-[57px] z-40 bg-[#121212]/95 backdrop-blur-2xl border-b border-zinc-800/80 p-5 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top duration-200">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-sm font-semibold text-zinc-200 hover:text-white"
              >
                <Music className="w-4 h-4 text-indigo-400" /> Fretboard
              </Link>
              <Link 
                href="/dashboard/scanner" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-sm font-semibold text-zinc-200 hover:text-white"
              >
                <Sparkles className="w-4 h-4 text-amber-400" /> Song Scanner
              </Link>
              <Link 
                href="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-sm font-semibold text-zinc-200 hover:text-white"
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Dashboard
              </Link>
            </div>
          )}
          
          <main className="flex-grow flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            {children}
          </main>
        </BackgroundProvider>
      </body>
    </html>
  );
}