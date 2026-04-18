"use client";

import { useSyncExternalStore } from "react";

/* --------------------------------------------------------------------------
 * Gamification engine - XP, coins, streaks, badges, daily missions, levels.
 *
 * Frontend-only. Persists to localStorage via a single key so a future backend
 * sync hook (`ml-gamification-v1`) can be swapped in without touching call
 * sites. Mirrors the progress.ts pattern (useSyncExternalStore + subscribe).
 * ------------------------------------------------------------------------ */

const KEY = "ml-gamification-v1";

export type MissionDef = {
  id: string;
  label: string;
  target: number;
  statKey: StatKey;
  xp: number;
  coins: number;
};

export type StatKey =
  | "lessonsCompletedToday"
  | "tabsCompletedToday"
  | "quizPerfectToday"
  | "reviewsCorrectToday"
  | "predictionsMadeToday"
  | "xpEarnedToday"
  | "minutesSpentToday"
  | "projectsCompletedToday";

export type Mission = MissionDef & {
  progress: number;
  claimed: boolean;
};

export type RewardEvent = {
  id: string;
  kind: "xp" | "coins" | "badge" | "level" | "streak";
  label: string;
  detail?: string;
  amount?: number;
  timestamp: number;
};

export type GamificationState = {
  xp: number;
  coins: number;
  streak: {
    current: number;
    longest: number;
    lastDate: string | null; // YYYY-MM-DD
    freezesAvailable: number;
    milestonesHit: number[]; // days reached
  };
  badges: string[]; // badge IDs earned
  missions: {
    date: string; // YYYY-MM-DD
    list: Mission[];
  };
  stats: {
    totalLessons: number;
    totalTabs: number;
    totalPerfectQuizzes: number;
    totalProjects: number;
    totalPredictions: number;
    totalReviewsCorrect: number;
    /** Rolling per-day counters; reset when date rolls over. */
    today: Partial<Record<StatKey, number>> & { date: string };
  };
  rewards: RewardEvent[]; // capped to last 20 for a celebration feed
};

/* --------------------------------------------------------------------------
 * Level system (PRD §23)
 * ------------------------------------------------------------------------ */

export const LEVEL_THRESHOLDS: { level: number; xp: number; title: string }[] = [
  { level: 1, xp: 0, title: "AI Newbie" },
  { level: 2, xp: 100, title: "Data Explorer" },
  { level: 3, xp: 300, title: "Pattern Spotter" },
  { level: 4, xp: 600, title: "Algorithm Apprentice" },
  { level: 5, xp: 1000, title: "ML Learner" },
  { level: 6, xp: 1500, title: "Neural Navigator" },
  { level: 7, xp: 2500, title: "Data Scientist Jr." },
  { level: 8, xp: 4000, title: "AI Builder" },
  { level: 9, xp: 6000, title: "AI Expert" },
  { level: 10, xp: 10000, title: "Red Panda Master" },
];

export function levelFromXp(xp: number): {
  level: number;
  title: string;
  xpInLevel: number;
  xpToNext: number;
  progressPct: number;
} {
  let i = 0;
  for (let k = 0; k < LEVEL_THRESHOLDS.length; k++) {
    if (xp >= LEVEL_THRESHOLDS[k].xp) i = k;
    else break;
  }
  const cur = LEVEL_THRESHOLDS[i];
  const next = LEVEL_THRESHOLDS[i + 1];
  if (!next) {
    return { level: cur.level, title: cur.title, xpInLevel: xp - cur.xp, xpToNext: 0, progressPct: 100 };
  }
  const span = next.xp - cur.xp;
  const progress = xp - cur.xp;
  return {
    level: cur.level,
    title: cur.title,
    xpInLevel: progress,
    xpToNext: next.xp - xp,
    progressPct: Math.min(100, Math.round((progress / span) * 100)),
  };
}

/* --------------------------------------------------------------------------
 * Badge catalog
 * ------------------------------------------------------------------------ */

export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type BadgeDef = {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  icon: string; // emoji fallback
  criteria: (state: GamificationState) => boolean;
  category: "learning" | "streak" | "project" | "special";
};

export const BADGES: BadgeDef[] = [
  // Learning
  { id: "first_steps", name: "First Steps", description: "Complete your first lesson", rarity: "common", icon: "👣", category: "learning", criteria: (s) => s.stats.totalLessons >= 1 },
  { id: "quick_learner", name: "Quick Learner", description: "Complete 10 lessons", rarity: "common", icon: "🏃", category: "learning", criteria: (s) => s.stats.totalLessons >= 10 },
  { id: "knowledge_seeker", name: "Knowledge Seeker", description: "Complete 25 lessons", rarity: "uncommon", icon: "🔍", category: "learning", criteria: (s) => s.stats.totalLessons >= 25 },
  { id: "ai_scholar", name: "AI Scholar", description: "Complete 45 lessons", rarity: "rare", icon: "🎓", category: "learning", criteria: (s) => s.stats.totalLessons >= 45 },
  { id: "perfect_score", name: "Perfect Score", description: "Get 100% on any quiz", rarity: "uncommon", icon: "💯", category: "learning", criteria: (s) => s.stats.totalPerfectQuizzes >= 1 },
  { id: "flawless", name: "Flawless", description: "Get 100% on 10 quizzes", rarity: "rare", icon: "✨", category: "learning", criteria: (s) => s.stats.totalPerfectQuizzes >= 10 },

  // Streak
  { id: "consistent", name: "Consistent", description: "7-day learning streak", rarity: "common", icon: "🔥", category: "streak", criteria: (s) => s.streak.longest >= 7 },
  { id: "dedicated", name: "Dedicated", description: "30-day learning streak", rarity: "uncommon", icon: "⚡", category: "streak", criteria: (s) => s.streak.longest >= 30 },
  { id: "committed", name: "Committed", description: "100-day learning streak", rarity: "rare", icon: "💪", category: "streak", criteria: (s) => s.streak.longest >= 100 },
  { id: "legendary", name: "Legendary", description: "365-day learning streak", rarity: "legendary", icon: "👑", category: "streak", criteria: (s) => s.streak.longest >= 365 },

  // Project
  { id: "builder", name: "Builder", description: "Complete your first project", rarity: "common", icon: "🔨", category: "project", criteria: (s) => s.stats.totalProjects >= 1 },
  { id: "creator", name: "Creator", description: "Complete 5 projects", rarity: "uncommon", icon: "🎨", category: "project", criteria: (s) => s.stats.totalProjects >= 5 },

  // Special
  { id: "neural_architect", name: "Neural Architect", description: "Complete all Level 6 neural network lessons", rarity: "epic", icon: "🧠", category: "special", criteria: () => false /* checked via progress */ },
  { id: "data_detective", name: "Data Detective", description: "Complete all Level 2 data lessons", rarity: "rare", icon: "🕵️", category: "special", criteria: () => false },
  { id: "vision_master", name: "Vision Master", description: "Complete all Level 8 CNN lessons", rarity: "epic", icon: "👁️", category: "special", criteria: () => false },
  { id: "red_panda_elite", name: "Red Panda Elite", description: "Earn 10,000 XP", rarity: "epic", icon: "🐼", category: "special", criteria: (s) => s.xp >= 10000 },
  { id: "founding_member", name: "Founding Member", description: "Joined during beta", rarity: "legendary", icon: "⭐", category: "special", criteria: () => true /* auto-awarded on first init */ },
];

/* --------------------------------------------------------------------------
 * Daily missions pool (3 rotated per day, deterministic by date string)
 * ------------------------------------------------------------------------ */

const MISSION_POOL: MissionDef[] = [
  { id: "lesson_1", label: "Complete 1 lesson today", target: 1, statKey: "lessonsCompletedToday", xp: 30, coins: 10 },
  { id: "tabs_3", label: "Complete 3 activity tabs", target: 3, statKey: "tabsCompletedToday", xp: 30, coins: 10 },
  { id: "perfect_quiz", label: "Get a perfect quiz score", target: 1, statKey: "quizPerfectToday", xp: 40, coins: 15 },
  { id: "review_5", label: "Review 5 spaced-rep cards correctly", target: 5, statKey: "reviewsCorrectToday", xp: 25, coins: 8 },
  { id: "predict_2", label: "Make 2 predictions", target: 2, statKey: "predictionsMadeToday", xp: 20, coins: 5 },
  { id: "xp_100", label: "Earn 100 XP today", target: 100, statKey: "xpEarnedToday", xp: 50, coins: 20 },
  { id: "tabs_5", label: "Complete 5 activity tabs", target: 5, statKey: "tabsCompletedToday", xp: 50, coins: 20 },
  { id: "lesson_2", label: "Complete 2 lessons today", target: 2, statKey: "lessonsCompletedToday", xp: 60, coins: 25 },
];

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / (24 * 60 * 60 * 1000));
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

function pickDailyMissions(date: string): Mission[] {
  const seed = hashString(date);
  const pool = [...MISSION_POOL];
  const picks: MissionDef[] = [];
  let s = seed;
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const idx = s % pool.length;
    picks.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picks.map((m) => ({ ...m, progress: 0, claimed: false }));
}

function defaultState(): GamificationState {
  const d = today();
  return {
    xp: 0,
    coins: 0,
    streak: { current: 0, longest: 0, lastDate: null, freezesAvailable: 2, milestonesHit: [] },
    badges: [],
    missions: { date: d, list: pickDailyMissions(d) },
    stats: {
      totalLessons: 0,
      totalTabs: 0,
      totalPerfectQuizzes: 0,
      totalProjects: 0,
      totalPredictions: 0,
      totalReviewsCorrect: 0,
      today: { date: d },
    },
    rewards: [],
  };
}

function load(): GamificationState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as GamificationState;
    return rollOverDate(parsed);
  } catch {
    return defaultState();
  }
}

/** If the calendar day has changed since last save, reset today-counters and generate new missions. */
function rollOverDate(s: GamificationState): GamificationState {
  const d = today();
  let next = s;
  if (next.stats.today.date !== d) {
    next = { ...next, stats: { ...next.stats, today: { date: d } } };
  }
  if (next.missions.date !== d) {
    next = { ...next, missions: { date: d, list: pickDailyMissions(d) } };
  }
  return next;
}

let state: GamificationState = typeof window !== "undefined" ? load() : defaultState();
const listeners = new Set<() => void>();

function emit() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return state;
}

export function useGamification(): GamificationState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* --------------------------------------------------------------------------
 * Mutations - all state updates funnel through these so rewards and badges
 * stay in sync. Every public call rolls the date first so counters reset
 * automatically at midnight without a background timer.
 * ------------------------------------------------------------------------ */

let rewardIdCounter = 0;
function nextRewardId(): string {
  rewardIdCounter += 1;
  return `r_${Date.now()}_${rewardIdCounter}`;
}

function pushReward(r: Omit<RewardEvent, "id" | "timestamp">) {
  const event: RewardEvent = { ...r, id: nextRewardId(), timestamp: Date.now() };
  state = { ...state, rewards: [event, ...state.rewards].slice(0, 20) };
}

function addXp(amount: number, label: string) {
  if (amount <= 0) return;
  const beforeLevel = levelFromXp(state.xp).level;
  state = { ...state, xp: state.xp + amount };
  bumpToday("xpEarnedToday", amount);
  pushReward({ kind: "xp", label, amount });
  const afterLevel = levelFromXp(state.xp).level;
  if (afterLevel > beforeLevel) {
    pushReward({ kind: "level", label: `Level ${afterLevel}: ${LEVEL_THRESHOLDS[afterLevel - 1]?.title ?? ""}` });
  }
}

function addCoins(amount: number, label: string) {
  if (amount <= 0) return;
  state = { ...state, coins: state.coins + amount };
  pushReward({ kind: "coins", label, amount });
}

function bumpToday(key: StatKey, by = 1) {
  const d = today();
  const prev = state.stats.today[key] ?? 0;
  state = {
    ...state,
    stats: {
      ...state.stats,
      today: { ...state.stats.today, date: d, [key]: prev + by },
    },
  };
  advanceMissions();
}

function advanceMissions() {
  const updated = state.missions.list.map((m) => {
    const cur = state.stats.today[m.statKey] ?? 0;
    const progress = Math.min(cur, m.target);
    const justClaimed = !m.claimed && progress >= m.target;
    if (justClaimed) {
      // award inline - we're inside the setter so don't recurse
      state = { ...state, xp: state.xp + m.xp, coins: state.coins + m.coins };
      pushReward({ kind: "xp", label: `Mission: ${m.label}`, amount: m.xp });
    }
    return { ...m, progress, claimed: m.claimed || justClaimed };
  });
  state = { ...state, missions: { ...state.missions, list: updated } };
}

function checkBadges() {
  const earned = new Set(state.badges);
  for (const b of BADGES) {
    if (earned.has(b.id)) continue;
    if (b.criteria(state)) {
      earned.add(b.id);
      pushReward({ kind: "badge", label: b.name, detail: b.description });
    }
  }
  if (earned.size !== state.badges.length) {
    state = { ...state, badges: Array.from(earned) };
  }
}

function touchStreak() {
  const d = today();
  const last = state.streak.lastDate;
  let current = state.streak.current;
  if (!last) {
    current = 1;
  } else if (last === d) {
    // already counted today
    return;
  } else {
    const gap = daysBetween(last, d);
    if (gap === 1) current += 1;
    else if (gap <= 0) { /* skew - ignore */ }
    else current = 1;
  }
  const longest = Math.max(state.streak.longest, current);
  const milestones = [3, 7, 14, 30, 50, 100, 365];
  const hit = [...state.streak.milestonesHit];
  let bonusCoins = 0;
  for (const m of milestones) {
    if (current >= m && !hit.includes(m)) {
      hit.push(m);
      bonusCoins += m >= 100 ? 200 : m >= 30 ? 100 : 50;
      pushReward({ kind: "streak", label: `${m}-day streak!`, detail: `+${m >= 100 ? 200 : m >= 30 ? 100 : 50} coins` });
    }
  }
  state = {
    ...state,
    streak: {
      ...state.streak,
      current,
      longest,
      lastDate: d,
      milestonesHit: hit,
    },
    coins: state.coins + bonusCoins,
  };
}

/* --------------------------------------------------------------------------
 * Public API
 * ------------------------------------------------------------------------ */

export function initGamification() {
  state = rollOverDate(state);
  // Auto-award founding member on first ever load
  if (!state.badges.includes("founding_member")) {
    state = { ...state, badges: [...state.badges, "founding_member"] };
    pushReward({ kind: "badge", label: "Founding Member", detail: "Joined during beta" });
  }
  emit();
}

export function awardTabComplete() {
  state = rollOverDate(state);
  state = { ...state, stats: { ...state.stats, totalTabs: state.stats.totalTabs + 1 } };
  bumpToday("tabsCompletedToday");
  addXp(10, "Tab completed");
  touchStreak();
  checkBadges();
  emit();
}

export function awardLessonComplete(lessonPath: string) {
  state = rollOverDate(state);
  state = { ...state, stats: { ...state.stats, totalLessons: state.stats.totalLessons + 1 } };
  bumpToday("lessonsCompletedToday");
  addXp(50, `Lesson completed`);
  addCoins(10, `Lesson completed`);
  touchStreak();
  // Special badges - checked against lesson path patterns
  checkSpecialLessonBadges(lessonPath);
  checkBadges();
  emit();
}

function checkSpecialLessonBadges(_lessonPath: string) {
  // Level-completion badges (data_detective / neural_architect / vision_master)
  // are awarded from the dashboard where full progress state is available.
  // Keeping a hook here so future per-lesson triggers stay local.
  void _lessonPath;
}

export function awardQuizResult(score: number, total: number) {
  state = rollOverDate(state);
  if (score === total) {
    state = { ...state, stats: { ...state.stats, totalPerfectQuizzes: state.stats.totalPerfectQuizzes + 1 } };
    bumpToday("quizPerfectToday");
    addXp(100, "Perfect quiz!");
    addCoins(20, "Perfect quiz!");
  } else {
    const partial = Math.round((score / total) * 40);
    if (partial > 0) addXp(partial, "Quiz completed");
  }
  checkBadges();
  emit();
}

export function awardPrediction() {
  state = rollOverDate(state);
  state = { ...state, stats: { ...state.stats, totalPredictions: state.stats.totalPredictions + 1 } };
  bumpToday("predictionsMadeToday");
  addXp(5, "Prediction made");
  checkBadges();
  emit();
}

export function awardReviewCorrect() {
  state = rollOverDate(state);
  state = { ...state, stats: { ...state.stats, totalReviewsCorrect: state.stats.totalReviewsCorrect + 1 } };
  bumpToday("reviewsCorrectToday");
  addXp(3, "Review card correct");
  touchStreak();
  checkBadges();
  emit();
}

export function awardProjectComplete(projectId: string) {
  state = rollOverDate(state);
  state = { ...state, stats: { ...state.stats, totalProjects: state.stats.totalProjects + 1 } };
  bumpToday("projectsCompletedToday");
  addXp(300, `Project: ${projectId}`);
  addCoins(50, `Project: ${projectId}`);
  touchStreak();
  checkBadges();
  emit();
}

export function awardExamQuestion(correct: boolean) {
  state = rollOverDate(state);
  if (correct) addXp(5, "Exam question correct");
  emit();
}

export function awardCareerQuizComplete() {
  state = rollOverDate(state);
  const earned = new Set(state.badges);
  if (!earned.has("career_ready")) {
    state = { ...state, badges: [...state.badges, "career_ready"] };
    pushReward({ kind: "badge", label: "Career Ready", detail: "Completed the career quiz" });
  }
  addXp(40, "Career quiz");
  emit();
}

/** Spend coins on a shop item; returns true on success. */
export function spendCoins(amount: number, label: string): boolean {
  if (state.coins < amount) return false;
  state = { ...state, coins: state.coins - amount };
  pushReward({ kind: "coins", label: `Spent: ${label}`, amount: -amount });
  emit();
  return true;
}

/** Manually award a badge (e.g., when the dashboard computes "all Level 6 done"). */
export function grantBadge(id: string) {
  if (state.badges.includes(id)) return;
  const def = BADGES.find((b) => b.id === id);
  if (!def) return;
  state = { ...state, badges: [...state.badges, id] };
  pushReward({ kind: "badge", label: def.name, detail: def.description });
  emit();
}

/** Hard reset - used by the dashboard settings panel. */
export function resetGamification() {
  state = defaultState();
  emit();
}

/** Dismiss the most recent reward toast. */
export function dismissReward(id: string) {
  state = { ...state, rewards: state.rewards.filter((r) => r.id !== id) };
  emit();
}

/** Peek - pure read without subscription. */
export function getGamificationState(): GamificationState {
  return state;
}
