"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { SlidersHorizontal, Zap, TrendingDown, Palette, Play, RotateCcw } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

/* ---- helpers ---- */
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

/* Smooth loss curve with one minimum near x=0.55 */
function lossFn(x: number): number {
  const t = x - 0.55;
  return 3.0 * t * t * t * t - 1.5 * t * t + 0.4 * t + 0.9;
}

function lossGrad(x: number): number {
  const t = x - 0.55;
  return 4 * 3.0 * t * t * t - 2 * 1.5 * t + 0.4;
}

/* Bumpy curve with local minima for momentum demo */
function bumpyLoss(x: number): number {
  const t = x - 0.3;
  return 2.0 * t * t + 0.25 * Math.sin(x * 18) + 0.6;
}

function bumpyGrad(x: number): number {
  const t = x - 0.3;
  return 4.0 * t + 0.25 * 18 * Math.cos(x * 18);
}

/* SVG mapping */
const W = 480;
const H = 260;
const PAD = 44;
function xToSvg(x: number): number { return PAD + x * (W - 2 * PAD); }
function yToSvg(y: number, minY: number, maxY: number): number {
  return PAD + (1 - (y - minY) / (maxY - minY)) * (H - 2 * PAD);
}

function buildPath(fn: (x: number) => number, minY: number, maxY: number, w = W): string {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = i / 120;
    const sx = PAD + x * (w - 2 * PAD);
    const sy = yToSvg(fn(x), minY, maxY);
    pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
  }
  return pts.join(" ");
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Learning Rate Tuning                                      */
/* ------------------------------------------------------------------ */
function LRTuningTab() {
  const [lrIdx, setLrIdx] = useState(3);
  const lrValues = [0.001, 0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1.0];
  const lr = lrValues[lrIdx];
  const [themeIdx, setThemeIdx] = useState(1);
  const theme = THEMES[themeIdx];

  const [ballX, setBallX] = useState(0.05);
  const [losses, setLosses] = useState<number[]>([lossFn(0.05)]);
  const [running, setRunning] = useState(false);
  const [diverged, setDiverged] = useState(false);
  const animRef = useRef<number | null>(null);

  const handleRun = useCallback(() => {
    playClick();
    setBallX(0.05);
    setLosses([lossFn(0.05)]);
    setDiverged(false);
    setRunning(true);
    let cx = 0.05;
    let step = 0;
    const maxSteps = 50;
    const collected: number[] = [lossFn(0.05)];

    const tick = () => {
      const grad = lossGrad(cx);
      cx = cx - lr * grad;
      step++;
      const loss = lossFn(clamp(cx, 0, 1));
      collected.push(loss);
      setBallX(clamp(cx, 0, 1));
      setLosses([...collected]);

      if (step < maxSteps && cx > 0 && cx < 1 && loss < 5) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        if (cx <= 0 || cx >= 1 || loss >= 5) {
          setDiverged(true);
          playError();
        } else if (loss < 0.7) playSuccess();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [lr]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const minY = 0.2;
  const maxY = 2.0;
  const lossLabel = lr < 0.01 ? "Too small!" : lr > 0.4 ? "Too large!" : "Good range";
  const labelColor = lr < 0.01 ? "#f59e0b" : lr > 0.4 ? "#ef4444" : "#22c55e";

  const LCH = 90;

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        Adjust the learning rate slider, then click <strong>Run</strong> to watch the ball descend.
      </p>

      {/* LR slider */}
      <div className="card-sketchy p-3 flex items-center gap-3 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold">LR:</span>
        <input
          type="range"
          min={0} max={lrValues.length - 1} step={1}
          value={lrIdx}
          onChange={(e) => { setLrIdx(Number(e.target.value)); playPop(); }}
          className="w-48 accent-accent-coral"
          disabled={running}
        />
        <span className="font-hand text-base font-bold" style={{ color: labelColor }}>{lr}</span>
        <span className="font-hand text-xs font-bold px-2 py-0.5 rounded-full border-2 border-foreground" style={{ background: labelColor + "33" }}>{lossLabel}</span>
      </div>

      {/* Curve */}
      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[560px] mx-auto">
          <defs>
            <radialGradient id="lr-ball" cx="35%" cy="30%">
              <stop offset="0%" stopColor={theme.glow} />
              <stop offset="100%" stopColor={theme.node} />
            </radialGradient>
            <linearGradient id="lr-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={theme.node} stopOpacity="0.18" />
              <stop offset="100%" stopColor={theme.node} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <path d={`${buildPath(lossFn, minY, maxY)} L${(W - PAD).toFixed(1)},${(H - PAD).toFixed(1)} L${PAD.toFixed(1)},${(H - PAD).toFixed(1)} Z`} fill="url(#lr-fill)" />
          <path d={buildPath(lossFn, minY, maxY)} fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />
          <path d={buildPath(lossFn, minY, maxY)} fill="none" stroke={theme.node} strokeWidth={1.2} strokeDasharray="2 4" opacity={0.5} className="wobble" />

          {/* Min marker */}
          <circle cx={xToSvg(0.55)} cy={yToSvg(lossFn(0.55), minY, maxY)} r={9} fill="none" stroke={theme.accent} strokeWidth={2} strokeDasharray="3 2" />

          {/* Ball with diverged ring */}
          {diverged && (
            <circle cx={xToSvg(ballX)} cy={yToSvg(lossFn(ballX), minY, maxY)} r={14} fill="none" stroke="#ef4444" strokeWidth={3} className="fire-ring" />
          )}
          <circle
            cx={xToSvg(ballX)} cy={yToSvg(lossFn(ballX), minY, maxY)}
            r={11} fill="url(#lr-ball)" stroke={INK} strokeWidth={2.5}
            className="pulse-glow"
            style={{ color: theme.node }}
          />

          <text x={W - PAD} y={PAD - 10} textAnchor="end" fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">
            Loss: {lossFn(ballX).toFixed(3)}
          </text>
          <text x={PAD} y={PAD - 10} fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">
            LR: {lr}
          </text>
        </svg>
      </div>

      {/* Loss over steps */}
      {losses.length > 1 && (
        <div className="card-sketchy p-3">
          <svg viewBox={`0 0 ${W} ${LCH}`} className="w-full max-w-[560px] mx-auto">
            <text x={W / 2} y={14} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">Loss over steps</text>
            <polyline
              points={losses.map((l, i) => {
                const sx = PAD + (i / Math.max(losses.length - 1, 1)) * (W - 2 * PAD);
                const sy = 22 + (1 - (clamp(l, minY, maxY) - minY) / (maxY - minY)) * (LCH - 32);
                return `${sx.toFixed(1)},${sy.toFixed(1)}`;
              }).join(" ")}
              fill="none" stroke={theme.node} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40"
        >
          <Play className="w-4 h-4 inline mr-1" />
          {running ? "Running..." : "Run"}
        </button>
      </div>

      <InfoBox variant="blue" title="Goldilocks LR">
        The learning rate controls step size. Too small = slow convergence. Too large = overshooting. Finding the &quot;just right&quot; value is one of the most important choices in training.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Momentum Explained                                        */
/* ------------------------------------------------------------------ */
function MomentumTab() {
  const [momentum, setMomentum] = useState(0.0);
  const [pathNoM, setPathNoM] = useState<number[]>([0.95]);
  const [pathWithM, setPathWithM] = useState<number[]>([0.95]);
  const [running, setRunning] = useState(false);
  const [themeIdx, setThemeIdx] = useState(2);
  const animRef = useRef<number | null>(null);
  const theme = THEMES[themeIdx];

  const lr = 0.012;
  const minY = 0.3;
  const maxY = 1.8;
  const halfW = W / 2;

  const handleRun = useCallback(() => {
    playClick();
    setRunning(true);
    let xNoM = 0.95;
    let xWithM = 0.95;
    let velNoM = 0;
    let velWithM = 0;
    let step = 0;
    const pNoM: number[] = [0.95];
    const pWithM: number[] = [0.95];

    const tick = () => {
      const gNoM = bumpyGrad(xNoM);
      velNoM = -lr * gNoM;
      xNoM = clamp(xNoM + velNoM, 0.01, 0.99);
      pNoM.push(xNoM);

      const gWithM = bumpyGrad(xWithM);
      velWithM = momentum * velWithM - lr * gWithM;
      xWithM = clamp(xWithM + velWithM, 0.01, 0.99);
      pWithM.push(xWithM);

      step++;
      setPathNoM([...pNoM]);
      setPathWithM([...pWithM]);

      if (step < 80) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        playSuccess();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [momentum]);

  const handleReset = useCallback(() => {
    playPop();
    setPathNoM([0.95]);
    setPathWithM([0.95]);
    setRunning(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const lastNoM = pathNoM[pathNoM.length - 1];
  const lastWithM = pathWithM[pathWithM.length - 1];

  function makeBumpyPath() {
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = i / 120;
      const sx = 20 + x * (halfW - 40);
      const sy = yToSvg(bumpyLoss(x), minY, maxY);
      pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return pts.join(" ");
  }
  const bumpyD = makeBumpyPath();

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        The bumpy curve has local minima. Without momentum the ball gets stuck. Increase momentum and see the difference!
      </p>

      <div className="card-sketchy p-3 flex items-center gap-3 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold">Momentum:</span>
        <input
          type="range" min={0} max={99} step={1}
          value={Math.round(momentum * 100)}
          onChange={(e) => { setMomentum(Number(e.target.value) / 100); playPop(); }}
          className="w-48 accent-accent-coral"
          disabled={running}
        />
        <span className="font-hand text-base font-bold" style={{ color: theme.node }}>{momentum.toFixed(2)}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* No momentum */}
        <div className="card-sketchy p-3 notebook-grid">
          <p className="font-hand text-xs text-center font-bold mb-1">No Momentum</p>
          <svg viewBox={`0 0 ${halfW} ${H}`} className="w-full">
            <defs>
              <radialGradient id="mom-stuck" cx="35%" cy="30%">
                <stop offset="0%" stopColor="#ffb3b3" />
                <stop offset="100%" stopColor="#ef4444" />
              </radialGradient>
            </defs>
            <path d={bumpyD} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
            {pathNoM.length > 1 && (
              <polyline
                points={pathNoM.map((px) => `${(20 + px * (halfW - 40)).toFixed(1)},${yToSvg(bumpyLoss(px), minY, maxY).toFixed(1)}`).join(" ")}
                fill="none" stroke="#ef4444" strokeWidth={1.5} opacity={0.5}
              />
            )}
            <circle
              cx={20 + lastNoM * (halfW - 40)} cy={yToSvg(bumpyLoss(lastNoM), minY, maxY)}
              r={9} fill="url(#mom-stuck)" stroke={INK} strokeWidth={2}
              className="pulse-glow" style={{ color: "#ef4444" }}
            />
          </svg>
          <p className="font-hand text-[11px] text-center mt-1">Loss: <strong>{bumpyLoss(lastNoM).toFixed(3)}</strong></p>
        </div>

        {/* With momentum */}
        <div className="card-sketchy p-3 notebook-grid">
          <p className="font-hand text-xs text-center font-bold mb-1">With Momentum ({momentum.toFixed(2)})</p>
          <svg viewBox={`0 0 ${halfW} ${H}`} className="w-full">
            <defs>
              <radialGradient id="mom-free" cx="35%" cy="30%">
                <stop offset="0%" stopColor={theme.glow} />
                <stop offset="100%" stopColor={theme.node} />
              </radialGradient>
            </defs>
            <path d={bumpyD} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
            {pathWithM.length > 1 && (
              <polyline
                points={pathWithM.map((px) => `${(20 + px * (halfW - 40)).toFixed(1)},${yToSvg(bumpyLoss(px), minY, maxY).toFixed(1)}`).join(" ")}
                fill="none" stroke={theme.node} strokeWidth={1.5} opacity={0.5}
              />
            )}
            <circle
              cx={20 + lastWithM * (halfW - 40)} cy={yToSvg(bumpyLoss(lastWithM), minY, maxY)}
              r={9} fill="url(#mom-free)" stroke={INK} strokeWidth={2}
              className="pulse-glow" style={{ color: theme.node }}
            />
          </svg>
          <p className="font-hand text-[11px] text-center mt-1">Loss: <strong>{bumpyLoss(lastWithM).toFixed(3)}</strong></p>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40"
        >
          <Play className="w-4 h-4 inline mr-1" />
          {running ? "Running..." : "Run Both"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35]"
        >
          <RotateCcw className="w-4 h-4 inline mr-1" />
          Reset
        </button>
      </div>

      <InfoBox variant="amber" title="Momentum = Memory">
        Momentum adds a &quot;memory&quot; of past steps. Like a skateboard carrying speed, it helps the ball roll through small bumps (local minima) to find the true bottom (global minimum).
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Learning Rate Schedules                                   */
/* ------------------------------------------------------------------ */
function SchedulesTab() {
  const totalEpochs = 60;
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const animRef = useRef<number | null>(null);

  const schedules = useMemo(() => {
    const constant: number[] = [];
    const stepDecay: number[] = [];
    const cosine: number[] = [];
    const initLr = 0.5;
    for (let e = 0; e < totalEpochs; e++) {
      constant.push(initLr);
      stepDecay.push(initLr * Math.pow(0.5, Math.floor(e / 15)));
      cosine.push(initLr * 0.5 * (1 + Math.cos(Math.PI * e / totalEpochs)));
    }
    return { constant, stepDecay, cosine };
  }, []);

  const losses = useMemo(() => {
    const lossConst: number[] = [];
    const lossStep: number[] = [];
    const lossCos: number[] = [];
    let xC = 0.05, xS = 0.05, xCos = 0.05;
    for (let e = 0; e < totalEpochs; e++) {
      const gC = lossGrad(xC);
      xC = clamp(xC - schedules.constant[e] * gC * 0.15, 0, 1);
      lossConst.push(lossFn(xC));

      const gS = lossGrad(xS);
      xS = clamp(xS - schedules.stepDecay[e] * gS * 0.15, 0, 1);
      lossStep.push(lossFn(xS));

      const gCos = lossGrad(xCos);
      xCos = clamp(xCos - schedules.cosine[e] * gCos * 0.15, 0, 1);
      lossCos.push(lossFn(xCos));
    }
    return { constant: lossConst, stepDecay: lossStep, cosine: lossCos };
  }, [schedules]);

  const handleAnimate = useCallback(() => {
    playClick();
    setStep(0);
    setRunning(true);
    let s = 0;
    const tick = () => {
      s++;
      setStep(s);
      if (s < totalEpochs) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        playSuccess();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const colors = ["#ef4444", "#6bb6ff", "#4ecdc4"];
  const names = ["Constant", "Step Decay", "Cosine Annealing"];
  const allLR = [schedules.constant, schedules.stepDecay, schedules.cosine];
  const allLoss = [losses.constant, losses.stepDecay, losses.cosine];

  const chartW = 480;
  const chartH = 130;

  function renderChart(data: number[][], maxVal: number, title: string) {
    return (
      <div className="card-sketchy p-3 notebook-grid">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-[560px] mx-auto">
          <text x={chartW / 2} y={14} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">{title}</text>
          {data.map((d, di) => {
            const visible = d.slice(0, step);
            if (visible.length < 2) return null;
            const pts = visible.map((v, j) => {
              const sx = PAD + (j / (totalEpochs - 1)) * (chartW - 2 * PAD);
              const sy = 26 + (1 - v / maxVal) * (chartH - 40);
              return `${sx.toFixed(1)},${sy.toFixed(1)}`;
            }).join(" ");
            return <polyline key={di} points={pts} fill="none" stroke={colors[di]} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />;
          })}
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        Compare three learning rate schedules. Click <strong>Animate</strong> to watch them over {totalEpochs} epochs.
      </p>

      <div className="flex gap-4 justify-center flex-wrap">
        {names.map((n, i) => (
          <div key={n} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border-2 border-foreground bg-background">
            <div className="w-3 h-3 rounded-full border border-foreground" style={{ background: colors[i] }} />
            <span className="font-hand text-xs font-bold">{n}</span>
          </div>
        ))}
      </div>

      {renderChart(allLR, 0.55, "Learning Rate vs Epoch")}
      {renderChart(allLoss, 2.0, "Loss vs Epoch")}

      <div className="text-center font-hand text-sm font-bold">Epoch: {step} / {totalEpochs}</div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleAnimate}
          disabled={running}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40"
        >
          <Play className="w-4 h-4 inline mr-1" />
          {running ? "Animating..." : "Animate"}
        </button>
      </div>

      <InfoBox variant="indigo" title="Why Schedules?">
        <strong>Constant:</strong> same LR throughout  risky.
        <br />
        <strong>Step Decay:</strong> big jumps early, then fine-tuning with smaller steps.
        <br />
        <strong>Cosine Annealing:</strong> smoothly reduces LR, often giving the best results.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What happens if the learning rate is too small?",
    options: ["The model diverges", "Training converges very slowly", "The model overfits immediately", "Gradient becomes zero"],
    correctIndex: 1,
    explanation: "A very small learning rate means tiny steps, so the model takes forever to reach the minimum.",
  },
  {
    question: "What does momentum help with?",
    options: ["Making the model larger", "Escaping local minima", "Increasing the learning rate", "Reducing the dataset size"],
    correctIndex: 1,
    explanation: "Momentum carries speed from previous steps, helping the ball roll through small bumps (local minima) to find the global minimum.",
  },
  {
    question: "In cosine annealing, how does the learning rate change?",
    options: ["It stays constant", "It increases over time", "It smoothly decreases following a cosine curve", "It randomly fluctuates"],
    correctIndex: 2,
    explanation: "Cosine annealing starts with a large learning rate and smoothly reduces it following a cosine curve shape.",
  },
  {
    question: "Why is step decay useful?",
    options: ["It makes training faster at the start and more precise at the end", "It increases the learning rate over time", "It removes the need for momentum", "It doubles the batch size"],
    correctIndex: 0,
    explanation: "Step decay uses a large learning rate initially for fast progress, then reduces it at set intervals for fine-tuning near the minimum.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L23_LearningRateActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "tuning",
        label: "Learning Rate Tuning",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <LRTuningTab />,
      },
      {
        id: "momentum",
        label: "Momentum Explained",
        icon: <Zap className="w-4 h-4" />,
        content: <MomentumTab />,
      },
      {
        id: "schedules",
        label: "LR Schedules",
        icon: <TrendingDown className="w-4 h-4" />,
        content: <SchedulesTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Learning Rate & Momentum"
      level={7}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Learn about overfitting  when your model memorizes instead of learning!"
      story={
        <StorySection
          paragraphs={[
            "Byte showed Aru a skateboard perched at the top of a steep hill.",
            "Byte: \"Imagine rolling this skateboard down the hill. The learning rate is how hard you push it. Too gentle  it barely moves. Too hard  it flies right past the bottom!\"",
            "Aru: \"What about the bumps in the road? A small push might get stuck on one.\"",
            "Byte: \"That's where momentum comes in! Momentum is like the skateboard carrying speed from before. It helps you roll right through those small bumps and find the real bottom of the valley!\"",
            "Aru: \"So I need the right push AND enough rolling speed. Got it!\"",
          ]}
          conceptTitle="Learning Rate & Momentum"
          conceptSummary="The learning rate controls step size during gradient descent. Too small = slow, too large = unstable. Momentum adds 'memory' of previous steps, helping escape local minima and converge faster."
        />
      }
    />
  );
}
