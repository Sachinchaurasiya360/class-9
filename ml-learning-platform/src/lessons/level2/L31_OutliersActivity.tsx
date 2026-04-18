"use client";

import { useState, useMemo, useCallback } from "react";
import { AlertTriangle, Sparkles, Eye } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playSuccess, playError } from "../../utils/sounds";
import {
  BoxPlot,
  Histogram,
  ScatterPlot,
} from "../../components/viz/data-viz";
import type { DataPoint } from "../../components/viz/data-viz";

const CORAL = "var(--accent-coral)";
const MINT = "var(--accent-mint)";
const YELLOW = "var(--accent-yellow)";
const SKY = "var(--accent-sky)";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Riku says                                                          */
/* ------------------------------------------------------------------ */

function RikuSays({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="card-sketchy p-3 flex gap-3 items-start"
      style={{ background: "#fff8e7" }}
    >
      <span className="text-2xl" aria-hidden>
        🐼
      </span>
      <p className="font-hand text-sm text-foreground leading-snug">
        {children}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 – Spot the Odd One Out (via BoxPlot)                         */
/* ------------------------------------------------------------------ */

interface Round {
  label: string;
  values: number[];
  realOutliers: number[]; // actual answer values
  hint: string;
}

const ROUNDS: Round[] = [
  {
    label: "Test scores out of 100",
    hint: "Most kids scored similarly. One score is WAY off.",
    values: [78, 82, 75, 85, 80, 18, 88, 76, 84, 79, 81, 83],
    realOutliers: [18],
  },
  {
    label: "Heights of 5th graders (cm)",
    hint: "All kids are roughly the same height... except one.",
    values: [110, 105, 108, 112, 30, 109, 111, 107, 113, 106, 114],
    realOutliers: [30],
  },
  {
    label: "Pizza slices eaten at a party",
    hint: "Everyone ate a normal amount... well, almost everyone.",
    values: [3, 2, 4, 3, 5, 2, 18, 3, 4, 2, 3, 4],
    realOutliers: [18],
  },
];

const GUESS_CHOICES: Record<number, number[]> = {
  0: [80, 18, 88],
  1: [110, 30, 113],
  2: [3, 18, 4],
};

function SpotTab() {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const r = ROUNDS[round];
  const choices = GUESS_CHOICES[round];
  const isCorrect = picked !== null && r.realOutliers.includes(picked);

  const handlePick = useCallback(
    (v: number) => {
      if (picked !== null) return;
      setPicked(v);
      if (r.realOutliers.includes(v)) {
        playSuccess();
        setScore((s) => s + 1);
      } else {
        playError();
      }
    },
    [picked, r.realOutliers],
  );

  const handleNext = useCallback(() => {
    playClick();
    setPicked(null);
    setShowHint(false);
    setRound((prev) => (prev + 1) % ROUNDS.length);
  }, []);

  return (
    <div className="space-y-4">
      <RikuSays>
        A box plot is like a box with whiskers. The whiskers show the
        &quot;normal&quot; range. The dots sitting outside? Outliers. The
        library auto-flags anything beyond 1.5× the inter-quartile range.
      </RikuSays>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="font-hand text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Round {round + 1} / {ROUNDS.length}
        </p>
        <p className="font-hand text-sm font-bold text-foreground">
          Score: <span style={{ color: CORAL }}>{score}</span> /{" "}
          {ROUNDS.length}
        </p>
      </div>

      <p className="font-hand text-base text-foreground text-center">
        {r.label}
      </p>

      <div
        className="card-sketchy notebook-grid p-4"
        style={{ background: PAPER }}
      >
        <BoxPlot
          data={r.values}
          width={480}
          height={260}
          labels={[r.label]}
          yLabel="value"
        />
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        Which value sits OUTSIDE the whiskers?
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {choices.map((v) => {
          const chosen = picked === v;
          const correct = r.realOutliers.includes(v);
          let bg: string = SKY;
          if (picked !== null) {
            if (correct) bg = MINT;
            else if (chosen) bg = CORAL;
          }
          return (
            <button
              key={v}
              onClick={() => handlePick(v)}
              disabled={picked !== null}
              className="btn-sketchy font-hand text-sm"
              style={{ background: bg }}
            >
              {v}
            </button>
          );
        })}
      </div>

      {picked === null && (
        <div className="text-center">
          <button
            onClick={() => setShowHint((s) => !s)}
            className="font-hand text-xs underline text-muted-foreground"
          >
            {showHint ? "hide hint" : "need a hint?"}
          </button>
          {showHint && (
            <p className="font-hand text-xs italic text-muted-foreground mt-1">
              {r.hint}
            </p>
          )}
        </div>
      )}

      {picked !== null && (
        <div
          className="card-sketchy p-4 space-y-2"
          style={{ background: isCorrect ? "#e8fff5" : "#ffe8e8" }}
        >
          <p className="font-hand text-base font-bold text-foreground">
            {isCorrect
              ? "Nice eye! That value is the one the box plot flagged."
              : `Not quite - the real outlier is ${r.realOutliers.join(", ")}. See the dot floating outside the whiskers?`}
          </p>
          <p className="font-hand text-sm text-foreground">
            That point is FAR from the middle of the data. We call it an{" "}
            <b>outlier</b> - a value that doesn&apos;t fit the usual pattern.
          </p>
          <button
            onClick={handleNext}
            className="btn-sketchy font-hand text-sm"
            style={{ background: YELLOW }}
          >
            Next round →
          </button>
        </div>
      )}

      <InfoBox variant="blue">
        An <b>outlier</b> is a data point that&apos;s very different from
        the rest. Sometimes it&apos;s a mistake - sometimes it&apos;s the
        most interesting thing in your data!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – How outliers PULL the average (Histogram + slider)         */
/* ------------------------------------------------------------------ */

const BASE_VALUES = [4, 5, 6, 5, 6, 5, 4, 6, 5, 5, 6, 4, 5, 6, 5];

function PullTab() {
  const [outlier, setOutlier] = useState(50);
  const [included, setIncluded] = useState(true);

  const values = useMemo(
    () => (included ? [...BASE_VALUES, outlier] : BASE_VALUES),
    [included, outlier],
  );

  const mean = useMemo(
    () => values.reduce((a, b) => a + b, 0) / values.length,
    [values],
  );
  const sorted = useMemo(() => [...values].sort((a, b) => a - b), [values]);
  const median = useMemo(() => {
    const n = sorted.length;
    return n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
  }, [sorted]);

  return (
    <div className="space-y-5">
      <RikuSays>
        Watch what happens to the <b>average</b> when one weird value
        sneaks in. The mean line (coral) gets dragged toward the outlier.
        The median line (lavender) barely budges - that&apos;s its
        superpower.
      </RikuSays>

      <p className="font-hand text-base text-foreground text-center">
        Slide the outlier - see the histogram&apos;s mean line shift.
      </p>

      <div
        className="card-sketchy notebook-grid p-4"
        style={{ background: PAPER }}
      >
        <Histogram
          data={values}
          width={520}
          height={280}
          bins={12}
          showMean
          showMedian
          color={SKY}
          xLabel="value"
          yLabel="count"
        />
      </div>

      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        <div className="flex items-center justify-between">
          <span className="font-hand text-sm font-bold text-foreground">
            Outlier value: <span style={{ color: CORAL }}>{outlier}</span>
          </span>
          <button
            onClick={() => setIncluded((i) => !i)}
            className="btn-sketchy-outline font-hand text-xs"
          >
            {included ? "Remove outlier" : "Add outlier back"}
          </button>
        </div>
        <input
          type="range"
          min={5}
          max={60}
          value={outlier}
          onChange={(e) => setOutlier(Number(e.target.value))}
          className="w-full"
          disabled={!included}
          style={{ accentColor: "#ff6b6b" }}
        />
        <div className="flex justify-between text-xs font-hand text-foreground">
          <span>
            Mean: <b style={{ color: CORAL }}>{mean.toFixed(2)}</b>
          </span>
          <span>
            Median: <b style={{ color: "var(--accent-lav)" }}>{median.toFixed(2)}</b>
          </span>
        </div>
        <p className="font-hand text-xs text-muted-foreground">
          Drag the slider - the coral mean line drifts way more than the
          lavender median line.
        </p>
      </div>

      <RikuSays>
        Rule of thumb: if your data has outliers you can&apos;t remove,
        use the <b>median</b> instead of the mean. It doesn&apos;t flinch.
      </RikuSays>

      <InfoBox variant="amber">
        See how one weird value can drag the average way off? That&apos;s
        why scientists check for outliers BEFORE calculating averages -
        they can completely lie about your data.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Real-world outlier stories                                 */
/* ------------------------------------------------------------------ */

const STORIES: {
  title: string;
  color: string;
  icon: string;
  text: string;
  lesson: string;
  // Tiny illustrative scatter for this story.
  scatter: DataPoint[];
}[] = [
  {
    title: "The Lucky Lottery",
    color: YELLOW,
    icon: "🎟️",
    text: "If 1,000 people make $50,000 a year and one person wins $10 million in the lottery, the AVERAGE income jumps to $60,000 - even though nothing changed for 999 of them.",
    lesson: "Outliers can make averages misleading.",
    scatter: [
      ...Array.from({ length: 12 }, (_, i) => ({
        x: i + 1,
        y: 48 + ((i * 7) % 5),
        category: "normal",
      })),
      { x: 13, y: 95, category: "outlier" },
    ],
  },
  {
    title: "The Broken Sensor",
    color: CORAL,
    icon: "🌡️",
    text: "A weather station reports temperatures: 22°C, 23°C, 21°C, 22°C, then suddenly 850°C! That last one is a sensor error, not a real temperature.",
    lesson: "Sometimes outliers are mistakes you should remove.",
    scatter: [
      { x: 1, y: 22, category: "normal" },
      { x: 2, y: 23, category: "normal" },
      { x: 3, y: 21, category: "normal" },
      { x: 4, y: 22, category: "normal" },
      { x: 5, y: 24, category: "normal" },
      { x: 6, y: 22, category: "normal" },
      { x: 7, y: 98, category: "outlier" },
    ],
  },
  {
    title: "The Genius Discovery",
    color: MINT,
    icon: "💡",
    text: "Most stars in a galaxy have similar brightness. But ONE star pulsing in a weird way turned out to be the first known black hole.",
    lesson: "Sometimes outliers are the most exciting find!",
    scatter: [
      ...Array.from({ length: 14 }, (_, i) => ({
        x: i + 1,
        y: 40 + ((i * 5) % 8),
        category: "normal",
      })),
      { x: 15, y: 92, category: "outlier" },
    ],
  },
  {
    title: "The Olympic Athlete",
    color: SKY,
    icon: "🏃",
    text: "Most people run 100m in 14-18 seconds. Usain Bolt ran it in 9.58 seconds. He's a real outlier - and he holds the world record.",
    lesson: "Outliers show us the limits of what's possible.",
    scatter: [
      ...Array.from({ length: 12 }, (_, i) => ({
        x: i + 1,
        y: 14 + ((i * 3) % 4),
        category: "normal",
      })),
      { x: 13, y: 9.58, category: "outlier" },
    ],
  },
];

function StoriesTab() {
  const [open, setOpen] = useState(0);
  const story = STORIES[open];
  return (
    <div className="space-y-4">
      <RikuSays>
        Outliers aren&apos;t always bad. Sometimes they&apos;re the most
        interesting thing in the whole dataset. Pick a story - see the
        coral dot in each one?
      </RikuSays>

      <p className="font-hand text-base text-foreground text-center">
        Outliers aren&apos;t always bad. Sometimes they&apos;re the most
        interesting thing!
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {STORIES.map((s, i) => (
          <button
            key={s.title}
            onClick={() => {
              playClick();
              setOpen(i);
            }}
            className="card-sketchy p-4 text-left transition-transform hover:-translate-y-0.5"
            style={{
              background: open === i ? s.color + "33" : PAPER,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className="font-hand font-bold text-foreground">
                {s.title}
              </span>
            </div>
            <p className="font-hand text-sm text-foreground">{s.text}</p>
            {open === i && (
              <p
                className="font-hand text-xs italic mt-2 pt-2 border-t-2 border-dashed border-foreground/30 text-foreground"
              >
                💭 {s.lesson}
              </p>
            )}
          </button>
        ))}
      </div>

      <div
        className="card-sketchy p-4"
        style={{ background: PAPER }}
      >
        <p className="font-hand text-sm font-bold text-center text-foreground mb-2">
          {story.title} - the coral dot is the outlier
        </p>
        <ScatterPlot
          data={story.scatter}
          width={520}
          height={260}
          xLabel="index"
          yLabel="value"
          categoryColors={{ normal: MINT, outlier: CORAL }}
          pointRadius={7}
        />
      </div>

      <RikuSays>
        Before you delete an outlier, investigate it first. Typo? Delete.
        Broken sensor? Delete. A discovery no one expected? <b>Keep it
        and tell everyone.</b>
      </RikuSays>

      <InfoBox variant="green">
        Before deleting an outlier, ask: &quot;Is this a mistake, or is
        this the most important data point in my whole dataset?&quot;
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What is an outlier?",
    options: [
      "The smallest number in a list",
      "A data point that's very different from the rest",
      "A wrong answer",
      "The middle value",
    ],
    correctIndex: 1,
    explanation:
      "An outlier is any value that sits far away from the rest of the data - much higher or much lower than normal.",
  },
  {
    question: "What does an outlier do to the average?",
    options: [
      "Nothing - averages ignore outliers",
      "It pulls the average toward itself",
      "It makes the average zero",
      "It deletes the average",
    ],
    correctIndex: 1,
    explanation:
      "Even one extreme value can drag the average way off from where most of the data really sits.",
  },
  {
    question: "Should you ALWAYS delete outliers?",
    options: [
      "Yes, always",
      "No - sometimes they're the most interesting data!",
      "Only on weekends",
      "Only if they're red",
    ],
    correctIndex: 1,
    explanation:
      "Outliers can be mistakes (delete) OR genuine discoveries (keep). Always investigate before removing.",
  },
  {
    question: "Which of these is most likely an outlier in '5, 6, 5, 7, 6, 100, 5, 6'?",
    options: ["5", "6", "100", "7"],
    correctIndex: 2,
    explanation: "100 is far away from all the other values clustered around 5-7.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function L31_OutliersActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "spot",
        label: "Spot the Odd One",
        icon: <Eye className="w-4 h-4" />,
        content: <SpotTab />,
      },
      {
        id: "pull",
        label: "Outliers Pull Averages",
        icon: <AlertTriangle className="w-4 h-4" />,
        content: <PullTab />,
      },
      {
        id: "stories",
        label: "Real Stories",
        icon: <Sparkles className="w-4 h-4" />,
        content: <StoriesTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Outliers: Spotting the Odd Ones Out"
      level={2}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Now that you know how outliers can mess with averages, let's learn what averages actually MEAN."
      story={
        <StorySection
          paragraphs={[
            "Aru was looking at her class's math test scores. Most kids got around 75-85, but one score caught her eye: 12.",
            "Aru: \"Whoa! Did someone REALLY get a 12? Maybe they were sick.\"",
            "Byte: \"That's an outlier - a value that doesn't fit the pattern. Could be a sick student. Could be a wrong entry. Could even be the most important clue in the whole dataset.\"",
            "Aru: \"How do I tell which one?\"",
            "Byte: \"You investigate. Outliers are like loud kids in a quiet classroom - you can't ignore them, but you also shouldn't kick them out without asking why they're making noise.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="An outlier is a data point that lies far away from the rest. It can distort averages and trick analysts - but it can also reveal mistakes, breakthroughs, or rare events. Always investigate outliers before deciding what to do with them."
        />
      }
    />
  );
}
