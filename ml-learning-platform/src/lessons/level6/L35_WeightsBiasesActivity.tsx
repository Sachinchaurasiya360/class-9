"use client";

import { useState, useMemo } from "react";
import { Sliders, Scale, Target, Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const SKY = "#6bb6ff";
const PEACH = "#ffb88c";
const PAPER = "#fffdf5";

const THEMES = [
  { name: "Coral",    node: "#ff6b6b", glow: "#ff8a8a", accent: "#ffd93d" },
  { name: "Mint",     node: "#4ecdc4", glow: "#7ee0d8", accent: "#ffd93d" },
  { name: "Lavender", node: "#b18cf2", glow: "#c9adf7", accent: "#ffd93d" },
  { name: "Sky",      node: "#6bb6ff", glow: "#94caff", accent: "#ffd93d" },
  { name: "Sunset",   node: "#ffb88c", glow: "#ffd0b3", accent: "#ff6b6b" },
];

function ThemePicker({ idx, setIdx }: { idx: number; setIdx: (i: number) => void }) {
  return (
    <div className="card-sketchy p-3 flex items-center justify-center gap-2">
      <Palette className="w-4 h-4 text-foreground/60" />
      <span className="font-hand text-sm font-bold">Theme:</span>
      <div className="flex gap-1.5">
        {THEMES.map((t, i) => (
          <button
            key={t.name}
            onClick={() => { playClick(); setIdx(i); }}
            title={t.name}
            className={`w-6 h-6 rounded-full border-2 transition-transform ${idx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
            style={{ background: t.node }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 – What is a weight? (single input)                          */
/* ------------------------------------------------------------------ */

function SingleWeightTab() {
  const [input, setInput] = useState(5);
  const [weight, setWeight] = useState(2);
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = THEMES[themeIdx];

  const output = input * weight;
  const W = 460;
  const intensity = Math.min(1, Math.abs(weight) / 5);

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        A <b>weight</b> is just a number that says how IMPORTANT an input is.
      </p>

      <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />

      <div className="card-sketchy p-4 notebook-grid">
        <svg width="100%" viewBox={`0 0 ${W} 200`} style={{ maxHeight: 240 }}>
          <defs>
            <radialGradient id="sw-in" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor={SKY} />
            </radialGradient>
            <radialGradient id="sw-neuron" cx="35%" cy="30%">
              <stop offset="0%" stopColor={theme.glow} />
              <stop offset="100%" stopColor={theme.node} />
            </radialGradient>
            <radialGradient id="sw-out" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff8a0" />
              <stop offset="100%" stopColor={theme.accent} />
            </radialGradient>
            <marker id="sw-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
              <path d="M0,0 L10,4 L0,8 Z" fill={INK} />
            </marker>
          </defs>

          {/* Glowing weight line */}
          <line x1="94" y1="100" x2="216" y2="100"
            stroke={weight >= 0 ? theme.node : "#ff6b6b"}
            strokeWidth={2 + intensity * 5}
            strokeLinecap="round"
            opacity={0.35}
          />
          <line x1="94" y1="100" x2="216" y2="100"
            stroke={weight >= 0 ? theme.node : "#ff6b6b"}
            strokeWidth={1.5 + intensity * 3}
            strokeLinecap="round"
            className="signal-flow"
            style={{ color: theme.node, animationDuration: "1.2s" }}
            markerEnd="url(#sw-arrow)"
          />
          <circle r={4} fill={theme.accent} stroke={INK} strokeWidth={1}>
            <animateMotion dur="1.2s" repeatCount="indefinite" path="M94,100 L216,100" />
          </circle>

          {/* Input node */}
          <circle cx="60" cy="100" r="34" fill="url(#sw-in)" stroke={INK} strokeWidth="2.5" className="pulse-glow" style={{ color: SKY }} />
          <text x="60" y="95" textAnchor="middle" fill="#fff" fontFamily="Kalam" style={{ fontSize: 11, fontWeight: 700 }}>INPUT</text>
          <text x="60" y="115" textAnchor="middle" fill="#fff" fontFamily="Kalam" style={{ fontSize: 20, fontWeight: 700 }}>{input}</text>

          {/* Weight badge */}
          <rect x="125" y="65" width="60" height="24" rx="3" fill={YELLOW} stroke={INK} strokeWidth="2" />
          <text x="155" y="82" textAnchor="middle" fill={INK} fontFamily="Kalam" style={{ fontSize: 13, fontWeight: 700 }}>×{weight}</text>

          {/* Neuron */}
          <circle cx="250" cy="100" r="36" fill="url(#sw-neuron)" stroke={INK} strokeWidth="2.5" className="pulse-glow" style={{ color: theme.node }} />
          <circle cx="250" cy="100" r="36" fill="none" stroke={theme.node} strokeWidth="2" strokeDasharray="3 4" className="wobble" opacity={0.55} />
          <text x="250" y="95" textAnchor="middle" fill="#fff" fontFamily="Kalam" style={{ fontSize: 11, fontWeight: 700 }}>NEURON</text>
          <text x="250" y="115" textAnchor="middle" fill="#fff" fontFamily="Kalam" style={{ fontSize: 16, fontWeight: 700 }}>⚡</text>

          {/* Output arrow */}
          <line x1="288" y1="100" x2="356" y2="100" stroke={INK} strokeWidth="2.5" markerEnd="url(#sw-arrow)" />

          {/* Output */}
          <circle cx="396" cy="100" r="28" fill="url(#sw-out)" stroke={INK} strokeWidth="2.5" className="pulse-glow" style={{ color: theme.accent }} />
          <text x="396" y="106" textAnchor="middle" fill={INK} fontFamily="Kalam" style={{ fontSize: 18, fontWeight: 700 }}>{output}</text>

          {/* Equation */}
          <text x={W / 2} y="180" textAnchor="middle" fill={INK} fontFamily="Kalam" style={{ fontSize: 14 }}>
            output = input × weight = {input} × {weight} = {output}
          </text>
        </svg>
      </div>

      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        <div>
          <p className="font-hand text-sm font-bold text-foreground">
            Input value: <span style={{ color: SKY }}>{input}</span>
          </p>
          <input type="range" min={-10} max={10} value={input}
            onChange={(e) => { playPop(); setInput(Number(e.target.value)); }} className="w-full" style={{ accentColor: SKY }} />
        </div>
        <div>
          <p className="font-hand text-sm font-bold text-foreground">
            Weight: <span style={{ color: CORAL }}>{weight}</span>
          </p>
          <input type="range" min={-3} max={5} step={0.5} value={weight}
            onChange={(e) => { playPop(); setWeight(Number(e.target.value)); }} className="w-full" style={{ accentColor: theme.node }} />
        </div>
        <p className="font-hand text-xs text-muted-foreground">
          Try a weight of 0 — the input gets ignored. Try a negative weight — it flips the sign!
        </p>
      </div>

      <InfoBox variant="blue">
        Big weight = "this input matters a lot." Small weight = "barely listen to this one."
        Negative weight = "this input ARGUES against firing."
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Multiple inputs + bias                                     */
/* ------------------------------------------------------------------ */

function MultiInputTab() {
  const [w1, setW1] = useState(2);
  const [w2, setW2] = useState(3);
  const [w3, setW3] = useState(1);
  const [bias, setBias] = useState(0);
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = THEMES[themeIdx];

  // Fixed inputs (e.g. studied hours, slept hours, ate breakfast)
  const inputs = [
    { name: "Hours studied", val: 4, color: CORAL },
    { name: "Hours slept", val: 7, color: MINT },
    { name: "Ate breakfast", val: 1, color: SKY },
  ];
  const weights = [w1, w2, w3];

  const products = inputs.map((inp, i) => inp.val * weights[i]);
  const sum = products.reduce((a, b) => a + b, 0) + bias;
  const fires = sum > 15;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Real neurons combine MANY inputs. The neuron will "fire" if the total is above 15.
      </p>

      <ThemePicker idx={themeIdx} setIdx={setThemeIdx} />

      <div className="card-sketchy p-4 notebook-grid">
        <svg width="100%" viewBox="0 0 460 220" style={{ maxHeight: 280 }}>
          <defs>
            <radialGradient id="mi-neuron" cx="35%" cy="30%">
              <stop offset="0%" stopColor={theme.glow} />
              <stop offset="100%" stopColor={theme.node} />
            </radialGradient>
            <radialGradient id="mi-fire" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#fff3a0" />
              <stop offset="60%" stopColor={theme.accent} />
              <stop offset="100%" stopColor={theme.node} />
            </radialGradient>
          </defs>
          {/* Inputs */}
          {inputs.map((inp, i) => {
            const y = 40 + i * 60;
            const wAbs = Math.abs(weights[i]);
            return (
              <g key={i}>
                <circle cx="60" cy={y} r="22" fill={inp.color}
                  stroke={INK} strokeWidth="2.5" className="pulse-glow" style={{ color: inp.color }} />
                <text x="60" y={y + 5} textAnchor="middle" fill="#fff"
                  style={{ fontFamily: "Kalam, cursive", fontSize: 16, fontWeight: 700 }}>
                  {inp.val}
                </text>
                <text x="60" y={y - 30} textAnchor="middle" fill={INK}
                  style={{ fontFamily: "Patrick Hand, cursive", fontSize: 10 }}>
                  {inp.name}
                </text>

                {/* Glow underlay */}
                <line x1="82" y1={y} x2="248" y2="110"
                  stroke={weights[i] >= 0 ? theme.node : "#ff6b6b"}
                  strokeWidth={Math.max(2, wAbs * 1.2 + 2)}
                  opacity={0.3} strokeLinecap="round"
                />
                {/* Animated weight line */}
                <line x1="82" y1={y} x2="248" y2="110"
                  stroke={weights[i] >= 0 ? theme.node : "#ff6b6b"}
                  strokeWidth={Math.max(1, wAbs * 0.9)}
                  className="signal-flow" strokeLinecap="round"
                  style={{ color: theme.node, animationDuration: "1.4s" }}
                />
                <circle r={3} fill={theme.accent} stroke={INK} strokeWidth={0.8}>
                  <animateMotion dur="1.4s" repeatCount="indefinite" path={`M82,${y} L248,110`} />
                </circle>

                {/* Weight label */}
                <rect x={(82 + 248) / 2 - 22} y={(y + 110) / 2 - 9} width="44" height="18"
                  fill={YELLOW} stroke={INK} strokeWidth="1.5" rx="2" />
                <text x={(82 + 248) / 2} y={(y + 110) / 2 + 4} textAnchor="middle"
                  fill={INK} style={{ fontFamily: "Kalam, cursive", fontSize: 11, fontWeight: 700 }}>
                  ×{weights[i]}
                </text>
              </g>
            );
          })}

          {/* Fire rings + sparks when neuron fires */}
          {fires && (
            <>
              <circle cx="280" cy="110" r="38" fill="none" stroke={theme.accent} strokeWidth={3} className="fire-ring" />
              <circle cx="280" cy="110" r="38" fill="none" stroke={theme.node} strokeWidth={2} className="fire-ring" style={{ animationDelay: "0.4s" }} />
              {Array.from({ length: 8 }).map((_, k) => {
                const a = (k / 8) * Math.PI * 2;
                return (
                  <line key={k}
                    x1={280} y1={110}
                    x2={280 + Math.cos(a) * 56} y2={110 + Math.sin(a) * 56}
                    stroke={theme.accent} strokeWidth={2.5} strokeLinecap="round"
                    className="spark" style={{ animationDelay: `${k * 0.04}s` }}
                  />
                );
              })}
            </>
          )}
          {/* Neuron */}
          <circle cx="280" cy="110" r="38" fill={fires ? "url(#mi-fire)" : "url(#mi-neuron)"}
            stroke={INK} strokeWidth="2.5" className="pulse-glow" style={{ color: fires ? theme.accent : theme.node }} />
          <text x="280" y="100" textAnchor="middle" fill={INK}
            style={{ fontFamily: "Patrick Hand, cursive", fontSize: 11 }}>
            sum
          </text>
          <text x="280" y="120" textAnchor="middle" fill={INK}
            style={{ fontFamily: "Kalam, cursive", fontSize: 18, fontWeight: 700 }}>
            {sum.toFixed(1)}
          </text>

          {/* Bias arrow from above */}
          <line x1="280" y1="40" x2="280" y2="72" stroke={INK} strokeWidth="2" />
          <polygon points="276,72 284,72 280,80" fill={INK} />
          <rect x="252" y="20" width="56" height="22" rx="3"
            fill={PEACH} stroke={INK} strokeWidth="2" className="pulse-glow" style={{ color: PEACH }} />
          <text x="280" y="35" textAnchor="middle" fill={INK}
            style={{ fontFamily: "Kalam, cursive", fontSize: 12, fontWeight: 700 }}>
            +bias({bias})
          </text>

          {/* Output */}
          <line x1="318" y1="110" x2="396" y2="110" stroke={INK} strokeWidth="2" />
          <polygon points="396,106 404,110 396,114" fill={INK} />
          <rect x="404" y="92" width="50" height="36" rx="3"
            fill={fires ? MINT : "#eee"} stroke={INK} strokeWidth="2" />
          <text x="429" y="116" textAnchor="middle" fill={INK}
            style={{ fontFamily: "Kalam, cursive", fontSize: 13, fontWeight: 700 }}>
            {fires ? "FIRE" : "off"}
          </text>
        </svg>
      </div>

      {/* Sliders */}
      <div className="card-sketchy p-4 space-y-2" style={{ background: "#fff8e7" }}>
        {[
          { label: "Weight 1 (study)", val: w1, set: setW1 },
          { label: "Weight 2 (sleep)", val: w2, set: setW2 },
          { label: "Weight 3 (breakfast)", val: w3, set: setW3 },
        ].map((s) => (
          <div key={s.label}>
            <p className="font-hand text-xs font-bold text-foreground flex justify-between">
              <span>{s.label}</span>
              <span style={{ color: CORAL }}>{s.val}</span>
            </p>
            <input
              type="range"
              min={-3}
              max={5}
              step={0.5}
              value={s.val}
              onChange={(e) => { playPop(); s.set(Number(e.target.value)); }}
              className="w-full"
              style={{ accentColor: theme.node }}
            />
          </div>
        ))}
        <div>
          <p className="font-hand text-xs font-bold text-foreground flex justify-between">
            <span>Bias (constant nudge)</span>
            <span style={{ color: PEACH }}>{bias}</span>
          </p>
          <input
            type="range"
            min={-10}
            max={10}
            value={bias}
            onChange={(e) => { playPop(); setBias(Number(e.target.value)); }}
            className="w-full"
            style={{ accentColor: PEACH }}
          />
        </div>
      </div>

      <div className="card-sketchy p-3 text-center font-hand text-sm" style={{ background: PAPER }}>
        sum = (4 × {w1}) + (7 × {w2}) + (1 × {w3}) + {bias} ={" "}
        <b style={{ color: fires ? CORAL : INK }}>{sum.toFixed(1)}</b>
      </div>

      <InfoBox variant="amber">
        The <b>bias</b> is like a "default mood" — a constant nudge added to the
        sum. It lets the neuron fire even when all inputs are zero, or refuse
        to fire even when they're all big.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Tuning challenge                                           */
/* ------------------------------------------------------------------ */

const CHALLENGES = [
  {
    title: "Make the neuron output 20",
    inputs: [3, 4],
    target: 20,
    hint: "Try making both weights bigger.",
  },
  {
    title: "Make the neuron output 0 (without using zero weights)",
    inputs: [5, 5],
    target: 0,
    hint: "Try a positive weight on one and a negative on the other.",
  },
  {
    title: "Make the neuron output -10",
    inputs: [2, 3],
    target: -10,
    hint: "Negative weights flip the sign of inputs.",
  },
];

function ChallengeTab() {
  const [round, setRound] = useState(0);
  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(1);

  const c = CHALLENGES[round];
  const out = c.inputs[0] * w1 + c.inputs[1] * w2;
  const diff = Math.abs(out - c.target);
  const won = diff < 0.5;

  function next() {
    setRound((r) => (r + 1) % CHALLENGES.length);
    setW1(1);
    setW2(1);
  }

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Tune the weights to hit the target output!
      </p>

      <div
        className="card-sketchy p-4"
        style={{ background: won ? "#e8fff5" : PAPER }}
      >
        <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground text-center">
          Challenge {round + 1} of {CHALLENGES.length}
        </p>
        <h3 className="font-hand text-lg font-bold text-foreground text-center mt-1">
          {c.title}
        </h3>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <p className="font-hand text-xs text-muted-foreground">Input 1</p>
            <p className="font-hand text-2xl font-bold text-foreground">
              {c.inputs[0]}
            </p>
          </div>
          <div className="text-center">
            <p className="font-hand text-xs text-muted-foreground">Input 2</p>
            <p className="font-hand text-2xl font-bold text-foreground">
              {c.inputs[1]}
            </p>
          </div>
          <div
            className="text-center rounded-lg border-2 border-foreground p-2"
            style={{ background: YELLOW + "44" }}
          >
            <p className="font-hand text-xs text-muted-foreground">Target</p>
            <p className="font-hand text-2xl font-bold text-foreground">
              {c.target}
            </p>
          </div>
        </div>

        <div
          className="mt-4 text-center rounded-lg border-2 border-foreground p-3"
          style={{ background: won ? MINT + "44" : CORAL + "22" }}
        >
          <p className="font-hand text-xs text-muted-foreground">Current output</p>
          <p
            className="font-hand text-3xl font-bold text-foreground"
            style={{ color: won ? INK : CORAL }}
          >
            {out.toFixed(1)}
          </p>
          <p className="font-hand text-xs text-muted-foreground">
            {won ? "🎯 Bullseye!" : `off by ${diff.toFixed(1)}`}
          </p>
        </div>
      </div>

      <div className="card-sketchy p-4 space-y-2" style={{ background: "#fff8e7" }}>
        <div>
          <p className="font-hand text-xs font-bold text-foreground flex justify-between">
            <span>Weight 1</span>
            <span style={{ color: CORAL }}>{w1}</span>
          </p>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.5}
            value={w1}
            onChange={(e) => setW1(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <p className="font-hand text-xs font-bold text-foreground flex justify-between">
            <span>Weight 2</span>
            <span style={{ color: CORAL }}>{w2}</span>
          </p>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.5}
            value={w2}
            onChange={(e) => setW2(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <p className="font-hand text-[11px] italic text-muted-foreground">
          Hint: {c.hint}
        </p>
      </div>

      {won && (
        <button
          onClick={next}
          className="btn-sketchy font-hand text-sm w-full"
          style={{ background: YELLOW }}
        >
          Next challenge →
        </button>
      )}

      <InfoBox variant="green">
        This is exactly what training a neural network does — except the
        computer adjusts MILLIONS of weights at the same time, not just two!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What does a 'weight' do in a neuron?",
    options: [
      "Holds the neuron in place",
      "Tells the neuron how important each input is",
      "Counts the inputs",
      "Stores memories",
    ],
    correctIndex: 1,
    explanation:
      "Weights tell the neuron how much each input matters. Big weight = listen closely. Tiny weight = ignore.",
  },
  {
    question: "If you set a weight to 0, what happens to that input?",
    options: [
      "It gets doubled",
      "It gets completely ignored",
      "It crashes the neuron",
      "It becomes 1",
    ],
    correctIndex: 1,
    explanation: "Anything × 0 = 0, so a zero weight is the neuron saying 'I don't care about this input at all'.",
  },
  {
    question: "What is a 'bias' in a neuron?",
    options: [
      "An input from outside",
      "A constant nudge added to the weighted sum",
      "A type of weight",
      "An error",
    ],
    correctIndex: 1,
    explanation:
      "The bias is just a number added at the end. It shifts the neuron's 'default' behavior up or down.",
  },
  {
    question: "Training a neural network means...",
    options: [
      "Building it from scratch",
      "Adjusting all the weights and biases until the outputs are correct",
      "Buying more computers",
      "Adding more inputs",
    ],
    correctIndex: 1,
    explanation:
      "Training is just slowly tweaking weights and biases — millions of them — until the network gets the right answers.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function L35_WeightsBiasesActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "single",
        label: "What's a Weight?",
        icon: <Sliders className="w-4 h-4" />,
        content: <SingleWeightTab />,
      },
      {
        id: "multi",
        label: "Many Inputs + Bias",
        icon: <Scale className="w-4 h-4" />,
        content: <MultiInputTab />,
      },
      {
        id: "challenge",
        label: "Tuning Challenge",
        icon: <Target className="w-4 h-4" />,
        content: <ChallengeTab />,
      },
    ],
    []
  );

  return (
    <LessonShell
      title="Weights & Biases: Tuning a Neuron"
      level={6}
      lessonNumber={5}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Now you know how a single neuron is tuned. Next: watch DATA flow through a whole network of them!"
      story={
        <StorySection
          paragraphs={[
            "Aru: \"Byte, you keep saying 'the network learns by adjusting weights'. But what IS a weight?\"",
            "Byte: \"Imagine a chef tasting soup. The chef listens to your tongue (input 1: salty), your nose (input 2: smells good), your eyes (input 3: looks nice). Each sense matters DIFFERENTLY.\"",
            "Aru: \"Salty matters more than how it looks.\"",
            "Byte: \"Right! So you give 'salty' a big weight. 'Looks nice' gets a small weight. Each input is multiplied by its weight, then they're all summed up. THAT'S a neuron.\"",
            "Aru: \"And training the network is just figuring out the right numbers for those weights?\"",
            "Byte: \"Exactly. Adjusting millions of weights — like millions of tiny taste-knobs — until the network gets the right answer. Let's tune some yourself.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Every connection in a neural network has a WEIGHT — a number that says how important that input is. Each neuron also has a BIAS — a constant nudge added to the sum. Training a neural network is the process of adjusting all these weights and biases until the network produces correct outputs."
        />
      }
    />
  );
}
