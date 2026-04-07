import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowUpDown, FolderOpen, Timer, Shuffle, Play, Pause, SkipForward, RotateCcw, Trophy } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";

/* ------------------------------------------------------------------ */
/*  Seeded PRNG                                                        */
/* ------------------------------------------------------------------ */

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function shuffleArray(arr: number[], seed: number): number[] {
  const rng = seededRandom(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateArray(size: number, seed: number): number[] {
  const base = Array.from({ length: size }, (_, i) => Math.floor(((i + 1) / size) * 45) + 5);
  return shuffleArray(base, seed);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Tab 1  Sort It Out (Bubble Sort)                                  */
/* ------------------------------------------------------------------ */

interface SortState {
  array: number[];
  comparingIndex: number;
  pass: number;
  comparisons: number;
  swaps: number;
  sorted: boolean;
  justSwapped: number[];
}

function initSortState(seed: number): SortState {
  return {
    array: generateArray(10, seed),
    comparingIndex: 0,
    pass: 1,
    comparisons: 0,
    swaps: 0,
    sorted: false,
    justSwapped: [],
  };
}

function bubbleSortStep(state: SortState): SortState {
  if (state.sorted) return state;

  const arr = [...state.array];
  const i = state.comparingIndex;
  const n = arr.length;
  const passEnd = n - state.pass;
  let swapped = false;
  const justSwapped: number[] = [];

  if (i < passEnd) {
    if (arr[i] > arr[i + 1]) {
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      swapped = true;
      justSwapped.push(i, i + 1);
    }

    const nextIndex = i + 1;
    if (nextIndex >= passEnd) {
      // End of this pass
      const nextPass = state.pass + 1;
      if (nextPass >= n) {
        return {
          ...state,
          array: arr,
          comparingIndex: 0,
          pass: nextPass,
          comparisons: state.comparisons + 1,
          swaps: state.swaps + (swapped ? 1 : 0),
          sorted: true,
          justSwapped,
        };
      }
      return {
        ...state,
        array: arr,
        comparingIndex: 0,
        pass: nextPass,
        comparisons: state.comparisons + 1,
        swaps: state.swaps + (swapped ? 1 : 0),
        sorted: false,
        justSwapped,
      };
    }

    return {
      ...state,
      array: arr,
      comparingIndex: nextIndex,
      comparisons: state.comparisons + 1,
      swaps: state.swaps + (swapped ? 1 : 0),
      justSwapped,
    };
  }

  // If comparingIndex >= passEnd, move to next pass
  const nextPass = state.pass + 1;
  if (nextPass >= n) {
    return { ...state, sorted: true, comparingIndex: 0, pass: nextPass, justSwapped: [] };
  }
  return { ...state, comparingIndex: 0, pass: nextPass, justSwapped: [] };
}

function SortItOut() {
  const seedRef = useRef(42);
  const [state, setState] = useState<SortState>(() => initSortState(seedRef.current));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = useCallback(() => {
    playClick();
    setState((prev) => bubbleSortStep(prev));
  }, []);

  const shuffle = useCallback(() => {
    playPop();
    seedRef.current = Date.now() % 100000;
    setState(initSortState(seedRef.current));
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const prevSortedRef = useRef(false);
  useEffect(() => {
    if (state.sorted && !prevSortedRef.current) playSuccess();
    prevSortedRef.current = state.sorted;
  }, [state.sorted]);

  useEffect(() => {
    if (playing && !state.sorted) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const next = bubbleSortStep(prev);
          if (next.sorted) {
            setPlaying(false);
          }
          return next;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed, state.sorted]);

  useEffect(() => {
    if (state.sorted && playing) {
      setPlaying(false);
    }
  }, [state.sorted, playing]);

  const togglePlay = useCallback(() => {
    if (state.sorted) return;
    setPlaying((p) => !p);
  }, [state.sorted]);

  const maxVal = useMemo(() => Math.max(...state.array), [state.array]);
  const barWidth = 36;
  const gap = 6;
  const svgWidth = state.array.length * (barWidth + gap) + gap;
  const svgHeight = 220;
  const maxBarHeight = 170;

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold text-center" style={{ color: INK }}>
          Watch how bubble sort organizes data step by step
        </h3>

        {/* SVG bars */}
        <div className="flex justify-center overflow-x-auto">
          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="max-w-full">
            <defs>
              <linearGradient id="bar-grad-cool" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94caff" />
                <stop offset="100%" stopColor={SKY} />
              </linearGradient>
              <linearGradient id="bar-grad-mint" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7ee0d8" />
                <stop offset="100%" stopColor={MINT} />
              </linearGradient>
              <linearGradient id="bar-grad-lav" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9adf7" />
                <stop offset="100%" stopColor={LAVENDER} />
              </linearGradient>
              <linearGradient id="bar-grad-hot" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffe066" />
                <stop offset="100%" stopColor={YELLOW} />
              </linearGradient>
              <linearGradient id="bar-grad-done" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7ee0d8" />
                <stop offset="100%" stopColor={MINT} />
              </linearGradient>
            </defs>
            {state.array.map((value, i) => {
              const barHeight = (value / maxVal) * maxBarHeight;
              const x = gap + i * (barWidth + gap);
              const y = svgHeight - 30 - barHeight;
              const isComparing = !state.sorted && (i === state.comparingIndex || i === state.comparingIndex + 1);
              const isSwapped = state.justSwapped.includes(i);

              let grad: string;
              if (state.sorted) grad = "url(#bar-grad-done)";
              else if (isComparing || isSwapped) grad = "url(#bar-grad-hot)";
              else {
                const t = value / maxVal;
                grad = t < 0.34 ? "url(#bar-grad-lav)" : t < 0.67 ? "url(#bar-grad-cool)" : "url(#bar-grad-mint)";
              }

              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={4}
                    fill={grad}
                    stroke={INK}
                    strokeWidth={2}
                    className={isComparing && !state.sorted ? "pulse-glow" : ""}
                    style={{
                      transition: "all 0.15s ease-in-out",
                      filter: state.sorted ? "drop-shadow(2px 2px 0 #2b2a35)" : "drop-shadow(1.5px 1.5px 0 #2b2a35)",
                      color: isComparing ? YELLOW : MINT,
                    }}
                  />
                  {isComparing && !state.sorted && (
                    <line
                      x1={x} y1={y - 4} x2={x + barWidth} y2={y - 4}
                      stroke={CORAL} strokeWidth={2.5} strokeLinecap="round"
                      className="signal-flow"
                    />
                  )}
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fill={INK}
                    fontFamily="Kalam"
                    style={{ fontSize: 12, fontWeight: 700 }}
                  >
                    {value}
                  </text>
                  {isComparing && !state.sorted && (
                    <polygon
                      points={`${x + barWidth / 2 - 5},${svgHeight - 18} ${x + barWidth / 2 + 5},${svgHeight - 18} ${x + barWidth / 2},${svgHeight - 25}`}
                      fill={CORAL}
                      stroke={INK}
                      strokeWidth={1}
                    />
                  )}
                  {/* Spark particles on completion */}
                  {state.sorted && (
                    <g>
                      {[0, 1].map((k) => {
                        const angle = ((i + k * 4) / state.array.length) * Math.PI * 2;
                        const cx = x + barWidth / 2;
                        const cy = y;
                        return (
                          <line
                            key={k}
                            x1={cx} y1={cy}
                            x2={cx + Math.cos(angle) * 14}
                            y2={cy + Math.sin(angle) * 14}
                            stroke={YELLOW}
                            strokeWidth={2}
                            strokeLinecap="round"
                            className="spark"
                            style={{ animationDelay: `${(i * 0.05) + k * 0.2}s` }}
                          />
                        );
                      })}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sorted banner */}
        {state.sorted && (
          <div className="card-sketchy p-3 flex items-center justify-center gap-2" style={{ background: MINT + "33" }}>
            <Trophy className="w-5 h-5" style={{ color: INK }} />
            <span className="font-hand text-base font-bold" style={{ color: INK }}>Sorted!</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-6 font-hand text-sm font-bold" style={{ color: INK }}>
          <span>Comparisons: <span style={{ color: CORAL }}>{state.comparisons}</span></span>
          <span>Swaps: <span style={{ color: LAVENDER }}>{state.swaps}</span></span>
          <span>Pass: <span style={{ color: SKY }}>{state.pass}</span></span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={shuffle}
            className="px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground bg-background hover:bg-accent-yellow/40 shadow-[2px_2px_0_#2b2a35] inline-flex items-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5" /> Shuffle
          </button>
          <button
            onClick={step}
            disabled={state.sorted || playing}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground inline-flex items-center gap-1.5 ${
              state.sorted || playing
                ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                : "bg-background hover:bg-accent-yellow/40 shadow-[2px_2px_0_#2b2a35]"
            }`}
          >
            <SkipForward className="w-3.5 h-3.5" /> Step
          </button>
          <button
            onClick={() => { playClick(); togglePlay(); }}
            disabled={state.sorted}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground inline-flex items-center gap-1.5 ${
              state.sorted
                ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                : playing
                  ? "bg-accent-coral text-white shadow-[2px_2px_0_#2b2a35]"
                  : "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
            }`}
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? "Pause" : "Play"}
          </button>
        </div>

        {/* Speed slider */}
        <div className="flex items-center justify-center gap-3">
          <span className="font-hand text-xs font-bold" style={{ color: INK }}>Fast</span>
          <input
            type="range"
            min={100}
            max={800}
            step={50}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-40 accent-accent-coral"
          />
          <span className="font-hand text-xs font-bold" style={{ color: INK }}>Slow</span>
        </div>
      </div>

      <InfoBox variant="blue">
        Sorting means putting things in order  smallest to largest. Bubble sort works by comparing neighbors and
        swapping them if they're in the wrong order. The biggest values "bubble up" to the end!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Grouping Game                                              */
/* ------------------------------------------------------------------ */

type Shape = "Circle" | "Square" | "Triangle";
type Color = "Red" | "Blue" | "Green";
type Size = "Small" | "Large";
type GroupBy = "Shape" | "Color" | "Size";

interface ItemCard {
  id: number;
  shape: Shape;
  color: Color;
  size: Size;
}

const SHAPES: Shape[] = ["Circle", "Square", "Triangle"];
const COLORS: Color[] = ["Red", "Blue", "Green"];
const SIZES: Size[] = ["Small", "Large"];

function buildItems(): ItemCard[] {
  const items: ItemCard[] = [];
  let id = 0;
  // 12 items: one of each shape+color, with alternating sizes
  for (const shape of SHAPES) {
    for (const color of COLORS) {
      const size: Size = SIZES[id % 2];
      items.push({ id, shape, color, size });
      id++;
    }
  }
  // Add 3 more to reach 12
  items.push({ id: 9, shape: "Circle", color: "Red", size: "Large" });
  items.push({ id: 10, shape: "Square", color: "Blue", size: "Small" });
  items.push({ id: 11, shape: "Triangle", color: "Green", size: "Large" });
  return items;
}

const ITEMS = buildItems();

const COLOR_MAP: Record<Color, { fill: string; stroke: string; bg: string }> = {
  Red: { fill: "#ef4444", stroke: "#dc2626", bg: "bg-red-50" },
  Blue: { fill: "#3b82f6", stroke: "#2563eb", bg: "bg-blue-50" },
  Green: { fill: "#22c55e", stroke: "#16a34a", bg: "bg-green-50" },
};

function ShapeSVG({ shape, color, size }: { shape: Shape; color: Color; size: Size }) {
  const dim = size === "Large" ? 32 : 20;
  const c = COLOR_MAP[color];
  const cx = 24;
  const cy = 24;

  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      {shape === "Circle" && (
        <circle cx={cx} cy={cy} r={dim / 2} fill={c.fill} stroke={c.stroke} strokeWidth={1.5} />
      )}
      {shape === "Square" && (
        <rect
          x={cx - dim / 2}
          y={cy - dim / 2}
          width={dim}
          height={dim}
          rx={2}
          fill={c.fill}
          stroke={c.stroke}
          strokeWidth={1.5}
        />
      )}
      {shape === "Triangle" && (
        <polygon
          points={`${cx},${cy - dim / 2} ${cx + dim / 2},${cy + dim / 2} ${cx - dim / 2},${cy + dim / 2}`}
          fill={c.fill}
          stroke={c.stroke}
          strokeWidth={1.5}
        />
      )}
    </svg>
  );
}

function GroupingGame() {
  const [groupBy, setGroupBy] = useState<GroupBy>("Shape");

  const grouped = useMemo(() => {
    const groups: Record<string, ItemCard[]> = {};
    for (const item of ITEMS) {
      const key = item[groupBy.toLowerCase() as keyof ItemCard] as string;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [groupBy]);

  const groupKeys = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  // Colors for bar chart segments
  const GROUP_COLORS = ["#6366f1", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold text-center" style={{ color: INK }}>
          Group these items in different ways
        </h3>

        {/* Grouping selector */}
        <div className="flex justify-center gap-2">
          {(["Shape", "Color", "Size"] as GroupBy[]).map((option) => (
            <button
              key={option}
              onClick={() => { playClick(); setGroupBy(option); }}
              className={`px-4 py-2 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
                groupBy === option
                  ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                  : "bg-background hover:bg-accent-yellow/40"
              }`}
            >
              Group by {option}
            </button>
          ))}
        </div>

        {/* Grouped items */}
        <div className="space-y-4">
          {groupKeys.map((key) => (
            <div key={key} className="border border-slate-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {key} ({grouped[key].length} items)
              </h4>
              <div className="flex flex-wrap gap-2">
                {grouped[key].map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col items-center gap-1 transition-all duration-300 ease-in-out hover:shadow-md"
                    style={{ minWidth: 68 }}
                  >
                    <ShapeSVG shape={item.shape} color={item.color} size={item.size} />
                    <span className="text-[10px] text-slate-500 leading-tight text-center">
                      {item.size} {item.color}
                      <br />
                      {item.shape}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Items per Group
          </h4>
          <div className="flex justify-center">
            <svg
              width={Math.max(groupKeys.length * 80 + 40, 200)}
              height={140}
              viewBox={`0 0 ${Math.max(groupKeys.length * 80 + 40, 200)} 140`}
              className="max-w-full"
            >
              {groupKeys.map((key, i) => {
                const count = grouped[key].length;
                const maxCount = Math.max(...groupKeys.map((k) => grouped[k].length));
                const barH = (count / Math.max(maxCount, 1)) * 80;
                const x = 20 + i * 80;
                return (
                  <g key={key}>
                    <rect
                      x={x}
                      y={100 - barH}
                      width={50}
                      height={barH}
                      rx={4}
                      fill={GROUP_COLORS[i % GROUP_COLORS.length]}
                      style={{ transition: "all 0.4s ease-in-out" }}
                    />
                    <text
                      x={x + 25}
                      y={94 - barH}
                      textAnchor="middle"
                      className="fill-slate-700"
                      style={{ fontSize: 12, fontWeight: 700 }}
                    >
                      {count}
                    </text>
                    <text
                      x={x + 25}
                      y={120}
                      textAnchor="middle"
                      className="fill-slate-500"
                      style={{ fontSize: 10 }}
                    >
                      {key}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <InfoBox variant="amber">
        Grouping reveals hidden structure. The same data can be grouped in different ways, and each way tells you
        something different! Try all three options.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Which Is Faster? (Algorithm Race)                          */
/* ------------------------------------------------------------------ */

// Selection sort: one step at a time
interface SelectionSortTracker {
  array: number[];
  sortedUpTo: number;
  scanIndex: number;
  minIndex: number;
  comparisons: number;
  sorted: boolean;
}

function initSelectionSort(arr: number[]): SelectionSortTracker {
  return {
    array: [...arr],
    sortedUpTo: 0,
    scanIndex: 1,
    minIndex: 0,
    comparisons: 0,
    sorted: false,
  };
}

function selectionSortStep(state: SelectionSortTracker): SelectionSortTracker {
  if (state.sorted) return state;
  const arr = [...state.array];
  const n = arr.length;
  let { sortedUpTo, scanIndex, minIndex, comparisons } = state;

  if (sortedUpTo >= n - 1) {
    return { ...state, sorted: true };
  }

  if (scanIndex < n) {
    comparisons++;
    if (arr[scanIndex] < arr[minIndex]) {
      minIndex = scanIndex;
    }
    scanIndex++;
    return { ...state, scanIndex, minIndex, comparisons };
  }

  // Swap min to sortedUpTo position
  [arr[sortedUpTo], arr[minIndex]] = [arr[minIndex], arr[sortedUpTo]];
  sortedUpTo++;
  if (sortedUpTo >= n - 1) {
    return { array: arr, sortedUpTo, scanIndex: sortedUpTo + 1, minIndex: sortedUpTo, comparisons, sorted: true };
  }
  return {
    array: arr,
    sortedUpTo,
    scanIndex: sortedUpTo + 1,
    minIndex: sortedUpTo,
    comparisons,
    sorted: false,
  };
}

// Bubble sort tracker for the race
interface BubbleSortTracker {
  array: number[];
  index: number;
  pass: number;
  comparisons: number;
  sorted: boolean;
  hadSwapThisPass: boolean;
}

function initBubbleSort(arr: number[]): BubbleSortTracker {
  return {
    array: [...arr],
    index: 0,
    pass: 1,
    comparisons: 0,
    sorted: false,
    hadSwapThisPass: false,
  };
}

function bubbleSortStepRace(state: BubbleSortTracker): BubbleSortTracker {
  if (state.sorted) return state;
  const arr = [...state.array];
  const n = arr.length;
  let { index, pass, comparisons, hadSwapThisPass } = state;
  const passEnd = n - pass;

  if (index >= passEnd) {
    if (!hadSwapThisPass) {
      return { ...state, sorted: true };
    }
    pass++;
    if (pass >= n) {
      return { ...state, sorted: true, pass };
    }
    return { array: arr, index: 0, pass, comparisons, sorted: false, hadSwapThisPass: false };
  }

  comparisons++;
  if (arr[index] > arr[index + 1]) {
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    hadSwapThisPass = true;
  }
  index++;

  return { array: arr, index, pass, comparisons, sorted: false, hadSwapThisPass };
}

function RacePanel({
  label,
  array,
  highlightA,
  highlightB,
  comparisons,
  sorted,
  isWinner,
}: {
  label: string;
  array: number[];
  highlightA: number;
  highlightB: number;
  comparisons: number;
  sorted: boolean;
  isWinner: boolean | null;
}) {
  const maxVal = Math.max(...array);
  const barW = Math.max(Math.min(28, 260 / array.length - 4), 12);
  const gapW = 3;
  const svgW = array.length * (barW + gapW) + gapW;
  const svgH = 160;
  const maxBarH = 120;

  return (
    <div
      className="flex-1 card-sketchy p-3 space-y-2"
      style={{ background: isWinner === true ? MINT + "33" : "#fff" }}
    >
      <h4 className="font-hand text-sm font-bold text-center" style={{ color: isWinner === true ? INK : INK }}>
        {label}
        {isWinner === true && " (Winner!)"}
      </h4>
      <div className="flex justify-center overflow-x-auto">
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          <defs>
            <linearGradient id={`race-bar-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94caff" />
              <stop offset="100%" stopColor={SKY} />
            </linearGradient>
            <linearGradient id={`race-bar-done-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7ee0d8" />
              <stop offset="100%" stopColor={MINT} />
            </linearGradient>
            <linearGradient id={`race-bar-hot-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffe066" />
              <stop offset="100%" stopColor={YELLOW} />
            </linearGradient>
          </defs>
          {array.map((value, i) => {
            const barHeight = (value / maxVal) * maxBarH;
            const x = gapW + i * (barW + gapW);
            const y = svgH - 20 - barHeight;
            const isHL = !sorted && (i === highlightA || i === highlightB);

            const fill = sorted
              ? `url(#race-bar-done-${label.replace(/\s/g, "")})`
              : isHL
                ? `url(#race-bar-hot-${label.replace(/\s/g, "")})`
                : `url(#race-bar-${label.replace(/\s/g, "")})`;

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barHeight}
                  rx={3}
                  fill={fill}
                  stroke={INK}
                  strokeWidth={1.5}
                  className={isHL ? "pulse-glow" : ""}
                  style={{
                    transition: "all 0.1s ease-in-out",
                    color: isHL ? YELLOW : MINT,
                    filter: "drop-shadow(1px 1px 0 #2b2a35)",
                  }}
                />
                {barW >= 18 && (
                  <text
                    x={x + barW / 2}
                    y={y - 3}
                    textAnchor="middle"
                    fill={INK}
                    fontFamily="Kalam"
                    style={{ fontSize: 10, fontWeight: 700 }}
                  >
                    {value}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-center font-hand text-xs font-bold" style={{ color: INK }}>
        Comparisons: <span style={{ color: CORAL }}>{comparisons}</span>
      </p>
    </div>
  );
}

function WhichIsFaster() {
  const [arraySize, setArraySize] = useState(10);
  const seedRef = useRef(7777);
  const [baseArray, setBaseArray] = useState<number[]>(() => generateArray(10, seedRef.current));

  const [bubble, setBubble] = useState<BubbleSortTracker>(() => initBubbleSort(baseArray));
  const [selection, setSelection] = useState<SelectionSortTracker>(() => initSelectionSort(baseArray));
  const [racing, setRacing] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetRace = useCallback((size?: number) => {
    const s = size ?? arraySize;
    seedRef.current = Date.now() % 100000;
    const arr = generateArray(s, seedRef.current);
    setBaseArray(arr);
    setBubble(initBubbleSort(arr));
    setSelection(initSelectionSort(arr));
    setRacing(false);
    setFinished(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [arraySize]);

  const startRace = useCallback(() => {
    if (racing || finished) return;
    setRacing(true);
  }, [racing, finished]);

  useEffect(() => {
    if (!racing) return;
    intervalRef.current = setInterval(() => {
      setBubble((prev) => {
        const next = bubbleSortStepRace(prev);
        return next;
      });
      setSelection((prev) => {
        const next = selectionSortStep(prev);
        return next;
      });
    }, 80);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [racing]);

  // Check if both are done
  useEffect(() => {
    if (racing && bubble.sorted && selection.sorted) {
      setRacing(false);
      setFinished(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [racing, bubble.sorted, selection.sorted]);

  const bubbleWinner = finished ? (bubble.comparisons <= selection.comparisons ? true : false) : null;
  const selectionWinner = finished ? (selection.comparisons <= bubble.comparisons ? true : false) : null;
  // Handle tie
  const isTie = finished && bubble.comparisons === selection.comparisons;

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold text-center" style={{ color: INK }}>
          Race two sorting algorithms against each other!
        </h3>

        {/* Array size selector */}
        <div className="flex items-center justify-center gap-3">
          <span className="font-hand text-xs font-bold" style={{ color: INK }}>Array size:</span>
          {[5, 10, 15, 20].map((size) => (
            <button
              key={size}
              onClick={() => {
                playClick();
                setArraySize(size);
                resetRace(size);
              }}
              disabled={racing}
              className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
                arraySize === size
                  ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                  : racing
                    ? "bg-muted opacity-50 cursor-not-allowed"
                    : "bg-background hover:bg-accent-yellow/40"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Race panels */}
        <div className="flex flex-col sm:flex-row gap-3">
          <RacePanel
            label="Bubble Sort"
            array={bubble.array}
            highlightA={bubble.index}
            highlightB={bubble.index + 1}
            comparisons={bubble.comparisons}
            sorted={bubble.sorted}
            isWinner={isTie ? true : bubbleWinner}
          />
          <RacePanel
            label="Selection Sort"
            array={selection.array}
            highlightA={selection.sortedUpTo}
            highlightB={selection.scanIndex}
            comparisons={selection.comparisons}
            sorted={selection.sorted}
            isWinner={isTie ? true : selectionWinner}
          />
        </div>

        {/* Result */}
        {finished && (
          <div className="card-sketchy p-3 text-center space-y-1" style={{ background: YELLOW + "33" }}>
            <p className="font-hand text-base font-bold" style={{ color: INK }}>
              {isTie
                ? "It's a tie!"
                : `${bubble.comparisons < selection.comparisons ? "Bubble Sort" : "Selection Sort"} wins!`}
            </p>
            <p className="font-hand text-xs" style={{ color: INK }}>
              Bubble Sort: {bubble.comparisons} comparisons | Selection Sort: {selection.comparisons} comparisons
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => { playPop(); startRace(); }}
            disabled={racing || finished}
            className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground inline-flex items-center gap-1.5 ${
              racing || finished
                ? "bg-muted opacity-50 cursor-not-allowed"
                : "bg-accent-coral text-white shadow-[2px_2px_0_#2b2a35]"
            }`}
          >
            <Play className="w-4 h-4" /> Race!
          </button>
          <button
            onClick={() => { playClick(); resetRace(); }}
            disabled={racing}
            className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground inline-flex items-center gap-1.5 ${
              racing
                ? "bg-muted opacity-50 cursor-not-allowed"
                : "bg-background hover:bg-accent-yellow/40 shadow-[2px_2px_0_#2b2a35]"
            }`}
          >
            <RotateCcw className="w-4 h-4" /> New Race
          </button>
        </div>
      </div>

      <InfoBox variant="green">
        Different algorithms solve the same problem in different numbers of steps. Finding the fastest algorithm is a
        big part of computer science! Notice how the number of steps grows as the array gets bigger.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "In bubble sort, what happens in each step?",
    options: [
      "All elements are shuffled randomly",
      "Two neighboring elements are compared and possibly swapped",
      "The smallest element teleports to the front",
      "The list is split in half",
    ],
    correctIndex: 1,
    explanation:
      "Bubble sort compares two neighboring elements and swaps them if they're in the wrong order. This is repeated until the entire list is sorted.",
  },
  {
    question:
      "If you group animals by 'number of legs', how many groups do you get for: cat, fish, spider, bird, snake?",
    options: ["2 groups", "3 groups", "4 groups", "5 groups"],
    correctIndex: 2,
    explanation:
      "Cat = 4 legs, Fish = 0 legs, Spider = 8 legs, Bird = 2 legs, Snake = 0 legs. That's 4 groups: 0, 2, 4, and 8 legs. (Fish and snake are in the same group!)",
  },
  {
    question: "Why does sorting data help us?",
    options: [
      "It makes the computer faster",
      "It makes patterns easier to see",
      "It deletes duplicate data",
      "It doesn't help at all",
    ],
    correctIndex: 1,
    explanation:
      "Sorted data makes patterns easier to spot  you can quickly find the smallest, largest, or most common values, and see how data is distributed.",
  },
  {
    question: "Between bubble sort and selection sort, which one is always faster?",
    options: ["Bubble sort", "Selection sort", "They're always the same", "It depends on the data"],
    correctIndex: 3,
    explanation:
      "Neither algorithm is always faster  it depends on how the data is initially arranged. This is why computer scientists study many different sorting algorithms!",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L6_SortingActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "sort",
        label: "Sort It Out",
        icon: <ArrowUpDown className="w-4 h-4" />,
        content: <SortItOut />,
      },
      {
        id: "grouping",
        label: "Grouping Game",
        icon: <FolderOpen className="w-4 h-4" />,
        content: <GroupingGame />,
      },
      {
        id: "race",
        label: "Which Is Faster?",
        icon: <Timer className="w-4 h-4" />,
        content: <WhichIsFaster />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Sorting and Grouping"
      level={2}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You can sort and group data  awesome! Now let's use everything you've learned to make predictions. What if you could guess what happens next?"
      story={
        <StorySection
          paragraphs={[
            "Aru's bookshelf was a disaster. Science books mixed with comics, thick novels next to tiny notebooks  she could never find anything.",
            "Aru: \"Byte, I need to find my math textbook but it's buried somewhere in this mess!\"",
            "Byte: \"Let me show you how I'd handle this. First, I'd sort them  maybe by size, or by subject. And then I'd group them  all science books together, all comics together. Sorting and grouping are two of the most powerful things you can do with messy data.\"",
            "Aru: \"But how do you sort when you can only compare two things at a time?\"",
            "Byte: \"Great question! That's exactly how sorting algorithms work. Let me show you step by step.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Sorting means arranging items in order (smallest to largest, A to Z). Grouping means putting similar items together by a shared property. Computers sort by comparing two items at a time and swapping them if needed. Different sorting algorithms take different numbers of steps  finding faster algorithms is a core challenge in computer science."
        />
      }
    />
  );
}
