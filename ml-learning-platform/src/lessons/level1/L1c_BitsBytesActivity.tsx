import { useState, useMemo } from "react";
import { ToggleLeft, HardDrive, Smartphone } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";
const PEACH = "#ffb88c";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Tab 1 – Bit Builder (8 bits = 1 byte)                              */
/* ------------------------------------------------------------------ */

const BIT_COLORS = [CORAL, PEACH, YELLOW, MINT, SKY, LAVENDER, "#f49ac1", "#a3e635"];

function BitBuilderTab() {
  const [bits, setBits] = useState<number[]>([0, 1, 0, 0, 0, 0, 0, 1]); // 'A' = 65

  const decimal = bits.reduce((sum, b, i) => sum + b * Math.pow(2, 7 - i), 0);
  const ascii = decimal >= 32 && decimal <= 126 ? String.fromCharCode(decimal) : "·";
  const places = [128, 64, 32, 16, 8, 4, 2, 1];

  const setPreset = (n: number) => {
    playClick();
    const arr: number[] = [];
    for (let i = 7; i >= 0; i--) arr.push((n >> i) & 1);
    setBits(arr);
  };

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        A <span style={{ color: CORAL, fontWeight: 700 }}>bit</span> is the smallest piece of memory — just 0 or 1.
        Stack <span style={{ color: LAVENDER, fontWeight: 700 }}>8 bits</span> together and you get a{" "}
        <span style={{ color: MINT, fontWeight: 700 }}>byte</span> — enough to store one letter!
      </p>

      <div className="card-sketchy" style={{ background: PAPER }}>
        <div className="flex justify-center gap-2 sm:gap-3 mb-4">
          {bits.map((b, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="font-hand text-[10px] font-bold" style={{ color: INK, opacity: 0.6 }}>
                {places[i]}
              </div>
              <button
                onClick={() => { playPop(); setBits((bs) => bs.map((v, j) => (j === i ? (1 - v) : v))); }}
                className="font-hand font-bold"
                style={{
                  width: 44,
                  height: 56,
                  borderRadius: 10,
                  border: `2.5px solid ${INK}`,
                  background: b ? BIT_COLORS[i] : PAPER,
                  color: b ? PAPER : INK,
                  fontSize: 22,
                  boxShadow: "3px 3px 0 #2b2a35",
                  cursor: "pointer",
                  transform: b ? "translate(-1px,-1px)" : "translate(0,0)",
                  transition: "all 0.15s",
                }}
              >
                {b}
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="card-sketchy" style={{ background: "#fff8dc", padding: 12 }}>
            <div className="font-hand text-xs" style={{ color: INK, opacity: 0.7 }}>BINARY</div>
            <div className="font-mono font-bold text-lg" style={{ color: INK }}>{bits.join("")}</div>
          </div>
          <div className="card-sketchy" style={{ background: "#e6fff8", padding: 12 }}>
            <div className="font-hand text-xs" style={{ color: INK, opacity: 0.7 }}>DECIMAL</div>
            <div className="font-hand font-bold text-2xl marker-highlight-yellow" style={{ color: INK }}>{decimal}</div>
          </div>
          <div className="card-sketchy" style={{ background: "#f0e6ff", padding: 12 }}>
            <div className="font-hand text-xs" style={{ color: INK, opacity: 0.7 }}>LETTER</div>
            <div className="font-hand font-bold text-2xl" style={{ color: LAVENDER }}>{ascii}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {[
            { label: "A", n: 65 },
            { label: "M", n: 77 },
            { label: "L", n: 76 },
            { label: "?", n: 63 },
            { label: "0", n: 48 },
          ].map((p) => (
            <button key={p.label} onClick={() => setPreset(p.n)} className="btn-sketchy-outline font-hand text-sm py-1 px-3">
              Set to '{p.label}'
            </button>
          ))}
        </div>
      </div>

      <InfoBox variant="blue">
        Every letter you type, every emoji 😀, every pixel on this screen — it's all just bits flipping between 0 and 1. The whole digital world rests on that one tiny choice.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – File Size Scale (log scale visualization)                   */
/* ------------------------------------------------------------------ */

const FILES: { emoji: string; name: string; bytes: number; color: string; note: string }[] = [
  { emoji: "🔤", name: "1 letter", bytes: 1, color: CORAL, note: "1 byte" },
  { emoji: "💬", name: "Text message", bytes: 160, color: PEACH, note: "~160 bytes" },
  { emoji: "📄", name: "1-page essay", bytes: 4_000, color: YELLOW, note: "~4 KB" },
  { emoji: "🎵", name: "MP3 song", bytes: 4_000_000, color: MINT, note: "~4 MB" },
  { emoji: "📷", name: "Phone photo", bytes: 3_000_000, color: SKY, note: "~3 MB" },
  { emoji: "🎬", name: "HD movie", bytes: 4_000_000_000, color: LAVENDER, note: "~4 GB" },
  { emoji: "🧠", name: "GPT-4 model", bytes: 1_000_000_000_000, color: "#f49ac1", note: "~1 TB" },
];

function formatBytes(b: number) {
  if (b < 1000) return `${b} B`;
  if (b < 1e6) return `${(b / 1000).toFixed(1)} KB`;
  if (b < 1e9) return `${(b / 1e6).toFixed(1)} MB`;
  if (b < 1e12) return `${(b / 1e9).toFixed(1)} GB`;
  return `${(b / 1e12).toFixed(1)} TB`;
}

function FileSizeTab() {
  const [hover, setHover] = useState<number | null>(null);
  const maxLog = Math.log10(FILES[FILES.length - 1].bytes);

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Files come in wildly different sizes. This bar chart uses a{" "}
        <span style={{ color: CORAL, fontWeight: 700 }}>log scale</span> — each step is <b>10× bigger</b> than the last!
      </p>

      <div className="card-sketchy" style={{ background: PAPER }}>
        <div className="space-y-3">
          {FILES.map((f, i) => {
            const widthPct = (Math.log10(f.bytes) / maxLog) * 100;
            const isHover = hover === i;
            return (
              <div
                key={f.name}
                onMouseEnter={() => { setHover(i); playPop(); }}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                <div className="flex items-center justify-between font-hand text-sm mb-0.5" style={{ color: INK }}>
                  <span>
                    <span style={{ fontSize: 18, marginRight: 6 }}>{f.emoji}</span>
                    <b>{f.name}</b>
                  </span>
                  <span style={{ color: f.color, fontWeight: 700 }}>{f.note}</span>
                </div>
                <div
                  style={{
                    height: 20,
                    border: `2px solid ${INK}`,
                    borderRadius: 6,
                    background: PAPER,
                    boxShadow: "2px 2px 0 #2b2a35",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${widthPct}%`,
                      background: f.color,
                      transform: isHover ? "scaleY(1.05)" : "scaleY(1)",
                      transition: "transform .2s",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {hover !== null && (
          <div className="mt-4 text-center font-hand text-sm" style={{ color: INK }}>
            <b>{FILES[hover].name}</b> = <span className="marker-highlight-yellow" style={{ padding: "0 4px" }}>{FILES[hover].bytes.toLocaleString()} bytes</span>
            <span style={{ opacity: 0.7 }}> ({formatBytes(FILES[hover].bytes)})</span>
          </div>
        )}
      </div>

      <InfoBox variant="amber">
        Going from a single letter to GPT-4 is a jump of <b>1,000,000,000,000×</b>. The internet works because we built ways to store and move trillions of these bytes every second.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Phone Storage Race                                          */
/* ------------------------------------------------------------------ */

function StorageRaceTab() {
  const [storage, setStorage] = useState(64); // GB
  const [photoSize, setPhotoSize] = useState(3); // MB
  const reservedGB = 12; // OS + apps
  const usableGB = Math.max(storage - reservedGB, 0);
  const photos = Math.floor((usableGB * 1000) / photoSize);

  // Bucket fill animation grid: 10x10 = 100 cells
  const totalCells = 100;
  const filledCells = Math.min(Math.round((reservedGB / storage) * totalCells), totalCells);

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        How many photos can your phone <b>actually</b> hold? Drag the sliders to see!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card-sketchy" style={{ background: "#e6f7ff" }}>
          <label className="font-hand font-bold text-sm flex justify-between" style={{ color: INK }}>
            <span>📱 Phone storage</span>
            <span style={{ color: SKY }}>{storage} GB</span>
          </label>
          <input
            type="range"
            min={16}
            max={512}
            step={16}
            value={storage}
            onChange={(e) => { playPop(); setStorage(parseInt(e.target.value)); }}
            className="w-full mt-1 accent-[#6bb6ff]"
          />
        </div>
        <div className="card-sketchy" style={{ background: "#fff0ed" }}>
          <label className="font-hand font-bold text-sm flex justify-between" style={{ color: INK }}>
            <span>📷 Photo size</span>
            <span style={{ color: CORAL }}>{photoSize} MB</span>
          </label>
          <input
            type="range"
            min={1}
            max={12}
            value={photoSize}
            onChange={(e) => { playPop(); setPhotoSize(parseInt(e.target.value)); }}
            className="w-full mt-1 accent-[#ff6b6b]"
          />
        </div>
      </div>

      <div className="card-sketchy" style={{ background: PAPER }}>
        <h3 className="font-hand font-bold mb-3 text-center" style={{ color: INK }}>Storage map</h3>
        <div
          className="grid mx-auto"
          style={{
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 3,
            maxWidth: 360,
            border: `3px solid ${INK}`,
            padding: 6,
            borderRadius: 10,
            boxShadow: "4px 4px 0 #2b2a35",
            background: "#f5f1e0",
          }}
        >
          {Array.from({ length: totalCells }, (_, i) => {
            const reserved = i < filledCells;
            return (
              <div
                key={i}
                style={{
                  aspectRatio: "1",
                  background: reserved ? LAVENDER : MINT,
                  border: `1.5px solid ${INK}`,
                  borderRadius: 3,
                  transition: "background 0.3s",
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-3 font-hand text-xs" style={{ color: INK }}>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 14, height: 14, background: LAVENDER, border: `1.5px solid ${INK}`, display: "inline-block" }} />
            OS + apps ({reservedGB} GB)
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 14, height: 14, background: MINT, border: `1.5px solid ${INK}`, display: "inline-block" }} />
            Free for photos ({usableGB} GB)
          </div>
        </div>
      </div>

      <div className="card-sketchy text-center" style={{ background: YELLOW }}>
        <div className="font-hand text-base" style={{ color: INK }}>You can store about</div>
        <div className="font-hand text-5xl font-bold my-2" style={{ color: CORAL, filter: "drop-shadow(2px 2px 0 #2b2a35)" }}>
          {photos.toLocaleString()}
        </div>
        <div className="font-hand text-base" style={{ color: INK }}>photos before it fills up!</div>
      </div>

      <InfoBox variant="green">
        Notice how a tiny change in <b>photo size</b> changes the total dramatically. That's why "compress your photos" actually matters — every byte adds up.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "How many bits are in 1 byte?",
    options: ["1", "4", "8", "16"],
    correctIndex: 2,
    explanation: "8 bits = 1 byte. That's exactly enough to store one English letter or a small number 0–255.",
  },
  {
    question: "Which is biggest?",
    options: ["1 KB", "1 MB", "1 GB", "1 TB"],
    correctIndex: 3,
    explanation: "Each step is about 1000× bigger: KB → MB → GB → TB. A terabyte holds about 250,000 phone photos.",
  },
  {
    question: "Why is everything inside a computer just 0s and 1s?",
    options: ["It's the cheapest letters", "Electronic switches are easiest with two states: off/on", "Old habit", "Random choice"],
    correctIndex: 1,
    explanation: "Tiny electronic switches (transistors) are reliable when they only have to be 'off' or 'on' — that's a 0 or a 1.",
  },
  {
    question: "If a photo is 3 MB, about how many photos fit in 1 GB?",
    options: ["3", "30", "330", "3000"],
    correctIndex: 2,
    explanation: "1 GB ≈ 1000 MB, and 1000 ÷ 3 ≈ 333. So roughly 330 photos per gigabyte.",
  },
];

export default function L1c_BitsBytesActivity() {
  const tabs = useMemo(
    () => [
      { id: "bit-builder", label: "Bit Builder", icon: <ToggleLeft className="w-4 h-4" />, content: <BitBuilderTab /> },
      { id: "file-sizes", label: "File Size Scale", icon: <HardDrive className="w-4 h-4" />, content: <FileSizeTab /> },
      { id: "storage", label: "Phone Storage", icon: <Smartphone className="w-4 h-4" />, content: <StorageRaceTab /> },
    ],
    [],
  );

  return (
    <LessonShell
      title="Bits, Bytes & Files"
      level={1}
      lessonNumber={5}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Now you know how data is stored. Time to learn how computers find patterns in all those numbers — Level 2 awaits!"
      story={
        <StorySection
          paragraphs={[
            "Aru looked at her phone: \"Storage almost full.\" She frowned. \"I deleted so many things last week!\"",
            "Byte: \"You probably took 200 photos at the beach. Each photo is about 3 MB — that's 600 MB gone, just from one trip.\"",
            "Aru: \"Wait, 3 MB is one photo? But MB sounds tiny...\"",
            "Byte: \"That's because 1 MB is actually 8,000,000 bits. Each bit is one tiny on/off switch. A photo is millions of switches frozen in place.\"",
            "Aru: \"So when my phone runs out of space, it really means... it ran out of switches?\"",
            "Byte: \"Exactly. Welcome to the secret language of computers.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A bit is the smallest piece of memory: 0 or 1. 8 bits = 1 byte (enough for a letter). 1000 bytes = 1 KB. 1000 KB = 1 MB. 1000 MB = 1 GB. ML models like GPT-4 are around a terabyte — a trillion bytes — of these tiny switches working together."
        />
      }
    />
  );
}