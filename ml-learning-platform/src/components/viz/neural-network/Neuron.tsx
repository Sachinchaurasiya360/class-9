"use client";

import { useEffect, useMemo, useState } from "react";
import {
  activate,
  fmt,
  sketchyPath,
  weightColor,
  weightedSum,
  type ActivationName,
} from "./utils";

export interface NeuronProps {
  inputs: number[];
  weights: number[];
  bias?: number;
  activation?: ActivationName;
  size?: number;
  /** Label shown under the neuron. */
  label?: string;
}

/** Single artificial neuron - shows inputs, weights, weighted sum, activation, output. */
export function Neuron({
  inputs,
  weights,
  bias = 0,
  activation = "sigmoid",
  size = 360,
  label,
}: NeuronProps) {
  const width = size;
  const height = Math.max(220, size * 0.75);

  // Animate signal flow when inputs change.
  const signature = useMemo(
    () => inputs.join(",") + "|" + weights.join(",") + "|" + bias,
    [inputs, weights, bias],
  );
  const [flowKey, setFlowKey] = useState(0);
  useEffect(() => {
    setFlowKey((k) => k + 1);
  }, [signature]);

  const n = Math.max(inputs.length, weights.length);
  const safeInputs = Array.from({ length: n }, (_, i) => inputs[i] ?? 0);
  const safeWeights = Array.from({ length: n }, (_, i) => weights[i] ?? 0);

  const sum = weightedSum(safeInputs, safeWeights, bias);
  const out = activate(activation, sum);

  // Layout: inputs on the left column, neuron in the middle, output on right.
  const cx = width * 0.62;
  const cy = height / 2;
  const r = Math.min(42, height * 0.18);
  const inputX = width * 0.1;

  const ys =
    n === 1
      ? [cy]
      : Array.from({ length: n }, (_, i) => 40 + (i * (height - 80)) / (n - 1));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label={`Artificial neuron with ${n} inputs using ${activation} activation`}
    >
      {/* connection lines with weights */}
      {safeInputs.map((inp, i) => {
        const y = ys[i];
        const w = safeWeights[i];
        const path = sketchyPath(inputX + 18, y, cx - r, cy, i + flowKey);
        const midX = (inputX + cx) / 2;
        const midY = (y + cy) / 2 - 8;
        return (
          <g key={`line-${i}`}>
            <path
              d={path}
              fill="none"
              stroke={weightColor(w)}
              strokeWidth={1.2 + Math.min(3, Math.abs(w))}
              strokeLinecap="round"
              strokeDasharray="6 4"
              style={{
                animation: `signal-flow 1.2s linear ${i * 0.12}s infinite`,
              }}
            />
            {/* weight label */}
            <g transform={`translate(${midX}, ${midY})`}>
              <rect
                x={-22}
                y={-12}
                width={44}
                height={18}
                rx={6}
                ry={7}
                fill="#fdfbf6"
                stroke="#2b2a35"
                strokeWidth={1.2}
              />
              <text
                className="font-hand"
                textAnchor="middle"
                dominantBaseline="middle"
                y={1}
                fontSize={13}
                fill="#2b2a35"
              >
                w={fmt(w)}
              </text>
            </g>
          </g>
        );
      })}

      {/* input nodes */}
      {safeInputs.map((inp, i) => {
        const y = ys[i];
        return (
          <g key={`in-${i}`}>
            <circle
              cx={inputX}
              cy={y}
              r={16}
              fill="#fff"
              stroke="#2b2a35"
              strokeWidth={2.5}
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-hand"
              fontSize={13}
              fill="#2b2a35"
            >
              {fmt(inp)}
            </text>
            <text
              x={inputX - 22}
              y={y + 4}
              textAnchor="end"
              className="font-hand"
              fontSize={12}
              fill="#6b6776"
            >
              x{i + 1}
            </text>
          </g>
        );
      })}

      {/* neuron body */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="var(--accent-yellow)"
        stroke="#2b2a35"
        strokeWidth={2.5}
      />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        className="font-hand"
        fontSize={12}
        fill="#2b2a35"
      >
        {activation}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        className="font-hand"
        fontSize={14}
        fontWeight={700}
        fill="#2b2a35"
      >
        Σ={fmt(sum)}
      </text>

      {/* bias bubble */}
      <g transform={`translate(${cx}, ${cy - r - 18})`}>
        <rect
          x={-26}
          y={-12}
          width={52}
          height={20}
          rx={6}
          fill="var(--accent-peach)"
          stroke="#2b2a35"
          strokeWidth={1.5}
        />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-hand"
          fontSize={12}
          y={1}
          fill="#2b2a35"
        >
          bias={fmt(bias)}
        </text>
      </g>

      {/* output arrow */}
      <path
        d={sketchyPath(cx + r, cy, width - 30, cy, 99 + flowKey)}
        fill="none"
        stroke="var(--accent-sky)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="6 4"
        style={{ animation: `signal-flow 1.2s linear infinite` }}
      />
      <g transform={`translate(${width - 28}, ${cy})`}>
        <circle r={18} fill="var(--accent-mint)" stroke="#2b2a35" strokeWidth={2.5} />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-hand"
          fontSize={13}
          fontWeight={700}
          fill="#2b2a35"
        >
          {fmt(out)}
        </text>
      </g>

      {label ? (
        <text
          x={width / 2}
          y={height - 8}
          textAnchor="middle"
          className="font-hand"
          fontSize={14}
          fill="#6b6776"
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
}

export default Neuron;
