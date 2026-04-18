"use client";

import { useState, useMemo } from "react";
import { Layers, Scissors, Trophy } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";
import { ScatterPlot } from "../../components/viz/data-viz";
import type { DataPoint } from "../../components/viz/data-viz";
import {
  KNNViz,
  generateClassification2D,
  type Point,
} from "../../components/viz/ml-algorithms";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const LAVENDER = "#b18cf2";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Riku says - local dialogue helper                                  */
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
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared dataset - a mix of two classes, deterministic seed          */
/* ------------------------------------------------------------------ */

const FULL_DATA: Point[] = generateClassification2D(40, 21);

/** Deterministic split: first `trainCount` points = train, rest = test. */
function splitData(data: Point[], trainCount: number): { train: Point[]; test: Point[] } {
  return {
    train: data.slice(0, trainCount),
    test: data.slice(trainCount),
  };
}

/* ------------------------------------------------------------------ */
/*  Tab 1 – Why Split? (ScatterPlot showing train/test categories)    */
/* ------------------------------------------------------------------ */

function SplitTab() {
  const [trainPct, setTrainPct] = useState(80);
  const total = FULL_DATA.length;
  const trainCount = Math.round((trainPct / 100) * total);
  const testCount = total - trainCount;

  const scatterData: DataPoint[] = useMemo(() => {
    return FULL_DATA.map((p, i) => ({
      x: p.x,
      y: p.y,
      category: i < trainCount ? "train" : "test",
      label: i < trainCount ? "train" : "test",
    }));
  }, [trainCount]);

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Before we let a model learn, we hide some examples in a{" "}
        <span style={{ color: CORAL, fontWeight: 700 }}>secret pile</span> - so later we can check if it really learned, or just memorized.
      </p>

      <RikuSays>
        Training data = practice problems. Test data = the actual exam. Don&apos;t mix them up!
      </RikuSays>

      <div className="card-sketchy notebook-grid" style={{ background: PAPER }}>
        <ScatterPlot
          data={scatterData}
          categoryColors={{ train: MINT, test: CORAL }}
          width={540}
          height={320}
          title={`${trainPct}% train · ${100 - trainPct}% test`}
          xLabel="feature 1"
          yLabel="feature 2"
          pointRadius={7}
        />

        <label
          className="font-hand font-bold text-sm flex justify-between mt-3 mb-1"
          style={{ color: INK }}
        >
          <span>Training data %</span>
          <span style={{ color: MINT }}>
            {trainCount} train · {testCount} test
          </span>
        </label>
        <input
          type="range"
          min={50}
          max={95}
          step={5}
          value={trainPct}
          onChange={(e) => {
            playClick();
            setTrainPct(parseInt(e.target.value));
          }}
          className="w-full accent-[#4ecdc4]"
        />

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div
            className="card-sketchy text-center"
            style={{ background: "#e6fff8", padding: 12 }}
          >
            <div className="font-hand text-xs font-bold" style={{ color: INK, opacity: 0.6 }}>
              TRAINING PILE
            </div>
            <div
              className="font-hand text-3xl font-bold marker-highlight-yellow"
              style={{ color: MINT }}
            >
              {trainCount}
            </div>
            <div className="font-hand text-xs mt-2" style={{ color: INK }}>
              model practices on these
            </div>
          </div>

          <div
            className="card-sketchy text-center"
            style={{ background: "#fff0ed", padding: 12 }}
          >
            <div className="font-hand text-xs font-bold" style={{ color: INK, opacity: 0.6 }}>
              TEST PILE (locked)
            </div>
            <div
              className="font-hand text-3xl font-bold marker-highlight-yellow"
              style={{ color: CORAL }}
            >
              {testCount}
            </div>
            <div className="font-hand text-xs mt-2" style={{ color: INK }}>
              model never sees these
            </div>
          </div>
        </div>
      </div>

      <InfoBox variant="blue">
        Most ML projects use about <b>80% train, 20% test</b>. Too little training → model learns nothing. Too little test → you can&apos;t trust the score.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Memorize vs Learn (live KNN trained on TRAIN only)        */
/* ------------------------------------------------------------------ */

function MemorizeTab() {
  const [phase, setPhase] = useState<"intro" | "trained" | "tested">("intro");
  const [trainPct, setTrainPct] = useState(75);
  const trainCount = Math.round((trainPct / 100) * FULL_DATA.length);
  const { train, test } = useMemo(
    () => splitData(FULL_DATA, trainCount),
    [trainCount],
  );

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Imagine two students. One{" "}
        <span style={{ color: CORAL, fontWeight: 700 }}>memorizes</span> the answers, the other{" "}
        <span style={{ color: MINT, fontWeight: 700 }}>learns the rule</span>. Only a surprise test reveals who actually learned.
      </p>

      <RikuSays>
        Computers don&apos;t learn by magic. They learn by &ldquo;try, fail, adjust, try again&rdquo; - just faster. But we only trust them when they pass a test they&apos;ve never seen before.
      </RikuSays>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card-sketchy" style={{ background: "#fff0ed" }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 28 }}>🦜</span>
            <h3 className="font-hand font-bold" style={{ color: INK }}>The Memorizer</h3>
          </div>
          <p className="font-hand text-xs" style={{ color: INK, opacity: 0.75 }}>
            Just memorizes the training points like a parrot. Perfect on seen data, helpless on new.
          </p>
        </div>
        <div className="card-sketchy" style={{ background: "#e6fff8" }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 28 }}>🧠</span>
            <h3 className="font-hand font-bold" style={{ color: INK }}>The Learner (KNN)</h3>
          </div>
          <p className="font-hand text-xs" style={{ color: INK, opacity: 0.75 }}>
            Trained on the train pile only. Click anywhere to drop a test point and watch it classify.
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => { playPop(); setPhase("trained"); }}
          className="btn-sketchy font-hand"
          style={{ background: MINT }}
        >
          1. Train on {train.length} points
        </button>
        <button
          onClick={() => { playPop(); setPhase("tested"); }}
          disabled={phase === "intro"}
          className="btn-sketchy font-hand"
          style={{ background: CORAL, opacity: phase === "intro" ? 0.4 : 1 }}
        >
          2. Test on {test.length} unseen
        </button>
      </div>

      <div className="card-sketchy p-3" style={{ background: PAPER }}>
        <label
          className="font-hand font-bold text-sm flex justify-between mb-1"
          style={{ color: INK }}
        >
          <span>Train / test split</span>
          <span style={{ color: LAVENDER }}>
            {train.length} train · {test.length} test
          </span>
        </label>
        <input
          type="range"
          min={50}
          max={90}
          step={5}
          value={trainPct}
          onChange={(e) => setTrainPct(parseInt(e.target.value))}
          className="w-full accent-[#b18cf2]"
        />
      </div>

      {phase !== "intro" && (
        <div className="card-sketchy" style={{ background: PAPER }}>
          <h4 className="font-hand font-bold mb-2 text-sm" style={{ color: INK }}>
            {phase === "trained"
              ? "KNN trained on training data only"
              : "Click on the plot to test the model on new points"}
          </h4>
          {/* Key forces a remount when the split changes so KNN refits */}
          <KNNViz key={`knn-${trainPct}`} points={train} initialK={3} />
          <p
            className="font-hand text-xs mt-2 text-center"
            style={{ color: INK, opacity: 0.75 }}
          >
            The model only saw <b>{train.length}</b> points during training. Try dropping a test point near a boundary - that&apos;s where memorizing falls apart but learning still works.
          </p>
        </div>
      )}

      <InfoBox variant="amber">
        This is the whole point of a test set! On training data a memorizer looks perfect - but only the test reveals who actually learned. ML calls this <b>generalization</b>.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Accuracy (ScatterPlot of test hits/misses)                 */
/* ------------------------------------------------------------------ */

function AccuracyTab() {
  const [correct, setCorrect] = useState(7);
  const total = 10;
  const pct = (correct / total) * 100;
  const grade = pct >= 90 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Okay" : "Needs work";
  const gradeColor = pct >= 90 ? MINT : pct >= 70 ? "#6bb6ff" : pct >= 50 ? "#ffd93d" : CORAL;

  // Build a deterministic 10-point test set where the first `correct` are hits.
  const accData: DataPoint[] = useMemo(() => {
    const pts: DataPoint[] = [];
    for (let i = 0; i < total; i++) {
      const angle = (i / total) * Math.PI * 2;
      pts.push({
        x: 50 + Math.cos(angle) * 30,
        y: 50 + Math.sin(angle) * 30,
        category: i < correct ? "correct" : "wrong",
        label: i < correct ? "hit" : "miss",
      });
    }
    return pts;
  }, [correct]);

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        After testing, count how many predictions were right.{" "}
        <span style={{ color: CORAL, fontWeight: 700 }}>Accuracy</span> = correct ÷ total.
      </p>

      <RikuSays>
        Accuracy is the simplest honest number in ML. 8 out of 10 right? That&apos;s 80%. No tricks, no spin.
      </RikuSays>

      <div className="card-sketchy" style={{ background: PAPER }}>
        <ScatterPlot
          data={accData}
          categoryColors={{ correct: MINT, wrong: CORAL }}
          width={460}
          height={300}
          title="Test predictions: green = correct, red = wrong"
          pointRadius={9}
        />

        <div className="text-center mt-3">
          <div
            className="font-hand text-5xl font-bold"
            style={{ color: gradeColor, filter: "drop-shadow(2px 2px 0 #2b2a35)" }}
          >
            {pct.toFixed(0)}%
          </div>
          <div className="font-hand text-base" style={{ color: INK }}>
            {grade}
          </div>
        </div>

        <div className="mt-4">
          <label
            className="font-hand text-sm font-bold flex justify-between"
            style={{ color: INK }}
          >
            <span>Correct predictions</span>
            <span style={{ color: CORAL }}>
              {correct} / {total}
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={total}
            value={correct}
            onChange={(e) => setCorrect(parseInt(e.target.value))}
            className="w-full mt-1 accent-[#ff6b6b]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 font-hand text-xs">
        <div className="card-sketchy text-center p-2" style={{ background: "#e6fff8" }}>
          90%+ → ML model ready to ship 🚀
        </div>
        <div className="card-sketchy text-center p-2" style={{ background: "#ffe8e8" }}>
          &lt;50% → worse than flipping a coin 🪙
        </div>
      </div>

      <InfoBox variant="green">
        Accuracy is the simplest score, but it&apos;s not the only one. Later you&apos;ll meet <b>precision</b>, <b>recall</b>, and <b>F1</b> - different ways to measure what &ldquo;good&rdquo; means.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "Why do we split data into training and test sets?",
    options: [
      "To make training faster",
      "To check if the model truly learned, not just memorized",
      "Because computers prefer two piles",
      "To save space",
    ],
    correctIndex: 1,
    explanation:
      "The test set is locked away during training. If the model does well on data it never saw, we know it really learned the pattern.",
  },
  {
    question: "What is the most common train/test split?",
    options: ["50/50", "80/20", "10/90", "100/0"],
    correctIndex: 1,
    explanation:
      "About 80% for training and 20% for testing is the classic recipe - enough to learn from, enough to honestly test.",
  },
  {
    question: "A model gets 100% on training but 30% on test. What's wrong?",
    options: [
      "Nothing - it's perfect",
      "It memorized instead of learning",
      "The test set is broken",
      "It's too small",
    ],
    correctIndex: 1,
    explanation:
      "This is called overfitting - the model memorized the training answers but never found the real pattern. Always trust the TEST score.",
  },
  {
    question: "If a model gets 8 out of 10 right, what's its accuracy?",
    options: ["8%", "20%", "80%", "100%"],
    correctIndex: 2,
    explanation: "Accuracy = correct ÷ total = 8 ÷ 10 = 0.80 = 80%.",
  },
];

export default function L3c_TrainTestActivity() {
  const tabs = useMemo(
    () => [
      { id: "split", label: "The Split", icon: <Scissors className="w-4 h-4" />, content: <SplitTab /> },
      { id: "memorize", label: "Memorize vs Learn", icon: <Layers className="w-4 h-4" />, content: <MemorizeTab /> },
      { id: "accuracy", label: "Accuracy Meter", icon: <Trophy className="w-4 h-4" />, content: <AccuracyTab /> },
    ],
    [],
  );

  return (
    <LessonShell
      title="Train & Test: The Honesty Trick"
      level={3}
      lessonNumber={6}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You know how to score a model honestly. Time to dive into actual ML algorithms in Level 4!"
      story={
        <StorySection
          paragraphs={[
            "Aru: \"Byte, I taught my little robot every math question in the book. It got 100% on the exam!\"",
            "Byte: \"Wait - were the exam questions the SAME ones from the book?\"",
            "Aru: \"Yes...?\"",
            "Byte: \"Then your robot didn't learn math. It just memorized the answers. Quick - give it a brand new question it's never seen.\"",
            "Aru tried. The robot froze. It didn't know what to do.",
            "Byte: \"That's why ML always hides some examples in a TEST PILE. We never let the model see them while it's learning. Then we use them as a surprise quiz to see if it really learned.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Always split your data into TRAIN (the model practices on this) and TEST (locked away - used only at the end to check if the model truly learned). Score on the test set is the only honest measure of how well a model will work on new data in the real world."
        />
      }
    />
  );
}
