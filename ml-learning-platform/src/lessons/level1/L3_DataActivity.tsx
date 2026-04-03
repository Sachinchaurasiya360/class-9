import { useState, useMemo, useCallback } from "react";
import {
  Globe,
  Table,
  ArrowUpDown,
  Thermometer,
  Clock,
  User,
  Apple,
  Circle,
  Ruler,
  HelpCircle,
  CheckCircle2,
  Plus,
  RotateCcw,
  PartyPopper,
} from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DataCard {
  id: number;
  icon: React.ReactNode;
  label: string;
  value: string;
  type: "Number" | "Category";
}

interface TableRow {
  name: string | null;
  age: number | null;
  color: string | null;
  height: number | null;
}

interface SortItem {
  id: number;
  label: string;
  correctBin: "number" | "category";
}

/* ------------------------------------------------------------------ */
/*  Tab 1 — Data All Around Us                                        */
/* ------------------------------------------------------------------ */

const DATA_CARDS: DataCard[] = [
  { id: 0, icon: <Thermometer className="w-6 h-6" />, label: "Temperature", value: "28\u00b0C", type: "Number" },
  { id: 1, icon: <Clock className="w-6 h-6" />, label: "Time", value: "3:45 PM", type: "Number" },
  { id: 2, icon: <User className="w-6 h-6" />, label: "Hair Color", value: "Brown", type: "Category" },
  { id: 3, icon: <Apple className="w-6 h-6" />, label: "Apples in basket", value: "7", type: "Number" },
  { id: 4, icon: <Circle className="w-6 h-6" />, label: "Traffic Light", value: "Red", type: "Category" },
  { id: 5, icon: <Ruler className="w-6 h-6" />, label: "Height", value: "152 cm", type: "Number" },
];

function Tab1DataAroundUs() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const handleFlip = useCallback((id: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const allFlipped = flipped.size === DATA_CARDS.length;

  const discoveredCards = useMemo(
    () => DATA_CARDS.filter((c) => flipped.has(c.id)),
    [flipped],
  );

  return (
    <div className="space-y-5">
      {/* Counter */}
      <div className="text-center">
        <span className="inline-block bg-slate-100 text-slate-700 text-sm font-semibold px-4 py-1.5 rounded-full">
          Data discovered: {flipped.size} / {DATA_CARDS.length}
        </span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DATA_CARDS.map((card) => {
          const isFlipped = flipped.has(card.id);
          return (
            <button
              key={card.id}
              onClick={() => !isFlipped && handleFlip(card.id)}
              className={`relative rounded-xl border-2 p-4 text-center transition-all duration-500 min-h-[130px] flex flex-col items-center justify-center gap-2 ${
                isFlipped
                  ? "bg-white border-slate-200 shadow-sm cursor-default"
                  : "bg-slate-100 border-slate-300 hover:border-indigo-400 hover:shadow-md cursor-pointer"
              }`}
              style={{ perspective: "600px" }}
            >
              {isFlipped ? (
                <div className="animate-fadeIn flex flex-col items-center gap-1.5">
                  <span className="text-slate-500">{card.icon}</span>
                  <p className="text-xs font-medium text-slate-500">{card.label}</p>
                  <p className="text-sm font-bold text-slate-800">{card.value}</p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      card.type === "Number"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {card.type}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <HelpCircle className="w-8 h-8" />
                  <span className="text-xs font-medium">Tap to reveal</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Celebration */}
      {allFlipped && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center space-y-1 animate-fadeIn">
          <PartyPopper className="w-7 h-7 text-indigo-500 mx-auto" />
          <p className="text-sm font-bold text-indigo-800">Amazing! You found all the data!</p>
          <p className="text-xs text-indigo-600">
            Everything around you can be measured or described — that means everything is data!
          </p>
        </div>
      )}

      {/* Auto-filling data table */}
      {discoveredCards.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-3 py-2 text-left font-semibold">#</th>
                <th className="px-3 py-2 text-left font-semibold">What</th>
                <th className="px-3 py-2 text-left font-semibold">Value</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
              </tr>
            </thead>
            <tbody>
              {discoveredCards.map((card, i) => (
                <tr
                  key={card.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-slate-700">{card.label}</td>
                  <td className="px-3 py-2 text-slate-800 font-semibold">{card.value}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        card.type === "Number"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {card.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InfoBox variant="blue">
        Data is just information that has been organized so a computer can work with it.
        Numbers, words, colors — all of it is data! Look around you right now — everything
        you can measure or describe is data.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Build a Data Table                                        */
/* ------------------------------------------------------------------ */

const NAME_OPTIONS = ["Mia", "Raj", "Zoe"];
const COLOR_OPTIONS = ["Red", "Blue", "Green", "Yellow", "Purple"];

const INITIAL_TABLE: TableRow[] = [
  { name: "Alex", age: 10, color: "Blue", height: 140 },
  { name: "Sam", age: 11, color: "Green", height: 145 },
  { name: null, age: null, color: null, height: null },
  { name: null, age: 12, color: null, height: null },
  { name: null, age: null, color: null, height: 155 },
];

type CellField = "name" | "age" | "color" | "height";

function HeightSlider({ onConfirm }: { onConfirm: (v: number) => void }) {
  const [sliderVal, setSliderVal] = useState(145);
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={120}
        max={170}
        value={sliderVal}
        onChange={(e) => setSliderVal(Number(e.target.value))}
        className="w-24 accent-indigo-500"
      />
      <span className="text-[11px] font-mono text-slate-600 w-8">{sliderVal}</span>
      <button
        onClick={() => onConfirm(sliderVal)}
        className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[11px] font-medium hover:bg-green-200 transition-colors"
      >
        Set
      </button>
    </div>
  );
}

function Tab2BuildTable() {
  const [rows, setRows] = useState<TableRow[]>(() =>
    INITIAL_TABLE.map((r) => ({ ...r })),
  );
  const [editing, setEditing] = useState<{ row: number; field: CellField } | null>(null);

  const updateCell = useCallback(
    (rowIdx: number, field: CellField, value: string | number) => {
      setRows((prev) =>
        prev.map((r, i) =>
          i === rowIdx ? { ...r, [field]: value } : r,
        ),
      );
      setEditing(null);
    },
    [],
  );

  /* Computed stats — only count rows where needed fields are filled */
  const stats = useMemo(() => {
    const filledAges = rows.filter((r) => r.age !== null).map((r) => r.age as number);
    const filledColors = rows.filter((r) => r.color !== null).map((r) => r.color as string);
    const filledHeights = rows.filter((r) => r.height !== null).map((r) => r.height as number);
    const filledNames = rows.filter((r) => r.name !== null);

    const avgAge =
      filledAges.length > 0
        ? (filledAges.reduce((a, b) => a + b, 0) / filledAges.length).toFixed(1)
        : "—";

    let mostCommonColor = "—";
    if (filledColors.length > 0) {
      const freq: Record<string, number> = {};
      filledColors.forEach((c) => (freq[c] = (freq[c] || 0) + 1));
      mostCommonColor = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    }

    const tallest =
      filledHeights.length > 0 ? Math.max(...filledHeights) : "—";

    return { avgAge, mostCommonColor, tallest, totalStudents: filledNames.length };
  }, [rows]);

  const renderCell = (rowIdx: number, field: CellField, value: string | number | null) => {
    const isEditing = editing?.row === rowIdx && editing?.field === field;
    const isEmpty = value === null;

    /* Pre-filled cell */
    if (!isEmpty && !isEditing) {
      return (
        <span className="text-slate-800 font-medium text-xs">
          {field === "color" ? (
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border border-slate-300 inline-block"
                style={{ backgroundColor: (value as string).toLowerCase() }}
              />
              {value}
            </span>
          ) : (
            value
          )}
        </span>
      );
    }

    /* Empty — show + button */
    if (isEmpty && !isEditing) {
      return (
        <button
          onClick={() => setEditing({ row: rowIdx, field })}
          className="w-full flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      );
    }

    /* Inline editor */
    if (isEditing) {
      switch (field) {
        case "name":
          return (
            <div className="flex flex-wrap gap-1">
              {NAME_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => updateCell(rowIdx, "name", n)}
                  className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[11px] font-medium hover:bg-indigo-200 transition-colors"
                >
                  {n}
                </button>
              ))}
            </div>
          );
        case "age":
          return (
            <div className="flex items-center gap-1">
              {[8, 9, 10, 11, 12, 13, 14, 15].map((a) => (
                <button
                  key={a}
                  onClick={() => updateCell(rowIdx, "age", a)}
                  className="w-6 h-6 rounded text-[11px] font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  {a}
                </button>
              ))}
            </div>
          );
        case "color":
          return (
            <div className="flex flex-wrap gap-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateCell(rowIdx, "color", c)}
                  className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-indigo-400 transition-colors"
                  style={{ backgroundColor: c.toLowerCase() }}
                  title={c}
                />
              ))}
            </div>
          );
        case "height":
          return (
            <HeightSlider onConfirm={(v) => updateCell(rowIdx, "height", v)} />
          );
      }
    }

    return null;
  };

  return (
    <div className="space-y-5">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-3 py-2 text-left font-semibold">Name</th>
              <th className="px-3 py-2 text-left font-semibold">Age</th>
              <th className="px-3 py-2 text-left font-semibold">Favorite Color</th>
              <th className="px-3 py-2 text-left font-semibold">Height (cm)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="px-3 py-2.5 min-w-[90px]">{renderCell(i, "name", row.name)}</td>
                <td className="px-3 py-2.5 min-w-[120px]">{renderCell(i, "age", row.age)}</td>
                <td className="px-3 py-2.5 min-w-[140px]">{renderCell(i, "color", row.color)}</td>
                <td className="px-3 py-2.5 min-w-[180px]">{renderCell(i, "height", row.height)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Average Age", value: stats.avgAge },
          { label: "Most Common Color", value: stats.mostCommonColor },
          { label: "Tallest", value: stats.tallest === "—" ? "—" : `${stats.tallest} cm` },
          { label: "Total Students", value: stats.totalStudents },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-xl p-3 text-center"
          >
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
              {s.label}
            </p>
            <p className="text-lg font-bold text-slate-800">{String(s.value)}</p>
          </div>
        ))}
      </div>

      <InfoBox variant="amber">
        A data table organizes information into rows (one per person or thing) and columns
        (one per measurement). This is how most datasets in the world look!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Data Types Sorting Game                                   */
/* ------------------------------------------------------------------ */

const SORT_ITEMS: SortItem[] = [
  { id: 0, label: "42", correctBin: "number" },
  { id: 1, label: "Blue", correctBin: "category" },
  { id: 2, label: "3.14", correctBin: "number" },
  { id: 3, label: "Cat", correctBin: "category" },
  { id: 4, label: "True", correctBin: "category" },
  { id: 5, label: "Hello", correctBin: "category" },
  { id: 6, label: "99", correctBin: "number" },
  { id: 7, label: "Male", correctBin: "category" },
  { id: 8, label: "5 stars", correctBin: "category" },
  { id: 9, label: "Yes", correctBin: "category" },
  { id: 10, label: "100 kg", correctBin: "number" },
  { id: 11, label: "Red", correctBin: "category" },
];

function Tab3SortingGame() {
  const [sorted, setSorted] = useState<Record<number, "number" | "category">>({});
  const [feedback, setFeedback] = useState<Record<number, "correct" | "wrong">>({});
  const [shaking, setShaking] = useState<number | null>(null);

  const correctCount = useMemo(
    () => Object.values(feedback).filter((v) => v === "correct").length,
    [feedback],
  );

  const handleSort = useCallback(
    (item: SortItem, chosenBin: "number" | "category") => {
      if (sorted[item.id] !== undefined) return;

      if (chosenBin === item.correctBin) {
        setSorted((prev) => ({ ...prev, [item.id]: chosenBin }));
        setFeedback((prev) => ({ ...prev, [item.id]: "correct" }));
      } else {
        setFeedback((prev) => ({ ...prev, [item.id]: "wrong" }));
        setShaking(item.id);
        setTimeout(() => {
          setShaking(null);
          setFeedback((prev) => {
            const next = { ...prev };
            delete next[item.id];
            return next;
          });
        }, 700);
      }
    },
    [sorted],
  );

  const handleReset = useCallback(() => {
    setSorted({});
    setFeedback({});
    setShaking(null);
  }, []);

  const allDone = Object.keys(sorted).length === SORT_ITEMS.length;

  /* Bin contents */
  const numberBinItems = SORT_ITEMS.filter((it) => sorted[it.id] === "number");
  const categoryBinItems = SORT_ITEMS.filter((it) => sorted[it.id] === "category");

  return (
    <div className="space-y-5">
      {/* Score */}
      <div className="flex items-center justify-between">
        <span className="inline-block bg-slate-100 text-slate-700 text-sm font-semibold px-4 py-1.5 rounded-full">
          Correct: {correctCount} / {SORT_ITEMS.length}
        </span>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* All-done celebration */}
      {allDone && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center space-y-1 animate-fadeIn">
          <CheckCircle2 className="w-7 h-7 text-green-500 mx-auto" />
          <p className="text-sm font-bold text-green-800">
            Great work! You sorted all {SORT_ITEMS.length} items!
          </p>
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {SORT_ITEMS.map((item) => {
          const isSorted = sorted[item.id] !== undefined;
          const fb = feedback[item.id];
          const isShaking = shaking === item.id;

          if (isSorted) {
            return (
              <div
                key={item.id}
                className="rounded-lg border-2 border-green-300 bg-green-50 px-3 py-2 text-center text-xs font-semibold text-green-700 flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {item.label}
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className={`rounded-xl border-2 bg-white p-3 text-center space-y-2 transition-all duration-200 ${
                fb === "wrong"
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200 hover:border-indigo-300 hover:shadow-sm"
              } ${isShaking ? "animate-shake" : ""}`}
            >
              <p className="text-sm font-bold text-slate-800">{item.label}</p>
              <div className="flex gap-1 justify-center">
                <button
                  onClick={() => handleSort(item, "number")}
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  Number
                </button>
                <button
                  onClick={() => handleSort(item, "category")}
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                >
                  Category
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bins */}
      <div className="grid grid-cols-2 gap-3">
        {/* Numbers bin */}
        <div className="rounded-xl border-2 border-blue-300 bg-blue-50/50 p-3 min-h-[100px]">
          <p className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide text-center">
            Numbers
          </p>
          <div className="flex flex-wrap gap-1 justify-center">
            {numberBinItems.map((it) => (
              <span
                key={it.id}
                className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-semibold"
              >
                {it.label}
              </span>
            ))}
            {numberBinItems.length === 0 && (
              <span className="text-[11px] text-blue-300 italic">Drop numbers here</span>
            )}
          </div>
        </div>

        {/* Categories bin */}
        <div className="rounded-xl border-2 border-purple-300 bg-purple-50/50 p-3 min-h-[100px]">
          <p className="text-xs font-bold text-purple-700 mb-2 uppercase tracking-wide text-center">
            Categories
          </p>
          <div className="flex flex-wrap gap-1 justify-center">
            {categoryBinItems.map((it) => (
              <span
                key={it.id}
                className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] font-semibold"
              >
                {it.label}
              </span>
            ))}
            {categoryBinItems.length === 0 && (
              <span className="text-[11px] text-purple-300 italic">Drop categories here</span>
            )}
          </div>
        </div>
      </div>

      <InfoBox variant="green">
        Knowing whether data is a number or a category matters because computers handle them
        differently. Numbers can be added and averaged. Categories can be counted and grouped.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz questions                                                     */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "Which of these is NOT data?",
    options: [
      "Your height",
      "Your favorite song",
      "The number of clouds in the sky",
      "None \u2014 all of these are data",
    ],
    correctIndex: 3,
    explanation:
      "Everything you can measure, count, or describe is data! Your height is a number, your favorite song is a category, and cloud count is a number.",
  },
  {
    question: "What type of data is 'Red'?",
    options: ["A number", "A category", "A formula", "Not data"],
    correctIndex: 1,
    explanation:
      "'Red' is a category (also called categorical data). You can't add or average colors, but you can count how many things are red!",
  },
  {
    question: "In a data table, what does each ROW usually represent?",
    options: [
      "A measurement type",
      "One item or observation",
      "A formula",
      "The column header",
    ],
    correctIndex: 1,
    explanation:
      "Each row represents one item (like one person, one animal, or one measurement). Each column represents a different property.",
  },
  {
    question: "Why is it useful to know if data is a number or a category?",
    options: [
      "It isn't useful",
      "Computers handle them differently",
      "Categories are always better",
      "Numbers are always better",
    ],
    correctIndex: 1,
    explanation:
      "Numbers can be added, averaged, and plotted on graphs. Categories can be counted and grouped. Knowing the type helps you choose the right analysis!",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function L3_DataActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "data-around",
        label: "Data All Around Us",
        icon: <Globe className="w-4 h-4" />,
        content: <Tab1DataAroundUs />,
      },
      {
        id: "build-table",
        label: "Build a Data Table",
        icon: <Table className="w-4 h-4" />,
        content: <Tab2BuildTable />,
      },
      {
        id: "sorting-game",
        label: "Data Types Sorting Game",
        icon: <ArrowUpDown className="w-4 h-4" />,
        content: <Tab3SortingGame />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="What Is Data?"
      level={1}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Now that you know what data is, let's learn how to SEE data by putting it on a graph!"
      story={
        <StorySection
          paragraphs={[
            "Aru was packing for a school trip. She grabbed a notebook and started writing: \"3 T-shirts, 2 pants, 1 jacket, toothbrush, umbrella...\"",
            "Byte: \"You know what you just did? You created data!\"",
            "Aru: \"What? It's just a list of things I need to pack.\"",
            "Byte: \"That's exactly what data is — organized information. The number of T-shirts, the type of clothes, whether you need an umbrella — all of that is data. And it's everywhere. Your height, your age, the temperature outside, the color of your shoes — all data!\"",
            "Aru: \"So everything around me is data? That's kind of amazing.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Data is information that has been organized so we can work with it. Data comes in two main types: numbers (like height, age, temperature) and categories (like color, animal type, yes/no). Tables are the most common way to organize data — rows for items, columns for properties."
        />
      }
    />
  );
}
