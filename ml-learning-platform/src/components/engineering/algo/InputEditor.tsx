"use client";

import { useState } from "react";
import { RotateCcw, Shuffle } from "lucide-react";

interface Props {
  label: string;
  value: string;
  placeholder?: string;
  onApply: (v: string) => void;
  presets?: { label: string; value: string }[];
  onRandom?: () => void;
  width?: number;
  helper?: string;
}

export function InputEditor({ label, value, placeholder, onApply, presets, onRandom, width, helper }: Props) {
  const [draft, setDraft] = useState(value);

  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
        {presets && presets.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {presets.map((p) => (
              <button key={p.label}
                onClick={() => { setDraft(p.value); onApply(p.value); }}
                style={{
                  fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px",
                  borderRadius: 10, border: "1px solid var(--eng-border)",
                  background: "var(--eng-bg)", color: "var(--eng-text-muted)",
                  cursor: "pointer", fontFamily: "var(--eng-font)",
                  transition: "all 0.15s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onApply(draft); }}
          style={{
            flex: 1, width, minWidth: 180,
            padding: "7px 10px",
            borderRadius: 6,
            border: "1px solid var(--eng-border)",
            fontFamily: '"SF Mono", Menlo, Consolas, monospace',
            fontSize: "0.82rem",
            background: "var(--eng-surface)",
            color: "var(--eng-text)",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--eng-primary)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--eng-border)")}
        />
        <button
          onClick={() => onApply(draft)}
          className="btn-eng"
          style={{ fontSize: "0.78rem", padding: "6px 12px" }}
        >
          Apply
        </button>
        {onRandom && (
          <button onClick={onRandom} title="Random"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34, borderRadius: 6,
              border: "1px solid var(--eng-border)", background: "var(--eng-surface)",
              color: "var(--eng-text-muted)", cursor: "pointer",
            }}
          >
            <Shuffle className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => { setDraft(value); onApply(value); }} title="Revert"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34, borderRadius: 6,
            border: "1px solid var(--eng-border)", background: "var(--eng-surface)",
            color: "var(--eng-text-muted)", cursor: "pointer",
          }}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {helper && (
        <div style={{ fontSize: "0.7rem", color: "var(--eng-text-muted)" }}>{helper}</div>
      )}
    </div>
  );
}
