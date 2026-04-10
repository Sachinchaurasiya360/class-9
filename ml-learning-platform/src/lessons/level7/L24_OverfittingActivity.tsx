"use client";

import { useState, useMemo, useCallback } from "react";
import { TrendingUp, BarChart3, Shield, Palette } from "lucide-react";
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

interface DataPoint { x: number; y: number }

function generateData(seed: number, count: number): DataPoint[] {
  const rand = mulberry32(seed);
  const pts: DataPoint[] = [];
  for (let i = 0; i < count; i++) {
    const x = 0.05 + (i / (count - 1)) * 0.9;
    const noise = (rand() - 0.5) * 0.3;
    const y = 0.6 * (x - 0.5) * (x - 0.5) + 0.3 + noise;
    pts.push({ x, y });
  }
  return pts;
}

const TRAIN_DATA = generateData(42, 15);
const TEST_DATA = generateData(99, 10);

function fitPolynomial(data: DataPoint[], degree: number, lambda: number = 0): number[] {
  const n = degree + 1;
  const X: number[][] = [];
  const Y: number[] = [];
  for (const p of data) {
    const row: number[] = [];
    for (let d = 0; d < n; d++) row.push(Math.pow(p.x, d));
    X.push(row);
    Y.push(p.y);
  }

  const XtX: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const XtY: number[] = Array(n).fill(0);
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < n; j++) {
      XtY[j] += X[i][j] * Y[i];
      for (let k = 0; k < n; k++) {
        XtX[j][k] += X[i][j] * X[i][k];
      }
    }
  }
  for (let j = 0; j < n; j++) XtX[j][j] += lambda;

  const aug: number[][] = XtX.map((row, i) => [...row, XtY[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    if (Math.abs(aug[col][col]) < 1e-12) continue;
    const pivot = aug[col][col];
    for (let j = col; j <= n; j++) aug[col][j] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = col; j <= n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }
  return aug.map((row) => row[n]);
}

function evalPoly(coeffs: number[], x: number): number {
  let v = 0;
  for (let d = 0; d < coeffs.length; d++) v += coeffs[d] * Math.pow(x, d);
  return v;
}

function mse(coeffs: number[], data: DataPoint[]): number {
  let s = 0;
  for (const p of data) {
    const diff = evalPoly(coeffs, p.x) - p.y;
    s += diff * diff;
  }
  return s / data.length;
}

const W = 480;
const H = 300;
const PAD = 46;
function xToSvg(x: number): number { return PAD + x * (W - 2 * PAD); }
function yToSvg(y: number): number {
  const minY = 0.0, maxY = 1.2;
  return PAD + (1 - (clamp(y, minY, maxY) - minY) / (maxY - minY)) * (H - 2 * PAD);
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Fit the Curve                                             */
/* ------------------------------------------------------------------ */
function FitCurveTab() {
  const [degree, setDegree] = useState(3);
  const [themeIdx, setThemeIdx] = useState(1);
  const theme = THEMES[themeIdx];

  const coeffs = useMemo(() => fitPolynomial(TRAIN_DATA, degree), [degree]);
  const trainErr = useMemo(() => mse(coeffs, TRAIN_DATA), [coeffs]);
  const testErr = useMemo(() => mse(coeffs, TEST_DATA), [coeffs]);

  const curvePathD = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      pts.push(`${i === 0 ? "M" : "L"}${xToSvg(x).toFixed(1)},${yToSvg(evalPoly(coeffs, x)).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [coeffs]);

  const fitLabel = degree <= 1 ? "Underfit" : degree <= 4 ? "Good fit" : "Overfit!";
  const fitColor = degree <= 1 ? "#f59e0b" : degree <= 4 ? "#22c55e" : "#ef4444";
  const isOverfit = degree > 4;

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        Drag the slider to change polynomial degree. Watch how the curve fits the training points.
      </p>

      <div className="card-sketchy p-3 flex items-center gap-3 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold">Degree:</span>
        <input
          type="range" min={1} max={10} step={1}
          value={degree}
          onChange={(e) => { setDegree(Number(e.target.value)); playPop(); }}
          className="w-48 accent-accent-coral"
        />
        <span className="font-hand text-base font-bold" style={{ color: theme.node }}>{degree}</span>
        <span className="font-hand text-xs font-bold px-2 py-0.5 rounded-full border-2 border-foreground" style={{ background: fitColor + "33" }}>{fitLabel}</span>
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[560px] mx-auto">
          <defs>
            <radialGradient id="of-train" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#94caff" />
              <stop offset="100%" stopColor="#3b82f6" />
            </radialGradient>
            <radialGradient id="of-test" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ffb3b3" />
              <stop offset="100%" stopColor="#ef4444" />
            </radialGradient>
          </defs>

          {/* Axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={INK} strokeWidth={2} />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke={INK} strokeWidth={2} />

          {/* Fitted curve */}
          <path
            d={curvePathD}
            fill="none"
            stroke={theme.node}
            strokeWidth={3}
            strokeLinecap="round"
            className={isOverfit ? "wobble" : ""}
          />
          <path d={curvePathD} fill="none" stroke={INK} strokeWidth={1} opacity={0.4} strokeLinecap="round" />

          {/* Train points */}
          {TRAIN_DATA.map((p, i) => (
            <circle
              key={`tr-${i}`}
              cx={xToSvg(p.x)} cy={yToSvg(p.y)}
              r={6} fill="url(#of-train)" stroke={INK} strokeWidth={1.8}
              className="pulse-glow"
              style={{ color: "#3b82f6" }}
            />
          ))}

          {/* Test points */}
          {TEST_DATA.map((p, i) => (
            <rect
              key={`te-${i}`}
              x={xToSvg(p.x) - 5} y={yToSvg(p.y) - 5}
              width={10} height={10} rx={1.5}
              fill="url(#of-test)" stroke={INK} strokeWidth={1.8}
            />
          ))}

          {/* Legend */}
          <g>
            <circle cx={W - 130} cy={PAD + 6} r={5} fill="url(#of-train)" stroke={INK} strokeWidth={1.5} />
            <text x={W - 118} y={PAD + 10} fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">Train data</text>
            <rect x={W - 135} y={PAD + 18} width={10} height={10} rx={1.5} fill="url(#of-test)" stroke={INK} strokeWidth={1.5} />
            <text x={W - 118} y={PAD + 27} fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">Test data</text>
          </g>
        </svg>
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <div className="card-sketchy px-4 py-2 text-center">
          <p className="font-hand text-[11px] font-bold text-muted-foreground">Train Error</p>
          <p className="font-hand text-base font-bold text-blue-600">{trainErr.toFixed(4)}</p>
        </div>
        <div className={`card-sketchy px-4 py-2 text-center ${isOverfit ? "bg-accent-coral/20" : ""}`}>
          <p className="font-hand text-[11px] font-bold text-muted-foreground">Test Error</p>
          <p className={`font-hand text-base font-bold text-red-600 ${isOverfit ? "pulse-glow" : ""}`} style={{ color: "#ef4444" }}>{testErr.toFixed(4)}</p>
        </div>
      </div>

      <InfoBox variant="blue" title="Underfitting vs Overfitting">
        <strong>Low degree:</strong> too simple to capture the pattern (underfit).
        <br />
        <strong>High degree:</strong> memorizes noise in training data and fails on new data (overfit).
        <br />
        <strong>Just right:</strong> captures the true pattern without memorizing noise.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Train vs Test Error                                       */
/* ------------------------------------------------------------------ */
function ErrorCurveTab() {
  const [selectedDeg, setSelectedDeg] = useState<number | null>(null);
  const [themeIdx, setThemeIdx] = useState(2);

  const errors = useMemo(() => {
    const trainE: number[] = [];
    const testE: number[] = [];
    for (let d = 1; d <= 10; d++) {
      const c = fitPolynomial(TRAIN_DATA, d);
      trainE.push(mse(c, TRAIN_DATA));
      testE.push(mse(c, TEST_DATA));
    }
    return { train: trainE, test: testE };
  }, []);

  const bestDeg = errors.test.indexOf(Math.min(...errors.test)) + 1;

  const UW = 480;
  const UH = 280;
  const maxErr = 0.06;

  const handleClick = useCallback((deg: number) => {
    playPop();
    setSelectedDeg(deg);
    if (deg === bestDeg) playSuccess();
  }, [bestDeg]);

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        Click on different complexity levels to see the fitted curve. Find the sweet spot where test error is lowest!
      </p>

      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox={`0 0 ${UW} ${UH}`} className="w-full max-w-[560px] mx-auto">
          <line x1={PAD} y1={UH - PAD} x2={UW - PAD} y2={UH - PAD} stroke={INK} strokeWidth={2} />
          <line x1={PAD} y1={PAD} x2={PAD} y2={UH - PAD} stroke={INK} strokeWidth={2} />
          <text x={UW / 2} y={UH - 8} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">Model Complexity (Degree)</text>
          <text x={14} y={UH / 2} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold" transform={`rotate(-90,14,${UH / 2})`}>Error</text>

          {/* Sweet spot highlight */}
          {(() => {
            const bx = PAD + ((bestDeg - 1) / 9) * (UW - 2 * PAD);
            return (
              <>
                <rect x={bx - 14} y={PAD} width={28} height={UH - 2 * PAD} fill="#ffd93d" opacity={0.18} rx={4} />
                <text x={bx} y={PAD - 6} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[10px] font-bold">sweet spot</text>
              </>
            );
          })()}

          {/* Train error line */}
          <polyline
            points={errors.train.map((e, i) => {
              const sx = PAD + (i / 9) * (UW - 2 * PAD);
              const sy = PAD + (1 - clamp(e, 0, maxErr) / maxErr) * (UH - 2 * PAD);
              return `${sx.toFixed(1)},${sy.toFixed(1)}`;
            }).join(" ")}
            fill="none" stroke="#3b82f6" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
          />

          {/* Test error line */}
          <polyline
            points={errors.test.map((e, i) => {
              const sx = PAD + (i / 9) * (UW - 2 * PAD);
              const sy = PAD + (1 - clamp(e, 0, maxErr) / maxErr) * (UH - 2 * PAD);
              return `${sx.toFixed(1)},${sy.toFixed(1)}`;
            }).join(" ")}
            fill="none" stroke="#ef4444" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
          />

          {/* Clickable dots */}
          {errors.test.map((e, i) => {
            const sx = PAD + (i / 9) * (UW - 2 * PAD);
            const syTe = PAD + (1 - clamp(e, 0, maxErr) / maxErr) * (UH - 2 * PAD);
            const syTr = PAD + (1 - clamp(errors.train[i], 0, maxErr) / maxErr) * (UH - 2 * PAD);
            const isSelected = selectedDeg === i + 1;
            return (
              <g key={i} onClick={() => handleClick(i + 1)} className="cursor-pointer">
                <circle cx={sx} cy={syTr} r={isSelected ? 8 : 5} fill="#3b82f6" stroke={INK} strokeWidth={1.8} className={isSelected ? "pulse-glow" : ""} style={isSelected ? { color: "#3b82f6" } : undefined} />
                <circle cx={sx} cy={syTe} r={isSelected ? 8 : 5} fill="#ef4444" stroke={INK} strokeWidth={1.8} className={isSelected ? "pulse-glow" : ""} style={isSelected ? { color: "#ef4444" } : undefined} />
                <text x={sx} y={UH - PAD + 16} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[10px] font-bold">{i + 1}</text>
              </g>
            );
          })}

          {/* Legend */}
          <g>
            <circle cx={UW - 110} cy={PAD + 8} r={5} fill="#3b82f6" stroke={INK} strokeWidth={1.5} />
            <text x={UW - 100} y={PAD + 12} fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">Train error</text>
            <circle cx={UW - 110} cy={PAD + 24} r={5} fill="#ef4444" stroke={INK} strokeWidth={1.5} />
            <text x={UW - 100} y={PAD + 28} fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">Test error</text>
          </g>
        </svg>
      </div>

      {selectedDeg !== null && (
        <div className="card-sketchy p-3 animate-fadeIn">
          <p className="font-hand text-sm font-bold mb-1">
            Degree {selectedDeg} fit
            {selectedDeg === bestDeg && <span className="text-green-600 ml-1">(Sweet spot!)</span>}
          </p>
          <div className="flex gap-4 font-hand text-xs">
            <span>Train: <strong className="text-blue-600">{errors.train[selectedDeg - 1].toFixed(4)}</strong></span>
            <span>Test: <strong className="text-red-600">{errors.test[selectedDeg - 1].toFixed(4)}</strong></span>
          </div>
        </div>
      )}

      <InfoBox variant="amber" title="The U-Curve">
        Train error always decreases with complexity, but test error follows a U-shape. The bottom of the U is the sweet spot where the model generalizes best to unseen data.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Regularization                                            */
/* ------------------------------------------------------------------ */
function RegularizationTab() {
  const degree = 8;
  const [lambdaIdx, setLambdaIdx] = useState(0);
  const [themeIdx, setThemeIdx] = useState(3);
  const lambdaValues = [0, 0.001, 0.01, 0.05, 0.1, 0.5, 1, 3, 10];
  const lambda = lambdaValues[lambdaIdx];
  const theme = THEMES[themeIdx];

  const coeffs = useMemo(() => fitPolynomial(TRAIN_DATA, degree, lambda), [lambda]);
  const trainErr = useMemo(() => mse(coeffs, TRAIN_DATA), [coeffs]);
  const testErr = useMemo(() => mse(coeffs, TEST_DATA), [coeffs]);

  const curvePathD = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      pts.push(`${i === 0 ? "M" : "L"}${xToSvg(x).toFixed(1)},${yToSvg(evalPoly(coeffs, x)).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [coeffs]);

  const weightMag = useMemo(() => coeffs.reduce((s, c) => s + c * c, 0), [coeffs]);
  const wiggly = lambda < 0.01;

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLambdaIdx(Number(e.target.value));
    playPop();
    if (lambdaValues[Number(e.target.value)] >= 0.05 && lambdaValues[Number(e.target.value)] <= 1) {
      playSuccess();
    }
  }, []);

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        A degree-8 polynomial overfits badly. Drag the regularization slider to smooth it out!
      </p>

      <div className="card-sketchy p-3 flex items-center gap-3 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold">Regularization (λ):</span>
        <input
          type="range" min={0} max={lambdaValues.length - 1} step={1}
          value={lambdaIdx}
          onChange={handleSlider}
          className="w-48 accent-accent-coral"
        />
        <span className="font-hand text-base font-bold" style={{ color: theme.node }}>{lambda}</span>
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[560px] mx-auto">
          <defs>
            <radialGradient id="reg-train" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#94caff" />
              <stop offset="100%" stopColor="#3b82f6" />
            </radialGradient>
            <radialGradient id="reg-test" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ffb3b3" />
              <stop offset="100%" stopColor="#ef4444" />
            </radialGradient>
          </defs>

          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={INK} strokeWidth={2} />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke={INK} strokeWidth={2} />

          <path d={curvePathD} fill="none" stroke={theme.node} strokeWidth={3} strokeLinecap="round" className={wiggly ? "wobble" : ""} />
          <path d={curvePathD} fill="none" stroke={INK} strokeWidth={1} opacity={0.4} strokeLinecap="round" />

          {TRAIN_DATA.map((p, i) => (
            <circle key={i} cx={xToSvg(p.x)} cy={yToSvg(p.y)} r={6} fill="url(#reg-train)" stroke={INK} strokeWidth={1.8} />
          ))}

          {TEST_DATA.map((p, i) => (
            <rect key={i} x={xToSvg(p.x) - 5} y={yToSvg(p.y) - 5} width={10} height={10} rx={1.5} fill="url(#reg-test)" stroke={INK} strokeWidth={1.8} />
          ))}
        </svg>
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <div className="card-sketchy px-3 py-2 text-center">
          <p className="font-hand text-[11px] font-bold text-muted-foreground">Train Error</p>
          <p className="font-hand text-base font-bold text-blue-600">{trainErr.toFixed(4)}</p>
        </div>
        <div className="card-sketchy px-3 py-2 text-center">
          <p className="font-hand text-[11px] font-bold text-muted-foreground">Test Error</p>
          <p className="font-hand text-base font-bold text-red-600">{testErr.toFixed(4)}</p>
        </div>
        <div className="card-sketchy px-3 py-2 text-center">
          <p className="font-hand text-[11px] font-bold text-muted-foreground">Weight Penalty</p>
          <p className="font-hand text-base font-bold" style={{ color: "#f59e0b" }}>{weightMag.toFixed(2)}</p>
        </div>
      </div>

      <InfoBox variant="green" title="L2 Regularization">
        Regularization adds a penalty for large weights. As lambda increases, the model is &quot;punished&quot; for being too wiggly, forcing it to find a simpler, smoother curve that generalizes better.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is overfitting?",
    options: ["The model is too simple", "The model memorizes training data but fails on new data", "The model trains too slowly", "The model has too few parameters"],
    correctIndex: 1,
    explanation: "Overfitting occurs when a model memorizes the training data (including noise) instead of learning the general pattern, causing poor performance on unseen data.",
  },
  {
    question: "What does the U-curve of test error tell us?",
    options: ["More complexity is always better", "There is a sweet spot between too simple and too complex", "Test error always decreases", "Train error is more important"],
    correctIndex: 1,
    explanation: "The U-curve shows that test error first decreases as the model captures real patterns, then increases when it starts memorizing noise. The bottom of the U is the sweet spot.",
  },
  {
    question: "How does regularization prevent overfitting?",
    options: ["By adding more training data", "By penalizing large weights to keep the model simpler", "By increasing the learning rate", "By removing test data"],
    correctIndex: 1,
    explanation: "Regularization adds a penalty term that discourages large weights, forcing the model to find simpler solutions that generalize better to new data.",
  },
  {
    question: "What happens if regularization (lambda) is too large?",
    options: ["Perfect fit", "The model overfits more", "The model becomes too simple (underfits)", "Nothing changes"],
    correctIndex: 2,
    explanation: "Too much regularization over-penalizes the weights, making the model too simple and unable to capture the real pattern in the data (underfitting).",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L24_OverfittingActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "fit",
        label: "Fit the Curve",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <FitCurveTab />,
      },
      {
        id: "ucurve",
        label: "Train vs Test Error",
        icon: <BarChart3 className="w-4 h-4" />,
        content: <ErrorCurveTab />,
      },
      {
        id: "regularization",
        label: "Regularization",
        icon: <Shield className="w-4 h-4" />,
        content: <RegularizationTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Overfitting & Regularization"
      level={7}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: SGD vs Batch  different ways to feed data during training!"
      story={
        <StorySection
          paragraphs={[
            "Aru studied for her math exam by memorizing every problem in her textbook, word for word.",
            "Aru: \"I know every single answer! 2 + 3 = 5, problem 4 is 17, problem 5 is 42...\"",
            "Byte: \"But what if the exam has different numbers? Can you solve 3 + 4?\"",
            "Aru: \"Um... that's not in my textbook...\"",
            "Byte: \"That's overfitting! You memorized the training data instead of learning the pattern. Real learning means understanding the rule so you can handle new problems. Let's learn how to prevent this!\"",
          ]}
          conceptTitle="Overfitting"
          conceptSummary="Overfitting happens when a model memorizes the training data (including its noise) instead of learning the general pattern. Regularization helps by penalizing overly complex models, keeping them simple enough to work on new, unseen data."
        />
      }
    />
  );
}
