"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Workflow, Eye, Dumbbell, Sparkles } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  ConvolutionViz,
  PoolingViz,
  MiniCNN,
  DEMO_IMAGES,
  PRESET_FILTERS,
  type LayerSpec,
} from "@/components/viz/cnn";
import { NeuralNetwork } from "@/components/viz/neural-network";
import { LineChart } from "@/components/viz/data-viz";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

/* ------------------------------------------------------------------ */
/*  Riku - red panda mascot dialogue helper                            */
/* ------------------------------------------------------------------ */
function RikuSays({ children }: { children: ReactNode }) {
  return (
    <div className="card-sketchy p-3 flex gap-3 items-start" style={{ background: "#fff8e7" }}>
      <span className="text-2xl" aria-hidden>🐼</span>
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared constants                                                   */
/* ------------------------------------------------------------------ */
const PAPER = "#fffdf5";

const CNN_LAYERS: LayerSpec[] = [
  { type: "conv", filters: 4, kernelSize: 3, label: "Conv 3×3 · 4f" },
  { type: "pool", size: 2, pooling: "max", label: "MaxPool 2×2" },
  { type: "conv", filters: 8, kernelSize: 3, label: "Conv 3×3 · 8f" },
  { type: "pool", size: 2, pooling: "max", label: "MaxPool 2×2" },
  { type: "flatten", label: "Flatten" },
  { type: "dense", units: 3, label: "Dense · 3" },
];

const CLASS_NAMES = ["Horizontal", "Vertical", "Checkerboard"];
const CLASS_COLORS = ["#6bb6ff", "#ff6b6b", "#4ecdc4"];

// Tiny 8x8 patterns we reuse in the "user draws a pattern" tab.
const HORIZ_STRIPES: number[] = [];
const VERT_STRIPES: number[] = [];
const CHECKER: number[] = [];
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    HORIZ_STRIPES.push(r % 2 === 0 ? 1 : 0);
    VERT_STRIPES.push(c % 2 === 0 ? 1 : 0);
    CHECKER.push((r + c) % 2 === 0 ? 1 : 0);
  }
}
const PATTERNS = [
  { name: "Horizontal", data: HORIZ_STRIPES, label: 0 },
  { name: "Vertical", data: VERT_STRIPES, label: 1 },
  { name: "Checkerboard", data: CHECKER, label: 2 },
];

function softmax(arr: number[]): number[] {
  const m = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - m));
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / s);
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- CNN Pipeline (hero = MiniCNN)                             */
/* ------------------------------------------------------------------ */
function PipelineTab() {
  return (
    <div className="space-y-4">
      <RikuSays>
        A CNN is just conv → pool → conv → pool → flatten → dense → answer. That&apos;s the whole
        recipe. The magic is in what the filters learn along the way.
      </RikuSays>

      <MiniCNN
        animate
        layers={CNN_LAYERS}
        inputImage={DEMO_IMAGES.letterX}
        title="Mini CNN · full pipeline"
      />

      <RikuSays>
        Watch the feature maps get smaller and deeper as we move left to right. Less space, more
        channels &mdash; that&apos;s the CNN shuffle. Early layers see edges; later layers see
        shapes; the final dense layer makes the decision.
      </RikuSays>

      <InfoBox variant="blue" title="CNN Pipeline">
        A CNN processes images in stages: Convolution (find features) → ReLU (remove negatives)
        → Pooling (shrink) → Flatten (make 1D) → Dense layer (classify). Each stage transforms the
        data step by step!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- The Conv Layer                                            */
/* ------------------------------------------------------------------ */
function ConvLayerTab() {
  const [filterName, setFilterName] = useState<keyof typeof PRESET_FILTERS>("edge-horizontal");

  const filterOptions: { name: keyof typeof PRESET_FILTERS; label: string }[] = [
    { name: "edge-horizontal", label: "Horizontal edges" },
    { name: "edge-vertical", label: "Vertical edges" },
    { name: "sobel-x", label: "Sobel X" },
    { name: "sharpen", label: "Sharpen" },
  ];

  return (
    <div className="space-y-4">
      <RikuSays>
        This is the <b>conv</b> layer up close. Think of a filter as a tiny stamp that lights up
        wherever its pattern appears. A trained CNN learns hundreds of these stamps &mdash; here
        are four hand-picked ones.
      </RikuSays>

      <div className="flex gap-2 justify-center flex-wrap">
        {filterOptions.map((f) => (
          <button
            key={f.name}
            onClick={() => {
              playClick();
              setFilterName(f.name);
            }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
              filterName === f.name
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ConvolutionViz
        key={filterName}
        image={DEMO_IMAGES.plus}
        filter={PRESET_FILTERS[filterName]}
        stride={1}
        padding={0}
        title={`Conv layer · ${filterName}`}
      />

      <RikuSays>
        The feature map on the right is this layer&apos;s &ldquo;opinion&rdquo; of the image.
        Bright cells = &ldquo;yes, the pattern is here!&rdquo; Dark cells = &ldquo;nope, move
        along&rdquo;. Real CNNs run many filters in parallel to get many opinions.
      </RikuSays>

      <InfoBox variant="amber" title="Different Filters, Different Responses">
        A horizontal edge filter responds strongly to horizontal stripes but weakly to vertical
        ones - and vice versa. The CNN learns to use many filters so it can detect all kinds of
        patterns!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- The Pooling Layer                                         */
/* ------------------------------------------------------------------ */
function PoolLayerTab() {
  return (
    <div className="space-y-4">
      <RikuSays>
        After convolution, we have a feature map that&apos;s mostly the same size as the input.
        Pooling shrinks it while keeping the loudest signals. Max pooling is the CNN&apos;s way of
        saying: &ldquo;I don&apos;t care exactly where, just tell me if it&apos;s there.&rdquo;
      </RikuSays>

      <PoolingViz type="max" poolSize={2} title="Max pooling · 2×2" />

      <RikuSays>
        Notice the output is half the size on each side &mdash; 4x fewer numbers, but the strong
        activations survive. That&apos;s why CNN stacks are so efficient: conv finds features, pool
        keeps the best, repeat.
      </RikuSays>

      <InfoBox variant="green" title="Why Pool?">
        Pooling reduces the spatial size while keeping the strongest features, cutting the amount
        of computation the later layers have to do. Max pooling keeps the loudest activation in
        each window; average pooling keeps the smooth summary.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 4 -- The Classifier Head (after flatten)                       */
/* ------------------------------------------------------------------ */
function ClassifierTab() {
  return (
    <div className="space-y-4">
      <RikuSays>
        Once pooling shrinks the feature maps, we <b>flatten</b> everything into one long vector
        and feed it into a regular neural network &mdash; the classifier head. This is the part
        that actually outputs <i>Horizontal / Vertical / Checkerboard</i>.
      </RikuSays>

      <div className="card-sketchy p-4 notebook-grid">
        <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2 text-center">
          Dense layers after flatten (9 → 6 → 3)
        </p>
        <NeuralNetwork
          layers={[9, 6, 3]}
          animateFlow
          width={560}
          height={300}
        />
      </div>

      <RikuSays>
        9 flattened features go in, 3 class scores come out. The hidden layer is where the &ldquo;if
        strong horizontal edges and weak vertical edges then it&apos;s horizontal&rdquo; rules get
        learned &mdash; not as hand-written code, but as weights on those colorful lines.
      </RikuSays>

      <InfoBox variant="indigo" title="Flatten + Dense = Classifier">
        After all the conv / pool layers, the feature maps are unrolled into a single vector. Dense
        (fully-connected) layers then mix those features to produce one score per class. Softmax
        turns the scores into probabilities.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 5 -- Train the Mini CNN                                        */
/* ------------------------------------------------------------------ */
function TrainTab() {
  const [trained, setTrained] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [accHistory, setAccHistory] = useState<number[]>([]);
  const [userGrid, setUserGrid] = useState<number[]>(() => new Array(64).fill(0));
  const [prediction, setPrediction] = useState<number[] | null>(null);

  const trainOnce = useCallback(() => {
    playPop();
    setEpoch((prev) => {
      const next = prev + 1;
      const jitter = ((next * 9301 + 49297) % 233280) / 233280;
      const baseLoss = 1.1 / (1 + next * 0.4) + jitter * 0.05;
      const baseAcc = Math.min(1, 0.3 + next * 0.15 + jitter * 0.05);
      setLossHistory((h) => [...h, baseLoss]);
      setAccHistory((h) => [...h, baseAcc]);
      if (next >= 5) {
        setTrained(true);
        playSuccess();
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    playClick();
    setTrained(false);
    setEpoch(0);
    setLossHistory([]);
    setAccHistory([]);
    setPrediction(null);
  }, []);

  const handleCellClick = useCallback(
    (idx: number) => {
      if (!trained) return;
      playPop();
      setUserGrid((prev) => {
        const next = [...prev];
        next[idx] = next[idx] > 0.5 ? 0 : 1;
        return next;
      });
    },
    [trained],
  );

  const handlePredict = useCallback(() => {
    if (!trained) {
      playError();
      return;
    }
    playClick();
    let horizScore = 0;
    let vertScore = 0;
    let checkScore = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const val = userGrid[r * 8 + c];
        if (val > 0.5) {
          if (r % 2 === 0) horizScore += 1;
          if (c % 2 === 0) vertScore += 1;
          if ((r + c) % 2 === 0) checkScore += 1;
        }
      }
    }
    const total = Math.max(horizScore + vertScore + checkScore, 1);
    const raw = [horizScore / total, vertScore / total, checkScore / total];
    setPrediction(softmax(raw.map((v) => v * 5)));
    playSuccess();
  }, [trained, userGrid]);

  const handleLoadPattern = useCallback((idx: number) => {
    playClick();
    setUserGrid([...PATTERNS[idx].data]);
    setPrediction(null);
  }, []);

  const gridSide = 32;
  const gap = 1;
  const gridPx = gridSide * 8 + gap * 9;
  const predicted = prediction ? prediction.indexOf(Math.max(...prediction)) : -1;

  return (
    <div className="space-y-4">
      <RikuSays>
        Training is just &ldquo;tweak the filter weights and the dense layer weights until the loss
        goes down&rdquo;. Let&apos;s fake five epochs so you can watch the graphs move, then draw
        your own pattern.
      </RikuSays>

      <div className="flex gap-2 justify-center items-center flex-wrap">
        <button
          onClick={trainOnce}
          disabled={epoch >= 5}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {epoch === 0 ? "Train" : epoch >= 5 ? "Trained!" : `Train (Epoch ${epoch}/5)`}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-background shadow-[2px_2px_0_#2b2a35] transition-all"
        >
          Reset
        </button>
      </div>

      {lossHistory.length > 0 && (
        <div className="flex gap-4 justify-center flex-wrap">
          <LineChart
            width={320}
            height={160}
            title="Loss"
            xLabel="epoch"
            yLabel="loss"
            series={[
              {
                name: "Loss",
                color: "var(--accent-coral)",
                data: lossHistory.map((l, i) => ({ x: i + 1, y: l })),
              },
            ]}
          />
          <LineChart
            width={320}
            height={160}
            title="Accuracy"
            xLabel="epoch"
            yLabel="acc"
            series={[
              {
                name: "Accuracy",
                color: "var(--accent-mint)",
                data: accHistory.map((a, i) => ({ x: i + 1, y: a })),
              },
            ]}
          />
        </div>
      )}

      {trained && (
        <div className="space-y-3 card-sketchy p-4 notebook-grid">
          <p className="font-hand text-sm font-bold text-foreground text-center">
            Draw your own pattern and predict!
          </p>

          <div className="flex gap-2 justify-center flex-wrap">
            {PATTERNS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => handleLoadPattern(i)}
                className="px-2 py-1 rounded font-hand text-[11px] font-bold border-2 border-foreground bg-background hover:bg-accent-yellow/40 shadow-[2px_2px_0_#2b2a35] transition-all"
              >
                Load {p.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <svg
              viewBox={`0 0 ${gridPx} ${gridPx}`}
              className="w-full max-w-60 rounded-lg cursor-pointer"
              style={{ background: "#2b2a35" }}
            >
              {userGrid.map((val, idx) => {
                const row = Math.floor(idx / 8);
                const col = idx % 8;
                const x = gap + col * (gridSide + gap);
                const y = gap + row * (gridSide + gap);
                const gray = Math.round(val * 255);
                const hex = gray.toString(16).padStart(2, "0");
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width={gridSide}
                    height={gridSide}
                    fill={`#${hex}${hex}${hex}`}
                    rx={3}
                    onClick={() => handleCellClick(idx)}
                    className="hover:opacity-80 transition-opacity"
                  />
                );
              })}
            </svg>

            {prediction && (
              <div className="space-y-2">
                <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Prediction
                </p>
                {prediction.map((p, i) => {
                  const isTop = i === predicted;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="font-hand text-xs font-bold w-24 text-right"
                        style={{ color: CLASS_COLORS[i] }}
                      >
                        {CLASS_NAMES[i]}
                      </span>
                      <svg viewBox="0 0 120 16" className="w-28">
                        <rect
                          x={0}
                          y={0}
                          width={120}
                          height={16}
                          fill="#f3efe6"
                          stroke="#2b2a35"
                          strokeWidth={1}
                          rx={4}
                        />
                        <rect
                          x={0}
                          y={0}
                          width={p * 120}
                          height={16}
                          fill={CLASS_COLORS[i]}
                          rx={4}
                        />
                      </svg>
                      <span className="font-hand text-xs font-bold text-muted-foreground">
                        {(p * 100).toFixed(0)}%
                        {isTop && " ✨"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handlePredict}
              className="px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground bg-accent-mint text-white shadow-[2px_2px_0_#2b2a35] transition-all"
            >
              Predict
            </button>
          </div>
        </div>
      )}

      <RikuSays>
        In real life, loss usually wiggles down (not a smooth curve) and accuracy climbs in jumps.
        The pattern is the same though: each epoch nudges the weights toward something that
        classifies better on the training data.
      </RikuSays>

      <InfoBox variant="indigo" title="Training a CNN">
        During training, the CNN adjusts its filter weights and dense layer weights to minimize
        loss. After enough epochs, it learns to recognize patterns. Then it can classify new images
        it has never seen!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 6 -- Watch It All                                              */
/* ------------------------------------------------------------------ */
function WatchAllTab() {
  const [imgKey, setImgKey] = useState<keyof typeof DEMO_IMAGES>("letterX");

  const imgOptions: { name: keyof typeof DEMO_IMAGES; label: string }[] = [
    { name: "letterX", label: "Letter X" },
    { name: "smiley", label: "Smiley" },
    { name: "plus", label: "Plus" },
    { name: "arrow", label: "Arrow" },
  ];

  return (
    <div className="space-y-4">
      <RikuSays>
        Pick an image and watch the whole pipeline pulse. Each block is a stage; each stack is a
        bundle of feature maps. This is as close as we get to an MRI scan of a CNN.
      </RikuSays>

      <div className="flex gap-2 justify-center flex-wrap">
        {imgOptions.map((o) => (
          <button
            key={o.name}
            onClick={() => {
              playClick();
              setImgKey(o.name);
            }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
              imgKey === o.name
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <MiniCNN
        key={imgKey}
        animate
        layers={CNN_LAYERS}
        inputImage={DEMO_IMAGES[imgKey]}
        title={`Full pipeline · ${imgKey}`}
      />

      <div className="card-sketchy p-3" style={{ background: PAPER }}>
        <p className="font-hand text-sm text-center">
          Input <b>8&times;8</b> → Conv &#x2192; Pool &#x2192; Conv &#x2192; Pool &#x2192; Flatten
          &#x2192; <span className="marker-highlight-yellow font-bold">3 class scores</span>
        </p>
      </div>

      <RikuSays>
        That&apos;s the entire CNN recipe. Swap the classes for <i>cat / dog / fox</i>, scale up to
        224&times;224 RGB, stack fifty layers, and you&apos;re basically running a real-world
        image classifier. Same shape, just bigger.
      </RikuSays>

      <InfoBox variant="blue" title="The Whole Recipe">
        Conv &#x2192; Pool &#x2192; Conv &#x2192; Pool &#x2192; Flatten &#x2192; Dense. Real CNNs
        stack more of the same, add ReLU and dropout, and train on millions of images &mdash; but
        the architecture is exactly what you just saw.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is the correct order of layers in a typical CNN?",
    options: [
      "Dense → Pool → Conv → Flatten",
      "Conv → ReLU → Pool → Flatten → Dense",
      "Pool → Conv → Dense → Flatten",
      "Flatten → Conv → Pool → Dense",
    ],
    correctIndex: 1,
    explanation:
      "A CNN typically goes: Convolution (detect features) → ReLU (remove negatives) → Pooling (shrink) → Flatten (make 1D) → Dense (classify).",
  },
  {
    question: "What does the ReLU layer do in a CNN?",
    options: [
      "Doubles all values",
      "Sets negative values to zero",
      "Averages all values",
      "Reverses the image",
    ],
    correctIndex: 1,
    explanation:
      "ReLU (Rectified Linear Unit) replaces all negative values with zero, keeping only positive activations. This adds non-linearity to the network.",
  },
  {
    question: "Why does a CNN flatten the feature map before the dense layer?",
    options: [
      "To make the image look better",
      "To convert the 2D grid into a 1D vector for classification",
      "To increase the image size",
      "To add more colors",
    ],
    correctIndex: 1,
    explanation:
      "Dense layers expect a 1D input. Flattening converts the 2D feature map into a single vector of numbers that the dense layer can process.",
  },
  {
    question: "What does a CNN learn during training?",
    options: [
      "The size of images",
      "The best filter weights and dense layer weights",
      "How to take photos",
      "The names of objects",
    ],
    correctIndex: 1,
    explanation:
      "During training, the CNN adjusts the values in its convolutional filters and dense layer weights to minimize prediction errors.",
  },
  {
    question: "What is the main advantage of CNNs over regular neural networks for images?",
    options: [
      "They are simpler to understand",
      "They use filters to detect spatial patterns efficiently",
      "They don't need training data",
      "They only work with color images",
    ],
    correctIndex: 1,
    explanation:
      "CNNs use convolutional filters that can detect spatial patterns (edges, textures, shapes) regardless of where they appear in the image, making them much more efficient for image tasks.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
export default function L29_MiniCNNActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "pipeline",
        label: "CNN Pipeline",
        icon: <Workflow className="w-4 h-4" />,
        content: <PipelineTab />,
      },
      {
        id: "conv",
        label: "The Conv Layer",
        icon: <Eye className="w-4 h-4" />,
        content: <ConvLayerTab />,
      },
      {
        id: "pool",
        label: "The Pool Layer",
        icon: <Workflow className="w-4 h-4" />,
        content: <PoolLayerTab />,
      },
      {
        id: "classifier",
        label: "Classifier Head",
        icon: <Eye className="w-4 h-4" />,
        content: <ClassifierTab />,
      },
      {
        id: "train",
        label: "Train the Mini CNN",
        icon: <Dumbbell className="w-4 h-4" />,
        content: <TrainTab />,
      },
      {
        id: "watch",
        label: "Watch It All",
        icon: <Sparkles className="w-4 h-4" />,
        content: <WatchAllTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Building a Mini CNN"
      level={8}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      story={
        <StorySection
          paragraphs={[
            "Aru sat back and looked at everything she had learned - pixels, filters, stride, padding, pooling.",
            "Aru: \"So we have filters, pooling, and neural network layers... can we combine them all?\"",
            "Byte: \"Yes! That's a CNN - Convolutional Neural Network. Image goes in, conv layer finds features, pooling shrinks it down, then we flatten it and pass it through a dense layer to get a prediction!\"",
            "Aru: \"So it's like an assembly line - each stage does one job, and by the end, the computer understands what's in the image?\"",
            "Byte: \"Exactly! Let's build one together and watch it learn.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A CNN (Convolutional Neural Network) chains together convolution, ReLU, pooling, flattening, and dense layers into a pipeline that transforms an image into a prediction. It learns the best filters automatically through training."
        />
      }
    />
  );
}
