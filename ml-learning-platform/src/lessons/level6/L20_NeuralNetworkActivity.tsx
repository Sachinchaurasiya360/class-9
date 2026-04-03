import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Network, Layers, Target } from "lucide-react";
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
/*  Tab 1 — Network Architecture                                       */
/* ------------------------------------------------------------------ */

function ArchitectureTab() {
  const [hiddenCount, setHiddenCount] = useState(3);
  const [seed, setSeed] = useState(42);
  const [animating, setAnimating] = useState(false);
  const [activeEdges, setActiveEdges] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rng = useMemo(() => mulberry32(seed), [seed]);
  const net = useMemo(() => initWeights(rng, 2, hiddenCount), [rng, hiddenCount]);
  const inputs = [0.6, 0.4];
  const result = useMemo(() => forwardPass(inputs, net.wH, net.bH, net.wO, net.bO), [net]);

  const handleForward = useCallback(() => {
    playClick();
    setAnimating(true);
    setActiveEdges(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActiveEdges(true);
      setAnimating(false);
      playSuccess();
    }, 800);
  }, []);

  const handleRandomize = useCallback(() => {
    playPop();
    setSeed((s) => s + 1);
    setActiveEdges(false);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const W = 480, H = 240;
  const inputX = 60, hiddenX = 240, outputX = 420;
  const inputYs = [90, 150];
  const hiddenYs = Array.from({ length: hiddenCount }, (_, i) =>
    40 + (i * (H - 80)) / Math.max(hiddenCount - 1, 1),
  );
  const outputY = H / 2;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">
          Hidden neurons: <span className="font-bold text-indigo-700">{hiddenCount}</span>
        </label>
        <input
          type="range" min={1} max={5} step={1} value={hiddenCount}
          onChange={(e) => { playPop(); setHiddenCount(parseInt(e.target.value)); setActiveEdges(false); }}
          className="w-full accent-indigo-600"
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[480px] mx-auto">
        <defs>
          <marker id="na-arrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <path d="M0,0 L6,2.5 L0,5 Z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Connections: input -> hidden */}
        {inputYs.map((iy, ii) =>
          hiddenYs.map((hy, hi) => (
            <line
              key={`ih-${ii}-${hi}`}
              x1={inputX + 22} y1={iy} x2={hiddenX - 22} y2={hy}
              stroke={activeEdges ? "#6366f1" : "#e2e8f0"}
              strokeWidth={activeEdges ? 1.5 : 1}
              className="transition-all duration-500"
              markerEnd={activeEdges ? "url(#na-arrow)" : undefined}
            />
          )),
        )}

        {/* Connections: hidden -> output */}
        {hiddenYs.map((hy, hi) => (
          <line
            key={`ho-${hi}`}
            x1={hiddenX + 22} y1={hy} x2={outputX - 22} y2={outputY}
            stroke={activeEdges ? "#22c55e" : "#e2e8f0"}
            strokeWidth={activeEdges ? 1.5 : 1}
            className="transition-all duration-500"
            markerEnd={activeEdges ? "url(#na-arrow)" : undefined}
          />
        ))}

        {/* Input nodes */}
        {inputYs.map((y, i) => (
          <g key={`in-${i}`}>
            <circle cx={inputX} cy={y} r={20} fill="#3b82f6" opacity={0.15} />
            <circle cx={inputX} cy={y} r={16} fill="#3b82f6" />
            <text x={inputX} y={y + 4} textAnchor="middle" className="text-[11px] fill-white font-bold">
              {inputs[i]}
            </text>
            <text x={inputX} y={y - 22} textAnchor="middle" className="text-[9px] fill-slate-400 font-medium">
              x{i + 1}
            </text>
          </g>
        ))}

        {/* Hidden nodes */}
        {hiddenYs.map((y, i) => (
          <g key={`h-${i}`}>
            <circle cx={hiddenX} cy={y} r={20} fill="#8b5cf6" opacity={0.15} />
            <circle cx={hiddenX} cy={y} r={16} fill="#8b5cf6" />
            <text x={hiddenX} y={y + 4} textAnchor="middle" className="text-[10px] fill-white font-bold">
              {activeEdges ? result.hidden[i]?.toFixed(2) ?? "?" : "h" + (i + 1)}
            </text>
          </g>
        ))}

        {/* Output node */}
        <circle cx={outputX} cy={outputY} r={22} fill={activeEdges ? "#22c55e" : "#94a3b8"} opacity={0.15} />
        <circle cx={outputX} cy={outputY} r={18} fill={activeEdges ? "#22c55e" : "#94a3b8"} className="transition-all duration-500" />
        <text x={outputX} y={outputY + 4} textAnchor="middle" className="text-[11px] fill-white font-bold">
          {activeEdges ? result.output.toFixed(3) : "out"}
        </text>

        {/* Layer labels */}
        <text x={inputX} y={20} textAnchor="middle" className="text-[9px] fill-slate-400 font-medium">INPUT</text>
        <text x={hiddenX} y={20} textAnchor="middle" className="text-[9px] fill-purple-400 font-medium">HIDDEN</text>
        <text x={outputX} y={20} textAnchor="middle" className="text-[9px] fill-slate-400 font-medium">OUTPUT</text>
      </svg>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleForward}
          disabled={animating}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-sm"
        >
          {animating ? "Computing..." : "Forward Pass"}
        </button>
        <button
          onClick={handleRandomize}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
        >
          Randomize Weights
        </button>
      </div>

      <InfoBox variant="blue">
        Click "Forward Pass" to see values flow from input through hidden neurons to the output. Each connection has a weight that multiplies the signal. Try different numbers of hidden neurons!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Layer by Layer                                             */
/* ------------------------------------------------------------------ */

function LayerByLayerTab() {
  const [step, setStep] = useState(0); // 0=idle, 1=hidden, 2=output

  const rng = useMemo(() => mulberry32(99), []);
  const net = useMemo(() => initWeights(rng, 2, 3), [rng]);
  const inputs = [0.7, 0.3];
  const result = useMemo(() => forwardPass(inputs, net.wH, net.bH, net.wO, net.bO), [net]);

  const handleStep = useCallback(() => {
    playClick();
    setStep((s) => Math.min(s + 1, 2));
    if (step === 1) playSuccess();
  }, [step]);

  const handleReset = useCallback(() => {
    playClick();
    setStep(0);
  }, []);

  const W = 500, H = 200;
  const inputX = 60, hiddenX = 250, outputX = 440;
  const inputYs = [70, 130];
  const hiddenYs = [50, 100, 150];
  const outputY = 100;

  const highlightInput = step >= 1;
  const highlightHidden = step >= 1;
  const highlightOutput = step >= 2;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-3">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              step >= s
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-400 border-slate-200"
            }`}
          >
            Step {s}: {s === 1 ? "Compute Hidden" : "Compute Output"}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[500px] mx-auto">
        {/* Connections input -> hidden */}
        {inputYs.map((iy, ii) =>
          hiddenYs.map((hy, hi) => (
            <line
              key={`ih-${ii}-${hi}`}
              x1={inputX + 20} y1={iy} x2={hiddenX - 20} y2={hy}
              stroke={highlightInput ? "#6366f1" : "#e2e8f0"}
              strokeWidth={highlightInput ? 1.5 : 1}
              className="transition-all duration-300"
            />
          )),
        )}
        {/* Connections hidden -> output */}
        {hiddenYs.map((hy, hi) => (
          <line
            key={`ho-${hi}`}
            x1={hiddenX + 20} y1={hy} x2={outputX - 20} y2={outputY}
            stroke={highlightOutput ? "#22c55e" : "#e2e8f0"}
            strokeWidth={highlightOutput ? 1.5 : 1}
            className="transition-all duration-300"
          />
        ))}

        {/* Input nodes */}
        {inputYs.map((y, i) => (
          <g key={`in-${i}`}>
            <circle cx={inputX} cy={y} r={18} fill="#3b82f6" />
            <text x={inputX} y={y + 4} textAnchor="middle" className="text-[11px] fill-white font-bold">{inputs[i]}</text>
          </g>
        ))}

        {/* Hidden nodes */}
        {hiddenYs.map((y, i) => (
          <g key={`h-${i}`}>
            <circle
              cx={hiddenX} cy={y} r={18}
              fill={highlightHidden ? "#8b5cf6" : "#cbd5e1"}
              className="transition-all duration-300"
            />
            <text x={hiddenX} y={y + 4} textAnchor="middle" className="text-[10px] fill-white font-bold">
              {highlightHidden ? result.hidden[i].toFixed(2) : "?"}
            </text>
            {highlightHidden && (
              <text x={hiddenX} y={y + 32} textAnchor="middle" className="text-[8px] fill-slate-500">
                raw: {result.hiddenRaw[i].toFixed(2)}
              </text>
            )}
          </g>
        ))}

        {/* Output node */}
        <circle
          cx={outputX} cy={outputY} r={20}
          fill={highlightOutput ? "#22c55e" : "#cbd5e1"}
          className="transition-all duration-300"
        />
        <text x={outputX} y={outputY + 5} textAnchor="middle" className="text-[11px] fill-white font-bold">
          {highlightOutput ? result.output.toFixed(3) : "?"}
        </text>

        {/* Layer labels */}
        <text x={inputX} y={25} textAnchor="middle" className="text-[9px] fill-slate-400 font-medium">INPUT</text>
        <text x={hiddenX} y={25} textAnchor="middle" className="text-[9px] fill-purple-400 font-medium">HIDDEN</text>
        <text x={outputX} y={25} textAnchor="middle" className="text-[9px] fill-slate-400 font-medium">OUTPUT</text>
      </svg>

      {/* Explanation text */}
      {step >= 1 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-800">
          <span className="font-bold">Step 1:</span> Each hidden neuron computes a weighted sum of inputs + bias, then applies sigmoid.
          {hiddenYs.map((_, i) => (
            <div key={i} className="font-mono mt-1">
              h{i + 1} = sigmoid({result.hiddenRaw[i].toFixed(2)}) = {result.hidden[i].toFixed(3)}
            </div>
          ))}
        </div>
      )}
      {step >= 2 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
          <span className="font-bold">Step 2:</span> The output neuron takes all hidden outputs, weights them, adds bias, applies sigmoid.
          <div className="font-mono mt-1">
            output = sigmoid({result.outRaw.toFixed(2)}) = {result.output.toFixed(4)}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleStep}
          disabled={step >= 2}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-sm"
        >
          {step === 0 ? "Step 1: Hidden Layer" : step === 1 ? "Step 2: Output" : "Done!"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
        >
          Reset
        </button>
      </div>

      <InfoBox variant="green">
        A forward pass moves data layer by layer: first computing hidden activations, then the output. Each step transforms the data into a new representation.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Solving XOR                                                */
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

    // We use pre-computed good weights and interpolate toward them
    const targetWH = [[5.5, 5.5], [7.2, 7.2]];
    const targetBH = [-2.5, -10.8];
    const targetWO = [10, -10.5];
    const targetBO = [-4.5];
    const totalSteps = 40;
    let currentStep = 0;

    // Capture starting weights
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
      const ease = t * t * (3 - 2 * t); // smoothstep

      const newWH = startWH.map((row, j) =>
        row.map((w, i) => w + (targetWH[j][i] - w) * ease),
      );
      const newBH = startBH.map((b, j) => b + (targetBH[j] - b) * ease);
      const newWO = startWO.map((w, j) => w + (targetWO[j] - w) * ease);
      const newBO = startBO.map((b, j) => b + (targetBO[j] - b) * ease);

      setWH(newWH);
      setBH(newBH);
      setWO(newWO);
      setBO(newBO);
      setEpoch((e) => e + 1);

      // Compute loss with new weights
      let loss = 0;
      for (const [x1, x2, target] of XOR_DATA) {
        const h0 = sigmoid(newWH[0][0] * x1 + newWH[0][1] * x2 + newBH[0]);
        const h1 = sigmoid(newWH[1][0] * x1 + newWH[1][1] * x2 + newBH[1]);
        const p = sigmoid(newWO[0] * h0 + newWO[1] * h1 + newBO[0]);
        loss += (target - p) * (target - p);
      }
      setLossHistory((prev) => [...prev, loss / XOR_DATA.length]);

      timerRef.current = setTimeout(tick, 100);
    };
    tick();
  }, [wH, bH, wO, bO]);

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

  // Decision boundary heatmap
  const plotSize = 180;
  const pad = 25;
  const gridRes = 25;
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

  const colorForVal = (v: number) => {
    const t = Math.max(0, Math.min(1, v));
    const r = Math.round(239 + (34 - 239) * t);
    const g = Math.round(68 + (197 - 68) * t);
    const b = Math.round(68 + (94 - 68) * t);
    return `rgb(${r},${g},${b})`;
  };

  // Loss curve
  const lossW = 180, lossH = 100, lossPad = 20;

  return (
    <div className="space-y-4">
      <div className="text-center text-sm font-semibold text-slate-700">
        Neural Network solving XOR (2 inputs, 2 hidden, 1 output)
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* Decision boundary heatmap */}
        <div>
          <svg viewBox={`0 0 ${plotSize} ${plotSize}`} className="w-44 h-44">
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
            <rect x={pad} y={pad} width={plotSize - 2 * pad} height={plotSize - 2 * pad} fill="none" stroke="#cbd5e1" />
            {/* XOR data points */}
            {XOR_DATA.map(([x1, x2, t], i) => {
              const sx = pad + ((x1 + 0.2) / 1.4) * (plotSize - 2 * pad);
              const sy = plotSize - pad - ((x2 + 0.2) / 1.4) * (plotSize - 2 * pad);
              return (
                <circle
                  key={i}
                  cx={sx} cy={sy} r={7}
                  fill={t === 1 ? "#22c55e" : "#ef4444"}
                  stroke="white" strokeWidth={2}
                />
              );
            })}
            <text x={plotSize / 2} y={plotSize - 5} textAnchor="middle" className="text-[8px] fill-slate-500">x1</text>
            <text x={6} y={plotSize / 2} textAnchor="middle" className="text-[8px] fill-slate-500" transform={`rotate(-90 6 ${plotSize / 2})`}>x2</text>
          </svg>
          <p className="text-center text-[10px] text-slate-500 mt-1">Decision Boundary</p>
        </div>

        {/* Loss curve */}
        <div>
          <svg viewBox={`0 0 ${lossW} ${lossH}`} className="w-44 h-24">
            <rect x={lossPad} y={5} width={lossW - 2 * lossPad} height={lossH - lossPad - 5} fill="#f8fafc" stroke="#e2e8f0" rx={3} />
            {lossHistory.length > 1 && (() => {
              const maxLoss = Math.max(...lossHistory, 0.01);
              const pts = lossHistory.map((l, i) => {
                const x = lossPad + (i / (lossHistory.length - 1)) * (lossW - 2 * lossPad);
                const y = lossH - lossPad - (l / maxLoss) * (lossH - lossPad - 10);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              return <polyline points={pts.join(" ")} fill="none" stroke="#ef4444" strokeWidth={1.5} />;
            })()}
            <text x={lossW / 2} y={lossH - 2} textAnchor="middle" className="text-[8px] fill-slate-500">Epoch</text>
            <text x={8} y={lossH / 2} textAnchor="middle" className="text-[8px] fill-slate-500" transform={`rotate(-90 8 ${lossH / 2})`}>Loss</text>
          </svg>
          <p className="text-center text-[10px] text-slate-500 mt-1">Loss Curve</p>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mx-auto" style={{ maxWidth: 300 }}>
        <table className="text-xs w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-3 py-1.5 text-slate-600">x1</th>
              <th className="px-3 py-1.5 text-slate-600">x2</th>
              <th className="px-3 py-1.5 text-slate-600">Target</th>
              <th className="px-3 py-1.5 text-slate-600">Output</th>
            </tr>
          </thead>
          <tbody>
            {XOR_DATA.map(([x1, x2, t], i) => {
              const out = predict(x1, x2);
              const rounded = out >= 0.5 ? 1 : 0;
              return (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-1.5 text-center font-mono">{x1}</td>
                  <td className="px-3 py-1.5 text-center font-mono">{x2}</td>
                  <td className="px-3 py-1.5 text-center font-mono font-bold">{t}</td>
                  <td className={`px-3 py-1.5 text-center font-mono font-bold ${
                    rounded === t ? "text-green-600" : "text-red-500"
                  }`}>
                    {out.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-center text-xs text-slate-500 font-mono">
        Epoch: {epoch}
        {lossHistory.length > 0 && ` | Loss: ${lossHistory[lossHistory.length - 1].toFixed(4)}`}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleTrain}
          disabled={training}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-all shadow-sm"
        >
          {training ? "Training..." : "Train Network"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
        >
          Reset
        </button>
      </div>

      <InfoBox variant="indigo" title="XOR Solved!">
        A multi-layer network can solve XOR because the hidden layer transforms the data into a new space where it becomes linearly separable. Watch the decision boundary curve as training progresses!
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
