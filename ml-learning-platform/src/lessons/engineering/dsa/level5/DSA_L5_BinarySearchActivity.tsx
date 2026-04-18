"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer, ArrayBars,
} from "@/components/engineering/algo";
import type { CellState } from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Variant = "basic" | "lower" | "upper" | "rotated";

interface Frame {
  line: number;
  vars: Record<string, string | number | boolean | undefined>;
  values: number[];
  states: (CellState | undefined)[];
  pointers: Record<string, number>;
  message: string;
  highlightKey?: string;
}

const PSEUDO_BASIC = [
  "function binarySearch(A, target):",
  "  low ← 0; high ← n - 1",
  "  while low ≤ high:",
  "    mid ← (low + high) / 2",
  "    if A[mid] = target: return mid",
  "    else if A[mid] < target: low ← mid + 1",
  "    else: high ← mid - 1",
  "  return -1",
];

const PSEUDO_LOWER = [
  "function lowerBound(A, target):",
  "  low ← 0; high ← n",
  "  while low < high:",
  "    mid ← (low + high) / 2",
  "    if A[mid] < target: low ← mid + 1",
  "    else: high ← mid",
  "  return low  // first index with A[i] ≥ target",
];

const PSEUDO_UPPER = [
  "function upperBound(A, target):",
  "  low ← 0; high ← n",
  "  while low < high:",
  "    mid ← (low + high) / 2",
  "    if A[mid] ≤ target: low ← mid + 1",
  "    else: high ← mid",
  "  return low  // first index with A[i] > target",
];

const PSEUDO_ROTATED = [
  "function searchRotated(A, target):",
  "  low ← 0; high ← n - 1",
  "  while low ≤ high:",
  "    mid ← (low + high) / 2",
  "    if A[mid] = target: return mid",
  "    if A[low] ≤ A[mid]:          // left half sorted",
  "      if A[low] ≤ target < A[mid]: high ← mid - 1",
  "      else: low ← mid + 1",
  "    else:                         // right half sorted",
  "      if A[mid] < target ≤ A[high]: low ← mid + 1",
  "      else: high ← mid - 1",
  "  return -1",
];

/* ------------------------------------------------------------------ */
/*  Frame builders                                                     */
/* ------------------------------------------------------------------ */

function stateShell(n: number, low: number, high: number, active: "incl" | "excl" = "incl"): (CellState | undefined)[] {
  return Array.from({ length: n }, (_, k) => {
    const inside = active === "incl" ? (k >= low && k <= high) : (k >= low && k < high);
    return inside ? "default" : "visited";
  });
}

function buildBasic(A: number[], target: number): Frame[] {
  const n = A.length;
  const f: Frame[] = [];
  f.push({
    line: 0, vars: { n, target }, values: [...A],
    states: A.map(() => "default" as CellState), pointers: {},
    message: `Binary search for ${target} in sorted array.`,
  });

  let low = 0, high = n - 1;
  f.push({
    line: 1, vars: { low, high, target }, values: [...A],
    states: stateShell(n, low, high), pointers: { low, high },
    message: `Initial window [${low}..${high}]`,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const st = stateShell(n, low, high);
    st[mid] = "mid";
    f.push({
      line: 3, vars: { low, high, mid, "A[mid]": A[mid], target }, values: [...A],
      states: st, pointers: { low, mid, high },
      message: `mid = ⌊(${low} + ${high}) / 2⌋ = ${mid}. A[${mid}] = ${A[mid]}`,
      highlightKey: "mid",
    });
    if (A[mid] === target) {
      const st2 = stateShell(n, low, high);
      st2[mid] = "done";
      f.push({
        line: 4, vars: { low, high, mid, target, found: mid }, values: [...A],
        states: st2, pointers: { mid },
        message: `A[${mid}] = ${target} - found at index ${mid}!`,
        highlightKey: "found",
      });
      return f;
    } else if (A[mid] < target) {
      f.push({
        line: 5, vars: { low, high, mid, "A[mid]": A[mid], target }, values: [...A],
        states: stateShell(n, low, high), pointers: { low, mid, high },
        message: `A[${mid}] = ${A[mid]} < ${target} - target is in the right half. low ← ${mid + 1}`,
      });
      low = mid + 1;
    } else {
      f.push({
        line: 6, vars: { low, high, mid, "A[mid]": A[mid], target }, values: [...A],
        states: stateShell(n, low, high), pointers: { low, mid, high },
        message: `A[${mid}] = ${A[mid]} > ${target} - target is in the left half. high ← ${mid - 1}`,
      });
      high = mid - 1;
    }
  }

  f.push({
    line: 7, vars: { low, high, target, found: -1 }, values: [...A],
    states: A.map(() => "visited" as CellState), pointers: {},
    message: `low (${low}) > high (${high}) - ${target} not present. Return −1.`,
  });
  return f;
}

function buildLowerUpper(A: number[], target: number, upper = false): Frame[] {
  const n = A.length;
  const f: Frame[] = [];
  const title = upper ? "upperBound" : "lowerBound";
  f.push({
    line: 0, vars: { n, target }, values: [...A],
    states: A.map(() => "default" as CellState), pointers: {},
    message: `${title}: first index i with A[i] ${upper ? ">" : "≥"} ${target}`,
  });
  let low = 0, high = n;
  f.push({
    line: 1, vars: { low, high, target }, values: [...A],
    states: stateShell(n, low, high, "excl"), pointers: { low, high: Math.min(high, n - 1) },
    message: `Half-open window [${low}, ${high}). Result lives somewhere here.`,
  });

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const st = stateShell(n, low, high, "excl");
    st[mid] = "mid";
    f.push({
      line: 3, vars: { low, high, mid, "A[mid]": A[mid], target }, values: [...A],
      states: st, pointers: { low, mid, high: Math.min(high, n - 1) },
      message: `mid = ${mid}, A[${mid}] = ${A[mid]}`,
      highlightKey: "mid",
    });

    const condition = upper ? (A[mid] <= target) : (A[mid] < target);
    if (condition) {
      f.push({
        line: 4, vars: { low, high, mid, target }, values: [...A],
        states: stateShell(n, mid + 1, high, "excl"), pointers: { low: mid + 1, high: Math.min(high, n - 1) },
        message: `A[${mid}] = ${A[mid]} ${upper ? "≤" : "<"} ${target} - answer must be strictly right. low ← ${mid + 1}`,
      });
      low = mid + 1;
    } else {
      f.push({
        line: 5, vars: { low, high, mid, target }, values: [...A],
        states: stateShell(n, low, mid, "excl"), pointers: { low, high: Math.max(mid - 1, 0) },
        message: `A[${mid}] = ${A[mid]} ${upper ? ">" : "≥"} ${target} - mid could be the answer. high ← ${mid}`,
      });
      high = mid;
    }
  }

  const st = A.map((_, k) => (k === low ? "done" : "visited") as CellState);
  f.push({
    line: 6, vars: { result: low }, values: [...A],
    states: st, pointers: { result: Math.min(low, n - 1) },
    message: `Converged: low = high = ${low}. ${title} returns ${low}${low < n ? ` (A[${low}] = ${A[low]})` : " (past end)"}.`,
    highlightKey: "result",
  });
  return f;
}

function buildRotated(A: number[], target: number): Frame[] {
  const n = A.length;
  const f: Frame[] = [];
  f.push({
    line: 0, vars: { n, target }, values: [...A],
    states: A.map(() => "default" as CellState), pointers: {},
    message: `Search for ${target} in rotated sorted array.`,
  });
  let low = 0, high = n - 1;
  f.push({
    line: 1, vars: { low, high, target }, values: [...A],
    states: stateShell(n, low, high), pointers: { low, high },
    message: `Initial [${low}..${high}]`,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const st = stateShell(n, low, high);
    st[mid] = "mid";
    f.push({
      line: 3, vars: { low, high, mid, "A[mid]": A[mid], target }, values: [...A],
      states: st, pointers: { low, mid, high },
      message: `mid = ${mid}, A[${mid}] = ${A[mid]}`,
      highlightKey: "mid",
    });
    if (A[mid] === target) {
      const st2 = stateShell(n, low, high);
      st2[mid] = "done";
      f.push({
        line: 4, vars: { mid, found: mid }, values: [...A],
        states: st2, pointers: { mid },
        message: `Found ${target} at ${mid}!`,
        highlightKey: "found",
      });
      return f;
    }
    if (A[low] <= A[mid]) {
      f.push({
        line: 5, vars: { low, mid, "A[low]": A[low], "A[mid]": A[mid] }, values: [...A],
        states: st, pointers: { low, mid, high },
        message: `Left half A[${low}..${mid}] is sorted (A[low] ≤ A[mid]).`,
      });
      if (A[low] <= target && target < A[mid]) {
        f.push({
          line: 6, vars: { low, mid, target }, values: [...A],
          states: stateShell(n, low, mid - 1), pointers: { low, high: mid - 1 },
          message: `Target is in the sorted left: high ← ${mid - 1}`,
        });
        high = mid - 1;
      } else {
        f.push({
          line: 7, vars: { low, mid, target }, values: [...A],
          states: stateShell(n, mid + 1, high), pointers: { low: mid + 1, high },
          message: `Target not in left half. Search right: low ← ${mid + 1}`,
        });
        low = mid + 1;
      }
    } else {
      f.push({
        line: 8, vars: { mid, high, "A[mid]": A[mid], "A[high]": A[high] }, values: [...A],
        states: st, pointers: { low, mid, high },
        message: `Right half A[${mid}..${high}] is sorted.`,
      });
      if (A[mid] < target && target <= A[high]) {
        f.push({
          line: 9, vars: { mid, high, target }, values: [...A],
          states: stateShell(n, mid + 1, high), pointers: { low: mid + 1, high },
          message: `Target in sorted right: low ← ${mid + 1}`,
        });
        low = mid + 1;
      } else {
        f.push({
          line: 10, vars: { low, mid, target }, values: [...A],
          states: stateShell(n, low, mid - 1), pointers: { low, high: mid - 1 },
          message: `Target not in right half. Search left: high ← ${mid - 1}`,
        });
        high = mid - 1;
      }
    }
  }

  f.push({
    line: 12, vars: { target, found: -1 }, values: [...A],
    states: A.map(() => "visited" as CellState), pointers: {},
    message: `Not found. Return −1.`,
  });
  return f;
}

function parseInputs(s: string): { arr: number[]; target: number } | null {
  // format: "arr | target"  OR  "arr ; target"
  const parts = s.split(/[|;]/);
  if (parts.length !== 2) return null;
  const arr = parts[0].split(/[,\s]+/).filter(Boolean).map((x) => Number(x.trim()));
  const target = Number(parts[1].trim());
  if (arr.some((n) => Number.isNaN(n)) || Number.isNaN(target)) return null;
  if (arr.length < 2 || arr.length > 15) return null;
  return { arr, target };
}

/* ------------------------------------------------------------------ */
/*  Visualize                                                          */
/* ------------------------------------------------------------------ */

function VisualizeTab() {
  const [variant, setVariant] = useState<Variant>("basic");
  const [inputStr, setInputStr] = useState("1, 3, 5, 7, 9, 11, 13, 15 | 9");

  const parsed = parseInputs(inputStr) ?? { arr: [1, 3, 5, 7, 9, 11, 13, 15], target: 9 };
  const A = variant === "rotated" ? parsed.arr : [...parsed.arr].sort((a, b) => a - b);

  const frames = useMemo(() => {
    if (variant === "basic") return buildBasic(A, parsed.target);
    if (variant === "lower") return buildLowerUpper(A, parsed.target, false);
    if (variant === "upper") return buildLowerUpper(A, parsed.target, true);
    return buildRotated(A, parsed.target);
  }, [variant, A, parsed.target]);

  const player = useStepPlayer(frames);
  const frame = player.current!;

  const PSEUDO = variant === "basic" ? PSEUDO_BASIC :
    variant === "lower" ? PSEUDO_LOWER :
    variant === "upper" ? PSEUDO_UPPER : PSEUDO_ROTATED;

  const presets = variant === "rotated" ? [
    { label: "Rotated 1", value: "4, 5, 6, 7, 0, 1, 2 | 0" },
    { label: "Rotated 2", value: "6, 7, 1, 2, 3, 4, 5 | 3" },
    { label: "Not rotated", value: "1, 2, 3, 4, 5, 6, 7 | 5" },
    { label: "Not found", value: "4, 5, 6, 7, 0, 1, 2 | 9" },
  ] : [
    { label: "Found middle", value: "1, 3, 5, 7, 9, 11, 13, 15 | 9" },
    { label: "Found edge", value: "1, 3, 5, 7, 9, 11, 13, 15 | 1" },
    { label: "Not found", value: "1, 3, 5, 7, 9, 11, 13, 15 | 8" },
    { label: "Duplicates", value: "1, 2, 2, 2, 3, 4 | 2" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(["basic", "lower", "upper", "rotated"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            style={{
              padding: "6px 14px", borderRadius: 6, cursor: "pointer",
              fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600,
              border: `1.5px solid ${variant === v ? "var(--eng-primary)" : "var(--eng-border)"}`,
              background: variant === v ? "var(--eng-primary-light)" : "var(--eng-surface)",
              color: variant === v ? "var(--eng-primary)" : "var(--eng-text-muted)",
              transition: "all 0.2s",
            }}
          >
            {v === "basic" ? "Basic" : v === "lower" ? "Lower Bound" : v === "upper" ? "Upper Bound" : "Rotated"}
          </button>
        ))}
      </div>

      <AlgoCanvas
        title={`Binary Search - ${variant}`}
        player={player}
        input={
          <InputEditor
            label="Array | Target"
            value={inputStr}
            placeholder="e.g. 1, 3, 5, 7, 9 | 7"
            helper={variant === "rotated"
              ? "Rotated sorted array. Target can be anywhere."
              : "Array is auto-sorted. Format: numbers | target"}
            presets={presets}
            onApply={(v) => { if (parseInputs(v)) setInputStr(v); }}
          />
        }
        pseudocode={<PseudocodePanel lines={PSEUDO} activeLine={frame.line} />}
        variables={<VariablesPanel vars={frame.vars} flashKeys={frame.highlightKey ? [frame.highlightKey] : []} />}
      >
        <ArrayBars values={frame.values} states={frame.states} pointers={frame.pointers} height={180} />
      </AlgoCanvas>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn                                                              */
/* ------------------------------------------------------------------ */

function LearnTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", margin: "0 0 6px" }}>Halve the search space</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          On a sorted array, look at the middle. If it's the target - done. If the middle is too small, the target
          lives strictly to the right; if too big, strictly to the left. Each step halves the search region →
          O(log n).
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {[
          { t: "Basic search", b: "Returns index of target, or −1 if absent. Works on any sorted array." },
          { t: "Lower bound", b: "First index i where A[i] ≥ target. Useful for 'where do I insert x to keep sorted?'" },
          { t: "Upper bound", b: "First index i where A[i] > target. Combined with lower bound you get count of duplicates." },
          { t: "Rotated sorted", b: "Sorted array rotated at some pivot. Half is still sorted - check which half, then apply basic logic." },
        ].map((s, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-primary)" }}>0{i + 1}</div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 4 }}>{s.t}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>{s.b}</div>
          </div>
        ))}
      </div>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        <strong>Overflow trick:</strong> <code>mid = (low + high) / 2</code> can overflow in languages with fixed-size
        ints. Use <code>mid = low + (high − low) / 2</code> instead.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Try                                                                */
/* ------------------------------------------------------------------ */

function TryTab() {
  const problems = [
    { q: "Max comparisons for binary search on n=1000?", answer: "10" },
    { q: "lowerBound([1,2,2,2,3,4], 2) returns?", answer: "1" },
    { q: "upperBound([1,2,2,2,3,4], 2) returns?", answer: "4" },
    { q: "Search 0 in rotated [4,5,6,7,0,1,2] - index?", answer: "4" },
  ];
  const [guesses, setGuesses] = useState<(string | null)[]>(problems.map(() => null));
  const [shown, setShown] = useState<boolean[]>(problems.map(() => false));

  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        <strong>Hint:</strong> ⌈log₂ n⌉ is the worst-case comparisons. Count of x in sorted array = upper(x) − lower(x).
      </div>
      {problems.map((p, i) => {
        const g = guesses[i];
        const revealed = shown[i];
        const correct = g !== null && g.trim() === p.answer;
        return (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--eng-text-muted)" }}>#{i + 1}</span>
              <span style={{ fontSize: "0.9rem" }}>{p.q}</span>
              <input
                value={g ?? ""}
                onChange={(e) => { const v = [...guesses]; v[i] = e.target.value; setGuesses(v); }}
                style={{
                  width: 80, padding: "5px 8px", borderRadius: 6,
                  border: "1px solid var(--eng-border)",
                  fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.85rem",
                }}
                placeholder="?"
              />
              <button onClick={() => { const v = [...shown]; v[i] = true; setShown(v); }} className="btn-eng-outline"
                style={{ fontSize: "0.78rem", padding: "5px 12px" }}>Reveal</button>
              {revealed && (
                <span style={{
                  fontSize: "0.82rem", fontWeight: 700,
                  color: correct ? "var(--eng-success)" : "var(--eng-danger)",
                  padding: "3px 10px", borderRadius: 6,
                  background: correct ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                }}>
                  {correct ? `Correct - ${p.answer}` : `Answer: ${p.answer}`}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Insight                                                            */
/* ------------------------------------------------------------------ */

function InsightTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Binary search beyond arrays</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Any <em>monotonic predicate</em> over an ordered domain is binary-searchable: "is this workload feasible in
          time t?", "can we fit items in k boxes?". This pattern - "binary search on the answer" - shows up in
          optimization problems constantly.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Loop invariants</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Lower bound maintains: the answer ∈ [low, high]. Window always shrinks; we stop when low = high. Getting
          "&lt;" vs "≤" right - and which pointer moves - is the source of 99% of bugs.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Interview hook</h3>
        <ul style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>Comparisons in worst case: ⌈log₂(n+1)⌉.</li>
          <li>Fails on unsorted input - prerequisite is monotonic order.</li>
          <li>Rotated binary search runs in O(log n) when all elements are distinct; O(n) worst case with duplicates.</li>
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity                                                            */
/* ------------------------------------------------------------------ */

export default function DSA_L5_BinarySearchActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];

  const quiz: EngQuizQuestion[] = [
    {
      question: "Maximum number of comparisons for binary search on a sorted array of 1,000,000 elements?",
      options: ["10", "20", "100", "1000"],
      correctIndex: 1,
      explanation: "⌈log₂(10⁶)⌉ ≈ 20. Every step halves the search space, so ~20 halvings suffice.",
    },
    {
      question: "For sorted array [1, 2, 2, 2, 3, 4], what does lowerBound(2) return?",
      options: ["0", "1", "3", "4"],
      correctIndex: 1,
      explanation: "Lower bound = smallest index i with A[i] ≥ 2 → index 1 (the first 2).",
    },
    {
      question: "Count of x in a sorted array equals:",
      options: ["upper(x) + lower(x)", "upper(x) − lower(x)", "lower(x) − 1", "n − upper(x)"],
      correctIndex: 1,
      explanation: "Lower bound is first ≥ x; upper bound is first > x. The difference is the number of x's.",
    },
    {
      question: "In the rotated sorted array [4, 5, 6, 7, 0, 1, 2], searching for 0 with standard rotated binary search takes:",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctIndex: 1,
      explanation: "At each step we identify which half is sorted, decide target's side, and shrink by half. O(log n) with distinct elements.",
    },
  ];

  return (
    <EngineeringLessonShell
      title="Binary Search & Variants"
      level={5}
      lessonNumber={6}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="Among the most-asked topics - variants and 'BS on answer' problems dominate interviews"
      nextLessonHint="On to Level 6: algorithm design paradigms"
    />
  );
}
