"use client";

import { useMemo } from "react";
import type { ColormapName, Pixels2D } from "./types";
import {
  DEMO_IMAGES,
  getColormap,
  minMax,
  normalizeValue,
  textColorForValue,
} from "./imageUtils";

export interface ImageGridProps {
  /** Row-major 2D array. Values can be 0-255 or 0-1 - we auto-normalize. */
  pixels?: Pixels2D;
  /** Logical width of the whole SVG in px. */
  width?: number;
  /** Logical height of the whole SVG in px. */
  height?: number;
  /** Per-cell size in px. If set, overrides width/height. */
  cellSize?: number;
  /** Overlay numeric values on each cell. */
  showValues?: boolean;
  /** Force a specific range instead of auto-normalizing. */
  valueRange?: [number, number];
  /** Colormap used to render pixel values. */
  colormap?: ColormapName;
  /** Optional title rendered above the grid in handwriting font. */
  label?: string;
  /** Optional highlight window { y, x, size } - draws a coral box. */
  highlight?: { y: number; x: number; size: number } | null;
  /** Optional coordinate to glow (e.g. current conv output cell). */
  glow?: { y: number; x: number } | null;
  /** Render each cell with a small round-corner notebook feel. */
  rounded?: boolean;
  className?: string;
}

/**
 * <ImageGrid /> - the teaching workhorse. Renders a 2D array of pixel values
 * as a grid of colored squares using pure SVG. Supports numeric overlays,
 * colormap toggle, and optional highlight/glow markers used by ConvolutionViz.
 */
export default function ImageGrid({
  pixels = DEMO_IMAGES.smiley,
  width,
  height,
  cellSize,
  showValues = false,
  valueRange,
  colormap = "gray",
  label,
  highlight = null,
  glow = null,
  rounded = true,
  className,
}: ImageGridProps) {
  const H = pixels.length;
  const W = H > 0 ? pixels[0].length : 0;

  const { min, max } = useMemo(() => {
    if (valueRange) return { min: valueRange[0], max: valueRange[1] };
    return minMax(pixels);
  }, [pixels, valueRange]);

  const cmap = useMemo(() => getColormap(colormap), [colormap]);

  // Choose a cell size. Priority: explicit prop > derived from width > 28.
  const cell = useMemo(() => {
    if (cellSize) return cellSize;
    if (width) return Math.floor(width / Math.max(W, 1));
    if (height) return Math.floor(height / Math.max(H, 1));
    return 28;
  }, [cellSize, width, height, W, H]);

  const pad = 6;
  const svgW = W * cell + pad * 2;
  const svgH = H * cell + pad * 2;

  // Stroke width scaled to cell size so grids look consistent.
  const strokePx = Math.max(1, Math.round(cell * 0.06));
  const fontSize = Math.max(8, Math.round(cell * 0.42));

  return (
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
        {/* backing card */}
        <rect
          x={pad - 2}
          y={pad - 2}
          width={W * cell + 4}
          height={H * cell + 4}
          rx={rounded ? 6 : 0}
          fill="#fdfbf6"
          stroke="#2b2a35"
          strokeWidth={2}
        />

        {/* cells */}
        {pixels.map((row, y) =>
          row.map((v, x) => {
            const t = normalizeValue(v, min, max);
            const fill = cmap(t);
            const cx = pad + x * cell;
            const cy = pad + y * cell;
            return (
              <g key={`c-${y}-${x}`}>
                <rect
                  x={cx}
                  y={cy}
                  width={cell}
                  height={cell}
                  rx={rounded ? 3 : 0}
                  fill={fill}
                  stroke="#2b2a35"
                  strokeWidth={strokePx}
                />
                {showValues ? (
                  <text
                    x={cx + cell / 2}
                    y={cy + cell / 2 + fontSize * 0.32}
                    textAnchor="middle"
                    fontFamily="Kalam, cursive"
                    fontSize={fontSize}
                    fill={textColorForValue(t)}
                  >
                    {formatPixel(v)}
                  </text>
                ) : null}
              </g>
            );
          })
        )}

        {/* highlight window (a coral rectangle) */}
        {highlight && highlight.size > 0 ? (
          <rect
            x={pad + highlight.x * cell - 2}
            y={pad + highlight.y * cell - 2}
            width={highlight.size * cell + 4}
            height={highlight.size * cell + 4}
            fill="none"
            stroke="var(--accent-coral)"
            strokeWidth={3}
            strokeDasharray="4 3"
            rx={4}
          />
        ) : null}

        {/* single-cell glow marker */}
        {glow ? (
          <rect
            x={pad + glow.x * cell - 1}
            y={pad + glow.y * cell - 1}
            width={cell + 2}
            height={cell + 2}
            fill="none"
            stroke="var(--accent-yellow)"
            strokeWidth={3}
            rx={4}
          />
        ) : null}
      </svg>
    </div>
  );
}

// A small helper to keep numeric overlays legible.
function formatPixel(v: number): string {
  if (Math.abs(v) >= 10) return v.toFixed(0);
  if (Math.abs(v) >= 1) return v.toFixed(1);
  return v.toFixed(2).replace(/^0/, "");
}
