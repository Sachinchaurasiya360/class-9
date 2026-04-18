"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import type { FilterKernel } from "./types";
import {
  PRESET_FILTERS,
  cloneKernel,
  getColormap,
  makeKernel,
  normalizeValue,
} from "./imageUtils";

export interface KernelEditorProps {
  /** Controlled kernel value. */
  kernel?: FilterKernel;
  /** Called with a fresh kernel whenever the user edits a cell. */
  onChange?: (kernel: FilterKernel) => void;
  /** Edge length (3 or 5 are reasonable). Ignored if `kernel` is controlled. */
  size?: 3 | 5;
  /** Minimum cell value. */
  minValue?: number;
  /** Maximum cell value. */
  maxValue?: number;
  /** Step per click-drag. */
  step?: number;
  /** Title above the editor. */
  title?: string;
  /** Optional list of preset names to expose quick-load buttons for. */
  presets?: string[];
}

/**
 * <KernelEditor /> - an editable NxN filter. Click a cell to bump it up by
 * `step`; shift-click (or right-click) to bump it down. A small set of
 * preset buttons let students jump to classic kernels. Great paired with
 * <ConvolutionViz /> so students "build their own filter and see the effect".
 */
export default function KernelEditor({
  kernel: propKernel,
  onChange,
  size = 3,
  minValue = -2,
  maxValue = 2,
  step = 1,
  title = "Build a Filter",
  presets = ["identity", "edge-vertical", "edge-horizontal", "blur", "sharpen"],
}: KernelEditorProps) {
  const [internal, setInternal] = useState<FilterKernel>(() =>
    propKernel ? cloneKernel(propKernel) : makeKernel(size, 0)
  );

  // When a controlled kernel prop arrives, sync it into internal state so
  // the visual stays in sync with external changes (e.g. preset clicks).
  const propRef = useRef(propKernel);
  useEffect(() => {
    if (propKernel && propKernel !== propRef.current) {
      setInternal(cloneKernel(propKernel));
      propRef.current = propKernel;
    }
  }, [propKernel]);

  const current = internal;
  const kH = current.length;
  const kW = kH > 0 ? current[0].length : 0;

  const cmap = useMemo(() => getColormap("viridis"), []);
  const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue), 1);

  const emit = useCallback(
    (next: FilterKernel) => {
      setInternal(next);
      onChange?.(next);
    },
    [onChange]
  );

  const clamp = useCallback(
    (v: number) => {
      if (v < minValue) return minValue;
      if (v > maxValue) return maxValue;
      return v;
    },
    [minValue, maxValue]
  );

  const bump = useCallback(
    (y: number, x: number, dir: 1 | -1) => {
      const next = cloneKernel(current);
      next[y][x] = clamp(next[y][x] + dir * step);
      emit(next);
    },
    [current, clamp, step, emit]
  );

  const reset = useCallback(() => {
    emit(makeKernel(kH || size, 0));
  }, [emit, kH, size]);

  const loadPreset = useCallback(
    (name: string) => {
      const k = PRESET_FILTERS[name];
      if (!k) return;
      emit(cloneKernel(k));
    },
    [emit]
  );

  // Pointer-drag painting: while the mouse is held, dragging onto a new cell
  // bumps it. This makes building a shape feel natural.
  const draggingRef = useRef<{ active: boolean; dir: 1 | -1 } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ y: number; x: number } | null>(
    null
  );

  const onCellPointerDown = (e: React.PointerEvent<SVGRectElement>, y: number, x: number) => {
    e.preventDefault();
    const dir: 1 | -1 = e.shiftKey || e.button === 2 ? -1 : 1;
    draggingRef.current = { active: true, dir };
    bump(y, x, dir);
  };
  const onCellPointerEnter = (y: number, x: number) => {
    setHoverCell({ y, x });
    if (draggingRef.current?.active) {
      bump(y, x, draggingRef.current.dir);
    }
  };
  const onCellPointerUp = () => {
    draggingRef.current = null;
  };

  // Stop dragging if the pointer leaves the SVG entirely.
  useEffect(() => {
    const onUp = () => {
      draggingRef.current = null;
    };
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, []);

  const cellSize = 52;
  const pad = 10;
  const svgW = kW * cellSize + pad * 2;
  const svgH = kH * cellSize + pad * 2;

  return (
    <div className="card-sketchy p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-hand text-xl">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-sketchy-outline"
            onClick={reset}
            title="Clear all cells to 0"
          >
            <Trash2 size={16} /> Clear
          </button>
          <button
            type="button"
            className="btn-sketchy-outline"
            onClick={() => loadPreset("identity")}
            title="Reset to identity kernel"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-4 items-start">
        <div>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            width={svgW}
            style={{ maxWidth: svgW, touchAction: "none" }}
            className="block select-none"
            onContextMenu={(e) => e.preventDefault()}
            onPointerUp={onCellPointerUp}
          >
            <rect
              x={pad - 2}
              y={pad - 2}
              width={kW * cellSize + 4}
              height={kH * cellSize + 4}
              rx={6}
              fill="#fdfbf6"
              stroke="#2b2a35"
              strokeWidth={2.5}
            />
            {current.map((row, y) =>
              row.map((v, x) => {
                const t = normalizeValue(v, -absMax, absMax);
                const fill = cmap(t);
                const cx = pad + x * cellSize;
                const cy = pad + y * cellSize;
                const isHover =
                  hoverCell !== null && hoverCell.y === y && hoverCell.x === x;
                return (
                  <g key={`ke-${y}-${x}`}>
                    <rect
                      x={cx}
                      y={cy}
                      width={cellSize}
                      height={cellSize}
                      rx={4}
                      fill={fill}
                      stroke="#2b2a35"
                      strokeWidth={isHover ? 3 : 2}
                      style={{ cursor: "pointer" }}
                      onPointerDown={(e) => onCellPointerDown(e, y, x)}
                      onPointerEnter={() => onCellPointerEnter(y, x)}
                      onPointerLeave={() => {
                        if (
                          hoverCell !== null &&
                          hoverCell.y === y &&
                          hoverCell.x === x
                        ) {
                          setHoverCell(null);
                        }
                      }}
                    />
                    <text
                      x={cx + cellSize / 2}
                      y={cy + cellSize / 2 + 6}
                      textAnchor="middle"
                      fontFamily="Kalam, cursive"
                      fontSize={18}
                      fill={t > 0.55 ? "#fdfbf6" : "#2b2a35"}
                      pointerEvents="none"
                    >
                      {fmtKernel(v)}
                    </text>
                  </g>
                );
              })
            )}
          </svg>
          <div className="text-xs font-hand text-muted-foreground mt-1">
            click to increase, shift-click to decrease. drag to paint.
          </div>
        </div>

        <div className="space-y-3">
          <div className="font-hand text-sm">presets</div>
          <div className="flex flex-wrap gap-2">
            {presets.map((name) => (
              <button
                key={`preset-${name}`}
                type="button"
                className="btn-sketchy-outline"
                style={{ padding: "0.4rem 0.7rem" }}
                onClick={() => loadPreset(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="p-2 border-2 border-dashed border-foreground/40 rounded-lg font-hand text-sm">
            <div className="text-xs text-muted-foreground">
              current sum of absolute values
            </div>
            <div className="text-lg">{sumAbs(current).toFixed(2)}</div>
          </div>
          <p className="font-hand text-xs text-muted-foreground">
            tip: positive numbers in the kernel look for bright pixels;
            negative numbers look for dark pixels. A vertical edge detector is
            +1 on one side and -1 on the other.
          </p>
        </div>
      </div>
    </div>
  );
}

function fmtKernel(v: number): string {
  if (v === 0) return "0";
  if (Math.abs(v) >= 10) return v.toFixed(0);
  if (Math.abs(v) >= 1) return v.toFixed(1).replace(/\.0$/, "");
  return v.toFixed(2);
}

function sumAbs(k: FilterKernel): number {
  let s = 0;
  for (const row of k) for (const v of row) s += Math.abs(v);
  return s;
}
