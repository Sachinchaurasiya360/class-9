import { useState, useMemo, useCallback } from "react";
import { Target, SlidersHorizontal, Ruler } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import SVGGrid from "../../components/SVGGrid";
import { playClick, playPop } from "../../utils/sounds";

const INK = "#2b2a35";

/* ------------------------------------------------------------------ */
/*  Seeded PRNG                                                        */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */

interface DataPoint {
  x: number;
  y: number;
  cls: 0 | 1; // 0 = red, 1 = blue
}

const CLASS_COLORS = ["#ef4444", "#3b82f6"] as const;
const CLASS_LABELS = ["Red", "Blue"] as const;

function euclidean(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function manhattan(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function generateDataset(seed: number): DataPoint[] {
  const rng = mulberry32(seed);
  const pts: DataPoint[] = [];
  // Cluster 0 (red) centered around (3, 7)
  for (let i = 0; i < 8; i++) {
    pts.push({ x: 2 + rng() * 3, y: 5.5 + rng() * 3, cls: 0 });
  }
  // Cluster 1 (blue) centered around (7, 3)
  for (let i = 0; i < 8; i++) {
    pts.push({ x: 5.5 + rng() * 3, y: 1.5 + rng() * 3, cls: 1 });
  }
  return pts;
}

function knnClassify(data: DataPoint[], query: { x: number; y: number }, k: number): { cls: 0 | 1; neighbors: number[] } {
  const dists = data.map((p, i) => ({ i, d: euclidean(p, query) }));
  dists.sort((a, b) => a.d - b.d);
  const nearest = dists.slice(0, k);
  const votes = [0, 0];
  for (const n of nearest) votes[data[n.i].cls]++;
  return { cls: votes[1] > votes[0] ? 1 : 0, neighbors: nearest.map((n) => n.i) };
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Find the Neighbors                                        */
/* ------------------------------------------------------------------ */

function FindTheNeighbors() {
  const data = useMemo(() => generateDataset(123), []);
  const [k, setK] = useState(3);
  const [query, setQuery] = useState<{ x: number; y: number } | null>(null);

  const result = useMemo(() => {
    if (!query) return null;
    return knnClassify(data, query, k);
  }, [data, query, k]);

  const handlePlot = useCallback(
    (_toSvgX: (x: number) => number, _toSvgY: (y: number) => number, e: React.MouseEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * 500;
      const svgY = ((e.clientY - rect.top) / rect.height) * 350;
      // Reverse-map from SVG coordinates to data coordinates
      const pad = { left: 45, top: 20, right: 20, bottom: 40 };
      const plotW = 500 - pad.left - pad.right;
      const plotH = 350 - pad.top - pad.bottom;
      const dataX = ((svgX - pad.left) / plotW) * 10;
      const dataY = (1 - (svgY - pad.top) / plotH) * 10;
      if (dataX >= 0 && dataX <= 10 && dataY >= 0 && dataY <= 10) {
        playPop();
        setQuery({ x: Math.round(dataX * 100) / 100, y: Math.round(dataY * 100) / 100 });
      }
    },
    [],
  );

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">Click anywhere on the plot to place a point. KNN will classify it!</h3>

        {/* K slider */}
        <div className="flex items-center gap-3 max-w-xs mx-auto">
          <span className="text-xs font-medium text-slate-600">K =</span>
          <input
            type="range" min={1} max={9} step={2} value={k}
            onChange={(e) => { playClick(); setK(Number(e.target.value)); }}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-sm font-bold text-indigo-700 w-6 text-center">{k}</span>
        </div>

        {/* Plot */}
        <div className="flex justify-center overflow-x-auto">
          <SVGGrid xMin={0} xMax={10} yMin={0} yMax={10} xLabel="Feature 1" yLabel="Feature 2">
            {({ toSvgX, toSvgY }) => (
              <g onClick={(e) => handlePlot(toSvgX, toSvgY, e as unknown as React.MouseEvent<SVGSVGElement>)} style={{ cursor: "crosshair" }}>
                <defs>
                  <radialGradient id="knn-q" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#fff3a0" />
                    <stop offset="100%" stopColor="#ffd93d" />
                  </radialGradient>
                </defs>
                {/* Clickable background */}
                <rect x={45} y={20} width={435} height={290} fill="transparent" />

                {/* Animated radius circle */}
                {result && query && (() => {
                  const farthest = result.neighbors[result.neighbors.length - 1];
                  const r = euclidean(query, data[farthest]);
                  const svgR = (r / 10) * 435;
                  return (
                    <>
                      <circle cx={toSvgX(query.x)} cy={toSvgY(query.y)} r={svgR}
                        fill={CLASS_COLORS[result.cls] + "1a"}
                        stroke={CLASS_COLORS[result.cls]} strokeWidth={2} strokeDasharray="6 4"
                        className="pulse-glow" style={{ color: CLASS_COLORS[result.cls] }} />
                    </>
                  );
                })()}

                {/* Neighbor lines (signal-flow) */}
                {result && query && result.neighbors.map((ni) => (
                  <line
                    key={`line-${ni}`}
                    x1={toSvgX(query.x)} y1={toSvgY(query.y)}
                    x2={toSvgX(data[ni].x)} y2={toSvgY(data[ni].y)}
                    stroke={CLASS_COLORS[data[ni].cls]} strokeWidth={2.5} strokeLinecap="round"
                    className="signal-flow"
                    style={{ color: CLASS_COLORS[data[ni].cls] }}
                  />
                ))}

                {/* Data points */}
                {data.map((p, i) => {
                  const isN = result?.neighbors.includes(i);
                  return (
                    <g key={i}>
                      <circle
                        cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={isN ? 8 : 6}
                        fill={CLASS_COLORS[p.cls]}
                        stroke={INK}
                        strokeWidth={isN ? 2.5 : 1.5}
                        className={isN ? "pulse-glow" : ""}
                        style={isN ? { color: CLASS_COLORS[p.cls] } : undefined}
                      />
                      {isN && (
                        <line x1={toSvgX(p.x)} y1={toSvgY(p.y) - 14}
                          x2={toSvgX(p.x)} y2={toSvgY(p.y) - 22}
                          stroke="#ffd93d" strokeWidth={2.5} className="spark" />
                      )}
                    </g>
                  );
                })}

                {/* Query point with glow */}
                {query && (
                  <g>
                    <circle cx={toSvgX(query.x)} cy={toSvgY(query.y)} r={12}
                      fill="url(#knn-q)" stroke={INK} strokeWidth={2.5}
                      className="pulse-glow" style={{ color: "#ffd93d" }} />
                    <text x={toSvgX(query.x)} y={toSvgY(query.y) + 4} textAnchor="middle"
                      fontFamily="Kalam" className="text-[12px] font-bold" fill={INK}>?</text>
                  </g>
                )}
              </g>
            )}
          </SVGGrid>
        </div>

        {/* Result */}
        {result && (
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-slate-700">
              Classification: <span style={{ color: CLASS_COLORS[result.cls] }}>{CLASS_LABELS[result.cls]}</span>
            </p>
            <p className="text-xs text-slate-500">
              {k} nearest neighbors voted  majority is {CLASS_LABELS[result.cls]}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs text-slate-600">
          <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 align-middle" />Red class</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1 align-middle" />Blue class</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1 align-middle" />Your point</span>
        </div>
      </div>

      <InfoBox variant="blue" title="How KNN Works">
        K-Nearest Neighbors looks at the <strong>K closest data points</strong> to a new point. Whatever class most of those neighbors belong to, that's the prediction! It's like asking your nearest friends for advice.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  K Changes Everything                                       */
/* ------------------------------------------------------------------ */

function KChangesEverything() {
  const data = useMemo(() => generateDataset(456), []);
  const fixedQuery = useMemo(() => ({ x: 4.8, y: 4.5 }), []);
  const [k, setK] = useState(1);

  const result = useMemo(() => knnClassify(data, fixedQuery, k), [data, fixedQuery, k]);

  // Show how classification changes for each K
  const allKResults = useMemo(() => {
    return [1, 3, 5, 7, 9].map((kv) => {
      const r = knnClassify(data, fixedQuery, kv);
      return { k: kv, cls: r.cls };
    });
  }, [data, fixedQuery]);

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">See how changing K changes the classification of the same point</h3>

        {/* K slider */}
        <div className="flex items-center gap-3 max-w-xs mx-auto">
          <span className="text-xs font-medium text-slate-600">K =</span>
          <input
            type="range" min={1} max={9} step={2} value={k}
            onChange={(e) => { playClick(); setK(Number(e.target.value)); }}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-sm font-bold text-indigo-700 w-6 text-center">{k}</span>
        </div>

        {/* Plot */}
        <div className="flex justify-center overflow-x-auto">
          <SVGGrid xMin={0} xMax={10} yMin={0} yMax={10} xLabel="Feature 1" yLabel="Feature 2">
            {({ toSvgX, toSvgY }) => (
              <g>
                {/* Distance circle */}
                {result.neighbors.length > 0 && (() => {
                  const farthestIdx = result.neighbors[result.neighbors.length - 1];
                  const radius = euclidean(fixedQuery, data[farthestIdx]);
                  const svgRadius = (radius / 10) * 435;
                  return (
                    <circle
                      cx={toSvgX(fixedQuery.x)} cy={toSvgY(fixedQuery.y)} r={svgRadius}
                      fill={CLASS_COLORS[result.cls] + "1a"} stroke={CLASS_COLORS[result.cls]} strokeWidth={2} strokeDasharray="6 4"
                      className="pulse-glow" style={{ color: CLASS_COLORS[result.cls] }}
                    />
                  );
                })()}

                {/* Neighbor lines */}
                {result.neighbors.map((ni) => (
                  <line
                    key={`nl-${ni}`}
                    x1={toSvgX(fixedQuery.x)} y1={toSvgY(fixedQuery.y)}
                    x2={toSvgX(data[ni].x)} y2={toSvgY(data[ni].y)}
                    stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.6}
                  />
                ))}

                {/* Data points */}
                {data.map((p, i) => (
                  <circle
                    key={i}
                    cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={6}
                    fill={CLASS_COLORS[p.cls]}
                    stroke={result.neighbors.includes(i) ? "#7c3aed" : "#334155"}
                    strokeWidth={result.neighbors.includes(i) ? 3 : 1}
                    opacity={0.85}
                  />
                ))}

                {/* Query point */}
                <circle cx={toSvgX(fixedQuery.x)} cy={toSvgY(fixedQuery.y)} r={9}
                  fill="#22c55e" stroke="#166534" strokeWidth={2}
                />
                <text x={toSvgX(fixedQuery.x)} y={toSvgY(fixedQuery.y) + 3.5}
                  textAnchor="middle" className="text-[8px] fill-white font-bold">?</text>
              </g>
            )}
          </SVGGrid>
        </div>

        {/* K comparison table */}
        <div className="flex justify-center gap-2 flex-wrap">
          {allKResults.map((r) => (
            <div
              key={r.k}
              className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                r.k === k ? "border-indigo-500 shadow-md scale-105" : "border-slate-200"
              }`}
            >
              K={r.k}: <span style={{ color: CLASS_COLORS[r.cls] }} className="font-bold">{CLASS_LABELS[r.cls]}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-500">
          Result: <span className="font-bold" style={{ color: CLASS_COLORS[result.cls] }}>{CLASS_LABELS[result.cls]}</span> with K={k}
        </p>
      </div>

      <InfoBox variant="amber" title="Choosing K">
        A <strong>small K</strong> (like 1) is sensitive to noise  one odd neighbor changes everything. A <strong>large K</strong> is more stable but might include points from far away. Finding the right K is key to good KNN performance!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Distance Matters                                           */
/* ------------------------------------------------------------------ */

function DistanceMatters() {
  const data = useMemo(() => generateDataset(789), []);
  const [query, setQuery] = useState({ x: 5, y: 5 });
  const k = 3;

  const eucNeighbors = useMemo(() => {
    const dists = data.map((p, i) => ({ i, d: euclidean(p, query) }));
    dists.sort((a, b) => a.d - b.d);
    return dists.slice(0, k).map((n) => n.i);
  }, [data, query]);

  const manNeighbors = useMemo(() => {
    const dists = data.map((p, i) => ({ i, d: manhattan(p, query) }));
    dists.sort((a, b) => a.d - b.d);
    return dists.slice(0, k).map((n) => n.i);
  }, [data, query]);

  const differ = useMemo(() => {
    const eucSet = new Set(eucNeighbors);
    return manNeighbors.some((n) => !eucSet.has(n));
  }, [eucNeighbors, manNeighbors]);

  const handleMove = useCallback((axis: "x" | "y", val: number) => {
    playClick();
    setQuery((prev) => ({ ...prev, [axis]: val }));
  }, []);

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">Compare Euclidean vs Manhattan distance  move the query point!</h3>

        {/* Position sliders */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs text-slate-500 w-8">X:</label>
            <input type="range" min={1} max={9} step={0.5} value={query.x}
              onChange={(e) => handleMove("x", Number(e.target.value))}
              className="flex-1 accent-green-500" />
            <span className="text-xs font-mono w-8">{query.x}</span>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs text-slate-500 w-8">Y:</label>
            <input type="range" min={1} max={9} step={0.5} value={query.y}
              onChange={(e) => handleMove("y", Number(e.target.value))}
              className="flex-1 accent-green-500" />
            <span className="text-xs font-mono w-8">{query.y}</span>
          </div>
        </div>

        {/* Two plots side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Euclidean */}
          <div className="border border-blue-200 rounded-xl p-2 bg-blue-50/20">
            <h4 className="text-xs font-bold text-blue-700 text-center mb-1">Euclidean (straight line)</h4>
            <SVGGrid xMin={0} xMax={10} yMin={0} yMax={10} xLabel="" yLabel="" width={280} height={240}>
              {({ toSvgX, toSvgY }) => (
                <g>
                  {/* Distance circle */}
                  {(() => {
                    const farthest = eucNeighbors[eucNeighbors.length - 1];
                    const r = euclidean(query, data[farthest]);
                    const svgR = (r / 10) * 215;
                    return <circle cx={toSvgX(query.x)} cy={toSvgY(query.y)} r={svgR} fill="#3b82f620" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 2" />;
                  })()}
                  {eucNeighbors.map((ni) => (
                    <line key={ni} x1={toSvgX(query.x)} y1={toSvgY(query.y)}
                      x2={toSvgX(data[ni].x)} y2={toSvgY(data[ni].y)}
                      stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.7} />
                  ))}
                  {data.map((p, i) => (
                    <circle key={i} cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={5}
                      fill={CLASS_COLORS[p.cls]} stroke={eucNeighbors.includes(i) ? "#1d4ed8" : "#334155"}
                      strokeWidth={eucNeighbors.includes(i) ? 2.5 : 1} opacity={0.8} />
                  ))}
                  <circle cx={toSvgX(query.x)} cy={toSvgY(query.y)} r={7} fill="#22c55e" stroke="#166534" strokeWidth={2} />
                </g>
              )}
            </SVGGrid>
          </div>

          {/* Manhattan */}
          <div className="border border-amber-200 rounded-xl p-2 bg-amber-50/20">
            <h4 className="text-xs font-bold text-amber-700 text-center mb-1">Manhattan (grid walk)</h4>
            <SVGGrid xMin={0} xMax={10} yMin={0} yMax={10} xLabel="" yLabel="" width={280} height={240}>
              {({ toSvgX, toSvgY }) => (
                <g>
                  {/* Diamond shape for Manhattan distance */}
                  {(() => {
                    const farthest = manNeighbors[manNeighbors.length - 1];
                    const r = manhattan(query, data[farthest]);
                    const dx = (r / 10) * 215;
                    const dy = (r / 10) * 180;
                    const cx = toSvgX(query.x);
                    const cy = toSvgY(query.y);
                    return <polygon points={`${cx},${cy - dy} ${cx + dx},${cy} ${cx},${cy + dy} ${cx - dx},${cy}`}
                      fill="#f59e0b20" stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 2" />;
                  })()}
                  {/* L-shaped lines for Manhattan */}
                  {manNeighbors.map((ni) => {
                    const qx = toSvgX(query.x);
                    const qy = toSvgY(query.y);
                    const px = toSvgX(data[ni].x);
                    const py = toSvgY(data[ni].y);
                    return (
                      <g key={ni}>
                        <line x1={qx} y1={qy} x2={px} y2={qy} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.7} />
                        <line x1={px} y1={qy} x2={px} y2={py} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.7} />
                      </g>
                    );
                  })}
                  {data.map((p, i) => (
                    <circle key={i} cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={5}
                      fill={CLASS_COLORS[p.cls]} stroke={manNeighbors.includes(i) ? "#b45309" : "#334155"}
                      strokeWidth={manNeighbors.includes(i) ? 2.5 : 1} opacity={0.8} />
                  ))}
                  <circle cx={toSvgX(query.x)} cy={toSvgY(query.y)} r={7} fill="#22c55e" stroke="#166534" strokeWidth={2} />
                </g>
              )}
            </SVGGrid>
          </div>
        </div>

        {/* Observation */}
        <div className={`text-center text-xs font-medium p-2 rounded-lg ${
          differ ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
        }`}>
          {differ
            ? "Different neighbors! The distance metric changed which points are closest."
            : "Same neighbors for both metrics at this position. Try moving the point!"}
        </div>
      </div>

      <InfoBox variant="indigo" title="Distance Metrics">
        <strong>Euclidean distance</strong> is the straight-line distance (as the crow flies). <strong>Manhattan distance</strong> follows a grid path (like walking city blocks). Different metrics can find different neighbors, leading to different predictions!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "In KNN, what does 'K' represent?",
    options: [
      "The number of features in the data",
      "The number of nearest neighbors to consider",
      "The total number of data points",
      "The number of classes",
    ],
    correctIndex: 1,
    explanation: "K is the number of closest data points (neighbors) the algorithm looks at to make its prediction through majority voting.",
  },
  {
    question: "If K=5 and 3 neighbors are blue while 2 are red, what does KNN predict?",
    options: ["Red", "Blue", "Green", "It cannot decide"],
    correctIndex: 1,
    explanation: "KNN uses majority voting. Since 3 out of 5 neighbors are blue, the prediction is blue.",
  },
  {
    question: "Why might K=1 be a bad choice?",
    options: [
      "It's too slow",
      "It considers too many neighbors",
      "A single noisy point can cause a wrong prediction",
      "It always picks the farthest point",
    ],
    correctIndex: 2,
    explanation: "With K=1, the prediction depends on just one neighbor. If that single neighbor is an outlier or noisy, the prediction will be wrong.",
  },
  {
    question: "What is the main difference between Euclidean and Manhattan distance?",
    options: [
      "Euclidean is faster to compute",
      "Manhattan only works in 2D",
      "Euclidean measures straight-line distance while Manhattan follows grid paths",
      "They always give the same result",
    ],
    correctIndex: 2,
    explanation: "Euclidean distance is the straight-line (diagonal) distance between two points. Manhattan distance is the sum of horizontal and vertical steps, like walking city blocks.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L12_KNNActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "find",
        label: "Find the Neighbors",
        icon: <Target className="w-4 h-4" />,
        content: <FindTheNeighbors />,
      },
      {
        id: "kchange",
        label: "K Changes Everything",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <KChangesEverything />,
      },
      {
        id: "distance",
        label: "Distance Matters",
        icon: <Ruler className="w-4 h-4" />,
        content: <DistanceMatters />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="K-Nearest Neighbors"
      level={4}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Discover how Decision Trees make choices step by step!"
      story={
        <StorySection
          paragraphs={[
            "Aru just moved to a new school and was wondering which friend group she would fit into.",
            "Byte: To figure out which group you'd fit in, look at the K closest kids to you  the ones sitting nearest in the cafeteria, or who share your interests.",
            "Aru: So if most of the kids near me like art, I'd probably like art too?",
            "Byte: Exactly! Whatever most of your nearest neighbors like, you'll probably like too. That's KNN  K-Nearest Neighbors. You look at K nearby examples and go with the majority vote!",
            "Aru: What if I pick too many neighbors? Like, everyone in the whole school?",
            "Byte: Then you'd just go with whatever's most popular overall  you'd lose the local flavor. That's why choosing the right K matters!",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="K-Nearest Neighbors (KNN) classifies a new data point by finding the K closest existing data points and using majority voting. The choice of K and the distance metric (how we measure 'closest') both affect the result."
        />
      }
    />
  );
}
