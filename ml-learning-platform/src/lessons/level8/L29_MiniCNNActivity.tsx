import { useState, useMemo, useCallback } from "react";
import { Workflow, Eye, Dumbbell } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

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

/* ---- patterns (8x8 normalized 0-1) ---- */
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
const CLASS_COLORS = ["#3b82f6", "#ef4444", "#22c55e"];

/* ---- CNN forward pass helpers ---- */
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

/* ---- A fixed kernel for pipeline demo ---- */
const DEMO_KERNEL = [-1, -1, -1, 0, 0, 0, 1, 1, 1]; // horizontal edge

/* ---- dense layer weights (9 inputs -> 3 outputs) ---- */
function makeDenseWeights(rand: () => number, inputs: number, outputs: number): { w: number[][]; b: number[] } {
  const w: number[][] = [];
  for (let o = 0; o < outputs; o++) {
    const row: number[] = [];
    for (let i = 0; i < inputs; i++) {
      row.push((rand() - 0.5) * 2);
    }
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

/* ------------------------------------------------------------------ */
/*  Tab 1 -- CNN Pipeline                                              */
/* ------------------------------------------------------------------ */
function PipelineTab() {
  const [stage, setStage] = useState(0); // 0=input, 1=conv, 2=relu, 3=pool, 4=flatten, 5=dense

  const input = PATTERNS[0].data;

  const convOut = useMemo(() => conv2d(input, 8, DEMO_KERNEL), [input]);
  const reluOut = useMemo(() => relu(convOut), [convOut]);
  const poolOut = useMemo(() => maxPool2x2(reluOut, 6), [reluOut]);
  const flatOut = poolOut;
  const denseW = useMemo(() => {
    const rand = mulberry32(99);
    return makeDenseWeights(rand, 9, 3);
  }, []);
  const scores = useMemo(() => denseForward(flatOut, denseW.w, denseW.b), [flatOut, denseW]);
  const probs = useMemo(() => softmax(scores), [scores]);

  const handleForward = useCallback(() => {
    playPop();
    setStage((s) => Math.min(s + 1, 5));
  }, []);

  const handleReset = useCallback(() => {
    playClick();
    setStage(0);
  }, []);

  const stageNames = ["Input (8x8)", "Conv (6x6)", "ReLU", "Pool (3x3)", "Flatten (9)", "Dense (3 scores)"];

  const cellSz = 28;
  const gapSz = 1;

  const renderGrid = useCallback((data: number[], size: number, normalize: boolean, label: string) => {
    const gridW = cellSz * size + gapSz * (size + 1);
    const maxVal = normalize ? Math.max(...data.map(Math.abs), 0.01) : 1;
    return (
      <div className="flex flex-col items-center">
        <p className="text-[10px] font-bold text-slate-500 mb-1">{label}</p>
        <svg viewBox={`0 0 ${gridW} ${gridW}`} className="bg-slate-50 rounded border border-slate-200" style={{ width: Math.min(size * 36, 200) }}>
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
                  fill={gray > 128 ? "#000" : "#fff"} className="text-[6px] font-mono pointer-events-none">
                  {Number.isInteger(val) ? val : val.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Click "Forward" to push data through each CNN stage: Input, Conv, ReLU, Pool, Flatten, Dense.
      </p>

      {/* Stage indicator */}
      <div className="flex gap-1 justify-center flex-wrap">
        {stageNames.map((name, i) => (
          <div key={name} className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${i <= stage ? "bg-indigo-100 text-indigo-700 border border-indigo-300" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
            {name}
          </div>
        ))}
      </div>

      {/* Visualization */}
      <div className="flex gap-3 items-end justify-center flex-wrap">
        {stage >= 0 && renderGrid(input, 8, false, "Input")}
        {stage >= 1 && (
          <>
            <span className="text-slate-300 font-bold text-lg">&rarr;</span>
            {renderGrid(convOut, 6, true, "Conv")}
          </>
        )}
        {stage >= 2 && (
          <>
            <span className="text-slate-300 font-bold text-lg">&rarr;</span>
            {renderGrid(reluOut, 6, true, "ReLU")}
          </>
        )}
        {stage >= 3 && (
          <>
            <span className="text-slate-300 font-bold text-lg">&rarr;</span>
            {renderGrid(poolOut, 3, true, "Pool")}
          </>
        )}
        {stage >= 4 && (
          <>
            <span className="text-slate-300 font-bold text-lg">&rarr;</span>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold text-slate-500 mb-1">Flatten</p>
              <svg viewBox="0 0 30 270" className="bg-slate-50 rounded border border-slate-200" style={{ width: 30, height: 160 }}>
                {flatOut.map((val, i) => {
                  const maxV = Math.max(...flatOut.map(Math.abs), 0.01);
                  const norm = clamp01(val / maxV * 0.5 + 0.5);
                  const gray = Math.round(norm * 255);
                  const hex = gray.toString(16).padStart(2, "0");
                  return (
                    <rect key={i} x={2} y={2 + i * 29} width={26} height={27} fill={`#${hex}${hex}${hex}`} rx={3} />
                  );
                })}
              </svg>
            </div>
          </>
        )}
        {stage >= 5 && (
          <>
            <span className="text-slate-300 font-bold text-lg">&rarr;</span>
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] font-bold text-slate-500 mb-1">Scores</p>
              {probs.map((p, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold w-16 text-right" style={{ color: CLASS_COLORS[i] }}>{CLASS_NAMES[i]}</span>
                  <svg viewBox="0 0 100 14" className="w-20">
                    <rect x={0} y={0} width={100} height={14} fill="#e2e8f0" rx={3} />
                    <rect x={0} y={0} width={p * 100} height={14} fill={CLASS_COLORS[i]} rx={3} />
                  </svg>
                  <span className="text-[10px] font-mono text-slate-500">{(p * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={handleForward} disabled={stage >= 5}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
          Forward &rarr;
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all">
          Reset
        </button>
      </div>

      <InfoBox variant="blue" title="CNN Pipeline">
        A CNN processes images in stages: Convolution (find features) &rarr; ReLU (remove negatives) &rarr; Pooling (shrink) &rarr; Flatten (make 1D) &rarr; Dense layer (classify). Each stage transforms the data step by step!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- What Each Layer Sees                                      */
/* ------------------------------------------------------------------ */
function LayerViewTab() {
  const [patternIdx, setPatternIdx] = useState(0);

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

  const cellSz = 24;
  const gapSz = 1;

  const renderSmallGrid = useCallback((data: number[], size: number, normalize: boolean) => {
    const gridW = cellSz * size + gapSz * (size + 1);
    const maxVal = normalize ? Math.max(...data.map(Math.abs), 0.01) : 1;
    return (
      <svg viewBox={`0 0 ${gridW} ${gridW}`} className="bg-slate-50 rounded" style={{ width: Math.min(size * 28, 140) }}>
        {data.map((val, idx) => {
          const row = Math.floor(idx / size);
          const col = idx % size;
          const x = gapSz + col * (cellSz + gapSz);
          const y = gapSz + row * (cellSz + gapSz);
          const norm = normalize ? clamp01(val / maxVal * 0.5 + 0.5) : clamp01(val);
          const gray = Math.round(norm * 255);
          const hex = gray.toString(16).padStart(2, "0");
          return (
            <rect key={idx} x={x} y={y} width={cellSz} height={cellSz} fill={`#${hex}${hex}${hex}`} rx={2} />
          );
        })}
      </svg>
    );
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Choose an input pattern and see how each layer transforms it. Different filters respond to different patterns!
      </p>

      {/* Pattern selector */}
      <div className="flex gap-2 justify-center">
        {PATTERNS.map((p, i) => (
          <button key={p.name} onClick={() => { playClick(); setPatternIdx(i); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${patternIdx === i ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
            {p.name}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex justify-center">
        <div className="text-center">
          <p className="text-[10px] font-bold text-slate-500 mb-1">Input: {PATTERNS[patternIdx].name}</p>
          {renderSmallGrid(PATTERNS[patternIdx].data, 8, false)}
        </div>
      </div>

      {/* Each filter's pipeline */}
      {kernels.map((kd, ki) => (
        <div key={kd.name} className="bg-slate-50 rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-bold text-slate-600 mb-2">Filter: {kd.name}</p>
          <div className="flex gap-2 items-center justify-center flex-wrap">
            <div className="text-center">
              <p className="text-[9px] text-slate-400">Conv</p>
              {renderSmallGrid(results[ki].conv, 6, true)}
            </div>
            <span className="text-slate-300 font-bold">&rarr;</span>
            <div className="text-center">
              <p className="text-[9px] text-slate-400">ReLU</p>
              {renderSmallGrid(results[ki].relu, 6, true)}
            </div>
            <span className="text-slate-300 font-bold">&rarr;</span>
            <div className="text-center">
              <p className="text-[9px] text-slate-400">Pool</p>
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

  // Simulated training with deterministic PRNG
  const trainOnce = useCallback(() => {
    playPop();
    setEpoch((prev) => {
      const next = prev + 1;
      const rand = mulberry32(next * 42);
      // Simulate loss decreasing and accuracy increasing
      const baseLoss = 1.1 / (1 + next * 0.4) + rand() * 0.05;
      const baseAcc = Math.min(1, 0.3 + next * 0.15 + rand() * 0.05);
      setLossHistory((h) => [...h, baseLoss]);
      setAccHistory((h) => [...h, baseAcc]);
      if (next >= 5) {
        setTrained(true);
        playSuccess();
      }
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
    if (!trained) {
      playError();
      return;
    }
    playClick();
    // Simple pattern matching heuristic for classification
    const grid = userGrid;
    let horizScore = 0;
    let vertScore = 0;
    let checkScore = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const val = grid[r * 8 + c];
        if (val > 0.5) {
          if (r % 2 === 0) horizScore += 1;
          if (c % 2 === 0) vertScore += 1;
          if ((r + c) % 2 === 0) checkScore += 1;
        }
      }
    }
    const total = Math.max(horizScore + vertScore + checkScore, 1);
    const raw = [horizScore / total, vertScore / total, checkScore / total];
    const sm = softmax(raw.map((v) => v * 5));
    setPrediction(sm);
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

  // Chart dimensions
  const chartW = 240;
  const chartH = 80;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Train the mini CNN on 3 patterns, then draw your own and see what the network predicts!
      </p>

      {/* Training patterns */}
      <div className="flex gap-3 justify-center flex-wrap">
        {PATTERNS.map((p) => (
          <div key={p.name} className="text-center">
            <p className="text-[10px] font-bold mb-1" style={{ color: CLASS_COLORS[p.label] }}>{p.name}</p>
            <svg viewBox={`0 0 ${cellSz * 8 + gapSz * 9} ${cellSz * 8 + gapSz * 9}`} className="bg-slate-50 rounded border border-slate-200" style={{ width: 80 }}>
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

      {/* Train button + progress */}
      <div className="flex gap-2 justify-center items-center">
        <button onClick={trainOnce} disabled={epoch >= 5}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
          {epoch === 0 ? "Train" : epoch >= 5 ? "Trained!" : `Train (Epoch ${epoch}/5)`}
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all">
          Reset
        </button>
      </div>

      {/* Loss and accuracy charts */}
      {lossHistory.length > 0 && (
        <div className="flex gap-4 justify-center flex-wrap">
          {/* Loss chart */}
          <div className="text-center">
            <p className="text-[10px] font-bold text-red-500 mb-1">Loss</p>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="bg-white rounded border border-slate-200" style={{ width: chartW }}>
              <line x1={20} y1={chartH - 10} x2={chartW - 10} y2={chartH - 10} stroke="#cbd5e1" strokeWidth={1} />
              {lossHistory.map((loss, i) => {
                const x = 30 + i * ((chartW - 50) / 4);
                const y = chartH - 15 - (loss / 1.2) * (chartH - 25);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={4} fill="#ef4444" />
                    {i > 0 && (
                      <line
                        x1={30 + (i - 1) * ((chartW - 50) / 4)}
                        y1={chartH - 15 - (lossHistory[i - 1] / 1.2) * (chartH - 25)}
                        x2={x} y2={y}
                        stroke="#ef4444" strokeWidth={2}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Accuracy chart */}
          <div className="text-center">
            <p className="text-[10px] font-bold text-green-500 mb-1">Accuracy</p>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="bg-white rounded border border-slate-200" style={{ width: chartW }}>
              <line x1={20} y1={chartH - 10} x2={chartW - 10} y2={chartH - 10} stroke="#cbd5e1" strokeWidth={1} />
              {accHistory.map((acc, i) => {
                const x = 30 + i * ((chartW - 50) / 4);
                const y = chartH - 15 - acc * (chartH - 25);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={4} fill="#22c55e" />
                    {i > 0 && (
                      <line
                        x1={30 + (i - 1) * ((chartW - 50) / 4)}
                        y1={chartH - 15 - accHistory[i - 1] * (chartH - 25)}
                        x2={x} y2={y}
                        stroke="#22c55e" strokeWidth={2}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Drawing area (only after training) */}
      {trained && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700 text-center">Draw your own pattern and predict!</p>

          <div className="flex gap-2 justify-center flex-wrap">
            {PATTERNS.map((p, i) => (
              <button key={p.name} onClick={() => handleLoadPattern(i)}
                className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-all">
                Load {p.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* Drawing grid */}
            <svg viewBox={`0 0 ${gridW} ${gridW}`} className="w-full max-w-[240px] bg-slate-800 rounded-lg cursor-pointer">
              {userGrid.map((val, idx) => {
                const row = Math.floor(idx / 8);
                const col = idx % 8;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                const gray = Math.round(val * 255);
                const hex = gray.toString(16).padStart(2, "0");
                return (
                  <rect key={idx} x={x} y={y} width={cellSz} height={cellSz}
                    fill={`#${hex}${hex}${hex}`} rx={2}
                    onClick={() => handleCellClick(idx)}
                    className="hover:opacity-80 transition-opacity" />
                );
              })}
            </svg>

            {/* Prediction */}
            {prediction && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500">Prediction</p>
                {prediction.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-semibold w-20 text-right" style={{ color: CLASS_COLORS[i] }}>{CLASS_NAMES[i]}</span>
                    <svg viewBox="0 0 120 16" className="w-24">
                      <rect x={0} y={0} width={120} height={16} fill="#e2e8f0" rx={4} />
                      <rect x={0} y={0} width={p * 120} height={16} fill={CLASS_COLORS[i]} rx={4} className="transition-all duration-300" />
                    </svg>
                    <span className="text-xs font-mono text-slate-500">{(p * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button onClick={handlePredict}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm">
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
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L29_MiniCNNActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "pipeline",
        label: "CNN Pipeline",
        icon: <Workflow className="w-4 h-4" />,
        content: <PipelineTab />,
      },
      {
        id: "layers",
        label: "What Each Layer Sees",
        icon: <Eye className="w-4 h-4" />,
        content: <LayerViewTab />,
      },
      {
        id: "train",
        label: "Train the Mini CNN",
        icon: <Dumbbell className="w-4 h-4" />,
        content: <TrainTab />,
      },
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
