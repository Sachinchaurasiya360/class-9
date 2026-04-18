"use client";

import { useSyncExternalStore } from "react";
import { EXAM_QUESTIONS, getQuestionById } from "@/data/examBank";

/* --------------------------------------------------------------------------
 * Exam Prep progress - persists attempts, computes accuracy per chapter,
 * and exposes the data needed by the review/weak-area features.
 *
 * Mirrors the progress.ts pattern: single module-level store, subscribe/
 * emit via a listener set, and `useSyncExternalStore` for React hooks.
 * ------------------------------------------------------------------------ */

const KEY = "rpl-exam-progress-v1";

export type AttemptRecord = {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timestamp: number;
};

export type ExamState = {
  attempts: AttemptRecord[];
  chapterStats: Record<string, { attempted: number; correct: number }>;
  bestTestScore: number;
  totalTestsTaken: number;
};

function defaultState(): ExamState {
  return {
    attempts: [],
    chapterStats: {},
    bestTestScore: 0,
    totalTestsTaken: 0,
  };
}

function load(): ExamState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<ExamState>;
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      chapterStats:
        parsed.chapterStats && typeof parsed.chapterStats === "object"
          ? parsed.chapterStats
          : {},
      bestTestScore: typeof parsed.bestTestScore === "number" ? parsed.bestTestScore : 0,
      totalTestsTaken: typeof parsed.totalTestsTaken === "number" ? parsed.totalTestsTaken : 0,
    };
  } catch {
    return defaultState();
  }
}

let state: ExamState = typeof window !== "undefined" ? load() : defaultState();
const listeners = new Set<() => void>();

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return state;
}

export function useExamState(): ExamState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* --------------------------------------------------------------------------
 * Mutations
 * ------------------------------------------------------------------------ */

export function recordAttempt(questionId: string, selectedIndex: number, correct: boolean): void {
  const q = getQuestionById(questionId);
  if (!q) return;

  const attempt: AttemptRecord = {
    questionId,
    selectedIndex,
    correct,
    timestamp: Date.now(),
  };

  const prevStats = state.chapterStats[q.chapter] ?? { attempted: 0, correct: 0 };
  state = {
    ...state,
    attempts: [...state.attempts, attempt],
    chapterStats: {
      ...state.chapterStats,
      [q.chapter]: {
        attempted: prevStats.attempted + 1,
        correct: prevStats.correct + (correct ? 1 : 0),
      },
    },
  };
  emit();
}

export function recordTestResult(score: number, total: number): void {
  if (total <= 0) return;
  const pct = Math.round((score / total) * 100);
  state = {
    ...state,
    bestTestScore: Math.max(state.bestTestScore, pct),
    totalTestsTaken: state.totalTestsTaken + 1,
  };
  emit();
}

export function resetExamProgress(): void {
  state = defaultState();
  emit();
}

/* --------------------------------------------------------------------------
 * Analytics - weak area detection and review queue
 * ------------------------------------------------------------------------ */

/** Returns the N chapters with the lowest accuracy among those actually attempted. */
export function getWeakestChapters(
  topN: number = 3,
): { chapter: string; accuracy: number }[] {
  const rows = Object.entries(state.chapterStats)
    .filter(([, s]) => s.attempted >= 3) // need a few attempts to be meaningful
    .map(([chapter, s]) => ({
      chapter,
      accuracy: s.correct / s.attempted,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
  return rows.slice(0, topN);
}

/**
 * A question is "still in review" until the student has gotten it right TWICE
 * since their last wrong attempt. This prevents a single lucky guess from
 * pulling it out of the review pile.
 */
export function getWrongQuestionIds(): string[] {
  const byQuestion = new Map<string, AttemptRecord[]>();
  for (const a of state.attempts) {
    const arr = byQuestion.get(a.questionId);
    if (arr) arr.push(a);
    else byQuestion.set(a.questionId, [a]);
  }

  const wrong: string[] = [];
  for (const [qid, attempts] of byQuestion) {
    // Walk chronologically. Track a "mistake pending" flag plus consecutive
    // corrects since the last mistake. When we see a mistake the flag is on;
    // only two consecutive corrects clear it.
    let pending = false;
    let correctStreak = 0;
    for (const a of attempts) {
      if (a.correct) {
        if (pending) {
          correctStreak += 1;
          if (correctStreak >= 2) {
            pending = false;
            correctStreak = 0;
          }
        }
      } else {
        pending = true;
        correctStreak = 0;
      }
    }
    if (pending) wrong.push(qid);
  }
  return wrong;
}

/* --------------------------------------------------------------------------
 * Read helpers
 * ------------------------------------------------------------------------ */

export function getChapterAccuracy(slug: string): number {
  const s = state.chapterStats[slug];
  if (!s || s.attempted === 0) return 0;
  return s.correct / s.attempted;
}

export function getOverallStats(): {
  totalAttempted: number;
  totalCorrect: number;
  accuracy: number;
} {
  let att = 0;
  let cor = 0;
  for (const s of Object.values(state.chapterStats)) {
    att += s.attempted;
    cor += s.correct;
  }
  return { totalAttempted: att, totalCorrect: cor, accuracy: att === 0 ? 0 : cor / att };
}

/** Pure read of state without subscribing - useful in callbacks. */
export function getExamState(): ExamState {
  return state;
}

/** Count of questions in the review pile - handy for hub badge. */
export function getReviewCount(): number {
  return getWrongQuestionIds().length;
}

/** Total number of questions in the bank - for display. */
export function getBankSize(): number {
  return EXAM_QUESTIONS.length;
}
