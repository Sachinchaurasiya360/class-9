# CNN / Image Visualization Library

A sketchy-notebook set of interactive components for teaching convolutional
neural networks to Class 8-12 students. Every component is a **client
component** for Next.js App Router, uses pure SVG (no chart libraries), and
has sensible defaults so you can drop it into a lesson with zero props.

```tsx
import {
  ImageGrid,
  ConvolutionViz,
  FilterBank,
  PoolingViz,
  FeatureMap,
  MiniCNN,
  KernelEditor,
} from "@/components/viz/cnn";

export default function Lesson8Conv() {
  return (
    <>
      <ImageGrid showValues />
      <ConvolutionViz />
      <FilterBank />
      <PoolingViz type="max" />
      <MiniCNN animate />
      <KernelEditor />
    </>
  );
}
```

---

## Core concepts

- **`Pixels2D = number[][]`** - row-major 2D array, `pixels[y][x]`. Values can
  be 0-255 or 0-1 - every component auto-normalizes unless you pass
  `valueRange`.
- **`FilterKernel = number[][]`** - the convolution kernel, usually 3×3.
- **Deterministic demos** - all default images / filters are constants, and
  any randomness uses `mulberry32(seed)` so lessons look identical across
  reloads.

---

## ImageGrid

The teaching workhorse. Renders a 2D array as a grid of colored cells.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `pixels` | `Pixels2D` | `DEMO_IMAGES.smiley` | 2D pixel array |
| `cellSize` | `number` | `28` | Per-cell edge in px |
| `width` / `height` | `number` | - | Alternative sizing |
| `showValues` | `boolean` | `false` | Overlay numeric values |
| `valueRange` | `[number, number]` | auto | Force a normalization range |
| `colormap` | `"gray" \| "coral" \| "mint" \| "viridis"` | `"gray"` | Color scheme |
| `label` | `string` | - | Handwritten caption above the grid |
| `highlight` | `{y, x, size} \| null` | `null` | Coral dashed box around a window |
| `glow` | `{y, x} \| null` | `null` | Yellow glow around a single cell |

```tsx
<ImageGrid pixels={DEMO_IMAGES.smiley} showValues colormap="mint" />
```

---

## ConvolutionViz

The hero component. Shows an input image with the filter window highlighted,
a dotted arrow, and a live feature map on the right. Play / Step / Reset
controls scrub through every window position.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `image` | `Pixels2D` | `DEFAULT_DEMO_IMAGE` (letter X) | Input image |
| `filter` | `FilterKernel` | `PRESET_FILTERS["edge-vertical"]` | 3×3 kernel |
| `stride` | `number` | `1` | Filter advance step |
| `padding` | `number` | `0` | Zero padding |
| `showStep` | `{y, x}` | - | Start at a specific output cell |
| `onStepChange` | `(step) => void` | - | Fires every step |
| `speedMs` | `number` | `550` | ms per auto-play step |
| `title` | `string` | `"Convolution"` | Header |

```tsx
<ConvolutionViz
  image={DEMO_IMAGES.letterX}
  filter={PRESET_FILTERS.sharpen}
  stride={1}
/>
```

The component also renders a per-window breakdown showing
`pixel × kernel = product` for every cell under the filter, plus the running
sum - so students can verify the arithmetic by hand.

---

## FilterBank

A row of miniature filter previews. Click to select. Each mini-grid uses a
symmetric value range so students can see positive weights (bright) and
negative weights (dark) at a glance.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `filters` | `NamedFilter[]` | `DEFAULT_FILTER_BANK` (6 classics) | Filters to show |
| `labels` | `string[]` | - | Override labels |
| `selectedIdx` | `number` | uncontrolled | Controlled selection |
| `onSelect` | `(idx, kernel) => void` | - | Fires on click |
| `cellSize` | `number` | `18` | Mini-cell size |

Default filters: `edge-horizontal`, `edge-vertical`, `blur`, `sharpen`,
`emboss`, `sobel-x`.

```tsx
const [idx, setIdx] = useState(0);
<FilterBank selectedIdx={idx} onSelect={(i) => setIdx(i)} />
```

---

## PoolingViz

Side-by-side input → output with a sliding pooling window. For max-pool the
"winning" cell glows yellow.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Pixels2D` | built-in 8×8 random | Feature map |
| `poolSize` | `number` | `2` | Window edge |
| `stride` | `number` | `poolSize` | Window step |
| `type` | `"max" \| "avg"` | `"max"` | Pooling strategy |
| `speedMs` | `number` | `600` | ms per step |

```tsx
<PoolingViz type="max" poolSize={2} />
```

---

## FeatureMap

Static read-only display of a 2D activation map. Similar to `ImageGrid` but
with chunkier borders and a default coral colormap - used for "what the CNN
sees" post-conv displays.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `values` | `Pixels2D` | built-in 6×6 blob | Activation values |
| `highlight` | `{y, x} \| null` | `null` | Yellow halo on one cell |
| `label` | `string` | - | Caption |
| `colormap` | `ColormapName` | `"coral"` | Color scheme |
| `cellSize` | `number` | `30` | Per-cell edge |
| `showValues` | `boolean` | `false` | Overlay numerics |
| `note` | `string` | - | Caption under the map |
| `withCard` | `boolean` | `true` | Wrap in a sketchy card |

```tsx
<FeatureMap values={myActivations} label="conv1 output" showValues />
```

---

## MiniCNN

High-level architecture diagram. Takes a declarative list of layers and
renders the full pipeline: input image → conv stacks → pool → ... → dense.
Each conv / pool stage renders as a shrinking stack of feature-map blocks so
students see both the spatial shrinkage and the growing channel count.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `layers` | `LayerSpec[]` | classic LeNet-ish 6-stage pipeline | Layer list |
| `inputImage` | `Pixels2D` | `DEFAULT_DEMO_IMAGE` | Input to draw |
| `animate` | `boolean` | `false` | Auto-pulse through stages |
| `title` | `string` | `"CNN Pipeline"` | Header |

```tsx
<MiniCNN
  layers={[
    { type: "conv", filters: 4, kernelSize: 3 },
    { type: "pool", size: 2 },
    { type: "conv", filters: 8, kernelSize: 3 },
    { type: "pool", size: 2 },
    { type: "flatten" },
    { type: "dense", units: 10 },
  ]}
  animate
/>
```

---

## KernelEditor

An editable 3×3 (or 5×5) filter. Click to bump a cell up by `step`,
shift-click (or right-click) to bump down. Drag to paint. Preset buttons jump
to named kernels.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `kernel` | `FilterKernel` | uncontrolled | Controlled kernel |
| `onChange` | `(kernel) => void` | - | Fires on edits |
| `size` | `3 \| 5` | `3` | Kernel edge |
| `minValue` / `maxValue` | `number` | `-2` / `2` | Clamp range |
| `step` | `number` | `1` | Bump increment |
| `presets` | `string[]` | 5 classics | Quick-load names |

```tsx
const [k, setK] = useState<FilterKernel>(PRESET_FILTERS.identity);
<KernelEditor kernel={k} onChange={setK} />
<ConvolutionViz filter={k} />
```

Pair it with `ConvolutionViz` for a "build your own filter, see the effect"
playground.

---

## Helpers (`imageUtils.ts`)

| Function | Signature | Purpose |
| --- | --- | --- |
| `mulberry32` | `(seed) => () => number` | Deterministic PRNG |
| `convolve2d` | `(image, kernel, stride?, padding?) => Pixels2D` | Cross-correlation |
| `maxPool2d` | `(input, size?, stride?) => Pixels2D` | Max pooling |
| `avgPool2d` | `(input, size?, stride?) => Pixels2D` | Average pooling |
| `maxPoolArgmax` | `(input, y, x, size, stride) => {y, x}` | Which cell won |
| `normalizeImage` | `(pixels, min?, max?) => Pixels2D` | Scale to [0, 1] |
| `normalizeValue` | `(v, min, max) => number` | Scale a single value |
| `getColormap` | `(name) => (v) => string` | Colormap function |
| `minMax` | `(img) => {min, max}` | Global min/max |
| `PRESET_FILTERS` | `Record<string, FilterKernel>` | 8 named kernels |
| `DEMO_IMAGES` | `Record<string, Pixels2D>` | 7 hand-drawn demos |
| `DEFAULT_FILTER_BANK` | `NamedFilter[]` | 6-filter gallery |

---

## Teaching simplifications

These components are for intuition building, not production ML:

- **Single-channel only.** Every image / feature map is one channel. Real
  CNNs stack RGB channels then multi-channel feature maps.
- **No batching.** One image at a time.
- **Cross-correlation, not convolution.** We skip the kernel flip - every
  teaching reference uses this convention.
- **No biases or activations.** `convolve2d` returns raw dot products; there
  is no ReLU or bias term. Students add this verbally.
- **`MiniCNN` shapes are schematic.** The shrink factor uses the first conv
  dimension as a visual baseline, not a pixel-exact projection. The goal is
  "feature maps get smaller and deeper", not a pixel-perfect blueprint.
- **`KernelEditor` clamps to `[-2, 2]`** by default so students don't end up
  with a kernel that makes the whole feature map saturate.
