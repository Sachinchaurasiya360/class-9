"use client";

import { useState, useMemo, useCallback } from "react";
import { AlertTriangle, Sparkles, Eye } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playSuccess, playError } from "../../utils/sounds";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const SKY = "#6bb6ff";
const PEACH = "#ffb88c";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Tab 1 – Spot the Odd One Out                                       */
/* ------------------------------------------------------------------ */

interface Round {
  label: string;
  points: { x: number; y: number; isOutlier?: boolean }[];
  hint: string;
}

const ROUNDS: Round[] = [
  {
    label: "Test scores out of 100",
    hint: "Most kids scored similarly. One score is WAY off.",
    points: [
      { x: 80, y: 78 },
      { x: 100, y: 82 },
      { x: 130, y: 75 },
      { x: 160, y: 85 },
      { x: 190, y: 80 },
      { x: 220, y: 18, isOutlier: true },
      { x: 250, y: 88 },
      { x: 280, y: 76 },
      { x: 310, y: 84 },
      { x: 340, y: 79 },
    ],
  },
  {
    label: "Heights of 5th graders (cm)",
    hint: "All kids are roughly the same height... except one.",
    points: [
      { x: 80, y: 110 },
      { x: 110, y: 105 },
      { x: 140, y: 108 },
      { x: 170, y: 112 },
      { x: 200, y: 30, isOutlier: true },
      { x: 230, y: 109 },
      { x: 260, y: 111 },
      { x: 290, y: 107 },
      { x: 320, y: 113 },
    ],
  },
  {
    label: "Pizza slices eaten at a party",
    hint: "Everyone ate a normal amount... well, almost everyone.",
    points: [
      { x: 80, y: 130 },
      { x: 110, y: 125 },
      { x: 140, y: 135 },
      { x: 170, y: 128 },
      { x: 200, y: 132 },
      { x: 230, y: 138 },
      { x: 260, y: 50, isOutlier: true },
      { x: 290, y: 130 },
      { x: 320, y: 127 },
    ],
  },
];

function SpotTab() {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const r = ROUNDS[round];
  const correctIdx = useMemo(() => r.points.findIndex((p) => p.isOutlier), [r]);
  const isCorrect = picked === correctIdx;

  const handlePick = useCallback(
    (i: number) => {
      if (picked !== null) return;
      setPicked(i);
      if (i === correctIdx) {
        playSuccess();
        setScore((s) => s + 1);
      } else {
        playError();
      }
    },
    [picked, correctIdx]
  );

  const handleNext = useCallback(() => {
    playClick();
    setPicked(null);
    setShowHint(false);
    setRound((r) => (r + 1) % ROUNDS.length);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="font-hand text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Round {round + 1} / {ROUNDS.length}
        </p>
        <p className="font-hand text-sm font-bold text-foreground">
          Score: <span style={{ color: CORAL }}>{score}</span> / {ROUNDS.length}
        </p>
      </div>

      <p className="font-hand text-base text-foreground text-center">
        {r.label}
      </p>

      <div className="card-sketchy notebook-grid p-4" style={{ background: PAPER }}>
        <svg width="100%" viewBox="0 0 420 200" style={{ maxHeight: 260 }}>
          <defs>
            <radialGradient id="dot-sky" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#94caff" />
              <stop offset="100%" stopColor={SKY} />
            </radialGradient>
            <radialGradient id="dot-coral" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ff9b9b" />
              <stop offset="100%" stopColor={CORAL} />
            </radialGradient>
            <radialGradient id="dot-peach" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ffd0b3" />
              <stop offset="100%" stopColor={PEACH} />
            </radialGradient>
          </defs>
          {/* Axes */}
          <line x1="40" y1="170" x2="400" y2="170" stroke={INK} strokeWidth="2" />
          <line x1="40" y1="20" x2="40" y2="170" stroke={INK} strokeWidth="2" />
          <text
            x="220"
            y="195"
            textAnchor="middle"
            fill={INK}
            opacity="0.6"
            style={{ fontFamily: "Patrick Hand, cursive", fontSize: 12 }}
          >
            kids →
          </text>

          {/* Points */}
          {r.points.map((p, i) => {
            const isPicked = picked === i;
            const reveal = picked !== null;
            const correct = p.isOutlier;
            const fill = !reveal
              ? "url(#dot-sky)"
              : correct
                ? "url(#dot-coral)"
                : isPicked
                  ? "url(#dot-peach)"
                  : "url(#dot-sky)";
            return (
              <g key={i}>
                {reveal && correct && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={14}
                    fill="none"
                    stroke={CORAL}
                    strokeWidth={3}
                    className="fire-ring"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isPicked || (reveal && correct) ? 12 : 9}
                  fill={fill}
                  stroke={INK}
                  strokeWidth="2"
                  onClick={() => handlePick(i)}
                  className={reveal && correct ? "pulse-glow" : ""}
                  style={{
                    cursor: picked === null ? "pointer" : "default",
                    transition: "all 0.3s ease",
                    color: CORAL,
                    filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)",
                  }}
                />
                {reveal && correct && (
                  <text
                    x={p.x}
                    y={p.y - 18}
                    textAnchor="middle"
                    fill={CORAL}
                    style={{
                      fontFamily: "Kalam, cursive",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    OUTLIER!
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {picked === null && (
        <>
          <p className="font-hand text-sm text-center text-muted-foreground">
            Click the dot that doesn't fit with the others.
          </p>
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
        </>
      )}

      {picked !== null && (
        <div
          className="card-sketchy p-4 space-y-2"
          style={{ background: isCorrect ? "#e8fff5" : "#ffe8e8" }}
        >
          <p className="font-hand text-base font-bold text-foreground">
            {isCorrect ? "Nice eye! 🎯" : "Not quite — the red dot is the odd one."}
          </p>
          <p className="font-hand text-sm text-foreground">
            That point is FAR away from all the others. We call it an{" "}
            <b>outlier</b> — a value that doesn't fit the usual pattern.
          </p>
          <button onClick={handleNext} className="btn-sketchy font-hand text-sm" style={{ background: YELLOW }}>
            Next round →
          </button>
        </div>
      )}

      <InfoBox variant="blue">
        An <b>outlier</b> is a data point that's very different from the rest.
        Sometimes it's a mistake — sometimes it's the most interesting thing in
        your data!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – How outliers PULL the average                              */
/* ------------------------------------------------------------------ */

const BASE_VALUES = [4, 5, 6, 5, 6, 5, 4, 6, 5];

function PullTab() {
  const [outlier, setOutlier] = useState(50);
  const [included, setIncluded] = useState(true);

  const values = included ? [...BASE_VALUES, outlier] : BASE_VALUES;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  // Map values onto a number line 0..60
  const NL_W = 380;
  const NL_PAD = 30;
  const xFor = (v: number) => NL_PAD + (v / 60) * (NL_W - NL_PAD * 2);

  return (
    <div className="space-y-5">
      <p className="font-hand text-base text-foreground text-center">
        Watch what happens to the <b>average</b> when one weird value sneaks in.
      </p>

      <div className="card-sketchy notebook-grid p-4" style={{ background: PAPER }}>
        <svg width="100%" viewBox={`0 0 ${NL_W} 150`} style={{ maxHeight: 200 }}>
          <defs>
            <radialGradient id="pull-sky" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#94caff" />
              <stop offset="100%" stopColor={SKY} />
            </radialGradient>
            <radialGradient id="pull-coral" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ff9b9b" />
              <stop offset="100%" stopColor={CORAL} />
            </radialGradient>
          </defs>
          {/* Number line */}
          <line
            x1={NL_PAD}
            y1="100"
            x2={NL_W - NL_PAD}
            y2="100"
            stroke={INK}
            strokeWidth="2"
          />
          {[0, 10, 20, 30, 40, 50, 60].map((t) => (
            <g key={t}>
              <line
                x1={xFor(t)}
                y1="95"
                x2={xFor(t)}
                y2="105"
                stroke={INK}
                strokeWidth="1.5"
              />
              <text
                x={xFor(t)}
                y="120"
                textAnchor="middle"
                fill={INK}
                opacity="0.6"
                style={{ fontFamily: "Patrick Hand, cursive", fontSize: 11 }}
              >
                {t}
              </text>
            </g>
          ))}

          {/* Normal points */}
          {BASE_VALUES.map((v, i) => (
            <circle
              key={`v${i}`}
              cx={xFor(v) + (i % 3 - 1) * 2}
              cy={85 - (i % 3) * 6}
              r="6"
              fill="url(#pull-sky)"
              stroke={INK}
              strokeWidth="2"
              style={{ filter: "drop-shadow(1px 1px 0 #2b2a35)" }}
            />
          ))}

          {/* Outlier */}
          {included && (
            <circle
              cx={xFor(outlier)}
              cy={85}
              r="9"
              fill="url(#pull-coral)"
              stroke={INK}
              strokeWidth="2"
              className="pulse-glow"
              style={{ transition: "cx 0.3s ease", color: CORAL, filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)" }}
            />
          )}

          {/* Mean marker */}
          <g style={{ transition: "transform 0.4s ease" }}>
            <line
              x1={xFor(mean)}
              y1="40"
              x2={xFor(mean)}
              y2="100"
              stroke={YELLOW}
              strokeWidth="3"
              strokeDasharray="4 3"
            />
            <polygon
              points={`${xFor(mean) - 7},35 ${xFor(mean) + 7},35 ${xFor(mean)},45`}
              fill={YELLOW}
              stroke={INK}
              strokeWidth="2"
            />
            <text
              x={xFor(mean)}
              y="28"
              textAnchor="middle"
              fill={INK}
              style={{
                fontFamily: "Kalam, cursive",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              avg = {mean.toFixed(1)}
            </text>
          </g>
        </svg>
      </div>

      {/* Outlier slider */}
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
        />
        <p className="font-hand text-xs text-muted-foreground">
          Drag the slider — watch the yellow average arrow get DRAGGED toward
          the outlier.
        </p>
      </div>

      <InfoBox variant="amber">
        See how one weird value can drag the average way off? That's why
        scientists check for outliers BEFORE calculating averages — they can
        completely lie about your data.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Real-world outlier stories                                 */
/* ------------------------------------------------------------------ */

const STORIES = [
  {
    title: "The Lucky Lottery",
    color: YELLOW,
    icon: "🎟️",
    text: "If 1,000 people make $50,000 a year and one person wins $10 million in the lottery, the AVERAGE income jumps to $60,000 — even though nothing changed for 999 of them.",
    lesson: "Outliers can make averages misleading.",
  },
  {
    title: "The Broken Sensor",
    color: CORAL,
    icon: "🌡️",
    text: "A weather station reports temperatures: 22°C, 23°C, 21°C, 22°C, then suddenly 850°C! That last one is a sensor error, not a real temperature.",
    lesson: "Sometimes outliers are mistakes you should remove.",
  },
  {
    title: "The Genius Discovery",
    color: MINT,
    icon: "💡",
    text: "Most stars in a galaxy have similar brightness. But ONE star pulsing in a weird way turned out to be the first known black hole.",
    lesson: "Sometimes outliers are the most exciting find!",
  },
  {
    title: "The Olympic Athlete",
    color: SKY,
    icon: "🏃",
    text: "Most people run 100m in 14-18 seconds. Usain Bolt ran it in 9.58 seconds. He's a real outlier — and he holds the world record.",
    lesson: "Outliers show us the limits of what's possible.",
  },
];

function StoriesTab() {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Outliers aren't always bad. Sometimes they're the most interesting thing!
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {STORIES.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setOpen(i)}
            className="card-sketchy p-4 text-left transition-transform hover:-translate-y-0.5"
            style={{
              background: open === i ? s.color + "33" : PAPER,
              borderColor: open === i ? INK : undefined,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className="font-hand font-bold text-foreground">{s.title}</span>
            </div>
            <p className="font-hand text-sm text-foreground">{s.text}</p>
            {open === i && (
              <p
                className="font-hand text-xs italic mt-2 pt-2 border-t-2 border-dashed border-foreground/30"
                style={{ color: INK }}
              >
                💭 {s.lesson}
              </p>
            )}
          </button>
        ))}
      </div>
      <InfoBox variant="green">
        Before deleting an outlier, ask: "Is this a mistake, or is this the most
        important data point in my whole dataset?"
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
      "An outlier is any value that sits far away from the rest of the data — much higher or much lower than normal.",
  },
  {
    question: "What does an outlier do to the average?",
    options: [
      "Nothing — averages ignore outliers",
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
      "No — sometimes they're the most interesting data!",
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
    []
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
            "Byte: \"That's an outlier — a value that doesn't fit the pattern. Could be a sick student. Could be a wrong entry. Could even be the most important clue in the whole dataset.\"",
            "Aru: \"How do I tell which one?\"",
            "Byte: \"You investigate. Outliers are like loud kids in a quiet classroom — you can't ignore them, but you also shouldn't kick them out without asking why they're making noise.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="An outlier is a data point that lies far away from the rest. It can distort averages and trick analysts — but it can also reveal mistakes, breakthroughs, or rare events. Always investigate outliers before deciding what to do with them."
        />
      }
    />
  );
}
