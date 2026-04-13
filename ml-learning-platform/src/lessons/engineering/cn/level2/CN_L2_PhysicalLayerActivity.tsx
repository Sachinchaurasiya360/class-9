"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Radio, Activity, Gauge, Zap } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SVG_W = 700;
const SVG_H = 300;

/* ------------------------------------------------------------------ */
/*  Tab 1: Signals - Oscilloscope-style waveform viewer                */
/* ------------------------------------------------------------------ */

function SignalsTab() {
  const [signalType, setSignalType] = useState<"analog" | "digital">("analog");
  const [frequency, setFrequency] = useState(2);
  const [amplitude, setAmplitude] = useState(80);
  const [noise, setNoise] = useState(0);
  const [time, setTime] = useState(0);
  const noiseCache = useRef<number[]>([]);

  // Generate stable noise values
  useEffect(() => {
    const pts: number[] = [];
    for (let i = 0; i < 800; i++) {
      pts.push((Math.random() - 0.5) * 2);
    }
    noiseCache.current = pts;
  }, []);

  // Animation loop
  useEffect(() => {
    let raf: number;
    const animate = () => {
      setTime((t) => t + 0.02);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const generatePoints = useCallback(
    (type: "analog" | "digital") => {
      const points: string[] = [];
      const midY = SVG_H / 2;
      const steps = 400;

      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * SVG_W;
        const t = (i / steps) * Math.PI * 2 * frequency + time;
        let y: number;

        if (type === "analog") {
          y = midY - Math.sin(t) * amplitude;
        } else {
          y = midY - (Math.sin(t) > 0 ? 1 : -1) * amplitude;
        }

        // Add noise
        const nIdx = i % noiseCache.current.length;
        const n = (noiseCache.current[nIdx] ?? 0) * noise * 1.5;
        y += n;

        points.push(`${x},${Math.max(10, Math.min(SVG_H - 10, y))}`);
      }

      return points.join(" ");
    },
    [frequency, amplitude, noise, time]
  );

  const degradationLabel =
    noise < 10 ? "Clean" : noise < 30 ? "Low Noise" : noise < 60 ? "Moderate" : noise < 80 ? "High Noise" : "Severe Degradation";
  const degradationColor =
    noise < 10 ? "var(--eng-success)" : noise < 30 ? "var(--eng-success)" : noise < 60 ? "var(--eng-warning)" : "var(--eng-danger)";

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Signal Waveform Oscilloscope
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Explore how analog and digital signals look on an oscilloscope. Adjust frequency, amplitude, and noise to see signal degradation in real time.
      </p>

      {/* Signal type toggle */}
      <div className="flex gap-2" style={{ marginBottom: 16 }}>
        {(["analog", "digital"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSignalType(type)}
            className={signalType === type ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.8rem", textTransform: "capitalize" }}
          >
            {type === "analog" ? "Analog (Sine)" : "Digital (Square)"}
          </button>
        ))}
      </div>

      {/* Oscilloscope display */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ background: "#0a0e17", display: "block", borderRadius: "8px 8px 0 0" }}
        >
          {/* Grid lines */}
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={(i * SVG_H) / 10}
              x2={SVG_W}
              y2={(i * SVG_H) / 10}
              stroke="#1a2332"
              strokeWidth={i === 5 ? 1.5 : 0.5}
            />
          ))}
          {Array.from({ length: 15 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={(i * SVG_W) / 14}
              y1={0}
              x2={(i * SVG_W) / 14}
              y2={SVG_H}
              stroke="#1a2332"
              strokeWidth={i === 7 ? 1.5 : 0.5}
            />
          ))}

          {/* Center line */}
          <line x1={0} y1={SVG_H / 2} x2={SVG_W} y2={SVG_H / 2} stroke="#2a3a4a" strokeWidth={1} strokeDasharray="4,4" />

          {/* Signal waveform */}
          <polyline
            points={generatePoints(signalType)}
            fill="none"
            stroke={signalType === "analog" ? "#00ff88" : "#00aaff"}
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 0 4px " + (signalType === "analog" ? "#00ff8844" : "#00aaff44") + ")" }}
          />

          {/* Labels */}
          <text x={12} y={20} fill="#4a5a6a" fontSize={11} fontFamily="var(--eng-font)">
            {signalType === "analog" ? "ANALOG" : "DIGITAL"} | f={frequency}Hz | A={amplitude}% | Noise={noise}%
          </text>

          {/* Noise indicator */}
          <text x={SVG_W - 12} y={20} fill={degradationColor} fontSize={11} fontFamily="var(--eng-font)" textAnchor="end">
            {degradationLabel}
          </text>

          {/* Amplitude markers */}
          <text x={8} y={SVG_H / 2 - amplitude + 4} fill="#4a5a6a" fontSize={9} fontFamily="var(--eng-font)">+A</text>
          <text x={8} y={SVG_H / 2 + amplitude + 4} fill="#4a5a6a" fontSize={9} fontFamily="var(--eng-font)">-A</text>
        </svg>

        {/* Controls */}
        <div style={{ padding: "12px 16px", background: "var(--eng-surface)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
              Frequency: {frequency} Hz
            </label>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--eng-primary)" }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
              Amplitude: {amplitude}%
            </label>
            <input
              type="range"
              min={20}
              max={120}
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--eng-primary)" }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: degradationColor, display: "block", marginBottom: 4 }}>
              Noise: {noise}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={noise}
              onChange={(e) => setNoise(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--eng-danger)" }}
            />
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        <strong>Key Insight:</strong> Analog signals carry continuous values (voice, temperature), while digital signals are discrete (0 or 1).
        Noise affects analog signals more because any perturbation changes the value. Digital signals can tolerate noise up to a threshold before bit errors occur.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2: Channel Capacity Calculator                                 */
/* ------------------------------------------------------------------ */

function CapacityTab() {
  const [bandwidth, setBandwidth] = useState(3000);
  const [snrDb, setSnrDb] = useState(30);
  const [levels, setLevels] = useState(2);
  const [mode, setMode] = useState<"shannon" | "nyquist">("shannon");

  // Shannon: C = B * log2(1 + S/N)
  const snrLinear = Math.pow(10, snrDb / 10);
  const shannonCapacity = bandwidth * Math.log2(1 + snrLinear);

  // Nyquist: C = 2B * log2(L)
  const nyquistCapacity = 2 * bandwidth * Math.log2(levels);

  const activeCapacity = mode === "shannon" ? shannonCapacity : nyquistCapacity;
  const maxGauge = 200000;
  const gaugeAngle = Math.min((activeCapacity / maxGauge) * 180, 180);

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Channel Capacity Calculator
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Calculate the theoretical maximum data rate of a channel using Shannon&apos;s theorem and Nyquist&apos;s formula.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2" style={{ marginBottom: 20 }}>
        {(["shannon", "nyquist"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={mode === m ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.8rem" }}
          >
            {m === "shannon" ? "Shannon-Hartley" : "Nyquist"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Controls */}
        <div className="card-eng" style={{ padding: 20 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 16px" }}>
            Parameters
          </h4>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
              Bandwidth (B): {bandwidth.toLocaleString()} Hz
            </label>
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={bandwidth}
              onChange={(e) => setBandwidth(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--eng-primary)" }}
            />
          </div>

          {mode === "shannon" ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
                SNR: {snrDb} dB (linear: {snrLinear.toFixed(1)})
              </label>
              <input
                type="range"
                min={0}
                max={50}
                value={snrDb}
                onChange={(e) => setSnrDb(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--eng-primary)" }}
              />
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
                Signal Levels (L): {levels}
              </label>
              <input
                type="range"
                min={2}
                max={256}
                step={1}
                value={levels}
                onChange={(e) => setLevels(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--eng-primary)" }}
              />
            </div>
          )}

          {/* Formula display */}
          <div className="card-eng" style={{ padding: 12, background: "var(--eng-bg)", textAlign: "center", marginTop: 12 }}>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", margin: "0 0 4px" }}>Formula</p>
            {mode === "shannon" ? (
              <p style={{ fontFamily: "monospace", fontSize: "1rem", color: "var(--eng-primary)", margin: 0, fontWeight: 700 }}>
                C = B x log₂(1 + S/N)
              </p>
            ) : (
              <p style={{ fontFamily: "monospace", fontSize: "1rem", color: "var(--eng-primary)", margin: 0, fontWeight: 700 }}>
                C = 2B x log₂(L)
              </p>
            )}
            {mode === "shannon" ? (
              <p style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: "8px 0 0" }}>
                = {bandwidth.toLocaleString()} x log₂(1 + {snrLinear.toFixed(1)})
              </p>
            ) : (
              <p style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: "8px 0 0" }}>
                = 2 x {bandwidth.toLocaleString()} x log₂({levels})
              </p>
            )}
          </div>
        </div>

        {/* Gauge display */}
        <div className="card-eng" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 200 120" width={260}>
            {/* Gauge background arc */}
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              fill="none"
              stroke="var(--eng-border)"
              strokeWidth={12}
              strokeLinecap="round"
            />
            {/* Gauge value arc */}
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              fill="none"
              stroke="var(--eng-primary)"
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray={`${(gaugeAngle / 180) * 251.3} 251.3`}
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
            {/* Needle */}
            <line
              x1={100}
              y1={110}
              x2={100 + Math.cos(Math.PI - (gaugeAngle * Math.PI) / 180) * 65}
              y2={110 + Math.sin(Math.PI - (gaugeAngle * Math.PI) / 180) * -65}
              stroke="var(--eng-danger)"
              strokeWidth={2}
              strokeLinecap="round"
              style={{ transition: "all 0.5s ease" }}
            />
            <circle cx={100} cy={110} r={4} fill="var(--eng-danger)" />

            {/* Labels */}
            <text x={16} y={118} fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">0</text>
            <text x={168} y={118} fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">200k</text>
          </svg>

          <div style={{ textAlign: "center", marginTop: 8 }}>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "1.6rem", fontWeight: 700, color: "var(--eng-primary)", margin: 0 }}>
              {activeCapacity >= 1000 ? (activeCapacity / 1000).toFixed(1) + " kbps" : activeCapacity.toFixed(0) + " bps"}
            </p>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", margin: "4px 0 0" }}>
              Maximum Channel Capacity ({mode === "shannon" ? "Shannon" : "Nyquist"})
            </p>
          </div>
        </div>
      </div>

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>Shannon vs Nyquist:</strong> Shannon gives the absolute maximum capacity considering noise. Nyquist gives the maximum for a noiseless channel with L signal levels.
        The actual capacity is the minimum of the two values.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3: Transmission Modes                                          */
/* ------------------------------------------------------------------ */

function TransmissionTab() {
  const [mode, setMode] = useState<"baseband" | "broadband">("baseband");
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    let raf: number;
    const animate = () => {
      setTime((t) => t + 0.03);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isRunning]);

  const wireY = 150;

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Baseband vs Broadband Transmission
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Watch how signals propagate in baseband (entire bandwidth, one channel) vs broadband (divided into multiple frequency bands) transmission.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2" style={{ marginBottom: 16 }}>
        {(["baseband", "broadband"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={mode === m ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.8rem", textTransform: "capitalize" }}
          >
            {m}
          </button>
        ))}
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="btn-eng-outline"
          style={{ fontSize: "0.8rem", marginLeft: "auto" }}
        >
          {isRunning ? "Pause" : "Play"}
        </button>
      </div>

      <div className="card-eng" style={{ padding: 0, overflow: "hidden" }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: "block", background: "var(--eng-bg)" }}>
          {mode === "baseband" ? (
            <>
              {/* Single wire */}
              <line x1={40} y1={wireY} x2={SVG_W - 40} y2={wireY} stroke="var(--eng-border)" strokeWidth={3} />
              <text x={SVG_W / 2} y={30} textAnchor="middle" fontSize={13} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">
                Baseband: Single Channel - Entire Bandwidth
              </text>

              {/* Sender */}
              <rect x={10} y={wireY - 30} width={40} height={60} rx={6} fill="var(--eng-primary)" opacity={0.15} stroke="var(--eng-primary)" strokeWidth={1.5} />
              <text x={30} y={wireY + 5} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fill="var(--eng-primary)" fontWeight={600}>TX</text>

              {/* Receiver */}
              <rect x={SVG_W - 50} y={wireY - 30} width={40} height={60} rx={6} fill="var(--eng-success)" opacity={0.15} stroke="var(--eng-success)" strokeWidth={1.5} />
              <text x={SVG_W - 30} y={wireY + 5} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fill="var(--eng-success)" fontWeight={600}>RX</text>

              {/* Propagating digital signal */}
              {(() => {
                const points: string[] = [];
                for (let i = 0; i <= 300; i++) {
                  const x = 60 + (i / 300) * (SVG_W - 120);
                  const t = (i / 300) * Math.PI * 6 - time * 3;
                  const val = Math.sin(t) > 0 ? -30 : 30;
                  points.push(`${x},${wireY + val}`);
                }
                return (
                  <polyline
                    points={points.join(" ")}
                    fill="none"
                    stroke="var(--eng-primary)"
                    strokeWidth={2}
                    opacity={0.8}
                  />
                );
              })()}

              {/* Moving pulse indicator */}
              <circle
                cx={60 + ((time * 80) % (SVG_W - 120))}
                cy={wireY}
                r={6}
                fill="var(--eng-primary)"
                opacity={0.6}
              >
                <animate attributeName="r" values="4;8;4" dur="1s" repeatCount="indefinite" />
              </circle>

              <text x={SVG_W / 2} y={wireY + 65} textAnchor="middle" fontSize={11} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
                Digital signal uses full channel bandwidth
              </text>
            </>
          ) : (
            <>
              <text x={SVG_W / 2} y={30} textAnchor="middle" fontSize={13} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">
                Broadband: Multiple Channels - Divided Bandwidth
              </text>

              {/* Three frequency channels */}
              {[
                { y: 80, color: "#ef4444", label: "Channel 1 (Low Freq)", freq: 1.5 },
                { y: 150, color: "#3b82f6", label: "Channel 2 (Mid Freq)", freq: 3 },
                { y: 220, color: "#10b981", label: "Channel 3 (High Freq)", freq: 5 },
              ].map((ch, idx) => (
                <g key={idx}>
                  {/* Wire */}
                  <line x1={100} y1={ch.y} x2={SVG_W - 100} y2={ch.y} stroke="var(--eng-border)" strokeWidth={1.5} />

                  {/* Channel label */}
                  <text x={50} y={ch.y + 4} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fill={ch.color} fontWeight={600}>
                    {ch.label.split(" ")[0]} {ch.label.split(" ")[1]}
                  </text>

                  {/* Signal wave */}
                  {(() => {
                    const points: string[] = [];
                    for (let i = 0; i <= 200; i++) {
                      const x = 110 + (i / 200) * (SVG_W - 220);
                      const t = (i / 200) * Math.PI * 2 * ch.freq - time * 3;
                      const val = Math.sin(t) * 20;
                      points.push(`${x},${ch.y + val}`);
                    }
                    return (
                      <polyline
                        points={points.join(" ")}
                        fill="none"
                        stroke={ch.color}
                        strokeWidth={2}
                        opacity={0.7}
                      />
                    );
                  })()}

                  {/* Moving dot */}
                  <circle
                    cx={110 + ((time * 60 + idx * 40) % (SVG_W - 220))}
                    cy={ch.y}
                    r={4}
                    fill={ch.color}
                    opacity={0.8}
                  >
                    <animate attributeName="r" values="3;6;3" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                </g>
              ))}

              <text x={SVG_W / 2} y={SVG_H - 15} textAnchor="middle" fontSize={11} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
                Multiple signals share the medium using different frequency bands
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Comparison table */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div className="card-eng" style={{ padding: 16, borderLeft: mode === "baseband" ? "3px solid var(--eng-primary)" : undefined }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
            Baseband
          </h4>
          <ul style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Uses entire bandwidth</li>
            <li>One signal at a time</li>
            <li>Short distance (LAN)</li>
            <li>Example: Ethernet</li>
          </ul>
        </div>
        <div className="card-eng" style={{ padding: 16, borderLeft: mode === "broadband" ? "3px solid var(--eng-primary)" : undefined }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
            Broadband
          </h4>
          <ul style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Divides bandwidth into channels</li>
            <li>Multiple signals simultaneously</li>
            <li>Long distance (WAN)</li>
            <li>Example: Cable TV, DSL</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz Questions                                                     */
/* ------------------------------------------------------------------ */

const quiz: EngQuizQuestion[] = [
  {
    question: "According to the Nyquist theorem, what is the maximum data rate for a noiseless channel with bandwidth B and L signal levels?",
    options: ["B * log₂(L)", "2B * log₂(L)", "B * log₂(1 + S/N)", "2B * L"],
    correctIndex: 1,
    explanation: "The Nyquist formula states C = 2B * log₂(L), where B is bandwidth and L is the number of discrete signal levels.",
  },
  {
    question: "Shannon's theorem gives the maximum capacity of a channel with bandwidth 3 kHz and SNR of 1023. What is the capacity?",
    options: ["30 kbps", "3 kbps", "10 kbps", "300 kbps"],
    correctIndex: 0,
    explanation: "C = B * log₂(1 + S/N) = 3000 * log₂(1024) = 3000 * 10 = 30,000 bps = 30 kbps.",
  },
  {
    question: "Which signal type is more susceptible to noise-induced errors?",
    options: ["Digital signals", "Analog signals", "Both are equally affected", "Neither is affected by noise"],
    correctIndex: 1,
    explanation: "Analog signals are more susceptible because any perturbation changes the continuous value. Digital signals can tolerate noise up to a threshold before a bit error occurs.",
  },
  {
    question: "In baseband transmission, how many signals can use the channel at the same time?",
    options: ["Multiple signals via FDM", "One signal uses the entire bandwidth", "Two signals using half bandwidth each", "Unlimited signals"],
    correctIndex: 1,
    explanation: "Baseband transmission uses the entire bandwidth of the channel for a single signal at a time.",
  },
  {
    question: "If a channel has a bandwidth of 5 kHz and we want to transmit at 40 kbps using the Nyquist formula, how many signal levels are needed?",
    options: ["4", "8", "16", "32"],
    correctIndex: 2,
    explanation: "40,000 = 2 * 5000 * log₂(L) => log₂(L) = 4 => L = 16 signal levels.",
  },
];

/* ------------------------------------------------------------------ */
/*  Tabs Definition                                                    */
/* ------------------------------------------------------------------ */

const tabs: EngTabDef[] = [
  {
    id: "signals",
    label: "Signals",
    icon: <Activity className="w-4 h-4" />,
    content: <SignalsTab />,
  },
  {
    id: "capacity",
    label: "Capacity",
    icon: <Gauge className="w-4 h-4" />,
    content: <CapacityTab />,
  },
  {
    id: "transmission",
    label: "Transmission",
    icon: <Zap className="w-4 h-4" />,
    content: <TransmissionTab />,
  },
];

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export default function CN_L2_PhysicalLayerActivity() {
  return (
    <EngineeringLessonShell
      title="Physical Layer — Signals & Capacity"
      level={2}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Framing & Error Detection"
      gateRelevance="2-3 marks"
      placementRelevance="Low"
    />
  );
}
