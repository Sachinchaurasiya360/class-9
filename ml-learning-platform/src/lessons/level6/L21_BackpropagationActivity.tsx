"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { ArrowLeftRight, Link2, Play, RotateCcw, Pause, Mountain } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";
import {
  NeuralNetwork,
  BackpropagationViz,
  LossLandscape,
  mulberry32,
} from "../../components/viz/neural-network";

/* ------------------------------------------------------------------ */
/*  Riku the red panda mascot                                          */
/* ------------------------------------------------------------------ */

function RikuSays({ children }: { children: ReactNode }) {
  return (
    <div className="card-sketchy p-3 flex gap-3 items-start" style={{ background: "#fff8e7" }}>
      <span className="text-2xl" aria-hidden>🐼</span>
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

const INK = "#2b2a35";

/* ------------------------------------------------------------------ */
/*  Tab 1  Error Flows Backward                                       */
/* ------------------------------------------------------------------ */

function ErrorFlowsTab() {
  const [target, setTarget] = useState(1.0);
  const [lr, setLr] = useState(0.5);
  const [simulatedOutput, setSimulatedOutput] = useState(0.35);

  // "Loss" magnitude that we feed to the BackpropagationViz - larger = redder grads.
  const loss = useMemo(() => {
    const err = target - simulatedOutput;
    // Scale so sliders produce lively gradient colors (0 .. ~2)
    return Math.max(0.1, Math.abs(err) * 2.5);
  }, [target, simulatedOutput]);

  const architecture = [2, 3, 1];

  // Fixed, mint-positive input illustration for the "forward for comparison" panel.
  const demoInputs = [0.5, 0.8];

  return (
    <div className="space-y-5">
      <RikuSays>
        Backprop sounds scary. It&apos;s actually: &ldquo;hey, that was wrong, everyone shift a tiny bit in the right direction&rdquo;. That&apos;s the whole vibe.
      </RikuSays>

      {/* Customization */}
      <div className="card-sketchy p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="font-hand text-sm font-bold flex justify-between">
            <span>Target</span>
            <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-mint">{target.toFixed(2)}</span>
          </label>
          <input
            type="range" min={0} max={1} step={0.05} value={target}
            onChange={(e) => { playPop(); setTarget(parseFloat(e.target.value)); }}
            className="w-full" style={{ accentColor: "#4ecdc4" }}
          />
        </div>
        <div>
          <label className="font-hand text-sm font-bold flex justify-between">
            <span>Current output</span>
            <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-coral text-white">{simulatedOutput.toFixed(2)}</span>
          </label>
          <input
            type="range" min={0} max={1} step={0.05} value={simulatedOutput}
            onChange={(e) => { playPop(); setSimulatedOutput(parseFloat(e.target.value)); }}
            className="w-full" style={{ accentColor: "#ff6b6b" }}
          />
        </div>
        <div>
          <label className="font-hand text-sm font-bold flex justify-between">
            <span>Learning rate</span>
            <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-lav text-white">{lr.toFixed(2)}</span>
          </label>
          <input
            type="range" min={0.05} max={1} step={0.05} value={lr}
            onChange={(e) => setLr(parseFloat(e.target.value))}
            className="w-full" style={{ accentColor: "#b18cf2" }}
          />
        </div>
      </div>

      {/* Error stats */}
      <div className="card-sketchy p-3 max-w-md mx-auto flex flex-wrap gap-2 justify-center font-hand text-xs">
        <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">
          error = target − output = <b>{(target - simulatedOutput).toFixed(3)}</b>
        </span>
        <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-coral text-white">
          loss ≈ <b>{loss.toFixed(2)}</b>
        </span>
      </div>

      {/* Forward pass (for comparison) */}
      <div className="card-sketchy p-4 notebook-grid">
        <div className="font-hand text-sm font-bold text-center mb-2">
          <span className="marker-highlight-mint">Forward pass</span> - data flows left to right
        </div>
        <NeuralNetwork
          layers={architecture}
          inputs={demoInputs}
          animateFlow
          showValues
          height={260}
        />
      </div>

      <RikuSays>
        Now watch it in reverse. Redder neurons = bigger gradient = bigger blame. Every edge gets a Δw label: a tiny nudge in the opposite direction of the gradient.
      </RikuSays>

      {/* Backward pass visualization */}
      <div className="card-sketchy p-4 notebook-grid">
        <div className="font-hand text-sm font-bold text-center mb-2">
          <span className="marker-highlight-coral">Backward pass</span> - error flows right to left
        </div>
        <BackpropagationViz
          architecture={architecture}
          loss={loss}
          learningRate={lr}
          showUpdateArrows
        />
      </div>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          Backprop in 4 steps: forward pass → measure error → flow gradients backward → nudge each weight by −lr · gradient. Slide &ldquo;Current output&rdquo; away from &ldquo;Target&rdquo; and watch the gradients get angrier.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Chain Rule Visualized (via Loss Landscape)                  */
/* ------------------------------------------------------------------ */

function ChainRuleTab() {
  // Two preset loss surfaces we can switch between.
  const [preset, setPreset] = useState<"bowl" | "valley" | "saddle">("bowl");
  const [lr, setLr] = useState(0.15);

  const lossFn = useMemo(() => {
    if (preset === "valley") {
      // Stretched "valley": gradient descent has to snake its way down.
      return (x: number, y: number) => 0.2 * x * x + 2 * y * y;
    }
    if (preset === "saddle") {
      // Saddle shape: descent has to escape the middle.
      return (x: number, y: number) => x * x - y * y + 3;
    }
    // Default round bowl centered at (1, -0.5).
    return (x: number, y: number) => (x - 1) * (x - 1) + (y + 0.5) * (y + 0.5);
  }, [preset]);

  const startPoint: [number, number] =
    preset === "saddle" ? [0.1, 2.5] : [-2.5, 2];

  return (
    <div className="space-y-5">
      <RikuSays>
        The loss surface is like a hilly landscape and the network is a marble rolling downhill. We just help it roll smarter  one tiny step in the direction that points most downhill.
      </RikuSays>

      {/* Preset + lr controls */}
      <div className="card-sketchy p-3 grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ background: "#fff8e7" }}>
        <div className="space-y-1.5">
          <div className="font-hand text-sm font-bold">Loss surface</div>
          <div className="flex gap-2 flex-wrap">
            {(["bowl", "valley", "saddle"] as const).map((p) => (
              <button
                key={p}
                onClick={() => { playClick(); setPreset(p); }}
                className={`px-3 py-1 rounded-lg border-2 border-foreground font-hand text-xs font-bold transition-all ${
                  preset === p
                    ? "bg-accent-coral text-white shadow-[2px_2px_0_#2b2a35]"
                    : "bg-background"
                }`}
              >
                {p === "bowl" ? "Round bowl" : p === "valley" ? "Stretched valley" : "Saddle"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-hand text-sm font-bold flex justify-between">
            <span>Learning rate</span>
            <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-lav text-white">{lr.toFixed(2)}</span>
          </label>
          <input
            type="range" min={0.02} max={0.5} step={0.01} value={lr}
            onChange={(e) => setLr(parseFloat(e.target.value))}
            className="w-full" style={{ accentColor: "#b18cf2" }}
          />
        </div>
      </div>

      {/* The loss landscape itself */}
      <div className="card-sketchy p-4 notebook-grid flex justify-center">
        <LossLandscape
          lossFn={lossFn}
          learningRate={lr}
          startPoint={startPoint}
          range={[-3.5, 3.5]}
        />
      </div>

      <RikuSays>
        The chain rule is how we compute that downhill direction deep in a network. Gradient at layer 3 times weight times gradient at layer 2 times weight… a big telephone game of multiplications all the way back to the inputs.
      </RikuSays>

      <div className="card-sketchy p-4 space-y-2" style={{ background: "#fff0f0" }}>
        <div className="font-hand text-base font-bold">
          <span className="marker-highlight-coral">The Chain Rule in Action</span>
        </div>
        <div className="font-hand text-sm">
          To know how changing a weight affects the final output, multiply gradients along the chain:
        </div>
        <div className="font-hand text-base text-center bg-background px-3 py-2 rounded border-2 border-foreground/30">
          <span style={{ color: "#ff6b6b" }} className="font-bold">∂Loss/∂w</span> = <span style={{ color: "#ff6b6b" }} className="font-bold">∂Loss/∂output</span> × <span style={{ color: "#ff6b6b" }} className="font-bold">∂output/∂hidden</span> × <span style={{ color: "#ff6b6b" }} className="font-bold">∂hidden/∂w</span>
        </div>
        <div className="font-hand text-sm">
          On the landscape above, this product is exactly the direction the red descent path is trying to follow.
        </div>
      </div>

      <InfoBox variant="amber" title="The Chain Rule">
        <span className="font-hand text-base">
          The chain rule lets us compute how each weight affects the final loss by multiplying gradients along the path. This is the math behind backprop! Try flipping between the three surfaces  watch how the descent path changes character.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Watch It Learn                                             */
/* ------------------------------------------------------------------ */

function WatchItLearnTab() {
  const rng = useMemo(() => mulberry32(77), []);
  const [slope, setSlope] = useState(2);
  const [intercept, setIntercept] = useState(1);
  const [lr, setLr] = useState(0.01);
  const [trainSpeed, setTrainSpeed] = useState(50);

  const dataPoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const x = -2 + (i / 7) * 4;
      const y = slope * x + intercept + (rng() - 0.5) * 0.3;
      pts.push({ x, y });
    }
    return pts;
  }, [rng, slope, intercept]);

  const [w1, setW1] = useState(0.5);
  const [b1, setB1] = useState(0.1);
  const [w2, setW2] = useState(0.3);
  const [b2, setB2] = useState(0.0);
  const [epochCount, setEpochCount] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const predictY = useCallback(
    (x: number) => w2 * (w1 * x + b1) + b2,
    [w1, b1, w2, b2],
  );

  const computeLoss = useCallback(() => {
    let loss = 0;
    for (const p of dataPoints) {
      const pred = predictY(p.x);
      loss += (p.y - pred) * (p.y - pred);
    }
    return loss / dataPoints.length;
  }, [dataPoints, predictY]);

  const handlePlay = useCallback(() => {
    if (playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPlaying(false);
      return;
    }
    playClick();
    setPlaying(true);
    let steps = 0;
    let cw1 = w1, cb1 = b1, cw2 = w2, cb2 = b2;
    const tick = () => {
      if (steps >= 250) {
        setPlaying(false);
        playSuccess();
        return;
      }
      let dw1 = 0, db1 = 0, dw2 = 0, db2_ = 0;
      for (const p of dataPoints) {
        const hid = cw1 * p.x + cb1;
        const pred = cw2 * hid + cb2;
        const err = pred - p.y;
        dw2 += err * hid;
        db2_ += err;
        dw1 += err * cw2 * p.x;
        db1 += err * cw2;
      }
      const n = dataPoints.length;
      cw1 -= lr * (dw1 / n);
      cb1 -= lr * (db1 / n);
      cw2 -= lr * (dw2 / n);
      cb2 -= lr * (db2_ / n);
      setW1(cw1); setB1(cb1); setW2(cw2); setB2(cb2);
      setEpochCount((e) => e + 1);

      let loss = 0;
      for (const p of dataPoints) {
        const pred = cw2 * (cw1 * p.x + cb1) + cb2;
        loss += (p.y - pred) * (p.y - pred);
      }
      setLossHistory((prev) => [...prev.slice(-149), loss / n]);

      steps++;
      timerRef.current = setTimeout(tick, trainSpeed);
    };
    tick();
  }, [playing, dataPoints, w1, b1, w2, b2, lr, trainSpeed]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setW1(0.5); setB1(0.1); setW2(0.3); setB2(0.0);
    setEpochCount(0); setLossHistory([]);
    playClick();
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Plot
  const plotW = 340, plotH = 240, pPad = 38;
  const xMin = -3, xMax = 3, yMin = -8, yMax = 10;
  const toSX = (v: number) => pPad + ((v - xMin) / (xMax - xMin)) * (plotW - 2 * pPad);
  const toSY = (v: number) => plotH - pPad - ((v - yMin) / (yMax - yMin)) * (plotH - 2 * pPad);
  const lineY0 = predictY(xMin), lineY1 = predictY(xMax);

  // Loss curve
  const lossW = 320, lossH = 160, lossPad = 30;
  const currentLoss = lossHistory.length > 0 ? lossHistory[lossHistory.length - 1] : computeLoss();

  return (
    <div className="space-y-5">
      <RikuSays>
        Press Play. The purple line is our guess, the dashed mint line is the truth. Each epoch: forward, measure, backprop, nudge. A thousand tiny nudges later  boom, it matches.
      </RikuSays>

      <div className="text-center font-hand text-2xl font-bold">
        Learning <span className="marker-highlight-yellow">y = {slope}x + {intercept}</span>
      </div>

      {/* Customization */}
      <div className="card-sketchy p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="font-hand text-xs font-bold flex justify-between">
            <span>Slope</span><span>{slope}</span>
          </label>
          <input type="range" min={-3} max={3} step={0.5} value={slope} onChange={(e) => { setSlope(parseFloat(e.target.value)); handleReset(); }} className="w-full" style={{ accentColor: "#4ecdc4" }} />
        </div>
        <div>
          <label className="font-hand text-xs font-bold flex justify-between">
            <span>Intercept</span><span>{intercept}</span>
          </label>
          <input type="range" min={-3} max={3} step={0.5} value={intercept} onChange={(e) => { setIntercept(parseFloat(e.target.value)); handleReset(); }} className="w-full" style={{ accentColor: "#b18cf2" }} />
        </div>
        <div>
          <label className="font-hand text-xs font-bold flex justify-between">
            <span>Learning rate</span><span>{lr.toFixed(3)}</span>
          </label>
          <input type="range" min={0.001} max={0.05} step={0.001} value={lr} onChange={(e) => setLr(parseFloat(e.target.value))} className="w-full" style={{ accentColor: "#ff6b6b" }} />
        </div>
        <div>
          <label className="font-hand text-xs font-bold flex justify-between">
            <span>Speed</span><span>{trainSpeed}ms</span>
          </label>
          <input type="range" min={10} max={150} step={10} value={trainSpeed} onChange={(e) => setTrainSpeed(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#ffd93d" }} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Data plot */}
        <div className="card-sketchy p-3">
          <div className="font-hand text-sm font-bold text-center mb-2">Data + Prediction</div>
          <svg viewBox={`0 0 ${plotW} ${plotH}`} className="w-full max-w-[360px] mx-auto">
            <defs>
              <pattern id="learn-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={INK} strokeOpacity="0.07" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x={pPad} y={pPad - 10} width={plotW - 2 * pPad} height={plotH - 2 * pPad + 10} fill="#fffdf5" stroke={INK} strokeWidth={2} rx={4} />
            <rect x={pPad} y={pPad - 10} width={plotW - 2 * pPad} height={plotH - 2 * pPad + 10} fill="url(#learn-grid)" />

            {/* Zero lines */}
            {xMin <= 0 && xMax >= 0 && <line x1={toSX(0)} y1={pPad - 10} x2={toSX(0)} y2={plotH - pPad} stroke={INK} strokeWidth={1} strokeDasharray="2 3" opacity={0.4} />}
            {yMin <= 0 && yMax >= 0 && <line x1={pPad} y1={toSY(0)} x2={plotW - pPad} y2={toSY(0)} stroke={INK} strokeWidth={1} strokeDasharray="2 3" opacity={0.4} />}

            {/* Target line */}
            <line
              x1={toSX(xMin)} y1={toSY(slope * xMin + intercept)}
              x2={toSX(xMax)} y2={toSY(slope * xMax + intercept)}
              stroke="#4ecdc4" strokeWidth={2.5} strokeDasharray="5 4"
            />

            {/* Prediction line  animated */}
            <line
              x1={toSX(xMin)} y1={toSY(Math.max(yMin, Math.min(yMax, lineY0)))}
              x2={toSX(xMax)} y2={toSY(Math.max(yMin, Math.min(yMax, lineY1)))}
              stroke="#b18cf2" strokeWidth={6} opacity={0.3} strokeLinecap="round"
            />
            <line
              x1={toSX(xMin)} y1={toSY(Math.max(yMin, Math.min(yMax, lineY0)))}
              x2={toSX(xMax)} y2={toSY(Math.max(yMin, Math.min(yMax, lineY1)))}
              stroke="#b18cf2" strokeWidth={3} strokeLinecap="round"
              className={playing ? "signal-flow" : ""}
              style={playing ? { color: "#b18cf2" } : undefined}
            />

            {/* Data points with halos */}
            {dataPoints.map((p, i) => (
              <g key={i}>
                <circle cx={toSX(p.x)} cy={toSY(p.y)} r={9} fill="none" stroke="#ff6b6b" strokeWidth={2} opacity={0.4} className="pulse-glow" style={{ color: "#ff6b6b" }} />
                <circle cx={toSX(p.x)} cy={toSY(p.y)} r={6} fill="#ff6b6b" stroke={INK} strokeWidth={2} />
              </g>
            ))}

            <text x={plotW / 2} y={plotH - 8} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">x</text>
            <text x={14} y={plotH / 2} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam" transform={`rotate(-90 14 ${plotH / 2})`}>y</text>

            {/* Legend */}
            <line x1={pPad + 5} y1={pPad - 4} x2={pPad + 22} y2={pPad - 4} stroke="#4ecdc4" strokeWidth={2} strokeDasharray="3 2" />
            <text x={pPad + 26} y={pPad - 1} className="text-[9px] font-bold" fill={INK} fontFamily="Kalam">Target</text>
            <line x1={pPad + 5} y1={pPad + 8} x2={pPad + 22} y2={pPad + 8} stroke="#b18cf2" strokeWidth={2.5} />
            <text x={pPad + 26} y={pPad + 11} className="text-[9px] font-bold" fill={INK} fontFamily="Kalam">Learned</text>
          </svg>
        </div>

        {/* Loss curve */}
        <div className="card-sketchy p-3">
          <div className="font-hand text-sm font-bold text-center mb-2">Loss over Epochs</div>
          <svg viewBox={`0 0 ${lossW} ${lossH}`} className="w-full max-w-[340px] mx-auto">
            <defs>
              <pattern id="loss-grid2" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={INK} strokeOpacity="0.07" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x={lossPad} y={12} width={lossW - 2 * lossPad} height={lossH - lossPad - 12} fill="#fffdf5" stroke={INK} strokeWidth={2} rx={4} />
            <rect x={lossPad} y={12} width={lossW - 2 * lossPad} height={lossH - lossPad - 12} fill="url(#loss-grid2)" />

            {lossHistory.length > 1 && (() => {
              const maxLoss = Math.max(...lossHistory, 0.01);
              const pts = lossHistory.map((l, i) => {
                const x = lossPad + (i / Math.max(lossHistory.length - 1, 1)) * (lossW - 2 * lossPad);
                const y = lossH - lossPad - (l / maxLoss) * (lossH - lossPad - 22);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              return (
                <>
                  <polyline points={pts.join(" ")} fill="none" stroke="#ff6b6b" strokeWidth={6} opacity={0.3} strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={pts.join(" ")} fill="none" stroke="#ff6b6b" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  {(() => {
                    const i = lossHistory.length - 1;
                    const x = lossPad + (i / Math.max(lossHistory.length - 1, 1)) * (lossW - 2 * lossPad);
                    const y = lossH - lossPad - (lossHistory[i] / maxLoss) * (lossH - lossPad - 22);
                    return <circle cx={x} cy={y} r={6} fill="#ffd93d" stroke={INK} strokeWidth={2} className="pulse-glow" style={{ color: "#ffd93d" }} />;
                  })()}
                </>
              );
            })()}

            <text x={lossW / 2} y={lossH - 8} textAnchor="middle" className="text-[10px] font-bold" fill={INK} fontFamily="Kalam">Epoch</text>
            <text x={12} y={lossH / 2} textAnchor="middle" className="text-[10px] font-bold" fill={INK} fontFamily="Kalam" transform={`rotate(-90 12 ${lossH / 2})`}>Loss</text>
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="card-sketchy p-3 max-w-2xl mx-auto" style={{ background: "#fff8e7" }}>
        <div className="flex flex-wrap gap-2 justify-center font-hand text-xs">
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-lav text-white">epoch <b>{epochCount}</b></span>
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">w1=<b>{w1.toFixed(3)}</b></span>
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">b1=<b>{b1.toFixed(3)}</b></span>
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">w2=<b>{w2.toFixed(3)}</b></span>
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">b2=<b>{b2.toFixed(3)}</b></span>
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-coral text-white">loss <b>{currentLoss.toFixed(4)}</b></span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={handlePlay} className="btn-sketchy text-sm">
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <InfoBox variant="green" title="Training Loop">
        <span className="font-hand text-base">
          Each epoch: forward pass (predict) → backprop (compute gradients) → update (adjust weights). Watch the purple line crawl toward the dashed mint target line as the loss curve plummets! Try cranking the learning rate up to see it overshoot.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What does backpropagation compute?",
    options: [
      "The forward pass output",
      "How much each weight contributed to the error",
      "The number of layers needed",
      "The best activation function",
    ],
    correctIndex: 1,
    explanation:
      "Backpropagation computes the gradient of the error with respect to each weight, telling us how to adjust them to reduce the error.",
  },
  {
    question: "What mathematical rule makes backpropagation possible?",
    options: [
      "The Pythagorean theorem",
      "The chain rule of calculus",
      "The quadratic formula",
      "The law of large numbers",
    ],
    correctIndex: 1,
    explanation:
      "The chain rule lets us compute how a change in any weight propagates through multiple layers to affect the final output.",
  },
  {
    question: "In what direction does backpropagation flow?",
    options: [
      "From input to output",
      "From output back to input",
      "Sideways between layers",
      "In a random direction",
    ],
    correctIndex: 1,
    explanation:
      "Backpropagation flows backward: it starts at the output error and propagates gradients back through each layer toward the inputs.",
  },
  {
    question: "What happens to the loss during successful training?",
    options: [
      "It increases steadily",
      "It stays the same",
      "It decreases over time",
      "It oscillates randomly forever",
    ],
    correctIndex: 2,
    explanation:
      "During successful training, the loss decreases as the network adjusts its weights to make better predictions.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function L21_BackpropagationActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "error-flows",
        label: "Error Flows Backward",
        icon: <ArrowLeftRight className="w-4 h-4" />,
        content: <ErrorFlowsTab />,
      },
      {
        id: "chain-rule",
        label: "Loss Landscape",
        icon: <Mountain className="w-4 h-4" />,
        content: <ChainRuleTab />,
      },
      {
        id: "watch-learn",
        label: "Watch It Learn",
        icon: <Link2 className="w-4 h-4" />,
        content: <WatchItLearnTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Backpropagation"
      level={6}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Dive into gradient descent -- the engine behind all ML training!"
      story={
        <StorySection
          paragraphs={[
            "Aru watched the neural network solve XOR in the last lesson, but something was bothering her.",
            "Aru: \"The network learned, but HOW? How does it know which weights to change and by how much?\"",
            "Byte: \"Great question! It works backwards! First, it checks the error at the output -- how wrong was the prediction? Then it figures out how much each weight contributed to that error. Finally, it adjusts each weight a little bit to reduce the error. That's backpropagation!\"",
            "Aru: \"So it's like tracing blame backward through the network?\"",
            "Byte: \"Exactly! If the output is wrong, we ask: which weights caused this? And then we fix them. Do this thousands of times, and the network learns!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Backpropagation is the algorithm that lets neural networks learn. It computes the gradient of the error with respect to each weight using the chain rule, then adjusts weights in the direction that reduces the error. This process repeats for many epochs until the network converges."
        />
      }
    />
  );
}
