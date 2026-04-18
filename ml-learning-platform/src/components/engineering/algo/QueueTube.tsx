"use client";

interface Item { value: string | number; color?: string; label?: string; }
interface Props {
  items: Item[];
  title?: string;
  maxWidth?: number;
  frontLabel?: string;
  rearLabel?: string;
  emptyLabel?: string;
}

export function QueueTube({ items, title = "Queue", maxWidth = 520, frontLabel = "front", rearLabel = "rear", emptyLabel = "empty" }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "var(--eng-font)", gap: 8 }}>
      {title && (
        <div style={{
          fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)",
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {title}
        </div>
      )}
      <div style={{ position: "relative", width: maxWidth, maxWidth: "100%" }}>
        {/* Front/rear labels */}
        <div style={{
          display: "flex", justifyContent: "space-between", fontSize: "0.68rem",
          color: "var(--eng-text-muted)", fontWeight: 700, marginBottom: 4, padding: "0 4px",
        }}>
          <span>← {frontLabel}</span>
          <span>{rearLabel} ←</span>
        </div>
        <div style={{
          display: "flex", gap: 6, padding: 8,
          border: "2px solid var(--eng-border)",
          borderRadius: 12,
          minHeight: 60,
          background: "var(--eng-bg)",
          overflow: "hidden",
        }}>
          {items.length === 0 && (
            <div style={{
              color: "var(--eng-text-muted)", fontStyle: "italic",
              margin: "auto", fontSize: "0.75rem",
            }}>{emptyLabel}</div>
          )}
          {items.map((it, i) => (
            <div key={`${i}-${it.value}`} style={{
              padding: "9px 14px",
              borderRadius: 7,
              background: it.color || "var(--eng-primary)",
              color: "#fff",
              fontWeight: 700,
              fontFamily: '"SF Mono", Menlo, Consolas, monospace',
              fontSize: "0.88rem",
              boxShadow: i === 0 ? "0 0 0 2px rgba(59,130,246,0.4)" : "none",
              animation: "eng-fadeIn 0.25s ease",
              whiteSpace: "nowrap",
            }}>
              {it.label ? `${it.label}:${it.value}` : it.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
