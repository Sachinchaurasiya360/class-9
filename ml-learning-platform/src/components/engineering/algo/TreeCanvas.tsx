"use client";

import type { TreeNodeData, CellState } from "./types";
import { STATE_COLOR } from "./ArrayBars";

interface Props {
  nodes: Record<string, TreeNodeData>;
  root?: string;
  width?: number;
  height?: number;
  nodeRadius?: number;
  edgeStates?: Record<string, CellState>;
}

interface Placed { node: TreeNodeData; x: number; y: number; }

function layoutTree(
  nodes: Record<string, TreeNodeData>,
  rootId: string | undefined,
  width: number,
  height: number,
): { placed: Record<string, Placed>; depth: number } {
  if (!rootId || !nodes[rootId]) return { placed: {}, depth: 0 };

  const placed: Record<string, Placed> = {};
  let maxDepth = 0;

  function getDepth(id: string, d: number): void {
    maxDepth = Math.max(maxDepth, d);
    const n = nodes[id];
    if (!n) return;
    if (n.left) getDepth(n.left, d + 1);
    if (n.right) getDepth(n.right, d + 1);
  }
  getDepth(rootId, 0);

  let counter = 0;
  function assignX(id: string, d: number): void {
    const n = nodes[id];
    if (!n) return;
    if (n.left) assignX(n.left, d + 1);
    const y = 40 + (maxDepth === 0 ? 0 : (d * (height - 80)) / Math.max(1, maxDepth));
    placed[id] = { node: n, x: counter++, y };
    if (n.right) assignX(n.right, d + 1);
  }
  assignX(rootId, 0);

  const total = counter;
  const xStep = total > 1 ? (width - 60) / (total - 1) : 0;
  Object.values(placed).forEach((p) => {
    p.x = 30 + p.x * xStep;
  });

  return { placed, depth: maxDepth };
}

export function TreeCanvas({
  nodes, root, width = 680, height = 340, nodeRadius = 22, edgeStates = {},
}: Props) {
  const { placed } = layoutTree(nodes, root, width, height);

  const edges: { from: string; to: string; key: string }[] = [];
  Object.values(nodes).forEach((n) => {
    if (n.left && nodes[n.left]) edges.push({ from: n.id, to: n.left, key: `${n.id}-${n.left}` });
    if (n.right && nodes[n.right]) edges.push({ from: n.id, to: n.right, key: `${n.id}-${n.right}` });
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", maxHeight: height, fontFamily: "var(--eng-font)" }}>
      {edges.map(({ from, to, key }) => {
        const a = placed[from], b = placed[to];
        if (!a || !b) return null;
        const st = edgeStates[key];
        const col = st ? STATE_COLOR[st] : "#cbd5e1";
        return (
          <line key={key}
            x1={a.x} y1={a.y + nodeRadius} x2={b.x} y2={b.y - nodeRadius}
            stroke={col} strokeWidth={st ? 3 : 1.8}
            style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
          />
        );
      })}
      {Object.values(placed).map(({ node, x, y }) => {
        const col = node.state ? STATE_COLOR[node.state] : "#3b82f6";
        return (
          <g key={node.id} style={{ transition: "transform 0.35s ease" }}>
            <circle cx={x} cy={y} r={nodeRadius}
              fill={col}
              stroke="#fff" strokeWidth={3}
              style={{ transition: "fill 0.3s, stroke 0.3s" }}
            />
            <text x={x} y={y + 4} textAnchor="middle"
              fontSize={14} fontWeight={700} fill="#fff"
              fontFamily='"SF Mono", Menlo, Consolas, monospace'
            >
              {node.value}
            </text>
            {node.meta && Object.entries(node.meta).map(([k, v], i) => (
              <text key={k} x={x} y={y + nodeRadius + 14 + i * 12} textAnchor="middle"
                fontSize={10} fill="var(--eng-text-muted)" fontWeight={600}
              >
                {k}={v}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
