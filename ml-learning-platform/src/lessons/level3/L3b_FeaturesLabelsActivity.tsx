import { useState, useMemo } from "react";
import { Tags, Table2, Wand2 } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Tab 1 – What is a Feature?                                         */
/* ------------------------------------------------------------------ */

type Fruit = { emoji: string; name: string; color: string; weight: number; bumpy: boolean; label: string };
const FRUITS: Fruit[] = [
  { emoji: "🍎", name: "Apple",  color: "red",    weight: 180, bumpy: false, label: "Apple" },
  { emoji: "🍊", name: "Orange", color: "orange", weight: 200, bumpy: true,  label: "Orange" },
  { emoji: "🍋", name: "Lemon",  color: "yellow", weight: 120, bumpy: true,  label: "Lemon" },
  { emoji: "🍇", name: "Grape",  color: "purple", weight: 8,   bumpy: false, label: "Grape" },
  { emoji: "🍌", name: "Banana", color: "yellow", weight: 130, bumpy: false, label: "Banana" },
];

function FeaturesTab() {
  const [selected, setSelected] = useState(0);
  const f = FRUITS[selected];

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        A <span style={{ color: CORAL, fontWeight: 700 }}>feature</span> is a clue we measure about something.
        A <span style={{ color: MINT, fontWeight: 700 }}>label</span> is the answer we want to predict.
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {FRUITS.map((fruit, i) => (
          <button
            key={fruit.name}
            onClick={() => { playClick(); setSelected(i); }}
            className="font-hand hover:wobble"
            style={{
              padding: "8px 14px",
              fontSize: 26,
              background: selected === i ? YELLOW : PAPER,
              border: `2.5px solid ${INK}`,
              borderRadius: 12,
              boxShadow: selected === i ? "1px 1px 0 #2b2a35" : "3px 3px 0 #2b2a35",
              transform: selected === i ? "translate(2px,2px)" : "none",
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            {fruit.emoji}
          </button>
        ))}
      </div>

      <div className="card-sketchy" style={{ background: PAPER }}>
        <div className="flex items-center gap-4 mb-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 90, height: 90, fontSize: 56,
              background: YELLOW, border: `3px solid ${INK}`,
              borderRadius: 14, boxShadow: "4px 4px 0 #2b2a35",
            }}
          >
            {f.emoji}
          </div>
          <div className="font-hand">
            <div className="text-xs" style={{ color: INK, opacity: 0.6 }}>WHAT WE WANT TO PREDICT</div>
            <div className="text-2xl font-bold" style={{ color: MINT }}>
              <span className="marker-highlight-yellow" style={{ padding: "0 4px" }}>{f.label}</span>
            </div>
          </div>
        </div>

        <div className="font-hand text-sm font-bold mb-2" style={{ color: INK }}>FEATURES (the clues):</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="card-sketchy p-3 hover:wobble" style={{ background: "linear-gradient(135deg, #fff0ed, #ffd0c4)" }}>
            <div className="text-xs font-hand" style={{ color: INK, opacity: 0.6 }}>Color</div>
            <div className="font-hand font-bold text-lg" style={{ color: CORAL }}>{f.color}</div>
          </div>
          <div className="card-sketchy p-3 hover:wobble" style={{ background: "linear-gradient(135deg, #e6f7ff, #b8e0ff)" }}>
            <div className="text-xs font-hand" style={{ color: INK, opacity: 0.6 }}>Weight</div>
            <div className="font-hand font-bold text-lg" style={{ color: SKY }}>{f.weight} g</div>
          </div>
          <div className="card-sketchy p-3 hover:wobble" style={{ background: "linear-gradient(135deg, #f0e6ff, #d9c4f9)" }}>
            <div className="text-xs font-hand" style={{ color: INK, opacity: 0.6 }}>Bumpy skin?</div>
            <div className="font-hand font-bold text-lg" style={{ color: LAVENDER }}>{f.bumpy ? "yes" : "no"}</div>
          </div>
        </div>
      </div>

      <InfoBox variant="blue">
        ML loves features. Give it 3 good ones and it can usually tell apples from oranges. Give it 100 and it can tell different breeds of dog apart.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – X and y Table                                              */
/* ------------------------------------------------------------------ */

const STUDENTS = [
  { hours: 1, slept: 5, score: 35 },
  { hours: 2, slept: 6, score: 50 },
  { hours: 3, slept: 7, score: 62 },
  { hours: 4, slept: 7, score: 71 },
  { hours: 5, slept: 8, score: 80 },
  { hours: 6, slept: 8, score: 88 },
];

function TableTab() {
  const [highlighted, setHighlighted] = useState<"X" | "y" | null>(null);

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Every ML dataset is a table. The clue columns are called{" "}
        <span style={{ color: CORAL, fontWeight: 700 }}>X</span> (features). The answer column is called{" "}
        <span style={{ color: MINT, fontWeight: 700 }}>y</span> (label).
      </p>

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => { playClick(); setHighlighted(highlighted === "X" ? null : "X"); }}
          className="btn-sketchy font-hand"
          style={{ background: highlighted === "X" ? CORAL : PAPER, color: highlighted === "X" ? PAPER : INK }}
        >
          Highlight X (features)
        </button>
        <button
          onClick={() => { playClick(); setHighlighted(highlighted === "y" ? null : "y"); }}
          className="btn-sketchy font-hand"
          style={{ background: highlighted === "y" ? MINT : PAPER, color: highlighted === "y" ? PAPER : INK }}
        >
          Highlight y (label)
        </button>
      </div>

      <div className="card-sketchy overflow-x-auto" style={{ background: PAPER }}>
        <table className="w-full font-hand" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              {["Hours studied", "Hours slept", "Test score"].map((h, i) => {
                const isX = i < 2;
                const active = (highlighted === "X" && isX) || (highlighted === "y" && !isX);
                return (
                  <th
                    key={h}
                    className="font-hand font-bold text-sm"
                    style={{
                      padding: "10px 12px",
                      background: active ? (isX ? "#fff0ed" : "#e6fff8") : PAPER,
                      borderBottom: `2.5px solid ${INK}`,
                      borderRight: i < 2 ? `1.5px dashed ${INK}` : "none",
                      color: INK,
                      transition: "background .25s",
                    }}
                  >
                    <div className="text-[10px] font-bold" style={{ color: isX ? CORAL : MINT }}>
                      {isX ? `X${i + 1}` : "y"}
                    </div>
                    {h}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map((s, r) => (
              <tr key={r}>
                {[s.hours, s.slept, s.score].map((v, i) => {
                  const isX = i < 2;
                  const active = (highlighted === "X" && isX) || (highlighted === "y" && !isX);
                  return (
                    <td
                      key={i}
                      className="text-center text-base"
                      style={{
                        padding: "8px 12px",
                        background: active ? (isX ? "#fff0ed" : "#e6fff8") : PAPER,
                        borderBottom: r < STUDENTS.length - 1 ? `1.5px dotted ${INK}` : "none",
                        borderRight: i < 2 ? `1.5px dashed ${INK}` : "none",
                        fontWeight: active ? 700 : 400,
                        color: INK,
                        transition: "background .25s",
                      }}
                    >
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-sketchy text-center font-hand text-sm" style={{ background: "#fff8dc", color: INK }}>
        Goal: learn a rule that takes <span style={{ color: CORAL, fontWeight: 700 }}>X</span> →{" "}
        predicts <span style={{ color: MINT, fontWeight: 700 }}>y</span>. That's <b>literally</b> what every supervised ML model does.
      </div>

      <InfoBox variant="green">
        Math people call this a function: <b>y = f(X)</b>. ML's job is to discover <b>f</b> from the examples.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Good vs Bad Features (game)                                */
/* ------------------------------------------------------------------ */

type FeatureItem = { id: string; label: string; useful: boolean };
const FEATURE_BANK: { goal: string; items: FeatureItem[] }[] = [
  {
    goal: "Predict if it will RAIN tomorrow",
    items: [
      { id: "a", label: "Today's humidity", useful: true },
      { id: "b", label: "Cloud cover %", useful: true },
      { id: "c", label: "Your favorite color", useful: false },
      { id: "d", label: "Air pressure", useful: true },
      { id: "e", label: "Number of cats in your house", useful: false },
      { id: "f", label: "Wind speed", useful: true },
    ],
  },
  {
    goal: "Predict a HOUSE PRICE",
    items: [
      { id: "a", label: "Square footage", useful: true },
      { id: "b", label: "Number of bedrooms", useful: true },
      { id: "c", label: "Owner's birthday", useful: false },
      { id: "d", label: "Neighborhood", useful: true },
      { id: "e", label: "Color of front door", useful: false },
      { id: "f", label: "Year built", useful: true },
    ],
  },
];

function FeatureGameTab() {
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState<Record<string, "useful" | "useless">>({});
  const data = FEATURE_BANK[round];

  const correctCount = data.items.filter(
    (it) => (picks[it.id] === "useful" && it.useful) || (picks[it.id] === "useless" && !it.useful),
  ).length;
  const allAnswered = data.items.every((it) => picks[it.id]);

  const nextRound = () => {
    setRound((r) => (r + 1) % FEATURE_BANK.length);
    setPicks({});
  };

  return (
    <div className="space-y-4">
      <div className="card-sketchy text-center" style={{ background: YELLOW }}>
        <div className="font-hand text-sm" style={{ color: INK, opacity: 0.7 }}>YOUR GOAL</div>
        <div className="font-hand text-xl font-bold" style={{ color: INK }}>{data.goal}</div>
      </div>

      <p className="font-hand text-sm text-center" style={{ color: INK }}>
        Tag each feature as <span style={{ color: MINT, fontWeight: 700 }}>useful</span> or{" "}
        <span style={{ color: CORAL, fontWeight: 700 }}>useless</span>.
      </p>

      <div className="space-y-2">
        {data.items.map((it) => {
          const pick = picks[it.id];
          const answered = !!pick;
          const isCorrect = answered && ((pick === "useful" && it.useful) || (pick === "useless" && !it.useful));
          return (
            <div
              key={it.id}
              className="card-sketchy flex items-center gap-3"
              style={{
                background: answered ? (isCorrect ? "#e6fff8" : "#ffe8e8") : PAPER,
                padding: 10,
                transition: "background .2s",
              }}
            >
              <div className="font-hand text-sm flex-1" style={{ color: INK }}>{it.label}</div>
              <button
                onClick={() => { const correct = it.useful; correct ? playSuccess() : playError(); setPicks((p) => ({ ...p, [it.id]: "useful" })); }}
                className="font-hand text-xs"
                style={{
                  padding: "6px 10px",
                  background: pick === "useful" ? MINT : PAPER,
                  color: pick === "useful" ? PAPER : INK,
                  border: `2px solid ${INK}`,
                  borderRadius: 8,
                  boxShadow: "2px 2px 0 #2b2a35",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✓ useful
              </button>
              <button
                onClick={() => { const correct = !it.useful; correct ? playSuccess() : playError(); setPicks((p) => ({ ...p, [it.id]: "useless" })); }}
                className="font-hand text-xs"
                style={{
                  padding: "6px 10px",
                  background: pick === "useless" ? CORAL : PAPER,
                  color: pick === "useless" ? PAPER : INK,
                  border: `2px solid ${INK}`,
                  borderRadius: 8,
                  boxShadow: "2px 2px 0 #2b2a35",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✗ useless
              </button>
            </div>
          );
        })}
      </div>

      {allAnswered && (
        <div className="card-sketchy text-center" style={{ background: correctCount === data.items.length ? "#d4f7e8" : "#fff8dc" }}>
          <div className="font-hand text-lg font-bold" style={{ color: INK }}>
            Score: {correctCount} / {data.items.length}
          </div>
          <div className="font-hand text-xs mt-1" style={{ color: INK, opacity: 0.7 }}>
            Useless features just confuse the model. Picking the right ones is half the job!
          </div>
          <button onClick={() => { playPop(); nextRound(); }} className="btn-sketchy font-hand mt-2" style={{ background: SKY }}>
            Next challenge →
          </button>
        </div>
      )}

      <InfoBox variant="amber">
        In the real world, ML engineers spend <b>more than half their time</b> just choosing and cleaning features. Models matter — but features matter more.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What is a feature in machine learning?",
    options: ["The answer we predict", "A clue we measure about each example", "A type of computer", "A loss function"],
    correctIndex: 1,
    explanation: "A feature is an input — something measurable about each example, like weight or color. Many features = many clues.",
  },
  {
    question: "What is a label?",
    options: ["The thing we want the model to predict", "A sticker on a fruit", "A row number", "A type of feature"],
    correctIndex: 0,
    explanation: "The label (also called y) is the correct answer for each example. The model's job is to predict it from features.",
  },
  {
    question: "Which is a USEFUL feature for predicting house prices?",
    options: ["The owner's birthday", "Square footage", "The color of the door", "How tall the owner is"],
    correctIndex: 1,
    explanation: "Square footage strongly affects price. Birthdays and door color have nothing to do with what a house is worth.",
  },
  {
    question: "If X has 5 columns and y has 1 column, how many features does each example have?",
    options: ["1", "5", "6", "0"],
    correctIndex: 1,
    explanation: "X is the features. 5 X-columns means each example has 5 features. y is separate — that's the label.",
  },
];

export default function L3b_FeaturesLabelsActivity() {
  const tabs = useMemo(
    () => [
      { id: "features", label: "What is a Feature?", icon: <Tags className="w-4 h-4" />, content: <FeaturesTab /> },
      { id: "table", label: "X and y Table", icon: <Table2 className="w-4 h-4" />, content: <TableTab /> },
      { id: "game", label: "Pick Good Features", icon: <Wand2 className="w-4 h-4" />, content: <FeatureGameTab /> },
    ],
    [],
  );

  return (
    <LessonShell
      title="Features & Labels: The Language of ML"
      level={3}
      lessonNumber={5}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You can describe data the way ML does. Next: how do we measure when a prediction is wrong?"
      story={
        <StorySection
          paragraphs={[
            "Aru held up an apple and an orange. \"Quick — how do you tell which is which without looking?\"",
            "Byte: \"Easy. I'd ask: bumpy or smooth? Heavy or light? Citrus smell or not? Each of those is a CLUE.\"",
            "Aru: \"And the answer — apple or orange — is...?\"",
            "Byte: \"That's the label. Clues are called features. Labels are what we want to predict. Every ML problem in the world is shaped exactly like this: a bunch of features pointing to one label.\"",
            "Aru: \"So if I want to predict whether it'll rain tomorrow...\"",
            "Byte: \"...your features are humidity, cloud cover, wind. Your label is 'rain' or 'no rain'. Same shape, different problem.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A FEATURE is an input clue we measure (X). A LABEL is the answer we want to predict (y). The whole job of supervised ML is to learn the rule X → y from many examples. Picking good features matters more than picking a fancy model."
        />
      }
    />
  );
}
