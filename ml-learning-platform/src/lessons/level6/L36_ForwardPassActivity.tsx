"use client";

import { useMemo, useState } from "react";
import { Play, Zap, Network } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  ForwardPassAnimation,
  NeuralNetwork,
  Neuron,
  WeightSlider,
} from "../../components/viz/neural-network";

const MINT = "#4ecdc4";
const CORAL = "#ff6b6b";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Riku dialogue bubble                                               */
/* ------------------------------------------------------------------ */

function RikuSays({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="card-sketchy p-3 flex gap-3 items-start"
      style={{ background: "#fff8e7" }}
    >
      <span className="text-2xl" aria-hidden>
        🐼
      </span>
      <p className="font-hand text-sm text-foreground leading-snug">
        {children}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pre-baked demo weights for the walkthrough                         */
/* ------------------------------------------------------------------ */

// Architecture: 2 inputs → 3 hidden → 1 output.
// weights[layer][toNeuron][fromNeuron]
const DEMO_WEIGHTS: number[][][] = [
  [
    [0.5, -0.3], // h1 from (x1, x2)
    [0.8, 0.2], // h2
    [-0.4, 0.6], // h3
  ],
  [
    [0.7, -0.5, 0.9], // out from (h1, h2, h3)
  ],
];

/* ------------------------------------------------------------------ */
/*  Tab 1  Watch It Flow                                               */
/* ------------------------------------------------------------------ */

function ForwardPassTab() {
  const [x1, setX1] = useState(3);
  const [x2, setX2] = useState(2);

  return (
    <div className="space-y-4">
      <RikuSays>
        Forward pass = information flowing left-to-right. Just like reading.
        Easy. Hit <b>Play</b> and watch numbers march through the network one
        layer at a time.
      </RikuSays>

      <p className="font-hand text-base text-foreground text-center">
        Press <b>Play</b> to watch numbers flow forward through the network.
      </p>

      <div className="card-sketchy p-4" style={{ background: PAPER }}>
        <ForwardPassAnimation
          architecture={[2, 3, 1]}
          inputs={[x1, x2]}
          weights={DEMO_WEIGHTS}
          activations={["relu", "relu"]}
        />
      </div>

      {/* Input controls */}
      <div
        className="card-sketchy p-4 space-y-3"
        style={{ background: "#fff8e7" }}
      >
        <p className="font-hand text-sm font-bold text-foreground">
          Try changing the inputs, then replay:
        </p>
        <WeightSlider
          label="Input x1"
          value={x1}
          onChange={setX1}
          min={-5}
          max={5}
          step={0.5}
        />
        <WeightSlider
          label="Input x2"
          value={x2}
          onChange={setX2}
          min={-5}
          max={5}
          step={0.5}
        />
      </div>

      <RikuSays>
        Mint lines are positive weights (they *encourage* the next neuron to
        fire). Coral lines are negative weights (they argue *against* firing).
        Thicker line = louder voice. Neural network politics in a nutshell.
      </RikuSays>

      <InfoBox variant="blue">
        Mint lines = positive weights (helps the next neuron). Coral lines =
        negative weights (argues against firing). Thicker line = stronger
        weight.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Step by Step  (neuron zoom)                                 */
/* ------------------------------------------------------------------ */

function StepByStepTab() {
  // A single hidden neuron: 2 inputs, weights, bias, relu.
  const [x1, setX1] = useState(2);
  const [x2, setX2] = useState(3);
  const [w1, setW1] = useState(0.5);
  const [w2, setW2] = useState(0.2);
  const [bias, setBias] = useState(0.1);

  const preSum = x1 * w1 + x2 * w2 + bias;
  const out = Math.max(0, preSum);

  return (
    <div className="space-y-4">
      <RikuSays>
        Zoom in! This is what *one* neuron does under the hood. Every neuron
        in the whole network is doing this exact same little dance -
        multiply, add, squish. Millions of times per second.
      </RikuSays>

      <p className="font-hand text-base text-foreground text-center">
        Let&apos;s compute one forward pass BY HAND, step by step.
      </p>

      {/* Single neuron viz */}
      <div className="card-sketchy p-4" style={{ background: PAPER }}>
        <Neuron
          inputs={[x1, x2]}
          weights={[w1, w2]}
          bias={bias}
          activation="relu"
          label="one hidden neuron"
          size={440}
        />
      </div>

      {/* Controls */}
      <div
        className="card-sketchy p-4 space-y-3"
        style={{ background: "#fff8e7" }}
      >
        <p className="font-hand text-sm font-bold text-foreground">
          Drag any slider and watch the weighted sum and output change:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <WeightSlider
            label="input x1"
            value={x1}
            onChange={setX1}
            min={-5}
            max={5}
            step={0.5}
          />
          <WeightSlider
            label="input x2"
            value={x2}
            onChange={setX2}
            min={-5}
            max={5}
            step={0.5}
          />
          <WeightSlider label="weight w1" value={w1} onChange={setW1} />
          <WeightSlider label="weight w2" value={w2} onChange={setW2} />
          <WeightSlider
            label="bias"
            value={bias}
            onChange={setBias}
            min={-2}
            max={2}
          />
        </div>
      </div>

      {/* Step-by-step math */}
      <div
        className="card-sketchy p-4 space-y-2"
        style={{ background: PAPER }}
      >
        <h3 className="font-hand text-xl font-bold text-foreground">
          The three steps
        </h3>
        <ol className="font-hand text-sm text-foreground space-y-1">
          <li>
            <b>1. Multiply</b> each input by its weight:
            <br />
            <span className="ml-4">
              x1 × w1 = {x1} × {w1.toFixed(1)} ={" "}
              <span style={{ color: CORAL }}>{(x1 * w1).toFixed(2)}</span>
            </span>
            <br />
            <span className="ml-4">
              x2 × w2 = {x2} × {w2.toFixed(1)} ={" "}
              <span style={{ color: CORAL }}>{(x2 * w2).toFixed(2)}</span>
            </span>
          </li>
          <li>
            <b>2. Add</b> them up with the bias:
            <br />
            <span className="ml-4">
              {(x1 * w1).toFixed(2)} + {(x2 * w2).toFixed(2)} +{" "}
              {bias.toFixed(1)} ={" "}
              <span style={{ color: LAVENDER }}>{preSum.toFixed(2)}</span>
            </span>
          </li>
          <li>
            <b>3. Activate</b> with ReLU = max(0, sum):
            <br />
            <span className="ml-4">
              relu({preSum.toFixed(2)}) ={" "}
              <span className="font-bold text-lg" style={{ color: MINT }}>
                {out.toFixed(2)}
              </span>
            </span>
          </li>
        </ol>
      </div>

      <RikuSays>
        Try pulling the bias way down. Watch the pre-activation go negative,
        and ReLU just... flatlines to zero. That&apos;s a &quot;dead&quot;
        neuron. Not great for learning!
      </RikuSays>

      <InfoBox variant="amber">
        Every neuron does the SAME 3 steps: multiply inputs by weights, add
        them up (with bias), then squish through an activation function (here,
        relu). Big networks just repeat this billions of times.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Why "forward"?                                              */
/* ------------------------------------------------------------------ */

function WhyForwardTab() {
  return (
    <div className="space-y-4">
      <RikuSays>
        Quick vocabulary check! &quot;Forward&quot; and &quot;backward&quot;
        are two different jobs the same network does - one when you *use* it,
        one when you *train* it. Don&apos;t mix them up on the quiz.
      </RikuSays>

      <p className="font-hand text-base text-foreground text-center">
        Why is it called the &quot;forward&quot; pass?
      </p>

      {/* Static diagram to anchor the idea */}
      <div className="card-sketchy p-3" style={{ background: PAPER }}>
        <NeuralNetwork
          layers={[2, 3, 1]}
          weights={DEMO_WEIGHTS}
          activations={["relu", "relu"]}
          inputs={[3, 2]}
          animateFlow
          showValues
          width={560}
          height={260}
        />
        <p className="font-hand text-xs text-center text-muted-foreground mt-1">
          The same network running in one-shot: mint = positive weights, coral
          = negative.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card-sketchy p-4" style={{ background: MINT + "22" }}>
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
            {
              n: "2",
              text: "Compare to the correct answer → measure error",
              color: YELLOW,
            },
            {
              n: "3",
              text: "Backward pass: figure out which weights are 'guilty'",
              color: CORAL,
            },
            {
              n: "4",
              text: "Adjust those weights a tiny bit",
              color: LAVENDER,
            },
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

      <RikuSays>
        When you ask ChatGPT a question, the model is doing *forward passes
        only*. The backward passes happened months before you even opened the
        app, back at training time. Using a model is cheap. Training one is
        the expensive part.
      </RikuSays>

      <InfoBox variant="green">
        Today you learned the FORWARD pass - using the network. Next lesson
        (backpropagation) covers the BACKWARD pass - training it.
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
    question:
      "In a 3-layer network (input → hidden → output), how many forward passes happen for ONE prediction?",
    options: ["1", "2", "3", "Hundreds"],
    correctIndex: 0,
    explanation:
      "Just 1 forward pass goes from input to output. It just visits multiple layers along the way.",
  },
  {
    question:
      "When you use ChatGPT to answer a question, what's mainly happening inside?",
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
    question:
      "In the visualization, what does a thick MINT line between two neurons mean?",
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
    [],
  );

  return (
    <LessonShell
      title="Forward Pass: Watching Data Flow"
      level={6}
      lessonNumber={6}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You can now follow how a network MAKES a prediction. Up next: how it LEARNS - by passing errors backward."
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
          conceptSummary="A FORWARD PASS is when data flows through the network from inputs to output. Each neuron multiplies its inputs by weights, adds them up with a bias, runs through an activation function, and passes the result to the next layer. This is exactly what happens whenever you USE a neural network - making a prediction is just one big forward pass."
        />
      }
    />
  );
}
