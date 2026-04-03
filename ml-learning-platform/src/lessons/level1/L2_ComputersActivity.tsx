import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ToggleLeft, MessageSquare, Cpu, Shuffle, Trash2, Play, Keyboard, Monitor, Database, Brain } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";

/* ------------------------------------------------------------------ */
/*  Tab 1 — Binary Translator                                         */
/* ------------------------------------------------------------------ */

function BinaryTranslator() {
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);

  const toggleBit = useCallback((index: number) => {
    setBits((prev) => {
      const next = [...prev];
      next[index] = next[index] === 0 ? 1 : 0;
      return next;
    });
  }, []);

  const decimalValue = useMemo(
    () => bits.reduce((acc, b, i) => acc + b * Math.pow(2, 7 - i), 0),
    [bits],
  );

  const binaryString = bits.join("");

  const asciiChar = useMemo(() => {
    if (decimalValue >= 32 && decimalValue <= 126) return String.fromCharCode(decimalValue);
    return null;
  }, [decimalValue]);

  const randomize = useCallback(() => {
    setBits(Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 1 : 0)));
  }, []);

  const clearAll = useCallback(() => {
    setBits([0, 0, 0, 0, 0, 0, 0, 0]);
  }, []);

  return (
    <div className="space-y-5">
      {/* Toggle switches */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-semibold text-slate-700">Click each switch to toggle a bit</h3>

        <div className="flex justify-center gap-2">
          {bits.map((bit, i) => (
            <button
              key={i}
              onClick={() => toggleBit(i)}
              className="flex flex-col items-center gap-1 group"
            >
              <svg width="40" height="64" viewBox="0 0 40 64" className="cursor-pointer">
                {/* Track */}
                <rect
                  x="4"
                  y="8"
                  width="32"
                  height="48"
                  rx="16"
                  className={`transition-colors duration-200 ${bit === 1 ? "fill-indigo-500" : "fill-slate-300"}`}
                />
                {/* Knob */}
                <circle
                  cx="20"
                  cy={bit === 1 ? 24 : 40}
                  r="10"
                  className="fill-white drop-shadow transition-all duration-200"
                />
              </svg>
              <span
                className={`text-sm font-mono font-bold transition-colors duration-200 ${
                  bit === 1 ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                {bit}
              </span>
            </button>
          ))}
        </div>

        {/* Readout */}
        <div className="text-center space-y-1">
          <p className="text-sm text-slate-600">
            Binary: <span className="font-mono font-bold text-slate-800">{binaryString}</span>
          </p>
          <p className="text-sm text-slate-600">
            Decimal: <span className="font-mono font-bold text-slate-800">= {decimalValue}</span>
          </p>
          {asciiChar && (
            <p className="text-sm text-slate-600">
              Character: <span className="font-mono font-bold text-indigo-600 text-lg">{asciiChar}</span>
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={randomize}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Random
          </button>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      </div>

      {/* Reference table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick Reference</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {[
            { label: "0", binary: "00000000" },
            { label: "65 (A)", binary: "01000001" },
            { label: "97 (a)", binary: "01100001" },
            { label: "48 (0)", binary: "00110000" },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 rounded-lg px-3 py-2 text-center">
              <span className="text-slate-500">{item.label}</span>
              <span className="text-slate-400 mx-1">=</span>
              <span className="text-slate-700">{item.binary}</span>
            </div>
          ))}
        </div>
      </div>

      <InfoBox variant="blue">
        Computers store everything as 0s and 1s. Each 0 or 1 is called a <strong>bit</strong>. Eight bits together
        are called a <strong>byte</strong>. With 8 bits you can represent numbers from 0 to 255.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Encode a Message                                          */
/* ------------------------------------------------------------------ */

function EncodeMessage() {
  const [message, setMessage] = useState("Hello");

  const charData = useMemo(() => {
    return Array.from(message).map((ch) => {
      const code = ch.charCodeAt(0);
      const binaryArr = Array.from({ length: 8 }, (_, i) => (code >> (7 - i)) & 1);
      return { char: ch, code, bits: binaryArr };
    });
  }, [message]);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Type a short message to see its binary encoding</h3>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 8))}
          maxLength={8}
          placeholder="Type up to 8 characters..."
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
        />

        <p className="text-xs text-slate-500">{message.length}/8 characters</p>

        {/* Binary grid */}
        {charData.length > 0 && (
          <div className="overflow-x-auto">
            <svg
              width={Math.max(charData.length * 56 + 16, 200)}
              height={220}
              viewBox={`0 0 ${Math.max(charData.length * 56 + 16, 200)} 220`}
              className="mx-auto"
            >
              {charData.map((d, ci) => {
                const x = ci * 56 + 16;
                return (
                  <g key={ci}>
                    {/* Character */}
                    <rect x={x} y={4} width={44} height={32} rx={6} className="fill-indigo-100" />
                    <text
                      x={x + 22}
                      y={26}
                      textAnchor="middle"
                      className="fill-indigo-700 text-sm font-bold"
                      style={{ fontSize: 16 }}
                    >
                      {d.char}
                    </text>

                    {/* ASCII code */}
                    <text
                      x={x + 22}
                      y={54}
                      textAnchor="middle"
                      className="fill-slate-500"
                      style={{ fontSize: 11 }}
                    >
                      {d.code}
                    </text>

                    {/* Bits */}
                    {d.bits.map((bit, bi) => (
                      <g key={bi}>
                        <rect
                          x={x + 4}
                          y={64 + bi * 18}
                          width={36}
                          height={14}
                          rx={3}
                          className={`transition-colors duration-200 ${bit === 1 ? "fill-indigo-500" : "fill-slate-200"}`}
                        />
                        <text
                          x={x + 22}
                          y={64 + bi * 18 + 11}
                          textAnchor="middle"
                          className={`font-mono ${bit === 1 ? "fill-white" : "fill-slate-500"}`}
                          style={{ fontSize: 10 }}
                        >
                          {bit}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      <InfoBox variant="amber">
        Every letter, number, and symbol has a binary code. When you send a text message, your phone converts each
        character to binary, sends it as electrical signals, and the other phone decodes it back!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Inside the Computer                                       */
/* ------------------------------------------------------------------ */

interface ComponentInfo {
  id: string;
  label: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  cx: number;
  cy: number;
}

const COMPONENTS: ComponentInfo[] = [
  {
    id: "cpu",
    label: "CPU",
    subtitle: "The Brain",
    description:
      "The CPU is the brain of the computer. It reads instructions, does math, and makes decisions. Modern CPUs do billions of operations per second.",
    icon: <Brain className="w-5 h-5" />,
    cx: 200,
    cy: 60,
  },
  {
    id: "memory",
    label: "Memory",
    subtitle: "The Bookshelf",
    description:
      "Memory (RAM) is like a bookshelf where the computer stores information it's currently using. It's fast but temporary \u2014 data is lost when the computer turns off.",
    icon: <Database className="w-5 h-5" />,
    cx: 340,
    cy: 160,
  },
  {
    id: "input",
    label: "Input",
    subtitle: "The Ears",
    description:
      "Input devices like keyboards, mice, and microphones let you send information into the computer.",
    icon: <Keyboard className="w-5 h-5" />,
    cx: 60,
    cy: 160,
  },
  {
    id: "output",
    label: "Output",
    subtitle: "The Mouth",
    description:
      "Output devices like screens, speakers, and printers let the computer show you results.",
    icon: <Monitor className="w-5 h-5" />,
    cx: 200,
    cy: 260,
  },
];

/* Arrow path waypoints: Input -> CPU -> Memory -> CPU -> Output */
const ARROW_PATH = [
  { x: 60, y: 160 },   // Input
  { x: 200, y: 60 },   // CPU
  { x: 340, y: 160 },  // Memory
  { x: 200, y: 60 },   // CPU (return)
  { x: 200, y: 260 },  // Output
];

function InsideComputer() {
  const [selected, setSelected] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [dotPos, setDotPos] = useState<{ x: number; y: number } | null>(null);
  const animRef = useRef<number | null>(null);

  const selectedComp = useMemo(
    () => COMPONENTS.find((c) => c.id === selected) ?? null,
    [selected],
  );

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const runAnimation = useCallback(() => {
    if (animating) return;
    setAnimating(true);

    const totalDuration = 3000; // 3 seconds
    const segments = ARROW_PATH.length - 1;
    const segDuration = totalDuration / segments;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      if (elapsed >= totalDuration) {
        setDotPos(null);
        setAnimating(false);
        return;
      }

      const segIndex = Math.min(Math.floor(elapsed / segDuration), segments - 1);
      const segProgress = (elapsed - segIndex * segDuration) / segDuration;

      const from = ARROW_PATH[segIndex];
      const to = ARROW_PATH[segIndex + 1];
      const x = from.x + (to.x - from.x) * segProgress;
      const y = from.y + (to.y - from.y) * segProgress;

      setDotPos({ x, y });
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
  }, [animating]);

  // Build arrow SVG path segments
  const arrowSegments = useMemo(() => {
    const segs: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < ARROW_PATH.length - 1; i++) {
      segs.push({
        x1: ARROW_PATH[i].x,
        y1: ARROW_PATH[i].y,
        x2: ARROW_PATH[i + 1].x,
        y2: ARROW_PATH[i + 1].y,
      });
    }
    return segs;
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Click a component to learn about it</h3>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* SVG Diagram */}
          <div className="flex-1 flex justify-center">
            <svg width="400" height="320" viewBox="0 0 400 320" className="max-w-full">
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" className="fill-slate-400" />
                </marker>
              </defs>

              {/* Arrows */}
              {arrowSegments.map((seg, i) => (
                <line
                  key={i}
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                  strokeDasharray={i === 2 ? "6 4" : undefined}
                />
              ))}

              {/* Components */}
              {COMPONENTS.map((comp) => {
                const isSelected = selected === comp.id;
                return (
                  <g
                    key={comp.id}
                    onClick={() => setSelected(comp.id)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={comp.cx - 50}
                      y={comp.cy - 28}
                      width={100}
                      height={56}
                      rx={12}
                      className={`transition-colors duration-200 ${
                        isSelected
                          ? "fill-indigo-100 stroke-indigo-500"
                          : "fill-slate-100 stroke-slate-300 hover:fill-slate-200"
                      }`}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <text
                      x={comp.cx}
                      y={comp.cy - 6}
                      textAnchor="middle"
                      className={`font-semibold ${isSelected ? "fill-indigo-700" : "fill-slate-700"}`}
                      style={{ fontSize: 13 }}
                    >
                      {comp.label}
                    </text>
                    <text
                      x={comp.cx}
                      y={comp.cy + 12}
                      textAnchor="middle"
                      className={`${isSelected ? "fill-indigo-500" : "fill-slate-400"}`}
                      style={{ fontSize: 10 }}
                    >
                      {comp.subtitle}
                    </text>
                  </g>
                );
              })}

              {/* Animated dot */}
              {dotPos && (
                <circle cx={dotPos.x} cy={dotPos.y} r={7} className="fill-indigo-500">
                  <animate attributeName="opacity" values="1;0.5;1" dur="0.6s" repeatCount="indefinite" />
                </circle>
              )}
            </svg>
          </div>

          {/* Info panel */}
          {selectedComp && (
            <div className="lg:w-56 bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700">
                {selectedComp.icon}
                <h4 className="text-sm font-bold">{selectedComp.label}</h4>
              </div>
              <p className="text-xs text-indigo-700 font-medium">{selectedComp.subtitle}</p>
              <p className="text-xs text-indigo-800 leading-relaxed">{selectedComp.description}</p>
            </div>
          )}
        </div>

        {/* Run a Program button */}
        <div className="flex justify-center">
          <button
            onClick={runAnimation}
            disabled={animating}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              animating
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            <Play className="w-4 h-4" />
            {animating ? "Running..." : "Run a Program"}
          </button>
        </div>
      </div>

      <InfoBox variant="green">
        The CPU is the brain. It reads instructions from memory, does the math, and sends results to the output.
        It does this billions of times per second.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                         */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "How many different values can you represent with 8 bits (1 byte)?",
    options: ["8", "16", "128", "256"],
    correctIndex: 3,
    explanation: "With 8 bits, you can represent 2^8 = 256 different values (0 to 255).",
  },
  {
    question: "What is the binary representation of the number 5?",
    options: ["00000101", "00000011", "00001010", "00000111"],
    correctIndex: 0,
    explanation: "5 in binary is 00000101 (4 + 1 = 5).",
  },
  {
    question: "Which part of the computer does the actual calculating?",
    options: ["The Screen", "The Keyboard", "The CPU", "The Memory"],
    correctIndex: 2,
    explanation:
      "The CPU (Central Processing Unit) is the brain of the computer that performs all calculations and runs instructions.",
  },
  {
    question: "What happens to data in RAM when you turn off your computer?",
    options: ["It stays forever", "It gets bigger", "It disappears", "It moves to the screen"],
    correctIndex: 2,
    explanation:
      "RAM is temporary memory \u2014 when the computer turns off, everything stored in RAM is lost. That's why you save files to a hard drive!",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                       */
/* ------------------------------------------------------------------ */

export default function L2_ComputersActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "binary",
        label: "Binary Translator",
        icon: <ToggleLeft className="w-4 h-4" />,
        content: <BinaryTranslator />,
      },
      {
        id: "encode",
        label: "Encode a Message",
        icon: <MessageSquare className="w-4 h-4" />,
        content: <EncodeMessage />,
      },
      {
        id: "inside",
        label: "Inside the Computer",
        icon: <Cpu className="w-4 h-4" />,
        content: <InsideComputer />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Computers: The Fastest Instruction-Followers"
      level={1}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Now you know computers work with 0s and 1s. But what do they actually work on? The answer is data. Let's learn what data really means!"
      story={
        <StorySection
          paragraphs={[
            "Aru stared at Byte, her little robot friend, and a thought struck her.",
            "Aru: \"Byte, you understand everything I say. But how? You're a machine — you don't speak English inside your brain, do you?\"",
            "Byte: \"Great question! Inside me, everything is just two things: 0 and 1. That's it. Every word you say, every picture you take, every song you play — it all becomes 0s and 1s.\"",
            "Aru: \"Wait — so the word 'Hello' is just a bunch of zeros and ones?\"",
            "Byte: \"Exactly! Let me show you how computers turn the world into numbers, and numbers into 0s and 1s.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Computers understand only two things: 0 and 1 (called binary). Everything — letters, numbers, images, music — gets converted into long sequences of 0s and 1s. Eight 0s and 1s together make a 'byte', which can represent 256 different values."
        />
      }
    />
  );
}
