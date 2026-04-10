"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Layers, Sparkles, SlidersHorizontal, Palette, Play, RotateCcw } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

/* ---- helpers ---- */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const THEMES = [
  { name: "Coral",    node: "#ff6b6b", glow: "#ff8a8a", accent: "#ffd93d" },
  { name: "Mint",     node: "#4ecdc4", glow: "#7ee0d8", accent: "#ffd93d" },
  { name: "Lavender", node: "#b18cf2", glow: "#c9adf7", accent: "#ffd93d" },
  { name: "Sky",      node: "#6bb6ff", glow: "#94caff", accent: "#ffd93d" },
  { name: "Sunset",   node: "#ffb88c", glow: "#ffd0b3", accent: "#ff6b6b" },
];

const INK = "#2b2a35";

function ThemePicker({ idx, setIdx }: { idx: number; setIdx: (i: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Palette className="w-4 h-4 text-foreground/60" />
      <span className="font-hand text-sm font-bold">Theme:</span>
      <div className="flex gap-1.5">
        {THEMES.map((t, i) => (
          <button
            key={t.name}
            onClick={() => { playClick(); setIdx(i); }}
            title={t.name}
            className={`w-6 h-6 rounded-full border-2 transition-transform ${idx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
            style={{ background: t.node }}
          />
        ))}
      </div>
    </div>
  );
}

/* 2D loss function */
function loss2D(x: number, y: number): number {
  return 2.5 * (x - 0.5) * (x - 0.5) + 3.5 * (y - 0.45) * (y - 0.45) + 0.6 * (x - 0.5) * (y - 0.45);
}

function grad2D(x: number, y: number): [number, number] {
  return [
    5.0 * (x - 0.5) + 0.6 * (y - 0.45),
    7.0 * (y - 0.45) + 0.6 * (x - 0.5),
  ];
}

function lossLocal(x: number, y: number): number {
  const g1 = 3.0 * (x - 0.75) * (x - 0.75) + 3.0 * (y - 0.7) * (y - 0.7);
  const g2 = 4.0 * (x - 0.3) * (x - 0.3) + 4.0 * (y - 0.35) * (y - 0.35);
  const well1 = -0.8 * Math.exp(-g1 * 8);
  const well2 = -0.5 * Math.exp(-g2 * 8);
  return well1 + well2 + 1.2;
}

function gradLocal(x: number, y: number): [number, number] {
  const eps = 0.002;
  const dx = (lossLocal(x + eps, y) - lossLocal(x - eps, y)) / (2 * eps);
  const dy = (lossLocal(x, y + eps) - lossLocal(x, y - eps)) / (2 * eps);
  return [dx, dy];
}

const CW = 380;
const CH = 320;
const CPAD = 28;
function toSvgX(x: number): number { return CPAD + x * (CW - 2 * CPAD); }
function toSvgY(y: number): number { return CPAD + y * (CH - 2 * CPAD); }

function makeContours(fn: (x: number, y: number) => number, levels: number[]): { d: string; level: number }[] {
  const lines: { d: string; level: number }[] = [];
  const res = 50;
  for (const level of levels) {
    const segs: string[] = [];
    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const x0 = i / res, y0 = j / res;
        const x1 = (i + 1) / res;
        const y1 = (j + 1) / res;
        const v00 = fn(x0, y0) - level;
        const v10 = fn(x1, y0) - level;
        const v01 = fn(x0, y1) - level;
        if (v00 * v10 < 0) {
          const t = v00 / (v00 - v10);
          const ix = x0 + t * (x1 - x0);
          const sx = toSvgX(ix);
          const sy = toSvgY(y0);
          segs.push(`M${sx.toFixed(1)},${sy.toFixed(1)}L${sx.toFixed(1)},${(sy + (CH - 2 * CPAD) / res).toFixed(1)}`);
        }
        if (v00 * v01 < 0) {
          const t = v00 / (v00 - v01);
          const iy = y0 + t * (y1 - y0);
          const sx = toSvgX(x0);
          const sy = toSvgY(iy);
          segs.push(`M${sx.toFixed(1)},${sy.toFixed(1)}L${(sx + (CW - 2 * CPAD) / res).toFixed(1)},${sy.toFixed(1)}`);
        }
      }
    }
    if (segs.length > 0) lines.push({ d: segs.join(" "), level });
  }
  return lines;
}

const METHOD_COLORS = ["#6bb6ff", "#ff6b6b", "#4ecdc4"];

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Three Approaches (side-by-side)                          */
/* ------------------------------------------------------------------ */
function ThreeApproachesTab() {
  type PathEntry = [number, number];
  interface AgentState { path: PathEntry[]; x: number; y: number }

  const startX = 0.1;
  const startY = 0.85;
  const lr = 0.06;
  const [themeIdx, setThemeIdx] = useState(2);

  const initAgents = useCallback((): AgentState[] => [
    { path: [[startX, startY]], x: startX, y: startY },
    { path: [[startX, startY]], x: startX, y: startY },
    { path: [[startX, startY]], x: startX, y: startY },
  ], []);

  const [agents, setAgents] = useState<AgentState[]>(initAgents);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const animRef = useRef<number | null>(null);
  const randRef = useRef(mulberry32(7));

  const contours = useMemo(() => makeContours(loss2D, [0.05, 0.15, 0.3, 0.5, 0.8, 1.2, 1.8]), []);

  const names = ["Full Batch", "SGD", "Mini-Batch"];
  const subtitle = ["smooth", "jittery", "balanced"];

  const handleRun = useCallback(() => {
    playClick();
    setRunning(true);
    const rand = randRef.current;
    const states: AgentState[] = initAgents();
    let s = 0;

    const tick = () => {
      const [gxB, gyB] = grad2D(states[0].x, states[0].y);
      states[0].x = clamp(states[0].x - lr * gxB, 0.01, 0.99);
      states[0].y = clamp(states[0].y - lr * gyB, 0.01, 0.99);
      states[0].path = [...states[0].path, [states[0].x, states[0].y]];

      const [gxS, gyS] = grad2D(states[1].x, states[1].y);
      const noiseS = 0.6;
      states[1].x = clamp(states[1].x - lr * (gxS + (rand() - 0.5) * noiseS), 0.01, 0.99);
      states[1].y = clamp(states[1].y - lr * (gyS + (rand() - 0.5) * noiseS), 0.01, 0.99);
      states[1].path = [...states[1].path, [states[1].x, states[1].y]];

      const [gxM, gyM] = grad2D(states[2].x, states[2].y);
      const noiseM = 0.2;
      states[2].x = clamp(states[2].x - lr * (gxM + (rand() - 0.5) * noiseM), 0.01, 0.99);
      states[2].y = clamp(states[2].y - lr * (gyM + (rand() - 0.5) * noiseM), 0.01, 0.99);
      states[2].path = [...states[2].path, [states[2].x, states[2].y]];

      s++;
      setStep(s);
      setAgents(states.map((a) => ({ ...a, path: [...a.path] })));

      if (s < 60) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        playSuccess();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [initAgents]);

  const handleReset = useCallback(() => {
    playPop();
    setAgents(initAgents());
    setStep(0);
    setRunning(false);
    randRef.current = mulberry32(7);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, [initAgents]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        Three methods race to the minimum. Compare their paths side-by-side!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {agents.map((a, i) => (
          <div key={i} className="card-sketchy p-2 notebook-grid">
            <p className="font-hand text-xs text-center font-bold mb-1" style={{ color: METHOD_COLORS[i] }}>
              {names[i]} <span className="text-muted-foreground font-normal">({subtitle[i]})</span>
            </p>
            <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full">
              <defs>
                <radialGradient id={`ta-ball-${i}`} cx="35%" cy="30%">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
                  <stop offset="100%" stopColor={METHOD_COLORS[i]} />
                </radialGradient>
              </defs>

              {contours.map((c, ci) => (
                <path key={ci} d={c.d} fill="none" stroke={INK} strokeWidth={0.8} opacity={0.18 + ci * 0.07} />
              ))}

              {/* Min marker */}
              <circle cx={toSvgX(0.5)} cy={toSvgY(0.45)} r={6} fill="none" stroke={THEMES[themeIdx].accent} strokeWidth={2} strokeDasharray="3 2" className="wobble" />

              {/* Path */}
              {a.path.length > 1 && (
                <polyline
                  points={a.path.map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`).join(" ")}
                  fill="none" stroke={METHOD_COLORS[i]} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round"
                  className="signal-flow"
                  style={{ color: METHOD_COLORS[i], opacity: 0.85 }}
                />
              )}

              {/* Trail dots */}
              {a.path.map(([px, py], pi) => (
                pi < a.path.length - 1 ? (
                  <circle key={pi} cx={toSvgX(px)} cy={toSvgY(py)} r={2} fill={METHOD_COLORS[i]} opacity={0.4 + 0.01 * pi} />
                ) : null
              ))}

              {/* Current ball */}
              <circle
                cx={toSvgX(a.x)} cy={toSvgY(a.y)}
                r={9} fill={`url(#ta-ball-${i})`} stroke={INK} strokeWidth={2}
                className="pulse-glow"
                style={{ color: METHOD_COLORS[i] }}
              />
            </svg>
            <p className="font-hand text-[10px] text-center mt-1">loss: <strong>{loss2D(a.x, a.y).toFixed(3)}</strong></p>
          </div>
        ))}
      </div>

      <div className="text-center font-hand text-sm font-bold">Step: {step} / 60</div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40"
        >
          <Play className="w-4 h-4 inline mr-1" />
          {running ? "Running..." : "Run All"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35]"
        >
          <RotateCcw className="w-4 h-4 inline mr-1" />
          Reset
        </button>
      </div>

      <InfoBox variant="blue" title="Three Strategies">
        <strong>Full Batch:</strong> uses all data per step  smooth but slow.
        <br />
        <strong>SGD:</strong> uses one sample  fast but noisy.
        <br />
        <strong>Mini-Batch:</strong> uses a small group  the best of both worlds.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Noise Helps!                                              */
/* ------------------------------------------------------------------ */
function NoiseHelpsTab() {
  type PathEntry = [number, number];
  interface TrailState { path: PathEntry[]; x: number; y: number }

  const startX = 0.15;
  const startY = 0.2;
  const [themeIdx, setThemeIdx] = useState(0);

  const initTrails = useCallback((): TrailState[] => [
    { path: [[startX, startY]], x: startX, y: startY },
    { path: [[startX, startY]], x: startX, y: startY },
  ], []);

  const [trails, setTrails] = useState<TrailState[]>(initTrails);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const animRef = useRef<number | null>(null);
  const randRef = useRef(mulberry32(42));

  const contours = useMemo(() => makeContours(lossLocal, [0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1.1]), []);

  const lr = 0.04;

  const handleRun = useCallback(() => {
    playClick();
    setRunning(true);
    const rand = randRef.current;
    const states = initTrails();
    let s = 0;

    const tick = () => {
      const [gxB, gyB] = gradLocal(states[0].x, states[0].y);
      states[0].x = clamp(states[0].x - lr * gxB, 0.01, 0.99);
      states[0].y = clamp(states[0].y - lr * gyB, 0.01, 0.99);
      states[0].path = [...states[0].path, [states[0].x, states[0].y]];

      const [gxS, gyS] = gradLocal(states[1].x, states[1].y);
      const noise = 0.8;
      states[1].x = clamp(states[1].x - lr * (gxS + (rand() - 0.5) * noise), 0.01, 0.99);
      states[1].y = clamp(states[1].y - lr * (gyS + (rand() - 0.5) * noise), 0.01, 0.99);
      states[1].path = [...states[1].path, [states[1].x, states[1].y]];

      s++;
      setStep(s);
      setTrails(states.map((a) => ({ ...a, path: [...a.path] })));

      if (s < 100) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        playSuccess();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [initTrails]);

  const handleReset = useCallback(() => {
    playPop();
    setTrails(initTrails());
    setStep(0);
    setRunning(false);
    randRef.current = mulberry32(42);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, [initTrails]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const colors = ["#6bb6ff", "#ff6b6b"];
  const names = ["Full Batch (stuck)", "SGD (escapes)"];

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        This landscape has a local minimum (small dip) and a global minimum (deepest valley). Watch how SGD&apos;s noise helps escape the trap!
      </p>

      <div className="flex gap-3 justify-center flex-wrap">
        {names.map((n, i) => (
          <div key={n} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border-2 border-foreground bg-background">
            <div className="w-3 h-3 rounded-full border border-foreground" style={{ background: colors[i] }} />
            <span className="font-hand text-xs font-bold">{n}</span>
          </div>
        ))}
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox={`0 0 ${CW + 40} ${CH + 20}`} className="w-full max-w-[480px] mx-auto">
          <defs>
            {colors.map((c, i) => (
              <radialGradient key={i} id={`nh-ball-${i}`} cx="35%" cy="30%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
                <stop offset="100%" stopColor={c} />
              </radialGradient>
            ))}
          </defs>

          <g transform="translate(20,10)">
            {contours.map((c, i) => (
              <path key={i} d={c.d} fill="none" stroke={INK} strokeWidth={0.9} opacity={0.22 + i * 0.07} />
            ))}

            {/* Local min marker */}
            <circle cx={toSvgX(0.3)} cy={toSvgY(0.35)} r={7} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 2" />
            <text x={toSvgX(0.3)} y={toSvgY(0.35) - 12} textAnchor="middle" fill="#f59e0b" fontFamily="Kalam" className="text-[10px] font-bold">local</text>

            {/* Global min marker */}
            <circle cx={toSvgX(0.75)} cy={toSvgY(0.7)} r={7} fill="none" stroke="#22c55e" strokeWidth={2} strokeDasharray="3 2" className="wobble" />
            <text x={toSvgX(0.75)} y={toSvgY(0.7) - 12} textAnchor="middle" fill="#22c55e" fontFamily="Kalam" className="text-[10px] font-bold">global</text>

            {trails.map((t, i) => (
              <g key={i}>
                {t.path.length > 1 && (
                  <polyline
                    points={t.path.map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`).join(" ")}
                    fill="none" stroke={colors[i]} strokeWidth={2} opacity={0.65} strokeLinejoin="round" strokeLinecap="round"
                    className="signal-flow"
                    style={{ color: colors[i] }}
                  />
                )}
                <circle
                  cx={toSvgX(t.x)} cy={toSvgY(t.y)}
                  r={9} fill={`url(#nh-ball-${i})`} stroke={INK} strokeWidth={2}
                  className="pulse-glow"
                  style={{ color: colors[i] }}
                />
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="flex gap-4 justify-center text-xs font-hand flex-wrap">
        <span>Batch loss: <strong className="text-blue-600">{lossLocal(trails[0].x, trails[0].y).toFixed(3)}</strong></span>
        <span>SGD loss: <strong className="text-red-600">{lossLocal(trails[1].x, trails[1].y).toFixed(3)}</strong></span>
        <span className="text-muted-foreground">Step: {step}/100</span>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40"
        >
          <Play className="w-4 h-4 inline mr-1" />
          {running ? "Running..." : "Run"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35]"
        >
          <RotateCcw className="w-4 h-4 inline mr-1" />
          Restart
        </button>
      </div>

      <InfoBox variant="amber" title="Noise as a Feature">
        SGD&apos;s randomness is not a bug  it is a feature! The noisy updates help the model escape local minima and explore more of the loss landscape, often finding a better global solution.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Batch Size Slider                                         */
/* ------------------------------------------------------------------ */
function BatchSizeTab() {
  const N = 64;
  const batchOptions = [1, 4, 8, 16, 32, 64];
  const [batchIdx, setBatchIdx] = useState(2);
  const batchSize = batchOptions[batchIdx];
  const [themeIdx, setThemeIdx] = useState(3);
  const theme = THEMES[themeIdx];

  const [losses, setLosses] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [wallTime, setWallTime] = useState(0);
  const animRef = useRef<number | null>(null);

  const handleRun = useCallback(() => {
    playClick();
    setRunning(true);
    setLosses([]);
    setWallTime(0);
    const rand = mulberry32(batchSize * 13 + 7);
    let cx = 0.1;
    let cy = 0.85;
    const lr = 0.06;
    const noiseScale = 0.8 / Math.sqrt(batchSize);
    const timePerStep = Math.sqrt(batchSize) * 0.5;
    let s = 0;
    let time = 0;
    const collected: number[] = [];
    const maxSteps = 80;

    const tick = () => {
      const [gx, gy] = grad2D(cx, cy);
      cx = clamp(cx - lr * (gx + (rand() - 0.5) * noiseScale), 0.01, 0.99);
      cy = clamp(cy - lr * (gy + (rand() - 0.5) * noiseScale), 0.01, 0.99);
      const l = loss2D(cx, cy);
      collected.push(l);
      time += timePerStep;
      s++;
      setLosses([...collected]);
      setWallTime(Math.round(time));

      if (s < maxSteps) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        playSuccess();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [batchSize]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const handleReset = useCallback(() => {
    playPop();
    setLosses([]);
    setWallTime(0);
    setRunning(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  const chartW = 480;
  const chartH = 220;
  const maxLoss = 2.5;

  const finalLoss = losses.length > 0 ? losses[losses.length - 1] : null;

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        Adjust batch size and run training. Smaller batches are noisier but each step is faster. Find the sweet spot!
      </p>

      <div className="card-sketchy p-3 flex items-center gap-3 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold">Batch size:</span>
        <input
          type="range" min={0} max={batchOptions.length - 1} step={1}
          value={batchIdx}
          onChange={(e) => { setBatchIdx(Number(e.target.value)); playPop(); }}
          className="w-48 accent-accent-coral"
          disabled={running}
        />
        <span className="font-hand text-base font-bold" style={{ color: theme.node }}>
          {batchSize}{batchSize === 1 ? " (SGD)" : batchSize === N ? " (Full Batch)" : ""}
        </span>
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-[560px] mx-auto">
          <text x={chartW / 2} y={16} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">Loss over training steps</text>

          <line x1={42} y1={chartH - 32} x2={chartW - 22} y2={chartH - 32} stroke={INK} strokeWidth={2} />
          <line x1={42} y1={26} x2={42} y2={chartH - 32} stroke={INK} strokeWidth={2} />

          {losses.length > 1 && (
            <polyline
              points={losses.map((l, i) => {
                const sx = 42 + (i / Math.max(losses.length - 1, 1)) * (chartW - 64);
                const sy = 26 + (1 - clamp(l, 0, maxLoss) / maxLoss) * (chartH - 60);
                return `${sx.toFixed(1)},${sy.toFixed(1)}`;
              }).join(" ")}
              fill="none" stroke={theme.node} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            />
          )}

          {/* Final ball pulse */}
          {losses.length > 1 && (() => {
            const i = losses.length - 1;
            const sx = 42 + (i / Math.max(losses.length - 1, 1)) * (chartW - 64);
            const sy = 26 + (1 - clamp(losses[i], 0, maxLoss) / maxLoss) * (chartH - 60);
            return (
              <circle cx={sx} cy={sy} r={7} fill={theme.glow} stroke={INK} strokeWidth={2} className="pulse-glow" style={{ color: theme.node }} />
            );
          })()}

          <text x={chartW / 2} y={chartH - 10} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[10px] font-bold">Steps</text>
        </svg>
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <div className="card-sketchy px-3 py-2 text-center">
          <p className="font-hand text-[11px] font-bold text-muted-foreground">Wall-Clock Time</p>
          <p className="font-hand text-base font-bold">{wallTime} units</p>
        </div>
        <div className="card-sketchy px-3 py-2 text-center">
          <p className="font-hand text-[11px] font-bold text-muted-foreground">Final Loss</p>
          <p className="font-hand text-base font-bold" style={{ color: theme.node }}>{finalLoss !== null ? finalLoss.toFixed(4) : "---"}</p>
        </div>
        <div className="card-sketchy px-3 py-2 text-center">
          <p className="font-hand text-[11px] font-bold text-muted-foreground">Steps</p>
          <p className="font-hand text-base font-bold">{losses.length}</p>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40"
        >
          <Play className="w-4 h-4 inline mr-1" />
          {running ? "Training..." : "Run"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35]"
        >
          <RotateCcw className="w-4 h-4 inline mr-1" />
          Reset
        </button>
      </div>

      <InfoBox variant="indigo" title="Batch Size Tradeoff">
        Smaller batches = faster updates but noisy. Larger batches = smoother updates but each step costs more compute. Mini-batch (8-32) often gives the best wall-clock convergence time.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is the main difference between SGD and Full Batch gradient descent?",
    options: [
      "SGD uses all data per step, Batch uses one sample",
      "SGD uses one sample per step, Batch uses all data",
      "They are exactly the same",
      "SGD is always better",
    ],
    correctIndex: 1,
    explanation: "SGD (Stochastic Gradient Descent) updates weights using a single sample at a time, while Full Batch uses the entire dataset for each update.",
  },
  {
    question: "Why can SGD's noise be helpful?",
    options: [
      "It makes training slower",
      "It helps escape local minima",
      "It increases the loss",
      "It removes the need for a learning rate",
    ],
    correctIndex: 1,
    explanation: "The noise in SGD's updates can help the optimizer bounce out of local minima and potentially find the global minimum.",
  },
  {
    question: "What is a mini-batch?",
    options: [
      "Using all data at once",
      "Using a single data point",
      "Using a small random subset of the data",
      "Using no data at all",
    ],
    correctIndex: 2,
    explanation: "Mini-batch gradient descent uses a small random subset of the data for each update, balancing the smoothness of full batch with the speed of SGD.",
  },
  {
    question: "As batch size increases, what happens to the gradient estimate?",
    options: [
      "It becomes noisier",
      "It becomes smoother and more accurate",
      "It stays exactly the same",
      "It becomes random",
    ],
    correctIndex: 1,
    explanation: "Larger batches average over more samples, giving a smoother and more accurate estimate of the true gradient, but at higher computational cost per step.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L25_SGDvsBatchActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "three",
        label: "Three Approaches",
        icon: <Layers className="w-4 h-4" />,
        content: <ThreeApproachesTab />,
      },
      {
        id: "noise",
        label: "Noise Helps!",
        icon: <Sparkles className="w-4 h-4" />,
        content: <NoiseHelpsTab />,
      },
      {
        id: "batch-size",
        label: "Batch Size Slider",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <BatchSizeTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="SGD vs Batch Gradient Descent"
      level={7}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Enter the world of computer vision  how computers see images!"
      story={
        <StorySection
          paragraphs={[
            "Aru looked at her mountain of homework problems and sighed.",
            "Aru: \"Do I really have to check ALL my homework answers before I can fix a single mistake?\"",
            "Byte: \"Great question! With Full Batch, yes  you look at everything first, then make one careful correction. But with SGD, you fix your approach after each single problem!\"",
            "Aru: \"SGD sounds faster. But wouldn't I make wild corrections from just one problem?\"",
            "Byte: \"That's the tradeoff! Mini-Batch is the sweet spot  you look at a small group of problems, get a decent idea of your mistakes, and correct. Fast AND stable!\"",
          ]}
          conceptTitle="SGD vs Batch"
          conceptSummary="Full Batch uses all data per update (smooth but slow), SGD uses one sample (fast but noisy), and Mini-Batch uses a small group (balanced). Mini-batch gradient descent is the standard approach in modern deep learning."
        />
      }
    />
  );
}
