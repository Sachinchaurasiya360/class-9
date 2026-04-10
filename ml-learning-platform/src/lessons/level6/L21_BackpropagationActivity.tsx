"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowLeftRight, Link2, Play, RotateCcw, Shuffle, Pause } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

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

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const sigmoidDeriv = (x: number) => { const s = sigmoid(x); return s * (1 - s); };
const INK = "#2b2a35";

/* ------------------------------------------------------------------ */
/*  Tab 1  Error Flows Backward                                       */
/* ------------------------------------------------------------------ */

function ErrorFlowsTab() {
  const [phase, setPhase] = useState<"forward" | "error" | "backprop" | "updated">("forward");
  const [seed, setSeed] = useState(21);
  const [target, setTarget] = useState(1.0);
  const [lr, setLr] = useState(0.5);

  const rng = useMemo(() => mulberry32(seed), [seed]);
  const net = useMemo(() => {
    const r = rng;
    return {
      wH: [[r() * 2 - 1, r() * 2 - 1], [r() * 2 - 1, r() * 2 - 1]],
      bH: [r() * 0.4 - 0.2, r() * 0.4 - 0.2],
      wO: [r() * 2 - 1, r() * 2 - 1],
      bO: r() * 0.4 - 0.2,
    };
  }, [rng]);

  const inputs = [0.5, 0.8];

  const h0Raw = net.wH[0][0] * inputs[0] + net.wH[0][1] * inputs[1] + net.bH[0];
  const h1Raw = net.wH[1][0] * inputs[0] + net.wH[1][1] * inputs[1] + net.bH[1];
  const h0 = sigmoid(h0Raw);
  const h1 = sigmoid(h1Raw);
  const oRaw = net.wO[0] * h0 + net.wO[1] * h1 + net.bO;
  const output = sigmoid(oRaw);
  const error = target - output;

  const dOut = error * sigmoidDeriv(oRaw);
  const dH0 = dOut * net.wO[0] * sigmoidDeriv(h0Raw);
  const dH1 = dOut * net.wO[1] * sigmoidDeriv(h1Raw);

  const newWO = [net.wO[0] + lr * dOut * h0, net.wO[1] + lr * dOut * h1];
  const newWH0 = [net.wH[0][0] + lr * dH0 * inputs[0], net.wH[0][1] + lr * dH0 * inputs[1]];
  const newWH1 = [net.wH[1][0] + lr * dH1 * inputs[0], net.wH[1][1] + lr * dH1 * inputs[1]];

  const handleNext = useCallback(() => {
    playClick();
    setPhase((p) => {
      if (p === "forward") return "error";
      if (p === "error") return "backprop";
      if (p === "backprop") { playSuccess(); return "updated"; }
      return "forward";
    });
  }, []);

  const handleReset = useCallback(() => {
    playClick();
    setPhase("forward");
    setSeed((s) => s + 1);
  }, []);

  const W = 560, H = 260;
  const inX = 70, hX = 270, oX = 470;
  const inYs = [100, 160];
  const hYs = [100, 160];
  const oY = 130;

  const showForward = phase === "forward";
  const showError = phase === "error" || phase === "backprop" || phase === "updated";
  const showGrad = phase === "backprop" || phase === "updated";
  const showUpdated = phase === "updated";

  const phaseLabels = ["forward", "error", "backprop", "updated"] as const;
  const phaseTitles = ["1. Forward", "2. Error", "3. Backprop", "4. Update"];

  return (
    <div className="space-y-5">
      {/* Phase pills */}
      <div className="flex gap-2 justify-center flex-wrap">
        {phaseLabels.map((p, i) => {
          const idx = phaseLabels.indexOf(phase);
          const active = phase === p;
          const passed = i <= idx;
          return (
            <div
              key={p}
              className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
                active ? "bg-accent-coral text-white shadow-[3px_3px_0_#2b2a35]" : passed ? "bg-accent-yellow" : "bg-background text-muted-foreground"
              }`}
            >
              {phaseTitles[i]}
            </div>
          );
        })}
      </div>

      {/* Customization */}
      <div className="card-sketchy p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-hand text-sm font-bold flex justify-between">
            <span>Target output</span>
            <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-mint">{target.toFixed(2)}</span>
          </label>
          <input type="range" min={0} max={1} step={0.05} value={target} onChange={(e) => { playPop(); setTarget(parseFloat(e.target.value)); }} className="w-full" style={{ accentColor: "#4ecdc4" }} />
        </div>
        <div>
          <label className="font-hand text-sm font-bold flex justify-between">
            <span>Learning rate</span>
            <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-lav text-white">{lr.toFixed(2)}</span>
          </label>
          <input type="range" min={0.1} max={2} step={0.05} value={lr} onChange={(e) => setLr(parseFloat(e.target.value))} className="w-full" style={{ accentColor: "#b18cf2" }} />
        </div>
      </div>

      {/* Network */}
      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[600px] mx-auto">
          <defs>
            <radialGradient id="bp-in"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#6bb6ff" /></radialGradient>
            <radialGradient id="bp-h"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#b18cf2" /></radialGradient>
            <radialGradient id="bp-out-good"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#4ecdc4" /></radialGradient>
            <radialGradient id="bp-out-bad"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#ff6b6b" /></radialGradient>
          </defs>

          {/* ---------- FORWARD connections (input → hidden) ---------- */}
          {inYs.map((iy, ii) =>
            hYs.map((hy, hi) => {
              const grad = hi === 0 ? dH0 : dH1;
              return (
                <g key={`ih-${ii}-${hi}`}>
                  <line
                    x1={inX + 26} y1={iy} x2={hX - 26} y2={hy}
                    stroke={showGrad ? (grad > 0 ? "#6bb6ff" : "#ff6b6b") : "#cbd5e1"}
                    strokeWidth={showGrad ? 1.2 + Math.min(Math.abs(grad) * 12, 4) : 1.5}
                    strokeOpacity={showGrad ? 0.85 : 0.6}
                    strokeLinecap="round"
                    className={showForward ? "signal-flow" : ""}
                    style={showForward ? { color: "#6bb6ff", animationDuration: "1.4s" } : undefined}
                  />
                  {showForward && (
                    <circle r={3.5} fill="#ffd93d" stroke={INK} strokeWidth={0.8}>
                      <animateMotion dur="1.4s" repeatCount="indefinite" path={`M${inX + 26},${iy} L${hX - 26},${hy}`} />
                    </circle>
                  )}
                </g>
              );
            }),
          )}

          {/* ---------- FORWARD connections (hidden → output) ---------- */}
          {hYs.map((hy, hi) => (
            <g key={`ho-${hi}`}>
              <line
                x1={hX + 26} y1={hy} x2={oX - 28} y2={oY}
                stroke={showGrad ? (dOut > 0 ? "#4ecdc4" : "#ff6b6b") : "#cbd5e1"}
                strokeWidth={showGrad ? 1.5 + Math.min(Math.abs(dOut) * 12, 4) : 1.5}
                strokeLinecap="round"
                className={showForward ? "signal-flow" : ""}
                style={showForward ? { color: "#4ecdc4", animationDuration: "1.4s" } : undefined}
              />
              {showForward && (
                <circle r={3.5} fill="#ffd93d" stroke={INK} strokeWidth={0.8}>
                  <animateMotion dur="1.4s" repeatCount="indefinite" path={`M${hX + 26},${hy} L${oX - 28},${oY}`} />
                </circle>
              )}
            </g>
          ))}

          {/* ---------- BACKWARD error pulses ---------- */}
          {showGrad && hYs.map((hy, hi) => (
            <circle key={`back-o-${hi}`} r={5} fill="#ff6b6b" stroke={INK} strokeWidth={1}>
              <animateMotion dur="1.6s" repeatCount="indefinite" path={`M${oX - 28},${oY} L${hX + 26},${hy}`} />
            </circle>
          ))}
          {showGrad && inYs.map((iy, ii) =>
            hYs.map((hy, hi) => (
              <circle key={`back-h-${ii}-${hi}`} r={4} fill="#ff6b6b" stroke={INK} strokeWidth={1}>
                <animateMotion dur="1.8s" repeatCount="indefinite" path={`M${hX - 26},${hy} L${inX + 26},${iy}`} />
              </circle>
            ))
          )}

          {/* ---------- Input nodes ---------- */}
          {inYs.map((y, i) => (
            <g key={`in-${i}`}>
              <circle cx={inX} cy={y} r={24} fill="url(#bp-in)" stroke={INK} strokeWidth={2.5} className="pulse-glow" style={{ color: "#6bb6ff" }} />
              <text x={inX} y={y + 5} textAnchor="middle" className="text-[13px] font-bold" fill="#fff" fontFamily="Kalam">{inputs[i]}</text>
              <text x={inX} y={y - 30} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">x{i + 1}</text>
            </g>
          ))}

          {/* ---------- Hidden nodes ---------- */}
          {hYs.map((y, i) => (
            <g key={`h-${i}`} className={showUpdated ? "wobble" : ""}>
              <circle cx={hX} cy={y} r={24} fill="url(#bp-h)" stroke={INK} strokeWidth={2.5} className="pulse-glow" style={{ color: "#b18cf2" }} />
              <text x={hX} y={y + 5} textAnchor="middle" className="text-[12px] font-bold" fill="#fff" fontFamily="Kalam">
                {(i === 0 ? h0 : h1).toFixed(2)}
              </text>
              {showGrad && (
                <text x={hX} y={y + 42} textAnchor="middle" className="text-[10px] font-bold" fill="#ff6b6b" fontFamily="Kalam">
                  ∇={(i === 0 ? dH0 : dH1).toFixed(3)}
                </text>
              )}
            </g>
          ))}

          {/* ---------- Output node ---------- */}
          <g>
            {showError && (
              <>
                <circle cx={oX} cy={oY} r={32} fill="none" stroke="#ff6b6b" strokeWidth={2.5} className="fire-ring" />
                <circle cx={oX} cy={oY} r={32} fill="none" stroke="#ffd93d" strokeWidth={2} className="fire-ring" style={{ animationDelay: "0.4s" }} />
              </>
            )}
            <circle
              cx={oX} cy={oY} r={28}
              fill={showError ? "url(#bp-out-bad)" : "url(#bp-out-good)"}
              stroke={INK} strokeWidth={2.5}
              className="pulse-glow"
              style={{ color: showError ? "#ff6b6b" : "#4ecdc4" }}
            />
            <text x={oX} y={oY + 6} textAnchor="middle" className="text-[14px] font-bold" fill="#fff" fontFamily="Kalam">
              {output.toFixed(2)}
            </text>
            {showError && (
              <text x={oX} y={oY + 48} textAnchor="middle" className="text-[12px] font-bold" fill="#ff6b6b" fontFamily="Kalam">
                err={error.toFixed(3)}
              </text>
            )}
          </g>

          {/* Target marker */}
          <g>
            <text x={oX + 50} y={oY - 8} className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">target</text>
            <rect x={oX + 42} y={oY - 4} width={36} height={20} rx={4} fill="#4ecdc4" stroke={INK} strokeWidth={2} />
            <text x={oX + 60} y={oY + 11} textAnchor="middle" className="text-[12px] font-bold" fill="#fff" fontFamily="Kalam">{target.toFixed(2)}</text>
          </g>

          {/* Layer labels */}
          <text x={inX} y={32} textAnchor="middle" className="text-[12px] font-bold" fill={INK} fontFamily="Kalam">INPUT</text>
          <text x={hX} y={32} textAnchor="middle" className="text-[12px] font-bold" fill="#b18cf2" fontFamily="Kalam">HIDDEN</text>
          <text x={oX} y={32} textAnchor="middle" className="text-[12px] font-bold" fill={INK} fontFamily="Kalam">OUTPUT</text>

          {/* Convergence sparks on update phase */}
          {showUpdated && Array.from({ length: 8 }).map((_, k) => {
            const a = (k / 8) * Math.PI * 2;
            return (
              <line key={`sp-${k}`}
                x1={oX} y1={oY}
                x2={oX + Math.cos(a) * 52} y2={oY + Math.sin(a) * 52}
                stroke="#ffd93d" strokeWidth={2.5} strokeLinecap="round"
                className="spark" style={{ animationDelay: `${k * 0.05}s` }}
              />
            );
          })}

          {/* Backflow caption */}
          {showGrad && (
            <text x={W / 2} y={H - 12} textAnchor="middle" className="text-[12px] font-bold" fill="#ff6b6b" fontFamily="Kalam">
              ◀ ◀ ◀ error flows backward ◀ ◀ ◀
            </text>
          )}
        </svg>
      </div>

      {/* Weight updates */}
      {showUpdated && (
        <div className="card-sketchy p-4 animate-fadeIn" style={{ background: "#e0f7f5" }}>
          <div className="font-hand text-base font-bold mb-2">
            <span className="marker-highlight-mint">Weights updated!</span>
          </div>
          <div className="font-hand text-xs space-y-1">
            <div className="bg-background px-3 py-1.5 rounded border-2 border-foreground/30">
              <b>wO</b>: [{net.wO[0].toFixed(3)}, {net.wO[1].toFixed(3)}] → <span className="font-bold" style={{ color: "#4ecdc4" }}>[{newWO[0].toFixed(3)}, {newWO[1].toFixed(3)}]</span>
            </div>
            <div className="bg-background px-3 py-1.5 rounded border-2 border-foreground/30">
              <b>wH₁</b>: [{net.wH[0][0].toFixed(3)}, {net.wH[0][1].toFixed(3)}] → <span className="font-bold" style={{ color: "#b18cf2" }}>[{newWH0[0].toFixed(3)}, {newWH0[1].toFixed(3)}]</span>
            </div>
            <div className="bg-background px-3 py-1.5 rounded border-2 border-foreground/30">
              <b>wH₂</b>: [{net.wH[1][0].toFixed(3)}, {net.wH[1][1].toFixed(3)}] → <span className="font-bold" style={{ color: "#b18cf2" }}>[{newWH1[0].toFixed(3)}, {newWH1[1].toFixed(3)}]</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button onClick={handleNext} className="btn-sketchy text-sm">
          <Play className="w-4 h-4" />
          {phase === "forward" ? "Show Error" : phase === "error" ? "Backpropagate" : phase === "backprop" ? "Update Weights" : "Start Over"}
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          <Shuffle className="w-4 h-4" />
          New Weights
        </button>
      </div>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          🔄 Backprop in 4 steps: forward → measure error → flow gradients backward → nudge each weight. Watch the red error pulses race backward through the network in step 3!
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Chain Rule Visualized                                      */
/* ------------------------------------------------------------------ */

function ChainRuleTab() {
  const [inputVal, setInputVal] = useState(1.0);
  const [w1, setW1] = useState(0.8);
  const [w2, setW2] = useState(1.2);
  const b1 = 0.2, b2 = -0.3;

  const hRaw = w1 * inputVal + b1;
  const hVal = sigmoid(hRaw);
  const oRaw = w2 * hVal + b2;
  const oVal = sigmoid(oRaw);

  const dOdH = sigmoidDeriv(oRaw) * w2;
  const dHdI = sigmoidDeriv(hRaw) * w1;
  const dOdI = dOdH * dHdI;

  const W = 540, H = 220;

  return (
    <div className="space-y-5">
      {/* Input + weight sliders */}
      <div className="card-sketchy p-4 grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ background: "#fff8e7" }}>
        <div>
          <label className="font-hand text-sm font-bold flex justify-between">
            <span>Input</span>
            <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-sky text-white">{inputVal.toFixed(2)}</span>
          </label>
          <input type="range" min={-3} max={3} step={0.1} value={inputVal} onChange={(e) => { playPop(); setInputVal(parseFloat(e.target.value)); }} className="w-full" style={{ accentColor: "#6bb6ff" }} />
        </div>
        <div>
          <label className="font-hand text-sm font-bold flex justify-between">
            <span>w1</span>
            <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-lav text-white">{w1.toFixed(2)}</span>
          </label>
          <input type="range" min={-2} max={2} step={0.05} value={w1} onChange={(e) => setW1(parseFloat(e.target.value))} className="w-full" style={{ accentColor: "#b18cf2" }} />
        </div>
        <div>
          <label className="font-hand text-sm font-bold flex justify-between">
            <span>w2</span>
            <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-mint">{w2.toFixed(2)}</span>
          </label>
          <input type="range" min={-2} max={2} step={0.05} value={w2} onChange={(e) => setW2(parseFloat(e.target.value))} className="w-full" style={{ accentColor: "#4ecdc4" }} />
        </div>
      </div>

      {/* Diagram */}
      <div className="card-sketchy p-4 notebook-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[560px] mx-auto">
          <defs>
            <radialGradient id="cr-in"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#6bb6ff" /></radialGradient>
            <radialGradient id="cr-h"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#b18cf2" /></radialGradient>
            <radialGradient id="cr-o"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#4ecdc4" /></radialGradient>
          </defs>

          {/* Forward arrows */}
          <line x1={88} y1={100} x2={232} y2={100} stroke="#6bb6ff" strokeWidth={3} strokeLinecap="round" className="signal-flow" style={{ color: "#6bb6ff" }} />
          <circle r={4} fill="#ffd93d" stroke={INK} strokeWidth={1}>
            <animateMotion dur="1.4s" repeatCount="indefinite" path="M88,100 L232,100" />
          </circle>
          <text x={160} y={88} textAnchor="middle" className="text-[12px] font-bold" fill={INK} fontFamily="Kalam">w1={w1.toFixed(1)}</text>

          <line x1={272} y1={100} x2={416} y2={100} stroke="#4ecdc4" strokeWidth={3} strokeLinecap="round" className="signal-flow" style={{ color: "#4ecdc4" }} />
          <circle r={4} fill="#ffd93d" stroke={INK} strokeWidth={1}>
            <animateMotion dur="1.4s" repeatCount="indefinite" path="M272,100 L416,100" />
          </circle>
          <text x={344} y={88} textAnchor="middle" className="text-[12px] font-bold" fill={INK} fontFamily="Kalam">w2={w2.toFixed(1)}</text>

          {/* Backward gradient arrows */}
          <line x1={416} y1={140} x2={272} y2={140} stroke="#ff6b6b" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="6 4" />
          <circle r={4} fill="#ff6b6b" stroke={INK} strokeWidth={1}>
            <animateMotion dur="1.6s" repeatCount="indefinite" path="M416,140 L272,140" />
          </circle>
          <text x={344} y={158} textAnchor="middle" className="text-[11px] font-bold" fill="#ff6b6b" fontFamily="Kalam">
            ∂O/∂H = {dOdH.toFixed(3)}
          </text>

          <line x1={232} y1={140} x2={88} y2={140} stroke="#ff6b6b" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="6 4" />
          <circle r={4} fill="#ff6b6b" stroke={INK} strokeWidth={1}>
            <animateMotion dur="1.8s" repeatCount="indefinite" path="M232,140 L88,140" />
          </circle>
          <text x={160} y={158} textAnchor="middle" className="text-[11px] font-bold" fill="#ff6b6b" fontFamily="Kalam">
            ∂H/∂I = {dHdI.toFixed(3)}
          </text>

          {/* Nodes */}
          <circle cx={60} cy={100} r={28} fill="url(#cr-in)" stroke={INK} strokeWidth={2.5} className="pulse-glow" style={{ color: "#6bb6ff" }} />
          <text x={60} y={94} textAnchor="middle" className="text-[10px] font-bold" fill="#fff" fontFamily="Kalam">input</text>
          <text x={60} y={108} textAnchor="middle" className="text-[14px] font-bold" fill="#fff" fontFamily="Kalam">{inputVal.toFixed(2)}</text>

          <circle cx={252} cy={100} r={28} fill="url(#cr-h)" stroke={INK} strokeWidth={2.5} className="pulse-glow" style={{ color: "#b18cf2" }} />
          <text x={252} y={94} textAnchor="middle" className="text-[10px] font-bold" fill="#fff" fontFamily="Kalam">hidden</text>
          <text x={252} y={108} textAnchor="middle" className="text-[13px] font-bold" fill="#fff" fontFamily="Kalam">{hVal.toFixed(3)}</text>

          <circle cx={444} cy={100} r={28} fill="url(#cr-o)" stroke={INK} strokeWidth={2.5} className="pulse-glow" style={{ color: "#4ecdc4" }} />
          <text x={444} y={94} textAnchor="middle" className="text-[10px] font-bold" fill="#fff" fontFamily="Kalam">output</text>
          <text x={444} y={108} textAnchor="middle" className="text-[13px] font-bold" fill="#fff" fontFamily="Kalam">{oVal.toFixed(3)}</text>

          {/* Chain rule equation */}
          <text x={W / 2} y={200} textAnchor="middle" className="text-[13px] font-bold" fill={INK} fontFamily="Kalam">
            ∂O/∂I = {dOdH.toFixed(3)} × {dHdI.toFixed(3)} = <tspan fill="#ff6b6b">{dOdI.toFixed(4)}</tspan>
          </text>
        </svg>
      </div>

      <div className="card-sketchy p-4 space-y-2" style={{ background: "#fff0f0" }}>
        <div className="font-hand text-base font-bold">
          <span className="marker-highlight-coral">The Chain Rule in Action</span>
        </div>
        <div className="font-hand text-sm">
          To know how changing the <span className="font-bold" style={{ color: "#6bb6ff" }}>input</span> affects the <span className="font-bold" style={{ color: "#4ecdc4" }}>output</span>, multiply gradients along the chain:
        </div>
        <div className="font-hand text-base text-center bg-background px-3 py-2 rounded border-2 border-foreground/30">
          <span style={{ color: "#ff6b6b" }} className="font-bold">∂Output/∂Input</span> = <span style={{ color: "#ff6b6b" }} className="font-bold">∂Output/∂Hidden</span> × <span style={{ color: "#ff6b6b" }} className="font-bold">∂Hidden/∂Input</span>
        </div>
        <div className="font-hand text-sm">
          If we nudge the input by a tiny bit, the output changes by{" "}
          <span className="font-bold marker-highlight-yellow">{dOdI.toFixed(4)}</span>.
        </div>
      </div>

      <InfoBox variant="amber" title="The Chain Rule">
        <span className="font-hand text-base">
          🔗 The chain rule lets us compute how each weight affects the final output by multiplying gradients along the path. This is the math behind backprop! Try sliding w1 and w2  when both flip sign, the gradient flips too.
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
          🎢 Each epoch: forward pass (predict) → backprop (compute gradients) → update (adjust weights). Watch the purple line crawl toward the dashed mint target line as the loss curve plummets! Try cranking the learning rate up to see it overshoot.
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
        label: "Chain Rule Visualized",
        icon: <Link2 className="w-4 h-4" />,
        content: <ChainRuleTab />,
      },
      {
        id: "watch-learn",
        label: "Watch It Learn",
        icon: <Play className="w-4 h-4" />,
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
