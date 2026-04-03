import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Box, ListOrdered, Zap } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";

/* ------------------------------------------------------------------ */
/*  Tab 1 – Input-Output Machine                                      */
/* ------------------------------------------------------------------ */

const INPUTS = [
  { label: "Number 5", value: 5, color: "#3b82f6" },
  { label: "Number 12", value: 12, color: "#8b5cf6" },
  { label: "Number 7", value: 7, color: "#06b6d4" },
  { label: "Number 20", value: 20, color: "#f59e0b" },
];

const RULES: { label: string; fn: (n: number) => number }[] = [
  { label: "Double it", fn: (n) => n * 2 },
  { label: "Add 10", fn: (n) => n + 10 },
  { label: "Square it", fn: (n) => n * n },
  { label: "Subtract 3", fn: (n) => n - 3 },
];

function InputOutputTab() {
  const [selectedInput, setSelectedInput] = useState<number | null>(null);
  const [selectedRule, setSelectedRule] = useState<number>(0);
  const [output, setOutput] = useState<number | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleProcess = useCallback(() => {
    if (selectedInput === null) return;
    setProcessing(true);
    setShowOutput(false);
    setOutput(null);
    setTimeout(() => {
      const result = RULES[selectedRule].fn(INPUTS[selectedInput].value);
      setOutput(result);
      setProcessing(false);
      // small delay so the fade-in is visible
      requestAnimationFrame(() => setShowOutput(true));
    }, 600);
  }, [selectedInput, selectedRule]);

  const handleReset = useCallback(() => {
    setSelectedInput(null);
    setSelectedRule(0);
    setOutput(null);
    setShowOutput(false);
    setProcessing(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Rule selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {RULES.map((r, i) => (
          <button
            key={r.label}
            onClick={() => {
              setSelectedRule(i);
              setOutput(null);
              setShowOutput(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 border ${
              selectedRule === i
                ? "bg-indigo-600 text-white border-indigo-600 shadow"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* SVG machine diagram */}
      <svg viewBox="0 0 560 220" className="w-full max-w-[560px] mx-auto">
        {/* Input cards (left) */}
        {INPUTS.map((inp, i) => {
          const y = 20 + i * 50;
          const active = selectedInput === i;
          return (
            <g
              key={inp.label}
              onClick={() => {
                setSelectedInput(i);
                setOutput(null);
                setShowOutput(false);
              }}
              className="cursor-pointer"
            >
              <rect
                x={10}
                y={y}
                width={100}
                height={38}
                rx={8}
                fill={active ? inp.color : "#f8fafc"}
                stroke={active ? inp.color : "#cbd5e1"}
                strokeWidth={active ? 2 : 1}
                className="transition-all duration-300"
              />
              <text
                x={60}
                y={y + 23}
                textAnchor="middle"
                className={`text-[12px] font-semibold ${active ? "fill-white" : "fill-slate-700"}`}
                style={{ transition: "fill 0.3s" }}
              >
                {inp.label}
              </text>
            </g>
          );
        })}

        {/* Arrow from inputs to machine */}
        <line x1={120} y1={110} x2={185} y2={110} stroke="#94a3b8" strokeWidth={2} markerEnd="url(#arrowhead)" />

        {/* Machine box */}
        <rect x={190} y={50} width={160} height={120} rx={16} fill="#1e293b" stroke="#334155" strokeWidth={2} />
        {/* Gear decoration */}
        <circle cx={270} cy={110} r={28} fill="none" stroke="#475569" strokeWidth={2} strokeDasharray="6 4" />
        <circle cx={270} cy={110} r={14} fill="#475569" />
        <text x={270} y={115} textAnchor="middle" className="text-[11px] fill-slate-300 font-bold">
          {RULES[selectedRule].label}
        </text>
        <text x={270} y={62} textAnchor="middle" className="text-[9px] fill-slate-400 font-medium uppercase tracking-wider">
          Machine
        </text>

        {/* Arrow from machine to output */}
        <line x1={355} y1={110} x2={420} y2={110} stroke="#94a3b8" strokeWidth={2} markerEnd="url(#arrowhead)" />

        {/* Output area */}
        <rect
          x={425}
          y={70}
          width={120}
          height={80}
          rx={12}
          fill={showOutput ? "#ecfdf5" : "#f8fafc"}
          stroke={showOutput ? "#34d399" : "#cbd5e1"}
          strokeWidth={showOutput ? 2 : 1}
          className="transition-all duration-500"
        />
        {processing && (
          <text x={485} y={115} textAnchor="middle" className="text-[13px] fill-slate-400 font-medium">
            ...
          </text>
        )}
        {output !== null && (
          <text
            x={485}
            y={115}
            textAnchor="middle"
            className="text-[22px] fill-green-700 font-bold"
            style={{
              opacity: showOutput ? 1 : 0,
              transition: "opacity 0.5s ease-in",
            }}
          >
            {output}
          </text>
        )}
        <text x={485} y={85} textAnchor="middle" className="text-[9px] fill-slate-400 font-medium uppercase tracking-wider">
          Output
        </text>

        {/* Arrow marker definition */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#94a3b8" />
          </marker>
        </defs>
      </svg>

      {/* Result text */}
      {output !== null && selectedInput !== null && showOutput && (
        <div className="text-center text-sm font-medium text-slate-700 bg-slate-50 rounded-lg py-2 px-4 border border-slate-200 transition-all duration-300">
          Input: <span className="text-blue-600">{INPUTS[selectedInput].value}</span> &rarr; Rule:{" "}
          <span className="text-indigo-600">{RULES[selectedRule].label}</span> &rarr; Output:{" "}
          <span className="text-green-600 font-bold">{output}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleProcess}
          disabled={selectedInput === null || processing}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          {processing ? "Processing..." : "Process"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300"
        >
          Reset
        </button>
      </div>

      <InfoBox variant="blue">
        A machine takes something in, does something to it, and gives something back. Every time you give it the same
        input with the same rule, you get the same output!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Instruction Sequence (Robot Grid)                          */
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

function InstructionSequenceTab() {
  const [instructions, setInstructions] = useState<Direction[]>([]);
  const [robotPos, setRobotPos] = useState<[number, number]>([0, 0]);
  const [visited, setVisited] = useState<Set<string>>(new Set(["0,0"]));
  const [running, setRunning] = useState(false);
  const [execIndex, setExecIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const runTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const starPos: [number, number] = [5, 5];
  const svgW = GRID_SIZE * CELL + GRID_PAD * 2;
  const svgH = GRID_SIZE * CELL + GRID_PAD * 2;

  const addInstruction = useCallback(
    (dir: Direction) => {
      if (running) return;
      setInstructions((prev) => [...prev, dir]);
      setMessage(null);
    },
    [running],
  );

  const clearAll = useCallback(() => {
    if (runTimerRef.current) clearTimeout(runTimerRef.current);
    setInstructions([]);
    setRobotPos([0, 0]);
    setVisited(new Set(["0,0"]));
    setRunning(false);
    setExecIndex(0);
    setMessage(null);
  }, []);

  const executeStep = useCallback(
    (pos: [number, number], vis: Set<string>, idx: number, instrs: Direction[]): boolean => {
      if (idx >= instrs.length) {
        setRunning(false);
        if (pos[0] === starPos[0] && pos[1] === starPos[1]) {
          setMessage("You reached the star! Great job!");
        }
        return false;
      }
      const dir = instrs[idx];
      const [dx, dy] = DIR_DELTAS[dir];
      const nx = pos[0] + dx;
      const ny = pos[1] + dy;
      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) {
        setMessage("Oops! The robot went off the grid. Try again!");
        setRunning(false);
        return false;
      }
      const newPos: [number, number] = [nx, ny];
      const newVis = new Set(vis);
      newVis.add(`${nx},${ny}`);
      setRobotPos(newPos);
      setVisited(newVis);
      setExecIndex(idx + 1);
      if (nx === starPos[0] && ny === starPos[1]) {
        setMessage("You reached the star! Great job!");
        setRunning(false);
        return false;
      }
      return true; // can continue
    },
    [starPos],
  );

  const handleStep = useCallback(() => {
    if (running) return;
    setMessage(null);
    executeStep(robotPos, visited, execIndex, instructions);
  }, [running, robotPos, visited, execIndex, instructions, executeStep]);

  const handleRun = useCallback(() => {
    if (running || instructions.length === 0) return;
    setMessage(null);
    // Reset position before run
    let pos: [number, number] = [0, 0];
    let vis = new Set(["0,0"]);
    let idx = 0;
    setRobotPos(pos);
    setVisited(vis);
    setExecIndex(0);
    setRunning(true);

    const tick = () => {
      if (idx >= instructions.length) {
        setRunning(false);
        if (pos[0] === starPos[0] && pos[1] === starPos[1]) {
          setMessage("You reached the star! Great job!");
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
        return;
      }
      pos = [nx, ny];
      vis = new Set(vis);
      vis.add(`${nx},${ny}`);
      idx++;
      setRobotPos([...pos] as [number, number]);
      setVisited(new Set(vis));
      setExecIndex(idx);
      if (nx === starPos[0] && ny === starPos[1]) {
        setMessage("You reached the star! Great job!");
        setRunning(false);
        return;
      }
      runTimerRef.current = setTimeout(tick, 200);
    };
    runTimerRef.current = setTimeout(tick, 200);
  }, [running, instructions, starPos]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (runTimerRef.current) clearTimeout(runTimerRef.current);
    };
  }, []);

  const dirButtons: { dir: Direction; label: string }[] = [
    { dir: "right", label: "Move Right" },
    { dir: "down", label: "Move Down" },
    { dir: "left", label: "Move Left" },
    { dir: "up", label: "Move Up" },
  ];

  return (
    <div className="space-y-4">
      {/* SVG Grid */}
      <div className="flex justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxWidth: svgW }}>
          {/* Grid cells */}
          {Array.from({ length: GRID_SIZE }, (_, row) =>
            Array.from({ length: GRID_SIZE }, (_, col) => {
              const x = GRID_PAD + col * CELL;
              const y = GRID_PAD + row * CELL;
              const key = `${col},${row}`;
              const isVisited = visited.has(key);
              const isRobot = robotPos[0] === col && robotPos[1] === row;
              const isStar = col === starPos[0] && row === starPos[1];
              return (
                <g key={key}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    fill={isRobot ? "#3b82f6" : isVisited ? "#bbf7d0" : "#f8fafc"}
                    stroke="#cbd5e1"
                    strokeWidth={1}
                    rx={4}
                    className="transition-all duration-200"
                  />
                  {isStar && !isRobot && (
                    <text x={x + CELL / 2} y={y + CELL / 2 + 6} textAnchor="middle" className="text-[20px]">
                      &#9733;
                    </text>
                  )}
                  {isRobot && (
                    <text x={x + CELL / 2} y={y + CELL / 2 + 7} textAnchor="middle" className="text-[22px]">
                      &#129302;
                    </text>
                  )}
                </g>
              );
            }),
          )}
        </svg>
      </div>

      {/* Step counter */}
      <p className="text-center text-sm font-medium text-slate-600">
        Steps: <span className="font-bold text-slate-800">{execIndex}</span>
      </p>

      {/* Direction buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {dirButtons.map((b) => (
          <button
            key={b.dir}
            onClick={() => addInstruction(b.dir)}
            disabled={running}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Instruction list */}
      {instructions.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-medium text-slate-500 mb-1.5">Instruction List:</p>
          <div className="flex flex-wrap gap-1">
            {instructions.map((dir, i) => (
              <span
                key={i}
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-all duration-200 ${
                  i < execIndex
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : i === execIndex && running
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {dir}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Control buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={running || instructions.length === 0}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          Run
        </button>
        <button
          onClick={handleStep}
          disabled={running || execIndex >= instructions.length}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          Step
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300"
        >
          Clear
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`text-center text-sm font-semibold rounded-lg py-2 px-4 border transition-all duration-300 ${
            message.includes("star")
              ? "bg-green-50 border-green-300 text-green-700"
              : "bg-red-50 border-red-300 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <InfoBox variant="amber">
        Order matters! The robot follows your instructions exactly, one at a time. Try different paths to reach the star!
      </InfoBox>
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

  // Log-scale slider: map 0..100 -> 10..10000
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
    setHumanCount(0);
    setComputerCount(0);
    setFinished(false);
    setRacing(true);

    // Computer finishes "instantly" (after a tiny delay for drama)
    setTimeout(() => {
      setComputerCount(additionCount);
    }, 150);

    // Human does ~5 per second
    let h = 0;
    humanTimerRef.current = setInterval(() => {
      h += 1;
      setHumanCount(h);
      // Stop human when they reach ~5% or 50, whichever is bigger, or if they somehow finish
      if (h >= additionCount) {
        if (humanTimerRef.current) clearInterval(humanTimerRef.current);
        setFinished(true);
        setRacing(false);
      } else if (h >= Math.max(Math.ceil(additionCount * 0.05), 5)) {
        if (humanTimerRef.current) clearInterval(humanTimerRef.current);
        setFinished(true);
        setRacing(false);
      }
    }, 200); // 5 per second
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
  const barHeight = 32;
  const humanPct = additionCount > 0 ? Math.min(humanCount / additionCount, 1) : 0;
  const computerPct = additionCount > 0 ? Math.min(computerCount / additionCount, 1) : 0;

  return (
    <div className="space-y-4">
      {/* Slider */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600">
          Number of additions: <span className="font-bold text-slate-800">{additionCount.toLocaleString()}</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={sliderValue}
          onChange={handleSlider}
          disabled={racing}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>10</span>
          <span>10,000</span>
        </div>
      </div>

      {/* Race SVG */}
      <svg viewBox={`0 0 520 160`} className="w-full max-w-[520px] mx-auto">
        {/* Human row */}
        <text x={10} y={30} className="text-[13px] fill-slate-700 font-semibold">
          Human
        </text>
        {/* person icon placeholder */}
        <text x={10} y={52} className="text-[18px]">
          &#128100;
        </text>
        <rect x={40} y={38} width={barWidth} height={barHeight} rx={6} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1} />
        <rect
          x={40}
          y={38}
          width={Math.max(humanPct * barWidth, 0)}
          height={barHeight}
          rx={6}
          fill="#60a5fa"
          className="transition-all duration-200"
        />
        <text x={barWidth + 50} y={60} className="text-[11px] fill-slate-600 font-mono font-semibold">
          {humanCount.toLocaleString()}/{additionCount.toLocaleString()}
        </text>

        {/* Computer row */}
        <text x={10} y={100} className="text-[13px] fill-slate-700 font-semibold">
          Computer
        </text>
        {/* CPU icon placeholder */}
        <text x={10} y={122} className="text-[18px]">
          &#128187;
        </text>
        <rect x={40} y={108} width={barWidth} height={barHeight} rx={6} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1} />
        <rect
          x={40}
          y={108}
          width={Math.max(computerPct * barWidth, 0)}
          height={barHeight}
          rx={6}
          fill="#34d399"
          className="transition-all duration-200"
        />
        <text x={barWidth + 50} y={130} className="text-[11px] fill-slate-600 font-mono font-semibold">
          {computerCount.toLocaleString()}/{additionCount.toLocaleString()}
          {computerCount === additionCount && computerCount > 0 ? " DONE!" : ""}
        </text>
      </svg>

      {/* Buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={startRace}
          disabled={racing}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          Start Race!
        </button>
        <button
          onClick={resetRace}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300"
        >
          Reset
        </button>
      </div>

      {/* Result message */}
      {finished && (
        <div className="text-center text-sm font-medium text-slate-700 bg-indigo-50 border border-indigo-200 rounded-lg py-3 px-4 transition-all duration-300">
          The computer finished{" "}
          <span className="font-bold text-indigo-700">{additionCount.toLocaleString()}</span> additions while you were
          watching! A modern computer can do <span className="font-bold text-indigo-700">BILLIONS</span> of calculations
          per second.
        </div>
      )}

      <InfoBox variant="green">
        A modern computer can do billions of calculations per second. That is faster than you can blink!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
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
      "Order matters! Moving right then down is different from moving down then right — you end up in a different place.",
  },
  {
    question: "About how many calculations can a modern computer do per second?",
    options: ["Hundreds", "Thousands", "Millions", "Billions"],
    correctIndex: 3,
    explanation: "Modern computers can perform billions of calculations per second — much faster than any human!",
  },
  {
    question: "What happens if you give a machine the same input and the same rule twice?",
    options: ["Different output each time", "The same output both times", "The machine breaks", "It depends on the weather"],
    correctIndex: 1,
    explanation:
      "Machines are deterministic — the same input with the same rule always produces the same output.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
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
            "Aru was standing in front of a vending machine at the mall, watching it work. She pressed B4, and out came a bag of chips. She pressed B4 again — same chips. Every single time.",
            "Aru: \"How does it know what to give me? Does someone sit inside and hand things out?\"",
            "Byte: \"Ha! No one is inside. The machine follows instructions — simple rules like 'if someone presses B4, drop the item from slot B4.' It doesn't think. It just follows the steps, every time, perfectly.\"",
            "Aru: \"So every machine is just... following instructions?\"",
            "Byte: \"Exactly! A washing machine, a calculator, even a traffic light — they all follow a set of instructions. And that's what we're going to explore today.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A machine is anything that takes an input, follows a set of instructions, and produces an output. The same input + same instructions = same output, every time. This predictability is what makes machines so reliable."
        />
      }
    />
  );
}
