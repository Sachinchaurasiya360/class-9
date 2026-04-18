"use client";

import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import type { StepPlayer } from "./useStepPlayer";

interface Props<F> {
  title?: string;
  player: StepPlayer<F>;
  children: ReactNode;
  pseudocode?: ReactNode;
  variables?: ReactNode;
  input?: ReactNode;
  status?: string;
  legend?: ReactNode;
}

export function AlgoCanvas<F extends { message?: string }>({
  title, player, children, pseudocode, variables, input, status, legend,
}: Props<F>) {
  const { index, frames, isPlaying, speed, play, pause, reset, step, seek, setSpeed } = player;
  const total = frames.length;
  const msg = status ?? player.current?.message;

  return (
    <div
      className="card-eng"
      style={{ padding: 0, overflow: "hidden", fontFamily: "var(--eng-font)" }}
    >
      {/* Title bar */}
      {(title || msg) && (
        <div style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--eng-border)",
          background: "var(--eng-bg)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          {title && <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)" }}>{title}</span>}
          <span style={{ fontSize: "0.8rem", color: "var(--eng-text-muted)", flex: 1, textAlign: "center" }}>
            {msg}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--eng-text-muted)", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
            Step {index + 1} / {total}
          </span>
        </div>
      )}

      {/* Input row */}
      {input && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--eng-border)", background: "var(--eng-surface)" }}>
          {input}
        </div>
      )}

      {/* Viz area */}
      <div style={{ padding: 20, background: "#fff", minHeight: 240 }}>
        {children}
      </div>

      {/* Legend */}
      {legend && (
        <div style={{ padding: "6px 16px", borderTop: "1px solid var(--eng-border)", background: "var(--eng-bg)", fontSize: "0.72rem", color: "var(--eng-text-muted)" }}>
          {legend}
        </div>
      )}

      {/* Pseudocode + Variables */}
      {(pseudocode || variables) && (
        <div style={{
          display: "grid",
          gridTemplateColumns: pseudocode && variables ? "minmax(0, 1fr) 260px" : "1fr",
          borderTop: "1px solid var(--eng-border)",
          background: "var(--eng-bg)",
        }}>
          {pseudocode && (
            <div style={{ padding: 14, borderRight: variables ? "1px solid var(--eng-border)" : "none", minWidth: 0 }}>
              {pseudocode}
            </div>
          )}
          {variables && <div style={{ padding: 14 }}>{variables}</div>}
        </div>
      )}

      {/* Controls */}
      <div style={{
        padding: "10px 16px", borderTop: "1px solid var(--eng-border)",
        background: "var(--eng-surface)",
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      }}>
        <CtrlBtn onClick={reset} title="Reset"><RotateCcw className="w-4 h-4" /></CtrlBtn>
        <CtrlBtn onClick={() => step(-1)} disabled={index === 0} title="Previous step"><SkipBack className="w-4 h-4" /></CtrlBtn>
        {isPlaying ? (
          <CtrlBtn primary onClick={pause} title="Pause"><Pause className="w-4 h-4" /></CtrlBtn>
        ) : (
          <CtrlBtn primary onClick={play} title="Play"><Play className="w-4 h-4" /></CtrlBtn>
        )}
        <CtrlBtn onClick={() => step(1)} disabled={index >= total - 1} title="Next step"><SkipForward className="w-4 h-4" /></CtrlBtn>

        <input
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          value={index}
          onChange={(e) => seek(Number(e.target.value))}
          style={{ flex: 1, minWidth: 120, accentColor: "var(--eng-primary)" }}
        />

        <div style={{ display: "flex", gap: 4 }}>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                padding: "4px 9px", fontSize: "0.72rem", fontWeight: 700,
                borderRadius: 6, border: "1px solid var(--eng-border)",
                background: speed === s ? "var(--eng-primary)" : "var(--eng-surface)",
                color: speed === s ? "#fff" : "var(--eng-text-muted)",
                cursor: "pointer", fontFamily: "var(--eng-font)",
                transition: "all 0.15s",
              }}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CtrlBtn({ onClick, disabled, primary, title, children }: {
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 8,
        border: primary ? "1px solid var(--eng-primary)" : "1px solid var(--eng-border)",
        background: primary ? "var(--eng-primary)" : "var(--eng-surface)",
        color: primary ? "#fff" : "var(--eng-text)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}
