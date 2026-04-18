"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, ArrayBars, StackColumn, useStepPlayer,
} from "@/components/engineering/algo";
import type { CellState } from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Two modes: Next Greater Element (NGE) and Largest Rectangle (LRH)   */
/* ------------------------------------------------------------------ */

type Mode = "nge" | "lrh";

interface Arrow { from: number; to: number; }

interface Frame {
  line: number;
  vars: Record<string, string | number | undefined>;
  message: string;
  arrStates: CellState[];
  stack: { idx: number; val: number }[];
  result: (number | null)[];   // NGE output
  arrows: Arrow[];              // arrows from popped index → current index
  bestRect: { lo: number; hi: number; h: number; area: number } | null; // LRH
  flashKey?: string;
}

const PSEUDO_NGE = [
  "function nextGreater(A):",
  "  stack ← []; result ← [-1] * n",
  "  for i in 0..n-1:",
  "    while stack not empty and A[stack.top] < A[i]:",
  "      j ← stack.pop()",
  "      result[j] ← A[i]",
  "    stack.push(i)",
  "  return result",
];

const PSEUDO_LRH = [
  "function largestRectangle(H):",
  "  stack ← []; best ← 0",
  "  for i in 0..n:   // sentinel at n",
  "    h ← (i == n) ? 0 : H[i]",
  "    while stack not empty and H[stack.top] > h:",
  "      top ← stack.pop()",
  "      width ← stack empty ? i : i - stack.top - 1",
  "      best ← max(best, H[top] * width)",
  "    stack.push(i)",
  "  return best",
];

function buildFramesNGE(A: number[]): Frame[] {
  const n = A.length;
  const f: Frame[] = [];
  const stack: { idx: number; val: number }[] = [];
  const result: (number | null)[] = Array(n).fill(null);
  const baseStates = () => Array<CellState>(n).fill("default");

  f.push({ line: 0, vars: { n }, message: `Find the next greater element for each item in [${A.join(",")}].`, arrStates: baseStates(), stack: [], result: [...result], arrows: [], bestRect: null });
  f.push({ line: 1, vars: { stack: "[]" }, flashKey: "stack", message: "Stack is empty; result initialized to -1.", arrStates: baseStates(), stack: [], result: [...result], arrows: [], bestRect: null });

  for (let i = 0; i < n; i++) {
    const st = baseStates();
    st[i] = "active";
    f.push({ line: 2, vars: { i, "A[i]": A[i] }, flashKey: "i", message: `Scan i=${i}, A[i]=${A[i]}.`, arrStates: st, stack: [...stack], result: [...result], arrows: [], bestRect: null });
    const arrows: Arrow[] = [];
    while (stack.length && stack[stack.length - 1].val < A[i]) {
      const st2 = baseStates();
      st2[i] = "active";
      stack.forEach((s) => (st2[s.idx] = "compare"));
      f.push({ line: 3, vars: { top: stack[stack.length - 1].idx, "A[top]": stack[stack.length - 1].val, "A[i]": A[i] }, message: `A[top]=${stack[stack.length - 1].val} < A[i]=${A[i]} - pop.`, arrStates: st2, stack: [...stack], result: [...result], arrows, bestRect: null });
      const j = stack.pop()!;
      result[j.idx] = A[i];
      arrows.push({ from: j.idx, to: i });
      const st3 = baseStates();
      st3[i] = "active";
      st3[j.idx] = "done";
      stack.forEach((s) => (st3[s.idx] = "window"));
      f.push({ line: 5, vars: { j: j.idx, "result[j]": A[i] }, flashKey: "result", message: `result[${j.idx}] ← ${A[i]} (A[${j.idx}]=${j.val}'s next greater).`, arrStates: st3, stack: [...stack], result: [...result], arrows: [...arrows], bestRect: null });
    }
    stack.push({ idx: i, val: A[i] });
    const stEnd = baseStates();
    stEnd[i] = "window";
    stack.forEach((s) => (stEnd[s.idx] = "window"));
    f.push({ line: 6, vars: { pushed: i }, flashKey: "stack", message: `Push i=${i} onto stack. Stack holds indices waiting for their next greater.`, arrStates: stEnd, stack: [...stack], result: [...result], arrows: [...arrows], bestRect: null });
  }
  f.push({ line: 7, vars: { result: `[${result.map((x) => x ?? -1).join(",")}]` }, message: `Done. Items still on stack had no next greater.`, arrStates: baseStates(), stack: [...stack], result: [...result], arrows: [], bestRect: null });
  return f;
}

function buildFramesLRH(H: number[]): Frame[] {
  const n = H.length;
  const f: Frame[] = [];
  const stack: { idx: number; val: number }[] = [];
  let best = 0;
  let bestRect: Frame["bestRect"] = null;
  const baseStates = () => Array<CellState>(n).fill("default");

  f.push({ line: 0, vars: { n }, message: `Histogram heights = [${H.join(",")}]. Find the largest rectangle.`, arrStates: baseStates(), stack: [], result: [], arrows: [], bestRect: null });
  f.push({ line: 1, vars: { best }, flashKey: "best", message: "Stack empty, best=0.", arrStates: baseStates(), stack: [], result: [], arrows: [], bestRect: null });

  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : H[i];
    const st = baseStates();
    if (i < n) st[i] = "active";
    f.push({ line: 2, vars: { i, h }, flashKey: "i", message: i === n ? "Sentinel i=n (h=0) - flush remaining stack." : `Scan i=${i}, h=${h}.`, arrStates: st, stack: [...stack], result: [], arrows: [], bestRect });

    while (stack.length && stack[stack.length - 1].val > h) {
      const st2 = baseStates();
      if (i < n) st2[i] = "active";
      stack.forEach((s) => (st2[s.idx] = "compare"));
      const top = stack[stack.length - 1];
      f.push({ line: 4, vars: { top: top.idx, "H[top]": top.val, h }, message: `H[top]=${top.val} > h=${h} - pop and compute its rect.`, arrStates: st2, stack: [...stack], result: [], arrows: [], bestRect });
      stack.pop();
      const leftBound = stack.length ? stack[stack.length - 1].idx + 1 : 0;
      const rightBound = i - 1;
      const width = rightBound - leftBound + 1;
      const area = top.val * width;
      const st3 = baseStates();
      if (i < n) st3[i] = "active";
      for (let k = leftBound; k <= rightBound; k++) st3[k] = "path";
      stack.forEach((s) => (st3[s.idx] = "window"));
      f.push({ line: 6, vars: { top: top.idx, width, area, best }, flashKey: "area", message: `Width = ${width}, area = ${top.val} × ${width} = ${area}.`, arrStates: st3, stack: [...stack], result: [], arrows: [], bestRect: { lo: leftBound, hi: rightBound, h: top.val, area } });
      if (area > best) {
        best = area;
        bestRect = { lo: leftBound, hi: rightBound, h: top.val, area };
        f.push({ line: 6, vars: { best }, flashKey: "best", message: `New best! best=${best}.`, arrStates: st3, stack: [...stack], result: [], arrows: [], bestRect });
      }
    }

    if (i < n) {
      stack.push({ idx: i, val: h });
      const stEnd = baseStates();
      stack.forEach((s) => (stEnd[s.idx] = "window"));
      f.push({ line: 7, vars: { pushed: i }, flashKey: "stack", message: `Push i=${i}. Stack heights stay monotonically increasing.`, arrStates: stEnd, stack: [...stack], result: [], arrows: [], bestRect });
    }
  }
  f.push({ line: 8, vars: { best }, flashKey: "best", message: `Done. Largest rectangle area = ${best}.`, arrStates: baseStates(), stack: [], result: [], arrows: [], bestRect });
  return f;
}

/* ------------------------------------------------------------------ */
/*  Visualize                                                          */
/* ------------------------------------------------------------------ */

function parseArr(s: string): number[] | null {
  const nums = s.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean).map(Number);
  if (nums.some((x) => !Number.isFinite(x))) return null;
  return nums.slice(0, 12);
}

function VisualizeTab() {
  const [mode, setMode] = useState<Mode>("nge");
  const [inputStr, setInputStr] = useState("2,1,2,4,3,1");
  const A = parseArr(inputStr) ?? [2, 1, 2, 4, 3, 1];
  const frames = useMemo(() => (mode === "nge" ? buildFramesNGE(A) : buildFramesLRH(A)), [A, mode]);
  const player = useStepPlayer(frames);
  const frame = player.current!;
  const pseudo = mode === "nge" ? PSEUDO_NGE : PSEUDO_LRH;

  return (
    <AlgoCanvas
      title={mode === "nge" ? "Next Greater Element" : "Largest Rectangle in Histogram"}
      player={player}
      input={
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mode</span>
            <button onClick={() => setMode("nge")} className={mode === "nge" ? "btn-eng" : "btn-eng-outline"} style={{ fontSize: "0.75rem", padding: "4px 10px" }}>Next Greater</button>
            <button onClick={() => setMode("lrh")} className={mode === "lrh" ? "btn-eng" : "btn-eng-outline"} style={{ fontSize: "0.75rem", padding: "4px 10px" }}>Histogram Rectangle</button>
          </div>
          <InputEditor
            label="Array (up to 12 values)"
            value={inputStr}
            placeholder="e.g. 2,1,2,4,3,1"
            helper={mode === "nge" ? "We find the nearest greater on the right of each element." : "Heights of adjacent unit-width bars; find the largest axis-aligned rectangle."}
            presets={[
              { label: "Classic", value: "2,1,2,4,3,1" },
              { label: "Increasing", value: "1,2,3,4,5" },
              { label: "Decreasing", value: "5,4,3,2,1" },
              { label: "Histogram", value: "2,1,5,6,2,3" },
              { label: "Flat", value: "3,3,3,3" },
            ]}
            onApply={(v) => { if (parseArr(v)) setInputStr(v); }}
            onRandom={() => {
              const n = 5 + Math.floor(Math.random() * 5);
              const arr: number[] = [];
              for (let i = 0; i < n; i++) arr.push(1 + Math.floor(Math.random() * 6));
              setInputStr(arr.join(","));
            }}
          />
        </div>
      }
      pseudocode={<PseudocodePanel lines={pseudo} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} flashKeys={frame.flashKey ? [frame.flashKey] : []} />}
    >
      <MonotonicViz frame={frame} A={A} mode={mode} />
    </AlgoCanvas>
  );
}

function MonotonicViz({ frame, A, mode }: { frame: Frame; A: number[]; mode: Mode }) {
  // Compute arrow positions - array is centered; we approximate with relative flex.
  const stackItems = frame.stack.map((s) => ({ value: `[${s.idx}]=${s.val}`, label: "idx" }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 170px", gap: 20, alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ position: "relative" }}>
          <ArrayBars values={A} states={frame.arrStates} height={160} />
          {/* Arrow overlay for NGE */}
          {mode === "nge" && frame.arrows.length > 0 && (
            <div style={{
              fontSize: "0.72rem", color: "var(--eng-text-muted)",
              textAlign: "center", marginTop: 6,
            }}>
              Arrows: popped indices → their next greater element.
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 4 }}>
                {frame.arrows.map((a, i) => (
                  <span key={i} style={{
                    padding: "2px 8px", borderRadius: 6,
                    background: "rgba(16,185,129,0.12)",
                    color: "var(--eng-success)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.72rem", fontWeight: 700,
                  }}>
                    [{a.from}] → [{a.to}] ({A[a.to]})
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Best rectangle overlay for LRH */}
          {mode === "lrh" && frame.bestRect && (
            <div style={{
              marginTop: 6, textAlign: "center",
              fontSize: "0.78rem",
              color: "var(--eng-text)",
            }}>
              Current rectangle: <b style={{ color: "var(--eng-primary)", fontFamily: '"SF Mono", Menlo, Consolas, monospace' }}>
                indices [{frame.bestRect.lo}..{frame.bestRect.hi}] × h={frame.bestRect.h} = area {frame.bestRect.area}
              </b>
            </div>
          )}
        </div>

        {mode === "nge" && (
          <div style={{
            border: "1px solid var(--eng-border)", borderRadius: 10, padding: 12,
            background: "var(--eng-surface)",
          }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Result
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {A.map((_, i) => {
                const r = frame.result[i];
                const done = r !== null;
                return (
                  <div key={i} style={{
                    width: 48, padding: "6px 4px", textAlign: "center",
                    borderRadius: 6,
                    border: `1.5px solid ${done ? "var(--eng-success)" : "var(--eng-border)"}`,
                    background: done ? "rgba(16,185,129,0.08)" : "var(--eng-bg)",
                    fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                    fontSize: "0.78rem",
                    color: done ? "var(--eng-success)" : "var(--eng-text-muted)",
                    transition: "all 0.3s ease",
                  }}>
                    <div style={{ fontSize: "0.62rem", color: "var(--eng-text-muted)" }}>[{i}]</div>
                    <div style={{ fontWeight: 800 }}>{r ?? -1}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <StackColumn items={stackItems} title="Mono-Stack" maxHeight={240} topLabel="top" emptyLabel="empty" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn                                                              */
/* ------------------------------------------------------------------ */

function LearnTab() {
  const sections = [
    { title: "What is a monotonic stack?", body: "A stack in which every element is either strictly ≥ (decreasing) or ≤ (increasing) its predecessor. To keep the order we pop offenders before pushing. The pop event carries meaning: the popped element 'met its match'." },
    { title: "Next-greater pattern", body: "Scan left→right. While the top of the stack is smaller than the current value, pop it - the current value is its next greater. Push the current index. Each index is pushed and popped at most once → O(n)." },
    { title: "Largest rectangle in histogram", body: "Use a monotonic-increasing stack of indices. When a shorter bar arrives, taller bars on the stack are 'trapped' - we can now compute their width (current index − stack.top − 1) and area." },
    { title: "Monotonic deque", body: "A double-ended variant used for sliding-window maximum. Pop from the back while maintaining order, pop from the front when the index falls out of the window. O(n) for max over every window of size k." },
  ];
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--eng-text)", margin: "0 0 6px" }}>Mental model</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Think of the stack as a queue of &ldquo;people waiting to be answered.&rdquo; Each incoming element fires questions - &ldquo;are you the next greater for anyone waiting?&rdquo; - and the monotonic property guarantees the answer is cheap.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {sections.map((s, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-primary)", marginBottom: 4 }}>0{i + 1}</div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--eng-text)", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Try                                                                */
/* ------------------------------------------------------------------ */

function TryTab() {
  const problems = [
    { q: "NGE of [2,1,2,4,3,1] - what's result[1]?", a: "2" },
    { q: "NGE of [5,4,3,2,1]. How many −1 entries?", a: "5" },
    { q: "Largest rectangle for heights [2,1,5,6,2,3]?", a: "10" },
    { q: "Largest rectangle for heights [6,2,5,4,5,1,6]?", a: "12" },
  ];
  const [guesses, setGuesses] = useState<string[]>(problems.map(() => ""));
  const [shown, setShown] = useState<boolean[]>(problems.map(() => false));

  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        Simulate by hand: maintain a small stack, pop when a violation arrives, record the result.
      </div>
      {problems.map((p, i) => {
        const correct = guesses[i].trim() === p.a;
        return (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.88rem", color: "var(--eng-text)", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "var(--eng-text-muted)" }}>#{i + 1}. </span>{p.q}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text" value={guesses[i]}
                onChange={(e) => { const v = [...guesses]; v[i] = e.target.value; setGuesses(v); }}
                placeholder="your answer"
                style={{ width: 100, padding: "6px 8px", borderRadius: 6, border: "1px solid var(--eng-border)", fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.85rem" }}
              />
              <button onClick={() => { const v = [...shown]; v[i] = true; setShown(v); }} className="btn-eng-outline" style={{ fontSize: "0.78rem", padding: "5px 12px" }}>
                Reveal
              </button>
              {shown[i] && (
                <span style={{
                  fontSize: "0.82rem", fontWeight: 700,
                  color: correct ? "var(--eng-success)" : "var(--eng-danger)",
                  padding: "3px 10px", borderRadius: 6,
                  background: correct ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                }}>
                  {correct ? `Correct - ${p.a}` : `Answer: ${p.a}`}
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
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Pattern signature</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          If a problem asks for &ldquo;the nearest larger / smaller element&rdquo;, &ldquo;the span&rdquo;, &ldquo;the rectangle/area bounded by something shorter/taller&rdquo; - reach for a monotonic stack. The pop event is where the answer is computed.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Complexity argument</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Every index is pushed exactly once. Each index is popped at most once. So the inner loop's total work across the whole outer loop is at most n. Outer + inner = O(n + n) = O(n). Amortized analysis again - the same trick as sliding window.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Cousins worth knowing</h3>
        <ul style={{ fontSize: "0.86rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>Daily temperatures → next-greater rephrased.</li>
          <li>Trapping rain water → two-pointer or mono-stack.</li>
          <li>Stock span → next-greater on the reversed array.</li>
          <li>Sliding window max → monotonic deque.</li>
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity                                                           */
/* ------------------------------------------------------------------ */

export default function DSA_L8_MonotonicStackActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];
  const quiz: EngQuizQuestion[] = [
    {
      question: "Why is a monotonic-stack solution for 'next greater element' O(n) and not O(n²)?",
      options: [
        "Because the input is sorted",
        "Because each index is pushed and popped at most once - total work is 2n",
        "Because the stack has size at most √n",
        "It is not - it is O(n²)",
      ],
      correctIndex: 1,
      explanation: "The amortized argument: each element enters the stack once and leaves once. The inner while across the entire run performs at most n pops total.",
    },
    {
      question: "In the largest-rectangle-in-histogram problem, what information is carried by the stack?",
      options: [
        "The running sum of heights",
        "Indices of bars in strictly increasing height order - candidates whose rectangle extends to the right",
        "Only the maximum height seen so far",
        "A sorted list of all heights",
      ],
      correctIndex: 1,
      explanation: "Bars on the stack haven't yet hit a shorter neighbor to their right, so their right boundary is still open. When a shorter bar arrives, each trapped bar's rectangle is finalized.",
    },
    {
      question: "In the next-greater algorithm, after processing [4, 3, 2, 1], what does the stack contain?",
      options: ["[]", "[4]", "[4, 3, 2, 1]", "[1]"],
      correctIndex: 2,
      explanation: "The array is strictly decreasing. Nothing ever pops. All four indices remain on the stack; their result entries stay -1.",
    },
    {
      question: "Which structure is best for 'sliding window maximum' over every window of size k?",
      options: [
        "Balanced BST in each window",
        "Min-heap",
        "Monotonic deque - pop from back to maintain order, pop from front when index is stale",
        "Hash map",
      ],
      correctIndex: 2,
      explanation: "Deque front always holds the index of the window's maximum. Back pops discard dominated values; front pops drop out-of-window indices. O(n) total.",
    },
  ];
  return (
    <EngineeringLessonShell
      title="Monotonic Stack / Queue"
      level={8}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="High - stock span, histogram, temperatures, sliding-window max"
      nextLessonHint="Grid-to-Graph Modeling"
    />
  );
}
