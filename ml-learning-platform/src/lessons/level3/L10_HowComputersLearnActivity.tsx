"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  Swords,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import { Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";

const THEMES = [
  { name: "Coral", node: "#ff6b6b", glow: "#ff8a8a", accent: "#ffd93d" },
  { name: "Mint", node: "#4ecdc4", glow: "#7ee0d8", accent: "#ffd93d" },
  { name: "Lavender", node: "#b18cf2", glow: "#c9adf7", accent: "#ffd93d" },
  { name: "Sky", node: "#6bb6ff", glow: "#94caff", accent: "#ffd93d" },
];

const INK = "#2b2a35";

function ThemePicker({ themeIdx, setThemeIdx }: { themeIdx: number; setThemeIdx: (n: number) => void }) {
  return (
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
              style={{ background: t.node }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Animated learning loop: Guess -> Check -> Adjust -> back */
function LearningLoopDiagram({ theme }: { theme: typeof THEMES[number] }) {
  return (
    <div className="card-sketchy notebook-grid p-3">
      <p className="font-hand text-xs font-bold uppercase tracking-wide text-center mb-1" style={{ color: INK, opacity: 0.7 }}>
        The Learning Loop
      </p>
      <svg viewBox="0 0 420 140" className="w-full max-w-[460px] mx-auto">
        <defs>
          <radialGradient id="ll-grad" cx="35%" cy="30%">
            <stop offset="0%" stopColor={theme.glow} />
            <stop offset="100%" stopColor={theme.node} />
          </radialGradient>
          <marker id="ll-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
            <path d="M0,0 L10,4 L0,8 Z" fill={INK} />
          </marker>
        </defs>
        {/* Three nodes */}
        {[
          { cx: 60, cy: 70, label: "GUESS" },
          { cx: 210, cy: 70, label: "CHECK" },
          { cx: 360, cy: 70, label: "ADJUST" },
        ].map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r={36} fill="url(#ll-grad)" stroke={INK} strokeWidth={2.5} className="pulse-glow" style={{ color: theme.node, animationDelay: `${i * 0.4}s` }} />
            <text x={n.cx} y={n.cy + 4} textAnchor="middle" fontFamily="Kalam" fontWeight="bold" fontSize={13} fill="#fff">{n.label}</text>
          </g>
        ))}
        {/* Forward arrows */}
        <line x1={100} y1={70} x2={170} y2={70} stroke={theme.node} strokeWidth={3} className="signal-flow" style={{ color: theme.node }} markerEnd="url(#ll-arrow)" />
        <line x1={250} y1={70} x2={320} y2={70} stroke={theme.node} strokeWidth={3} className="signal-flow" style={{ color: theme.node }} markerEnd="url(#ll-arrow)" />
        {/* Loop back arrow */}
        <path d="M 360 110 Q 210 150 60 110" fill="none" stroke={theme.accent} strokeWidth={3} className="signal-flow" style={{ color: theme.accent }} markerEnd="url(#ll-arrow)" />
        <text x={210} y={138} textAnchor="middle" fontFamily="Kalam" fontWeight="bold" fontSize={11} fill={INK}>repeat until error is small</text>
      </svg>
    </div>
  );
}

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
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

interface Point {
  x: number;
  y: number;
}

function generatePoints(seed: number, count: number = 12): Point[] {
  const rng = mulberry32(seed);
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const x = rng() * 8 + 1; // x in [1, 9]
    const noise = (rng() - 0.5) * 3;
    const y = 0.6 * x + 2 + noise;
    pts.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  }
  return pts;
}

function computeError(points: Point[], slope: number, intercept: number): number {
  let total = 0;
  for (const p of points) {
    const diff = slope * p.x + intercept - p.y;
    total += diff * diff;
  }
  return total / points.length;
}

function gradientDescentStep(
  points: Point[],
  slope: number,
  intercept: number,
  learningRate: number,
): { slope: number; intercept: number } {
  const n = points.length;
  let dSlope = 0;
  let dIntercept = 0;
  for (const p of points) {
    const predicted = slope * p.x + intercept;
    const error = predicted - p.y;
    dSlope += error * p.x;
    dIntercept += error;
  }
  dSlope /= n;
  dIntercept /= n;
  return {
    slope: slope - learningRate * dSlope,
    intercept: intercept - learningRate * dIntercept,
  };
}

/** SVG scatter plot with a fitted line and optional residuals */
function ScatterPlot({
  width,
  height,
  points,
  slope,
  intercept,
  showResiduals,
  lineColor,
}: {
  width: number;
  height: number;
  points: Point[];
  slope: number;
  intercept: number;
  showResiduals?: boolean;
  lineColor?: string;
}) {
  const pad = { top: 20, right: 20, bottom: 30, left: 35 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const xMin = 0;
  const xMax = 10;
  const yMin = 0;
  const yMax = 12;

  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * innerW;
  const sy = (y: number) => pad.top + ((yMax - y) / (yMax - yMin)) * innerH;

  const lx1 = xMin;
  const ly1 = slope * lx1 + intercept;
  const lx2 = xMax;
  const ly2 = slope * lx2 + intercept;

  const lc = lineColor ?? "#6366f1";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full">
      {/* Grid lines */}
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <line key={`gx-${v}`} x1={sx(v)} y1={pad.top} x2={sx(v)} y2={height - pad.bottom} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {[0, 2, 4, 6, 8, 10, 12].map((v) => (
        <line key={`gy-${v}`} x1={pad.left} y1={sy(v)} x2={width - pad.right} y2={sy(v)} stroke="#e2e8f0" strokeWidth={1} />
      ))}

      {/* Axes */}
      <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom} stroke="#94a3b8" strokeWidth={1.5} />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} stroke="#94a3b8" strokeWidth={1.5} />

      {/* Axis labels */}
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <text key={`lx-${v}`} x={sx(v)} y={height - pad.bottom + 16} textAnchor="middle" style={{ fontSize: 9, fill: "#64748b" }}>
          {v}
        </text>
      ))}
      {[0, 4, 8, 12].map((v) => (
        <text key={`ly-${v}`} x={pad.left - 8} y={sy(v) + 3} textAnchor="end" style={{ fontSize: 9, fill: "#64748b" }}>
          {v}
        </text>
      ))}

      {/* Residual lines */}
      {showResiduals &&
        points.map((p, i) => {
          const predicted = slope * p.x + intercept;
          const residual = Math.abs(predicted - p.y);
          const maxResidual = 4;
          const t = Math.min(residual / maxResidual, 1);
          const r = Math.round(34 + t * (239 - 34));
          const g = Math.round(197 + t * (68 - 197));
          const b = Math.round(94 + t * (68 - 94));
          return (
            <line
              key={`r-${i}`}
              x1={sx(p.x)}
              y1={sy(p.y)}
              x2={sx(p.x)}
              y2={sy(predicted)}
              stroke={`rgb(${r},${g},${b})`}
              strokeWidth={1.5}
              strokeDasharray="3 2"
              opacity={0.7}
            />
          );
        })}

      {/* Fitted line */}
      <line
        x1={sx(lx1)}
        y1={sy(ly1)}
        x2={sx(lx2)}
        y2={sy(ly2)}
        stroke={lc}
        strokeWidth={2.5}
        strokeLinecap="round"
        style={{ transition: "all 0.1s ease-out" }}
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={`p-${i}`}
          cx={sx(p.x)}
          cy={sy(p.y)}
          r={4.5}
          fill="#3b82f6"
          stroke="#1d4ed8"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}

/** Small loss curve chart */
function LossCurve({
  width,
  height,
  history,
  label,
  color,
}: {
  width: number;
  height: number;
  history: number[];
  label?: string;
  color?: string;
}) {
  const pad = { top: 16, right: 10, bottom: 22, left: 32 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  if (history.length === 0) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full">
        {label && (
          <text x={width / 2} y={12} textAnchor="middle" style={{ fontSize: 9, fontWeight: 600, fill: "#64748b" }}>
            {label}
          </text>
        )}
        <text x={width / 2} y={height / 2 + 4} textAnchor="middle" style={{ fontSize: 10, fill: "#94a3b8" }}>
          No data yet
        </text>
      </svg>
    );
  }

  const maxSteps = Math.max(history.length, 10);
  const maxErr = Math.max(...history, 1);

  const sx = (i: number) => pad.left + (i / (maxSteps - 1 || 1)) * innerW;
  const sy = (v: number) => pad.top + ((maxErr - v) / maxErr) * innerH;

  const pathD = history.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
  const lc = color ?? "#6366f1";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full">
      {label && (
        <text x={width / 2} y={12} textAnchor="middle" style={{ fontSize: 9, fontWeight: 600, fill: "#64748b" }}>
          {label}
        </text>
      )}
      {/* Axes */}
      <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} stroke="#cbd5e1" strokeWidth={1} />
      {/* Labels */}
      <text x={width / 2} y={height - 4} textAnchor="middle" style={{ fontSize: 8, fill: "#94a3b8" }}>
        Step
      </text>
      <text x={6} y={pad.top + innerH / 2} textAnchor="middle" transform={`rotate(-90, 6, ${pad.top + innerH / 2})`} style={{ fontSize: 8, fill: "#94a3b8" }}>
        Error
      </text>
      {/* Curve */}
      <path d={pathD} fill="none" stroke={lc} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1  The Guessing Game                                          */
/* ------------------------------------------------------------------ */

function GuessingGame() {
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = THEMES[themeIdx];
  const [secretNumber, setSecretNumber] = useState(42);
  const [started, setStarted] = useState(false);
  const [low, setLow] = useState(1);
  const [high, setHigh] = useState(100);
  const [currentGuess, setCurrentGuess] = useState(50);
  const [history, setHistory] = useState<{ guess: number; feedback: string }[]>([]);
  const [found, setFound] = useState(false);

  const startGame = useCallback(() => {
    setStarted(true);
    setLow(1);
    setHigh(100);
    setCurrentGuess(50);
    setHistory([]);
    setFound(false);
  }, []);

  const handleFeedback = useCallback(
    (feedback: "too_high" | "too_low" | "correct") => {
      if (found) return;

      if (feedback === "correct") {
        setHistory((prev) => [...prev, { guess: currentGuess, feedback: "Correct!" }]);
        setFound(true);
        return;
      }

      const label = feedback === "too_high" ? "Too high" : "Too low";
      setHistory((prev) => [...prev, { guess: currentGuess, feedback: label }]);

      let newLow = low;
      let newHigh = high;
      if (feedback === "too_high") {
        newHigh = currentGuess - 1;
      } else {
        newLow = currentGuess + 1;
      }
      setLow(newLow);
      setHigh(newHigh);
      const nextGuess = Math.floor((newLow + newHigh) / 2);
      setCurrentGuess(nextGuess);
    },
    [currentGuess, low, high, found],
  );

  const resetGame = useCallback(() => {
    setStarted(false);
    setFound(false);
    setHistory([]);
    setLow(1);
    setHigh(100);
    setCurrentGuess(50);
  }, []);

  // SVG number line
  const nlWidth = 560;
  const nlHeight = 70;
  const nlPadX = 30;
  const barY = 30;
  const barH = 16;
  const scaleX = (v: number) => nlPadX + ((v - 1) / 99) * (nlWidth - 2 * nlPadX);

  return (
    <div className="space-y-5">
      <ThemePicker themeIdx={themeIdx} setThemeIdx={setThemeIdx} />
      <LearningLoopDiagram theme={theme} />
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold" style={{ color: INK }}>
          Pick a secret number and watch the computer find it!
        </h3>

        {/* Secret number input */}
        {!started && (
          <div className="flex flex-col items-center gap-3">
            <label className="text-xs font-medium text-slate-600">Your secret number (1-100):</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={100}
                value={secretNumber}
                onChange={(e) => setSecretNumber(Number(e.target.value))}
                className="w-48 accent-indigo-500"
              />
              <input
                type="number"
                min={1}
                max={100}
                value={secretNumber}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(100, Number(e.target.value)));
                  setSecretNumber(v);
                }}
                className="w-16 border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-center font-bold text-slate-800"
              />
            </div>
            <button
              onClick={() => { playPop(); startGame(); }}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] hover:translate-y-px transition-transform"
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          </div>
        )}

        {/* Number line */}
        {started && (
          <>
            <div className="flex justify-center overflow-x-auto">
              <svg width={nlWidth} height={nlHeight} viewBox={`0 0 ${nlWidth} ${nlHeight}`} className="max-w-full">
                {/* Full bar background */}
                <rect x={scaleX(1)} y={barY} width={scaleX(100) - scaleX(1)} height={barH} rx={4} fill="#e2e8f0" />
                {/* Active range */}
                <rect
                  x={scaleX(low)}
                  y={barY}
                  width={Math.max(scaleX(high) - scaleX(low), 2)}
                  height={barH}
                  rx={4}
                  fill="#93c5fd"
                  style={{ transition: "all 0.3s ease-out" }}
                />
                {/* Tick marks */}
                {[1, 25, 50, 75, 100].map((v) => (
                  <g key={v}>
                    <line x1={scaleX(v)} y1={barY + barH} x2={scaleX(v)} y2={barY + barH + 6} stroke="#94a3b8" strokeWidth={1} />
                    <text x={scaleX(v)} y={barY + barH + 16} textAnchor="middle" style={{ fontSize: 9, fill: "#64748b" }}>
                      {v}
                    </text>
                  </g>
                ))}
                {/* Current guess arrow */}
                {!found && (
                  <g style={{ transition: "transform 0.3s ease-out" }}>
                    <polygon
                      points={`${scaleX(currentGuess) - 6},${barY - 2} ${scaleX(currentGuess) + 6},${barY - 2} ${scaleX(currentGuess)},${barY + 4}`}
                      fill="#ef4444"
                    />
                    <text
                      x={scaleX(currentGuess)}
                      y={barY - 8}
                      textAnchor="middle"
                      style={{ fontSize: 12, fontWeight: 700, fill: "#ef4444" }}
                    >
                      {currentGuess}
                    </text>
                  </g>
                )}
                {/* Found marker */}
                {found && (
                  <g>
                    <polygon
                      points={`${scaleX(secretNumber) - 6},${barY - 2} ${scaleX(secretNumber) + 6},${barY - 2} ${scaleX(secretNumber)},${barY + 4}`}
                      fill="#22c55e"
                    />
                    <text
                      x={scaleX(secretNumber)}
                      y={barY - 8}
                      textAnchor="middle"
                      style={{ fontSize: 12, fontWeight: 700, fill: "#22c55e" }}
                    >
                      {secretNumber}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Feedback buttons */}
            {!found && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-slate-700">
                  Computer guesses: <span className="font-bold text-lg text-indigo-700">{currentGuess}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (currentGuess === secretNumber) {
                        handleFeedback("correct");
                      } else {
                        handleFeedback("too_low");
                      }
                    }}
                    disabled={currentGuess >= secretNumber && currentGuess !== secretNumber}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentGuess >= secretNumber && currentGuess !== secretNumber
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    <ChevronUp className="w-4 h-4" />
                    Too Low
                  </button>
                  <button
                    onClick={() => handleFeedback("correct")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    Correct!
                  </button>
                  <button
                    onClick={() => {
                      if (currentGuess === secretNumber) {
                        handleFeedback("correct");
                      } else {
                        handleFeedback("too_high");
                      }
                    }}
                    disabled={currentGuess <= secretNumber && currentGuess !== secretNumber}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentGuess <= secretNumber && currentGuess !== secretNumber
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                    Too High
                  </button>
                </div>
              </div>
            )}

            {/* Found celebration */}
            {found && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-bold text-green-700">
                    Found it in {history.length} {history.length === 1 ? "guess" : "guesses"}!
                  </span>
                </div>
                <button
                  onClick={resetGame}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors mt-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              </div>
            )}

            {/* Guess history */}
            {history.length > 0 && (
              <div className="border border-slate-200 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Guess History
                </h4>
                <div className="flex flex-wrap gap-2">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                        h.feedback === "Correct!"
                          ? "bg-green-100 text-green-700"
                          : h.feedback === "Too high"
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      Guess {i + 1}: {h.guess} ({h.feedback})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <InfoBox variant="blue">
        This is learning in its simplest form: guess, get feedback, adjust. Every machine learning algorithm works on
        this same principle  make a prediction, check how wrong you are, and adjust to be less wrong next time!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Train the Line                                             */
/* ------------------------------------------------------------------ */

function TrainTheLine() {
  const seedRef = useRef(123);
  const points = useMemo(() => generatePoints(seedRef.current), []);

  const [slope, setSlope] = useState(0);
  const [intercept, setIntercept] = useState(8);
  const [step, setStep] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [autoTraining, setAutoTraining] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const learningRate = 0.01;

  const error = useMemo(() => computeError(points, slope, intercept), [points, slope, intercept]);

  // Refs to track current values for interval callbacks
  const slopeRef = useRef(slope);
  const interceptRef = useRef(intercept);
  slopeRef.current = slope;
  interceptRef.current = intercept;

  const doStep = useCallback(() => {
    const result = gradientDescentStep(points, slopeRef.current, interceptRef.current, learningRate);
    const err = computeError(points, result.slope, result.intercept);
    setSlope(result.slope);
    setIntercept(result.intercept);
    setStep((s) => s + 1);
    setLossHistory((h) => [...h, err]);
  }, [points, learningRate]);

  useEffect(() => {
    if (autoTraining) {
      intervalRef.current = setInterval(() => {
        doStep();
      }, 200);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoTraining, doStep]);

  const reset = useCallback(() => {
    const rng = mulberry32(Date.now());
    setSlope(rng() * 2 - 1); // random bad slope
    setIntercept(rng() * 10); // random bad intercept
    setStep(0);
    setLossHistory([]);
    setAutoTraining(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Watch the computer learn to fit a line to the data</h3>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-600">
          <span>
            Step: <span className="font-bold text-slate-800">{step}</span>
          </span>
          <span>
            Slope: <span className="font-bold text-slate-800">{slope.toFixed(2)}</span>
          </span>
          <span>
            Intercept: <span className="font-bold text-slate-800">{intercept.toFixed(2)}</span>
          </span>
          <span>
            Error: <span className="font-bold text-red-600">{error.toFixed(2)}</span>
          </span>
        </div>

        {/* Scatter plot */}
        <div className="flex justify-center overflow-x-auto">
          <ScatterPlot
            width={560}
            height={350}
            points={points}
            slope={slope}
            intercept={intercept}
            showResiduals
          />
        </div>

        {/* Loss curve */}
        <div className="flex flex-col items-center gap-1">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Loss Curve</h4>
          <LossCurve width={200} height={120} history={lossHistory} color="#ef4444" />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={doStep}
            disabled={autoTraining}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              autoTraining
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            }`}
          >
            Take One Step
          </button>
          {!autoTraining ? (
            <button
              onClick={() => setAutoTraining(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Auto Train
            </button>
          ) : (
            <button
              onClick={() => setAutoTraining(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          )}
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <InfoBox variant="amber">
        Watch the error go down with each step. The computer is learning! It adjusts the line a little bit each time,
        always trying to make the error smaller.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Learning Speed                                             */
/* ------------------------------------------------------------------ */

interface LRTracker {
  slope: number;
  intercept: number;
  step: number;
  lossHistory: number[];
}

function LearningSpeed() {
  const seedRef = useRef(456);
  const points = useMemo(() => generatePoints(seedRef.current), []);

  const initTracker = useCallback(
    (seed: number): LRTracker => {
      const rng = mulberry32(seed);
      return {
        slope: rng() * 2 - 1,
        intercept: rng() * 10,
        step: 0,
        lossHistory: [],
      };
    },
    [],
  );

  const [tiny, setTiny] = useState<LRTracker>(() => initTracker(1001));
  const [good, setGood] = useState<LRTracker>(() => initTracker(1001));
  const [huge, setHuge] = useState<LRTracker>(() => initTracker(1001));
  const [running, setRunning] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tinyRef = useRef(tiny);
  const goodRef = useRef(good);
  const hugeRef = useRef(huge);
  tinyRef.current = tiny;
  goodRef.current = good;
  hugeRef.current = huge;

  const stepAll = useCallback(() => {
    const runStep = (tracker: LRTracker, lr: number): LRTracker => {
      const result = gradientDescentStep(points, tracker.slope, tracker.intercept, lr);
      const err = computeError(points, result.slope, result.intercept);
      // Clamp error to prevent NaN from huge learning rate
      const clampedErr = isFinite(err) ? Math.min(err, 1000) : 1000;
      return {
        slope: isFinite(result.slope) ? result.slope : tracker.slope,
        intercept: isFinite(result.intercept) ? result.intercept : tracker.intercept,
        step: tracker.step + 1,
        lossHistory: [...tracker.lossHistory, clampedErr],
      };
    };

    setTiny((prev) => runStep(prev, 0.001));
    setGood((prev) => runStep(prev, 0.01));
    setHuge((prev) => runStep(prev, 0.1));
    setStepsCompleted((s) => s + 1);
  }, [points]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        stepAll();
      }, 150);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, stepAll]);

  // Auto-stop after 60 steps
  useEffect(() => {
    if (stepsCompleted >= 60 && running) {
      setRunning(false);
    }
  }, [stepsCompleted, running]);

  const resetAll = useCallback(() => {
    const seed = Date.now() % 100000;
    setTiny(initTracker(seed));
    setGood(initTracker(seed));
    setHuge(initTracker(seed));
    setStepsCompleted(0);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [initTracker]);

  const getObservation = (_tracker: LRTracker, type: "tiny" | "good" | "huge"): string | null => {
    if (stepsCompleted < 50) return null;
    if (type === "tiny") return "Still learning... very slow";
    if (type === "good") return "Converged nicely!";
    return "Overshooting! The error is bouncing around";
  };

  const chartColors = { tiny: "#3b82f6", good: "#22c55e", huge: "#ef4444" };

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">
          How does step size affect learning?
        </h3>

        {/* Step size info */}
        <div className="flex justify-center gap-6 text-xs text-slate-600">
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-1" />
            Tiny (0.001)
          </span>
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-1" />
            Good (0.01)
          </span>
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-1" />
            Huge (0.1)
          </span>
        </div>

        {/* Three loss curves */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {(
            [
              { tracker: tiny, label: "Tiny Steps", color: chartColors.tiny, type: "tiny" as const },
              { tracker: good, label: "Good Steps", color: chartColors.good, type: "good" as const },
              { tracker: huge, label: "Huge Steps", color: chartColors.huge, type: "huge" as const },
            ] as const
          ).map(({ tracker, label, color, type }) => (
            <div key={type} className="flex flex-col items-center gap-1">
              <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                <LossCurve width={180} height={100} history={tracker.lossHistory} label={label} color={color} />
              </div>
              <div className="text-xs text-slate-600">
                Error: <span className="font-bold">{tracker.lossHistory.length > 0 ? tracker.lossHistory[tracker.lossHistory.length - 1].toFixed(2) : ""}</span>
              </div>
              {getObservation(tracker, type) && (
                <div
                  className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                    type === "good"
                      ? "bg-green-100 text-green-700"
                      : type === "tiny"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {getObservation(tracker, type)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step counter */}
        <div className="text-center text-xs text-slate-500">
          Steps completed: <span className="font-bold text-slate-700">{stepsCompleted}</span>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {!running ? (
            <button
              onClick={() => {
                if (stepsCompleted >= 60) return;
                setRunning(true);
              }}
              disabled={stepsCompleted >= 60}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                stepsCompleted >= 60
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              <Play className="w-4 h-4" />
              Start Training
            </button>
          ) : (
            <button
              onClick={() => setRunning(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          )}
          <button
            onClick={resetAll}
            disabled={running}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              running
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      <InfoBox variant="green">
        The step size (also called "learning rate" in machine learning) controls how much the computer adjusts each
        time. Too small and learning takes forever. Too big and it overshoots. Finding the right step size is one of the
        most important decisions in ML!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 4  You vs The Computer                                        */
/* ------------------------------------------------------------------ */

function YouVsComputer() {
  const seedRef = useRef(789);
  const [points, setPoints] = useState<Point[]>(() => generatePoints(seedRef.current));

  // User controls
  const [userSlope, setUserSlope] = useState(0.5);
  const [userIntercept, setUserIntercept] = useState(3);

  // Computer state
  const [compSlope, setCompSlope] = useState(0);
  const [compIntercept, setCompIntercept] = useState(8);
  const [compStep, setCompStep] = useState(0);

  // Race state
  const [racing, setRacing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [finished, setFinished] = useState(false);
  const [compFinishTime, setCompFinishTime] = useState<number | null>(null);
  const [userFinishTime, setUserFinishTime] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const compSlopeRef = useRef(compSlope);
  const compInterceptRef = useRef(compIntercept);
  compSlopeRef.current = compSlope;
  compInterceptRef.current = compIntercept;

  const userError = useMemo(() => computeError(points, userSlope, userIntercept), [points, userSlope, userIntercept]);
  const compError = useMemo(() => computeError(points, compSlope, compIntercept), [points, compSlope, compIntercept]);

  const errorThreshold = 1.5;
  const learningRate = 0.01;

  // Computer training loop
  useEffect(() => {
    if (racing && !finished) {
      intervalRef.current = setInterval(() => {
        const result = gradientDescentStep(
          points,
          compSlopeRef.current,
          compInterceptRef.current,
          learningRate,
        );
        setCompSlope(result.slope);
        setCompIntercept(result.intercept);
        setCompStep((s) => s + 1);
      }, 50);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [racing, finished, points, learningRate]);

  // Timer
  useEffect(() => {
    if (racing && !finished) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 0.1);
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [racing, finished]);

  // Check computer finish
  useEffect(() => {
    if (racing && !finished && compFinishTime === null && compError < errorThreshold) {
      setCompFinishTime(timer);
    }
  }, [racing, finished, compError, compFinishTime, timer, errorThreshold]);

  // Check user finish
  useEffect(() => {
    if (racing && !finished && userFinishTime === null && userError < errorThreshold) {
      setUserFinishTime(timer);
    }
  }, [racing, finished, userError, userFinishTime, timer, errorThreshold]);

  // Check if both done or computer has converged significantly
  useEffect(() => {
    if (racing && compFinishTime !== null && (userFinishTime !== null || compStep > 100)) {
      setFinished(true);
      setRacing(false);
    }
  }, [racing, compFinishTime, userFinishTime, compStep]);

  const startRace = useCallback(() => {
    // Reset computer
    const rng = mulberry32(Date.now());
    setCompSlope(rng() * 2 - 1);
    setCompIntercept(rng() * 10);
    setCompStep(0);
    setTimer(0);
    setFinished(false);
    setCompFinishTime(null);
    setUserFinishTime(null);
    setRacing(true);
  }, []);

  const raceAgain = useCallback(() => {
    seedRef.current = Date.now() % 100000;
    const newPoints = generatePoints(seedRef.current);
    setPoints(newPoints);
    setUserSlope(0.5);
    setUserIntercept(3);
    const rng = mulberry32(Date.now() + 1);
    setCompSlope(rng() * 2 - 1);
    setCompIntercept(rng() * 10);
    setCompStep(0);
    setTimer(0);
    setFinished(false);
    setCompFinishTime(null);
    setUserFinishTime(null);
    setRacing(false);
  }, []);

  // Let user submit when they think they're done
  const handleUserDone = useCallback(() => {
    if (!racing || finished) return;
    setUserFinishTime(timer);
  }, [racing, finished, timer]);

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Can you fit the line better than the computer?</h3>

        {/* Timer and status */}
        {(racing || finished) && (
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-slate-600">
              Time: <span className="font-bold text-slate-800">{timer.toFixed(1)}s</span>
            </span>
            <span className="text-slate-600">
              Target error: <span className="font-bold text-green-600">&lt; {errorThreshold.toFixed(1)}</span>
            </span>
          </div>
        )}

        {/* Side by side */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* User side */}
          <div className="flex-1 border border-slate-200 rounded-xl p-3 space-y-3">
            <h4 className="text-xs font-bold text-center text-indigo-700">Your Turn</h4>
            <div className="flex justify-center overflow-x-auto">
              <ScatterPlot
                width={280}
                height={200}
                points={points}
                slope={userSlope}
                intercept={userIntercept}
                lineColor="#6366f1"
              />
            </div>
            <div className="text-center">
              <span
                className={`text-lg font-bold ${userError < errorThreshold ? "text-green-600" : "text-red-600"}`}
              >
                Error: {userError.toFixed(2)}
              </span>
            </div>
            {/* Sliders */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 w-16">Slope:</label>
                <input
                  type="range"
                  min={-2}
                  max={3}
                  step={0.05}
                  value={userSlope}
                  onChange={(e) => setUserSlope(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                  disabled={finished}
                />
                <span className="text-xs font-mono text-slate-700 w-10 text-right">{userSlope.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 w-16">Intercept:</label>
                <input
                  type="range"
                  min={-5}
                  max={12}
                  step={0.1}
                  value={userIntercept}
                  onChange={(e) => setUserIntercept(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                  disabled={finished}
                />
                <span className="text-xs font-mono text-slate-700 w-10 text-right">{userIntercept.toFixed(2)}</span>
              </div>
            </div>
            {racing && !finished && userFinishTime === null && (
              <div className="flex justify-center">
                <button
                  onClick={handleUserDone}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                >
                  I'm Done!
                </button>
              </div>
            )}
          </div>

          {/* Computer side */}
          <div className="flex-1 border border-slate-200 rounded-xl p-3 space-y-3">
            <h4 className="text-xs font-bold text-center text-emerald-700">Computer's Turn</h4>
            <div className="flex justify-center overflow-x-auto">
              <ScatterPlot
                width={280}
                height={200}
                points={points}
                slope={compSlope}
                intercept={compIntercept}
                lineColor="#22c55e"
              />
            </div>
            <div className="text-center">
              <span
                className={`text-lg font-bold ${compError < errorThreshold ? "text-green-600" : "text-red-600"}`}
              >
                Error: {compError.toFixed(2)}
              </span>
            </div>
            <div className="text-center text-xs text-slate-500">
              Steps taken: <span className="font-bold text-slate-700">{compStep}</span>
            </div>
          </div>
        </div>

        {/* Result comparison */}
        {finished && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center space-y-2">
            <p className="text-sm font-bold text-indigo-800">Race Complete!</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 text-xs text-indigo-700">
              <span>
                You: Error = <span className="font-bold">{userError.toFixed(2)}</span>
                {userFinishTime !== null && (
                  <> (took {userFinishTime.toFixed(1)}s)</>
                )}
              </span>
              <span>
                Computer: Error = <span className="font-bold">{compError.toFixed(2)}</span>
                {compFinishTime !== null && (
                  <> (took {compFinishTime.toFixed(1)}s)</>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {!racing && !finished && (
            <button
              onClick={startRace}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Start!
            </button>
          )}
          {(racing || finished) && (
            <button
              onClick={raceAgain}
              disabled={racing && !finished}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                racing && !finished
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Race Again
            </button>
          )}
        </div>
      </div>

      <InfoBox variant="indigo">
        Don't worry if the computer beats you  that's the whole point of machine learning! Computers can try thousands
        of adjustments per second. Your job is to understand HOW it works, not to be faster.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What are the three steps of the learning loop?",
    options: ["Read, Write, Execute", "Guess, Check, Adjust", "Input, Process, Output", "Start, Stop, Restart"],
    correctIndex: 1,
    explanation:
      "The learning loop is: Guess (make a prediction), Check (see how wrong you are), Adjust (change to be less wrong). Repeat until the error is small enough!",
  },
  {
    question: "What happens if the step size (learning rate) is too large?",
    options: [
      "Learning is very slow",
      "The computer learns perfectly",
      "The error overshoots and bounces around",
      "Nothing changes",
    ],
    correctIndex: 2,
    explanation:
      "A large step size causes the adjustments to overshoot the optimal values, making the error bounce around instead of decreasing smoothly.",
  },
  {
    question: "In the training process, what does the 'error' measure?",
    options: [
      "How fast the computer is",
      "How wrong the current prediction is",
      "How many data points there are",
      "The number of steps taken",
    ],
    correctIndex: 1,
    explanation:
      "The error measures how far off the current prediction (line) is from the actual data. The goal of training is to make this error as small as possible.",
  },
  {
    question: "Why is machine learning useful?",
    options: [
      "Computers are always right",
      "Computers can find patterns much faster than humans",
      "Machine learning is only for games",
      "It replaces all human thinking",
    ],
    correctIndex: 1,
    explanation:
      "Machine learning is powerful because computers can process millions of data points and try thousands of adjustments per second, finding patterns that would take humans much longer to discover.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L10_HowComputersLearnActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "guessing",
        label: "The Guessing Game",
        icon: <HelpCircle className="w-4 h-4" />,
        content: <GuessingGame />,
      },
      {
        id: "train",
        label: "Train the Line",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <TrainTheLine />,
      },
      {
        id: "speed",
        label: "Learning Speed",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <LearningSpeed />,
      },
      {
        id: "vs",
        label: "You vs The Computer",
        icon: <Swords className="w-4 h-4" />,
        content: <YouVsComputer />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="How Computers Learn"
      level={3}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Congratulations! You've completed Level 3! You now understand the foundations of how machines learn. In Level 4, you'll start building real machine learning models!"
      story={
        <StorySection
          paragraphs={[
            "Aru decided to play \"guess the number\" with Byte. She picked 73 and told Byte to guess.",
            "Byte: \"Is it 50?\" Aru: \"Too low.\" Byte: \"75?\" Aru: \"Too high.\" Byte: \"62?\" Aru: \"Too low.\" Byte: \"69?\" Aru: \"Too low.\" Byte: \"72?\" Aru: \"Too low.\" Byte: \"73!\"",
            "Aru: \"Wait a minute... you got better with every guess! Each time I told you 'too high' or 'too low,' you adjusted. That's... learning!\"",
            "Byte: \"Exactly! That's the core of machine learning: guess, get feedback on how wrong you are, adjust, and repeat. Every ML algorithm in the world - from self-driving cars to language translators - works on this same loop.\"",
            "Aru: \"So machine learning is just... guessing and improving?\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Machine learning is built on a simple loop: Guess (make a prediction), Check (measure how wrong you are), Adjust (change to be less wrong), Repeat. The 'step size' controls how much you adjust each time - too small is slow, too large causes overshooting. This is the foundation of all modern AI."
        />
      }
    />
  );
}
