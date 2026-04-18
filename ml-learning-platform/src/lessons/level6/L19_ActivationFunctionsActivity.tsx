"use client";

import { useMemo, useState } from "react";
import { Activity, TrendingUp, Sliders } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  ActivationFunctionViz,
  WeightSlider,
  activate,
  softmaxVec,
  type ActivationName,
} from "../../components/viz/neural-network";
import { playClick } from "../../utils/sounds";

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
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type VizActivation = Extract<
  ActivationName,
  "sigmoid" | "relu" | "tanh" | "softmax" | "linear"
>;

/** Evaluate the function the same way ActivationFunctionViz does, for the
 *  little "f(x) = ..." chip that follows the slider. */
function evaluate(type: VizActivation, x: number): number {
  if (type === "softmax") return softmaxVec([x, 0])[0];
  return activate(type, x);
}

const ACT_META: Record<
  VizActivation,
  { emoji: string; formula: string; blurb: string }
> = {
  sigmoid: {
    emoji: "〰️",
    formula: "1 / (1 + e^-x)",
    blurb:
      "Smooth S-curve. Squashes anything into (0, 1). Great for probabilities, but the gradient goes flat for big |x|.",
  },
  relu: {
    emoji: "📐",
    formula: "max(0, x)",
    blurb:
      "Linear for positives, zero for negatives. Fast, simple, and the most popular activation in deep learning.",
  },
  tanh: {
    emoji: "🌊",
    formula: "tanh(x)",
    blurb:
      "Sigmoid's zero-centered cousin. Outputs in (-1, 1), so the average signal sits at 0 and training is usually smoother.",
  },
  softmax: {
    emoji: "🎯",
    formula: "e^x_i / Σ e^x_j",
    blurb:
      "Turns a vector of scores into probabilities that add up to 1. Usually lives at the output of a classifier.",
  },
  linear: {
    emoji: "➖",
    formula: "x",
    blurb:
      "The do-nothing activation: output = input. Useful for regression outputs, useless between hidden layers.",
  },
};

const ALL_TYPES: VizActivation[] = ["sigmoid", "relu", "tanh", "softmax"];

/* ------------------------------------------------------------------ */
/*  Tab 1  Meet the Functions                                         */
/* ------------------------------------------------------------------ */

function MeetFunctionsTab() {
  const [x, setX] = useState(0.5);

  return (
    <div className="space-y-5">
      <RikuSays>
        Hey, it&apos;s Riku. Activation functions are the little squish-boxes
        every neuron runs its answer through. Drag the slider and watch all
        four of them react at the same time. Spoiler: they have very different
        vibes.
      </RikuSays>

      {/* Shared input slider */}
      <div
        className="card-sketchy p-4 space-y-2"
        style={{ background: "#fff8e7" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-hand text-base font-bold">
            Input value (x)
          </span>
          <span className="font-hand text-base font-bold px-3 py-0.5 rounded border-2 border-foreground bg-accent-yellow">
            {x.toFixed(2)}
          </span>
        </div>
        <WeightSlider
          label="drag me to move the red dot on every chart"
          value={x}
          onChange={setX}
          min={-5}
          max={5}
          step={0.1}
        />
      </div>

      {/* 4 functions side-by-side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ALL_TYPES.map((t) => {
          const meta = ACT_META[t];
          const y = evaluate(t, x);
          return (
            <div key={t} className="card-sketchy p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-hand text-base font-bold flex items-center gap-2">
                  <span className="text-xl">{meta.emoji}</span>
                  <span className="capitalize">{t}</span>
                </div>
                <span
                  className="font-hand text-sm font-bold px-2 py-0.5 rounded border-2 border-foreground"
                  style={{ background: "var(--accent-mint)", color: "#fff" }}
                >
                  f({x.toFixed(1)}) = {y.toFixed(2)}
                </span>
              </div>
              <ActivationFunctionViz
                type={t}
                highlightX={x}
                width={360}
                height={220}
              />
              <div className="font-hand text-xs text-muted-foreground italic text-center">
                {meta.formula}
              </div>
            </div>
          );
        })}
      </div>

      <RikuSays>
        Softmax is the polite one: it takes a bunch of numbers and makes them
        all add up to 1. Very democratic of it. ReLU is basically the *bouncer*
        of activation functions - negative numbers don&apos;t get into the
        club.
      </RikuSays>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          Drag the slider and watch every function react in real time. Notice
          how sigmoid and tanh saturate at the edges, while ReLU just keeps
          growing on the right.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Why Not Linear?                                            */
/* ------------------------------------------------------------------ */

function WhyNotLinearTab() {
  const [showNonLinear, setShowNonLinear] = useState(false);
  const [x, setX] = useState(1);

  const currentType: VizActivation = showNonLinear ? "relu" : "linear";
  const y = evaluate(currentType, x);

  return (
    <div className="space-y-5">
      <RikuSays>
        Quick puzzle: if you stack a bunch of linear functions
        (like <span className="font-bold">y = 0.7x + 0.2</span>) on top of each
        other, what do you get? Another line. Boring. Non-linear activations
        are what let a network bend and fold the world.
      </RikuSays>

      {/* Toggle */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={() => {
            playClick();
            setShowNonLinear(false);
          }}
          className={`px-5 py-2 rounded-lg font-hand text-base font-bold border-2 border-foreground transition-all ${
            !showNonLinear
              ? "bg-accent-sky text-white shadow-[3px_3px_0_#2b2a35]"
              : "bg-background hover:bg-accent-sky/30"
          }`}
        >
          Linear (boring)
        </button>
        <button
          onClick={() => {
            playClick();
            setShowNonLinear(true);
          }}
          className={`px-5 py-2 rounded-lg font-hand text-base font-bold border-2 border-foreground transition-all ${
            showNonLinear
              ? "bg-accent-mint text-white shadow-[3px_3px_0_#2b2a35]"
              : "bg-background hover:bg-accent-mint/30"
          }`}
        >
          Non-linear (ReLU magic)
        </button>
      </div>

      {/* Slider to drive highlight */}
      <div
        className="card-sketchy p-4 space-y-2"
        style={{ background: "#fff8e7" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-hand text-base font-bold">
            Input value (x)
          </span>
          <span className="font-hand text-base font-bold px-3 py-0.5 rounded border-2 border-foreground bg-accent-yellow">
            {x.toFixed(2)} → f(x) = {y.toFixed(2)}
          </span>
        </div>
        <WeightSlider
          label="move the marker"
          value={x}
          onChange={setX}
          min={-5}
          max={5}
          step={0.1}
        />
      </div>

      {/* Chart */}
      <div className="card-sketchy p-3">
        <ActivationFunctionViz
          type={currentType}
          highlightX={x}
          width={560}
          height={280}
        />
        <p className="font-hand text-sm text-center text-foreground mt-2">
          {showNonLinear
            ? "ReLU gives us a bend at x = 0 - a real non-linearity."
            : "Linear: output is just x. No bend, no magic, no learning superpowers."}
        </p>
      </div>

      <RikuSays>
        Fun fact: a deep network made entirely of linear functions is
        mathematically identical to a single-layer network. All those layers
        collapse into one! Non-linearity is what keeps depth meaningful.
      </RikuSays>

      <InfoBox variant="amber" title="Why Non-Linearity Matters">
        <span className="font-hand text-base">
          {showNonLinear
            ? "Stacking non-linear functions creates rich, piecewise curves. More units = more bends. THIS is the power of neural networks!"
            : "No matter how many linear functions you stack, the result is still a straight line: a(b(cx + d) + e) + f is STILL linear. Without non-linearity, deep networks would be no better than a single neuron!"}
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Activation Playground                                      */
/* ------------------------------------------------------------------ */

function PlaygroundTab() {
  const [activation, setActivation] = useState<VizActivation>("sigmoid");
  const [x, setX] = useState(0);
  const meta = ACT_META[activation];
  const y = evaluate(activation, x);

  return (
    <div className="space-y-5">
      <RikuSays>
        Pick a function, then drag the slider to zoom in on a single input
        value. Watch the red dot slide up and down the curve - that&apos;s
        exactly what happens inside every neuron for every input.
      </RikuSays>

      {/* Activation selector */}
      <div className="flex gap-2 justify-center flex-wrap">
        {(
          ["sigmoid", "relu", "tanh", "softmax", "linear"] as VizActivation[]
        ).map((a) => (
          <button
            key={a}
            onClick={() => {
              playClick();
              setActivation(a);
            }}
            className={`px-4 py-1.5 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all capitalize ${
              activation === a
                ? "bg-accent-lav text-white shadow-[3px_3px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/30"
            }`}
          >
            {ACT_META[a].emoji} {a}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div
        className="card-sketchy p-4 space-y-2"
        style={{ background: "#fff8e7" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-hand text-base font-bold">
            Input value (x)
          </span>
          <span className="font-hand text-base font-bold px-3 py-0.5 rounded border-2 border-foreground bg-accent-yellow">
            f({x.toFixed(2)}) = {y.toFixed(3)}
          </span>
        </div>
        <WeightSlider
          label="drag to move the red dot"
          value={x}
          onChange={setX}
          min={-5}
          max={5}
          step={0.1}
        />
      </div>

      {/* Big chart */}
      <div className="card-sketchy p-3">
        <ActivationFunctionViz
          type={activation}
          highlightX={x}
          width={580}
          height={320}
        />
        <div className="font-hand text-sm text-center text-foreground mt-2 italic">
          f(x) = {meta.formula}
        </div>
      </div>

      {/* Blurb */}
      <div
        className="card-sketchy p-4 font-hand text-base text-foreground"
        style={{ background: "#fffdf5" }}
      >
        <div className="flex items-center gap-2 mb-1 font-bold">
          <span className="text-xl">{meta.emoji}</span>
          <span className="capitalize">{activation}</span>
        </div>
        <p>{meta.blurb}</p>
      </div>

      <RikuSays>
        Tip: try sigmoid with x = 5, then x = -5. Notice how the output barely
        moves at the edges? That&apos;s the vanishing gradient problem in one
        slider drag. ReLU fixed a lot of that by just... not squishing
        positives at all.
      </RikuSays>

      <InfoBox variant="indigo">
        <span className="font-hand text-base">
          Every activation has a personality. Sigmoid is smooth but sleepy at
          the edges. Tanh is zero-centered and trains faster. ReLU is the
          modern workhorse. Softmax makes the whole output layer into a tidy
          probability distribution.
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
    question: "Why do neural networks need non-linear activation functions?",
    options: [
      "To make the code shorter",
      "Because linear functions stacked together are still linear",
      "To slow down computation",
      "They don't -- linear functions work fine",
    ],
    correctIndex: 1,
    explanation:
      "Stacking linear functions always gives another linear function. Non-linear activations let networks learn complex, curved decision boundaries.",
  },
  {
    question: "What is the output range of the Sigmoid function?",
    options: ["0 to infinity", "-1 to 1", "0 to 1", "-infinity to infinity"],
    correctIndex: 2,
    explanation:
      "Sigmoid squishes any input into a value between 0 and 1, making it useful for probabilities.",
  },
  {
    question: "What does ReLU do with negative inputs?",
    options: [
      "Outputs them unchanged",
      "Squares them",
      "Outputs zero",
      "Flips them to positive",
    ],
    correctIndex: 2,
    explanation:
      "ReLU (Rectified Linear Unit) outputs zero for negative inputs and passes positive inputs through unchanged: max(0, x).",
  },
  {
    question: "Which activation function acts like a simple on/off switch?",
    options: ["Sigmoid", "ReLU", "Tanh", "Step"],
    correctIndex: 3,
    explanation:
      "The Step function outputs 1 for positive inputs and 0 for negative inputs -- a binary on/off decision with no in-between.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function L19_ActivationFunctionsActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "meet",
        label: "Meet the Functions",
        icon: <Activity className="w-4 h-4" />,
        content: <MeetFunctionsTab />,
      },
      {
        id: "why-not-linear",
        label: "Why Not Linear?",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <WhyNotLinearTab />,
      },
      {
        id: "playground",
        label: "Activation Playground",
        icon: <Sliders className="w-4 h-4" />,
        content: <PlaygroundTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Activation Functions"
      level={6}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Build a full neural network with multiple layers!"
      story={
        <StorySection
          paragraphs={[
            "Aru was thinking about the perceptron they built in the last lesson.",
            "Aru: \"The perceptron just fires or doesn't fire. It's like a light switch -- on or off. But real brains are more nuanced, right?\"",
            "Byte: \"Exactly! What if we want a dimmer instead of a switch? That's where activation functions come in. They control HOW MUCH a neuron fires, not just whether it fires.\"",
            "Aru: \"So instead of just yes or no, a neuron can say 'a little bit' or 'a lot'?\"",
            "Byte: \"Precisely! And the choice of activation function changes how the whole network behaves. Let me show you the most popular ones!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Activation functions introduce non-linearity into neural networks. Without them, stacking layers would be pointless -- you'd just get another linear function. Common activations include Step (binary), Sigmoid (0 to 1), Tanh (-1 to 1), and ReLU (zero out negatives)."
        />
      }
    />
  );
}
