"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ToggleLeft, MessageSquare, Cpu, Shuffle, Trash2, Play, Keyboard, Monitor, Database, Brain } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

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
/*  Tab 1 – Binary Translator                                          */
/* ------------------------------------------------------------------ */

const BIT_COLORS = [CORAL, PEACH, YELLOW, MINT, SKY, LAVENDER, "#ff9ec7", "#7ee787"];

function BinaryTranslator() {
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);

  const toggleBit = useCallback((index: number) => {
    playPop();
    setBits((prev) => {
      const next = [...prev];
      next[index] = next[index] === 0 ? 1 : 0;
      return next;
    });
    setFlashIdx(index);
    setTimeout(() => setFlashIdx(null), 500);
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
    playClick();
    setBits(Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 1 : 0)));
  }, []);

  const clearAll = useCallback(() => {
    playClick();
    setBits([0, 0, 0, 0, 0, 0, 0, 0]);
  }, []);

  const placeValues = [128, 64, 32, 16, 8, 4, 2, 1];

  return (
    <div className="space-y-5">
      <RikuSays>
        A computer is a machine that speaks only ONE language: on/off, yes/no, 1/0. That&apos;s it.
        Everything else - your name, this text, every emoji - is built on top of these eight little
        switches. Flip some and watch the number (and sometimes a letter!) appear.
      </RikuSays>

      <div className="card-sketchy p-5 space-y-5">
        <h3 className="font-hand text-base text-center" style={{ color: INK }}>
          Click each switch to toggle a <span style={{ color: CORAL, fontWeight: 700 }}>bit</span>
        </h3>

        <div className="flex justify-center gap-2 flex-wrap">
          {bits.map((bit, i) => {
            const color = BIT_COLORS[i];
            const flashing = flashIdx === i;
            return (
              <button
                key={i}
                onClick={() => toggleBit(i)}
                className="flex flex-col items-center gap-1 group"
                style={{ width: 48 }}
              >
                <div className="font-hand text-[10px]" style={{ color: INK, opacity: 0.6 }}>
                  {placeValues[i]}
                </div>
                <svg width="44" height="68" viewBox="0 0 44 68">
                  {/* Track */}
                  <rect
                    x="4" y="6" width="36" height="56" rx="18"
                    fill={bit === 1 ? color : PAPER}
                    stroke={INK} strokeWidth={2.5}
                    style={{ filter: "drop-shadow(2px 2px 0 #2b2a35)", transition: "fill .3s" }}
                  />
                  {/* Knob */}
                  <circle
                    cx="22"
                    cy={bit === 1 ? 20 : 48}
                    r="10"
                    fill={PAPER}
                    stroke={INK} strokeWidth={2}
                    style={{ transition: "cy 0.3s cubic-bezier(.5,1.6,.5,1)" }}
                  />
                  {/* Flash ring on toggle */}
                  {flashing && (
                    <circle cx="22" cy={bit === 1 ? 20 : 48} r="10" fill="none" stroke={color} strokeWidth="2.5">
                      <animate attributeName="r" from="10" to="22" dur="0.5s" />
                      <animate attributeName="opacity" from="1" to="0" dur="0.5s" />
                    </circle>
                  )}
                </svg>
                <span
                  className="font-hand text-base"
                  style={{
                    color: bit === 1 ? color : INK,
                    fontWeight: 700,
                    opacity: bit === 1 ? 1 : 0.5,
                  }}
                >
                  {bit}
                </span>
              </button>
            );
          })}
        </div>

        {/* Readout */}
        <div className="text-center space-y-2 pt-2">
          <p className="font-hand text-base" style={{ color: INK }}>
            Binary:{" "}
            <span className="px-2 py-1 rounded border-2" style={{
              borderColor: INK, background: PAPER, fontFamily: "Kalam, cursive", fontWeight: 700,
              boxShadow: "2px 2px 0 #2b2a35",
            }}>
              {binaryString}
            </span>
          </p>
          <p className="font-hand text-lg" style={{ color: INK }}>
            Decimal:{" "}
            <span className="marker-highlight-yellow" style={{ fontWeight: 700, fontSize: 24 }}>
              {decimalValue}
            </span>
          </p>
          {asciiChar && (
            <p className="font-hand text-base" style={{ color: INK }}>
              Character:{" "}
              <span style={{
                display: "inline-block",
                background: LAVENDER, color: PAPER,
                padding: "4px 12px", borderRadius: 6,
                border: `2px solid ${INK}`, boxShadow: "2px 2px 0 #2b2a35",
                fontFamily: "Kalam, cursive", fontWeight: 700, fontSize: 22,
              }}>
                {asciiChar}
              </span>
            </p>
          )}
        </div>

        <div className="flex justify-center gap-3">
          <button onClick={randomize} className="btn-sketchy font-hand text-sm" style={{ background: SKY }}>
            <Shuffle className="w-3.5 h-3.5" /> Random
          </button>
          <button onClick={clearAll} className="btn-sketchy-outline font-hand text-sm">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      <div className="card-sketchy p-4">
        <h4 className="font-hand text-sm font-bold mb-2" style={{ color: INK }}>Quick Reference</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "0", binary: "00000000", color: PEACH },
            { label: "65 (A)", binary: "01000001", color: CORAL },
            { label: "97 (a)", binary: "01100001", color: MINT },
            { label: "48 (0)", binary: "00110000", color: LAVENDER },
          ].map((item) => (
            <div key={item.label} className="rounded-lg px-2 py-1.5 text-center border-2 font-hand text-xs"
              style={{ borderColor: INK, background: PAPER, boxShadow: "2px 2px 0 #2b2a35" }}>
              <div style={{ color: item.color, fontWeight: 700 }}>{item.label}</div>
              <div style={{ color: INK, fontFamily: "Kalam, cursive" }}>{item.binary}</div>
            </div>
          ))}
        </div>
      </div>

      <InfoBox variant="blue">
        Computers store everything as 0s and 1s. Each 0 or 1 is a <strong>bit</strong>. Eight bits together
        are a <strong>byte</strong>. With 8 bits you can represent 256 different values (0–255).
      </InfoBox>

      <RikuSays>
        Try setting the bits to <b>01000001</b>. That&apos;s 65 in decimal, which is the letter
        &quot;A&quot; in a code called ASCII. Every keyboard letter has a secret number like this.
        Spooky? Kinda. Awesome? Definitely.
      </RikuSays>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Encode a Message                                           */
/* ------------------------------------------------------------------ */

function EncodeMessage() {
  const [message, setMessage] = useState("Hello");

  const charData = useMemo(() => {
    return Array.from(message).map((ch, idx) => {
      const code = ch.charCodeAt(0);
      const binaryArr = Array.from({ length: 8 }, (_, i) => (code >> (7 - i)) & 1);
      return { char: ch, code, bits: binaryArr, color: BIT_COLORS[idx % BIT_COLORS.length] };
    });
  }, [message]);

  return (
    <div className="space-y-5">
      <RikuSays>
        Here&apos;s the wild part: when you text a friend, your phone turns every letter into a
        tower of 0s and 1s EXACTLY like this, then shoots those bits through the air as tiny
        radio blinks. The phone on the other side rebuilds the letters. All under a second.
      </RikuSays>

      <div className="card-sketchy p-5 space-y-4">
        <h3 className="font-hand text-base text-center" style={{ color: INK }}>
          Type a message to see its <span style={{ color: LAVENDER, fontWeight: 700 }}>binary code</span>
        </h3>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 8))}
          maxLength={8}
          placeholder="Type up to 8 characters..."
          className="w-full px-4 py-2.5 border-2 rounded-lg font-hand text-base focus:outline-none"
          style={{ borderColor: INK, background: PAPER, color: INK, boxShadow: "3px 3px 0 #2b2a35" }}
        />

        <p className="font-hand text-xs text-center" style={{ color: INK, opacity: 0.6 }}>
          {message.length}/8 characters
        </p>

        {charData.length > 0 && (
          <div className="overflow-x-auto">
            <svg
              width={Math.max(charData.length * 64 + 20, 220)}
              height={240}
              viewBox={`0 0 ${Math.max(charData.length * 64 + 20, 220)} 240`}
              className="mx-auto"
            >
              <defs>
                <pattern id="paper-grid-enc" width="14" height="14" patternUnits="userSpaceOnUse">
                  <path d="M14 0H0V14" fill="none" stroke="#e8e3d3" strokeWidth="0.6" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#paper-grid-enc)" />

              {charData.map((d, ci) => {
                const x = ci * 64 + 20;
                return (
                  <g key={ci}>
                    {/* Character card */}
                    <rect x={x} y={6} width={48} height={42} rx={6}
                      fill={d.color} stroke={INK} strokeWidth={2.5}
                      style={{ filter: "drop-shadow(3px 3px 0 #2b2a35)" }} />
                    <text x={x + 24} y={36} textAnchor="middle" fill={INK}
                      style={{ fontFamily: "Kalam, cursive", fontSize: 22, fontWeight: 700 }}>
                      {d.char === " " ? "␣" : d.char}
                    </text>

                    {/* ASCII code */}
                    <text x={x + 24} y={64} textAnchor="middle" fill={INK}
                      style={{ fontFamily: "Patrick Hand, cursive", fontSize: 12, fontWeight: 700 }}>
                      {d.code}
                    </text>

                    {/* Bits stack */}
                    {d.bits.map((bit, bi) => (
                      <g key={bi} style={{ animation: `wobble 0.4s ease ${bi * 0.04}s both` }}>
                        <rect
                          x={x + 6} y={74 + bi * 19} width={36} height={16} rx={4}
                          fill={bit === 1 ? d.color : PAPER}
                          stroke={INK} strokeWidth={1.5}
                          style={{ transition: "fill .3s" }}
                        />
                        <text
                          x={x + 24} y={74 + bi * 19 + 13} textAnchor="middle"
                          fill={bit === 1 ? PAPER : INK}
                          style={{ fontFamily: "Kalam, cursive", fontSize: 12, fontWeight: 700 }}
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
        Every letter, number, and symbol has a binary code. When you send a text, your phone converts each character
        to binary, sends it as electrical signals, and the other phone decodes it back!
      </InfoBox>

      <RikuSays>
        Try typing your name. Each letter is exactly 8 bits - 1 byte per character. So
        &quot;Riku&quot; is just 32 bits: four stacks of on/off switches sitting in a row. Your
        whole name, encoded.
      </RikuSays>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Inside the Computer                                        */
/* ------------------------------------------------------------------ */

interface ComponentInfo {
  id: string;
  label: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  cx: number;
  cy: number;
  color: string;
}

const COMPONENTS: ComponentInfo[] = [
  {
    id: "input",
    label: "Input",
    subtitle: "The Ears",
    description: "Input devices like keyboards, mice, and microphones let you send information into the computer.",
    icon: <Keyboard className="w-5 h-5" />,
    cx: 70, cy: 170,
    color: SKY,
  },
  {
    id: "cpu",
    label: "CPU",
    subtitle: "The Brain",
    description: "The CPU is the brain. It reads instructions, does math, and makes decisions - billions of times per second.",
    icon: <Brain className="w-5 h-5" />,
    cx: 210, cy: 60,
    color: CORAL,
  },
  {
    id: "memory",
    label: "Memory",
    subtitle: "The Bookshelf",
    description: "Memory (RAM) is fast temporary storage. Data is lost when the computer turns off.",
    icon: <Database className="w-5 h-5" />,
    cx: 350, cy: 170,
    color: LAVENDER,
  },
  {
    id: "output",
    label: "Output",
    subtitle: "The Mouth",
    description: "Output devices like screens, speakers, and printers let the computer show you results.",
    icon: <Monitor className="w-5 h-5" />,
    cx: 210, cy: 280,
    color: MINT,
  },
];

const ARROW_PATH = [
  { x: 70, y: 170, id: "input" },
  { x: 210, y: 60, id: "cpu" },
  { x: 350, y: 170, id: "memory" },
  { x: 210, y: 60, id: "cpu" },
  { x: 210, y: 280, id: "output" },
];

function InsideComputer() {
  const [selected, setSelected] = useState<string | null>("cpu");
  const [animating, setAnimating] = useState(false);
  const [dotPos, setDotPos] = useState<{ x: number; y: number } | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const animRef = useRef<number | null>(null);

  const selectedComp = useMemo(
    () => COMPONENTS.find((c) => c.id === selected) ?? null,
    [selected],
  );

  useEffect(() => {
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const runAnimation = useCallback(() => {
    if (animating) return;
    playClick();
    setAnimating(true);

    const totalDuration = 3600;
    const segments = ARROW_PATH.length - 1;
    const segDuration = totalDuration / segments;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      if (elapsed >= totalDuration) {
        setDotPos(null);
        setActiveNode(null);
        setAnimating(false);
        playSuccess();
        return;
      }

      const segIndex = Math.min(Math.floor(elapsed / segDuration), segments - 1);
      const segProgress = (elapsed - segIndex * segDuration) / segDuration;

      const from = ARROW_PATH[segIndex];
      const to = ARROW_PATH[segIndex + 1];
      const x = from.x + (to.x - from.x) * segProgress;
      const y = from.y + (to.y - from.y) * segProgress;

      setDotPos({ x, y });
      setActiveNode(segProgress > 0.85 ? to.id : from.id);
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
  }, [animating]);

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
      <RikuSays>
        Your phone is a tiny computer with a camera, a mic, a screen, and a speaker stapled to
        it. Fancy. But underneath, every computer is the same four parts: input, brain (CPU),
        memory, and output. Click around the diagram to meet each one.
      </RikuSays>

      <div className="card-sketchy p-5 space-y-4">
        <h3 className="font-hand text-base text-center" style={{ color: INK }}>
          Click a component to learn about it
        </h3>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex justify-center">
            <svg width="420" height="360" viewBox="0 0 420 360" className="max-w-full">
              <defs>
                <pattern id="paper-grid-pc" width="14" height="14" patternUnits="userSpaceOnUse">
                  <path d="M14 0H0V14" fill="none" stroke="#e8e3d3" strokeWidth="0.6" />
                </pattern>
                <marker id="arrowhead-pc" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <path d="M0,0 L10,4 L0,8 Z" fill={INK} />
                </marker>
                <filter id="glow-pc">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <rect x="0" y="0" width="420" height="360" fill="url(#paper-grid-pc)" />

              {/* Arrows */}
              {arrowSegments.map((seg, i) => (
                <line
                  key={i}
                  x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
                  stroke={INK} strokeWidth={2.5} strokeLinecap="round"
                  markerEnd="url(#arrowhead-pc)"
                  strokeDasharray={i === 2 ? "6 4" : undefined}
                  opacity={0.7}
                />
              ))}

              {/* Components */}
              {COMPONENTS.map((comp) => {
                const isSelected = selected === comp.id;
                const isActive = activeNode === comp.id;
                return (
                  <g key={comp.id} onClick={() => { playClick(); setSelected(comp.id); }} className="cursor-pointer">
                    {isActive && (
                      <circle cx={comp.cx} cy={comp.cy} r={45} fill="none" stroke={comp.color} strokeWidth={3}>
                        <animate attributeName="r" values="40;58;40" dur="0.6s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="0.6s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <rect
                      x={comp.cx - 56} y={comp.cy - 30} width={112} height={60} rx={10}
                      fill={isSelected || isActive ? comp.color : PAPER}
                      stroke={INK}
                      strokeWidth={isSelected ? 3 : 2.5}
                      style={{ filter: "drop-shadow(3px 3px 0 #2b2a35)" }}
                    />
                    <text x={comp.cx} y={comp.cy - 4} textAnchor="middle"
                      fill={isSelected || isActive ? PAPER : INK}
                      style={{ fontFamily: "Kalam, cursive", fontSize: 16, fontWeight: 700 }}>
                      {comp.label}
                    </text>
                    <text x={comp.cx} y={comp.cy + 16} textAnchor="middle"
                      fill={isSelected || isActive ? PAPER : INK}
                      style={{ fontFamily: "Patrick Hand, cursive", fontSize: 11, opacity: 0.85 }}>
                      {comp.subtitle}
                    </text>
                  </g>
                );
              })}

              {/* Animated dot */}
              {dotPos && (
                <>
                  <circle cx={dotPos.x} cy={dotPos.y} r={9} fill={YELLOW} stroke={INK} strokeWidth={1.5} filter="url(#glow-pc)" />
                  <circle cx={dotPos.x} cy={dotPos.y} r={14} fill="none" stroke={YELLOW} strokeWidth={2} opacity={0.5}>
                    <animate attributeName="r" values="9;18;9" dur="0.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="0.6s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
            </svg>
          </div>

          {/* Info panel */}
          {selectedComp && (
            <div
              className="lg:w-56 card-sketchy p-4 space-y-2"
              style={{ background: PAPER, borderTop: `5px solid ${selectedComp.color}` }}
            >
              <div className="flex items-center gap-2" style={{ color: INK }}>
                <div
                  className="rounded-md p-1"
                  style={{ background: selectedComp.color, color: PAPER, border: `2px solid ${INK}` }}
                >
                  {selectedComp.icon}
                </div>
                <h4 className="font-hand text-base font-bold">{selectedComp.label}</h4>
              </div>
              <p className="font-hand text-xs" style={{ color: selectedComp.color, fontWeight: 700 }}>
                {selectedComp.subtitle}
              </p>
              <p className="font-hand text-xs leading-relaxed" style={{ color: INK }}>
                {selectedComp.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={runAnimation}
            disabled={animating}
            className="btn-sketchy font-hand text-sm"
            style={{ background: YELLOW, opacity: animating ? 0.5 : 1 }}
          >
            <Play className="w-4 h-4" />
            {animating ? "Running..." : "Run a Program"}
          </button>
        </div>
      </div>

      <InfoBox variant="green">
        The CPU is the brain. It reads instructions from memory, does the math, and sends results to the output -
        billions of times per second.
      </InfoBox>

      <RikuSays>
        Hit &quot;Run a Program&quot; and follow the yellow dot. That&apos;s basically what
        happens every time you tap an app: input goes in, the CPU thinks, memory helps it
        remember, and then output shows up on your screen. Loop that a few billion times per
        second and you get... well, everything.
      </RikuSays>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
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
      "RAM is temporary memory - when the computer turns off, everything stored in RAM is lost. That's why you save files to a hard drive!",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
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
            "Aru: \"Byte, you understand everything I say. But how? You're a machine - you don't speak English inside your brain, do you?\"",
            "Byte: \"Great question! Inside me, everything is just two things: 0 and 1. That's it. Every word you say, every picture you take, every song you play - it all becomes 0s and 1s.\"",
            "Aru: \"Wait - so the word 'Hello' is just a bunch of zeros and ones?\"",
            "Byte: \"Exactly! Let me show you how computers turn the world into numbers, and numbers into 0s and 1s.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Computers understand only two things: 0 and 1 (called binary). Everything - letters, numbers, images, music - gets converted into long sequences of 0s and 1s. Eight 0s and 1s together make a 'byte', which can represent 256 different values."
        />
      }
    />
  );
}
