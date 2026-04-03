import { useState, useMemo, useCallback } from "react";
import { Footprints, Frame, Minimize2 } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

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
  return clamp(v) > 128 ? "#000" : "#fff";
}

/* ---- test image ---- */
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

const KERNEL_3x3 = [0, -1, 0, -1, 5, -1, 0, -1, 0]; // sharpen

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Stride Explorer                                           */
/* ------------------------------------------------------------------ */
function StrideTab() {
  const [stride, setStride] = useState(1);
  const [step, setStep] = useState(-1);

  const outSize = Math.floor((8 - 3) / stride) + 1;
  const totalSteps = outSize * outSize;

  // Compute all positions
  const positions = useMemo(() => {
    const pos: { row: number; col: number }[] = [];
    for (let r = 0; r <= 8 - 3; r += stride) {
      for (let c = 0; c <= 8 - 3; c += stride) {
        pos.push({ row: r, col: c });
      }
    }
    return pos;
  }, [stride]);

  // Compute output
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

  const handleStep = useCallback(() => {
    playPop();
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps]);

  const handleRunAll = useCallback(() => {
    playSuccess();
    setStep(totalSteps - 1);
  }, [totalSteps]);

  const handleReset = useCallback(() => {
    playClick();
    setStep(-1);
  }, []);

  const curPos = step >= 0 && step < positions.length ? positions[step] : null;

  const cellSz = 38;
  const gapSz = 1;
  const inGridW = cellSz * 8 + gapSz * 9;
  const outCellSz = 38;
  const outGridW = outCellSz * outSize + gapSz * (outSize + 1);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Change the stride to see how the filter skips positions. Larger stride = smaller output!
      </p>

      {/* Stride selector */}
      <div className="flex items-center gap-3 justify-center">
        <span className="text-sm font-semibold text-slate-600">Stride:</span>
        {[1, 2, 3].map((s) => (
          <button key={s} onClick={() => { playClick(); setStride(s); setStep(-1); }}
            className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all ${stride === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Formula */}
      <div className="text-center bg-slate-50 rounded-lg border border-slate-200 py-2 px-4">
        <p className="text-xs text-slate-500">Output size = (N - K) / S + 1 = ({8} - {3}) / {stride} + 1 = <span className="font-bold text-indigo-600">{outSize}</span></p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start justify-center">
        {/* Input grid */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">Input (8x8)</p>
          <svg viewBox={`0 0 ${inGridW} ${inGridW}`} className="w-full max-w-[260px] bg-slate-100 rounded">
            {INPUT_8x8.map((val, idx) => {
              const row = Math.floor(idx / 8);
              const col = idx % 8;
              const x = gapSz + col * (cellSz + gapSz);
              const y = gapSz + row * (cellSz + gapSz);
              const visited = positions.slice(0, step + 1).some((p) => row >= p.row && row < p.row + 3 && col >= p.col && col < p.col + 3);
              const inCurrent = curPos && row >= curPos.row && row < curPos.row + 3 && col >= curPos.col && col < curPos.col + 3;
              return (
                <g key={idx}>
                  <rect x={x} y={y} width={cellSz} height={cellSz}
                    fill={grayHex(val)} rx={2}
                    stroke={inCurrent ? "#f59e0b" : "none"} strokeWidth={inCurrent ? 2 : 0}
                    opacity={step >= 0 && !visited && !inCurrent ? 0.4 : 1} />
                  <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle" fill={txtCol(val)}
                    className="text-[8px] font-mono pointer-events-none">{val}</text>
                </g>
              );
            })}
            {curPos && (
              <rect
                x={gapSz + curPos.col * (cellSz + gapSz) - 2}
                y={gapSz + curPos.row * (cellSz + gapSz) - 2}
                width={cellSz * 3 + gapSz * 2 + 4}
                height={cellSz * 3 + gapSz * 2 + 4}
                fill="none" stroke="#f59e0b" strokeWidth={3} rx={4} strokeDasharray="6 3"
              />
            )}
          </svg>
        </div>

        {/* Output grid */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">Output ({outSize}x{outSize})</p>
          <svg viewBox={`0 0 ${Math.max(outGridW, 60)} ${Math.max(outGridW, 60)}`} className="w-full max-w-[200px] bg-slate-100 rounded">
            {Array.from({ length: totalSteps }, (_, idx) => {
              const row = Math.floor(idx / outSize);
              const col = idx % outSize;
              const x = gapSz + col * (outCellSz + gapSz);
              const y = gapSz + row * (outCellSz + gapSz);
              const filled = idx <= step;
              const val = filled ? output[idx] : 0;
              return (
                <g key={idx}>
                  <rect x={x} y={y} width={outCellSz} height={outCellSz}
                    fill={filled ? grayHex(val) : "#e2e8f0"} rx={2}
                    stroke={idx === step ? "#22c55e" : "none"} strokeWidth={idx === step ? 3 : 0} />
                  {filled && (
                    <text x={x + outCellSz / 2} y={y + outCellSz / 2 + 4} textAnchor="middle" fill={txtCol(val)}
                      className="text-[9px] font-mono pointer-events-none">{val}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={handleStep} disabled={step >= totalSteps - 1}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
          Step
        </button>
        <button onClick={handleRunAll}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm">
          Run All
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all">
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

  const outSize = paddedSize - 2; // kernel 3, stride 1

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
      <p className="text-sm text-slate-600">
        Toggle between valid (no padding) and same (zero padding). With padding, the output keeps the same size as the input!
      </p>

      {/* Toggle */}
      <div className="flex gap-3 justify-center">
        <button onClick={() => { playPop(); setUsePadding(false); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${!usePadding ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
          Valid (No Padding)
        </button>
        <button onClick={() => { playPop(); setUsePadding(true); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${usePadding ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
          Same (Zero Padding)
        </button>
      </div>

      {/* Size info */}
      <div className="text-center bg-slate-50 rounded-lg border border-slate-200 py-2 px-4">
        <p className="text-xs text-slate-500">
          Input: <span className="font-bold">{usePadding ? "8x8 + padding = 10x10" : "8x8"}</span> &rarr; Output: <span className="font-bold text-indigo-600">{outSize}x{outSize}</span>
          {usePadding && <span className="text-green-600 font-bold ml-2">(same as original!)</span>}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start justify-center">
        {/* Input with optional padding */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">
            {usePadding ? "Padded Input (10x10)" : "Input (8x8)"}
          </p>
          <svg viewBox={`0 0 ${inGridW} ${inGridW}`} className="w-full max-w-[280px] bg-slate-100 rounded">
            {paddedImage.map((val, idx) => {
              const row = Math.floor(idx / paddedSize);
              const col = idx % paddedSize;
              const x = gapSz + col * (cellSz + gapSz);
              const y = gapSz + row * (cellSz + gapSz);
              const isPadding = usePadding && (row === 0 || row === paddedSize - 1 || col === 0 || col === paddedSize - 1);
              return (
                <g key={idx}>
                  <rect x={x} y={y} width={cellSz} height={cellSz}
                    fill={isPadding ? "#bfdbfe" : grayHex(val)} rx={2}
                    stroke={isPadding ? "#3b82f6" : "none"} strokeWidth={isPadding ? 1 : 0}
                    strokeDasharray={isPadding ? "3 2" : ""} />
                  <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle"
                    fill={isPadding ? "#3b82f6" : txtCol(val)}
                    className="text-[7px] font-mono pointer-events-none font-bold">
                    {isPadding ? "0" : val}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Output */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">Output ({outSize}x{outSize})</p>
          <svg viewBox={`0 0 ${outGridW} ${outGridW}`} className="w-full max-w-[240px] bg-slate-100 rounded">
            {output.map((val, idx) => {
              const row = Math.floor(idx / outSize);
              const col = idx % outSize;
              const x = gapSz + col * (cellSz + gapSz);
              const y = gapSz + row * (cellSz + gapSz);
              return (
                <g key={idx}>
                  <rect x={x} y={y} width={cellSz} height={cellSz} fill={grayHex(val)} rx={2} />
                  <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle" fill={txtCol(val)}
                    className="text-[7px] font-mono pointer-events-none">{val}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <InfoBox variant="green" title="Why Padding?">
        Without padding, each convolution layer shrinks the image. With "same" padding (adding zeros around the border), the output stays the same size as the input. This lets us stack many convolution layers without losing spatial dimensions.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Max Pooling & Average Pooling                             */
/* ------------------------------------------------------------------ */
function PoolingTab() {
  const [poolType, setPoolType] = useState<"max" | "avg">("max");
  const [highlightBlock, setHighlightBlock] = useState<number | null>(null);

  const featureMap: number[] = useMemo(() => {
    const rand = mulberry32(42);
    return Array.from({ length: 16 }, () => Math.floor(rand() * 10));
  }, []);

  // 2x2 pooling on 4x4 -> 2x2
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
        if (poolType === "max") {
          out.push(Math.max(...block));
        } else {
          out.push(Math.round(block.reduce((a, b) => a + b, 0) / 4));
        }
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
    const maxVal = Math.max(...block);
    return featureMap[row * 4 + col] === maxVal;
  }, [featureMap, poolType]);

  const blockColors = ["#dbeafe", "#fef3c7", "#dcfce7", "#fce7f3"];

  const cellSz = 60;
  const gapSz = 3;
  const inGridW = cellSz * 4 + gapSz * 5;
  const outCellSz = 70;
  const outGridW = outCellSz * 2 + gapSz * 3;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Pooling shrinks a feature map by taking the max (or average) of each 2x2 block. Hover over the blocks to see which values are selected!
      </p>

      {/* Pool type toggle */}
      <div className="flex gap-3 justify-center">
        <button onClick={() => { playPop(); setPoolType("max"); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${poolType === "max" ? "bg-green-600 text-white border-green-600" : "bg-white text-slate-600 border-slate-200 hover:border-green-300"}`}>
          Max Pooling
        </button>
        <button onClick={() => { playPop(); setPoolType("avg"); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${poolType === "avg" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
          Average Pooling
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
        {/* Input 4x4 */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">Feature Map (4x4)</p>
          <svg viewBox={`0 0 ${inGridW} ${inGridW}`} className="w-full max-w-[260px] bg-white rounded border border-slate-200">
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
                    fill={blockColors[blockIdx]} rx={4}
                    stroke={isHighlight ? (isMax && poolType === "max" ? "#22c55e" : "#f59e0b") : "#cbd5e1"}
                    strokeWidth={isHighlight ? 3 : 1} />
                  <text x={x + cellSz / 2} y={y + cellSz / 2 + 6} textAnchor="middle"
                    className={`text-[16px] font-mono font-bold pointer-events-none ${isMax && poolType === "max" && isHighlight ? "fill-green-700" : "fill-slate-700"}`}>
                    {val}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Arrow */}
        <div className="text-center">
          <p className="text-2xl text-slate-300 font-bold">&rarr;</p>
          <p className="text-[10px] text-slate-400 font-semibold">{poolType === "max" ? "Take max" : "Take avg"}</p>
        </div>

        {/* Output 2x2 */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">Output (2x2)</p>
          <svg viewBox={`0 0 ${outGridW} ${outGridW}`} className="w-full max-w-[160px] bg-white rounded border border-slate-200">
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
                    fill={blockColors[idx]} rx={6}
                    stroke={isHighlight ? "#22c55e" : "#cbd5e1"}
                    strokeWidth={isHighlight ? 3 : 1} />
                  <text x={x + outCellSz / 2} y={y + outCellSz / 2 + 7} textAnchor="middle"
                    className="text-[20px] font-mono font-bold fill-slate-700 pointer-events-none">
                    {val}
                  </text>
                </g>
              );
            })}
          </svg>
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
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L28_StridePaddingActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "stride",
        label: "Stride Explorer",
        icon: <Footprints className="w-4 h-4" />,
        content: <StrideTab />,
      },
      {
        id: "padding",
        label: "Padding Demo",
        icon: <Frame className="w-4 h-4" />,
        content: <PaddingTab />,
      },
      {
        id: "pooling",
        label: "Max Pooling",
        icon: <Minimize2 className="w-4 h-4" />,
        content: <PoolingTab />,
      },
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
