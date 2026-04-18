"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer,
  RecursionTree, StackColumn,
} from "@/components/engineering/algo";
import type { RecursionNode } from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StackFrameData { value: string | number; label?: string; }
interface Frame {
  line: number;
  vars: Record<string, string | number | undefined>;
  message: string;
  nodes: RecursionNode[];
  activeId?: string;
  stack: StackFrameData[];
  callCount: number;
  pegs?: { A: number[]; B: number[]; C: number[] };
  moves?: string[];
}

/* ------------------------------------------------------------------ */
/*  Factorial                                                          */
/* ------------------------------------------------------------------ */

const PSEUDO_FACT = [
  "function fact(n):",
  "  if n <= 1:",
  "    return 1",
  "  r ← fact(n - 1)",
  "  return n * r",
];

function buildFactorial(n: number): Frame[] {
  const frames: Frame[] = [];
  const nodes: RecursionNode[] = [];
  const stack: StackFrameData[] = [];
  let callCount = 0;

  function recurse(val: number, parent?: string): number {
    const id = `f${val}-${callCount}`;
    callCount++;
    const node: RecursionNode = { id, label: `fact(${val})`, parent, depth: stack.length, state: "active" };
    nodes.push(node);
    stack.push({ value: `fact(${val})`, label: "call" });

    frames.push({
      line: 0, vars: { n: val, depth: stack.length, calls: callCount },
      message: `Enter fact(${val}) - push onto call stack (depth ${stack.length}).`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
    });

    frames.push({
      line: 1, vars: { n: val, depth: stack.length, calls: callCount },
      message: `Check base case: is ${val} <= 1?`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
    });

    if (val <= 1) {
      node.returnValue = 1;
      node.state = "done";
      frames.push({
        line: 2, vars: { n: val, depth: stack.length, calls: callCount, returns: 1 },
        message: `Base case hit: return 1.`,
        nodes: nodes.map((x) => ({ ...x })), activeId: id,
        stack: [...stack], callCount,
      });
      stack.pop();
      return 1;
    }

    frames.push({
      line: 3, vars: { n: val, depth: stack.length, calls: callCount },
      message: `Recurse: compute fact(${val - 1}).`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
    });

    const r = recurse(val - 1, id);
    node.state = "active";
    const result = val * r;
    node.returnValue = result;
    node.state = "done";

    frames.push({
      line: 4, vars: { n: val, r, result, depth: stack.length, calls: callCount },
      message: `Combine: return ${val} × ${r} = ${result}. Pop frame.`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
    });
    stack.pop();
    return result;
  }

  recurse(n);
  return frames;
}

/* ------------------------------------------------------------------ */
/*  Fibonacci - exponential tree                                       */
/* ------------------------------------------------------------------ */

const PSEUDO_FIB = [
  "function fib(n):",
  "  if n < 2:",
  "    return n",
  "  a ← fib(n - 1)",
  "  b ← fib(n - 2)",
  "  return a + b",
];

function buildFib(n: number): Frame[] {
  const frames: Frame[] = [];
  const nodes: RecursionNode[] = [];
  const stack: StackFrameData[] = [];
  let idCounter = 0;
  let callCount = 0;

  function recurse(val: number, depth: number, parent?: string): number {
    const id = `fib-${idCounter++}`;
    callCount++;
    const node: RecursionNode = { id, label: `fib(${val})`, parent, depth, state: "active" };
    nodes.push(node);
    stack.push({ value: `fib(${val})`, label: "call" });

    frames.push({
      line: 0, vars: { n: val, depth, calls: callCount },
      message: `Enter fib(${val}).`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
    });

    if (val < 2) {
      node.returnValue = val;
      node.state = "done";
      frames.push({
        line: 2, vars: { n: val, depth, returns: val, calls: callCount },
        message: `Base: fib(${val}) returns ${val}.`,
        nodes: nodes.map((x) => ({ ...x })), activeId: id,
        stack: [...stack], callCount,
      });
      stack.pop();
      return val;
    }

    frames.push({
      line: 3, vars: { n: val, depth, calls: callCount },
      message: `Recurse left: fib(${val - 1}).`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
    });
    const a = recurse(val - 1, depth + 1, id);

    frames.push({
      line: 4, vars: { n: val, a, depth, calls: callCount },
      message: `Left returned ${a}. Now recurse right: fib(${val - 2}).`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
    });
    const b = recurse(val - 2, depth + 1, id);

    const r = a + b;
    node.returnValue = r;
    node.state = "done";
    frames.push({
      line: 5, vars: { n: val, a, b, r, depth, calls: callCount },
      message: `Combine: fib(${val}) = ${a} + ${b} = ${r}.`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
    });
    stack.pop();
    return r;
  }

  recurse(n, 0);
  return frames;
}

/* ------------------------------------------------------------------ */
/*  Tower of Hanoi                                                     */
/* ------------------------------------------------------------------ */

const PSEUDO_HANOI = [
  "function hanoi(n, src, aux, dst):",
  "  if n == 1:",
  "    move disk 1 from src to dst",
  "    return",
  "  hanoi(n-1, src, dst, aux)",
  "  move disk n from src to dst",
  "  hanoi(n-1, aux, src, dst)",
];

function buildHanoi(n: number): Frame[] {
  const frames: Frame[] = [];
  const nodes: RecursionNode[] = [];
  const stack: StackFrameData[] = [];
  let idCounter = 0;
  let callCount = 0;
  const pegs: { A: number[]; B: number[]; C: number[] } = {
    A: [], B: [], C: [],
  };
  for (let i = n; i >= 1; i--) pegs.A.push(i);
  const moves: string[] = [];

  function recurse(k: number, src: "A" | "B" | "C", aux: "A" | "B" | "C", dst: "A" | "B" | "C", depth: number, parent?: string) {
    const id = `h-${idCounter++}`;
    callCount++;
    const node: RecursionNode = {
      id, label: `h(${k},${src}→${dst})`, parent, depth, state: "active",
    };
    nodes.push(node);
    stack.push({ value: `h(${k},${src},${dst})`, label: "call" });

    frames.push({
      line: 0, vars: { n: k, src, dst, depth, calls: callCount },
      message: `Enter hanoi(${k}, ${src}→${dst}).`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
      pegs: { A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] },
      moves: [...moves],
    });

    if (k === 1) {
      const disk = pegs[src].pop()!;
      pegs[dst].push(disk);
      moves.push(`${src} → ${dst}`);
      node.returnValue = "✓";
      node.state = "done";
      frames.push({
        line: 2, vars: { n: k, src, dst, moves: moves.length, calls: callCount },
        message: `Move disk 1 from ${src} to ${dst}.`,
        nodes: nodes.map((x) => ({ ...x })), activeId: id,
        stack: [...stack], callCount,
        pegs: { A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] },
        moves: [...moves],
      });
      stack.pop();
      return;
    }

    frames.push({
      line: 4, vars: { n: k, src, aux, dst, calls: callCount },
      message: `Step 1: move top ${k - 1} disks ${src}→${aux} (use ${dst} as spare).`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
      pegs: { A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] },
      moves: [...moves],
    });
    recurse(k - 1, src, dst, aux, depth + 1, id);

    const disk = pegs[src].pop()!;
    pegs[dst].push(disk);
    moves.push(`${src} → ${dst}`);
    frames.push({
      line: 5, vars: { n: k, src, dst, moves: moves.length, calls: callCount },
      message: `Step 2: move disk ${k} (bottom) from ${src} to ${dst}.`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
      pegs: { A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] },
      moves: [...moves],
    });

    frames.push({
      line: 6, vars: { n: k, src: aux, dst, calls: callCount },
      message: `Step 3: move the ${k - 1} disks ${aux}→${dst}.`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
      pegs: { A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] },
      moves: [...moves],
    });
    recurse(k - 1, aux, src, dst, depth + 1, id);

    node.returnValue = "✓";
    node.state = "done";
    frames.push({
      line: 6, vars: { n: k, done: 1, calls: callCount },
      message: `hanoi(${k}, ${src}→${dst}) finished. Pop.`,
      nodes: nodes.map((x) => ({ ...x })), activeId: id,
      stack: [...stack], callCount,
      pegs: { A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] },
      moves: [...moves],
    });
    stack.pop();
  }

  recurse(n, "A", "B", "C", 0);
  return frames;
}

/* ------------------------------------------------------------------ */
/*  Hanoi peg visualization                                            */
/* ------------------------------------------------------------------ */

function HanoiPegs({ pegs, nMax }: { pegs: { A: number[]; B: number[]; C: number[] }; nMax: number }) {
  const pegNames: ("A" | "B" | "C")[] = ["A", "B", "C"];
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
  return (
    <div style={{ display: "flex", gap: 24, justifyContent: "center", padding: "12px 0" }}>
      {pegNames.map((p) => (
        <div key={p} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            position: "relative",
            width: nMax * 22 + 12, height: (nMax + 1) * 16 + 14,
            display: "flex", flexDirection: "column-reverse", alignItems: "center",
            padding: "4px 0",
          }}>
            <div style={{
              position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: 4, height: (nMax + 1) * 16 + 10, background: "#94a3b8", borderRadius: 2,
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 6,
              background: "#64748b", borderRadius: 3,
            }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: 2, paddingBottom: 6 }}>
              {pegs[p].map((d) => (
                <div key={d} style={{
                  width: d * 18 + 10, height: 14,
                  background: colors[(d - 1) % colors.length],
                  borderRadius: 4, border: "1.5px solid #fff",
                  color: "#fff", fontSize: "0.7rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                  transition: "all 0.3s ease",
                }}>
                  {d}
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--eng-text-muted)" }}>{p}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visualize tab                                                      */
/* ------------------------------------------------------------------ */

type Mode = "factorial" | "fibonacci" | "hanoi";

function VisualizeTab() {
  const [mode, setMode] = useState<Mode>("factorial");
  const [input, setInput] = useState("5");
  const parsed = Math.max(1, Math.min(mode === "fibonacci" ? 7 : mode === "hanoi" ? 4 : 7, Math.floor(Number(input) || 0))) || 1;

  const frames = useMemo(() => {
    if (mode === "factorial") return buildFactorial(parsed);
    if (mode === "fibonacci") return buildFib(parsed);
    return buildHanoi(parsed);
  }, [mode, parsed]);
  const player = useStepPlayer(frames);
  const frame = player.current!;

  const pseudo = mode === "factorial" ? PSEUDO_FACT : mode === "fibonacci" ? PSEUDO_FIB : PSEUDO_HANOI;

  return (
    <AlgoCanvas
      title={`Recursion - ${mode === "factorial" ? "Factorial" : mode === "fibonacci" ? "Fibonacci" : "Tower of Hanoi"}`}
      player={player}
      input={
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["factorial", "fibonacci", "hanoi"] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  padding: "5px 12px", fontSize: "0.75rem", fontWeight: 700,
                  borderRadius: 999,
                  border: mode === m ? "1.5px solid var(--eng-primary)" : "1px solid var(--eng-border)",
                  background: mode === m ? "var(--eng-primary-light)" : "var(--eng-surface)",
                  color: mode === m ? "var(--eng-primary)" : "var(--eng-text-muted)",
                  cursor: "pointer", fontFamily: "var(--eng-font)",
                  transition: "all 0.15s",
                }}>
                {m === "factorial" ? "Factorial" : m === "fibonacci" ? "Fibonacci" : "Tower of Hanoi"}
              </button>
            ))}
          </div>
          <InputEditor
            label={mode === "hanoi" ? "Disks n (1–4)" : "Input n"}
            value={input}
            placeholder="e.g. 5"
            helper={mode === "fibonacci" ? "Fib grows exponentially - capped at 7." : mode === "hanoi" ? "Hanoi doubles per disk - capped at 4." : "Factorial - try 5 or 6."}
            presets={mode === "hanoi"
              ? [{ label: "n=2", value: "2" }, { label: "n=3", value: "3" }, { label: "n=4", value: "4" }]
              : mode === "fibonacci"
              ? [{ label: "n=3", value: "3" }, { label: "n=5", value: "5" }, { label: "n=7", value: "7" }]
              : [{ label: "n=3", value: "3" }, { label: "n=5", value: "5" }, { label: "n=6", value: "6" }]}
            onApply={(v) => setInput(v)}
          />
        </div>
      }
      pseudocode={<PseudocodePanel lines={pseudo} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} flashKeys={["calls", "returns", "r", "result"]} />}
      legend={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: "0.72rem" }}>
          <LegendDot color="#3b82f6" label="active call" />
          <LegendDot color="#10b981" label="returned" />
          <span style={{ color: "var(--eng-text-muted)" }}>
            Total calls so far: <strong style={{ color: "var(--eng-primary)" }}>{frame.callCount}</strong>
          </span>
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: 16, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <RecursionTree nodes={frame.nodes} activeId={frame.activeId} height={mode === "fibonacci" ? 380 : 320} />
          {mode === "hanoi" && frame.pegs && (
            <div style={{ marginTop: 12, borderTop: "1px solid var(--eng-border)", paddingTop: 12 }}>
              <HanoiPegs pegs={frame.pegs} nMax={parsed} />
              {frame.moves && frame.moves.length > 0 && (
                <div style={{
                  fontSize: "0.72rem", color: "var(--eng-text-muted)",
                  textAlign: "center", marginTop: 8,
                }}>
                  Moves: {frame.moves.slice(-6).join("  ·  ")}
                  {frame.moves.length > 6 && `  · (+${frame.moves.length - 6} earlier)`}
                </div>
              )}
            </div>
          )}
        </div>
        <StackColumn
          items={frame.stack.map((s) => ({ value: String(s.value) }))}
          title="Call Stack"
          maxHeight={300}
          width={140}
        />
      </div>
    </AlgoCanvas>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      <span>{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn tab                                                          */
/* ------------------------------------------------------------------ */

function LearnTab() {
  const sections = [
    { title: "What is recursion?", body: "A function that calls itself to solve a smaller version of the same problem. Every recursive function must have (1) a base case that stops the recursion and (2) a recursive case that shrinks toward the base." },
    { title: "The call stack", body: "Every function call pushes a new 'frame' onto the call stack - storing its arguments, local variables, and return address. When the function returns, the frame is popped. A recursive function that forgets its base case will overflow this stack." },
    { title: "Linear vs tree recursion", body: "Factorial recurses once per call (linear - depth n, calls n). Fibonacci recurses twice per call (tree - exponential calls, lots of repeated work). This is exactly why Fibonacci needs memoization." },
    { title: "Tower of Hanoi", body: "To move n disks from A to C: (1) move n-1 disks A→B using C as spare, (2) move disk n from A→C, (3) move n-1 disks B→C using A as spare. The recurrence T(n) = 2T(n-1) + 1 gives 2ⁿ - 1 moves." },
  ];
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", margin: "0 0 6px" }}>Mental model</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Trust the recursion. Assume the recursive call works correctly for a smaller input, then focus only on how to combine its result with the current step. That single habit unlocks every recursive algorithm.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {sections.map((s, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-primary)", marginBottom: 4 }}>0{i + 1}</div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Try tab                                                            */
/* ------------------------------------------------------------------ */

function TryTab() {
  const problems = [
    { q: "fact(4) = ?", a: "24", hint: "4 · 3 · 2 · 1" },
    { q: "fib(6) = ?", a: "8", hint: "0,1,1,2,3,5,8" },
    { q: "Number of moves for hanoi(n=4)?", a: "15", hint: "2⁴ - 1" },
    { q: "Number of fib(n) calls for n=5 (naive)?", a: "15", hint: "fib(5)=fib(4)+fib(3); expand fully." },
  ];
  const [guesses, setGuesses] = useState<(string | null)[]>(problems.map(() => null));
  const [shown, setShown] = useState<boolean[]>(problems.map(() => false));

  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        Trace on paper. Write your guess, then reveal.
      </div>
      {problems.map((p, i) => {
        const g = guesses[i];
        const revealed = shown[i];
        const correct = g !== null && g.trim() === p.a;
        return (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text-muted)" }}>#{i + 1}</span>
              <code style={{
                fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                fontSize: "0.85rem", background: "var(--eng-bg)", padding: "4px 10px",
                borderRadius: 6, border: "1px solid var(--eng-border)",
              }}>{p.q}</code>
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
            {revealed && <div style={{ fontSize: "0.78rem", color: "var(--eng-text-muted)", marginTop: 6, paddingLeft: 36 }}>Hint: {p.hint}</div>}
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
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Recursion = stack, implicitly</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Every recursive algorithm can be rewritten iteratively using an explicit stack. DFS in graphs, tree traversals, parsers - all use this equivalence. Understanding the call stack makes the translation mechanical.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Why naive Fibonacci is O(2ⁿ)</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Each call spawns two children, and identical subproblems are solved repeatedly. fib(30) computes fib(10) over 10,000 times. Memoization collapses this to O(n) - the bridge to dynamic programming.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Interview cheat sheet</h3>
        <ul style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>Factorial: T(n) = T(n-1) + O(1) → O(n) time, O(n) stack.</li>
          <li>Binary recursion: T(n) = 2T(n-1) + O(1) → O(2ⁿ) time.</li>
          <li>Hanoi: 2ⁿ - 1 moves. The minimum is tight - no algorithm does fewer.</li>
          <li>Tail recursion = recursive call is the last op; compilers can optimize it to a loop.</li>
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function DSA_L6_RecursionActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];
  const quiz: EngQuizQuestion[] = [
    {
      question: "Every recursive function must have which two components?",
      options: ["A loop and a counter", "A base case and a recursive case", "A stack and a queue", "A mutex and a semaphore"],
      correctIndex: 1,
      explanation: "A base case stops the recursion; the recursive case reduces the problem toward the base. Missing the base case ⇒ stack overflow.",
    },
    {
      question: "How many function calls does naive fib(6) make in total (including the root)?",
      options: ["7", "13", "25", "63"],
      correctIndex: 2,
      explanation: "Count(n) = Count(n-1) + Count(n-2) + 1 with Count(0)=Count(1)=1. That gives 1,1,3,5,9,15,25 → fib(6) = 25 calls.",
    },
    {
      question: "For Tower of Hanoi with n = 5 disks, how many moves are needed?",
      options: ["10", "25", "31", "32"],
      correctIndex: 2,
      explanation: "2ⁿ - 1 = 2⁵ - 1 = 31.",
    },
    {
      question: "Why is iterative code sometimes preferred over recursion for the same algorithm?",
      options: [
        "Recursion gives wrong answers",
        "Recursion uses O(depth) call-stack space and risks stack overflow",
        "Recursion can't express divide-and-conquer",
        "Recursion always runs slower asymptotically",
      ],
      correctIndex: 1,
      explanation: "Recursion pays O(depth) space for the stack. For deep recursion on large inputs this can overflow - iterative code uses O(1) or a managed stack instead.",
    },
  ];
  return (
    <EngineeringLessonShell
      title="Recursion - Thinking Recursively"
      level={6}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="Foundation for every divide-and-conquer / backtracking / DP question"
      nextLessonHint="Backtracking - systematic brute-force search with pruning"
    />
  );
}
