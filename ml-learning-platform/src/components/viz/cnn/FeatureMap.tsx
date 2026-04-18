"use client";

import { useMemo } from "react";
import type { ColormapName, Pixels2D } from "./types";
import {
  getColormap,
  minMax,
  normalizeValue,
  textColorForValue,
} from "./imageUtils";

export interface FeatureMapProps {
  /** The 2D activation values. */
  values?: Pixels2D;
  /** Optional (y, x) to highlight - used to indicate "what fired". */
  highlight?: { y: number; x: number } | null;
  /** Optional label shown above the map in handwriting font. */
  label?: string;
  /** Colormap name. Defaults to coral (CNN activations vibe). */
  colormap?: ColormapName;
  /** Cell edge in px. */
  cellSize?: number;
  /** Show numeric value inside each cell. */
  showValues?: boolean;
  /** Optional note shown under the map. */
  note?: string;
  /** Wrap in a card-sketchy container? */
  withCard?: boolean;
  className?: string;
}

const DEFAULT_VALUES: Pixels2D = [
  [0.1, 0.2, 0.1, 0.0, 0.0, 0.1],
  [0.2, 0.9, 0.8, 0.1, 0.1, 0.2],
  [0.1, 0.8, 1.0, 0.9, 0.3, 0.0],
  [0.0, 0.2, 0.9, 1.0, 0.8, 0.1],
  [0.1, 0.0, 0.3, 0.9, 0.7, 0.2],
  [0.2, 0.1, 0.0, 0.2, 0.2, 0.1],
];

/**
 * <FeatureMap /> - a read-only activation map display. Similar to ImageGrid
 * but styled for "post-conv output" displays: slightly chunkier cells, a
 * bold border, and a coral default colormap.
 */
export default function FeatureMap({
  values = DEFAULT_VALUES,
  highlight = null,
  label,
  colormap = "coral",
  cellSize = 30,
  showValues = false,
  note,
  withCard = true,
  className,
}: FeatureMapProps) {
  const H = values.length;
  const W = H > 0 ? values[0].length : 0;

  const { min, max } = useMemo(() => minMax(values), [values]);
  const cmap = useMemo(() => getColormap(colormap), [colormap]);

  const pad = 10;
  const svgW = W * cellSize + pad * 2;
  const svgH = H * cellSize + pad * 2;
  const fontSize = Math.max(8, Math.round(cellSize * 0.38));

  const body = (
    <div className={className}>
      {label ? (
        <div className="font-hand text-lg text-foreground mb-1">{label}</div>
      ) : null}
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        style={{ maxWidth: svgW }}
        className="block"
      >
        {/* Chunky backing card */}
        <rect
          x={pad - 4}
          y={pad - 4}
          width={W * cellSize + 8}
          height={H * cellSize + 8}
          rx={8}
          fill="#fff"
          stroke="#2b2a35"
          strokeWidth={3}
        />
        <rect
          x={pad - 4}
          y={pad - 4}
          width={W * cellSize + 8}
          height={H * cellSize + 8}
          rx={8}
          fill="none"
          stroke="#2b2a35"
          strokeWidth={1}
          strokeDasharray="3 3"
          transform="translate(3, 3)"
          opacity={0.4}
        />

        {values.map((row, y) =>
          row.map((v, x) => {
            const t = normalizeValue(v, min, max);
            const fill = cmap(t);
            const cx = pad + x * cellSize;
            const cy = pad + y * cellSize;
            const isHi = highlight && highlight.y === y && highlight.x === x;
            return (
              <g key={`fm-${y}-${x}`}>
                <rect
                  x={cx}
                  y={cy}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={fill}
                  stroke="#2b2a35"
                  strokeWidth={1.5}
                />
                {showValues ? (
                  <text
                    x={cx + cellSize / 2}
                    y={cy + cellSize / 2 + fontSize * 0.33}
                    textAnchor="middle"
                    fontFamily="Kalam, cursive"
                    fontSize={fontSize}
                    fill={textColorForValue(t)}
                  >
                    {fmt(v)}
                  </text>
                ) : null}
                {isHi ? (
                  <rect
                    x={cx - 1}
                    y={cy - 1}
                    width={cellSize + 2}
                    height={cellSize + 2}
                    fill="none"
                    stroke="var(--accent-yellow)"
                    strokeWidth={3}
                    rx={3}
                  />
                ) : null}
              </g>
            );
          })
        )}
      </svg>
      {note ? (
        <div className="font-hand text-sm text-muted-foreground mt-1">{note}</div>
      ) : null}
    </div>
  );

  if (!withCard) return body;
  return <div className="card-sketchy p-3 md:p-4 inline-block">{body}</div>;
}

function fmt(v: number): string {
  if (!isFinite(v)) return "-";
  if (Math.abs(v) >= 10) return v.toFixed(0);
  if (Math.abs(v) >= 1) return v.toFixed(1);
  return v.toFixed(2);
}
