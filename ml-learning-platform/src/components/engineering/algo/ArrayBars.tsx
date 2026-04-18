"use client";

import type { CellState } from "./types";

interface Props {
  values: number[];
  states?: (CellState | undefined)[];
  labels?: (string | undefined)[];
  pointers?: Record<string, number>;
  height?: number;
  min?: number;
  max?: number;
  showIndex?: boolean;
  windowRange?: [number, number];
}

export const STATE_COLOR: Record<CellState, string> = {
  default: "#cbd5e1",
  compare: "#f59e0b",
  swap: "#ef4444",
  active: "#3b82f6",
  done: "#10b981",
  pivot: "#fbbf24",
  window: "#8b5cf6",
  match: "#10b981",
  mismatch: "#ef4444",
  sorted: "#10b981",
  visited: "#64748b",
  frontier: "#06b6d4",
  path: "#fbbf24",
  low: "#3b82f6",
  high: "#ef4444",
  mid: "#fbbf24",
};

export function ArrayBars({
  values, states = [], labels = [], pointers = {}, height = 180,
  showIndex = true, min, max, windowRange,
}: Props) {
  const lo = min ?? Math.min(0, ...values);
  const hi = max ?? Math.max(1, ...values);
  const range = Math.max(1, hi - lo);
  const n = values.length;
  const barW = Math.min(48, Math.max(18, Math.floor(620 / Math.max(1, n))));
  const gap = 4;

  const ptrAt: Record<number, string[]> = {};
  Object.entries(pointers).forEach(([name, idx]) => {
    if (idx < 0 || idx >= n) return;
    (ptrAt[idx] ||= []).push(name);
  });

  const totalW = n * barW + (n - 1) * gap;
  const windowLeft = windowRange ? windowRange[0] * (barW + gap) : 0;
  const windowWidth = windowRange ? (windowRange[1] - windowRange[0] + 1) * (barW + gap) - gap : 0;

  return (
    <div style={{
      display: "flex", justifyContent: "center", padding: "8px 8px 30px",
      overflowX: "auto",
    }}>
      <div style={{ position: "relative", width: totalW, paddingTop: 30 }}>
        {/* Window overlay */}
        {windowRange && (
          <div style={{
            position: "absolute", top: 24, left: windowLeft,
            width: windowWidth, height: height + 4,
            border: "2.5px solid #8b5cf6",
            borderRadius: 8,
            background: "rgba(139,92,246,0.08)",
            transition: "left 0.3s ease, width 0.3s ease",
            pointerEvents: "none",
          }} />
        )}

        <div style={{ display: "flex", alignItems: "flex-end", gap, minHeight: height, position: "relative" }}>
          {values.map((v, i) => {
            const st = states[i] || "default";
            const color = STATE_COLOR[st];
            const h = Math.max(16, ((v - lo) / range) * height);
            const label = labels[i];
            const ptrs = ptrAt[i];
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: barW, position: "relative" }}>
                {/* pointer stack above */}
                <div style={{
                  position: "absolute", bottom: h + 4, left: 0, right: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2, pointerEvents: "none",
                }}>
                  {ptrs?.map((name) => (
                    <span key={name} style={{
                      fontSize: "0.62rem", fontWeight: 700, color: "#fff",
                      padding: "1px 6px", borderRadius: 4, background: "var(--eng-primary)",
                      fontFamily: "var(--eng-font)",
                      whiteSpace: "nowrap",
                    }}>
                      {name}
                    </span>
                  ))}
                  {ptrs && (
                    <div style={{
                      width: 0, height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "7px solid var(--eng-primary)",
                    }} />
                  )}
                </div>

                <div style={{
                  width: "100%", height: h,
                  background: color,
                  borderRadius: "4px 4px 0 0",
                  display: "flex", alignItems: "flex-start", justifyContent: "center",
                  transition: "height 0.32s ease, background 0.32s ease, box-shadow 0.32s ease",
                  color: "#fff", fontWeight: 700, fontSize: "0.72rem",
                  paddingTop: h > 28 ? 6 : 2,
                  fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                  boxShadow: st !== "default" ? `0 0 0 2px ${color}55` : "none",
                }}>
                  {v}
                </div>
                {showIndex && (
                  <div style={{
                    fontSize: "0.65rem", color: "var(--eng-text-muted)",
                    marginTop: 3, fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                  }}>
                    {label ?? i}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
