# Neural Network Visualization Library

Reusable, sketchy-notebook styled neural network visualization components for **Red Panda Learn**. Every component is a client component, uses only React hooks, and renders with pure SVG + Tailwind v4 utilities + the theme's CSS custom properties (`--accent-coral`, `--accent-mint`, `--accent-yellow`, `--accent-lav`, `--accent-sky`, `--accent-peach`).

```ts
// Import anything from the barrel:
import {
  Neuron,
  NeuralNetwork,
  WeightSlider,
  ActivationFunctionViz,
  Perceptron,
  LossLandscape,
  ForwardPassAnimation,
  BackpropagationViz,
  // helpers
  forwardPass,
  activate,
  makeRandomWeights,
} from "@/components/viz/neural-network";
```

All components include sensible defaults so they work with zero or minimal config.

---

## `Neuron`

A single artificial neuron showing inputs, weights, bias, weighted sum, activation, and output.

| Prop | Type | Default | Description |
|---|---|---|---|
| `inputs` | `number[]` | - | Input values x1..xn |
| `weights` | `number[]` | - | Weight for each input |
| `bias` | `number` | `0` | Bias term added to the weighted sum |
| `activation` | `"sigmoid" \| "relu" \| "tanh" \| "linear"` | `"sigmoid"` | Activation function |
| `size` | `number` | `360` | Approximate width in SVG units |
| `label` | `string` | - | Optional caption under the neuron |

```tsx
<Neuron
  inputs={[0.3, 0.8, 0.1]}
  weights={[0.5, -0.4, 1.0]}
  bias={-0.2}
  activation="sigmoid"
/>
```

---

## `NeuralNetwork`

Full feed-forward network with sketchy curved connections. Line thickness = `|weight|`, color = sign (mint positive, coral negative).

| Prop | Type | Default | Description |
|---|---|---|---|
| `layers` | `number[]` | - | Layer sizes, e.g. `[3, 4, 4, 1]` |
| `weights` | `number[][][]?` | random (seeded) | `weights[layer][toNeuron][fromNeuron]` |
| `activations` | `ActivationName[]?` | all sigmoid | Per-layer activation |
| `inputs` | `number[]?` | - | If provided, network is run and activations shown |
| `animateFlow` | `boolean` | `true` | Pulsing signal-flow along edges |
| `showValues` | `boolean` | `false` | Show neuron activation numbers |
| `width` / `height` | `number` | `640 / 360` | SVG dimensions |

```tsx
<NeuralNetwork layers={[3, 5, 4, 2]} animateFlow showValues inputs={[0.1, 0.5, 0.9]} />
```

---

## `WeightSlider`

Bipolar slider showing sign + magnitude at a glance.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Slider label |
| `value` | `number` | - | Current value |
| `onChange` | `(v: number) => void` | - | Change handler |
| `min` | `number` | `-2` | Min value |
| `max` | `number` | `2` | Max value |
| `step` | `number` | `0.1` | Step size |

```tsx
const [w, setW] = useState(0.5);
<WeightSlider label="w1" value={w} onChange={setW} />
```

---

## `ActivationFunctionViz`

Plot of an activation function with an optional highlighted input.

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"sigmoid" \| "relu" \| "tanh" \| "softmax" \| "linear"` | - | Function |
| `highlightX` | `number?` | - | Draws a vertical line and point at `(x, f(x))` |
| `xRange` | `[number, number]` | `[-5, 5]` | X axis range |
| `width` / `height` | `number` | `380 / 260` | SVG dimensions |

```tsx
<ActivationFunctionViz type="relu" highlightX={1.4} />
```

---

## `Perceptron`

Interactive 2D perceptron. Three `WeightSlider`s drive a live decision boundary; click into the canvas in "Add point" mode to drop new points.

| Prop | Type | Default | Description |
|---|---|---|---|
| `points` | `{ x, y, label: 0 \| 1 }[]` | 8 demo points | Training points |
| `initialWeights` | `[number, number]` | `[1, 1]` | Starting `(w1, w2)` |
| `initialBias` | `number` | `0` | Starting bias |
| `range` | `[number, number]` | `[-4, 4]` | Plot bounds |

```tsx
<Perceptron />
```

---

## `LossLandscape`

2D contour plot of a loss surface with interactive gradient descent.

| Prop | Type | Default | Description |
|---|---|---|---|
| `lossFn` | `(x: number, y: number) => number` | `(x-1)^2 + (y+0.5)^2` | Any 2-param loss |
| `learningRate` | `number` | `0.15` | Step size |
| `startPoint` | `[number, number]` | `[-2.5, 2]` | Initial position |
| `range` | `[number, number]` | `[-3.5, 3.5]` | Plot bounds |

```tsx
<LossLandscape lossFn={(x, y) => Math.sin(x) + 0.2 * y * y} />
```

---

## `ForwardPassAnimation`

Step-by-step walkthrough of a forward pass: `Play`, `Next Layer`, `Reset`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `architecture` | `number[]` | - | Layer sizes |
| `inputs` | `number[]` | - | Input vector |
| `weights` | `number[][][]?` | random (seeded) | Explicit weights |
| `activations` | `ActivationName[]?` | sigmoid | Per-layer activation |

```tsx
<ForwardPassAnimation architecture={[3, 4, 2]} inputs={[0.4, 0.2, 0.9]} />
```

---

## `BackpropagationViz`

Backward pass visualization with gradient-colored nodes (redder = bigger).

| Prop | Type | Default | Description |
|---|---|---|---|
| `architecture` | `number[]` | - | Layer sizes |
| `loss` | `number` | `1.2` | Final loss value (scales gradient magnitudes) |
| `learningRate` | `number` | `0.1` | Shown alongside weight-update arrows |
| `showUpdateArrows` | `boolean` | `true` | Display `Δw = -lr·g` labels |

```tsx
<BackpropagationViz architecture={[3, 4, 2]} loss={1.8} />
```

---

## Composition notes

- `Perceptron` is built on top of `WeightSlider` - you can drop new sliders into any lesson without plumbing styles yourself.
- `NeuralNetwork` and `ForwardPassAnimation` share the same `utils.ts` layout math, so a lesson can swap between a "static diagram" and an "animated walkthrough" without re-authoring the architecture.
- All helpers (`forwardPass`, `activate`, `softmaxVec`, `makeRandomWeights`, `mulberry32`) are re-exported from the package barrel so lesson authors can build derived visualizations without poking into internal files.
- Colors use CSS custom properties, so if the notebook theme ever changes, these components follow automatically.

## File layout

```
src/components/viz/neural-network/
├── ActivationFunctionViz.tsx
├── BackpropagationViz.tsx
├── ForwardPassAnimation.tsx
├── LossLandscape.tsx
├── NeuralNetwork.tsx
├── Neuron.tsx
├── Perceptron.tsx
├── WeightSlider.tsx
├── index.ts          # barrel
├── mulberry32.ts     # seeded PRNG
├── utils.ts          # math + layout helpers
└── README.md
```
