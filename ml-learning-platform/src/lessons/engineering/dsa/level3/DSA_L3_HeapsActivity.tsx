"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer, TreeCanvas, ArrayBars,
} from "@/components/engineering/algo";
import type { TreeNodeData, CellState } from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Heap frames                                                         */
/* ------------------------------------------------------------------ */

type Kind = "min" | "max";
type Op = "insert" | "extract" | "heapify";

interface Frame {
  line: number;
  arr: number[];
  arrStates: CellState[];
  pointers: Record<string, number>;
  nodeStates: Record<string, CellState>;
  message: string;
  vars: Record<string, string | number | undefined>;
}

const PSEUDO_INSERT = [
  "function insert(heap, v):",
  "  heap.push(v)               # append to end",
  "  i ← heap.length − 1",
  "  while i > 0:",
  "    parent ← (i − 1) / 2",
  "    if heap[i] violates order with heap[parent]:",
  "      swap heap[i], heap[parent]",
  "      i ← parent",
  "    else break",
];
const PSEUDO_EXTRACT = [
  "function extract(heap):",
  "  top ← heap[0]",
  "  heap[0] ← heap.pop()       # move last to root",
  "  i ← 0",
  "  while true:                # sift-down",
  "    l ← 2i+1, r ← 2i+2",
  "    best ← i",
  "    if l < n and heap[l] beats heap[best]: best ← l",
  "    if r < n and heap[r] beats heap[best]: best ← r",
  "    if best == i: break",
  "    swap heap[i], heap[best]; i ← best",
  "  return top",
];
const PSEUDO_HEAPIFY = [
  "function heapify(arr):",
  "  for i from n/2−1 down to 0:",
  "    siftDown(arr, i)          # O(n) total",
];

function beats(kind: Kind, a: number, b: number): boolean {
  return kind === "min" ? a < b : a > b;
}
function treeFromArray(arr: number[], nodeStates: Record<number, CellState>): { nodes: Record<string, TreeNodeData>; root: string | undefined } {
  const nodes: Record<string, TreeNodeData> = {};
  for (let i = 0; i < arr.length; i++) {
    const id = `h${i}`;
    nodes[id] = {
      id, value: arr[i],
      left: 2 * i + 1 < arr.length ? `h${2 * i + 1}` : undefined,
      right: 2 * i + 2 < arr.length ? `h${2 * i + 2}` : undefined,
      state: nodeStates[i],
    };
  }
  return { nodes, root: arr.length > 0 ? "h0" : undefined };
}

function buildInsertFrames(initial: number[], toInsert: number, kind: Kind): Frame[] {
  const a = [...initial];
  const frames: Frame[] = [];
  frames.push({
    line: 0, arr: [...a], arrStates: a.map(() => "default" as CellState),
    pointers: {}, nodeStates: {}, message: `Insert ${toInsert} into ${kind}-heap.`,
    vars: { insert: toInsert, kind, n: a.length },
  });
  a.push(toInsert);
  let i = a.length - 1;
  const states = a.map(() => "default" as CellState);
  states[i] = "active";
  frames.push({
    line: 1, arr: [...a], arrStates: [...states], pointers: { i },
    nodeStates: { [i]: "active" }, message: `Append ${toInsert} at index ${i}.`,
    vars: { i, value: a[i] },
  });
  while (i > 0) {
    const p = Math.floor((i - 1) / 2);
    const st = a.map(() => "default" as CellState);
    st[i] = "compare"; st[p] = "compare";
    frames.push({
      line: 4, arr: [...a], arrStates: st, pointers: { i, parent: p },
      nodeStates: { [i]: "compare", [p]: "compare" },
      message: `Compare a[${i}]=${a[i]} with parent a[${p}]=${a[p]}.`,
      vars: { i, parent: p, value: a[i], parentVal: a[p] },
    });
    if (beats(kind, a[i], a[p])) {
      [a[i], a[p]] = [a[p], a[i]];
      const st2 = a.map(() => "default" as CellState);
      st2[i] = "swap"; st2[p] = "swap";
      frames.push({
        line: 6, arr: [...a], arrStates: st2, pointers: { i, parent: p },
        nodeStates: { [i]: "swap", [p]: "swap" },
        message: `${kind === "min" ? "Child smaller" : "Child larger"} - swap ${a[i]} ↔ ${a[p]}.`,
        vars: { i, parent: p, swapped: "yes" },
      });
      i = p;
    } else {
      frames.push({
        line: 8, arr: [...a], arrStates: a.map(() => "default" as CellState),
        pointers: { i }, nodeStates: { [i]: "done" },
        message: `Heap order restored. Stop.`, vars: { i, done: "yes" },
      });
      break;
    }
  }
  frames.push({
    line: 0, arr: [...a],
    arrStates: a.map(() => "done" as CellState),
    pointers: {}, nodeStates: Object.fromEntries(a.map((_, k) => [k, "done" as CellState])),
    message: `Final heap after insert.`, vars: { n: a.length },
  });
  return frames;
}

function buildExtractFrames(initial: number[], kind: Kind): Frame[] {
  const a = [...initial];
  const frames: Frame[] = [];
  if (a.length === 0) {
    frames.push({ line: 0, arr: [], arrStates: [], pointers: {}, nodeStates: {}, message: `Heap empty.`, vars: {} });
    return frames;
  }
  const top = a[0];
  frames.push({
    line: 1, arr: [...a], arrStates: a.map((_, i) => i === 0 ? "active" : "default"),
    pointers: {}, nodeStates: { 0: "active" },
    message: `Extract root ${top}.`, vars: { top, kind, n: a.length },
  });
  a[0] = a[a.length - 1];
  a.pop();
  frames.push({
    line: 2, arr: [...a],
    arrStates: a.map((_, i) => i === 0 ? "swap" : "default"),
    pointers: { i: 0 }, nodeStates: a.length > 0 ? { 0: "swap" } : {},
    message: `Move last element to root. Sift down.`, vars: { extracted: top, n: a.length },
  });
  let i = 0;
  while (true) {
    const l = 2 * i + 1, r = 2 * i + 2;
    let best = i;
    const st = a.map(() => "default" as CellState);
    st[i] = "active";
    if (l < a.length) st[l] = "compare";
    if (r < a.length) st[r] = "compare";
    frames.push({
      line: 5, arr: [...a], arrStates: st, pointers: { i, l: l < a.length ? l : -1, r: r < a.length ? r : -1 },
      nodeStates: st.reduce((acc, s, k) => { acc[k] = s; return acc; }, {} as Record<number, CellState>),
      message: `At i=${i}: compare with children${l < a.length ? ` l=${l}` : ""}${r < a.length ? `, r=${r}` : ""}.`,
      vars: { i, l, r },
    });
    if (l < a.length && beats(kind, a[l], a[best])) best = l;
    if (r < a.length && beats(kind, a[r], a[best])) best = r;
    if (best === i) {
      frames.push({
        line: 10, arr: [...a], arrStates: a.map(() => "default" as CellState),
        pointers: { i }, nodeStates: { [i]: "done" },
        message: `Heap order restored.`, vars: { i, done: "yes" },
      });
      break;
    }
    [a[i], a[best]] = [a[best], a[i]];
    const st2 = a.map(() => "default" as CellState);
    st2[i] = "swap"; st2[best] = "swap";
    frames.push({
      line: 11, arr: [...a], arrStates: st2, pointers: { i, best }, nodeStates: { [i]: "swap", [best]: "swap" },
      message: `Swap a[${i}] ↔ a[${best}].`, vars: { i, best, swapped: "yes" },
    });
    i = best;
  }
  frames.push({
    line: 12, arr: [...a],
    arrStates: a.map(() => "done" as CellState),
    pointers: {}, nodeStates: Object.fromEntries(a.map((_, k) => [k, "done" as CellState])),
    message: `Extracted ${top}. Heap size now ${a.length}.`, vars: { extracted: top },
  });
  return frames;
}

function buildHeapifyFrames(initial: number[], kind: Kind): Frame[] {
  const a = [...initial];
  const frames: Frame[] = [];
  frames.push({
    line: 0, arr: [...a], arrStates: a.map(() => "default" as CellState),
    pointers: {}, nodeStates: {}, message: `Heapify [${a.join(", ")}] as ${kind}-heap.`, vars: { n: a.length },
  });
  for (let start = Math.floor(a.length / 2) - 1; start >= 0; start--) {
    frames.push({
      line: 1, arr: [...a],
      arrStates: a.map((_, i) => i === start ? "active" : "default"),
      pointers: { start }, nodeStates: { [start]: "active" },
      message: `Sift down from index ${start} (value ${a[start]}).`, vars: { start, value: a[start] },
    });
    // sift-down inline
    let i = start;
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let best = i;
      if (l < a.length && beats(kind, a[l], a[best])) best = l;
      if (r < a.length && beats(kind, a[r], a[best])) best = r;
      if (best === i) break;
      [a[i], a[best]] = [a[best], a[i]];
      const st = a.map(() => "default" as CellState);
      st[i] = "swap"; st[best] = "swap";
      frames.push({
        line: 2, arr: [...a], arrStates: st, pointers: { i, best },
        nodeStates: { [i]: "swap", [best]: "swap" },
        message: `Swap a[${i}] ↔ a[${best}].`, vars: { i, best },
      });
      i = best;
    }
  }
  frames.push({
    line: 2, arr: [...a],
    arrStates: a.map(() => "done" as CellState),
    pointers: {}, nodeStates: Object.fromEntries(a.map((_, k) => [k, "done" as CellState])),
    message: `Heapify complete. This is a valid ${kind}-heap.`, vars: { n: a.length },
  });
  return frames;
}

function parseArr(s: string): number[] | null {
  const p = s.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean).map(Number);
  if (p.some((n) => Number.isNaN(n))) return null;
  return p;
}

/* ------------------------------------------------------------------ */
/*  Visualize tab                                                       */
/* ------------------------------------------------------------------ */

function VisualizeTab() {
  const [input, setInput] = useState("10, 4, 15, 20, 0, 8, 25, 2");
  const [op, setOp] = useState<Op>("heapify");
  const [kind, setKind] = useState<Kind>("min");
  const [insertVal, setInsertVal] = useState(3);

  const parsed = useMemo(() => parseArr(input) ?? [10, 4, 15, 20, 0, 8, 25, 2], [input]);
  const frames = useMemo(() => {
    if (op === "heapify") return buildHeapifyFrames(parsed, kind);
    // For insert / extract we need a valid heap first → heapify internally
    const base = [...parsed];
    for (let start = Math.floor(base.length / 2) - 1; start >= 0; start--) {
      let i = start;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let best = i;
        if (l < base.length && beats(kind, base[l], base[best])) best = l;
        if (r < base.length && beats(kind, base[r], base[best])) best = r;
        if (best === i) break;
        [base[i], base[best]] = [base[best], base[i]];
        i = best;
      }
    }
    if (op === "insert") return buildInsertFrames(base, insertVal, kind);
    return buildExtractFrames(base, kind);
  }, [op, kind, parsed, insertVal]);

  const player = useStepPlayer(frames);
  const frame = player.current!;

  const treeData = useMemo(() => {
    const nodeStates: Record<number, CellState> = {};
    Object.entries(frame.nodeStates).forEach(([k, v]) => { nodeStates[Number(k)] = v; });
    return treeFromArray(frame.arr, nodeStates);
  }, [frame]);

  const pseudo = op === "insert" ? PSEUDO_INSERT : op === "extract" ? PSEUDO_EXTRACT : PSEUDO_HEAPIFY;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {(["heapify", "insert", "extract"] as Op[]).map((m) => (
          <button key={m} onClick={() => setOp(m)}
            className={op === m ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.78rem", padding: "5px 12px", textTransform: "capitalize" }}>
            {m}
          </button>
        ))}
        <div style={{ marginLeft: 8, display: "flex", gap: 4 }}>
          {(["min", "max"] as Kind[]).map((k) => (
            <button key={k} onClick={() => setKind(k)}
              className={kind === k ? "btn-eng" : "btn-eng-outline"}
              style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
              {k}-heap
            </button>
          ))}
        </div>
        {op === "insert" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--eng-text-muted)", fontWeight: 600 }}>insert:</span>
            <input type="number" value={insertVal} onChange={(e) => setInsertVal(Number(e.target.value))}
              style={{ width: 70, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--eng-border)", fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.82rem" }} />
          </div>
        )}
      </div>
      <AlgoCanvas
        title={`Heap - ${op} (${kind}-heap)`}
        player={player}
        input={
          <InputEditor
            label="Initial array"
            value={input}
            placeholder="e.g. 10, 4, 15, 20, 0"
            helper={op === "heapify" ? "Any array - will be sift-heapified." : "Array is first heapified; op runs on that heap."}
            presets={[
              { label: "Classic", value: "10, 4, 15, 20, 0, 8, 25, 2" },
              { label: "Sorted asc", value: "1, 2, 3, 4, 5, 6, 7" },
              { label: "Sorted desc", value: "9, 8, 7, 6, 5, 4" },
              { label: "Worst", value: "50, 25, 40, 10, 20, 30, 35, 5, 7, 15" },
            ]}
            onApply={(v) => { if (parseArr(v)) setInput(v); }}
          />
        }
        pseudocode={<PseudocodePanel lines={pseudo} activeLine={frame.line} />}
        variables={<VariablesPanel vars={frame.vars} />}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Tree view</div>
            <TreeCanvas nodes={treeData.nodes} root={treeData.root} width={560} height={260} />
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Array view</div>
            <ArrayBars values={frame.arr} states={frame.arrStates} pointers={frame.pointers} height={140} />
          </div>
        </div>
      </AlgoCanvas>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn tab                                                           */
/* ------------------------------------------------------------------ */

function LearnTab() {
  const items = [
    { title: "Complete binary tree", body: "Heaps fill level by level, left to right - this lets us store them in an array with zero wasted slots. For index i: parent = ⌊(i−1)/2⌋, children = 2i+1 and 2i+2." },
    { title: "Heap property", body: "Min-heap: every node ≤ its children, so the minimum is at the root. Max-heap flips the inequality. The heap property is local - no ordering between siblings." },
    { title: "Three core ops", body: "insert (O(log n) bubble-up), extractMin/Max (O(log n) sift-down), heapify (O(n) bulk build). Together they power Dijkstra, priority queues, heap-sort, and median tricks." },
    { title: "Heap vs BST", body: "A BST supports ordered traversal and range queries; a heap only gives you the extreme. Because heaps don't require full ordering, they are smaller, faster, and fit neatly in an array." },
  ];
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", margin: "0 0 6px" }}>Priority queue in 40 bytes</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Heaps are the canonical implementation of a priority queue: give me the highest-priority element fast, and let me add new elements fast. That's exactly what <code>insert</code> and <code>extract</code> provide at O(log n).
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
        {items.map((s, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-primary)", marginBottom: 4 }}>0{i + 1}</div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Try / Insight                                                       */
/* ------------------------------------------------------------------ */

function TryTab() {
  const problems = [
    { q: "Heapify [4,10,3,5,1] into min-heap. Root value?", a: "1" },
    { q: "Min-heap [1,3,5,4,8]. After insert 2, the root is?", a: "1" },
    { q: "Max-heap [20,15,10,8,7,5]. extractMax - new root is?", a: "15" },
    { q: "Time for heapSort on n items?", a: "O(n log n)" },
  ];
  const [g, setG] = useState<(string | null)[]>(problems.map(() => null));
  const [s, setS] = useState<boolean[]>(problems.map(() => false));
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>Do them mentally, then reveal.</div>
      {problems.map((p, i) => {
        const gv = (g[i] ?? "").replace(/\s/g, "").toLowerCase();
        const correct = gv === p.a.replace(/\s/g, "").toLowerCase();
        return (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text-muted)" }}>#{i + 1}</span>
              <span style={{ fontSize: "0.88rem", flex: "1 1 260px" }}>{p.q}</span>
              <input type="text" placeholder="answer" value={g[i] ?? ""}
                onChange={(e) => { const v = [...g]; v[i] = e.target.value; setG(v); }}
                style={{ width: 140, padding: "6px 8px", borderRadius: 6, border: "1px solid var(--eng-border)", fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.85rem" }} />
              <button onClick={() => { const v = [...s]; v[i] = true; setS(v); }} className="btn-eng-outline" style={{ fontSize: "0.78rem", padding: "5px 12px" }}>Reveal</button>
              {s[i] && (
                <span style={{
                  fontSize: "0.82rem", fontWeight: 700,
                  color: correct ? "var(--eng-success)" : "var(--eng-danger)",
                  padding: "3px 10px", borderRadius: 6,
                  background: correct ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                }}>{correct ? `✓ Correct` : `Answer: ${p.a}`}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InsightTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Why heapify is O(n), not O(n log n)</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Sift-down from index i does work proportional to the height <em>of that subtree</em>, not of the whole tree. Summing across all nodes gives a geometric series that converges to O(n). This is a Interview-favorite derivation.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Tiny pointer math</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          For 0-indexed heaps: parent(i) = (i−1)/2, left(i) = 2i+1, right(i) = 2i+2. For 1-indexed heaps: parent(i) = i/2, left(i) = 2i, right(i) = 2i+1. Interviewers often ask why 1-indexed is slightly prettier - these formulas are why.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>K-th largest trick</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Maintain a min-heap of size k. For each new element, push it and pop the smallest if size exceeds k. The root is the k-th largest. Time O(n log k), space O(k) - canonical interview pattern.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity                                                             */
/* ------------------------------------------------------------------ */

export default function DSA_L3_HeapsActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];
  const quiz: EngQuizQuestion[] = [
    {
      question: "In a 0-indexed array heap, the parent of index i is:",
      options: ["2i + 1", "(i − 1) / 2 (floor)", "i / 2", "i − 1"],
      correctIndex: 1,
      explanation: "Children live at 2i+1 and 2i+2, so the parent of i is ⌊(i−1)/2⌋.",
    },
    {
      question: "Building a heap from an unsorted array via bottom-up heapify costs:",
      options: ["O(n log n)", "O(n)", "O(log n)", "O(n²)"],
      correctIndex: 1,
      explanation: "The geometric sum of sift-down heights gives a tight O(n) bound - faster than inserting one-by-one.",
    },
    {
      question: "To find the kth largest element among n items, a heap-based approach uses:",
      options: [
        "a max-heap of size n",
        "a min-heap of size k",
        "a sorted linked list",
        "two heaps of size n/2",
      ],
      correctIndex: 1,
      explanation: "Keep a min-heap of size k; its root is the kth largest. Time O(n log k).",
    },
    {
      question: "Which operation is NOT O(log n) on a binary heap of n elements?",
      options: ["insert", "extract-min", "peek-min", "decrease-key"],
      correctIndex: 2,
      explanation: "peek-min is O(1) - it is just the root.",
    },
  ];
  return (
    <EngineeringLessonShell
      title="Heaps & Priority Queues"
      level={3}
      lessonNumber={4}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="Priority queues, Dijkstra, top-K, stream medians"
      nextLessonHint="Tries - prefix trees for strings"
    />
  );
}
