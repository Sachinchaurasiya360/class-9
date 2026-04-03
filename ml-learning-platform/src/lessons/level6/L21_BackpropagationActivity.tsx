import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowLeftRight, Link2, Play } from "lucide-react";
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
/*  Neural net helpers                                                 */
/* ------------------------------------------------------------------ */

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const sigmoidDeriv = (x: number) => { const s = sigmoid(x); return s * (1 - s); };

/* ------------------------------------------------------------------ */
/*  Tab 1 — Error Flows Backward                                       */
/* ------------------------------------------------------------------ */

function ErrorFlowsTab() {
  const [phase, setPhase] = useState<"forward" | "error" | "backprop" | "updated">("forward");
  const [seed, setSeed] = useState(21);

  const rng = useMemo(() => mulberry32(seed), [seed]);

  const net = useMemo(() => {
    const r = rng;
    return {
      wH: [[r() * 2 - 1, r() * 2 - 1], [r() * 2 - 1, r() * 2 - 1]],
      bH: [r() * 0.4 - 0.2, r() * 0.4 - 0.2],
      wO: [r() * 2 - 1, r() * 2 - 1],
      bO: r() * 0.4 - 0.2,
    };
  }, [rng]);

  const inputs = [0.5, 0.8];
  const target = 1.0;

  // Forward pass
  const h0Raw = net.wH[0][0] * inputs[0] + net.wH[0][1] * inputs[1] + net.bH[0];
  const h1Raw = net.wH[1][0] * inputs[0] + net.wH[1][1] * inputs[1] + net.bH[1];
  const h0 = sigmoid(h0Raw);
  const h1 = sigmoid(h1Raw);
  const oRaw = net.wO[0] * h0 + net.wO[1] * h1 + net.bO;
  const output = sigmoid(oRaw);
  const error = target - output;

  // Backprop gradients
  const dOut = error * sigmoidDeriv(oRaw);
  const dH0 = dOut * net.wO[0] * sigmoidDeriv(h0Raw);
  const dH1 = dOut * net.wO[1] * sigmoidDeriv(h1Raw);

  // Updated weights (for display)
  const lr = 0.5;
  const newWO = [net.wO[0] + lr * dOut * h0, net.wO[1] + lr * dOut * h1];
  const newWH0 = [net.wH[0][0] + lr * dH0 * inputs[0], net.wH[0][1] + lr * dH0 * inputs[1]];
  const newWH1 = [net.wH[1][0] + lr * dH1 * inputs[0], net.wH[1][1] + lr * dH1 * inputs[1]];

  const handleNext = useCallback(() => {
    playClick();
    setPhase((p) => {
      if (p === "forward") return "error";
      if (p === "error") return "backprop";
      if (p === "backprop") { playSuccess(); return "updated"; }
      return "forward";
    });
  }, []);

  const handleReset = useCallback(() => {
    playClick();
    setPhase("forward");
    setSeed((s) => s + 1);
  }, []);

  const W = 500, H = 200;
  const inX = 55, hX = 230, oX = 415;
  const inYs = [70, 130];
  const hYs = [70, 130];
  const oY = 100;

  const showError = phase === "error" || phase === "backprop" || phase === "updated";
  const showGrad = phase === "backprop" || phase === "updated";
  const showUpdated = phase === "updated";

  const edgeColor = (grad: number) => {
    if (!showGrad) return "#cbd5e1";
    return grad > 0 ? "#3b82f6" : "#ef4444";
  };
  const edgeWidth = (grad: number) => {
    if (!showGrad) return 1;
    return 1 + Math.min(Math.abs(grad) * 8, 3);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center flex-wrap">
        {(["forward", "error", "backprop", "updated"] as const).map((p, i) => (
          <div
            key={p}
            className={`px-2 py-1 rounded text-[10px] font-semibold border transition-all ${
              phase === p
                ? "bg-indigo-600 text-white border-indigo-600"
                : i <= ["forward", "error", "backprop", "updated"].indexOf(phase)
                  ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                  : "bg-white text-slate-400 border-slate-200"
            }`}
          >
            {p === "forward" ? "1. Forward" : p === "error" ? "2. Error" : p === "backprop" ? "3. Backprop" : "4. Updated"}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[500px] mx-auto">
        {/* Connections: input -> hidden */}
        {inYs.map((iy, ii) =>
          hYs.map((hy, hi) => (
            <line
              key={`ih-${ii}-${hi}`}
              x1={inX + 20} y1={iy} x2={hX - 20} y2={hy}
              stroke={edgeColor(hi === 0 ? dH0 : dH1)}
              strokeWidth={edgeWidth(hi === 0 ? dH0 : dH1)}
              className="transition-all duration-300"
            />
          )),
        )}
        {/* Connections: hidden -> output */}
        {hYs.map((hy, hi) => (
          <line
            key={`ho-${hi}`}
            x1={hX + 20} y1={hy} x2={oX - 22} y2={oY}
            stroke={edgeColor(dOut)}
            strokeWidth={edgeWidth(dOut)}
            className="transition-all duration-300"
          />
        ))}

        {/* Input nodes */}
        {inYs.map((y, i) => (
          <g key={`in-${i}`}>
            <circle cx={inX} cy={y} r={18} fill="#3b82f6" />
            <text x={inX} y={y + 4} textAnchor="middle" className="text-[11px] fill-white font-bold">{inputs[i]}</text>
            <text x={inX} y={y - 24} textAnchor="middle" className="text-[9px] fill-slate-400">x{i + 1}</text>
          </g>
        ))}

        {/* Hidden nodes */}
        {hYs.map((y, i) => (
          <g key={`h-${i}`}>
            <circle cx={hX} cy={y} r={18} fill={showGrad ? "#8b5cf6" : "#a78bfa"} className="transition-all duration-300" />
            <text x={hX} y={y + 4} textAnchor="middle" className="text-[10px] fill-white font-bold">
              {(i === 0 ? h0 : h1).toFixed(2)}
            </text>
            {showGrad && (
              <text x={hX} y={y + 34} textAnchor="middle" className="text-[8px] fill-red-500 font-mono">
                d={(i === 0 ? dH0 : dH1).toFixed(3)}
              </text>
            )}
          </g>
        ))}

        {/* Output node */}
        <circle cx={oX} cy={oY} r={20} fill={showError ? (error > 0 ? "#f59e0b" : "#ef4444") : "#22c55e"} className="transition-all duration-300" />
        <text x={oX} y={oY + 5} textAnchor="middle" className="text-[11px] fill-white font-bold">
          {output.toFixed(2)}
        </text>
        {showError && (
          <text x={oX} y={oY + 36} textAnchor="middle" className="text-[9px] fill-red-600 font-bold">
            err={error.toFixed(3)}
          </text>
        )}

        {/* Target */}
        <text x={oX + 35} y={oY - 10} className="text-[9px] fill-slate-400">target</text>
        <text x={oX + 35} y={oY + 5} className="text-[12px] fill-slate-700 font-bold">{target}</text>

        {/* Labels */}
        <text x={inX} y={25} textAnchor="middle" className="text-[9px] fill-slate-400 font-medium">INPUT</text>
        <text x={hX} y={25} textAnchor="middle" className="text-[9px] fill-purple-400 font-medium">HIDDEN</text>
        <text x={oX} y={25} textAnchor="middle" className="text-[9px] fill-slate-400 font-medium">OUTPUT</text>

        {/* Backprop arrows */}
        {showGrad && (
          <>
            <text x={320} y={oY - 12} textAnchor="middle" className="text-[8px] fill-red-500 font-bold">
              error flows back
            </text>
            <line x1={oX - 22} y1={oY - 5} x2={hX + 25} y2={hYs[0] - 5} stroke="#ef4444" strokeWidth={1} strokeDasharray="4 2" />
            <line x1={oX - 22} y1={oY + 5} x2={hX + 25} y2={hYs[1] + 5} stroke="#ef4444" strokeWidth={1} strokeDasharray="4 2" />
          </>
        )}
      </svg>

      {/* Weight updates display */}
      {showUpdated && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800 space-y-1">
          <div className="font-bold">Weights updated!</div>
          <div className="font-mono">wO: [{net.wO[0].toFixed(3)}, {net.wO[1].toFixed(3)}] =&gt; [{newWO[0].toFixed(3)}, {newWO[1].toFixed(3)}]</div>
          <div className="font-mono">wH1: [{net.wH[0][0].toFixed(3)}, {net.wH[0][1].toFixed(3)}] =&gt; [{newWH0[0].toFixed(3)}, {newWH0[1].toFixed(3)}]</div>
          <div className="font-mono">wH2: [{net.wH[1][0].toFixed(3)}, {net.wH[1][1].toFixed(3)}] =&gt; [{newWH1[0].toFixed(3)}, {newWH1[1].toFixed(3)}]</div>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleNext}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
        >
          {phase === "forward" ? "Show Error" : phase === "error" ? "Backpropagate" : phase === "backprop" ? "Update Weights" : "Start Over"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
        >
          New Weights
        </button>
      </div>

      <InfoBox variant="blue">
        Backpropagation works in 4 steps: Forward pass to compute output, measure the error, send error gradients backward through the network, then update each weight based on how much it contributed to the error.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Chain Rule Visualized                                      */
/* ------------------------------------------------------------------ */

function ChainRuleTab() {
  const [inputVal, setInputVal] = useState(1.0);

  // Simple chain: input -> hidden -> output
  // hidden = sigmoid(w1 * input + b1)
  // output = sigmoid(w2 * hidden + b2)
  const w1 = 0.8, b1 = 0.2, w2 = 1.2, b2 = -0.3;

  const hRaw = w1 * inputVal + b1;
  const hVal = sigmoid(hRaw);
  const oRaw = w2 * hVal + b2;
  const oVal = sigmoid(oRaw);

  // Chain rule: dOutput/dInput = dOutput/dHidden * dHidden/dInput
  const dOdH = sigmoidDeriv(oRaw) * w2; // partial derivative of output w.r.t. hidden
  const dHdI = sigmoidDeriv(hRaw) * w1; // partial derivative of hidden w.r.t. input
  const dOdI = dOdH * dHdI; // chain rule product

  const W = 480, H = 160;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">
          Input value: <span className="font-bold text-indigo-700">{inputVal.toFixed(1)}</span>
        </label>
        <input
          type="range" min={-3} max={3} step={0.1} value={inputVal}
          onChange={(e) => { playPop(); setInputVal(parseFloat(e.target.value)); }}
          className="w-full accent-indigo-600"
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[480px] mx-auto">
        {/* Nodes */}
        <circle cx={60} cy={80} r={24} fill="#3b82f6" />
        <text x={60} y={75} textAnchor="middle" className="text-[9px] fill-blue-200 font-medium">input</text>
        <text x={60} y={90} textAnchor="middle" className="text-[13px] fill-white font-bold">{inputVal.toFixed(2)}</text>

        <circle cx={240} cy={80} r={24} fill="#8b5cf6" />
        <text x={240} y={75} textAnchor="middle" className="text-[9px] fill-purple-200 font-medium">hidden</text>
        <text x={240} y={90} textAnchor="middle" className="text-[13px] fill-white font-bold">{hVal.toFixed(3)}</text>

        <circle cx={420} cy={80} r={24} fill="#22c55e" />
        <text x={420} y={75} textAnchor="middle" className="text-[9px] fill-green-200 font-medium">output</text>
        <text x={420} y={90} textAnchor="middle" className="text-[13px] fill-white font-bold">{oVal.toFixed(3)}</text>

        {/* Forward arrows */}
        <line x1={86} y1={80} x2={213} y2={80} stroke="#94a3b8" strokeWidth={2} />
        <polygon points="210,75 220,80 210,85" fill="#94a3b8" />
        <text x={150} y={72} textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">w1={w1}</text>

        <line x1={266} y1={80} x2={393} y2={80} stroke="#94a3b8" strokeWidth={2} />
        <polygon points="390,75 400,80 390,85" fill="#94a3b8" />
        <text x={330} y={72} textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">w2={w2}</text>

        {/* Backward gradient arrows (below) */}
        <line x1={393} y1={110} x2={270} y2={110} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" />
        <polygon points="273,106 263,110 273,114" fill="#ef4444" />
        <text x={330} y={128} textAnchor="middle" className="text-[9px] fill-red-500 font-bold">
          dO/dH = {dOdH.toFixed(3)}
        </text>

        <line x1={213} y1={110} x2={90} y2={110} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" />
        <polygon points="93,106 83,110 93,114" fill="#ef4444" />
        <text x={150} y={128} textAnchor="middle" className="text-[9px] fill-red-500 font-bold">
          dH/dI = {dHdI.toFixed(3)}
        </text>

        {/* Chain rule result */}
        <text x={240} y={150} textAnchor="middle" className="text-[10px] fill-red-600 font-bold">
          Chain Rule: dO/dI = {dOdH.toFixed(3)} x {dHdI.toFixed(3)} = {dOdI.toFixed(4)}
        </text>
      </svg>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-2">
        <div className="font-bold text-slate-800">The Chain Rule in Action:</div>
        <div>To know how changing the <span className="font-bold text-blue-600">input</span> affects the <span className="font-bold text-green-600">output</span>, we multiply the gradients along the chain:</div>
        <div className="font-mono text-center text-sm">
          <span className="text-red-500">dOutput/dInput</span> = <span className="text-red-500">dOutput/dHidden</span> x <span className="text-red-500">dHidden/dInput</span>
        </div>
        <div className="font-mono text-center">
          {dOdI.toFixed(4)} = {dOdH.toFixed(3)} x {dHdI.toFixed(3)}
        </div>
        <div>This tells us: if we increase the input by a tiny bit, the output changes by <span className="font-bold">{dOdI.toFixed(4)}</span>.</div>
      </div>

      <InfoBox variant="amber" title="The Chain Rule">
        The chain rule lets us compute how each weight affects the final output by multiplying gradients along the path. This is the mathematical foundation of backpropagation!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Watch It Learn                                             */
/* ------------------------------------------------------------------ */

function WatchItLearnTab() {
  // Learn y = 2x + 1 with a simple 2-1 network (1 input, 1 hidden, 1 output)
  const rng = useMemo(() => mulberry32(77), []);

  const dataPoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const x = -2 + (i / 7) * 4;
      const y = 2 * x + 1 + (rng() - 0.5) * 0.3;
      pts.push({ x, y });
    }
    return pts;
  }, [rng]);

  const [w1, setW1] = useState(0.5);
  const [b1, setB1] = useState(0.1);
  const [w2, setW2] = useState(0.3);
  const [b2, setB2] = useState(0.0);
  const [epochCount, setEpochCount] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Linear model for simplicity: output = w2 * (w1 * x + b1) + b2
  // Equivalent to a linear fit
  const predictY = useCallback(
    (x: number) => w2 * (w1 * x + b1) + b2,
    [w1, b1, w2, b2],
  );

  const computeLoss = useCallback(() => {
    let loss = 0;
    for (const p of dataPoints) {
      const pred = predictY(p.x);
      loss += (p.y - pred) * (p.y - pred);
    }
    return loss / dataPoints.length;
  }, [dataPoints, predictY]);

  const trainStep = useCallback(() => {
    const lr = 0.01;
    let dw1 = 0, db1 = 0, dw2 = 0, db2_ = 0;
    for (const p of dataPoints) {
      const hid = w1 * p.x + b1;
      const pred = w2 * hid + b2;
      const err = pred - p.y;
      dw2 += err * hid;
      db2_ += err;
      dw1 += err * w2 * p.x;
      db1 += err * w2;
    }
    const n = dataPoints.length;
    setW1((v) => v - lr * (dw1 / n));
    setB1((v) => v - lr * (db1 / n));
    setW2((v) => v - lr * (dw2 / n));
    setB2((v) => v - lr * (db2_ / n));
    setEpochCount((e) => e + 1);
  }, [dataPoints, w1, b1, w2, b2]);

  const handlePlay = useCallback(() => {
    if (playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPlaying(false);
      return;
    }
    playClick();
    setPlaying(true);
    let steps = 0;
    const tick = () => {
      if (steps >= 200) {
        setPlaying(false);
        playSuccess();
        return;
      }
      trainStep();
      setLossHistory((prev) => {
        const loss = computeLoss();
        return [...prev.slice(-99), loss];
      });
      steps++;
      timerRef.current = setTimeout(tick, 50);
    };
    tick();
  }, [playing, trainStep, computeLoss]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setW1(0.5);
    setB1(0.1);
    setW2(0.3);
    setB2(0.0);
    setEpochCount(0);
    setLossHistory([]);
    playClick();
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Data plot
  const plotW = 300, plotH = 200, pPad = 35;
  const xMin = -3, xMax = 3, yMin = -6, yMax = 8;
  const toSX = (v: number) => pPad + ((v - xMin) / (xMax - xMin)) * (plotW - 2 * pPad);
  const toSY = (v: number) => plotH - pPad - ((v - yMin) / (yMax - yMin)) * (plotH - 2 * pPad);

  // Prediction line
  const lineX0 = xMin, lineX1 = xMax;
  const lineY0 = predictY(lineX0), lineY1 = predictY(lineX1);

  // Loss curve
  const lossW = 180, lossH = 120, lossPad = 25;

  return (
    <div className="space-y-4">
      <div className="text-center text-sm font-semibold text-slate-700">
        Learning y = 2x + 1
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* Data plot with prediction line */}
        <svg viewBox={`0 0 ${plotW} ${plotH}`} className="w-72 h-48">
          <rect x={pPad} y={pPad - 10} width={plotW - 2 * pPad} height={plotH - 2 * pPad + 10} fill="#f8fafc" stroke="#e2e8f0" rx={4} />
          {/* Zero lines */}
          {xMin <= 0 && xMax >= 0 && (
            <line x1={toSX(0)} y1={pPad - 10} x2={toSX(0)} y2={plotH - pPad} stroke="#e2e8f0" strokeWidth={0.5} />
          )}
          {yMin <= 0 && yMax >= 0 && (
            <line x1={pPad} y1={toSY(0)} x2={plotW - pPad} y2={toSY(0)} stroke="#e2e8f0" strokeWidth={0.5} />
          )}
          {/* Target line (faint) */}
          <line
            x1={toSX(xMin)} y1={toSY(2 * xMin + 1)}
            x2={toSX(xMax)} y2={toSY(2 * xMax + 1)}
            stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2"
          />
          {/* Prediction line */}
          <line
            x1={toSX(lineX0)}
            y1={toSY(Math.max(yMin, Math.min(yMax, lineY0)))}
            x2={toSX(lineX1)}
            y2={toSY(Math.max(yMin, Math.min(yMax, lineY1)))}
            stroke="#6366f1" strokeWidth={2.5}
            className="transition-all duration-100"
          />
          {/* Data points */}
          {dataPoints.map((p, i) => (
            <circle
              key={i}
              cx={toSX(p.x)} cy={toSY(p.y)} r={5}
              fill="#ef4444" stroke="white" strokeWidth={1.5}
            />
          ))}
          <text x={plotW / 2} y={plotH - 5} textAnchor="middle" className="text-[9px] fill-slate-500">x</text>
          <text x={10} y={plotH / 2} textAnchor="middle" className="text-[9px] fill-slate-500" transform={`rotate(-90 10 ${plotH / 2})`}>y</text>
          {/* Legend */}
          <line x1={pPad + 5} y1={pPad - 3} x2={pPad + 20} y2={pPad - 3} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2" />
          <text x={pPad + 24} y={pPad} className="text-[7px] fill-slate-400">Target</text>
          <line x1={pPad + 5} y1={pPad + 8} x2={pPad + 20} y2={pPad + 8} stroke="#6366f1" strokeWidth={2} />
          <text x={pPad + 24} y={pPad + 11} className="text-[7px] fill-indigo-500">Learned</text>
        </svg>

        {/* Loss curve */}
        <div>
          <svg viewBox={`0 0 ${lossW} ${lossH}`} className="w-44 h-28">
            <rect x={lossPad} y={8} width={lossW - 2 * lossPad} height={lossH - lossPad - 8} fill="#f8fafc" stroke="#e2e8f0" rx={3} />
            {lossHistory.length > 1 && (() => {
              const maxLoss = Math.max(...lossHistory, 0.01);
              const pts = lossHistory.map((l, i) => {
                const x = lossPad + (i / (lossHistory.length - 1)) * (lossW - 2 * lossPad);
                const y = lossH - lossPad - (l / maxLoss) * (lossH - lossPad - 12);
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

      <div className="text-center text-xs text-slate-600 font-mono">
        Epoch: {epochCount} | w1={w1.toFixed(3)} | b1={b1.toFixed(3)} | w2={w2.toFixed(3)} | b2={b2.toFixed(3)}
        {lossHistory.length > 0 && ` | Loss: ${lossHistory[lossHistory.length - 1].toFixed(4)}`}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handlePlay}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
            playing
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
        >
          Reset
        </button>
      </div>

      <InfoBox variant="green" title="Training Loop">
        Each epoch: forward pass (predict) then backprop (compute gradients) then update (adjust weights). Watch the purple line converge toward the dashed target line as the loss decreases!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What does backpropagation compute?",
    options: [
      "The forward pass output",
      "How much each weight contributed to the error",
      "The number of layers needed",
      "The best activation function",
    ],
    correctIndex: 1,
    explanation:
      "Backpropagation computes the gradient of the error with respect to each weight, telling us how to adjust them to reduce the error.",
  },
  {
    question: "What mathematical rule makes backpropagation possible?",
    options: [
      "The Pythagorean theorem",
      "The chain rule of calculus",
      "The quadratic formula",
      "The law of large numbers",
    ],
    correctIndex: 1,
    explanation:
      "The chain rule lets us compute how a change in any weight propagates through multiple layers to affect the final output.",
  },
  {
    question: "In what direction does backpropagation flow?",
    options: [
      "From input to output",
      "From output back to input",
      "Sideways between layers",
      "In a random direction",
    ],
    correctIndex: 1,
    explanation:
      "Backpropagation flows backward: it starts at the output error and propagates gradients back through each layer toward the inputs.",
  },
  {
    question: "What happens to the loss during successful training?",
    options: [
      "It increases steadily",
      "It stays the same",
      "It decreases over time",
      "It oscillates randomly forever",
    ],
    correctIndex: 2,
    explanation:
      "During successful training, the loss decreases as the network adjusts its weights to make better predictions.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function L21_BackpropagationActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "error-flows",
        label: "Error Flows Backward",
        icon: <ArrowLeftRight className="w-4 h-4" />,
        content: <ErrorFlowsTab />,
      },
      {
        id: "chain-rule",
        label: "Chain Rule Visualized",
        icon: <Link2 className="w-4 h-4" />,
        content: <ChainRuleTab />,
      },
      {
        id: "watch-learn",
        label: "Watch It Learn",
        icon: <Play className="w-4 h-4" />,
        content: <WatchItLearnTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Backpropagation"
      level={6}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Dive into gradient descent -- the engine behind all ML training!"
      story={
        <StorySection
          paragraphs={[
            "Aru watched the neural network solve XOR in the last lesson, but something was bothering her.",
            "Aru: \"The network learned, but HOW? How does it know which weights to change and by how much?\"",
            "Byte: \"Great question! It works backwards! First, it checks the error at the output -- how wrong was the prediction? Then it figures out how much each weight contributed to that error. Finally, it adjusts each weight a little bit to reduce the error. That's backpropagation!\"",
            "Aru: \"So it's like tracing blame backward through the network?\"",
            "Byte: \"Exactly! If the output is wrong, we ask: which weights caused this? And then we fix them. Do this thousands of times, and the network learns!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Backpropagation is the algorithm that lets neural networks learn. It computes the gradient of the error with respect to each weight using the chain rule, then adjusts weights in the direction that reduces the error. This process repeats for many epochs until the network converges."
        />
      }
    />
  );
}
