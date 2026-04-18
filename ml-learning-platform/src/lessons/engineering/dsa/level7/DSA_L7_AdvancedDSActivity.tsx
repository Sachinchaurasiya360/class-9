"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer,
} from "@/components/engineering/algo";

/* ================================================================== */
/*  Common: simple step-framework                                     */
/* ================================================================== */

interface BaseFrame {
  line: number;
  vars: Record<string, string | number | undefined>;
  message: string;
}

/* ================================================================== */
/*  B-TREE (order t=2 → max 3 keys per node)                           */
/* ================================================================== */

interface BNode { id: string; keys: number[]; children: string[]; highlight?: boolean; splitting?: boolean }
interface BFrame extends BaseFrame {
  nodes: Record<string, BNode>;
  rootId: string;
  activeId?: string;
  splittingId?: string;
}

const PSEUDO_B = [
  "# B-Tree insert (order t=2, max 3 keys)",
  "function insert(key):",
  "  if root is full: split root (new root created)",
  "  insertNonFull(root, key)",
  "function insertNonFull(x, k):",
  "  if x is leaf: insert k in sorted position",
  "  else: descend to child; split if child full",
];

function cloneBNodes(n: Record<string, BNode>): Record<string, BNode> {
  const r: Record<string, BNode> = {};
  for (const k in n) r[k] = { ...n[k], keys: [...n[k].keys], children: [...n[k].children] };
  return r;
}

function buildBFrames(keysToInsert: number[]): BFrame[] {
  const frames: BFrame[] = [];
  let idCounter = 0;
  const mkId = () => `b${idCounter++}`;
  const MAX_KEYS = 3; // order t=2
  const nodes: Record<string, BNode> = {};
  let rootId = mkId();
  nodes[rootId] = { id: rootId, keys: [], children: [] };

  function snapshot(msg: string, line: number, activeId?: string, extra: Partial<BFrame> = {}) {
    frames.push({ line, vars: { keys: keysToInsert.join(","), nodes: Object.keys(nodes).length, root: rootId }, message: msg, nodes: cloneBNodes(nodes), rootId, activeId, ...extra });
  }

  function splitChild(parent: BNode, idx: number) {
    const child = nodes[parent.children[idx]];
    const midKey = child.keys[1]; // with 3 keys, middle is index 1
    const right: BNode = { id: mkId(), keys: child.keys.slice(2), children: child.children.slice(2) };
    child.keys = child.keys.slice(0, 1);
    child.children = child.children.slice(0, 2);
    nodes[right.id] = right;
    parent.keys.splice(idx, 0, midKey);
    parent.children.splice(idx + 1, 0, right.id);
    snapshot(`Split child: lift ${midKey} up, create new right node.`, 2, parent.id, { splittingId: right.id });
  }

  function insertNonFull(x: BNode, k: number) {
    if (x.children.length === 0) {
      let i = x.keys.length - 1;
      while (i >= 0 && x.keys[i] > k) i--;
      x.keys.splice(i + 1, 0, k);
      snapshot(`Inserted ${k} into leaf node.`, 5, x.id);
    } else {
      let i = x.keys.length - 1;
      while (i >= 0 && x.keys[i] > k) i--;
      i++;
      const child = nodes[x.children[i]];
      snapshot(`Descend into child for ${k}.`, 6, child.id);
      if (child.keys.length === MAX_KEYS) {
        splitChild(x, i);
        if (k > x.keys[i]) i++;
      }
      insertNonFull(nodes[x.children[i]], k);
    }
  }

  snapshot("Empty B-Tree. Start inserting keys.", 0);
  for (const k of keysToInsert) {
    snapshot(`Insert ${k}.`, 1);
    const root = nodes[rootId];
    if (root.keys.length === MAX_KEYS) {
      const newRoot: BNode = { id: mkId(), keys: [], children: [rootId] };
      nodes[newRoot.id] = newRoot;
      rootId = newRoot.id;
      splitChild(newRoot, 0);
    }
    insertNonFull(nodes[rootId], k);
  }
  snapshot("Done.", 0);
  return frames;
}

function BTreeNode({ node, activeId, splittingId }: { node: BNode; activeId?: string; splittingId?: string }) {
  const isActive = node.id === activeId;
  const isSplit = node.id === splittingId;
  return (
    <div style={{ display: "flex", gap: 0, padding: "4px 2px", border: isSplit ? "2px solid var(--eng-warning)" : isActive ? "2px solid var(--eng-primary)" : "1.5px solid var(--eng-border)", borderRadius: 8, background: isActive ? "var(--eng-primary-light)" : isSplit ? "rgba(245,158,11,0.1)" : "var(--eng-surface)", transition: "all 0.3s" }}>
      {node.keys.map((k, i) => (
        <div key={i} style={{
          padding: "4px 10px",
          borderRight: i < node.keys.length - 1 ? "1px solid var(--eng-border)" : "none",
          fontFamily: '"SF Mono", monospace', fontWeight: 800, fontSize: "0.85rem",
          color: "var(--eng-text)",
        }}>{k}</div>
      ))}
      {node.keys.length === 0 && (
        <div style={{ padding: "4px 10px", color: "var(--eng-text-muted)", fontStyle: "italic", fontSize: "0.78rem" }}>empty</div>
      )}
    </div>
  );
}

function BTreeLevel({ nodes, ids, activeId, splittingId }: { nodes: Record<string, BNode>; ids: string[]; activeId?: string; splittingId?: string }) {
  return (
    <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
      {ids.map((id) => <BTreeNode key={id} node={nodes[id]} activeId={activeId} splittingId={splittingId} />)}
    </div>
  );
}

function BTreeViz({ frame }: { frame: BFrame }) {
  // BFS-layered display
  const levels: string[][] = [];
  const visit = (id: string, depth: number) => {
    (levels[depth] ||= []).push(id);
    for (const c of frame.nodes[id].children) visit(c, depth + 1);
  };
  if (frame.nodes[frame.rootId]) visit(frame.rootId, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
      {levels.map((lv, i) => (
        <BTreeLevel key={i} nodes={frame.nodes} ids={lv} activeId={frame.activeId} splittingId={frame.splittingId} />
      ))}
    </div>
  );
}

function parseInts(s: string, maxN = 14): number[] | null {
  const nums = s.split(/[,\s]+/).map(Number).filter((x) => !Number.isNaN(x));
  if (nums.length === 0 || nums.length > maxN) return null;
  return nums;
}

function BTreeVisualizer() {
  const [src, setSrc] = useState("10, 20, 5, 6, 12, 30, 7, 17");
  const keys = parseInts(src) ?? [10, 20, 5, 6, 12, 30, 7, 17];
  const frames = useMemo(() => buildBFrames(keys), [keys]);
  const player = useStepPlayer(frames);
  const frame = player.current!;
  return (
    <AlgoCanvas
      title="B-Tree Insertion (order t=2, max 3 keys/node)"
      player={player}
      input={
        <InputEditor
          label="Keys to insert (comma-separated, up to 14)"
          value={src}
          presets={[
            { label: "Classic", value: "10, 20, 5, 6, 12, 30, 7, 17" },
            { label: "Ascending", value: "1, 2, 3, 4, 5, 6, 7, 8" },
            { label: "Random", value: "50, 30, 20, 70, 40, 10, 60" },
          ]}
          onApply={(v) => { if (parseInts(v)) setSrc(v); }}
        />
      }
      pseudocode={<PseudocodePanel lines={PSEUDO_B} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} />}
    >
      <BTreeViz frame={frame} />
    </AlgoCanvas>
  );
}

/* ================================================================== */
/*  RED-BLACK TREE - insertion with rotations/recolor                 */
/* ================================================================== */

type RBColor = "R" | "B";
interface RBNode { id: string; key: number; color: RBColor; left?: string; right?: string; parent?: string }
interface RBFrame extends BaseFrame {
  nodes: Record<string, RBNode>;
  rootId?: string;
  activeId?: string;
}

const PSEUDO_RB = [
  "# Red-Black insert (nodes start RED)",
  "function insert(key):",
  "  standard BST insert, new node = RED",
  "  fixUp() while parent is RED:",
  "    Case 1: uncle RED → recolor parent, uncle BLACK",
  "    Case 2: zig-zag → rotate parent",
  "    Case 3: straight line → rotate grandparent + recolor",
  "  root.color = BLACK",
];

function cloneRB(n: Record<string, RBNode>): Record<string, RBNode> {
  const r: Record<string, RBNode> = {};
  for (const k in n) r[k] = { ...n[k] };
  return r;
}

function buildRBFrames(keys: number[]): RBFrame[] {
  const frames: RBFrame[] = [];
  const nodes: Record<string, RBNode> = {};
  let rootId: string | undefined;
  let counter = 0;
  const mkId = () => `r${counter++}`;

  function snap(msg: string, line: number, activeId?: string) {
    frames.push({ line, vars: { nodes: Object.keys(nodes).length, root: rootId ?? "-" }, message: msg, nodes: cloneRB(nodes), rootId, activeId });
  }

  function rotateLeft(xId: string) {
    const x = nodes[xId]; const yId = x.right!; const y = nodes[yId];
    x.right = y.left;
    if (y.left) nodes[y.left].parent = xId;
    y.parent = x.parent;
    if (!x.parent) rootId = yId;
    else {
      const p = nodes[x.parent];
      if (p.left === xId) p.left = yId; else p.right = yId;
    }
    y.left = xId; x.parent = yId;
  }
  function rotateRight(xId: string) {
    const x = nodes[xId]; const yId = x.left!; const y = nodes[yId];
    x.left = y.right;
    if (y.right) nodes[y.right].parent = xId;
    y.parent = x.parent;
    if (!x.parent) rootId = yId;
    else {
      const p = nodes[x.parent];
      if (p.left === xId) p.left = yId; else p.right = yId;
    }
    y.right = xId; x.parent = yId;
  }

  function fixUp(zId: string) {
    while (zId && nodes[zId].parent && nodes[nodes[zId].parent!].color === "R") {
      const pId = nodes[zId].parent!;
      const gId = nodes[pId].parent!;
      if (!gId) break;
      const g = nodes[gId];
      if (pId === g.left) {
        const uncleId = g.right;
        if (uncleId && nodes[uncleId].color === "R") {
          nodes[pId].color = "B"; nodes[uncleId].color = "B"; g.color = "R";
          snap(`Case 1: uncle red → recolor parent+uncle BLACK, grandparent RED.`, 4, gId);
          zId = gId;
        } else {
          if (zId === nodes[pId].right) { zId = pId; rotateLeft(zId); snap("Case 2: rotate left.", 5, zId); }
          nodes[nodes[zId].parent!].color = "B";
          nodes[nodes[nodes[zId].parent!].parent!].color = "R";
          rotateRight(nodes[nodes[zId].parent!].parent!);
          snap("Case 3: rotate right + recolor.", 6, zId);
        }
      } else {
        const uncleId = g.left;
        if (uncleId && nodes[uncleId].color === "R") {
          nodes[pId].color = "B"; nodes[uncleId].color = "B"; g.color = "R";
          snap(`Case 1 (mirror): recolor.`, 4, gId);
          zId = gId;
        } else {
          if (zId === nodes[pId].left) { zId = pId; rotateRight(zId); snap("Case 2 (mirror): rotate right.", 5, zId); }
          nodes[nodes[zId].parent!].color = "B";
          nodes[nodes[nodes[zId].parent!].parent!].color = "R";
          rotateLeft(nodes[nodes[zId].parent!].parent!);
          snap("Case 3 (mirror): rotate left + recolor.", 6, zId);
        }
      }
    }
    if (rootId) nodes[rootId].color = "B";
  }

  snap("Empty RB-Tree.", 0);
  for (const key of keys) {
    const id = mkId();
    nodes[id] = { id, key, color: "R" };
    if (!rootId) {
      rootId = id;
      nodes[id].color = "B";
      snap(`Insert ${key} - root, colored BLACK.`, 2, id);
      continue;
    }
    // BST insert
    let cur = rootId;
    while (true) {
      if (key < nodes[cur].key) {
        if (!nodes[cur].left) { nodes[cur].left = id; nodes[id].parent = cur; break; }
        cur = nodes[cur].left!;
      } else {
        if (!nodes[cur].right) { nodes[cur].right = id; nodes[id].parent = cur; break; }
        cur = nodes[cur].right!;
      }
    }
    snap(`Insert ${key} (RED) as child of ${nodes[nodes[id].parent!].key}.`, 2, id);
    fixUp(id);
    snap("Fix-up complete.", 7);
  }
  return frames;
}

function RBTreeViz({ frame }: { frame: RBFrame }) {
  // Compute x positions by in-order traversal
  const x: Record<string, number> = {}; const y: Record<string, number> = {};
  let c = 0;
  function walk(id: string | undefined, depth: number) {
    if (!id) return;
    walk(frame.nodes[id].left, depth + 1);
    x[id] = c++; y[id] = depth;
    walk(frame.nodes[id].right, depth + 1);
  }
  walk(frame.rootId, 0);
  const n = c;
  const W = 560, H = 280;
  const xScale = n > 1 ? (W - 60) / (n - 1) : 0;
  const maxD = Math.max(0, ...Object.values(y));
  const yScale = maxD > 0 ? (H - 60) / maxD : 0;
  const ids = Object.keys(frame.nodes);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", maxHeight: H }}>
      {ids.map((id) => {
        const node = frame.nodes[id];
        const X = 30 + x[id] * xScale, Y = 30 + y[id] * yScale;
        const children = [node.left, node.right].filter(Boolean) as string[];
        return children.map((cid) => (
          <line key={`${id}-${cid}`} x1={X} y1={Y} x2={30 + x[cid] * xScale} y2={30 + y[cid] * yScale} stroke="#94a3b8" strokeWidth={1.8} />
        ));
      })}
      {ids.map((id) => {
        const node = frame.nodes[id];
        const X = 30 + x[id] * xScale, Y = 30 + y[id] * yScale;
        const isActive = id === frame.activeId;
        return (
          <g key={id}>
            <circle cx={X} cy={Y} r={16} fill={node.color === "R" ? "#ef4444" : "#1f2937"} stroke={isActive ? "#3b82f6" : "#fff"} strokeWidth={isActive ? 4 : 2.5} style={{ transition: "fill 0.3s, stroke 0.2s" }} />
            <text x={X} y={Y + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff" fontFamily='"SF Mono", monospace'>{node.key}</text>
          </g>
        );
      })}
    </svg>
  );
}

function RBTreeVisualizer() {
  const [src, setSrc] = useState("10, 20, 30, 15, 25, 5, 35");
  const keys = parseInts(src, 12) ?? [10, 20, 30, 15, 25, 5, 35];
  const frames = useMemo(() => buildRBFrames(keys), [keys]);
  const player = useStepPlayer(frames);
  const frame = player.current!;
  return (
    <AlgoCanvas
      title="Red-Black Tree Insertion"
      player={player}
      input={
        <InputEditor
          label="Keys (comma-separated)"
          value={src}
          presets={[
            { label: "Classic", value: "10, 20, 30, 15, 25, 5, 35" },
            { label: "Ascending", value: "1, 2, 3, 4, 5, 6, 7" },
            { label: "Mixed", value: "7, 3, 18, 10, 22, 8, 11, 26" },
          ]}
          onApply={(v) => { if (parseInts(v, 12)) setSrc(v); }}
        />
      }
      pseudocode={<PseudocodePanel lines={PSEUDO_RB} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} />}
      legend={
        <div style={{ display: "flex", gap: 14 }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#ef4444", borderRadius: "50%", marginRight: 4 }} />RED</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#1f2937", borderRadius: "50%", marginRight: 4 }} />BLACK</span>
        </div>
      }
    >
      <RBTreeViz frame={frame} />
    </AlgoCanvas>
  );
}

/* ================================================================== */
/*  SKIP LIST                                                          */
/* ================================================================== */

interface SLFrame extends BaseFrame {
  layers: number[][];              // sorted arrays per layer; layer 0 = base (all keys)
  highlightedPath: { layer: number; idx: number }[];  // cells visited in search
  targetKey?: number;
  found?: boolean;
}

const PSEUDO_SL = [
  "# Skip List search(key)",
  "# start at top-left; descend or step right",
  "function search(key):",
  "  x ← top level, leftmost",
  "  while level ≥ 0:",
  "    while next(x).key ≤ key: x ← next(x)",
  "    if x.key = key: return x",
  "    descend one level",
  "  return NOT FOUND",
];

function buildSkipList(values: number[], maxL = 4): number[][] {
  // Deterministic: level 0 has all values; level L contains every 2^L-th element
  values.sort((a, b) => a - b);
  const layers: number[][] = [values.slice()];
  for (let L = 1; L < maxL; L++) {
    const stride = 1 << L;
    const arr: number[] = [];
    for (let i = 0; i < values.length; i += stride) arr.push(values[i]);
    if (arr.length === 0) break;
    layers.push(arr);
  }
  return layers.reverse(); // layers[0] = top, layers[last] = base
}

function buildSLFrames(values: number[], target: number): SLFrame[] {
  const layers = buildSkipList(values);
  const frames: SLFrame[] = [];
  frames.push({
    line: 2, vars: { target, layers: layers.length },
    message: `Start at top-level, leftmost.`,
    layers, highlightedPath: [{ layer: 0, idx: 0 }], targetKey: target,
  });
  let curLayer = 0, curIdx = 0;
  const path: { layer: number; idx: number }[] = [{ layer: 0, idx: 0 }];

  while (curLayer < layers.length) {
    // step right as far as possible
    while (curIdx + 1 < layers[curLayer].length && layers[curLayer][curIdx + 1] <= target) {
      curIdx++;
      path.push({ layer: curLayer, idx: curIdx });
      frames.push({
        line: 4, vars: { layer: curLayer, at: layers[curLayer][curIdx] },
        message: `Step right on layer ${curLayer} → ${layers[curLayer][curIdx]} (express lane).`,
        layers, highlightedPath: [...path], targetKey: target,
      });
    }
    if (layers[curLayer][curIdx] === target) {
      frames.push({
        line: 5, vars: { target, found: "yes" },
        message: `Found ${target} at layer ${curLayer}.`,
        layers, highlightedPath: [...path], targetKey: target, found: true,
      });
      return frames;
    }
    if (curLayer + 1 < layers.length) {
      // descend: find index in layer below whose value equals current
      const below = layers[curLayer + 1];
      let newIdx = 0;
      for (let i = 0; i < below.length; i++) if (below[i] === layers[curLayer][curIdx]) { newIdx = i; break; }
      curLayer++;
      curIdx = newIdx;
      path.push({ layer: curLayer, idx: curIdx });
      frames.push({
        line: 6, vars: { layer: curLayer, at: layers[curLayer][curIdx] },
        message: `Descend to layer ${curLayer}.`,
        layers, highlightedPath: [...path], targetKey: target,
      });
    } else {
      frames.push({
        line: 7, vars: { target, found: "no" },
        message: `Not found.`,
        layers, highlightedPath: [...path], targetKey: target, found: false,
      });
      return frames;
    }
  }
  return frames;
}

function SkipListViz({ frame }: { frame: SLFrame }) {
  const cell = 40;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {frame.layers.map((lv, li) => (
        <div key={li} style={{ display: "flex", gap: 0, alignItems: "center" }}>
          <span style={{
            width: 56, fontSize: "0.72rem", fontWeight: 700,
            color: "var(--eng-text-muted)", textTransform: "uppercase",
          }}>
            L{frame.layers.length - 1 - li}
          </span>
          <div style={{ display: "flex", gap: 2 }}>
            {lv.map((v, i) => {
              const visited = frame.highlightedPath.some((p) => p.layer === li && p.idx === i);
              const isFinal = frame.found && frame.targetKey === v && li === frame.highlightedPath[frame.highlightedPath.length - 1].layer;
              return (
                <div key={i} style={{
                  width: cell, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: '"SF Mono", monospace', fontWeight: 700, fontSize: "0.8rem",
                  border: isFinal ? "2px solid var(--eng-success)" : visited ? "2px solid #3b82f6" : "1px solid var(--eng-border)",
                  background: isFinal ? "rgba(16,185,129,0.12)" : visited ? "rgba(59,130,246,0.1)" : "var(--eng-surface)",
                  borderRadius: 4, transition: "all 0.3s",
                  boxShadow: visited ? "0 0 0 2px rgba(59,130,246,0.15)" : "none",
                }}>
                  {v}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SkipListVisualizer() {
  const [src, setSrc] = useState("1,3,5,7,9,11,13,15 | 11");
  const parts = src.split(/\s*\|\s*/);
  const values = parts[0] ? parts[0].split(/[,\s]+/).map(Number).filter((x) => !Number.isNaN(x)) : [];
  const target = parts[1] ? Number(parts[1]) : 11;
  const frames = useMemo(() => buildSLFrames(values.length ? values : [1, 3, 5, 7, 9, 11, 13, 15], Number.isFinite(target) ? target : 11), [src]); // eslint-disable-line react-hooks/exhaustive-deps
  const player = useStepPlayer(frames);
  const frame = player.current!;
  return (
    <AlgoCanvas
      title="Skip List Search - Express Lanes"
      player={player}
      input={
        <InputEditor
          label="Sorted values | target"
          value={src}
          presets={[
            { label: "Find 11", value: "1,3,5,7,9,11,13,15 | 11" },
            { label: "Find 2", value: "2,4,6,8,10,12,14,16 | 2" },
            { label: "Not found", value: "1,3,5,7,9,11 | 8" },
          ]}
          onApply={(v) => setSrc(v)}
        />
      }
      pseudocode={<PseudocodePanel lines={PSEUDO_SL} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} />}
    >
      <SkipListViz frame={frame} />
    </AlgoCanvas>
  );
}

/* ================================================================== */
/*  BLOOM FILTER                                                       */
/* ================================================================== */

interface BloomFrame extends BaseFrame {
  bits: number[];
  highlightBits: number[];
  op: "insert" | "query";
  item: string;
  verdict?: "probably yes" | "definitely no" | "inserted";
}

const PSEUDO_BL = [
  "# Bloom Filter",
  "function insert(item):",
  "  for each hash h_k:",
  "    bits[h_k(item) % m] = 1",
  "function query(item):",
  "  for each hash h_k:",
  "    if bits[h_k(item) % m] = 0: return 'definitely NO'",
  "  return 'probably YES'",
];

function hashItem(s: string, seed: number, m: number): number {
  let h = seed;
  for (let i = 0; i < s.length; i++) h = (h * 131 + s.charCodeAt(i)) % m;
  return ((h % m) + m) % m;
}

function buildBloomFrames(ops: { kind: "insert" | "query"; item: string }[], m = 16, k = 3): BloomFrame[] {
  const seeds = [7, 19, 37];
  const bits = new Array(m).fill(0);
  const frames: BloomFrame[] = [];
  frames.push({
    line: 0, vars: { m, k, bitsSet: 0 },
    message: `Fresh filter with m=${m} bits, k=${k} hashes.`,
    bits: [...bits], highlightBits: [], op: "insert", item: "",
  });
  for (const op of ops) {
    const positions = seeds.slice(0, k).map((s) => hashItem(op.item, s, m));
    if (op.kind === "insert") {
      frames.push({
        line: 2, vars: { item: op.item, positions: positions.join(",") },
        message: `Insert "${op.item}" - hash to bit positions ${positions.join(", ")}.`,
        bits: [...bits], highlightBits: positions, op: "insert", item: op.item,
      });
      positions.forEach((p) => (bits[p] = 1));
      frames.push({
        line: 3, vars: { bitsSet: bits.filter(Boolean).length },
        message: `Set bits ${positions.join(", ")} to 1.`,
        bits: [...bits], highlightBits: positions, op: "insert", item: op.item, verdict: "inserted",
      });
    } else {
      frames.push({
        line: 5, vars: { item: op.item, positions: positions.join(",") },
        message: `Query "${op.item}" - check bit positions ${positions.join(", ")}.`,
        bits: [...bits], highlightBits: positions, op: "query", item: op.item,
      });
      const allOne = positions.every((p) => bits[p] === 1);
      frames.push({
        line: 7, vars: { verdict: allOne ? "probably YES" : "definitely NO" },
        message: allOne
          ? `All bits set → probably YES (could be false positive).`
          : `At least one bit is 0 → definitely NO.`,
        bits: [...bits], highlightBits: positions, op: "query", item: op.item,
        verdict: allOne ? "probably yes" : "definitely no",
      });
    }
  }
  return frames;
}

function BloomViz({ frame }: { frame: BloomFrame }) {
  const cell = 32;
  const verdictColor = frame.verdict === "definitely no" ? "var(--eng-danger)" : frame.verdict === "probably yes" ? "#f59e0b" : "var(--eng-success)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
      <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        {frame.bits.map((b, i) => {
          const hl = frame.highlightBits.includes(i);
          return (
            <div key={i} style={{
              width: cell, height: cell,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              fontFamily: '"SF Mono", monospace', fontWeight: 800, fontSize: "0.9rem",
              background: b ? (hl ? "var(--eng-primary)" : "#64748b") : (hl ? "rgba(245,158,11,0.2)" : "var(--eng-surface)"),
              color: b ? "#fff" : "var(--eng-text-muted)",
              border: hl ? "2px solid #f59e0b" : "1px solid var(--eng-border)",
              borderRadius: 4, transition: "all 0.3s",
            }}>
              <div>{b}</div>
              <div style={{ fontSize: "0.55rem", color: b ? "rgba(255,255,255,0.7)" : "var(--eng-text-muted)" }}>{i}</div>
            </div>
          );
        })}
      </div>
      {frame.item && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.82rem" }}>{frame.op} "<b>{frame.item}</b>"</span>
          {frame.verdict && (
            <span style={{
              fontSize: "0.82rem", fontWeight: 700,
              padding: "4px 12px", borderRadius: 6,
              background: `${verdictColor}1a`, color: verdictColor, border: `1px solid ${verdictColor}66`,
            }}>
              {frame.verdict}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function parseBloomOps(s: string): { kind: "insert" | "query"; item: string }[] | null {
  const toks = s.split(/[;\n]+/).map((t) => t.trim()).filter(Boolean);
  const ops: { kind: "insert" | "query"; item: string }[] = [];
  for (const t of toks) {
    const m = t.match(/^(insert|query)\s*\(?\s*([A-Za-z0-9_]+)\s*\)?$/i);
    if (!m) return null;
    ops.push({ kind: m[1].toLowerCase() as "insert" | "query", item: m[2] });
  }
  return ops;
}

function BloomVisualizer() {
  const [src, setSrc] = useState("insert(apple); insert(banana); insert(cherry); query(apple); query(grape)");
  const parsed = parseBloomOps(src);
  const ops = parsed ?? [];
  const frames = useMemo(() => buildBloomFrames(ops.length ? ops : [{ kind: "insert", item: "apple" }]), [ops]);
  const player = useStepPlayer(frames);
  const frame = player.current!;
  return (
    <AlgoCanvas
      title="Bloom Filter - Probabilistic Membership"
      player={player}
      input={
        <InputEditor
          label="Ops (semicolon-separated). insert(x) / query(x)"
          value={src}
          presets={[
            { label: "Classic", value: "insert(apple); insert(banana); insert(cherry); query(apple); query(grape)" },
            { label: "False positive?", value: "insert(cat); insert(dog); query(bat); query(cat)" },
            { label: "Empty filter", value: "query(apple); insert(apple); query(apple)" },
          ]}
          onApply={(v) => { if (parseBloomOps(v)) setSrc(v); }}
        />
      }
      pseudocode={<PseudocodePanel lines={PSEUDO_BL} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} />}
      legend={
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span><b>m=16 bits</b>, <b>k=3 hashes</b></span>
          <span><b style={{ color: "#10b981" }}>definitely NO</b> - any bit is 0</span>
          <span><b style={{ color: "#f59e0b" }}>probably YES</b> - all bits set (may be false positive)</span>
        </div>
      }
    >
      <BloomViz frame={frame} />
    </AlgoCanvas>
  );
}

/* ================================================================== */
/*  Visualize switcher                                                 */
/* ================================================================== */

function VisualizeTab() {
  const [which, setWhich] = useState<"btree" | "rb" | "skip" | "bloom">("btree");
  const opts: { k: typeof which; label: string }[] = [
    { k: "btree", label: "B-Tree" },
    { k: "rb", label: "Red-Black Tree" },
    { k: "skip", label: "Skip List" },
    { k: "bloom", label: "Bloom Filter" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {opts.map((o) => (
          <button key={o.k} onClick={() => setWhich(o.k)} className={which === o.k ? "btn-eng" : "btn-eng-outline"} style={{ fontSize: "0.78rem", padding: "5px 12px" }}>
            {o.label}
          </button>
        ))}
      </div>
      {which === "btree" && <BTreeVisualizer />}
      {which === "rb" && <RBTreeVisualizer />}
      {which === "skip" && <SkipListVisualizer />}
      {which === "bloom" && <BloomVisualizer />}
    </div>
  );
}

/* ================================================================== */
/*  Learn / Try / Insight                                              */
/* ================================================================== */

function LearnTab() {
  const sections = [
    { title: "B-Tree", body: "Generalized BST where each node holds up to 2t−1 keys and has up to 2t children. Shallow (O(log_t n) height) and disk-friendly - each node is one disk block. Heart of databases and filesystems (MySQL InnoDB, NTFS)." },
    { title: "Red-Black Tree", body: "A BST with a color bit per node and 5 invariants that keep height ≤ 2 log(n+1). Insert / delete take O(log n). Less aggressive balancing than AVL → fewer rotations. Used in Linux CFS scheduler, std::map, java.util.TreeMap." },
    { title: "Skip List", body: "Stacked sorted linked lists where each element is promoted to the next level with probability p. Search descends / steps right - O(log n) expected. Lock-free concurrent variants exist; used in Redis sorted sets." },
    { title: "Bloom Filter", body: "Bit array of m bits + k independent hash functions. insert(x) sets k bits; query(x) returns 'no' if any bit is 0, else 'probably yes'. No false negatives, tunable false positives. Used in Bigtable, Cassandra, Chrome's malicious URL cache." },
    { title: "When each wins", body: "B-Tree: huge datasets on disk. Red-Black: in-memory ordered map. Skip List: concurrent / simple code. Bloom Filter: membership screening before expensive lookups." },
    { title: "Bloom math", body: "With n insertions into m bits using k hashes, false positive probability ≈ (1 − e^(−kn/m))^k. Optimal k ≈ (m/n) · ln 2. Classic interview formula." },
  ];
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", margin: "0 0 6px" }}>Mental model</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Four specialized structures, four trade-offs: disk-friendly, self-balancing in memory, probabilistic lanes for speed, and a tiny bit-array for approximate membership. Pick the tool to match your constraint.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
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

function TryTab() {
  const problems = [
    { q: "A B-Tree of order t=3 (min deg) has how many keys max per node?", answer: "5" },
    { q: "Insert 1,2,3,4,5,6,7 into an empty red-black tree. What is the root key?", answer: "4" },
    { q: "In a skip list, expected search time?", answer: "O(log n)" },
    { q: "A Bloom filter returns 'probably yes' - is this a false positive possible? (yes/no)", answer: "yes" },
  ];
  const [guesses, setGuesses] = useState<string[]>(problems.map(() => ""));
  const [shown, setShown] = useState<boolean[]>(problems.map(() => false));
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>Short answers.</div>
      {problems.map((p, i) => (
        <div key={i} className="card-eng" style={{ padding: 14 }}>
          <div style={{ fontSize: "0.88rem", marginBottom: 8 }}>{p.q}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={guesses[i]}
              onChange={(e) => { const g = [...guesses]; g[i] = e.target.value; setGuesses(g); }}
              placeholder="your answer"
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--eng-border)", fontFamily: '"SF Mono", monospace', width: 200 }}
            />
            <button
              onClick={() => { const s = [...shown]; s[i] = true; setShown(s); }}
              className="btn-eng-outline"
              style={{ fontSize: "0.78rem", padding: "5px 12px" }}
            >Reveal</button>
            {shown[i] && (
              <span style={{
                fontSize: "0.82rem", fontWeight: 700,
                padding: "3px 10px", borderRadius: 6,
                background: "rgba(59,130,246,0.1)", color: "var(--eng-text)",
              }}>Answer: {p.answer}</span>
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
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>B-Tree vs BST - disk story</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          A BST storing 10⁹ keys has height ~30. That's 30 disk seeks per query. A B-Tree with t = 256 has height ~4 - one twentieth the I/O. When your bottleneck is disk (or network), fat nodes win.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Red-Black 5 invariants</h3>
        <ol style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>Every node is red or black.</li>
          <li>Root is black.</li>
          <li>All leaves (NIL) are black.</li>
          <li>Red node's children are black (no two reds adjacent).</li>
          <li>Every path from a node to descendant leaves contains the same number of black nodes.</li>
        </ol>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Bloom filter: no deletes!</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          You can't simply unset bits because multiple items may share them. Solution: Counting Bloom Filter (each cell is an integer counter). More memory, but delete() is O(k).
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Activity                                                           */
/* ================================================================== */

export default function DSA_L7_AdvancedDSActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];
  const quiz: EngQuizQuestion[] = [
    {
      question: "A B-Tree of minimum degree t has how many keys per internal node?",
      options: ["exactly t", "between t-1 and 2t-1", "between t+1 and 2t", "exactly 2t"],
      correctIndex: 1,
      explanation: "Each non-root B-Tree node has at least t-1 keys and at most 2t-1 keys.",
    },
    {
      question: "What is the maximum height of a Red-Black tree with n nodes?",
      options: ["log₂ n", "2 · log₂(n + 1)", "n / 2", "√n"],
      correctIndex: 1,
      explanation: "By the black-height invariant, height ≤ 2 · log(n+1). Slightly worse than AVL but still O(log n).",
    },
    {
      question: "A Bloom filter can return which kind of error?",
      options: ["False negatives only", "False positives only", "Both false positives and false negatives", "Neither"],
      correctIndex: 1,
      explanation: "If all k bits are set, membership is 'probably yes' (possible false positive). If any bit is 0, item is definitely not present - no false negatives.",
    },
    {
      question: "Expected time complexity for search in a randomized skip list with n elements:",
      options: ["O(1) worst case", "O(log n) expected", "O(√n)", "O(n)"],
      correctIndex: 1,
      explanation: "With geometric promotion probability p=1/2, skip lists achieve O(log n) expected search, insert, and delete.",
    },
  ];
  return (
    <EngineeringLessonShell
      title="Advanced Data Structures - B-Tree, RB-Tree, Skip List, Bloom Filter"
      level={7}
      lessonNumber={6}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="Medium - databases, filesystems, caches, distributed systems"
      nextLessonHint="Level 8 - Problem-Solving Patterns"
    />
  );
}
