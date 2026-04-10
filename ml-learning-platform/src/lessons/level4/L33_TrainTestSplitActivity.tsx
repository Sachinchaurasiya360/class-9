"use client";

import { useState, useMemo } from "react";
import { Split, BookOpen, TestTube, Trophy } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const SKY = "#6bb6ff";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Tab 1 – The Cheating Student (story)                              */
/* ------------------------------------------------------------------ */

function CheatingTab() {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Meet Sam",
      icon: "🧑",
      text: "Sam is studying for a math test. His teacher gives him 10 practice problems WITH answers.",
      detail: "Sam memorizes all 10 questions and their answers perfectly.",
      color: SKY,
    },
    {
      title: "Test day!",
      icon: "📝",
      text: "The real test has the SAME 10 questions Sam practiced.",
      detail: "Sam scores 100%! 🎉 But did he actually learn math?",
      color: MINT,
    },
    {
      title: "The catch",
      icon: "😱",
      text: "Next week, Sam gets a NEW set of math problems he hasn't seen.",
      detail: "He fails. He didn't learn math — he memorized 10 specific questions.",
      color: CORAL,
    },
    {
      title: "The fix",
      icon: "💡",
      text: "What if Sam practiced on 8 problems and was tested on 2 NEW ones?",
      detail: "Then his score would show whether he REALLY understood, not just memorized.",
      color: YELLOW,
    },
  ];
  const s = steps[step];

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Why we don't test models on the same data we trained them on.
      </p>

      <div
        className="card-sketchy p-5 space-y-3"
        style={{ background: s.color + "33", animation: "fadeInSlide 0.4s ease-out", minHeight: 220 }}
        key={step}
      >
        <div className="flex items-center gap-3">
          <div
            className="text-3xl rounded-full border-2 border-foreground flex items-center justify-center shrink-0"
            style={{ background: s.color, width: 56, height: 56 }}
          >
            {s.icon}
          </div>
          <div>
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
              Step {step + 1} of {steps.length}
            </p>
            <h3 className="font-hand text-2xl font-bold text-foreground">{s.title}</h3>
          </div>
        </div>
        <p className="font-hand text-base text-foreground">{s.text}</p>
        <p className="font-hand text-sm italic text-foreground/80">{s.detail}</p>
      </div>

      <div className="flex justify-between gap-2">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-sketchy-outline font-hand text-sm"
          style={{ opacity: step === 0 ? 0.5 : 1 }}
        >
          ← Back
        </button>
        <span className="font-hand text-sm font-bold self-center text-muted-foreground">
          {step + 1} / {steps.length}
        </span>
        <button
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          className="btn-sketchy font-hand text-sm"
          style={{
            background: YELLOW,
            opacity: step === steps.length - 1 ? 0.5 : 1,
          }}
        >
          Next →
        </button>
      </div>

      <InfoBox variant="amber">
        Same idea applies to ML models! If you test a model on the same data it
        learned from, you can't tell if it really learned the pattern — or just
        memorized.
      </InfoBox>

      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Interactive Splitter                                       */
/* ------------------------------------------------------------------ */

// 20 fake data points, deterministic positions
const DATA_POINTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: 30 + ((i * 53) % 340),
  y: 30 + ((i * 31) % 130),
}));

function SplitterTab() {
  const [trainPct, setTrainPct] = useState(80);
  const trainCount = Math.round((trainPct / 100) * DATA_POINTS.length);

  // Quality estimates (illustrative, not real ML math)
  const trainTooSmall = trainPct < 50;
  const testTooSmall = trainPct > 90;
  const justRight = trainPct >= 60 && trainPct <= 85;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Drag the slider to split your dataset. Watch what happens!
      </p>

      {/* Animated split SVG: dataset → flow → train/test bins */}
      <div className="card-sketchy notebook-grid p-4">
        <svg viewBox="0 0 560 240" className="w-full max-w-[600px] mx-auto">
          <defs>
            <radialGradient id="ds-pool" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ffe066" />
              <stop offset="100%" stopColor={YELLOW} />
            </radialGradient>
            <radialGradient id="ds-train" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#7ee0d8" />
              <stop offset="100%" stopColor={MINT} />
            </radialGradient>
            <radialGradient id="ds-test" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ff8a8a" />
              <stop offset="100%" stopColor={CORAL} />
            </radialGradient>
            <marker id="ds-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
              <path d="M0,0 L10,4 L0,8 Z" fill={INK} />
            </marker>
          </defs>

          {/* Source pool */}
          <circle cx={80} cy={120} r={56} fill="url(#ds-pool)" stroke={INK} strokeWidth={2.5}
            className="pulse-glow" style={{ color: YELLOW }} />
          <circle cx={80} cy={120} r={56} fill="none" stroke={INK} strokeWidth={2}
            strokeDasharray="3 4" className="wobble" opacity={0.6} />
          <text x={80} y={117} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">
            Dataset
          </text>
          <text x={80} y={133} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">
            {DATA_POINTS.length}
          </text>

          {/* Flow lines */}
          <line x1={140} y1={100} x2={360} y2={60}
            stroke={MINT} strokeWidth={3} strokeLinecap="round"
            className="signal-flow" style={{ color: MINT }}
            markerEnd="url(#ds-arrow)" />
          <line x1={140} y1={140} x2={360} y2={180}
            stroke={CORAL} strokeWidth={3} strokeLinecap="round"
            className="signal-flow" style={{ color: CORAL }}
            markerEnd="url(#ds-arrow)" />

          {/* Traveling pulse dots */}
          <circle r={4} fill={MINT} stroke={INK} strokeWidth={1}>
            <animateMotion dur="1.4s" repeatCount="indefinite" path="M140,100 L360,60" />
          </circle>
          <circle r={4} fill={CORAL} stroke={INK} strokeWidth={1}>
            <animateMotion dur="1.6s" repeatCount="indefinite" path="M140,140 L360,180" />
          </circle>

          {/* Train bin */}
          <rect x={370} y={20} width={170} height={80} rx={14}
            fill="url(#ds-train)" stroke={INK} strokeWidth={2.5}
            className="pulse-glow" style={{ color: MINT }} />
          <text x={455} y={48} textAnchor="middle" fill="#fff" fontFamily="Kalam" className="text-[13px] font-bold">
            Training {trainPct}%
          </text>
          <text x={455} y={68} textAnchor="middle" fill="#fff" fontFamily="Kalam" className="text-[12px] font-bold">
            {trainCount} examples
          </text>
          {/* dot grid */}
          {DATA_POINTS.slice(0, trainCount).map((_, i) => (
            <circle key={`tr-${i}`}
              cx={385 + (i % 10) * 16} cy={88}
              r={3.5} fill="#fff" stroke={INK} strokeWidth={1} />
          ))}

          {/* Test bin */}
          <rect x={370} y={140} width={170} height={80} rx={14}
            fill="url(#ds-test)" stroke={INK} strokeWidth={2.5}
            className="pulse-glow" style={{ color: CORAL }} />
          <text x={455} y={168} textAnchor="middle" fill="#fff" fontFamily="Kalam" className="text-[13px] font-bold">
            Test {100 - trainPct}%
          </text>
          <text x={455} y={188} textAnchor="middle" fill="#fff" fontFamily="Kalam" className="text-[12px] font-bold">
            {DATA_POINTS.length - trainCount} examples
          </text>
          {DATA_POINTS.slice(trainCount).map((_, i) => (
            <circle key={`te-${i}`}
              cx={385 + (i % 10) * 16} cy={208}
              r={3.5} fill="#fff" stroke={INK} strokeWidth={1} />
          ))}

          {/* Branch labels */}
          <text x={250} y={75} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">
            <tspan>train</tspan>
          </text>
          <text x={250} y={175} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">
            <tspan>test</tspan>
          </text>
        </svg>
      </div>

      {/* Slider */}
      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        <p className="font-hand text-sm font-bold text-foreground">
          Train / test split: {trainPct}% / {100 - trainPct}%
        </p>
        <input
          type="range"
          min={10}
          max={95}
          step={5}
          value={trainPct}
          onChange={(e) => setTrainPct(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between font-hand text-[11px] text-muted-foreground">
          <span>10/90</span>
          <span>50/50</span>
          <span>80/20</span>
          <span>95/5</span>
        </div>
      </div>

      {/* Quality feedback */}
      <div
        className="card-sketchy p-4 space-y-1"
        style={{
          background: justRight
            ? "#e8fff5"
            : trainTooSmall
              ? "#ffe8e8"
              : "#fff8e7",
        }}
      >
        <p className="font-hand text-base font-bold text-foreground">
          {trainTooSmall && "⚠️ Too little training data!"}
          {testTooSmall && "⚠️ Too little test data!"}
          {justRight && "✓ Perfect split!"}
        </p>
        <p className="font-hand text-sm text-foreground">
          {trainTooSmall &&
            "Your model won't see enough examples to learn the pattern. It'll be a bad student."}
          {testTooSmall &&
            "You can't tell how good your model REALLY is with only a tiny test set. The grade is unreliable."}
          {justRight &&
            "Most ML projects use 70/30 or 80/20 splits. Enough to learn, enough to grade fairly."}
        </p>
      </div>

      <InfoBox variant="blue">
        The classic split is <b>80% train, 20% test</b>. Big enough to learn
        from, big enough to grade honestly.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Find the data leak game                                    */
/* ------------------------------------------------------------------ */

const LEAKS = [
  {
    scenario: "You train a face recognition model on photos of 100 people. You test it on the SAME 100 photos.",
    correct: true,
    why: "DATA LEAK! The model has already seen those photos. Of course it'll get them right. You learned nothing about how it handles new faces.",
  },
  {
    scenario: "You train on 80 photos and test on 20 totally different photos of new people.",
    correct: false,
    why: "Clean split! The test data is brand new. Whatever score you get is honest.",
  },
  {
    scenario: "You train a movie recommender on Aru's viewing history, then test it by predicting what Aru liked yesterday — a movie that was already in the training data.",
    correct: true,
    why: "DATA LEAK! Yesterday's movie was in the training set, so the model already 'knows' the answer. Cheating.",
  },
  {
    scenario: "You collect 1,000 test scores. You shuffle them, train on the first 800, test on the last 200.",
    correct: false,
    why: "Clean split! Shuffling first ensures both sets are similar in mix, then they don't overlap.",
  },
];

function LeakTab() {
  const [picks, setPicks] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        For each scenario, decide: <b>data leak</b> or <b>clean split</b>?
      </p>

      <div className="space-y-3">
        {LEAKS.map((l, i) => {
          const picked = picks[i];
          const isAnswered = picked !== undefined;
          const isCorrect = picked === l.correct;
          return (
            <div
              key={i}
              className="card-sketchy p-4"
              style={{
                background: !isAnswered
                  ? PAPER
                  : isCorrect
                    ? "#e8fff5"
                    : "#ffe8e8",
              }}
            >
              <p className="font-hand text-sm text-foreground mb-3">
                {i + 1}. {l.scenario}
              </p>
              {!isAnswered ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setPicks({ ...picks, [i]: true })}
                    className="flex-1 btn-sketchy-outline font-hand text-xs"
                    style={{ background: CORAL + "22" }}
                  >
                    🚨 Data Leak
                  </button>
                  <button
                    onClick={() => setPicks({ ...picks, [i]: false })}
                    className="flex-1 btn-sketchy-outline font-hand text-xs"
                    style={{ background: MINT + "22" }}
                  >
                    ✓ Clean Split
                  </button>
                </div>
              ) : (
                <p className="font-hand text-sm text-foreground">
                  <b>{isCorrect ? "Correct!" : "Not quite."}</b> {l.why}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(picks).length === LEAKS.length && (
        <div
          className="card-sketchy p-4 text-center"
          style={{ background: YELLOW + "33" }}
        >
          <Trophy className="w-8 h-8 mx-auto text-foreground" />
          <p className="font-hand text-lg font-bold text-foreground mt-1">
            {Object.entries(picks).filter(
              ([i, v]) => v === LEAKS[Number(i)].correct
            ).length}{" "}
            / {LEAKS.length} correct
          </p>
          <button
            onClick={() => setPicks({})}
            className="btn-sketchy font-hand text-sm mt-2"
            style={{ background: YELLOW }}
          >
            Try again
          </button>
        </div>
      )}

      <InfoBox variant="green">
        A "data leak" is when test data sneaks into training. It's like letting a
        student peek at the test answers. The score becomes meaningless.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "Why do we split data into training and test sets?",
    options: [
      "To make the computer work harder",
      "To check if the model REALLY learned, not just memorized",
      "Because data is too big to use all at once",
      "To make the dataset smaller",
    ],
    correctIndex: 1,
    explanation:
      "Testing on data the model has never seen is the only honest way to know if it actually learned the pattern.",
  },
  {
    question: "What's a common train/test split?",
    options: ["50/50", "80/20", "99/1", "10/90"],
    correctIndex: 1,
    explanation:
      "80/20 is the classic split — enough data to learn from, enough to grade fairly.",
  },
  {
    question: "What is a 'data leak'?",
    options: [
      "When the database breaks",
      "When test data accidentally appears in the training set",
      "When you lose your data",
      "When the model is too big",
    ],
    correctIndex: 1,
    explanation:
      "Data leaks make models look better than they are because they've already 'seen' the test answers.",
  },
  {
    question: "If a model scores 100% on training data but 50% on test data, what's happening?",
    options: [
      "The model is amazing",
      "The test set is wrong",
      "The model memorized the training data instead of learning the pattern",
      "Computers are broken",
    ],
    correctIndex: 2,
    explanation:
      "This is called overfitting — perfect on data it's seen, bad on new data. A classic warning sign.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function L33_TrainTestSplitActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "story",
        label: "The Cheating Student",
        icon: <BookOpen className="w-4 h-4" />,
        content: <CheatingTab />,
      },
      {
        id: "splitter",
        label: "Try the Splitter",
        icon: <Split className="w-4 h-4" />,
        content: <SplitterTab />,
      },
      {
        id: "leak",
        label: "Spot the Leak",
        icon: <TestTube className="w-4 h-4" />,
        content: <LeakTab />,
      },
    ],
    []
  );

  return (
    <LessonShell
      title="Train vs Test: The Honest Grade"
      level={4}
      lessonNumber={5}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You can split data fairly. Next: how do we describe what a model gets RIGHT and WRONG in detail?"
      story={
        <StorySection
          paragraphs={[
            "Aru built her first ML model to predict whether students would pass a quiz. She used 50 students' data to train it, then tested on the SAME 50 students. The model got 100% right!",
            "Aru: \"Byte! I made the perfect model!\"",
            "Byte: \"Hmm. Did you test it on students it had never seen?\"",
            "Aru: \"...no?\"",
            "Byte: \"Then you didn't really test it. You just asked the model questions it had already memorized the answers to. That's not learning. That's cheating on the homework.\"",
            "Aru: \"So how do I know if my model REALLY learned?\"",
            "Byte: \"You hide some data. Train on most of it, then quiz the model on the hidden part. THAT'S the honest grade.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="To honestly judge a model, we split our data into TWO parts: a TRAINING set (where the model learns the pattern) and a TEST set (which the model has never seen, used for grading). Without this split, you can't tell if your model truly learned or just memorized."
        />
      }
    />
  );
}
