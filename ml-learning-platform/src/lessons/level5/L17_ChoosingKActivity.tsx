"use client";

import { useState, useMemo, useCallback } from "react";
import { TrendingDown, SplitSquareHorizontal, Crosshair, Palette } from "lucide-react";
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

const INK = "#2b2a35";

const THEMES = [
  { name: "Coral", colors: ["#ff6b6b", "#4ecdc4", "#ffd93d", "#b18cf2", "#6bb6ff", "#ffb88c", "#f49ac1", "#94a3b8"] },
  { name: "Sky", colors: ["#6bb6ff", "#b18cf2", "#ffd93d", "#ff6b6b", "#4ecdc4", "#ffb88c", "#f49ac1", "#94a3b8"] },
  { name: "Sunset", colors: ["#ffb88c", "#ff6b6b", "#ffd93d", "#4ecdc4", "#b18cf2", "#6bb6ff", "#f49ac1", "#94a3b8"] },
];

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

/* ------------------------------------------------------------------ */
/*  Tab 1 -- The Elbow Method                                          */
/* ------------------------------------------------------------------ */
function ElbowTab() {
  const [themeIdx, setThemeIdx] = useState(0);
  const COLORS = THEMES[themeIdx].colors;

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

  const chartW = 480;
  const chartH = 240;
  const padL = 56;
  const padR = 24;
  const padT = 28;
  const padB = 42;
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
    if (userGuess === correctK) playSuccess(); else playError();
    setRevealed(true);
  }, [userGuess]);

  const handleReset = useCallback(() => {
    playClick();
    setUserGuess(null);
    setRevealed(false);
  }, []);

  // Build path "d" for animated draw-line
  const pathD = inertias
    .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i + 1)},${toY(v)}`)
    .join(" ");

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3 flex items-center justify-center gap-3">
        <Palette className="w-4 h-4 text-foreground/60" />
        <span className="font-hand text-sm font-bold">Theme:</span>
        <div className="flex gap-1.5">
          {THEMES.map((t, i) => (
            <button key={t.name} onClick={() => { playClick(); setThemeIdx(i); }}
              className={`w-6 h-6 rounded-full border-2 ${themeIdx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
              style={{ background: t.colors[0] }} />
          ))}
        </div>
      </div>

      <p className="font-hand text-sm text-center text-foreground">
        We ran K-Means for K=1 to K=8. Click where you think the "elbow" is  the point where adding more clusters stops helping much.
      </p>

      <div className="card-sketchy p-3 notebook-grid">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-[560px] mx-auto">
          <defs>
            <linearGradient id="l17-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={COLORS[0]} />
              <stop offset="50%" stopColor={COLORS[2]} />
              <stop offset="100%" stopColor={COLORS[1]} />
            </linearGradient>
            <radialGradient id="l17-dot-elbow" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor={COLORS[2]} />
            </radialGradient>
          </defs>

          {/* Axes */}
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke={INK} strokeWidth={2} />
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={INK} strokeWidth={2} />
          <text x={padL + plotW / 2} y={chartH - 8} textAnchor="middle"
            fontFamily="Kalam" fill={INK} className="text-[12px] font-bold">K (number of clusters)</text>
          <text x={16} y={padT + plotH / 2} textAnchor="middle"
            transform={`rotate(-90, 16, ${padT + plotH / 2})`}
            fontFamily="Kalam" fill={INK} className="text-[12px] font-bold">Inertia</text>

          {/* Gradient line (animated draw) */}
          <path d={pathD} fill="none" stroke="url(#l17-line)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" className="draw-line" />

          {/* Dots */}
          {inertias.map((val, i) => {
            const k = i + 1;
            const isCorrect = revealed && k === correctK;
            const isWrong = revealed && userGuess === k && k !== correctK;
            const isPicked = userGuess === k && !revealed;
            const fill = isCorrect ? "url(#l17-dot-elbow)"
              : isWrong ? COLORS[0]
              : isPicked ? COLORS[2]
              : COLORS[3];
            return (
              <g key={i}>
                <circle cx={toX(k)} cy={toY(val)} r={isPicked || isCorrect ? 12 : 7}
                  fill={fill} stroke={INK} strokeWidth={2.5}
                  className={`cursor-pointer ${isCorrect ? "pulse-glow" : ""}`}
                  style={isCorrect ? { color: COLORS[2] } : undefined}
                  onClick={() => handleGuess(k)} />
                <text x={toX(k)} y={padT + plotH + 18} textAnchor="middle"
                  fontFamily="Kalam" fill={INK} className="text-[11px] font-bold">{k}</text>
              </g>
            );
          })}

          {/* Sparks on elbow when correct */}
          {revealed && (
            <>
              <line x1={toX(correctK)} y1={padT} x2={toX(correctK)} y2={padT + plotH}
                stroke={COLORS[1]} strokeWidth={2} strokeDasharray="5 4" />
              <text x={toX(correctK) + 6} y={padT + 14} fontFamily="Kalam" fill={INK}
                className="text-[11px] font-bold">Elbow!</text>
              <g>
                {Array.from({ length: 8 }).map((_, k) => {
                  const angle = (k / 8) * Math.PI * 2;
                  return (
                    <line key={k}
                      x1={toX(correctK)} y1={toY(inertias[correctK - 1])}
                      x2={toX(correctK) + Math.cos(angle) * 28}
                      y2={toY(inertias[correctK - 1]) + Math.sin(angle) * 28}
                      stroke={COLORS[2]} strokeWidth={2.5} strokeLinecap="round"
                      className="spark" style={{ animationDelay: `${k * 0.05}s` }} />
                  );
                })}
              </g>
            </>
          )}
        </svg>
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={handleCheck} disabled={userGuess === null || revealed}
          className="btn-sketchy text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          Check My Answer
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          Reset
        </button>
      </div>

      {revealed && (
        <div className={`card-sketchy p-3 text-center font-hand text-sm`}
          style={{ background: userGuess === correctK ? "#e6fff8" : "#fff8e6" }}>
          {userGuess === correctK
            ? "Correct! K=3 is the elbow  after that, adding more clusters barely reduces inertia."
            : `Not quite! The elbow is at K=3. After K=3, the inertia drop flattens out significantly.`}
        </div>
      )}

      <InfoBox variant="blue" title="The Elbow Method">
        Plot inertia vs K. The "elbow" is where the curve bends sharply  beyond that point, adding more clusters gives diminishing returns. That is your best K.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Good vs Bad Clusters                                      */
/* ------------------------------------------------------------------ */
function QualityTab() {
  const [separation, setSeparation] = useState(50);
  const [themeIdx, setThemeIdx] = useState(0);
  const COLORS = THEMES[themeIdx].colors;

  const { pts, labels, centroids, inertia, silhouette } = useMemo(() => {
    const spread = 1 + (100 - separation) * 0.04;
    const baseCenters: Pt[] = [{ x: 3, y: 7 }, { x: 7, y: 7 }, { x: 5, y: 3 }];
    const rand = mulberry32(55);
    const pts: Pt[] = [];
    for (const c of baseCenters) {
      for (let i = 0; i < 10; i++) {
        pts.push({ x: c.x + gaussNoise(rand, spread * 0.45), y: c.y + gaussNoise(rand, spread * 0.45) });
      }
    }
    const result = runKMeans(pts, 3, 777);

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
      <div className="card-sketchy p-3 flex items-center justify-center gap-3">
        <Palette className="w-4 h-4 text-foreground/60" />
        <span className="font-hand text-sm font-bold">Theme:</span>
        <div className="flex gap-1.5">
          {THEMES.map((t, i) => (
            <button key={t.name} onClick={() => { playClick(); setThemeIdx(i); }}
              className={`w-6 h-6 rounded-full border-2 ${themeIdx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
              style={{ background: t.colors[0] }} />
          ))}
        </div>
      </div>

      <p className="font-hand text-sm text-center text-foreground">
        Drag the slider to change how well-separated the clusters are. Watch the metrics change!
      </p>

      <div className="card-sketchy p-3 max-w-md mx-auto">
        <input type="range" min={0} max={100} value={separation}
          onChange={(e) => setSeparation(Number(e.target.value))}
          className="w-full accent-accent-coral" />
        <div className="flex justify-between font-hand text-[10px] text-muted-foreground">
          <span>Overlapping</span>
          <span>Well-separated</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card-sketchy p-2 notebook-grid">
          <p className="font-hand text-xs font-bold text-center text-foreground mb-1">Cluster View</p>
          <svg viewBox="0 0 200 200" className="w-full">
            <defs>
              {COLORS.slice(0, 3).map((c, i) => (
                <radialGradient key={i} id={`l17q-${i}`} cx="35%" cy="30%">
                  <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
                  <stop offset="100%" stopColor={c} />
                </radialGradient>
              ))}
            </defs>
            <rect x={8} y={8} width={184} height={184} fill="none" stroke={INK} strokeWidth={2} rx={4} />
            {pts.map((p, i) => {
              const sx = 8 + (Math.max(0, Math.min(10, p.x)) / 10) * 184;
              const sy = 8 + (1 - Math.max(0, Math.min(10, p.y)) / 10) * 184;
              return (
                <circle key={i} cx={sx} cy={sy} r={5}
                  fill={`url(#l17q-${labels[i]})`} stroke={INK} strokeWidth={1.5}
                  style={{ transition: "all 0.3s" }} />
              );
            })}
            {centroids.map((c, ci) => {
              const sx = 8 + (Math.max(0, Math.min(10, c.x)) / 10) * 184;
              const sy = 8 + (1 - Math.max(0, Math.min(10, c.y)) / 10) * 184;
              return (
                <circle key={`c-${ci}`} cx={sx} cy={sy} r={9}
                  fill={`url(#l17q-${ci})`} stroke={INK} strokeWidth={2.5}
                  className="pulse-glow" style={{ color: COLORS[ci] }} />
              );
            })}
          </svg>
        </div>

        <div className="card-sketchy p-3 flex flex-col justify-center gap-3">
          <div>
            <p className="font-hand text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Inertia</p>
            <p className="font-hand text-xl font-bold text-foreground">{inertia.toFixed(1)}</p>
            <div className="w-full h-2.5 bg-muted rounded-full mt-1 border border-foreground">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (inertia / 200) * 100)}%`, background: COLORS[0] }} />
            </div>
            <p className="font-hand text-[10px] text-muted-foreground mt-0.5">Lower is tighter</p>
          </div>
          <div>
            <p className="font-hand text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Silhouette Score</p>
            <p className="font-hand text-xl font-bold text-foreground">{silhouette.toFixed(2)}</p>
            <div className="w-full h-2.5 bg-muted rounded-full mt-1 border border-foreground">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, silhouette) * 100}%`, background: silhouette > 0.5 ? COLORS[1] : silhouette > 0.25 ? COLORS[2] : COLORS[0] }} />
            </div>
            <p className="font-hand text-[10px] text-muted-foreground mt-0.5">Higher is better (0-1)</p>
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
  const [themeIdx, setThemeIdx] = useState(0);
  const COLORS = THEMES[themeIdx].colors;

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

  const chartW = 320;
  const chartH = 130;
  const padL = 38;
  const padB = 24;
  const pW = chartW - padL - 12;
  const pH = chartH - padB - 14;
  const maxI = Math.max(...elbowData.map((r) => r.inertia));

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3 flex items-center justify-center gap-3">
        <Palette className="w-4 h-4 text-foreground/60" />
        <span className="font-hand text-sm font-bold">Theme:</span>
        <div className="flex gap-1.5">
          {THEMES.map((t, i) => (
            <button key={t.name} onClick={() => { playClick(); setThemeIdx(i); }}
              className={`w-6 h-6 rounded-full border-2 ${themeIdx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
              style={{ background: t.colors[0] }} />
          ))}
        </div>
      </div>

      {/* Dataset picker */}
      <div className="flex gap-2 justify-center flex-wrap">
        {DATASETS.map((ds, i) => (
          <button key={ds.label}
            onClick={() => { playClick(); setDsIdx(i); setResult(null); setShowElbow(false); }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
              dsIdx === i ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background hover:bg-accent-yellow/40"
            }`}>
            {ds.label}
          </button>
        ))}
      </div>

      {/* K picker */}
      <div className="flex items-center gap-2 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold text-foreground">Your K:</span>
        {[2, 3, 4, 5, 6].map((v) => (
          <button key={v}
            onClick={() => { playClick(); setChosenK(v); setResult(null); setShowElbow(false); }}
            className={`w-9 h-9 rounded-full font-hand text-sm font-bold border-2 border-foreground transition-all ${
              chosenK === v ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background hover:bg-accent-yellow/40"
            }`}>
            {v}
          </button>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={handleRun} className="btn-sketchy text-sm">Run K-Means</button>
        {result && (
          <button onClick={handleShowElbow} className="btn-sketchy-outline text-sm">Show Elbow Plot</button>
        )}
      </div>

      <div className={`grid ${showElbow ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
        <div className="card-sketchy p-2 notebook-grid">
          <p className="font-hand text-xs font-bold text-center text-foreground mb-1">{DATASETS[dsIdx].label}</p>
          <svg viewBox="0 0 220 220" className="w-full max-w-[240px] mx-auto">
            <defs>
              {COLORS.map((c, i) => (
                <radialGradient key={i} id={`l17y-${i}`} cx="35%" cy="30%">
                  <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
                  <stop offset="100%" stopColor={c} />
                </radialGradient>
              ))}
            </defs>
            <rect x={8} y={8} width={204} height={204} fill="none" stroke={INK} strokeWidth={2} rx={4} />
            {data.map((p, i) => {
              const sx = 8 + (Math.max(0, Math.min(10, p.x)) / 10) * 204;
              const sy = 8 + (1 - Math.max(0, Math.min(10, p.y)) / 10) * 204;
              const fill = result ? `url(#l17y-${result.labels[i] % COLORS.length})` : "#cbd5e1";
              return (
                <circle key={i} cx={sx} cy={sy} r={5}
                  fill={fill} stroke={INK} strokeWidth={1.5}
                  style={{ transition: "all 0.5s" }} />
              );
            })}
            {result && result.centroids.map((c, ci) => {
              const sx = 8 + (Math.max(0, Math.min(10, c.x)) / 10) * 204;
              const sy = 8 + (1 - Math.max(0, Math.min(10, c.y)) / 10) * 204;
              return (
                <circle key={`c-${ci}`} cx={sx} cy={sy} r={10}
                  fill={`url(#l17y-${ci % COLORS.length})`} stroke={INK} strokeWidth={2.5}
                  className="pulse-glow" style={{ color: COLORS[ci % COLORS.length] }} />
              );
            })}
          </svg>
        </div>

        {showElbow && (
          <div className="card-sketchy p-2 notebook-grid">
            <p className="font-hand text-xs font-bold text-center text-foreground mb-1">Elbow Plot</p>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
              <defs>
                <linearGradient id="l17y-line" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={COLORS[0]} />
                  <stop offset="100%" stopColor={COLORS[1]} />
                </linearGradient>
              </defs>
              <line x1={padL} y1={12} x2={padL} y2={12 + pH} stroke={INK} strokeWidth={2} />
              <line x1={padL} y1={12 + pH} x2={padL + pW} y2={12 + pH} stroke={INK} strokeWidth={2} />
              <text x={padL + pW / 2} y={chartH - 6} textAnchor="middle"
                fontFamily="Kalam" fill={INK} className="text-[10px] font-bold">K</text>
              <path d={elbowData.map((r, i) => `${i === 0 ? "M" : "L"}${padL + (i / 6) * pW},${12 + (1 - r.inertia / maxI) * pH}`).join(" ")}
                fill="none" stroke="url(#l17y-line)" strokeWidth={3} strokeLinecap="round" />
              {elbowData.map((r, i) => {
                const ex = padL + (i / 6) * pW;
                const ey = 12 + (1 - r.inertia / maxI) * pH;
                const isNat = i + 1 === naturalK;
                const isChosen = i + 1 === chosenK;
                return (
                  <g key={i}>
                    <circle cx={ex} cy={ey} r={isChosen ? 8 : 5}
                      fill={isNat ? COLORS[1] : isChosen ? COLORS[2] : COLORS[0]}
                      stroke={INK} strokeWidth={2}
                      className={isNat ? "pulse-glow" : ""}
                      style={isNat ? { color: COLORS[1] } : undefined} />
                    <text x={ex} y={12 + pH + 14} textAnchor="middle"
                      fontFamily="Kalam" fill={INK} className="text-[9px] font-bold">{i + 1}</text>
                  </g>
                );
              })}
            </svg>
            <div className="flex gap-3 justify-center mt-1">
              <span className="flex items-center gap-1 font-hand text-[10px] text-foreground">
                <span className="inline-block w-2.5 h-2.5 rounded-full border border-foreground" style={{ background: COLORS[2] }} /> Your K
              </span>
              <span className="flex items-center gap-1 font-hand text-[10px] text-foreground">
                <span className="inline-block w-2.5 h-2.5 rounded-full border border-foreground" style={{ background: COLORS[1] }} /> Best K
              </span>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="card-sketchy p-3 text-center font-hand text-sm"
          style={{ background: kDiff === 0 ? "#e6fff8" : kDiff === 1 ? "#fff8e6" : "#ffe8e8" }}>
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
    explanation: "A high silhouette score means each point is close to its own cluster center and far from other clusters  well-separated groups.",
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
      nextLessonHint="Next: Discover the Perceptron  the building block of neural networks!"
      story={
        <StorySection
          paragraphs={[
            "Aru stared at the clusters Byte had found. Something was bugging her.",
            "Aru: \"But how do I know how many groups to make? What if I pick the wrong number?\"",
            "Byte: \"Great question! We try K=1, 2, 3... and measure how tight the clusters are. When the improvement slows down  that's the elbow! That's the best K.\"",
            "Aru: \"So you literally look for a bend in a graph?\"",
            "Byte: \"Exactly! It's called the Elbow Method. Simple, visual, and surprisingly effective. Let me show you!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="The Elbow Method plots cluster tightness (inertia) against K. The 'elbow'  where the curve bends  indicates the optimal number of clusters. The Silhouette Score further validates cluster quality by measuring separation between groups."
        />
      }
    />
  );
}
