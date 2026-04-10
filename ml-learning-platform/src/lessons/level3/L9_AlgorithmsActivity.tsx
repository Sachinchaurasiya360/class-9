"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { BookOpen, Search, Wrench, Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";

const THEMES = [
  { name: "Coral", node: "#ff6b6b", glow: "#ff8a8a", accent: "#ffd93d" },
  { name: "Mint", node: "#4ecdc4", glow: "#7ee0d8", accent: "#ffd93d" },
  { name: "Lavender", node: "#b18cf2", glow: "#c9adf7", accent: "#ffd93d" },
  { name: "Sky", node: "#6bb6ff", glow: "#94caff", accent: "#ffd93d" },
];

const INK = "#2b2a35";

function ThemePicker({ themeIdx, setThemeIdx }: { themeIdx: number; setThemeIdx: (n: number) => void }) {
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 – Follow the Recipe                                         */
/* ------------------------------------------------------------------ */

interface AlgorithmDef {
  name: string;
  data: number[];
  steps: string[];
}

const ALGORITHMS: AlgorithmDef[] = [
  {
    name: "Find the Biggest Number",
    data: [7, 3, 12, 5, 9],
    steps: [
      "Set first card (7) as biggest",
      "Compare 7 with 3  7 is bigger, keep 7",
      "Compare 7 with 12  12 is bigger, update biggest to 12",
      "Compare 12 with 5  12 is bigger, keep 12",
      "Compare 12 with 9  12 is bigger, keep 12",
    ],
  },
  {
    name: "Sort Three Numbers",
    data: [8, 2, 5],
    steps: [
      "Compare positions 1 and 2: 8 > 2, swap them → [2, 8, 5]",
      "Compare positions 2 and 3: 8 > 5, swap them → [2, 5, 8]",
      "Compare positions 1 and 2: 2 < 5, no swap needed → [2, 5, 8]",
      "No more swaps needed  list is sorted!",
    ],
  },
  {
    name: "Is it Even or Odd?",
    data: [17],
    steps: [
      "Take the number: 17",
      "Divide by 2: 17 / 2 = 8 remainder 1",
      "Check the remainder: remainder is 1",
      "Remainder is not 0, so 17 is ODD",
    ],
  },
];

// Compute which card index is "highlighted" (being compared) and which is "biggest" at each step for Find Biggest
function getBiggestHighlights(step: number): { comparing: number; biggest: number } {
  if (step <= 0) return { comparing: 0, biggest: 0 };
  // Steps 1-4 compare index step with current biggest
  const comparingIdx = Math.min(step, 4);
  // After step 2 (index 2 = compare with 12), biggest becomes index 2
  let biggestIdx = 0;
  if (step >= 2) biggestIdx = 2;
  return { comparing: comparingIdx, biggest: biggestIdx };
}

// Compute intermediate sort state at each step
function getSortState(step: number): number[] {
  if (step <= 0) return [8, 2, 5];
  if (step === 1) return [2, 8, 5];
  if (step === 2) return [2, 5, 8];
  return [2, 5, 8];
}

function FollowRecipeTab() {
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = THEMES[themeIdx];
  const [algoIndex, setAlgoIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const algo = ALGORITHMS[algoIndex];
  const totalSteps = algo.steps.length;
  const isDone = currentStep >= totalSteps - 1;

  const handleSelectAlgo = useCallback((idx: number) => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setAlgoIndex(idx);
    setCurrentStep(-1);
    setAutoRunning(false);
  }, []);

  const handleStep = useCallback(() => {
    if (autoRunning) return;
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [autoRunning, totalSteps]);

  const handleReset = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setCurrentStep(-1);
    setAutoRunning(false);
  }, []);

  const handleAutoRun = useCallback(() => {
    if (autoRunning) {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      setAutoRunning(false);
      return;
    }
    setAutoRunning(true);
    setCurrentStep(-1);
  }, [autoRunning]);

  // Auto-run effect
  useEffect(() => {
    if (!autoRunning) return;
    if (currentStep >= totalSteps - 1) {
      setAutoRunning(false);
      return;
    }
    autoTimerRef.current = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 1000);
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [autoRunning, currentStep, totalSteps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  // Render data cards for current algorithm
  const renderDataCards = () => {
    if (algoIndex === 0) {
      // Find biggest
      const highlights = currentStep >= 0 ? getBiggestHighlights(currentStep) : null;
      const cardW = 60;
      const gap = 16;
      const totalW = algo.data.length * cardW + (algo.data.length - 1) * gap;
      const startX = (400 - totalW) / 2;

      return (
        <svg viewBox="0 0 400 90" className="w-full max-w-[400px] mx-auto">
          {algo.data.map((num, i) => {
            const x = startX + i * (cardW + gap);
            const isBiggest = highlights !== null && highlights.biggest === i && currentStep >= 0;
            const isComparing = highlights !== null && highlights.comparing === i && currentStep >= 0;
            let fill = "#f8fafc";
            let stroke = "#cbd5e1";
            let strokeW = 1;
            if (isBiggest && isComparing) {
              fill = "#fef3c7";
              stroke = "#f59e0b";
              strokeW = 2.5;
            } else if (isBiggest) {
              fill = "#fef9c3";
              stroke = "#eab308";
              strokeW = 2;
            } else if (isComparing) {
              fill = "#fef9c3";
              stroke = "#f59e0b";
              strokeW = 2;
            }
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={20}
                  width={cardW}
                  height={50}
                  rx={10}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  className="transition-all duration-300"
                />
                <text
                  x={x + cardW / 2}
                  y={52}
                  textAnchor="middle"
                  className="text-[18px] fill-slate-800 font-bold"
                >
                  {num}
                </text>
                {isBiggest && currentStep >= 0 && (
                  <text x={x + cardW / 2} y={16} textAnchor="middle" className="text-[14px]">
                    &#9733;
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      );
    }

    if (algoIndex === 1) {
      // Sort three numbers
      const displayData = currentStep >= 0 ? getSortState(currentStep) : algo.data;
      const cardW = 60;
      const gap = 24;
      const totalW = displayData.length * cardW + (displayData.length - 1) * gap;
      const startX = (400 - totalW) / 2;

      // Highlight cards involved in current comparison
      let highlightA = -1;
      let highlightB = -1;
      if (currentStep === 0) { highlightA = 0; highlightB = 1; }
      if (currentStep === 1) { highlightA = 1; highlightB = 2; }
      if (currentStep === 2) { highlightA = 0; highlightB = 1; }

      return (
        <svg viewBox="0 0 400 90" className="w-full max-w-[400px] mx-auto">
          {displayData.map((num, i) => {
            const x = startX + i * (cardW + gap);
            const isHighlighted = i === highlightA || i === highlightB;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={20}
                  width={cardW}
                  height={50}
                  rx={10}
                  fill={isDone ? "#dcfce7" : isHighlighted ? "#fef9c3" : "#f8fafc"}
                  stroke={isDone ? "#22c55e" : isHighlighted ? "#f59e0b" : "#cbd5e1"}
                  strokeWidth={isHighlighted || isDone ? 2 : 1}
                  className="transition-all duration-300"
                />
                <text
                  x={x + cardW / 2}
                  y={52}
                  textAnchor="middle"
                  className="text-[18px] fill-slate-800 font-bold"
                >
                  {num}
                </text>
              </g>
            );
          })}
        </svg>
      );
    }

    // Even or odd
    const num = algo.data[0];
    let fill = "#f8fafc";
    let stroke = "#cbd5e1";
    if (isDone) {
      fill = "#e0e7ff";
      stroke = "#6366f1";
    } else if (currentStep >= 0) {
      fill = "#fef9c3";
      stroke = "#f59e0b";
    }
    return (
      <svg viewBox="0 0 400 90" className="w-full max-w-[400px] mx-auto">
        <rect
          x={150}
          y={15}
          width={100}
          height={60}
          rx={12}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
          className="transition-all duration-300"
        />
        <text x={200} y={52} textAnchor="middle" className="text-[22px] fill-slate-800 font-bold">
          {num}
        </text>
      </svg>
    );
  };

  // Result message
  const resultMessages = [
    `Result: The biggest number is 12! Done in 4 comparisons.`,
    `Result: Sorted! [2, 5, 8]  done in 3 passes.`,
    `Result: 17 is ODD!`,
  ];

  return (
    <div className="space-y-4">
      <ThemePicker themeIdx={themeIdx} setThemeIdx={setThemeIdx} />
      {/* Algorithm selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {ALGORITHMS.map((a, i) => (
          <button
            key={a.name}
            onClick={() => { playClick(); handleSelectAlgo(i); }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
              algoIndex === i
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Data cards */}
      <div className="card-sketchy notebook-grid p-4">{renderDataCards()}</div>

      {/* Animated pseudo-code stepper */}
      <div className="card-sketchy p-3" style={{ background: "#fffdf5" }}>
        <p className="font-hand text-xs font-bold uppercase tracking-wide mb-2" style={{ color: INK, opacity: 0.7 }}>
          Algorithm Pseudo-Code
        </p>
        <svg viewBox="0 0 480 30" className="w-full max-w-[480px] mx-auto">
          <defs>
            <radialGradient id="step-grad" cx="35%" cy="30%">
              <stop offset="0%" stopColor={theme.glow} />
              <stop offset="100%" stopColor={theme.node} />
            </radialGradient>
          </defs>
          {algo.steps.map((_, i) => {
            const cx = 24 + i * (440 / Math.max(1, algo.steps.length));
            const isCurrent = i === currentStep;
            const isDone = i < currentStep;
            return (
              <g key={i}>
                {i < algo.steps.length - 1 && (
                  <line
                    x1={cx + 10} y1={15}
                    x2={cx + (440 / Math.max(1, algo.steps.length)) - 10} y2={15}
                    stroke={isDone ? theme.node : "#cbd5e1"}
                    strokeWidth={2.5}
                    className={isCurrent || isDone ? "signal-flow" : ""}
                    style={{ color: theme.node }}
                  />
                )}
                <circle
                  cx={cx} cy={15} r={isCurrent ? 11 : 8}
                  fill={isCurrent || isDone ? "url(#step-grad)" : "#f3efe6"}
                  stroke={INK} strokeWidth={2}
                  className={isCurrent ? "pulse-glow" : ""}
                  style={isCurrent ? { color: theme.node } : undefined}
                />
                <text x={cx} y={19} textAnchor="middle" fontFamily="Kalam" fontWeight="bold" fontSize={10} fill={isCurrent || isDone ? "#fff" : INK}>
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Step list */}
      <div className="card-sketchy p-3 space-y-1.5" style={{ background: "#fffdf5" }}>
        <p className="font-hand text-xs font-bold uppercase tracking-wide mb-2" style={{ color: INK, opacity: 0.7 }}>
          Algorithm Steps
        </p>
        {algo.steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div
              key={i}
              className={`flex items-start gap-2 px-2 py-1.5 rounded-md font-hand text-xs transition-all duration-300 ${
                isCurrent
                  ? "border-2 border-foreground bg-accent-yellow font-bold"
                  : isCompleted
                    ? "font-bold"
                    : "opacity-50"
              }`}
              style={isCompleted && !isCurrent ? { color: theme.node } : { color: INK }}
            >
              <span className="shrink-0 mt-0.5 w-4 text-center">
                {isCompleted ? (
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 inline text-green-500">
                    <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4.5 8 L7 10.5 L11.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isCurrent ? (
                  <span className="text-blue-500 font-bold">&rsaquo;</span>
                ) : (
                  <span className="text-slate-300">&middot;</span>
                )}
              </span>
              <span>{step}</span>
            </div>
          );
        })}
      </div>

      {/* Done message */}
      {isDone && currentStep >= 0 && (
        <div className="text-center text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg py-2 px-4 transition-all duration-300">
          {resultMessages[algoIndex]}
        </div>
      )}

      {/* Control buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => { playPop(); handleStep(); }}
          disabled={isDone || autoRunning}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] hover:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed transition-transform"
        >
          Step
        </button>
        <button
          onClick={() => { playClick(); handleAutoRun(); }}
          disabled={isDone && !autoRunning}
          className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground shadow-[2px_2px_0_#2b2a35] transition-transform ${
            autoRunning ? "bg-accent-coral text-white" : "bg-background hover:bg-accent-mint/40"
          }`}
        >
          {autoRunning ? "Stop" : "Auto-Run"}
        </button>
        <button
          onClick={() => { playClick(); handleReset(); }}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35] hover:translate-y-px transition-transform"
        >
          Reset
        </button>
      </div>

      <InfoBox variant="blue">
        An algorithm is like a recipe  a step-by-step procedure that always produces the correct
        result. If you follow it exactly, you get the answer every time!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Search Race                                                */
/* ------------------------------------------------------------------ */

function generateSortedArray(size: number): number[] {
  const arr: number[] = [];
  let val = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < size; i++) {
    arr.push(val);
    val += 2 + Math.floor(Math.random() * 4);
  }
  return arr;
}

function pickTarget(arr: number[]): number {
  return arr[Math.floor(Math.random() * arr.length)];
}

function SearchRaceTab() {
  const [arraySize, setArraySize] = useState(20);
  const [sortedArray, setSortedArray] = useState<number[]>(() => generateSortedArray(20));
  const [target, setTarget] = useState<number>(() => pickTarget(generateSortedArray(20)));
  const [mode, setMode] = useState<"linear" | "binary">("linear");

  // Linear search state
  const [linearIdx, setLinearIdx] = useState(-1);
  const [linearFound, setLinearFound] = useState(false);
  const [linearSteps, setLinearSteps] = useState(0);
  const [linearChecked, setLinearChecked] = useState<Set<number>>(new Set());

  // Binary search state
  const [binaryLo, setBinaryLo] = useState(0);
  const [binaryHi, setBinaryHi] = useState(19);
  const [binaryMid, setBinaryMid] = useState(-1);
  const [binaryFound, setBinaryFound] = useState(false);
  const [binarySteps, setBinarySteps] = useState(0);
  const [binaryEliminated, setBinaryEliminated] = useState<Set<number>>(new Set());

  // Initialize on mount with consistent state
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const arr = generateSortedArray(20);
      setSortedArray(arr);
      setTarget(pickTarget(arr));
      setBinaryHi(arr.length - 1);
    }
  }, []);

  const resetSearch = useCallback(() => {
    setLinearIdx(-1);
    setLinearFound(false);
    setLinearSteps(0);
    setLinearChecked(new Set());
    setBinaryLo(0);
    setBinaryHi(sortedArray.length - 1);
    setBinaryMid(-1);
    setBinaryFound(false);
    setBinarySteps(0);
    setBinaryEliminated(new Set());
  }, [sortedArray.length]);

  const handleNewTarget = useCallback(() => {
    const arr = generateSortedArray(arraySize);
    setSortedArray(arr);
    const t = pickTarget(arr);
    setTarget(t);
    setLinearIdx(-1);
    setLinearFound(false);
    setLinearSteps(0);
    setLinearChecked(new Set());
    setBinaryLo(0);
    setBinaryHi(arr.length - 1);
    setBinaryMid(-1);
    setBinaryFound(false);
    setBinarySteps(0);
    setBinaryEliminated(new Set());
  }, [arraySize]);

  const handleSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(e.target.value);
    setArraySize(newSize);
    const arr = generateSortedArray(newSize);
    setSortedArray(arr);
    const t = pickTarget(arr);
    setTarget(t);
    setLinearIdx(-1);
    setLinearFound(false);
    setLinearSteps(0);
    setLinearChecked(new Set());
    setBinaryLo(0);
    setBinaryHi(arr.length - 1);
    setBinaryMid(-1);
    setBinaryFound(false);
    setBinarySteps(0);
    setBinaryEliminated(new Set());
  }, []);

  const handleLinearStep = useCallback(() => {
    if (linearFound) return;
    const nextIdx = linearIdx + 1;
    if (nextIdx >= sortedArray.length) return;
    setLinearIdx(nextIdx);
    setLinearSteps((s) => s + 1);
    const newChecked = new Set(linearChecked);
    newChecked.add(nextIdx);
    setLinearChecked(newChecked);
    if (sortedArray[nextIdx] === target) {
      setLinearFound(true);
    }
  }, [linearFound, linearIdx, sortedArray, target, linearChecked]);

  const handleBinaryStep = useCallback(() => {
    if (binaryFound) return;
    if (binaryLo > binaryHi) return;
    const mid = Math.floor((binaryLo + binaryHi) / 2);
    setBinaryMid(mid);
    setBinarySteps((s) => s + 1);

    if (sortedArray[mid] === target) {
      setBinaryFound(true);
      return;
    }

    const newEliminated = new Set(binaryEliminated);
    if (target > sortedArray[mid]) {
      // Eliminate left half including mid
      for (let i = binaryLo; i <= mid; i++) newEliminated.add(i);
      setBinaryLo(mid + 1);
    } else {
      // Eliminate right half including mid
      for (let i = mid; i <= binaryHi; i++) newEliminated.add(i);
      setBinaryHi(mid - 1);
    }
    setBinaryEliminated(newEliminated);
  }, [binaryFound, binaryLo, binaryHi, sortedArray, target, binaryEliminated]);

  const handleStep = mode === "linear" ? handleLinearStep : handleBinaryStep;
  const isFound = mode === "linear" ? linearFound : binaryFound;
  const steps = mode === "linear" ? linearSteps : binarySteps;

  // Calculate how many linear steps it would take
  const linearWouldTake = sortedArray.indexOf(target) + 1;

  // Card sizing
  const cardW = Math.max(20, Math.min(36, 720 / arraySize - 4));
  const cardH = 36;
  const gap = 2;
  const svgW = sortedArray.length * (cardW + gap) + 20;
  const svgH = 70;

  return (
    <div className="space-y-4">
      {/* Target display */}
      <div className="text-center">
        <span className="text-sm font-medium text-slate-600">Find: </span>
        <span className="inline-block px-3 py-1 bg-indigo-100 border border-indigo-300 rounded-lg text-lg font-bold text-indigo-700">
          {target}
        </span>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => { setMode("linear"); resetSearch(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 border ${
            mode === "linear"
              ? "bg-indigo-600 text-white border-indigo-600 shadow"
              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
          }`}
        >
          Linear Search
        </button>
        <button
          onClick={() => { setMode("binary"); resetSearch(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 border ${
            mode === "binary"
              ? "bg-indigo-600 text-white border-indigo-600 shadow"
              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
          }`}
        >
          Binary Search
        </button>
      </div>

      {/* Card array visualization */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full mx-auto"
          style={{ maxWidth: Math.min(svgW, 740) }}
        >
          {/* Binary search active range bracket */}
          {mode === "binary" && !binaryFound && binaryLo <= binaryHi && (
            <rect
              x={10 + binaryLo * (cardW + gap) - 2}
              y={12}
              width={(binaryHi - binaryLo + 1) * (cardW + gap) - gap + 4}
              height={cardH + 16}
              rx={6}
              fill="none"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="4 3"
              className="transition-all duration-300"
            />
          )}
          {sortedArray.map((num, i) => {
            const x = 10 + i * (cardW + gap);
            let fill = "#f8fafc";
            let stroke = "#cbd5e1";
            let strokeW = 1;
            let textFill = "fill-slate-700";
            let opacity = 1;

            if (mode === "linear") {
              if (linearFound && i === linearIdx) {
                fill = "#fef3c7";
                stroke = "#f59e0b";
                strokeW = 2;
                textFill = "fill-amber-800";
              } else if (i === linearIdx) {
                fill = "#fef9c3";
                stroke = "#f59e0b";
                strokeW = 2;
              } else if (linearChecked.has(i)) {
                fill = "#dcfce7";
                stroke = "#22c55e";
                strokeW = 1;
                textFill = "fill-green-700";
              }
            } else {
              if (binaryFound && i === binaryMid) {
                fill = "#fef3c7";
                stroke = "#f59e0b";
                strokeW = 2;
                textFill = "fill-amber-800";
              } else if (i === binaryMid && !binaryFound) {
                fill = "#fef9c3";
                stroke = "#f59e0b";
                strokeW = 2;
              } else if (binaryEliminated.has(i)) {
                fill = "#e2e8f0";
                stroke = "#94a3b8";
                opacity = 0.4;
                textFill = "fill-slate-400";
              }
            }

            const fontSize = cardW < 28 ? 9 : 11;
            return (
              <g key={i} opacity={opacity} className="transition-all duration-300">
                <rect
                  x={x}
                  y={18}
                  width={cardW}
                  height={cardH}
                  rx={6}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  className="transition-all duration-300"
                />
                <text
                  x={x + cardW / 2}
                  y={18 + cardH / 2 + fontSize / 3}
                  textAnchor="middle"
                  className={`font-bold ${textFill}`}
                  style={{ fontSize }}
                >
                  {num}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Step counter */}
      <p className="text-center text-sm font-medium text-slate-600">
        Steps: <span className="font-bold text-slate-800">{steps}</span>
      </p>

      {/* Found message */}
      {isFound && (
        <div className="text-center text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg py-2 px-4 transition-all duration-300">
          Found {target}!{" "}
          {mode === "binary"
            ? `Linear Search would take ${linearWouldTake} steps. Binary Search took ${binarySteps} steps!`
            : `Done in ${linearSteps} steps.`}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleStep}
          disabled={isFound}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          Step
        </button>
        <button
          onClick={handleNewTarget}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-all duration-300 shadow-sm"
        >
          New Target
        </button>
        <button
          onClick={resetSearch}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300"
        >
          Reset
        </button>
      </div>

      {/* Array size slider */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600">
          Array size: <span className="font-bold text-slate-800">{arraySize}</span>
        </label>
        <input
          type="range"
          min={10}
          max={40}
          step={10}
          value={arraySize}
          onChange={handleSizeChange}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40</span>
        </div>
      </div>

      <InfoBox variant="amber">
        Binary search is much faster than linear search, but it only works when data is sorted.
        Each step eliminates half the remaining options!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Build an Algorithm                                         */
/* ------------------------------------------------------------------ */

interface InstructionBlock {
  id: number;
  text: string;
  correct: boolean;
  order: number; // 1-5 for correct blocks, 0 for distractors
}

const INSTRUCTION_BLOCKS: InstructionBlock[] = [
  { id: 1, text: "Start with the first number as the smallest", correct: true, order: 1 },
  { id: 2, text: "Look at the next number", correct: true, order: 2 },
  { id: 3, text: "If it's smaller than the current smallest, update", correct: true, order: 3 },
  { id: 4, text: "Are there more numbers? If yes, go to step 2", correct: true, order: 4 },
  { id: 5, text: "Output the smallest number", correct: true, order: 5 },
  { id: 6, text: "Add all numbers together", correct: false, order: 0 },
  { id: 7, text: "Pick a random number", correct: false, order: 0 },
  { id: 8, text: "Delete the largest number", correct: false, order: 0 },
];

const TEST_DATA = [8, 3, 12, 1, 7];

interface SimStep {
  stepIdx: number;
  highlight: number;
  smallest: number;
  smallestIdx: number;
  message: string;
}

function simulateCorrectAlgorithm(): SimStep[] {
  const steps: SimStep[] = [];
  let smallest = TEST_DATA[0];
  let smallestIdx = 0;
  steps.push({
    stepIdx: 0,
    highlight: 0,
    smallest,
    smallestIdx,
    message: `Start: smallest = ${smallest}`,
  });
  for (let i = 1; i < TEST_DATA.length; i++) {
    steps.push({
      stepIdx: 1,
      highlight: i,
      smallest,
      smallestIdx,
      message: `Look at ${TEST_DATA[i]}`,
    });
    if (TEST_DATA[i] < smallest) {
      smallest = TEST_DATA[i];
      smallestIdx = i;
      steps.push({
        stepIdx: 2,
        highlight: i,
        smallest,
        smallestIdx,
        message: `${TEST_DATA[i]} < ${steps[steps.length - 2].smallest}, update smallest to ${TEST_DATA[i]}`,
      });
    } else {
      steps.push({
        stepIdx: 2,
        highlight: i,
        smallest,
        smallestIdx,
        message: `${TEST_DATA[i]} >= ${smallest}, no update`,
      });
    }
    steps.push({
      stepIdx: 3,
      highlight: i,
      smallest,
      smallestIdx,
      message: i < TEST_DATA.length - 1 ? `More numbers? Yes, continue` : `More numbers? No, done`,
    });
  }
  steps.push({
    stepIdx: 4,
    highlight: smallestIdx,
    smallest,
    smallestIdx,
    message: `Output: smallest = ${smallest}`,
  });
  return steps;
}

function BuildAlgorithmTab() {
  const [sequence, setSequence] = useState<InstructionBlock[]>([]);
  const [testResult, setTestResult] = useState<"idle" | "running" | "correct" | "wrong">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [successAttempt, setSuccessAttempt] = useState<number | null>(null);

  // Animation state
  const [simSteps, setSimSteps] = useState<SimStep[]>([]);
  const [simIndex, setSimIndex] = useState(-1);
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAddBlock = useCallback(
    (block: InstructionBlock) => {
      if (testResult === "running") return;
      // Don't add the same block twice
      if (sequence.some((b) => b.id === block.id)) return;
      setSequence((prev) => [...prev, block]);
      setTestResult("idle");
      setErrorMsg(null);
    },
    [sequence, testResult],
  );

  const handleRemoveLast = useCallback(() => {
    if (testResult === "running") return;
    setSequence((prev) => prev.slice(0, -1));
    setTestResult("idle");
    setErrorMsg(null);
  }, [testResult]);

  const handleClear = useCallback(() => {
    if (simTimerRef.current) clearTimeout(simTimerRef.current);
    setSequence([]);
    setTestResult("idle");
    setErrorMsg(null);
    setSimSteps([]);
    setSimIndex(-1);
  }, []);

  const handleTest = useCallback(() => {
    if (testResult === "running") return;
    setAttempts((a) => a + 1);

    // Check if sequence is correct
    if (sequence.length !== 5) {
      setTestResult("wrong");
      setErrorMsg(
        sequence.length < 5
          ? "Your algorithm needs more steps. Think about what's missing!"
          : "Your algorithm has too many steps. Try to remove unnecessary ones.",
      );
      return;
    }

    // Check for any wrong blocks
    const wrongBlock = sequence.find((b) => !b.correct);
    if (wrongBlock) {
      const wrongIdx = sequence.indexOf(wrongBlock);
      setTestResult("wrong");
      setErrorMsg(
        `Step ${wrongIdx + 1} ("${wrongBlock.text}") doesn't belong in this algorithm. This step won't help find the smallest number.`,
      );
      return;
    }

    // Check correct order
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i].order !== i + 1) {
        setTestResult("wrong");
        setErrorMsg(
          `Step ${i + 1} is out of order. "${sequence[i].text}" should not be step ${i + 1}. Think about the logical order!`,
        );
        return;
      }
    }

    // Correct! Run animation
    setTestResult("running");
    setErrorMsg(null);
    const steps = simulateCorrectAlgorithm();
    setSimSteps(steps);
    setSimIndex(0);

    let idx = 0;
    const tick = () => {
      idx++;
      if (idx >= steps.length) {
        setTestResult("correct");
        setSuccessAttempt((prev) => prev ?? attempts + 1);
        return;
      }
      setSimIndex(idx);
      simTimerRef.current = setTimeout(tick, 700);
    };
    simTimerRef.current = setTimeout(tick, 700);
  }, [testResult, sequence, attempts]);

  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
    };
  }, []);

  // Current simulation data
  const currentSim = simIndex >= 0 && simIndex < simSteps.length ? simSteps[simIndex] : null;

  // Shuffled blocks for display
  const availableBlocks = useMemo(() => {
    // Show all blocks, but in a shuffled order
    const shuffled = [...INSTRUCTION_BLOCKS];
    // Deterministic shuffle based on fixed seed-like approach
    const order = [5, 0, 7, 2, 6, 1, 3, 4]; // Pre-defined shuffle
    return order.map((i) => shuffled[i]);
  }, []);

  // Data card rendering
  const cardW = 52;
  const gap = 12;
  const totalW = TEST_DATA.length * cardW + (TEST_DATA.length - 1) * gap;
  const svgStartX = (360 - totalW) / 2;

  return (
    <div className="space-y-4">
      {/* Task */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <p className="text-sm font-semibold text-indigo-800">
          Task: Build an algorithm to find the smallest number in a list
        </p>
      </div>

      {/* Test data visualization */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1 text-center">Test Data</p>
        <svg viewBox={`0 0 360 70`} className="w-full max-w-[360px] mx-auto">
          {TEST_DATA.map((num, i) => {
            const x = svgStartX + i * (cardW + gap);
            let fill = "#f8fafc";
            let stroke = "#cbd5e1";
            let strokeW = 1;

            if (currentSim) {
              if (i === currentSim.highlight) {
                fill = "#fef9c3";
                stroke = "#f59e0b";
                strokeW = 2;
              }
              if (i === currentSim.smallestIdx && testResult === "running") {
                fill = "#dcfce7";
                stroke = "#22c55e";
                strokeW = 2;
              }
              if (i === currentSim.highlight && i === currentSim.smallestIdx) {
                fill = "#fef3c7";
                stroke = "#f59e0b";
                strokeW = 2.5;
              }
            }
            if (testResult === "correct" && i === (currentSim?.smallestIdx ?? -1)) {
              fill = "#dcfce7";
              stroke = "#22c55e";
              strokeW = 2;
            }

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={10}
                  width={cardW}
                  height={44}
                  rx={8}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  className="transition-all duration-300"
                />
                <text
                  x={x + cardW / 2}
                  y={38}
                  textAnchor="middle"
                  className="text-[16px] fill-slate-800 font-bold"
                >
                  {num}
                </text>
                {currentSim && i === currentSim.smallestIdx && testResult === "running" && (
                  <text x={x + cardW / 2} y={8} textAnchor="middle" className="text-[10px]">
                    &#9733;
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Sim message */}
      {currentSim && (testResult === "running" || testResult === "correct") && (
        <div className="text-center text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3">
          {currentSim.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Available blocks */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Available Blocks
          </p>
          <div className="space-y-1.5">
            {availableBlocks.map((block) => {
              const isUsed = sequence.some((b) => b.id === block.id);
              return (
                <button
                  key={block.id}
                  onClick={() => handleAddBlock(block)}
                  disabled={isUsed || testResult === "running"}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-300 ${
                    isUsed
                      ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed"
                      : block.correct
                        ? "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                  }`}
                >
                  {block.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sequence */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Your Algorithm
          </p>
          {sequence.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
              <p className="text-xs text-slate-400">Click blocks on the left to build your algorithm</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {sequence.map((block, i) => {
                let blockStyle = "bg-white border-slate-200 text-slate-700";
                if (testResult === "correct") {
                  blockStyle = "bg-green-50 border-green-300 text-green-800";
                } else if (testResult === "wrong" && errorMsg?.includes(block.text)) {
                  blockStyle = "bg-red-50 border-red-300 text-red-800";
                } else if (
                  testResult === "running" &&
                  currentSim &&
                  currentSim.stepIdx === i
                ) {
                  blockStyle = "bg-blue-50 border-blue-300 text-blue-800";
                }
                return (
                  <div
                    key={block.id}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-300 ${blockStyle}`}
                  >
                    <span className="font-bold text-slate-400 mr-2">{i + 1}.</span>
                    {block.text}
                  </div>
                );
              })}
            </div>
          )}
          {/* Remove last button */}
          {sequence.length > 0 && testResult !== "running" && (
            <button
              onClick={handleRemoveLast}
              className="mt-2 text-xs text-slate-500 hover:text-red-600 transition-colors"
            >
              Remove last
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {testResult === "wrong" && errorMsg && (
        <div className="text-center text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg py-2 px-4 transition-all duration-300">
          {errorMsg}
        </div>
      )}

      {/* Success message */}
      {testResult === "correct" && (
        <div className="text-center text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg py-2 px-4 transition-all duration-300">
          Correct! Your algorithm found the smallest number: 1!
          {successAttempt !== null && (
            <span className="block text-xs mt-1 text-green-600">
              Correct on attempt: {successAttempt}
            </span>
          )}
        </div>
      )}

      {/* Control buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleTest}
          disabled={sequence.length === 0 || testResult === "running"}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          Test Algorithm
        </button>
        <button
          onClick={handleClear}
          disabled={testResult === "running"}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
        >
          Clear
        </button>
      </div>

      <InfoBox variant="green">
        You just designed an algorithm! Computer scientists do this every day. The challenge is
        making algorithms that are both correct AND fast.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What makes something an algorithm?",
    options: [
      "It uses a computer",
      "It is a step-by-step procedure with a clear beginning and end",
      "It is very fast",
      "It involves numbers only",
    ],
    correctIndex: 1,
    explanation:
      "An algorithm is a finite, step-by-step procedure that takes input and produces output. It doesn't even need a computer  a cooking recipe is an algorithm!",
  },
  {
    question:
      "For a sorted list of 1000 numbers, about how many steps does binary search need at most?",
    options: ["1000", "500", "100", "10"],
    correctIndex: 3,
    explanation:
      "Binary search eliminates half the remaining options each step: 1000 \u2192 500 \u2192 250 \u2192 125 \u2192 63 \u2192 32 \u2192 16 \u2192 8 \u2192 4 \u2192 2 \u2192 1. That's about 10 steps (log\u2082 of 1000).",
  },
  {
    question: "Can two different algorithms solve the same problem?",
    options: [
      "No, there's only one way",
      "Yes, but they might take different numbers of steps",
      "Only if they're written in the same programming language",
      "Only if the problem is easy",
    ],
    correctIndex: 1,
    explanation:
      "Many algorithms can solve the same problem. For example, bubble sort and selection sort both sort data, but they work differently and may take different numbers of steps.",
  },
  {
    question: "Why is binary search faster than linear search?",
    options: [
      "It skips every other element",
      "It eliminates half the remaining options each step",
      "It's always faster",
      "It doesn't need sorted data",
    ],
    correctIndex: 1,
    explanation:
      "Binary search works by checking the middle element and eliminating the half that can't contain the target. Each step cuts the search space in half!",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function L9_AlgorithmsActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "follow-recipe",
        label: "Follow the Recipe",
        icon: <BookOpen className="w-4 h-4" />,
        content: <FollowRecipeTab />,
      },
      {
        id: "search-race",
        label: "Search Race",
        icon: <Search className="w-4 h-4" />,
        content: <SearchRaceTab />,
      },
      {
        id: "build-algorithm",
        label: "Build an Algorithm",
        icon: <Wrench className="w-4 h-4" />,
        content: <BuildAlgorithmTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="What Is an Algorithm?"
      level={3}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Now you know what an algorithm is. So here's the big question: can we make an algorithm that LEARNS? That's exactly what the next lesson is about!"
      story={
        <StorySection
          paragraphs={[
            "Aru was frantic. Her dog, Biscuit, had escaped from the yard and could be anywhere in the neighborhood.",
            "Aru: \"I need to find Biscuit! Should I run around randomly?\"",
            "Byte: \"Stop! Let's think step by step. First, check the places Biscuit goes most often - the park, the neighbor's yard, the bakery. Then expand your search outward. That's an algorithm - a step-by-step plan to solve a problem.\"",
            "Aru: \"So an algorithm is just... a plan?\"",
            "Byte: \"A very precise plan! One where every step is clear, the order matters, and you always reach the answer. Recipes, GPS directions, even your morning routine - they're all algorithms. And some algorithms are much faster than others!\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="An algorithm is a step-by-step procedure with a clear beginning and end that solves a problem. The same algorithm always produces the same result for the same input. Different algorithms can solve the same problem, but some take fewer steps than others - finding efficient algorithms is at the heart of computer science."
        />
      }
    />
  );
}
