<div align="center">

# ChordCanvas

**A dual-mode music theory and visualization engine for acoustic and electric guitarists.**

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%2B_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white)](https://platform.openai.com/)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Using ChordCanvas](#using-chordcanvas)
- [Design System](#design-system)
- [Roadmap](#roadmap)

---

## Overview

Most music apps work like dictionaries: they only help if you already know the name of the chord you want. Self-taught guitarists tend to work the other way around. They know the shape under their fingers, but not what it is called, what key it belongs to, or what to play over it.

ChordCanvas inverts the lookup. It offers two modes:

- **Creation Mode (Reverse-Lookup):** click the frets you are holding on an interactive fretboard and get the chord name, parent key, and complementary scales immediately.
- **Learning Mode (Song Scanner):** upload a screenshot of a chord chart and step through the song chord by chord, with each finger placement shown on the fretboard.

Music theory and audio run entirely in the browser, so the core loop of click, chord label, and sound has no network round trip.

---

## Features

- **Creation Mode (Reverse-Lookup Engine).** Click frets on a 6x12 interactive grid to instantly render chord names, parent keys, and complementary scales.
- **Learning Mode (OCR Song Scanner).** Drag and drop a screenshot of a chord chart. Client-side OCR extracts the chord sequence and turns it into a step-by-step interactive lesson controlled with the Spacebar.
- **Acoustic and Electric Modes.** Toggle between a clean, resonant acoustic string synthesis and an electric lead tone routed through distortion and delay.
- **AI Co-Producer.** Uses OpenAI (`gpt-4o-mini`) via Next.js Server Actions to generate structured JSON insights, including Roman numeral analysis, recommended scales, and vocal melody tips.
- **Cloud Persistence and Auth.** Saves user progressions with Supabase Auth (Google and email) and PostgreSQL, protected by strict Row-Level Security (RLS) policies.
- **Edge Caching.** Public community progression routes use Next.js Incremental Static Regeneration (`revalidate = 3600`) to offload reads from the database.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Music Theory (client-side)** | [`@tonaljs/tonal`](https://github.com/tonaljs/tonal) for offline chord, key, and scale computation |
| **Audio (client-side)** | [`Tone.js`](https://tonejs.github.io/) on the Web Audio API for polyphonic synthesis |
| **OCR (client-side)** | [`tesseract.js`](https://github.com/naptha/tesseract.js) running locally inside a Web Worker |
| **Database and Auth** | Supabase (PostgreSQL, Auth, Row-Level Security) |
| **AI** | OpenAI API (`gpt-4o-mini`) via Next.js Server Actions |
| **Validation** | Zod, for strict validation of AI responses |

### Architecture at a Glance

```
Click or upload
      |
      v
6x12 matrix / OCR text
      |
      v
Pitch mapper  -->  Tonal.js (chord, key, scales)  -->  UI label
      |
      v
Tone.js (acoustic or electric chain)  -->  Audio output
      |
      v
Optional: save to Supabase  -->  Optional: AI Co-Producer (Server Action + Zod)
```

---

## Project Structure

```
chordcanvas/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Landing + Creation Mode fretboard
│   ├── actions/
│   │   └── ai-copilot.ts             # Server Action (OpenAI)
│   ├── components/
│   │   ├── fretboard/
│   │   │   ├── Fretboard.tsx
│   │   │   ├── FretCell.tsx          # Memoized single cell
│   │   │   └── ThemeSwitch.tsx       # Acoustic / electric toggle
│   │   └── scanner/
│   │       ├── DropZone.tsx
│   │       ├── ocr.worker.ts
│   │       └── SongStepper.tsx
│   ├── dashboard/
│   │   ├── page.tsx                  # Saved progressions: view, filter, replay
│   │   └── scanner/
│   │       └── page.tsx              # Learning Mode
├── lib/
│   ├── music-engine.ts               # Pitch mapper + Tonal.js
│   ├── audio-synth.ts                # Tone.js audio chains
│   ├── supabase.ts                   # Client / server helpers
│   └── types.ts                      # Shared types (FretMatrix, Mode)
```

---

## Using ChordCanvas

**Live demo:** [chordcanvas.vercel.app](https://chordcanvas.vercel.app) *(replace with your deployed URL)*

1. **Pick a mode.** Switch between Acoustic and Electric to change both the theme and the sound.
2. **Creation Mode.** Click frets on the grid to see the chord name, parent key, and complementary scales instantly.
3. **Learning Mode.** Open the scanner, drop in a screenshot of a chord chart, and press **Space** to step through each chord on the fretboard.
4. **Save and analyse.** Sign in with Google or email to save progressions, then run the AI Co-Producer for Roman numeral analysis, recommended scales, and vocal melody tips.

---

## Design System

ChordCanvas uses a minimalist, brutalist dark theme in which the fretboard is the focal point.

| Token | Value | Usage |
| --- | --- | --- |
| **Canvas Background** | `#121212` | Application background |
| **String / Fret Lines** | `zinc-800` | Ultra-thin grid lines |
| **Active Note Dot** | `#5b5fd8` | Glowing indigo marker for fretted notes |

The Acoustic and Electric themes apply their own accent tokens on top of this base: warm accents for acoustic, high-contrast neon for electric.

---

## Roadmap

- [ ] Open and muted string states above the nut, so open-position chords can be represented
- [ ] Curated library of common chord shapes to drive Learning Mode fingerings
- [ ] Editable OCR results with confidence hints before a lesson starts
- [ ] Tab-number parsing in addition to chord-name charts
- [ ] Public community progressions with an opt-in sharing toggle
- [ ] Improved acoustic timbre (for example, pluck-style synthesis)
- [ ] Rate limiting and usage caps for the AI Co-Producer
- [ ] Unit tests for the pitch mapper and chord detection
- [ ] Export and share saved progressions
