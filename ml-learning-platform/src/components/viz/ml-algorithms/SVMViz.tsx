"use client";

import { useMemo, useState } from "react";
import {
  generateClassification2D,
  CLUSTER_COLORS,
  type Point,
} from "./dataGenerator";
import { formatNum, makeProjector, VIEWBOX } from "./utils";

export type SVMVizProps = {
  data?: Point[];
};

// Extremely simplified "SVM-ish" solver for 2D: compute the centroid of each
// class, use the perpendicular bisector as the max-margin line. For linearly
// separable blobs this is close-ish to the real max-margin hyperplane - which
// is plenty for an educational sketch.
function linearMargin(points: Point[]) {
  const c0 = { x: 0, y: 0, n: 0 };
  const c1 = { x: 0, y: 0, n: 0 };
  for (const p of points) {
    if (p.label === 0) {
      c0.x += p.x;
      c0.y += p.y;
      c0.n++;
    } else if (p.label === 1) {
      c1.x += p.x;
      c1.y += p.y;
      c1.n++;
    }
  }
  if (!c0.n || !c1.n) return null;
  c0.x /= c0.n;
  c0.y /= c0.n;
  c1.x /= c1.n;
  c1.y /= c1.n;
  // Normal vector from class 0 to class 1
  const nx = c1.x - c0.x;
  const ny = c1.y - c0.y;
  const len = Math.hypot(nx, ny);
  if (len < 1e-6) return null;
  const ux = nx / len;
  const uy = ny / len;
  // Point midway between centroids
  const mid = { x: (c0.x + c1.x) / 2, y: (c0.y + c1.y) / 2 };

  // Project each labelled point onto the normal to get signed distance to mid.
  const dists = points
    .filter((p) => p.label === 0 || p.label === 1)
    .map((p) => ({
      p,
      d: (p.x - mid.x) * ux + (p.y - mid.y) * uy,
    }));
  // support vectors = closest points on each side (smallest |d| per class)
  let minNeg = Infinity;
  let minPos = Infinity;
  let svNeg: Point | null = null;
  let svPos: Point | null = null;
  for (const { p, d } of dists) {
    if (p.label === 0 && d < 0 && Math.abs(d) < minNeg) {
      minNeg = Math.abs(d);
      svNeg = p;
    }
    if (p.label === 1 && d > 0 && d < minPos) {
      minPos = d;
      svPos = p;
    }
  }
  const margin = Math.min(minNeg, minPos);
  return { mid, ux, uy, margin, svNeg, svPos };
}

export default function SVMViz({ data: propData }: SVMVizProps) {
  const defaultData = useMemo(() => generateClassification2D(32, 19), []);
  const data = propData ?? defaultData;

  const [kernel, setKernel] = useState<"linear" | "rbf">("linear");
  const [C, setC] = useState(1);

  const proj = makeProjector(VIEWBOX, 6);
  const margin = useMemo(() => linearMargin(data), [data]);

  // Effective margin scales with inverse of C - higher C = tighter margin.
  const effMargin = margin ? margin.margin / Math.max(0.1, C) : 0;

  // A point is "support vector" if within roughly effMargin of the line.
  const svIds = useMemo(() => {
    if (!margin) return new Set<number>();
    const set = new Set<number>();
    data.forEach((p, i) => {
      const d = Math.abs(
        (p.x - margin.mid.x) * margin.ux + (p.y - margin.mid.y) * margin.uy
      );
      if (d <= effMargin * 1.15) set.add(i);
    });
    return set;
  }, [data, margin, effMargin]);

  // For the RBF "mode" we fake a curved boundary by drawing the level curve
  // of a Gaussian field centred on each class mean.
  const rbfCells = useMemo(() => {
    if (kernel !== "rbf") return [];
    const c0 = { x: 0, y: 0, n: 0 };
    const c1 = { x: 0, y: 0, n: 0 };
    for (const p of data) {
      if (p.label === 0) {
        c0.x += p.x;
        c0.y += p.y;
        c0.n++;
      } else if (p.label === 1) {
        c1.x += p.x;
        c1.y += p.y;
        c1.n++;
      }
    }
    if (!c0.n || !c1.n) return [];
    c0.x /= c0.n;
    c0.y /= c0.n;
    c1.x /= c1.n;
    c1.y /= c1.n;
    const cells: { x: number; y: number; side: number }[] = [];
    const step = 4;
    const gamma = 0.002 + 0.002 * (1 / Math.max(0.2, C));
    for (let gx = 0; gx < 100; gx += step) {
      for (let gy = 0; gy < 100; gy += step) {
        const d0 = Math.exp(-gamma * ((gx - c0.x) ** 2 + (gy - c0.y) ** 2));
        const d1 = Math.exp(-gamma * ((gx - c1.x) ** 2 + (gy - c1.y) ** 2));
        cells.push({ x: gx, y: gy, side: d1 - d0 });
      }
    }
    return cells;
  }, [data, kernel, C]);

  return (
    <div className="card-sketchy p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-hand text-2xl">Support Vector Machine</h3>
        <div className="flex gap-2">
          {(["linear", "rbf"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setKernel(m)}
              className="font-hand px-3 py-1 border-2 border-foreground rounded-md text-sm"
              style={{
                background:
                  kernel === m ? "var(--accent-yellow)" : "#fdfbf6",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_220px] gap-4">
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="w-full h-auto bg-background border-2 border-foreground rounded-xl"
        >
          {kernel === "rbf" &&
            rbfCells.map((c, i) => (
              <rect
                key={`g-${i}`}
                x={proj.px(c.x)}
                y={proj.py(c.y + 4)}
                width={proj.px(c.x + 4) - proj.px(c.x)}
                height={proj.py(c.y) - proj.py(c.y + 4)}
                fill={c.side > 0 ? "var(--accent-sky)" : "var(--accent-coral)"}
                fillOpacity={Math.min(0.5, Math.abs(c.side) * 1.2)}
              />
            ))}

          {kernel === "linear" &&
            margin &&
            (() => {
              // Draw the decision line and two margin lines by walking along the
              // line's tangent from the midpoint.
              const tx = -margin.uy;
              const ty = margin.ux;
              const L = 200;
              const p1 = {
                x: margin.mid.x - tx * L,
                y: margin.mid.y - ty * L,
              };
              const p2 = {
                x: margin.mid.x + tx * L,
                y: margin.mid.y + ty * L,
              };
              const marginShift = (o: number) => ({
                p1: { x: p1.x + margin.ux * o, y: p1.y + margin.uy * o },
                p2: { x: p2.x + margin.ux * o, y: p2.y + margin.uy * o },
              });
              const posM = marginShift(effMargin);
              const negM = marginShift(-effMargin);
              return (
                <>
                  <line
                    x1={proj.px(negM.p1.x)}
                    y1={proj.py(negM.p1.y)}
                    x2={proj.px(negM.p2.x)}
                    y2={proj.py(negM.p2.y)}
                    stroke="var(--accent-coral)"
                    strokeWidth={0.8}
                    strokeDasharray="2 1.5"
                  />
                  <line
                    x1={proj.px(posM.p1.x)}
                    y1={proj.py(posM.p1.y)}
                    x2={proj.px(posM.p2.x)}
                    y2={proj.py(posM.p2.y)}
                    stroke="var(--accent-sky)"
                    strokeWidth={0.8}
                    strokeDasharray="2 1.5"
                  />
                  <line
                    x1={proj.px(p1.x)}
                    y1={proj.py(p1.y)}
                    x2={proj.px(p2.x)}
                    y2={proj.py(p2.y)}
                    stroke="#2b2a35"
                    strokeWidth={1.2}
                  />
                </>
              );
            })()}

          {data.map((p, i) => {
            const isSV = svIds.has(i) && kernel === "linear";
            return (
              <g key={`p-${i}`}>
                {isSV && (
                  <circle
                    cx={proj.px(p.x)}
                    cy={proj.py(p.y)}
                    r={3.2}
                    fill="none"
                    stroke="var(--accent-yellow)"
                    strokeWidth={1.2}
                  />
                )}
                <circle
                  cx={proj.px(p.x)}
                  cy={proj.py(p.y)}
                  r={1.8}
                  fill={CLUSTER_COLORS[p.label ?? 0]}
                  stroke="#2b2a35"
                  strokeWidth={0.7}
                />
              </g>
            );
          })}
        </svg>

        <div className="font-hand space-y-3">
          <div>
            <label>C = {formatNum(C, 2)}</label>
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.05}
              value={C}
              onChange={(e) => setC(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="p-2 border-2 border-dashed border-foreground/60 rounded-md text-sm">
            {kernel === "linear" ? (
              <>
                margin width:{" "}
                <span className="font-bold">{formatNum(effMargin * 2)}</span>
                <div className="text-xs text-muted-foreground mt-1">
                  support vectors glow yellow. lower C = wider margin.
                </div>
              </>
            ) : (
              <div className="text-xs">
                RBF draws a curved boundary between class centers. higher C
                tightens the field.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
