# ML Algorithms Visualization Library

A playful, "sketchy notebook" style set of interactive ML playground components for Red Panda Learn. Every component is a **client component** (drop-in for Next.js App Router), uses only inline SVG (no chart libraries), and comes with sensible defaults so you can render it with zero props.

```tsx
import { KNNViz, KMeansViz } from "@/components/viz/ml-algorithms";

export default function Demo() {
  return (
    <>
      <KNNViz />
      <KMeansViz initialK={4} />
    </>
  );
}
```

## Data Generator

`dataGenerator.ts` exports a seeded PRNG (`mulberry32`) and a handful of 2D dataset generators. All datasets live in a `[0, 100] × [0, 100]` logical coordinate space so every component shares the same viewBox.

| Function | Signature | Description |
| --- | --- | --- |
| `mulberry32(seed)` | `(seed: number) => () => number` | Deterministic PRNG |
| `generateClusters` | `(k?, pointsPerCluster?, seed?) => Point[]` | `k` Gaussian blobs labelled `0..k-1` |
| `generateLinearData` | `(n?, slope?, intercept?, noise?, seed?) => Point[]` | Noisy `y = m·x + b` |
| `generateClassification2D` | `(n?, seed?) => Point[]` | Two well-separated blobs (labels `0`, `1`) |
| `generateCircularData` | `(n?, seed?) => Point[]` | Concentric rings (non-linearly separable) |
| `generateMoons` | `(n?, seed?) => Point[]` | Interlocking crescents |

`Point = { x: number; y: number; label?: number }`

---

## KNNViz

Interactive K-Nearest Neighbors. Click anywhere on the plot to classify a test point.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `points` | `Point[]` | `generateClassification2D(30, 11)` | Training points with `label` |
| `initialK` | `number` | `3` | Starting value of K (1–15) |
| `initialMetric` | `'euclidean' \| 'manhattan'` | `'euclidean'` | Distance metric |

```tsx
<KNNViz initialK={5} initialMetric="manhattan" />
```

**Algorithm:** brute-force - compute all pairwise distances, sort, take top K, majority vote.

---

## DecisionTreeViz

Side-by-side 2D scatter with decision regions plus a tree diagram. Depth slider controls recursion.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Point[]` | `generateClassification2D(40, 17)` | Training points |
| `maxDepth` | `number` | `4` | Upper bound on the depth slider |

```tsx
<DecisionTreeViz maxDepth={5} />
```

**Algorithm:** greedy splits by Gini impurity on a single feature at a time. Simplified for teaching - real trees also prune and handle missing values.

---

## KMeansViz

Animated Lloyd's algorithm with Step / Play / Reset controls.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `points` | `Point[]` | `generateClusters(3, 18, 42)` | Unlabelled points |
| `initialK` | `number` | `3` | Starting number of centroids (2–8) |

```tsx
<KMeansViz points={generateClusters(4, 20, 7)} initialK={4} />
```

**Algorithm:** random init, assign-then-update, converges when total centroid movement < 0.5 (or max 20 iterations).

---

## LinearRegressionViz

Drag slope & intercept sliders, watch MSE live. Click **Fit** to animate to the closed-form least-squares solution.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Point[]` | `generateLinearData(22, 0.6, 15, 8, 5)` | Points to fit |
| `showResiduals` | `boolean` | `true` | Show vertical residual lines |
| `showMSE` | `boolean` | `true` | Show live MSE readout |

```tsx
<LinearRegressionViz showResiduals showMSE />
```

**Algorithm:** closed-form OLS `m = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²)`.

---

## LogisticRegressionViz

Binary classification boundary with sigmoid probability shading.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Point[]` | `generateClassification2D(40, 13)` | Labelled points |

Controls: `w₁`, `w₂`, `b`, and `threshold` sliders.

```tsx
<LogisticRegressionViz />
```

**Algorithm:** sliders set the parameters directly - no training. `P(y=1) = sigmoid(w₁·x + w₂·y + b)`. Decision boundary is the line where `P = threshold`.

---

## SVMViz

Max-margin line, margin band, and highlighted support vectors. Toggle linear/RBF kernel; adjust `C`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Point[]` | `generateClassification2D(32, 19)` | Labelled points |

**Algorithm (simplified):** the linear "SVM" uses the perpendicular bisector of the two class centroids as a proxy for the max-margin line, then calls the two closest points per class the "support vectors". The RBF mode draws a Gaussian decision field, not a real kernel SVM. Both are intentional teaching simplifications - a real libsvm fit would require an O(n²) QP solver that is overkill for a playground.

---

## RandomForestViz

Shows `numTrees` mini decision-region plots. Click the big plot to drop a test point and watch each tree vote.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Point[]` | `generateClassification2D(40, 29)` | Labelled points |
| `numTrees` | `number` | `5` | Starting forest size (1–10) |

**Algorithm:** bootstrap sample per tree, build a depth-3 Gini tree on each, then majority vote.

---

## GradientDescentViz

Animated descent on a 2D loss surface.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `lossFn` | `(w: number, b: number) => number` | skewed quadratic | Any scalar loss over `[0, 100]²` |
| `initialLearningRate` | `number` | `4` | Step size |
| `startPoint` | `[number, number]` | `[20, 80]` | Starting `(w, b)` |

```tsx
<GradientDescentViz
  lossFn={(w, b) => (w - 60) ** 2 / 100 + Math.abs(b - 40) / 5}
  initialLearningRate={2}
  startPoint={[10, 10]}
/>
```

**Algorithm:** central-difference numeric gradient, `θ ← θ − lr · ∇L`. Loss is rendered as a coarse contour heatmap - real contour tracing (marching squares) was overkill for the educational goal.

---

## ConfusionMatrixViz

Pure display component - no interaction. Call-site owns the counts.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tp` | `number` | required | True positives |
| `tn` | `number` | required | True negatives |
| `fp` | `number` | required | False positives |
| `fn` | `number` | required | False negatives |
| `labels` | `[string, string]` | `["Positive", "Negative"]` | Row / column header labels |

```tsx
<ConfusionMatrixViz tp={42} tn={35} fp={3} fn={5} />
```

Derived metrics: accuracy, precision, recall, F1 score.

---

## Teaching Simplifications

- **SVM:** not a real QP solver - uses the perpendicular bisector of class centroids as a stand-in for the max-margin hyperplane. Works visually for linearly separable blobs.
- **Logistic Regression:** manual weight sliders, no actual fitting. The point is to let students *feel* how weights push the boundary.
- **Decision Tree / Random Forest:** splits on a single axis-aligned threshold by Gini impurity. No pruning.
- **Gradient Descent:** numeric gradient via central differences - fine for smooth 2D toy losses.
- **K-Means:** random init. No k-means++. Fixed max iterations = 20.

These shortcuts are **intentional** - the components are for grade 8–12 intuition building, not production ML.
