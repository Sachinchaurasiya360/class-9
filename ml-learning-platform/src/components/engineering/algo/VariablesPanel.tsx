"use client";

interface Props {
  vars: Record<string, string | number | boolean | undefined>;
  title?: string;
  flashKeys?: string[];
  groups?: Record<string, string[]>;
}

export function VariablesPanel({ vars, title = "State", flashKeys = [] }: Props) {
  const entries = Object.entries(vars);
  return (
    <div style={{ fontFamily: "var(--eng-font)" }}>
      <div style={{
        fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)",
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {entries.length === 0 && (
          <div style={{ fontSize: "0.75rem", color: "var(--eng-text-muted)", fontStyle: "italic" }}>-</div>
        )}
        {entries.map(([k, v]) => {
          const flash = flashKeys.includes(k);
          return (
            <div key={k} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
              padding: "6px 10px", borderRadius: 6,
              background: flash ? "rgba(59,130,246,0.14)" : "var(--eng-surface)",
              border: flash ? "1px solid var(--eng-primary)" : "1px solid var(--eng-border)",
              transition: "all 0.25s",
            }}>
              <span style={{ fontSize: "0.75rem", color: "var(--eng-text-muted)", fontWeight: 500 }}>{k}</span>
              <span style={{
                fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                fontSize: "0.82rem", color: "var(--eng-text)", fontWeight: 700,
                maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{v === undefined || v === null ? "-" : String(v)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
