"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Cpu, GitBranch, AlertTriangle, Zap, RotateCcw, Play, Sparkles, Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

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
/*  Theme palette (matches sketchy notebook)                           */
/* ------------------------------------------------------------------ */

const THEMES = [
  { name: "Coral",   node: "#ff6b6b", glow: "#ff8a8a", accent: "#ffd93d" },
  { name: "Mint",    node: "#4ecdc4", glow: "#7ee0d8", accent: "#ffd93d" },
  { name: "Lavender",node: "#b18cf2", glow: "#c9adf7", accent: "#ffd93d" },
  { name: "Sky",     node: "#6bb6ff", glow: "#94caff", accent: "#ffd93d" },
  { name: "Sunset",  node: "#ffb88c", glow: "#ffd0b3", accent: "#ff6b6b" },
];

const INK = "#2b2a35";

/* ------------------------------------------------------------------ */
/*  Tab 1  Build a Perceptron                                         */
/* ------------------------------------------------------------------ */

function BuildPerceptronTab() {
  const [weights, setWeights] = useState([1.0, 0.5, -0.5]);
  const [bias, setBias] = useState(0);
  const [threshold, setThreshold] = useState(0.5);
  const [inputSet, setInputSet] = useState(0);
  const [themeIdx, setThemeIdx] = useState(0);
  const [speed, setSpeed] = useState(1.2); // seconds per signal cycle
  const [showLabels, setShowLabels] = useState(true);
  const [autoFire, setAutoFire] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [customInputs, setCustomInputs] = useState<number[] | null>(null);

  const theme = THEMES[themeIdx];

  const inputSets = useMemo(
    () => [
      [1, 0, 1],
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [],
  );

  const inputs = customInputs ?? inputSets[inputSet];
  const weightedProducts = inputs.map((inp, i) => inp * weights[i]);
  const weightedSum = weightedProducts.reduce((a, b) => a + b, 0) + bias;
  const fires = weightedSum >= threshold;

  // re-trigger burst when fires changes to true
  const prevFires = useRef(fires);
  useEffect(() => {
    if (fires && !prevFires.current) {
      setBurstKey((k) => k + 1);
      playPop();
    }
    prevFires.current = fires;
  }, [fires]);

  // auto-cycle inputs
  useEffect(() => {
    if (!autoFire) return;
    const id = setInterval(() => {
      setCustomInputs(null);
      setInputSet((i) => (i + 1) % inputSets.length);
    }, 1600);
    return () => clearInterval(id);
  }, [autoFire, inputSets.length]);

  const handleWeightChange = useCallback((idx: number, val: number) => {
    playPop();
    setWeights((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }, []);

  const toggleInputBit = useCallback((idx: number) => {
    playClick();
    setCustomInputs((prev) => {
      const base = prev ?? inputs.slice();
      const next = base.slice();
      next[idx] = next[idx] === 1 ? 0 : 1;
      return next;
    });
  }, [inputs]);

  // SVG geometry
  const SUM_X = 340, SUM_Y = 130, OUT_X = 480;

  return (
    <div className="space-y-5">
      {/* ----- Customization toolbar ----- */}
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

        <div className="flex items-center gap-2">
          <span className="font-hand text-sm font-bold">Speed:</span>
          <input
            type="range" min={0.4} max={2.5} step={0.1} value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-24 accent-accent-coral"
          />
        </div>

        <label className="flex items-center gap-1.5 font-hand text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
          Labels
        </label>

        <button
          onClick={() => { playClick(); setAutoFire((v) => !v); }}
          className={`px-3 py-1 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${autoFire ? "bg-accent-coral text-white shadow-[2px_2px_0_#2b2a35]" : "bg-background"}`}
        >
          {autoFire ? "■ Stop" : "▶ Auto"}
        </button>
      </div>

      {/* ----- Preset selector ----- */}
      <div className="flex flex-wrap gap-2 justify-center">
        {inputSets.map((s, i) => (
          <button
            key={i}
            onClick={() => { playClick(); setInputSet(i); setCustomInputs(null); }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold transition-all border-2 border-foreground ${
              inputSet === i && !customInputs
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            [{s.join(", ")}]
          </button>
        ))}
        {customInputs && (
          <span className="px-3 py-1.5 rounded-lg font-hand text-xs font-bold bg-accent-mint border-2 border-foreground">
            custom: [{customInputs.join(", ")}]
          </span>
        )}
        <span className="text-[11px] text-muted-foreground font-hand self-center ml-1">(click input nodes to toggle)</span>
      </div>

      {/* ----- The perceptron diagram ----- */}
      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox="0 0 560 280" className="w-full max-w-[600px] mx-auto">
          <defs>
            <marker id="ph-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
              <path d="M0,0 L10,4 L0,8 Z" fill={INK} />
            </marker>
            <radialGradient id="node-grad" cx="35%" cy="30%">
              <stop offset="0%" stopColor={theme.glow} />
              <stop offset="100%" stopColor={theme.node} />
            </radialGradient>
            <radialGradient id="fire-grad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#fff3a0" />
              <stop offset="60%" stopColor={theme.accent} />
              <stop offset="100%" stopColor={theme.node} />
            </radialGradient>
          </defs>

          {/* Connection lines + flowing signal pulses */}
          {inputs.map((inp, i) => {
            const y = 60 + i * 80;
            const active = inp === 1;
            return (
              <g key={`line-${i}`}>
                <line
                  x1={88} y1={y} x2={SUM_X - 36} y2={SUM_Y}
                  stroke={active ? theme.node : "#cbd5e1"}
                  strokeWidth={active ? 3 : 1.8}
                  strokeLinecap="round"
                  className={active ? "signal-flow" : ""}
                  style={active ? { animationDuration: `${speed}s`, color: theme.node } : undefined}
                  markerEnd="url(#ph-arrow)"
                />
                {/* Traveling pulse dot */}
                {active && (
                  <circle r={4.5} fill={theme.accent} stroke={INK} strokeWidth={1}>
                    <animateMotion
                      dur={`${speed}s`}
                      repeatCount="indefinite"
                      path={`M88,${y} L${SUM_X - 36},${SUM_Y}`}
                    />
                  </circle>
                )}
                {showLabels && (
                  <text
                    x={88 + ((SUM_X - 36 - 88) * 0.55)}
                    y={y + (SUM_Y - y) * 0.55 - 8}
                    textAnchor="middle"
                    className="text-[11px] font-bold"
                    fill={INK}
                    fontFamily="Kalam"
                  >
                    w={weights[i].toFixed(1)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Input nodes (clickable) */}
          {inputs.map((inp, i) => {
            const y = 60 + i * 80;
            return (
              <g key={`in-${i}`} onClick={() => toggleInputBit(i)} style={{ cursor: "pointer" }}>
                <circle
                  cx={60} cy={y} r={28}
                  fill={inp === 1 ? "url(#node-grad)" : "#f3efe6"}
                  stroke={INK} strokeWidth={2.5}
                  className={inp === 1 ? "pulse-glow" : ""}
                  style={inp === 1 ? { color: theme.node } : undefined}
                />
                <text
                  x={60} y={y + 6} textAnchor="middle"
                  className="text-[18px] font-bold"
                  fill={inp === 1 ? "#fff" : INK}
                  fontFamily="Kalam"
                >
                  {inp}
                </text>
                {showLabels && (
                  <text x={60} y={y - 34} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">
                    x{i + 1}
                  </text>
                )}
              </g>
            );
          })}

          {/* Summation node */}
          <g>
            <circle cx={SUM_X} cy={SUM_Y} r={42} fill="#fff" stroke={INK} strokeWidth={2.5} />
            <circle cx={SUM_X} cy={SUM_Y} r={42} fill="none" stroke={theme.node} strokeWidth={2} strokeDasharray="3 4" className="wobble" opacity={0.6} />
            <text x={SUM_X} y={SUM_Y - 8} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">Σ + b</text>
            <text x={SUM_X} y={SUM_Y + 12} textAnchor="middle" fill={theme.node} fontFamily="Kalam" className="text-[16px] font-bold">
              {weightedSum.toFixed(2)}
            </text>
          </g>

          {/* Activation bar (visual threshold check) */}
          <g transform={`translate(${SUM_X + 50}, ${SUM_Y - 40})`}>
            <rect x={0} y={0} width={14} height={80} fill="#f3efe6" stroke={INK} strokeWidth={2} rx={3} />
            {/* Threshold marker */}
            <line
              x1={-4} x2={18}
              y1={80 - Math.max(0, Math.min(1, (threshold + 2) / 5)) * 80}
              y2={80 - Math.max(0, Math.min(1, (threshold + 2) / 5)) * 80}
              stroke={INK} strokeWidth={2.5} strokeDasharray="2 2"
            />
            {/* Sum level */}
            <rect
              x={2} width={10}
              y={80 - Math.max(0, Math.min(1, (weightedSum + 2) / 5)) * 80 + 1}
              height={Math.max(0, Math.min(80, Math.max(0, Math.min(1, (weightedSum + 2) / 5)) * 80 - 1))}
              fill={fires ? theme.node : "#94a3b8"}
              className={fires ? "pulse-glow" : ""}
              style={fires ? { color: theme.node } : undefined}
            />
          </g>

          {/* Arrow to output */}
          <line x1={SUM_X + 80} y1={SUM_Y} x2={OUT_X - 32} y2={SUM_Y} stroke={INK} strokeWidth={2.5} markerEnd="url(#ph-arrow)" />

          {/* Output node + fire bursts */}
          <g>
            {fires && (
              <>
                <circle cx={OUT_X} cy={SUM_Y} r={28} fill="none" stroke={theme.accent} strokeWidth={3} className="fire-ring" />
                <circle cx={OUT_X} cy={SUM_Y} r={28} fill="none" stroke={theme.node} strokeWidth={2} className="fire-ring" style={{ animationDelay: "0.4s" }} />
              </>
            )}
            <circle
              cx={OUT_X} cy={SUM_Y} r={32}
              fill={fires ? "url(#fire-grad)" : "#f3efe6"}
              stroke={INK} strokeWidth={2.5}
              className={fires ? "pulse-glow" : ""}
              style={fires ? { color: theme.accent } : undefined}
            />
            <text
              x={OUT_X} y={SUM_Y + 7} textAnchor="middle"
              className="text-[22px] font-bold"
              fill={fires ? INK : "#94a3b8"}
              fontFamily="Kalam"
            >
              {fires ? "1" : "0"}
            </text>
            {showLabels && (
              <text x={OUT_X} y={SUM_Y - 42} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[11px] font-bold">
                Output
              </text>
            )}

            {/* Spark particles on fire */}
            {fires && (
              <g key={burstKey}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const x2 = OUT_X + Math.cos(angle) * 50;
                  const y2 = SUM_Y + Math.sin(angle) * 50;
                  return (
                    <line
                      key={i}
                      x1={OUT_X} y1={SUM_Y} x2={x2} y2={y2}
                      stroke={theme.accent} strokeWidth={2.5} strokeLinecap="round"
                      className="spark"
                      style={{ animationDelay: `${i * 0.04}s` }}
                    />
                  );
                })}
              </g>
            )}
          </g>

          {/* Threshold caption */}
          {showLabels && (
            <text x={SUM_X + 57} y={SUM_Y + 60} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[10px]">
              θ = {threshold.toFixed(1)}
            </text>
          )}
        </svg>
      </div>

      {/* ----- Calculation breakdown ----- */}
      <div className="card-sketchy p-4 font-hand text-sm" style={{ background: "#fff8e7" }}>
        <div className="flex flex-wrap items-center gap-1.5">
          {inputs.map((inp, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <span
                className="inline-block w-6 h-6 rounded-full border-2 border-foreground text-center text-xs font-bold leading-[20px]"
                style={{ background: inp === 1 ? theme.node : "#f3efe6", color: inp === 1 ? "#fff" : INK }}
              >
                {inp}
              </span>
              <span>×</span>
              <span className="font-bold">{weights[i].toFixed(1)}</span>
              <span className="text-muted-foreground">=</span>
              <span className="font-bold" style={{ color: theme.node }}>{weightedProducts[i].toFixed(2)}</span>
              {i < inputs.length - 1 && <span className="text-muted-foreground">+</span>}
            </span>
          ))}
          <span className="text-muted-foreground">+ bias({bias.toFixed(1)})</span>
          <span className="text-muted-foreground">=</span>
          <span className="marker-highlight-yellow font-bold">{weightedSum.toFixed(2)}</span>
          <span className="text-muted-foreground">{weightedSum >= threshold ? "≥" : "<"}</span>
          <span className="font-bold">{threshold.toFixed(1)}</span>
          <span className="text-muted-foreground">→</span>
          <span className={`font-bold text-base ${fires ? "marker-highlight-mint" : "marker-highlight-coral"}`}>
            {fires ? "🔥 FIRES!" : "💤 silent"}
          </span>
        </div>
      </div>

      {/* ----- Sliders ----- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {weights.map((w, i) => (
          <div key={i} className="card-sketchy p-3 space-y-1.5">
            <label className="font-hand text-sm font-bold text-foreground flex items-center justify-between">
              <span>Weight {i + 1}</span>
              <span className="px-2 py-0.5 rounded border-2 border-foreground text-xs" style={{ background: theme.node, color: "#fff" }}>
                {w.toFixed(1)}
              </span>
            </label>
            <input
              type="range" min={-2} max={2} step={0.1} value={w}
              onChange={(e) => handleWeightChange(i, parseFloat(e.target.value))}
              className="w-full"
              style={{ accentColor: theme.node }}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="card-sketchy p-3 space-y-1.5">
          <label className="font-hand text-sm font-bold flex items-center justify-between">
            <span>Bias (b)</span>
            <span className="px-2 py-0.5 rounded border-2 border-foreground text-xs bg-accent-lav text-white">{bias.toFixed(1)}</span>
          </label>
          <input
            type="range" min={-2} max={2} step={0.1} value={bias}
            onChange={(e) => { playPop(); setBias(parseFloat(e.target.value)); }}
            className="w-full" style={{ accentColor: "#b18cf2" }}
          />
        </div>
        <div className="card-sketchy p-3 space-y-1.5">
          <label className="font-hand text-sm font-bold flex items-center justify-between">
            <span>Threshold (θ)</span>
            <span className="px-2 py-0.5 rounded border-2 border-foreground text-xs bg-accent-coral text-white">{threshold.toFixed(1)}</span>
          </label>
          <input
            type="range" min={-2} max={3} step={0.1} value={threshold}
            onChange={(e) => { playPop(); setThreshold(parseFloat(e.target.value)); }}
            className="w-full" style={{ accentColor: "#ff6b6b" }}
          />
        </div>
      </div>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          🧠 Click input circles to flip them, change the theme, slow the signals down, or hit Auto to watch it cycle. Watch the pulses race down each wire  that's the signal flowing into the neuron!
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  AND / OR Gates                                             */
/* ------------------------------------------------------------------ */

const TRUTH_TABLE: [number, number][] = [[0, 0], [0, 1], [1, 0], [1, 1]];
const AND_TARGETS = [0, 0, 0, 1];
const OR_TARGETS = [0, 1, 1, 1];

function GatesTab() {
  const [gate, setGate] = useState<"AND" | "OR">("AND");
  const [w1, setW1] = useState(0.1);
  const [w2, setW2] = useState(0.1);
  const [b, setB] = useState(-0.1);
  const [training, setTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [lr, setLr] = useState(0.15);
  const [trainSpeed, setTrainSpeed] = useState(160);
  const [history, setHistory] = useState<{ w1: number; w2: number; b: number }[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targets = gate === "AND" ? AND_TARGETS : OR_TARGETS;

  const predict = useCallback(
    (x1: number, x2: number, cw1: number, cw2: number, cb: number) =>
      x1 * cw1 + x2 * cw2 + cb >= 0.5 ? 1 : 0,
    [],
  );

  const predictions = TRUTH_TABLE.map(([x1, x2]) => predict(x1, x2, w1, w2, b));
  const allCorrect = predictions.every((p, i) => p === targets[i]);
  const accuracy = predictions.filter((p, i) => p === targets[i]).length / TRUTH_TABLE.length;

  const trainStep = useCallback(() => {
    setW1((pw1) => {
      let nw1 = pw1;
      let nw2 = w2;
      let nb = b;
      for (let i = 0; i < TRUTH_TABLE.length; i++) {
        const [x1, x2] = TRUTH_TABLE[i];
        const pred = (x1 * nw1 + x2 * nw2 + nb >= 0.5) ? 1 : 0;
        const err = targets[i] - pred;
        nw1 += lr * err * x1;
        nw2 += lr * err * x2;
        nb += lr * err;
      }
      setW2(nw2);
      setB(nb);
      setEpoch((e) => e + 1);
      setHistory((h) => [...h.slice(-12), { w1: nw1, w2: nw2, b: nb }]);
      return nw1;
    });
  }, [w2, b, targets, lr]);

  const handleTrain = useCallback(() => {
    playClick();
    setTraining(true);
    let step = 0;
    const tick = () => {
      if (step >= 25) {
        setTraining(false);
        playSuccess();
        return;
      }
      trainStep();
      step++;
      timerRef.current = setTimeout(tick, trainSpeed);
    };
    tick();
  }, [trainStep, trainSpeed]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTraining(false);
    setW1(0.1);
    setW2(0.1);
    setB(-0.1);
    setEpoch(0);
    setHistory([]);
    playClick();
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Decision boundary
  const plotSize = 240;
  const pad = 36;
  const toX = (v: number) => pad + v * (plotSize - 2 * pad);
  const toY = (v: number) => plotSize - pad - v * (plotSize - 2 * pad);

  const lineY = (x: number, cw1: number, cw2: number, cb: number) =>
    Math.abs(cw2) > 0.001 ? (0.5 - cb - cw1 * x) / cw2 : 0;

  return (
    <div className="space-y-5">
      {/* Gate selector */}
      <div className="flex gap-2 justify-center">
        {(["AND", "OR"] as const).map((g) => (
          <button
            key={g}
            onClick={() => { playClick(); setGate(g); handleReset(); }}
            className={`px-5 py-2 rounded-lg font-hand text-base font-bold border-2 border-foreground transition-all ${
              gate === g
                ? "bg-accent-coral text-white shadow-[3px_3px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {g} Gate
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* Truth table */}
        <div className="card-sketchy overflow-hidden">
          <table className="w-full font-hand text-sm">
            <thead>
              <tr className="bg-accent-yellow border-b-2 border-foreground">
                <th className="px-3 py-2">x1</th>
                <th className="px-3 py-2">x2</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Predicted</th>
              </tr>
            </thead>
            <tbody>
              {TRUTH_TABLE.map(([x1, x2], i) => {
                const ok = predictions[i] === targets[i];
                return (
                  <tr key={i} className="border-t-2 border-dashed border-foreground/30">
                    <td className="px-3 py-2 text-center font-bold">{x1}</td>
                    <td className="px-3 py-2 text-center font-bold">{x2}</td>
                    <td className="px-3 py-2 text-center font-bold">{targets[i]}</td>
                    <td className={`px-3 py-2 text-center font-bold ${ok ? "text-emerald-600" : "text-red-500"}`}>
                      {predictions[i]} {ok ? "✓" : "✗"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 2D plot with animated boundary */}
        <div className="card-sketchy p-3 notebook-grid">
          <svg viewBox={`0 0 ${plotSize} ${plotSize}`} className="w-full max-w-[260px] mx-auto">
            <rect x={pad} y={pad} width={plotSize - 2 * pad} height={plotSize - 2 * pad} fill="#fffdf5" stroke={INK} strokeWidth={2} rx={4} />

            {/* Ghost trail of past boundaries */}
            {history.map((h, i) => (
              <line
                key={i}
                x1={toX(0)} y1={toY(lineY(0, h.w1, h.w2, h.b))}
                x2={toX(1)} y2={toY(lineY(1, h.w1, h.w2, h.b))}
                stroke="#b18cf2" strokeWidth={1.5}
                opacity={(i + 1) / (history.length + 4)}
              />
            ))}

            {/* Current decision boundary */}
            {Math.abs(w2) > 0.01 && (
              <line
                x1={toX(0)} y1={toY(lineY(0, w1, w2, b))}
                x2={toX(1)} y2={toY(lineY(1, w1, w2, b))}
                stroke={INK} strokeWidth={3} strokeLinecap="round" strokeDasharray="6 4"
                className="signal-flow"
              />
            )}

            {/* Data points with pulse if correct */}
            {TRUTH_TABLE.map(([x1, x2], i) => {
              const isOne = targets[i] === 1;
              const ok = predictions[i] === targets[i];
              return (
                <g key={i}>
                  {ok && (
                    <circle cx={toX(x1)} cy={toY(x2)} r={14} fill="none" stroke={isOne ? "#4ecdc4" : "#ff6b6b"} strokeWidth={2} opacity={0.4} className="pulse-glow" style={{ color: isOne ? "#4ecdc4" : "#ff6b6b" }} />
                  )}
                  <circle
                    cx={toX(x1)} cy={toY(x2)} r={11}
                    fill={isOne ? "#4ecdc4" : "#ff6b6b"}
                    stroke={INK} strokeWidth={2.5}
                  />
                  <text x={toX(x1)} y={toY(x2) + 4} textAnchor="middle" className="text-[10px] font-bold" fill="#fff" fontFamily="Kalam">
                    {targets[i]}
                  </text>
                </g>
              );
            })}

            <text x={plotSize / 2} y={plotSize - 8} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">x1</text>
            <text x={12} y={plotSize / 2} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam" transform={`rotate(-90 12 ${plotSize / 2})`}>x2</text>
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        <div className="flex flex-wrap gap-3 justify-center font-hand text-sm">
          <span className="px-2 py-1 rounded border-2 border-foreground bg-background">w1 = <b>{w1.toFixed(2)}</b></span>
          <span className="px-2 py-1 rounded border-2 border-foreground bg-background">w2 = <b>{w2.toFixed(2)}</b></span>
          <span className="px-2 py-1 rounded border-2 border-foreground bg-background">b = <b>{b.toFixed(2)}</b></span>
          <span className="px-2 py-1 rounded border-2 border-foreground bg-accent-lav text-white">epoch <b>{epoch}</b></span>
        </div>
        {/* Animated accuracy bar */}
        <div>
          <div className="flex justify-between font-hand text-xs font-bold mb-1">
            <span>Accuracy</span>
            <span>{Math.round(accuracy * 100)}%</span>
          </div>
          <div className="h-4 rounded-full border-2 border-foreground bg-background overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${accuracy * 100}%`,
                background: accuracy === 1 ? "#4ecdc4" : "#ffd93d",
              }}
            />
          </div>
        </div>
        {allCorrect && (
          <div className="text-center font-hand text-base font-bold marker-highlight-mint inline-block mx-auto">
            🎉 All correct! Network learned {gate}!
          </div>
        )}
      </div>

      {/* Training controls */}
      <div className="card-sketchy p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-hand text-xs font-bold flex justify-between">
            <span>Learning Rate</span><span>{lr.toFixed(2)}</span>
          </label>
          <input type="range" min={0.05} max={0.5} step={0.01} value={lr} onChange={(e) => setLr(parseFloat(e.target.value))} className="w-full" style={{ accentColor: "#4ecdc4" }} />
        </div>
        <div>
          <label className="font-hand text-xs font-bold flex justify-between">
            <span>Train Speed</span><span>{trainSpeed}ms</span>
          </label>
          <input type="range" min={40} max={400} step={10} value={trainSpeed} onChange={(e) => setTrainSpeed(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#b18cf2" }} />
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={handleTrain} disabled={training} className="btn-sketchy text-sm disabled:opacity-50">
          <Play className="w-4 h-4" />
          {training ? "Training…" : "Train"}
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <InfoBox variant="green">
        <span className="font-hand text-base">
          📈 Watch the dashed line sweep across the plot as the perceptron learns! The faded purple lines show its previous attempts. Try cranking the learning rate higher to see it overshoot.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  The XOR Problem                                            */
/* ------------------------------------------------------------------ */

const XOR_TARGETS = [0, 1, 1, 0];

function XORTab() {
  const [w1, setW1] = useState(0.5);
  const [w2, setW2] = useState(0.5);
  const [b, setB] = useState(0.0);
  const [epoch, setEpoch] = useState(0);
  const [training, setTraining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState<{ w1: number; w2: number; b: number }[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const predict = useCallback(
    (x1: number, x2: number) => (x1 * w1 + x2 * w2 + b >= 0.5 ? 1 : 0),
    [w1, w2, b],
  );

  const predictions = TRUTH_TABLE.map(([x1, x2]) => predict(x1, x2));
  const allCorrect = predictions.every((p, i) => p === XOR_TARGETS[i]);
  const accuracy = predictions.filter((p, i) => p === XOR_TARGETS[i]).length / TRUTH_TABLE.length;

  const handleTrain = useCallback(() => {
    playClick();
    setTraining(true);
    setMessage(null);
    setAttempts([]);
    let cw1 = w1, cw2 = w2, cb = b;
    let step = 0;
    const tick = () => {
      if (step >= 35) {
        setTraining(false);
        setShake(true);
        setTimeout(() => setShake(false), 1200);
        playError();
        setMessage("💥 The perceptron could NOT learn XOR! No single straight line can separate diagonal corners. We need MORE layers!");
        return;
      }
      for (let i = 0; i < TRUTH_TABLE.length; i++) {
        const [x1, x2] = TRUTH_TABLE[i];
        const pred = (x1 * cw1 + x2 * cw2 + cb >= 0.5) ? 1 : 0;
        const err = XOR_TARGETS[i] - pred;
        cw1 += 0.15 * err * x1;
        cw2 += 0.15 * err * x2;
        cb += 0.15 * err;
      }
      setW1(cw1);
      setW2(cw2);
      setB(cb);
      setEpoch((e) => e + 1);
      setAttempts((a) => [...a.slice(-10), { w1: cw1, w2: cw2, b: cb }]);
      step++;
      timerRef.current = setTimeout(tick, 110);
    };
    tick();
  }, [w1, w2, b]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTraining(false);
    setW1(0.5); setW2(0.5); setB(0.0);
    setEpoch(0); setMessage(null); setAttempts([]); setShake(false);
    playClick();
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const plotSize = 260;
  const pad = 36;
  const toX = (v: number) => pad + v * (plotSize - 2 * pad);
  const toY = (v: number) => plotSize - pad - v * (plotSize - 2 * pad);
  const lineY = (x: number, cw1: number, cw2: number, cb: number) =>
    Math.abs(cw2) > 0.001 ? (0.5 - cb - cw1 * x) / cw2 : 0;

  return (
    <div className="space-y-5">
      <div className="text-center font-hand text-2xl font-bold text-foreground">
        XOR Gate: <span className="marker-highlight-coral">The Impossible Mission</span>
      </div>

      <div className={`card-sketchy p-4 notebook-grid ${shake ? "shake-x" : ""}`}>
        <svg viewBox={`0 0 ${plotSize} ${plotSize}`} className="w-full max-w-[320px] mx-auto">
          <defs>
            <pattern id="xor-hatch" patternUnits="userSpaceOnUse" width="6" height="6">
              <path d="M0,6 L6,0" stroke="#ff6b6b" strokeWidth={1} opacity={0.2} />
            </pattern>
          </defs>
          <rect x={pad} y={pad} width={plotSize - 2 * pad} height={plotSize - 2 * pad} fill="#fffdf5" stroke={INK} strokeWidth={2} rx={4} />
          <rect x={pad} y={pad} width={plotSize - 2 * pad} height={plotSize - 2 * pad} fill="url(#xor-hatch)" />

          {/* Ghost trail of failed attempts */}
          {attempts.map((a, i) => (
            <line
              key={i}
              x1={toX(0)} y1={toY(lineY(0, a.w1, a.w2, a.b))}
              x2={toX(1)} y2={toY(lineY(1, a.w1, a.w2, a.b))}
              stroke="#ff6b6b" strokeWidth={1.5}
              opacity={(i + 1) / (attempts.length + 6)}
            />
          ))}

          {/* Current line */}
          {Math.abs(w2) > 0.01 && (
            <line
              x1={toX(0)} y1={toY(lineY(0, w1, w2, b))}
              x2={toX(1)} y2={toY(lineY(1, w1, w2, b))}
              stroke="#ff6b6b" strokeWidth={3.5} strokeLinecap="round" strokeDasharray="8 4"
              className={training ? "signal-flow" : ""}
            />
          )}

          {/* Data points */}
          {TRUTH_TABLE.map(([x1, x2], i) => {
            const isOne = XOR_TARGETS[i] === 1;
            return (
              <g key={i}>
                <circle cx={toX(x1)} cy={toY(x2)} r={15} fill="none" stroke={isOne ? "#4ecdc4" : "#b18cf2"} strokeWidth={2} opacity={0.4} className="pulse-glow" style={{ color: isOne ? "#4ecdc4" : "#b18cf2" }} />
                <circle
                  cx={toX(x1)} cy={toY(x2)} r={13}
                  fill={isOne ? "#4ecdc4" : "#b18cf2"}
                  stroke={INK} strokeWidth={2.5}
                />
                <text x={toX(x1)} y={toY(x2) + 5} textAnchor="middle" className="text-[12px] font-bold" fill="#fff" fontFamily="Kalam">
                  {XOR_TARGETS[i]}
                </text>
              </g>
            );
          })}

          <text x={plotSize / 2} y={plotSize - 8} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">x1</text>
          <text x={12} y={plotSize / 2} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam" transform={`rotate(-90 12 ${plotSize / 2})`}>x2</text>
        </svg>
      </div>

      {/* Truth table */}
      <div className="card-sketchy overflow-hidden max-w-md mx-auto">
        <table className="w-full font-hand text-sm">
          <thead>
            <tr className="bg-accent-coral/40 border-b-2 border-foreground">
              <th className="px-3 py-2">x1</th>
              <th className="px-3 py-2">x2</th>
              <th className="px-3 py-2">XOR</th>
              <th className="px-3 py-2">Predicted</th>
            </tr>
          </thead>
          <tbody>
            {TRUTH_TABLE.map(([x1, x2], i) => {
              const ok = predictions[i] === XOR_TARGETS[i];
              return (
                <tr key={i} className="border-t-2 border-dashed border-foreground/30">
                  <td className="px-3 py-2 text-center font-bold">{x1}</td>
                  <td className="px-3 py-2 text-center font-bold">{x2}</td>
                  <td className="px-3 py-2 text-center font-bold">{XOR_TARGETS[i]}</td>
                  <td className={`px-3 py-2 text-center font-bold ${ok ? "text-emerald-600" : "text-red-500"}`}>
                    {predictions[i]} {ok ? "✓" : "✗"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card-sketchy p-3 max-w-md mx-auto" style={{ background: "#fff8e7" }}>
        <div className="flex flex-wrap gap-2 justify-center font-hand text-xs mb-2">
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">w1=<b>{w1.toFixed(2)}</b></span>
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">w2=<b>{w2.toFixed(2)}</b></span>
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">b=<b>{b.toFixed(2)}</b></span>
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-lav text-white">epoch <b>{epoch}</b></span>
        </div>
        <div className="h-3 rounded-full border-2 border-foreground bg-background overflow-hidden">
          <div className="h-full transition-all duration-300" style={{ width: `${accuracy * 100}%`, background: accuracy === 1 ? "#4ecdc4" : "#ff6b6b" }} />
        </div>
        <div className="text-center font-hand text-xs mt-1">{Math.round(accuracy * 100)}% accuracy</div>
        {allCorrect && <div className="text-center marker-highlight-mint font-bold mt-1">Solved! 🎉</div>}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={handleTrain} disabled={training} className="btn-sketchy text-sm disabled:opacity-50" style={{ background: "#ff6b6b", color: "#fff" }}>
          <Sparkles className="w-4 h-4" />
          {training ? "Trying…" : "Try to Train XOR"}
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {message && (
        <div className="card-sketchy p-4 text-center font-hand text-base font-bold animate-fadeIn" style={{ background: "#ffe5e5", color: "#b91c1c" }}>
          <Zap className="w-5 h-5 inline-block mr-1" />
          {message}
        </div>
      )}

      <InfoBox variant="amber" title="The XOR Problem">
        <span className="font-hand text-base">
          A single perceptron draws ONE straight line. But XOR needs to separate DIAGONAL corners  no single line can do that! Watch the red ghost lines pile up as it tries (and fails). This is exactly why we need neural networks with hidden layers. 🧠
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
    question: "What does a perceptron do with its inputs?",
    options: [
      "Adds them without modification",
      "Multiplies each by a weight, sums them, and checks a threshold",
      "Picks the largest input",
      "Randomly decides an output",
    ],
    correctIndex: 1,
    explanation:
      "A perceptron multiplies each input by its weight, sums the products plus a bias, and fires if the total meets the threshold.",
  },
  {
    question: "Which logic gate can a single perceptron NOT learn?",
    options: ["AND", "OR", "XOR", "NOT"],
    correctIndex: 2,
    explanation:
      "XOR is not linearly separable -- no single straight line can separate the 1s from the 0s, so a single perceptron fails.",
  },
  {
    question: "What is the role of the bias in a perceptron?",
    options: [
      "It makes the perceptron run faster",
      "It shifts the decision boundary",
      "It removes noise from inputs",
      "It doubles the weights",
    ],
    correctIndex: 1,
    explanation:
      "The bias shifts the decision boundary, allowing the perceptron to fire even when all inputs are zero.",
  },
  {
    question: "What does the decision boundary of a single perceptron look like?",
    options: [
      "A curved line",
      "A straight line",
      "A circle",
      "A zigzag",
    ],
    correctIndex: 1,
    explanation:
      "A single perceptron produces a linear decision boundary -- a straight line (or hyperplane in higher dimensions).",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function L18_PerceptronActivity() {
  const rngRef = useRef(mulberry32(18));
  void rngRef.current;

  const tabs = useMemo(
    () => [
      {
        id: "build",
        label: "Build a Perceptron",
        icon: <Cpu className="w-4 h-4" />,
        content: <BuildPerceptronTab />,
      },
      {
        id: "gates",
        label: "AND / OR Gates",
        icon: <GitBranch className="w-4 h-4" />,
        content: <GatesTab />,
      },
      {
        id: "xor",
        label: "The XOR Problem",
        icon: <AlertTriangle className="w-4 h-4" />,
        content: <XORTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="The Perceptron"
      level={6}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Discover activation functions -- how neurons decide to fire!"
      story={
        <StorySection
          paragraphs={[
            "Aru was staring at a diagram of the human brain, fascinated by the billions of tiny neurons firing signals to each other.",
            "Aru: \"What's the simplest brain cell a computer can have?\"",
            "Byte: \"Great question! It's called a perceptron! Imagine a circle with arrows coming in. It takes inputs, multiplies each by a weight, adds them all up, and if the total is big enough -- it fires! Like a tiny decision maker.\"",
            "Aru: \"So it's like a neuron that says YES or NO?\"",
            "Byte: \"Exactly! And by adjusting the weights, you can teach it to make different decisions. Let's build one!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A perceptron is the simplest neural unit. It takes weighted inputs, sums them with a bias, and compares to a threshold to decide whether to fire (output 1) or not (output 0). It can learn linearly separable problems like AND and OR, but fails on XOR."
        />
      }
    />
  );
}
