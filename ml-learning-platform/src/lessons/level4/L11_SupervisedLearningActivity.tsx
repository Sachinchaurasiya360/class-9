"use client";

import { useState, useMemo, useCallback } from "react";
import { Tag, SplitSquareHorizontal, Eye, RotateCcw } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

const INK = "#2b2a35";
/* ------------------------------------------------------------------ */
/*  Seeded PRNG                                                        */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ShapeItem {
  id: number;
  shape: "circle" | "triangle" | "square";
  color: string;
  correctLabel: string;
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Label the Data                                             */
/* ------------------------------------------------------------------ */

const LABELS = ["Cat", "Dog", "Bird"];
const LABEL_COLORS: Record<string, string> = { Cat: "#ec4899", Dog: "#3b82f6", Bird: "#22c55e" };

function LabelTheData() {
  const items = useMemo<ShapeItem[]>(() => {
    const rng = mulberry32(42);
    const shapes: Array<"circle" | "triangle" | "square"> = ["circle", "triangle", "square"];
    const colors = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f472b6", "#38bdf8", "#fb923c", "#4ade80"];
    const labelMap: Record<string, string> = { circle: "Cat", triangle: "Bird", square: "Dog" };
    const result: ShapeItem[] = [];
    for (let i = 0; i < 9; i++) {
      const si = Math.floor(rng() * 3);
      const ci = Math.floor(rng() * colors.length);
      result.push({ id: i, shape: shapes[si], color: colors[ci], correctLabel: labelMap[shapes[si]] });
    }
    return result;
  }, []);

  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const labeled = Object.keys(assignments).length;
  const progress = (labeled / items.length) * 100;

  const handleAssign = useCallback(
    (id: number) => {
      if (!selectedLabel) return;
      playPop();
      setAssignments((prev) => ({ ...prev, [id]: selectedLabel }));
    },
    [selectedLabel],
  );

  const handleCheck = useCallback(() => {
    playClick();
    const correct = items.every((it) => assignments[it.id] === it.correctLabel);
    if (correct) playSuccess();
    else playError();
    setShowResult(true);
  }, [items, assignments]);

  const reset = useCallback(() => {
    playClick();
    setAssignments({});
    setShowResult(false);
    setSelectedLabel(null);
  }, []);

  const renderShape = (item: ShapeItem, size: number) => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.35;
    if (item.shape === "circle")
      return <circle cx={cx} cy={cy} r={r} fill={item.color} stroke="#334155" strokeWidth={1.5} />;
    if (item.shape === "triangle") {
      const pts = `${cx},${cy - r} ${cx - r},${cy + r * 0.7} ${cx + r},${cy + r * 0.7}`;
      return <polygon points={pts} fill={item.color} stroke="#334155" strokeWidth={1.5} />;
    }
    const half = r * 0.85;
    return (
      <rect x={cx - half} y={cy - half} width={half * 2} height={half * 2} fill={item.color} stroke="#334155" strokeWidth={1.5} rx={3} />
    );
  };

  return (
    <div className="space-y-5">
      {/* Hero: labeled examples flow into a model node */}
      <div className="card-sketchy notebook-grid p-4">
        <svg viewBox="0 0 560 200" className="w-full max-w-[600px] mx-auto">
          <defs>
            <radialGradient id="l11-model" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#c9adf7" />
              <stop offset="100%" stopColor="#b18cf2" />
            </radialGradient>
            <marker id="l11-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
              <path d="M0,0 L10,4 L0,8 Z" fill={INK} />
            </marker>
          </defs>

          {/* Three labeled examples */}
          {[
            { y: 40, label: "Cat", color: "#ff6b6b" },
            { y: 100, label: "Dog", color: "#6bb6ff" },
            { y: 160, label: "Bird", color: "#4ecdc4" },
          ].map((ex, i) => (
            <g key={i}>
              <rect x={30} y={ex.y - 22} width={120} height={44} rx={10}
                fill={ex.color} stroke={INK} strokeWidth={2.5}
                className="pulse-glow"
                style={{ color: ex.color, animationDelay: `${i * 0.3}s` }} />
              <text x={90} y={ex.y + 5} textAnchor="middle" fill="#fff" fontFamily="Kalam" className="text-[14px] font-bold">
                {ex.label}
              </text>
              <line x1={150} y1={ex.y} x2={360} y2={100}
                stroke={ex.color} strokeWidth={2.5} strokeLinecap="round"
                className="signal-flow"
                style={{ color: ex.color }}
                markerEnd="url(#l11-arrow)" />
              <circle r={4} fill="#ffd93d" stroke={INK} strokeWidth={1}>
                <animateMotion dur="1.6s" repeatCount="indefinite"
                  path={`M150,${ex.y} L360,100`} />
              </circle>
            </g>
          ))}

          {/* Model node */}
          <circle cx={420} cy={100} r={50} fill="url(#l11-model)" stroke={INK} strokeWidth={2.5}
            className="pulse-glow" style={{ color: "#b18cf2" }} />
          <circle cx={420} cy={100} r={50} fill="none" stroke="#b18cf2" strokeWidth={2}
            strokeDasharray="3 4" className="wobble" opacity={0.6} />
          <text x={420} y={97} textAnchor="middle" fill="#fff" fontFamily="Kalam" className="text-[14px] font-bold">Model</text>
          <text x={420} y={114} textAnchor="middle" fill="#fff" fontFamily="Kalam" className="text-[10px]">learning</text>
        </svg>
        <p className="font-hand text-center text-xs text-muted-foreground mt-1">Labeled examples flow in → the model learns the pattern.</p>
      </div>

      <div className="card-sketchy p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">Click a label, then click shapes to assign it</h3>

        {/* Label palette */}
        <div className="flex justify-center gap-3">
          {LABELS.map((l) => (
            <button
              key={l}
              onClick={() => { playClick(); setSelectedLabel(l); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                selectedLabel === l
                  ? "border-slate-800 shadow-md scale-105"
                  : "border-slate-200 hover:border-slate-400"
              }`}
              style={{ backgroundColor: LABEL_COLORS[l] + "30", color: LABEL_COLORS[l] }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-center text-slate-500">
          {labeled}/{items.length} labeled {labeled === items.length && "  Dataset ready!"}
        </p>

        {/* Grid of shapes */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleAssign(item.id)}
              className={`relative border-2 rounded-xl p-1 transition-all hover:shadow-md ${
                assignments[item.id] ? "border-green-400 bg-green-50" : "border-slate-200 bg-white"
              }`}
            >
              <svg viewBox="0 0 60 60" className="w-full">
                {renderShape(item, 60)}
              </svg>
              {assignments[item.id] && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: LABEL_COLORS[assignments[item.id]] + "30", color: LABEL_COLORS[assignments[item.id]] }}
                >
                  {assignments[item.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          {labeled === items.length && !showResult && (
            <button onClick={handleCheck} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
              Check Labels
            </button>
          )}
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {showResult && (
          <div className={`text-center text-sm font-semibold p-3 rounded-lg ${
            items.every((it) => assignments[it.id] === it.correctLabel)
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {items.every((it) => assignments[it.id] === it.correctLabel)
              ? "Perfect! All labels are correct  your dataset is ready for training!"
              : `Some labels are wrong. Hint: circles = Cat, triangles = Bird, squares = Dog. Try again!`}
          </div>
        )}
      </div>

      <InfoBox variant="blue" title="What is Labeling?">
        In supervised learning, every data point needs a <strong>label</strong>  the correct answer. Humans label thousands of examples so the computer can learn from them. This labeled collection is called a <strong>training dataset</strong>.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Train vs Test Split                                        */
/* ------------------------------------------------------------------ */

function TrainTestSplit() {
  const dots = useMemo(() => {
    const rng = mulberry32(77);
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: rng() * 420 + 40,
      y: rng() * 180 + 30,
      color: rng() > 0.5 ? "#3b82f6" : "#ef4444",
    }));
  }, []);

  const [splitPct, setSplitPct] = useState(70);

  const trainCount = Math.round((splitPct / 100) * dots.length);

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">Drag the slider to choose how much data to use for training vs testing</h3>

        {/* Slider */}
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <span className="font-hand text-xs font-bold text-foreground w-24 text-right">Train {splitPct}%</span>
          <input
            type="range"
            min={40}
            max={90}
            step={10}
            value={splitPct}
            onChange={(e) => { playClick(); setSplitPct(Number(e.target.value)); }}
            className="flex-1 accent-accent-coral"
          />
          <span className="font-hand text-xs font-bold text-foreground w-24">Test {100 - splitPct}%</span>
        </div>

        {/* SVG visualization */}
        <svg viewBox="0 0 500 260" className="w-full max-w-[560px] mx-auto">
          <defs>
            <radialGradient id="ttbin-train" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#7ee0d8" />
              <stop offset="100%" stopColor="#4ecdc4" />
            </radialGradient>
            <radialGradient id="ttbin-test" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ffd0b3" />
              <stop offset="100%" stopColor="#ffb88c" />
            </radialGradient>
          </defs>

          {/* Train bin */}
          <rect x={20} y={10} width={460 * splitPct / 100 - 8} height={230} rx={14}
            fill="url(#ttbin-train)" opacity={0.35} stroke={INK} strokeWidth={2.5} />
          {/* Test bin */}
          <rect x={20 + 460 * splitPct / 100 + 8} y={10} width={460 * (100 - splitPct) / 100 - 8} height={230} rx={14}
            fill="url(#ttbin-test)" opacity={0.35} stroke={INK} strokeWidth={2.5} />

          {/* Zone labels */}
          <text x={20 + (460 * splitPct / 100) / 2} y={258} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">
            Training ({trainCount})
          </text>
          <text x={20 + 460 * splitPct / 100 + (460 * (100 - splitPct) / 100) / 2} y={258} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">
            Testing ({dots.length - trainCount})
          </text>

          {/* Dots with signal-flow stroke */}
          {dots.map((d, i) => {
            const isTrain = i < trainCount;
            const fill = isTrain ? "#4ecdc4" : "#ffb88c";
            return (
              <g key={d.id}>
                <circle
                  cx={d.x} cy={d.y} r={9}
                  fill={fill}
                  stroke={INK} strokeWidth={2}
                  className="pulse-glow"
                  style={{ color: fill, animationDelay: `${i * 0.05}s` }}
                />
              </g>
            );
          })}
          {/* signal-flow divider */}
          <line
            x1={20 + 460 * splitPct / 100} y1={10}
            x2={20 + 460 * splitPct / 100} y2={240}
            stroke={INK} strokeWidth={2.5}
            className="signal-flow"
          />
        </svg>

        {/* Stats */}
        <div className="flex justify-center gap-6 font-hand text-xs text-foreground">
          <span>Training samples: <span className="font-bold" style={{ color: "#4ecdc4" }}>{trainCount}</span></span>
          <span>Testing samples: <span className="font-bold" style={{ color: "#ffb88c" }}>{dots.length - trainCount}</span></span>
        </div>
      </div>

      <InfoBox variant="amber" title="Why Split the Data?">
        We split data into <strong>training</strong> (to learn patterns) and <strong>testing</strong> (to check if the model works on new data). If we tested on the same data we trained on, the model might just memorize the answers instead of truly learning!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Supervised vs Unsupervised                                 */
/* ------------------------------------------------------------------ */

function SupervisedVsUnsupervised() {
  const dots = useMemo(() => {
    const rng = mulberry32(99);
    const groups = [
      { cx: 120, cy: 80, color: "#3b82f6", label: "A" },
      { cx: 280, cy: 160, color: "#ef4444", label: "B" },
      { cx: 180, cy: 200, color: "#22c55e", label: "C" },
    ];
    const pts: Array<{ x: number; y: number; color: string; label: string }> = [];
    for (const g of groups) {
      for (let i = 0; i < 6; i++) {
        pts.push({
          x: g.cx + (rng() - 0.5) * 80,
          y: g.cy + (rng() - 0.5) * 60,
          color: g.color,
          label: g.label,
        });
      }
    }
    return pts;
  }, []);

  const [showLabels, setShowLabels] = useState(true);

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">Toggle labels to see the difference between supervised and unsupervised views</h3>

        <div className="flex justify-center">
          <button
            onClick={() => { playPop(); setShowLabels((v) => !v); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              showLabels ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Eye className="w-4 h-4" />
            {showLabels ? "Labels ON (Supervised)" : "Labels OFF (Unsupervised)"}
          </button>
        </div>

        {/* Side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supervised */}
          <div className="border border-indigo-200 rounded-xl p-3 bg-indigo-50/30">
            <h4 className="text-xs font-bold text-indigo-700 text-center mb-2">Supervised Learning</h4>
            <svg viewBox="0 0 380 260" className="w-full">
              <rect x={0} y={0} width={380} height={260} fill="#f8fafc" rx={8} />
              {dots.map((d, i) => (
                <g key={i}>
                  <circle cx={d.x} cy={d.y} r={10} fill={d.color} stroke="#334155" strokeWidth={1} opacity={0.85} />
                  <text x={d.x} y={d.y + 4} textAnchor="middle" className="text-[9px] fill-white font-bold">
                    {d.label}
                  </text>
                </g>
              ))}
              {/* Legend */}
              {[
                { label: "Group A", color: "#3b82f6", y: 20 },
                { label: "Group B", color: "#ef4444", y: 36 },
                { label: "Group C", color: "#22c55e", y: 52 },
              ].map((l) => (
                <g key={l.label}>
                  <circle cx={320} cy={l.y} r={5} fill={l.color} />
                  <text x={332} y={l.y + 4} className="text-[9px] fill-slate-600">{l.label}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Unsupervised */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/30">
            <h4 className="text-xs font-bold text-slate-600 text-center mb-2">Unsupervised Learning</h4>
            <svg viewBox="0 0 380 260" className="w-full">
              <rect x={0} y={0} width={380} height={260} fill="#f8fafc" rx={8} />
              {dots.map((d, i) => (
                <g key={i}>
                  <circle
                    cx={d.x}
                    cy={d.y}
                    r={10}
                    fill={showLabels ? d.color : "#94a3b8"}
                    stroke="#334155"
                    strokeWidth={1}
                    opacity={0.7}
                    style={{ transition: "fill 0.4s" }}
                  />
                  {showLabels && (
                    <text x={d.x} y={d.y + 4} textAnchor="middle" className="text-[9px] fill-white font-bold">
                      ?
                    </text>
                  )}
                </g>
              ))}
              <text x={190} y={250} textAnchor="middle" className="text-[10px] fill-slate-500 italic">
                {showLabels ? "Labels revealed  can you see the clusters?" : "No labels  the algorithm must find groups on its own"}
              </text>
            </svg>
          </div>
        </div>
      </div>

      <InfoBox variant="green" title="Supervised vs Unsupervised">
        <strong>Supervised learning</strong> uses labeled data  the algorithm knows the correct answers during training. <strong>Unsupervised learning</strong> works with unlabeled data  the algorithm must discover hidden patterns and groupings by itself!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What makes learning 'supervised'?",
    options: [
      "A teacher watches the computer",
      "The training data has labels (correct answers)",
      "The computer supervises itself",
      "It only runs when supervised by a human",
    ],
    correctIndex: 1,
    explanation:
      "Supervised learning means the training data comes with labels  the correct answers. The algorithm learns by comparing its predictions to these known answers.",
  },
  {
    question: "Why do we split data into training and testing sets?",
    options: [
      "To save storage space",
      "Because computers can only process half the data",
      "To check if the model works on data it hasn't seen before",
      "Testing data is always wrong",
    ],
    correctIndex: 2,
    explanation:
      "We test on unseen data to make sure the model truly learned patterns, not just memorized the training examples.",
  },
  {
    question: "Which is an example of supervised learning?",
    options: [
      "Grouping customers by shopping habits (no categories given)",
      "Teaching a model to recognize cats using 1000 labeled cat photos",
      "Finding unusual transactions in a bank",
      "Compressing images to save space",
    ],
    correctIndex: 1,
    explanation:
      "Using labeled cat photos is supervised learning because each training example has a correct label ('cat' or 'not cat').",
  },
  {
    question: "In unsupervised learning, the algorithm:",
    options: [
      "Already knows the correct answers",
      "Needs labels for every data point",
      "Discovers hidden patterns without labels",
      "Cannot learn anything useful",
    ],
    correctIndex: 2,
    explanation:
      "Unsupervised learning finds patterns, clusters, or structures in data without being told what to look for.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L11_SupervisedLearningActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "label",
        label: "Label the Data",
        icon: <Tag className="w-4 h-4" />,
        content: <LabelTheData />,
      },
      {
        id: "split",
        label: "Train vs Test Split",
        icon: <SplitSquareHorizontal className="w-4 h-4" />,
        content: <TrainTestSplit />,
      },
      {
        id: "compare",
        label: "Supervised vs Unsupervised",
        icon: <Eye className="w-4 h-4" />,
        content: <SupervisedVsUnsupervised />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Supervised Learning"
      level={4}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Learn how K-Nearest Neighbors finds similar data points!"
      story={
        <StorySection
          paragraphs={[
            "Aru was curious about how Byte could recognize fruits so quickly.",
            "Aru: How do you know that's an apple and not a tomato? They're both round and red!",
            "Byte: Someone showed me hundreds of pictures WITH labels  'this is an apple', 'this is a banana', 'this is a tomato'. I learned the subtle differences from those labeled examples.",
            "Aru: So someone had to tell you the right answer every time?",
            "Byte: Exactly! That's called supervised learning  learning from labeled examples. It's like having a teacher who marks every answer so you know what you got right and wrong.",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Supervised learning is when an algorithm learns from labeled data  examples where the correct answer is already known. The algorithm studies these examples and learns to predict the right answer for new, unseen data."
        />
      }
    />
  );
}
