/* --------------------------------------------------------------------------
 * Certificate catalog - 12 deterministic, frontend-only certificates.
 *
 * Each definition has an `isEarned` closure that inspects a `CertCheckCtx`
 * snapshot of the current progress state and decides whether the student has
 * earned the certificate. Verification codes are derived from state in the
 * page component (not here) so they stay deterministic across reloads.
 * ------------------------------------------------------------------------ */

export type CertKind = "module" | "track" | "project" | "exam-prep";
export type CertAccent = "coral" | "mint" | "yellow" | "lav" | "sky" | "peach";

export type CertCheckCtx = {
  completedLessons: string[];
  totalLessons: number;
  xp: number;
  projectsCompleted: number;
  perfectQuizzes: number;
  examBestScore: number; // percentage; 0 if never taken
};

export type CertificateDef = {
  id: string;
  kind: CertKind;
  title: string;
  subtitle: string;
  description: string;
  requirement: string;
  emoji: string;
  accent: CertAccent;
  isEarned: (ctx: CertCheckCtx) => boolean;
};

/* --------------------------------------------------------------------------
 * Level lesson path arrays - hardcoded so isEarned checks stay pure.
 * Must stay in sync with src/components/Sidebar.tsx LEVELS.
 * ------------------------------------------------------------------------ */

export const LEVEL_1_LESSONS = [
  "/level1/machines",
  "/level1/computers",
  "/level1/data",
  "/level1/senses",
  "/level1/bits",
];

export const LEVEL_2_LESSONS = [
  "/level2/coordinates",
  "/level2/patterns",
  "/level2/sorting",
  "/level2/outliers",
  "/level2/averages",
];

export const LEVEL_3_LESSONS = [
  "/level3/predictions",
  "/level3/best-line",
  "/level3/algorithms",
  "/level3/how-computers-learn",
  "/level3/features-labels",
  "/level3/train-test",
];

export const LEVEL_4_LESSONS = [
  "/level4/supervised-learning",
  "/level4/knn",
  "/level4/decision-trees",
  "/level4/measuring-success",
  "/level4/train-test-split",
  "/level4/confusion-matrix",
];

export const LEVEL_5_LESSONS = [
  "/level5/unsupervised-learning",
  "/level5/kmeans",
  "/level5/choosing-k",
  "/level5/anomaly",
  "/level5/dimensionality",
];

export const LEVEL_6_LESSONS = [
  "/level6/perceptron",
  "/level6/activation-functions",
  "/level6/neural-network",
  "/level6/backpropagation",
  "/level6/weights-biases",
  "/level6/forward-pass",
];

export const LEVEL_7_LESSONS = [
  "/level7/gradient-descent",
  "/level7/learning-rate",
  "/level7/overfitting",
  "/level7/sgd-vs-batch",
];

export const LEVEL_8_LESSONS = [
  "/level8/images-as-data",
  "/level8/filters",
  "/level8/stride-padding",
  "/level8/mini-cnn",
  "/level8/history",
];

export const LEVEL_9_LESSONS = [
  "/level9/hand-tracking",
  "/level9/gesture-recognition",
  "/level9/object-detection",
];

export const ALL_LEVEL_LESSONS = [
  ...LEVEL_1_LESSONS,
  ...LEVEL_2_LESSONS,
  ...LEVEL_3_LESSONS,
  ...LEVEL_4_LESSONS,
  ...LEVEL_5_LESSONS,
  ...LEVEL_6_LESSONS,
  ...LEVEL_7_LESSONS,
  ...LEVEL_8_LESSONS,
  ...LEVEL_9_LESSONS,
];

function hasAll(lessons: string[], target: string[]): boolean {
  return target.every((p) => lessons.includes(p));
}

/* --------------------------------------------------------------------------
 * Catalog
 * ------------------------------------------------------------------------ */

export const CERTIFICATES: CertificateDef[] = [
  {
    id: "rpl-first-steps",
    kind: "module",
    title: "First Steps in AI",
    subtitle: "Level 1 Complete",
    description:
      "Awarded for completing the foundational unit on machines, computers, data, sensors and bits.",
    requirement: "Complete all 5 Level 1 lessons",
    emoji: "🐣",
    accent: "yellow",
    isEarned: (ctx) => hasAll(ctx.completedLessons, LEVEL_1_LESSONS),
  },
  {
    id: "rpl-data-literate",
    kind: "module",
    title: "Data Literate",
    subtitle: "Level 2 Complete",
    description:
      "Awarded for mastering coordinates, patterns, sorting, outliers and averages - the language of data.",
    requirement: "Complete all 5 Level 2 lessons",
    emoji: "📊",
    accent: "mint",
    isEarned: (ctx) => hasAll(ctx.completedLessons, LEVEL_2_LESSONS),
  },
  {
    id: "rpl-prediction-master",
    kind: "module",
    title: "Prediction Master",
    subtitle: "Level 3 Complete",
    description:
      "Awarded for finishing the full Level 3 unit on predictions, best-fit lines, algorithms and train-test splits.",
    requirement: "Complete all 6 Level 3 lessons",
    emoji: "🔮",
    accent: "sky",
    isEarned: (ctx) => hasAll(ctx.completedLessons, LEVEL_3_LESSONS),
  },
  {
    id: "rpl-classic-ml",
    kind: "module",
    title: "Classic ML Graduate",
    subtitle: "Level 4 Complete",
    description:
      "Awarded for completing Supervised Learning - KNN, Decision Trees, metrics, and the confusion matrix.",
    requirement: "Complete all 6 Level 4 lessons",
    emoji: "🎓",
    accent: "coral",
    isEarned: (ctx) => hasAll(ctx.completedLessons, LEVEL_4_LESSONS),
  },
  {
    id: "rpl-unsupervised",
    kind: "module",
    title: "Unsupervised Explorer",
    subtitle: "Level 5 Complete",
    description:
      "Awarded for exploring clustering, anomaly detection and dimensionality reduction in Level 5.",
    requirement: "Complete all 5 Level 5 lessons",
    emoji: "🧭",
    accent: "lav",
    isEarned: (ctx) => hasAll(ctx.completedLessons, LEVEL_5_LESSONS),
  },
  {
    id: "rpl-neural-architect",
    kind: "module",
    title: "Neural Architect",
    subtitle: "Level 6 Complete",
    description:
      "Awarded for building up from the perceptron to a full neural network with backpropagation.",
    requirement: "Complete all 6 Level 6 lessons",
    emoji: "🧠",
    accent: "peach",
    isEarned: (ctx) => hasAll(ctx.completedLessons, LEVEL_6_LESSONS),
  },
  {
    id: "rpl-trainer",
    kind: "module",
    title: "Model Trainer",
    subtitle: "Level 7 Complete",
    description:
      "Awarded for mastering gradient descent, learning rate tuning, overfitting defenses, and SGD vs Batch.",
    requirement: "Complete all 4 Level 7 lessons",
    emoji: "⚙️",
    accent: "yellow",
    isEarned: (ctx) => hasAll(ctx.completedLessons, LEVEL_7_LESSONS),
  },
  {
    id: "rpl-vision-engineer",
    kind: "module",
    title: "Computer Vision Engineer",
    subtitle: "Level 8 Complete",
    description:
      "Awarded for completing the Computer Vision track - images as data, filters, pooling and mini CNNs.",
    requirement: "Complete all 5 Level 8 lessons",
    emoji: "👁️",
    accent: "mint",
    isEarned: (ctx) => hasAll(ctx.completedLessons, LEVEL_8_LESSONS),
  },
  {
    id: "rpl-full-track",
    kind: "track",
    title: "AI Literacy Certified - Full Track",
    subtitle: "All 9 Levels Complete",
    description:
      "Awarded for finishing the entire Red Panda Learn AI Literacy curriculum, from bits to live camera AI.",
    requirement: "Complete every lesson in all 9 levels",
    emoji: "🏅",
    accent: "coral",
    isEarned: (ctx) => hasAll(ctx.completedLessons, ALL_LEVEL_LESSONS),
  },
  {
    id: "rpl-builder",
    kind: "project",
    title: "AI Project Builder",
    subtitle: "First Project Complete",
    description:
      "Awarded for shipping your first end-to-end AI project with Red Panda Learn.",
    requirement: "Complete at least 1 project",
    emoji: "🔨",
    accent: "sky",
    isEarned: (ctx) => ctx.projectsCompleted >= 1,
  },
  {
    id: "rpl-board-ready",
    kind: "exam-prep",
    title: "CBSE AI 417 Board Ready",
    subtitle: "Practice Exam Passed",
    description:
      "Awarded for scoring at least 80% on the CBSE AI 417 practice exam - you&apos;re board ready.",
    requirement: "Score 80%+ on the practice exam",
    emoji: "📝",
    accent: "lav",
    isEarned: (ctx) => ctx.examBestScore >= 80,
  },
  {
    id: "rpl-elite",
    kind: "track",
    title: "Red Panda Elite",
    subtitle: "10,000 XP Earned",
    description:
      "Awarded for reaching the Red Panda Elite tier by earning 10,000 total XP.",
    requirement: "Earn 10,000 total XP",
    emoji: "👑",
    accent: "peach",
    isEarned: (ctx) => ctx.xp >= 10000,
  },
];

export function getEarnedCertificates(ctx: CertCheckCtx): CertificateDef[] {
  return CERTIFICATES.filter((c) => c.isEarned(ctx));
}

/* Tailwind-compatible accent → CSS var lookup used by cards. */
export const ACCENT_VAR: Record<CertAccent, string> = {
  coral: "var(--accent-coral)",
  mint: "var(--accent-mint)",
  yellow: "var(--accent-yellow)",
  lav: "var(--accent-lav)",
  sky: "var(--accent-sky)",
  peach: "var(--accent-peach)",
};
