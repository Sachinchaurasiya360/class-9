import { useEffect, useState } from "react";

export interface ReviewCardDef {
  id: string;
  lessonPath: string;
  question: string;
  answer: string;
}

interface CardState {
  id: string;
  lessonPath: string;
  question: string;
  answer: string;
  box: number; // 1..5
  due: number; // ms timestamp
}

const STORAGE_KEY = "ml-leitner";
const EVENT = "ml-leitner-change";

// Leitner intervals in ms
const INTERVALS = [
  10 * 60 * 1000,        // box 1: 10 min
  24 * 60 * 60 * 1000,   // box 2: 1 day
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  14 * 24 * 60 * 60 * 1000,
];

function load(): Record<string, CardState> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function save(state: Record<string, CardState>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT));
}

export function registerCards(cards: ReviewCardDef[]) {
  if (!cards.length) return;
  const state = load();
  let changed = false;
  for (const c of cards) {
    if (!state[c.id]) {
      state[c.id] = {
        id: c.id,
        lessonPath: c.lessonPath,
        question: c.question,
        answer: c.answer,
        box: 1,
        due: Date.now(),
      };
      changed = true;
    }
  }
  if (changed) save(state);
}

export function getDueCards(): CardState[] {
  const now = Date.now();
  return Object.values(load())
    .filter((c) => c.due <= now)
    .sort((a, b) => a.due - b.due);
}

export function gradeCard(id: string, correct: boolean) {
  const state = load();
  const c = state[id];
  if (!c) return;
  if (correct) {
    c.box = Math.min(5, c.box + 1);
  } else {
    c.box = 1;
  }
  c.due = Date.now() + INTERVALS[c.box - 1];
  save(state);
}

export function useDueCount(): number {
  const [count, setCount] = useState(() => getDueCards().length);
  useEffect(() => {
    const update = () => setCount(getDueCards().length);
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    const interval = setInterval(update, 60 * 1000);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
      clearInterval(interval);
    };
  }, []);
  return count;
}

export function useDueCards(): CardState[] {
  const [cards, setCards] = useState(() => getDueCards());
  useEffect(() => {
    const update = () => setCards(getDueCards());
    window.addEventListener(EVENT, update);
    return () => window.removeEventListener(EVENT, update);
  }, []);
  return cards;
}

export function getAllCards(): CardState[] {
  return Object.values(load());
}
