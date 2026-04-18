"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, ChevronRight } from "lucide-react";
import { clamp, fmt } from "./utils";

export interface LossLandscapeProps {
  /** Loss as a function of two parameters. Defaults to (x-1)^2 + (y+0.5)^2. */
  lossFn?: (x: number, y: number) => number;
  learningRate?: number;
  startPoint?: [number, number];
  range?: [number, number];
  width?: number;
  height?: number;
}

const defaultLoss = (x: number, y: number) =>
  (x - 1) * (x - 1) + (y + 0.5) * (y + 0.5);

/** Loss surface contour plot with interactive gradient descent. */
export function LossLandscape({
  lossFn = defaultLoss,
  learningRate = 0.15,
  startPoint = [-2.5, 2],
  range = [-3.5, 3.5],
  width = 420,
  height = 420,
}: LossLandscapeProps) {
  const [lo, hi] = range;
  const pad = 32;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const toPxX = (x: number) => pad + ((x - lo) / (hi - lo)) * innerW;
  const toPxY = (y: number) => pad + (1 - (y - lo) / (hi - lo)) * innerH;

  const [pos, setPos] = useState<[number, number]>(startPoint);
  const [trail, setTrail] = useState<[number, number][]>([startPoint]);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastStepRef = useRef<number>(0);

  // Sample the loss over a grid to find min/max for contouring.
  const { minL, maxL, grid } = useMemo(() => {
    const GX = 48;
    const GY = 48;
    const g: number[][] = [];
    let mn = Infinity;
    let mx = -Infinity;
    for (let j = 0; j < GY; j++) {
      const row: number[] = [];
      const yv = lo + ((GY - 1 - j) / (GY - 1)) * (hi - lo);
      for (let i = 0; i < GX; i++) {
        const xv = lo + (i / (GX - 1)) * (hi - lo);
        const v = lossFn(xv, yv);
        row.push(v);
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
      g.push(row);
    }
    return { grid: g, minL: mn, maxL: mx };
  }, [lossFn, lo, hi]);

  // Build contour rings as concentric ellipses centered on an estimated minimum.
  // This is a simple approximation - for an arbitrary `lossFn` we sample level sets
  // by drawing smooth curves through the grid at fixed level values.
  const contours = useMemo(() => {
    const levels: number[] = [];
    const N = 7;
    for (let k = 1; k <= N; k++) {
      levels.push(minL + ((k / (N + 1)) * (maxL - minL)) ** 1.4);
    }
    // For each level, emit a polyline by walking an (theta) sweep from the grid's
    // approximate minimum. We take the minimum cell position as the "center".
    let cx = 0;
    let cy = 0;
    let best = Infinity;
    const GY = grid.length;
    const GX = grid[0]?.length ?? 0;
    for (let j = 0; j < GY; j++) {
      for (let i = 0; i < GX; i++) {
        if (grid[j][i] < best) {
          best = grid[j][i];
          cx = lo + (i / (GX - 1)) * (hi - lo);
          cy = lo + ((GY - 1 - j) / (GY - 1)) * (hi - lo);
        }
      }
    }
    // For each level build a ring of points by casting rays outward from (cx, cy).
    const rings: { level: number; pts: { x: number; y: number }[] }[] = [];
    const RAYS = 72;
    for (const level of levels) {
      const pts: { x: number; y: number }[] = [];
      for (let r = 0; r < RAYS; r++) {
        const theta = (r / RAYS) * Math.PI * 2;
        const dx = Math.cos(theta);
        const dy = Math.sin(theta);
        // binary search for radius where loss ≈ level
        let lor = 0;
        let hir = Math.max(hi - lo, 8);
        for (let step = 0; step < 22; step++) {
          const mid = (lor + hir) / 2;
          const x = cx + dx * mid;
          const y = cy + dy * mid;
          const L = lossFn(x, y);
          if (L < level) lor = mid;
          else hir = mid;
        }
        const x = cx + dx * lor;
        const y = cy + dy * lor;
        pts.push({ x, y });
      }
      rings.push({ level, pts });
    }
    return rings;
  }, [grid, lossFn, lo, hi, minL, maxL]);

  const numGrad = useCallback(
    (x: number, y: number): [number, number] => {
      const h = 1e-3;
      const fx = (lossFn(x + h, y) - lossFn(x - h, y)) / (2 * h);
      const fy = (lossFn(x, y + h) - lossFn(x, y - h)) / (2 * h);
      return [fx, fy];
    },
    [lossFn],
  );

  const doStep = useCallback(() => {
    setPos(([px, py]) => {
      const [gx, gy] = numGrad(px, py);
      const nx = clamp(px - learningRate * gx, lo - 1, hi + 1);
      const ny = clamp(py - learningRate * gy, lo - 1, hi + 1);
      const next: [number, number] = [nx, ny];
      setTrail((t) => (t.length > 500 ? t : [...t, next]));
      return next;
    });
  }, [numGrad, learningRate, lo, hi]);

  useEffect(() => {
    if (!playing) return;
    let running = true;
    const tick = (ts: number) => {
      if (!running) return;
      if (ts - lastStepRef.current > 220) {
        lastStepRef.current = ts;
        doStep();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, doStep]);

  function reset() {
    setPos(startPoint);
    setTrail([startPoint]);
    setPlaying(false);
  }

  const currentLoss = lossFn(pos[0], pos[1]);

  return (
    <div className="w-full max-w-[520px]">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="Loss landscape with gradient descent"
      >
        {/* plot bg */}
        <rect
          x={pad}
          y={pad}
          width={innerW}
          height={innerH}
          fill="#fff"
          stroke="#2b2a35"
          strokeWidth={2}
          rx={12}
        />

        {/* contour rings */}
        {contours.map((ring, idx) => {
          const t = idx / Math.max(1, contours.length - 1);
          const opacity = 0.18 + t * 0.42;
          const d =
            ring.pts
              .map(
                (p, i) =>
                  `${i === 0 ? "M" : "L"} ${toPxX(p.x)} ${toPxY(p.y)}`,
              )
              .join(" ") + " Z";
          return (
            <path
              key={`ring-${idx}`}
              d={d}
              fill="var(--accent-sky)"
              fillOpacity={opacity * 0.25}
              stroke="var(--accent-lav)"
              strokeOpacity={opacity}
              strokeWidth={1.4}
              strokeDasharray="3 2"
            />
          );
        })}

        {/* trail */}
        {trail.length > 1 ? (
          <polyline
            points={trail.map((p) => `${toPxX(p[0])},${toPxY(p[1])}`).join(" ")}
            fill="none"
            stroke="var(--accent-coral)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5 3"
          />
        ) : null}
        {trail.map((p, i) => (
          <circle
            key={`dot-${i}`}
            cx={toPxX(p[0])}
            cy={toPxY(p[1])}
            r={3.2}
            fill="var(--accent-coral)"
            stroke="#2b2a35"
            strokeWidth={1}
          />
        ))}

        {/* current position */}
        <circle
          cx={toPxX(pos[0])}
          cy={toPxY(pos[1])}
          r={8}
          fill="var(--accent-yellow)"
          stroke="#2b2a35"
          strokeWidth={2.5}
        />

        {/* info pill */}
        <g transform={`translate(${pad + 10}, ${pad + 10})`}>
          <rect
            x={0}
            y={0}
            width={180}
            height={44}
            rx={8}
            fill="#fdfbf6"
            stroke="#2b2a35"
            strokeWidth={1.5}
          />
          <text x={8} y={17} className="font-hand" fontSize={13} fill="#2b2a35">
            pos: ({fmt(pos[0])}, {fmt(pos[1])})
          </text>
          <text x={8} y={34} className="font-hand" fontSize={13} fill="#2b2a35">
            loss: {fmt(currentLoss, 3)}
          </text>
        </g>
      </svg>

      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <button
          type="button"
          className="btn-sketchy"
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          className="btn-sketchy-outline"
          onClick={doStep}
          disabled={playing}
        >
          <ChevronRight size={16} /> Step
        </button>
        <button type="button" className="btn-sketchy-outline" onClick={reset}>
          <RotateCcw size={16} /> Reset
        </button>
        <span className="font-hand text-[14px] text-muted-foreground ml-auto">
          lr = {fmt(learningRate, 3)} · step {trail.length - 1}
        </span>
      </div>
    </div>
  );
}

export default LossLandscape;
