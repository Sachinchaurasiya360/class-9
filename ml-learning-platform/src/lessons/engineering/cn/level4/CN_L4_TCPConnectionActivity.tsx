"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Network, XCircle, LayoutGrid, Play, RotateCcw, Info } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas,
  PseudocodePanel,
  VariablesPanel,
  InputEditor,
  useStepPlayer,
} from "@/components/engineering/algo";

/* ================================================================== */
/*  Shared constants                                                   */
/* ================================================================== */

const PRIMARY = "var(--eng-primary)";
const DANGER = "var(--eng-danger)";
const WARNING = "var(--eng-warning)";
const TEXT = "var(--eng-text)";
const MUTED = "var(--eng-text-muted)";
const BORDER = "var(--eng-border)";
const FONT = "var(--eng-font)";

/* ================================================================== */
/*  Tab 1 - TCP 3-Way Handshake (AlgoCanvas)                          */
/* ================================================================== */

type HSState = "CLOSED" | "LISTEN" | "SYN_SENT" | "SYN_RCVD" | "ESTABLISHED";

interface HSMessage {
  label: string;
  fromSide: "C" | "S";
  toSide: "C" | "S";
  y: number;
  color: string;
  seq: number;
  ack: number;
  flags: string;
  lost?: boolean;
  retransmit?: boolean;
}

interface HandshakeFrame {
  line: number;
  vars: Record<string, string | number | boolean | undefined>;
  message: string;
  clientState: HSState;
  serverState: HSState;
  messages: HSMessage[];     // messages drawn so far
  activeMsgIdx: number | null; // which msg is currently flying
  isn_c: number | null;
  isn_s: number | null;
  flashKeys?: string[];
}

const HS_PSEUDO = [
  "// Client                        Server",
  "CLOSED                           LISTEN",
  "send SYN(seq=ISN_c)              (wait)",
  "SYN_SENT                         recv SYN → SYN_RCVD",
  "                                 send SYN(seq=ISN_s) + ACK(=ISN_c+1)",
  "recv SYN-ACK                     SYN_RCVD",
  "send ACK(=ISN_s+1)               recv ACK",
  "ESTABLISHED                      ESTABLISHED",
];

function buildHandshakeFrames(isnC: number, isnS: number, scenario: "normal" | "synloss"): HandshakeFrame[] {
  const frames: HandshakeFrame[] = [];
  const msgs: HSMessage[] = [];

  // Frame 0 - initial state
  frames.push({
    line: 1,
    vars: { "client state": "CLOSED", "server state": "LISTEN" },
    message: "Server is passively listening on a port. Client is closed but about to connect.",
    clientState: "CLOSED",
    serverState: "LISTEN",
    messages: [],
    activeMsgIdx: null,
    isn_c: isnC,
    isn_s: isnS,
  });

  if (scenario === "synloss") {
    // First SYN is lost
    const lostSyn: HSMessage = {
      label: "SYN",
      fromSide: "C",
      toSide: "S",
      y: 110,
      color: "#3b82f6",
      seq: isnC,
      ack: 0,
      flags: "SYN",
      lost: true,
    };
    msgs.push(lostSyn);
    frames.push({
      line: 2,
      vars: { "ISN_c": isnC, flags: "SYN", seq: isnC },
      message: `Client sends SYN with ISN_c=${isnC} ... but it is LOST in transit!`,
      clientState: "SYN_SENT",
      serverState: "LISTEN",
      messages: msgs.slice(),
      activeMsgIdx: 0,
      isn_c: isnC,
      isn_s: isnS,
      flashKeys: ["ISN_c"],
    });

    frames.push({
      line: 2,
      vars: { "timeout": "elapsed", action: "retransmit" },
      message: "No SYN-ACK arrives. Client retransmit timer expires - resend the SYN.",
      clientState: "SYN_SENT",
      serverState: "LISTEN",
      messages: msgs.slice(),
      activeMsgIdx: null,
      isn_c: isnC,
      isn_s: isnS,
      flashKeys: ["timeout"],
    });

    // Retransmitted SYN
    const reSyn: HSMessage = {
      label: "SYN (retx)",
      fromSide: "C",
      toSide: "S",
      y: 170,
      color: "#3b82f6",
      seq: isnC,
      ack: 0,
      flags: "SYN",
      retransmit: true,
    };
    msgs.push(reSyn);
    frames.push({
      line: 2,
      vars: { "ISN_c": isnC, flags: "SYN", retx: true },
      message: `Retransmitted SYN reaches the server this time.`,
      clientState: "SYN_SENT",
      serverState: "SYN_RCVD",
      messages: msgs.slice(),
      activeMsgIdx: msgs.length - 1,
      isn_c: isnC,
      isn_s: isnS,
    });

    // SYN-ACK
    const synAck: HSMessage = {
      label: "SYN-ACK",
      fromSide: "S",
      toSide: "C",
      y: 230,
      color: "#8b5cf6",
      seq: isnS,
      ack: isnC + 1,
      flags: "SYN, ACK",
    };
    msgs.push(synAck);
    frames.push({
      line: 4,
      vars: { "ISN_s": isnS, ack: isnC + 1, flags: "SYN, ACK" },
      message: `Server replies SYN-ACK: seq=ISN_s=${isnS}, ack=ISN_c+1=${isnC + 1}. It tells the client "I got your SYN, and here's mine".`,
      clientState: "SYN_SENT",
      serverState: "SYN_RCVD",
      messages: msgs.slice(),
      activeMsgIdx: msgs.length - 1,
      isn_c: isnC,
      isn_s: isnS,
      flashKeys: ["ISN_s", "ack"],
    });

    // Final ACK
    const ack: HSMessage = {
      label: "ACK",
      fromSide: "C",
      toSide: "S",
      y: 290,
      color: "#10b981",
      seq: isnC + 1,
      ack: isnS + 1,
      flags: "ACK",
    };
    msgs.push(ack);
    frames.push({
      line: 6,
      vars: { seq: isnC + 1, ack: isnS + 1, flags: "ACK" },
      message: `Client sends final ACK: seq=${isnC + 1}, ack=ISN_s+1=${isnS + 1}. Both sides are now ESTABLISHED.`,
      clientState: "ESTABLISHED",
      serverState: "ESTABLISHED",
      messages: msgs.slice(),
      activeMsgIdx: msgs.length - 1,
      isn_c: isnC,
      isn_s: isnS,
      flashKeys: ["seq", "ack"],
    });

    frames.push({
      line: 7,
      vars: { state: "ESTABLISHED", "data can flow": "yes" },
      message: "Connection is ESTABLISHED. Data transfer can begin. The handshake cost was 1 extra RTT due to the lost SYN.",
      clientState: "ESTABLISHED",
      serverState: "ESTABLISHED",
      messages: msgs.slice(),
      activeMsgIdx: null,
      isn_c: isnC,
      isn_s: isnS,
      flashKeys: ["state"],
    });

    return frames;
  }

  // Normal scenario
  const syn: HSMessage = {
    label: "SYN",
    fromSide: "C",
    toSide: "S",
    y: 120,
    color: "#3b82f6",
    seq: isnC,
    ack: 0,
    flags: "SYN",
  };
  msgs.push(syn);
  frames.push({
    line: 2,
    vars: { "ISN_c": isnC, flags: "SYN", seq: isnC },
    message: `Client sends SYN segment with initial sequence number ISN_c=${isnC}. State transitions CLOSED → SYN_SENT.`,
    clientState: "SYN_SENT",
    serverState: "LISTEN",
    messages: msgs.slice(),
    activeMsgIdx: 0,
    isn_c: isnC,
    isn_s: isnS,
    flashKeys: ["ISN_c"],
  });

  frames.push({
    line: 3,
    vars: { "server recv": "SYN", "server state": "SYN_RCVD" },
    message: `Server receives the SYN, allocates state for this connection, and transitions LISTEN → SYN_RCVD.`,
    clientState: "SYN_SENT",
    serverState: "SYN_RCVD",
    messages: msgs.slice(),
    activeMsgIdx: null,
    isn_c: isnC,
    isn_s: isnS,
    flashKeys: ["server state"],
  });

  const synAck: HSMessage = {
    label: "SYN-ACK",
    fromSide: "S",
    toSide: "C",
    y: 200,
    color: "#8b5cf6",
    seq: isnS,
    ack: isnC + 1,
    flags: "SYN, ACK",
  };
  msgs.push(synAck);
  frames.push({
    line: 4,
    vars: {
      "ISN_s": isnS,
      ack: isnC + 1,
      flags: "SYN, ACK",
    },
    message: `Server sends SYN-ACK: seq=ISN_s=${isnS}, ack=ISN_c+1=${isnC + 1} - "I got your SYN (expecting byte ${isnC + 1}), here's mine".`,
    clientState: "SYN_SENT",
    serverState: "SYN_RCVD",
    messages: msgs.slice(),
    activeMsgIdx: msgs.length - 1,
    isn_c: isnC,
    isn_s: isnS,
    flashKeys: ["ISN_s", "ack"],
  });

  frames.push({
    line: 5,
    vars: { "client recv": "SYN-ACK", "validates": `ack == ISN_c+1 == ${isnC + 1}` },
    message: `Client receives SYN-ACK, validates the ack number matches ISN_c+1. Good - server is the real one we talked to.`,
    clientState: "SYN_SENT",
    serverState: "SYN_RCVD",
    messages: msgs.slice(),
    activeMsgIdx: null,
    isn_c: isnC,
    isn_s: isnS,
  });

  const ack: HSMessage = {
    label: "ACK",
    fromSide: "C",
    toSide: "S",
    y: 280,
    color: "#10b981",
    seq: isnC + 1,
    ack: isnS + 1,
    flags: "ACK",
  };
  msgs.push(ack);
  frames.push({
    line: 6,
    vars: { seq: isnC + 1, ack: isnS + 1, flags: "ACK" },
    message: `Client sends final ACK: seq=ISN_c+1=${isnC + 1}, ack=ISN_s+1=${isnS + 1}. Client transitions SYN_SENT → ESTABLISHED.`,
    clientState: "ESTABLISHED",
    serverState: "SYN_RCVD",
    messages: msgs.slice(),
    activeMsgIdx: msgs.length - 1,
    isn_c: isnC,
    isn_s: isnS,
    flashKeys: ["seq", "ack"],
  });

  frames.push({
    line: 7,
    vars: { "both states": "ESTABLISHED", "data ready": "yes" },
    message: `Server receives ACK, transitions SYN_RCVD → ESTABLISHED. Both sides are now ready for data transfer.`,
    clientState: "ESTABLISHED",
    serverState: "ESTABLISHED",
    messages: msgs.slice(),
    activeMsgIdx: null,
    isn_c: isnC,
    isn_s: isnS,
    flashKeys: ["both states"],
  });

  return frames;
}

/* ================================================================== */
/*  Handshake Diagram                                                 */
/* ================================================================== */

function HandshakeDiagram({ frame }: { frame: HandshakeFrame }) {
  const clientX = 120;
  const serverX = 480;
  const stateColor: Record<HSState, string> = {
    CLOSED: "#64748b",
    LISTEN: "#64748b",
    SYN_SENT: "#3b82f6",
    SYN_RCVD: "#8b5cf6",
    ESTABLISHED: "#10b981",
  };

  return (
    <div
      style={{
        padding: 14,
        borderRadius: "var(--eng-radius)",
        background: "var(--eng-surface)",
        border: "1px solid var(--eng-border)",
      }}
    >
      <svg viewBox="0 0 600 400" style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto" }}>
        {/* Headers */}
        <text x={clientX} y={28} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>
          Client
        </text>
        <text x={serverX} y={28} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>
          Server
        </text>

        {/* State pills */}
        <g>
          <rect x={clientX - 55} y={40} width={110} height={22} rx={11} fill={stateColor[frame.clientState]} opacity={0.18} stroke={stateColor[frame.clientState]} strokeWidth={1.5} />
          <text x={clientX} y={55} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: stateColor[frame.clientState] }}>
            {frame.clientState}
          </text>
        </g>
        <g>
          <rect x={serverX - 55} y={40} width={110} height={22} rx={11} fill={stateColor[frame.serverState]} opacity={0.18} stroke={stateColor[frame.serverState]} strokeWidth={1.5} />
          <text x={serverX} y={55} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: stateColor[frame.serverState] }}>
            {frame.serverState}
          </text>
        </g>

        {/* Timelines */}
        <line x1={clientX} y1={72} x2={clientX} y2={370} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />
        <line x1={serverX} y1={72} x2={serverX} y2={370} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />
        <circle cx={clientX} cy={72} r={5} fill={PRIMARY} />
        <circle cx={serverX} cy={72} r={5} fill={PRIMARY} />

        {/* Messages */}
        {frame.messages.map((m, i) => {
          const fromX = m.fromSide === "C" ? clientX : serverX;
          const toX = m.toSide === "C" ? clientX : serverX;
          const midX = (fromX + toX) / 2;
          const endX = m.lost ? (fromX + toX) / 2 + 10 : toX;
          const isActive = frame.activeMsgIdx === i;

          return (
            <g key={i}>
              <defs>
                <marker id={`hs-arrow-${i}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={m.color} />
                </marker>
              </defs>
              <line
                x1={fromX}
                y1={m.y}
                x2={endX}
                y2={m.y}
                stroke={m.color}
                strokeWidth={isActive ? 3 : 2}
                strokeDasharray={m.lost ? "8,4" : undefined}
                opacity={m.lost ? 0.6 : 1}
                markerEnd={m.lost ? undefined : `url(#hs-arrow-${i})`}
                style={{ transition: "all 0.3s" }}
              />
              {m.lost && (
                <g>
                  <text x={endX + 4} y={m.y + 2} style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, fill: DANGER }}>
                    X
                  </text>
                  <text x={endX + 4} y={m.y + 16} style={{ fontFamily: FONT, fontSize: 9, fill: DANGER }}>
                    lost
                  </text>
                </g>
              )}
              {/* Label above */}
              <rect
                x={midX - 52}
                y={m.y - 28}
                width={104}
                height={20}
                rx={4}
                fill={m.color}
                opacity={isActive ? 0.3 : 0.14}
              />
              <text x={midX} y={m.y - 14} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: m.color }}>
                {m.label}
              </text>
              {/* seq/ack below */}
              {!m.lost && (
                <text x={midX} y={m.y + 14} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fill: MUTED }}>
                  seq={m.seq}{m.ack ? `, ack=${m.ack}` : ""}
                </text>
              )}
            </g>
          );
        })}

        {/* Established banner */}
        {frame.clientState === "ESTABLISHED" && frame.serverState === "ESTABLISHED" && (
          <g>
            <rect x={150} y={340} width={300} height={34} rx={8} fill="#10b981" opacity={0.18} stroke="#10b981" strokeWidth={2} />
            <text x={300} y={362} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, fill: "#10b981" }}>
              CONNECTION ESTABLISHED
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

/* ================================================================== */
/*  Handshake Tab                                                     */
/* ================================================================== */

function parseIsn(raw: string): { isnC: number; isnS: number; scenario: "normal" | "synloss" } {
  const m = raw.trim().match(/ISN_c\s*=\s*(\d+)\s*,\s*ISN_s\s*=\s*(\d+)(?:\s*,\s*(synloss|normal))?/i);
  if (m) {
    return {
      isnC: Number(m[1]),
      isnS: Number(m[2]),
      scenario: (m[3]?.toLowerCase() as "normal" | "synloss" | undefined) ?? "normal",
    };
  }
  return { isnC: 100, isnS: 300, scenario: "normal" };
}

function HandshakeTab() {
  const [raw, setRaw] = useState("ISN_c=100, ISN_s=300, normal");
  const parsed = useMemo(() => parseIsn(raw), [raw]);
  const frames = useMemo(() => buildHandshakeFrames(parsed.isnC, parsed.isnS, parsed.scenario), [parsed]);
  const player = useStepPlayer(frames);
  const frame = player.current!;

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>
          Step through the TCP 3-way handshake with visible state transitions and sequence numbers. Try the <code>synloss</code> scenario to see retransmission.
        </span>
      </div>

      <AlgoCanvas
        title={`TCP 3-Way Handshake (${parsed.scenario === "synloss" ? "SYN loss + retransmit" : "normal"})`}
        player={player}
        input={
          <InputEditor
            label="ISNs + scenario"
            value={raw}
            onApply={setRaw}
            presets={[
              { label: "normal", value: "ISN_c=100, ISN_s=300, normal" },
              { label: "SYN loss", value: "ISN_c=100, ISN_s=300, synloss" },
              { label: "high ISN", value: "ISN_c=5000, ISN_s=9999, normal" },
            ]}
            placeholder="ISN_c=100, ISN_s=300, normal"
            helper="Format: ISN_c=<n>, ISN_s=<m>, <normal|synloss>"
          />
        }
        pseudocode={<PseudocodePanel lines={HS_PSEUDO} activeLine={frame.line} />}
        variables={<VariablesPanel vars={frame.vars} flashKeys={frame.flashKeys} />}
        status={frame.message}
        legend={
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Swatch color="#3b82f6" label="SYN" />
            <Swatch color="#8b5cf6" label="SYN-ACK" />
            <Swatch color="#10b981" label="ACK / ESTABLISHED" />
          </div>
        }
      >
        <HandshakeDiagram frame={frame} />
      </AlgoCanvas>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: "0.72rem", color: MUTED }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
      {label}
    </span>
  );
}

/* ================================================================== */
/*  Tab 2 -- TCP 4-Way Termination                                     */
/* ================================================================== */

interface TermStep {
  label: string;
  fromX: number;
  toX: number;
  y: number;
  color: string;
  description: string;
}

const TERM_STEPS: TermStep[] = [
  { label: "FIN", fromX: 120, toX: 480, y: 110, color: "#ef4444", description: "Client initiates close with FIN" },
  { label: "ACK", fromX: 480, toX: 120, y: 170, color: "#f59e0b", description: "Server acknowledges the FIN" },
  { label: "FIN", fromX: 480, toX: 120, y: 240, color: "#ef4444", description: "Server sends its own FIN" },
  { label: "ACK", fromX: 120, toX: 480, y: 300, color: "#f59e0b", description: "Client acknowledges -- enters TIME_WAIT" },
];

function TerminationTab() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerVal, setTimerVal] = useState(60);
  const [scenario, setScenario] = useState<"normal" | "synloss" | "simopen">("normal");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    setStep(-1);
    setPlaying(false);
    setShowTimer(false);
    setTimerVal(60);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countRef.current) clearInterval(countRef.current);
  }, []);

  const advance = useCallback(() => {
    setStep((prev) => {
      const next = prev + 1;
      if (next >= TERM_STEPS.length) {
        setPlaying(false);
        setShowTimer(true);
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (playing && step < TERM_STEPS.length - 1) {
      timerRef.current = setTimeout(advance, 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, step, advance]);

  useEffect(() => {
    if (showTimer && timerVal > 0) {
      countRef.current = setInterval(() => {
        setTimerVal((v) => {
          if (v <= 1) {
            if (countRef.current) clearInterval(countRef.current);
            return 0;
          }
          return v - 5;
        });
      }, 200);
    }
    return () => { if (countRef.current) clearInterval(countRef.current); };
  }, [showTimer, timerVal]);

  const handlePlay = () => {
    reset();
    setTimeout(() => { setStep(0); setPlaying(true); }, 100);
  };

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        TCP 4-Way Termination
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        Closing a TCP connection requires four messages. The TIME_WAIT state ensures late packets are handled.
      </p>

      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 12 }}>
        {([["normal", "Normal Close"], ["synloss", "SYN Loss Scenario"], ["simopen", "Simultaneous Open"]] as const).map(([key, label]) => (
          <button
            key={key}
            className={scenario === key ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            onClick={() => { setScenario(key); reset(); }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox="0 0 600 400" style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto" }}>
          <text x={120} y={40} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>
            Client
          </text>
          <text x={480} y={40} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>
            Server
          </text>
          <line x1={120} y1={55} x2={120} y2={380} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />
          <line x1={480} y1={55} x2={480} y2={380} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />
          <circle cx={120} cy={55} r={6} fill={PRIMARY} />
          <circle cx={480} cy={55} r={6} fill={PRIMARY} />

          <text x={30} y={80} style={{ fontFamily: FONT, fontSize: 10, fill: "#10b981" }}>ESTABLISHED</text>
          <text x={510} y={80} style={{ fontFamily: FONT, fontSize: 10, fill: "#10b981" }}>ESTABLISHED</text>

          {scenario === "normal" && TERM_STEPS.map((s, i) => {
            if (i > step) return null;
            const midX = (s.fromX + s.toX) / 2;
            return (
              <g key={i}>
                <defs>
                  <marker id={`tarrow-${i}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill={s.color} />
                  </marker>
                </defs>
                <line x1={s.fromX} y1={s.y} x2={s.toX} y2={s.y} stroke={s.color} strokeWidth={2.5} markerEnd={`url(#tarrow-${i})`} />
                <text x={midX} y={s.y - 8} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, fill: s.color }}>
                  {s.label}
                </text>
              </g>
            );
          })}

          {scenario === "synloss" && (
            <g>
              <text x={300} y={160} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 13, fill: DANGER, fontWeight: 600 }}>
                SYN Lost! Retransmit after timeout
              </text>
              {step >= 0 && (
                <>
                  <line x1={120} y1={130} x2={300} y2={130} stroke="#ef4444" strokeWidth={2} strokeDasharray="8,4" />
                  <text x={310} y={128} style={{ fontFamily: FONT, fontSize: 20, fill: "#ef4444" }}>X</text>
                </>
              )}
              {step >= 1 && (
                <>
                  <defs>
                    <marker id="tarrow-retry" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                    </marker>
                  </defs>
                  <line x1={120} y1={210} x2={480} y2={210} stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#tarrow-retry)" />
                  <text x={300} y={200} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, fill: "#3b82f6" }}>
                    SYN (Retransmit)
                  </text>
                </>
              )}
              {step >= 2 && (
                <>
                  <defs>
                    <marker id="tarrow-synack" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                    </marker>
                  </defs>
                  <line x1={480} y1={270} x2={120} y2={270} stroke="#8b5cf6" strokeWidth={2.5} markerEnd="url(#tarrow-synack)" />
                  <text x={300} y={260} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, fill: "#8b5cf6" }}>
                    SYN-ACK
                  </text>
                </>
              )}
            </g>
          )}

          {scenario === "simopen" && (
            <g>
              <text x={300} y={90} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 12, fill: WARNING, fontWeight: 600 }}>
                Both sides send SYN simultaneously
              </text>
              {step >= 0 && (
                <>
                  <defs>
                    <marker id="tarrow-s1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                    </marker>
                    <marker id="tarrow-s2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                    </marker>
                  </defs>
                  <line x1={120} y1={130} x2={480} y2={170} stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#tarrow-s1)" />
                  <text x={240} y={130} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: "#3b82f6" }}>SYN</text>
                  <line x1={480} y1={130} x2={120} y2={170} stroke="#8b5cf6" strokeWidth={2.5} markerEnd="url(#tarrow-s2)" />
                  <text x={360} y={130} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: "#8b5cf6" }}>SYN</text>
                </>
              )}
              {step >= 1 && (
                <>
                  <defs>
                    <marker id="tarrow-sa1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                    </marker>
                    <marker id="tarrow-sa2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                    </marker>
                  </defs>
                  <line x1={120} y1={220} x2={480} y2={260} stroke="#10b981" strokeWidth={2.5} markerEnd="url(#tarrow-sa1)" />
                  <text x={240} y={220} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: "#10b981" }}>SYN-ACK</text>
                  <line x1={480} y1={220} x2={120} y2={260} stroke="#10b981" strokeWidth={2.5} markerEnd="url(#tarrow-sa2)" />
                  <text x={360} y={220} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: "#10b981" }}>SYN-ACK</text>
                </>
              )}
              {step >= 2 && (
                <text x={300} y={320} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, fill: "#10b981" }}>
                  Both sides ESTABLISHED
                </text>
              )}
            </g>
          )}

          {showTimer && scenario === "normal" && (
            <g>
              <rect x={30} y={330} width={160} height={36} rx={6} fill="#f59e0b" opacity={0.12} stroke="#f59e0b" strokeWidth={1.5} />
              <text x={110} y={348} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, fill: "#b45309" }}>
                TIME_WAIT
              </text>
              <text x={110} y={362} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fill: "#b45309" }}>
                {timerVal > 0 ? `${timerVal}s remaining (2MSL)` : "CLOSED"}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="flex gap-3 justify-center" style={{ marginBottom: 16 }}>
        <button className="btn-eng" onClick={handlePlay}>
          <Play className="w-4 h-4" /> Play
        </button>
        <button className="btn-eng-outline" onClick={reset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {step >= 0 && step < TERM_STEPS.length && scenario === "normal" && (
        <div className="info-eng eng-fadeIn" style={{ maxWidth: 560, margin: "0 auto" }}>
          <strong>Step {step + 1}:</strong> {TERM_STEPS[step].description}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 -- TCP Header Diagram                                        */
/* ================================================================== */

interface HeaderField {
  name: string;
  bits: number;
  row: number;
  col: number;
  color: string;
  detail: string;
}

const TCP_FIELDS: HeaderField[] = [
  { name: "Source Port", bits: 16, row: 0, col: 0, color: "#3b82f6", detail: "16-bit port number of the sender. Identifies the sending application process." },
  { name: "Destination Port", bits: 16, row: 0, col: 16, color: "#8b5cf6", detail: "16-bit port number of the receiver. Routes data to the correct application." },
  { name: "Sequence Number", bits: 32, row: 1, col: 0, color: "#10b981", detail: "32-bit sequence number. Tracks the position of data bytes in the stream." },
  { name: "Acknowledgment Number", bits: 32, row: 2, col: 0, color: "#f59e0b", detail: "32-bit field. Indicates the next expected byte (cumulative acknowledgment)." },
  { name: "Data Offset", bits: 4, row: 3, col: 0, color: "#ef4444", detail: "4-bit header length field. Specifies the header size in 32-bit words (min 5 = 20 bytes)." },
  { name: "Reserved", bits: 3, row: 3, col: 4, color: "#94a3b8", detail: "3 reserved bits. Must be zero. Reserved for future use." },
  { name: "Flags", bits: 9, row: 3, col: 7, color: "#ec4899", detail: "9 control flags: NS, CWR, ECE, URG, ACK, PSH, RST, SYN, FIN. Control connection behavior." },
  { name: "Window Size", bits: 16, row: 3, col: 16, color: "#06b6d4", detail: "16-bit field. Advertises how many bytes the receiver is willing to accept (flow control)." },
  { name: "Checksum", bits: 16, row: 4, col: 0, color: "#f97316", detail: "16-bit checksum for error detection. Covers header + data + pseudo-header." },
  { name: "Urgent Pointer", bits: 16, row: 4, col: 16, color: "#a855f7", detail: "16-bit pointer. Valid only if URG flag is set. Points to urgent data boundary." },
];

function HeaderTab() {
  const [selected, setSelected] = useState<number | null>(null);
  const cellW = 16.25;
  const rowH = 44;
  const padTop = 40;
  const svgW = 560;

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        TCP Header Structure
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        The TCP header is 20 bytes (160 bits) minimum. Click any field to see its purpose.
      </p>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16, overflowX: "auto" }}>
        <svg viewBox={`0 0 ${svgW} 310`} style={{ width: "100%", maxWidth: svgW, display: "block", margin: "0 auto" }}>
          {[0, 4, 8, 12, 16, 20, 24, 28, 31].map((b) => (
            <text key={b} x={20 + b * cellW} y={padTop - 8} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>
              {b}
            </text>
          ))}
          <text x={svgW / 2} y={padTop - 22} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fill: MUTED }}>
            Bit Position (0-31)
          </text>

          {TCP_FIELDS.map((f, i) => {
            const x = 4 + f.col * cellW;
            const y = padTop + f.row * rowH;
            const w = f.bits * cellW;
            const isSelected = selected === i;
            return (
              <g
                key={i}
                onClick={() => setSelected(isSelected ? null : i)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={rowH - 4}
                  rx={4}
                  fill={isSelected ? f.color : `${f.color}22`}
                  stroke={f.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ transition: "all 0.2s" }}
                />
                <text
                  x={x + w / 2}
                  y={y + rowH / 2 - 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: FONT,
                    fontSize: w < 80 ? 8 : 10,
                    fontWeight: 600,
                    fill: isSelected ? "#fff" : f.color,
                    transition: "fill 0.2s",
                  }}
                >
                  {f.name}
                </text>
                <text
                  x={x + w / 2}
                  y={y + rowH / 2 + 12}
                  textAnchor="middle"
                  style={{ fontFamily: FONT, fontSize: 8, fill: isSelected ? "rgba(255,255,255,0.8)" : MUTED }}
                >
                  {f.bits} bits
                </text>
              </g>
            );
          })}

          <text x={svgW / 2} y={padTop + 5 * rowH + 12} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, fill: TEXT }}>
            Total Header: 20 bytes (160 bits) minimum
          </text>
        </svg>
      </div>

      {selected !== null && (
        <div className="info-eng eng-fadeIn" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: TCP_FIELDS[selected].color, display: "inline-block" }} />
            <strong>{TCP_FIELDS[selected].name}</strong>
            <span className="tag-eng" style={{ fontSize: "0.7rem" }}>{TCP_FIELDS[selected].bits} bits</span>
          </div>
          <p style={{ fontFamily: FONT, fontSize: "0.85rem", color: TEXT, margin: 0, lineHeight: 1.5 }}>
            {TCP_FIELDS[selected].detail}
          </p>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "What is the correct order of messages in the TCP 3-way handshake?",
    options: ["SYN, ACK, FIN", "SYN, SYN-ACK, ACK", "ACK, SYN, SYN-ACK", "FIN, FIN-ACK, ACK"],
    correctIndex: 1,
    explanation: "The 3-way handshake is: Client sends SYN, Server responds with SYN-ACK, Client sends final ACK.",
  },
  {
    question: "How many messages are exchanged during TCP connection termination?",
    options: ["2 (FIN, ACK)", "3 (FIN, FIN-ACK, ACK)", "4 (FIN, ACK, FIN, ACK)", "1 (RST)"],
    correctIndex: 2,
    explanation: "Normal TCP termination uses 4 messages: FIN from initiator, ACK from other side, FIN from other side, final ACK.",
  },
  {
    question: "What is the minimum size of a TCP header?",
    options: ["8 bytes", "16 bytes", "20 bytes", "32 bytes"],
    correctIndex: 2,
    explanation: "The TCP header has 5 mandatory 32-bit words = 20 bytes. Options can extend it up to 60 bytes.",
  },
  {
    question: "What is the purpose of the TIME_WAIT state in TCP?",
    options: [
      "To speed up future connections to the same server",
      "To ensure delayed packets from the old connection are handled properly",
      "To reduce bandwidth usage",
      "To authenticate the server",
    ],
    correctIndex: 1,
    explanation: "TIME_WAIT (lasting 2*MSL) ensures any delayed segments from the closed connection are discarded and the final ACK is retransmitted if lost.",
  },
  {
    question: "In the TCP handshake, if the client's ISN is 100, what Acknowledgment number does the server send in SYN-ACK?",
    options: ["100", "101", "200", "0"],
    correctIndex: 1,
    explanation: "The server ACKs the client's ISN + 1 (i.e., 101) because SYN consumes one sequence number.",
  },
];

/* ================================================================== */
/*  Export                                                             */
/* ================================================================== */

export default function CN_L4_TCPConnectionActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "handshake",
      label: "Handshake",
      icon: <Network className="w-4 h-4" />,
      content: <HandshakeTab />,
    },
    {
      id: "termination",
      label: "Termination",
      icon: <XCircle className="w-4 h-4" />,
      content: <TerminationTab />,
    },
    {
      id: "header",
      label: "Header",
      icon: <LayoutGrid className="w-4 h-4" />,
      content: <HeaderTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="TCP -- Connection Management"
      level={4}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="TCP -- Reliable Data Transfer"
      placementRelevance="High"
    />
  );
}
