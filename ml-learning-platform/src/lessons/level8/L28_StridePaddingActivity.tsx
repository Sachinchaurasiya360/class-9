"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Footprints, Frame, Minimize2, Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

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

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function grayHex(v: number): string {
  const c = clamp(v);
  const h = c.toString(16).padStart(2, "0");
  return `#${h}${h}${h}`;
}

function txtCol(v: number): string {
  return clamp(v) > 128 ? INK : "#fff";
}

const INPUT_8x8: number[] = (() => {
  const rand = mulberry32(555);
  const img: number[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      img.push(Math.floor(30 + rand() * 200));
    }
  }
  return img;
})();

const KERNEL_3x3 = [0, -1, 0, -1, 5, -1, 0, -1, 0];

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
/*  Tab 1 -- Stride Explorer                                           */
/* ------------------------------------------------------------------ */
function StrideTab() {
  const [stride, setStride] = useState(1);
  const [step, setStep] = useState(-1);
  const [themeIdx, setThemeIdx] = useState(0);
  const [speed, setSpeed] = useState(1.2);
  const [autoFire, setAutoFire] = useState(false);
  const theme = THEMES[themeIdx];

  const outSize = Math.floor((8 - 3) / stride) + 1;
  const totalSteps = outSize * outSize;

  const positions = useMemo(() => {
    const pos: { row: number; col: number }[] = [];
    for (let r = 0; r <= 8 - 3; r += stride) {
      for (let c = 0; c <= 8 - 3; c += stride) {
        pos.push({ row: r, col: c });
      }
    }
    return pos;
  }, [stride]);

  const output = useMemo(() => {
    return positions.map((p) => {
      let sum = 0;
      for (let kr = 0; kr < 3; kr++) {
        for (let kc = 0; kc < 3; kc++) {
          sum += INPUT_8x8[(p.row + kr) * 8 + (p.col + kc)] * KERNEL_3x3[kr * 3 + kc];
        }
      }
      return clamp(sum);
    });
  }, [positions]);

  useEffect(() => {
    if (!autoFire) return;
    const id = setInterval(() => {
      setStep((s) => {
        const next = s + 1;
        if (next >= totalSteps) { setAutoFire(false); playSuccess(); return totalSteps - 1; }
        playPop();
        return next;
      });
    }, Math.max(180, speed * 350));
    return () => clearInterval(id);
  }, [autoFire, speed, totalSteps]);

  const handleStep = useCallback(() => { playPop(); setStep((s) => Math.min(s + 1, totalSteps - 1)); }, [totalSteps]);
  const handleRunAll = useCallback(() => { playSuccess(); setStep(totalSteps - 1); }, [totalSteps]);
  const handleReset = useCallback(() => { playClick(); setStep(-1); setAutoFire(false); }, []);

  const curPos = step >= 0 && step < positions.length ? positions[step] : null;

  const cellSz = 38;
  const gapSz = 1;
  const inGridW = cellSz * 8 + gapSz * 9;
  const outCellSz = 38;
  const outGridW = outCellSz * outSize + gapSz * (outSize + 1);

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground text-center">
          👣 Change the stride to see how the filter <b>jumps</b> across the image. Larger stride = smaller output!
        </p>
      </div>

      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} speed={speed} setSpeed={setSpeed} />

      <div className="flex items-center gap-3 justify-center">
        <span className="font-hand text-sm font-bold">Stride:</span>
        {[1, 2, 3].map((s) => (
          <button key={s} onClick={() => { playClick(); setStride(s); setStep(-1); }}
            className={`w-10 h-10 rounded-lg font-hand text-base font-bold border-2 border-foreground transition-all ${stride === s ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background hover:bg-accent-yellow/40"}`}>
            {s}
          </button>
        ))}
        <button onClick={() => { playClick(); setAutoFire(!autoFire); }}
          className={`px-3 py-1.5 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${autoFire ? "bg-accent-coral text-white shadow-[2px_2px_0_#2b2a35]" : "bg-background"}`}>
          {autoFire ? "■ Stop" : "▶ Auto"}
        </button>
      </div>

      <div className="card-sketchy p-3 text-center" style={{ background: PAPER }}>
        <p className="font-hand text-sm">
          Output size = (N − K) / S + 1 = (8 − 3) / {stride} + 1 = <span className="marker-highlight-yellow font-bold">{outSize}</span>
        </p>
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <div className="flex flex-col sm:flex-row gap-4 items-start justify-center">
          {/* Input grid */}
          <div>
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 text-center">Input (8×8)</p>
            <svg viewBox={`0 0 ${inGridW} ${inGridW}`} className="w-full max-w-65 rounded-lg" style={{ background: INK }}>
              <defs>
                <radialGradient id="stride-glow" cx="50%" cy="50%">
                  <stop offset="0%" stopColor={theme.glow} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={theme.node} stopOpacity={0} />
                </radialGradient>
              </defs>
              {INPUT_8x8.map((val, idx) => {
                const row = Math.floor(idx / 8);
                const col = idx % 8;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                const visited = positions.slice(0, step + 1).some((p) => row >= p.row && row < p.row + 3 && col >= p.col && col < p.col + 3);
                const inCurrent = curPos && row >= curPos.row && row < curPos.row + 3 && col >= curPos.col && col < curPos.col + 3;
                return (
                  <g key={idx}>
                    <rect x={x} y={y} width={cellSz} height={cellSz} fill={grayHex(val)} rx={3}
                      opacity={step >= 0 && !visited && !inCurrent ? 0.35 : 1} />
                    {inCurrent && <rect x={x} y={y} width={cellSz} height={cellSz} fill="url(#stride-glow)" rx={3} />}
                    <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle" fill={txtCol(val)}
                      fontFamily="Kalam" className="text-[9px] font-bold pointer-events-none">{val}</text>
                  </g>
                );
              })}
              {curPos && (
                <rect
                  x={gapSz + curPos.col * (cellSz + gapSz) - 2}
                  y={gapSz + curPos.row * (cellSz + gapSz) - 2}
                  width={cellSz * 3 + gapSz * 2 + 4}
                  height={cellSz * 3 + gapSz * 2 + 4}
                  fill="none" stroke={theme.accent} strokeWidth={3} rx={5}
                  className="signal-flow"
                  style={{ animationDuration: `${speed}s` }}
                />
              )}
            </svg>
          </div>

          {/* Output grid */}
          <div>
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 text-center">Output ({outSize}×{outSize})</p>
            <svg viewBox={`0 0 ${Math.max(outGridW, 60)} ${Math.max(outGridW, 60)}`} className="w-full max-w-50 rounded-lg" style={{ background: INK }}>
              {Array.from({ length: totalSteps }, (_, idx) => {
                const row = Math.floor(idx / outSize);
                const col = idx % outSize;
                const x = gapSz + col * (outCellSz + gapSz);
                const y = gapSz + row * (outCellSz + gapSz);
                const filled = idx <= step;
                const val = filled ? output[idx] : 0;
                const isCurrent = idx === step;
                return (
                  <g key={idx}>
                    <rect x={x} y={y} width={outCellSz} height={outCellSz}
                      fill={filled ? grayHex(val) : "#3a3848"} rx={3}
                      stroke={isCurrent ? theme.accent : "none"} strokeWidth={isCurrent ? 2.5 : 0}
                      className={isCurrent ? "pulse-glow" : ""}
                      style={isCurrent ? { color: theme.accent } : undefined} />
                    {filled && (
                      <text x={x + outCellSz / 2} y={y + outCellSz / 2 + 4} textAnchor="middle" fill={txtCol(val)}
                        fontFamily="Kalam" className="text-[10px] font-bold pointer-events-none">{val}</text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <button onClick={handleStep} disabled={step >= totalSteps - 1}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          Step
        </button>
        <button onClick={handleRunAll}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-mint text-white shadow-[2px_2px_0_#2b2a35] transition-all">
          Run All
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35] transition-all">
          Reset
        </button>
      </div>

      <InfoBox variant="blue" title="Stride">
        Stride controls how many pixels the filter moves each step. Stride 1 moves one pixel at a time; stride 2 skips every other position, producing a smaller output.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Padding Demo                                              */
/* ------------------------------------------------------------------ */
function PaddingTab() {
  const [usePadding, setUsePadding] = useState(false);
  const [themeIdx, setThemeIdx] = useState(2);
  const [speed, setSpeed] = useState(1.2);
  const theme = THEMES[themeIdx];

  const paddedSize = usePadding ? 10 : 8;
  const paddedImage = useMemo(() => {
    if (!usePadding) return INPUT_8x8;
    const padded: number[] = new Array(paddedSize * paddedSize).fill(0);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        padded[(r + 1) * paddedSize + (c + 1)] = INPUT_8x8[r * 8 + c];
      }
    }
    return padded;
  }, [usePadding, paddedSize]);

  const outSize = paddedSize - 2;

  const output = useMemo(() => {
    const out: number[] = [];
    for (let r = 0; r < outSize; r++) {
      for (let c = 0; c < outSize; c++) {
        let sum = 0;
        for (let kr = 0; kr < 3; kr++) {
          for (let kc = 0; kc < 3; kc++) {
            sum += paddedImage[(r + kr) * paddedSize + (c + kc)] * KERNEL_3x3[kr * 3 + kc];
          }
        }
        out.push(clamp(sum));
      }
    }
    return out;
  }, [paddedImage, paddedSize, outSize]);

  const cellSz = usePadding ? 30 : 36;
  const gapSz = 1;
  const inGridW = cellSz * paddedSize + gapSz * (paddedSize + 1);
  const outGridW = cellSz * outSize + gapSz * (outSize + 1);

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground text-center">
          🖼️ Toggle padding to see how zeros around the border <b>preserve</b> the output size.
        </p>
      </div>

      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} speed={speed} setSpeed={setSpeed} />

      <div className="flex gap-3 justify-center">
        <button onClick={() => { playPop(); setUsePadding(false); }}
          className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${!usePadding ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background"}`}>
          Valid (No Padding)
        </button>
        <button onClick={() => { playPop(); setUsePadding(true); }}
          className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${usePadding ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background"}`}>
          Same (Zero Padding)
        </button>
      </div>

      <div className="card-sketchy p-3 text-center" style={{ background: PAPER }}>
        <p className="font-hand text-sm">
          Input: <span className="font-bold">{usePadding ? "8×8 + padding = 10×10" : "8×8"}</span> → Output: <span className="marker-highlight-yellow font-bold">{outSize}×{outSize}</span>
          {usePadding && <span className="marker-highlight-mint font-bold ml-2">(same as original!)</span>}
        </p>
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <div className="flex flex-col sm:flex-row gap-4 items-start justify-center">
          <div>
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 text-center">
              {usePadding ? "Padded Input (10×10)" : "Input (8×8)"}
            </p>
            <svg viewBox={`0 0 ${inGridW} ${inGridW}`} className="w-full max-w-70 rounded-lg" style={{ background: INK }}>
              {paddedImage.map((val, idx) => {
                const row = Math.floor(idx / paddedSize);
                const col = idx % paddedSize;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                const isPadding = usePadding && (row === 0 || row === paddedSize - 1 || col === 0 || col === paddedSize - 1);
                return (
                  <g key={idx} className={isPadding ? "wobble" : ""} style={isPadding ? { transformOrigin: `${x + cellSz / 2}px ${y + cellSz / 2}px` } : undefined}>
                    <rect x={x} y={y} width={cellSz} height={cellSz}
                      fill={isPadding ? theme.glow : grayHex(val)} rx={3}
                      stroke={isPadding ? theme.node : "none"} strokeWidth={isPadding ? 1.5 : 0}
                      strokeDasharray={isPadding ? "3 2" : ""} />
                    <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle"
                      fill={isPadding ? INK : txtCol(val)}
                      fontFamily="Kalam" className="text-[9px] font-bold pointer-events-none">
                      {isPadding ? "0" : val}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div>
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 text-center">Output ({outSize}×{outSize})</p>
            <svg viewBox={`0 0 ${outGridW} ${outGridW}`} className="w-full max-w-60 rounded-lg" style={{ background: INK }}>
              {output.map((val, idx) => {
                const row = Math.floor(idx / outSize);
                const col = idx % outSize;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                return (
                  <g key={idx}>
                    <rect x={x} y={y} width={cellSz} height={cellSz} fill={grayHex(val)} rx={3} />
                    <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle" fill={txtCol(val)}
                      fontFamily="Kalam" className="text-[8px] font-bold pointer-events-none">{val}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <InfoBox variant="green" title="Why Padding?">
        Without padding, each convolution layer shrinks the image. With "same" padding (adding zeros around the border), the output stays the same size as the input. This lets us stack many convolution layers without losing spatial dimensions.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Pooling                                                   */
/* ------------------------------------------------------------------ */
function PoolingTab() {
  const [poolType, setPoolType] = useState<"max" | "avg">("max");
  const [highlightBlock, setHighlightBlock] = useState<number | null>(null);
  const [themeIdx, setThemeIdx] = useState(1);
  const [speed, setSpeed] = useState(1.2);
  const theme = THEMES[themeIdx];

  const featureMap: number[] = useMemo(() => {
    const rand = mulberry32(42);
    return Array.from({ length: 16 }, () => Math.floor(rand() * 10));
  }, []);

  const pooled = useMemo(() => {
    const out: number[] = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const block = [
          featureMap[(r * 2) * 4 + (c * 2)],
          featureMap[(r * 2) * 4 + (c * 2 + 1)],
          featureMap[(r * 2 + 1) * 4 + (c * 2)],
          featureMap[(r * 2 + 1) * 4 + (c * 2 + 1)],
        ];
        if (poolType === "max") out.push(Math.max(...block));
        else out.push(Math.round(block.reduce((a, b) => a + b, 0) / 4));
      }
    }
    return out;
  }, [featureMap, poolType]);

  const getBlockIndex = useCallback((row: number, col: number): number => {
    return Math.floor(row / 2) * 2 + Math.floor(col / 2);
  }, []);

  const isMaxInBlock = useCallback((row: number, col: number): boolean => {
    if (poolType !== "max") return false;
    const br = Math.floor(row / 2);
    const bc = Math.floor(col / 2);
    const block = [
      featureMap[(br * 2) * 4 + (bc * 2)],
      featureMap[(br * 2) * 4 + (bc * 2 + 1)],
      featureMap[(br * 2 + 1) * 4 + (bc * 2)],
      featureMap[(br * 2 + 1) * 4 + (bc * 2 + 1)],
    ];
    return featureMap[row * 4 + col] === Math.max(...block);
  }, [featureMap, poolType]);

  const blockColors = ["#ffd0d0", "#fff3a0", "#c9f0ec", "#dcc9f5"];

  const cellSz = 60;
  const gapSz = 3;
  const inGridW = cellSz * 4 + gapSz * 5;
  const outCellSz = 70;
  const outGridW = outCellSz * 2 + gapSz * 3;

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground text-center">
          🔽 Pooling shrinks a feature map by taking the max (or average) of each 2×2 block. Hover to see which values are picked!
        </p>
      </div>

      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} speed={speed} setSpeed={setSpeed} />

      <div className="flex gap-3 justify-center">
        <button onClick={() => { playPop(); setPoolType("max"); }}
          className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${poolType === "max" ? "bg-accent-mint text-white shadow-[2px_2px_0_#2b2a35]" : "bg-background"}`}>
          Max Pooling
        </button>
        <button onClick={() => { playPop(); setPoolType("avg"); }}
          className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${poolType === "avg" ? "bg-accent-sky text-white shadow-[2px_2px_0_#2b2a35]" : "bg-background"}`}>
          Average Pooling
        </button>
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
          {/* Input 4x4 */}
          <div>
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 text-center">Feature Map (4×4)</p>
            <svg viewBox={`0 0 ${inGridW} ${inGridW}`} className="w-full max-w-65 rounded-lg card-sketchy" style={{ background: PAPER }}>
              {featureMap.map((val, idx) => {
                const row = Math.floor(idx / 4);
                const col = idx % 4;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                const blockIdx = getBlockIndex(row, col);
                const isHighlight = highlightBlock === blockIdx;
                const isMax = isMaxInBlock(row, col);
                return (
                  <g key={idx}
                    onMouseEnter={() => setHighlightBlock(blockIdx)}
                    onMouseLeave={() => setHighlightBlock(null)}
                    className="cursor-pointer">
                    <rect x={x} y={y} width={cellSz} height={cellSz}
                      fill={blockColors[blockIdx]} rx={6}
                      stroke={isHighlight ? (isMax && poolType === "max" ? theme.node : theme.accent) : INK}
                      strokeWidth={isHighlight ? 3 : 1.5}
                      className={isHighlight && isMax && poolType === "max" ? "pulse-glow" : ""}
                      style={isHighlight && isMax && poolType === "max" ? { color: theme.node } : undefined} />
                    <text x={x + cellSz / 2} y={y + cellSz / 2 + 7} textAnchor="middle"
                      fontFamily="Kalam" className="text-[18px] font-bold pointer-events-none" fill={INK}>
                      {val}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-center">
            <svg viewBox="0 0 60 30" className="w-16">
              <line x1={5} y1={15} x2={50} y2={15} stroke={theme.node} strokeWidth={3} strokeLinecap="round"
                className="signal-flow" style={{ animationDuration: `${speed}s`, color: theme.node }}
                markerEnd="url(#pool-arrow)" />
              <defs>
                <marker id="pool-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <path d="M0,0 L10,4 L0,8 Z" fill={theme.node} />
                </marker>
              </defs>
            </svg>
            <p className="font-hand text-[11px] font-bold text-muted-foreground">{poolType === "max" ? "take max" : "take avg"}</p>
          </div>

          {/* Output 2x2 */}
          <div>
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 text-center">Output (2×2)</p>
            <svg viewBox={`0 0 ${outGridW} ${outGridW}`} className="w-full max-w-40 rounded-lg card-sketchy" style={{ background: PAPER }}>
              {pooled.map((val, idx) => {
                const row = Math.floor(idx / 2);
                const col = idx % 2;
                const x = gapSz + col * (outCellSz + gapSz);
                const y = gapSz + row * (outCellSz + gapSz);
                const isHighlight = highlightBlock === idx;
                return (
                  <g key={idx}
                    onMouseEnter={() => setHighlightBlock(idx)}
                    onMouseLeave={() => setHighlightBlock(null)}>
                    <rect x={x} y={y} width={outCellSz} height={outCellSz}
                      fill={blockColors[idx]} rx={8}
                      stroke={isHighlight ? theme.node : INK}
                      strokeWidth={isHighlight ? 3 : 1.5}
                      className={isHighlight ? "pulse-glow" : ""}
                      style={isHighlight ? { color: theme.node } : undefined} />
                    <text x={x + outCellSz / 2} y={y + outCellSz / 2 + 8} textAnchor="middle"
                      fontFamily="Kalam" className="text-[22px] font-bold pointer-events-none" fill={INK}>
                      {val}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <InfoBox variant="amber" title="Pooling Reduces Size">
        Pooling reduces the spatial size while keeping the strongest features. Max pooling picks the largest value in each block (preserving the most active feature). Average pooling takes the mean. Both reduce computation for later layers.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What does stride control in convolution?",
    options: ["The size of the kernel", "How many positions the filter moves each step", "The number of filters used", "The brightness of pixels"],
    correctIndex: 1,
    explanation: "Stride determines how many pixels the filter jumps between positions. A larger stride produces a smaller output.",
  },
  {
    question: "If you apply a 3x3 filter with stride 2 to an 8x8 image (no padding), what is the output size?",
    options: ["6x6", "4x4", "3x3", "8x8"],
    correctIndex: 2,
    explanation: "Output size = (8 - 3) / 2 + 1 = 3.5 rounded down = 3. The output is 3x3.",
  },
  {
    question: "What is the purpose of zero padding?",
    options: ["To make the image brighter", "To preserve the spatial size of the output", "To speed up computation", "To remove edges from the image"],
    correctIndex: 1,
    explanation: "Zero padding adds zeros around the border so the filter can process edge pixels. With 'same' padding, the output keeps the same size as the input.",
  },
  {
    question: "What does max pooling do?",
    options: ["Averages all pixel values", "Selects the largest value in each pooling window", "Doubles the image size", "Adds noise to the image"],
    correctIndex: 1,
    explanation: "Max pooling divides the feature map into blocks and keeps only the maximum value from each block, reducing size while preserving the strongest features.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
export default function L28_StridePaddingActivity() {
  const tabs = useMemo(
    () => [
      { id: "stride", label: "Stride Explorer", icon: <Footprints className="w-4 h-4" />, content: <StrideTab /> },
      { id: "padding", label: "Padding Demo", icon: <Frame className="w-4 h-4" />, content: <PaddingTab /> },
      { id: "pooling", label: "Max Pooling", icon: <Minimize2 className="w-4 h-4" />, content: <PoolingTab /> },
    ],
    [],
  );

  return (
    <LessonShell
      title="Stride, Padding & Pooling"
      level={8}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Put it all together — build a mini CNN from scratch!"
      story={
        <StorySection
          paragraphs={[
            "Aru watched Byte demonstrate how a filter slides across an image, and a question popped up.",
            "Aru: \"Does the filter always move one pixel at a time? And what happens at the edges?\"",
            "Byte: \"Great questions! When we slide the filter, we can skip positions — that's called stride. And we can add zeros around the edges — that's padding. After filtering, we shrink the image with pooling, keeping only the important parts!\"",
            "Aru: \"So stride, padding, and pooling all help control the size of the output?\"",
            "Byte: \"Exactly! They're the building blocks that let us design CNNs that process images efficiently.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Stride controls how many pixels the filter skips. Padding adds zeros around the border to preserve size. Pooling shrinks the feature map by keeping only the max (or average) in each block."
        />
      }
    />
  );
}
