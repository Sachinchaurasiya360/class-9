"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, ChevronRight } from "lucide-react";
import {
  activate,
  fmt,
  forwardPass,
  makeRandomWeights,
  neuronPosition,
  sketchyPath,
  weightColor,
  weightStroke,
  type ActivationName,
} from "./utils";

export interface ForwardPassAnimationProps {
  architecture: number[];
  inputs: number[];
  weights?: number[][][];
  activations?: ActivationName[];
  width?: number;
  height?: number;
}

/** Step-by-step forward propagation viz. */
export function ForwardPassAnimation({
  architecture,
  inputs,
  weights,
  activations,
  width = 680,
  height = 380,
}: ForwardPassAnimationProps) {
  const layers = architecture.length > 0 ? architecture : [1];

  const effectiveWeights = useMemo(() => {
    if (weights && weights.length === layers.length - 1) return weights;
    return makeRandomWeights(layers, 23);
  }, [weights, layers]);

  const safeInputs = useMemo(() => {
    const arr = Array.from({ length: layers[0] }, (_, i) => inputs[i] ?? 0);
    return arr;
  }, [inputs, layers]);

  const allActs = useMemo(
    () => forwardPass(safeInputs, effectiveWeights, activations),
    [safeInputs, effectiveWeights, activations],
  );

  // `stage` = how many layers have been computed; 0 means only inputs are shown.
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setStage(0);
  }, [safeInputs, effectiveWeights]);

  const maxStage = layers.length - 1;

  const nextStage = useCallback(() => {
    setStage((s) => Math.min(maxStage, s + 1));
  }, [maxStage]);

  useEffect(() => {
    if (!playing) return;
    if (stage >= maxStage) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      nextStage();
    }, 900);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [playing, stage, maxStage, nextStage]);

  const layerCount = layers.length;

  return (
    <div className="w-full max-w-[760px]">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="Forward pass animation"
      >
        {/* connections - only drawn into already-computed layers */}
        {effectiveWeights.map((layerW, li) => {
          const isActive = li < stage;
          const isCurrent = li === stage;
          return layerW.map((row, j) =>
            row.map((w, i) => {
              const a = neuronPosition(li, i, layerCount, layers[li], width, height);
              const b = neuronPosition(
                li + 1,
                j,
                layerCount,
                layers[li + 1],
                width,
                height,
              );
              const path = sketchyPath(a.x, a.y, b.x, b.y, li * 50 + j * 7 + i);
              const visible = isActive || isCurrent;
              const opacity = isActive ? 0.9 : isCurrent ? 0.6 : 0.12;
              return (
                <path
                  key={`cx-${li}-${j}-${i}`}
                  d={path}
                  fill="none"
                  stroke={weightColor(w)}
                  strokeWidth={weightStroke(w)}
                  strokeLinecap="round"
                  strokeOpacity={opacity}
                  strokeDasharray={visible ? "6 4" : "3 3"}
                  style={
                    isCurrent
                      ? {
                          animation: `signal-flow 1s linear infinite`,
                        }
                      : undefined
                  }
                />
              );
            }),
          );
        })}

        {/* neurons */}
        {layers.map((count, li) =>
          Array.from({ length: count }, (_, ni) => {
            const { x, y } = neuronPosition(
              li,
              ni,
              layerCount,
              count,
              width,
              height,
            );
            const computed = li <= stage;
            const fill =
              li === 0
                ? "var(--accent-sky)"
                : li === layerCount - 1
                  ? "var(--accent-mint)"
                  : "var(--accent-yellow)";
            const v = allActs[li]?.[ni];
            return (
              <g key={`n-${li}-${ni}`} opacity={computed ? 1 : 0.35}>
                <circle
                  cx={x}
                  cy={y}
                  r={20}
                  fill={fill}
                  stroke="#2b2a35"
                  strokeWidth={2.5}
                />
                {computed && v != null ? (
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className="font-hand"
                    fontSize={12}
                    fontWeight={700}
                    fill="#2b2a35"
                  >
                    {fmt(v)}
                  </text>
                ) : (
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className="font-hand"
                    fontSize={12}
                    fill="#6b6776"
                  >
                    ?
                  </text>
                )}
              </g>
            );
          }),
        )}

        {/* layer labels */}
        {layers.map((_, li) => {
          const { x } = neuronPosition(li, 0, layerCount, layers[li], width, height);
          const label =
            li === 0
              ? "input"
              : li === layerCount - 1
                ? "output"
                : `hidden ${li}`;
          const isCurrent = li === stage;
          return (
            <g key={`lbl-${li}`}>
              {isCurrent ? (
                <rect
                  x={x - 44}
                  y={height - 28}
                  width={88}
                  height={22}
                  rx={6}
                  fill="var(--accent-yellow)"
                  stroke="#2b2a35"
                  strokeWidth={1.5}
                />
              ) : null}
              <text
                x={x}
                y={height - 12}
                textAnchor="middle"
                className="font-hand"
                fontSize={13}
                fill="#2b2a35"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <button
          type="button"
          className="btn-sketchy"
          onClick={() => {
            if (stage >= maxStage) {
              setStage(0);
              setPlaying(true);
            } else {
              setPlaying((p) => !p);
            }
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? "Pause" : stage >= maxStage ? "Replay" : "Play"}
        </button>
        <button
          type="button"
          className="btn-sketchy-outline"
          onClick={nextStage}
          disabled={stage >= maxStage || playing}
        >
          <ChevronRight size={16} /> Next Layer
        </button>
        <button
          type="button"
          className="btn-sketchy-outline"
          onClick={() => {
            setStage(0);
            setPlaying(false);
          }}
        >
          <RotateCcw size={16} /> Reset
        </button>
        <span className="font-hand text-[14px] text-muted-foreground ml-auto">
          layer {stage} / {maxStage}
        </span>
      </div>
    </div>
  );
}

export default ForwardPassAnimation;
