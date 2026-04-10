# CLAUDE.md — ML Learning Platform

## Project Summary

Interactive ML education platform for beginners (class 9 level). 9 levels, 36 lessons covering basics to CNNs and live camera AI. Built with Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.9 (strict mode)
- **Styling:** Tailwind CSS v4 with custom `@theme` tokens
- **Icons:** lucide-react
- **State:** localStorage + `useSyncExternalStore` (no external state library)
- **Camera AI:** MediaPipe Vision (loaded from CDN at runtime)

## Commands

```bash
npm run dev      # Dev server (localhost:3000)
npm run build    # Type-check + production build
npm run start    # Serve built output
npm run lint     # ESLint via next lint
```

## Architecture Rules

- **All components are client components** (`"use client"`). No SSR data fetching.
- **Route group `(lessons)`** wraps all lesson and review routes with the sidebar layout.
- **Landing page** (`src/app/page.tsx`) renders outside the `(lessons)` group — no sidebar.
- **Lesson page files** are thin wrappers that import from `src/lessons/`.
- **Path alias:** `@/` maps to `src/`.

## File Conventions

- `src/app/` — Next.js routing only (layouts + thin page wrappers)
- `src/components/` — Shared reusable components
- `src/views/` — Full-page view components (LandingPage, ReviewPage)
- `src/lessons/level{N}/` — Lesson activity components grouped by level
- `src/utils/` — Pure utility modules (progress, reviewDeck, sounds, mediapipe)
- `src/hooks/` — Custom React hooks
- `src/data/` — Static data (lesson extras: predictions + flashcards)

## Key Components

| Component | Purpose |
|---|---|
| `Sidebar` | Navigation with level accordion, lesson links, lock indicators, review badge |
| `LessonShell` | Lesson wrapper: tabs, quiz, prediction gate, prev/next nav |
| `QuizCard` | MCQ quiz with scoring and sound effects |
| `PredictionGate` | Pre-assessment gate (MCQ/numeric/text) |
| `SVGGrid` | Reusable coordinate grid for interactive visualizations |

## State & Persistence

| Key | Purpose |
|---|---|
| `ml-progress-v1` | Completed lessons & tabs (unlock system) |
| `ml-leitner` | Spaced-repetition card states (Leitner boxes) |
| `ml-predictions` | Student prediction responses |

## Styling Conventions

- Use `.btn-sketchy` / `.btn-sketchy-outline` for buttons
- Use `.card-sketchy` for card containers
- Use `.font-hand` for handwriting font
- Use `.marker-highlight-yellow` / `-coral` / `-mint` for text highlights
- Theme colors accessed via CSS variables: `var(--accent-coral)`, `var(--accent-mint)`, etc.
- Tailwind theme tokens: `text-foreground`, `bg-background`, `text-muted-foreground`, etc.

## Adding a New Lesson

1. Create activity component in `src/lessons/level{N}/` with `"use client"` directive
2. Use `LessonShell` as the wrapper — pass tabs, quiz questions, optional story
3. Create route: `src/app/(lessons)/level{N}/{slug}/page.tsx` importing the component
4. Add lesson to `LEVELS` array in `src/components/Sidebar.tsx`
5. Add breadcrumb entry in `src/app/(lessons)/layout.tsx`
6. Add prediction + flashcards in `src/data/lessonExtras.ts`

## Gotchas

- `usePathname()` from `next/navigation` can return `null` — always handle with `?? ""`
- MediaPipe models load from Google CDN at runtime — not bundled
- Audio context requires user gesture to resume (browsers block autoplay)
- Lesson unlock is sequential — completing lesson N unlocks N+1
- Tab unlock is sequential within a lesson — complete tab N to unlock tab N+1
