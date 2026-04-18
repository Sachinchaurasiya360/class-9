# data-viz - Sketchy Notebook Chart Toolkit

A small, dependency-free set of SVG visualization primitives for Red Panda
Learn. Pure React + SVG (no d3, no chart libraries). Everything here is a
client component - each file starts with `"use client"`. Colors come from
Tailwind/CSS custom properties (`var(--accent-coral)` and friends) so charts
match the wider sketchy-notebook theme.

All charts take a `viewBox`-driven SVG so they scale fluidly to the parent
container while preserving aspect ratio. Text is rendered via `className="font-hand"`
which maps to the Kalam handwriting font used throughout the app.

## Importing

```tsx
import {
  ScatterPlot,
  BarChart,
  LineChart,
  Histogram,
  PieChart,
  BoxPlot,
  HeatMap,
  ViolinPlot,
  ProgressBar,
  AxisSystem,
  Legend,
  Tooltip,
} from "@/components/viz/data-viz";
```

## Shared types

```ts
type DataPoint = { x: number; y: number; label?: string; color?: string; category?: string };
type Series    = { name: string; data: DataPoint[]; color?: string };
type ChartProps = { width?: number; height?: number; title?: string; xLabel?: string; yLabel?: string };
```

## Composition

Most charts internally call `useAxisSystem` to draw axes/grid/title and get
back pixel scale functions. `ScatterPlot`, `LineChart`, `Histogram`, `BoxPlot`
and `ViolinPlot` all share this axis system, which is why titles, label
placement, and tick style look consistent across them.

`Legend` and `Tooltip` are standalone HTML overlays. They are composed on top
of the SVG, so charts that need them (ScatterPlot, HeatMap, LineChart, PieChart)
wrap the SVG in a `position: relative` container.

## AxisSystem

Draws X/Y axes, nice ticks, optional dashed grid, optional title and labels.
Returned from `useAxisSystem` as `{ node, xScale, yScale, plot }`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `xMin`, `xMax` | number | required | Domain for the X axis |
| `yMin`, `yMax` | number | required | Domain for the Y axis |
| `width`, `height` | number | required | Canvas size in px (viewBox units) |
| `xLabel`, `yLabel` | string | - | Axis titles |
| `padding` | number | 44 | Space reserved for ticks/labels |
| `showGrid` | boolean | true | Dashed grid lines |
| `xTickCount`, `yTickCount` | number | 5 | Approximate desired tick count. Pass `0` to hide |
| `title` | string | - | Chart title drawn centered at the top |

```tsx
<AxisSystem xMin={0} xMax={10} yMin={0} yMax={5} width={500} height={300} xLabel="x" yLabel="y" />
```

## Legend

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `{ label; color; shape? }[]` | required | Entries to render |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `className` | string | - | Extra classes for the wrapper |

```tsx
<Legend
  items={[
    { label: "cats", color: "var(--accent-coral)", shape: "circle" },
    { label: "dogs", color: "var(--accent-mint)",  shape: "circle" },
  ]}
/>
```

## Tooltip

Absolute-positioned box. Intended to live inside a `position: relative` container.

| Prop | Type | Default | Description |
|---|---|---|---|
| `x`, `y` | number | required | Coordinates (pixels by default) |
| `content` | ReactNode | required | What to show inside |
| `visible` | boolean | required | Fades in/out |
| `offset` | `{ x: number; y: number }` | `{ x: 12, y: -8 }` | Pixel offset |
| `percent` | boolean | false | When true, `(x, y)` are treated as 0-100 percentages of the parent |

## ScatterPlot

Hoverable points with optional category colors and a linear trend line.

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `DataPoint[]` | required | Points to plot |
| `categoryColors` | `Record<string, string>` | - | Explicit color map by category |
| `showTrendLine` | boolean | false | Render simple linear regression |
| `pointRadius` | number | 6 | Point size in px |
| …ChartProps |  |  | width / height / title / xLabel / yLabel |

```tsx
<ScatterPlot
  data={[
    { x: 1, y: 2, category: "A" },
    { x: 3, y: 5, category: "B" },
  ]}
  showTrendLine
  xLabel="age"
  yLabel="score"
/>
```

## BarChart

Animated bars that grow from the baseline on mount.

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `{ label; value; color? }[]` | required | Bars |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Bar layout |
| `animateOnMount` | boolean | true | Mount-in animation |
| `showValues` | boolean | true | Value label on/beside the bar |
| …ChartProps |  |  |  |

```tsx
<BarChart data={[{ label: "A", value: 3 }, { label: "B", value: 5 }]} title="Counts" />
```

## LineChart

Multi-series line chart with optional smoothing, area fill, and draw-in
animation (stroke-dasharray trick).

| Prop | Type | Default | Description |
|---|---|---|---|
| `series` | `Series[]` | required | One or more series |
| `smooth` | boolean | false | Catmull-Rom smoothing |
| `showArea` | boolean | false | Soft fill below the line |
| `showPoints` | boolean | true | Dots at each data point |
| `animateOnMount` | boolean | true | Line drawing animation |
| …ChartProps |  |  |  |

```tsx
<LineChart
  series={[{ name: "loss", data: epochs.map((e) => ({ x: e.step, y: e.loss })) }]}
  smooth
  showArea
/>
```

## Histogram

Auto-binned frequency distribution with optional mean/median lines.

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `number[]` | required | Raw values |
| `bins` | number | 10 | Number of equal-width bins |
| `showMean` | boolean | false | Solid mean overlay |
| `showMedian` | boolean | false | Dashed median overlay |
| `color` | string | `var(--accent-sky)` | Bar fill |
| …ChartProps |  |  |  |

```tsx
<Histogram data={scores} bins={12} showMean showMedian />
```

## PieChart

Proportional data with slice sweep-in animation and a built-in legend.

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `{ label; value; color? }[]` | required | Slices |
| `innerRadius` | number | 0 | Non-zero makes it a donut |
| `animateOnMount` | boolean | true | Sweep-in |
| `showLabels` | boolean | true | Percent labels on slices ≥ 4% |
| …ChartProps |  |  | default `width=400 height=400` |

## BoxPlot

Five-number summary with 1.5×IQR outlier detection. Accepts `number[]` or
`number[][]` for side-by-side groups.

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `number[] \| number[][]` | required | Single or multi-group |
| `labels` | `string[]` | - | Group labels |
| …ChartProps |  |  |  |

## HeatMap

2D matrix with a single-hue color ramp. Great for confusion matrices,
correlation matrices, or small attention heatmaps.

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `number[][]` | required | Row-major matrix |
| `rowLabels`, `colLabels` | `string[]` | - | Axis labels |
| `colorScale` | `'coral' \| 'mint' \| 'lav' \| 'sky'` | `'coral'` | Ramp hue |
| `showValues` | boolean | false | Cell value overlay |
| …ChartProps |  |  |  |

```tsx
<HeatMap
  data={[[1, 0.3], [0.3, 1]]}
  rowLabels={["A", "B"]}
  colLabels={["A", "B"]}
  colorScale="mint"
  showValues
/>
```

## ViolinPlot

Mirrored kernel-density estimate per group. Silverman's rule of thumb sets
the bandwidth by default.

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `number[] \| number[][]` | required | One or multiple groups |
| `labels` | `string[]` | - | Group labels |
| `resolution` | number | 48 | Density sample count |
| `bandwidth` | number | 1 | Multiplier on the default KDE bandwidth |
| …ChartProps |  |  |  |

## ProgressBar

Sketchy bordered bar with animated fill. Handy for training metrics,
accuracy displays, or level completion.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | number (0..1) | required | Fill fraction |
| `label` | string | - | Text above the bar |
| `color` | string | `var(--accent-mint)` | Fill color |
| `height` | number | 18 | Bar height px |
| `animated` | boolean | true | Tween fill changes |
| `showPercent` | boolean | true | Percent label on the right |

```tsx
<ProgressBar value={0.78} label="Training accuracy" color="var(--accent-coral)" />
```

## Notes on composition and edge cases

- `ScatterPlot`, `LineChart`, `Histogram`, `BoxPlot`, and `ViolinPlot` all
  use `useAxisSystem` internally, so passing `title`, `xLabel`, `yLabel`,
  `width`, or `height` works consistently across them.
- Empty data is handled gracefully: most charts render an empty plot or a
  "no data" label rather than crashing.
- Single-value arrays (all values equal) are detected by `extent()` and
  `summarize()` so axes don't collapse.
- Colors cascade: explicit `color` on a datum > `categoryColors` map >
  default palette cycling through the six sketchy notebook accents.
- Animations respect mount order but don't use external animation libs -
  everything is CSS transitions or manual `requestAnimationFrame` tweens.
