import { useSyncExternalStore } from "react";
import { ALL_LESSONS } from "../components/Sidebar";

const KEY = "ml-progress-v1";

type State = {
  lessons: string[];           // completed lesson paths
  tabs: Record<string, string[]>; // lessonPath -> completed tab ids
};

function load(): State {
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

let state: State = load();
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

export function useProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function isLessonUnlocked(path: string, s: State = state): boolean {
  const idx = ALL_LESSONS.indexOf(path);
  if (idx <= 0) return true;
  return s.lessons.includes(ALL_LESSONS[idx - 1]);
}

export function isTabUnlocked(lessonPath: string, tabIdx: number, tabIds: string[], s: State = state): boolean {
  if (tabIdx === 0) return true;
  const done = s.tabs[lessonPath] || [];
  return done.includes(tabIds[tabIdx - 1]);
}

export function markTabComplete(lessonPath: string, tabId: string) {
  const cur = state.tabs[lessonPath] || [];
  if (cur.includes(tabId)) return;
  state = { ...state, tabs: { ...state.tabs, [lessonPath]: [...cur, tabId] } };
  emit();
}

export function markLessonComplete(lessonPath: string) {
  if (state.lessons.includes(lessonPath)) return;
  state = { ...state, lessons: [...state.lessons, lessonPath] };
  emit();
}

export function resetProgress() {
  state = { lessons: [], tabs: {} };
  emit();
}
