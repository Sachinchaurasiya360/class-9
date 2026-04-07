import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { MousePointer, Play, Columns, Palette } from "lucide-react";
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

function gaussNoise(rand: () => number, std: number): number {
  const u1 = Math.max(rand(), 1e-10);
  const u2 = rand();
  return std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

interface Pt { x: number; y: number }

const INK = "#2b2a35";

const THEMES = [
  { name: "Coral", colors: ["#ff6b6b", "#4ecdc4", "#ffd93d", "#b18cf2"] },
  { name: "Sky", colors: ["#6bb6ff", "#b18cf2", "#ffd93d", "#ff6b6b"] },
  { name: "Sunset", colors: ["#ffb88c", "#ff6b6b", "#ffd93d", "#4ecdc4"] },
  { name: "Mint", colors: ["#4ecdc4", "#6bb6ff", "#b18cf2", "#ffd93d"] },
];

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

/* ---- shared SVG plot helpers ---- */
const VB_W = 460;
const VB_H = 360;
const PAD_L = 40;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 36;
const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;
const toSx = (x: number) => PAD_L + (x / 10) * PLOT_W;
const toSy = (y: number) => PAD_T + (1 - y / 10) * PLOT_H;

function PlotFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="card-sketchy p-3 notebook-grid">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full max-w-[560px] mx-auto">
        <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H}
          fill="none" stroke={INK} strokeWidth={2} rx={6} />
        <text x={PAD_L + PLOT_W / 2} y={VB_H - 8} textAnchor="middle"
          fontFamily="Kalam" fill={INK} className="text-[12px] font-bold">Feature 1</text>
        <text x={14} y={PAD_T + PLOT_H / 2} textAnchor="middle"
          transform={`rotate(-90, 14, ${PAD_T + PLOT_H / 2})`}
          fontFamily="Kalam" fill={INK} className="text-[12px] font-bold">Feature 2</text>
        {label && (
          <text x={PAD_L + 8} y={PAD_T + 16} fontFamily="Kalam" fill={INK} className="text-[11px] font-bold">{label}</text>
        )}
        {children}
      </svg>
    </div>
  );
}

function ThemeBar({ themeIdx, setThemeIdx }: { themeIdx: number; setThemeIdx: (i: number) => void }) {
  return (
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
  );
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
  const [themeIdx, setThemeIdx] = useState(0);
  const COLORS = THEMES[themeIdx].colors;
  const [converged, setConverged] = useState(false);

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
    const newLabels = assignClusters(DATA, newC);
    const conv = newLabels.every((l, i) => l === labels[i]);
    setLabels(newLabels);
    if (conv) {
      playSuccess();
      setConverged(true);
    }
    setPhase("assign");
  }, [phase, labels, k]);

  const handleReset = useCallback(() => {
    playClick();
    setCentroids([]);
    setLabels([]);
    setPhase("place");
    setIteration(0);
    setConverged(false);
  }, []);

  return (
    <div className="space-y-4">
      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} />

      {/* K selector */}
      <div className="flex items-center gap-3 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold text-foreground">K =</span>
        {[2, 3, 4].map((v) => (
          <button
            key={v}
            onClick={() => { playClick(); setK(v); handleReset(); }}
            className={`w-9 h-9 rounded-full font-hand text-sm font-bold border-2 border-foreground transition-all ${
              k === v ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {v}
          </button>
        ))}
        <span className="font-hand text-sm text-foreground ml-2">Iter: <b>{iteration}</b></span>
      </div>

      {phase === "place" && (
        <p className="text-center font-hand text-xs text-muted-foreground">
          Click on the chart to place {k - centroids.length} more centroid{k - centroids.length !== 1 ? "s" : ""}.
        </p>
      )}

      <PlotFrame label={converged ? "Converged!" : phase}>
        <defs>
          {COLORS.map((c, i) => (
            <radialGradient key={i} id={`l16s-${i}`} cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor={c} />
            </radialGradient>
          ))}
        </defs>
        {/* Click target */}
        <rect
          x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H}
          fill="transparent" className="cursor-crosshair"
          onClick={(e) => {
            const svg = (e.target as SVGRectElement).ownerSVGElement!;
            const pt = svg.createSVGPoint();
            pt.x = e.clientX; pt.y = e.clientY;
            const sp = pt.matrixTransform(svg.getScreenCTM()!.inverse());
            const px = ((sp.x - PAD_L) / PLOT_W) * 10;
            const py = (1 - (sp.y - PAD_T) / PLOT_H) * 10;
            handlePlaceCentroid(px, py);
          }}
        />
        {/* Lines from points to centroids */}
        {labels.length > 0 && centroids.length > 0 && DATA.map((p, i) => (
          <line
            key={`line-${i}`}
            x1={toSx(p.x)} y1={toSy(p.y)}
            x2={toSx(centroids[labels[i]].x)} y2={toSy(centroids[labels[i]].y)}
            stroke={COLORS[labels[i]]} strokeWidth={1.5} opacity={0.4}
          />
        ))}
        {/* Data points */}
        {DATA.map((p, i) => (
          <circle
            key={i}
            cx={toSx(p.x)} cy={toSy(p.y)} r={6}
            fill={labels.length > 0 ? `url(#l16s-${labels[i]})` : "#cbd5e1"}
            stroke={INK} strokeWidth={1.8}
            style={{ transition: "all 0.5s" }}
          />
        ))}
        {/* Centroids */}
        {centroids.map((c, i) => (
          <g key={`c-${i}`} style={{ transition: "all 0.6s" }}>
            <circle cx={toSx(c.x)} cy={toSy(c.y)} r={14}
              fill={`url(#l16s-${i})`} stroke={INK} strokeWidth={2.5}
              className="pulse-glow" style={{ color: COLORS[i] }} />
            <text x={toSx(c.x)} y={toSy(c.y) + 5} textAnchor="middle"
              fontFamily="Kalam" fill={INK} className="text-[11px] font-bold pointer-events-none">
              C{i + 1}
            </text>
            {converged && (
              <g>
                {Array.from({ length: 8 }).map((_, k) => {
                  const angle = (k / 8) * Math.PI * 2;
                  return (
                    <line key={k}
                      x1={toSx(c.x)} y1={toSy(c.y)}
                      x2={toSx(c.x) + Math.cos(angle) * 30}
                      y2={toSy(c.y) + Math.sin(angle) * 30}
                      stroke={COLORS[i]} strokeWidth={2.5} strokeLinecap="round"
                      className="spark" style={{ animationDelay: `${k * 0.05}s` }} />
                  );
                })}
              </g>
            )}
          </g>
        ))}
      </PlotFrame>

      {/* Step buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button onClick={handleAssign} disabled={phase !== "assign"}
          className="btn-sketchy text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          Assign Points
        </button>
        <button onClick={handleUpdate} disabled={phase !== "update"}
          className="btn-sketchy text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          Update Centroids
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
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
  const [converged, setConverged] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const COLORS = THEMES[themeIdx].colors;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = useCallback(() => {
    setCentroids((prev) => {
      const oldLabels = assignClusters(DATA, prev);
      const newC = updateCentroids(DATA, oldLabels, 3);
      const newLabels = assignClusters(DATA, newC);
      const inertia = totalInertia(DATA, newLabels, newC);
      setLabels(newLabels);
      setTrail((t) => t.map((arr, i) => [...arr, prev[i]]));
      setInertiaHistory((h) => [...h, inertia]);
      setIteration((n) => n + 1);
      const conv = newLabels.every((l, i) => l === oldLabels[i]);
      if (conv) { setPlaying(false); setConverged(true); playSuccess(); }
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
    setConverged(false);
    const init: Pt[] = [{ x: 1, y: 9 }, { x: 9, y: 1 }, { x: 5, y: 5 }];
    setCentroids(init);
    setLabels(assignClusters(DATA, init));
    setTrail([[], [], []]);
    setInertiaHistory([]);
    setIteration(0);
  }, []);

  // Inertia chart dimensions
  const chartW = 440;
  const chartH = 100;
  const maxInertia = inertiaHistory.length > 0 ? Math.max(...inertiaHistory) : 100;

  return (
    <div className="space-y-4">
      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} />

      <PlotFrame label={converged ? "Converged!" : `Iteration ${iteration}`}>
        <defs>
          {COLORS.map((c, i) => (
            <radialGradient key={i} id={`l16c-${i}`} cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor={c} />
            </radialGradient>
          ))}
        </defs>
        {/* Trails */}
        {trail.map((arr, ci) =>
          arr.map((p, pi) => (
            <circle key={`tr-${ci}-${pi}`} cx={toSx(p.x)} cy={toSy(p.y)} r={3}
              fill={COLORS[ci]} opacity={0.3} stroke={INK} strokeWidth={0.5} />
          )),
        )}
        {/* Lines */}
        {DATA.map((p, i) => (
          <line key={`l-${i}`}
            x1={toSx(p.x)} y1={toSy(p.y)}
            x2={toSx(centroids[labels[i]].x)} y2={toSy(centroids[labels[i]].y)}
            stroke={COLORS[labels[i]]} strokeWidth={1} opacity={0.3} />
        ))}
        {/* Points */}
        {DATA.map((p, i) => (
          <circle key={i} cx={toSx(p.x)} cy={toSy(p.y)} r={6}
            fill={`url(#l16c-${labels[i]})`} stroke={INK} strokeWidth={1.8}
            style={{ transition: "all 0.4s" }} />
        ))}
        {/* Centroids with pulse-glow */}
        {centroids.map((c, i) => (
          <g key={`c-${i}`} style={{ transition: "all 0.5s" }}>
            <circle cx={toSx(c.x)} cy={toSy(c.y)} r={13}
              fill={`url(#l16c-${i})`} stroke={INK} strokeWidth={2.5}
              className="pulse-glow" style={{ color: COLORS[i] }} />
            {converged && (
              <g>
                {Array.from({ length: 8 }).map((_, k) => {
                  const angle = (k / 8) * Math.PI * 2;
                  return (
                    <line key={k}
                      x1={toSx(c.x)} y1={toSy(c.y)}
                      x2={toSx(c.x) + Math.cos(angle) * 28}
                      y2={toSy(c.y) + Math.sin(angle) * 28}
                      stroke={COLORS[i]} strokeWidth={2.5} strokeLinecap="round"
                      className="spark" style={{ animationDelay: `${k * 0.05}s` }} />
                  );
                })}
              </g>
            )}
          </g>
        ))}
      </PlotFrame>

      {/* Inertia mini-chart */}
      {inertiaHistory.length > 0 && (
        <div className="card-sketchy p-3">
          <svg viewBox={`0 0 ${chartW} ${chartH + 24}`} className="w-full max-w-[480px] mx-auto">
            <text x={chartW / 2} y={14} textAnchor="middle" fontFamily="Kalam" fill={INK}
              className="text-[11px] font-bold">Inertia (lower = tighter)</text>
            {inertiaHistory.map((val, i) => {
              const bx = 30 + (i / Math.max(inertiaHistory.length - 1, 1)) * (chartW - 50);
              const by = 24 + (1 - val / maxInertia) * chartH;
              return (
                <g key={i}>
                  {i > 0 && (
                    <line
                      x1={30 + ((i - 1) / Math.max(inertiaHistory.length - 1, 1)) * (chartW - 50)}
                      y1={24 + (1 - inertiaHistory[i - 1] / maxInertia) * chartH}
                      x2={bx} y2={by} stroke={COLORS[0]} strokeWidth={2.5} />
                  )}
                  <circle cx={bx} cy={by} r={4} fill={COLORS[0]} stroke={INK} strokeWidth={1.5} />
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 items-center justify-center flex-wrap">
        <button onClick={() => { playClick(); setPlaying((p) => !p); }} className="btn-sketchy text-sm">
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={() => { playClick(); if (!playing) step(); }} disabled={playing}
          className="btn-sketchy text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          Step
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          Reset
        </button>
        <div className="flex items-center gap-1.5 ml-2">
          <span className="font-hand text-xs text-foreground font-bold">Speed:</span>
          <input type="range" min={100} max={1200} step={100} value={1300 - speed}
            onChange={(e) => setSpeed(1300 - Number(e.target.value))}
            className="w-24 accent-accent-coral" />
        </div>
        <span className="font-hand text-xs text-foreground">Iter: {iteration}</span>
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
  const [themeIdx, setThemeIdx] = useState(0);
  const COLORS = THEMES[themeIdx].colors;

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
      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} />
      <p className="font-hand text-sm text-center text-foreground">Compare K=2, K=3, and K=4 on the same dataset. Which K looks best?</p>

      <div className="flex justify-center">
        <button onClick={runAll} disabled={running} className="btn-sketchy text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {results.length > 0 ? "Run Again" : "Run K-Means"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {ks.map((kVal, ki) => {
            const r = results[ki];
            return (
              <div key={kVal} className="card-sketchy p-2 notebook-grid">
                <p className="font-hand text-xs font-bold text-center text-foreground mb-1">K = {kVal}</p>
                <svg viewBox="0 0 160 160" className="w-full">
                  <defs>
                    {COLORS.map((c, i) => (
                      <radialGradient key={i} id={`l16d-${kVal}-${i}`} cx="35%" cy="30%">
                        <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
                        <stop offset="100%" stopColor={c} />
                      </radialGradient>
                    ))}
                  </defs>
                  <rect x={6} y={6} width={148} height={148} fill="none" stroke={INK} strokeWidth={2} rx={4} />
                  {DATA.map((p, i) => {
                    const sx = 6 + (p.x / 10) * 148;
                    const sy = 6 + (1 - p.y / 10) * 148;
                    return (
                      <circle key={i} cx={sx} cy={sy} r={4}
                        fill={`url(#l16d-${kVal}-${r.labels[i] % COLORS.length})`}
                        stroke={INK} strokeWidth={1} />
                    );
                  })}
                  {r.centroids.map((c, ci) => {
                    const sx = 6 + (c.x / 10) * 148;
                    const sy = 6 + (1 - c.y / 10) * 148;
                    return (
                      <circle key={`c-${ci}`} cx={sx} cy={sy} r={8}
                        fill={`url(#l16d-${kVal}-${ci % COLORS.length})`}
                        stroke={INK} strokeWidth={2}
                        className="pulse-glow" style={{ color: COLORS[ci % COLORS.length] }} />
                    );
                  })}
                </svg>
                <p className="font-hand text-[10px] text-center text-muted-foreground mt-1">
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
    explanation: "K-Means converges when the assign step produces the same clusters as the previous iteration  nothing changes anymore.",
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
            "Aru: \"That's like magic  the centers just... find the right spots?\"",
            "Byte: \"It's not magic  it's math! Each step makes the groups a little tighter. That's K-Means clustering.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="K-Means clustering works in two alternating steps: (1) assign each point to the nearest centroid, and (2) move each centroid to the mean of its assigned points. Repeat until the assignments stop changing."
        />
      }
    />
  );
}
