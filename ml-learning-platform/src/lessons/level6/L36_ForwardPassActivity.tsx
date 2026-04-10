"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Play, RotateCcw, Zap, Network } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Tab 1 – Animated forward pass                                      */
/* ------------------------------------------------------------------ */

// 3 layers: 2 input → 3 hidden → 1 output
const LAYOUT = {
  input: [
    { x: 60, y: 70, label: "x1" },
    { x: 60, y: 160, label: "x2" },
  ],
  hidden: [
    { x: 220, y: 40 },
    { x: 220, y: 115 },
    { x: 220, y: 190 },
  ],
  output: [{ x: 380, y: 115 }],
};

// Pre-baked weights so the math is reproducible
const W_IH = [
  [0.5, -0.3], // h1: from x1, x2
  [0.8, 0.2],
  [-0.4, 0.6],
];
const B_H = [0.1, -0.2, 0.0];
const W_HO = [0.7, -0.5, 0.9]; // output from h1, h2, h3
const B_O = 0.2;

const relu = (n: number) => Math.max(0, n);

function ForwardPassTab() {
  const [x1, setX1] = useState(3);
  const [x2, setX2] = useState(2);
  const [step, setStep] = useState(0); // 0=idle, 1=inputs, 2=hidden, 3=output
  const timer = useRef<number | null>(null);

  // Compute hidden + output values
  const h = LAYOUT.hidden.map((_, i) => relu(W_IH[i][0] * x1 + W_IH[i][1] * x2 + B_H[i]));
  const out = relu(W_HO[0] * h[0] + W_HO[1] * h[1] + W_HO[2] * h[2] + B_O);

  function play() {
    setStep(0);
    if (timer.current) clearInterval(timer.current);
    let s = 0;
    timer.current = window.setInterval(() => {
      s++;
      setStep(s);
      if (s >= 3 && timer.current) clearInterval(timer.current);
    }, 900);
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const showInputs = step >= 1;
  const showHidden = step >= 2;
  const showOutput = step >= 3;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Press <b>Play</b> to watch numbers flow forward through the network.
      </p>

      <div className="card-sketchy p-4" style={{ background: PAPER }}>
        <svg width="100%" viewBox="0 0 440 240" style={{ maxHeight: 320 }}>
          {/* Layer labels */}
          <text x="60" y="220" textAnchor="middle" fill={INK} opacity="0.5"
            style={{ fontFamily: "Patrick Hand, cursive", fontSize: 11 }}>
            INPUT
          </text>
          <text x="220" y="220" textAnchor="middle" fill={INK} opacity="0.5"
            style={{ fontFamily: "Patrick Hand, cursive", fontSize: 11 }}>
            HIDDEN
          </text>
          <text x="380" y="220" textAnchor="middle" fill={INK} opacity="0.5"
            style={{ fontFamily: "Patrick Hand, cursive", fontSize: 11 }}>
            OUTPUT
          </text>

          {/* Connections input → hidden */}
          {LAYOUT.input.map((ipos, i) =>
            LAYOUT.hidden.map((hpos, j) => (
              <line
                key={`ih-${i}-${j}`}
                x1={ipos.x + 22}
                y1={ipos.y}
                x2={hpos.x - 22}
                y2={hpos.y}
                stroke={W_IH[j][i] >= 0 ? MINT : CORAL}
                strokeWidth={Math.abs(W_IH[j][i]) * 3 + 0.5}
                opacity={showInputs ? 0.6 : 0.15}
                style={{ transition: "opacity 0.5s ease" }}
              />
            ))
          )}

          {/* Connections hidden → output */}
          {LAYOUT.hidden.map((hpos, j) => (
            <line
              key={`ho-${j}`}
              x1={hpos.x + 22}
              y1={hpos.y}
              x2={LAYOUT.output[0].x - 22}
              y2={LAYOUT.output[0].y}
              stroke={W_HO[j] >= 0 ? MINT : CORAL}
              strokeWidth={Math.abs(W_HO[j]) * 3 + 0.5}
              opacity={showHidden ? 0.6 : 0.15}
              style={{ transition: "opacity 0.5s ease" }}
            />
          ))}

          {/* Input nodes */}
          {LAYOUT.input.map((p, i) => (
            <g key={`i-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="22"
                fill={showInputs ? SKY : "#eee"}
                stroke={INK}
                strokeWidth="2"
                style={{ transition: "fill 0.4s ease" }}
              />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fill={INK}
                style={{
                  fontFamily: "Kalam, cursive",
                  fontSize: 16,
                  fontWeight: 700,
                  opacity: showInputs ? 1 : 0.4,
                  transition: "opacity 0.4s ease",
                }}
              >
                {showInputs ? (i === 0 ? x1 : x2) : "?"}
              </text>
              <text
                x={p.x - 32}
                y={p.y + 5}
                textAnchor="end"
                fill={INK}
                opacity="0.6"
                style={{ fontFamily: "Patrick Hand, cursive", fontSize: 12 }}
              >
                {p.label}
              </text>
            </g>
          ))}

          {/* Hidden nodes */}
          {LAYOUT.hidden.map((p, i) => (
            <g key={`h-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="22"
                fill={showHidden ? LAVENDER : "#eee"}
                stroke={INK}
                strokeWidth="2"
                style={{ transition: "fill 0.4s ease" }}
              />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fill={INK}
                style={{
                  fontFamily: "Kalam, cursive",
                  fontSize: 13,
                  fontWeight: 700,
                  opacity: showHidden ? 1 : 0.4,
                  transition: "opacity 0.4s ease",
                }}
              >
                {showHidden ? h[i].toFixed(1) : "?"}
              </text>
            </g>
          ))}

          {/* Output node */}
          {LAYOUT.output.map((p, i) => (
            <g key={`o-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="26"
                fill={showOutput ? CORAL : "#eee"}
                stroke={INK}
                strokeWidth="2.5"
                style={{ transition: "fill 0.4s ease" }}
              />
              <text
                x={p.x}
                y={p.y + 6}
                textAnchor="middle"
                fill={INK}
                style={{
                  fontFamily: "Kalam, cursive",
                  fontSize: 18,
                  fontWeight: 700,
                  opacity: showOutput ? 1 : 0.4,
                  transition: "opacity 0.4s ease",
                }}
              >
                {showOutput ? out.toFixed(1) : "?"}
              </text>
            </g>
          ))}

          {/* Pulses traveling along edges */}
          {step >= 1 && step <= 1 &&
            LAYOUT.input.map((ipos, i) =>
              LAYOUT.hidden.map((hpos, j) => (
                <circle key={`p1-${i}-${j}`} r="4" fill={YELLOW} stroke={INK} strokeWidth="1">
                  <animateMotion
                    dur="0.8s"
                    repeatCount="1"
                    path={`M ${ipos.x + 22} ${ipos.y} L ${hpos.x - 22} ${hpos.y}`}
                  />
                </circle>
              ))
            )}
          {step === 2 &&
            LAYOUT.hidden.map((hpos, j) => (
              <circle key={`p2-${j}`} r="4" fill={YELLOW} stroke={INK} strokeWidth="1">
                <animateMotion
                  dur="0.8s"
                  repeatCount="1"
                  path={`M ${hpos.x + 22} ${hpos.y} L ${LAYOUT.output[0].x - 22} ${LAYOUT.output[0].y}`}
                />
              </circle>
            ))}
        </svg>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 justify-center">
        {["Input", "→ Hidden", "→ Output"].map((label, i) => (
          <div
            key={label}
            className="px-3 py-1 rounded-full border-2 border-foreground font-hand text-xs font-bold transition-all"
            style={{
              background: step > i ? YELLOW : PAPER,
              opacity: step > i ? 1 : 0.4,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        <div>
          <p className="font-hand text-xs font-bold text-foreground flex justify-between">
            <span>Input x1</span>
            <span style={{ color: SKY }}>{x1}</span>
          </p>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.5}
            value={x1}
            onChange={(e) => setX1(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <p className="font-hand text-xs font-bold text-foreground flex justify-between">
            <span>Input x2</span>
            <span style={{ color: SKY }}>{x2}</span>
          </p>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.5}
            value={x2}
            onChange={(e) => setX2(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={play}
            className="btn-sketchy font-hand text-sm flex-1"
            style={{ background: YELLOW }}
          >
            <Play className="w-4 h-4" />
            Play forward pass
          </button>
          <button onClick={() => setStep(0)} className="btn-sketchy-outline font-hand text-sm">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <InfoBox variant="blue">
        Mint lines = positive weights (helps the next neuron). Coral lines =
        negative weights (argues against firing). Thicker line = stronger weight.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Step-by-step math                                          */
/* ------------------------------------------------------------------ */

function StepByStepTab() {
  const [step, setStep] = useState(0);

  // Tiny example: 2 inputs, 2 hidden, 1 output
  const x = [2, 3];
  const w1 = [
    [0.5, 0.2],  // h1
    [-0.1, 0.8], // h2
  ];
  const b1 = [0.1, 0.0];
  const w2 = [0.6, 0.4]; // output from h1, h2
  const b2 = 0.2;

  const h1 = relu(w1[0][0] * x[0] + w1[0][1] * x[1] + b1[0]);
  const h2 = relu(w1[1][0] * x[0] + w1[1][1] * x[1] + b1[1]);
  const out = relu(w2[0] * h1 + w2[1] * h2 + b2);

  const steps = [
    {
      title: "1. Start with the inputs",
      body: <p className="font-hand text-base text-foreground">x1 = <b>{x[0]}</b>, x2 = <b>{x[1]}</b></p>,
    },
    {
      title: "2. Compute hidden neuron 1",
      body: (
        <div className="font-hand text-sm text-foreground space-y-1">
          <p>h1 = relu( (x1 × {w1[0][0]}) + (x2 × {w1[0][1]}) + {b1[0]} )</p>
          <p>h1 = relu( ({x[0]} × {w1[0][0]}) + ({x[1]} × {w1[0][1]}) + {b1[0]} )</p>
          <p>h1 = relu( {(w1[0][0] * x[0] + w1[0][1] * x[1] + b1[0]).toFixed(2)} )</p>
          <p className="font-bold">h1 = <span style={{ color: CORAL }}>{h1.toFixed(2)}</span></p>
        </div>
      ),
    },
    {
      title: "3. Compute hidden neuron 2",
      body: (
        <div className="font-hand text-sm text-foreground space-y-1">
          <p>h2 = relu( (x1 × {w1[1][0]}) + (x2 × {w1[1][1]}) + {b1[1]} )</p>
          <p>h2 = relu( {(w1[1][0] * x[0] + w1[1][1] * x[1] + b1[1]).toFixed(2)} )</p>
          <p className="font-bold">h2 = <span style={{ color: CORAL }}>{h2.toFixed(2)}</span></p>
        </div>
      ),
    },
    {
      title: "4. Compute output",
      body: (
        <div className="font-hand text-sm text-foreground space-y-1">
          <p>out = relu( (h1 × {w2[0]}) + (h2 × {w2[1]}) + {b2} )</p>
          <p>out = relu( ({h1.toFixed(2)} × {w2[0]}) + ({h2.toFixed(2)} × {w2[1]}) + {b2} )</p>
          <p className="font-bold text-lg">
            out = <span style={{ color: MINT }}>{out.toFixed(2)}</span>
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Let's compute one forward pass BY HAND, step by step.
      </p>

      <div
        className="card-sketchy p-4 space-y-3"
        style={{ background: PAPER, minHeight: 220 }}
        key={step}
      >
        <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
          Step {step + 1} of {steps.length}
        </p>
        <h3 className="font-hand text-xl font-bold text-foreground">
          {steps[step].title}
        </h3>
        <div style={{ animation: "fadeIn 0.4s ease" }}>{steps[step].body}</div>
      </div>

      <div className="flex justify-between gap-2">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-sketchy-outline font-hand text-sm"
          style={{ opacity: step === 0 ? 0.5 : 1 }}
        >
          ← Back
        </button>
        <button
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          className="btn-sketchy font-hand text-sm"
          style={{
            background: YELLOW,
            opacity: step === steps.length - 1 ? 0.5 : 1,
          }}
        >
          Next →
        </button>
      </div>

      <InfoBox variant="amber">
        Every neuron does the SAME 3 steps: multiply inputs by weights, add
        them up (with bias), then squish through an activation function (here,
        relu). Big networks just repeat this billions of times.
      </InfoBox>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Why "forward"?                                             */
/* ------------------------------------------------------------------ */

function WhyForwardTab() {
  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Why is it called the "forward" pass?
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div
          className="card-sketchy p-4"
          style={{ background: MINT + "22" }}
        >
          <div className="text-3xl mb-2">➡️</div>
          <h3 className="font-hand text-lg font-bold text-foreground">
            Forward Pass
          </h3>
          <p className="font-hand text-sm text-foreground mt-1">
            Data flows from inputs → hidden layers → output. The network MAKES
            a prediction. This is what happens when you USE the network.
          </p>
        </div>
        <div
          className="card-sketchy p-4"
          style={{ background: CORAL + "22" }}
        >
          <div className="text-3xl mb-2">⬅️</div>
          <h3 className="font-hand text-lg font-bold text-foreground">
            Backward Pass
          </h3>
          <p className="font-hand text-sm text-foreground mt-1">
            Error flows BACKWARD from the output to fix the weights. This is
            what happens when the network is LEARNING (training).
          </p>
        </div>
      </div>

      <div className="card-sketchy p-4" style={{ background: PAPER }}>
        <h3 className="font-hand text-base font-bold text-foreground mb-2">
          The Training Loop
        </h3>
        <ol className="space-y-2 font-hand text-sm text-foreground">
          {[
            { n: "1", text: "Forward pass: get a prediction", color: MINT },
            { n: "2", text: "Compare to the correct answer → measure error", color: YELLOW },
            { n: "3", text: "Backward pass: figure out which weights are 'guilty'", color: CORAL },
            { n: "4", text: "Adjust those weights a tiny bit", color: LAVENDER },
            { n: "5", text: "Repeat 1,000,000 times", color: SKY },
          ].map((s) => (
            <li key={s.n} className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full border-2 border-foreground flex items-center justify-center font-bold shrink-0"
                style={{ background: s.color }}
              >
                {s.n}
              </div>
              <span className="pt-0.5">{s.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <InfoBox variant="green">
        Today you learned the FORWARD pass — using the network. Next lesson
        (backpropagation) covers the BACKWARD pass — training it.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What is a 'forward pass'?",
    options: [
      "Throwing a ball forward",
      "Data flowing from inputs through the network to produce an output",
      "When the network learns",
      "A type of weight",
    ],
    correctIndex: 1,
    explanation:
      "Forward pass = data goes IN, gets transformed through every layer, and a prediction comes OUT.",
  },
  {
    question: "In a 3-layer network (input → hidden → output), how many forward passes happen for ONE prediction?",
    options: ["1", "2", "3", "Hundreds"],
    correctIndex: 0,
    explanation:
      "Just 1 forward pass goes from input to output. It just visits multiple layers along the way.",
  },
  {
    question: "When you use ChatGPT to answer a question, what's mainly happening inside?",
    options: [
      "Backpropagation",
      "A forward pass through a giant network",
      "Training",
      "Random guessing",
    ],
    correctIndex: 1,
    explanation:
      "When you USE a model, it does forward passes only. Training (backprop) happened earlier, before you even installed the app.",
  },
  {
    question: "In the visualization, what does a thick MINT line between two neurons mean?",
    options: [
      "Strong negative weight",
      "Strong positive weight (encourages firing)",
      "Broken connection",
      "Output",
    ],
    correctIndex: 1,
    explanation:
      "Mint = positive weight, thick = strong. So thick mint means 'this connection strongly encourages the next neuron to fire'.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function L36_ForwardPassActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "animated",
        label: "Watch It Flow",
        icon: <Play className="w-4 h-4" />,
        content: <ForwardPassTab />,
      },
      {
        id: "math",
        label: "Step by Step",
        icon: <Zap className="w-4 h-4" />,
        content: <StepByStepTab />,
      },
      {
        id: "why",
        label: "Forward vs Backward",
        icon: <Network className="w-4 h-4" />,
        content: <WhyForwardTab />,
      },
    ],
    []
  );

  return (
    <LessonShell
      title="Forward Pass: Watching Data Flow"
      level={6}
      lessonNumber={6}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You can now follow how a network MAKES a prediction. Up next: how it LEARNS — by passing errors backward."
      story={
        <StorySection
          paragraphs={[
            "Aru: \"OK so I tuned a single neuron. But how does a WHOLE network actually do something?\"",
            "Byte: \"Same way! Each neuron does its little input-times-weight-plus-bias dance. Then it passes its answer to the NEXT layer. Then THOSE neurons do their dance. And so on, until the last layer spits out an answer.\"",
            "Aru: \"So data just flows forward through the layers like... a river?\"",
            "Byte: \"Exactly. We call it a forward pass. Inputs in one side, prediction out the other. Let me show you one in slow-motion.\"",
            "Aru: \"Will I see the math?\"",
            "Byte: \"Every step. Numbers, animations, the whole thing. Press play.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A FORWARD PASS is when data flows through the network from inputs to output. Each neuron multiplies its inputs by weights, adds them up with a bias, runs through an activation function, and passes the result to the next layer. This is exactly what happens whenever you USE a neural network — making a prediction is just one big forward pass."
        />
      }
    />
  );
}
