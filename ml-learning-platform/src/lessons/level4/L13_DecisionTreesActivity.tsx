import { useState, useMemo, useCallback } from "react";
import { GitBranch, TreePine, SlidersHorizontal, RotateCcw } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";

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
/*  Tab 1 — Build a Decision Tree                                     */
/* ------------------------------------------------------------------ */

interface DataRow {
  weather: "Sunny" | "Rainy" | "Cloudy";
  temp: "Hot" | "Cold";
  activity: "Play" | "Stay";
}

const DATASET: DataRow[] = [
  { weather: "Sunny", temp: "Hot", activity: "Play" },
  { weather: "Sunny", temp: "Cold", activity: "Play" },
  { weather: "Rainy", temp: "Hot", activity: "Stay" },
  { weather: "Rainy", temp: "Cold", activity: "Stay" },
  { weather: "Cloudy", temp: "Hot", activity: "Play" },
  { weather: "Cloudy", temp: "Cold", activity: "Stay" },
  { weather: "Sunny", temp: "Hot", activity: "Play" },
  { weather: "Rainy", temp: "Cold", activity: "Stay" },
];

interface TreeNode {
  feature: string | null;
  value?: string;
  label?: string;
  children?: TreeNode[];
}

function BuildADecisionTree() {
  const [step, setStep] = useState(0); // 0 = pick root, 1 = building, 2 = done
  const [rootFeature, setRootFeature] = useState<"weather" | "temp" | null>(null);
  const [tree, setTree] = useState<TreeNode | null>(null);

  const handlePickRoot = useCallback((feature: "weather" | "temp") => {
    playPop();
    setRootFeature(feature);

    if (feature === "weather") {
      // Split by weather
      const sunnyRows = DATASET.filter((r) => r.weather === "Sunny");
      const rainyRows = DATASET.filter((r) => r.weather === "Rainy");
      const cloudyRows = DATASET.filter((r) => r.weather === "Cloudy");

      const majority = (rows: DataRow[]): string => {
        const playCount = rows.filter((r) => r.activity === "Play").length;
        return playCount > rows.length / 2 ? "Play" : "Stay";
      };

      setTree({
        feature: "Weather",
        children: [
          { feature: null, value: "Sunny", label: `${majority(sunnyRows)} (${sunnyRows.length} rows)` },
          { feature: null, value: "Rainy", label: `${majority(rainyRows)} (${rainyRows.length} rows)` },
          { feature: null, value: "Cloudy", label: `${majority(cloudyRows)} (${cloudyRows.length} rows)` },
        ],
      });
    } else {
      // Split by temperature
      const hotRows = DATASET.filter((r) => r.temp === "Hot");
      const coldRows = DATASET.filter((r) => r.temp === "Cold");

      const majority = (rows: DataRow[]): string => {
        const playCount = rows.filter((r) => r.activity === "Play").length;
        return playCount > rows.length / 2 ? "Play" : "Stay";
      };

      setTree({
        feature: "Temperature",
        children: [
          { feature: null, value: "Hot", label: `${majority(hotRows)} (${hotRows.length} rows)` },
          { feature: null, value: "Cold", label: `${majority(coldRows)} (${coldRows.length} rows)` },
        ],
      });
    }
    setStep(1);
  }, []);

  const reset = useCallback(() => {
    playClick();
    setStep(0);
    setRootFeature(null);
    setTree(null);
  }, []);

  // Count correct predictions
  const accuracy = useMemo(() => {
    if (!tree || !rootFeature) return 0;
    let correct = 0;
    for (const row of DATASET) {
      if (rootFeature === "weather") {
        const child = tree.children?.find((c) => c.value === row.weather);
        if (child?.label?.startsWith(row.activity)) correct++;
      } else {
        const child = tree.children?.find((c) => c.value === row.temp);
        if (child?.label?.startsWith(row.activity)) correct++;
      }
    }
    return Math.round((correct / DATASET.length) * 100);
  }, [tree, rootFeature]);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Build a decision tree by choosing which feature to split on</h3>

        {/* Data table */}
        <div className="overflow-x-auto">
          <table className="w-full max-w-md mx-auto text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-3 py-2 text-left text-slate-600">Weather</th>
                <th className="px-3 py-2 text-left text-slate-600">Temperature</th>
                <th className="px-3 py-2 text-left text-slate-600">Activity</th>
              </tr>
            </thead>
            <tbody>
              {DATASET.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-3 py-1.5">{row.weather}</td>
                  <td className="px-3 py-1.5">{row.temp}</td>
                  <td className={`px-3 py-1.5 font-semibold ${row.activity === "Play" ? "text-green-600" : "text-red-600"}`}>
                    {row.activity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Step 0: Pick root feature */}
        {step === 0 && (
          <div className="text-center space-y-3">
            <p className="text-xs text-slate-600">Which feature should the tree split on first?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => handlePickRoot("weather")}
                className="px-5 py-2.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors">
                Weather
              </button>
              <button onClick={() => handlePickRoot("temp")}
                className="px-5 py-2.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors">
                Temperature
              </button>
            </div>
          </div>
        )}

        {/* Tree visualization */}
        {tree && (
          <div className="space-y-3">
            <svg viewBox="0 0 500 220" className="w-full max-w-[500px] mx-auto">
              {/* Root node */}
              <rect x={190} y={10} width={120} height={36} rx={8} fill="#6366f1" />
              <text x={250} y={33} textAnchor="middle" className="text-[11px] fill-white font-bold">{tree.feature}?</text>

              {/* Branches */}
              {tree.children?.map((child, i) => {
                const count = tree.children?.length ?? 1;
                const spacing = 400 / (count + 1);
                const cx = 50 + spacing * (i + 1);

                return (
                  <g key={i}>
                    {/* Edge */}
                    <line x1={250} y1={46} x2={cx} y2={100} stroke="#94a3b8" strokeWidth={2} />
                    {/* Edge label */}
                    <text x={(250 + cx) / 2 + (i === 0 ? -15 : i === count - 1 ? 15 : 0)}
                      y={70} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">
                      {child.value}
                    </text>
                    {/* Leaf node */}
                    <rect x={cx - 55} y={100} width={110} height={36} rx={8}
                      fill={child.label?.startsWith("Play") ? "#22c55e" : "#ef4444"} />
                    <text x={cx} y={123} textAnchor="middle" className="text-[10px] fill-white font-bold">
                      {child.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Accuracy */}
            <div className="text-center">
              <span className={`text-sm font-bold ${accuracy >= 75 ? "text-green-600" : "text-amber-600"}`}>
                Accuracy: {accuracy}%
              </span>
              <p className="text-xs text-slate-500 mt-1">
                {rootFeature === "weather"
                  ? "Splitting by Weather separates the activities well!"
                  : "Splitting by Temperature gives a decent result. Try Weather too!"}
              </p>
            </div>

            <div className="flex justify-center">
              <button onClick={reset} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <InfoBox variant="blue" title="How Decision Trees Split">
        A decision tree picks the feature that best separates the data at each step. The goal is to create groups (leaves) where most items belong to the same class. This process is called <strong>splitting</strong>.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Tree Visualization                                         */
/* ------------------------------------------------------------------ */

interface AnimalTreeNode {
  question: string;
  yes: AnimalTreeNode | string;
  no: AnimalTreeNode | string;
}

const ANIMAL_TREE: AnimalTreeNode = {
  question: "Has legs?",
  yes: {
    question: "Has fur?",
    yes: {
      question: "Barks?",
      yes: "Dog",
      no: "Cat",
    },
    no: {
      question: "Can fly?",
      yes: "Eagle",
      no: "Lizard",
    },
  },
  no: {
    question: "Lives in water?",
    yes: "Fish",
    no: "Snake",
  },
};

function TreeVisualization() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["root"]));
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const toggleNode = useCallback((path: string) => {
    playPop();
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    playClick();
    setExpanded(new Set(["root", "root-y", "root-n", "root-y-y", "root-y-n"]));
  }, []);

  const collapseAll = useCallback(() => {
    playClick();
    setExpanded(new Set(["root"]));
  }, []);

  // Render tree recursively as SVG
  const renderNode = (
    node: AnimalTreeNode | string,
    x: number,
    y: number,
    path: string,
    spread: number,
  ): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];

    if (typeof node === "string") {
      // Leaf
      elements.push(
        <g key={path}
          onMouseEnter={() => setHoveredPath(path)}
          onMouseLeave={() => setHoveredPath(null)}>
          <rect x={x - 35} y={y - 14} width={70} height={28} rx={14}
            fill={hoveredPath === path ? "#22c55e" : "#4ade80"} stroke="#166534" strokeWidth={1.5} />
          <text x={x} y={y + 4} textAnchor="middle" className="text-[10px] fill-white font-bold">{node}</text>
        </g>,
      );
      return elements;
    }

    const isExpanded = expanded.has(path);

    // Decision node
    elements.push(
      <g key={path} onClick={() => toggleNode(path)} style={{ cursor: "pointer" }}
        onMouseEnter={() => setHoveredPath(path)}
        onMouseLeave={() => setHoveredPath(null)}>
        <rect x={x - 50} y={y - 16} width={100} height={32} rx={8}
          fill={hoveredPath === path ? "#818cf8" : "#6366f1"} stroke="#4338ca" strokeWidth={1.5} />
        <text x={x} y={y + 4} textAnchor="middle" className="text-[10px] fill-white font-bold">{node.question}</text>
        {!isExpanded && (
          <text x={x} y={y + 26} textAnchor="middle" className="text-[9px] fill-slate-400">click to expand</text>
        )}
      </g>,
    );

    if (isExpanded) {
      const nextY = y + 70;
      const childSpread = spread * 0.5;

      // Yes branch
      elements.push(
        <g key={`${path}-yes-edge`}>
          <line x1={x} y1={y + 16} x2={x - spread} y2={nextY - 16} stroke="#22c55e" strokeWidth={2} />
          <text x={(x + x - spread) / 2 - 12} y={(y + 16 + nextY - 16) / 2}
            className="text-[9px] fill-green-600 font-bold">Yes</text>
        </g>,
      );
      elements.push(...renderNode(node.yes, x - spread, nextY, `${path}-y`, childSpread));

      // No branch
      elements.push(
        <g key={`${path}-no-edge`}>
          <line x1={x} y1={y + 16} x2={x + spread} y2={nextY - 16} stroke="#ef4444" strokeWidth={2} />
          <text x={(x + x + spread) / 2 + 12} y={(y + 16 + nextY - 16) / 2}
            className="text-[9px] fill-red-600 font-bold">No</text>
        </g>,
      );
      elements.push(...renderNode(node.no, x + spread, nextY, `${path}-n`, childSpread));
    }

    return elements;
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Click on question nodes to expand or collapse the tree</h3>

        <div className="flex justify-center gap-3">
          <button onClick={expandAll}
            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors">
            Expand All
          </button>
          <button onClick={collapseAll}
            className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
            Collapse All
          </button>
        </div>

        <div className="flex justify-center overflow-x-auto">
          <svg viewBox="0 0 500 320" className="w-full max-w-[560px]">
            {renderNode(ANIMAL_TREE, 250, 30, "root", 120)}
          </svg>
        </div>

        <p className="text-xs text-center text-slate-500 italic">
          Each question narrows down the possibilities until we reach an answer (a leaf node).
        </p>
      </div>

      <InfoBox variant="green" title="Tree Structure">
        A decision tree has <strong>internal nodes</strong> (questions), <strong>branches</strong> (yes/no answers), and <strong>leaf nodes</strong> (final predictions). Data flows from the root down through questions until it reaches a leaf.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Depth vs Accuracy                                         */
/* ------------------------------------------------------------------ */

function DepthVsAccuracy() {
  const data = useMemo(() => {
    const rng = mulberry32(42);
    const pts: Array<{ x: number; y: number; cls: 0 | 1 }> = [];
    // Class 0: bottom-left cluster
    for (let i = 0; i < 15; i++) {
      pts.push({ x: 1 + rng() * 4, y: 1 + rng() * 4, cls: 0 });
    }
    // Class 1: top-right cluster
    for (let i = 0; i < 15; i++) {
      pts.push({ x: 5 + rng() * 4, y: 5 + rng() * 4, cls: 1 });
    }
    // Some overlap points
    pts.push({ x: 4.5, y: 5.2, cls: 0 });
    pts.push({ x: 5.2, y: 4.3, cls: 1 });
    return pts;
  }, []);

  const [depth, setDepth] = useState(2);

  // Simulate decision boundaries as axis-aligned splits
  const boundaries = useMemo(() => {
    const b: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    if (depth >= 1) b.push({ x1: 4.8, y1: 0, x2: 4.8, y2: 10 }); // main vertical split
    if (depth >= 2) {
      b.push({ x1: 0, y1: 4.6, x2: 4.8, y2: 4.6 }); // left horizontal
      b.push({ x1: 4.8, y1: 5.2, x2: 10, y2: 5.2 }); // right horizontal
    }
    if (depth >= 3) {
      b.push({ x1: 2.5, y1: 0, x2: 2.5, y2: 4.6 });
      b.push({ x1: 7.0, y1: 5.2, x2: 7.0, y2: 10 });
    }
    if (depth >= 4) {
      b.push({ x1: 0, y1: 2.3, x2: 2.5, y2: 2.3 });
      b.push({ x1: 4.8, y1: 7.5, x2: 7.0, y2: 7.5 });
      b.push({ x1: 2.5, y1: 3.5, x2: 4.8, y2: 3.5 });
    }
    if (depth >= 5) {
      b.push({ x1: 1.2, y1: 0, x2: 1.2, y2: 2.3 });
      b.push({ x1: 6.0, y1: 5.2, x2: 6.0, y2: 7.5 });
      b.push({ x1: 8.5, y1: 5.2, x2: 8.5, y2: 10 });
    }
    return b;
  }, [depth]);

  const descriptions: Record<number, string> = {
    1: "Underfitting: Only one split — too simple to capture the pattern well.",
    2: "Getting better: A few splits start to separate the classes nicely.",
    3: "Good fit: The tree captures the main pattern without being too complex.",
    4: "Getting complex: More boundaries than needed — starting to overfit.",
    5: "Overfitting: Too many splits! The tree memorizes noise instead of learning the real pattern.",
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Adjust tree depth and see how the decision boundary changes</h3>

        {/* Depth slider */}
        <div className="flex items-center gap-3 max-w-xs mx-auto">
          <span className="text-xs font-medium text-slate-600">Depth:</span>
          <input type="range" min={1} max={5} step={1} value={depth}
            onChange={(e) => { playClick(); setDepth(Number(e.target.value)); }}
            className="flex-1 accent-indigo-500" />
          <span className="text-sm font-bold text-indigo-700 w-6 text-center">{depth}</span>
        </div>

        {/* Plot */}
        <div className="flex justify-center overflow-x-auto">
          <svg viewBox="0 0 500 350" className="w-full max-w-[560px]">
            {/* Background */}
            <rect x={45} y={20} width={435} height={290} fill="#f8fafc" rx={4} />

            {/* Grid */}
            {[0, 2, 4, 6, 8, 10].map((v) => {
              const x = 45 + (v / 10) * 435;
              const y = 20 + (1 - v / 10) * 290;
              return (
                <g key={v}>
                  <line x1={x} y1={20} x2={x} y2={310} stroke="#e2e8f0" strokeWidth={0.5} />
                  <line x1={45} y1={y} x2={480} y2={y} stroke="#e2e8f0" strokeWidth={0.5} />
                  <text x={x} y={326} textAnchor="middle" className="text-[9px] fill-slate-500">{v}</text>
                  <text x={38} y={y + 3} textAnchor="end" className="text-[9px] fill-slate-500">{v}</text>
                </g>
              );
            })}

            {/* Axes */}
            <line x1={45} y1={310} x2={480} y2={310} stroke="#334155" strokeWidth={1.5} />
            <line x1={45} y1={20} x2={45} y2={310} stroke="#334155" strokeWidth={1.5} />

            {/* Decision boundaries */}
            {boundaries.map((b, i) => {
              const sx = (v: number) => 45 + (v / 10) * 435;
              const sy = (v: number) => 20 + (1 - v / 10) * 290;
              return (
                <line key={i}
                  x1={sx(b.x1)} y1={sy(b.y1)} x2={sx(b.x2)} y2={sy(b.y2)}
                  stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3"
                  style={{ transition: "all 0.3s" }} />
              );
            })}

            {/* Data points */}
            {data.map((p, i) => {
              const sx = 45 + (p.x / 10) * 435;
              const sy = 20 + (1 - p.y / 10) * 290;
              return (
                <circle key={i} cx={sx} cy={sy} r={5}
                  fill={p.cls === 0 ? "#ef4444" : "#3b82f6"}
                  stroke="#334155" strokeWidth={1} opacity={0.85} />
              );
            })}

            {/* Axis labels */}
            <text x={262} y={346} textAnchor="middle" className="text-[11px] fill-slate-600 font-medium">Feature 1</text>
            <text x={12} y={165} textAnchor="middle" transform="rotate(-90, 12, 165)"
              className="text-[11px] fill-slate-600 font-medium">Feature 2</text>
          </svg>
        </div>

        {/* Description */}
        <div className={`text-center text-xs font-medium p-3 rounded-lg ${
          depth <= 2 ? "bg-amber-100 text-amber-700" : depth === 3 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {descriptions[depth]}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs text-slate-600">
          <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 align-middle" />Class 0</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1 align-middle" />Class 1</span>
          <span><span className="inline-block w-4 h-0.5 bg-indigo-500 mr-1 align-middle border-dashed" />Boundary</span>
        </div>
      </div>

      <InfoBox variant="amber" title="Underfitting vs Overfitting">
        A <strong>shallow tree</strong> (low depth) might be too simple — it underfits, missing important patterns. A <strong>deep tree</strong> (high depth) can memorize noise — it overfits. The sweet spot is a tree that captures the real pattern without being overly complex.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What does a decision tree use to make predictions?",
    options: [
      "Random guessing",
      "A series of yes/no questions",
      "The average of all data points",
      "Only the most recent data point",
    ],
    correctIndex: 1,
    explanation: "A decision tree makes predictions by asking a series of yes/no questions about the features, following branches until reaching a leaf node with the answer.",
  },
  {
    question: "What is a 'leaf node' in a decision tree?",
    options: [
      "A node that asks a question",
      "The root of the tree",
      "A final prediction/answer",
      "An unused feature",
    ],
    correctIndex: 2,
    explanation: "Leaf nodes are the endpoints of the tree — they contain the final prediction or classification, with no further questions to ask.",
  },
  {
    question: "What happens when a decision tree is too deep?",
    options: [
      "It becomes faster",
      "It underfits the data",
      "It overfits — memorizing noise instead of learning patterns",
      "It stops working completely",
    ],
    correctIndex: 2,
    explanation: "An overly deep tree creates too many specific rules that fit the training data perfectly but fail on new data — this is overfitting.",
  },
  {
    question: "How does a decision tree choose which feature to split on?",
    options: [
      "It always picks the first feature",
      "Random selection",
      "It picks the feature that best separates the classes",
      "It uses all features at once",
    ],
    correctIndex: 2,
    explanation: "The algorithm evaluates each feature and picks the one that creates the most pure/separated groups — this gives the most informative split.",
  },
  {
    question: "What is 'underfitting'?",
    options: [
      "The model is too complex",
      "The model is too simple and misses important patterns",
      "The model has too much data",
      "The model trains too slowly",
    ],
    correctIndex: 1,
    explanation: "Underfitting happens when the model is too simple to capture the underlying patterns in the data, resulting in poor predictions on both training and test data.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L13_DecisionTreesActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "build",
        label: "Build a Decision Tree",
        icon: <GitBranch className="w-4 h-4" />,
        content: <BuildADecisionTree />,
      },
      {
        id: "visualize",
        label: "Tree Visualization",
        icon: <TreePine className="w-4 h-4" />,
        content: <TreeVisualization />,
      },
      {
        id: "depth",
        label: "Depth vs Accuracy",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <DepthVsAccuracy />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Decision Trees"
      level={4}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Learn how to measure if your ML model is actually good!"
      story={
        <StorySection
          paragraphs={[
            "Aru was staring at her closet, overwhelmed by choices for what to wear today.",
            "Byte: Let me help! Is it raining outside?",
            "Aru: Yes, it's drizzling.",
            "Byte: Then take an umbrella. Now, is it cold?",
            "Aru: Not really, just a bit cool.",
            "Byte: Then wear a light jacket. See what I just did? I asked a series of yes/no questions, and each answer led us closer to the right choice. That's a decision tree!",
            "Aru: So a decision tree is like a flowchart for making decisions?",
            "Byte: Exactly! And computers can build these trees automatically by finding the best questions to ask at each step.",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A decision tree makes predictions by asking a series of yes/no questions about the data features. Each question splits the data into groups, and the process repeats until we reach a final answer. The order and choice of questions determine how accurate the tree is."
        />
      }
    />
  );
}
