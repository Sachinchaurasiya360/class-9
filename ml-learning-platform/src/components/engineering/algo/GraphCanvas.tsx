"use client";

import type { GraphNodeData, GraphEdgeData } from "./types";
import { STATE_COLOR } from "./ArrayBars";

interface Props {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  width?: number;
  height?: number;
  nodeRadius?: number;
  showWeights?: boolean;
}

export function GraphCanvas({
  nodes, edges, width = 680, height = 360, nodeRadius = 20, showWeights = true,
}: Props) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", maxHeight: height, fontFamily: "var(--eng-font)" }}>
      <defs>
        <marker id="eng-arrow" viewBox="0 -5 10 10" refX={nodeRadius + 8} refY={0}
          markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0,-5L10,0L0,5" fill="#64748b" />
        </marker>
        <marker id="eng-arrow-active" viewBox="0 -5 10 10" refX={nodeRadius + 8} refY={0}
          markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0,-5L10,0L0,5" fill="#3b82f6" />
        </marker>
      </defs>

      {edges.map((e, i) => {
        const a = byId[e.from], b = byId[e.to];
        if (!a || !b) return null;
        const st = e.state;
        const col = st ? STATE_COLOR[st] : "#94a3b8";
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={col} strokeWidth={st ? 3 : 1.8}
              markerEnd={e.directed ? (st === "active" || st === "path" ? "url(#eng-arrow-active)" : "url(#eng-arrow)") : undefined}
              style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
            />
            {showWeights && e.weight !== undefined && (
              <g>
                <circle cx={midX} cy={midY} r={10} fill="#fff" stroke={col} strokeWidth={1.5} />
                <text x={midX} y={midY + 3} textAnchor="middle" fontSize={10} fontWeight={700} fill={col}>
                  {e.weight}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {nodes.map((n) => {
        const col = n.state ? STATE_COLOR[n.state] : "#3b82f6";
        return (
          <g key={n.id} style={{ transition: "transform 0.35s ease" }}>
            <circle cx={n.x} cy={n.y} r={nodeRadius} fill={col} stroke="#fff" strokeWidth={3}
              style={{ transition: "fill 0.3s" }} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff"
              fontFamily='"SF Mono", Menlo, Consolas, monospace'>
              {n.label ?? n.id}
            </text>
            {n.meta && Object.entries(n.meta).map(([k, v], i) => (
              <text key={k} x={n.x} y={n.y + nodeRadius + 14 + i * 12} textAnchor="middle"
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
