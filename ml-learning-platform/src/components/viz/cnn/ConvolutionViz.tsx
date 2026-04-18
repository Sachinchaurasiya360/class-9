"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import ImageGrid from "./ImageGrid";
import type { FilterKernel, Pixels2D } from "./types";
import {
  DEFAULT_DEMO_IMAGE,
  PRESET_FILTERS,
  convolve2d,
  minMax,
  normalizeValue,
} from "./imageUtils";

export interface ConvolutionVizProps {
  /** Input image (2D pixel values). Defaults to a demo "letter X". */
  image?: Pixels2D;
  /** Filter kernel to slide over the image. */
  filter?: FilterKernel;
  /** How many pixels the filter advances per step. */
  stride?: number;
  /** Zero-padding around the input. */
  padding?: number;
  /** Start showing a specific (outY, outX) step. */
  showStep?: { y: number; x: number };
  /** Called every time the current step changes. */
  onStepChange?: (step: { y: number; x: number; output: number }) => void;
  /** Milliseconds per auto-play step. */
  speedMs?: number;
  /** Optional title above the viz. */
  title?: string;
}

/**
 * <ConvolutionViz /> - the hero CNN teaching component. Shows an input image
 * with the current filter window highlighted, produces a live feature map on
 * the right, and offers Play / Step / Reset controls to scrub through every
 * position of the filter.
 */
export default function ConvolutionViz({
  image = DEFAULT_DEMO_IMAGE,
  filter = PRESET_FILTERS["edge-vertical"],
  stride = 1,
  padding = 0,
  showStep,
  onStepChange,
  speedMs = 550,
  title = "Convolution",
}: ConvolutionVizProps) {
  const H = image.length;
  const W = H > 0 ? image[0].length : 0;
  const kH = filter.length;
  const kW = kH > 0 ? filter[0].length : 0;

  // Full feature map (pre-computed once per image/filter change).
  const featureMap = useMemo(
    () => convolve2d(image, filter, stride, padding),
    [image, filter, stride, padding]
  );
  const outH = featureMap.length;
  const outW = outH > 0 ? featureMap[0].length : 0;

  const { min: fmMin, max: fmMax } = useMemo(() => minMax(featureMap), [featureMap]);

  // Flat list of every valid window position - iterate once.
  const steps = useMemo(() => {
    const list: { y: number; x: number }[] = [];
    for (let y = 0; y < outH; y++) {
      for (let x = 0; x < outW; x++) list.push({ y, x });
    }
    return list;
  }, [outH, outW]);

  const initialIdx = useMemo(() => {
    if (!showStep) return 0;
    const idx = steps.findIndex(
      (s) => s.y === showStep.y && s.x === showStep.x
    );
    return idx >= 0 ? idx : 0;
  }, [showStep, steps]);

  const [stepIdx, setStepIdx] = useState(initialIdx);
  const [playing, setPlaying] = useState(false);

  // Reset stepIdx when the image or filter changes.
  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [image, filter, stride, padding]);

  const current = steps[Math.min(stepIdx, steps.length - 1)] ?? { y: 0, x: 0 };
  const currentOutput =
    featureMap[current.y]?.[current.x] !== undefined
      ? featureMap[current.y][current.x]
      : 0;

  // Fire the callback whenever the step changes.
  useEffect(() => {
    onStepChange?.({ y: current.y, x: current.x, output: currentOutput });
  }, [current.y, current.x, currentOutput, onStepChange]);

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

  // Auto-play loop
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

  // Compute the "window" of pixels currently under the filter for the
  // side panel that shows the element-wise multiplication.
  const windowCells = useMemo(() => {
    const cells: { px: number; k: number; prod: number }[] = [];
    for (let ky = 0; ky < kH; ky++) {
      for (let kx = 0; kx < kW; kx++) {
        const iy = current.y * stride + ky - padding;
        const ix = current.x * stride + kx - padding;
        let px = 0;
        if (iy >= 0 && iy < H && ix >= 0 && ix < W) px = image[iy][ix];
        const k = filter[ky][kx];
        cells.push({ px, k, prod: px * k });
      }
    }
    return cells;
  }, [current, filter, image, stride, padding, kH, kW, H, W]);

  const outputNormalized = normalizeValue(currentOutput, fmMin, fmMax);

  return (
    <div className="card-sketchy p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-hand text-2xl">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-sketchy-outline"
            onClick={step}
            disabled={stepIdx >= steps.length - 1}
          >
            <StepForward size={16} />
            Step
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
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div>
          <ImageGrid
            pixels={image}
            cellSize={28}
            colormap="gray"
            label="input image"
            highlight={{
              y: current.y * stride - padding,
              x: current.x * stride - padding,
              size: kH,
            }}
          />
        </div>

        {/* Middle panel: dotted arrow + window breakdown */}
        <div className="flex flex-col items-center gap-2">
          <svg width="120" height="50" viewBox="0 0 120 50" className="block">
            <defs>
              <marker
                id="arrowHead"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerUnits="strokeWidth"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2b2a35" />
              </marker>
            </defs>
            <path
              d="M 8 25 Q 60 5, 110 25"
              fill="none"
              stroke="#2b2a35"
              strokeWidth={2.5}
              strokeDasharray="5 4"
              markerEnd="url(#arrowHead)"
            />
            <text
              x="60"
              y="44"
              textAnchor="middle"
              fontFamily="Kalam, cursive"
              fontSize="13"
              fill="#2b2a35"
            >
              multiply &amp; sum
            </text>
          </svg>

          <div
            className="font-hand text-sm bg-background border-2 border-foreground rounded-lg p-2 w-full text-center"
            style={{ minWidth: 110 }}
          >
            <div className="text-xs text-muted-foreground">step</div>
            <div className="text-lg">
              {stepIdx + 1} / {steps.length}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">output</div>
            <div
              className="text-lg"
              style={{ color: "var(--accent-coral)" }}
            >
              {fmt(currentOutput)}
            </div>
          </div>
        </div>

        <div>
          <ImageGrid
            pixels={featureMap}
            cellSize={28}
            colormap="coral"
            label="feature map"
            glow={{ y: current.y, x: current.x }}
            valueRange={[fmMin, fmMax]}
          />
        </div>
      </div>

      {/* Window breakdown: pixel · kernel = product */}
      <div className="mt-4 p-3 border-2 border-dashed border-foreground/50 rounded-xl bg-background">
        <div className="font-hand text-sm mb-2">
          element-wise window &times; kernel (the sum becomes the output cell)
        </div>
        <div
          className="grid gap-1 font-hand text-xs"
          style={{
            gridTemplateColumns: `repeat(${kW}, minmax(0, 1fr))`,
            maxWidth: kW * 80,
          }}
        >
          {windowCells.map((c, i) => (
            <div
              key={`w-${i}`}
              className="border-2 border-foreground rounded-md px-1 py-1 text-center"
              style={{
                background:
                  c.prod > 0.1
                    ? "rgba(78, 205, 196, 0.25)"
                    : c.prod < -0.1
                    ? "rgba(255, 107, 107, 0.25)"
                    : "#fff",
              }}
            >
              <div>{fmt(c.px)} &middot; {fmt(c.k)}</div>
              <div className="font-bold">= {fmt(c.prod)}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 font-hand text-sm">
          sum ={" "}
          <span
            style={{
              color:
                outputNormalized > 0.5
                  ? "var(--accent-coral)"
                  : "var(--accent-mint)",
            }}
          >
            {fmt(currentOutput)}
          </span>
        </div>
      </div>
    </div>
  );
}

function fmt(v: number): string {
  if (!isFinite(v)) return "-";
  if (Math.abs(v) >= 10) return v.toFixed(0);
  if (Math.abs(v) >= 1) return v.toFixed(1);
  return v.toFixed(2);
}
