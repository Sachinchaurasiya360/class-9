"use client";

import type { CellState } from "./types";
import { STATE_COLOR } from "./ArrayBars";

interface Props {
  values: (string | number)[];
  states?: (CellState | undefined)[];
  pointers?: Record<string, number>;
  addressBase?: number;
  bytesPerCell?: number;
  showAddress?: boolean;
  cellWidth?: number;
  labels?: string[];
}

/**
 * Horizontal strip of memory cells - good for arrays, strings, hash tables.
 * Each cell shows value + index; optional computed address + pointer arrows.
 */
export function MemoryCells({
  values, states = [], pointers = {}, addressBase = 1000, bytesPerCell = 4,
  showAddress = false, cellWidth = 54, labels,
}: Props) {
  const ptrAt: Record<number, string[]> = {};
  Object.entries(pointers).forEach(([name, idx]) => {
    if (idx < 0 || idx >= values.length) return;
    (ptrAt[idx] ||= []).push(name);
  });

  return (
    <div style={{
      display: "flex", gap: 0, padding: "30px 8px 10px", justifyContent: "center",
      overflowX: "auto", flexWrap: "nowrap",
    }}>
      {values.map((v, i) => {
        const st = states[i] || "default";
        const color = STATE_COLOR[st];
        const ptrs = ptrAt[i];
        return (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            width: cellWidth, position: "relative", flexShrink: 0,
          }}>
            {/* Pointers */}
            <div style={{
              position: "absolute", top: -28, left: 0, right: 0,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
              pointerEvents: "none",
            }}>
              {ptrs?.map((name) => (
                <span key={name} style={{
                  fontSize: "0.62rem", fontWeight: 700, color: "#fff",
                  padding: "1px 6px", borderRadius: 4, background: "var(--eng-primary)",
                  fontFamily: "var(--eng-font)", whiteSpace: "nowrap",
                }}>{name}</span>
              ))}
              {ptrs && (
                <div style={{
                  width: 0, height: 0, borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent", borderTop: "6px solid var(--eng-primary)",
                }} />
              )}
            </div>
            <div style={{
              width: cellWidth, height: 46,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: st === "default" ? "var(--eng-surface)" : color,
              color: st === "default" ? "var(--eng-text)" : "#fff",
              fontWeight: 700, fontSize: "0.9rem",
              fontFamily: '"SF Mono", Menlo, Consolas, monospace',
              border: `2px solid ${st === "default" ? "var(--eng-border)" : color}`,
              borderRight: i < values.length - 1 ? `1px solid ${st === "default" ? "var(--eng-border)" : color}` : undefined,
              transition: "background 0.3s, border-color 0.3s, color 0.3s",
              boxShadow: st !== "default" ? `0 0 0 2px ${color}33` : "none",
            }}>
              {v}
            </div>
            <div style={{
              fontSize: "0.66rem", color: "var(--eng-text-muted)", marginTop: 4, fontWeight: 600,
              fontFamily: '"SF Mono", Menlo, Consolas, monospace',
            }}>
              {labels?.[i] ?? `[${i}]`}
            </div>
            {showAddress && (
              <div style={{
                fontSize: "0.6rem", color: "var(--eng-text-muted)", marginTop: 2,
                fontFamily: '"SF Mono", Menlo, Consolas, monospace',
              }}>
                0x{(addressBase + i * bytesPerCell).toString(16).toUpperCase()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
