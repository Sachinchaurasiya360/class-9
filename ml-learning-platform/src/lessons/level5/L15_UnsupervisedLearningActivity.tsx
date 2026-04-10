"use client";

import { useState, useMemo, useCallback } from "react";
import { Layers, ToggleLeft, LayoutGrid, Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

/* ---- helpers ---- */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    const t0 = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    const t = (t0 + Math.imul(t0 ^ (t0 >>> 7), 61 | t0)) ^ t0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const INK = "#2b2a35";

const THEMES = [
  { name: "Coral", a: "#ff6b6b", b: "#4ecdc4", c: "#ffd93d", d: "#b18cf2" },
  { name: "Sky", a: "#6bb6ff", b: "#b18cf2", c: "#ffd93d", d: "#ff6b6b" },
  { name: "Sunset", a: "#ffb88c", b: "#ff6b6b", c: "#ffd93d", d: "#4ecdc4" },
  { name: "Mint", a: "#4ecdc4", b: "#6bb6ff", c: "#b18cf2", d: "#ffd93d" },
];

/* ---- data generation ---- */
interface ShapeItem {
  id: number;
  x: number;
  y: number;
  size: number;
  shape: "circle" | "square" | "triangle";
  cluster: number;
}

const SHAPE_TYPES: ShapeItem["shape"][] = ["circle", "square", "triangle"];

function generateShapes(): ShapeItem[] {
  const rand = mulberry32(42);
  const items: ShapeItem[] = [];
  const centers = [
    { x: 90, y: 70, shape: SHAPE_TYPES[0] },
    { x: 350, y: 80, shape: SHAPE_TYPES[1] },
    { x: 120, y: 260, shape: SHAPE_TYPES[2] },
    { x: 370, y: 250, shape: SHAPE_TYPES[0] },
  ];
  let id = 0;
  for (let c = 0; c < centers.length; c++) {
    for (let i = 0; i < 6; i++) {
      items.push({
        id: id++,
        x: centers[c].x + (rand() - 0.5) * 100,
        y: centers[c].y + (rand() - 0.5) * 80,
        size: 11 + rand() * 7,
        shape: centers[c].shape,
        cluster: c,
      });
    }
  }
  return items;
}

const ALL_SHAPES = generateShapes();

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Group Without Labels                                      */
/* ------------------------------------------------------------------ */
function GroupTab() {
  const [assignments, setAssignments] = useState<Record<number, number>>({});
  const [activeBucket, setActiveBucket] = useState<number>(0);
  const [revealed, setRevealed] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = THEMES[themeIdx];
  const palette = [theme.a, theme.b, theme.c, theme.d];
  const bucketLabels = ["Group A", "Group B", "Group C", "Group D"];

  const handleShapeClick = useCallback(
    (id: number) => {
      if (revealed) return;
      playPop();
      setAssignments((prev) => ({ ...prev, [id]: activeBucket }));
    },
    [activeBucket, revealed],
  );

  const handleReveal = useCallback(() => {
    playSuccess();
    setRevealed(true);
  }, []);

  const handleReset = useCallback(() => {
    playClick();
    setAssignments({});
    setRevealed(false);
  }, []);

  const assigned = Object.keys(assignments).length;
  const correct = Object.entries(assignments).filter(
    ([id, bucket]) => ALL_SHAPES[Number(id)].cluster === bucket,
  ).length;

  return (
    <div className="space-y-4">
      {/* Theme picker */}
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-foreground/60" />
          <span className="font-hand text-sm font-bold">Theme:</span>
          <div className="flex gap-1.5">
            {THEMES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => { playClick(); setThemeIdx(i); }}
                title={t.name}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${themeIdx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
                style={{ background: t.a }}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="font-hand text-sm text-center text-foreground">
        Click a group button, then click shapes to assign them. Try to group similar shapes together!
      </p>

      {/* Bucket selector */}
      <div className="flex gap-2 justify-center flex-wrap">
        {bucketLabels.map((label, i) => (
          <button
            key={label}
            onClick={() => { playClick(); setActiveBucket(i); }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
              activeBucket === i
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
            style={activeBucket === i ? { background: palette[i] } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SVG canvas */}
      <div className="card-sketchy p-3 notebook-grid">
        <svg viewBox="0 0 480 340" className="w-full max-w-[520px] mx-auto">
          <defs>
            {palette.map((c, i) => (
              <radialGradient key={i} id={`l15-grad-${i}`} cx="35%" cy="30%">
                <stop offset="0%" stopColor="#fff" stopOpacity={0.85} />
                <stop offset="100%" stopColor={c} />
              </radialGradient>
            ))}
          </defs>
          {ALL_SHAPES.map((s) => {
            const idx = revealed ? s.cluster : assignments[s.id];
            const fill = idx !== undefined ? `url(#l15-grad-${idx})` : "#f3efe6";
            const isSet = assignments[s.id] !== undefined || revealed;
            return (
              <g key={s.id} onClick={() => handleShapeClick(s.id)} style={{ cursor: "pointer" }}
                 className={isSet ? "pulse-glow" : ""}>
                {s.shape === "circle" && (
                  <circle cx={s.x} cy={s.y} r={s.size} fill={fill} stroke={INK} strokeWidth={2.5} />
                )}
                {s.shape === "square" && (
                  <rect x={s.x - s.size} y={s.y - s.size} width={s.size * 2} height={s.size * 2} rx={3}
                    fill={fill} stroke={INK} strokeWidth={2.5} />
                )}
                {s.shape === "triangle" && (
                  <polygon
                    points={`${s.x},${s.y - s.size} ${s.x - s.size},${s.y + s.size} ${s.x + s.size},${s.y + s.size}`}
                    fill={fill} stroke={INK} strokeWidth={2.5}
                  />
                )}
                {revealed && (
                  <text x={s.x} y={s.y + 4} textAnchor="middle" fontFamily="Kalam"
                    className="text-[10px] font-bold pointer-events-none" fill={INK}>
                    {s.cluster + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center items-center flex-wrap">
        <button
          onClick={handleReveal}
          disabled={assigned < 10}
          className="btn-sketchy text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Reveal Clusters
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          Reset
        </button>
      </div>

      {revealed && (
        <div className="card-sketchy p-3 text-center font-hand text-sm" style={{ background: "#e6fff8" }}>
          You matched <span className="font-bold">{correct}</span> out of{" "}
          <span className="font-bold">{assigned}</span> shapes correctly!
        </div>
      )}

      <InfoBox variant="blue" title="No Labels Needed">
        In unsupervised learning, the algorithm finds natural groupings in data without being told what the groups are. You just did the same thing  grouping by visual similarity!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Supervised vs Unsupervised Recap                          */
/* ------------------------------------------------------------------ */
function CompareTab() {
  const [mode, setMode] = useState<"supervised" | "unsupervised">("supervised");
  const [animStep, setAnimStep] = useState(0);
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = THEMES[themeIdx];
  const colors = [theme.a, theme.b, theme.c];

  const rand = useMemo(() => mulberry32(99), []);
  const dots = useMemo(() => {
    const r = rand;
    const pts: { x: number; y: number; cluster: number }[] = [];
    const cx = [100, 300, 200];
    const cy = [80, 90, 220];
    for (let c = 0; c < 3; c++) {
      for (let i = 0; i < 7; i++) {
        pts.push({ x: cx[c] + (r() - 0.5) * 80, y: cy[c] + (r() - 0.5) * 70, cluster: c });
      }
    }
    return pts;
  }, [rand]);

  const labels = ["Cat", "Dog", "Bird"];
  const centers = [{ x: 100, y: 100 }, { x: 300, y: 110 }, { x: 200, y: 240 }];

  const handleAnimate = useCallback(() => {
    playClick();
    setAnimStep((s) => Math.min(s + 1, 3));
  }, []);

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-foreground/60" />
          <span className="font-hand text-sm font-bold">Theme:</span>
          <div className="flex gap-1.5">
            {THEMES.map((t, i) => (
              <button key={t.name} onClick={() => { playClick(); setThemeIdx(i); }}
                className={`w-6 h-6 rounded-full border-2 ${themeIdx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
                style={{ background: t.a }} />
            ))}
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 justify-center">
        {(["supervised", "unsupervised"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { playClick(); setMode(m); setAnimStep(0); }}
            className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground capitalize transition-all ${
              mode === m ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* SVG */}
      <div className="card-sketchy p-3 notebook-grid">
        <svg viewBox="0 0 440 300" className="w-full max-w-[480px] mx-auto">
          <defs>
            {colors.map((c, i) => (
              <radialGradient key={i} id={`l15c-${i}`} cx="35%" cy="30%">
                <stop offset="0%" stopColor="#fff" stopOpacity={0.85} />
                <stop offset="100%" stopColor={c} />
              </radialGradient>
            ))}
          </defs>
          <text x={220} y={20} textAnchor="middle" fontFamily="Kalam" fill={INK}
            className="text-[14px] font-bold">
            {mode === "supervised" ? "Labeled Data (Supervised)" : "Unlabeled Data (Unsupervised)"}
          </text>

          {/* Cluster halos for unsupervised animation - drawn first with signal-flow */}
          {mode === "unsupervised" && animStep >= 1 && centers.map((c, i) => (
            <circle key={`halo-${i}`} cx={c.x} cy={c.y + 20} r={56} fill="none"
              stroke={colors[i]} strokeWidth={2.5} className="signal-flow"
              opacity={0.7} />
          ))}

          {dots.map((d, i) => {
            const showColor = mode === "supervised" || animStep >= 2;
            const fill = showColor ? `url(#l15c-${d.cluster})` : "#cbd5e1";
            return (
              <g key={i}>
                <circle cx={d.x} cy={d.y + 20} r={9} fill={fill} stroke={INK} strokeWidth={2}
                  className={showColor ? "pulse-glow" : ""} />
                {mode === "supervised" && (
                  <text x={d.x} y={d.y + 44} textAnchor="middle" fontFamily="Kalam" fill={INK}
                    className="text-[10px] font-bold">
                    {labels[d.cluster]}
                  </text>
                )}
                {mode === "unsupervised" && animStep >= 3 && (
                  <text x={d.x} y={d.y + 44} textAnchor="middle" fontFamily="Kalam" fill={INK}
                    className="text-[10px] font-bold">
                    G{d.cluster + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {mode === "unsupervised" && (
        <div className="flex justify-center">
          <button
            onClick={handleAnimate}
            disabled={animStep >= 3}
            className="btn-sketchy text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {animStep === 0 ? "Find Groups" : animStep === 1 ? "Color Groups" : animStep === 2 ? "Label Groups" : "Done!"}
          </button>
        </div>
      )}

      <InfoBox variant="indigo" title="Key Difference">
        <strong>Supervised:</strong> Data comes with labels (e.g., "cat", "dog"). The model learns the mapping.
        <br />
        <strong>Unsupervised:</strong> No labels! The model discovers hidden patterns and groups on its own.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Real-World Examples                                       */
/* ------------------------------------------------------------------ */
interface ExampleCard {
  title: string;
  desc: string;
  detail: string;
}

const EXAMPLES: ExampleCard[] = [
  { title: "Customer Segmentation", desc: "Group shoppers by buying habits", detail: "Stores cluster customers into groups like 'bargain hunters' and 'premium buyers' to target ads better." },
  { title: "Topic Discovery", desc: "Find themes in news articles", detail: "Algorithms scan thousands of articles and group similar ones, discovering topics like sports, politics, and tech automatically." },
  { title: "Anomaly Detection", desc: "Spot unusual bank transactions", detail: "Most transactions cluster together. A fraudulent charge looks different and falls outside any cluster, flagging it as suspicious." },
  { title: "Image Compression", desc: "Reduce colors in a photo", detail: "K-Means groups similar pixel colors and replaces each with the cluster center, compressing the image while keeping it recognizable." },
];

function ExamplesTab() {
  const [selected, setSelected] = useState<number | null>(null);
  const palette = ["#ff6b6b", "#4ecdc4", "#ffd93d"];

  const miniViz = useCallback((idx: number) => {
    const r = mulberry32(idx * 77 + 10);
    const pts: { x: number; y: number; c: number }[] = [];
    for (let c = 0; c < 3; c++) {
      const cx = 40 + c * 60;
      const cy = 40 + (c % 2) * 30;
      for (let i = 0; i < 5; i++) {
        pts.push({ x: cx + (r() - 0.5) * 40, y: cy + (r() - 0.5) * 30, c });
      }
    }
    return (
      <svg viewBox="0 0 200 100" className="w-full max-w-[200px]">
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill={palette[p.c]} stroke={INK} strokeWidth={1.5} />
        ))}
      </svg>
    );
  }, []);

  return (
    <div className="space-y-4">
      <p className="font-hand text-sm text-center text-foreground">Click a card to learn how unsupervised learning is used in the real world.</p>
      <div className="grid grid-cols-2 gap-3">
        {EXAMPLES.map((ex, i) => {
          const isOpen = selected === i;
          return (
            <div
              key={ex.title}
              onClick={() => { playPop(); setSelected(isOpen ? null : i); }}
              className={`card-sketchy p-3 cursor-pointer transition-all ${isOpen ? "bg-accent-yellow/30" : "hover:bg-accent-mint/20"}`}
            >
              <h4 className="font-hand text-base font-bold text-foreground">{ex.title}</h4>
              <p className="font-hand text-xs text-muted-foreground mt-0.5">{ex.desc}</p>
              {isOpen && (
                <div className="mt-2 space-y-2">
                  <p className="font-hand text-xs text-foreground leading-relaxed">{ex.detail}</p>
                  <div className="flex justify-center">{miniViz(i)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <InfoBox variant="green" title="Everywhere!">
        Unsupervised learning is used wherever we have data but no labels  from healthcare to social media. It helps find hidden structure we did not even know existed.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What makes unsupervised learning different from supervised learning?",
    options: ["It uses more data", "The data has no labels", "It runs faster", "It needs a teacher"],
    correctIndex: 1,
    explanation: "In unsupervised learning, the data comes without labels. The algorithm must discover patterns on its own.",
  },
  {
    question: "What does an unsupervised algorithm try to find?",
    options: ["The correct answer", "Hidden patterns or groups", "The fastest calculation", "The biggest number"],
    correctIndex: 1,
    explanation: "Unsupervised algorithms look for natural groups, patterns, or structure in unlabeled data.",
  },
  {
    question: "Which is a real-world use of unsupervised learning?",
    options: ["Predicting tomorrow's weather", "Grouping customers by behavior", "Translating English to French", "Recognizing a stop sign"],
    correctIndex: 1,
    explanation: "Customer segmentation groups people by purchasing behavior without pre-defined labels  a classic unsupervised task.",
  },
  {
    question: "In unsupervised learning, who decides the group names?",
    options: ["The computer before it starts", "The data itself", "We do, after seeing the groups", "The training labels"],
    correctIndex: 2,
    explanation: "The algorithm finds the groups, but we humans look at the results and give them meaningful names afterward.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L15_UnsupervisedLearningActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "group",
        label: "Group Without Labels",
        icon: <Layers className="w-4 h-4" />,
        content: <GroupTab />,
      },
      {
        id: "compare",
        label: "Supervised vs Unsupervised",
        icon: <ToggleLeft className="w-4 h-4" />,
        content: <CompareTab />,
      },
      {
        id: "examples",
        label: "Real-World Examples",
        icon: <LayoutGrid className="w-4 h-4" />,
        content: <ExamplesTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="What Is Unsupervised Learning?"
      level={5}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Learn K-Means  the most popular clustering algorithm!"
      story={
        <StorySection
          paragraphs={[
            "Aru dumped a big box of mixed buttons onto the kitchen table. There were red ones, blue ones, big ones, tiny ones  all jumbled up.",
            "Aru: \"Byte, can you sort these for me? I don't even know what the categories should be!\"",
            "Byte: \"I have no labels for these, but I can see some look similar  same color, same size. I can GROUP them without anyone telling me the categories. That's unsupervised learning!\"",
            "Aru: \"So you just... figure out the groups yourself?\"",
            "Byte: \"Exactly! I look at how similar things are and put alike items together. No teacher needed  just patterns in the data.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Unsupervised learning finds hidden patterns in data that has no labels. Instead of being told the answer, the algorithm discovers natural groups and structures all on its own."
        />
      }
    />
  );
}
