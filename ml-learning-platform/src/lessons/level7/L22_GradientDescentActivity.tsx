"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowDown, Gauge, Map, Palette, RotateCcw, Play, Sparkles } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

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

/* 1D loss curve: smooth polynomial with one minimum near x=0.6 */
function lossFn(x: number): number {
  const t = x - 0.6;
  return 2.5 * t * t * t * t - 1.2 * t * t + 0.5 * t + 1.0;
}

function lossGrad(x: number): number {
  const t = x - 0.6;
  return 4 * 2.5 * t * t * t - 2 * 1.2 * t + 0.5;
}

/* SVG mapping */
const W = 480;
const H = 280;
const PAD = 44;
function xToSvg(x: number): number { return PAD + x * (W - 2 * PAD); }
function yToSvg(y: number): number {
  const minY = 0.3, maxY = 2.0;
  return PAD + (1 - (y - minY) / (maxY - minY)) * (H - 2 * PAD);
}

function curvePath(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = i / 120;
    pts.push(`${i === 0 ? "M" : "L"}${xToSvg(x).toFixed(1)},${yToSvg(lossFn(x)).toFixed(1)}`);
  }
  return pts.join(" ");
}

/* Curve "ground" filled area */
function curveAreaPath(): string {
  return `${curvePath()} L${xToSvg(1).toFixed(1)},${(H - PAD).toFixed(1)} L${xToSvg(0).toFixed(1)},${(H - PAD).toFixed(1)} Z`;
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Roll Down the Hill                                        */
/* ------------------------------------------------------------------ */
function RollDownTab() {
  const [ballX, setBallX] = useState(0.08);
  const [steps, setSteps] = useState(0);
  const [themeIdx, setThemeIdx] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [autoRun, setAutoRun] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const lr = 0.1;
  const theme = THEMES[themeIdx];

  const handleStep = useCallback(() => {
    playClick();
    setBallX((prev) => clamp(prev - lr * lossGrad(prev), 0.01, 0.99));
    setSteps((s) => s + 1);
  }, []);

  const handleReset = useCallback(() => {
    playPop();
    setBallX(0.08);
    setSteps(0);
    setAutoRun(false);
  }, []);

  const ballY = lossFn(ballX);
  const grad = lossGrad(ballX);
  const converged = Math.abs(grad) < 0.05;

  const prevConv = useRef(false);
  useEffect(() => {
    if (converged && !prevConv.current && steps > 0) {
      playSuccess();
      setBurstKey((k) => k + 1);
    }
    prevConv.current = converged;
  }, [converged, steps]);

  // auto-run
  useEffect(() => {
    if (!autoRun || converged) return;
    const id = setInterval(handleStep, 1000 / speed);
    return () => clearInterval(id);
  }, [autoRun, converged, handleStep, speed]);

  /* tangent line segment (gradient slope) */
  const tangentLen = 0.09;
  const tx1 = ballX - tangentLen;
  const ty1 = ballY - grad * tangentLen;
  const tx2 = ballX + tangentLen;
  const ty2 = ballY + grad * tangentLen;

  /* arrow direction */
  const arrowDx = grad > 0 ? -22 : 22;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />
        <div className="flex items-center gap-2">
          <span className="font-hand text-sm font-bold">Speed:</span>
          <input
            type="range" min={0.5} max={4} step={0.1} value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-24 accent-accent-coral"
          />
        </div>
        <button
          onClick={() => { playClick(); setAutoRun((v) => !v); }}
          disabled={converged}
          className={`px-3 py-1 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all disabled:opacity-50 ${autoRun ? "bg-accent-coral text-white shadow-[2px_2px_0_#2b2a35]" : "bg-background"}`}
        >
          {autoRun ? "■ Pause" : "▶ Auto"}
        </button>
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        Click <strong>Step</strong> to roll the ball downhill following the gradient. Reach the bottom!
      </p>

      {/* The hillside */}
      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[560px] mx-auto">
          <defs>
            <radialGradient id="gd-ball" cx="35%" cy="30%">
              <stop offset="0%" stopColor={theme.glow} />
              <stop offset="100%" stopColor={theme.node} />
            </radialGradient>
            <linearGradient id="gd-hill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={theme.node} stopOpacity="0.18" />
              <stop offset="100%" stopColor={theme.node} stopOpacity="0.02" />
            </linearGradient>
            <marker id="gd-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
              <path d="M0,0 L10,4 L0,8 Z" fill={theme.node} />
            </marker>
          </defs>

          {/* Filled hill area */}
          <path d={curveAreaPath()} fill="url(#gd-hill)" />

          {/* Curve */}
          <path d={curvePath()} fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />
          <path d={curvePath()} fill="none" stroke={theme.node} strokeWidth={1.2} strokeLinecap="round" strokeDasharray="2 4" opacity={0.5} className="wobble" />

          {/* Minimum marker */}
          <g>
            <circle cx={xToSvg(0.6)} cy={yToSvg(lossFn(0.6))} r={9} fill="none" stroke={theme.accent} strokeWidth={2} strokeDasharray="3 2" />
            <text x={xToSvg(0.6)} y={yToSvg(lossFn(0.6)) + 24} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[10px] font-bold">
              min
            </text>
          </g>

          {/* Tangent line */}
          <line
            x1={xToSvg(tx1)} y1={yToSvg(ty1)}
            x2={xToSvg(tx2)} y2={yToSvg(ty2)}
            stroke={theme.accent} strokeWidth={2.5} strokeDasharray="5 3" strokeLinecap="round"
          />

          {/* Direction arrow */}
          {!converged && (
            <line
              x1={xToSvg(ballX)} y1={yToSvg(ballY) - 22}
              x2={xToSvg(ballX) + arrowDx} y2={yToSvg(ballY) - 22}
              stroke={theme.node} strokeWidth={3} markerEnd="url(#gd-arrow)" strokeLinecap="round"
            />
          )}

          {/* Ball */}
          <g>
            {converged && (
              <>
                <circle cx={xToSvg(ballX)} cy={yToSvg(ballY)} r={12} fill="none" stroke={theme.accent} strokeWidth={3} className="fire-ring" />
                <circle cx={xToSvg(ballX)} cy={yToSvg(ballY)} r={12} fill="none" stroke={theme.node} strokeWidth={2} className="fire-ring" style={{ animationDelay: "0.4s" }} />
              </>
            )}
            <circle
              cx={xToSvg(ballX)} cy={yToSvg(ballY)}
              r={12} fill="url(#gd-ball)" stroke={INK} strokeWidth={2.5}
              className="pulse-glow"
              style={{ color: theme.node }}
            />

            {/* Spark burst on convergence */}
            {converged && (
              <g key={burstKey}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  return (
                    <line
                      key={i}
                      x1={xToSvg(ballX)} y1={yToSvg(ballY)}
                      x2={xToSvg(ballX) + Math.cos(angle) * 32}
                      y2={yToSvg(ballY) + Math.sin(angle) * 32}
                      stroke={theme.accent} strokeWidth={2.5} strokeLinecap="round"
                      className="spark"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    />
                  );
                })}
              </g>
            )}
          </g>

          {/* Axis labels */}
          <text x={W / 2} y={H - 8} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">Parameter value</text>
          <text x={14} y={H / 2} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold" transform={`rotate(-90,14,${H / 2})`}>Loss</text>

          {/* Readouts */}
          <text x={W - PAD} y={PAD - 10} textAnchor="end" fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">
            Loss: {ballY.toFixed(3)}
          </text>
          <text x={PAD} y={PAD - 10} fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">
            Step: {steps}
          </text>
          <text x={W / 2} y={PAD - 10} textAnchor="middle" fill={theme.node} fontFamily="Kalam" className="text-[12px] font-bold">
            grad = {grad.toFixed(2)}
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={handleStep}
          disabled={converged}
          className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed ${converged ? "bg-accent-mint" : "bg-accent-yellow shadow-[2px_2px_0_#2b2a35] hover:translate-x-[-1px] hover:translate-y-[-1px]"}`}
        >
          <Play className="w-4 h-4 inline mr-1" />
          {converged ? "Converged!" : "Step"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35]"
        >
          <RotateCcw className="w-4 h-4 inline mr-1" />
          Reset
        </button>
      </div>

      {converged && (
        <div className="card-sketchy p-3 text-center bg-accent-mint/30 animate-fadeIn">
          <p className="font-hand text-base font-bold">
            <Sparkles className="w-4 h-4 inline mr-1" />
            The ball reached the minimum in {steps} steps!
          </p>
        </div>
      )}

      <InfoBox variant="blue" title="Gradient = Slope">
        The gradient tells us which direction is &quot;uphill.&quot; We go the opposite way (downhill) to reduce the loss. Each step moves us closer to the best answer.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Learning Rate Explorer                                    */
/* ------------------------------------------------------------------ */
interface BallState {
  x: number;
  trail: number[];
  losses: number[];
}

function LRExplorerTab() {
  const rates = [0.01, 0.1, 0.5];
  const labels = ["Small (0.01)", "Medium (0.1)", "Large (0.5)"];
  const colors = ["#6bb6ff", "#4ecdc4", "#ff6b6b"];
  const [themeIdx, setThemeIdx] = useState(1);

  const initBalls = useCallback((): BallState[] =>
    rates.map(() => ({ x: 0.1, trail: [0.1], losses: [lossFn(0.1)] })),
    [],
  );

  const [balls, setBalls] = useState<BallState[]>(initBalls);
  const [step, setStep] = useState(0);

  const handleStepAll = useCallback(() => {
    playClick();
    setBalls((prev) =>
      prev.map((b, i) => {
        const grad = lossGrad(b.x);
        const nx = clamp(b.x - rates[i] * grad, -0.5, 1.5);
        return {
          x: nx,
          trail: [...b.trail, nx],
          losses: [...b.losses, lossFn(nx)],
        };
      }),
    );
    setStep((s) => s + 1);
  }, []);

  const handleReset = useCallback(() => {
    playPop();
    setBalls(initBalls());
    setStep(0);
  }, [initBalls]);

  const LCW = 480;
  const LCH = 110;

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        Three balls with different learning rates start at the same point. Click <strong>Step All</strong> to compare!
      </p>

      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[560px] mx-auto">
          <defs>
            {colors.map((c, i) => (
              <radialGradient key={i} id={`lr-ball-${i}`} cx="35%" cy="30%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                <stop offset="100%" stopColor={c} />
              </radialGradient>
            ))}
          </defs>

          <path d={curvePath()} fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />
          <path d={curvePath()} fill="none" stroke={THEMES[themeIdx].node} strokeWidth={1.2} strokeDasharray="2 4" opacity={0.4} className="wobble" />

          {/* Min marker */}
          <circle cx={xToSvg(0.6)} cy={yToSvg(lossFn(0.6))} r={8} fill="none" stroke={THEMES[themeIdx].accent} strokeWidth={2} strokeDasharray="3 2" />

          {balls.map((b, i) => (
            <g key={i}>
              {b.trail.map((tx, j) => {
                const cx = clamp(tx, 0, 1);
                return (
                  <circle key={j} cx={xToSvg(cx)} cy={yToSvg(lossFn(cx))} r={3} fill={colors[i]} opacity={0.25 + 0.05 * j} />
                );
              })}
              <circle
                cx={xToSvg(clamp(b.x, 0, 1))} cy={yToSvg(lossFn(clamp(b.x, 0, 1)))}
                r={9} fill={`url(#lr-ball-${i})`} stroke={INK} strokeWidth={2}
                className="pulse-glow"
                style={{ color: colors[i] }}
              />
            </g>
          ))}

          {/* Legend */}
          {labels.map((l, i) => (
            <g key={l}>
              <circle cx={PAD + 10} cy={PAD + 10 + i * 16} r={5} fill={colors[i]} stroke={INK} strokeWidth={1} />
              <text x={PAD + 22} y={PAD + 14 + i * 16} fill={INK} fontFamily="Kalam" className="text-[10px] font-bold">{l}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Loss curves over steps */}
      <div className="card-sketchy p-3">
        <svg viewBox={`0 0 ${LCW} ${LCH}`} className="w-full max-w-[560px] mx-auto">
          <text x={LCW / 2} y={14} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">Loss over steps</text>
          {balls.map((b, i) => {
            if (b.losses.length < 2) return null;
            const maxL = 2.0, minL = 0.3;
            const maxSteps = Math.max(step, 1);
            const pts = b.losses.map((l, j) => {
              const sx = 30 + (j / maxSteps) * (LCW - 50);
              const sy = 22 + (1 - (clamp(l, minL, maxL) - minL) / (maxL - minL)) * (LCH - 32);
              return `${sx.toFixed(1)},${sy.toFixed(1)}`;
            });
            return <polyline key={i} points={pts.join(" ")} fill="none" stroke={colors[i]} strokeWidth={2} strokeLinecap="round" />;
          })}
        </svg>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={handleStepAll}
          disabled={step >= 30}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40"
        >
          Step All ({step}/30)
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35]"
        >
          <RotateCcw className="w-4 h-4 inline mr-1" />
          Reset
        </button>
      </div>

      <InfoBox variant="amber" title="Learning Rate Matters!">
        Too small: barely moves. Just right: converges smoothly. Too large: overshoots and bounces wildly. Choosing the right learning rate is crucial for training.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- 2D Gradient Descent                                       */
/* ------------------------------------------------------------------ */
function loss2D(x: number, y: number): number {
  return 2 * (x - 0.5) * (x - 0.5) + 3 * (y - 0.4) * (y - 0.4) + 0.8 * (x - 0.5) * (y - 0.4);
}

function grad2D(x: number, y: number): [number, number] {
  return [
    4 * (x - 0.5) + 0.8 * (y - 0.4),
    6 * (y - 0.4) + 0.8 * (x - 0.5),
  ];
}

function Contour2DTab() {
  const CW = 420;
  const CH = 360;
  const [path, setPath] = useState<[number, number][]>([]);
  const [running, setRunning] = useState(false);
  const [themeIdx, setThemeIdx] = useState(2);
  const animRef = useRef<number | null>(null);
  const theme = THEMES[themeIdx];

  const contours = useMemo(() => {
    const lines: { d: string; level: number }[] = [];
    const levels = [0.05, 0.15, 0.3, 0.5, 0.8, 1.2, 1.8];
    const res = 60;

    for (const level of levels) {
      const segs: string[] = [];
      for (let i = 0; i < res; i++) {
        for (let j = 0; j < res; j++) {
          const x0 = i / res, y0 = j / res;
          const x1 = (i + 1) / res, y1 = (j + 1) / res;
          const v00 = loss2D(x0, y0) - level;
          const v10 = loss2D(x1, y0) - level;
          const v01 = loss2D(x0, y1) - level;

          if (v00 * v10 < 0) {
            const t = v00 / (v00 - v10);
            const ix = x0 + t * (x1 - x0);
            const sx = 30 + ix * (CW - 60);
            const sy = 30 + y0 * (CH - 60);
            segs.push(`M${sx.toFixed(1)},${sy.toFixed(1)}L${sx.toFixed(1)},${(sy + (CH - 60) / res).toFixed(1)}`);
          }
          if (v00 * v01 < 0) {
            const t = v00 / (v00 - v01);
            const iy = y0 + t * (y1 - y0);
            const sx = 30 + x0 * (CW - 60);
            const sy = 30 + iy * (CH - 60);
            segs.push(`M${sx.toFixed(1)},${sy.toFixed(1)}L${(sx + (CW - 60) / res).toFixed(1)},${sy.toFixed(1)}`);
          }
        }
      }
      if (segs.length > 0) lines.push({ d: segs.join(" "), level });
    }
    return lines;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (running) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = CW / rect.width;
    const scaleY = CH / rect.height;
    const sx = (e.clientX - rect.left) * scaleX;
    const sy = (e.clientY - rect.top) * scaleY;
    const nx = clamp((sx - 30) / (CW - 60), 0.01, 0.99);
    const ny = clamp((sy - 30) / (CH - 60), 0.01, 0.99);
    playPop();
    setPath([[nx, ny]]);
  }, [running]);

  const handleRun = useCallback(() => {
    if (path.length === 0) return;
    playClick();
    setRunning(true);
    let current: [number, number] = [...path[path.length - 1]] as [number, number];
    let stepCount = 0;
    const lr = 0.08;

    const tick = () => {
      const [gx, gy] = grad2D(current[0], current[1]);
      current = [
        clamp(current[0] - lr * gx, 0.01, 0.99),
        clamp(current[1] - lr * gy, 0.01, 0.99),
      ];
      stepCount++;
      setPath((prev) => [...prev, [...current] as [number, number]]);

      if (stepCount < 40 && (Math.abs(gx) > 0.01 || Math.abs(gy) > 0.01)) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        playSuccess();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [path]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const handleReset = useCallback(() => {
    playPop();
    setPath([]);
    setRunning(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        Click on the contour map to place a starting point, then <strong>Run</strong> gradient descent.
      </p>

      <div className="card-sketchy p-4 notebook-grid">
        <svg
          viewBox={`0 0 ${CW} ${CH}`}
          className="w-full max-w-[480px] mx-auto cursor-crosshair"
          onClick={handleClick}
        >
          <defs>
            <radialGradient id="ct-ball" cx="35%" cy="30%">
              <stop offset="0%" stopColor={theme.glow} />
              <stop offset="100%" stopColor={theme.node} />
            </radialGradient>
          </defs>

          {contours.map((c, i) => (
            <path key={i} d={c.d} fill="none" stroke={theme.node} strokeWidth={1.2} opacity={0.25 + i * 0.08} />
          ))}

          {/* Minimum marker */}
          <circle cx={30 + 0.5 * (CW - 60)} cy={30 + 0.4 * (CH - 60)} r={9} fill="none" stroke={theme.accent} strokeWidth={2.5} strokeDasharray="3 2" className="wobble" />
          <text x={30 + 0.5 * (CW - 60)} y={30 + 0.4 * (CH - 60) - 14} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[10px] font-bold">min</text>

          {/* Path */}
          {path.length > 1 && (
            <polyline
              points={path.map(([px, py]) => `${(30 + px * (CW - 60)).toFixed(1)},${(30 + py * (CH - 60)).toFixed(1)}`).join(" ")}
              fill="none" stroke={theme.accent} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"
              className="signal-flow"
              style={{ color: theme.accent }}
            />
          )}

          {path.map(([px, py], i) => (
            <circle
              key={i}
              cx={30 + px * (CW - 60)} cy={30 + py * (CH - 60)}
              r={i === path.length - 1 ? 9 : 3}
              fill={i === path.length - 1 ? "url(#ct-ball)" : theme.glow}
              stroke={INK}
              strokeWidth={i === path.length - 1 ? 2.5 : 1}
              className={i === path.length - 1 ? "pulse-glow" : ""}
              style={i === path.length - 1 ? { color: theme.node } : undefined}
            />
          ))}
        </svg>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={handleRun}
          disabled={path.length === 0 || running}
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
          Reset
        </button>
      </div>

      <InfoBox variant="green" title="Contour Maps">
        Each ring represents the same loss value. The center is the minimum. Gradient descent always moves perpendicular to the contour lines toward lower loss.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What does the gradient tell us during gradient descent?",
    options: ["The final answer", "The direction of steepest ascent", "The number of steps needed", "The learning rate to use"],
    correctIndex: 1,
    explanation: "The gradient points in the direction of steepest ascent. We move in the opposite direction (descent) to reduce the loss.",
  },
  {
    question: "What happens if the learning rate is too large?",
    options: ["Training takes too long", "The model converges perfectly", "The ball overshoots and may diverge", "Nothing changes"],
    correctIndex: 2,
    explanation: "A learning rate that is too large causes the ball to overshoot the minimum and potentially bounce around or diverge.",
  },
  {
    question: "What is the goal of gradient descent?",
    options: ["Maximize the loss function", "Find the minimum of the loss function", "Make the gradient as large as possible", "Increase the learning rate"],
    correctIndex: 1,
    explanation: "Gradient descent aims to find the point where the loss function is minimized, meaning the model's predictions are as good as possible.",
  },
  {
    question: "When does gradient descent stop (converge)?",
    options: ["After exactly 10 steps", "When the gradient is near zero", "When the loss equals 1", "When the learning rate is zero"],
    correctIndex: 1,
    explanation: "Gradient descent converges when the gradient approaches zero, meaning the ball has reached a flat spot (minimum).",
  },
  {
    question: "In a 2D contour plot, where is the minimum?",
    options: ["At the edges", "Where contour lines are farthest apart", "At the center of the innermost ring", "Where colors are brightest"],
    correctIndex: 2,
    explanation: "The minimum is at the center of the contour rings. Each ring represents the same loss value, getting smaller toward the center.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L22_GradientDescentActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "roll",
        label: "Roll Down the Hill",
        icon: <ArrowDown className="w-4 h-4" />,
        content: <RollDownTab />,
      },
      {
        id: "lr-explore",
        label: "Learning Rate Explorer",
        icon: <Gauge className="w-4 h-4" />,
        content: <LRExplorerTab />,
      },
      {
        id: "contour",
        label: "2D Gradient Descent",
        icon: <Map className="w-4 h-4" />,
        content: <Contour2DTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Gradient Descent"
      level={7}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Master learning rate and momentum  the speed controls of training!"
      story={
        <StorySection
          paragraphs={[
            "Aru stood on a grassy hillside, blindfolded, trying to find her way to the bottom of the valley.",
            "Aru: \"Byte, I can't see anything! How do I find the lowest point?\"",
            "Byte: \"Feel which way the ground slopes under your feet. Then take a step downhill. Keep doing that until the ground feels flat  that means you've reached the bottom!\"",
            "Aru: \"So I just keep going in the steepest downhill direction?\"",
            "Byte: \"Exactly! That's gradient descent  finding the lowest point of a loss function by following the slope. Every machine learning model uses this to learn!\"",
          ]}
          conceptTitle="Gradient Descent"
          conceptSummary="Gradient descent is an optimization algorithm that finds the minimum of a function by repeatedly moving in the direction of steepest descent (opposite to the gradient). It is the backbone of how ML models learn from data."
        />
      }
    />
  );
}
