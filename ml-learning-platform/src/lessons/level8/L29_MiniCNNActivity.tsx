"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Workflow, Eye, Dumbbell, Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

/* ---- sketchy palette ---- */
const INK = "#2b2a35";
const PAPER = "#fffdf5";
const CREAM = "#fff8e7";

const THEMES = [
  { name: "Coral",    node: "#ff6b6b", glow: "#ff8a8a", accent: "#ffd93d" },
  { name: "Mint",     node: "#4ecdc4", glow: "#7ee0d8", accent: "#ffd93d" },
  { name: "Lavender", node: "#b18cf2", glow: "#c9adf7", accent: "#ffd93d" },
  { name: "Sky",      node: "#6bb6ff", glow: "#94caff", accent: "#ffd93d" },
  { name: "Sunset",   node: "#ffb88c", glow: "#ffd0b3", accent: "#ff6b6b" },
];

/* ---- helpers ---- */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    const t0 = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    const t = (t0 + Math.imul(t0 ^ (t0 >>> 7), 61 | t0)) ^ t0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/* ---- patterns ---- */
const HORIZ_STRIPES: number[] = [];
const VERT_STRIPES: number[] = [];
const CHECKER: number[] = [];

for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    HORIZ_STRIPES.push(r % 2 === 0 ? 1 : 0);
    VERT_STRIPES.push(c % 2 === 0 ? 1 : 0);
    CHECKER.push((r + c) % 2 === 0 ? 1 : 0);
  }
}

const PATTERNS = [
  { name: "Horizontal", data: HORIZ_STRIPES, label: 0 },
  { name: "Vertical", data: VERT_STRIPES, label: 1 },
  { name: "Checkerboard", data: CHECKER, label: 2 },
];

const CLASS_NAMES = ["Horizontal", "Vertical", "Checkerboard"];
const CLASS_COLORS = ["#6bb6ff", "#ff6b6b", "#4ecdc4"];

/* ---- CNN math ---- */
function conv2d(input: number[], inSize: number, kernel: number[]): number[] {
  const outSize = inSize - 2;
  const out: number[] = [];
  for (let r = 0; r < outSize; r++) {
    for (let c = 0; c < outSize; c++) {
      let sum = 0;
      for (let kr = 0; kr < 3; kr++) {
        for (let kc = 0; kc < 3; kc++) {
          sum += input[(r + kr) * inSize + (c + kc)] * kernel[kr * 3 + kc];
        }
      }
      out.push(sum);
    }
  }
  return out;
}

function relu(arr: number[]): number[] {
  return arr.map((v) => Math.max(0, v));
}

function maxPool2x2(input: number[], inSize: number): number[] {
  const outSize = Math.floor(inSize / 2);
  const out: number[] = [];
  for (let r = 0; r < outSize; r++) {
    for (let c = 0; c < outSize; c++) {
      const vals = [
        input[(r * 2) * inSize + c * 2],
        input[(r * 2) * inSize + c * 2 + 1],
        input[(r * 2 + 1) * inSize + c * 2],
        input[(r * 2 + 1) * inSize + c * 2 + 1],
      ];
      out.push(Math.max(...vals));
    }
  }
  return out;
}

function softmax(arr: number[]): number[] {
  const maxVal = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

const DEMO_KERNEL = [-1, -1, -1, 0, 0, 0, 1, 1, 1];

function makeDenseWeights(rand: () => number, inputs: number, outputs: number): { w: number[][]; b: number[] } {
  const w: number[][] = [];
  for (let o = 0; o < outputs; o++) {
    const row: number[] = [];
    for (let i = 0; i < inputs; i++) row.push((rand() - 0.5) * 2);
    w.push(row);
  }
  const b = Array.from({ length: outputs }, () => (rand() - 0.5));
  return { w, b };
}

function denseForward(input: number[], weights: number[][], bias: number[]): number[] {
  return weights.map((w, o) => {
    let sum = bias[o];
    for (let i = 0; i < input.length; i++) sum += input[i] * w[i];
    return sum;
  });
}

/* ---- theme bar ---- */
function ThemeBar({ themeIdx, setThemeIdx, speed, setSpeed }: { themeIdx: number; setThemeIdx: (i: number) => void; speed: number; setSpeed: (v: number) => void }) {
  return (
    <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-foreground/60" />
        <span className="font-hand text-sm font-bold">Theme:</span>
        <div className="flex gap-1.5">
          {THEMES.map((t, i) => (
            <button key={t.name} onClick={() => { playClick(); setThemeIdx(i); }} title={t.name}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${themeIdx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
              style={{ background: t.node }} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-hand text-sm font-bold">Speed:</span>
        <input type="range" min={0.4} max={2.5} step={0.1} value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-24 accent-accent-coral" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- CNN Pipeline                                              */
/* ------------------------------------------------------------------ */
function PipelineTab() {
  const [stage, setStage] = useState(0);
  const [themeIdx, setThemeIdx] = useState(2);
  const [speed, setSpeed] = useState(1.2);
  const [autoFire, setAutoFire] = useState(false);
  const [fireKey, setFireKey] = useState(0);
  const theme = THEMES[themeIdx];

  const input = PATTERNS[0].data;

  const convOut = useMemo(() => conv2d(input, 8, DEMO_KERNEL), [input]);
  const reluOut = useMemo(() => relu(convOut), [convOut]);
  const poolOut = useMemo(() => maxPool2x2(reluOut, 6), [reluOut]);
  const flatOut = poolOut;
  const denseW = useMemo(() => makeDenseWeights(mulberry32(99), 9, 3), []);
  const scores = useMemo(() => denseForward(flatOut, denseW.w, denseW.b), [flatOut, denseW]);
  const probs = useMemo(() => softmax(scores), [scores]);

  useEffect(() => {
    if (!autoFire) return;
    const id = setInterval(() => {
      setStage((s) => {
        if (s >= 5) { setAutoFire(false); playSuccess(); setFireKey((k) => k + 1); return 5; }
        playPop();
        return s + 1;
      });
    }, Math.max(400, speed * 700));
    return () => clearInterval(id);
  }, [autoFire, speed]);

  useEffect(() => {
    if (stage === 5) setFireKey((k) => k + 1);
  }, [stage]);

  const handleForward = useCallback(() => {
    playPop();
    setStage((s) => Math.min(s + 1, 5));
  }, []);

  const handleReset = useCallback(() => {
    playClick();
    setStage(0);
    setAutoFire(false);
  }, []);

  const stageNames = ["Input", "Conv", "ReLU", "Pool", "Flatten", "Dense"];

  const cellSz = 26;
  const gapSz = 1;

  const renderGrid = (data: number[], size: number, normalize: boolean, label: string, active: boolean) => {
    const gridW = cellSz * size + gapSz * (size + 1);
    const maxVal = normalize ? Math.max(...data.map(Math.abs), 0.01) : 1;
    return (
      <div className="flex flex-col items-center">
        <p className="font-hand text-[10px] font-bold text-muted-foreground mb-1">{label}</p>
        <svg viewBox={`0 0 ${gridW} ${gridW}`}
          className={`rounded-lg ${active ? "pulse-glow" : ""}`}
          style={{ background: INK, width: Math.min(size * 30, 180), color: theme.node }}>
          {data.map((val, idx) => {
            const row = Math.floor(idx / size);
            const col = idx % size;
            const x = gapSz + col * (cellSz + gapSz);
            const y = gapSz + row * (cellSz + gapSz);
            const norm = normalize ? clamp01(val / maxVal * 0.5 + 0.5) : clamp01(val);
            const gray = Math.round(norm * 255);
            const hex = gray.toString(16).padStart(2, "0");
            return (
              <g key={idx}>
                <rect x={x} y={y} width={cellSz} height={cellSz} fill={`#${hex}${hex}${hex}`} rx={2} />
                <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle"
                  fill={gray > 128 ? INK : "#fff"} fontFamily="Kalam" className="text-[7px] font-bold pointer-events-none">
                  {Number.isInteger(val) ? val : val.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const Arrow = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 40 30" className="w-10 h-8 self-center">
      <line x1={2} y1={15} x2={32} y2={15}
        stroke={active ? theme.node : "#cbd5e1"} strokeWidth={3} strokeLinecap="round"
        className={active ? "signal-flow" : ""}
        style={active ? { animationDuration: `${speed}s`, color: theme.node } : undefined}
        markerEnd="url(#mini-arrow)" />
      <defs>
        <marker id="mini-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M0,0 L10,4 L0,8 Z" fill={active ? theme.node : "#cbd5e1"} />
        </marker>
      </defs>
    </svg>
  );

  const predicted = probs.indexOf(Math.max(...probs));

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground text-center">
          🚀 Click <b>Forward →</b> to push data through each CNN stage.
        </p>
      </div>

      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} speed={speed} setSpeed={setSpeed} />

      {/* Stage indicator */}
      <div className="flex gap-1 justify-center flex-wrap">
        {stageNames.map((name, i) => (
          <div key={name}
            className={`px-2 py-1 rounded font-hand text-[11px] font-bold border-2 border-foreground transition-all ${i <= stage ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background opacity-50"}`}>
            {name}
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="card-sketchy p-4 notebook-grid">
        <div className="flex gap-2 items-end justify-center flex-wrap">
          {stage >= 0 && renderGrid(input, 8, false, "Input (8×8)", stage === 0)}
          {stage >= 1 && <Arrow active={stage >= 1} />}
          {stage >= 1 && renderGrid(convOut, 6, true, "Conv (6×6)", stage === 1)}
          {stage >= 2 && <Arrow active={stage >= 2} />}
          {stage >= 2 && renderGrid(reluOut, 6, true, "ReLU", stage === 2)}
          {stage >= 3 && <Arrow active={stage >= 3} />}
          {stage >= 3 && renderGrid(poolOut, 3, true, "Pool (3×3)", stage === 3)}
          {stage >= 4 && <Arrow active={stage >= 4} />}
          {stage >= 4 && (
            <div className="flex flex-col items-center">
              <p className="font-hand text-[10px] font-bold text-muted-foreground mb-1">Flatten</p>
              <svg viewBox="0 0 30 280" className={`rounded-lg ${stage === 4 ? "pulse-glow" : ""}`}
                style={{ background: INK, width: 30, height: 160, color: theme.node }}>
                {flatOut.map((val, i) => {
                  const maxV = Math.max(...flatOut.map(Math.abs), 0.01);
                  const norm = clamp01(val / maxV * 0.5 + 0.5);
                  const gray = Math.round(norm * 255);
                  const hex = gray.toString(16).padStart(2, "0");
                  return <rect key={i} x={2} y={2 + i * 30} width={26} height={28} fill={`#${hex}${hex}${hex}`} rx={3} />;
                })}
              </svg>
            </div>
          )}
          {stage >= 5 && <Arrow active={stage >= 5} />}
          {stage >= 5 && (
            <div className="flex flex-col items-center gap-1.5 relative">
              <p className="font-hand text-[10px] font-bold text-muted-foreground mb-1">Scores</p>
              {probs.map((p, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="font-hand text-[10px] font-bold w-20 text-right" style={{ color: CLASS_COLORS[i] }}>{CLASS_NAMES[i]}</span>
                  <svg viewBox="0 0 100 14" className="w-20">
                    <rect x={0} y={0} width={100} height={14} fill="#f3efe6" stroke={INK} strokeWidth={1} rx={3} />
                    <rect x={0} y={0} width={p * 100} height={14} fill={CLASS_COLORS[i]} rx={3} />
                  </svg>
                  <span className="font-hand text-[10px] font-bold text-muted-foreground">{(p * 100).toFixed(0)}%</span>
                </div>
              ))}
              {/* Fire ring on top prediction */}
              <svg key={fireKey} viewBox="0 0 200 80" className="absolute inset-0 pointer-events-none w-full h-full" style={{ overflow: "visible" }}>
                <circle cx={20} cy={20 + predicted * 20} r={14} fill="none" stroke={theme.accent} strokeWidth={3} className="fire-ring" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <button onClick={handleForward} disabled={stage >= 5}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          Forward →
        </button>
        <button onClick={() => { playClick(); setAutoFire(!autoFire); }}
          className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${autoFire ? "bg-accent-coral text-white shadow-[2px_2px_0_#2b2a35]" : "bg-background"}`}>
          {autoFire ? "■ Stop" : "▶ Auto"}
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35] transition-all">
          Reset
        </button>
      </div>

      <InfoBox variant="blue" title="CNN Pipeline">
        A CNN processes images in stages: Convolution (find features) → ReLU (remove negatives) → Pooling (shrink) → Flatten (make 1D) → Dense layer (classify). Each stage transforms the data step by step!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- What Each Layer Sees                                      */
/* ------------------------------------------------------------------ */
function LayerViewTab() {
  const [patternIdx, setPatternIdx] = useState(0);
  const [themeIdx, setThemeIdx] = useState(0);
  const [speed, setSpeed] = useState(1.2);
  const theme = THEMES[themeIdx];

  const kernels = useMemo(() => [
    { name: "Horiz Edge", k: [-1, -1, -1, 0, 0, 0, 1, 1, 1] },
    { name: "Vert Edge", k: [-1, 0, 1, -1, 0, 1, -1, 0, 1] },
  ], []);

  const results = useMemo(() => {
    const input = PATTERNS[patternIdx].data;
    return kernels.map((kd) => {
      const convResult = conv2d(input, 8, kd.k);
      const reluResult = relu(convResult);
      const poolResult = maxPool2x2(reluResult, 6);
      return { conv: convResult, relu: reluResult, pool: poolResult };
    });
  }, [patternIdx, kernels]);

  const cellSz = 22;
  const gapSz = 1;

  const renderSmallGrid = (data: number[], size: number, normalize: boolean) => {
    const gridW = cellSz * size + gapSz * (size + 1);
    const maxVal = normalize ? Math.max(...data.map(Math.abs), 0.01) : 1;
    return (
      <svg viewBox={`0 0 ${gridW} ${gridW}`} className="rounded-lg"
        style={{ background: INK, width: Math.min(size * 26, 140) }}>
        {data.map((val, idx) => {
          const row = Math.floor(idx / size);
          const col = idx % size;
          const x = gapSz + col * (cellSz + gapSz);
          const y = gapSz + row * (cellSz + gapSz);
          const norm = normalize ? clamp01(val / maxVal * 0.5 + 0.5) : clamp01(val);
          const gray = Math.round(norm * 255);
          const hex = gray.toString(16).padStart(2, "0");
          return <rect key={idx} x={x} y={y} width={cellSz} height={cellSz} fill={`#${hex}${hex}${hex}`} rx={2} />;
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground text-center">
          👁️ Pick a pattern and see how each filter responds differently.
        </p>
      </div>

      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} speed={speed} setSpeed={setSpeed} />

      <div className="flex gap-2 justify-center flex-wrap">
        {PATTERNS.map((p, i) => (
          <button key={p.name} onClick={() => { playClick(); setPatternIdx(i); }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${patternIdx === i ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background hover:bg-accent-yellow/40"}`}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="card-sketchy p-4 notebook-grid flex flex-col items-center gap-2">
        <p className="font-hand text-[10px] font-bold text-muted-foreground">Input: {PATTERNS[patternIdx].name}</p>
        {renderSmallGrid(PATTERNS[patternIdx].data, 8, false)}
      </div>

      {kernels.map((kd, ki) => (
        <div key={kd.name} className="card-sketchy p-3" style={{ background: PAPER }}>
          <p className="font-hand text-sm font-bold mb-2" style={{ color: theme.node }}>Filter: {kd.name}</p>
          <div className="flex gap-2 items-center justify-center flex-wrap">
            <div className="text-center">
              <p className="font-hand text-[10px] font-bold text-muted-foreground mb-1">Conv</p>
              {renderSmallGrid(results[ki].conv, 6, true)}
            </div>
            <span className="font-hand text-2xl text-foreground/40 signal-flow" style={{ animationDuration: `${speed}s`, color: theme.node }}>→</span>
            <div className="text-center">
              <p className="font-hand text-[10px] font-bold text-muted-foreground mb-1">ReLU</p>
              {renderSmallGrid(results[ki].relu, 6, true)}
            </div>
            <span className="font-hand text-2xl text-foreground/40 signal-flow" style={{ animationDuration: `${speed}s`, color: theme.node }}>→</span>
            <div className="text-center">
              <p className="font-hand text-[10px] font-bold text-muted-foreground mb-1">Pool</p>
              {renderSmallGrid(results[ki].pool, 3, true)}
            </div>
          </div>
        </div>
      ))}

      <InfoBox variant="amber" title="Different Filters, Different Responses">
        A horizontal edge filter responds strongly to horizontal stripes but weakly to vertical ones — and vice versa. The CNN learns to use many filters so it can detect all kinds of patterns!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Train the Mini CNN                                        */
/* ------------------------------------------------------------------ */
function TrainTab() {
  const [trained, setTrained] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [accHistory, setAccHistory] = useState<number[]>([]);
  const [userGrid, setUserGrid] = useState<number[]>(() => new Array(64).fill(0));
  const [prediction, setPrediction] = useState<number[] | null>(null);
  const [themeIdx, setThemeIdx] = useState(1);
  const [speed, setSpeed] = useState(1.2);
  const theme = THEMES[themeIdx];

  const trainOnce = useCallback(() => {
    playPop();
    setEpoch((prev) => {
      const next = prev + 1;
      const rand = mulberry32(next * 42);
      const baseLoss = 1.1 / (1 + next * 0.4) + rand() * 0.05;
      const baseAcc = Math.min(1, 0.3 + next * 0.15 + rand() * 0.05);
      setLossHistory((h) => [...h, baseLoss]);
      setAccHistory((h) => [...h, baseAcc]);
      if (next >= 5) { setTrained(true); playSuccess(); }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    playClick();
    setTrained(false);
    setEpoch(0);
    setLossHistory([]);
    setAccHistory([]);
    setPrediction(null);
  }, []);

  const handleCellClick = useCallback((idx: number) => {
    if (!trained) return;
    playPop();
    setUserGrid((prev) => {
      const next = [...prev];
      next[idx] = next[idx] > 0.5 ? 0 : 1;
      return next;
    });
  }, [trained]);

  const handlePredict = useCallback(() => {
    if (!trained) { playError(); return; }
    playClick();
    let horizScore = 0, vertScore = 0, checkScore = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const val = userGrid[r * 8 + c];
        if (val > 0.5) {
          if (r % 2 === 0) horizScore += 1;
          if (c % 2 === 0) vertScore += 1;
          if ((r + c) % 2 === 0) checkScore += 1;
        }
      }
    }
    const total = Math.max(horizScore + vertScore + checkScore, 1);
    const raw = [horizScore / total, vertScore / total, checkScore / total];
    setPrediction(softmax(raw.map((v) => v * 5)));
    playSuccess();
  }, [trained, userGrid]);

  const handleLoadPattern = useCallback((idx: number) => {
    playClick();
    setUserGrid([...PATTERNS[idx].data]);
    setPrediction(null);
  }, []);

  const cellSz = 32;
  const gapSz = 1;
  const gridW = cellSz * 8 + gapSz * 9;
  const chartW = 240;
  const chartH = 80;
  const predicted = prediction ? prediction.indexOf(Math.max(...prediction)) : -1;

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground text-center">
          🏋️ Train the mini CNN on 3 patterns, then draw your own and watch it predict!
        </p>
      </div>

      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} speed={speed} setSpeed={setSpeed} />

      <div className="flex gap-3 justify-center flex-wrap">
        {PATTERNS.map((p) => (
          <div key={p.name} className="text-center card-sketchy p-2" style={{ background: PAPER }}>
            <p className="font-hand text-[10px] font-bold mb-1" style={{ color: CLASS_COLORS[p.label] }}>{p.name}</p>
            <svg viewBox={`0 0 ${cellSz * 8 + gapSz * 9} ${cellSz * 8 + gapSz * 9}`}
              className="rounded-lg" style={{ background: INK, width: 80 }}>
              {p.data.map((val, idx) => {
                const row = Math.floor(idx / 8);
                const col = idx % 8;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                const gray = Math.round(val * 255);
                const hex = gray.toString(16).padStart(2, "0");
                return <rect key={idx} x={x} y={y} width={cellSz} height={cellSz} fill={`#${hex}${hex}${hex}`} rx={2} />;
              })}
            </svg>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-center items-center flex-wrap">
        <button onClick={trainOnce} disabled={epoch >= 5}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          {epoch === 0 ? "Train" : epoch >= 5 ? "Trained!" : `Train (Epoch ${epoch}/5)`}
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35] transition-all">
          Reset
        </button>
      </div>

      {lossHistory.length > 0 && (
        <div className="flex gap-4 justify-center flex-wrap">
          <div className="text-center card-sketchy p-2" style={{ background: PAPER }}>
            <p className="font-hand text-[11px] font-bold mb-1" style={{ color: "#ff6b6b" }}>Loss</p>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: chartW, background: PAPER }}>
              <line x1={20} y1={chartH - 10} x2={chartW - 10} y2={chartH - 10} stroke={INK} strokeWidth={1} opacity={0.4} />
              {lossHistory.map((loss, i) => {
                const x = 30 + i * ((chartW - 50) / 4);
                const y = chartH - 15 - (loss / 1.2) * (chartH - 25);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={4} fill="#ff6b6b" stroke={INK} strokeWidth={1.5} />
                    {i > 0 && (
                      <line x1={30 + (i - 1) * ((chartW - 50) / 4)}
                        y1={chartH - 15 - (lossHistory[i - 1] / 1.2) * (chartH - 25)}
                        x2={x} y2={y} stroke="#ff6b6b" strokeWidth={2} />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="text-center card-sketchy p-2" style={{ background: PAPER }}>
            <p className="font-hand text-[11px] font-bold mb-1" style={{ color: "#4ecdc4" }}>Accuracy</p>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: chartW, background: PAPER }}>
              <line x1={20} y1={chartH - 10} x2={chartW - 10} y2={chartH - 10} stroke={INK} strokeWidth={1} opacity={0.4} />
              {accHistory.map((acc, i) => {
                const x = 30 + i * ((chartW - 50) / 4);
                const y = chartH - 15 - acc * (chartH - 25);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={4} fill="#4ecdc4" stroke={INK} strokeWidth={1.5} />
                    {i > 0 && (
                      <line x1={30 + (i - 1) * ((chartW - 50) / 4)}
                        y1={chartH - 15 - accHistory[i - 1] * (chartH - 25)}
                        x2={x} y2={y} stroke="#4ecdc4" strokeWidth={2} />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {trained && (
        <div className="space-y-3 card-sketchy p-4 notebook-grid">
          <p className="font-hand text-sm font-bold text-foreground text-center">Draw your own pattern and predict!</p>

          <div className="flex gap-2 justify-center flex-wrap">
            {PATTERNS.map((p, i) => (
              <button key={p.name} onClick={() => handleLoadPattern(i)}
                className="px-2 py-1 rounded font-hand text-[11px] font-bold border-2 border-foreground bg-background hover:bg-accent-yellow/40 shadow-[2px_2px_0_#2b2a35] transition-all">
                Load {p.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <svg viewBox={`0 0 ${gridW} ${gridW}`} className="w-full max-w-60 rounded-lg cursor-pointer" style={{ background: INK }}>
              {userGrid.map((val, idx) => {
                const row = Math.floor(idx / 8);
                const col = idx % 8;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                const gray = Math.round(val * 255);
                const hex = gray.toString(16).padStart(2, "0");
                return (
                  <rect key={idx} x={x} y={y} width={cellSz} height={cellSz}
                    fill={`#${hex}${hex}${hex}`} rx={3}
                    onClick={() => handleCellClick(idx)}
                    className="hover:opacity-80 transition-opacity" />
                );
              })}
            </svg>

            {prediction && (
              <div className="space-y-2 relative">
                <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">Prediction</p>
                {prediction.map((p, i) => {
                  const isTop = i === predicted;
                  return (
                    <div key={i} className="flex items-center gap-2 relative">
                      <span className="font-hand text-xs font-bold w-24 text-right" style={{ color: CLASS_COLORS[i] }}>{CLASS_NAMES[i]}</span>
                      <svg viewBox="0 0 120 16" className="w-28">
                        <rect x={0} y={0} width={120} height={16} fill="#f3efe6" stroke={INK} strokeWidth={1} rx={4} />
                        <rect x={0} y={0} width={p * 120} height={16} fill={CLASS_COLORS[i]} rx={4} />
                      </svg>
                      <span className="font-hand text-xs font-bold text-muted-foreground">{(p * 100).toFixed(0)}%</span>
                      {isTop && (
                        <svg className="absolute -left-2 top-0 w-6 h-6 pointer-events-none" viewBox="0 0 24 24" style={{ overflow: "visible" }}>
                          <circle cx={12} cy={8} r={10} fill="none" stroke={theme.accent} strokeWidth={3} className="fire-ring" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button onClick={handlePredict}
              className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-mint text-white shadow-[2px_2px_0_#2b2a35] transition-all">
              Predict
            </button>
          </div>
        </div>
      )}

      <InfoBox variant="indigo" title="Training a CNN">
        During training, the CNN adjusts its filter weights and dense layer weights to minimize loss. After enough epochs, it learns to recognize patterns. Then it can classify new images it has never seen!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is the correct order of layers in a typical CNN?",
    options: [
      "Dense → Pool → Conv → Flatten",
      "Conv → ReLU → Pool → Flatten → Dense",
      "Pool → Conv → Dense → Flatten",
      "Flatten → Conv → Pool → Dense"
    ],
    correctIndex: 1,
    explanation: "A CNN typically goes: Convolution (detect features) → ReLU (remove negatives) → Pooling (shrink) → Flatten (make 1D) → Dense (classify).",
  },
  {
    question: "What does the ReLU layer do in a CNN?",
    options: ["Doubles all values", "Sets negative values to zero", "Averages all values", "Reverses the image"],
    correctIndex: 1,
    explanation: "ReLU (Rectified Linear Unit) replaces all negative values with zero, keeping only positive activations. This adds non-linearity to the network.",
  },
  {
    question: "Why does a CNN flatten the feature map before the dense layer?",
    options: ["To make the image look better", "To convert the 2D grid into a 1D vector for classification", "To increase the image size", "To add more colors"],
    correctIndex: 1,
    explanation: "Dense layers expect a 1D input. Flattening converts the 2D feature map into a single vector of numbers that the dense layer can process.",
  },
  {
    question: "What does a CNN learn during training?",
    options: ["The size of images", "The best filter weights and dense layer weights", "How to take photos", "The names of objects"],
    correctIndex: 1,
    explanation: "During training, the CNN adjusts the values in its convolutional filters and dense layer weights to minimize prediction errors.",
  },
  {
    question: "What is the main advantage of CNNs over regular neural networks for images?",
    options: ["They are simpler to understand", "They use filters to detect spatial patterns efficiently", "They don't need training data", "They only work with color images"],
    correctIndex: 1,
    explanation: "CNNs use convolutional filters that can detect spatial patterns (edges, textures, shapes) regardless of where they appear in the image, making them much more efficient for image tasks.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
export default function L29_MiniCNNActivity() {
  const tabs = useMemo(
    () => [
      { id: "pipeline", label: "CNN Pipeline", icon: <Workflow className="w-4 h-4" />, content: <PipelineTab /> },
      { id: "layers", label: "What Each Layer Sees", icon: <Eye className="w-4 h-4" />, content: <LayerViewTab /> },
      { id: "train", label: "Train the Mini CNN", icon: <Dumbbell className="w-4 h-4" />, content: <TrainTab /> },
    ],
    [],
  );

  return (
    <LessonShell
      title="Building a Mini CNN"
      level={8}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      story={
        <StorySection
          paragraphs={[
            "Aru sat back and looked at everything she had learned — pixels, filters, stride, padding, pooling.",
            "Aru: \"So we have filters, pooling, and neural network layers... can we combine them all?\"",
            "Byte: \"Yes! That's a CNN — Convolutional Neural Network. Image goes in, conv layer finds features, pooling shrinks it down, then we flatten it and pass it through a dense layer to get a prediction!\"",
            "Aru: \"So it's like an assembly line — each stage does one job, and by the end, the computer understands what's in the image?\"",
            "Byte: \"Exactly! Let's build one together and watch it learn.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A CNN (Convolutional Neural Network) chains together convolution, ReLU, pooling, flattening, and dense layers into a pipeline that transforms an image into a prediction. It learns the best filters automatically through training."
        />
      }
    />
  );
}
