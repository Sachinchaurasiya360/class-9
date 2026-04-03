import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { MousePointer, Play, Columns } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import SVGGrid from "../../components/SVGGrid";
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

function gaussNoise(rand: () => number, std: number): number {
  const u1 = Math.max(rand(), 1e-10);
  const u2 = rand();
  return std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

interface Pt { x: number; y: number }

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];

function generateData(seed: number): Pt[] {
  const rand = mulberry32(seed);
  const centers: Pt[] = [{ x: 2.5, y: 7 }, { x: 7, y: 7.5 }, { x: 5, y: 2.5 }];
  const pts: Pt[] = [];
  for (const c of centers) {
    for (let i = 0; i < 10; i++) {
      pts.push({ x: c.x + gaussNoise(rand, 0.8), y: c.y + gaussNoise(rand, 0.8) });
    }
  }
  return pts;
}

const DATA = generateData(123);

function dist(a: Pt, b: Pt): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function assignClusters(pts: Pt[], centroids: Pt[]): number[] {
  return pts.map((p) => {
    let best = 0;
    let bestD = dist(p, centroids[0]);
    for (let c = 1; c < centroids.length; c++) {
      const d = dist(p, centroids[c]);
      if (d < bestD) { bestD = d; best = c; }
    }
    return best;
  });
}

function updateCentroids(pts: Pt[], labels: number[], k: number): Pt[] {
  const sums = Array.from({ length: k }, () => ({ sx: 0, sy: 0, n: 0 }));
  pts.forEach((p, i) => {
    sums[labels[i]].sx += p.x;
    sums[labels[i]].sy += p.y;
    sums[labels[i]].n += 1;
  });
  return sums.map((s) => s.n > 0 ? { x: s.sx / s.n, y: s.sy / s.n } : { x: 5, y: 5 });
}

function totalInertia(pts: Pt[], labels: number[], centroids: Pt[]): number {
  return pts.reduce((sum, p, i) => sum + dist(p, centroids[labels[i]]) ** 2, 0);
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Step Through K-Means                                     */
/* ------------------------------------------------------------------ */
function StepTab() {
  const [k, setK] = useState(3);
  const [centroids, setCentroids] = useState<Pt[]>([]);
  const [labels, setLabels] = useState<number[]>([]);
  const [phase, setPhase] = useState<"place" | "assign" | "update">("place");
  const [iteration, setIteration] = useState(0);

  const handlePlaceCentroid = useCallback(
    (x: number, y: number) => {
      if (phase !== "place" || centroids.length >= k) return;
      playPop();
      const next = [...centroids, { x, y }];
      setCentroids(next);
      if (next.length === k) {
        setLabels(assignClusters(DATA, next));
        setPhase("assign");
      }
    },
    [phase, centroids, k],
  );

  const handleAssign = useCallback(() => {
    if (phase !== "assign") return;
    playClick();
    setLabels(assignClusters(DATA, centroids));
    setPhase("update");
  }, [phase, centroids]);

  const handleUpdate = useCallback(() => {
    if (phase !== "update") return;
    playClick();
    const newC = updateCentroids(DATA, labels, k);
    setCentroids(newC);
    setIteration((n) => n + 1);
    // Check convergence
    const newLabels = assignClusters(DATA, newC);
    const converged = newLabels.every((l, i) => l === labels[i]);
    setLabels(newLabels);
    if (converged) {
      playSuccess();
      setPhase("assign"); // stays at assign but user can see it converged
    } else {
      setPhase("assign");
    }
  }, [phase, labels, k]);

  const handleReset = useCallback(() => {
    playClick();
    setCentroids([]);
    setLabels([]);
    setPhase("place");
    setIteration(0);
  }, []);

  return (
    <div className="space-y-4">
      {/* K selector */}
      <div className="flex items-center gap-3 justify-center">
        <span className="text-xs font-medium text-slate-600">K =</span>
        {[2, 3, 4].map((v) => (
          <button
            key={v}
            onClick={() => { playClick(); setK(v); handleReset(); }}
            className={`w-8 h-8 rounded-full text-sm font-bold border transition-all duration-300 ${
              k === v ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}
          >
            {v}
          </button>
        ))}
        <span className="text-xs text-slate-500 ml-2">Iteration: {iteration}</span>
      </div>

      {phase === "place" && (
        <p className="text-center text-xs text-slate-500">
          Click on the chart to place {k - centroids.length} more centroid{k - centroids.length !== 1 ? "s" : ""}.
        </p>
      )}

      {/* Chart */}
      <SVGGrid xMin={0} xMax={10} yMin={0} yMax={10} xLabel="Feature 1" yLabel="Feature 2">
        {({ toSvgX, toSvgY }) => (
          <>
            {/* Click target (invisible rect) */}
            <rect
              x={toSvgX(0)} y={toSvgY(10)} width={toSvgX(10) - toSvgX(0)} height={toSvgY(0) - toSvgY(10)}
              fill="transparent"
              className="cursor-crosshair"
              onClick={(e) => {
                const svg = (e.target as SVGRectElement).ownerSVGElement!;
                const pt = svg.createSVGPoint();
                pt.x = e.clientX; pt.y = e.clientY;
                const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
                const xRange = 10;
                const yRange = 10;
                const plotX = (svgPt.x - toSvgX(0)) / (toSvgX(10) - toSvgX(0)) * xRange;
                const plotY = yRange - (svgPt.y - toSvgY(10)) / (toSvgY(0) - toSvgY(10)) * yRange;
                handlePlaceCentroid(plotX, plotY);
              }}
            />
            {/* Lines from points to centroids */}
            {labels.length > 0 && centroids.length > 0 && DATA.map((p, i) => (
              <line
                key={`line-${i}`}
                x1={toSvgX(p.x)} y1={toSvgY(p.y)}
                x2={toSvgX(centroids[labels[i]].x)} y2={toSvgY(centroids[labels[i]].y)}
                stroke={COLORS[labels[i]]} strokeWidth={0.5} opacity={0.3}
              />
            ))}
            {/* Data points */}
            {DATA.map((p, i) => (
              <circle
                key={i}
                cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={5}
                fill={labels.length > 0 ? COLORS[labels[i]] : "#94a3b8"}
                stroke="#fff" strokeWidth={1}
                className="transition-all duration-500"
              />
            ))}
            {/* Centroids */}
            {centroids.map((c, i) => (
              <g key={`c-${i}`}>
                <circle cx={toSvgX(c.x)} cy={toSvgY(c.y)} r={10} fill={COLORS[i]} stroke="#1e293b" strokeWidth={2} className="transition-all duration-500" />
                <text x={toSvgX(c.x)} y={toSvgY(c.y) + 4} textAnchor="middle" className="text-[9px] fill-white font-bold pointer-events-none">
                  C{i + 1}
                </text>
              </g>
            ))}
          </>
        )}
      </SVGGrid>

      {/* Step buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button onClick={handleAssign} disabled={phase !== "assign"}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm">
          Assign Points
        </button>
        <button onClick={handleUpdate} disabled={phase !== "update"}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm">
          Update Centroids
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300">
          Reset
        </button>
      </div>

      <InfoBox variant="blue" title="K-Means Steps">
        1. Place K centroids. 2. Assign each point to the nearest centroid. 3. Move each centroid to the center of its group. 4. Repeat until nothing changes!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Watch It Converge                                         */
/* ------------------------------------------------------------------ */
function ConvergeTab() {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [centroids, setCentroids] = useState<Pt[]>([{ x: 1, y: 9 }, { x: 9, y: 1 }, { x: 5, y: 5 }]);
  const [labels, setLabels] = useState<number[]>(() => assignClusters(DATA, [{ x: 1, y: 9 }, { x: 9, y: 1 }, { x: 5, y: 5 }]));
  const [trail, setTrail] = useState<Pt[][]>([[], [], []]);
  const [inertiaHistory, setInertiaHistory] = useState<number[]>([]);
  const [iteration, setIteration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = useCallback(() => {
    setCentroids((prev) => {
      const newLabels = assignClusters(DATA, prev);
      const newC = updateCentroids(DATA, newLabels, 3);
      const inertia = totalInertia(DATA, newLabels, newC);
      setLabels(newLabels);
      setTrail((t) => t.map((arr, i) => [...arr, prev[i]]));
      setInertiaHistory((h) => [...h, inertia]);
      setIteration((n) => n + 1);
      const converged = newLabels.every((l, i) => {
        const oldLabels = assignClusters(DATA, prev);
        return l === oldLabels[i];
      });
      if (converged) setPlaying(false);
      return newC;
    });
  }, []);

  useEffect(() => {
    if (!playing) { if (timerRef.current) clearTimeout(timerRef.current); return; }
    timerRef.current = setTimeout(step, speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, speed, step, iteration]);

  const handleReset = useCallback(() => {
    setPlaying(false);
    const init: Pt[] = [{ x: 1, y: 9 }, { x: 9, y: 1 }, { x: 5, y: 5 }];
    setCentroids(init);
    setLabels(assignClusters(DATA, init));
    setTrail([[], [], []]);
    setInertiaHistory([]);
    setIteration(0);
  }, []);

  // Inertia chart dimensions
  const chartW = 400;
  const chartH = 80;
  const maxInertia = inertiaHistory.length > 0 ? Math.max(...inertiaHistory) : 100;

  return (
    <div className="space-y-4">
      <SVGGrid xMin={0} xMax={10} yMin={0} yMax={10} xLabel="Feature 1" yLabel="Feature 2">
        {({ toSvgX, toSvgY }) => (
          <>
            {/* Trails */}
            {trail.map((arr, ci) =>
              arr.map((p, pi) => (
                <circle key={`trail-${ci}-${pi}`} cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={3}
                  fill={COLORS[ci]} opacity={0.25} />
              )),
            )}
            {/* Lines */}
            {DATA.map((p, i) => (
              <line key={`l-${i}`}
                x1={toSvgX(p.x)} y1={toSvgY(p.y)}
                x2={toSvgX(centroids[labels[i]].x)} y2={toSvgY(centroids[labels[i]].y)}
                stroke={COLORS[labels[i]]} strokeWidth={0.5} opacity={0.25} />
            ))}
            {/* Points */}
            {DATA.map((p, i) => (
              <circle key={i} cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={5}
                fill={COLORS[labels[i]]} stroke="#fff" strokeWidth={1} className="transition-all duration-300" />
            ))}
            {/* Centroids */}
            {centroids.map((c, i) => (
              <circle key={`c-${i}`} cx={toSvgX(c.x)} cy={toSvgY(c.y)} r={9}
                fill={COLORS[i]} stroke="#1e293b" strokeWidth={2} className="transition-all duration-300" />
            ))}
          </>
        )}
      </SVGGrid>

      {/* Inertia mini-chart */}
      {inertiaHistory.length > 0 && (
        <div className="flex justify-center">
          <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full max-w-[420px]">
            <text x={chartW / 2} y={12} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">Inertia (total distance)</text>
            {inertiaHistory.map((val, i) => {
              const bx = 30 + (i / Math.max(inertiaHistory.length - 1, 1)) * (chartW - 50);
              const by = 20 + (1 - val / maxInertia) * chartH;
              return (
                <g key={i}>
                  {i > 0 && (
                    <line
                      x1={30 + ((i - 1) / Math.max(inertiaHistory.length - 1, 1)) * (chartW - 50)}
                      y1={20 + (1 - inertiaHistory[i - 1] / maxInertia) * chartH}
                      x2={bx} y2={by} stroke="#6366f1" strokeWidth={1.5} />
                  )}
                  <circle cx={bx} cy={by} r={3} fill="#6366f1" />
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 items-center justify-center flex-wrap">
        <button
          onClick={() => { playClick(); setPlaying((p) => !p); }}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300 shadow-sm">
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={() => { playClick(); if (!playing) step(); }}
          disabled={playing}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm">
          Step
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300">
          Reset
        </button>
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-[10px] text-slate-500">Speed:</span>
          <input type="range" min={100} max={1200} step={100} value={1300 - speed}
            onChange={(e) => setSpeed(1300 - Number(e.target.value))}
            className="w-20 accent-indigo-600" />
        </div>
        <span className="text-xs text-slate-500">Iter: {iteration}</span>
      </div>

      <InfoBox variant="amber" title="Convergence">
        Watch the centroids settle! The inertia (total distance) decreases with each iteration. When centroids stop moving, the algorithm has converged.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Try Different K                                           */
/* ------------------------------------------------------------------ */
function DiffKTab() {
  const ks = [2, 3, 4];
  const [results, setResults] = useState<{ centroids: Pt[]; labels: number[] }[]>([]);
  const [running, setRunning] = useState(false);

  const runAll = useCallback(() => {
    playClick();
    setRunning(true);
    const res = ks.map((kVal) => {
      const rand = mulberry32(kVal * 31);
      let cents: Pt[] = Array.from({ length: kVal }, () => ({
        x: 1 + rand() * 8,
        y: 1 + rand() * 8,
      }));
      let lbls = assignClusters(DATA, cents);
      for (let iter = 0; iter < 20; iter++) {
        cents = updateCentroids(DATA, lbls, kVal);
        const newLbls = assignClusters(DATA, cents);
        if (newLbls.every((l, i) => l === lbls[i])) break;
        lbls = newLbls;
      }
      return { centroids: cents, labels: lbls };
    });
    setResults(res);
    playSuccess();
    setRunning(false);
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 text-center">Compare K=2, K=3, and K=4 on the same dataset. Which K looks best?</p>

      <div className="flex justify-center">
        <button onClick={runAll} disabled={running}
          className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm">
          {results.length > 0 ? "Run Again" : "Run K-Means"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {ks.map((kVal, ki) => {
            const r = results[ki];
            return (
              <div key={kVal} className="border border-slate-200 rounded-lg p-2 bg-white">
                <p className="text-xs font-bold text-center text-slate-700 mb-1">K = {kVal}</p>
                <svg viewBox="0 0 160 160" className="w-full">
                  <rect x={10} y={10} width={140} height={140} fill="#f8fafc" rx={4} stroke="#e2e8f0" />
                  {DATA.map((p, i) => {
                    const sx = 10 + (p.x / 10) * 140;
                    const sy = 10 + (1 - p.y / 10) * 140;
                    return (
                      <circle key={i} cx={sx} cy={sy} r={4}
                        fill={COLORS[r.labels[i] % COLORS.length]} stroke="#fff" strokeWidth={0.5}
                        className="transition-all duration-500" />
                    );
                  })}
                  {r.centroids.map((c, ci) => {
                    const sx = 10 + (c.x / 10) * 140;
                    const sy = 10 + (1 - c.y / 10) * 140;
                    return (
                      <g key={`c-${ci}`}>
                        <circle cx={sx} cy={sy} r={7} fill={COLORS[ci % COLORS.length]} stroke="#1e293b" strokeWidth={1.5} />
                        <line x1={sx - 4} y1={sy} x2={sx + 4} y2={sy} stroke="#fff" strokeWidth={1.5} />
                        <line x1={sx} y1={sy - 4} x2={sx} y2={sy + 4} stroke="#fff" strokeWidth={1.5} />
                      </g>
                    );
                  })}
                </svg>
                <p className="text-[10px] text-center text-slate-500 mt-1">
                  Inertia: {totalInertia(DATA, r.labels, r.centroids).toFixed(1)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <InfoBox variant="green" title="Choosing K">
        K=3 matches the natural clusters best here. Too few K and groups get merged; too many K and groups get unnecessarily split. The right K captures the real structure.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is K in K-Means?",
    options: ["The number of data points", "The number of clusters to find", "The number of iterations", "The size of the dataset"],
    correctIndex: 1,
    explanation: "K is the number of clusters (groups) you want the algorithm to find.",
  },
  {
    question: "What happens in the 'assign' step?",
    options: ["Centroids are moved", "Each point is colored by its nearest centroid", "New centroids are added", "Points are removed"],
    correctIndex: 1,
    explanation: "In the assign step, each data point is assigned to the nearest centroid, forming clusters.",
  },
  {
    question: "What happens in the 'update' step?",
    options: ["Points move closer together", "Centroids move to the center of their cluster", "K is changed", "The data is reshuffled"],
    correctIndex: 1,
    explanation: "Each centroid moves to the average (mean) position of all points assigned to it.",
  },
  {
    question: "When does K-Means stop?",
    options: ["After exactly 10 iterations", "When inertia reaches zero", "When assignments stop changing", "When all points are in one cluster"],
    correctIndex: 2,
    explanation: "K-Means converges when the assign step produces the same clusters as the previous iteration — nothing changes anymore.",
  },
  {
    question: "Why is K-Means called K-'Means'?",
    options: ["It means average K times", "Centroids move to the mean of their cluster", "K is the mean of all data", "It was named after a scientist named Means"],
    correctIndex: 1,
    explanation: "The 'Means' in K-Means refers to the centroids being moved to the mean (average) position of their assigned points.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L16_KMeansActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "step",
        label: "Step Through K-Means",
        icon: <MousePointer className="w-4 h-4" />,
        content: <StepTab />,
      },
      {
        id: "converge",
        label: "Watch It Converge",
        icon: <Play className="w-4 h-4" />,
        content: <ConvergeTab />,
      },
      {
        id: "diffk",
        label: "Try Different K",
        icon: <Columns className="w-4 h-4" />,
        content: <DiffKTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="K-Means Clustering"
      level={5}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: How do you choose the right K? The Elbow Method!"
      story={
        <StorySection
          paragraphs={[
            "Aru had 30 colorful marbles scattered across the floor. Some were close together, others far apart.",
            "Aru: \"Byte, I want to sort these into groups. But how do I know which go together?\"",
            "Byte: \"Let me show you how I'd sort them into groups. I pick K center points, assign each marble to the nearest center, then move the centers to the middle of their groups. Repeat until stable!\"",
            "Aru: \"That's like magic — the centers just... find the right spots?\"",
            "Byte: \"It's not magic — it's math! Each step makes the groups a little tighter. That's K-Means clustering.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="K-Means clustering works in two alternating steps: (1) assign each point to the nearest centroid, and (2) move each centroid to the mean of its assigned points. Repeat until the assignments stop changing."
        />
      }
    />
  );
}
