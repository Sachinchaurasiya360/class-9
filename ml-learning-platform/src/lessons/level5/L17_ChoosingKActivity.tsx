import { useState, useMemo, useCallback } from "react";
import { TrendingDown, SplitSquareHorizontal, Crosshair } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

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

function runKMeans(pts: Pt[], k: number, seed: number): { centroids: Pt[]; labels: number[]; inertia: number } {
  const rand = mulberry32(seed);
  let centroids: Pt[] = Array.from({ length: k }, () => ({
    x: 1 + rand() * 8, y: 1 + rand() * 8,
  }));
  let labels = assignClusters(pts, centroids);
  for (let iter = 0; iter < 30; iter++) {
    centroids = updateCentroids(pts, labels, k);
    const newLabels = assignClusters(pts, centroids);
    if (newLabels.every((l, i) => l === labels[i])) break;
    labels = newLabels;
  }
  return { centroids, labels, inertia: totalInertia(pts, labels, centroids) };
}

function generateDataset(seed: number, centers: Pt[]): Pt[] {
  const rand = mulberry32(seed);
  const pts: Pt[] = [];
  for (const c of centers) {
    for (let i = 0; i < 10; i++) {
      pts.push({ x: c.x + gaussNoise(rand, 0.7), y: c.y + gaussNoise(rand, 0.7) });
    }
  }
  return pts;
}

const ELBOW_DATA = generateDataset(200, [
  { x: 2.5, y: 7.5 }, { x: 7.5, y: 7.5 }, { x: 5, y: 2.5 },
]);

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

/* ------------------------------------------------------------------ */
/*  Tab 1 -- The Elbow Method                                          */
/* ------------------------------------------------------------------ */
function ElbowTab() {
  const elbowResults = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const k = i + 1;
      return runKMeans(ELBOW_DATA, k, k * 17);
    });
  }, []);

  const inertias = elbowResults.map((r) => r.inertia);
  const maxInertia = Math.max(...inertias);
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const correctK = 3;

  const chartW = 440;
  const chartH = 200;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 35;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const toX = (k: number) => padL + ((k - 1) / 7) * plotW;
  const toY = (v: number) => padT + (1 - v / maxInertia) * plotH;

  const handleGuess = useCallback((k: number) => {
    if (revealed) return;
    playPop();
    setUserGuess(k);
  }, [revealed]);

  const handleCheck = useCallback(() => {
    if (userGuess === null) return;
    if (userGuess === correctK) {
      playSuccess();
    } else {
      playError();
    }
    setRevealed(true);
  }, [userGuess]);

  const handleReset = useCallback(() => {
    playClick();
    setUserGuess(null);
    setRevealed(false);
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        We ran K-Means for K=1 to K=8. Click where you think the "elbow" is — the point where adding more clusters stops helping much.
      </p>

      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-[480px] mx-auto">
        {/* Grid lines */}
        {inertias.map((_, i) => (
          <line key={`gx-${i}`} x1={toX(i + 1)} y1={padT} x2={toX(i + 1)} y2={padT + plotH} stroke="#e2e8f0" strokeWidth={0.5} />
        ))}
        {/* Axes */}
        <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#334155" strokeWidth={1.5} />
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#334155" strokeWidth={1.5} />
        {/* Axis labels */}
        <text x={padL + plotW / 2} y={chartH - 2} textAnchor="middle" className="text-[11px] fill-slate-600 font-medium">K (number of clusters)</text>
        <text x={12} y={padT + plotH / 2} textAnchor="middle" transform={`rotate(-90, 12, ${padT + plotH / 2})`} className="text-[11px] fill-slate-600 font-medium">Inertia</text>
        {/* Line */}
        {inertias.map((val, i) => (
          <g key={i}>
            {i > 0 && (
              <line x1={toX(i)} y1={toY(inertias[i - 1])} x2={toX(i + 1)} y2={toY(val)}
                stroke="#6366f1" strokeWidth={2} />
            )}
            {/* Clickable dots */}
            <circle cx={toX(i + 1)} cy={toY(val)} r={userGuess === i + 1 ? 10 : 6}
              fill={
                revealed && i + 1 === correctK ? "#22c55e"
                : revealed && userGuess === i + 1 && userGuess !== correctK ? "#ef4444"
                : userGuess === i + 1 ? "#f59e0b"
                : "#6366f1"
              }
              stroke="#fff" strokeWidth={2}
              className="cursor-pointer transition-all duration-300"
              onClick={() => handleGuess(i + 1)} />
            {/* K label */}
            <text x={toX(i + 1)} y={padT + plotH + 16} textAnchor="middle" className="text-[10px] fill-slate-500">{i + 1}</text>
          </g>
        ))}
        {/* User guess highlight */}
        {revealed && (
          <g>
            <line x1={toX(correctK)} y1={padT} x2={toX(correctK)} y2={padT + plotH}
              stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={toX(correctK) + 5} y={padT + 12} className="text-[9px] fill-green-600 font-bold">Elbow!</text>
          </g>
        )}
      </svg>

      <div className="flex gap-2 justify-center">
        <button onClick={handleCheck} disabled={userGuess === null || revealed}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm">
          Check My Answer
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300">
          Reset
        </button>
      </div>

      {revealed && (
        <div className={`text-center text-sm font-medium rounded-lg py-2 px-4 border ${
          userGuess === correctK ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
        }`}>
          {userGuess === correctK
            ? "Correct! K=3 is the elbow — after that, adding more clusters barely reduces inertia."
            : `Not quite! The elbow is at K=3. After K=3, the inertia drop flattens out significantly.`}
        </div>
      )}

      <InfoBox variant="blue" title="The Elbow Method">
        Plot inertia vs K. The "elbow" is where the curve bends sharply — beyond that point, adding more clusters gives diminishing returns. That is your best K.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Good vs Bad Clusters                                      */
/* ------------------------------------------------------------------ */
function QualityTab() {
  const [separation, setSeparation] = useState(50);

  const { pts, labels, centroids, inertia, silhouette } = useMemo(() => {
    const spread = 1 + (100 - separation) * 0.04; // 1 (tight) to 5 (overlapping)
    const baseCenters: Pt[] = [{ x: 3, y: 7 }, { x: 7, y: 7 }, { x: 5, y: 3 }];
    const rand = mulberry32(55);
    const pts: Pt[] = [];
    for (const c of baseCenters) {
      for (let i = 0; i < 10; i++) {
        pts.push({ x: c.x + gaussNoise(rand, spread * 0.45), y: c.y + gaussNoise(rand, spread * 0.45) });
      }
    }
    const result = runKMeans(pts, 3, 777);

    // Simplified silhouette
    const sils = pts.map((p, i) => {
      const myC = result.labels[i];
      const same = pts.filter((_, j) => result.labels[j] === myC && j !== i);
      const a = same.length > 0 ? same.reduce((s, q) => s + dist(p, q), 0) / same.length : 0;
      let bMin = Infinity;
      for (let c = 0; c < 3; c++) {
        if (c === myC) continue;
        const others = pts.filter((_, j) => result.labels[j] === c);
        if (others.length === 0) continue;
        const avgD = others.reduce((s, q) => s + dist(p, q), 0) / others.length;
        if (avgD < bMin) bMin = avgD;
      }
      if (bMin === Infinity) return 0;
      return (bMin - a) / Math.max(a, bMin);
    });
    const avgSil = sils.reduce((s, v) => s + v, 0) / sils.length;

    return { pts, labels: result.labels, centroids: result.centroids, inertia: result.inertia, silhouette: avgSil };
  }, [separation]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 text-center">
        Drag the slider to change how well-separated the clusters are. Watch the metrics change!
      </p>

      {/* Slider */}
      <div className="space-y-1 max-w-md mx-auto">
        <input type="range" min={0} max={100} value={separation}
          onChange={(e) => setSeparation(Number(e.target.value))}
          className="w-full accent-indigo-600" />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Overlapping</span>
          <span>Well-separated</span>
        </div>
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-2 gap-3">
        {/* Scatter plot */}
        <div className="border border-slate-200 rounded-lg p-2 bg-white">
          <p className="text-xs font-bold text-center text-slate-700 mb-1">Cluster View</p>
          <svg viewBox="0 0 180 180" className="w-full">
            <rect x={10} y={10} width={160} height={160} fill="#f8fafc" rx={4} stroke="#e2e8f0" />
            {pts.map((p, i) => {
              const sx = 10 + (Math.max(0, Math.min(10, p.x)) / 10) * 160;
              const sy = 10 + (1 - Math.max(0, Math.min(10, p.y)) / 10) * 160;
              return (
                <circle key={i} cx={sx} cy={sy} r={4}
                  fill={COLORS[labels[i]]} stroke="#fff" strokeWidth={0.5}
                  className="transition-all duration-300" />
              );
            })}
            {centroids.map((c, ci) => {
              const sx = 10 + (Math.max(0, Math.min(10, c.x)) / 10) * 160;
              const sy = 10 + (1 - Math.max(0, Math.min(10, c.y)) / 10) * 160;
              return (
                <circle key={`c-${ci}`} cx={sx} cy={sy} r={6}
                  fill={COLORS[ci]} stroke="#1e293b" strokeWidth={1.5} />
              );
            })}
          </svg>
        </div>

        {/* Metrics */}
        <div className="border border-slate-200 rounded-lg p-3 bg-white flex flex-col justify-center gap-3">
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Inertia</p>
            <p className="text-lg font-bold text-slate-800">{inertia.toFixed(1)}</p>
            <div className="w-full h-2 bg-slate-100 rounded-full mt-1">
              <div className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (inertia / 200) * 100)}%` }} />
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Lower is tighter</p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Silhouette Score</p>
            <p className={`text-lg font-bold ${silhouette > 0.5 ? "text-green-600" : silhouette > 0.25 ? "text-amber-600" : "text-red-600"}`}>
              {silhouette.toFixed(2)}
            </p>
            <div className="w-full h-2 bg-slate-100 rounded-full mt-1">
              <div className={`h-2 rounded-full transition-all duration-300 ${silhouette > 0.5 ? "bg-green-500" : silhouette > 0.25 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${Math.max(0, silhouette) * 100}%` }} />
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Higher is better (0-1)</p>
          </div>
        </div>
      </div>

      <InfoBox variant="indigo" title="Two Metrics">
        <strong>Inertia:</strong> Total distance from each point to its centroid. Lower means tighter clusters.
        <br />
        <strong>Silhouette Score:</strong> Measures how well each point fits its cluster vs. neighboring clusters. Ranges from -1 to 1; higher is better.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Your Turn                                                 */
/* ------------------------------------------------------------------ */
interface DatasetOption {
  label: string;
  centers: Pt[];
  naturalK: number;
  seed: number;
}

const DATASETS: DatasetOption[] = [
  { label: "Two Blobs", centers: [{ x: 3, y: 5 }, { x: 7, y: 5 }], naturalK: 2, seed: 300 },
  { label: "Three Clusters", centers: [{ x: 2, y: 8 }, { x: 8, y: 8 }, { x: 5, y: 2 }], naturalK: 3, seed: 400 },
  { label: "Five Groups", centers: [{ x: 2, y: 8 }, { x: 8, y: 8 }, { x: 2, y: 2 }, { x: 8, y: 2 }, { x: 5, y: 5 }], naturalK: 5, seed: 500 },
];

function YourTurnTab() {
  const [dsIdx, setDsIdx] = useState(0);
  const [chosenK, setChosenK] = useState(3);
  const [result, setResult] = useState<{ centroids: Pt[]; labels: number[]; inertia: number } | null>(null);
  const [showElbow, setShowElbow] = useState(false);

  const data = useMemo(() => {
    const ds = DATASETS[dsIdx];
    return generateDataset(ds.seed, ds.centers);
  }, [dsIdx]);

  const elbowData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const k = i + 1;
      return runKMeans(data, k, k * 13 + dsIdx * 100);
    });
  }, [data, dsIdx]);

  const handleRun = useCallback(() => {
    playClick();
    const res = runKMeans(data, chosenK, chosenK * 99 + dsIdx);
    setResult(res);
    setShowElbow(false);
  }, [data, chosenK, dsIdx]);

  const handleShowElbow = useCallback(() => {
    playPop();
    setShowElbow(true);
  }, []);

  const naturalK = DATASETS[dsIdx].naturalK;
  const kDiff = result ? Math.abs(chosenK - naturalK) : null;

  const chartW = 300;
  const chartH = 100;
  const padL = 35;
  const padB = 20;
  const pW = chartW - padL - 10;
  const pH = chartH - padB - 10;
  const maxI = Math.max(...elbowData.map((r) => r.inertia));

  return (
    <div className="space-y-4">
      {/* Dataset picker */}
      <div className="flex gap-2 justify-center flex-wrap">
        {DATASETS.map((ds, i) => (
          <button key={ds.label}
            onClick={() => { playClick(); setDsIdx(i); setResult(null); setShowElbow(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
              dsIdx === i ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}>
            {ds.label}
          </button>
        ))}
      </div>

      {/* K slider */}
      <div className="flex items-center gap-3 justify-center">
        <span className="text-xs font-medium text-slate-600">Your K:</span>
        {[2, 3, 4, 5, 6].map((v) => (
          <button key={v}
            onClick={() => { playClick(); setChosenK(v); setResult(null); setShowElbow(false); }}
            className={`w-8 h-8 rounded-full text-sm font-bold border transition-all duration-300 ${
              chosenK === v ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}>
            {v}
          </button>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={handleRun}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-sm">
          Run K-Means
        </button>
        {result && (
          <button onClick={handleShowElbow}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-all duration-300 shadow-sm">
            Show Elbow Plot
          </button>
        )}
      </div>

      {/* Results area */}
      <div className={`grid ${showElbow ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
        {/* Scatter */}
        <div className="border border-slate-200 rounded-lg p-2 bg-white">
          <p className="text-xs font-bold text-center text-slate-700 mb-1">{DATASETS[dsIdx].label}</p>
          <svg viewBox="0 0 200 200" className="w-full max-w-[220px] mx-auto">
            <rect x={10} y={10} width={180} height={180} fill="#f8fafc" rx={4} stroke="#e2e8f0" />
            {data.map((p, i) => {
              const sx = 10 + (Math.max(0, Math.min(10, p.x)) / 10) * 180;
              const sy = 10 + (1 - Math.max(0, Math.min(10, p.y)) / 10) * 180;
              const color = result ? COLORS[result.labels[i] % COLORS.length] : "#94a3b8";
              return (
                <circle key={i} cx={sx} cy={sy} r={4}
                  fill={color} stroke="#fff" strokeWidth={0.5}
                  className="transition-all duration-500" />
              );
            })}
            {result && result.centroids.map((c, ci) => {
              const sx = 10 + (Math.max(0, Math.min(10, c.x)) / 10) * 180;
              const sy = 10 + (1 - Math.max(0, Math.min(10, c.y)) / 10) * 180;
              return (
                <g key={`c-${ci}`}>
                  <circle cx={sx} cy={sy} r={7} fill={COLORS[ci % COLORS.length]} stroke="#1e293b" strokeWidth={1.5} />
                  <line x1={sx - 3} y1={sy} x2={sx + 3} y2={sy} stroke="#fff" strokeWidth={1.5} />
                  <line x1={sx} y1={sy - 3} x2={sx} y2={sy + 3} stroke="#fff" strokeWidth={1.5} />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Elbow plot */}
        {showElbow && (
          <div className="border border-slate-200 rounded-lg p-2 bg-white">
            <p className="text-xs font-bold text-center text-slate-700 mb-1">Elbow Plot</p>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
              <line x1={padL} y1={10} x2={padL} y2={10 + pH} stroke="#334155" strokeWidth={1} />
              <line x1={padL} y1={10 + pH} x2={padL + pW} y2={10 + pH} stroke="#334155" strokeWidth={1} />
              <text x={padL + pW / 2} y={chartH - 2} textAnchor="middle" className="text-[9px] fill-slate-500">K</text>
              {elbowData.map((r, i) => {
                const ex = padL + (i / 6) * pW;
                const ey = 10 + (1 - r.inertia / maxI) * pH;
                return (
                  <g key={i}>
                    {i > 0 && (
                      <line x1={padL + ((i - 1) / 6) * pW} y1={10 + (1 - elbowData[i - 1].inertia / maxI) * pH}
                        x2={ex} y2={ey} stroke="#6366f1" strokeWidth={1.5} />
                    )}
                    <circle cx={ex} cy={ey} r={i + 1 === chosenK ? 6 : 3}
                      fill={i + 1 === naturalK ? "#22c55e" : i + 1 === chosenK ? "#f59e0b" : "#6366f1"}
                      stroke="#fff" strokeWidth={1} />
                    <text x={ex} y={10 + pH + 12} textAnchor="middle" className="text-[8px] fill-slate-500">{i + 1}</text>
                  </g>
                );
              })}
            </svg>
            <div className="flex gap-3 justify-center mt-1">
              <span className="flex items-center gap-1 text-[9px] text-slate-500">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> Your K
              </span>
              <span className="flex items-center gap-1 text-[9px] text-slate-500">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" /> Best K
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Score */}
      {result && (
        <div className={`text-center text-sm font-medium rounded-lg py-2 px-4 border ${
          kDiff === 0 ? "bg-green-50 border-green-200 text-green-700"
          : kDiff === 1 ? "bg-amber-50 border-amber-200 text-amber-700"
          : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {kDiff === 0
            ? `Perfect! K=${chosenK} matches the natural number of clusters!`
            : kDiff === 1
              ? `Close! The optimal K is ${naturalK}. You were off by 1.`
              : `The optimal K is ${naturalK}. Try again with a K closer to the elbow!`}
        </div>
      )}

      <InfoBox variant="green" title="Practice Makes Perfect">
        Different datasets have different natural K values. Always check the elbow plot before deciding. The right K balances simplicity with accuracy.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is the 'elbow' in the Elbow Method?",
    options: [
      "The point where inertia reaches zero",
      "The K value where inertia drop slows down sharply",
      "The maximum number of clusters possible",
      "The first K value on the chart",
    ],
    correctIndex: 1,
    explanation: "The elbow is where the rate of inertia decrease drops off sharply. Beyond this K, more clusters add little benefit.",
  },
  {
    question: "What does a high silhouette score mean?",
    options: [
      "Clusters overlap a lot",
      "Points are far from their own cluster",
      "Points fit well in their cluster and poorly in others",
      "There are too many clusters",
    ],
    correctIndex: 2,
    explanation: "A high silhouette score means each point is close to its own cluster center and far from other clusters — well-separated groups.",
  },
  {
    question: "If you set K too high, what happens?",
    options: [
      "Clusters capture real structure better",
      "The algorithm fails to run",
      "Natural groups get split unnecessarily",
      "Inertia increases dramatically",
    ],
    correctIndex: 2,
    explanation: "Setting K too high splits real groups into smaller, meaningless pieces. The clusters become artificial.",
  },
  {
    question: "Why can't we just pick the K with the lowest inertia?",
    options: [
      "Because lowest inertia always means K=1",
      "Because inertia always decreases as K grows, so K=N would win",
      "Because inertia is not related to K",
      "Because the algorithm does not compute inertia",
    ],
    correctIndex: 1,
    explanation: "Inertia always drops as K increases. At K=N (every point is its own cluster), inertia is zero. The elbow method finds where the benefit of more clusters becomes marginal.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L17_ChoosingKActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "elbow",
        label: "The Elbow Method",
        icon: <TrendingDown className="w-4 h-4" />,
        content: <ElbowTab />,
      },
      {
        id: "quality",
        label: "Good vs Bad Clusters",
        icon: <SplitSquareHorizontal className="w-4 h-4" />,
        content: <QualityTab />,
      },
      {
        id: "yourturn",
        label: "Your Turn",
        icon: <Crosshair className="w-4 h-4" />,
        content: <YourTurnTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Choosing K & Evaluating Clusters"
      level={5}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Discover the Perceptron — the building block of neural networks!"
      story={
        <StorySection
          paragraphs={[
            "Aru stared at the clusters Byte had found. Something was bugging her.",
            "Aru: \"But how do I know how many groups to make? What if I pick the wrong number?\"",
            "Byte: \"Great question! We try K=1, 2, 3... and measure how tight the clusters are. When the improvement slows down — that's the elbow! That's the best K.\"",
            "Aru: \"So you literally look for a bend in a graph?\"",
            "Byte: \"Exactly! It's called the Elbow Method. Simple, visual, and surprisingly effective. Let me show you!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="The Elbow Method plots cluster tightness (inertia) against K. The 'elbow' — where the curve bends — indicates the optimal number of clusters. The Silhouette Score further validates cluster quality by measuring separation between groups."
        />
      }
    />
  );
}
