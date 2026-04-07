import { useState, useMemo, useCallback, useEffect } from "react";
import { ScanLine, Wrench, Layers, Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

/* ------------------------------------------------------------------ */
/*  Sketchy palette                                                    */
/* ------------------------------------------------------------------ */
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

/* ---- test image ---- */
const TEST_IMAGE: number[] = (() => {
  const rand = mulberry32(777);
  const img: number[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (c <= 3) img.push(Math.floor(40 + rand() * 30));
      else img.push(Math.floor(180 + rand() * 50));
    }
  }
  return img;
})();

/* ---- kernel presets ---- */
interface KernelPreset {
  name: string;
  kernel: number[];
}

const PRESETS: KernelPreset[] = [
  { name: "Identity", kernel: [0, 0, 0, 0, 1, 0, 0, 0, 0] },
  { name: "Blur", kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1].map((v) => v / 9) },
  { name: "Sharpen", kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0] },
  { name: "Edge Detect", kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] },
];

function applyConv(image: number[], kernel: number[], size: number): number[] {
  const out: number[] = [];
  for (let r = 0; r < size - 2; r++) {
    for (let c = 0; c < size - 2; c++) {
      let sum = 0;
      for (let kr = 0; kr < 3; kr++) {
        for (let kc = 0; kc < 3; kc++) {
          sum += image[(r + kr) * size + (c + kc)] * kernel[kr * 3 + kc];
        }
      }
      out.push(sum);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Theme toolbar                                                      */
/* ------------------------------------------------------------------ */
function ThemeBar({ themeIdx, setThemeIdx, speed, setSpeed, autoFire, setAutoFire }: {
  themeIdx: number;
  setThemeIdx: (i: number) => void;
  speed: number;
  setSpeed: (v: number) => void;
  autoFire?: boolean;
  setAutoFire?: (b: boolean) => void;
}) {
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
      <div className="flex items-center gap-2">
        <span className="font-hand text-sm font-bold">Speed:</span>
        <input
          type="range" min={0.4} max={2.5} step={0.1} value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-24 accent-accent-coral"
        />
      </div>
      {setAutoFire && (
        <button
          onClick={() => { playClick(); setAutoFire(!autoFire); }}
          className={`px-3 py-1 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${autoFire ? "bg-accent-coral text-white shadow-[2px_2px_0_#2b2a35]" : "bg-background"}`}
        >
          {autoFire ? "■ Stop" : "▶ Auto"}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Apply a Filter (step-by-step)                             */
/* ------------------------------------------------------------------ */
function ApplyFilterTab() {
  const [preset, setPreset] = useState(0);
  const [step, setStep] = useState(-1);
  const [themeIdx, setThemeIdx] = useState(0);
  const [speed, setSpeed] = useState(1.2);
  const [autoFire, setAutoFire] = useState(false);
  const [sparkKey, setSparkKey] = useState(0);

  const theme = THEMES[themeIdx];
  const kernel = PRESETS[preset].kernel;
  const outputSize = 6;
  const totalSteps = outputSize * outputSize;

  const output = useMemo(() => applyConv(TEST_IMAGE, kernel, 8), [kernel]);

  const currentRow = step >= 0 ? Math.floor(step / outputSize) : -1;
  const currentCol = step >= 0 ? step % outputSize : -1;

  // Auto-run loop
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

  // Spark when finishing a row
  useEffect(() => {
    if (step > 0 && (step + 1) % outputSize === 0) setSparkKey((k) => k + 1);
  }, [step]);

  const handleStep = useCallback(() => {
    playPop();
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps]);

  const handleAutoRun = useCallback(() => {
    playClick();
    setStep(totalSteps - 1);
    playSuccess();
  }, [totalSteps]);

  const handleReset = useCallback(() => {
    playClick();
    setStep(-1);
    setAutoFire(false);
  }, []);

  const handlePreset = useCallback((idx: number) => {
    playClick();
    setPreset(idx);
    setStep(-1);
  }, []);

  const cellSz = 38;
  const gapSz = 1;
  const gridW = cellSz * 8 + gapSz * 9;
  const outGridW = cellSz * 6 + gapSz * 7;

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground text-center">
          🔍 Pick a filter, then click <b>Step</b> (or hit ▶ Auto) to watch the 3×3 kernel slide across the image.
        </p>
      </div>

      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} speed={speed} setSpeed={setSpeed} autoFire={autoFire} setAutoFire={setAutoFire} />

      {/* Preset buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={p.name} onClick={() => handlePreset(i)}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${preset === i ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background hover:bg-accent-yellow/40"}`}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
          {/* Input grid */}
          <div>
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 text-center">Input (8×8)</p>
            <svg viewBox={`0 0 ${gridW} ${gridW}`} className="w-full max-w-[260px] rounded-lg" style={{ background: INK }}>
              <defs>
                <radialGradient id="conv-glow" cx="50%" cy="50%">
                  <stop offset="0%" stopColor={theme.glow} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={theme.node} stopOpacity={0} />
                </radialGradient>
              </defs>
              {TEST_IMAGE.map((val, idx) => {
                const row = Math.floor(idx / 8);
                const col = idx % 8;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                const inWindow = step >= 0 && row >= currentRow && row < currentRow + 3 && col >= currentCol && col < currentCol + 3;
                return (
                  <g key={idx}>
                    <rect x={x} y={y} width={cellSz} height={cellSz} fill={grayHex(val)} rx={3} />
                    {inWindow && <rect x={x} y={y} width={cellSz} height={cellSz} fill="url(#conv-glow)" rx={3} />}
                    <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle" fill={txtCol(val)}
                      fontFamily="Kalam" className="text-[9px] font-bold pointer-events-none">{val}</text>
                  </g>
                );
              })}
              {/* Sliding window */}
              {step >= 0 && (
                <rect
                  x={gapSz + currentCol * (cellSz + gapSz) - 2}
                  y={gapSz + currentRow * (cellSz + gapSz) - 2}
                  width={cellSz * 3 + gapSz * 2 + 4}
                  height={cellSz * 3 + gapSz * 2 + 4}
                  fill="none" stroke={theme.accent} strokeWidth={3} rx={5}
                  className="signal-flow"
                  style={{ animationDuration: `${speed}s` }}
                />
              )}
            </svg>
          </div>

          {/* Kernel + arrow */}
          <div className="flex flex-col items-center gap-2">
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground text-center">Kernel (3×3)</p>
            <svg viewBox="0 0 130 130" className="w-[120px] card-sketchy" style={{ background: CREAM }}>
              {kernel.map((w, idx) => {
                const row = Math.floor(idx / 3);
                const col = idx % 3;
                const fill = w > 0 ? theme.glow : w < 0 ? "#ffd0d0" : "#f3efe6";
                return (
                  <g key={idx}>
                    <rect x={5 + col * 40} y={5 + row * 40} width={38} height={38} fill={fill} rx={4} stroke={INK} strokeWidth={1.5} />
                    <text x={5 + col * 40 + 19} y={5 + row * 40 + 25} textAnchor="middle" fontFamily="Kalam" className="text-[12px] font-bold" fill={INK}>
                      {Number.isInteger(w) ? w : w.toFixed(2)}
                    </text>
                  </g>
                );
              })}
            </svg>
            {step >= 0 && (
              <div className="card-sketchy px-2 py-1" style={{ background: PAPER }}>
                <p className="font-hand text-[11px] font-bold" style={{ color: theme.node }}>
                  Σ = <span className="marker-highlight-yellow">{clamp(output[step])}</span>
                </p>
              </div>
            )}
            <div className="text-2xl font-hand text-foreground/40 hidden lg:block">→</div>
          </div>

          {/* Output grid */}
          <div>
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 text-center">Output (6×6)</p>
            <svg viewBox={`0 0 ${outGridW} ${outGridW}`} className="w-full max-w-[200px] rounded-lg" style={{ background: INK }}>
              <defs>
                <radialGradient id="out-fire" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#fff3a0" />
                  <stop offset="60%" stopColor={theme.accent} />
                  <stop offset="100%" stopColor={theme.node} />
                </radialGradient>
              </defs>
              {Array.from({ length: 36 }, (_, idx) => {
                const row = Math.floor(idx / 6);
                const col = idx % 6;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                const filled = idx <= step;
                const val = filled ? clamp(output[idx]) : 0;
                const isCurrent = idx === step;
                return (
                  <g key={idx}>
                    <rect x={x} y={y} width={cellSz} height={cellSz}
                      fill={isCurrent ? "url(#out-fire)" : filled ? grayHex(val) : "#3a3848"} rx={3}
                      stroke={isCurrent ? theme.accent : "none"} strokeWidth={isCurrent ? 2.5 : 0}
                      className={isCurrent ? "pulse-glow" : ""}
                      style={isCurrent ? { color: theme.accent } : undefined} />
                    {filled && (
                      <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle" fill={txtCol(val)}
                        fontFamily="Kalam" className="text-[9px] font-bold pointer-events-none">{val}</text>
                    )}
                  </g>
                );
              })}
              {/* Row-finished sparks */}
              {step >= 0 && (step + 1) % outputSize === 0 && (
                <g key={sparkKey}>
                  {Array.from({ length: 6 }).map((_, i) => {
                    const angle = (i / 6) * Math.PI * 2;
                    const cx = gapSz + currentCol * (cellSz + gapSz) + cellSz / 2;
                    const cy = gapSz + currentRow * (cellSz + gapSz) + cellSz / 2;
                    return (
                      <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(angle) * 28} y2={cy + Math.sin(angle) * 28}
                        stroke={theme.accent} strokeWidth={2} strokeLinecap="round" className="spark"
                        style={{ animationDelay: `${i * 0.04}s` }} />
                    );
                  })}
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <button onClick={handleStep} disabled={step >= totalSteps - 1}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          Step ({step + 1}/{totalSteps})
        </button>
        <button onClick={handleAutoRun}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-mint text-white shadow-[2px_2px_0_#2b2a35] transition-all">
          Run All
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35] transition-all">
          Reset
        </button>
      </div>

      <InfoBox variant="blue" title="Convolution">
        A filter (kernel) slides over the image. At each position, it multiplies overlapping values, sums them up, and produces one output pixel. Different kernels detect different features!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Build Your Own Filter                                     */
/* ------------------------------------------------------------------ */
function BuildFilterTab() {
  const [kernel, setKernel] = useState<number[]>([0, 0, 0, 0, 1, 0, 0, 0, 0]);
  const [themeIdx, setThemeIdx] = useState(1);
  const [speed, setSpeed] = useState(1.2);
  const theme = THEMES[themeIdx];

  const output = useMemo(() => applyConv(TEST_IMAGE, kernel, 8), [kernel]);

  const handleKernelChange = useCallback((idx: number, delta: number) => {
    playPop();
    setKernel((prev) => {
      const next = [...prev];
      next[idx] = Math.max(-2, Math.min(2, Math.round((next[idx] + delta) * 10) / 10));
      return next;
    });
  }, []);

  const handleLoadPreset = useCallback((idx: number) => {
    playClick();
    const p = PRESETS[idx];
    setKernel(p.kernel.map((v) => Math.round(v * 100) / 100));
  }, []);

  const cellSz = 34;
  const gapSz = 1;
  const outGridW = cellSz * 6 + gapSz * 7;

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground text-center">
          🛠️ Edit the 3×3 kernel and watch the output transform live.
        </p>
      </div>

      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} speed={speed} setSpeed={setSpeed} />

      <div className="flex gap-2 justify-center flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={p.name} onClick={() => handleLoadPreset(i)}
            className="px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground bg-background hover:bg-accent-yellow/40 shadow-[2px_2px_0_#2b2a35] transition-all">
            Load {p.name}
          </button>
        ))}
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
          {/* Kernel editor */}
          <div>
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 text-center">Your Kernel</p>
            <div className="grid grid-cols-3 gap-1.5">
              {kernel.map((w, idx) => {
                const fill = w > 0 ? theme.glow : w < 0 ? "#ffd0d0" : "#f3efe6";
                return (
                  <div key={idx} className="card-sketchy flex flex-col items-center w-16 py-1" style={{ background: fill }}>
                    <button onClick={() => handleKernelChange(idx, 0.5)} className="font-hand text-base font-bold text-foreground hover:scale-125 transition-transform">+</button>
                    <span className="font-hand text-sm font-bold" style={{ color: INK }}>
                      {Number.isInteger(w) ? w : w.toFixed(1)}
                    </span>
                    <button onClick={() => handleKernelChange(idx, -0.5)} className="font-hand text-base font-bold text-foreground hover:scale-125 transition-transform">−</button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-3xl font-hand text-foreground/40 hidden sm:block signal-flow" style={{ animationDuration: `${speed}s` }}>→</div>

          {/* Output */}
          <div>
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 text-center">Output (6×6)</p>
            <svg viewBox={`0 0 ${outGridW} ${outGridW}`} className="w-full max-w-[200px] rounded-lg" style={{ background: INK }}>
              {output.map((val, idx) => {
                const row = Math.floor(idx / 6);
                const col = idx % 6;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                const clamped = clamp(val);
                return (
                  <g key={idx}>
                    <rect x={x} y={y} width={cellSz} height={cellSz} fill={grayHex(clamped)} rx={3} />
                    <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle" fill={txtCol(clamped)}
                      fontFamily="Kalam" className="text-[8px] font-bold pointer-events-none">{clamped}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <InfoBox variant="amber" title="Kernel Patterns">
        <strong>Horizontal edges:</strong> Top row positive, bottom row negative.<br />
        <strong>Vertical edges:</strong> Left column positive, right column negative.<br />
        <strong>Blur:</strong> All values equal and small. <strong>Sharpen:</strong> Large center, negative neighbors.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Multiple Filters                                          */
/* ------------------------------------------------------------------ */
function MultiFilterTab() {
  const [themeIdx, setThemeIdx] = useState(0);
  const [speed, setSpeed] = useState(1.2);
  const theme = THEMES[themeIdx];

  const filters = useMemo(() => [
    { name: "Blur", kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1].map((v) => v / 9), color: "#6bb6ff" },
    { name: "Edge Detect", kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1], color: "#ff6b6b" },
    { name: "Sharpen", kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0], color: "#4ecdc4" },
  ], []);

  const outputs = useMemo(() => filters.map((f) => applyConv(TEST_IMAGE, f.kernel, 8)), [filters]);

  const cellSz = 28;
  const gapSz = 1;
  const inGridW = cellSz * 8 + gapSz * 9;
  const outGridW = cellSz * 6 + gapSz * 7;

  return (
    <div className="space-y-4">
      <div className="card-sketchy p-3" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground text-center">
          🎛️ One image, three filters — each one extracts different features.
        </p>
      </div>

      <ThemeBar themeIdx={themeIdx} setThemeIdx={setThemeIdx} speed={speed} setSpeed={setSpeed} />

      {/* Input */}
      <div className="card-sketchy p-4 notebook-grid flex flex-col items-center gap-2">
        <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">Input (8×8)</p>
        <svg viewBox={`0 0 ${inGridW} ${inGridW}`} className="w-full max-w-[180px] rounded-lg" style={{ background: INK }}>
          {TEST_IMAGE.map((val, idx) => {
            const row = Math.floor(idx / 8);
            const col = idx % 8;
            const x = gapSz + col * (cellSz + gapSz);
            const y = gapSz + row * (cellSz + gapSz);
            return <rect key={idx} x={x} y={y} width={cellSz} height={cellSz} fill={grayHex(val)} rx={2} />;
          })}
        </svg>

        {/* Splitting arrows with signal-flow */}
        <svg viewBox="0 0 300 50" className="w-full max-w-[300px] mt-1">
          {[60, 150, 240].map((tx, i) => (
            <line key={i} x1={150} y1={5} x2={tx} y2={45} stroke={theme.node} strokeWidth={2.5}
              strokeLinecap="round" className="signal-flow"
              style={{ animationDuration: `${speed}s`, color: theme.node, animationDelay: `${i * 0.15}s` }} />
          ))}
        </svg>
      </div>

      {/* Outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {filters.map((f, fi) => (
          <div key={f.name} className="card-sketchy p-3 flex flex-col items-center" style={{ background: PAPER }}>
            <p className="font-hand text-sm font-bold mb-2" style={{ color: f.color }}>{f.name}</p>
            <svg viewBox={`0 0 ${outGridW} ${outGridW}`} className="w-full max-w-[150px] rounded-lg border-2"
              style={{ background: INK, borderColor: f.color }}>
              {outputs[fi].map((val, idx) => {
                const row = Math.floor(idx / 6);
                const col = idx % 6;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                return <rect key={idx} x={x} y={y} width={cellSz} height={cellSz} fill={grayHex(clamp(val))} rx={2} />;
              })}
            </svg>
            <svg viewBox="0 0 60 60" className="w-14 h-14 mt-2">
              {f.kernel.map((w, ki) => {
                const r = Math.floor(ki / 3);
                const c = ki % 3;
                const fill = w > 0 ? f.color + "55" : w < 0 ? "#ffd0d0" : "#f3efe6";
                return <rect key={ki} x={2 + c * 19} y={2 + r * 19} width={18} height={18} rx={2} fill={fill} stroke={INK} strokeWidth={1} />;
              })}
            </svg>
          </div>
        ))}
      </div>

      <InfoBox variant="indigo" title="CNNs Learn Their Filters">
        In a real Convolutional Neural Network, the computer does not use hand-made filters. Instead, it learns which filters work best during training — automatically discovering edges, textures, and shapes!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is a convolution in image processing?",
    options: ["Rotating the image 90 degrees", "Sliding a small filter over the image and computing sums", "Deleting pixels from the image", "Converting color to grayscale"],
    correctIndex: 1,
    explanation: "Convolution slides a small kernel over the image, multiplying and summing overlapping values to produce each output pixel.",
  },
  {
    question: "What does an edge detection filter typically find?",
    options: ["The brightest pixel", "Boundaries where brightness changes sharply", "The average color", "The center of the image"],
    correctIndex: 1,
    explanation: "Edge detection kernels highlight areas where pixel values change abruptly — that is where edges appear.",
  },
  {
    question: "If you apply a 3x3 filter to an 8x8 image (no padding), what is the output size?",
    options: ["8x8", "6x6", "3x3", "5x5"],
    correctIndex: 1,
    explanation: "Output size = (8 - 3 + 1) = 6. The filter cannot go past the edge, so the output shrinks by (kernel - 1) on each side.",
  },
  {
    question: "What does a blur filter do?",
    options: ["Sharpens the image", "Averages neighboring pixels to smooth the image", "Turns the image upside down", "Removes all color"],
    correctIndex: 1,
    explanation: "A blur kernel averages nearby pixel values, smoothing out noise and detail in the image.",
  },
  {
    question: "In a CNN, who designs the filters?",
    options: ["A human designer for each image", "The network learns them during training", "They are always the same for every task", "The camera hardware"],
    correctIndex: 1,
    explanation: "One of the key powers of CNNs is that they learn which filters to use automatically through training, rather than relying on hand-crafted ones.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L27_FiltersActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "apply",
        label: "Apply a Filter",
        icon: <ScanLine className="w-4 h-4" />,
        content: <ApplyFilterTab />,
      },
      {
        id: "build",
        label: "Build Your Own Filter",
        icon: <Wrench className="w-4 h-4" />,
        content: <BuildFilterTab />,
      },
      {
        id: "multi",
        label: "Multiple Filters",
        icon: <Layers className="w-4 h-4" />,
        content: <MultiFilterTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Filters & Convolution"
      level={8}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Discover stride, padding, and pooling — how CNNs handle image sizes!"
      story={
        <StorySection
          paragraphs={[
            "Aru was scrolling through photos on her phone when she paused on a selfie with a fun filter applied.",
            "Aru: \"How does my phone find faces in photos? It seems like magic!\"",
            "Byte: \"It slides a small filter over the image — like a magnifying glass looking for specific patterns. An edge filter finds edges, a blur filter smooths things out. That's convolution!\"",
            "Aru: \"So the phone is basically looking at tiny patches of pixels at a time?\"",
            "Byte: \"Exactly! And different filters detect different things — edges, corners, textures. That's the foundation of how computers see.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Convolution slides a small filter (kernel) over an image, computing a weighted sum at each position. Different kernels detect different features like edges, blur, or sharpness."
        />
      }
    />
  );
}
