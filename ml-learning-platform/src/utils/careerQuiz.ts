/* --------------------------------------------------------------------------
 * Career Quiz engine - 15 fun questions that award tag points.
 *
 * Pure TypeScript, deterministic scoring. No React or DOM imports.
 * Each answer adds +2 points to every tag listed on the selected option.
 * A career's score is the percentage of its possible max tag points.
 * ------------------------------------------------------------------------ */

import type { Career, CareerTag } from "@/data/careers";
import { CAREERS } from "@/data/careers";

export type QuizQuestion = {
  id: string;
  question: string;
  options: { text: string; tags: CareerTag[] }[];
};

export type QuizAnswer = {
  questionId: string;
  selectedIndex: number;
};

export type CareerMatch = {
  career: Career;
  score: number; // 0-100
  matchedTags: CareerTag[];
};

const POINTS_PER_TAG = 2;

export const CAREER_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    question: "You get handed a brand new puzzle. First thing you do?",
    options: [
      { text: "Think it through step by step, no shortcuts", tags: ["research", "tech"] },
      { text: "Call two friends and brainstorm together", tags: ["communicate", "business"] },
      { text: "Tear it apart and rebuild the whole thing", tags: ["build", "tech"] },
      { text: "Try to invent a better, more fun version", tags: ["creative", "build"] },
    ],
  },
  {
    id: "q2",
    question: "Your dream Saturday involves...",
    options: [
      { text: "Coding a side project in your pyjamas", tags: ["tech", "build"] },
      { text: "Analyzing IPL stats to predict tonight's winner", tags: ["data", "research"] },
      { text: "Designing a mobile app mockup in Figma", tags: ["creative", "build"] },
      { text: "Debating AI ethics on Twitter/X", tags: ["policy", "communicate"] },
    ],
  },
  {
    id: "q3",
    question: "In school group projects, you're usually...",
    options: [
      { text: "The one who codes everything so nothing breaks", tags: ["tech", "build"] },
      { text: "The organiser and presenter - keeping everyone on track", tags: ["business", "communicate"] },
      { text: "The one constantly asking 'but why does it work?'", tags: ["research", "policy"] },
      { text: "The one making the slides actually look good", tags: ["creative", "communicate"] },
    ],
  },
  {
    id: "q4",
    question: "Which school subject do you secretly love (but might not admit)?",
    options: [
      { text: "Math - proofs and patterns are weirdly satisfying", tags: ["tech", "research"] },
      { text: "Economics - figuring out why markets move", tags: ["business", "data"] },
      { text: "English - words are powerful", tags: ["communicate", "creative"] },
      { text: "Physics - I want to know how the universe works", tags: ["tech", "build"] },
    ],
  },
  {
    id: "q5",
    question: "A bug in your code - what's your move?",
    options: [
      { text: "Debug for hours until I understand what happened", tags: ["tech", "research"] },
      { text: "Post on Stack Overflow / ask a friend", tags: ["communicate", "tech"] },
      { text: "Delete it and rewrite from scratch", tags: ["build", "creative"] },
      { text: "Carefully document what went wrong for future me", tags: ["policy", "communicate"] },
    ],
  },
  {
    id: "q6",
    question: "What's your favourite type of YouTube video?",
    options: [
      { text: "Coding tutorials and live builds", tags: ["tech", "build"] },
      { text: "Data visualisations and stats breakdowns", tags: ["data", "communicate"] },
      { text: "Design teardowns of beautiful apps", tags: ["creative", "build"] },
      { text: "Tech criticism and AI ethics rants", tags: ["policy", "research"] },
    ],
  },
  {
    id: "q7",
    question: "You have a million-dollar AI idea. What do you do first?",
    options: [
      { text: "Build the MVP this weekend, no meetings", tags: ["tech", "build", "creative"] },
      { text: "Make a pitch deck and call every investor you know", tags: ["business", "communicate"] },
      { text: "Research if anyone else already tried it", tags: ["research", "data"] },
      { text: "Worry about how it could be misused", tags: ["policy", "creative"] },
    ],
  },
  {
    id: "q8",
    question: "If you had a superpower, you'd pick...",
    options: [
      { text: "Reading minds - all that hidden data", tags: ["research", "data"] },
      { text: "Shapeshifting - endless creative forms", tags: ["creative", "build"] },
      { text: "Time travel - go back and run experiments", tags: ["research", "tech"] },
      { text: "Persuasion - convince anyone of anything", tags: ["communicate", "business"] },
    ],
  },
  {
    id: "q9",
    question: "Your experiment shows a weird, unexpected result. You...",
    options: [
      { text: "Double-check every calculation before trusting it", tags: ["data", "research"] },
      { text: "Start drafting a story to explain it to others", tags: ["communicate", "data"] },
      { text: "Dive into root-cause mode - why is this happening?", tags: ["research", "tech"] },
      { text: "Question whether the experiment was fair in the first place", tags: ["policy", "research"] },
    ],
  },
  {
    id: "q10",
    question: "You'd rather spend a week...",
    options: [
      { text: "Building a working robot arm from scratch", tags: ["build", "tech"] },
      { text: "Writing a research paper on a tricky topic", tags: ["research", "communicate"] },
      { text: "Interviewing 50 users to find a real pain point", tags: ["business", "communicate"] },
      { text: "Training an image classifier on 100k photos", tags: ["tech", "data"] },
    ],
  },
  {
    id: "q11",
    question: "Your phone's home screen looks like...",
    options: [
      { text: "Terminal shortcuts and GitHub icons", tags: ["tech", "build"] },
      { text: "Graphs, dashboards, and cricket scorecards", tags: ["data", "research"] },
      { text: "A gorgeous wallpaper with 4 perfectly-placed icons", tags: ["creative", "communicate"] },
      { text: "News apps and policy Twitter lists", tags: ["policy", "communicate"] },
    ],
  },
  {
    id: "q12",
    question: "The best part of school for you is...",
    options: [
      { text: "Physics and chemistry lab experiments", tags: ["build", "research"] },
      { text: "Math olympiads and problem-solving contests", tags: ["research", "tech"] },
      { text: "Debate club and MUN tournaments", tags: ["communicate", "policy"] },
      { text: "Art and design projects with visible output", tags: ["creative", "build"] },
    ],
  },
  {
    id: "q13",
    question: "When something doesn't work the way it should, you feel...",
    options: [
      { text: "Curious - 'let me understand what's really happening'", tags: ["research", "tech"] },
      { text: "Annoyed - 'I must fix this right now'", tags: ["build", "tech"] },
      { text: "Inspired - 'this would be a great blog post'", tags: ["communicate", "creative"] },
      { text: "Concerned - 'someone should file a proper complaint'", tags: ["policy", "communicate"] },
    ],
  },
  {
    id: "q14",
    question: "Three words your friends would use for you are...",
    options: [
      { text: "Logical, sharp, methodical", tags: ["tech", "research"] },
      { text: "Curious, questioning, observant", tags: ["research", "data"] },
      { text: "Creative, visual, imaginative", tags: ["creative", "build"] },
      { text: "Persuasive, outgoing, confident", tags: ["communicate", "business"] },
    ],
  },
  {
    id: "q15",
    question: "Fast-forward 10 years. What do you want to be doing?",
    options: [
      { text: "Leading a team that builds products millions use", tags: ["build", "tech", "business"] },
      { text: "Publishing AI research papers read around the world", tags: ["research", "communicate"] },
      { text: "Running my own company - chaos and all", tags: ["business", "build", "creative"] },
      { text: "Shaping AI policy that protects millions of people", tags: ["policy", "communicate", "research"] },
    ],
  },
];

/* --------------------------------------------------------------------------
 * Scoring
 * ------------------------------------------------------------------------ */

/**
 * Score a set of answers against all careers.
 * Returns a list of CareerMatch sorted by score descending.
 *
 * Algorithm:
 *   1. For each answered question, add POINTS_PER_TAG to every tag on
 *      the selected option.
 *   2. For each career, sum the points on its tags.
 *   3. Normalize to percentage: career score / (career's max possible points)
 *      where max = number_of_questions * POINTS_PER_TAG * career.tags.length.
 *   4. Also report which of the career's tags actually received points.
 *
 * Deterministic: same input always yields same output.
 */
export function scoreQuiz(answers: QuizAnswer[]): CareerMatch[] {
  const tagPoints: Record<CareerTag, number> = {
    tech: 0,
    data: 0,
    research: 0,
    creative: 0,
    business: 0,
    policy: 0,
    build: 0,
    communicate: 0,
  };

  // Index questions for O(1) lookup
  const byId = new Map<string, QuizQuestion>();
  for (const q of CAREER_QUIZ) byId.set(q.id, q);

  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (!q) continue;
    const opt = q.options[a.selectedIndex];
    if (!opt) continue; // skipped or invalid
    for (const tag of opt.tags) {
      tagPoints[tag] += POINTS_PER_TAG;
    }
  }

  // The theoretical max per tag is: every question picks an option that
  // includes this tag, so POINTS_PER_TAG * CAREER_QUIZ.length.
  const maxPerTag = POINTS_PER_TAG * CAREER_QUIZ.length;

  const matches: CareerMatch[] = CAREERS.map((career) => {
    let sum = 0;
    const matchedTags: CareerTag[] = [];
    for (const tag of career.tags) {
      const p = tagPoints[tag];
      sum += p;
      if (p > 0) matchedTags.push(tag);
    }
    const max = maxPerTag * career.tags.length;
    const score = max > 0 ? Math.round((sum / max) * 100) : 0;
    return { career, score, matchedTags };
  });

  // Sort descending; ties broken by slug for determinism.
  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.career.slug.localeCompare(b.career.slug);
  });

  return matches;
}
