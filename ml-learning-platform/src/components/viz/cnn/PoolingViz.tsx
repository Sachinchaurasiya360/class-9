"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import ImageGrid from "./ImageGrid";
import type { Pixels2D, PoolingType } from "./types";
import {
  avgPool2d,
  maxPool2d,
  maxPoolArgmax,
  minMax,
} from "./imageUtils";

export interface PoolingVizProps {
  /** Input 2D grid (typically a feature map). */
  input?: Pixels2D;
  /** Window edge length. */
  poolSize?: number;
  /** Stride between pooling windows. Defaults to `poolSize`. */
  stride?: number;
  /** `max` or `avg` pooling. */
  type?: PoolingType;
  /** ms per animation step. */
  speedMs?: number;
  /** Title shown above the component. */
  title?: string;
}

const DEFAULT_INPUT: Pixels2D = [
  [1, 3, 2, 4, 5, 0, 6, 1],
  [4, 6, 1, 8, 3, 2, 7, 0],
  [2, 1, 9, 0, 4, 5, 1, 3],
  [0, 3, 5, 2, 6, 1, 8, 2],
  [7, 2, 0, 4, 9, 3, 2, 6],
  [1, 5, 3, 1, 0, 8, 4, 1],
  [2, 4, 6, 0, 3, 5, 7, 2],
  [3, 1, 2, 5, 1, 0, 4, 9],
];

/**
 * <PoolingViz /> - teaches max / avg pooling by sliding a window over the
 * input and showing which cell "won" (max) or the averaged value (avg).
 */
export default function PoolingViz({
  input = DEFAULT_INPUT,
  poolSize = 2,
  stride,
  type = "max",
  speedMs = 600,
  title,
}: PoolingVizProps) {
  const actualStride = stride ?? poolSize;
  const H = input.length;
  const W = H > 0 ? input[0].length : 0;

  const output = useMemo(
    () =>
      type === "max"
        ? maxPool2d(input, poolSize, actualStride)
        : avgPool2d(input, poolSize, actualStride),
    [input, poolSize, actualStride, type]
  );
  const outH = output.length;
  const outW = outH > 0 ? output[0].length : 0;

  const { min: inMin, max: inMax } = useMemo(() => minMax(input), [input]);

  const steps = useMemo(() => {
    const list: { y: number; x: number }[] = [];
    for (let y = 0; y < outH; y++) {
      for (let x = 0; x < outW; x++) list.push({ y, x });
    }
    return list;
  }, [outH, outW]);

  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [input, poolSize, actualStride, type]);

  const current = steps[Math.min(stepIdx, steps.length - 1)] ?? { y: 0, x: 0 };

  // For max pooling, find which input cell was selected.
  const argmax = useMemo(() => {
    if (type !== "max") return null;
    return maxPoolArgmax(input, current.y, current.x, poolSize, actualStride);
  }, [type, input, current.y, current.x, poolSize, actualStride]);

  const step = useCallback(() => {
    setStepIdx((i) => {
      const next = i + 1;
      if (next >= steps.length) {
        setPlaying(false);
        return steps.length - 1;
      }
      return next;
    });
  }, [steps.length]);

  const reset = useCallback(() => {
    setStepIdx(0);
    setPlaying(false);
  }, []);

  const playingRef = useRef(playing);
  playingRef.current = playing;
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => {
      if (playingRef.current) step();
    }, speedMs);
    return () => clearTimeout(t);
  }, [playing, stepIdx, steps.length, step, speedMs]);

  // Build a per-cell overlay on the input grid - we want to ghost every
  // pixel that has already been "consumed" by a prior window. Easy way:
  // mark the pixels the current window covers with a highlight plus the
  // single argmax (for max-pool).
  const currentOutputVal =
    output[current.y]?.[current.x] !== undefined
      ? output[current.y][current.x]
      : 0;

  return (
    <div className="card-sketchy p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-hand text-2xl">
          {title ?? `${type === "max" ? "Max" : "Average"} Pooling`}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-sketchy-outline"
            onClick={step}
            disabled={stepIdx >= steps.length - 1}
          >
            <StepForward size={16} /> Step
          </button>
          <button
            type="button"
            className="btn-sketchy"
            onClick={() => setPlaying((p) => !p)}
            disabled={stepIdx >= steps.length - 1 && !playing}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" className="btn-sketchy-outline" onClick={reset}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] items-center gap-4">
        <ImageGrid
          pixels={input}
          cellSize={30}
          showValues
          colormap="mint"
          label={`input (${H}×${W})`}
          valueRange={[inMin, inMax]}
          highlight={{
            y: current.y * actualStride,
            x: current.x * actualStride,
            size: poolSize,
          }}
          glow={argmax ? { y: argmax.y, x: argmax.x } : null}
        />

        <div className="flex flex-col items-center gap-2">
          <svg width="100" height="50" viewBox="0 0 100 50" className="block">
            <defs>
              <marker
                id="poolArrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0 0 L10 5 L0 10 z" fill="#2b2a35" />
              </marker>
            </defs>
            <path
              d="M 6 25 Q 50 5, 94 25"
              fill="none"
              stroke="#2b2a35"
              strokeWidth={2.5}
              strokeDasharray="5 4"
              markerEnd="url(#poolArrow)"
            />
            <text
              x="50"
              y="44"
              textAnchor="middle"
              fontFamily="Kalam, cursive"
              fontSize={12}
              fill="#2b2a35"
            >
              {type === "max" ? "take the max" : "average them"}
            </text>
          </svg>
          <div
            className="font-hand bg-background border-2 border-foreground rounded-lg p-2 text-center"
            style={{ minWidth: 110 }}
          >
            <div className="text-xs text-muted-foreground">output cell</div>
            <div
              className="text-lg font-bold"
              style={{ color: "var(--accent-coral)" }}
            >
              {fmt(currentOutputVal)}
            </div>
            <div className="text-xs text-muted-foreground">
              {stepIdx + 1} / {steps.length}
            </div>
          </div>
        </div>

        <ImageGrid
          pixels={output}
          cellSize={40}
          showValues
          colormap="coral"
          label={`output (${outH}×${outW})`}
          glow={{ y: current.y, x: current.x }}
        />
      </div>

      <p className="mt-3 font-hand text-sm text-muted-foreground">
        {type === "max"
          ? "max pooling keeps only the brightest pixel in each window - it preserves strong activations."
          : "average pooling replaces each window with the mean - it smooths the feature map."}
      </p>
    </div>
  );
}

function fmt(v: number): string {
  if (!isFinite(v)) return "-";
  if (Math.abs(v) >= 10) return v.toFixed(0);
  if (Math.abs(v) >= 1) return v.toFixed(1);
  return v.toFixed(2);
}
