"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer, ArrayBars,
} from "@/components/engineering/algo";
import type { CellState } from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type Mode = "deque" | "monotonic";
type DOp = "PF" | "PB" | "RF" | "RB"; // pushFront pushBack popFront popBack

interface DequeOp { kind: DOp; value?: number; }

interface Frame {
  line: number;
  vars: Record<string, string | number | undefined>;
  message: string;
  highlightKey?: string;
  // deque contents (front=left, back=right); each item has value + optional idx
  deque: { value: number; idx?: number; flash?: "enter" | "pop-violate" }[];
  // for monotonic window mode:
  array?: number[];
  states?: CellState[];
  windowLo?: number;
  windowHi?: number;
  i?: number;
  maxAtStep?: number;
  result?: number[];
}

const PSEUDO_MONO = [
  "function slidingMax(arr, k):",
  "  dq ← empty (stores indices)",
  "  result ← []",
  "  for i in 0..n-1:",
  "    while dq not empty and dq.front ≤ i - k:",
  "      dq.popFront()                   // drop out-of-window",
  "    while dq not empty and arr[dq.back] < arr[i]:",
  "      dq.popBack()                    // violator → pop",
  "    dq.pushBack(i)",
  "    if i ≥ k - 1:",
  "      result.append(arr[dq.front])   // window max",
  "  return result",
];

const PSEUDO_DEQUE = [
  "class Deque:",
  "  pushFront(x) // insert at left",
  "  pushBack(x)  // insert at right",
  "  popFront()   // remove from left",
  "  popBack()    // remove from right",
];

function parseOps(s: string): DequeOp[] {
  return s.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean).map((t) => {
    if (t.startsWith("PF")) return { kind: "PF" as DOp, value: Number(t.slice(2)) };
    if (t.startsWith("PB")) return { kind: "PB" as DOp, value: Number(t.slice(2)) };
    if (t === "RF") return { kind: "RF" as DOp };
    if (t === "RB") return { kind: "RB" as DOp };
    return null;
  }).filter((x): x is DequeOp => x !== null);
}

function parseList(s: string): number[] {
  return s.split(/[,\s]+/).map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x));
}

/* ------------------------------------------------------------------ */
/*  Frame builders                                                      */
/* ------------------------------------------------------------------ */

function buildDeque(ops: DequeOp[]): Frame[] {
  const f: Frame[] = [];
  const dq: { value: number }[] = [];
  f.push({ line: 0, vars: { size: 0 }, message: "Empty deque", deque: [] });
  for (const op of ops) {
    if (op.kind === "PF") {
      f.push({ line: 1, vars: { x: op.value, size: dq.length }, message: `pushFront(${op.value}) - insert at left`, deque: [...dq] });
      dq.unshift({ value: op.value! });
      f.push({ line: 1, vars: { size: dq.length }, highlightKey: "size", message: `${op.value} now at front`, deque: dq.map((d, i) => ({ ...d, flash: i === 0 ? "enter" : undefined })) });
    } else if (op.kind === "PB") {
      f.push({ line: 2, vars: { x: op.value, size: dq.length }, message: `pushBack(${op.value}) - insert at right`, deque: [...dq] });
      dq.push({ value: op.value! });
      f.push({ line: 2, vars: { size: dq.length }, highlightKey: "size", message: `${op.value} now at rear`, deque: dq.map((d, i) => ({ ...d, flash: i === dq.length - 1 ? "enter" : undefined })) });
    } else if (op.kind === "RF") {
      if (dq.length === 0) {
        f.push({ line: 3, vars: { error: "empty" }, message: "popFront() on empty deque", deque: [] });
        continue;
      }
      f.push({ line: 3, vars: { front: dq[0].value }, message: `popFront() - remove ${dq[0].value}`, deque: [...dq] });
      const v = dq.shift()!;
      f.push({ line: 3, vars: { removed: v.value, size: dq.length }, highlightKey: "removed", message: `Removed ${v.value} from front`, deque: [...dq] });
    } else if (op.kind === "RB") {
      if (dq.length === 0) {
        f.push({ line: 4, vars: { error: "empty" }, message: "popBack() on empty deque", deque: [] });
        continue;
      }
      f.push({ line: 4, vars: { back: dq[dq.length - 1].value }, message: `popBack() - remove ${dq[dq.length - 1].value}`, deque: [...dq] });
      const v = dq.pop()!;
      f.push({ line: 4, vars: { removed: v.value, size: dq.length }, highlightKey: "removed", message: `Removed ${v.value} from rear`, deque: [...dq] });
    }
  }
  return f;
}

function buildMonotonic(arr: number[], k: number): Frame[] {
  const f: Frame[] = [];
  const n = arr.length;
  const dqIdx: number[] = []; // indices
  const result: number[] = [];
  const states: CellState[] = arr.map(() => "default");
  k = Math.max(1, Math.min(k, n));

  f.push({ line: 0, vars: { n, k }, message: `Find sliding window max, window size k = ${k}`, deque: [], array: arr, states: [...states], i: -1, result: [] });
  f.push({ line: 1, vars: { dq: "[]" }, message: "Initialize empty deque of indices", deque: [], array: arr, states: [...states], i: -1, result: [] });
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - k + 1);
    const hi = i;
    const states_i: CellState[] = arr.map((_, j) => (j >= lo && j <= hi) ? "window" : j < lo ? "done" : "default");
    f.push({ line: 3, vars: { i, value: arr[i] }, message: `i = ${i}, consider arr[${i}] = ${arr[i]}`, deque: dqIdx.map((idx) => ({ value: arr[idx], idx })), array: arr, states: states_i, windowLo: lo, windowHi: hi, i, result: [...result] });

    // drop out-of-window
    if (dqIdx.length > 0 && dqIdx[0] <= i - k) {
      f.push({ line: 4, vars: { "dq.front": dqIdx[0], threshold: i - k }, message: `Front index ${dqIdx[0]} is out of window - drop it`, deque: dqIdx.map((idx, j) => ({ value: arr[idx], idx, flash: j === 0 ? "pop-violate" : undefined })), array: arr, states: states_i, windowLo: lo, windowHi: hi, i, result: [...result] });
      dqIdx.shift();
      f.push({ line: 5, vars: { "dq.size": dqIdx.length }, message: `Front removed`, deque: dqIdx.map((idx) => ({ value: arr[idx], idx })), array: arr, states: states_i, windowLo: lo, windowHi: hi, i, result: [...result] });
    }
    // pop smaller from back
    while (dqIdx.length > 0 && arr[dqIdx[dqIdx.length - 1]] < arr[i]) {
      const tail = dqIdx[dqIdx.length - 1];
      f.push({ line: 6, vars: { "dq.back": tail, "arr[back]": arr[tail], current: arr[i] }, message: `arr[${tail}]=${arr[tail]} < arr[${i}]=${arr[i]} - violates invariant, pop`, deque: dqIdx.map((idx, j) => ({ value: arr[idx], idx, flash: j === dqIdx.length - 1 ? "pop-violate" : undefined })), array: arr, states: states_i, windowLo: lo, windowHi: hi, i, result: [...result] });
      dqIdx.pop();
      f.push({ line: 7, vars: { "dq.size": dqIdx.length }, message: `Popped`, deque: dqIdx.map((idx) => ({ value: arr[idx], idx })), array: arr, states: states_i, windowLo: lo, windowHi: hi, i, result: [...result] });
    }
    dqIdx.push(i);
    f.push({ line: 8, vars: { pushed: i, "arr[i]": arr[i] }, highlightKey: "pushed", message: `pushBack(${i}) - new value ${arr[i]} joins deque`, deque: dqIdx.map((idx, j) => ({ value: arr[idx], idx, flash: j === dqIdx.length - 1 ? "enter" : undefined })), array: arr, states: states_i, windowLo: lo, windowHi: hi, i, result: [...result] });

    if (i >= k - 1) {
      const maxVal = arr[dqIdx[0]];
      result.push(maxVal);
      const stsMax: CellState[] = arr.map((_, j) => j === dqIdx[0] ? "match" : (j >= lo && j <= hi) ? "window" : j < lo ? "done" : "default");
      f.push({ line: 9, vars: { "window": `[${lo}..${hi}]`, max: maxVal }, highlightKey: "max", message: `Window [${lo}..${hi}]: max = arr[${dqIdx[0]}] = ${maxVal}`, deque: dqIdx.map((idx) => ({ value: arr[idx], idx })), array: arr, states: stsMax, windowLo: lo, windowHi: hi, i, maxAtStep: dqIdx[0], result: [...result] });
    }
  }
  f.push({ line: 10, vars: { result: `[${result.join(", ")}]` }, message: `Done - ${result.length} window maxima`, deque: dqIdx.map((idx) => ({ value: arr[idx], idx })), array: arr, states: arr.map((_, j) => j <= n - k ? "done" : "window"), i: n - 1, result: [...result] });
  return f;
}

/* ------------------------------------------------------------------ */
/*  Deque viz (horizontal row)                                          */
/* ------------------------------------------------------------------ */

function DequeRow({ items, showIdx }: { items: { value: number; idx?: number; flash?: "enter" | "pop-violate" }[]; showIdx?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 4, padding: "8px 0", flexWrap: "wrap", maxWidth: 640, margin: "0 auto" }}>
      <div style={{
        display: "flex", gap: 6, padding: 10,
        border: "2px solid var(--eng-border)", borderRadius: 12,
        minHeight: 64, minWidth: 300,
        background: "var(--eng-bg)",
        alignItems: "center", justifyContent: "center",
      }}>
        {items.length === 0 ? (
          <span style={{ color: "var(--eng-text-muted)", fontStyle: "italic", fontSize: "0.8rem", fontFamily: "var(--eng-font)" }}>empty</span>
        ) : items.map((it, i) => {
          const bg = it.flash === "enter" ? "#10b981" : it.flash === "pop-violate" ? "#ef4444" : "var(--eng-primary)";
          const isFront = i === 0;
          const isBack = i === items.length - 1;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", minHeight: 12 }}>
                {isFront && isBack ? "front/back" : isFront ? "front" : isBack ? "back" : "\u00A0"}
              </div>
              <div style={{
                padding: "8px 14px", borderRadius: 7,
                background: bg, color: "#fff",
                fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                fontWeight: 700, fontSize: "0.9rem",
                transition: "all 0.25s",
                boxShadow: `0 0 0 2px ${bg}33`,
                animation: it.flash === "enter" ? "eng-fadeIn 0.3s ease" : undefined,
              }}>
                {it.value}
              </div>
              {showIdx && it.idx !== undefined && (
                <div style={{ fontSize: "0.62rem", color: "var(--eng-text-muted)", fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontWeight: 700 }}>
                  i={it.idx}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visualize                                                           */
/* ------------------------------------------------------------------ */

function VisualizeTab() {
  const [mode, setMode] = useState<Mode>("deque");
  const [opsStr, setOpsStr] = useState("PB1, PB2, PF3, PB4, RF, RB");
  const [arrStr, setArrStr] = useState("1, 3, -1, -3, 5, 3, 6, 7");
  const [k, setK] = useState(3);

  const ops = parseOps(opsStr);
  const arr = parseList(arrStr);

  const frames = useMemo(() => mode === "deque" ? buildDeque(ops) : buildMonotonic(arr, k), [mode, opsStr, arrStr, k]);
  const player = useStepPlayer(frames);
  const frame = player.current!;
  const pseudo = mode === "deque" ? PSEUDO_DEQUE : PSEUDO_MONO;

  return (
    <AlgoCanvas
      title={mode === "deque" ? "Deque - Double-Ended Queue" : "Monotonic Deque - Sliding Window Max"}
      player={player}
      input={
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {(["deque", "monotonic"] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 700,
                  border: `1px solid ${mode === m ? "var(--eng-primary)" : "var(--eng-border)"}`,
                  background: mode === m ? "var(--eng-primary)" : "var(--eng-surface)",
                  color: mode === m ? "#fff" : "var(--eng-text-muted)",
                  cursor: "pointer", fontFamily: "var(--eng-font)", textTransform: "capitalize",
                }}>
                {m === "deque" ? "Deque Ops" : "Sliding Window Max"}
              </button>
            ))}
          </div>
          {mode === "deque" ? (
            <InputEditor
              label="Operations"
              value={opsStr}
              placeholder="e.g. PB1, PF2, RB, PF3"
              helper="PF<n>=pushFront, PB<n>=pushBack, RF=popFront, RB=popBack"
              presets={[
                { label: "Mixed", value: "PB1, PB2, PF3, PB4, RF, RB" },
                { label: "Stack-like", value: "PB1, PB2, PB3, RB, RB" },
                { label: "Queue-like", value: "PB1, PB2, PB3, RF, RF" },
              ]}
              onApply={setOpsStr}
              onRandom={() => {
                const choices: DOp[] = ["PF", "PB", "RF", "RB"];
                const n = 6 + Math.floor(Math.random() * 4);
                const toks = Array.from({ length: n }, () => {
                  const c = choices[Math.floor(Math.random() * choices.length)];
                  return c === "RF" || c === "RB" ? c : `${c}${Math.floor(Math.random() * 20) + 1}`;
                });
                setOpsStr(toks.join(", "));
              }}
            />
          ) : (
            <>
              <InputEditor
                label="Array"
                value={arrStr}
                placeholder="e.g. 1, 3, -1, -3, 5"
                helper="Integer array for sliding window"
                presets={[
                  { label: "Classic", value: "1, 3, -1, -3, 5, 3, 6, 7" },
                  { label: "Ascending", value: "1, 2, 3, 4, 5, 6" },
                  { label: "Descending", value: "9, 7, 5, 3, 1" },
                  { label: "With dupes", value: "4, 4, 2, 8, 8, 1, 5" },
                ]}
                onApply={setArrStr}
                onRandom={() => {
                  const n = 7 + Math.floor(Math.random() * 3);
                  setArrStr(Array.from({ length: n }, () => Math.floor(Math.random() * 20) - 5).join(", "));
                }}
              />
              <label style={{ fontSize: "0.78rem", color: "var(--eng-text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                Window size k:
                <input type="number" value={k} onChange={(e) => setK(Math.max(1, Number(e.target.value) || 1))}
                  min={1} max={arr.length}
                  style={{ width: 60, padding: "4px 8px", border: "1px solid var(--eng-border)", borderRadius: 5, fontFamily: "monospace" }} />
              </label>
            </>
          )}
        </div>
      }
      pseudocode={<PseudocodePanel lines={pseudo} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} flashKeys={frame.highlightKey ? [frame.highlightKey] : []} />}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        {mode === "monotonic" && frame.array && frame.states && (
          <ArrayBars
            values={frame.array}
            states={frame.states}
            pointers={frame.i !== undefined && frame.i >= 0 ? { i: frame.i } : {}}
            windowRange={frame.windowLo !== undefined && frame.windowHi !== undefined ? [frame.windowLo, frame.windowHi] : undefined}
            height={140}
          />
        )}
        <div style={{ width: "100%" }}>
          <div style={{
            fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)",
            textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", marginBottom: 4,
          }}>
            Deque (front ← → back){mode === "monotonic" ? " - indices of candidates" : ""}
          </div>
          <DequeRow items={frame.deque} showIdx={mode === "monotonic"} />
        </div>
        {mode === "monotonic" && frame.result && frame.result.length > 0 && (
          <div style={{
            padding: "8px 16px", borderRadius: 8,
            background: "rgba(16,185,129,0.1)", border: "1.5px solid var(--eng-success)",
            fontSize: "0.85rem", color: "#065f46", fontWeight: 700, fontFamily: "var(--eng-font)",
          }}>
            Window maxima so far: [{frame.result.join(", ")}]
          </div>
        )}
      </div>
    </AlgoCanvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn / Try / Insight                                               */
/* ------------------------------------------------------------------ */

function LearnTab() {
  const cards = [
    { t: "Deque = stack + queue", b: "A double-ended queue supports four O(1) ops: pushFront, pushBack, popFront, popBack. Use only pushBack+popFront → you have a queue. Use only pushBack+popBack → you have a stack." },
    { t: "Monotonic deque", b: "A deque whose values are kept strictly increasing (or decreasing) from front to back. Whenever a new value violates the order, pop from the back until the order is restored." },
    { t: "Sliding-window max in O(n)", b: "The front of a max-monotonic deque is always the max of the current window. Each element enters and leaves the deque once → total work is O(n), not O(nk)." },
    { t: "Priority queue vs deque", b: "Both can find a max. But heap insert/remove is O(log n); monotonic deque is O(1) amortized when the access pattern is a sliding window. Pick the structure that matches the access pattern." },
  ];
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", margin: "0 0 6px" }}>Why the invariant matters</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Keeping the deque sorted by value (with smaller values thrown away when a bigger one arrives) means the front is the max. Keeping indices (not values) lets us also detect when the max has slid out of the window.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {cards.map((s, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-primary)", marginBottom: 4 }}>0{i + 1}</div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 4 }}>{s.t}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>{s.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TryTab() {
  const probs = [
    { q: "For arr = [4,3,2,1] and k=2, the window maxima are?", a: "[4, 3, 2]" },
    { q: "For arr = [1,2,3,4] and k=2, the window maxima are?", a: "[2, 3, 4]" },
    { q: "Each element is pushed at most ___ and popped at most ___ in the monotonic deque algorithm.", a: "1 time each → total work O(n)" },
    { q: "Which four operations define a deque?", a: "pushFront, pushBack, popFront, popBack" },
  ];
  const [g, setG] = useState<(string | null)[]>(probs.map(() => null));
  const [s, setS] = useState<boolean[]>(probs.map(() => false));
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>Work on paper, then reveal.</div>
      {probs.map((p, i) => (
        <div key={i} className="card-eng" style={{ padding: 14 }}>
          <div style={{ fontSize: "0.9rem", marginBottom: 8 }}>#{i + 1} {p.q}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input value={g[i] ?? ""} onChange={(e) => { const v = [...g]; v[i] = e.target.value; setG(v); }}
              placeholder="your answer"
              style={{ padding: "6px 10px", border: "1px solid var(--eng-border)", borderRadius: 6, fontFamily: "monospace", fontSize: "0.85rem", minWidth: 260 }} />
            <button className="btn-eng-outline" style={{ fontSize: "0.78rem", padding: "5px 12px" }}
              onClick={() => { const v = [...s]; v[i] = true; setS(v); }}>Reveal</button>
            {s[i] && (
              <span style={{ fontSize: "0.82rem", fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                color: "var(--eng-success)", background: "rgba(16,185,129,0.1)" }}>
                Answer: {p.a}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Amortized O(n) - the accounting argument</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Although one iteration may pop many elements, each element is popped at most once across the entire run. Sum total pops ≤ n. Pushes are at most n. Total operations ≤ 2n → O(n).
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Where deques appear in practice</h3>
        <ul style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>Python's <code>collections.deque</code></li>
          <li>Java's <code>ArrayDeque</code></li>
          <li>Work-stealing runqueues (used by Go/Java fork-join)</li>
          <li>0-1 BFS in graphs (pushFront for weight 0, pushBack for weight 1)</li>
          <li>Sliding window min/max, first-negative-in-every-window</li>
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity                                                             */
/* ------------------------------------------------------------------ */

export default function DSA_L2_DequeSpecialActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];

  const quiz: EngQuizQuestion[] = [
    {
      question: "Which operations must be O(1) for a structure to qualify as a deque?",
      options: [
        "Only pushBack and popFront",
        "pushFront, pushBack, popFront, popBack",
        "push and pop at one end",
        "Insert at any position",
      ],
      correctIndex: 1,
      explanation: "A deque is double-ended: all four insert/remove-at-both-ends operations are O(1). Insert at arbitrary position is NOT a deque requirement.",
    },
    {
      question: "In the monotonic deque sliding-window-maximum algorithm, what does the deque store?",
      options: ["Values", "Indices in decreasing order of value", "Indices in increasing order of value", "Window boundaries"],
      correctIndex: 1,
      explanation: "Indices are stored so we can detect when the front has slid out of the window. They are kept in decreasing order of the values they refer to - the front is always the max.",
    },
    {
      question: "Why is the sliding-window-max algorithm using a monotonic deque O(n), not O(nk)?",
      options: [
        "The deque has capacity k",
        "Each array element is pushed and popped at most once total",
        "The algorithm skips k-1 elements",
        "Modern CPUs vectorize it",
      ],
      correctIndex: 1,
      explanation: "Amortized analysis: total pushes ≤ n and total pops ≤ n, regardless of k. Linear time.",
    },
    {
      question: "For arr = [5, 3, 7, 1, 2] and k = 3, what is the first window's maximum using the algorithm?",
      options: ["5", "7", "3", "2"],
      correctIndex: 1,
      explanation: "First window is [5, 3, 7]; max is 7. The deque after processing i=2 holds just [index 2] because 5 and 3 were popped when 7 arrived.",
    },
  ];

  return (
    <EngineeringLessonShell
      title="Deque & Special Queues"
      level={2}
      lessonNumber={6}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="Sliding-window problems, monotonic-deque patterns appear in FAANG interviews"
      nextLessonHint="Binary Trees & Traversals"
    />
  );
}
