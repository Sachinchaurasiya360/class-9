# Repo Map — ML Learning Platform

## Overview

Interactive ML education platform built with **Next.js 15** (App Router), **React 19**, **TypeScript**, and **Tailwind CSS v4**. Covers 9 levels / 36 lessons from "What is a machine?" through CNNs and live camera AI. Fully client-side — no backend; state persisted in localStorage.

## Directory Structure

```
ml-learning-platform/
├── public/                         # Static assets served at /
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (html/body, metadata, global CSS)
│   │   ├── page.tsx                # Landing page route (/)
│   │   ├── globals.css             # Tailwind v4 + custom sketchy theme + animations
│   │   └── (lessons)/              # Route group — sidebar + navbar layout
│   │       ├── layout.tsx          # Sidebar, navbar, breadcrumbs (client component)
│   │       ├── review/page.tsx     # /review — spaced-repetition deck
│   │       ├── level1/             # 5 lesson routes
│   │       │   ├── machines/page.tsx
│   │       │   ├── computers/page.tsx
│   │       │   ├── data/page.tsx
│   │       │   ├── senses/page.tsx
│   │       │   └── bits/page.tsx
│   │       ├── level2/             # 5 lesson routes
│   │       ├── level3/             # 6 lesson routes
│   │       ├── level4/             # 6 lesson routes
│   │       ├── level5/             # 5 lesson routes
│   │       ├── level6/             # 6 lesson routes
│   │       ├── level7/             # 4 lesson routes
│   │       ├── level8/             # 5 lesson routes
│   │       └── level9/             # 3 lesson routes (live camera)
│   │
│   ├── components/                 # Shared UI components
│   │   ├── Sidebar.tsx             # Nav sidebar (levels, lessons, lock system, review link)
│   │   ├── LessonShell.tsx         # Lesson wrapper (tabs, quiz, prev/next, prediction gate)
│   │   ├── QuizCard.tsx            # Multiple-choice quiz with scoring
│   │   ├── PredictionGate.tsx      # "Predict first" pre-assessment (MCQ/numeric/text)
│   │   ├── InfoBox.tsx             # Styled callout boxes (blue/amber/green/indigo)
│   │   ├── SVGGrid.tsx             # Reusable SVG coordinate grid for visualizations
│   │   └── StorySection.tsx        # Collapsible story/narrative section (Aru & Byte)
│   │
│   ├── views/                      # Full-page view components
│   │   ├── LandingPage.tsx         # Marketing homepage with level cards & hero
│   │   └── ReviewPage.tsx          # Leitner spaced-repetition card review
│   │
│   ├── lessons/                    # 45 lesson activity components (one per tab set)
│   │   ├── level1/                 # L1_MachinesActivity, L2_ComputersActivity, ...
│   │   ├── level2/                 # L4_CoordinatesActivity, L5_PatternsActivity, ...
│   │   ├── level3/                 # L7_PredictionsActivity, L8_BestLineActivity, ...
│   │   ├── level4/                 # L11_SupervisedLearningActivity, L12_KNNActivity, ...
│   │   ├── level5/                 # L15_UnsupervisedLearningActivity, L16_KMeansActivity, ...
│   │   ├── level6/                 # L18_PerceptronActivity, L19_ActivationFunctionsActivity, ...
│   │   ├── level7/                 # L22_GradientDescentActivity, L23_LearningRateActivity, ...
│   │   ├── level8/                 # L26_ImagesAsDataActivity, L27_FiltersActivity, ...
│   │   └── level9/                 # HandTrackingActivity, GestureRecognitionActivity, ObjectDetectionActivity
│   │
│   ├── hooks/
│   │   └── useWebcam.ts            # getUserMedia hook (start/stop/status/error)
│   │
│   ├── utils/
│   │   ├── progress.ts             # Lesson & tab unlock system (localStorage, useSyncExternalStore)
│   │   ├── reviewDeck.ts           # Leitner spaced-repetition engine (5-box, localStorage)
│   │   ├── sounds.ts               # Web Audio API sound effects (click, pop, success, error, whoosh, complete)
│   │   └── mediapipe.ts            # Lazy CDN loader for MediaPipe Vision (hand/gesture/object models)
│   │
│   └── data/
│       └── lessonExtras.ts         # Per-lesson predict prompts + flashcard definitions
│
├── next.config.ts                  # Next.js config
├── postcss.config.mjs              # PostCSS config (Tailwind v4)
├── tsconfig.json                   # TypeScript config (path alias @/ -> src/)
├── package.json                    # Dependencies & scripts
└── .gitignore
```

## Key Architectural Patterns

### Routing
- **App Router** with route group `(lessons)` — provides sidebar/navbar layout for all lesson & review pages
- Landing page (`/`) uses the root layout directly (no sidebar)
- Each lesson route is a thin `page.tsx` that imports the corresponding activity component

### Client vs Server
- All interactive components marked `"use client"` — the entire app is client-rendered
- No server components, API routes, or server-side data fetching
- State persistence: `localStorage` (progress, predictions, review cards)

### Lesson Structure
Every lesson uses `LessonShell` which provides:
1. Header with level/lesson number
2. Optional story section (`StorySection`)
3. Prediction gate (`PredictionGate`) — pre-assessment before content
4. Tabbed activity content (1-3 tabs + "Challenge" quiz tab)
5. Tab unlock system (complete previous tab to unlock next)
6. Previous/Next lesson navigation with lock states

### Progress System
- `progress.ts` — tracks completed lessons & tabs via `useSyncExternalStore`
- Sequential unlock: complete lesson N to unlock lesson N+1
- localStorage key: `ml-progress-v1`

### Review System
- `reviewDeck.ts` — Leitner spaced-repetition with 5 boxes (10min → 14 days)
- Cards auto-registered when visiting a lesson
- localStorage key: `ml-leitner`
- Cross-tab sync via `CustomEvent` + `storage` event

### Styling
- Tailwind CSS v4 with `@theme` tokens for the sketchy notebook aesthetic
- Custom CSS classes: `.btn-sketchy`, `.card-sketchy`, `.notebook-grid`, `.marker-highlight-*`
- Fonts: Kalam (handwriting), Nunito (body), Patrick Hand (fallback)
- Custom keyframe animations for neural network visualizations

## Scripts

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Next.js lint
```
