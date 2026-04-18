"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer,
  RecursionTree,
} from "@/components/engineering/algo";
import type { RecursionNode } from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Problem definitions                                                */
/* ------------------------------------------------------------------ */

type ProblemKey = "fib" | "stairs" | "coin" | "rob";

interface ProblemConfig {
  label: string;
  pseudoTop: string[];
  pseudoBottom: string[];
  parseInput: (s: string) => { n: number; extra?: number[] | number };
  baseLabels: (cfg: { n: number; extra?: number[] | number }) => string[]; // x-axis labels
  recurrence: (dp: number[], i: number, extra?: number[] | number) => { value: number; deps: number[] };
  baseCaseFor: (cfg: { n: number; extra?: number[] | number }) => number[]; // indices where base case applies
  baseValue: (i: number, cfg: { n: number; extra?: number[] | number }) => number;
  fromI: (cfg: { n: number; extra?: number[] | number }) => number; // starting index
  upto: (cfg: { n: number; extra?: number[] | number }) => number; // inclusive
  placeholder: string;
  presets: { label: string; value: string }[];
}

const PROBLEMS: Record<ProblemKey, ProblemConfig> = {
  fib: {
    label: "Fibonacci",
    pseudoTop: [
      "memo ← {}",
      "function fib(n):",
      "  if n in memo: return memo[n]",
      "  if n < 2: return n",
      "  memo[n] ← fib(n-1) + fib(n-2)",
      "  return memo[n]",
    ],
    pseudoBottom: [
      "dp[0] ← 0; dp[1] ← 1",
      "for i in 2..n:",
      "  dp[i] ← dp[i-1] + dp[i-2]",
      "return dp[n]",
    ],
    parseInput: (s) => ({ n: Math.max(0, Math.min(20, Math.floor(Number(s) || 0))) }),
    baseLabels: ({ n }) => Array.from({ length: n + 1 }, (_, i) => String(i)),
    recurrence: (dp, i) => ({ value: dp[i - 1] + dp[i - 2], deps: [i - 1, i - 2] }),
    baseCaseFor: ({ n }) => n === 0 ? [0] : [0, 1],
    baseValue: (i) => i,
    fromI: ({ n }) => n === 0 ? 0 : 2,
    upto: ({ n }) => n,
    placeholder: "e.g. 7",
    presets: [{ label: "n=5", value: "5" }, { label: "n=10", value: "10" }, { label: "n=15", value: "15" }],
  },
  stairs: {
    label: "Climbing Stairs",
    pseudoTop: [
      "function ways(n):",
      "  if n in memo: return memo[n]",
      "  if n <= 1: return 1",
      "  memo[n] ← ways(n-1) + ways(n-2)",
      "  return memo[n]",
    ],
    pseudoBottom: [
      "dp[0] ← 1; dp[1] ← 1",
      "for i in 2..n:",
      "  dp[i] ← dp[i-1] + dp[i-2]",
      "return dp[n]",
    ],
    parseInput: (s) => ({ n: Math.max(0, Math.min(20, Math.floor(Number(s) || 0))) }),
    baseLabels: ({ n }) => Array.from({ length: n + 1 }, (_, i) => String(i)),
    recurrence: (dp, i) => ({ value: dp[i - 1] + dp[i - 2], deps: [i - 1, i - 2] }),
    baseCaseFor: ({ n }) => n === 0 ? [0] : [0, 1],
    baseValue: () => 1,
    fromI: ({ n }) => n === 0 ? 0 : 2,
    upto: ({ n }) => n,
    placeholder: "e.g. 10",
    presets: [{ label: "n=5", value: "5" }, { label: "n=8", value: "8" }, { label: "n=12", value: "12" }],
  },
  rob: {
    label: "House Robber",
    pseudoTop: [
      "function rob(i):",
      "  if i < 0: return 0",
      "  if i in memo: return memo[i]",
      "  memo[i] ← max(rob(i-1), rob(i-2) + houses[i])",
      "  return memo[i]",
    ],
    pseudoBottom: [
      "dp[0] ← houses[0]",
      "dp[1] ← max(houses[0], houses[1])",
      "for i in 2..n-1:",
      "  dp[i] ← max(dp[i-1], dp[i-2] + houses[i])",
      "return dp[n-1]",
    ],
    parseInput: (s) => {
      const arr = s.trim().split(/[,\s]+/).map((x) => Math.max(0, Math.floor(Number(x) || 0))).filter((x, i, a) => a.length > 0);
      return { n: Math.max(1, arr.length), extra: arr };
    },
    baseLabels: ({ extra }) => (extra as number[]).map((v, i) => `${i}(${v})`),
    recurrence: (dp, i, extra) => {
      const arr = extra as number[];
      return { value: Math.max(dp[i - 1], dp[i - 2] + arr[i]), deps: [i - 1, i - 2] };
    },
    baseCaseFor: ({ extra }) => (extra as number[]).length === 1 ? [0] : [0, 1],
    baseValue: (i, { extra }) => {
      const arr = extra as number[];
      if (i === 0) return arr[0];
      return Math.max(arr[0], arr[1] ?? 0);
    },
    fromI: ({ extra }) => (extra as number[]).length <= 1 ? 1 : 2,
    upto: ({ n }) => n - 1,
    placeholder: "e.g. 2, 7, 9, 3, 1",
    presets: [
      { label: "[2,7,9,3,1]", value: "2, 7, 9, 3, 1" },
      { label: "[5,3,4,11,2]", value: "5, 3, 4, 11, 2" },
      { label: "[1,2,3,1]", value: "1, 2, 3, 1" },
    ],
  },
  coin: {
    label: "Coin Change (min coins)",
    pseudoTop: [
      "function minCoins(amount):",
      "  if amount == 0: return 0",
      "  if amount in memo: return memo[amount]",
      "  best ← ∞",
      "  for c in coins:",
      "    if c <= amount:",
      "      best ← min(best, minCoins(amount-c)+1)",
      "  memo[amount] ← best",
      "  return best",
    ],
    pseudoBottom: [
      "dp[0] ← 0",
      "for i in 1..amount:",
      "  dp[i] ← ∞",
      "  for c in coins:",
      "    if c <= i and dp[i-c] != ∞:",
      "      dp[i] ← min(dp[i], dp[i-c] + 1)",
      "return dp[amount]",
    ],
    parseInput: (s) => {
      const [amtStr, coinStr] = s.split("|").map((x) => x.trim());
      const amount = Math.max(0, Math.min(15, Math.floor(Number(amtStr) || 0)));
      const coins = (coinStr ?? "1,2,5").split(/[,\s]+/).map((x) => Math.max(1, Math.floor(Number(x) || 0))).filter((x) => x > 0);
      return { n: amount, extra: coins.length > 0 ? coins : [1, 2, 5] };
    },
    baseLabels: ({ n }) => Array.from({ length: n + 1 }, (_, i) => String(i)),
    recurrence: (dp, i, extra) => {
      const coins = extra as number[];
      let best = Infinity;
      const deps: number[] = [];
      for (const c of coins) {
        if (c <= i && dp[i - c] !== Infinity) {
          const cand = dp[i - c] + 1;
          if (cand < best) best = cand;
          if (i - c >= 0) deps.push(i - c);
        }
      }
      return { value: best, deps };
    },
    baseCaseFor: () => [0],
    baseValue: () => 0,
    fromI: () => 1,
    upto: ({ n }) => n,
    placeholder: "e.g. 11 | 1, 2, 5",
    presets: [
      { label: "11 | 1,2,5", value: "11 | 1, 2, 5" },
      { label: "7 | 1,3,4", value: "7 | 1, 3, 4" },
      { label: "9 | 2,5,10", value: "9 | 2, 5, 10" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Frame types                                                        */
/* ------------------------------------------------------------------ */

interface DPFrame {
  line: number;
  vars: Record<string, string | number | undefined>;
  message: string;
  dp: (number | null)[];
  just?: number | null; // cell just updated
  depIndices?: number[];
  memoHit?: number | null;
  nodes?: RecursionNode[];
  activeId?: string;
  calls?: number;
  memoSize?: number;
}

/* ------------------------------------------------------------------ */
/*  Naive recursion counter                                            */
/* ------------------------------------------------------------------ */

function countNaiveCalls(key: ProblemKey, parsed: { n: number; extra?: number[] | number }): number {
  const { n, extra } = parsed;
  if (key === "fib" || key === "stairs") {
    // naive: T(n) = T(n-1) + T(n-2) + 1
    const a: number[] = [];
    for (let i = 0; i <= n; i++) {
      if (i < 2) a.push(1);
      else a.push(a[i - 1] + a[i - 2] + 1);
    }
    return a[n] ?? 1;
  }
  if (key === "rob") {
    const arr = extra as number[];
    const memo: Record<number, number> = {};
    function go(i: number): number {
      if (i < 0) return 1;
      if (memo[i] !== undefined) return memo[i];
      return memo[i] = go(i - 1) + go(i - 2) + 1;
    }
    return go(arr.length - 1);
  }
  if (key === "coin") {
    // rough estimate
    const coins = extra as number[];
    const cap = Math.min(25, n);
    function go(a: number): number {
      if (a <= 0) return 1;
      let s = 1;
      for (const c of coins) if (c <= a) s += go(a - c);
      return s;
    }
    return go(cap);
  }
  return 0;
}

/* ------------------------------------------------------------------ */
/*  Build: Top-down (memoization) with recursion tree                 */
/* ------------------------------------------------------------------ */

function buildTopDown(key: ProblemKey, parsed: { n: number; extra?: number[] | number }): DPFrame[] {
  const cfg = PROBLEMS[key];
  const upto = cfg.upto(parsed);
  const dp: (number | null)[] = Array(Math.max(1, upto + 1)).fill(null);
  cfg.baseCaseFor(parsed).forEach((i) => { dp[i] = cfg.baseValue(i, parsed); });
  const frames: DPFrame[] = [];
  const nodes: RecursionNode[] = [];
  let idCounter = 0;
  let calls = 0;

  frames.push({
    line: 0, vars: { n: parsed.n }, message: "Start with an empty memo table.",
    dp: [...dp], nodes: [], calls: 0,
  });

  function recurse(i: number, depth: number, parent?: string): number {
    const id = `tn-${idCounter++}`;
    calls++;
    const node: RecursionNode = { id, label: `f(${i})`, parent, depth, state: "active" };
    nodes.push(node);

    frames.push({
      line: 1, vars: { i, calls, memo: dp.filter((x) => x !== null).length },
      message: `Enter f(${i}).`,
      dp: [...dp], nodes: nodes.map((x) => ({ ...x })), activeId: id, calls,
      memoSize: dp.filter((x) => x !== null).length,
    });

    if (dp[i] !== null && !cfg.baseCaseFor(parsed).includes(i)) {
      node.returnValue = dp[i]!;
      node.state = "done";
      frames.push({
        line: 2, vars: { i, hit: dp[i]!, calls },
        message: `Memo hit! f(${i}) = ${dp[i]}. Return immediately.`,
        dp: [...dp], nodes: nodes.map((x) => ({ ...x })), activeId: id,
        memoHit: i, calls,
      });
      return dp[i]!;
    }

    if (cfg.baseCaseFor(parsed).includes(i)) {
      node.returnValue = dp[i]!;
      node.state = "done";
      frames.push({
        line: 3, vars: { i, base: dp[i]!, calls },
        message: `Base case: f(${i}) = ${dp[i]}.`,
        dp: [...dp], nodes: nodes.map((x) => ({ ...x })), activeId: id,
        just: i, calls,
      });
      return dp[i]!;
    }

    // emulate deps via recurrence's deps
    const tmpDp: number[] = dp.map((x) => x === null ? 0 : x);
    const { deps } = cfg.recurrence(tmpDp, i, parsed.extra);
    for (const d of deps) {
      if (d < 0) continue;
      frames.push({
        line: 4, vars: { i, recurseTo: d, calls },
        message: `Recurse into f(${d}).`,
        dp: [...dp], nodes: nodes.map((x) => ({ ...x })), activeId: id, calls,
      });
      recurse(d, depth + 1, id);
    }

    // now compute
    const realDp: number[] = dp.map((x) => x === null ? 0 : x);
    const { value } = cfg.recurrence(realDp, i, parsed.extra);
    dp[i] = Number.isFinite(value) ? value : -1;
    node.returnValue = dp[i] ?? "?";
    node.state = "done";
    frames.push({
      line: 4, vars: { i, value: dp[i]!, calls },
      message: `Computed f(${i}) = ${dp[i]}. Store in memo and return.`,
      dp: [...dp], nodes: nodes.map((x) => ({ ...x })), activeId: id,
      just: i, calls, memoSize: dp.filter((x) => x !== null).length,
    });
    return dp[i]!;
  }

  recurse(upto, 0);
  return frames;
}

/* ------------------------------------------------------------------ */
/*  Build: Bottom-up (tabulation)                                      */
/* ------------------------------------------------------------------ */

function buildBottomUp(key: ProblemKey, parsed: { n: number; extra?: number[] | number }): DPFrame[] {
  const cfg = PROBLEMS[key];
  const upto = cfg.upto(parsed);
  const dp: (number | null)[] = Array(Math.max(1, upto + 1)).fill(null);
  const frames: DPFrame[] = [];

  frames.push({
    line: 0, vars: { n: parsed.n }, message: "Initialize dp table with base cases.",
    dp: [...dp],
  });

  const baseCases = cfg.baseCaseFor(parsed);
  for (const bc of baseCases) {
    dp[bc] = cfg.baseValue(bc, parsed);
    frames.push({
      line: 0, vars: { i: bc, base: dp[bc]! },
      message: `Base: dp[${bc}] = ${dp[bc]}.`,
      dp: [...dp], just: bc,
    });
  }

  for (let i = cfg.fromI(parsed); i <= upto; i++) {
    frames.push({
      line: 1, vars: { i },
      message: `Compute dp[${i}] using previously filled cells.`,
      dp: [...dp],
    });
    const realDp: number[] = dp.map((x) => x === null ? 0 : x);
    const { value, deps } = cfg.recurrence(realDp, i, parsed.extra);
    dp[i] = Number.isFinite(value) ? value : -1;
    frames.push({
      line: 2, vars: { i, value: dp[i]! },
      message: `dp[${i}] = ${dp[i]} (depends on ${deps.map((d) => `dp[${d}]=${dp[d] ?? "?"}`).join(", ")}).`,
      dp: [...dp], just: i, depIndices: deps,
    });
  }
  frames.push({
    line: 3, vars: { answer: dp[upto] ?? -1 },
    message: `Done. Answer = dp[${upto}] = ${dp[upto] ?? "n/a"}.`,
    dp: [...dp], just: upto,
  });
  return frames;
}

/* ------------------------------------------------------------------ */
/*  DP Table                                                           */
/* ------------------------------------------------------------------ */

function DPTable({ dp, just, deps, memoHit, labels }: { dp: (number | null)[]; just?: number | null; deps?: number[]; memoHit?: number | null; labels: string[] }) {
  const depSet = new Set(deps ?? []);
  return (
    <div style={{ display: "flex", justifyContent: "center", overflowX: "auto", padding: "4px 4px 12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${dp.length}, minmax(52px, 1fr))`, gap: 4, maxWidth: 720 }}>
        {dp.map((v, i) => {
          const isJust = i === just;
          const isDep = depSet.has(i);
          const isHit = i === memoHit;
          let bg = "var(--eng-surface)";
          let border = "2px solid var(--eng-border)";
          let color = "var(--eng-text)";
          if (isHit) { bg = "rgba(139,92,246,0.15)"; border = "2px solid #8b5cf6"; color = "#6d28d9"; }
          else if (isJust) { bg = "rgba(16,185,129,0.15)"; border = "2px solid #10b981"; color = "#065f46"; }
          else if (isDep) { bg = "rgba(245,158,11,0.15)"; border = "2px solid #f59e0b"; color = "#b45309"; }
          return (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "6px 4px", borderRadius: 6,
              border, background: bg, color,
              transition: "background 0.3s, border 0.3s",
              minWidth: 44,
            }}>
              <div style={{ fontSize: "0.62rem", color: "var(--eng-text-muted)", fontFamily: "var(--eng-font)" }}>{labels[i] ?? i}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, fontFamily: '"SF Mono", Menlo, Consolas, monospace' }}>
                {v === null ? "-" : v === -1 ? "∞" : v}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visualize tab                                                      */
/* ------------------------------------------------------------------ */

type DPMode = "top-down" | "bottom-up";

function VisualizeTab() {
  const [problemKey, setProblemKey] = useState<ProblemKey>("fib");
  const [mode, setMode] = useState<DPMode>("top-down");
  const cfg = PROBLEMS[problemKey];
  const [input, setInput] = useState(() => cfg.presets[0].value);

  // keep input valid when problem changes
  useEffect(() => { setInput(cfg.presets[0].value); }, [problemKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const parsed = useMemo(() => cfg.parseInput(input), [input, cfg]);
  const labels = useMemo(() => cfg.baseLabels(parsed), [parsed, cfg]);

  const frames = useMemo(() => {
    if (mode === "top-down") return buildTopDown(problemKey, parsed);
    return buildBottomUp(problemKey, parsed);
  }, [problemKey, mode, parsed]);

  const player = useStepPlayer(frames);
  const frame = player.current!;
  const pseudo = mode === "top-down" ? cfg.pseudoTop : cfg.pseudoBottom;

  const naiveCalls = useMemo(() => countNaiveCalls(problemKey, parsed), [problemKey, parsed]);
  const memoCalls = frames[frames.length - 1]?.calls ?? 0;
  const bottomUpOps = Math.max(1, cfg.upto(parsed) + 1);

  return (
    <AlgoCanvas
      title={`${cfg.label} - ${mode === "top-down" ? "Top-Down Memoization" : "Bottom-Up Tabulation"}`}
      player={player}
      input={
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(Object.keys(PROBLEMS) as ProblemKey[]).map((k) => (
              <button key={k} onClick={() => setProblemKey(k)}
                style={{
                  padding: "5px 12px", fontSize: "0.73rem", fontWeight: 700, borderRadius: 999,
                  border: problemKey === k ? "1.5px solid var(--eng-primary)" : "1px solid var(--eng-border)",
                  background: problemKey === k ? "var(--eng-primary-light)" : "var(--eng-surface)",
                  color: problemKey === k ? "var(--eng-primary)" : "var(--eng-text-muted)",
                  cursor: "pointer", fontFamily: "var(--eng-font)",
                }}>{PROBLEMS[k].label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["top-down", "bottom-up"] as DPMode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  padding: "5px 12px", fontSize: "0.72rem", fontWeight: 700, borderRadius: 6,
                  border: mode === m ? "1.5px solid var(--eng-success)" : "1px solid var(--eng-border)",
                  background: mode === m ? "rgba(16,185,129,0.08)" : "var(--eng-surface)",
                  color: mode === m ? "var(--eng-success)" : "var(--eng-text-muted)",
                  cursor: "pointer", fontFamily: "var(--eng-font)",
                }}>{m === "top-down" ? "Top-Down (recursion + memo)" : "Bottom-Up (tabulation)"}</button>
            ))}
          </div>
          <InputEditor
            label="Input"
            value={input}
            placeholder={cfg.placeholder}
            helper={
              problemKey === "coin" ? "Format: amount | coin1, coin2, ..." :
              problemKey === "rob" ? "Comma/space-separated house values." :
              "Integer n (bounded for readability)."
            }
            presets={cfg.presets}
            onApply={setInput}
          />
          <div style={{ display: "flex", gap: 14, fontSize: "0.72rem", color: "var(--eng-text-muted)", flexWrap: "wrap" }}>
            <span>Naive recursion: <strong style={{ color: "#ef4444" }}>{naiveCalls.toLocaleString()}</strong> calls</span>
            {mode === "top-down" && <span>Memoized: <strong style={{ color: "var(--eng-success)" }}>{memoCalls.toLocaleString()}</strong> calls</span>}
            <span>Tabulation: <strong style={{ color: "var(--eng-primary)" }}>{bottomUpOps.toLocaleString()}</strong> writes</span>
          </div>
        </div>
      }
      pseudocode={<PseudocodePanel lines={pseudo} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} flashKeys={["value", "hit", "calls"]} />}
      legend={
        <div style={{ display: "flex", gap: 14, fontSize: "0.72rem" }}>
          <Legend color="#10b981" label="just filled" />
          <Legend color="#f59e0b" label="dependency" />
          <Legend color="#8b5cf6" label="memo hit" />
        </div>
      }
    >
      {mode === "top-down" && frame.nodes && frame.nodes.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <RecursionTree nodes={frame.nodes} activeId={frame.activeId} height={260} />
        </div>
      )}
      <DPTable dp={frame.dp} just={frame.just} deps={frame.depIndices} memoHit={frame.memoHit} labels={labels} />
    </AlgoCanvas>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
    <span style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />{label}
  </span>;
}

/* ------------------------------------------------------------------ */
/*  Learn tab                                                          */
/* ------------------------------------------------------------------ */

function LearnTab() {
  const cards = [
    { title: "What is DP?", body: "Dynamic programming = recursion with memoization. When a recursive solution solves the same subproblem many times, cache the answer. The complexity drops from exponential to polynomial." },
    { title: "Two styles", body: "Top-down (memoization): write the recursion naturally, add a cache. Bottom-up (tabulation): build the dp table iteratively from the base case up. Both compute the same answer - pick by convenience and stack-safety." },
    { title: "When to use DP", body: "Two properties: (1) Overlapping subproblems - naive recursion recomputes the same thing. (2) Optimal substructure - an optimal answer to the whole includes optimal answers to sub-pieces." },
    { title: "The 3 steps", body: "(a) Define the state: what does dp[i] mean? (b) Write the transition: dp[i] in terms of smaller indices. (c) Specify base cases. Write the state first - everything else follows." },
  ];
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", margin: "0 0 6px" }}>Mental model</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Imagine Fibonacci's call tree - most branches compute fib(5) over and over. DP says: compute each subproblem <em>once</em>, write the answer on a piece of paper (dp table), and look it up every future time.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {cards.map((s, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-primary)", marginBottom: 4 }}>0{i + 1}</div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>{s.body}</div>
          </div>
        ))}
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h4 style={{ fontWeight: 700, fontSize: "0.95rem", margin: "0 0 6px" }}>Recurrences at a glance</h4>
        <table style={{ width: "100%", fontSize: "0.82rem", fontFamily: '"SF Mono", Menlo, Consolas, monospace' }}>
          <thead>
            <tr style={{ background: "var(--eng-bg)" }}>
              <th style={{ padding: "6px 10px", textAlign: "left" }}>Problem</th>
              <th style={{ padding: "6px 10px", textAlign: "left" }}>Recurrence</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: "4px 10px" }}>Fibonacci</td><td style={{ padding: "4px 10px" }}>dp[i] = dp[i-1] + dp[i-2]</td></tr>
            <tr><td style={{ padding: "4px 10px" }}>Climbing Stairs</td><td style={{ padding: "4px 10px" }}>dp[i] = dp[i-1] + dp[i-2]</td></tr>
            <tr><td style={{ padding: "4px 10px" }}>House Robber</td><td style={{ padding: "4px 10px" }}>dp[i] = max(dp[i-1], dp[i-2] + h[i])</td></tr>
            <tr><td style={{ padding: "4px 10px" }}>Coin Change</td><td style={{ padding: "4px 10px" }}>dp[i] = min(dp[i-c]+1) over coins c</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Try tab                                                            */
/* ------------------------------------------------------------------ */

function TryTab() {
  const problems = [
    { q: "Fibonacci with memoization - fib(30) calls how many subproblems?", a: "31", hint: "Each fib(k) for k=0..30 is computed exactly once." },
    { q: "Climbing stairs n=5. Number of ways?", a: "8", hint: "1,1,2,3,5,8 - Fibonacci pattern." },
    { q: "House Robber [2,7,9,3,1]. Max loot?", a: "12", hint: "Rob 2+9+1 = 12." },
    { q: "Coin Change amount=11, coins=[1,2,5]. Min coins?", a: "3", hint: "5+5+1 = 11 → 3 coins." },
  ];
  const [guesses, setGuesses] = useState<(string | null)[]>(problems.map(() => null));
  const [shown, setShown] = useState<boolean[]>(problems.map(() => false));
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        Work through each recurrence by hand.
      </div>
      {problems.map((p, i) => {
        const g = guesses[i];
        const revealed = shown[i];
        const correct = g !== null && g.trim() === p.a;
        return (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text-muted)" }}>#{i + 1}</span>
              <span style={{ flex: 1, fontSize: "0.85rem" }}>{p.q}</span>
              <input type="text" placeholder="answer" value={g ?? ""}
                onChange={(e) => { const v = [...guesses]; v[i] = e.target.value; setGuesses(v); }}
                style={{ width: 80, padding: "6px 8px", borderRadius: 6, border: "1px solid var(--eng-border)", fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.85rem" }}
              />
              <button onClick={() => { const v = [...shown]; v[i] = true; setShown(v); }} className="btn-eng-outline" style={{ fontSize: "0.78rem", padding: "5px 12px" }}>Reveal</button>
              {revealed && (
                <span style={{
                  fontSize: "0.82rem", fontWeight: 700,
                  color: correct ? "var(--eng-success)" : "var(--eng-danger)",
                  padding: "3px 10px", borderRadius: 6,
                  background: correct ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                }}>{correct ? `✓ ${p.a}` : `Answer: ${p.a}`}</span>
              )}
            </div>
            {revealed && <div style={{ fontSize: "0.78rem", color: "var(--eng-text-muted)", marginTop: 6 }}>Hint: {p.hint}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Insight tab                                                        */
/* ------------------------------------------------------------------ */

function InsightTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Top-down vs Bottom-up trade-offs</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Top-down is easier to write from the recursive spec - you only fill cells you actually need. Bottom-up avoids stack overflow and is usually slightly faster in practice because it doesn't pay function-call overhead.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Space optimization</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Many 1D DPs only look at the last few cells. Fibonacci needs just two variables (prev, curr) - O(1) space. House Robber too. Always check: &quot;does dp[i] only depend on the last k cells?&quot;
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Interview checklist</h3>
        <ul style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>Write state + recurrence + base case on paper BEFORE coding.</li>
          <li>Naive Fibonacci is O(2ⁿ); memo makes it O(n).</li>
          <li>Coin change has O(amount · coins) time, O(amount) space.</li>
          <li>House Robber is the canonical "pick or skip" pattern.</li>
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function DSA_L6_DP1DActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];
  const quiz: EngQuizQuestion[] = [
    {
      question: "What is the time complexity of naive recursive Fibonacci vs memoized?",
      options: ["O(n) vs O(n)", "O(2ⁿ) vs O(n)", "O(2ⁿ) vs O(log n)", "O(n log n) vs O(n)"],
      correctIndex: 1,
      explanation: "Naive fib has exponential calls due to repeated subproblems; memoization solves each subproblem once for O(n) total.",
    },
    {
      question: "For House Robber with h=[2, 1, 1, 2], what is the max loot?",
      options: ["3", "4", "5", "6"],
      correctIndex: 1,
      explanation: "dp: 2, 2, 3, 4. Rob houses 0 and 3 to get 2+2 = 4.",
    },
    {
      question: "Climbing stairs recurrence dp[i] = dp[i-1] + dp[i-2] arises because...",
      options: [
        "The last step is 1 OR 2 stairs, and those paths are disjoint",
        "Stairs are monotonically increasing",
        "Two-step moves are faster than one-step",
        "Fibonacci is always the answer",
      ],
      correctIndex: 0,
      explanation: "Count paths ending with a 1-step (dp[i-1]) + those ending with a 2-step (dp[i-2]). Disjoint & exhaustive.",
    },
    {
      question: "Which is NOT a benefit of bottom-up DP over top-down?",
      options: [
        "Avoids stack overflow on deep recursion",
        "Eliminates function-call overhead",
        "Only computes necessary subproblems",
        "Makes space optimization more obvious",
      ],
      correctIndex: 2,
      explanation: "Bottom-up fills the WHOLE table. Top-down only computes what's needed - that's a rare edge it still has over bottom-up.",
    },
  ];
  return (
    <EngineeringLessonShell
      title="Dynamic Programming - 1D"
      level={6}
      lessonNumber={5}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="The most common hard-interview pattern. Master the state definition."
      nextLessonHint="2D DP - LCS, Edit Distance, 0/1 Knapsack"
    />
  );
}
