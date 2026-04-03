import { useState, useMemo, useCallback } from "react";
import { TrendingUp, Circle, AlertCircle, RefreshCw, Check } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";

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

/** Approximate normal distribution using sum of 6 uniforms. */
function normalApprox(rng: () => number, std: number): number {
  return (rng() + rng() + rng() + rng() + rng() + rng() - 3) / 3 * std;
}

/* ------------------------------------------------------------------ */
/*  SVG helpers                                                        */
/* ------------------------------------------------------------------ */

const PLOT_W = 500;
const PLOT_H = 350;
const PAD = { top: 20, right: 20, bottom: 40, left: 45 };
const INNER_W = PLOT_W - PAD.left - PAD.right;
const INNER_H = PLOT_H - PAD.top - PAD.bottom;

function toSvgX(val: number, min: number, max: number) {
  return PAD.left + ((val - min) / (max - min)) * INNER_W;
}
function toSvgY(val: number, min: number, max: number) {
  return PAD.top + INNER_H - ((val - min) / (max - min)) * INNER_H;
}

/** Render axes, gridlines and labels for a 0-10 range. */
function PlotAxes({ xLabel = "X", yLabel = "Y" }: { xLabel?: string; yLabel?: string }) {
  const ticks = [0, 2, 4, 6, 8, 10];
  return (
    <g>
      {/* Gridlines */}
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={toSvgX(t, 0, 10)}
            y1={PAD.top}
            x2={toSvgX(t, 0, 10)}
            y2={PAD.top + INNER_H}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <line
            x1={PAD.left}
            y1={toSvgY(t, 0, 10)}
            x2={PAD.left + INNER_W}
            y2={toSvgY(t, 0, 10)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          {/* X labels */}
          <text
            x={toSvgX(t, 0, 10)}
            y={PAD.top + INNER_H + 18}
            textAnchor="middle"
            className="fill-slate-400"
            style={{ fontSize: 10 }}
          >
            {t}
          </text>
          {/* Y labels */}
          <text
            x={PAD.left - 10}
            y={toSvgY(t, 0, 10) + 4}
            textAnchor="end"
            className="fill-slate-400"
            style={{ fontSize: 10 }}
          >
            {t}
          </text>
        </g>
      ))}
      {/* Axes lines */}
      <line
        x1={PAD.left}
        y1={PAD.top + INNER_H}
        x2={PAD.left + INNER_W}
        y2={PAD.top + INNER_H}
        stroke="#94a3b8"
        strokeWidth={1.5}
      />
      <line
        x1={PAD.left}
        y1={PAD.top}
        x2={PAD.left}
        y2={PAD.top + INNER_H}
        stroke="#94a3b8"
        strokeWidth={1.5}
      />
      {/* Axis labels */}
      <text
        x={PAD.left + INNER_W / 2}
        y={PAD.top + INNER_H + 35}
        textAnchor="middle"
        className="fill-slate-500"
        style={{ fontSize: 11 }}
      >
        {xLabel}
      </text>
      <text
        x={12}
        y={PAD.top + INNER_H / 2}
        textAnchor="middle"
        className="fill-slate-500"
        style={{ fontSize: 11 }}
        transform={`rotate(-90, 12, ${PAD.top + INNER_H / 2})`}
      >
        {yLabel}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 — Trend Detector                                             */
/* ------------------------------------------------------------------ */

type TrendType = "positive" | "negative" | "flat";

interface TrendPoint {
  x: number;
  y: number;
}

function generateTrendData(seed: number): { points: TrendPoint[]; trend: TrendType; slope: number; intercept: number } {
  const rng = mulberry32(seed);
  const r = rng();
  let trend: TrendType;
  let slope: number;
  if (r < 0.33) {
    trend = "positive";
    slope = 0.5 + rng() * 0.4; // ~0.5-0.9
  } else if (r < 0.66) {
    trend = "negative";
    slope = -(0.5 + rng() * 0.4);
  } else {
    trend = "flat";
    slope = (rng() - 0.5) * 0.15; // nearly zero
  }

  const intercept = 2 + rng() * 3; // 2-5
  const points: TrendPoint[] = [];
  for (let i = 0; i < 25; i++) {
    const x = 0.5 + rng() * 9; // 0.5-9.5
    const noise = normalApprox(rng, 1.0);
    let y = slope * x + intercept + noise;
    y = Math.max(0.2, Math.min(9.8, y));
    points.push({ x, y });
  }
  return { points, trend, slope, intercept };
}

function TrendDetector() {
  const [seedCounter, setSeedCounter] = useState(42);
  const [selected, setSelected] = useState<TrendType | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [shakeBtn, setShakeBtn] = useState<TrendType | null>(null);

  const data = useMemo(() => generateTrendData(seedCounter), [seedCounter]);

  const handleAnswer = useCallback(
    (answer: TrendType) => {
      if (correct === true) return; // already answered correctly
      if (answer === data.trend) {
        setSelected(answer);
        setCorrect(true);
        setStreak((s) => s + 1);
      } else {
        setCorrect(false);
        setStreak(0);
        setShakeBtn(answer);
        setTimeout(() => setShakeBtn(null), 500);
      }
    },
    [data.trend, correct],
  );

  const handleNewData = useCallback(() => {
    setSeedCounter((c) => c + 1);
    setSelected(null);
    setCorrect(null);
  }, []);

  const trendLabel: Record<TrendType, string> = {
    positive: "Going Up (Positive)",
    negative: "Going Down (Negative)",
    flat: "No Clear Trend",
  };

  // Compute trend line endpoints
  const trendLineY0 = data.slope * 0 + data.intercept;
  const trendLineY10 = data.slope * 10 + data.intercept;

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .shake-anim { animation: shake 0.4s ease-in-out; }
      `}</style>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">What trend do you see?</h3>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            Correct streak: {streak}
          </span>
        </div>

        {/* SVG Scatter Plot */}
        <div className="flex justify-center">
          <svg
            width={PLOT_W}
            height={PLOT_H}
            viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
            className="max-w-full bg-slate-50 rounded-lg"
          >
            <PlotAxes />
            {/* Data points */}
            {data.points.map((p, i) => (
              <circle
                key={i}
                cx={toSvgX(p.x, 0, 10)}
                cy={toSvgY(p.y, 0, 10)}
                r={5}
                className="fill-indigo-500 opacity-70"
              />
            ))}
            {/* Trend line (shown on correct answer) */}
            {correct === true && (
              <line
                x1={toSvgX(0, 0, 10)}
                y1={toSvgY(Math.max(0, Math.min(10, trendLineY0)), 0, 10)}
                x2={toSvgX(10, 0, 10)}
                y2={toSvgY(Math.max(0, Math.min(10, trendLineY10)), 0, 10)}
                stroke="#ef4444"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                opacity={0.8}
              />
            )}
          </svg>
        </div>

        {/* Answer buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {(["positive", "negative", "flat"] as TrendType[]).map((t) => {
            const isCorrectAnswer = correct === true && selected === t;
            return (
              <button
                key={t}
                onClick={() => handleAnswer(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCorrectAnswer
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } ${shakeBtn === t ? "shake-anim" : ""}`}
              >
                {trendLabel[t]}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {correct === true && (
          <p className="text-center text-sm font-medium text-green-600">
            <Check className="w-4 h-4 inline -mt-0.5 mr-1" />
            Correct! The data has a {data.trend === "flat" ? "flat (no clear)" : data.trend} trend.
          </p>
        )}
        {correct === false && (
          <p className="text-center text-sm font-medium text-amber-600">Look again...</p>
        )}

        {/* New Data button */}
        <div className="flex justify-center">
          <button
            onClick={handleNewData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Data
          </button>
        </div>
      </div>

      <InfoBox variant="blue">
        A <strong>trend</strong> is the general direction data is heading. Not every point follows the
        trend perfectly — we're looking at the big picture!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Find the Clusters                                          */
/* ------------------------------------------------------------------ */

interface ClusterPoint {
  x: number;
  y: number;
  cluster: number;
}

function generateClusterData(
  seed: number,
  difficulty: number,
): { points: ClusterPoint[]; numClusters: number } {
  const rng = mulberry32(seed);
  const numClusters = 2 + Math.floor(rng() * 3); // 2-4

  // Generate cluster centers spread apart
  const centers: { cx: number; cy: number }[] = [];
  for (let c = 0; c < numClusters; c++) {
    let cx: number, cy: number;
    let attempts = 0;
    do {
      cx = 1.5 + rng() * 7;
      cy = 1.5 + rng() * 7;
      attempts++;
    } while (
      attempts < 50 &&
      centers.some((o) => Math.hypot(o.cx - cx, o.cy - cy) < (3.5 - difficulty * 1.5))
    );
    centers.push({ cx, cy });
  }

  // Spread: easy = 0.4, hard = 1.2
  const spread = 0.4 + difficulty * 0.4;

  const points: ClusterPoint[] = [];
  for (let c = 0; c < numClusters; c++) {
    const count = 10 + Math.floor(rng() * 6); // 10-15
    for (let i = 0; i < count; i++) {
      let x = centers[c].cx + normalApprox(rng, spread);
      let y = centers[c].cy + normalApprox(rng, spread);
      x = Math.max(0.2, Math.min(9.8, x));
      y = Math.max(0.2, Math.min(9.8, y));
      points.push({ x, y, cluster: c });
    }
  }

  return { points, numClusters };
}

const CLUSTER_COLORS = [
  { fill: "#6366f1", stroke: "#4f46e5" }, // indigo
  { fill: "#f97316", stroke: "#ea580c" }, // orange
  { fill: "#10b981", stroke: "#059669" }, // emerald
  { fill: "#ec4899", stroke: "#db2777" }, // pink
];

function FindClusters() {
  const [seedCounter, setSeedCounter] = useState(17);
  const [difficulty, setDifficulty] = useState(0); // 0=easy, 1=medium, 2=hard
  const [guess, setGuess] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const data = useMemo(
    () => generateClusterData(seedCounter * 100 + difficulty, difficulty),
    [seedCounter, difficulty],
  );

  const handleGuess = useCallback(
    (n: number) => {
      if (revealed) return;
      setGuess(n);
      setRevealed(true);
      if (n === data.numClusters) {
        setScore((s) => s + 1);
      } else {
        setScore(0);
      }
    },
    [revealed, data.numClusters],
  );

  const handleNewData = useCallback(() => {
    setSeedCounter((c) => c + 1);
    setGuess(null);
    setRevealed(false);
  }, []);

  const difficultyLabels = ["Easy", "Medium", "Hard"];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-slate-700">How many clusters do you see?</h3>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            Score: {score}
          </span>
        </div>

        {/* Difficulty slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Difficulty:</span>
          <input
            type="range"
            min={0}
            max={2}
            step={1}
            value={difficulty}
            onChange={(e) => {
              setDifficulty(Number(e.target.value));
              setSeedCounter((c) => c + 1);
              setGuess(null);
              setRevealed(false);
            }}
            className="w-32 accent-indigo-500"
          />
          <span className="text-xs font-medium text-slate-600">{difficultyLabels[difficulty]}</span>
        </div>

        {/* SVG Scatter Plot */}
        <div className="flex justify-center">
          <svg
            width={PLOT_W}
            height={PLOT_H}
            viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
            className="max-w-full bg-slate-50 rounded-lg"
          >
            <PlotAxes />
            {data.points.map((p, i) => {
              const color = revealed
                ? CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length]
                : { fill: "#94a3b8", stroke: "#64748b" };
              return (
                <circle
                  key={i}
                  cx={toSvgX(p.x, 0, 10)}
                  cy={toSvgY(p.y, 0, 10)}
                  r={5}
                  fill={color.fill}
                  stroke={color.stroke}
                  strokeWidth={1}
                  opacity={0.8}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
        </div>

        {/* Guess buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {[2, 3, 4].map((n) => {
            const isCorrect = revealed && n === data.numClusters;
            const isWrong = revealed && guess === n && n !== data.numClusters;
            return (
              <button
                key={n}
                onClick={() => handleGuess(n)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCorrect
                    ? "bg-green-500 text-white"
                    : isWrong
                      ? "bg-red-100 text-red-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                I see {n} clusters
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {revealed && (
          <p
            className={`text-center text-sm font-medium ${
              guess === data.numClusters ? "text-green-600" : "text-red-600"
            }`}
          >
            {guess === data.numClusters ? (
              <>
                <Check className="w-4 h-4 inline -mt-0.5 mr-1" />
                Correct! There {data.numClusters === 1 ? "is" : "are"} {data.numClusters} cluster
                {data.numClusters !== 1 && "s"}.
              </>
            ) : (
              <>
                Not quite — there {data.numClusters === 1 ? "is" : "are"} actually{" "}
                {data.numClusters} cluster{data.numClusters !== 1 && "s"}. Look at the colors!
              </>
            )}
          </p>
        )}

        {/* New Data button */}
        <div className="flex justify-center">
          <button
            onClick={handleNewData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Data
          </button>
        </div>
      </div>

      <InfoBox variant="amber">
        <strong>Clusters</strong> are groups of data points that are closer to each other than to
        points in other groups. Spotting clusters is one of the most important skills in data science!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Outlier Spotter                                            */
/* ------------------------------------------------------------------ */

interface OutlierPoint {
  x: number;
  y: number;
  isOutlier: boolean;
}

function generateOutlierData(seed: number): { points: OutlierPoint[]; slope: number; intercept: number } {
  const rng = mulberry32(seed);
  const slope = 0.4 + rng() * 0.4; // positive trend 0.4-0.8
  const intercept = 1.5 + rng() * 2; // 1.5-3.5

  const points: OutlierPoint[] = [];

  // Generate ~20 trend-following points
  for (let i = 0; i < 20; i++) {
    const x = 0.5 + rng() * 9;
    const noise = normalApprox(rng, 0.6);
    let y = slope * x + intercept + noise;
    y = Math.max(0.3, Math.min(9.7, y));
    points.push({ x, y, isOutlier: false });
  }

  // Generate 1-3 outliers placed far from the trend
  const numOutliers = 1 + Math.floor(rng() * 3);
  for (let i = 0; i < numOutliers; i++) {
    const x = 1 + rng() * 8;
    const expected = slope * x + intercept;
    // Place outlier far above or below the trend
    const direction = rng() > 0.5 ? 1 : -1;
    const offset = 2.5 + rng() * 2;
    let y = expected + direction * offset;
    y = Math.max(0.3, Math.min(9.7, y));
    // If still too close, force further away
    if (Math.abs(y - expected) < 2) {
      y = direction > 0 ? Math.min(9.7, expected + 3) : Math.max(0.3, expected - 3);
    }
    points.push({ x, y, isOutlier: true });
  }

  return { points, slope, intercept };
}

function OutlierSpotter() {
  const [seedCounter, setSeedCounter] = useState(99);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [flashCorrect, setFlashCorrect] = useState<Set<number>>(new Set());
  const [flashMissed, setFlashMissed] = useState<Set<number>>(new Set());
  const [flashWrong, setFlashWrong] = useState<Set<number>>(new Set());

  const data = useMemo(() => generateOutlierData(seedCounter), [seedCounter]);

  const totalOutliers = useMemo(
    () => data.points.filter((p) => p.isOutlier).length,
    [data.points],
  );

  const handlePointClick = useCallback(
    (index: number) => {
      if (checked) return;
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    },
    [checked],
  );

  const handleCheck = useCallback(() => {
    if (checked) return;
    setChecked(true);

    const correctSet = new Set<number>();
    const missedSet = new Set<number>();
    const wrongSet = new Set<number>();

    data.points.forEach((p, i) => {
      if (p.isOutlier && selectedIndices.has(i)) {
        correctSet.add(i);
      } else if (p.isOutlier && !selectedIndices.has(i)) {
        missedSet.add(i);
      } else if (!p.isOutlier && selectedIndices.has(i)) {
        wrongSet.add(i);
      }
    });

    setFlashCorrect(correctSet);
    setFlashMissed(missedSet);
    setFlashWrong(wrongSet);

    // Clear wrong selections after brief flash
    setTimeout(() => {
      setFlashWrong(new Set());
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        wrongSet.forEach((i) => next.delete(i));
        return next;
      });
    }, 1200);
  }, [checked, data.points, selectedIndices]);

  const handleNewData = useCallback(() => {
    setSeedCounter((c) => c + 1);
    setSelectedIndices(new Set());
    setChecked(false);
    setFlashCorrect(new Set());
    setFlashMissed(new Set());
    setFlashWrong(new Set());
  }, []);

  const foundCount = useMemo(() => {
    if (!checked) return 0;
    return data.points.filter((p, i) => p.isOutlier && selectedIndices.has(i)).length;
  }, [checked, data.points, selectedIndices]);

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes pulse-flash {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .pulse-flash { animation: pulse-flash 0.6s ease-in-out infinite; }
      `}</style>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Click on points you think are outliers, then press Check
        </h3>

        {/* SVG Scatter Plot */}
        <div className="flex justify-center">
          <svg
            width={PLOT_W}
            height={PLOT_H}
            viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
            className="max-w-full bg-slate-50 rounded-lg"
          >
            <PlotAxes />
            {data.points.map((p, i) => {
              const cx = toSvgX(p.x, 0, 10);
              const cy = toSvgY(p.y, 0, 10);
              const isSelected = selectedIndices.has(i);
              const isCorrectlyFound = flashCorrect.has(i);
              const isMissed = flashMissed.has(i);
              const isWrongPick = flashWrong.has(i);

              let fillColor = "#6366f1"; // default blue/indigo
              if (isCorrectlyFound) fillColor = "#22c55e"; // green
              else if (isMissed) fillColor = "#f59e0b"; // amber
              else if (isWrongPick) fillColor = "#ef4444"; // red

              return (
                <g
                  key={i}
                  onClick={() => handlePointClick(i)}
                  className={`cursor-pointer ${isMissed ? "pulse-flash" : ""}`}
                >
                  {/* Selection ring */}
                  {(isSelected || isCorrectlyFound || isMissed) && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={10}
                      fill="none"
                      stroke={isCorrectlyFound ? "#22c55e" : isMissed ? "#f59e0b" : "#ef4444"}
                      strokeWidth={2.5}
                      className="transition-all duration-300"
                    />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5.5}
                    fill={fillColor}
                    opacity={0.8}
                    className="transition-all duration-300"
                  />
                  {/* Checkmark for correctly found */}
                  {isCorrectlyFound && (
                    <text
                      x={cx}
                      y={cy + 3.5}
                      textAnchor="middle"
                      fill="white"
                      style={{ fontSize: 8, fontWeight: "bold" }}
                    >
                      ✓
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={selectedIndices.size === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedIndices.size === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              <Check className="w-4 h-4" />
              Check
            </button>
          ) : (
            <p className="text-sm font-medium text-slate-700">
              You found{" "}
              <span className={foundCount === totalOutliers ? "text-green-600" : "text-amber-600"}>
                {foundCount} of {totalOutliers}
              </span>{" "}
              outlier{totalOutliers !== 1 && "s"}
            </p>
          )}

          <button
            onClick={handleNewData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Data
          </button>
        </div>
      </div>

      <InfoBox variant="green">
        An <strong>outlier</strong> is a data point that is very different from the others. Outliers
        can be mistakes in data collection, or they can be the most interesting discoveries!
        Scientists pay close attention to outliers.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What is a trend in data?",
    options: [
      "A single data point",
      "The general direction data is heading",
      "The largest value",
      "The average value",
    ],
    correctIndex: 1,
    explanation:
      "A trend is the overall pattern or direction in the data — whether values tend to go up, go down, or stay flat.",
  },
  {
    question: "What are clusters in data?",
    options: [
      "The biggest numbers",
      "Groups of data points close together",
      "Points on a straight line",
      "Empty spaces in the data",
    ],
    correctIndex: 1,
    explanation:
      "Clusters are groups of data points that are closer to each other than to other points. They suggest natural groupings in the data.",
  },
  {
    question: "If a data point is far away from all the others, it is called a(n):",
    options: ["Cluster", "Trend", "Outlier", "Average"],
    correctIndex: 2,
    explanation:
      "An outlier is a data point that is significantly different from the rest. It could be an error or something genuinely unusual!",
  },
  {
    question: "Why is spotting patterns in data important?",
    options: [
      "It makes graphs look pretty",
      "It helps us understand and predict",
      "It's not important",
      "It only matters for scientists",
    ],
    correctIndex: 1,
    explanation:
      "Spotting patterns (trends, clusters, outliers) helps us understand what's happening in the data and make predictions about future observations.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L5_PatternsActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "trends",
        label: "Trend Detector",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <TrendDetector />,
      },
      {
        id: "clusters",
        label: "Find the Clusters",
        icon: <Circle className="w-4 h-4" />,
        content: <FindClusters />,
      },
      {
        id: "outliers",
        label: "Outlier Spotter",
        icon: <AlertCircle className="w-4 h-4" />,
        content: <OutlierSpotter />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Spotting Patterns"
      level={2}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You've learned to see trends, clusters, and outliers. But how do we organize messy data? Let's learn about sorting and grouping!"
      story={
        <StorySection
          paragraphs={[
            "It was Monday again, and it was raining — just like the last three Mondays. Aru looked out the window and said, \"It always rains on Monday!\"",
            "Byte: \"Interesting observation! You just spotted a pattern — something that repeats or follows a trend. But here's the tricky part: is it a real pattern, or just a coincidence?\"",
            "Aru: \"How do I tell the difference?\"",
            "Byte: \"By looking at more data! If it rained on 20 out of 24 Mondays, that's a strong pattern. If it only rained on 4, you just got unlucky. Today, I'll teach you three kinds of patterns: trends, clusters, and outliers.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Patterns in data come in three main forms: Trends (data going up, down, or staying flat), Clusters (groups of data points close together), and Outliers (unusual points far from the rest). Spotting these patterns is the first step to understanding what data is telling you."
        />
      }
    />
  );
}
