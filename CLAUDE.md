@AGENTS.md

# Disney Trivia Trainer

Local-first flashcard trainer for Disney trivia. No backend, no auth, no paid APIs.

## Stack

- Next.js 16 (App Router, Turbopack, TypeScript strict)
- React 19
- Tailwind CSS v4
- Vitest + Testing Library for unit tests
- PWA via manifest + service worker (no library)

## Commands

- `npm run dev` — Next.js dev server (turbopack)
- `npm run build` — production build
- `npm test` — run Vitest suite once
- `npm run test:watch` — watch mode
- `npm run seed` — regenerate `src/data/packs/*.json` (manual + opentdb)

## Data flow

- Question packs: committed JSON in `src/data/packs/*.json`, registered in `src/data/packs/index.ts`.
- Player progress: localStorage only (`dt:*` keys). Per-player accuracy + miss-queue derived from append-only attempts log.
- No API routes. Everything runs client-side after initial render.

## Conventions

- Pure logic in `src/lib/*` (no DOM, no React) is unit-tested first.
- Components in `src/components/*`. Pages in `src/app/*`.
- Tailwind tokens defined in `src/app/globals.css`. No hardcoded hex.
- Mobile-first. Layouts must work at 375px.
- `params` in dynamic pages is a `Promise` — always `await` it.
- Client-only pages add `'use client'`. Server components are default.
