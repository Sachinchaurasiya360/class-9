import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Activity, TrendingUp, Sliders, Play, RotateCcw, Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";

/* ------------------------------------------------------------------ */
/*  Activation function helpers                                        */
/* ------------------------------------------------------------------ */

const step = (x: number) => (x >= 0 ? 1 : 0);
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const tanh_ = (x: number) => Math.tanh(x);
const relu = (x: number) => Math.max(0, x);
const leakyRelu = (x: number) => (x >= 0 ? x : 0.1 * x);

type AFn = {
  name: string;
  fn: (x: number) => number;
  color: string;
  glow: string;
  range: [number, number];
  emoji: string;
  formula: string;
  definition: string;
};

const activationFns: AFn[] = [
  { name: "Step",       fn: step,      color: "#ff6b6b", glow: "#ff8a8a", range: [-0.2, 1.2], emoji: "🚦", formula: "1 if x≥0 else 0",
    definition: "The Step function is the simplest activation: it outputs 1 if the input is positive, otherwise 0. It acts like an on/off switch — perfect for yes/no decisions, but too sharp for learning since it has no smooth gradient." },
  { name: "Sigmoid",    fn: sigmoid,   color: "#6bb6ff", glow: "#94caff", range: [-0.1, 1.1], emoji: "〰️", formula: "1 / (1 + e^-x)",
    definition: "Sigmoid squashes any number into a smooth value between 0 and 1, shaped like an S-curve. It's great for probabilities, but for very large or very small inputs the gradient becomes tiny — a problem called the vanishing gradient." },
  { name: "Tanh",       fn: tanh_,     color: "#b18cf2", glow: "#c9adf7", range: [-1.2, 1.2], emoji: "🌊", formula: "tanh(x)",
    definition: "Tanh is similar to Sigmoid but outputs values between -1 and 1, centered at zero. This zero-centered output usually helps neural networks learn faster than Sigmoid." },
  { name: "ReLU",       fn: relu,      color: "#4ecdc4", glow: "#7ee0d8", range: [-1, 5.5],   emoji: "📐", formula: "max(0, x)",
    definition: "ReLU (Rectified Linear Unit) outputs the input directly if it's positive, otherwise zero. It's fast, simple, and the most popular activation in deep learning — though neurons can sometimes 'die' if they always output zero." },
  { name: "LeakyReLU",  fn: leakyRelu, color: "#ffb88c", glow: "#ffd0b3", range: [-1, 5.5],   emoji: "💧", formula: "x if x≥0 else 0.1x",
    definition: "Leaky ReLU fixes the 'dying ReLU' problem by allowing a small negative slope (like 0.1x) for negative inputs. This keeps neurons alive and learning even when their input is negative." },
];

const INK = "#2b2a35";

const THEMES = [
  { name: "Coral",    node: "#ff6b6b", glow: "#ff8a8a", accent: "#ffd93d" },
  { name: "Mint",     node: "#4ecdc4", glow: "#7ee0d8", accent: "#ffd93d" },
  { name: "Lavender", node: "#b18cf2", glow: "#c9adf7", accent: "#ffd93d" },
  { name: "Sky",      node: "#6bb6ff", glow: "#94caff", accent: "#ffd93d" },
  { name: "Sunset",   node: "#ffb88c", glow: "#ffd0b3", accent: "#ff6b6b" },
];

/* ------------------------------------------------------------------ */
/*  Sketchy mini-chart                                                 */
/* ------------------------------------------------------------------ */

const CHART_W = 240;
const CHART_H = 160;
const CHART_PAD = 30;

function MiniChart({
  af,
  inputVal,
  showCursor,
  highlighted,
}: {
  af: AFn;
  inputVal: number;
  showCursor: boolean;
  highlighted: boolean;
}) {
  const xMin = -5, xMax = 5;
  const [yMin, yMax] = af.range;
  const toSX = (v: number) => CHART_PAD + ((v - xMin) / (xMax - xMin)) * (CHART_W - 2 * CHART_PAD);
  const toSY = (v: number) => CHART_H - CHART_PAD - ((v - yMin) / (yMax - yMin)) * (CHART_H - 2 * CHART_PAD);

  const points: string[] = [];
  for (let px = 0; px <= 120; px++) {
    const x = xMin + (px / 120) * (xMax - xMin);
    const y = af.fn(x);
    const clampedY = Math.max(yMin, Math.min(yMax, y));
    points.push(`${toSX(x).toFixed(1)},${toSY(clampedY).toFixed(1)}`);
  }
  const pathD = "M " + points.join(" L ");

  const cursorX = toSX(inputVal);
  const outVal = af.fn(inputVal);
  const cursorY = toSY(Math.max(yMin, Math.min(yMax, outVal)));

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full">
      <defs>
        <pattern id={`grid-${af.name}`} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 14" fill="none" stroke={INK} strokeOpacity="0.08" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Background */}
      <rect
        x={CHART_PAD} y={CHART_PAD - 10}
        width={CHART_W - 2 * CHART_PAD} height={CHART_H - 2 * CHART_PAD + 10}
        fill="#fffdf5" stroke={INK} strokeWidth={2} rx={4}
      />
      <rect
        x={CHART_PAD} y={CHART_PAD - 10}
        width={CHART_W - 2 * CHART_PAD} height={CHART_H - 2 * CHART_PAD + 10}
        fill={`url(#grid-${af.name})`}
      />

      {/* Zero lines */}
      <line x1={toSX(0)} y1={CHART_PAD - 10} x2={toSX(0)} y2={CHART_H - CHART_PAD} stroke={INK} strokeWidth={1} strokeDasharray="2 3" opacity={0.4} />
      <line x1={CHART_PAD} y1={toSY(0)} x2={CHART_W - CHART_PAD} y2={toSY(0)} stroke={INK} strokeWidth={1} strokeDasharray="2 3" opacity={0.4} />

      {/* Glow halo */}
      <path d={pathD} fill="none" stroke={af.glow} strokeWidth={6} strokeLinecap="round" opacity={highlighted ? 0.6 : 0.3} />
      {/* Function curve */}
      <path d={pathD} fill="none" stroke={af.color} strokeWidth={3} strokeLinecap="round" />

      {/* Cursor */}
      {showCursor && (
        <>
          <line x1={cursorX} y1={CHART_PAD - 10} x2={cursorX} y2={CHART_H - CHART_PAD} stroke={INK} strokeWidth={1.5} strokeDasharray="3 2" />
          <circle cx={cursorX} cy={cursorY} r={9} fill={af.glow} opacity={0.5} className="pulse-glow" style={{ color: af.color }} />
          <circle cx={cursorX} cy={cursorY} r={5.5} fill={af.color} stroke={INK} strokeWidth={2} />
          <text x={cursorX} y={cursorY - 12} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">
            {outVal.toFixed(2)}
          </text>
        </>
      )}

      {/* Title */}
      <text x={CHART_W / 2} y={16} textAnchor="middle" className="text-[13px] font-bold" fill={af.color} fontFamily="Kalam">
        {af.emoji} {af.name}
      </text>

      {/* Axis labels */}
      <text x={CHART_W - CHART_PAD + 6} y={toSY(0) + 4} className="text-[10px]" fill={INK} fontFamily="Kalam">x</text>
      <text x={toSX(0) + 6} y={CHART_PAD - 14} className="text-[10px]" fill={INK} fontFamily="Kalam">y</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Meet the Functions                                         */
/* ------------------------------------------------------------------ */

function MeetFunctionsTab() {
  const [inputVal, setInputVal] = useState(0);
  const [autoSweep, setAutoSweep] = useState(false);
  const [highlightedFn, setHighlightedFn] = useState<string | null>(null);
  const [flippedFn, setFlippedFn] = useState<string | null>(null);
  const [sweepDir, setSweepDir] = useState(1);
  const [themeIdx, setThemeIdx] = useState(0);
  const [sparkKey, setSparkKey] = useState(0);
  const theme = THEMES[themeIdx];
  const prevSign = useRef(inputVal >= 0);

  useEffect(() => {
    const sign = inputVal >= 0;
    if (sign !== prevSign.current) {
      setSparkKey((k) => k + 1);
      playPop();
    }
    prevSign.current = sign;
  }, [inputVal]);

  // Auto sweep
  useEffect(() => {
    if (!autoSweep) return;
    const id = setInterval(() => {
      setInputVal((v) => {
        let next = v + 0.1 * sweepDir;
        if (next >= 5) { setSweepDir(-1); next = 5; }
        if (next <= -5) { setSweepDir(1); next = -5; }
        return next;
      });
    }, 40);
    return () => clearInterval(id);
  }, [autoSweep, sweepDir]);

  return (
    <div className="space-y-5">
      {/* Theme picker */}
      <div className="card-sketchy p-3 flex items-center justify-center gap-2">
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

      {/* Input control */}
      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        {/* Spark burst on threshold cross */}
        <div key={sparkKey} className="relative h-0">
          <svg viewBox="0 0 100 20" className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 pointer-events-none">
            {Array.from({ length: 6 }).map((_, k) => {
              const a = (k / 6) * Math.PI * 2;
              return (
                <line key={k}
                  x1={50} y1={10}
                  x2={50 + Math.cos(a) * 18} y2={10 + Math.sin(a) * 8}
                  stroke={theme.accent} strokeWidth={2} strokeLinecap="round"
                  className="spark" style={{ animationDelay: `${k * 0.04}s` }}
                />
              );
            })}
          </svg>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <label className="font-hand text-base font-bold flex items-center gap-2">
            Input value (x):
            <span className="px-3 py-0.5 rounded border-2 border-foreground bg-accent-yellow text-foreground">
              {inputVal.toFixed(1)}
            </span>
          </label>
          <button
            onClick={() => { playClick(); setAutoSweep((v) => !v); }}
            className={`px-3 py-1.5 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${
              autoSweep ? "bg-accent-coral text-white shadow-[2px_2px_0_#2b2a35]" : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            <Play className="w-3 h-3 inline mr-1" />
            {autoSweep ? "Stop sweep" : "Auto-sweep"}
          </button>
        </div>
        <input
          type="range" min={-5} max={5} step={0.1} value={inputVal}
          onChange={(e) => { playPop(); setInputVal(parseFloat(e.target.value)); setAutoSweep(false); }}
          className="w-full"
          style={{ accentColor: "#ff6b6b" }}
        />
        <div className="flex justify-between font-hand text-xs text-muted-foreground">
          <span>-5</span><span>0</span><span>5</span>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activationFns.map((af) => {
          const out = af.fn(inputVal);
          const isHigh = highlightedFn === af.name;
          const isFlipped = flippedFn === af.name;
          return (
            <div
              key={af.name}
              onMouseEnter={() => setHighlightedFn(af.name)}
              onMouseLeave={() => setHighlightedFn(null)}
              onClick={() => { playClick(); setFlippedFn(isFlipped ? null : af.name); }}
              className={`cursor-pointer transition-transform ${isHigh && !isFlipped ? "-translate-y-1" : ""}`}
              style={{ perspective: "1200px", minHeight: 290 }}
            >
              <div
                className="relative w-full h-full transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  minHeight: 290,
                }}
              >
                {/* Front */}
                <div
                  className="card-sketchy p-3 absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    boxShadow: isHigh ? `6px 6px 0 ${af.color}` : undefined,
                  }}
                >
                  <MiniChart af={af} inputVal={inputVal} showCursor highlighted={isHigh} />
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between font-hand text-xs">
                      <span className="text-muted-foreground">f({inputVal.toFixed(1)}) =</span>
                      <span className="font-bold text-base px-2 py-0.5 rounded border-2 border-foreground" style={{ background: af.color, color: "#fff" }}>
                        {out.toFixed(3)}
                      </span>
                    </div>
                    {/* Output bar */}
                    <div className="h-2 rounded-full border border-foreground/40 overflow-hidden bg-background">
                      <div
                        className="h-full transition-all duration-200"
                        style={{
                          width: `${Math.max(0, Math.min(1, (out - af.range[0]) / (af.range[1] - af.range[0]))) * 100}%`,
                          background: af.color,
                        }}
                      />
                    </div>
                    <div className="font-hand text-[11px] text-muted-foreground text-center italic">
                      {af.formula}
                    </div>
                    <div className="font-hand text-[10px] text-center text-muted-foreground/70 pt-0.5">
                      click to flip ↻
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div
                  className="card-sketchy p-4 absolute inset-0 flex flex-col"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: af.glow,
                  }}
                >
                  <div className="font-hand text-base font-bold flex items-center gap-2 mb-2" style={{ color: INK }}>
                    <span className="text-xl">{af.emoji}</span> {af.name}
                  </div>
                  <div className="font-hand text-[13px] leading-snug flex-1" style={{ color: INK }}>
                    {af.definition}
                  </div>
                  <div
                    className="font-hand text-[11px] text-center mt-2 px-2 py-1 rounded border-2 border-foreground"
                    style={{ background: "#fffdf5", color: INK }}
                  >
                    f(x) = {af.formula}
                  </div>
                  <div className="font-hand text-[10px] text-center mt-1 opacity-70" style={{ color: INK }}>
                    click to flip back ↺
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          🎚️ Drag the slider or hit Auto-sweep to watch every activation function react in real time. Hover a card to highlight its glow.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Why Not Linear?                                            */
/* ------------------------------------------------------------------ */

function WhyNotLinearTab() {
  const [numUnits, setNumUnits] = useState(3);
  const [showNonLinear, setShowNonLinear] = useState(false);
  const [drawKey, setDrawKey] = useState(0);

  // Trigger redraw animation when toggling or unit count changes
  useEffect(() => {
    setDrawKey((k) => k + 1);
  }, [showNonLinear, numUnits]);

  const W = 520, H = 240, pad = 44;
  const xMin = -5, xMax = 5;
  const toSX = (v: number) => pad + ((v - xMin) / (xMax - xMin)) * (W - 2 * pad);

  const linearOut = useCallback((x: number) => {
    let v = x;
    for (let i = 0; i < numUnits; i++) v = 0.7 * v + 0.2;
    return v;
  }, [numUnits]);

  const reluOut = useCallback((x: number) => {
    const shifts = [-2, -1, 0, 1, 2];
    let sum = 0;
    for (let i = 0; i < numUnits; i++) {
      const shifted = x - shifts[i % shifts.length];
      sum += relu(shifted) * (i % 2 === 0 ? 0.5 : -0.5);
    }
    return sum;
  }, [numUnits]);

  const computeFn = showNonLinear ? reluOut : linearOut;

  const yVals: number[] = [];
  for (let px = 0; px <= 120; px++) {
    yVals.push(computeFn(xMin + (px / 120) * (xMax - xMin)));
  }
  const yMinVal = Math.min(...yVals, -1);
  const yMaxVal = Math.max(...yVals, 1);
  const yRange = yMaxVal - yMinVal || 1;
  const toSY = (v: number) => H - pad - ((v - yMinVal) / yRange) * (H - 2 * pad);

  const points: string[] = [];
  for (let px = 0; px <= 120; px++) {
    const x = xMin + (px / 120) * (xMax - xMin);
    points.push(`${toSX(x).toFixed(1)},${toSY(computeFn(x)).toFixed(1)}`);
  }
  const pathD = "M " + points.join(" L ");

  const curveColor = showNonLinear ? "#4ecdc4" : "#6bb6ff";

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={() => { playClick(); setShowNonLinear(false); }}
          className={`px-5 py-2 rounded-lg font-hand text-base font-bold border-2 border-foreground transition-all ${
            !showNonLinear
              ? "bg-accent-sky text-white shadow-[3px_3px_0_#2b2a35]"
              : "bg-background hover:bg-accent-sky/30"
          }`}
        >
          Linear (boring)
        </button>
        <button
          onClick={() => { playClick(); setShowNonLinear(true); }}
          className={`px-5 py-2 rounded-lg font-hand text-base font-bold border-2 border-foreground transition-all ${
            showNonLinear
              ? "bg-accent-mint text-white shadow-[3px_3px_0_#2b2a35]"
              : "bg-background hover:bg-accent-mint/30"
          }`}
        >
          Non-linear (ReLU magic ✨)
        </button>
      </div>

      {/* Stacked units slider */}
      <div className="card-sketchy p-4" style={{ background: "#fff8e7" }}>
        <label className="font-hand text-base font-bold flex items-center justify-between mb-2">
          <span>Stacked units:</span>
          <span className="px-3 py-0.5 rounded border-2 border-foreground bg-accent-lav text-white">{numUnits}</span>
        </label>
        <input
          type="range" min={1} max={5} step={1} value={numUnits}
          onChange={(e) => { playPop(); setNumUnits(parseInt(e.target.value)); }}
          className="w-full"
          style={{ accentColor: curveColor }}
        />
        {/* Visual stack of units */}
        <div className="flex gap-2 justify-center mt-3">
          {Array.from({ length: numUnits }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center font-hand text-xs font-bold animate-fadeIn"
              style={{ background: curveColor, color: "#fff", boxShadow: "2px 2px 0 #2b2a35" }}
            >
              f{i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="card-sketchy p-3 notebook-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[560px] mx-auto">
          <defs>
            <pattern id="why-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={INK} strokeOpacity="0.06" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x={pad} y={pad - 10} width={W - 2 * pad} height={H - 2 * pad + 10} fill="#fffdf5" stroke={INK} strokeWidth={2} rx={4} />
          <rect x={pad} y={pad - 10} width={W - 2 * pad} height={H - 2 * pad + 10} fill="url(#why-grid)" />

          <line x1={toSX(0)} y1={pad - 10} x2={toSX(0)} y2={H - pad} stroke={INK} strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
          {yMinVal <= 0 && yMaxVal >= 0 && (
            <line x1={pad} y1={toSY(0)} x2={W - pad} y2={toSY(0)} stroke={INK} strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
          )}

          {/* Glow underlay */}
          <path d={pathD} fill="none" stroke={curveColor} strokeWidth={8} strokeLinecap="round" opacity={0.25} />
          {/* Animated draw curve */}
          <path
            key={drawKey}
            d={pathD}
            fill="none" stroke={curveColor} strokeWidth={3.5} strokeLinecap="round"
            className="draw-line"
          />

          <text x={W / 2} y={24} textAnchor="middle" className="text-[13px] font-bold" fill={INK} fontFamily="Kalam">
            {showNonLinear
              ? `${numUnits} ReLU units combined → complex curve! 🎢`
              : `${numUnits} linear functions stacked → still a line 😴`}
          </text>
        </svg>
      </div>

      <InfoBox variant="amber" title="Why Non-Linearity Matters">
        <span className="font-hand text-base">
          {showNonLinear
            ? "🎢 Stacking non-linear functions creates rich, piecewise curves. More units = more bends. THIS is the power of neural networks!"
            : "😴 No matter how many linear functions you stack, the result is still a straight line: a(b(cx + d) + e) + f is STILL linear. Without non-linearity, deep networks would be no better than a single neuron!"}
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Activation Playground                                      */
/* ------------------------------------------------------------------ */

type ActivationType = "sigmoid" | "relu" | "tanh" | "leakyRelu";
const ACT_MAP: Record<ActivationType, (x: number) => number> = {
  sigmoid, relu, tanh: tanh_, leakyRelu,
};
const ACT_COLORS: Record<ActivationType, string> = {
  sigmoid: "#6bb6ff",
  relu: "#4ecdc4",
  tanh: "#b18cf2",
  leakyRelu: "#ffb88c",
};
const ACT_EMOJI: Record<ActivationType, string> = {
  sigmoid: "〰️", relu: "📐", tanh: "🌊", leakyRelu: "💧",
};

function PlaygroundTab() {
  const [activation, setActivation] = useState<ActivationType>("sigmoid");
  const [signalSpeed, setSignalSpeed] = useState(1.4);
  const [showFlow, setShowFlow] = useState(true);
  const [hoverPt, setHoverPt] = useState<{ x1: number; x2: number; val: number } | null>(null);

  const w_h = [[0.8, -0.6], [-0.5, 0.9]];
  const b_h = [-0.2, 0.1];
  const w_o = [1.0, -0.8];
  const b_o = -0.1;

  const act = ACT_MAP[activation];

  const forward = useCallback(
    (x1: number, x2: number) => {
      const h0 = act(w_h[0][0] * x1 + w_h[0][1] * x2 + b_h[0]);
      const h1 = act(w_h[1][0] * x1 + w_h[1][1] * x2 + b_h[1]);
      return act(w_o[0] * h0 + w_o[1] * h1 + b_o);
    },
    [activation],
  );

  const plotSize = 280;
  const pad = 36;
  const gridRes = 36;
  const cellW = (plotSize - 2 * pad) / gridRes;

  const cells = useMemo(() => {
    const result: { x: number; y: number; val: number }[] = [];
    for (let i = 0; i < gridRes; i++) {
      for (let j = 0; j < gridRes; j++) {
        const x1 = -2 + (i / gridRes) * 4;
        const x2 = -2 + (j / gridRes) * 4;
        result.push({ x: i, y: j, val: forward(x1, x2) });
      }
    }
    return result;
  }, [forward]);

  // Color: coral → yellow → mint
  const colorForVal = (v: number) => {
    const t = Math.max(0, Math.min(1, v));
    if (t < 0.5) {
      const k = t / 0.5;
      const r = Math.round(255 + (255 - 255) * k);
      const g = Math.round(107 + (217 - 107) * k);
      const b = Math.round(107 + (61 - 107) * k);
      return `rgb(${r},${g},${b})`;
    } else {
      const k = (t - 0.5) / 0.5;
      const r = Math.round(255 + (78 - 255) * k);
      const g = Math.round(217 + (205 - 217) * k);
      const b = Math.round(61 + (196 - 61) * k);
      return `rgb(${r},${g},${b})`;
    }
  };

  const handlePlotClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * plotSize;
    const sy = ((e.clientY - rect.top) / rect.height) * plotSize;
    if (sx < pad || sx > plotSize - pad || sy < pad || sy > plotSize - pad) return;
    const x1 = ((sx - pad) / (plotSize - 2 * pad)) * 4 - 2;
    const x2 = 2 - ((sy - pad) / (plotSize - 2 * pad)) * 4;
    setHoverPt({ x1, x2, val: forward(x1, x2) });
    playPop();
  };

  return (
    <div className="space-y-5">
      {/* Activation selector */}
      <div className="flex gap-2 justify-center flex-wrap">
        {(["sigmoid", "relu", "tanh", "leakyRelu"] as ActivationType[]).map((a) => (
          <button
            key={a}
            onClick={() => { playClick(); setActivation(a); }}
            className={`px-4 py-1.5 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all capitalize ${
              activation === a ? "text-white shadow-[3px_3px_0_#2b2a35]" : "bg-background hover:bg-accent-yellow/30"
            }`}
            style={activation === a ? { backgroundColor: ACT_COLORS[a] } : {}}
          >
            {ACT_EMOJI[a]} {a}
          </button>
        ))}
      </div>

      {/* Customization */}
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-4">
        <label className="font-hand text-sm font-bold flex items-center gap-2">
          Flow speed:
          <input
            type="range" min={0.4} max={3} step={0.1} value={signalSpeed}
            onChange={(e) => setSignalSpeed(parseFloat(e.target.value))}
            className="w-24" style={{ accentColor: ACT_COLORS[activation] }}
          />
        </label>
        <label className="flex items-center gap-1.5 font-hand text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={showFlow} onChange={(e) => setShowFlow(e.target.checked)} />
          Show signal flow
        </label>
      </div>

      {/* Network diagram */}
      <div className="card-sketchy p-3 notebook-grid">
        <svg viewBox="0 0 440 160" className="w-full max-w-[460px] mx-auto">
          <defs>
            <radialGradient id="pg-grad">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor={ACT_COLORS[activation]} />
            </radialGradient>
          </defs>

          {/* Connections input → hidden */}
          {[45, 105].map((iy) =>
            [45, 105].map((hy) => (
              <g key={`ih-${iy}-${hy}`}>
                <line
                  x1={62} y1={iy} x2={188} y2={hy}
                  stroke={ACT_COLORS[activation]} strokeWidth={2.2} strokeLinecap="round"
                  className={showFlow ? "signal-flow" : ""}
                  style={showFlow ? { animationDuration: `${signalSpeed}s`, color: ACT_COLORS[activation] } : undefined}
                />
                {showFlow && (
                  <circle r={3.5} fill="#ffd93d" stroke={INK} strokeWidth={1}>
                    <animateMotion dur={`${signalSpeed}s`} repeatCount="indefinite" path={`M62,${iy} L188,${hy}`} />
                  </circle>
                )}
              </g>
            ))
          )}

          {/* Connections hidden → output */}
          {[45, 105].map((hy) => (
            <g key={`ho-${hy}`}>
              <line
                x1={216} y1={hy} x2={336} y2={75}
                stroke={ACT_COLORS[activation]} strokeWidth={2.2} strokeLinecap="round"
                className={showFlow ? "signal-flow" : ""}
                style={showFlow ? { animationDuration: `${signalSpeed}s`, color: ACT_COLORS[activation] } : undefined}
              />
              {showFlow && (
                <circle r={3.5} fill="#ffd93d" stroke={INK} strokeWidth={1}>
                  <animateMotion dur={`${signalSpeed}s`} repeatCount="indefinite" path={`M216,${hy} L336,75`} />
                </circle>
              )}
            </g>
          ))}

          {/* Input nodes */}
          {[45, 105].map((y, i) => (
            <g key={`in-${i}`}>
              <circle cx={45} cy={y} r={20} fill="#fffdf5" stroke={INK} strokeWidth={2.5} />
              <text x={45} y={y + 5} textAnchor="middle" className="text-[13px] font-bold" fill={INK} fontFamily="Kalam">x{i + 1}</text>
            </g>
          ))}

          {/* Hidden nodes */}
          {[45, 105].map((y, i) => (
            <g key={`h-${i}`}>
              <circle cx={202} cy={y} r={22} fill="url(#pg-grad)" stroke={INK} strokeWidth={2.5} className="pulse-glow" style={{ color: ACT_COLORS[activation] }} />
              <text x={202} y={y + 5} textAnchor="middle" className="text-[12px] font-bold" fill="#fff" fontFamily="Kalam">h{i + 1}</text>
            </g>
          ))}

          {/* Output node */}
          <circle cx={355} cy={75} r={24} fill="#fff8e7" stroke={INK} strokeWidth={2.5} />
          <text x={355} y={80} textAnchor="middle" className="text-[13px] font-bold" fill={INK} fontFamily="Kalam">out</text>

          {/* Layer labels */}
          <text x={45} y={20} textAnchor="middle" className="text-[10px] font-bold" fill={INK} fontFamily="Kalam">INPUT</text>
          <text x={202} y={20} textAnchor="middle" className="text-[10px] font-bold" fill={ACT_COLORS[activation]} fontFamily="Kalam">
            HIDDEN ({activation.toUpperCase()})
          </text>
          <text x={355} y={40} textAnchor="middle" className="text-[10px] font-bold" fill={INK} fontFamily="Kalam">OUTPUT</text>
        </svg>
      </div>

      {/* Decision boundary heatmap */}
      <div className="card-sketchy p-3 flex flex-col items-center">
        <div className="font-hand text-sm font-bold text-foreground mb-2">
          Decision boundary <span className="text-muted-foreground">(click to inspect a point)</span>
        </div>
        <svg viewBox={`0 0 ${plotSize} ${plotSize}`} className="w-72 h-72 cursor-crosshair" onClick={handlePlotClick}>
          {cells.map((c, i) => (
            <rect
              key={i}
              x={pad + c.x * cellW}
              y={pad + (gridRes - 1 - c.y) * cellW}
              width={cellW + 0.5}
              height={cellW + 0.5}
              fill={colorForVal(c.val)}
            />
          ))}
          <rect x={pad} y={pad} width={plotSize - 2 * pad} height={plotSize - 2 * pad} fill="none" stroke={INK} strokeWidth={2.5} rx={4} />

          {/* Hover point */}
          {hoverPt && (() => {
            const sx = pad + ((hoverPt.x1 + 2) / 4) * (plotSize - 2 * pad);
            const sy = pad + ((2 - hoverPt.x2) / 4) * (plotSize - 2 * pad);
            return (
              <g>
                <circle cx={sx} cy={sy} r={14} fill="none" stroke="#ffd93d" strokeWidth={3} className="pulse-glow" style={{ color: "#ffd93d" }} />
                <circle cx={sx} cy={sy} r={6} fill="#ffd93d" stroke={INK} strokeWidth={2} />
                <text x={sx} y={sy - 18} textAnchor="middle" className="text-[10px] font-bold" fill={INK} fontFamily="Kalam">
                  ({hoverPt.x1.toFixed(1)}, {hoverPt.x2.toFixed(1)}) → {hoverPt.val.toFixed(2)}
                </text>
              </g>
            );
          })()}

          <text x={plotSize / 2} y={plotSize - 10} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">x1</text>
          <text x={14} y={plotSize / 2} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam" transform={`rotate(-90 14 ${plotSize / 2})`}>x2</text>

          {/* Legend */}
          <g>
            <rect x={plotSize - 70} y={pad} width={12} height={12} fill={colorForVal(0)} stroke={INK} strokeWidth={1.5} />
            <text x={plotSize - 54} y={pad + 10} className="text-[10px] font-bold" fill={INK} fontFamily="Kalam">Low</text>
            <rect x={plotSize - 70} y={pad + 18} width={12} height={12} fill={colorForVal(1)} stroke={INK} strokeWidth={1.5} />
            <text x={plotSize - 54} y={pad + 28} className="text-[10px] font-bold" fill={INK} fontFamily="Kalam">High</text>
          </g>
        </svg>
        {hoverPt && (
          <button
            onClick={() => { setHoverPt(null); playClick(); }}
            className="mt-2 px-3 py-1 rounded font-hand text-xs font-bold border-2 border-foreground bg-background hover:bg-accent-yellow/30"
          >
            <RotateCcw className="w-3 h-3 inline mr-1" />
            Clear pin
          </button>
        )}
      </div>

      <InfoBox variant="indigo">
        <span className="font-hand text-base">
          🎨 The same network with different activations produces wildly different decision boundaries. Sigmoid → smooth gradients, ReLU → sharp edges, Tanh → balanced regions, LeakyReLU → similar to ReLU but with subtle slope on negatives. Click anywhere on the heatmap to inspect a value!
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "Why do neural networks need non-linear activation functions?",
    options: [
      "To make the code shorter",
      "Because linear functions stacked together are still linear",
      "To slow down computation",
      "They don't -- linear functions work fine",
    ],
    correctIndex: 1,
    explanation:
      "Stacking linear functions always gives another linear function. Non-linear activations let networks learn complex, curved decision boundaries.",
  },
  {
    question: "What is the output range of the Sigmoid function?",
    options: ["0 to infinity", "-1 to 1", "0 to 1", "-infinity to infinity"],
    correctIndex: 2,
    explanation: "Sigmoid squishes any input into a value between 0 and 1, making it useful for probabilities.",
  },
  {
    question: "What does ReLU do with negative inputs?",
    options: [
      "Outputs them unchanged",
      "Squares them",
      "Outputs zero",
      "Flips them to positive",
    ],
    correctIndex: 2,
    explanation:
      "ReLU (Rectified Linear Unit) outputs zero for negative inputs and passes positive inputs through unchanged: max(0, x).",
  },
  {
    question: "Which activation function acts like a simple on/off switch?",
    options: ["Sigmoid", "ReLU", "Tanh", "Step"],
    correctIndex: 3,
    explanation:
      "The Step function outputs 1 for positive inputs and 0 for negative inputs -- a binary on/off decision with no in-between.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function L19_ActivationFunctionsActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "meet",
        label: "Meet the Functions",
        icon: <Activity className="w-4 h-4" />,
        content: <MeetFunctionsTab />,
      },
      {
        id: "why-not-linear",
        label: "Why Not Linear?",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <WhyNotLinearTab />,
      },
      {
        id: "playground",
        label: "Activation Playground",
        icon: <Sliders className="w-4 h-4" />,
        content: <PlaygroundTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Activation Functions"
      level={6}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Build a full neural network with multiple layers!"
      story={
        <StorySection
          paragraphs={[
            "Aru was thinking about the perceptron they built in the last lesson.",
            "Aru: \"The perceptron just fires or doesn't fire. It's like a light switch -- on or off. But real brains are more nuanced, right?\"",
            "Byte: \"Exactly! What if we want a dimmer instead of a switch? That's where activation functions come in. They control HOW MUCH a neuron fires, not just whether it fires.\"",
            "Aru: \"So instead of just yes or no, a neuron can say 'a little bit' or 'a lot'?\"",
            "Byte: \"Precisely! And the choice of activation function changes how the whole network behaves. Let me show you the most popular ones!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Activation functions introduce non-linearity into neural networks. Without them, stacking layers would be pointless -- you'd just get another linear function. Common activations include Step (binary), Sigmoid (0 to 1), Tanh (-1 to 1), and ReLU (zero out negatives)."
        />
      }
    />
  );
}
