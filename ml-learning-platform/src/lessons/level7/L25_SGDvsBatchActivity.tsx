import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Layers, Sparkles, SlidersHorizontal } from "lucide-react";
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

/* 2D loss function with single minimum for contour tab */
function loss2D(x: number, y: number): number {
  return 2.5 * (x - 0.5) * (x - 0.5) + 3.5 * (y - 0.45) * (y - 0.45) + 0.6 * (x - 0.5) * (y - 0.45);
}

function grad2D(x: number, y: number): [number, number] {
  return [
    5.0 * (x - 0.5) + 0.6 * (y - 0.45),
    7.0 * (y - 0.45) + 0.6 * (x - 0.5),
  ];
}

/* 2D loss with local minimum for noise-helps tab */
function lossLocal(x: number, y: number): number {
  /* Global min near (0.75, 0.7), local min near (0.3, 0.35) */
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

/* SVG constants */
const CW = 400;
const CH = 340;
const CPAD = 30;
function toSvgX(x: number): number { return CPAD + x * (CW - 2 * CPAD); }
function toSvgY(y: number): number { return CPAD + y * (CH - 2 * CPAD); }

/* Contour lines generator */
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

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Three Approaches                                         */
/* ------------------------------------------------------------------ */
function ThreeApproachesTab() {
  type PathEntry = [number, number];
  interface AgentState { path: PathEntry[]; x: number; y: number }

  const startX = 0.1;
  const startY = 0.85;
  const lr = 0.06;

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

  const colors = ["#3b82f6", "#ef4444", "#22c55e"];
  const names = ["Full Batch", "SGD", "Mini-Batch"];

  const handleRun = useCallback(() => {
    playClick();
    setRunning(true);
    const rand = randRef.current;
    const states: AgentState[] = initAgents();
    let s = 0;

    const tick = () => {
      /* Full Batch: clean gradient */
      const [gxB, gyB] = grad2D(states[0].x, states[0].y);
      states[0].x = clamp(states[0].x - lr * gxB, 0.01, 0.99);
      states[0].y = clamp(states[0].y - lr * gyB, 0.01, 0.99);
      states[0].path = [...states[0].path, [states[0].x, states[0].y]];

      /* SGD: very noisy gradient */
      const [gxS, gyS] = grad2D(states[1].x, states[1].y);
      const noiseS = 0.6;
      states[1].x = clamp(states[1].x - lr * (gxS + (rand() - 0.5) * noiseS), 0.01, 0.99);
      states[1].y = clamp(states[1].y - lr * (gyS + (rand() - 0.5) * noiseS), 0.01, 0.99);
      states[1].path = [...states[1].path, [states[1].x, states[1].y]];

      /* Mini-Batch: moderate noise */
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
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Watch three methods descend simultaneously. Full Batch is smooth, SGD is noisy, Mini-Batch is in between.
      </p>

      {/* Legend */}
      <div className="flex gap-4 justify-center">
        {names.map((n, i) => (
          <div key={n} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: colors[i] }} />
            <span className="text-xs text-slate-600">{n}</span>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full max-w-[440px] mx-auto bg-slate-50 rounded-xl border border-slate-200">
        {contours.map((c, i) => (
          <path key={i} d={c.d} fill="none" stroke="#6366f1" strokeWidth={0.7} opacity={0.25 + i * 0.07} />
        ))}

        {/* Min marker */}
        <circle cx={toSvgX(0.5)} cy={toSvgY(0.45)} r={4} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="3 2" />

        {/* Paths */}
        {agents.map((a, i) => (
          <g key={i}>
            {a.path.length > 1 && (
              <polyline
                points={a.path.map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`).join(" ")}
                fill="none" stroke={colors[i]} strokeWidth={1.5} opacity={0.7} strokeLinejoin="round"
              />
            )}
            <circle
              cx={toSvgX(a.x)} cy={toSvgY(a.y)}
              r={6} fill={colors[i]} stroke="#fff" strokeWidth={2}
            />
          </g>
        ))}
      </svg>

      <div className="text-center text-xs text-slate-500">Step: {step} / 60</div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          {running ? "Running..." : "Run All"}
        </button>
        <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300">
          Reset
        </button>
      </div>

      <InfoBox variant="blue" title="Three Strategies">
        <strong>Full Batch:</strong> uses all data per step — smooth but slow.
        <br />
        <strong>SGD:</strong> uses one sample — fast but noisy.
        <br />
        <strong>Mini-Batch:</strong> uses a small group — the best of both worlds.
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
      /* Full Batch: clean gradient => gets stuck in local min */
      const [gxB, gyB] = gradLocal(states[0].x, states[0].y);
      states[0].x = clamp(states[0].x - lr * gxB, 0.01, 0.99);
      states[0].y = clamp(states[0].y - lr * gyB, 0.01, 0.99);
      states[0].path = [...states[0].path, [states[0].x, states[0].y]];

      /* SGD: noisy gradient => escapes local min */
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

  const colors = ["#3b82f6", "#ef4444"];
  const names = ["Full Batch (stuck)", "SGD (escapes)"];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        This landscape has a local minimum (small dip) and a global minimum (deepest valley). Watch how SGD&apos;s noise helps escape the trap!
      </p>

      <div className="flex gap-4 justify-center">
        {names.map((n, i) => (
          <div key={n} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: colors[i] }} />
            <span className="text-xs text-slate-600">{n}</span>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full max-w-[440px] mx-auto bg-slate-50 rounded-xl border border-slate-200">
        {contours.map((c, i) => (
          <path key={i} d={c.d} fill="none" stroke="#6366f1" strokeWidth={0.7} opacity={0.25 + i * 0.07} />
        ))}

        {/* Local min marker */}
        <circle cx={toSvgX(0.3)} cy={toSvgY(0.35)} r={5} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={toSvgX(0.3)} y={toSvgY(0.35) - 10} textAnchor="middle" className="text-[8px] fill-amber-600 font-medium">local</text>

        {/* Global min marker */}
        <circle cx={toSvgX(0.75)} cy={toSvgY(0.7)} r={5} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={toSvgX(0.75)} y={toSvgY(0.7) - 10} textAnchor="middle" className="text-[8px] fill-green-600 font-medium">global</text>

        {/* Trails */}
        {trails.map((t, i) => (
          <g key={i}>
            {t.path.length > 1 && (
              <polyline
                points={t.path.map(([px, py]) => `${toSvgX(px).toFixed(1)},${toSvgY(py).toFixed(1)}`).join(" ")}
                fill="none" stroke={colors[i]} strokeWidth={1.5} opacity={0.6} strokeLinejoin="round"
              />
            )}
            <circle cx={toSvgX(t.x)} cy={toSvgY(t.y)} r={6} fill={colors[i]} stroke="#fff" strokeWidth={2} />
          </g>
        ))}
      </svg>

      <div className="flex gap-4 justify-center text-xs">
        <span>Batch loss: <strong className="text-blue-600">{lossLocal(trails[0].x, trails[0].y).toFixed(3)}</strong></span>
        <span>SGD loss: <strong className="text-red-600">{lossLocal(trails[1].x, trails[1].y).toFixed(3)}</strong></span>
        <span className="text-slate-400">Step: {step}/100</span>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          {running ? "Running..." : "Run"}
        </button>
        <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300">
          Restart
        </button>
      </div>

      <InfoBox variant="amber" title="Noise as a Feature">
        SGD&apos;s randomness is not a bug — it is a feature! The noisy updates help the model escape local minima and explore more of the loss landscape, often finding a better global solution.
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

  const [losses, setLosses] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [wallTime, setWallTime] = useState(0);
  const animRef = useRef<number | null>(null);

  /* Simulate training */
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

  /* Chart */
  const chartW = 460;
  const chartH = 200;
  const maxLoss = 2.5;

  const finalLoss = losses.length > 0 ? losses[losses.length - 1] : null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Adjust batch size and run training. Smaller batches are noisier but each step is faster. Find the sweet spot!
      </p>

      {/* Batch size slider */}
      <div className="flex items-center gap-3 justify-center">
        <span className="text-xs text-slate-500">Batch size:</span>
        <input
          type="range" min={0} max={batchOptions.length - 1} step={1}
          value={batchIdx}
          onChange={(e) => { setBatchIdx(Number(e.target.value)); playPop(); }}
          className="w-48 accent-indigo-600"
          disabled={running}
        />
        <span className="text-sm font-bold text-indigo-700">
          {batchSize}{batchSize === 1 ? " (SGD)" : batchSize === N ? " (Full Batch)" : ""}
        </span>
      </div>

      {/* Loss chart */}
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-[500px] mx-auto bg-slate-50 rounded-xl border border-slate-200">
        <text x={chartW / 2} y={16} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">Loss over training steps</text>

        {/* Axes */}
        <line x1={40} y1={chartH - 30} x2={chartW - 20} y2={chartH - 30} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={40} y1={25} x2={40} y2={chartH - 30} stroke="#cbd5e1" strokeWidth={1} />

        {losses.length > 1 && (
          <polyline
            points={losses.map((l, i) => {
              const sx = 40 + (i / Math.max(losses.length - 1, 1)) * (chartW - 60);
              const sy = 25 + (1 - clamp(l, 0, maxLoss) / maxLoss) * (chartH - 55);
              return `${sx.toFixed(1)},${sy.toFixed(1)}`;
            }).join(" ")}
            fill="none" stroke="#6366f1" strokeWidth={2}
          />
        )}

        <text x={chartW / 2} y={chartH - 8} textAnchor="middle" className="text-[9px] fill-slate-400">Steps</text>
      </svg>

      {/* Stats */}
      <div className="flex gap-4 justify-center flex-wrap">
        <div className="text-center bg-white border border-slate-200 rounded-lg px-3 py-2">
          <p className="text-[10px] text-slate-500 font-medium">Wall-Clock Time</p>
          <p className="text-sm font-bold text-slate-700">{wallTime} units</p>
        </div>
        <div className="text-center bg-white border border-slate-200 rounded-lg px-3 py-2">
          <p className="text-[10px] text-slate-500 font-medium">Final Loss</p>
          <p className="text-sm font-bold text-indigo-600">{finalLoss !== null ? finalLoss.toFixed(4) : "---"}</p>
        </div>
        <div className="text-center bg-white border border-slate-200 rounded-lg px-3 py-2">
          <p className="text-[10px] text-slate-500 font-medium">Steps</p>
          <p className="text-sm font-bold text-slate-700">{losses.length}</p>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          {running ? "Training..." : "Run"}
        </button>
        <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300">
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
      nextLessonHint="Next: Enter the world of computer vision — how computers see images!"
      story={
        <StorySection
          paragraphs={[
            "Aru looked at her mountain of homework problems and sighed.",
            "Aru: \"Do I really have to check ALL my homework answers before I can fix a single mistake?\"",
            "Byte: \"Great question! With Full Batch, yes — you look at everything first, then make one careful correction. But with SGD, you fix your approach after each single problem!\"",
            "Aru: \"SGD sounds faster. But wouldn't I make wild corrections from just one problem?\"",
            "Byte: \"That's the tradeoff! Mini-Batch is the sweet spot — you look at a small group of problems, get a decent idea of your mistakes, and correct. Fast AND stable!\"",
          ]}
          conceptTitle="SGD vs Batch"
          conceptSummary="Full Batch uses all data per update (smooth but slow), SGD uses one sample (fast but noisy), and Mini-Batch uses a small group (balanced). Mini-batch gradient descent is the standard approach in modern deep learning."
        />
      }
    />
  );
}
