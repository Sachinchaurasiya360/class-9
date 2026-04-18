"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Box, ListOrdered, Zap, Sparkles } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

function RikuSays({ children }: { children: ReactNode }) {
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
/*  Tab 1 – Input-Output Machine                                      */
/* ------------------------------------------------------------------ */

const INPUTS = [
  { label: "Number 5", value: 5, color: CORAL },
  { label: "Number 12", value: 12, color: LAVENDER },
  { label: "Number 7", value: 7, color: MINT },
  { label: "Number 20", value: 20, color: PEACH },
];

const RULES: { label: string; fn: (n: number) => number; color: string }[] = [
  { label: "Double it", fn: (n) => n * 2, color: CORAL },
  { label: "Add 10", fn: (n) => n + 10, color: MINT },
  { label: "Square it", fn: (n) => n * n, color: LAVENDER },
  { label: "Subtract 3", fn: (n) => n - 3, color: SKY },
];

function InputOutputTab() {
  const [selectedInput, setSelectedInput] = useState<number | null>(null);
  const [selectedRule, setSelectedRule] = useState<number>(0);
  const [output, setOutput] = useState<number | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const handleProcess = useCallback(() => {
    if (selectedInput === null) return;
    playClick();
    setProcessing(true);
    setShowOutput(false);
    setOutput(null);
    setPulseKey((k) => k + 1);
    setTimeout(() => {
      const result = RULES[selectedRule].fn(INPUTS[selectedInput].value);
      setOutput(result);
      setProcessing(false);
      playPop();
      requestAnimationFrame(() => setShowOutput(true));
    }, 1100);
  }, [selectedInput, selectedRule]);

  const handleReset = useCallback(() => {
    playClick();
    setSelectedInput(null);
    setSelectedRule(0);
    setOutput(null);
    setShowOutput(false);
    setProcessing(false);
  }, []);

  const ruleColor = RULES[selectedRule].color;

  return (
    <div className="space-y-4">
      <RikuSays>
        A machine is anything that follows instructions without thinking. You feed it an <b>input</b>, it runs a <b>rule</b>, and it spits out an <b>output</b>. Your microwave is a machine. Your dishwasher is a machine. Your little sibling is... not.
      </RikuSays>

      {/* Rule selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {RULES.map((r, i) => (
          <button
            key={r.label}
            onClick={() => {
              playClick();
              setSelectedRule(i);
              setOutput(null);
              setShowOutput(false);
            }}
            className={
              selectedRule === i
                ? "btn-sketchy font-hand text-sm"
                : "btn-sketchy-outline font-hand text-sm"
            }
            style={selectedRule === i ? { background: r.color } : { borderColor: r.color, color: r.color }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* SVG machine diagram */}
      <svg viewBox="0 0 580 240" className="w-full max-w-[580px] mx-auto">
        <defs>
          <marker id="arrowhead-sketchy" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
            <path d="M0,0 L10,4 L0,8 Z" fill={INK} />
          </marker>
          <pattern id="paper-grid" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M14 0H0V14" fill="none" stroke="#e8e3d3" strokeWidth="0.6" />
          </pattern>
          <filter id="glow-out">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="580" height="240" fill="url(#paper-grid)" />

        {/* Input cards */}
        {INPUTS.map((inp, i) => {
          const y = 18 + i * 50;
          const active = selectedInput === i;
          return (
            <g
              key={inp.label}
              onClick={() => {
                playPop();
                setSelectedInput(i);
                setOutput(null);
                setShowOutput(false);
              }}
              className="cursor-pointer"
              style={{ transformOrigin: `60px ${y + 19}px`, transform: active ? "scale(1.05)" : "scale(1)", transition: "transform .25s" }}
            >
              <rect
                x={10} y={y} width={108} height={40} rx={6}
                fill={active ? inp.color : PAPER}
                stroke={INK}
                strokeWidth={2}
                style={{ filter: active ? "drop-shadow(3px 3px 0 #2b2a35)" : "drop-shadow(2px 2px 0 #2b2a35)" }}
              />
              <text x={64} y={y + 25} textAnchor="middle" fill={active ? PAPER : INK}
                style={{ fontFamily: "Kalam, cursive", fontSize: 14, fontWeight: 700 }}>
                {inp.label}
              </text>
            </g>
          );
        })}

        {/* Arrow input -> machine */}
        <path d="M122,120 Q160,120 195,120" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round"
          markerEnd="url(#arrowhead-sketchy)" />

        {processing && selectedInput !== null && (
          <circle key={`p1-${pulseKey}`} r={6} fill={INPUTS[selectedInput].color} stroke={INK} strokeWidth={1.5} filter="url(#glow-out)">
            <animateMotion dur="0.55s" repeatCount="1" path="M122,120 Q160,120 195,120" />
          </circle>
        )}

        {/* Machine box */}
        <rect x={200} y={50} width={170} height={140} rx={14} fill={PAPER} stroke={INK} strokeWidth={3}
          style={{ filter: "drop-shadow(4px 4px 0 #2b2a35)" }} />
        <rect x={208} y={58} width={154} height={124} rx={10} fill="none" stroke={ruleColor} strokeWidth={2} strokeDasharray="4 3" />

        {/* Spinning gears */}
        <g style={{ transformOrigin: "260px 125px", animation: processing ? "spin 1.2s linear infinite" : "none" }}>
          <circle cx={260} cy={125} r={26} fill="none" stroke={INK} strokeWidth={2} />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <rect key={i} x={258} y={95} width={4} height={6} fill={INK}
              transform={`rotate(${(a * 180) / Math.PI} 260 125)`} />;
          })}
          <circle cx={260} cy={125} r={10} fill={ruleColor} stroke={INK} strokeWidth={2} />
        </g>
        <g style={{ transformOrigin: "315px 155px", animation: processing ? "spin 0.9s linear infinite reverse" : "none" }}>
          <circle cx={315} cy={155} r={16} fill="none" stroke={INK} strokeWidth={2} />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return <rect key={i} x={313} y={137} width={4} height={5} fill={INK}
              transform={`rotate(${(a * 180) / Math.PI} 315 155)`} />;
          })}
          <circle cx={315} cy={155} r={6} fill={YELLOW} stroke={INK} strokeWidth={1.5} />
        </g>

        <text x={285} y={75} textAnchor="middle" fill={INK}
          style={{ fontFamily: "Patrick Hand, cursive", fontSize: 13, letterSpacing: 1 }}>
          MACHINE
        </text>
        <text x={285} y={210} textAnchor="middle" fill={ruleColor}
          style={{ fontFamily: "Kalam, cursive", fontSize: 14, fontWeight: 700 }}>
          {RULES[selectedRule].label}
        </text>

        {/* Arrow machine -> output */}
        <path d="M375,120 Q405,120 435,120" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round"
          markerEnd="url(#arrowhead-sketchy)" />

        {processing && (
          <circle key={`p2-${pulseKey}`} r={6} fill={ruleColor} stroke={INK} strokeWidth={1.5} filter="url(#glow-out)">
            <animateMotion dur="0.5s" begin="0.55s" repeatCount="1" path="M375,120 Q405,120 435,120" />
          </circle>
        )}

        {/* Output area */}
        <rect x={440} y={70} width={130} height={100} rx={10}
          fill={showOutput ? "#e8fff9" : PAPER}
          stroke={INK} strokeWidth={3}
          style={{ filter: "drop-shadow(3px 3px 0 #2b2a35)" }} />
        {showOutput && (
          <circle cx={505} cy={120} r={48} fill="none" stroke={MINT} strokeWidth={2.5} opacity={0.7}>
            <animate attributeName="r" from="20" to="55" dur="0.8s" />
            <animate attributeName="opacity" from="0.9" to="0" dur="0.8s" />
          </circle>
        )}
        <text x={505} y={88} textAnchor="middle" fill={INK}
          style={{ fontFamily: "Patrick Hand, cursive", fontSize: 12, letterSpacing: 1 }}>
          OUTPUT
        </text>
        {processing && (
          <text x={505} y={130} textAnchor="middle" fill={INK}
            style={{ fontFamily: "Kalam, cursive", fontSize: 22, fontWeight: 700 }}>
            ...
          </text>
        )}
        {output !== null && (
          <text x={505} y={140} textAnchor="middle" fill={INK}
            style={{
              fontFamily: "Kalam, cursive", fontSize: 32, fontWeight: 700,
              opacity: showOutput ? 1 : 0,
              transition: "opacity 0.5s ease-in",
            }}>
            {output}
          </text>
        )}
      </svg>

      {output !== null && selectedInput !== null && showOutput && (
        <div className="card-sketchy text-center font-hand text-base py-2 px-4">
          <span style={{ color: INPUTS[selectedInput].color }}>{INPUTS[selectedInput].value}</span>
          {" → "}
          <span style={{ color: ruleColor }}>{RULES[selectedRule].label}</span>
          {" → "}
          <span style={{ color: MINT, fontWeight: 700 }}>{output}</span>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleProcess}
          disabled={selectedInput === null || processing}
          className="btn-sketchy font-hand"
          style={{ background: YELLOW, opacity: selectedInput === null || processing ? 0.5 : 1 }}
        >
          {processing ? "Processing..." : "Process!"}
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline font-hand">
          Reset
        </button>
      </div>

      <InfoBox variant="blue">
        A machine takes something in, does something to it, and gives something back. Same input + same rule = same output, every time!
      </InfoBox>

      <RikuSays>
        Notice something? Swap the <b>rule</b> and you get a different output from the same input. That&apos;s the whole trick - a machine is really just a <i>function</i> waiting to be fed.
      </RikuSays>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Instruction Sequence                                       */
/* ------------------------------------------------------------------ */

const GRID_SIZE = 6;
const CELL = 48;
const GRID_PAD = 12;

type Direction = "right" | "down" | "left" | "up";

const DIR_DELTAS: Record<Direction, [number, number]> = {
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
  up: [0, -1],
};

const DIR_ARROW: Record<Direction, string> = {
  right: "→",
  down: "↓",
  left: "←",
  up: "↑",
};

function InstructionSequenceTab() {
  const [instructions, setInstructions] = useState<Direction[]>([]);
  const [robotPos, setRobotPos] = useState<[number, number]>([0, 0]);
  const [trail, setTrail] = useState<[number, number][]>([[0, 0]]);
  const [running, setRunning] = useState(false);
  const [execIndex, setExecIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const runTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const starPos: [number, number] = [5, 5];
  const svgW = GRID_SIZE * CELL + GRID_PAD * 2;
  const svgH = GRID_SIZE * CELL + GRID_PAD * 2;

  const addInstruction = useCallback(
    (dir: Direction) => {
      if (running) return;
      playClick();
      setInstructions((prev) => [...prev, dir]);
      setMessage(null);
    },
    [running],
  );

  const clearAll = useCallback(() => {
    if (runTimerRef.current) clearTimeout(runTimerRef.current);
    setInstructions([]);
    setRobotPos([0, 0]);
    setTrail([[0, 0]]);
    setRunning(false);
    setExecIndex(0);
    setMessage(null);
    setCelebrate(false);
  }, []);

  const handleRun = useCallback(() => {
    if (running || instructions.length === 0) return;
    setMessage(null);
    setCelebrate(false);
    let pos: [number, number] = [0, 0];
    let tr: [number, number][] = [[0, 0]];
    let idx = 0;
    setRobotPos(pos);
    setTrail(tr);
    setExecIndex(0);
    setRunning(true);

    const tick = () => {
      if (idx >= instructions.length) {
        setRunning(false);
        if (pos[0] === starPos[0] && pos[1] === starPos[1]) {
          setMessage("You reached the star! Great job!");
          setCelebrate(true);
          playSuccess();
        }
        return;
      }
      const dir = instructions[idx];
      const [dx, dy] = DIR_DELTAS[dir];
      const nx = pos[0] + dx;
      const ny = pos[1] + dy;
      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) {
        setMessage("Oops! The robot went off the grid. Try again!");
        setRunning(false);
        playError();
        return;
      }
      pos = [nx, ny];
      tr = [...tr, [nx, ny]];
      idx++;
      setRobotPos(pos);
      setTrail(tr);
      setExecIndex(idx);
      playPop();
      if (nx === starPos[0] && ny === starPos[1]) {
        setMessage("You reached the star! Great job!");
        setCelebrate(true);
        setRunning(false);
        playSuccess();
        return;
      }
      runTimerRef.current = setTimeout(tick, 280);
    };
    runTimerRef.current = setTimeout(tick, 280);
  }, [running, instructions]);

  useEffect(() => {
    return () => {
      if (runTimerRef.current) clearTimeout(runTimerRef.current);
    };
  }, []);

  const dirButtons: { dir: Direction; color: string }[] = [
    { dir: "right", color: CORAL },
    { dir: "down", color: MINT },
    { dir: "left", color: LAVENDER },
    { dir: "up", color: SKY },
  ];

  const robotPx = GRID_PAD + robotPos[0] * CELL + CELL / 2;
  const robotPy = GRID_PAD + robotPos[1] * CELL + CELL / 2;

  return (
    <div className="space-y-4">
      <RikuSays>
        Instructions are the <i>how</i>, not the <i>why</i>. A machine never asks &quot;why am I doing this?&quot; It just runs the list, one step at a time, in order. Program the robot to grab that star!
      </RikuSays>

      <div className="flex justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxWidth: svgW }}>
          <defs>
            <pattern id="paper-grid-2" width="14" height="14" patternUnits="userSpaceOnUse">
              <path d="M14 0H0V14" fill="none" stroke="#e8e3d3" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={svgW} height={svgH} fill="url(#paper-grid-2)" />

          {Array.from({ length: GRID_SIZE }, (_, row) =>
            Array.from({ length: GRID_SIZE }, (_, col) => {
              const x = GRID_PAD + col * CELL;
              const y = GRID_PAD + row * CELL;
              const key = `${col},${row}`;
              const visitIdx = trail.findIndex(([cx, cy]) => cx === col && cy === row);
              const isVisited = visitIdx !== -1;
              const isStar = col === starPos[0] && row === starPos[1];
              return (
                <g key={key}>
                  <rect
                    x={x + 2} y={y + 2} width={CELL - 4} height={CELL - 4} rx={6}
                    fill={isVisited ? "#fff4b8" : PAPER}
                    stroke={INK}
                    strokeWidth={1.5}
                    opacity={isVisited ? 0.85 : 1}
                  />
                  {isStar && (
                    <text x={x + CELL / 2} y={y + CELL / 2 + 8} textAnchor="middle"
                      style={{ fontSize: 24, filter: celebrate ? "drop-shadow(0 0 6px #ffd93d)" : "none" }}>
                      ⭐
                    </text>
                  )}
                </g>
              );
            }),
          )}

          {trail.length > 1 && (
            <polyline
              points={trail.map(([cx, cy]) => `${GRID_PAD + cx * CELL + CELL / 2},${GRID_PAD + cy * CELL + CELL / 2}`).join(" ")}
              fill="none" stroke={CORAL} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="5 4" opacity={0.8}
            />
          )}

          <g style={{ transition: "transform 0.25s ease-out", transform: `translate(${robotPx - CELL / 2}px, ${robotPy - CELL / 2}px)` }}>
            <circle cx={CELL / 2} cy={CELL / 2} r={20} fill={SKY} stroke={INK} strokeWidth={2}
              style={{ filter: "drop-shadow(2px 2px 0 #2b2a35)" }} />
            <text x={CELL / 2} y={CELL / 2 + 8} textAnchor="middle" style={{ fontSize: 22 }}>🤖</text>
          </g>

          {celebrate && (
            <circle cx={GRID_PAD + starPos[0] * CELL + CELL / 2} cy={GRID_PAD + starPos[1] * CELL + CELL / 2}
              r={20} fill="none" stroke={YELLOW} strokeWidth={3}>
              <animate attributeName="r" from="10" to="60" dur="0.9s" repeatCount="2" />
              <animate attributeName="opacity" from="1" to="0" dur="0.9s" repeatCount="2" />
            </circle>
          )}
        </svg>
      </div>

      <p className="text-center font-hand text-base">
        Steps: <span style={{ color: CORAL, fontWeight: 700 }}>{execIndex}</span>
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {dirButtons.map((b) => (
          <button
            key={b.dir}
            onClick={() => addInstruction(b.dir)}
            disabled={running}
            className="btn-sketchy font-hand text-sm"
            style={{ background: b.color, opacity: running ? 0.5 : 1 }}
          >
            {DIR_ARROW[b.dir]} {b.dir}
          </button>
        ))}
      </div>

      {instructions.length > 0 && (
        <div className="card-sketchy">
          <p className="font-hand text-xs mb-2" style={{ color: INK }}>Instruction List:</p>
          <div className="flex flex-wrap gap-1.5">
            {instructions.map((dir, i) => {
              const done = i < execIndex;
              const current = i === execIndex && running;
              return (
                <span key={i}
                  className="font-hand text-sm px-2 py-0.5 rounded border-2"
                  style={{
                    borderColor: INK,
                    background: done ? MINT : current ? YELLOW : PAPER,
                    boxShadow: "2px 2px 0 #2b2a35",
                    transition: "all .25s",
                  }}>
                  {DIR_ARROW[dir]}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button onClick={handleRun} disabled={running || instructions.length === 0}
          className="btn-sketchy font-hand"
          style={{ background: MINT, opacity: running || instructions.length === 0 ? 0.5 : 1 }}>
          ▶ Run
        </button>
        <button onClick={clearAll} className="btn-sketchy-outline font-hand">Clear</button>
      </div>

      {message && (
        <div className="card-sketchy text-center font-hand text-base"
          style={{ background: message.includes("star") ? "#e8fff9" : "#ffe8e8" }}>
          {message}
        </div>
      )}

      <InfoBox variant="amber">
        Order matters! The robot follows your instructions exactly, one at a time.
      </InfoBox>

      <RikuSays>
        Fun fact: that list of steps you just made? Programmers call it a <b>program</b>. You literally just wrote code.
      </RikuSays>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Speed of Computers                                         */
/* ------------------------------------------------------------------ */

function SpeedTab() {
  const [additionCount, setAdditionCount] = useState(1000);
  const [humanCount, setHumanCount] = useState(0);
  const [computerCount, setComputerCount] = useState(0);
  const [racing, setRacing] = useState(false);
  const [finished, setFinished] = useState(false);
  const humanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sliderToCount = useCallback((v: number): number => {
    const minLog = Math.log10(10);
    const maxLog = Math.log10(10000);
    return Math.round(Math.pow(10, minLog + (v / 100) * (maxLog - minLog)));
  }, []);

  const countToSlider = useCallback((c: number): number => {
    const minLog = Math.log10(10);
    const maxLog = Math.log10(10000);
    return ((Math.log10(c) - minLog) / (maxLog - minLog)) * 100;
  }, []);

  const sliderValue = useMemo(() => countToSlider(additionCount), [additionCount, countToSlider]);

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (racing) return;
      setAdditionCount(sliderToCount(Number(e.target.value)));
    },
    [racing, sliderToCount],
  );

  const startRace = useCallback(() => {
    if (racing) return;
    playClick();
    setHumanCount(0);
    setComputerCount(0);
    setFinished(false);
    setRacing(true);

    setTimeout(() => {
      setComputerCount(additionCount);
    }, 200);

    let h = 0;
    humanTimerRef.current = setInterval(() => {
      h += 1;
      setHumanCount(h);
      if (h >= additionCount) {
        if (humanTimerRef.current) clearInterval(humanTimerRef.current);
        setFinished(true);
        setRacing(false);
      } else if (h >= Math.max(Math.ceil(additionCount * 0.05), 5)) {
        if (humanTimerRef.current) clearInterval(humanTimerRef.current);
        setFinished(true);
        setRacing(false);
      }
    }, 200);
  }, [racing, additionCount]);

  const resetRace = useCallback(() => {
    if (humanTimerRef.current) clearInterval(humanTimerRef.current);
    setHumanCount(0);
    setComputerCount(0);
    setRacing(false);
    setFinished(false);
  }, []);

  useEffect(() => {
    return () => {
      if (humanTimerRef.current) clearInterval(humanTimerRef.current);
    };
  }, []);

  const barWidth = 380;
  const barHeight = 36;
  const humanPct = additionCount > 0 ? Math.min(humanCount / additionCount, 1) : 0;
  const computerPct = additionCount > 0 ? Math.min(computerCount / additionCount, 1) : 0;

  return (
    <div className="space-y-4">
      <RikuSays>
        Here&apos;s where machines get scary-good: <b>speed</b>. You and me? We can add maybe one pair of numbers per second. A modern chip does <i>billions</i>. Race a computer and see who blinks first - spoiler, it&apos;s you.
      </RikuSays>

      <div className="card-sketchy space-y-2">
        <label className="block font-hand text-sm" style={{ color: INK }}>
          Number of additions: <span style={{ color: CORAL, fontWeight: 700 }}>{additionCount.toLocaleString()}</span>
        </label>
        <input
          type="range" min={0} max={100} step={1}
          value={sliderValue} onChange={handleSlider} disabled={racing}
          className="w-full" style={{ accentColor: CORAL }}
        />
        <div className="flex justify-between font-hand text-xs" style={{ color: INK }}>
          <span>10</span><span>10,000</span>
        </div>
      </div>

      <svg viewBox={`0 0 540 180`} className="w-full max-w-[540px] mx-auto">
        <defs>
          <pattern id="paper-grid-3" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M14 0H0V14" fill="none" stroke="#e8e3d3" strokeWidth="0.6" />
          </pattern>
          <linearGradient id="human-fill" x1="0" x2="1">
            <stop offset="0" stopColor={SKY} /><stop offset="1" stopColor={LAVENDER} />
          </linearGradient>
          <linearGradient id="comp-fill" x1="0" x2="1">
            <stop offset="0" stopColor={MINT} /><stop offset="1" stopColor={YELLOW} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="540" height="180" fill="url(#paper-grid-3)" />

        <text x={10} y={28} fill={INK} style={{ fontFamily: "Patrick Hand, cursive", fontSize: 14, letterSpacing: 1 }}>HUMAN</text>
        <text x={10} y={62} style={{ fontSize: 22 }}>🧑</text>
        <rect x={50} y={38} width={barWidth} height={barHeight} rx={8} fill={PAPER} stroke={INK} strokeWidth={2}
          style={{ filter: "drop-shadow(2px 2px 0 #2b2a35)" }} />
        <rect x={50} y={38} width={Math.max(humanPct * barWidth, 0)} height={barHeight} rx={8}
          fill="url(#human-fill)" stroke={INK} strokeWidth={1.5}
          style={{ transition: "width 0.2s" }} />
        <text x={barWidth + 60} y={62} fill={INK} style={{ fontFamily: "Kalam, cursive", fontSize: 13, fontWeight: 700 }}>
          {humanCount.toLocaleString()}
        </text>

        <text x={10} y={108} fill={INK} style={{ fontFamily: "Patrick Hand, cursive", fontSize: 14, letterSpacing: 1 }}>COMPUTER</text>
        <text x={10} y={142} style={{ fontSize: 22 }}>💻</text>
        <rect x={50} y={118} width={barWidth} height={barHeight} rx={8} fill={PAPER} stroke={INK} strokeWidth={2}
          style={{ filter: "drop-shadow(2px 2px 0 #2b2a35)" }} />
        <rect x={50} y={118} width={Math.max(computerPct * barWidth, 0)} height={barHeight} rx={8}
          fill="url(#comp-fill)" stroke={INK} strokeWidth={1.5}
          style={{ transition: "width 0.25s ease-out" }} />
        {racing && computerCount > 0 && (
          <circle cx={50 + computerPct * barWidth} cy={136} r={6} fill={YELLOW} stroke={INK} strokeWidth={1.5}>
            <animate attributeName="r" values="4;9;4" dur="0.6s" repeatCount="indefinite" />
          </circle>
        )}
        <text x={barWidth + 60} y={142} fill={INK} style={{ fontFamily: "Kalam, cursive", fontSize: 13, fontWeight: 700 }}>
          {computerCount.toLocaleString()}{computerCount === additionCount && computerCount > 0 ? " ✓" : ""}
        </text>
      </svg>

      <div className="flex gap-2 justify-center">
        <button onClick={startRace} disabled={racing} className="btn-sketchy font-hand"
          style={{ background: MINT, opacity: racing ? 0.5 : 1 }}>
          🏁 Start Race!
        </button>
        <button onClick={resetRace} className="btn-sketchy-outline font-hand">Reset</button>
      </div>

      {finished && (
        <div className="card-sketchy text-center font-hand text-base" style={{ background: "#fffbe6" }}>
          The computer finished{" "}
          <span style={{ color: CORAL, fontWeight: 700 }}>{additionCount.toLocaleString()}</span>{" "}
          additions while you were watching! Modern computers do{" "}
          <span style={{ color: LAVENDER, fontWeight: 700 }}>BILLIONS</span> of calculations per second.
        </div>
      )}

      <InfoBox variant="green">
        A modern computer can do billions of calculations per second. That is faster than you can blink!
      </InfoBox>

      <RikuSays>
        This is the superpower that makes ML possible. Training a model means doing <i>trillions</i> of tiny sums. A human with a pencil would need several lifetimes. A GPU does it over lunch.
      </RikuSays>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 4 – Real World Examples                                        */
/* ------------------------------------------------------------------ */

const EXAMPLES: {
  emoji: string;
  name: string;
  input: string;
  rule: string;
  output: string;
  story: string;
  color: string;
}[] = [
  {
    emoji: "🥤",
    name: "Vending Machine",
    input: "Press B4 + insert ₹20",
    rule: "If money ≥ price, drop item B4",
    output: "Cold drink falls out",
    story: "Same button, same coins, same drink - every single time. Aru tested it five times in a row!",
    color: CORAL,
  },
  {
    emoji: "🧮",
    name: "Calculator",
    input: "Type 7 × 8",
    rule: "Multiply the two numbers",
    output: "Shows 56",
    story: "It doesn't 'know' math - it just follows the multiplication instruction perfectly, billions of times.",
    color: MINT,
  },
  {
    emoji: "🚦",
    name: "Traffic Light",
    input: "30-second timer tick",
    rule: "Green → Yellow → Red → loop",
    output: "Lights change color",
    story: "No human stands there flipping switches. It's a tiny machine following 3 instructions in a loop, forever.",
    color: YELLOW,
  },
  {
    emoji: "🧺",
    name: "Washing Machine",
    input: "Clothes + soap + 'Cotton' button",
    rule: "Fill → wash 30min → rinse → spin → drain",
    output: "Clean wet clothes",
    story: "Press the same button with the same load - you'll get the exact same wash cycle, perfectly repeated.",
    color: SKY,
  },
  {
    emoji: "🏧",
    name: "ATM",
    input: "Card + PIN + ₹500",
    rule: "If PIN ok and balance ≥ ₹500, dispense",
    output: "₹500 in cash",
    story: "An ATM is a machine that follows a checklist. No checklist passes? No money. Every. Single. Time.",
    color: LAVENDER,
  },
  {
    emoji: "📷",
    name: "Camera",
    input: "Press shutter button",
    rule: "Capture light from sensor → save as image",
    output: "A new photo file",
    story: "Same scene, same settings → same picture. The machine doesn't decide what's pretty - it just records.",
    color: PEACH,
  },
];

function ExamplesTab() {
  return (
    <div className="space-y-4">
      <RikuSays>
        Once you see the <b>input → rule → output</b> pattern, you can&apos;t un-see it. Microwaves, ATMs, traffic lights - they&apos;re all the same idea in different plastic shells.
      </RikuSays>

      <p className="text-center font-hand text-base" style={{ color: INK }}>
        Look around - machines are everywhere! Each one is just{" "}
        <span style={{ color: CORAL, fontWeight: 700 }}>input</span> →{" "}
        <span style={{ color: LAVENDER, fontWeight: 700 }}>rule</span> →{" "}
        <span style={{ color: MINT, fontWeight: 700 }}>output</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EXAMPLES.map((ex) => (
          <div
            key={ex.name}
            className="card-sketchy overflow-hidden p-4"
            style={{ transition: "transform .2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translate(-2px,-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
          >
            <div
              style={{
                height: 6,
                background: ex.color,
                margin: "-16px -16px 12px -16px",
                borderBottom: `2px solid ${INK}`,
              }}
            />
            <div className="flex items-center gap-3 mb-2">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 52,
                  height: 52,
                  background: ex.color,
                  border: `2px solid ${INK}`,
                  boxShadow: "3px 3px 0 #2b2a35",
                  fontSize: 28,
                }}
              >
                {ex.emoji}
              </div>
              <h3 className="font-hand text-lg font-bold" style={{ color: INK }}>
                {ex.name}
              </h3>
            </div>

            <div className="space-y-1.5 font-hand text-sm" style={{ color: INK }}>
              <div className="flex gap-2">
                <span
                  className="px-1.5 rounded"
                  style={{ background: CORAL, color: PAPER, fontSize: 10, fontWeight: 700 }}
                >
                  IN
                </span>
                <span>{ex.input}</span>
              </div>
              <div className="flex gap-2">
                <span
                  className="px-1.5 rounded"
                  style={{ background: LAVENDER, color: PAPER, fontSize: 10, fontWeight: 700 }}
                >
                  RULE
                </span>
                <span>{ex.rule}</span>
              </div>
              <div className="flex gap-2">
                <span
                  className="px-1.5 rounded"
                  style={{ background: MINT, color: PAPER, fontSize: 10, fontWeight: 700 }}
                >
                  OUT
                </span>
                <span>{ex.output}</span>
              </div>
            </div>

            <div
              className="mt-3 pt-2 font-hand text-xs italic"
              style={{ color: INK, opacity: 0.75, borderTop: "1.5px dashed #2b2a35" }}
            >
              {ex.story}
            </div>
          </div>
        ))}
      </div>

      <InfoBox variant="blue">
        Pick any object near you - a fan, a microwave, a doorbell. Can you write down its{" "}
        <b>input</b>, <b>rule</b>, and <b>output</b>? That's the secret of every machine in the world.
      </InfoBox>

      <RikuSays>
        Next up: what makes a <i>computer</i> special among all these machines? Spoiler: it&apos;s the only machine that can be re-programmed to become a totally different machine, just by swapping its instructions.
      </RikuSays>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What does a machine need to work?",
    options: ["Just electricity", "Instructions and an input", "Only buttons", "A screen"],
    correctIndex: 1,
    explanation:
      "Every machine needs something to work with (input) and rules to follow (instructions) to produce a result (output).",
  },
  {
    question: "If you swap two instructions in a sequence, will you always get the same result?",
    options: ["Yes, always", "No, the order matters", "Only sometimes", "Instructions cannot be swapped"],
    correctIndex: 1,
    explanation:
      "Order matters! Moving right then down is different from moving down then right - you end up in a different place.",
  },
  {
    question: "About how many calculations can a modern computer do per second?",
    options: ["Hundreds", "Thousands", "Millions", "Billions"],
    correctIndex: 3,
    explanation: "Modern computers can perform billions of calculations per second - much faster than any human!",
  },
  {
    question: "What happens if you give a machine the same input and the same rule twice?",
    options: ["Different output each time", "The same output both times", "The machine breaks", "It depends on the weather"],
    correctIndex: 1,
    explanation:
      "Machines are deterministic - the same input with the same rule always produces the same output.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function L1_MachinesActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "input-output",
        label: "Input-Output Machine",
        icon: <Box className="w-4 h-4" />,
        content: <InputOutputTab />,
      },
      {
        id: "instruction-sequence",
        label: "Instruction Sequence",
        icon: <ListOrdered className="w-4 h-4" />,
        content: <InstructionSequenceTab />,
      },
      {
        id: "speed",
        label: "Speed of Computers",
        icon: <Zap className="w-4 h-4" />,
        content: <SpeedTab />,
      },
      {
        id: "examples",
        label: "Real World Examples",
        icon: <Sparkles className="w-4 h-4" />,
        content: <ExamplesTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Machines That Follow Instructions"
      level={1}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You've seen that machines follow instructions. But what kind of machine is a computer, really? Let's find out in the next lesson!"
      story={
        <StorySection
          paragraphs={[
            "Aru was standing in front of a vending machine at the mall, watching it work. She pressed B4, and out came a bag of chips. She pressed B4 again - same chips. Every single time.",
            "Aru: \"How does it know what to give me? Does someone sit inside and hand things out?\"",
            "Byte: \"Ha! No one is inside. The machine follows instructions - simple rules like 'if someone presses B4, drop the item from slot B4.' It doesn't think. It just follows the steps, every time, perfectly.\"",
            "Aru: \"So every machine is just... following instructions?\"",
            "Byte: \"Exactly! A washing machine, a calculator, even a traffic light - they all follow a set of instructions. And that's what we're going to explore today.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A machine is anything that takes an input, follows a set of instructions, and produces an output. The same input + same instructions = same output, every time. This predictability is what makes machines so reliable."
        />
      }
    />
  );
}
