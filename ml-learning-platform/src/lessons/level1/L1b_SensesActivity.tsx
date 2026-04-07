import { useState, useMemo, useEffect, useRef } from "react";
import { Camera, Mic, Radar } from "lucide-react";
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
/*  Tab 1 – Camera Eye (pixel grid)                                    */
/* ------------------------------------------------------------------ */

// 12x8 stylized "smiley" image  each cell holds an RGB triplet.
const SMILEY: [number, number, number][][] = (() => {
  const sky: [number, number, number] = [120, 200, 255];
  const yel: [number, number, number] = [255, 220, 80];
  const ink: [number, number, number] = [40, 40, 60];
  const red: [number, number, number] = [255, 100, 100];
  const W = 12, H = 8;
  const grid: [number, number, number][][] = Array.from({ length: H }, () => Array(W).fill(sky));
  // Face circle (rough)
  const face = [
    [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1],
    [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2],
    [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3],
    [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4],
    [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5],
    [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6],
  ];
  face.forEach(([x, y]) => (grid[y][x] = yel));
  // Eyes
  grid[3][4] = ink; grid[3][7] = ink;
  // Mouth
  grid[5][4] = red; grid[5][5] = red; grid[5][6] = red; grid[5][7] = red;
  return grid;
})();

function CameraEyeTab() {
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [zoom, setZoom] = useState(false);

  const cellSize = 32;
  const W = SMILEY[0].length;
  const H = SMILEY.length;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        A camera's eye is just a <span style={{ color: CORAL, fontWeight: 700 }}>tiny grid of dots</span>.
        Each dot stores three numbers: how much <span style={{ color: CORAL }}>red</span>,{" "}
        <span style={{ color: MINT }}>green</span>, and <span style={{ color: SKY }}>blue</span> it sees.
      </p>

      <div className="card-sketchy" style={{ background: PAPER }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-hand font-bold" style={{ color: INK }}>Hover any pixel ↓</h3>
          <button
            onClick={() => { playClick(); setZoom((z) => !z); }}
            className="btn-sketchy-outline font-hand text-sm py-1 px-3"
          >
            {zoom ? "Zoom out" : "🔍 Zoom in"}
          </button>
        </div>

        <svg
          viewBox={`0 0 ${W * cellSize} ${H * cellSize}`}
          className="w-full mx-auto"
          style={{ maxWidth: zoom ? 720 : 480, transition: "max-width .3s" }}
        >
          <defs>
            <pattern id="cam-grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
              <path d={`M${cellSize} 0H0V${cellSize}`} fill="none" stroke={INK} strokeWidth="0.6" opacity="0.25" />
            </pattern>
          </defs>
          {SMILEY.map((row, y) =>
            row.map((rgb, x) => {
              const isHover = hover?.x === x && hover?.y === y;
              return (
                <rect
                  key={`${x}-${y}`}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`}
                  stroke={isHover ? INK : "none"}
                  strokeWidth={isHover ? 3 : 0}
                  onMouseEnter={() => { setHover({ x, y }); playPop(); }}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "crosshair" }}
                />
              );
            }),
          )}
          <rect x="0" y="0" width={W * cellSize} height={H * cellSize} fill="url(#cam-grid)" pointerEvents="none" />
        </svg>

        {hover && (
          <div className="mt-3 flex items-center gap-3 justify-center font-hand">
            <div
              style={{
                width: 36, height: 36,
                background: `rgb(${SMILEY[hover.y][hover.x].join(",")})`,
                border: `2px solid ${INK}`,
                boxShadow: "2px 2px 0 #2b2a35",
              }}
            />
            <span className="px-2 py-0.5 rounded" style={{ background: CORAL, color: PAPER, fontSize: 12, fontWeight: 700 }}>
              R {SMILEY[hover.y][hover.x][0]}
            </span>
            <span className="px-2 py-0.5 rounded" style={{ background: MINT, color: PAPER, fontSize: 12, fontWeight: 700 }}>
              G {SMILEY[hover.y][hover.x][1]}
            </span>
            <span className="px-2 py-0.5 rounded" style={{ background: SKY, color: PAPER, fontSize: 12, fontWeight: 700 }}>
              B {SMILEY[hover.y][hover.x][2]}
            </span>
          </div>
        )}

        <div className="text-center mt-4">
          <button
            onClick={() => { playClick(); setRevealed((r) => !r); }}
            className="btn-sketchy font-hand"
            style={{ background: YELLOW }}
          >
            {revealed ? "Hide numbers" : "Show all RGB numbers"}
          </button>
        </div>

        {revealed && (
          <div
            className="mt-3 font-mono text-[9px] overflow-x-auto p-2 rounded"
            style={{ background: "#f5f1e0", border: `1.5px solid ${INK}` }}
          >
            {SMILEY.map((row, y) => (
              <div key={y}>
                {row.map((rgb) => `(${rgb[0].toString().padStart(3, " ")},${rgb[1].toString().padStart(3, " ")},${rgb[2].toString().padStart(3, " ")})`).join(" ")}
              </div>
            ))}
          </div>
        )}
      </div>

      <InfoBox variant="blue">
        Your phone camera has <b>millions</b> of these tiny dots — that's why it's called a <b>12-megapixel</b> camera!
        Each photo you take is just a giant grid of red, green, and blue numbers.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Microphone Ear (waveform)                                  */
/* ------------------------------------------------------------------ */

function MicrophoneTab() {
  const [loudness, setLoudness] = useState(40);
  const [pitch, setPitch] = useState(2);
  const [phase, setPhase] = useState(0);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    const tick = () => {
      setPhase((p) => p + 0.08);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  const W = 540, H = 180;
  const samples = 80;
  const points = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < samples; i++) {
      const x = (i / (samples - 1)) * W;
      const t = (i / samples) * Math.PI * 2 * pitch + phase;
      const y = H / 2 - Math.sin(t) * (loudness * 0.8);
      arr.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return arr.join(" ");
  }, [loudness, pitch, phase]);

  const bars = Array.from({ length: 24 }, (_, i) => {
    const t = (i / 24) * Math.PI * 2 * pitch + phase;
    return Math.abs(Math.sin(t)) * loudness;
  });

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        A microphone is an <span style={{ color: LAVENDER, fontWeight: 700 }}>ear made of metal</span>.
        It turns sound waves wiggling in the air into a long list of numbers.
      </p>

      <div className="card-sketchy" style={{ background: PAPER }}>
        <h3 className="font-hand font-bold mb-2" style={{ color: INK }}>Live waveform</h3>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 600 }}>
          <defs>
            <pattern id="mic-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="#e8e3d3" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={W} height={H} fill="url(#mic-grid)" />
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke={INK} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
          <polyline
            points={points}
            fill="none"
            stroke={CORAL}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(2px 2px 0 #2b2a35)" }}
          />
        </svg>

        {/* Sampled bars */}
        <div className="flex items-end justify-center gap-1 mt-3" style={{ height: 60 }}>
          {bars.map((b, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: Math.max(b * 0.8, 3),
                background: i % 2 === 0 ? MINT : SKY,
                border: `1.5px solid ${INK}`,
                boxShadow: "1.5px 1.5px 0 #2b2a35",
                transition: "height 0.08s linear",
              }}
            />
          ))}
        </div>
        <p className="text-center font-hand text-xs mt-1" style={{ color: INK, opacity: 0.7 }}>
          ↑ The same wave, sliced into <b>{bars.length} numbers</b> per moment. That's how a computer stores your voice.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card-sketchy" style={{ background: "#fff8dc" }}>
          <label className="font-hand font-bold text-sm flex justify-between" style={{ color: INK }}>
            <span>🔊 Loudness</span>
            <span style={{ color: CORAL }}>{loudness}</span>
          </label>
          <input
            type="range"
            min={5}
            max={75}
            value={loudness}
            onChange={(e) => { playPop(); setLoudness(parseInt(e.target.value)); }}
            className="w-full mt-1 accent-[#ff6b6b]"
          />
        </div>
        <div className="card-sketchy" style={{ background: "#e6f7ff" }}>
          <label className="font-hand font-bold text-sm flex justify-between" style={{ color: INK }}>
            <span>🎵 Pitch</span>
            <span style={{ color: SKY }}>{pitch.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={pitch}
            onChange={(e) => { playPop(); setPitch(parseFloat(e.target.value)); }}
            className="w-full mt-1 accent-[#6bb6ff]"
          />
        </div>
      </div>

      <InfoBox variant="amber">
        Voice assistants like Alexa and Siri grab <b>16,000 of these numbers every second</b>. Your "Hey Siri" is just a long, long list of tiny wave heights.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Sensor Zoo                                                  */
/* ------------------------------------------------------------------ */

const SENSORS: { emoji: string; name: string; what: string; into: string; example: string; color: string }[] = [
  { emoji: "🌡️", name: "Thermometer", what: "Heat", into: "A number (°C / °F)", example: "Smart fridge keeps food at 4°C", color: CORAL },
  { emoji: "📍", name: "GPS", what: "Position on Earth", into: "Two numbers (latitude, longitude)", example: "Google Maps shows where you are", color: MINT },
  { emoji: "📐", name: "Accelerometer", what: "Motion / tilt", into: "Three numbers (x, y, z shake)", example: "Phone screen rotates when you turn it", color: LAVENDER },
  { emoji: "💡", name: "Light Sensor", what: "Brightness", into: "A single brightness number", example: "Phone auto-dims at night", color: YELLOW },
  { emoji: "👆", name: "Touch Sensor", what: "Finger press / position", into: "X-Y coordinates", example: "Every tap on a phone screen", color: SKY },
  { emoji: "🌫️", name: "Air Sensor", what: "Smoke / gas", into: "A pollution level number", example: "Smoke alarm beeps when there's fire", color: PEACH },
];

function SensorZooTab() {
  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Every machine that "knows" something about the world uses a <span style={{ color: MINT, fontWeight: 700 }}>sensor</span>. Each sensor turns one thing about reality into <span style={{ color: CORAL, fontWeight: 700 }}>numbers</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SENSORS.map((s) => (
          <div key={s.name} className="card-sketchy overflow-hidden p-4">
            <div style={{ height: 6, background: s.color, margin: "-16px -16px 12px -16px", borderBottom: `2px solid ${INK}` }} />
            <div className="flex items-center gap-3 mb-2">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{ width: 52, height: 52, background: s.color, border: `2px solid ${INK}`, boxShadow: "3px 3px 0 #2b2a35", fontSize: 28 }}
              >
                {s.emoji}
              </div>
              <h3 className="font-hand text-lg font-bold" style={{ color: INK }}>{s.name}</h3>
            </div>

            <div className="space-y-1.5 font-hand text-sm" style={{ color: INK }}>
              <div className="flex gap-2">
                <span className="px-1.5 rounded" style={{ background: CORAL, color: PAPER, fontSize: 10, fontWeight: 700 }}>SENSES</span>
                <span>{s.what}</span>
              </div>
              <div className="flex gap-2">
                <span className="px-1.5 rounded" style={{ background: LAVENDER, color: PAPER, fontSize: 10, fontWeight: 700 }}>BECOMES</span>
                <span>{s.into}</span>
              </div>
            </div>

            <div className="mt-3 pt-2 font-hand text-xs italic" style={{ color: INK, opacity: 0.75, borderTop: "1.5px dashed #2b2a35" }}>
              {s.example}
            </div>
          </div>
        ))}
      </div>

      <InfoBox variant="green">
        A modern smartphone has <b>15+ sensors</b> packed inside it. ML systems become powerful by combining many sensors at once — like a self-driving car using cameras + radar + GPS together.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What does a digital camera actually store when you take a photo?",
    options: ["A drawing of the scene", "A grid of red/green/blue numbers", "An invisible recording", "A smell"],
    correctIndex: 1,
    explanation: "Every photo is just a giant grid of pixels — and each pixel is three numbers: how much R, G, and B there is.",
  },
  {
    question: "How does a microphone turn sound into something a computer can use?",
    options: ["By taking pictures of the sound", "By recording sound waves as a list of numbers", "By writing words", "It cannot"],
    correctIndex: 1,
    explanation: "A microphone samples the wiggle of the air thousands of times per second and stores each sample as a number.",
  },
  {
    question: "Which of these is NOT a sensor?",
    options: ["Thermometer", "GPS", "Calculator", "Accelerometer"],
    correctIndex: 2,
    explanation: "A calculator processes numbers — it doesn't sense the world. Sensors gather data; calculators just compute.",
  },
  {
    question: "Why are sensors so important for ML?",
    options: ["They look pretty", "They turn the real world into numbers ML can learn from", "They are cheap", "They make noise"],
    correctIndex: 1,
    explanation: "ML needs numbers to learn. Sensors are the bridge between the messy real world and the clean numbers a computer understands.",
  },
];

export default function L1b_SensesActivity() {
  const tabs = useMemo(
    () => [
      { id: "camera", label: "Camera Eye", icon: <Camera className="w-4 h-4" />, content: <CameraEyeTab /> },
      { id: "mic", label: "Microphone Ear", icon: <Mic className="w-4 h-4" />, content: <MicrophoneTab /> },
      { id: "zoo", label: "Sensor Zoo", icon: <Radar className="w-4 h-4" />, content: <SensorZooTab /> },
    ],
    [],
  );

  return (
    <LessonShell
      title="Sensors: How Machines Sense the World"
      level={1}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Now you know how the world becomes numbers. Next: how those numbers actually live inside the computer — bits, bytes, and files!"
      story={
        <StorySection
          paragraphs={[
            "Aru tilted her phone sideways and the screen rotated. \"How did it know I turned it?\"",
            "Byte: \"There's a tiny sensor inside called an accelerometer. It measures which way is 'down' — and tells the screen.\"",
            "Aru: \"So... my phone has feelings?\"",
            "Byte: \"Not feelings — but it has SENSES. Sensors are how machines see, hear, and feel the world. Every one of them does the same trick: it turns something real into numbers.\"",
            "Aru: \"Numbers again! Everything in computers really is numbers, isn't it?\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A sensor is a device that converts something physical (light, sound, motion, heat) into numbers a computer can store and process. Cameras → pixel grids. Microphones → sound waves as samples. Without sensors, ML would have nothing to learn from."
        />
      }
    />
  );
}