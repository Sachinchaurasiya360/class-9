"use client";

interface Props {
  lines: string[];
  activeLine?: number;
  title?: string;
  highlightLines?: number[];
}

export function PseudocodePanel({ lines, activeLine, title = "Pseudocode", highlightLines = [] }: Props) {
  return (
    <div style={{ fontFamily: "var(--eng-font)", minWidth: 0 }}>
      <div style={{
        fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)",
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: '"SF Mono", Menlo, Consolas, monospace',
        fontSize: "0.78rem", lineHeight: 1.65,
        background: "#0f172a", color: "#e2e8f0",
        borderRadius: 8, padding: "10px 0", overflow: "auto", maxHeight: 260,
      }}>
        {lines.map((ln, i) => {
          const active = i === activeLine;
          const hl = highlightLines.includes(i);
          const indent = (ln.match(/^ */)?.[0].length ?? 0);
          return (
            <div key={i} style={{
              display: "flex", gap: 10, padding: "1px 12px",
              background: active ? "rgba(59,130,246,0.28)" : hl ? "rgba(245,158,11,0.15)" : "transparent",
              borderLeft: active ? "3px solid #60a5fa" : "3px solid transparent",
              transition: "background 0.18s",
              whiteSpace: "pre",
            }}>
              <span style={{
                color: "#475569", width: 22, textAlign: "right", userSelect: "none",
                fontSize: "0.7rem", flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{ color: active ? "#f1f5f9" : "#cbd5e1" }}>
                {"  ".repeat(Math.floor(indent / 2))}{ln.trim()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
