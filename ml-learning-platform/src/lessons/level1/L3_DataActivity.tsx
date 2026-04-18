"use client";

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
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

function RikuSays({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-sketchy p-3 flex gap-3 items-start" style={{ background: "#fff8e7" }}>
      <span className="text-2xl" aria-hidden>🐼</span>
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

/* Sketchy palette */
const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";
const PEACH = "#ffb88c";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DataCard {
  id: number;
  icon: React.ReactNode;
  label: string;
  value: string;
  type: "Number" | "Category";
  color: string;
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
/*  Tab 1 – Data All Around Us                                         */
/* ------------------------------------------------------------------ */

const DATA_CARDS: DataCard[] = [
  { id: 0, icon: <Thermometer className="w-6 h-6" />, label: "Temperature", value: "28°C", type: "Number", color: CORAL },
  { id: 1, icon: <Clock className="w-6 h-6" />, label: "Time", value: "3:45 PM", type: "Number", color: SKY },
  { id: 2, icon: <User className="w-6 h-6" />, label: "Hair Color", value: "Brown", type: "Category", color: LAVENDER },
  { id: 3, icon: <Apple className="w-6 h-6" />, label: "Apples in basket", value: "7", type: "Number", color: MINT },
  { id: 4, icon: <Circle className="w-6 h-6" />, label: "Traffic Light", value: "Red", type: "Category", color: PEACH },
  { id: 5, icon: <Ruler className="w-6 h-6" />, label: "Height", value: "152 cm", type: "Number", color: YELLOW },
];

function Tab1DataAroundUs() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const handleFlip = useCallback((id: number) => {
    playPop();
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
      <RikuSays>
        Data is just &quot;stuff we wrote down.&quot; Temperatures, photos, names, scores, clicks,
        heartbeats. If you can record it, it&apos;s data. Tap each card to reveal a piece of data
        hiding in everyday life.
      </RikuSays>

      <div className="text-center">
        <span
          className="inline-block font-hand text-sm font-bold px-4 py-1.5 rounded-full border-2"
          style={{ borderColor: INK, background: YELLOW, boxShadow: "2px 2px 0 #2b2a35" }}
        >
          Discovered: {flipped.size} / {DATA_CARDS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DATA_CARDS.map((card) => {
          const isFlipped = flipped.has(card.id);
          return (
            <button
              key={card.id}
              onClick={() => !isFlipped && handleFlip(card.id)}
              className="card-sketchy p-4 min-h-[140px] flex flex-col items-center justify-center gap-2"
              style={{
                background: isFlipped ? PAPER : "#f4efe1",
                cursor: isFlipped ? "default" : "pointer",
                transition: "transform .2s",
                borderTop: isFlipped ? `5px solid ${card.color}` : undefined,
              }}
              onMouseEnter={(e) => { if (!isFlipped) e.currentTarget.style.transform = "translate(-2px,-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translate(0,0)"; }}
            >
              {isFlipped ? (
                <div className="flex flex-col items-center gap-1.5" style={{ animation: "wobble 0.5s ease" }}>
                  <div
                    className="rounded-md p-1.5"
                    style={{ background: card.color, color: PAPER, border: `2px solid ${INK}`, boxShadow: "2px 2px 0 #2b2a35" }}
                  >
                    {card.icon}
                  </div>
                  <p className="font-hand text-xs" style={{ color: INK, opacity: 0.7 }}>{card.label}</p>
                  <p className="font-hand text-base font-bold" style={{ color: INK }}>{card.value}</p>
                  <span
                    className="font-hand text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor: INK,
                      background: card.type === "Number" ? SKY : LAVENDER,
                      color: PAPER,
                    }}
                  >
                    {card.type}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2" style={{ color: INK, opacity: 0.5 }}>
                  <HelpCircle className="w-9 h-9" />
                  <span className="font-hand text-xs">Tap to reveal</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {allFlipped && (
        <div
          className="card-sketchy p-4 text-center space-y-1"
          style={{ background: "#fffbe6", animation: "wobble 0.6s ease" }}
        >
          <PartyPopper className="w-7 h-7 mx-auto" style={{ color: CORAL }} />
          <p className="font-hand text-base font-bold" style={{ color: INK }}>Amazing! You found all the data!</p>
          <p className="font-hand text-xs" style={{ color: INK, opacity: 0.75 }}>
            Everything around you can be measured or described - that means everything is data!
          </p>
        </div>
      )}

      {discoveredCards.length > 0 && (
        <div className="card-sketchy p-3 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ background: INK, color: PAPER }}>
                <th className="px-3 py-2 text-left font-hand">#</th>
                <th className="px-3 py-2 text-left font-hand">What</th>
                <th className="px-3 py-2 text-left font-hand">Value</th>
                <th className="px-3 py-2 text-left font-hand">Type</th>
              </tr>
            </thead>
            <tbody>
              {discoveredCards.map((card, i) => (
                <tr key={card.id} style={{ background: i % 2 === 0 ? PAPER : "#f7f2e3" }}>
                  <td className="px-3 py-2 font-hand" style={{ color: INK, opacity: 0.6 }}>{i + 1}</td>
                  <td className="px-3 py-2 font-hand font-bold" style={{ color: INK }}>{card.label}</td>
                  <td className="px-3 py-2 font-hand font-bold" style={{ color: card.color }}>{card.value}</td>
                  <td className="px-3 py-2">
                    <span
                      className="font-hand text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: card.type === "Number" ? SKY : LAVENDER,
                        color: PAPER,
                        border: `1.5px solid ${INK}`,
                      }}
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
        Numbers, words, colors - all of it is data!
      </InfoBox>

      <RikuSays>
        Notice how some values are <b>numbers</b> (28, 7, 152) and some are <b>categories</b>
        (Brown, Red). Both are valid data - but computers treat them differently. Remember that
        split, it&apos;s going to come back big time in ML.
      </RikuSays>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Build a Data Table                                         */
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
        className="w-24"
        style={{ accentColor: CORAL }}
      />
      <span className="font-hand text-xs font-bold w-8" style={{ color: INK }}>{sliderVal}</span>
      <button
        onClick={() => onConfirm(sliderVal)}
        className="btn-sketchy font-hand text-xs"
        style={{ background: MINT, padding: "2px 8px" }}
      >
        Set
      </button>
    </div>
  );
}

function Tab2BuildTable() {
  const [rows, setRows] = useState<TableRow[]>(() => INITIAL_TABLE.map((r) => ({ ...r })));
  const [editing, setEditing] = useState<{ row: number; field: CellField } | null>(null);

  const updateCell = useCallback(
    (rowIdx: number, field: CellField, value: string | number) => {
      playClick();
      setRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, [field]: value } : r)));
      setEditing(null);
    },
    [],
  );

  const stats = useMemo(() => {
    const filledAges = rows.filter((r) => r.age !== null).map((r) => r.age as number);
    const filledColors = rows.filter((r) => r.color !== null).map((r) => r.color as string);
    const filledHeights = rows.filter((r) => r.height !== null).map((r) => r.height as number);
    const filledNames = rows.filter((r) => r.name !== null);

    const avgAge =
      filledAges.length > 0 ? (filledAges.reduce((a, b) => a + b, 0) / filledAges.length).toFixed(1) : "";

    let mostCommonColor = "";
    if (filledColors.length > 0) {
      const freq: Record<string, number> = {};
      filledColors.forEach((c) => (freq[c] = (freq[c] || 0) + 1));
      mostCommonColor = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    }

    const tallest = filledHeights.length > 0 ? Math.max(...filledHeights) : "";

    return { avgAge, mostCommonColor, tallest, totalStudents: filledNames.length };
  }, [rows]);

  const renderCell = (rowIdx: number, field: CellField, value: string | number | null) => {
    const isEditing = editing?.row === rowIdx && editing?.field === field;
    const isEmpty = value === null;

    if (!isEmpty && !isEditing) {
      return (
        <span className="font-hand text-sm font-bold" style={{ color: INK }}>
          {field === "color" ? (
            <span className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block"
                style={{ backgroundColor: (value as string).toLowerCase(), border: `1.5px solid ${INK}` }}
              />
              {value}
            </span>
          ) : (
            value
          )}
        </span>
      );
    }

    if (isEmpty && !isEditing) {
      return (
        <button
          onClick={() => { playClick(); setEditing({ row: rowIdx, field }); }}
          className="w-full flex items-center justify-center"
          style={{ color: INK, opacity: 0.4 }}
        >
          <Plus className="w-4 h-4" />
        </button>
      );
    }

    if (isEditing) {
      switch (field) {
        case "name":
          return (
            <div className="flex flex-wrap gap-1">
              {NAME_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => updateCell(rowIdx, "name", n)}
                  className="btn-sketchy font-hand"
                  style={{ background: CORAL, padding: "2px 8px", fontSize: 11 }}
                >
                  {n}
                </button>
              ))}
            </div>
          );
        case "age":
          return (
            <div className="flex items-center gap-1 flex-wrap">
              {[8, 9, 10, 11, 12, 13, 14, 15].map((a) => (
                <button
                  key={a}
                  onClick={() => updateCell(rowIdx, "age", a)}
                  className="font-hand font-bold"
                  style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: SKY, color: PAPER,
                    border: `2px solid ${INK}`, boxShadow: "1.5px 1.5px 0 #2b2a35",
                    fontSize: 11,
                  }}
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
                  className="rounded-full"
                  style={{
                    width: 26, height: 26,
                    backgroundColor: c.toLowerCase(),
                    border: `2px solid ${INK}`, boxShadow: "1.5px 1.5px 0 #2b2a35",
                  }}
                  title={c}
                />
              ))}
            </div>
          );
        case "height":
          return <HeightSlider onConfirm={(v) => updateCell(rowIdx, "height", v)} />;
      }
    }

    return null;
  };

  return (
    <div className="space-y-5">
      <RikuSays>
        Humans think in stories. Computers think in tables. Learning ML is mostly about
        translating between the two. Fill in the blanks below and watch the stats at the bottom
        update live - that&apos;s exactly how data analysis feels.
      </RikuSays>

      <div className="card-sketchy p-3 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ background: INK, color: PAPER }}>
              <th className="px-3 py-2 text-left font-hand">Name</th>
              <th className="px-3 py-2 text-left font-hand">Age</th>
              <th className="px-3 py-2 text-left font-hand">Favorite Color</th>
              <th className="px-3 py-2 text-left font-hand">Height (cm)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? PAPER : "#f7f2e3" }}>
                <td className="px-3 py-2.5 min-w-[90px]">{renderCell(i, "name", row.name)}</td>
                <td className="px-3 py-2.5 min-w-[160px]">{renderCell(i, "age", row.age)}</td>
                <td className="px-3 py-2.5 min-w-[180px]">{renderCell(i, "color", row.color)}</td>
                <td className="px-3 py-2.5 min-w-[180px]">{renderCell(i, "height", row.height)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Average Age", value: stats.avgAge, color: SKY },
          { label: "Top Color", value: stats.mostCommonColor, color: LAVENDER },
          { label: "Tallest", value: stats.tallest === "" ? "" : `${stats.tallest} cm`, color: CORAL },
          { label: "Students", value: stats.totalStudents, color: MINT },
        ].map((s) => (
          <div
            key={s.label}
            className="card-sketchy p-3 text-center"
            style={{ borderTop: `5px solid ${s.color}` }}
          >
            <p className="font-hand text-[10px] font-bold uppercase tracking-wide" style={{ color: INK, opacity: 0.6 }}>
              {s.label}
            </p>
            <p className="font-hand text-xl font-bold mt-1" style={{ color: INK }}>{String(s.value) || "-"}</p>
          </div>
        ))}
      </div>

      <InfoBox variant="amber">
        A data table organizes information into rows (one per person or thing) and columns (one per measurement).
        This is how most datasets in the world look!
      </InfoBox>

      <RikuSays>
        Each row is one student. Each column is one thing we measured about them. ML people call
        the rows <b>samples</b> and the columns <b>features</b>. Congrats - you just built a
        dataset.
      </RikuSays>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Sorting Game                                               */
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
        playSuccess();
        setSorted((prev) => ({ ...prev, [item.id]: chosenBin }));
        setFeedback((prev) => ({ ...prev, [item.id]: "correct" }));
      } else {
        playError();
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
    playClick();
    setSorted({});
    setFeedback({});
    setShaking(null);
  }, []);

  const allDone = Object.keys(sorted).length === SORT_ITEMS.length;

  const numberBinItems = SORT_ITEMS.filter((it) => sorted[it.id] === "number");
  const categoryBinItems = SORT_ITEMS.filter((it) => sorted[it.id] === "category");

  return (
    <div className="space-y-5">
      <RikuSays>
        Quick trick: if you can meaningfully <b>add</b> two values (100 kg + 50 kg = 150 kg), it&apos;s
        a number. If adding them is nonsense (Blue + Red = ???), it&apos;s a category. Sort each
        item into the right bin!
      </RikuSays>

      <div className="flex items-center justify-between">
        <span
          className="inline-block font-hand text-sm font-bold px-4 py-1.5 rounded-full border-2"
          style={{ borderColor: INK, background: YELLOW, boxShadow: "2px 2px 0 #2b2a35" }}
        >
          Score: {correctCount} / {SORT_ITEMS.length}
        </span>
        <button
          onClick={handleReset}
          className="btn-sketchy-outline font-hand text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {allDone && (
        <div
          className="card-sketchy p-4 text-center space-y-1"
          style={{ background: "#e8fff9", animation: "wobble 0.6s ease" }}
        >
          <CheckCircle2 className="w-7 h-7 mx-auto" style={{ color: MINT }} />
          <p className="font-hand text-base font-bold" style={{ color: INK }}>
            Great work! You sorted all {SORT_ITEMS.length} items!
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {SORT_ITEMS.map((item) => {
          const isSorted = sorted[item.id] !== undefined;
          const fb = feedback[item.id];
          const isShaking = shaking === item.id;

          if (isSorted) {
            return (
              <div
                key={item.id}
                className="card-sketchy px-3 py-2 text-center font-hand text-xs font-bold flex items-center justify-center gap-1"
                style={{ background: "#e8fff9", color: INK, borderColor: MINT }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: MINT }} />
                {item.label}
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="card-sketchy p-3 text-center space-y-2"
              style={{
                background: fb === "wrong" ? "#ffe8e8" : PAPER,
                animation: isShaking ? "shake-x 0.4s" : undefined,
              }}
            >
              <p className="font-hand text-base font-bold" style={{ color: INK }}>{item.label}</p>
              <div className="flex gap-1 justify-center">
                <button
                  onClick={() => handleSort(item, "number")}
                  className="btn-sketchy font-hand"
                  style={{ background: SKY, padding: "2px 8px", fontSize: 10 }}
                >
                  Number
                </button>
                <button
                  onClick={() => handleSort(item, "category")}
                  className="btn-sketchy font-hand"
                  style={{ background: LAVENDER, padding: "2px 8px", fontSize: 10 }}
                >
                  Category
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card-sketchy p-3 min-h-[110px]" style={{ borderTop: `5px solid ${SKY}` }}>
          <p className="font-hand text-sm font-bold mb-2 text-center" style={{ color: SKY }}>
            NUMBERS
          </p>
          <div className="flex flex-wrap gap-1 justify-center">
            {numberBinItems.map((it) => (
              <span
                key={it.id}
                className="font-hand text-xs font-bold px-2 py-0.5 rounded border"
                style={{ background: SKY, color: PAPER, borderColor: INK, boxShadow: "1.5px 1.5px 0 #2b2a35" }}
              >
                {it.label}
              </span>
            ))}
            {numberBinItems.length === 0 && (
              <span className="font-hand text-xs italic" style={{ color: SKY, opacity: 0.6 }}>
                Drop numbers here
              </span>
            )}
          </div>
        </div>

        <div className="card-sketchy p-3 min-h-[110px]" style={{ borderTop: `5px solid ${LAVENDER}` }}>
          <p className="font-hand text-sm font-bold mb-2 text-center" style={{ color: LAVENDER }}>
            CATEGORIES
          </p>
          <div className="flex flex-wrap gap-1 justify-center">
            {categoryBinItems.map((it) => (
              <span
                key={it.id}
                className="font-hand text-xs font-bold px-2 py-0.5 rounded border"
                style={{ background: LAVENDER, color: PAPER, borderColor: INK, boxShadow: "1.5px 1.5px 0 #2b2a35" }}
              >
                {it.label}
              </span>
            ))}
            {categoryBinItems.length === 0 && (
              <span className="font-hand text-xs italic" style={{ color: LAVENDER, opacity: 0.6 }}>
                Drop categories here
              </span>
            )}
          </div>
        </div>
      </div>

      <InfoBox variant="green">
        Knowing whether data is a number or a category matters because computers handle them differently.
        Numbers can be added and averaged. Categories can be counted and grouped.
      </InfoBox>

      <RikuSays>
        Sneaky one: <b>&quot;5 stars&quot;</b> is a category, not a number! You can&apos;t compute
        &quot;half a star review&quot; and have it mean the same thing. When data <em>looks</em>
        numeric but is really a label, that&apos;s where beginner ML models go wrong.
      </RikuSays>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "Which of these is NOT data?",
    options: [
      "Your height",
      "Your favorite song",
      "The number of clouds in the sky",
      "None - all of these are data",
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
    options: ["A measurement type", "One item or observation", "A formula", "The column header"],
    correctIndex: 1,
    explanation:
      "Each row represents one item (like one person, one animal, or one measurement). Each column represents a different property.",
  },
  {
    question: "Why is it useful to know if data is a number or a category?",
    options: ["It isn't useful", "Computers handle them differently", "Categories are always better", "Numbers are always better"],
    correctIndex: 1,
    explanation:
      "Numbers can be added, averaged, and plotted on graphs. Categories can be counted and grouped. Knowing the type helps you choose the right analysis!",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
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
            "Byte: \"That's exactly what data is - organized information. The number of T-shirts, the type of clothes, whether you need an umbrella - all of that is data. And it's everywhere. Your height, your age, the temperature outside, the color of your shoes - all data!\"",
            "Aru: \"So everything around me is data? That's kind of amazing.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Data is information that has been organized so we can work with it. Data comes in two main types: numbers (like height, age, temperature) and categories (like color, animal type, yes/no). Tables are the most common way to organize data - rows for items, columns for properties."
        />
      }
    />
  );
}
