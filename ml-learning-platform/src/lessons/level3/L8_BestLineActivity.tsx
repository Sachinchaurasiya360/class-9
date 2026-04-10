"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { TrendingUp, SlidersHorizontal, Trophy, RefreshCw, Eye, Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";

/* ------------------------------------------------------------------ */
/*  Theme palette (matches sketchy notebook)                           */
/* ------------------------------------------------------------------ */

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
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generatePoints(seed: number): { x: number; y: number }[] {
  const rng = mulberry32(seed);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 15; i++) {
    const x = 1 + rng() * 8;
    const y = 0.7 * x + 1.5 + (rng() - 0.5) * 3;
    points.push({ x: Math.round(x * 10) / 10, y: Math.max(0, Math.min(10, Math.round(y * 10) / 10)) });
  }
  return points;
}

function computeBestFit(points: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = points.length;
  const xMean = points.reduce((s, p) => s + p.x, 0) / n;
  const yMean = points.reduce((s, p) => s + p.y, 0) / n;
  let num = 0,
    den = 0;
  for (const p of points) {
    num += (p.x - xMean) * (p.y - yMean);
    den += (p.x - xMean) ** 2;
  }
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;
  return { slope, intercept };
}

function computeError(points: { x: number; y: number }[], slope: number, intercept: number): number {
  return points.reduce((sum, p) => sum + (p.y - (slope * p.x + intercept)) ** 2, 0);
}

/* ------------------------------------------------------------------ */
/*  SVG axis helper                                                    */
/* ------------------------------------------------------------------ */

const PLOT_MARGIN = { top: 20, right: 20, bottom: 35, left: 40 };

function toSvgX(x: number, plotW: number): number {
  return PLOT_MARGIN.left + (x / 10) * plotW;
}
function toSvgY(y: number, plotH: number): number {
  return PLOT_MARGIN.top + plotH - (y / 10) * plotH;
}

function PlotAxes({ width, height }: { width: number; height: number }) {
  const plotW = width - PLOT_MARGIN.left - PLOT_MARGIN.right;
  const plotH = height - PLOT_MARGIN.top - PLOT_MARGIN.bottom;

  const gridLines: React.ReactNode[] = [];
  const tickLabels: React.ReactNode[] = [];

  for (let v = 0; v <= 10; v += 2) {
    const sx = toSvgX(v, plotW);
    const sy = toSvgY(v, plotH);
    // vertical gridline
    gridLines.push(
      <line key={`gv${v}`} x1={sx} y1={PLOT_MARGIN.top} x2={sx} y2={PLOT_MARGIN.top + plotH} stroke="#e2e8f0" strokeWidth={1} />
    );
    // horizontal gridline
    gridLines.push(
      <line key={`gh${v}`} x1={PLOT_MARGIN.left} y1={sy} x2={PLOT_MARGIN.left + plotW} y2={sy} stroke="#e2e8f0" strokeWidth={1} />
    );
    // X tick
    tickLabels.push(
      <text key={`tx${v}`} x={sx} y={PLOT_MARGIN.top + plotH + 16} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 10 }}>
        {v}
      </text>
    );
    // Y tick
    tickLabels.push(
      <text key={`ty${v}`} x={PLOT_MARGIN.left - 8} y={sy + 3} textAnchor="end" className="fill-slate-500" style={{ fontSize: 10 }}>
        {v}
      </text>
    );
  }

  return (
    <g>
      {gridLines}
      {/* X axis */}
      <line x1={PLOT_MARGIN.left} y1={PLOT_MARGIN.top + plotH} x2={PLOT_MARGIN.left + plotW} y2={PLOT_MARGIN.top + plotH} stroke="#94a3b8" strokeWidth={1.5} />
      {/* Y axis */}
      <line x1={PLOT_MARGIN.left} y1={PLOT_MARGIN.top} x2={PLOT_MARGIN.left} y2={PLOT_MARGIN.top + plotH} stroke="#94a3b8" strokeWidth={1.5} />
      {tickLabels}
      {/* Axis labels */}
      <text x={PLOT_MARGIN.left + plotW / 2} y={height - 4} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 11, fontWeight: 600 }}>
        X
      </text>
      <text x={12} y={PLOT_MARGIN.top + plotH / 2} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 11, fontWeight: 600 }} transform={`rotate(-90, 12, ${PLOT_MARGIN.top + plotH / 2})`}>
        Y
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Drag the Line                                              */
/* ------------------------------------------------------------------ */

function DragTheLine() {
  const svgW = 560;
  const svgH = 360;
  const plotW = svgW - PLOT_MARGIN.left - PLOT_MARGIN.right;
  const plotH = svgH - PLOT_MARGIN.top - PLOT_MARGIN.bottom;

  const [themeIdx, setThemeIdx] = useState(0);
  const theme = THEMES[themeIdx];

  const points = useMemo(() => generatePoints(42), []);
  const bestFit = useMemo(() => computeBestFit(points), [points]);

  const [slope, setSlope] = useState(0);
  const [intercept, setIntercept] = useState(5);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animRef.current !== null) clearInterval(animRef.current);
    };
  }, []);

  const totalError = useMemo(() => computeError(points, slope, intercept), [points, slope, intercept]);

  const animateToBestFit = useCallback(() => {
    if (animRef.current !== null) clearInterval(animRef.current);
    const targetSlope = bestFit.slope;
    const targetIntercept = bestFit.intercept;
    const steps = 40;
    let step = 0;
    const startSlope = slope;
    const startIntercept = intercept;

    animRef.current = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = t * t * (3 - 2 * t); // smoothstep
      const newSlope = Math.round((startSlope + (targetSlope - startSlope) * eased) * 10) / 10;
      const newIntercept = Math.round((startIntercept + (targetIntercept - startIntercept) * eased) * 5) / 5;
      setSlope(newSlope);
      setIntercept(newIntercept);
      if (step >= steps) {
        setSlope(Math.round(targetSlope * 10) / 10);
        setIntercept(Math.round(targetIntercept * 5) / 5);
        if (animRef.current !== null) clearInterval(animRef.current);
        animRef.current = null;
      }
    }, 30);
  }, [slope, intercept, bestFit]);

  const residualColor = (mag: number) => {
    if (mag < 1) return "#22c55e";
    if (mag < 2) return "#eab308";
    return "#ef4444";
  };

  // Compute line endpoints in data coords, clipped to 0-10
  const lineY0 = slope * 0 + intercept;
  const lineY10 = slope * 10 + intercept;

  return (
    <div className="space-y-5">
      <ThemePicker themeIdx={themeIdx} setThemeIdx={setThemeIdx} />
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold" style={{ color: INK }}>Adjust the line to fit the data points</h3>

        {/* SVG Scatter Plot */}
        <div className="overflow-x-auto flex justify-center">
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="max-w-full">
            <defs>
              <radialGradient id="bl-pt-grad" cx="35%" cy="30%">
                <stop offset="0%" stopColor={theme.glow} />
                <stop offset="100%" stopColor={theme.node} />
              </radialGradient>
            </defs>
            <PlotAxes width={svgW} height={svgH} />

            {/* Residual lines */}
            {points.map((p, i) => {
              const predicted = slope * p.x + intercept;
              const mag = Math.abs(p.y - predicted);
              const big = mag >= 2;
              return (
                <line
                  key={`r${i}`}
                  x1={toSvgX(p.x, plotW)}
                  y1={toSvgY(p.y, plotH)}
                  x2={toSvgX(p.x, plotW)}
                  y2={toSvgY(predicted, plotH)}
                  stroke={residualColor(mag)}
                  strokeWidth={big ? 2.5 : 1.5}
                  strokeDasharray="4 3"
                  opacity={0.85}
                  className={big ? "pulse-glow" : ""}
                  style={big ? { color: residualColor(mag) } : undefined}
                />
              );
            })}

            {/* Fitted line */}
            <line
              x1={toSvgX(0, plotW)}
              y1={toSvgY(lineY0, plotH)}
              x2={toSvgX(10, plotW)}
              y2={toSvgY(lineY10, plotH)}
              stroke={theme.node}
              strokeWidth={3.5}
              strokeLinecap="round"
              className="pulse-glow"
              style={{ color: theme.node }}
            />

            {/* Data points */}
            {points.map((p, i) => (
              <circle key={`p${i}`} cx={toSvgX(p.x, plotW)} cy={toSvgY(p.y, plotH)} r={6} fill="url(#bl-pt-grad)" stroke={INK} strokeWidth={1.8} />
            ))}
          </svg>
        </div>

        {/* Stats display */}
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <span className="font-hand font-bold px-3 py-1 rounded-lg border-2 border-foreground shadow-[2px_2px_0_#2b2a35]" style={{ background: theme.glow, color: INK }}>
            Slope: {slope.toFixed(1)}
          </span>
          <span className="font-hand font-bold px-3 py-1 rounded-lg border-2 border-foreground shadow-[2px_2px_0_#2b2a35]" style={{ background: theme.glow, color: INK }}>
            Intercept: {intercept.toFixed(1)}
          </span>
          <span className="font-hand font-bold px-3 py-1 rounded-lg border-2 border-foreground shadow-[2px_2px_0_#2b2a35] bg-accent-yellow" style={{ color: INK }}>
            Total Error: {totalError.toFixed(2)}
          </span>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Slope: {slope.toFixed(1)}</label>
            <input
              type="range"
              min={-2}
              max={3}
              step={0.1}
              value={slope}
              onChange={(e) => setSlope(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>-2</span>
              <span>3</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Intercept: {intercept.toFixed(1)}</label>
            <input
              type="range"
              min={-3}
              max={8}
              step={0.2}
              value={intercept}
              onChange={(e) => setIntercept(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>-3</span>
              <span>8</span>
            </div>
          </div>
        </div>

        {/* Show Best Fit button */}
        <div className="flex justify-center">
          <button
            onClick={() => { playPop(); animateToBestFit(); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground shadow-[2px_2px_0_#2b2a35] bg-accent-yellow hover:translate-y-px transition-transform"
            style={{ color: INK }}
          >
            <Eye className="w-4 h-4" />
            Show Best Fit
          </button>
        </div>
      </div>

      <InfoBox variant="blue">
        The best line is the one where the total error  the sum of all distances from points to the line  is as
        small as possible. Can you beat the computer? Adjust the slope and intercept to minimize the error!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  What Do Slope and Intercept Mean?                          */
/* ------------------------------------------------------------------ */

function SlopeInterceptExplorer() {
  const svgW = 560;
  const svgH = 360;
  const plotW = svgW - PLOT_MARGIN.left - PLOT_MARGIN.right;
  const plotH = svgH - PLOT_MARGIN.top - PLOT_MARGIN.bottom;

  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(2);

  const applyPreset = useCallback((s: number, i?: number) => {
    setSlope(s);
    if (i !== undefined) setIntercept(i);
  }, []);

  // Line endpoints in data space
  const lineY0 = slope * 0 + intercept;
  const lineY10 = slope * 10 + intercept;

  // Rise/run triangle: pick a point on the line where both run=1 and rise are visible
  const triX = 3;
  const triY = slope * triX + intercept;
  const triEndY = slope * (triX + 1) + intercept;

  // Check if triangle is within visible area
  const triVisible = triY >= 0 && triY <= 10 && triEndY >= -1 && triEndY <= 11;

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Explore how slope and intercept change the line</h3>

        {/* SVG Plot */}
        <div className="overflow-x-auto flex justify-center">
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="max-w-full">
            <PlotAxes width={svgW} height={svgH} />

            {/* Line */}
            <line
              x1={toSvgX(0, plotW)}
              y1={toSvgY(lineY0, plotH)}
              x2={toSvgX(10, plotW)}
              y2={toSvgY(lineY10, plotH)}
              stroke="#6366f1"
              strokeWidth={2.5}
            />

            {/* Intercept dot and label */}
            <circle
              cx={toSvgX(0, plotW)}
              cy={toSvgY(intercept, plotH)}
              r={7}
              className="fill-rose-500 stroke-white"
              strokeWidth={2}
            />
            {/* Arrow line pointing to intercept dot */}
            <line
              x1={toSvgX(0, plotW) + 40}
              y1={toSvgY(intercept, plotH) - 12}
              x2={toSvgX(0, plotW) + 12}
              y2={toSvgY(intercept, plotH) - 2}
              stroke="#e11d48"
              strokeWidth={1.5}
              markerEnd="url(#arrowMarker)"
            />
            <defs>
              <marker id="arrowMarker" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#e11d48" />
              </marker>
            </defs>
            <text
              x={toSvgX(0, plotW) + 44}
              y={toSvgY(intercept, plotH) - 10}
              className="fill-rose-600"
              style={{ fontSize: 12, fontWeight: 700 }}
            >
              Intercept = {intercept.toFixed(1)}
            </text>

            {/* Rise/Run triangle */}
            {triVisible && (
              <g>
                {/* Horizontal arrow (run) */}
                <line
                  x1={toSvgX(triX, plotW)}
                  y1={toSvgY(triY, plotH)}
                  x2={toSvgX(triX + 1, plotW)}
                  y2={toSvgY(triY, plotH)}
                  stroke="#0ea5e9"
                  strokeWidth={2}
                />
                {/* Run arrowhead */}
                <polygon
                  points={`${toSvgX(triX + 1, plotW)},${toSvgY(triY, plotH)} ${toSvgX(triX + 1, plotW) - 6},${toSvgY(triY, plotH) - 4} ${toSvgX(triX + 1, plotW) - 6},${toSvgY(triY, plotH) + 4}`}
                  fill="#0ea5e9"
                />
                {/* Run label */}
                <text
                  x={toSvgX(triX + 0.5, plotW)}
                  y={toSvgY(triY, plotH) + 16}
                  textAnchor="middle"
                  className="fill-sky-600"
                  style={{ fontSize: 11, fontWeight: 600 }}
                >
                  Run = 1
                </text>

                {/* Vertical arrow (rise) */}
                <line
                  x1={toSvgX(triX + 1, plotW)}
                  y1={toSvgY(triY, plotH)}
                  x2={toSvgX(triX + 1, plotW)}
                  y2={toSvgY(triEndY, plotH)}
                  stroke="#f59e0b"
                  strokeWidth={2}
                />
                {/* Rise arrowhead */}
                {slope !== 0 && (
                  <polygon
                    points={`${toSvgX(triX + 1, plotW)},${toSvgY(triEndY, plotH)} ${toSvgX(triX + 1, plotW) - 4},${toSvgY(triEndY, plotH) + (slope > 0 ? 6 : -6)} ${toSvgX(triX + 1, plotW) + 4},${toSvgY(triEndY, plotH) + (slope > 0 ? 6 : -6)}`}
                    fill="#f59e0b"
                  />
                )}
                {/* Rise label */}
                <text
                  x={toSvgX(triX + 1, plotW) + 12}
                  y={toSvgY((triY + triEndY) / 2, plotH) + 4}
                  className="fill-amber-600"
                  style={{ fontSize: 11, fontWeight: 600 }}
                >
                  Rise = {slope.toFixed(1)}
                </text>

                {/* Dashed connectors for the triangle */}
                <line
                  x1={toSvgX(triX, plotW)}
                  y1={toSvgY(triY, plotH)}
                  x2={toSvgX(triX, plotW)}
                  y2={toSvgY(triY, plotH)}
                  stroke="#94a3b8"
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Dynamic text */}
        <div className="text-center">
          <p className="text-sm text-slate-700 font-medium">
            For every <span className="text-sky-600 font-bold">1 unit</span> increase in X, Y changes by{" "}
            <span className="text-amber-600 font-bold">{slope.toFixed(1)} units</span>
          </p>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Slope: {slope.toFixed(1)}</label>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.1}
              value={slope}
              onChange={(e) => setSlope(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>-3</span>
              <span>3</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Intercept: {intercept.toFixed(1)}</label>
            <input
              type="range"
              min={0}
              max={10}
              step={0.2}
              value={intercept}
              onChange={(e) => setIntercept(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>0</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: "Flat Line", s: 0, i: undefined },
            { label: "Gentle Uphill", s: 0.5, i: undefined },
            { label: "Steep Uphill", s: 2, i: undefined },
            { label: "Downhill", s: -1, i: undefined },
            { label: "Through Origin", s: 1, i: 0 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => { playClick(); applyPreset(preset.s, preset.i); }}
              className="px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground bg-background hover:bg-accent-yellow/40 shadow-[2px_2px_0_#2b2a35] transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <InfoBox variant="amber">
        The slope tells you how steep the line is  positive means uphill, negative means downhill, zero means flat.
        The intercept is where the line crosses the Y axis (the starting point when X is 0).
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Error Showdown                                             */
/* ------------------------------------------------------------------ */

function ErrorShowdown() {
  const svgW = 280;
  const svgH = 280;
  const plotW = svgW - PLOT_MARGIN.left - PLOT_MARGIN.right;
  const plotH = svgH - PLOT_MARGIN.top - PLOT_MARGIN.bottom;

  const [seed, setSeed] = useState(77);
  const points = useMemo(() => generatePoints(seed), [seed]);
  const bestFit = useMemo(() => computeBestFit(points), [points]);
  const bestError = useMemo(() => computeError(points, bestFit.slope, bestFit.intercept), [points, bestFit]);

  const [userSlope, setUserSlope] = useState(0.5);
  const [userIntercept, setUserIntercept] = useState(3);

  const userError = useMemo(() => computeError(points, userSlope, userIntercept), [points, userSlope, userIntercept]);

  const ratio = bestError > 0 ? userError / bestError : 1;
  const within10 = ratio <= 1.1 && ratio >= 0.9;
  const within5 = ratio <= 1.05 && ratio >= 0.95;

  const newData = useCallback(() => {
    setSeed((prev) => prev + 1);
    setUserSlope(0.5);
    setUserIntercept(3);
  }, []);

  const residualColor = (mag: number) => {
    if (mag < 1) return "#22c55e";
    if (mag < 2) return "#eab308";
    return "#ef4444";
  };

  // Bar chart dimensions
  const barMaxW = 200;
  const userBarW = bestError > 0 ? Math.min((userError / Math.max(userError, bestError)) * barMaxW, barMaxW) : barMaxW;
  const bestBarW = bestError > 0 ? Math.min((bestError / Math.max(userError, bestError)) * barMaxW, barMaxW) : barMaxW;

  function MiniPlot({
    slope,
    intercept,
    label,
    lineColor,
  }: {
    slope: number;
    intercept: number;
    label: string;
    lineColor: string;
  }) {
    const lineY0 = slope * 0 + intercept;
    const lineY10 = slope * 10 + intercept;

    return (
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-700 text-center">{label}</p>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="max-w-full">
          <PlotAxes width={svgW} height={svgH} />

          {/* Residual lines */}
          {points.map((p, i) => {
            const predicted = slope * p.x + intercept;
            const mag = Math.abs(p.y - predicted);
            return (
              <line
                key={`r${i}`}
                x1={toSvgX(p.x, plotW)}
                y1={toSvgY(p.y, plotH)}
                x2={toSvgX(p.x, plotW)}
                y2={toSvgY(predicted, plotH)}
                stroke={residualColor(mag)}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.8}
              />
            );
          })}

          {/* Line */}
          <line
            x1={toSvgX(0, plotW)}
            y1={toSvgY(lineY0, plotH)}
            x2={toSvgX(10, plotW)}
            y2={toSvgY(lineY10, plotH)}
            stroke={lineColor}
            strokeWidth={2.5}
          />

          {/* Points */}
          {points.map((p, i) => (
            <circle key={`p${i}`} cx={toSvgX(p.x, plotW)} cy={toSvgY(p.y, plotH)} r={4} className="fill-indigo-500 stroke-white" strokeWidth={1} />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Can you match the computer's best fit?</h3>

        {/* Side-by-side plots */}
        <div className="flex flex-col lg:flex-row gap-4 justify-center">
          <MiniPlot slope={userSlope} intercept={userIntercept} label="Your Line" lineColor="#3b82f6" />
          <MiniPlot slope={bestFit.slope} intercept={bestFit.intercept} label="Best Fit Line" lineColor="#22c55e" />
        </div>

        {/* Sliders for user line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Your Slope: {userSlope.toFixed(1)}</label>
            <input
              type="range"
              min={-2}
              max={3}
              step={0.1}
              value={userSlope}
              onChange={(e) => setUserSlope(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>-2</span>
              <span>3</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Your Intercept: {userIntercept.toFixed(1)}</label>
            <input
              type="range"
              min={-3}
              max={8}
              step={0.2}
              value={userIntercept}
              onChange={(e) => setUserIntercept(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>-3</span>
              <span>8</span>
            </div>
          </div>
        </div>

        {/* Error comparison bars */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600 w-28 text-right">Your Error:</span>
            <div className="flex-1 bg-slate-100 rounded-full h-5 relative overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(userBarW / barMaxW) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-blue-600 w-16">{userError.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600 w-28 text-right">Best Fit Error:</span>
            <div className="flex-1 bg-slate-100 rounded-full h-5 relative overflow-hidden">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(bestBarW / barMaxW) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-green-600 w-16">{bestError.toFixed(2)}</span>
          </div>
        </div>

        {/* Celebration messages */}
        {within5 && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-3 text-center">
            <p className="text-sm font-bold text-green-700">Incredible! You nearly matched the computer!</p>
          </div>
        )}
        {within10 && !within5 && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-center">
            <p className="text-sm font-bold text-amber-700">Amazing! You're within 10% of the optimal!</p>
          </div>
        )}

        {/* New Data button */}
        <div className="flex justify-center">
          <button
            onClick={() => { playClick(); newData(); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground shadow-[2px_2px_0_#2b2a35] bg-accent-yellow hover:translate-y-px transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            New Data
          </button>
        </div>
      </div>

      <InfoBox variant="green">
        Machine learning does exactly this  it adjusts the line (or curve) over and over until the error is as small
        as possible. You just did machine learning with your hands!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "If a line has a slope of 2, what does that mean?",
    options: [
      "The line is flat",
      "Y increases by 2 for every 1 unit increase in X",
      "The line starts at Y = 2",
      "The line has 2 points",
    ],
    correctIndex: 1,
    explanation:
      "A slope of 2 means that for every 1 unit you move to the right on the X axis, the Y value goes up by 2 units.",
  },
  {
    question: "What is a residual?",
    options: [
      "The slope of the line",
      "The distance between a data point and the line",
      "The total number of points",
      "The intercept value",
    ],
    correctIndex: 1,
    explanation:
      "A residual is the vertical distance between a data point and the line. Smaller residuals mean the line fits the data better.",
  },
  {
    question: "What happens to the total error when the line goes through every point perfectly?",
    options: [
      "The error is very large",
      "The error is exactly zero",
      "The error is negative",
      "The error is undefined",
    ],
    correctIndex: 1,
    explanation:
      "If the line passes through every point, all residuals are zero, so the total error is zero. In practice, this rarely happens with real data.",
  },
  {
    question: "The 'best fit line' is the line that:",
    options: [
      "Goes through the first and last points",
      "Has the steepest slope",
      "Minimizes the total error",
      "Is perfectly horizontal",
    ],
    correctIndex: 2,
    explanation:
      "The best fit line minimizes the total error (sum of squared residuals). This is the core idea behind linear regression in machine learning!",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L8_BestLineActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "drag",
        label: "Drag the Line",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <DragTheLine />,
      },
      {
        id: "slope-intercept",
        label: "What Do Slope and Intercept Mean?",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <SlopeInterceptExplorer />,
      },
      {
        id: "showdown",
        label: "Error Showdown",
        icon: <Trophy className="w-4 h-4" />,
        content: <ErrorShowdown />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Drawing the Best Line"
      level={3}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You manually adjusted a line to fit data. But how would a computer do this automatically? It needs a set of steps  an algorithm!"
      story={
        <StorySection
          paragraphs={[
            "Aru had been tracking her sunflower's height every week: 5 cm, 8 cm, 12 cm, 15 cm, 19 cm. She wanted to know how tall it would be next month.",
            "Aru: \"I can see the plant is growing, but how do I predict the exact height in 4 weeks?\"",
            "Byte: \"Let's plot your measurements on a graph. Then we'll draw a line that gets as close to all the dots as possible. That line is your best guess for the pattern - and you can extend it into the future!\"",
            "Aru: \"But how do I know which line is the 'best' one? I could draw a million different lines.\"",
            "Byte: \"The best line is the one that makes the smallest total error - the distances between each dot and the line. Let me show you how to find it!\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="The line of best fit is the line that minimizes the total error (the sum of distances from each data point to the line). It's defined by two numbers: the slope (steepness) and the intercept (where it crosses the Y axis). This concept is the foundation of linear regression - one of the most used techniques in machine learning."
        />
      }
    />
  );
}
