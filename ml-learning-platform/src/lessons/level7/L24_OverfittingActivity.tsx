import { useState, useMemo, useCallback } from "react";
import { TrendingUp, BarChart3, Shield } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playPop, playSuccess } from "../../utils/sounds";

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

/* Generate noisy data from a quadratic */
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

/* Fit polynomial and evaluate */
function fitPolynomial(data: DataPoint[], degree: number, lambda: number = 0): number[] {
  /* Simple least-squares via normal equations (small degree, fine for demo) */
  const n = degree + 1;
  const X: number[][] = [];
  const Y: number[] = [];
  for (const p of data) {
    const row: number[] = [];
    for (let d = 0; d < n; d++) row.push(Math.pow(p.x, d));
    X.push(row);
    Y.push(p.y);
  }

  /* XtX + lambda * I */
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

  /* Gaussian elimination */
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

/* SVG constants */
const W = 460;
const H = 280;
const PAD = 45;
function xToSvg(x: number): number { return PAD + x * (W - 2 * PAD); }
function yToSvg(y: number): number {
  const minY = 0.0;
  const maxY = 1.2;
  return PAD + (1 - (clamp(y, minY, maxY) - minY) / (maxY - minY)) * (H - 2 * PAD);
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Fit the Curve                                             */
/* ------------------------------------------------------------------ */
function FitCurveTab() {
  const [degree, setDegree] = useState(3);

  const coeffs = useMemo(() => fitPolynomial(TRAIN_DATA, degree), [degree]);
  const trainErr = useMemo(() => mse(coeffs, TRAIN_DATA), [coeffs]);
  const testErr = useMemo(() => mse(coeffs, TEST_DATA), [coeffs]);

  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      const y = evalPoly(coeffs, x);
      const sx = xToSvg(x);
      const sy = yToSvg(y);
      pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [coeffs]);

  const fitLabel = degree <= 1 ? "Underfit" : degree <= 4 ? "Good fit" : "Overfit!";
  const fitColor = degree <= 1 ? "#f59e0b" : degree <= 4 ? "#22c55e" : "#ef4444";

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Drag the slider to change polynomial degree. Watch how the curve fits the training points.
      </p>

      {/* Degree slider */}
      <div className="flex items-center gap-3 justify-center">
        <span className="text-xs text-slate-500">Degree:</span>
        <input
          type="range" min={1} max={10} step={1}
          value={degree}
          onChange={(e) => { setDegree(Number(e.target.value)); playPop(); }}
          className="w-48 accent-indigo-600"
        />
        <span className="text-sm font-bold text-indigo-700">{degree}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: fitColor + "22", color: fitColor }}>{fitLabel}</span>
      </div>

      {/* Scatter + curve */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[500px] mx-auto bg-slate-50 rounded-xl border border-slate-200">
        {/* Axes */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#cbd5e1" strokeWidth={1} />

        {/* Fitted curve */}
        <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth={2.5} />

        {/* Train points */}
        {TRAIN_DATA.map((p, i) => (
          <circle key={`tr-${i}`} cx={xToSvg(p.x)} cy={yToSvg(p.y)} r={5} fill="#3b82f6" stroke="#fff" strokeWidth={1.5} />
        ))}

        {/* Test points */}
        {TEST_DATA.map((p, i) => (
          <g key={`te-${i}`}>
            <rect x={xToSvg(p.x) - 4} y={yToSvg(p.y) - 4} width={8} height={8} rx={1} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
          </g>
        ))}

        {/* Legend */}
        <circle cx={W - 120} cy={PAD + 5} r={4} fill="#3b82f6" />
        <text x={W - 112} y={PAD + 9} className="text-[9px] fill-slate-600">Train data</text>
        <rect x={W - 124} y={PAD + 17} width={8} height={8} rx={1} fill="#ef4444" />
        <text x={W - 112} y={PAD + 25} className="text-[9px] fill-slate-600">Test data</text>
      </svg>

      {/* Error readout */}
      <div className="flex gap-4 justify-center">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-medium">Train Error</p>
          <p className="text-sm font-bold text-blue-600">{trainErr.toFixed(4)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-medium">Test Error</p>
          <p className="text-sm font-bold text-red-600">{testErr.toFixed(4)}</p>
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

  const UW = 460;
  const UH = 260;

  const maxErr = 0.06;

  const handleClick = useCallback((deg: number) => {
    playPop();
    setSelectedDeg(deg);
    if (deg === bestDeg) playSuccess();
  }, [bestDeg]);

  /* Mini curve for selected degree */
  const selectedCoeffs = useMemo(() => {
    if (selectedDeg === null) return null;
    return fitPolynomial(TRAIN_DATA, selectedDeg);
  }, [selectedDeg]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Click on different complexity levels to see the fitted curve. Find the sweet spot where test error is lowest!
      </p>

      {/* U-curve */}
      <svg viewBox={`0 0 ${UW} ${UH}`} className="w-full max-w-[500px] mx-auto bg-slate-50 rounded-xl border border-slate-200">
        {/* Axes */}
        <line x1={PAD} y1={UH - PAD} x2={UW - PAD} y2={UH - PAD} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={PAD} y1={PAD} x2={PAD} y2={UH - PAD} stroke="#cbd5e1" strokeWidth={1} />
        <text x={UW / 2} y={UH - 8} textAnchor="middle" className="text-[10px] fill-slate-500">Model Complexity (Degree)</text>
        <text x={12} y={UH / 2} textAnchor="middle" transform={`rotate(-90,12,${UH / 2})`} className="text-[10px] fill-slate-500">Error</text>

        {/* Sweet spot highlight */}
        {(() => {
          const bx = PAD + ((bestDeg - 1) / 9) * (UW - 2 * PAD);
          return <rect x={bx - 12} y={PAD} width={24} height={UH - 2 * PAD} fill="#22c55e" opacity={0.08} rx={4} />;
        })()}

        {/* Train error line */}
        <polyline
          points={errors.train.map((e, i) => {
            const sx = PAD + (i / 9) * (UW - 2 * PAD);
            const sy = PAD + (1 - clamp(e, 0, maxErr) / maxErr) * (UH - 2 * PAD);
            return `${sx.toFixed(1)},${sy.toFixed(1)}`;
          }).join(" ")}
          fill="none" stroke="#3b82f6" strokeWidth={2.5}
        />

        {/* Test error line */}
        <polyline
          points={errors.test.map((e, i) => {
            const sx = PAD + (i / 9) * (UW - 2 * PAD);
            const sy = PAD + (1 - clamp(e, 0, maxErr) / maxErr) * (UH - 2 * PAD);
            return `${sx.toFixed(1)},${sy.toFixed(1)}`;
          }).join(" ")}
          fill="none" stroke="#ef4444" strokeWidth={2.5}
        />

        {/* Clickable dots */}
        {errors.test.map((e, i) => {
          const sx = PAD + (i / 9) * (UW - 2 * PAD);
          const syTe = PAD + (1 - clamp(e, 0, maxErr) / maxErr) * (UH - 2 * PAD);
          const syTr = PAD + (1 - clamp(errors.train[i], 0, maxErr) / maxErr) * (UH - 2 * PAD);
          const isSelected = selectedDeg === i + 1;
          return (
            <g key={i} onClick={() => handleClick(i + 1)} className="cursor-pointer">
              <circle cx={sx} cy={syTr} r={isSelected ? 6 : 4} fill="#3b82f6" stroke="#fff" strokeWidth={1.5} className="transition-all duration-200 hover:r-[6]" />
              <circle cx={sx} cy={syTe} r={isSelected ? 6 : 4} fill="#ef4444" stroke="#fff" strokeWidth={1.5} className="transition-all duration-200 hover:r-[6]" />
              <text x={sx} y={UH - PAD + 14} textAnchor="middle" className="text-[9px] fill-slate-500">{i + 1}</text>
            </g>
          );
        })}

        {/* Legend */}
        <circle cx={UW - 110} cy={PAD + 8} r={4} fill="#3b82f6" />
        <text x={UW - 102} y={PAD + 12} className="text-[9px] fill-slate-600">Train error</text>
        <circle cx={UW - 110} cy={PAD + 24} r={4} fill="#ef4444" />
        <text x={UW - 102} y={PAD + 28} className="text-[9px] fill-slate-600">Test error</text>
      </svg>

      {/* Selected degree mini-view */}
      {selectedDeg !== null && selectedCoeffs !== null && (
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <p className="text-xs text-slate-600 mb-1 font-medium">Degree {selectedDeg} fit
            {selectedDeg === bestDeg && <span className="text-green-600 ml-1">(Sweet spot!)</span>}
          </p>
          <div className="flex gap-4 text-xs">
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
  const lambdaValues = [0, 0.001, 0.01, 0.05, 0.1, 0.5, 1, 3, 10];
  const lambda = lambdaValues[lambdaIdx];

  const coeffs = useMemo(() => fitPolynomial(TRAIN_DATA, degree, lambda), [lambda]);
  const trainErr = useMemo(() => mse(coeffs, TRAIN_DATA), [coeffs]);
  const testErr = useMemo(() => mse(coeffs, TEST_DATA), [coeffs]);

  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      const y = evalPoly(coeffs, x);
      const sx = xToSvg(x);
      const sy = yToSvg(y);
      pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [coeffs]);

  /* Total weight magnitude */
  const weightMag = useMemo(() => {
    return coeffs.reduce((s, c) => s + c * c, 0);
  }, [coeffs]);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLambdaIdx(Number(e.target.value));
    playPop();
    if (lambdaValues[Number(e.target.value)] >= 0.05 && lambdaValues[Number(e.target.value)] <= 1) {
      playSuccess();
    }
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        A degree-8 polynomial overfits badly. Drag the regularization slider to smooth it out!
      </p>

      {/* Lambda slider */}
      <div className="flex items-center gap-3 justify-center">
        <span className="text-xs text-slate-500">Regularization (lambda):</span>
        <input
          type="range" min={0} max={lambdaValues.length - 1} step={1}
          value={lambdaIdx}
          onChange={handleSlider}
          className="w-48 accent-indigo-600"
        />
        <span className="text-sm font-bold text-indigo-700">{lambda}</span>
      </div>

      {/* Scatter + curve */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[500px] mx-auto bg-slate-50 rounded-xl border border-slate-200">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#cbd5e1" strokeWidth={1} />

        <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth={2.5} />

        {TRAIN_DATA.map((p, i) => (
          <circle key={i} cx={xToSvg(p.x)} cy={yToSvg(p.y)} r={5} fill="#3b82f6" stroke="#fff" strokeWidth={1.5} />
        ))}

        {TEST_DATA.map((p, i) => (
          <rect key={i} x={xToSvg(p.x) - 4} y={yToSvg(p.y) - 4} width={8} height={8} rx={1} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
        ))}
      </svg>

      {/* Stats */}
      <div className="flex gap-4 justify-center flex-wrap">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-medium">Train Error</p>
          <p className="text-sm font-bold text-blue-600">{trainErr.toFixed(4)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-medium">Test Error</p>
          <p className="text-sm font-bold text-red-600">{testErr.toFixed(4)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-medium">Weight Penalty</p>
          <p className="text-sm font-bold text-amber-600">{weightMag.toFixed(2)}</p>
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
      nextLessonHint="Next: SGD vs Batch — different ways to feed data during training!"
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
