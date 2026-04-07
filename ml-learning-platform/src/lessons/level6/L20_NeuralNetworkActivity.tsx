import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Network, Layers, Target, Play, RotateCcw, Shuffle, Palette, Zap, Plus, Minus, Sliders } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

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
/*  Neural network helpers                                             */
/* ------------------------------------------------------------------ */

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const INK = "#2b2a35";

const THEMES = [
  { name: "Coral",    in: "#6bb6ff", hidden: "#ff6b6b", out: "#4ecdc4", accent: "#ffd93d" },
  { name: "Mint",     in: "#b18cf2", hidden: "#4ecdc4", out: "#ffd93d", accent: "#ff6b6b" },
  { name: "Lavender", in: "#ffd93d", hidden: "#b18cf2", out: "#6bb6ff", accent: "#4ecdc4" },
  { name: "Sunset",   in: "#4ecdc4", hidden: "#ffb88c", out: "#ff6b6b", accent: "#ffd93d" },
];

function initWeights(rng: () => number, inputSize: number, hiddenSize: number) {
  const wH: number[][] = [];
  const bH: number[] = [];
  for (let j = 0; j < hiddenSize; j++) {
    const row: number[] = [];
    for (let i = 0; i < inputSize; i++) row.push((rng() - 0.5) * 2);
    wH.push(row);
    bH.push((rng() - 0.5) * 0.5);
  }
  const wO: number[] = [];
  for (let j = 0; j < hiddenSize; j++) wO.push((rng() - 0.5) * 2);
  const bO = (rng() - 0.5) * 0.5;
  return { wH, bH, wO, bO };
}

function forwardPass(
  inputs: number[],
  wH: number[][],
  bH: number[],
  wO: number[],
  bO: number,
) {
  const hiddenRaw: number[] = [];
  const hidden: number[] = [];
  for (let j = 0; j < wH.length; j++) {
    let sum = bH[j];
    for (let i = 0; i < inputs.length; i++) sum += inputs[i] * wH[j][i];
    hiddenRaw.push(sum);
    hidden.push(sigmoid(sum));
  }
  let outRaw = bO;
  for (let j = 0; j < hidden.length; j++) outRaw += hidden[j] * wO[j];
  const output = sigmoid(outRaw);
  return { hiddenRaw, hidden, outRaw, output };
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Network Architecture                                       */
/* ------------------------------------------------------------------ */

const MIN_INPUTS = 1, MAX_INPUTS = 4;
const MIN_HIDDEN = 1, MAX_HIDDEN = 8;

function ArchitectureTab() {
  const [hiddenCount, setHiddenCount] = useState(4);
  const [seed, setSeed] = useState(42);
  const [themeIdx, setThemeIdx] = useState(0);
  const [signalSpeed, setSignalSpeed] = useState(1.4);
  const [inputs, setInputs] = useState<number[]>([0.6, 0.4]);
  const [showWeights, setShowWeights] = useState(false);
  const [autoPulse, setAutoPulse] = useState(true);
  const [showLab, setShowLab] = useState(false);

  // Editable weights/biases live in state so users can tweak them
  const [storedNet, setStoredNet] = useState(() => initWeights(mulberry32(42), 2, 4));
  const [netShape, setNetShape] = useState({ seed: 42, i: 2, h: 4 });

  const theme = THEMES[themeIdx];
  const inputCount = inputs.length;

  // If seed or shape changed, regenerate weights synchronously during render
  // (so the very next render has wH/bH/wO sized to match inputs/hiddenCount)
  let net = storedNet;
  if (netShape.seed !== seed || netShape.i !== inputCount || netShape.h !== hiddenCount) {
    net = initWeights(mulberry32(seed), inputCount, hiddenCount);
    setStoredNet(net);
    setNetShape({ seed, i: inputCount, h: hiddenCount });
  }
  const setNet = setStoredNet;

  const result = useMemo(
    () => forwardPass(inputs, net.wH, net.bH, net.wO, net.bO),
    [net, inputs],
  );

  const handleRandomize = useCallback(() => {
    playPop();
    setSeed((s) => s + 1);
  }, []);

  const addInput = () => {
    if (inputCount >= MAX_INPUTS) return;
    playPop();
    setInputs((arr) => [...arr, 0.5]);
  };
  const removeInput = () => {
    if (inputCount <= MIN_INPUTS) return;
    playPop();
    setInputs((arr) => arr.slice(0, -1));
  };
  const addHidden = () => {
    if (hiddenCount >= MAX_HIDDEN) return;
    playPop();
    setHiddenCount((c) => c + 1);
  };
  const removeHidden = () => {
    if (hiddenCount <= MIN_HIDDEN) return;
    playPop();
    setHiddenCount((c) => c - 1);
  };

  const updateWH = (j: number, i: number, v: number) => {
    setNet((n) => {
      const wH = n.wH.map((row) => row.slice());
      wH[j][i] = v;
      return { ...n, wH };
    });
  };
  const updateBH = (j: number, v: number) => {
    setNet((n) => {
      const bH = n.bH.slice();
      bH[j] = v;
      return { ...n, bH };
    });
  };
  const updateWO = (j: number, v: number) => {
    setNet((n) => {
      const wO = n.wO.slice();
      wO[j] = v;
      return { ...n, wO };
    });
  };
  const updateBO = (v: number) => setNet((n) => ({ ...n, bO: v }));

  const W = 540, H = 280;
  const inputX = 70, hiddenX = 270, outputX = 470;
  const inputYs = Array.from({ length: inputCount }, (_, i) =>
    inputCount === 1 ? H / 2 : 60 + (i * (H - 120)) / (inputCount - 1),
  );
  const hiddenYs = Array.from({ length: hiddenCount }, (_, i) =>
    hiddenCount === 1 ? H / 2 : 40 + (i * (H - 80)) / (hiddenCount - 1),
  );
  const outputY = H / 2;

  // Determine connection strength (for color intensity)
  const maxAbsW = Math.max(
    ...net.wH.flat().map(Math.abs),
    ...net.wO.map(Math.abs),
  );

  return (
    <div className="space-y-5">
      {/* ---------- Toolbar ---------- */}
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-4">
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
                style={{ background: `linear-gradient(135deg, ${t.in} 0%, ${t.hidden} 50%, ${t.out} 100%)` }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-hand text-sm font-bold">Speed:</span>
          <input
            type="range" min={0.4} max={3} step={0.1} value={signalSpeed}
            onChange={(e) => setSignalSpeed(parseFloat(e.target.value))}
            className="w-24" style={{ accentColor: theme.hidden }}
          />
        </div>
        <label className="flex items-center gap-1.5 font-hand text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={showWeights} onChange={(e) => setShowWeights(e.target.checked)} />
          Show weights
        </label>
        <label className="flex items-center gap-1.5 font-hand text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={autoPulse} onChange={(e) => setAutoPulse(e.target.checked)} />
          Pulse signals
        </label>
      </div>

      {/* ---------- Add / Remove neurons ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card-sketchy p-3 flex items-center justify-between" style={{ background: "#fff8e7" }}>
          <span className="font-hand text-sm font-bold">Input neurons</span>
          <div className="flex items-center gap-2">
            <button
              onClick={removeInput}
              disabled={inputCount <= MIN_INPUTS}
              className="w-8 h-8 rounded-lg border-2 border-foreground bg-background hover:bg-accent-coral hover:text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              title="Remove input"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded border-2 border-foreground bg-accent-yellow font-hand font-bold min-w-[2.2rem] text-center">{inputCount}</span>
            <button
              onClick={addInput}
              disabled={inputCount >= MAX_INPUTS}
              className="w-8 h-8 rounded-lg border-2 border-foreground bg-background hover:bg-accent-mint font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              title="Add input"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="card-sketchy p-3 flex items-center justify-between" style={{ background: "#fff8e7" }}>
          <span className="font-hand text-sm font-bold">Hidden neurons</span>
          <div className="flex items-center gap-2">
            <button
              onClick={removeHidden}
              disabled={hiddenCount <= MIN_HIDDEN}
              className="w-8 h-8 rounded-lg border-2 border-foreground bg-background hover:bg-accent-coral hover:text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              title="Remove hidden neuron"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded border-2 border-foreground bg-accent-yellow font-hand font-bold min-w-[2.2rem] text-center">{hiddenCount}</span>
            <button
              onClick={addHidden}
              disabled={hiddenCount >= MAX_HIDDEN}
              className="w-8 h-8 rounded-lg border-2 border-foreground bg-background hover:bg-accent-mint font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              title="Add hidden neuron"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- The network ---------- */}
      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[600px] mx-auto">
          <defs>
            <radialGradient id="nn-in-grad" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor={theme.in} />
            </radialGradient>
            <radialGradient id="nn-h-grad" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor={theme.hidden} />
            </radialGradient>
            <radialGradient id="nn-out-grad" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff8a0" />
              <stop offset="100%" stopColor={theme.out} />
            </radialGradient>
          </defs>

          {/* ---------- Connections: input → hidden ---------- */}
          {inputYs.map((iy, ii) =>
            hiddenYs.map((hy, hi) => {
              const w = net.wH[hi][ii];
              const intensity = Math.abs(w) / (maxAbsW || 1);
              const positive = w >= 0;
              return (
                <g key={`ih-${ii}-${hi}`}>
                  <line
                    x1={inputX + 26} y1={iy} x2={hiddenX - 26} y2={hy}
                    stroke={positive ? theme.hidden : "#ff6b6b"}
                    strokeWidth={1 + intensity * 3}
                    strokeOpacity={0.3 + intensity * 0.7}
                    strokeLinecap="round"
                    className={autoPulse ? "signal-flow" : ""}
                    style={autoPulse ? { animationDuration: `${signalSpeed}s`, color: theme.hidden } : undefined}
                  />
                  {autoPulse && (
                    <circle r={2.5 + intensity * 2} fill={theme.accent} stroke={INK} strokeWidth={0.8}>
                      <animateMotion
                        dur={`${signalSpeed}s`}
                        repeatCount="indefinite"
                        path={`M${inputX + 26},${iy} L${hiddenX - 26},${hy}`}
                      />
                    </circle>
                  )}
                  {showWeights && (
                    <text
                      x={(inputX + 26 + hiddenX - 26) / 2}
                      y={(iy + hy) / 2 - 4}
                      textAnchor="middle"
                      className="text-[9px] font-bold"
                      fill={INK} fontFamily="Kalam"
                    >
                      {w.toFixed(1)}
                    </text>
                  )}
                </g>
              );
            }),
          )}

          {/* ---------- Connections: hidden → output ---------- */}
          {hiddenYs.map((hy, hi) => {
            const w = net.wO[hi];
            const intensity = Math.abs(w) / (maxAbsW || 1);
            const positive = w >= 0;
            return (
              <g key={`ho-${hi}`}>
                <line
                  x1={hiddenX + 26} y1={hy} x2={outputX - 26} y2={outputY}
                  stroke={positive ? theme.out : "#ff6b6b"}
                  strokeWidth={1 + intensity * 3}
                  strokeOpacity={0.3 + intensity * 0.7}
                  strokeLinecap="round"
                  className={autoPulse ? "signal-flow" : ""}
                  style={autoPulse ? { animationDuration: `${signalSpeed}s`, color: theme.out } : undefined}
                />
                {autoPulse && (
                  <circle r={2.5 + intensity * 2} fill={theme.accent} stroke={INK} strokeWidth={0.8}>
                    <animateMotion
                      dur={`${signalSpeed}s`}
                      repeatCount="indefinite"
                      path={`M${hiddenX + 26},${hy} L${outputX - 26},${outputY}`}
                    />
                  </circle>
                )}
                {showWeights && (
                  <text
                    x={(hiddenX + 26 + outputX - 26) / 2}
                    y={(hy + outputY) / 2 - 4}
                    textAnchor="middle"
                    className="text-[9px] font-bold"
                    fill={INK} fontFamily="Kalam"
                  >
                    {w.toFixed(1)}
                  </text>
                )}
              </g>
            );
          })}

          {/* ---------- Input nodes ---------- */}
          {inputYs.map((y, i) => (
            <g key={`in-${i}`}>
              <circle cx={inputX} cy={y} r={26} fill="url(#nn-in-grad)" stroke={INK} strokeWidth={2.5} className="pulse-glow" style={{ color: theme.in }} />
              <text x={inputX} y={y + 5} textAnchor="middle" className="text-[14px] font-bold" fill="#fff" fontFamily="Kalam">
                {inputs[i].toFixed(1)}
              </text>
              <text x={inputX} y={y - 32} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">x{i + 1}</text>
            </g>
          ))}

          {/* ---------- Hidden nodes ---------- */}
          {hiddenYs.map((y, i) => {
            const activation = result.hidden[i];
            return (
              <g key={`h-${i}`}>
                {/* glow ring sized to activation */}
                <circle cx={hiddenX} cy={y} r={24 + activation * 6} fill="none" stroke={theme.hidden} strokeWidth={2} opacity={0.3 + activation * 0.5} className="pulse-glow" style={{ color: theme.hidden }} />
                <circle cx={hiddenX} cy={y} r={24} fill="url(#nn-h-grad)" stroke={INK} strokeWidth={2.5} />
                <text x={hiddenX} y={y + 5} textAnchor="middle" className="text-[12px] font-bold" fill="#fff" fontFamily="Kalam">
                  {activation.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* ---------- Output node ---------- */}
          <g>
            {result.output >= 0.5 && (
              <>
                <circle cx={outputX} cy={outputY} r={32} fill="none" stroke={theme.accent} strokeWidth={3} className="fire-ring" />
                <circle cx={outputX} cy={outputY} r={32} fill="none" stroke={theme.out} strokeWidth={2} className="fire-ring" style={{ animationDelay: "0.4s" }} />
              </>
            )}
            <circle cx={outputX} cy={outputY} r={32} fill="none" stroke={theme.out} strokeWidth={2.5} opacity={0.4} className="pulse-glow" style={{ color: theme.out }} />
            <circle cx={outputX} cy={outputY} r={28} fill="url(#nn-out-grad)" stroke={INK} strokeWidth={2.5} />
            <text x={outputX} y={outputY + 6} textAnchor="middle" className="text-[14px] font-bold" fill={INK} fontFamily="Kalam">
              {result.output.toFixed(3)}
            </text>
            {result.output >= 0.5 && Array.from({ length: 6 }).map((_, k) => {
              const a = (k / 6) * Math.PI * 2;
              return (
                <line key={k}
                  x1={outputX} y1={outputY}
                  x2={outputX + Math.cos(a) * 48} y2={outputY + Math.sin(a) * 48}
                  stroke={theme.accent} strokeWidth={2.2} strokeLinecap="round"
                  className="spark" style={{ animationDelay: `${k * 0.05}s` }}
                />
              );
            })}
          </g>

          {/* ---------- Layer labels ---------- */}
          <text x={inputX} y={28} textAnchor="middle" className="text-[12px] font-bold" fill={INK} fontFamily="Kalam">INPUT</text>
          <text x={hiddenX} y={28} textAnchor="middle" className="text-[12px] font-bold" fill={theme.hidden} fontFamily="Kalam">HIDDEN</text>
          <text x={outputX} y={28} textAnchor="middle" className="text-[12px] font-bold" fill={INK} fontFamily="Kalam">OUTPUT</text>
        </svg>
      </div>

      {/* ---------- Input sliders ---------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {inputs.map((v, i) => (
          <div key={i} className="card-sketchy p-3 space-y-1.5">
            <label className="font-hand text-sm font-bold flex justify-between">
              <span>x{i + 1}</span>
              <span className="px-2 py-0.5 rounded border-2 border-foreground text-xs" style={{ background: theme.in, color: "#fff" }}>{v.toFixed(2)}</span>
            </label>
            <input
              type="range" min={0} max={1} step={0.01} value={v}
              onChange={(e) => {
                playPop();
                const next = inputs.slice();
                next[i] = parseFloat(e.target.value);
                setInputs(next);
              }}
              className="w-full" style={{ accentColor: theme.in }}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <button onClick={handleRandomize} className="btn-sketchy text-sm">
          <Shuffle className="w-4 h-4" />
          Randomize Weights
        </button>
        <button
          onClick={() => { playClick(); setShowLab((v) => !v); }}
          className="btn-sketchy text-sm"
          style={showLab ? { background: theme.hidden, color: "#fff" } : undefined}
        >
          <Sliders className="w-4 h-4" />
          {showLab ? "Hide" : "Open"} Experiment Lab
        </button>
      </div>

      {/* ---------- Experiment Lab: tweak every weight & bias ---------- */}
      {showLab && (
        <div className="card-sketchy p-4 space-y-4" style={{ background: "#fffdf5" }}>
          <div className="font-hand text-base font-bold flex items-center gap-2">
            <Sliders className="w-4 h-4" /> Experiment Lab — tweak weights & biases
          </div>

          {/* Hidden neuron weights */}
          <div className="space-y-3">
            {net.wH.map((row, j) => (
              <div key={`hlab-${j}`} className="border-2 border-foreground/30 rounded-lg p-3" style={{ background: "#fff8e7" }}>
                <div className="font-hand text-sm font-bold mb-2 flex items-center justify-between">
                  <span style={{ color: theme.hidden }}>Hidden h{j + 1}</span>
                  <span className="text-xs text-muted-foreground">activation: {result.hidden[j].toFixed(3)}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {row.map((w, i) => (
                    <label key={`whlab-${j}-${i}`} className="font-hand text-xs flex items-center gap-2">
                      <span className="w-14">w(x{i + 1}→h{j + 1})</span>
                      <input
                        type="range" min={-3} max={3} step={0.05} value={w}
                        onChange={(e) => updateWH(j, i, parseFloat(e.target.value))}
                        className="flex-1" style={{ accentColor: theme.hidden }}
                      />
                      <span className="w-10 text-right font-bold">{w.toFixed(2)}</span>
                    </label>
                  ))}
                  <label className="font-hand text-xs flex items-center gap-2">
                    <span className="w-14">bias b{j + 1}</span>
                    <input
                      type="range" min={-3} max={3} step={0.05} value={net.bH[j]}
                      onChange={(e) => updateBH(j, parseFloat(e.target.value))}
                      className="flex-1" style={{ accentColor: theme.accent }}
                    />
                    <span className="w-10 text-right font-bold">{net.bH[j].toFixed(2)}</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Output weights */}
          <div className="border-2 border-foreground/30 rounded-lg p-3" style={{ background: "#f0fdf4" }}>
            <div className="font-hand text-sm font-bold mb-2 flex items-center justify-between">
              <span style={{ color: theme.out }}>Output</span>
              <span className="text-xs text-muted-foreground">value: {result.output.toFixed(3)}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {net.wO.map((w, j) => (
                <label key={`wolab-${j}`} className="font-hand text-xs flex items-center gap-2">
                  <span className="w-14">w(h{j + 1}→o)</span>
                  <input
                    type="range" min={-3} max={3} step={0.05} value={w}
                    onChange={(e) => updateWO(j, parseFloat(e.target.value))}
                    className="flex-1" style={{ accentColor: theme.out }}
                  />
                  <span className="w-10 text-right font-bold">{w.toFixed(2)}</span>
                </label>
              ))}
              <label className="font-hand text-xs flex items-center gap-2">
                <span className="w-14">bias bo</span>
                <input
                  type="range" min={-3} max={3} step={0.05} value={net.bO}
                  onChange={(e) => updateBO(parseFloat(e.target.value))}
                  className="flex-1" style={{ accentColor: theme.accent }}
                />
                <span className="w-10 text-right font-bold">{net.bO.toFixed(2)}</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          🌐 Each line is a connection  thicker = stronger weight, red = negative. Watch the pulses race from inputs through hidden neurons to the output. Drag the input sliders and the whole network reacts live!
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Layer by Layer                                             */
/* ------------------------------------------------------------------ */

function LayerByLayerTab() {
  const [step, setStep] = useState(0); // 0=idle, 1=hidden, 2=output
  const [inputs, setInputs] = useState([0.7, 0.3]);

  const rng = useMemo(() => mulberry32(99), []);
  const net = useMemo(() => initWeights(rng, 2, 3), [rng]);
  const result = useMemo(() => forwardPass(inputs, net.wH, net.bH, net.wO, net.bO), [net, inputs]);

  const handleStep = useCallback(() => {
    playClick();
    setStep((s) => Math.min(s + 1, 2));
    if (step === 1) playSuccess();
  }, [step]);

  const handleReset = useCallback(() => {
    playClick();
    setStep(0);
  }, []);

  const W = 560, H = 240;
  const inputX = 70, hiddenX = 280, outputX = 480;
  const inputYs = [90, 150];
  const hiddenYs = [60, 120, 180];
  const outputY = 120;

  const highlightHidden = step >= 1;
  const highlightOutput = step >= 2;

  return (
    <div className="space-y-5">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${
              step >= s
                ? "bg-accent-mint text-foreground shadow-[2px_2px_0_#2b2a35]"
                : "bg-background text-muted-foreground"
            }`}
          >
            Step {s}: {s === 1 ? "Compute Hidden" : "Compute Output"}
          </div>
        ))}
      </div>

      {/* Input sliders */}
      <div className="grid grid-cols-2 gap-3">
        {inputs.map((v, i) => (
          <div key={i} className="card-sketchy p-3 space-y-1.5">
            <label className="font-hand text-sm font-bold flex justify-between">
              <span>x{i + 1}</span>
              <span className="px-2 py-0.5 rounded border-2 border-foreground text-xs bg-accent-sky text-white">{v.toFixed(2)}</span>
            </label>
            <input
              type="range" min={0} max={1} step={0.01} value={v}
              onChange={(e) => { playPop(); const next = inputs.slice(); next[i] = parseFloat(e.target.value); setInputs(next); }}
              className="w-full" style={{ accentColor: "#6bb6ff" }}
            />
          </div>
        ))}
      </div>

      <div className="card-sketchy p-3 notebook-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[580px] mx-auto">
          {/* Connections input -> hidden */}
          {inputYs.map((iy, ii) =>
            hiddenYs.map((hy, hi) => (
              <g key={`ih-${ii}-${hi}`}>
                <line
                  x1={inputX + 24} y1={iy} x2={hiddenX - 24} y2={hy}
                  stroke={highlightHidden ? "#b18cf2" : "#cbd5e1"}
                  strokeWidth={highlightHidden ? 2.2 : 1.2}
                  strokeLinecap="round"
                  className={highlightHidden ? "signal-flow" : ""}
                  style={highlightHidden ? { color: "#b18cf2" } : undefined}
                />
                {highlightHidden && (
                  <circle r={3} fill="#ffd93d" stroke={INK} strokeWidth={0.8}>
                    <animateMotion dur="1.2s" repeatCount="indefinite" path={`M${inputX + 24},${iy} L${hiddenX - 24},${hy}`} />
                  </circle>
                )}
              </g>
            )),
          )}

          {/* Connections hidden -> output */}
          {hiddenYs.map((hy, hi) => (
            <g key={`ho-${hi}`}>
              <line
                x1={hiddenX + 24} y1={hy} x2={outputX - 24} y2={outputY}
                stroke={highlightOutput ? "#4ecdc4" : "#cbd5e1"}
                strokeWidth={highlightOutput ? 2.2 : 1.2}
                strokeLinecap="round"
                className={highlightOutput ? "signal-flow" : ""}
                style={highlightOutput ? { color: "#4ecdc4" } : undefined}
              />
              {highlightOutput && (
                <circle r={3} fill="#ffd93d" stroke={INK} strokeWidth={0.8}>
                  <animateMotion dur="1.2s" repeatCount="indefinite" path={`M${hiddenX + 24},${hy} L${outputX - 24},${outputY}`} />
                </circle>
              )}
            </g>
          ))}

          {/* Input nodes */}
          {inputYs.map((y, i) => (
            <g key={`in-${i}`}>
              <circle cx={inputX} cy={y} r={22} fill="#6bb6ff" stroke={INK} strokeWidth={2.5} className="pulse-glow" style={{ color: "#6bb6ff" }} />
              <text x={inputX} y={y + 5} textAnchor="middle" className="text-[13px] font-bold" fill="#fff" fontFamily="Kalam">
                {inputs[i].toFixed(2)}
              </text>
            </g>
          ))}

          {/* Hidden nodes */}
          {hiddenYs.map((y, i) => (
            <g key={`h-${i}`}>
              <circle
                cx={hiddenX} cy={y} r={22}
                fill={highlightHidden ? "#b18cf2" : "#f3efe6"}
                stroke={INK} strokeWidth={2.5}
                className={highlightHidden ? "pulse-glow" : ""}
                style={highlightHidden ? { color: "#b18cf2" } : undefined}
              />
              <text x={hiddenX} y={y + 5} textAnchor="middle" className="text-[12px] font-bold" fill={highlightHidden ? "#fff" : INK} fontFamily="Kalam">
                {highlightHidden ? result.hidden[i].toFixed(2) : "?"}
              </text>
              {highlightHidden && (
                <text x={hiddenX} y={y + 38} textAnchor="middle" className="text-[10px]" fill={INK} fontFamily="Kalam">
                  raw: {result.hiddenRaw[i].toFixed(2)}
                </text>
              )}
            </g>
          ))}

          {/* Output node */}
          <g>
            {highlightOutput && (
              <>
                <circle cx={outputX} cy={outputY} r={32} fill="none" stroke="#4ecdc4" strokeWidth={2.5} className="fire-ring" />
                <circle cx={outputX} cy={outputY} r={32} fill="none" stroke="#ffd93d" strokeWidth={2} className="fire-ring" style={{ animationDelay: "0.5s" }} />
              </>
            )}
            <circle
              cx={outputX} cy={outputY} r={26}
              fill={highlightOutput ? "#4ecdc4" : "#f3efe6"}
              stroke={INK} strokeWidth={2.5}
              className={highlightOutput ? "pulse-glow" : ""}
              style={highlightOutput ? { color: "#4ecdc4" } : undefined}
            />
            <text x={outputX} y={outputY + 6} textAnchor="middle" className="text-[13px] font-bold" fill={highlightOutput ? "#fff" : INK} fontFamily="Kalam">
              {highlightOutput ? result.output.toFixed(3) : "?"}
            </text>
          </g>

          {/* Layer labels */}
          <text x={inputX} y={28} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">INPUT</text>
          <text x={hiddenX} y={28} textAnchor="middle" className="text-[11px] font-bold" fill="#b18cf2" fontFamily="Kalam">HIDDEN</text>
          <text x={outputX} y={28} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">OUTPUT</text>
        </svg>
      </div>

      {/* Step explanations */}
      {step >= 1 && (
        <div className="card-sketchy p-4 animate-fadeIn" style={{ background: "#f0eaff" }}>
          <div className="font-hand text-base font-bold mb-2">
            <span className="marker-highlight-yellow">Step 1:</span> Hidden layer
          </div>
          <div className="font-hand text-sm text-foreground">
            Each hidden neuron computes <b>weighted sum + bias</b>, then applies <b>sigmoid</b>:
          </div>
          <div className="mt-2 space-y-1">
            {hiddenYs.map((_, i) => (
              <div key={i} className="font-hand text-sm bg-background px-3 py-1 rounded border-2 border-foreground/30">
                <span className="text-muted-foreground">h{i + 1} = sigmoid(</span>
                <b>{result.hiddenRaw[i].toFixed(2)}</b>
                <span className="text-muted-foreground">) = </span>
                <span className="font-bold" style={{ color: "#b18cf2" }}>{result.hidden[i].toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {step >= 2 && (
        <div className="card-sketchy p-4 animate-fadeIn" style={{ background: "#e0f7f5" }}>
          <div className="font-hand text-base font-bold mb-2">
            <span className="marker-highlight-mint">Step 2:</span> Output layer
          </div>
          <div className="font-hand text-sm text-foreground">
            The output neuron weights all hidden values, adds bias, applies sigmoid:
          </div>
          <div className="mt-2 font-hand text-sm bg-background px-3 py-1 rounded border-2 border-foreground/30">
            <span className="text-muted-foreground">output = sigmoid(</span>
            <b>{result.outRaw.toFixed(2)}</b>
            <span className="text-muted-foreground">) = </span>
            <span className="font-bold text-base" style={{ color: "#4ecdc4" }}>{result.output.toFixed(4)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button onClick={handleStep} disabled={step >= 2} className="btn-sketchy text-sm disabled:opacity-50">
          <Play className="w-4 h-4" />
          {step === 0 ? "Step 1: Hidden Layer" : step === 1 ? "Step 2: Output" : "Done!"}
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <InfoBox variant="green">
        <span className="font-hand text-base">
          🪜 A forward pass moves data layer by layer. Click step by step and watch the signals light up  first the hidden layer, then the output (with celebration rings 🎉).
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Solving XOR                                                */
/* ------------------------------------------------------------------ */

const XOR_DATA: [number, number, number][] = [
  [0, 0, 0],
  [0, 1, 1],
  [1, 0, 1],
  [1, 1, 0],
];

function SolvingXORTab() {
  const [wH, setWH] = useState([[3, 3], [5, 5]]);
  const [bH, setBH] = useState([-1, -7.5]);
  const [wO, setWO] = useState([5, -5]);
  const [bO, setBO] = useState([-2]);
  const [epoch, setEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [training, setTraining] = useState(false);
  const [trainSpeed, setTrainSpeed] = useState(90);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const predict = useCallback(
    (x1: number, x2: number) => {
      const h0 = sigmoid(wH[0][0] * x1 + wH[0][1] * x2 + bH[0]);
      const h1 = sigmoid(wH[1][0] * x1 + wH[1][1] * x2 + bH[1]);
      return sigmoid(wO[0] * h0 + wO[1] * h1 + bO[0]);
    },
    [wH, bH, wO, bO],
  );

  const handleTrain = useCallback(() => {
    playClick();
    setTraining(true);

    const targetWH = [[5.5, 5.5], [7.2, 7.2]];
    const targetBH = [-2.5, -10.8];
    const targetWO = [10, -10.5];
    const targetBO = [-4.5];
    const totalSteps = 50;
    let currentStep = 0;

    const startWH = wH.map((r) => [...r]);
    const startBH = [...bH];
    const startWO = [...wO];
    const startBO = [...bO];

    const tick = () => {
      if (currentStep >= totalSteps) {
        setTraining(false);
        playSuccess();
        return;
      }
      currentStep++;
      const t = currentStep / totalSteps;
      const ease = t * t * (3 - 2 * t);

      const newWH = startWH.map((row, j) => row.map((w, i) => w + (targetWH[j][i] - w) * ease));
      const newBH = startBH.map((b, j) => b + (targetBH[j] - b) * ease);
      const newWO = startWO.map((w, j) => w + (targetWO[j] - w) * ease);
      const newBO = startBO.map((b, j) => b + (targetBO[j] - b) * ease);

      setWH(newWH);
      setBH(newBH);
      setWO(newWO);
      setBO(newBO);
      setEpoch((e) => e + 1);

      let loss = 0;
      for (const [x1, x2, target] of XOR_DATA) {
        const h0 = sigmoid(newWH[0][0] * x1 + newWH[0][1] * x2 + newBH[0]);
        const h1 = sigmoid(newWH[1][0] * x1 + newWH[1][1] * x2 + newBH[1]);
        const p = sigmoid(newWO[0] * h0 + newWO[1] * h1 + newBO[0]);
        loss += (target - p) * (target - p);
      }
      setLossHistory((prev) => [...prev, loss / XOR_DATA.length]);

      timerRef.current = setTimeout(tick, trainSpeed);
    };
    tick();
  }, [wH, bH, wO, bO, trainSpeed]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTraining(false);
    setWH([[3, 3], [5, 5]]);
    setBH([-1, -7.5]);
    setWO([5, -5]);
    setBO([-2]);
    setEpoch(0);
    setLossHistory([]);
    playClick();
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const plotSize = 240;
  const pad = 30;
  const gridRes = 32;
  const cellW = (plotSize - 2 * pad) / gridRes;

  const cells = useMemo(() => {
    const result: { x: number; y: number; val: number }[] = [];
    for (let i = 0; i < gridRes; i++) {
      for (let j = 0; j < gridRes; j++) {
        const x1 = -0.2 + (i / gridRes) * 1.4;
        const x2 = -0.2 + (j / gridRes) * 1.4;
        result.push({ x: i, y: j, val: predict(x1, x2) });
      }
    }
    return result;
  }, [predict]);

  // Sketchy palette: coral → yellow → mint
  const colorForVal = (v: number) => {
    const t = Math.max(0, Math.min(1, v));
    if (t < 0.5) {
      const k = t / 0.5;
      const r = 255;
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

  const accuracy = XOR_DATA.filter(([x1, x2, t]) => (predict(x1, x2) >= 0.5 ? 1 : 0) === t).length / XOR_DATA.length;

  // Loss curve
  const lossW = 280, lossH = 130, lossPad = 28;

  return (
    <div className="space-y-5">
      <div className="text-center font-hand text-2xl font-bold">
        <span className="marker-highlight-mint">Neural Network</span> solving XOR
      </div>
      <div className="text-center font-hand text-sm text-muted-foreground">
        2 inputs → 2 hidden → 1 output
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Decision boundary heatmap */}
        <div className="card-sketchy p-3">
          <div className="font-hand text-sm font-bold text-center mb-2">Decision Boundary</div>
          <svg viewBox={`0 0 ${plotSize} ${plotSize}`} className="w-full max-w-[280px] mx-auto">
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
            {/* XOR data points with pulsing halos */}
            {XOR_DATA.map(([x1, x2, t], i) => {
              const sx = pad + ((x1 + 0.2) / 1.4) * (plotSize - 2 * pad);
              const sy = plotSize - pad - ((x2 + 0.2) / 1.4) * (plotSize - 2 * pad);
              const correct = (predict(x1, x2) >= 0.5 ? 1 : 0) === t;
              return (
                <g key={i}>
                  {correct && (
                    <circle cx={sx} cy={sy} r={14} fill="none" stroke={t === 1 ? "#4ecdc4" : "#ff6b6b"} strokeWidth={2} opacity={0.5} className="pulse-glow" style={{ color: t === 1 ? "#4ecdc4" : "#ff6b6b" }} />
                  )}
                  <circle cx={sx} cy={sy} r={11} fill={t === 1 ? "#4ecdc4" : "#ff6b6b"} stroke={INK} strokeWidth={2.5} />
                  <text x={sx} y={sy + 4} textAnchor="middle" className="text-[10px] font-bold" fill="#fff" fontFamily="Kalam">{t}</text>
                </g>
              );
            })}
            <text x={plotSize / 2} y={plotSize - 10} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">x1</text>
            <text x={12} y={plotSize / 2} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam" transform={`rotate(-90 12 ${plotSize / 2})`}>x2</text>
          </svg>
        </div>

        {/* Loss curve */}
        <div className="card-sketchy p-3">
          <div className="font-hand text-sm font-bold text-center mb-2">Loss over Epochs</div>
          <svg viewBox={`0 0 ${lossW} ${lossH}`} className="w-full max-w-[300px] mx-auto">
            <defs>
              <pattern id="loss-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={INK} strokeOpacity="0.08" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x={lossPad} y={10} width={lossW - 2 * lossPad} height={lossH - lossPad - 10} fill="#fffdf5" stroke={INK} strokeWidth={2} rx={4} />
            <rect x={lossPad} y={10} width={lossW - 2 * lossPad} height={lossH - lossPad - 10} fill="url(#loss-grid)" />

            {lossHistory.length > 1 && (() => {
              const maxLoss = Math.max(...lossHistory, 0.01);
              const pts = lossHistory.map((l, i) => {
                const x = lossPad + (i / Math.max(lossHistory.length - 1, 1)) * (lossW - 2 * lossPad);
                const y = lossH - lossPad - (l / maxLoss) * (lossH - lossPad - 20);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              return (
                <>
                  {/* glow underlay */}
                  <polyline points={pts.join(" ")} fill="none" stroke="#ff6b6b" strokeWidth={6} opacity={0.3} strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={pts.join(" ")} fill="none" stroke="#ff6b6b" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  {/* Latest point dot */}
                  {(() => {
                    const i = lossHistory.length - 1;
                    const x = lossPad + (i / Math.max(lossHistory.length - 1, 1)) * (lossW - 2 * lossPad);
                    const y = lossH - lossPad - (lossHistory[i] / maxLoss) * (lossH - lossPad - 20);
                    return <circle cx={x} cy={y} r={5} fill="#ffd93d" stroke={INK} strokeWidth={2} className="pulse-glow" style={{ color: "#ffd93d" }} />;
                  })()}
                </>
              );
            })()}

            <text x={lossW / 2} y={lossH - 6} textAnchor="middle" className="text-[10px] font-bold" fill={INK} fontFamily="Kalam">Epoch</text>
            <text x={10} y={lossH / 2} textAnchor="middle" className="text-[10px] font-bold" fill={INK} fontFamily="Kalam" transform={`rotate(-90 10 ${lossH / 2})`}>Loss</text>
          </svg>
        </div>
      </div>

      {/* Predictions table */}
      <div className="card-sketchy overflow-hidden max-w-md mx-auto">
        <table className="w-full font-hand text-sm">
          <thead>
            <tr className="bg-accent-yellow border-b-2 border-foreground">
              <th className="px-3 py-2">x1</th>
              <th className="px-3 py-2">x2</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Output</th>
            </tr>
          </thead>
          <tbody>
            {XOR_DATA.map(([x1, x2, t], i) => {
              const out = predict(x1, x2);
              const rounded = out >= 0.5 ? 1 : 0;
              const ok = rounded === t;
              return (
                <tr key={i} className="border-t-2 border-dashed border-foreground/30">
                  <td className="px-3 py-2 text-center font-bold">{x1}</td>
                  <td className="px-3 py-2 text-center font-bold">{x2}</td>
                  <td className="px-3 py-2 text-center font-bold">{t}</td>
                  <td className={`px-3 py-2 text-center font-bold ${ok ? "text-emerald-600" : "text-red-500"}`}>
                    {out.toFixed(3)} {ok ? "✓" : "✗"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="card-sketchy p-3 max-w-md mx-auto" style={{ background: "#fff8e7" }}>
        <div className="flex flex-wrap gap-2 justify-center font-hand text-xs mb-2">
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-lav text-white">epoch <b>{epoch}</b></span>
          {lossHistory.length > 0 && (
            <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">loss <b>{lossHistory[lossHistory.length - 1].toFixed(4)}</b></span>
          )}
        </div>
        <div className="h-3 rounded-full border-2 border-foreground bg-background overflow-hidden">
          <div className="h-full transition-all duration-300" style={{ width: `${accuracy * 100}%`, background: accuracy === 1 ? "#4ecdc4" : "#ffd93d" }} />
        </div>
        <div className="text-center font-hand text-xs mt-1">{Math.round(accuracy * 100)}% accuracy</div>
        {accuracy === 1 && epoch > 0 && (
          <div className="text-center font-hand text-base font-bold marker-highlight-mint mt-1">
            🎉 XOR solved!
          </div>
        )}
      </div>

      {/* Train speed */}
      <div className="card-sketchy p-3 max-w-md mx-auto">
        <label className="font-hand text-xs font-bold flex justify-between">
          <span>Train Speed</span><span>{trainSpeed}ms</span>
        </label>
        <input type="range" min={30} max={300} step={10} value={trainSpeed} onChange={(e) => setTrainSpeed(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#4ecdc4" }} />
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={handleTrain} disabled={training} className="btn-sketchy text-sm disabled:opacity-50">
          <Zap className="w-4 h-4" />
          {training ? "Training…" : "Train Network"}
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <InfoBox variant="indigo" title="XOR Solved!">
        <span className="font-hand text-base">
          🧠 A multi-layer network solves XOR because the hidden layer transforms the data into a new space where it becomes linearly separable. Watch the decision boundary morph and the loss curve plummet during training!
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
    question: "What is a 'hidden layer' in a neural network?",
    options: [
      "A layer that is invisible to the programmer",
      "A layer between the input and output that transforms data",
      "An extra output layer",
      "A layer that stores the training data",
    ],
    correctIndex: 1,
    explanation:
      "Hidden layers sit between input and output. They transform the data into representations that make the final output easier to compute.",
  },
  {
    question: "Why can a multi-layer network solve XOR but a single perceptron cannot?",
    options: [
      "It runs faster",
      "It uses more memory",
      "Hidden layers create non-linear decision boundaries",
      "It has more input nodes",
    ],
    correctIndex: 2,
    explanation:
      "The hidden layer transforms the input space so that the XOR pattern becomes linearly separable for the output layer.",
  },
  {
    question: "What happens during a 'forward pass'?",
    options: [
      "Weights are updated",
      "Data flows from input through all layers to produce an output",
      "The network is reset",
      "Errors are calculated backward",
    ],
    correctIndex: 1,
    explanation:
      "A forward pass sends input data through the network layer by layer, computing activations until the output is produced.",
  },
  {
    question: "What does adding more hidden neurons generally allow a network to do?",
    options: [
      "Learn simpler patterns only",
      "Run faster",
      "Learn more complex patterns",
      "Use less memory",
    ],
    correctIndex: 2,
    explanation:
      "More hidden neurons give the network more capacity to represent complex patterns and decision boundaries.",
  },
  {
    question: "In a forward pass, which layer is computed first?",
    options: [
      "Output layer",
      "The layer closest to the input (hidden layer)",
      "All layers at the same time",
      "A random layer",
    ],
    correctIndex: 1,
    explanation:
      "In a forward pass, computation goes left to right: input layer values feed into the hidden layer, then hidden layer outputs feed into the output layer.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function L20_NeuralNetworkActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "architecture",
        label: "Network Architecture",
        icon: <Network className="w-4 h-4" />,
        content: <ArchitectureTab />,
      },
      {
        id: "layer-by-layer",
        label: "Layer by Layer",
        icon: <Layers className="w-4 h-4" />,
        content: <LayerByLayerTab />,
      },
      {
        id: "solving-xor",
        label: "Solving XOR",
        icon: <Target className="w-4 h-4" />,
        content: <SolvingXORTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Building a Neural Network"
      level={6}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Learn backpropagation -- how neural networks actually learn!"
      story={
        <StorySection
          paragraphs={[
            "Aru was still puzzled by the XOR problem from the last lesson.",
            "Aru: \"So if one perceptron can't solve XOR, what do we do? Just give up?\"",
            "Byte: \"Never! We connect them into layers! Input goes to a Hidden layer, which goes to an Output layer. Each layer transforms the data in a new way. Together, they can learn anything!\"",
            "Aru: \"So it's like a team of neurons working together?\"",
            "Byte: \"Exactly! One neuron might not be smart enough, but a network of neurons can solve incredibly complex problems. Let me show you how to build one!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A neural network connects neurons in layers: Input, Hidden, and Output. The hidden layer transforms data into a new representation where previously impossible problems (like XOR) become solvable. More neurons and layers = more learning power."
        />
      }
    />
  );
}
