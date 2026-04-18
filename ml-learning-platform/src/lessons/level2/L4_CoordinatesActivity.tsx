"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Crosshair, Target, BarChart3, Trash2, RefreshCw } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  ScatterPlot,
  useAxisSystem,
  type DataPoint,
} from "../../components/viz/data-viz";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

/* ------------------------------------------------------------------ */
/*  Riku dialogue helper                                               */
/* ------------------------------------------------------------------ */

function RikuSays({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="card-sketchy p-3 flex gap-3 items-start"
      style={{ background: "#fff8e7" }}
    >
      <span className="text-2xl" aria-hidden>
        🐼
      </span>
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared constants                                                   */
/* ------------------------------------------------------------------ */

const INK_COLOR = "#2b2a35";
const GRID_W = 520;
const GRID_H = 360;

const DOT_PALETTE = [
  "var(--accent-coral)",
  "var(--accent-mint)",
  "var(--accent-yellow)",
  "var(--accent-lav)",
  "var(--accent-sky)",
  "var(--accent-peach)",
];

/** Seeded PRNG used by the Scatter Plot Explorer tab. */
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

  const axis = useAxisSystem({
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 10,
    width: GRID_W,
    height: GRID_H,
    xLabel: "X",
    yLabel: "Y",
  });

  const plot = axis.plot;

  const getDataCoords = useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const scaleX = GRID_W / rect.width;
      const scaleY = GRID_H / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      const dataX = ((px - plot.x) / plot.width) * 10;
      const dataY = 10 - ((py - plot.y) / plot.height) * 10;
      if (dataX < 0 || dataX > 10 || dataY < 0 || dataY > 10) return null;
      return {
        x: Math.round(dataX * 10) / 10,
        y: Math.round(dataY * 10) / 10,
      };
    },
    [plot.x, plot.y, plot.width, plot.height],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      setHover(getDataCoords(e));
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
        {
          x: coords.x,
          y: coords.y,
          color: DOT_PALETTE[prev.length % DOT_PALETTE.length],
        },
      ]);
    },
    [dots.length, getDataCoords],
  );

  const clearAll = useCallback(() => {
    playClick();
    setDots([]);
  }, []);

  return (
    <div className="space-y-5">
      <RikuSays>
        The x-axis goes sideways (like the horizon). The y-axis goes up (like...
        you know, up). Don&apos;t overthink it!
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3
          className="font-hand text-base font-bold text-center"
          style={{ color: INK_COLOR }}
        >
          Click anywhere on the grid to place a point
        </h3>

        <div className="flex items-center justify-between font-hand">
          <p className="text-sm font-bold" style={{ color: INK_COLOR }}>
            {hover
              ? `(X: ${hover.x.toFixed(1)}, Y: ${hover.y.toFixed(1)})`
              : "(X: -, Y: -)"}
          </p>
          <p className="text-xs text-muted-foreground font-bold">
            Points placed: {dots.length} / 10
          </p>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${GRID_W} ${GRID_H}`}
          className="w-full h-auto"
          role="img"
          aria-label="Interactive coordinate plane"
        >
          {axis.node}

          {/* Clickable plot area */}
          <rect
            x={plot.x}
            y={plot.y}
            width={plot.width}
            height={plot.height}
            fill="transparent"
            className="cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHover(null)}
            onClick={handleClick}
          />

          {/* Crosshair */}
          {hover && (
            <>
              <line
                x1={axis.xScale(hover.x)}
                x2={axis.xScale(hover.x)}
                y1={plot.y}
                y2={plot.y + plot.height}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 3"
                pointerEvents="none"
              />
              <line
                x1={plot.x}
                x2={plot.x + plot.width}
                y1={axis.yScale(hover.y)}
                y2={axis.yScale(hover.y)}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 3"
                pointerEvents="none"
              />
            </>
          )}

          {/* Placed dots */}
          {dots.map((dot, i) => (
            <g key={i} pointerEvents="none">
              <circle
                cx={axis.xScale(dot.x)}
                cy={axis.yScale(dot.y)}
                r={7}
                fill={dot.color}
                stroke={INK_COLOR}
                strokeWidth={2.5}
                style={{ filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)" }}
              />
              <text
                x={axis.xScale(dot.x)}
                y={axis.yScale(dot.y) - 12}
                textAnchor="middle"
                className="font-hand"
                fontSize={11}
                fill={INK_COLOR}
              >
                ({dot.x}, {dot.y})
              </text>
            </g>
          ))}
        </svg>

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

      <RikuSays>
        Every dot you place has an address: (X, Y). X first, Y second. Same
        order every time - like writing your name then your surname.
      </RikuSays>

      <InfoBox variant="blue">
        A coordinate plane has two axes: X goes left to right, Y goes bottom to
        top. Every point has a pair of numbers (X, Y) that tell you exactly
        where it is.
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
      x: Math.round(rng() * 8 + 1),
      y: Math.round(rng() * 8 + 1),
    });
  }
  return targets;
}

function PlotThePoints() {
  const [seed, setSeed] = useState(42);
  const targets = useMemo(() => generateTargets(seed), [seed]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correct, setCorrect] = useState<boolean[]>([]);
  const [wrongFlash, setWrongFlash] = useState<{ x: number; y: number } | null>(
    null,
  );
  const svgRef = useRef<SVGSVGElement | null>(null);

  const axis = useAxisSystem({
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 10,
    width: GRID_W,
    height: GRID_H,
    xLabel: "X",
    yLabel: "Y",
  });

  const plot = axis.plot;

  const score = correct.filter(Boolean).length;
  const allDone = correct.length === 5;

  const getDataCoords = useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const scaleX = GRID_W / rect.width;
      const scaleY = GRID_H / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      const dataX = ((px - plot.x) / plot.width) * 10;
      const dataY = 10 - ((py - plot.y) / plot.height) * 10;
      if (dataX < 0 || dataX > 10 || dataY < 0 || dataY > 10) return null;
      return { x: dataX, y: dataY };
    },
    [plot.x, plot.y, plot.width, plot.height],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      if (allDone) return;
      const coords = getDataCoords(e);
      if (!coords) return;

      const target = targets[currentIdx];
      const dist = Math.sqrt(
        (coords.x - target.x) ** 2 + (coords.y - target.y) ** 2,
      );

      if (dist <= 0.5) {
        playSuccess();
        setCorrect((prev) => [...prev, true]);
        if (currentIdx < 4) setCurrentIdx((i) => i + 1);
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
      <RikuSays>
        Pick a target from the list, then click that exact spot on the grid.
        Remember: X first (sideways), then Y (up). Swap them and you&apos;ll land
        somewhere totally wrong!
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3
          className="font-hand text-base font-bold text-center"
          style={{ color: INK_COLOR }}
        >
          Click on the grid to plot each target point
        </h3>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2.5 border-2 border-foreground">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(score / 5) * 100}%`, background: "#4ecdc4" }}
          />
        </div>
        <p
          className="font-hand text-xs font-bold text-right"
          style={{ color: INK_COLOR }}
        >
          Correct: {score} / 5
        </p>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${GRID_W} ${GRID_H}`}
              className="w-full h-auto"
              role="img"
              aria-label="Target plotting grid"
            >
              {axis.node}

              <rect
                x={plot.x}
                y={plot.y}
                width={plot.width}
                height={plot.height}
                fill="transparent"
                className="cursor-crosshair"
                onClick={handleClick}
              />

              {/* Already-placed correct dots */}
              {correct.map((_, i) => (
                <g key={i} pointerEvents="none">
                  <circle
                    cx={axis.xScale(targets[i].x)}
                    cy={axis.yScale(targets[i].y)}
                    r={9}
                    fill="var(--accent-mint)"
                    stroke={INK_COLOR}
                    strokeWidth={2.5}
                    style={{ filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)" }}
                  />
                  <text
                    x={axis.xScale(targets[i].x)}
                    y={axis.yScale(targets[i].y) + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={11}
                    fontWeight={700}
                  >
                    ✓
                  </text>
                </g>
              ))}

              {/* Wrong flash */}
              {wrongFlash && (
                <g pointerEvents="none">
                  <circle
                    cx={axis.xScale(wrongFlash.x)}
                    cy={axis.yScale(wrongFlash.y)}
                    r={8}
                    fill="var(--accent-coral)"
                    opacity={0.8}
                  >
                    <animate
                      attributeName="opacity"
                      from="0.8"
                      to="0"
                      dur="0.8s"
                      fill="freeze"
                    />
                  </circle>
                  <text
                    x={axis.xScale(wrongFlash.x)}
                    y={axis.yScale(wrongFlash.y) + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={11}
                    fontWeight={700}
                  >
                    ✗
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Target list panel */}
          <div className="lg:w-48 space-y-2">
            <h4
              className="font-hand text-xs font-bold uppercase tracking-wide"
              style={{ color: INK_COLOR }}
            >
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
          <div
            className="card-sketchy p-4 text-center"
            style={{ background: "#4ecdc433" }}
          >
            <p
              className="font-hand text-base font-bold"
              style={{ color: INK_COLOR }}
            >
              All 5 points plotted correctly! Try a new set or move on.
            </p>
          </div>
        )}
      </div>

      <RikuSays>
        Missed one? That&apos;s fine - even pros double-check. Count over on X
        first, then up on Y. That muscle memory is worth gold later on.
      </RikuSays>

      <InfoBox variant="amber">
        Plotting points takes practice. Pay attention to which number is X
        (horizontal) and which is Y (vertical). A common mistake is swapping
        them!
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
  seed: number;
  generate: (rng: () => number, noise: number) => { x: number; y: number }[];
}

const DATASETS: Record<DatasetKey, DatasetConfig> = {
  study: {
    label: "Study Hours vs Test Score",
    xLabel: "Study Hours",
    yLabel: "Test Score",
    seed: 123,
    generate: (rng, noise) => {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < 20; i++) {
        const x = rng() * 9 + 0.5;
        const base = 40 + x * 6;
        const y = Math.max(0, Math.min(100, base + (rng() - 0.5) * noise * 0.6));
        pts.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
      }
      return pts;
    },
  },
  temperature: {
    label: "Temperature vs Hot Chocolate Sales",
    xLabel: "Temperature (°C)",
    yLabel: "Sales",
    seed: 456,
    generate: (rng, noise) => {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < 20; i++) {
        const x = rng() * 38 + 1;
        const base = 90 - x * 2;
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
    seed: 789,
    generate: (rng, noise) => {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < 20; i++) {
        const x = rng() * 9 + 4.5;
        const base = 105;
        const spread = 10 + noise * 0.2;
        const y = Math.max(70, Math.min(140, base + (rng() - 0.5) * spread));
        pts.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
      }
      return pts;
    },
  },
};

function ScatterPlotExplorer() {
  const [datasetKey, setDatasetKey] = useState<DatasetKey>("study");
  const [noiseLevel, setNoiseLevel] = useState(30);
  const [showTrend, setShowTrend] = useState(false);

  const config = DATASETS[datasetKey];

  const points: DataPoint[] = useMemo(() => {
    const rng = mulberry32(config.seed);
    return config.generate(rng, noiseLevel).map((p) => ({
      x: p.x,
      y: p.y,
      label: config.label,
    }));
  }, [config, noiseLevel]);

  return (
    <div className="space-y-5">
      <RikuSays>
        A scatter plot is just lots of (X, Y) points stuck onto a grid. Your
        eyes are looking for a <b>pattern</b> - do the dots climb up, slide
        down, or scatter everywhere?
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3
          className="font-hand text-base font-bold text-center"
          style={{ color: INK_COLOR }}
        >
          Explore how data points form patterns
        </h3>

        {/* Dataset selector */}
        <div className="flex flex-wrap gap-2 justify-center">
          {(Object.keys(DATASETS) as DatasetKey[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                playClick();
                setDatasetKey(key);
              }}
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

        {/* Library scatter plot */}
        <ScatterPlot
          data={points}
          width={GRID_W}
          height={GRID_H}
          xLabel={config.xLabel}
          yLabel={config.yLabel}
          showTrendLine={showTrend}
        />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 space-y-1 w-full">
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

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTrend}
              onChange={(e) => setShowTrend(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-600">
              Show Trend Line
            </span>
          </label>
        </div>
      </div>

      <RikuSays>
        Watch the &quot;Shoe Size vs IQ&quot; one - totally random. Big feet
        don&apos;t make you smarter, no matter how much you squint. No pattern =
        no correlation!
      </RikuSays>

      <InfoBox variant="green">
        A scatter plot shows how two measurements relate to each other. When
        points go upward from left to right, we call it a{" "}
        <strong>positive correlation</strong>. When they go downward, it is a{" "}
        <strong>negative correlation</strong>. When there is no pattern, there
        is <strong>no correlation</strong>.
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
    question: "If there's no pattern in the scatter plot, what does that suggest?",
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
            "Byte: \"Exactly! And when you plot lots of data points on a grid, you get a scatter plot - one of the most powerful tools in data science.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A coordinate plane has two axes: X (horizontal, left to right) and Y (vertical, bottom to top). Every point is described by a pair (X, Y). Plotting data points on a coordinate plane creates a scatter plot, which helps us see relationships between two measurements."
        />
      }
    />
  );
}
