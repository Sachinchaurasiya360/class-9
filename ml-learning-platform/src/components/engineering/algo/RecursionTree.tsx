"use client";

import type { RecursionNode } from "./types";
import { STATE_COLOR } from "./ArrayBars";

interface Props {
  nodes: RecursionNode[];
  activeId?: string;
  width?: number;
  height?: number;
}

interface Placed { node: RecursionNode; x: number; y: number; }

export function RecursionTree({ nodes, activeId, width = 680, height = 360 }: Props) {
  // Layout: group by depth, spread horizontally
  const byDepth = new Map<number, RecursionNode[]>();
  nodes.forEach((n) => {
    if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
    byDepth.get(n.depth)!.push(n);
  });

  const maxDepth = Math.max(0, ...Array.from(byDepth.keys()));
  const placed: Record<string, Placed> = {};
  byDepth.forEach((group, depth) => {
    const y = 40 + (maxDepth === 0 ? 0 : (depth * (height - 80)) / Math.max(1, maxDepth));
    const step = group.length > 1 ? (width - 80) / (group.length - 1) : 0;
    group.forEach((n, i) => {
      placed[n.id] = { node: n, x: 40 + i * step, y };
    });
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", fontFamily: "var(--eng-font)" }}>
      {nodes.map((n) => {
        if (!n.parent) return null;
        const a = placed[n.parent], b = placed[n.id];
        if (!a || !b) return null;
        const active = n.state === "active" || n.id === activeId;
        const col = active ? "#3b82f6" : n.state ? STATE_COLOR[n.state] : "#cbd5e1";
        return (
          <line key={n.id} x1={a.x} y1={a.y + 20} x2={b.x} y2={b.y - 20}
            stroke={col} strokeWidth={active ? 2.5 : 1.5}
            style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
          />
        );
      })}
      {Object.values(placed).map(({ node, x, y }) => {
        const isActive = node.id === activeId;
        const col = isActive ? "#3b82f6" : node.state ? STATE_COLOR[node.state] : "#94a3b8";
        const hasReturn = node.returnValue !== undefined;
        return (
          <g key={node.id}>
            <rect x={x - 44} y={y - 18} width={88} height={36} rx={8}
              fill="#fff" stroke={col} strokeWidth={isActive ? 3 : 2}
              style={{ transition: "stroke 0.3s, stroke-width 0.3s" }} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={col}
              fontFamily='"SF Mono", Menlo, Consolas, monospace'>
              {node.label}
            </text>
            {hasReturn && (
              <g>
                <rect x={x - 20} y={y + 18} width={40} height={16} rx={4} fill="#10b981" />
                <text x={x} y={y + 30} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff"
                  fontFamily='"SF Mono", Menlo, Consolas, monospace'>
                  → {node.returnValue}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
