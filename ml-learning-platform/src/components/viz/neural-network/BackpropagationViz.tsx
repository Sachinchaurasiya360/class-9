"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { mulberry32 } from "./mulberry32";
import {
  fmt,
  neuronPosition,
  sketchyPath,
} from "./utils";

export interface BackpropagationVizProps {
  architecture: number[];
  loss?: number;
  learningRate?: number;
  /** Show arrows indicating weight updates alongside gradient coloring. */
  showUpdateArrows?: boolean;
  width?: number;
  height?: number;
}

/** Visualizes gradients flowing backward through a network. */
export function BackpropagationViz({
  architecture,
  loss = 1.2,
  learningRate = 0.1,
  showUpdateArrows = true,
  width = 680,
  height = 380,
}: BackpropagationVizProps) {
  const layers = architecture.length > 0 ? architecture : [1];
  const layerCount = layers.length;

  // Generate reproducible synthetic gradients to visualize.
  // backStage goes from (layerCount-1) down to 0, then stops.
  const maxStage = layerCount - 1; // final layer index
  const [backStage, setBackStage] = useState(maxStage); // which layer's grads are "arriving"
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Generate per-neuron gradient magnitudes deterministically from `loss`.
  const gradients = useMemo(() => {
    const rand = mulberry32(Math.floor(loss * 1000) + 1);
    const grads: number[][] = layers.map((count, li) => {
      const decay = Math.pow(0.75, maxStage - li); // grows toward output
      return Array.from({ length: count }, () => {
        const r = (rand() - 0.5) * 2;
        return r * loss * decay;
      });
    });
    return grads;
  }, [layers, loss, maxStage]);

  const maxAbsGrad = useMemo(() => {
    let m = 0.001;
    for (const row of gradients) for (const g of row) m = Math.max(m, Math.abs(g));
    return m;
  }, [gradients]);

  const stepBackward = useCallback(() => {
    setBackStage((s) => Math.max(0, s - 1));
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (backStage <= 0) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      stepBackward();
    }, 900);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [playing, backStage, stepBackward]);

  // Color for a gradient magnitude - redder = bigger.
  function gradColor(g: number): string {
    const t = Math.min(1, Math.abs(g) / maxAbsGrad);
    const r = Math.round(255 * (0.8 * t + 0.2));
    const gg = Math.round(80 * (1 - t) + 80);
    const b = Math.round(90 * (1 - t) + 80);
    return `rgb(${r}, ${gg}, ${b})`;
  }

  return (
    <div className="w-full max-w-[760px]">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="Backpropagation gradient flow"
      >
        {/* connections */}
        {layers.slice(0, -1).map((from, li) => {
          const to = layers[li + 1];
          const isActive = li >= backStage - 1 && backStage - 1 >= 0;
          const isCurrent = li === backStage - 1;
          return Array.from({ length: to }, (_, j) =>
            Array.from({ length: from }, (_, i) => {
              const a = neuronPosition(li, i, layerCount, from, width, height);
              const b = neuronPosition(li + 1, j, layerCount, to, width, height);
              // Reverse path (output->input) so the animation flows backward.
              const path = sketchyPath(b.x, b.y, a.x, a.y, li * 100 + j * 7 + i);
              const g = gradients[li + 1]?.[j] ?? 0;
              const color = isActive ? gradColor(g) : "#b0a8b8";
              return (
                <path
                  key={`bw-${li}-${j}-${i}`}
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={isActive ? 1.6 + Math.abs(g) * 1.8 : 1.2}
                  strokeLinecap="round"
                  strokeOpacity={isActive ? 0.85 : 0.25}
                  strokeDasharray="6 4"
                  style={
                    isCurrent
                      ? {
                          animation: `signal-flow 0.9s linear infinite`,
                        }
                      : undefined
                  }
                />
              );
            }),
          );
        })}

        {/* neurons colored by gradient */}
        {layers.map((count, li) =>
          Array.from({ length: count }, (_, ni) => {
            const { x, y } = neuronPosition(li, ni, layerCount, count, width, height);
            const g = gradients[li][ni];
            const visited = li >= backStage;
            const color = visited ? gradColor(g) : "#e5e0d8";
            return (
              <g key={`n-${li}-${ni}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={20}
                  fill={color}
                  stroke="#2b2a35"
                  strokeWidth={2.5}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className="font-hand"
                  fontSize={11}
                  fill={visited ? "#fdfbf6" : "#6b6776"}
                >
                  {visited ? fmt(g, 2) : "?"}
                </text>
                {showUpdateArrows && visited && li > 0 ? (
                  <g transform={`translate(${x + 20}, ${y - 18})`}>
                    <text
                      className="font-hand"
                      fontSize={10}
                      fill="#6b6776"
                    >
                      Δw={fmt(-learningRate * g, 3)}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          }),
        )}

        {/* loss pill over the output layer */}
        <g transform={`translate(${width - 150}, 14)`}>
          <rect
            x={0}
            y={0}
            width={140}
            height={34}
            rx={8}
            fill="var(--accent-coral)"
            stroke="#2b2a35"
            strokeWidth={1.5}
          />
          <text
            x={70}
            y={15}
            textAnchor="middle"
            className="font-hand"
            fontSize={12}
            fill="#fdfbf6"
          >
            loss = {fmt(loss, 3)}
          </text>
          <text
            x={70}
            y={29}
            textAnchor="middle"
            className="font-hand"
            fontSize={11}
            fill="#fdfbf6"
          >
            lr = {fmt(learningRate, 3)}
          </text>
        </g>
      </svg>

      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <button
          type="button"
          className="btn-sketchy"
          onClick={() => {
            if (backStage <= 0) {
              setBackStage(maxStage);
              setPlaying(true);
            } else {
              setPlaying((p) => !p);
            }
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? "Pause" : backStage <= 0 ? "Replay" : "Play"}
        </button>
        <button
          type="button"
          className="btn-sketchy-outline"
          onClick={stepBackward}
          disabled={backStage <= 0 || playing}
        >
          Step back
        </button>
        <button
          type="button"
          className="btn-sketchy-outline"
          onClick={() => {
            setBackStage(maxStage);
            setPlaying(false);
          }}
        >
          <RotateCcw size={16} /> Reset
        </button>
        <span className="font-hand text-[14px] text-muted-foreground ml-auto">
          gradient arrived at layer {backStage}
        </span>
      </div>
    </div>
  );
}

export default BackpropagationViz;
