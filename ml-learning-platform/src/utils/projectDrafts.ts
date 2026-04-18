"use client";

import { useSyncExternalStore } from "react";
import { awardProjectComplete } from "./gamification";

/* --------------------------------------------------------------------------
 * Project draft store - mirrors src/utils/progress.ts pattern
 * (useSyncExternalStore + localStorage). Persists every section edit so the
 * student can close the tab and resume any time.
 * ------------------------------------------------------------------------ */

const KEY = "rpl-project-drafts-v1";

export type ProjectDraft = {
  slug: string;
  sections: Record<string, string>;
  completed: boolean;
  lastUpdated: number;
};

type State = {
  drafts: Record<string, ProjectDraft>;
};

function emptyDraft(slug: string): ProjectDraft {
  return { slug, sections: {}, completed: false, lastUpdated: 0 };
}

function load(): State {
  if (typeof window === "undefined") return { drafts: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { drafts: {} };
    const parsed = JSON.parse(raw);
    const drafts: Record<string, ProjectDraft> = {};
    if (parsed && typeof parsed === "object" && parsed.drafts && typeof parsed.drafts === "object") {
      for (const [slug, d] of Object.entries(parsed.drafts as Record<string, unknown>)) {
        if (!d || typeof d !== "object") continue;
        const draft = d as Partial<ProjectDraft>;
        drafts[slug] = {
          slug,
          sections:
            draft.sections && typeof draft.sections === "object"
              ? (draft.sections as Record<string, string>)
              : {},
          completed: !!draft.completed,
          lastUpdated: typeof draft.lastUpdated === "number" ? draft.lastUpdated : 0,
        };
      }
    }
    return { drafts };
  } catch {
    return { drafts: {} };
  }
}

let state: State = typeof window !== "undefined" ? load() : { drafts: {} };
const listeners = new Set<() => void>();

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode errors */
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

/* --------------------------------------------------------------------------
 * Public hooks
 * ------------------------------------------------------------------------ */

export function useAllProjectDrafts(): Record<string, ProjectDraft> {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return s.drafts;
}

export function useProjectDraft(slug: string): ProjectDraft {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return s.drafts[slug] ?? emptyDraft(slug);
}

/* --------------------------------------------------------------------------
 * Mutations
 * ------------------------------------------------------------------------ */

export function updateDraftSection(slug: string, sectionId: string, content: string): void {
  const existing = state.drafts[slug] ?? emptyDraft(slug);
  // Short-circuit if nothing changed to avoid re-render storms while typing.
  if (existing.sections[sectionId] === content) return;
  const nextDraft: ProjectDraft = {
    ...existing,
    sections: { ...existing.sections, [sectionId]: content },
    lastUpdated: Date.now(),
  };
  state = { ...state, drafts: { ...state.drafts, [slug]: nextDraft } };
  emit();
}

export function markProjectComplete(slug: string): void {
  const existing = state.drafts[slug] ?? emptyDraft(slug);
  if (existing.completed) return;
  const nextDraft: ProjectDraft = {
    ...existing,
    completed: true,
    lastUpdated: Date.now(),
  };
  state = { ...state, drafts: { ...state.drafts, [slug]: nextDraft } };
  emit();
  // Award XP/coins/badge progress after persisting completion so the
  // gamification toast fires once per project.
  awardProjectComplete(slug);
}

export function resetDraft(slug: string): void {
  if (!state.drafts[slug]) return;
  const nextDrafts = { ...state.drafts };
  delete nextDrafts[slug];
  state = { ...state, drafts: nextDrafts };
  emit();
}

export function getProjectDraft(slug: string): ProjectDraft | null {
  return state.drafts[slug] ?? null;
}
