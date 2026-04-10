"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Crosshair, Target, BarChart3, Trash2, RefreshCw } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import SVGGrid from "../../components/SVGGrid";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

const INK_COLOR = "#2b2a35";

/* ------------------------------------------------------------------ */
/*  Seeded PRNG (mulberry32)                                           */
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
/*  Shared constants                                                   */
/* ------------------------------------------------------------------ */

const DOT_PALETTE = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#3b82f6", "#84cc16",
];

const SVG_WIDTH = 500;
const SVG_HEIGHT = 350;
const SVG_PADDING = { top: 20, right: 20, bottom: 40, left: 45 };

/* Helper: convert SVG pixel coords back to data coords */
function fromSvgX(px: number): number {
  const plotW = SVG_WIDTH - SVG_PADDING.left - SVG_PADDING.right;
  return ((px - SVG_PADDING.left) / plotW) * 10;
}

function fromSvgY(py: number): number {
  const plotH = SVG_HEIGHT - SVG_PADDING.top - SVG_PADDING.bottom;
  return (1 - (py - SVG_PADDING.top) / plotH) * 10;
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- The Coordinate Plane                                      */
/* ------------------------------------------------------------------ */

interface PlacedDot {
  x: number;
  y: number;
  color: string;
}

function CoordinatePlane() {
  const [dots, setDots] = useState<PlacedDot[]>([]);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const getDataCoords = useCallback((e: React.MouseEvent<SVGElement>) => {
    const svg = svgRef.current ?? (e.currentTarget.ownerSVGElement || e.currentTarget.closest("svg"));
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const dataX = fromSvgX(px);
    const dataY = fromSvgY(py);
    if (dataX < 0 || dataX > 10 || dataY < 0 || dataY > 10) return null;
    return { x: Math.round(dataX * 10) / 10, y: Math.round(dataY * 10) / 10 };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      const coords = getDataCoords(e);
      setHover(coords);
    },
    [getDataCoords],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      if (dots.length >= 10) return;
      const coords = getDataCoords(e);
      if (!coords) return;
      playPop();
      setDots((prev) => [
        ...prev,
        { x: coords.x, y: coords.y, color: DOT_PALETTE[prev.length % DOT_PALETTE.length] },
      ]);
    },
    [dots.length, getDataCoords],
  );

  const clearAll = useCallback(() => { playClick(); setDots([]); }, []);

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold text-center" style={{ color: INK_COLOR }}>
          Click anywhere on the grid to place a point
        </h3>

        {/* Live coordinate display */}
        <div className="flex items-center justify-between font-hand">
          <p className="text-sm font-bold" style={{ color: INK_COLOR }}>
            {hover ? `(X: ${hover.x.toFixed(1)}, Y: ${hover.y.toFixed(1)})` : "(X: -, Y: -)"}
          </p>
          <p className="text-xs text-muted-foreground font-bold">
            Points placed: {dots.length} / 10
          </p>
        </div>

        <SVGGrid xMin={0} xMax={10} yMin={0} yMax={10} xLabel="X" yLabel="Y">
          {({ toSvgX, toSvgY, plotW, plotH, padLeft, padTop }) => (
            <>
              {/* Invisible rect to capture mouse events, with ref forwarding */}
              <rect
                ref={(el) => {
                  if (el) {
                    const svg = el.closest("svg");
                    if (svg) svgRef.current = svg as SVGSVGElement;
                  }
                }}
                x={padLeft}
                y={padTop}
                width={plotW}
                height={plotH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHover(null)}
                onClick={handleClick}
              />

              {/* Crosshair lines following mouse */}
              {hover && (
                <>
                  <line
                    x1={toSvgX(hover.x)}
                    y1={padTop}
                    x2={toSvgX(hover.x)}
                    y2={padTop + plotH}
                    stroke="#94a3b8"
                    strokeWidth={0.5}
                    strokeDasharray="4 3"
                    pointerEvents="none"
                  />
                  <line
                    x1={padLeft}
                    y1={toSvgY(hover.y)}
                    x2={padLeft + plotW}
                    y2={toSvgY(hover.y)}
                    stroke="#94a3b8"
                    strokeWidth={0.5}
                    strokeDasharray="4 3"
                    pointerEvents="none"
                  />
                </>
              )}

              {/* Placed dots */}
              {dots.map((dot, i) => (
                <g key={i}>
                  <circle
                    cx={toSvgX(dot.x)}
                    cy={toSvgY(dot.y)}
                    r={7}
                    fill={dot.color}
                    stroke={INK_COLOR}
                    strokeWidth={2}
                    className="pulse-glow"
                    style={{ color: dot.color, filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)" }}
                  />
                  <text
                    x={toSvgX(dot.x)}
                    y={toSvgY(dot.y) - 10}
                    textAnchor="middle"
                    className="fill-slate-600"
                    style={{ fontSize: 9 }}
                  >
                    ({dot.x}, {dot.y})
                  </text>
                </g>
              ))}
            </>
          )}
        </SVGGrid>

        {/* Clear button */}
        <div className="flex justify-center">
          <button
            onClick={clearAll}
            disabled={dots.length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
              dots.length === 0
                ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                : "bg-background hover:bg-accent-yellow/40 shadow-[2px_2px_0_#2b2a35]"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      </div>

      <InfoBox variant="blue">
        A coordinate plane has two axes: X goes left to right, Y goes bottom to top. Every point has
        a pair of numbers (X, Y) that tell you exactly where it is.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Plot the Points                                           */
/* ------------------------------------------------------------------ */

function generateTargets(seed: number): { x: number; y: number }[] {
  const rng = mulberry32(seed);
  const targets: { x: number; y: number }[] = [];
  for (let i = 0; i < 5; i++) {
    targets.push({
      x: Math.round(rng() * 8 + 1), // 1-9
      y: Math.round(rng() * 8 + 1), // 1-9
    });
  }
  return targets;
}

function PlotThePoints() {
  const [seed, setSeed] = useState(42);
  const targets = useMemo(() => generateTargets(seed), [seed]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correct, setCorrect] = useState<boolean[]>([]);
  const [wrongFlash, setWrongFlash] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const score = correct.filter(Boolean).length;
  const allDone = correct.length === 5;

  const getDataCoords = useCallback((e: React.MouseEvent<SVGElement>) => {
    const svg = svgRef.current ?? (e.currentTarget.ownerSVGElement || e.currentTarget.closest("svg"));
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const dataX = fromSvgX(px);
    const dataY = fromSvgY(py);
    if (dataX < 0 || dataX > 10 || dataY < 0 || dataY > 10) return null;
    return { x: dataX, y: dataY };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      if (allDone) return;
      const coords = getDataCoords(e);
      if (!coords) return;

      const target = targets[currentIdx];
      const dist = Math.sqrt((coords.x - target.x) ** 2 + (coords.y - target.y) ** 2);

      if (dist <= 0.5) {
        playSuccess();
        setCorrect((prev) => [...prev, true]);
        if (currentIdx < 4) {
          setCurrentIdx((i) => i + 1);
        }
      } else {
        playError();
        setWrongFlash({ x: coords.x, y: coords.y });
        setTimeout(() => setWrongFlash(null), 800);
      }
    },
    [allDone, currentIdx, getDataCoords, targets],
  );

  const handleNewPoints = useCallback(() => {
    playClick();
    setSeed((s) => s + 1);
    setCurrentIdx(0);
    setCorrect([]);
    setWrongFlash(null);
  }, []);

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold text-center" style={{ color: INK_COLOR }}>
          Click on the grid to plot each target point
        </h3>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2.5 border-2 border-foreground">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(score / 5) * 100}%`, background: "#4ecdc4" }}
          />
        </div>
        <p className="font-hand text-xs font-bold text-right" style={{ color: INK_COLOR }}>Correct: {score} / 5</p>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Grid */}
          <div className="flex-1">
            <SVGGrid xMin={0} xMax={10} yMin={0} yMax={10} xLabel="X" yLabel="Y">
              {({ toSvgX, toSvgY, plotW, plotH, padLeft, padTop }) => (
                <>
                  {/* Hit area */}
                  <rect
                    ref={(el) => {
                      if (el) {
                        const svg = el.closest("svg");
                        if (svg) svgRef.current = svg as SVGSVGElement;
                      }
                    }}
                    x={padLeft}
                    y={padTop}
                    width={plotW}
                    height={plotH}
                    fill="transparent"
                    className="cursor-crosshair"
                    onClick={handleClick}
                  />

                  {/* Already-placed correct dots */}
                  {correct.map((_, i) => (
                    <g key={i}>
                      <circle
                        cx={toSvgX(targets[i].x)}
                        cy={toSvgY(targets[i].y)}
                        r={8}
                        fill="#4ecdc4"
                        stroke={INK_COLOR}
                        strokeWidth={2}
                        className="pulse-glow"
                        style={{ color: "#4ecdc4", filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)" }}
                      />
                      {/* Checkmark */}
                      <text
                        x={toSvgX(targets[i].x)}
                        y={toSvgY(targets[i].y) + 4}
                        textAnchor="middle"
                        fill="white"
                        style={{ fontSize: 10, fontWeight: 700 }}
                      >
                        ✓
                      </text>
                    </g>
                  ))}

                  {/* Wrong flash */}
                  {wrongFlash && (
                    <g>
                      <circle
                        cx={toSvgX(wrongFlash.x)}
                        cy={toSvgY(wrongFlash.y)}
                        r={7}
                        fill="#ef4444"
                        opacity={0.8}
                      >
                        <animate attributeName="opacity" from="0.8" to="0" dur="0.8s" fill="freeze" />
                      </circle>
                      <text
                        x={toSvgX(wrongFlash.x)}
                        y={toSvgY(wrongFlash.y) + 4}
                        textAnchor="middle"
                        fill="white"
                        style={{ fontSize: 10, fontWeight: 700 }}
                      >
                        ✗
                      </text>
                    </g>
                  )}
                </>
              )}
            </SVGGrid>
          </div>

          {/* Target list panel */}
          <div className="lg:w-48 space-y-2">
            <h4 className="font-hand text-xs font-bold uppercase tracking-wide" style={{ color: INK_COLOR }}>
              Target Points
            </h4>
            {targets.map((t, i) => {
              const isDone = i < correct.length;
              const isCurrent = i === currentIdx && !allDone;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-colors ${
                    isDone
                      ? "bg-accent-mint/30"
                      : isCurrent
                        ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                        : "bg-muted opacity-70"
                  }`}
                >
                  {isDone ? (
                    <span className="text-green-500 text-xs">&#10003;</span>
                  ) : isCurrent ? (
                    <span className="text-indigo-500 text-xs">&#9654;</span>
                  ) : (
                    <span className="text-slate-300 text-xs">&#9679;</span>
                  )}
                  ({t.x}, {t.y})
                </div>
              );
            })}
          </div>
        </div>

        {/* New Points button */}
        <div className="flex justify-center">
          <button
            onClick={handleNewPoints}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] hover:bg-accent-yellow/80"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Points
          </button>
        </div>

        {allDone && (
          <div className="card-sketchy p-4 text-center" style={{ background: "#4ecdc433" }}>
            <p className="font-hand text-base font-bold" style={{ color: INK_COLOR }}>
              All 5 points plotted correctly! Try a new set or move on.
            </p>
          </div>
        )}
      </div>

      <InfoBox variant="amber">
        Plotting points takes practice. Pay attention to which number is X (horizontal) and which is
        Y (vertical). A common mistake is swapping them!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Scatter Plot Explorer                                     */
/* ------------------------------------------------------------------ */

type DatasetKey = "study" | "temperature" | "shoe";

interface DatasetConfig {
  label: string;
  xLabel: string;
  yLabel: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  seed: number;
  generate: (rng: () => number, noise: number) => { x: number; y: number }[];
}

const DATASETS: Record<DatasetKey, DatasetConfig> = {
  study: {
    label: "Study Hours vs Test Score",
    xLabel: "Study Hours",
    yLabel: "Test Score",
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 100,
    seed: 123,
    generate: (rng, noise) => {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < 20; i++) {
        const x = rng() * 9 + 0.5;
        const base = 40 + x * 6; // positive correlation
        const y = Math.max(0, Math.min(100, base + (rng() - 0.5) * noise * 0.6));
        pts.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
      }
      return pts;
    },
  },
  temperature: {
    label: "Temperature vs Hot Chocolate Sales",
    xLabel: "Temperature (\u00B0C)",
    yLabel: "Sales",
    xMin: 0,
    xMax: 40,
    yMin: 0,
    yMax: 100,
    seed: 456,
    generate: (rng, noise) => {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < 20; i++) {
        const x = rng() * 38 + 1;
        const base = 90 - x * 2; // negative correlation
        const y = Math.max(0, Math.min(100, base + (rng() - 0.5) * noise * 0.6));
        pts.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
      }
      return pts;
    },
  },
  shoe: {
    label: "Shoe Size vs IQ",
    xLabel: "Shoe Size",
    yLabel: "IQ",
    xMin: 4,
    xMax: 14,
    yMin: 70,
    yMax: 140,
    seed: 789,
    generate: (rng, noise) => {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < 20; i++) {
        const x = rng() * 9 + 4.5;
        // No correlation: IQ centers around 105 regardless of shoe size
        const base = 105;
        const spread = 10 + noise * 0.2;
        const y = Math.max(70, Math.min(140, base + (rng() - 0.5) * spread));
        pts.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
      }
      return pts;
    },
  },
};

function computeTrendLine(
  points: { x: number; y: number }[],
): { slope: number; intercept: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0 };
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function ScatterPlotExplorer() {
  const [datasetKey, setDatasetKey] = useState<DatasetKey>("study");
  const [noiseLevel, setNoiseLevel] = useState(30);
  const [showTrend, setShowTrend] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const config = DATASETS[datasetKey];

  const points = useMemo(() => {
    const rng = mulberry32(config.seed);
    return config.generate(rng, noiseLevel);
  }, [config, noiseLevel]);

  const trend = useMemo(() => computeTrendLine(points), [points]);

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold text-center" style={{ color: INK_COLOR }}>
          Explore how data points form patterns
        </h3>

        {/* Dataset selector */}
        <div className="flex flex-wrap gap-2 justify-center">
          {(Object.keys(DATASETS) as DatasetKey[]).map((key) => (
            <button
              key={key}
              onClick={() => { playClick(); setDatasetKey(key); }}
              className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
                datasetKey === key
                  ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                  : "bg-background hover:bg-accent-yellow/40"
              }`}
            >
              {DATASETS[key].label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <SVGGrid
          xMin={config.xMin}
          xMax={config.xMax}
          yMin={config.yMin}
          yMax={config.yMax}
          xLabel={config.xLabel}
          yLabel={config.yLabel}
        >
          {({ toSvgX, toSvgY }) => (
            <>
              {/* Trend line */}
              {showTrend && (
                <line
                  x1={toSvgX(config.xMin)}
                  y1={toSvgY(trend.slope * config.xMin + trend.intercept)}
                  x2={toSvgX(config.xMax)}
                  y2={toSvgY(trend.slope * config.xMax + trend.intercept)}
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  opacity={0.8}
                />
              )}

              {/* Data points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={toSvgX(pt.x)}
                    cy={toSvgY(pt.y)}
                    r={hoveredIdx === i ? 8 : 6}
                    fill={hoveredIdx === i ? "#ff6b6b" : "#6bb6ff"}
                    stroke={INK_COLOR}
                    strokeWidth={1.8}
                    className={hoveredIdx === i ? "cursor-pointer transition-all pulse-glow" : "cursor-pointer transition-all"}
                    style={{ color: hoveredIdx === i ? "#ff6b6b" : "#6bb6ff", filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)" }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />

                  {/* Tooltip */}
                  {hoveredIdx === i && (
                    <g>
                      {/* Tooltip background */}
                      <rect
                        x={toSvgX(pt.x) - 55}
                        y={toSvgY(pt.y) - 30}
                        width={110}
                        height={20}
                        rx={4}
                        fill="#1e293b"
                        opacity={0.9}
                      />
                      {/* Tooltip text */}
                      <text
                        x={toSvgX(pt.x)}
                        y={toSvgY(pt.y) - 16}
                        textAnchor="middle"
                        fill="white"
                        style={{ fontSize: 10 }}
                      >
                        {config.xLabel.split(" ")[0]}: {pt.x}, {config.yLabel.split(" ")[0]}: {pt.y}
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </>
          )}
        </SVGGrid>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Noise slider */}
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Add Noise: {noiseLevel}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Perfectly linear</span>
              <span>Very noisy</span>
            </div>
          </div>

          {/* Trend line toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTrend}
              onChange={(e) => setShowTrend(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-600">Show Trend Line</span>
          </label>
        </div>
      </div>

      <InfoBox variant="green">
        A scatter plot shows how two measurements relate to each other. When points go upward from
        left to right, we call it a <strong>positive correlation</strong>. When they go downward, it
        is a <strong>negative correlation</strong>. When there is no pattern, there is{" "}
        <strong>no correlation</strong>.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "On a coordinate plane, which axis goes left to right?",
    options: ["The Y axis", "The X axis", "The Z axis", "Neither"],
    correctIndex: 1,
    explanation:
      "The X axis is horizontal (left to right). The Y axis is vertical (bottom to top).",
  },
  {
    question:
      "What are the coordinates of a point that is 3 units right and 7 units up?",
    options: ["(7, 3)", "(3, 7)", "(3, 3)", "(7, 7)"],
    correctIndex: 1,
    explanation:
      "Coordinates are written as (X, Y). X is the horizontal position (3 right), Y is the vertical position (7 up), so it's (3, 7).",
  },
  {
    question:
      "If points on a scatter plot go upward from left to right, what kind of correlation is it?",
    options: ["Negative", "No correlation", "Positive", "Impossible to tell"],
    correctIndex: 2,
    explanation:
      "When points trend upward from left to right, it's a positive correlation \u2014 as one value increases, the other tends to increase too.",
  },
  {
    question:
      "If there's no pattern in the scatter plot, what does that suggest?",
    options: [
      "Strong positive correlation",
      "Strong negative correlation",
      "The data is broken",
      "No correlation between the variables",
    ],
    correctIndex: 3,
    explanation:
      "When points are scattered randomly with no clear trend, it means the two variables are not related \u2014 there's no correlation.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L4_CoordinatesActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "plane",
        label: "The Coordinate Plane",
        icon: <Crosshair className="w-4 h-4" />,
        content: <CoordinatePlane />,
      },
      {
        id: "plot",
        label: "Plot the Points",
        icon: <Target className="w-4 h-4" />,
        content: <PlotThePoints />,
      },
      {
        id: "scatter",
        label: "Scatter Plot Explorer",
        icon: <BarChart3 className="w-4 h-4" />,
        content: <ScatterPlotExplorer />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Coordinates and Graphs"
      level={2}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Great \u2014 you can plot data on a graph! But what do those dots actually tell us? Let\u2019s learn to spot patterns in the next lesson."
      story={
        <StorySection
          paragraphs={[
            "Aru and Byte were at the park for a treasure hunt. The clue card said: \"Walk 5 steps right from the big tree, then 3 steps forward.\"",
            "Aru: \"That's easy! But what if there were 50 clues? How would I keep track of where everything is?\"",
            "Byte: \"That's exactly why mathematicians invented the coordinate system! Instead of saying 'near the fountain, sort of to the left,' you can say '5 right, 3 up' - or simply (5, 3). Every location gets a precise pair of numbers.\"",
            "Aru: \"So it's like giving every spot on a map an exact address?\"",
            "Byte: \"Exactly! And when you plot lots of data points on a grid, you get a scatter plot - one of the most powerful tools in data science.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A coordinate plane has two axes: X (horizontal, left to right) and Y (vertical, bottom to top). Every point is described by a pair (X, Y). Plotting data points on a coordinate plane creates a scatter plot, which helps us see relationships between two measurements."
        />
      }
    />
  );
}
