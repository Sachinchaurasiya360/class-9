"use client";

interface Item { value: string | number; color?: string; label?: string; }
interface Props {
  items: Item[];
  title?: string;
  maxHeight?: number;
  width?: number;
  topLabel?: string;
  emptyLabel?: string;
}

export function StackColumn({ items, title = "Stack", maxHeight = 280, width = 130, topLabel = "top", emptyLabel = "empty" }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "var(--eng-font)", gap: 6 }}>
      {title && (
        <div style={{
          fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)",
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {title}
        </div>
      )}
      <div style={{
        width, minHeight: maxHeight,
        border: "2px solid var(--eng-border)",
        borderTop: "2px dashed var(--eng-border)",
        borderRadius: "0 0 12px 12px",
        display: "flex", flexDirection: "column-reverse",
        padding: 6, gap: 4,
        background: "var(--eng-bg)",
        position: "relative",
      }}>
        {items.length === 0 && (
          <div style={{
            color: "var(--eng-text-muted)", fontStyle: "italic", textAlign: "center",
            alignSelf: "center", fontSize: "0.75rem", paddingTop: maxHeight / 2 - 20,
          }}>{emptyLabel}</div>
        )}
        {items.map((it, i) => {
          const isTop = i === items.length - 1;
          return (
            <div key={i} style={{
              width: "100%", padding: "9px 10px",
              borderRadius: 6,
              background: it.color || (isTop ? "var(--eng-primary)" : "var(--eng-primary-light)"),
              color: it.color || isTop ? "#fff" : "var(--eng-primary)",
              fontWeight: 700, textAlign: "center",
              fontFamily: '"SF Mono", Menlo, Consolas, monospace',
              fontSize: "0.88rem",
              boxShadow: isTop ? "0 0 0 2px rgba(59,130,246,0.4)" : "none",
              animation: "eng-fadeIn 0.25s ease",
              position: "relative",
            }}>
              {it.label ? `${it.label}: ${it.value}` : it.value}
              {isTop && (
                <div style={{
                  position: "absolute", right: "100%", top: "50%", transform: "translateY(-50%)",
                  marginRight: 10, fontSize: "0.68rem", color: "var(--eng-primary)",
                  fontWeight: 700, whiteSpace: "nowrap",
                }}>
                  {topLabel} →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
