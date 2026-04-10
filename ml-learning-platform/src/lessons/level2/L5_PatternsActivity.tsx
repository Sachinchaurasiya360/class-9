"use client";

import { useState, useMemo, useCallback } from "react";
import { TrendingUp, Circle, AlertCircle, RefreshCw, Check } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

function PlotDefs() {
  return (
    <defs>
      <radialGradient id="pat-lav" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#c9adf7" />
        <stop offset="100%" stopColor="#b18cf2" />
      </radialGradient>
      <radialGradient id="pat-coral" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#ff9b9b" />
        <stop offset="100%" stopColor="#ff6b6b" />
      </radialGradient>
      <radialGradient id="pat-mint" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#7ee0d8" />
        <stop offset="100%" stopColor="#4ecdc4" />
      </radialGradient>
      <radialGradient id="pat-peach" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#ffd0b3" />
        <stop offset="100%" stopColor="#ffb88c" />
      </radialGradient>
      <radialGradient id="pat-sky" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#94caff" />
        <stop offset="100%" stopColor="#6bb6ff" />
      </radialGradient>
      <radialGradient id="pat-yellow" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#fff3a0" />
        <stop offset="100%" stopColor="#ffd93d" />
      </radialGradient>
    </defs>
  );
}

const CLUSTER_GRADS = ["url(#pat-coral)", "url(#pat-mint)", "url(#pat-lav)", "url(#pat-peach)"];

/* Sketchy palette */
const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";
const PEACH = "#ffb88c";

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

function normalApprox(rng: () => number, std: number): number {
  return ((rng() + rng() + rng() + rng() + rng() + rng() - 3) / 3) * std;
}

/* ------------------------------------------------------------------ */
/*  SVG helpers                                                        */
/* ------------------------------------------------------------------ */

const PLOT_W = 520;
const PLOT_H = 360;
const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
const INNER_W = PLOT_W - PAD.left - PAD.right;
const INNER_H = PLOT_H - PAD.top - PAD.bottom;

function toSvgX(val: number, min: number, max: number) {
  return PAD.left + ((val - min) / (max - min)) * INNER_W;
}
function toSvgY(val: number, min: number, max: number) {
  return PAD.top + INNER_H - ((val - min) / (max - min)) * INNER_H;
}

function PaperBg({ id }: { id: string }) {
  return (
    <>
      <defs>
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M14 0H0V14" fill="none" stroke="#e8e3d3" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={PLOT_W} height={PLOT_H} fill={`url(#${id})`} rx={12} />
    </>
  );
}

function PlotAxes({ xLabel = "X", yLabel = "Y" }: { xLabel?: string; yLabel?: string }) {
  const ticks = [0, 2, 4, 6, 8, 10];
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={toSvgX(t, 0, 10)} y1={PAD.top}
            x2={toSvgX(t, 0, 10)} y2={PAD.top + INNER_H}
            stroke={INK} strokeWidth={0.6} opacity={0.15}
          />
          <line
            x1={PAD.left} y1={toSvgY(t, 0, 10)}
            x2={PAD.left + INNER_W} y2={toSvgY(t, 0, 10)}
            stroke={INK} strokeWidth={0.6} opacity={0.15}
          />
          <text x={toSvgX(t, 0, 10)} y={PAD.top + INNER_H + 18} textAnchor="middle"
            fill={INK} style={{ fontFamily: "Kalam, cursive", fontSize: 11, opacity: 0.6 }}>
            {t}
          </text>
          <text x={PAD.left - 12} y={toSvgY(t, 0, 10) + 4} textAnchor="end"
            fill={INK} style={{ fontFamily: "Kalam, cursive", fontSize: 11, opacity: 0.6 }}>
            {t}
          </text>
        </g>
      ))}
      <line x1={PAD.left} y1={PAD.top + INNER_H} x2={PAD.left + INNER_W} y2={PAD.top + INNER_H}
        stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + INNER_H}
        stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <text x={PAD.left + INNER_W / 2} y={PAD.top + INNER_H + 35} textAnchor="middle"
        fill={INK} style={{ fontFamily: "Patrick Hand, cursive", fontSize: 13 }}>
        {xLabel}
      </text>
      <text x={14} y={PAD.top + INNER_H / 2} textAnchor="middle"
        fill={INK} style={{ fontFamily: "Patrick Hand, cursive", fontSize: 13 }}
        transform={`rotate(-90, 14, ${PAD.top + INNER_H / 2})`}>
        {yLabel}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 – Trend Detector                                             */
/* ------------------------------------------------------------------ */

type TrendType = "positive" | "negative" | "flat";

interface TrendPoint { x: number; y: number; }

function generateTrendData(seed: number) {
  const rng = mulberry32(seed);
  const r = rng();
  let trend: TrendType;
  let slope: number;
  if (r < 0.33) { trend = "positive"; slope = 0.5 + rng() * 0.4; }
  else if (r < 0.66) { trend = "negative"; slope = -(0.5 + rng() * 0.4); }
  else { trend = "flat"; slope = (rng() - 0.5) * 0.15; }

  const intercept = 2 + rng() * 3;
  const points: TrendPoint[] = [];
  for (let i = 0; i < 25; i++) {
    const x = 0.5 + rng() * 9;
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
      if (correct === true) return;
      if (answer === data.trend) {
        playSuccess();
        setSelected(answer);
        setCorrect(true);
        setStreak((s) => s + 1);
      } else {
        playError();
        setCorrect(false);
        setStreak(0);
        setShakeBtn(answer);
        setTimeout(() => setShakeBtn(null), 500);
      }
    },
    [data.trend, correct],
  );

  const handleNewData = useCallback(() => {
    playClick();
    setSeedCounter((c) => c + 1);
    setSelected(null);
    setCorrect(null);
  }, []);

  const trendInfo: Record<TrendType, { label: string; color: string }> = {
    positive: { label: "Going Up ↗", color: MINT },
    negative: { label: "Going Down ↘", color: CORAL },
    flat: { label: "Flat →", color: SKY },
  };

  const trendLineY0 = data.slope * 0 + data.intercept;
  const trendLineY10 = data.slope * 10 + data.intercept;

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-hand text-base font-bold" style={{ color: INK }}>What trend do you see?</h3>
          <span className="font-hand text-sm font-bold px-3 py-1 rounded-full border-2"
            style={{ borderColor: INK, background: YELLOW, boxShadow: "2px 2px 0 #2b2a35" }}>
            🔥 Streak: {streak}
          </span>
        </div>

        <div className="flex justify-center">
          <svg width={PLOT_W} height={PLOT_H} viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
            className="max-w-full" style={{
              borderRadius: 12, border: `2.5px solid ${INK}`, boxShadow: "3px 3px 0 #2b2a35",
            }}>
            <PaperBg id="bg-trend" />
            <PlotDefs />
            <PlotAxes />
            {data.points.map((p, i) => (
              <circle key={i}
                cx={toSvgX(p.x, 0, 10)} cy={toSvgY(p.y, 0, 10)}
                r={6.5} fill="url(#pat-lav)" stroke={INK} strokeWidth={1.5}
                style={{ filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)" }}
              />
            ))}
            {correct === true && (
              <line
                x1={toSvgX(0, 0, 10)} y1={toSvgY(Math.max(0, Math.min(10, trendLineY0)), 0, 10)}
                x2={toSvgX(10, 0, 10)} y2={toSvgY(Math.max(0, Math.min(10, trendLineY10)), 0, 10)}
                stroke={CORAL} strokeWidth={3.5} strokeDasharray="8 5" strokeLinecap="round"
                className="signal-flow pulse-glow"
                style={{ color: CORAL }}
              >
                <animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.8s" />
              </line>
            )}
          </svg>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {(["positive", "negative", "flat"] as TrendType[]).map((t) => {
            const info = trendInfo[t];
            const isCorrectAnswer = correct === true && selected === t;
            return (
              <button
                key={t}
                onClick={() => handleAnswer(t)}
                className="btn-sketchy font-hand text-sm"
                style={{
                  background: isCorrectAnswer ? MINT : info.color,
                  animation: shakeBtn === t ? "shake-x 0.4s" : undefined,
                }}
              >
                {info.label}
              </button>
            );
          })}
        </div>

        {correct === true && (
          <p className="text-center font-hand text-base font-bold" style={{ color: MINT }}>
            <Check className="w-4 h-4 inline -mt-0.5 mr-1" />
            Correct! The data has a {data.trend === "flat" ? "flat (no clear)" : data.trend} trend.
          </p>
        )}
        {correct === false && (
          <p className="text-center font-hand text-base font-bold" style={{ color: CORAL }}>
            Look again...
          </p>
        )}

        <div className="flex justify-center">
          <button onClick={handleNewData} className="btn-sketchy-outline font-hand text-sm">
            <RefreshCw className="w-3.5 h-3.5" /> New Data
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
/*  Tab 2 – Find the Clusters                                          */
/* ------------------------------------------------------------------ */

interface ClusterPoint { x: number; y: number; cluster: number; }

function generateClusterData(seed: number, difficulty: number) {
  const rng = mulberry32(seed);
  const numClusters = 2 + Math.floor(rng() * 3);
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
  const spread = 0.4 + difficulty * 0.4;
  const points: ClusterPoint[] = [];
  for (let c = 0; c < numClusters; c++) {
    const count = 10 + Math.floor(rng() * 6);
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

const CLUSTER_COLORS = [CORAL, MINT, LAVENDER, PEACH];

function FindClusters() {
  const [seedCounter, setSeedCounter] = useState(17);
  const [difficulty, setDifficulty] = useState(0);
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
        playSuccess();
        setScore((s) => s + 1);
      } else {
        playError();
        setScore(0);
      }
    },
    [revealed, data.numClusters],
  );

  const handleNewData = useCallback(() => {
    playClick();
    setSeedCounter((c) => c + 1);
    setGuess(null);
    setRevealed(false);
  }, []);

  const difficultyLabels = ["Easy", "Medium", "Hard"];

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-hand text-base font-bold" style={{ color: INK }}>How many clusters do you see?</h3>
          <span className="font-hand text-sm font-bold px-3 py-1 rounded-full border-2"
            style={{ borderColor: INK, background: YELLOW, boxShadow: "2px 2px 0 #2b2a35" }}>
            ⭐ Score: {score}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-hand text-sm font-bold" style={{ color: INK }}>Difficulty:</span>
          <input
            type="range" min={0} max={2} step={1} value={difficulty}
            onChange={(e) => {
              setDifficulty(Number(e.target.value));
              setSeedCounter((c) => c + 1);
              setGuess(null);
              setRevealed(false);
            }}
            className="w-32" style={{ accentColor: CORAL }}
          />
          <span className="font-hand text-sm font-bold" style={{ color: CORAL }}>{difficultyLabels[difficulty]}</span>
        </div>

        <div className="flex justify-center">
          <svg width={PLOT_W} height={PLOT_H} viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
            className="max-w-full" style={{
              borderRadius: 12, border: `2.5px solid ${INK}`, boxShadow: "3px 3px 0 #2b2a35",
            }}>
            <PaperBg id="bg-clust" />
            <PlotDefs />
            <PlotAxes />
            {data.points.map((p, i) => {
              const fill = revealed ? CLUSTER_GRADS[p.cluster % CLUSTER_GRADS.length] : "#9aa0b4";
              const glowColor = revealed ? CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length] : "#9aa0b4";
              return (
                <circle key={i}
                  cx={toSvgX(p.x, 0, 10)} cy={toSvgY(p.y, 0, 10)}
                  r={6.5} fill={fill} stroke={INK} strokeWidth={1.5}
                  className={revealed ? "pulse-glow" : ""}
                  style={{
                    filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)",
                    transition: "fill .5s",
                    color: glowColor,
                  }}
                />
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {[2, 3, 4].map((n) => {
            const isCorrect = revealed && n === data.numClusters;
            const isWrong = revealed && guess === n && n !== data.numClusters;
            return (
              <button
                key={n}
                onClick={() => handleGuess(n)}
                className="btn-sketchy font-hand text-sm"
                style={{
                  background: isCorrect ? MINT : isWrong ? CORAL : SKY,
                }}
              >
                I see {n} clusters
              </button>
            );
          })}
        </div>

        {revealed && (
          <p className="text-center font-hand text-base font-bold"
            style={{ color: guess === data.numClusters ? MINT : CORAL }}>
            {guess === data.numClusters ? (
              <>
                <Check className="w-4 h-4 inline -mt-0.5 mr-1" />
                Correct! There are {data.numClusters} clusters.
              </>
            ) : (
              <>Not quite — there are actually {data.numClusters} clusters. Look at the colors!</>
            )}
          </p>
        )}

        <div className="flex justify-center">
          <button onClick={handleNewData} className="btn-sketchy-outline font-hand text-sm">
            <RefreshCw className="w-3.5 h-3.5" /> New Data
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
/*  Tab 3 – Outlier Spotter                                            */
/* ------------------------------------------------------------------ */

interface OutlierPoint { x: number; y: number; isOutlier: boolean; }

function generateOutlierData(seed: number) {
  const rng = mulberry32(seed);
  const slope = 0.4 + rng() * 0.4;
  const intercept = 1.5 + rng() * 2;
  const points: OutlierPoint[] = [];

  for (let i = 0; i < 20; i++) {
    const x = 0.5 + rng() * 9;
    const noise = normalApprox(rng, 0.6);
    let y = slope * x + intercept + noise;
    y = Math.max(0.3, Math.min(9.7, y));
    points.push({ x, y, isOutlier: false });
  }

  const numOutliers = 1 + Math.floor(rng() * 3);
  for (let i = 0; i < numOutliers; i++) {
    const x = 1 + rng() * 8;
    const expected = slope * x + intercept;
    const direction = rng() > 0.5 ? 1 : -1;
    const offset = 2.5 + rng() * 2;
    let y = expected + direction * offset;
    y = Math.max(0.3, Math.min(9.7, y));
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
  const totalOutliers = useMemo(() => data.points.filter((p) => p.isOutlier).length, [data.points]);

  const handlePointClick = useCallback(
    (index: number) => {
      if (checked) return;
      playClick();
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    },
    [checked],
  );

  const handleCheck = useCallback(() => {
    if (checked) return;
    playPop();
    setChecked(true);

    const correctSet = new Set<number>();
    const missedSet = new Set<number>();
    const wrongSet = new Set<number>();

    data.points.forEach((p, i) => {
      if (p.isOutlier && selectedIndices.has(i)) correctSet.add(i);
      else if (p.isOutlier && !selectedIndices.has(i)) missedSet.add(i);
      else if (!p.isOutlier && selectedIndices.has(i)) wrongSet.add(i);
    });

    setFlashCorrect(correctSet);
    setFlashMissed(missedSet);
    setFlashWrong(wrongSet);

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
      <div className="card-sketchy p-5 space-y-4">
        <h3 className="font-hand text-base font-bold text-center" style={{ color: INK }}>
          Click points you think are <span style={{ color: CORAL }}>outliers</span>, then press Check
        </h3>

        <div className="flex justify-center">
          <svg width={PLOT_W} height={PLOT_H} viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
            className="max-w-full" style={{
              borderRadius: 12, border: `2.5px solid ${INK}`, boxShadow: "3px 3px 0 #2b2a35",
            }}>
            <PaperBg id="bg-out" />
            <PlotDefs />
            <PlotAxes />
            {data.points.map((p, i) => {
              const cx = toSvgX(p.x, 0, 10);
              const cy = toSvgY(p.y, 0, 10);
              const isSelected = selectedIndices.has(i);
              const isCorrectlyFound = flashCorrect.has(i);
              const isMissed = flashMissed.has(i);
              const isWrongPick = flashWrong.has(i);

              let fillColor: string = "url(#pat-lav)";
              let glow = LAVENDER;
              if (isCorrectlyFound) { fillColor = "url(#pat-mint)"; glow = MINT; }
              else if (isMissed) { fillColor = "url(#pat-yellow)"; glow = YELLOW; }
              else if (isWrongPick) { fillColor = "url(#pat-coral)"; glow = CORAL; }

              return (
                <g key={i} onClick={() => handlePointClick(i)} className="cursor-pointer">
                  {(isSelected || isCorrectlyFound || isMissed) && (
                    <circle cx={cx} cy={cy} r={12} fill="none"
                      stroke={isCorrectlyFound ? MINT : isMissed ? YELLOW : CORAL}
                      strokeWidth={3} strokeDasharray="3 2">
                      {isMissed && (
                        <animate attributeName="r" values="10;14;10" dur="0.7s" repeatCount="indefinite" />
                      )}
                    </circle>
                  )}
                  <circle cx={cx} cy={cy} r={7} fill={fillColor} stroke={INK} strokeWidth={1.5}
                    className={isCorrectlyFound || isMissed ? "pulse-glow" : ""}
                    style={{ filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)", transition: "fill .3s", color: glow }} />
                  {isCorrectlyFound && (
                    <text x={cx} y={cy + 3.5} textAnchor="middle" fill={INK}
                      style={{ fontSize: 9, fontWeight: 700 }}>✓</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={selectedIndices.size === 0}
              className="btn-sketchy font-hand text-sm"
              style={{ background: YELLOW, opacity: selectedIndices.size === 0 ? 0.5 : 1 }}
            >
              <Check className="w-4 h-4" /> Check
            </button>
          ) : (
            <p className="font-hand text-base font-bold" style={{ color: INK }}>
              You found{" "}
              <span style={{ color: foundCount === totalOutliers ? MINT : CORAL }}>
                {foundCount} of {totalOutliers}
              </span>{" "}
              outlier{totalOutliers !== 1 && "s"}
            </p>
          )}

          <button onClick={handleNewData} className="btn-sketchy-outline font-hand text-sm">
            <RefreshCw className="w-3.5 h-3.5" /> New Data
          </button>
        </div>
      </div>

      <InfoBox variant="green">
        An <strong>outlier</strong> is a data point that is very different from the others. Outliers
        can be mistakes — or the most interesting discoveries! Scientists pay close attention to outliers.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What is a trend in data?",
    options: ["A single data point", "The general direction data is heading", "The largest value", "The average value"],
    correctIndex: 1,
    explanation:
      "A trend is the overall pattern or direction in the data — whether values tend to go up, go down, or stay flat.",
  },
  {
    question: "What are clusters in data?",
    options: ["The biggest numbers", "Groups of data points close together", "Points on a straight line", "Empty spaces in the data"],
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
    options: ["It makes graphs look pretty", "It helps us understand and predict", "It's not important", "It only matters for scientists"],
    correctIndex: 1,
    explanation:
      "Spotting patterns (trends, clusters, outliers) helps us understand what's happening in the data and make predictions about future observations.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
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
