# StudyHub

A Student Study Hub built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.
AI study features run in demo mode out of the box; connect an OpenRouter API key to
enable real AI responses. File and calculator tools run entirely client-side — no
uploads required.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables

Copy `.env.example` to `.env.local` and fill in values if you want real AI features:

```
OPENROUTER_API_KEY=your-key-here
OPENROUTER_MODEL=openrouter/auto
```

Without a key, the AI Study Assistant, Quiz Generator, and any future AI features
run in demo mode and return clearly-labeled placeholder content instead of crashing.

## Build

```bash
npm run build
npm run start
```

This project was written without the ability to run `npm install` / `npm run build`
in the authoring environment (no network access there). Before you rely on it:

1. Run `npm install` and `npm run build` locally and read any TypeScript/ESLint
   output carefully — fix anything that surfaces.
2. Test on a small mobile viewport (375px) and desktop.
3. Try each tool under `/tools` with a real file to confirm the client-side
   PDF/image libraries behave as expected in your target browsers.
4. Confirm `/api/chat`, `/api/generate-quiz`, `/api/generate-flashcards`, and
   `/api/summarize` all return demo responses with no `OPENROUTER_API_KEY` set,
   and real responses once one is added.

## Deploying to Vercel

Push this project to a Git repository and import it in Vercel. No special
configuration is required — Vercel auto-detects the Next.js App Router setup.
Add `OPENROUTER_API_KEY` (optional) under Project Settings → Environment Variables
if you want live AI features in production.

## Project structure

```
app/            Routes (App Router) — pages and API routes
components/     Reusable UI components
core-lib/       Storage layer, AI service abstraction, tools registry, utilities
types/          Shared TypeScript types
```

Note: the shared logic folder is named `core-lib/` rather than the more common `lib/`.
Some starter templates and global `.gitignore` files exclude a top-level `lib/`
directory (treating it as a compiled-output folder), which silently drops it from
Git and causes Vercel builds to fail with "Module not found: Can't resolve
'@/lib/...'" errors. `core-lib/` avoids that collision. If you rename it back,
double-check your `.gitignore` (and any global gitignore on your machine) has no
`lib` entry first, and confirm the folder actually appears in your GitHub repo
before redeploying.

## What's implemented vs. coming soon

The `/tools` directory lists every tool from the original spec. Tools marked
"Coming soon" (e.g. PDF↔Word, Compress/Rotate PDF, Image Cropper, Scientific
Calculator) are intentionally not wired up to fake functionality — see
`lib/tools-registry.ts` to track status and add real implementations later.
Roughly 20 tools are fully working today, all client-side.
