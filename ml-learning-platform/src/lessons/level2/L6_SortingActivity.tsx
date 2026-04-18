"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowUpDown, FolderOpen, Timer, Shuffle, Play, RotateCcw } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { BarChart, PieChart, LineChart, ScatterPlot } from "@/components/viz/data-viz";
import { KMeansViz } from "@/components/viz/ml-algorithms";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

/* ------------------------------------------------------------------ */
/*  Riku helper                                                        */
/* ------------------------------------------------------------------ */

function RikuSays({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-sketchy p-3 flex gap-3 items-start" style={{ background: "#fff8e7" }}>
      <span className="text-2xl" aria-hidden>🐼</span>
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared utilities                                                   */
/* ------------------------------------------------------------------ */

const ACCENT_PALETTE = [
  "var(--accent-coral)",
  "var(--accent-mint)",
  "var(--accent-yellow)",
  "var(--accent-lav)",
  "var(--accent-sky)",
  "var(--accent-peach)",
];

function colorForValue(value: number, max: number): string {
  const t = max > 0 ? value / max : 0;
  if (t < 0.2) return "var(--accent-lav)";
  if (t < 0.4) return "var(--accent-sky)";
  if (t < 0.6) return "var(--accent-mint)";
  if (t < 0.8) return "var(--accent-yellow)";
  return "var(--accent-coral)";
}

function randomArray(size: number): number[] {
  const base = Array.from({ length: size }, (_, i) => Math.floor(((i + 1) / size) * 45) + 5);
  // Fisher-Yates with Math.random - state is local to this call, no seeded PRNG needed.
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base;
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Sort It Out                                                */
/* ------------------------------------------------------------------ */

function SortItOut() {
  const [values, setValues] = useState<number[]>(() => randomArray(10));
  const [sorted, setSorted] = useState(false);

  const shuffle = useCallback(() => {
    playPop();
    setValues(randomArray(10));
    setSorted(false);
  }, []);

  const sortNow = useCallback(() => {
    playSuccess();
    setValues((prev) => [...prev].sort((a, b) => a - b));
    setSorted(true);
  }, []);

  const max = useMemo(() => Math.max(...values, 1), [values]);

  const barData = useMemo(
    () =>
      values.map((value, i) => ({
        label: String(i + 1),
        value,
        color: colorForValue(value, max),
      })),
    [values, max],
  );

  return (
    <div className="space-y-5">
      <RikuSays>
        Sorting is just putting things in order. You&apos;ve done it with books, toys, and Spotify playlists. Computers
        do it a billion times a second - and the bars below are about to line up from tiny to tall.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold text-center text-foreground">
          Press <span className="marker-highlight-yellow">Sort</span> and watch the chaos become order
        </h3>

        <div className="w-full">
          <BarChart
            data={barData}
            title={sorted ? "Sorted - smallest to largest" : "Unsorted values"}
            yLabel="value"
            width={560}
            height={280}
            showValues
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={shuffle}
            className="btn-sketchy-outline inline-flex items-center gap-1.5 text-xs"
          >
            <Shuffle className="w-3.5 h-3.5" /> Shuffle
          </button>
          <button
            onClick={() => {
              playClick();
              sortNow();
            }}
            disabled={sorted}
            className={`btn-sketchy inline-flex items-center gap-1.5 text-xs ${
              sorted ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort!
          </button>
        </div>

        {sorted && (
          <p className="text-center font-hand text-sm font-bold text-foreground">
            Sorted! Every bar on the left is shorter than the bar on its right.
          </p>
        )}
      </div>

      <RikuSays>
        The height of each bar is the value. When they&apos;re sorted, the colors glide from cool lavender up to hot
        coral - that&apos;s the pattern your eyes were looking for all along.
      </RikuSays>

      <InfoBox variant="blue">
        Sorting means arranging values in order - smallest to largest, A to Z, oldest to newest. Computers do this by
        comparing two items at a time and swapping them if they&apos;re out of order. It sounds simple but it&apos;s
        one of the most useful tricks in all of computing.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Grouping Game                                              */
/* ------------------------------------------------------------------ */

type Shape = "Circle" | "Square" | "Triangle";
type Color = "Red" | "Blue" | "Green";
type Size = "Small" | "Large";
type GroupBy = "Shape" | "Color" | "Size";

interface ItemCard {
  id: number;
  shape: Shape;
  color: Color;
  size: Size;
}

const SHAPES: Shape[] = ["Circle", "Square", "Triangle"];
const COLORS: Color[] = ["Red", "Blue", "Green"];
const SIZES: Size[] = ["Small", "Large"];

function buildItems(): ItemCard[] {
  const items: ItemCard[] = [];
  let id = 0;
  for (const shape of SHAPES) {
    for (const color of COLORS) {
      const size: Size = SIZES[id % 2];
      items.push({ id, shape, color, size });
      id++;
    }
  }
  items.push({ id: 9, shape: "Circle", color: "Red", size: "Large" });
  items.push({ id: 10, shape: "Square", color: "Blue", size: "Small" });
  items.push({ id: 11, shape: "Triangle", color: "Green", size: "Large" });
  return items;
}

const ITEMS = buildItems();

function GroupingGame() {
  const [groupBy, setGroupBy] = useState<GroupBy>("Shape");

  const grouped = useMemo(() => {
    const groups: Record<string, ItemCard[]> = {};
    for (const item of ITEMS) {
      const key = item[groupBy.toLowerCase() as keyof ItemCard] as string;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [groupBy]);

  const groupKeys = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const pieData = useMemo(
    () =>
      groupKeys.map((key, i) => ({
        label: key,
        value: grouped[key].length,
        color: ACCENT_PALETTE[i % ACCENT_PALETTE.length],
      })),
    [groupKeys, grouped],
  );

  // Spread items out on a scatter plot, coloured by current grouping key.
  const scatterData = useMemo(() => {
    const perRow = 4;
    return ITEMS.map((item, i) => {
      const key = item[groupBy.toLowerCase() as keyof ItemCard] as string;
      return {
        x: (i % perRow) + 1,
        y: Math.floor(i / perRow) + 1,
        category: key,
        label: `${item.size} ${item.color} ${item.shape}`,
      };
    });
  }, [groupBy]);

  const categoryColors = useMemo(() => {
    const map: Record<string, string> = {};
    groupKeys.forEach((k, i) => {
      map[k] = ACCENT_PALETTE[i % ACCENT_PALETTE.length];
    });
    return map;
  }, [groupKeys]);

  return (
    <div className="space-y-5">
      <RikuSays>
        Grouping means &ldquo;this looks like that, so let&apos;s call them the same kind&rdquo;. Pick a rule - Shape,
        Color, or Size - and watch the same 12 items fall into totally different piles.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold text-center text-foreground">
          Group the same 12 items in different ways
        </h3>

        <div className="flex justify-center gap-2">
          {(["Shape", "Color", "Size"] as GroupBy[]).map((option) => (
            <button
              key={option}
              onClick={() => {
                playClick();
                setGroupBy(option);
              }}
              className={`px-4 py-2 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
                groupBy === option
                  ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                  : "bg-background hover:bg-accent-yellow/40"
              }`}
            >
              Group by {option}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div>
            <h4 className="font-hand text-sm font-bold text-center text-foreground mb-1">
              How big is each pile?
            </h4>
            <PieChart data={pieData} width={360} height={340} />
          </div>
          <div>
            <h4 className="font-hand text-sm font-bold text-center text-foreground mb-1">
              Each dot is one item, coloured by its group
            </h4>
            <ScatterPlot
              data={scatterData}
              categoryColors={categoryColors}
              width={420}
              height={320}
              xLabel="column"
              yLabel="row"
              pointRadius={10}
            />
          </div>
        </div>

        <p className="text-center font-hand text-xs font-bold text-foreground">
          {groupKeys.length} groups by <span className="marker-highlight-mint">{groupBy.toLowerCase()}</span> - the
          data didn&apos;t change, only the rule did.
        </p>
      </div>

      <RikuSays>
        Bonus nerd fact: when nobody tells the computer what the groups are and it still finds them, that&apos;s called
        <span className="marker-highlight-coral"> clustering</span>. Here&apos;s a tiny preview - press Step to watch
        it separate the blobs by itself.
      </RikuSays>

      <div className="card-sketchy p-4 space-y-2">
        <h4 className="font-hand text-sm font-bold text-center text-foreground">
          Sneak peek: K-Means automatic grouping
        </h4>
        <KMeansViz initialK={3} />
      </div>

      <InfoBox variant="amber">
        Grouping reveals hidden structure. The same data can be grouped in different ways, and each way tells you
        something different. Later in ML, grouping without labels is called <strong>clustering</strong> - and the
        K-Means playground above is a real algorithm doing exactly that.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Which Is Faster? (Algorithm growth curves)                 */
/* ------------------------------------------------------------------ */

// Counts comparisons for bubble sort on a fresh random array of size n.
function countBubbleComparisons(n: number): number {
  const arr = randomArray(n);
  let c = 0;
  for (let pass = 0; pass < arr.length - 1; pass++) {
    let swapped = false;
    for (let i = 0; i < arr.length - 1 - pass; i++) {
      c++;
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return c;
}

// Counts comparisons for selection sort on a fresh random array of size n.
function countSelectionComparisons(n: number): number {
  const arr = randomArray(n);
  let c = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      c++;
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return c;
}

const RACE_SIZES = [5, 10, 15, 20, 25, 30];

interface RaceRun {
  sizes: number[];
  bubble: number[];
  selection: number[];
}

function computeRace(): RaceRun {
  return {
    sizes: RACE_SIZES,
    bubble: RACE_SIZES.map((n) => countBubbleComparisons(n)),
    selection: RACE_SIZES.map((n) => countSelectionComparisons(n)),
  };
}

function WhichIsFaster() {
  const [run, setRun] = useState<RaceRun>(() => computeRace());

  const newRace = useCallback(() => {
    playPop();
    setRun(computeRace());
  }, []);

  const lineSeries = useMemo(
    () => [
      {
        name: "Bubble Sort",
        data: run.sizes.map((n, i) => ({ x: n, y: run.bubble[i] })),
        color: "var(--accent-coral)",
      },
      {
        name: "Selection Sort",
        data: run.sizes.map((n, i) => ({ x: n, y: run.selection[i] })),
        color: "var(--accent-sky)",
      },
    ],
    [run],
  );

  const biggest = RACE_SIZES[RACE_SIZES.length - 1];
  const lastBubble = run.bubble[run.bubble.length - 1];
  const lastSelection = run.selection[run.selection.length - 1];

  const finalBarData = useMemo(
    () => [
      { label: "Bubble", value: lastBubble, color: "var(--accent-coral)" },
      { label: "Selection", value: lastSelection, color: "var(--accent-sky)" },
    ],
    [lastBubble, lastSelection],
  );

  const winnerLabel =
    lastBubble === lastSelection
      ? "It's a tie!"
      : lastBubble < lastSelection
        ? "Bubble Sort wins on this data!"
        : "Selection Sort wins on this data!";

  return (
    <div className="space-y-5">
      <RikuSays>
        Two algorithms, one job. Let&apos;s run Bubble Sort and Selection Sort on arrays that get bigger and bigger, and
        count how many comparisons each one needs.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold text-center text-foreground">
          Comparisons grow as the array grows
        </h3>

        <LineChart
          series={lineSeries}
          width={560}
          height={320}
          title="Comparisons vs array size"
          xLabel="array size (n)"
          yLabel="comparisons"
          smooth
          showPoints
        />

        <p className="text-center font-hand text-xs text-foreground">
          Notice how both curves bend upward. Double the array and you do way more than double the work - welcome to
          <span className="marker-highlight-yellow"> O(n²)</span>.
        </p>
      </div>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold text-center text-foreground">
          Head-to-head: size {biggest}
        </h3>

        <BarChart
          data={finalBarData}
          width={480}
          height={260}
          yLabel="comparisons"
          showValues
        />

        <p className="text-center font-hand text-sm font-bold text-foreground">{winnerLabel}</p>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              playClick();
              newRace();
            }}
            className="btn-sketchy inline-flex items-center gap-1.5 text-xs"
          >
            <Play className="w-3.5 h-3.5" /> Run new race
          </button>
          <button
            onClick={() => {
              playClick();
              newRace();
            }}
            className="btn-sketchy-outline inline-flex items-center gap-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reshuffle
          </button>
        </div>
      </div>

      <RikuSays>
        Spoiler: neither is always faster. The winner depends on how the data is already arranged. That&apos;s exactly
        why computer scientists invented smarter sorts like merge sort and quicksort - but those are a story for
        another day.
      </RikuSays>

      <InfoBox variant="green">
        Different algorithms solve the same problem with different numbers of steps. Finding faster algorithms is a
        huge part of computer science. Both bubble and selection sort grow like n² - fine for 10 items, painful for
        10 million.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "In bubble sort, what happens in each step?",
    options: [
      "All elements are shuffled randomly",
      "Two neighboring elements are compared and possibly swapped",
      "The smallest element teleports to the front",
      "The list is split in half",
    ],
    correctIndex: 1,
    explanation:
      "Bubble sort compares two neighboring elements and swaps them if they're in the wrong order. This is repeated until the entire list is sorted.",
  },
  {
    question:
      "If you group animals by 'number of legs', how many groups do you get for: cat, fish, spider, bird, snake?",
    options: ["2 groups", "3 groups", "4 groups", "5 groups"],
    correctIndex: 2,
    explanation:
      "Cat = 4 legs, Fish = 0 legs, Spider = 8 legs, Bird = 2 legs, Snake = 0 legs. That's 4 groups: 0, 2, 4, and 8 legs. (Fish and snake are in the same group!)",
  },
  {
    question: "Why does sorting data help us?",
    options: [
      "It makes the computer faster",
      "It makes patterns easier to see",
      "It deletes duplicate data",
      "It doesn't help at all",
    ],
    correctIndex: 1,
    explanation:
      "Sorted data makes patterns easier to spot - you can quickly find the smallest, largest, or most common values, and see how data is distributed.",
  },
  {
    question: "Between bubble sort and selection sort, which one is always faster?",
    options: ["Bubble sort", "Selection sort", "They're always the same", "It depends on the data"],
    correctIndex: 3,
    explanation:
      "Neither algorithm is always faster - it depends on how the data is initially arranged. This is why computer scientists study many different sorting algorithms!",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L6_SortingActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "sort",
        label: "Sort It Out",
        icon: <ArrowUpDown className="w-4 h-4" />,
        content: <SortItOut />,
      },
      {
        id: "grouping",
        label: "Grouping Game",
        icon: <FolderOpen className="w-4 h-4" />,
        content: <GroupingGame />,
      },
      {
        id: "race",
        label: "Which Is Faster?",
        icon: <Timer className="w-4 h-4" />,
        content: <WhichIsFaster />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Sorting and Grouping"
      level={2}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You can sort and group data - awesome! Now let's use everything you've learned to make predictions. What if you could guess what happens next?"
      story={
        <StorySection
          paragraphs={[
            "Aru's bookshelf was a disaster. Science books mixed with comics, thick novels next to tiny notebooks - she could never find anything.",
            "Aru: \"Byte, I need to find my math textbook but it's buried somewhere in this mess!\"",
            "Byte: \"Let me show you how I'd handle this. First, I'd sort them - maybe by size, or by subject. And then I'd group them - all science books together, all comics together. Sorting and grouping are two of the most powerful things you can do with messy data.\"",
            "Aru: \"But how do you sort when you can only compare two things at a time?\"",
            "Byte: \"Great question! That's exactly how sorting algorithms work. Let me show you step by step.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Sorting means arranging items in order (smallest to largest, A to Z). Grouping means putting similar items together by a shared property. Computers sort by comparing two items at a time and swapping them if needed. Different sorting algorithms take different numbers of steps - finding faster algorithms is a core challenge in computer science."
        />
      }
    />
  );
}
