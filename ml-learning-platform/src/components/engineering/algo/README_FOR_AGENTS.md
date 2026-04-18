# DSA Animation Primitives - API Reference for Lesson Builders

Import from `@/components/engineering/algo` (single barrel).

## Absolute rules
- **NO gradients anywhere.** Solid colors, translucent solids (e.g. `rgba(...)` or `${color}18` hex alpha), or borders only.
- **All files `"use client"` at top.** No SSR data fetching.
- **Use only the CSS variables:** `var(--eng-primary)`, `var(--eng-text)`, `var(--eng-text-muted)`, `var(--eng-bg)`, `var(--eng-surface)`, `var(--eng-border)`, `var(--eng-primary-light)`, `var(--eng-success)`, `var(--eng-warning)`, `var(--eng-danger)`, `var(--eng-font)`, `var(--eng-radius)`, `var(--eng-shadow)` / `--eng-shadow-md` / `--eng-shadow-lg`, `var(--eng-accent-dsa)` (#e76f51).
- **Utility classes allowed:** `.card-eng`, `.btn-eng`, `.btn-eng-outline`, `.tag-eng`, `.info-eng`, `.eng-fadeIn`.
- Font stack for code: `'"SF Mono", Menlo, Consolas, monospace'`. For UI: `var(--eng-font)`.

## The pattern: pre-compute frames, then scrub

```tsx
import { AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer, ArrayBars } from "@/components/engineering/algo";

interface Frame { line: number; vars: Record<string, unknown>; message: string; /* + lesson-specific state */ }

function buildFrames(inputs...): Frame[] { /* pure fn */ }

function VisualizeTab() {
  const [input, setInput] = useState(...);
  const frames = useMemo(() => buildFrames(parsed), [parsed]);
  const player = useStepPlayer(frames);
  const frame = player.current!;
  return (
    <AlgoCanvas
      title="..."
      player={player}
      input={<InputEditor ... />}
      pseudocode={<PseudocodePanel lines={PSEUDO} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} flashKeys={...} />}
    >
      <YourVisualization frame={frame} />
    </AlgoCanvas>
  );
}
```

`useStepPlayer` returns `{ frames, index, current, isPlaying, speed, play, pause, reset, step, seek, setSpeed, progress }`. Hand it to `AlgoCanvas` as `player={player}` and it wires all controls (play/pause/step/reset/speed 0.5×/1×/2×/4×/seek).

## Primitives

### `AlgoCanvas`
Layout + controls. Props: `{ title?, player, children, pseudocode?, variables?, input?, status?, legend? }`. The children slot is where you draw your visualization.

### `PseudocodePanel`
`{ lines: string[]; activeLine?: number; title?; highlightLines?: number[] }`. Dark monospace block. `activeLine` renders the blue bar.

### `VariablesPanel`
`{ vars: Record<string, string|number|boolean|undefined>; title?; flashKeys?: string[] }`. Flashing key gets a blue outline for one frame - use it when a variable mutates.

### `ArrayBars`
Bar chart for array visualizations. Props: `{ values: number[]; states?: CellState[]; pointers?: Record<string, number>; labels?: string[]; height?; windowRange?: [lo, hi]; showIndex?; min?; max? }`. Pointers map pointer-name to index and render a labeled arrow above the bar (e.g. `{ i: 3, j: 7 }` shows "i" and "j" above bars 3 and 7). `windowRange` draws a purple border around `[lo..hi]` - perfect for sliding window.

`CellState` values (each maps to a known color):
`default | compare | swap | active | done | pivot | window | match | mismatch | sorted | visited | frontier | path | low | high | mid`

### `MemoryCells`
Horizontal strip with explicit cell borders - use for strings, memory layouts, hash buckets. Same `states` and `pointers` API as `ArrayBars`. Supports `{ showAddress?, addressBase?, bytesPerCell?, cellWidth? }` for memory-address rendering.

### `StackColumn`
`{ items: { value, color?, label? }[]; title?; maxHeight?; width?; topLabel? }`. Vertical stack, top element emphasized with ring. Items pushed should be appended to the end of the array (top = last).

### `QueueTube`
`{ items; title?; maxWidth?; frontLabel?; rearLabel? }`. Horizontal FIFO. items[0] is front, last is rear.

### `TreeCanvas`
SVG tree renderer. Props: `{ nodes: Record<string, TreeNodeData>; root?; edgeStates?; width?; height?; nodeRadius? }`. `TreeNodeData = { id, value, left?, right?, state?, meta? }`. `edgeStates` keyed by `"${parentId}-${childId}"`. `meta` like `{ BF: 1, h: 3 }` renders small labels under the node.

### `GraphCanvas`
SVG graph renderer with adjustable node positions. Props: `{ nodes: GraphNodeData[]; edges: GraphEdgeData[]; width?; height?; nodeRadius?; showWeights? }`. `GraphNodeData = { id, x, y, label?, state?, meta? }`. `GraphEdgeData = { from, to, weight?, directed?, state? }`. Automatic arrow markers on directed edges.

### `RecursionTree`
SVG call-tree renderer. Props: `{ nodes: RecursionNode[]; activeId?; width?; height? }`. `RecursionNode = { id, label, parent?, state?, returnValue?, depth }`. Layout auto-assigns positions by `depth` level.

### `InputEditor`
`{ label; value; onApply; presets?; onRandom?; placeholder?; helper? }`. User types in a string; on Apply (button or Enter) your callback runs. Presets render as little chips users can click for instant examples. Include a "Random" handler to demo with fresh inputs.

## Lesson file pattern

```tsx
// src/lessons/engineering/dsa/levelN/DSA_LN_<name>Activity.tsx
"use client";
import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import { /* primitives */ } from "@/components/engineering/algo";

// ...LearnTab / VisualizeTab / TryTab / InsightTab components...

export default function DSA_LN_<Name>Activity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];
  const quiz: EngQuizQuestion[] = [ /* 4 MCQs */ ];
  return (
    <EngineeringLessonShell
      title="..." level={N} lessonNumber={M}
      tabs={tabs} quiz={quiz}
      gateRelevance="..." placementRelevance="..." nextLessonHint="..."
    />
  );
}
```

Route page file:
```tsx
// src/app/(engineering)/engineering/dsa/levelN/<slug>/page.tsx
import DSA_LN_<Name>Activity from "@/lessons/engineering/dsa/levelN/DSA_LN_<Name>Activity";
export default function Page() { return <DSA_LN_<Name>Activity />; }
```

## Quality bar (match Visualgo + 3Blue1Brown)

- **Smooth transitions.** Use `transition: "all 0.3s ease"` or explicit `"background 0.3s, transform 0.3s"`. Don't jump - tween.
- **Every frame tells a story.** The `message` field is shown in the status bar; write sentences that explain *why* the algorithm just moved.
- **Line-sync pseudocode.** Every frame must set `line` to the pseudocode line currently executing. Agents who skip this are failing the spec.
- **Meaningful state colors.** Use `compare` (amber) when comparing, `swap` (red) when swapping, `active` (blue) for current pointer, `done`/`sorted` (green) when a position is finalized, `pivot` (gold) for pivots, `window` (purple) for sliding windows.
- **Named pointers.** Don't show raw indices - show `i`, `j`, `left`, `right`, `slow`, `fast`. Users think in variable names.
- **Real user input.** Every Visualize tab accepts user input via `InputEditor`. Presets cover edge cases (empty, sorted, reverse-sorted, duplicates).
- **No step feels wasted.** Each frame should advance understanding. If two consecutive frames look identical, merge them or add a clarifying message.

## Reference lesson
The gold-standard template is [DSA_L1_AlgorithmTracerActivity.tsx](../lessons/engineering/dsa/level1/DSA_L1_AlgorithmTracerActivity.tsx). Match its structure, tab taxonomy (Learn / Visualize / Try It / Insight + auto Challenge), quiz depth (4 MCQs with explanations), and styling.
