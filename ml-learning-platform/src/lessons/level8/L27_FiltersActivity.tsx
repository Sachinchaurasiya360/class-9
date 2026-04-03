import { useState, useMemo, useCallback } from "react";
import { ScanLine, Wrench, Layers } from "lucide-react";
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
const TEST_IMAGE: number[] = (() => {
  const rand = mulberry32(777);
  const img: number[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      // Vertical edge in the middle
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
/*  Tab 1 -- Apply a Filter (step-by-step)                             */
/* ------------------------------------------------------------------ */
function ApplyFilterTab() {
  const [preset, setPreset] = useState(0);
  const [step, setStep] = useState(-1); // -1 = not started

  const kernel = PRESETS[preset].kernel;
  const outputSize = 6;
  const totalSteps = outputSize * outputSize;

  const output = useMemo(() => applyConv(TEST_IMAGE, kernel, 8), [kernel]);

  const currentRow = step >= 0 ? Math.floor(step / outputSize) : -1;
  const currentCol = step >= 0 ? step % outputSize : -1;

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

  // Compute products for current step
  const products = useMemo(() => {
    if (step < 0) return null;
    const prods: { val: number; weight: number; product: number }[] = [];
    for (let kr = 0; kr < 3; kr++) {
      for (let kc = 0; kc < 3; kc++) {
        const imgVal = TEST_IMAGE[(currentRow + kr) * 8 + (currentCol + kc)];
        const w = kernel[kr * 3 + kc];
        prods.push({ val: imgVal, weight: w, product: imgVal * w });
      }
    }
    return prods;
  }, [step, currentRow, currentCol, kernel]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Pick a filter preset, then click "Step" to watch the 3x3 kernel slide across the image.
      </p>

      {/* Preset buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={p.name} onClick={() => handlePreset(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${preset === i ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
        {/* Input grid */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">Input (8x8)</p>
          <svg viewBox={`0 0 ${gridW} ${gridW}`} className="w-full max-w-[260px] bg-slate-100 rounded">
            {TEST_IMAGE.map((val, idx) => {
              const row = Math.floor(idx / 8);
              const col = idx % 8;
              const x = gapSz + col * (cellSz + gapSz);
              const y = gapSz + row * (cellSz + gapSz);
              const inWindow = step >= 0 && row >= currentRow && row < currentRow + 3 && col >= currentCol && col < currentCol + 3;
              return (
                <g key={idx}>
                  <rect x={x} y={y} width={cellSz} height={cellSz} fill={grayHex(val)} rx={2}
                    stroke={inWindow ? "#f59e0b" : "none"} strokeWidth={inWindow ? 3 : 0} />
                  <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle" fill={txtCol(val)}
                    className="text-[8px] font-mono pointer-events-none">{val}</text>
                </g>
              );
            })}
            {/* Highlight window */}
            {step >= 0 && (
              <rect
                x={gapSz + currentCol * (cellSz + gapSz) - 2}
                y={gapSz + currentRow * (cellSz + gapSz) - 2}
                width={cellSz * 3 + gapSz * 2 + 4}
                height={cellSz * 3 + gapSz * 2 + 4}
                fill="none" stroke="#f59e0b" strokeWidth={3} rx={4} strokeDasharray="6 3"
              />
            )}
          </svg>
        </div>

        {/* Kernel display */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">Kernel (3x3)</p>
          <svg viewBox="0 0 130 130" className="w-full max-w-[110px] bg-amber-50 rounded border border-amber-200">
            {kernel.map((w, idx) => {
              const row = Math.floor(idx / 3);
              const col = idx % 3;
              return (
                <g key={idx}>
                  <rect x={5 + col * 40} y={5 + row * 40} width={38} height={38} fill={w > 0 ? "#dbeafe" : w < 0 ? "#fee2e2" : "#f1f5f9"} rx={3} stroke="#94a3b8" strokeWidth={0.5} />
                  <text x={5 + col * 40 + 19} y={5 + row * 40 + 23} textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-700">
                    {Number.isInteger(w) ? w : w.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </svg>
          {products && (
            <div className="mt-2 bg-white border border-slate-200 rounded p-2 text-center">
              <p className="text-[10px] text-slate-500 font-semibold">Sum = {clamp(output[step])}</p>
            </div>
          )}
        </div>

        {/* Output grid */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">Output (6x6)</p>
          <svg viewBox={`0 0 ${outGridW} ${outGridW}`} className="w-full max-w-[200px] bg-slate-100 rounded">
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
                    fill={filled ? grayHex(val) : "#e2e8f0"} rx={2}
                    stroke={isCurrent ? "#22c55e" : "none"} strokeWidth={isCurrent ? 3 : 0} />
                  {filled && (
                    <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle" fill={txtCol(val)}
                      className="text-[8px] font-mono pointer-events-none">{val}</text>
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
          Step ({step + 1}/{totalSteps})
        </button>
        <button onClick={handleAutoRun} className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm">
          Run All
        </button>
        <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all">
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

  const output = useMemo(() => applyConv(TEST_IMAGE, kernel, 8), [kernel]);

  const handleKernelChange = useCallback((idx: number, delta: number) => {
    playPop();
    setKernel((prev) => {
      const next = [...prev];
      next[idx] = Math.max(-2, Math.min(2, next[idx] + delta));
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
      <p className="text-sm text-slate-600">
        Edit the 3x3 kernel values to create your own filter. Click +/- buttons to change each weight.
      </p>

      <div className="flex gap-2 justify-center flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={p.name} onClick={() => handleLoadPreset(i)}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-all">
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
        {/* Kernel editor */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">Your Kernel</p>
          <div className="grid grid-cols-3 gap-1">
            {kernel.map((w, idx) => (
              <div key={idx} className="flex flex-col items-center bg-amber-50 border border-amber-200 rounded-lg p-1 w-16">
                <button onClick={() => handleKernelChange(idx, 1)} className="text-xs font-bold text-slate-500 hover:text-indigo-600">+</button>
                <span className={`text-sm font-mono font-bold ${w > 0 ? "text-blue-600" : w < 0 ? "text-red-600" : "text-slate-400"}`}>
                  {Number.isInteger(w) ? w : w.toFixed(1)}
                </span>
                <button onClick={() => handleKernelChange(idx, -1)} className="text-xs font-bold text-slate-500 hover:text-red-600">-</button>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="text-2xl text-slate-300 font-bold hidden sm:block">&rarr;</div>

        {/* Output */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">Output (6x6)</p>
          <svg viewBox={`0 0 ${outGridW} ${outGridW}`} className="w-full max-w-[200px] bg-slate-100 rounded">
            {output.map((val, idx) => {
              const row = Math.floor(idx / 6);
              const col = idx % 6;
              const x = gapSz + col * (cellSz + gapSz);
              const y = gapSz + row * (cellSz + gapSz);
              const clamped = clamp(val);
              return (
                <g key={idx}>
                  <rect x={x} y={y} width={cellSz} height={cellSz} fill={grayHex(clamped)} rx={2} />
                  <text x={x + cellSz / 2} y={y + cellSz / 2 + 4} textAnchor="middle" fill={txtCol(clamped)}
                    className="text-[7px] font-mono pointer-events-none">{clamped}</text>
                </g>
              );
            })}
          </svg>
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
  const filters = useMemo(() => [
    { name: "Blur", kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1].map((v) => v / 9), color: "#3b82f6" },
    { name: "Edge Detect", kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1], color: "#ef4444" },
    { name: "Sharpen", kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0], color: "#22c55e" },
  ], []);

  const outputs = useMemo(() => filters.map((f) => applyConv(TEST_IMAGE, f.kernel, 8)), [filters]);

  const cellSz = 28;
  const gapSz = 1;
  const inGridW = cellSz * 8 + gapSz * 9;
  const outGridW = cellSz * 6 + gapSz * 7;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        The same image processed by three different filters simultaneously. Each one extracts different features!
      </p>

      {/* Input */}
      <div className="flex justify-center">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 text-center">Input (8x8)</p>
          <svg viewBox={`0 0 ${inGridW} ${inGridW}`} className="w-full max-w-[180px] bg-slate-100 rounded mx-auto">
            {TEST_IMAGE.map((val, idx) => {
              const row = Math.floor(idx / 8);
              const col = idx % 8;
              const x = gapSz + col * (cellSz + gapSz);
              const y = gapSz + row * (cellSz + gapSz);
              return (
                <rect key={idx} x={x} y={y} width={cellSz} height={cellSz} fill={grayHex(val)} rx={2} />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Arrow */}
      <p className="text-center text-slate-300 text-lg font-bold">&darr; Apply 3 filters &darr;</p>

      {/* Outputs side by side */}
      <div className="flex gap-3 justify-center flex-wrap">
        {filters.map((f, fi) => (
          <div key={f.name}>
            <p className="text-xs font-bold mb-1 text-center" style={{ color: f.color }}>{f.name}</p>
            <svg viewBox={`0 0 ${outGridW} ${outGridW}`} className="w-full max-w-[150px] bg-slate-100 rounded border-2" style={{ borderColor: f.color }}>
              {outputs[fi].map((val, idx) => {
                const row = Math.floor(idx / 6);
                const col = idx % 6;
                const x = gapSz + col * (cellSz + gapSz);
                const y = gapSz + row * (cellSz + gapSz);
                const clamped = clamp(val);
                return (
                  <rect key={idx} x={x} y={y} width={cellSz} height={cellSz} fill={grayHex(clamped)} rx={2} />
                );
              })}
            </svg>
            {/* Kernel mini view */}
            <div className="mt-1 flex justify-center">
              <svg viewBox="0 0 54 54" className="w-12 h-12">
                {f.kernel.map((w, ki) => {
                  const r = Math.floor(ki / 3);
                  const c = ki % 3;
                  return (
                    <rect key={ki} x={c * 18} y={r * 18} width={17} height={17} rx={2}
                      fill={w > 0 ? "#dbeafe" : w < 0 ? "#fee2e2" : "#f1f5f9"} stroke="#94a3b8" strokeWidth={0.5} />
                  );
                })}
              </svg>
            </div>
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
