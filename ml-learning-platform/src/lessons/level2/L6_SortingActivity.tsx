import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowUpDown, FolderOpen, Timer, Shuffle, Play, Pause, SkipForward, RotateCcw, Trophy } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";

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

function barColor(value: number, max: number): string {
  const t = value / max;
  const r = Math.round(59 + (30 - 59) * t);
  const g = Math.round(130 + (64 - 130) * t);
  const b = Math.round(246 + (255 - 246) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

/* ------------------------------------------------------------------ */
/*  Tab 1 — Sort It Out (Bubble Sort)                                  */
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
    setState((prev) => bubbleSortStep(prev));
  }, []);

  const shuffle = useCallback(() => {
    seedRef.current = Date.now() % 100000;
    setState(initSortState(seedRef.current));
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

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
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Watch how bubble sort organizes data step by step</h3>

        {/* SVG bars */}
        <div className="flex justify-center overflow-x-auto">
          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="max-w-full">
            {state.array.map((value, i) => {
              const barHeight = (value / maxVal) * maxBarHeight;
              const x = gap + i * (barWidth + gap);
              const y = svgHeight - 30 - barHeight;
              const isComparing = !state.sorted && (i === state.comparingIndex || i === state.comparingIndex + 1);
              const isSwapped = state.justSwapped.includes(i);

              let fill: string;
              if (state.sorted) {
                fill = "#22c55e";
              } else if (isSwapped) {
                fill = "#4ade80";
              } else if (isComparing) {
                fill = "#f59e0b";
              } else {
                fill = barColor(value, maxVal);
              }

              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={4}
                    fill={fill}
                    style={{ transition: "all 0.15s ease-in-out" }}
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    className="fill-slate-600"
                    style={{ fontSize: 11, fontWeight: 600 }}
                  >
                    {value}
                  </text>
                  {isComparing && !state.sorted && (
                    <polygon
                      points={`${x + barWidth / 2 - 4},${svgHeight - 20} ${x + barWidth / 2 + 4},${svgHeight - 20} ${x + barWidth / 2},${svgHeight - 26}`}
                      fill="#f59e0b"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sorted banner */}
        {state.sorted && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-green-700">Sorted!</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-6 text-xs font-medium text-slate-600">
          <span>Comparisons: <span className="font-bold text-slate-800">{state.comparisons}</span></span>
          <span>Swaps: <span className="font-bold text-slate-800">{state.swaps}</span></span>
          <span>Pass: <span className="font-bold text-slate-800">{state.pass}</span></span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={shuffle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Shuffle
          </button>
          <button
            onClick={step}
            disabled={state.sorted || playing}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              state.sorted || playing
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            }`}
          >
            <SkipForward className="w-3.5 h-3.5" />
            Step
          </button>
          <button
            onClick={togglePlay}
            disabled={state.sorted}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              state.sorted
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : playing
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? "Pause" : "Play"}
          </button>
        </div>

        {/* Speed slider */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs text-slate-500">Fast</span>
          <input
            type="range"
            min={100}
            max={800}
            step={50}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-40 accent-indigo-500"
          />
          <span className="text-xs text-slate-500">Slow</span>
        </div>
      </div>

      <InfoBox variant="blue">
        Sorting means putting things in order — smallest to largest. Bubble sort works by comparing neighbors and
        swapping them if they're in the wrong order. The biggest values "bubble up" to the end!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Grouping Game                                              */
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
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Group these items in different ways</h3>

        {/* Grouping selector */}
        <div className="flex justify-center gap-2">
          {(["Shape", "Color", "Size"] as GroupBy[]).map((option) => (
            <button
              key={option}
              onClick={() => setGroupBy(option)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                groupBy === option
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
/*  Tab 3 — Which Is Faster? (Algorithm Race)                          */
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
    <div className={`flex-1 border rounded-xl p-3 space-y-2 ${isWinner === true ? "border-green-400 bg-green-50" : isWinner === false ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-white"}`}>
      <h4 className={`text-xs font-bold text-center ${isWinner === true ? "text-green-700" : "text-slate-700"}`}>
        {label}
        {isWinner === true && " (Winner!)"}
      </h4>
      <div className="flex justify-center overflow-x-auto">
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          {array.map((value, i) => {
            const barHeight = (value / maxVal) * maxBarH;
            const x = gapW + i * (barW + gapW);
            const y = svgH - 20 - barHeight;
            const isHL = !sorted && (i === highlightA || i === highlightB);

            let fill: string;
            if (sorted) {
              fill = "#22c55e";
            } else if (isHL) {
              fill = "#f59e0b";
            } else {
              fill = barColor(value, maxVal);
            }

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barHeight}
                  rx={3}
                  fill={fill}
                  style={{ transition: "all 0.1s ease-in-out" }}
                />
                {barW >= 18 && (
                  <text
                    x={x + barW / 2}
                    y={y - 3}
                    textAnchor="middle"
                    className="fill-slate-500"
                    style={{ fontSize: 9, fontWeight: 600 }}
                  >
                    {value}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-center text-xs text-slate-600">
        Comparisons: <span className="font-bold text-slate-800">{comparisons}</span>
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
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Race two sorting algorithms against each other!</h3>

        {/* Array size selector */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Array size:</span>
          {[5, 10, 15, 20].map((size) => (
            <button
              key={size}
              onClick={() => {
                setArraySize(size);
                resetRace(size);
              }}
              disabled={racing}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                arraySize === size
                  ? "bg-indigo-600 text-white"
                  : racing
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center space-y-1">
            <p className="text-sm font-bold text-indigo-800">
              {isTie
                ? "It's a tie!"
                : `${bubble.comparisons < selection.comparisons ? "Bubble Sort" : "Selection Sort"} wins!`}
            </p>
            <p className="text-xs text-indigo-600">
              Bubble Sort: {bubble.comparisons} comparisons | Selection Sort: {selection.comparisons} comparisons
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <button
            onClick={startRace}
            disabled={racing || finished}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              racing || finished
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            <Play className="w-4 h-4" />
            Race!
          </button>
          <button
            onClick={() => resetRace()}
            disabled={racing}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              racing
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            New Race
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
      "Sorted data makes patterns easier to spot — you can quickly find the smallest, largest, or most common values, and see how data is distributed.",
  },
  {
    question: "Between bubble sort and selection sort, which one is always faster?",
    options: ["Bubble sort", "Selection sort", "They're always the same", "It depends on the data"],
    correctIndex: 3,
    explanation:
      "Neither algorithm is always faster — it depends on how the data is initially arranged. This is why computer scientists study many different sorting algorithms!",
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
      nextLessonHint="You can sort and group data — awesome! Now let's use everything you've learned to make predictions. What if you could guess what happens next?"
      story={
        <StorySection
          paragraphs={[
            "Aru's bookshelf was a disaster. Science books mixed with comics, thick novels next to tiny notebooks — she could never find anything.",
            "Aru: \"Byte, I need to find my math textbook but it's buried somewhere in this mess!\"",
            "Byte: \"Let me show you how I'd handle this. First, I'd sort them — maybe by size, or by subject. And then I'd group them — all science books together, all comics together. Sorting and grouping are two of the most powerful things you can do with messy data.\"",
            "Aru: \"But how do you sort when you can only compare two things at a time?\"",
            "Byte: \"Great question! That's exactly how sorting algorithms work. Let me show you step by step.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Sorting means arranging items in order (smallest to largest, A to Z). Grouping means putting similar items together by a shared property. Computers sort by comparing two items at a time and swapping them if needed. Different sorting algorithms take different numbers of steps — finding faster algorithms is a core challenge in computer science."
        />
      }
    />
  );
}
