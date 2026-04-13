import { useSyncExternalStore } from "react";

const KEY = "eng-progress-v1";

export type EngState = {
  lessons: string[];                  // completed lesson paths (e.g. "/engineering/cn/level1/what-is-network")
  tabs: Record<string, string[]>;     // lessonPath -> completed tab ids
};

function load(): EngState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { lessons: [], tabs: {} };
    const parsed = JSON.parse(raw);
    return {
      lessons: Array.isArray(parsed.lessons) ? parsed.lessons : [],
      tabs: parsed.tabs && typeof parsed.tabs === "object" ? parsed.tabs : {},
    };
  } catch {
    return { lessons: [], tabs: {} };
  }
}

let state: EngState = load();
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

export function useEngProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Check if a lesson is unlocked based on sequential completion within a flat ordered list */
export function isEngLessonUnlocked(path: string, allLessons: string[], s: EngState = state): boolean {
  const idx = allLessons.indexOf(path);
  if (idx <= 0) return true;
  return s.lessons.includes(allLessons[idx - 1]);
}

export function isEngTabUnlocked(lessonPath: string, tabIdx: number, tabIds: string[], s: EngState = state): boolean {
  if (tabIdx === 0) return true;
  const done = s.tabs[lessonPath] || [];
  return done.includes(tabIds[tabIdx - 1]);
}

export function markEngTabComplete(lessonPath: string, tabId: string) {
  const cur = state.tabs[lessonPath] || [];
  if (cur.includes(tabId)) return;
  state = { ...state, tabs: { ...state.tabs, [lessonPath]: [...cur, tabId] } };
  emit();
}

export function markEngLessonComplete(lessonPath: string) {
  if (state.lessons.includes(lessonPath)) return;
  state = { ...state, lessons: [...state.lessons, lessonPath] };
  emit();
}

export function resetEngProgress() {
  state = { lessons: [], tabs: {} };
  emit();
}
