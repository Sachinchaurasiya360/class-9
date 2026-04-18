"use client";

import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import type { LayerSpec, Pixels2D } from "./types";
import { DEFAULT_DEMO_IMAGE } from "./imageUtils";

export interface MiniCNNProps {
  /** Declarative list of layers. Defaults to a classic LeNet-ish pipeline. */
  layers?: LayerSpec[];
  /** Input image for the left-most stage. */
  inputImage?: Pixels2D;
  /** Auto-run a pulse animation through the pipeline. */
  animate?: boolean;
  /** Title above the diagram. */
  title?: string;
}

const DEFAULT_LAYERS: LayerSpec[] = [
  { type: "conv", filters: 4, kernelSize: 3, label: "Conv 3×3" },
  { type: "pool", size: 2, pooling: "max", label: "MaxPool" },
  { type: "conv", filters: 8, kernelSize: 3, label: "Conv 3×3" },
  { type: "pool", size: 2, pooling: "max", label: "MaxPool" },
  { type: "flatten", label: "Flatten" },
  { type: "dense", units: 10, label: "Dense 10" },
];

interface StageLayout {
  kind: LayerSpec["type"] | "input";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  // For stack-of-feature-maps drawings:
  stackCount: number;
  blockW: number;
  blockH: number;
  // For dense layers / output
  units?: number;
}

// ---------------------------------------------------------------------------
// Compute layout boxes for every stage in the pipeline. Each successive conv
// block gets a smaller feature-map footprint (visual shrinkage), pool halves
// again, dense becomes a stack of circles.
// ---------------------------------------------------------------------------
function buildLayout(
  layers: LayerSpec[],
  inputH: number,
  inputW: number
): { stages: StageLayout[]; totalW: number; totalH: number } {
  const stageGap = 48;
  const padX = 24;
  const padY = 40;
  const maxBlockSize = 90;
  const maxStackCount = 6;

  let curH = inputH;
  let curW = inputW;
  let curStacks = 1;

  const sizes: StageLayout[] = [];

  // Input stage
  sizes.push({
    kind: "input",
    label: `input ${inputH}×${inputW}`,
    x: 0,
    y: 0,
    w: maxBlockSize,
    h: maxBlockSize,
    stackCount: 1,
    blockW: maxBlockSize,
    blockH: maxBlockSize,
  });

  for (const layer of layers) {
    if (layer.type === "conv") {
      const k = layer.kernelSize;
      curH = Math.max(2, curH - k + 1);
      curW = Math.max(2, curW - k + 1);
      curStacks = Math.min(maxStackCount, layer.filters);
      const scale = Math.max(0.35, curH / inputH);
      const bw = Math.max(24, Math.round(maxBlockSize * scale));
      sizes.push({
        kind: "conv",
        label: layer.label ?? `Conv ${k}×${k}`,
        x: 0,
        y: 0,
        w: bw + curStacks * 5,
        h: bw + curStacks * 5,
        stackCount: curStacks,
        blockW: bw,
        blockH: bw,
      });
    } else if (layer.type === "pool") {
      curH = Math.max(1, Math.floor(curH / layer.size));
      curW = Math.max(1, Math.floor(curW / layer.size));
      const scale = Math.max(0.2, curH / inputH);
      const bw = Math.max(20, Math.round(maxBlockSize * scale));
      sizes.push({
        kind: "pool",
        label: layer.label ?? `Pool ${layer.size}×${layer.size}`,
        x: 0,
        y: 0,
        w: bw + curStacks * 5,
        h: bw + curStacks * 5,
        stackCount: curStacks,
        blockW: bw,
        blockH: bw,
      });
    } else if (layer.type === "flatten") {
      sizes.push({
        kind: "flatten",
        label: layer.label ?? "Flatten",
        x: 0,
        y: 0,
        w: 30,
        h: maxBlockSize,
        stackCount: 1,
        blockW: 30,
        blockH: maxBlockSize,
      });
      curStacks = 1;
    } else if (layer.type === "dense") {
      sizes.push({
        kind: "dense",
        label: layer.label ?? `Dense ${layer.units}`,
        x: 0,
        y: 0,
        w: 60,
        h: maxBlockSize,
        stackCount: 1,
        blockW: 60,
        blockH: maxBlockSize,
        units: layer.units,
      });
      curStacks = 1;
    }
  }

  // Lay them out horizontally with a centered y.
  const totalH = maxBlockSize + padY * 2 + 30;
  const centerY = totalH / 2;
  let cursor = padX;
  for (const s of sizes) {
    s.x = cursor;
    s.y = centerY - s.h / 2;
    cursor += s.w + stageGap;
  }
  const totalW = cursor + padX;
  return { stages: sizes, totalW, totalH };
}

/**
 * <MiniCNN /> - high-level architecture diagram showing a pipeline of conv /
 * pool / flatten / dense stages. Each stage renders as a little stack of
 * feature-map blocks (so students see *both* the width shrinking *and* the
 * number of channels growing).
 */
export default function MiniCNN({
  layers = DEFAULT_LAYERS,
  inputImage = DEFAULT_DEMO_IMAGE,
  animate = false,
  title = "CNN Pipeline",
}: MiniCNNProps) {
  const inputH = inputImage.length;
  const inputW = inputH > 0 ? inputImage[0].length : 0;

  const { stages, totalW, totalH } = useMemo(
    () => buildLayout(layers, inputH, inputW),
    [layers, inputH, inputW]
  );

  const [playing, setPlaying] = useState(animate);
  const [pulseIdx, setPulseIdx] = useState(0);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (!playingRef.current) return;
      setPulseIdx((i) => (i + 1) % stages.length);
    }, 700);
    return () => clearTimeout(t);
  }, [playing, pulseIdx, stages.length]);

  const reset = () => {
    setPulseIdx(0);
    setPlaying(false);
  };

  const stageColor = (kind: StageLayout["kind"]): string => {
    switch (kind) {
      case "input":
        return "#fdfbf6";
      case "conv":
        return "rgba(255, 107, 107, 0.22)";
      case "pool":
        return "rgba(78, 205, 196, 0.22)";
      case "flatten":
        return "rgba(255, 217, 61, 0.35)";
      case "dense":
        return "rgba(177, 140, 242, 0.25)";
      default:
        return "#fff";
    }
  };

  return (
    <div className="card-sketchy p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-hand text-2xl">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-sketchy"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? "Pause" : "Pulse"}
          </button>
          <button type="button" className="btn-sketchy-outline" onClick={reset}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        width="100%"
        className="block bg-background border-2 border-foreground rounded-xl"
        style={{ maxWidth: totalW }}
      >
        <defs>
          <marker
            id="miniCNNArrow"
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

        {/* Connecting arrows first so they sit behind the boxes. */}
        {stages.slice(0, -1).map((s, i) => {
          const next = stages[i + 1];
          const x1 = s.x + s.w;
          const x2 = next.x;
          const y1 = totalH / 2;
          const y2 = totalH / 2;
          return (
            <path
              key={`arr-${i}`}
              d={`M ${x1 + 2} ${y1} L ${x2 - 4} ${y2}`}
              stroke="#2b2a35"
              strokeWidth={2}
              strokeDasharray="4 3"
              fill="none"
              markerEnd="url(#miniCNNArrow)"
            />
          );
        })}

        {stages.map((s, i) => {
          const isPulsing = playing && pulseIdx === i;
          return (
            <g key={`stage-${i}`} opacity={isPulsing ? 1 : 0.95}>
              {/* Stack of feature map blocks, offset back-to-front */}
              {s.kind === "conv" || s.kind === "pool" ? (
                Array.from({ length: s.stackCount }).map((_, j) => {
                  const offset = (s.stackCount - 1 - j) * 5;
                  return (
                    <rect
                      key={`blk-${j}`}
                      x={s.x + offset}
                      y={s.y + offset}
                      width={s.blockW}
                      height={s.blockH}
                      rx={5}
                      fill={stageColor(s.kind)}
                      stroke="#2b2a35"
                      strokeWidth={2}
                    />
                  );
                })
              ) : s.kind === "input" ? (
                <g>
                  <rect
                    x={s.x}
                    y={s.y}
                    width={s.w}
                    height={s.h}
                    rx={6}
                    fill="#fff"
                    stroke="#2b2a35"
                    strokeWidth={2.5}
                  />
                  <MiniImage
                    pixels={inputImage}
                    x={s.x + 6}
                    y={s.y + 6}
                    w={s.w - 12}
                    h={s.h - 12}
                  />
                </g>
              ) : s.kind === "flatten" ? (
                <rect
                  x={s.x}
                  y={s.y}
                  width={s.w}
                  height={s.h}
                  rx={6}
                  fill={stageColor(s.kind)}
                  stroke="#2b2a35"
                  strokeWidth={2.5}
                />
              ) : s.kind === "dense" ? (
                <g>
                  <rect
                    x={s.x}
                    y={s.y}
                    width={s.w}
                    height={s.h}
                    rx={8}
                    fill={stageColor(s.kind)}
                    stroke="#2b2a35"
                    strokeWidth={2.5}
                  />
                  <DenseDots
                    units={s.units ?? 4}
                    x={s.x}
                    y={s.y}
                    w={s.w}
                    h={s.h}
                  />
                </g>
              ) : null}

              {/* Pulse halo */}
              {isPulsing ? (
                <rect
                  x={s.x - 4}
                  y={s.y - 4}
                  width={s.w + 8}
                  height={s.h + 8}
                  rx={10}
                  fill="none"
                  stroke="var(--accent-yellow)"
                  strokeWidth={3}
                  className="pulse-glow"
                  style={{ color: "var(--accent-yellow)" }}
                />
              ) : null}

              {/* Label */}
              <text
                x={s.x + s.w / 2}
                y={s.y + s.h + 22}
                textAnchor="middle"
                fontFamily="Kalam, cursive"
                fontSize={14}
                fill="#2b2a35"
              >
                {s.label}
              </text>
              {s.kind === "conv" || s.kind === "pool" ? (
                <text
                  x={s.x + s.w / 2}
                  y={s.y - 6}
                  textAnchor="middle"
                  fontFamily="Kalam, cursive"
                  fontSize={11}
                  fill="#6b6776"
                >
                  {s.stackCount} map{s.stackCount > 1 ? "s" : ""}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <p className="mt-3 font-hand text-sm text-muted-foreground">
        each stage shrinks the spatial size while deepening the number of
        feature maps. flatten turns the stack into a single list. dense layers
        make the final prediction.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// A tiny inline rendering of the input image inside the first stage.
// ---------------------------------------------------------------------------
function MiniImage({
  pixels,
  x,
  y,
  w,
  h,
}: {
  pixels: Pixels2D;
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const H = pixels.length;
  const W = H > 0 ? pixels[0].length : 0;
  if (H === 0 || W === 0) return null;
  const cellW = w / W;
  const cellH = h / H;
  const cells: ReactElement[] = [];
  for (let yy = 0; yy < H; yy++) {
    for (let xx = 0; xx < W; xx++) {
      const v = pixels[yy][xx];
      const g = Math.round(255 - Math.min(1, Math.max(0, v)) * 230);
      cells.push(
        <rect
          key={`mi-${yy}-${xx}`}
          x={x + xx * cellW}
          y={y + yy * cellH}
          width={cellW + 0.3}
          height={cellH + 0.3}
          fill={`rgb(${g},${g},${g})`}
        />
      );
    }
  }
  return <g>{cells}</g>;
}

// ---------------------------------------------------------------------------
// A vertical column of dots representing neurons in a dense layer.
// ---------------------------------------------------------------------------
function DenseDots({
  units,
  x,
  y,
  w,
  h,
}: {
  units: number;
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const maxDots = 8;
  const shown = Math.min(units, maxDots);
  const centerX = x + w / 2;
  const spacing = (h - 16) / (shown + 1);
  return (
    <g>
      {Array.from({ length: shown }).map((_, i) => (
        <circle
          key={`dot-${i}`}
          cx={centerX}
          cy={y + 8 + (i + 1) * spacing}
          r={4}
          fill="#fff"
          stroke="#2b2a35"
          strokeWidth={1.5}
        />
      ))}
      {units > maxDots ? (
        <text
          x={centerX}
          y={y + h - 6}
          textAnchor="middle"
          fontFamily="Kalam, cursive"
          fontSize={10}
          fill="#6b6776"
        >
          +{units - maxDots}
        </text>
      ) : null}
    </g>
  );
}
