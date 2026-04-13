"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Shield, Lock, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, FileCheck } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Tab 1 — TLS Handshake                                              */
/* ------------------------------------------------------------------ */

interface HandshakeStep {
  id: number;
  label: string;
  from: "client" | "server";
  detail: string;
  color: string;
}

const HANDSHAKE_STEPS: HandshakeStep[] = [
  { id: 1, label: "ClientHello", from: "client", detail: "Supported TLS versions, cipher suites, random number", color: "var(--eng-primary)" },
  { id: 2, label: "ServerHello", from: "server", detail: "Chosen TLS version, cipher suite, random number", color: "var(--eng-success)" },
  { id: 3, label: "Certificate", from: "server", detail: "Server sends its X.509 certificate (public key)", color: "var(--eng-success)" },
  { id: 4, label: "ServerKeyExchange", from: "server", detail: "Key exchange parameters (if needed)", color: "var(--eng-success)" },
  { id: 5, label: "ServerHelloDone", from: "server", detail: "Server finished its part of negotiation", color: "var(--eng-success)" },
  { id: 6, label: "ClientKeyExchange", from: "client", detail: "Pre-master secret encrypted with server's public key", color: "var(--eng-primary)" },
  { id: 7, label: "ChangeCipherSpec", from: "client", detail: "Switch to encrypted communication", color: "var(--eng-primary)" },
  { id: 8, label: "Finished", from: "client", detail: "Encrypted hash of all handshake messages", color: "var(--eng-primary)" },
  { id: 9, label: "ChangeCipherSpec", from: "server", detail: "Server also switches to encrypted mode", color: "var(--eng-success)" },
  { id: 10, label: "Finished", from: "server", detail: "Server confirms handshake complete", color: "var(--eng-success)" },
];

function HandshakeTab() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const playSequence = useCallback(() => {
    setIsPlaying(true);
    setCurrentStep(0);
    let step = 0;
    function next() {
      step++;
      if (step <= HANDSHAKE_STEPS.length) {
        timerRef.current = setTimeout(() => {
          setCurrentStep(step);
          next();
        }, 700);
      } else {
        setIsPlaying(false);
      }
    }
    next();
  }, []);

  const handleReset = useCallback(() => {
    cleanup();
    setCurrentStep(0);
    setIsPlaying(false);
  }, [cleanup]);

  return (
    <div className="space-y-6">
      <div className="info-eng">
        The <strong>TLS handshake</strong> establishes a secure connection before any application data is sent.
        It authenticates the server, agrees on encryption algorithms, and generates session keys.
      </div>

      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          TLS 1.2 Handshake Sequence
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button className="btn-eng" onClick={playSequence} disabled={isPlaying} style={{ fontSize: "0.75rem", padding: "4px 12px", display: "flex", alignItems: "center", gap: 4 }}>
              <ArrowRight className="w-3.5 h-3.5" /> Play
            </button>
            <button className="btn-eng-outline" onClick={handleReset} style={{ fontSize: "0.75rem", padding: "4px 12px", display: "flex", alignItems: "center", gap: 4 }}>
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </h3>

        <svg viewBox="0 0 500 520" width="100%" style={{ maxWidth: 500 }}>
          {/* Client column */}
          <rect x="40" y="10" width="100" height="35" rx="8" fill="var(--eng-primary)" />
          <text x="90" y="32" textAnchor="middle" style={{ fontSize: "12px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "#fff" }}>Client</text>
          <line x1="90" y1="45" x2="90" y2="510" stroke="var(--eng-primary)" strokeWidth="2" strokeDasharray="4 4" />

          {/* Server column */}
          <rect x="360" y="10" width="100" height="35" rx="8" fill="var(--eng-success)" />
          <text x="410" y="32" textAnchor="middle" style={{ fontSize: "12px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "#fff" }}>Server</text>
          <line x1="410" y1="45" x2="410" y2="510" stroke="var(--eng-success)" strokeWidth="2" strokeDasharray="4 4" />

          {/* Handshake arrows */}
          {HANDSHAKE_STEPS.map((step, i) => {
            const y = 70 + i * 44;
            const visible = i < currentStep;
            const isClient = step.from === "client";
            const x1 = isClient ? 95 : 405;
            const x2 = isClient ? 405 : 95;

            return (
              <g key={step.id} style={{ opacity: visible ? 1 : 0.15, transition: "opacity 0.4s ease" }}>
                {/* Arrow line */}
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={step.color}
                  strokeWidth="2"
                  markerEnd={`url(#arrow-${isClient ? "right" : "left"}-${i})`}
                />
                {/* Arrow label */}
                <text
                  x={250}
                  y={y - 6}
                  textAnchor="middle"
                  style={{
                    fontSize: "9px",
                    fontFamily: "var(--eng-font)",
                    fontWeight: 700,
                    fill: step.color,
                  }}
                >
                  {step.id}. {step.label}
                </text>
                {/* Detail on hover area */}
                {visible && i === currentStep - 1 && (
                  <text
                    x={250}
                    y={y + 12}
                    textAnchor="middle"
                    className="eng-fadeIn"
                    style={{
                      fontSize: "7.5px",
                      fontFamily: "var(--eng-font)",
                      fill: "var(--eng-text-muted)",
                    }}
                  >
                    {step.detail}
                  </text>
                )}

                <defs>
                  <marker id={`arrow-right-${i}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={step.color} />
                  </marker>
                  <marker id={`arrow-left-${i}`} viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 10 0 L 0 5 L 10 10 z" fill={step.color} />
                  </marker>
                </defs>
              </g>
            );
          })}

          {/* Encrypted data indication */}
          {currentStep >= HANDSHAKE_STEPS.length && (
            <g className="eng-fadeIn">
              <rect x="100" y="485" width="300" height="25" rx="6" fill="rgba(16,185,129,0.1)" stroke="var(--eng-success)" strokeWidth="1.5" />
              <text x="250" y="502" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-success)" }}>
                Secure Channel Established -- Encrypted Data Flows
              </text>
            </g>
          )}
        </svg>

        {/* Step-through controls */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
          <button
            className="btn-eng-outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || isPlaying}
            style={{ fontSize: "0.75rem", padding: "4px 12px" }}
          >
            Prev Step
          </button>
          <span className="tag-eng" style={{ background: "var(--eng-surface)", color: "var(--eng-text-muted)" }}>
            {currentStep}/{HANDSHAKE_STEPS.length}
          </span>
          <button
            className="btn-eng-outline"
            onClick={() => setCurrentStep(Math.min(HANDSHAKE_STEPS.length, currentStep + 1))}
            disabled={currentStep >= HANDSHAKE_STEPS.length || isPlaying}
            style={{ fontSize: "0.75rem", padding: "4px 12px" }}
          >
            Next Step
          </button>
        </div>
      </div>

      <div className="info-eng">
        After the handshake, all data is encrypted with the <strong>session key</strong> derived from the pre-master secret.
        Both sides independently compute the same session key using the exchanged random values.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Certificate Chain of Trust                                  */
/* ------------------------------------------------------------------ */

function CertificatesTab() {
  const [verifyStep, setVerifyStep] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startVerify = useCallback(() => {
    setIsVerifying(true);
    setVerifyStep(0);
    let step = 0;
    function next() {
      step++;
      if (step <= 3) {
        timerRef.current = setTimeout(() => {
          setVerifyStep(step);
          next();
        }, 900);
      } else {
        setIsVerifying(false);
      }
    }
    next();
  }, []);

  const certChain = [
    { label: "Root CA", detail: "DigiCert Global Root G2", color: "var(--eng-danger)", icon: "shield" },
    { label: "Intermediate CA", detail: "DigiCert SHA2 Secure Server CA", color: "var(--eng-warning)", icon: "fileCheck" },
    { label: "Server Certificate", detail: "www.example.com", color: "var(--eng-success)", icon: "lock" },
  ];

  return (
    <div className="space-y-6">
      <div className="info-eng">
        <strong>Digital certificates</strong> prove a server&apos;s identity. A <strong>Certificate Authority (CA)</strong> vouches for the server,
        and a <strong>chain of trust</strong> links server certificates back to a trusted root CA pre-installed in your browser.
      </div>

      {/* Certificate chain visualization */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          Certificate Chain of Trust
          <button className="btn-eng" onClick={startVerify} disabled={isVerifying} style={{ fontSize: "0.75rem", padding: "4px 12px", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Verify Chain
          </button>
          <button className="btn-eng-outline" onClick={() => { cleanup(); setVerifyStep(0); setIsVerifying(false); }} style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
            Reset
          </button>
        </h3>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox="0 0 360 380" width="100%" style={{ maxWidth: 360 }}>
            {certChain.map((cert, i) => {
              const y = 30 + i * 120;
              const verified = verifyStep > (2 - i);
              const isActive = verifyStep === (3 - i);

              return (
                <g key={i}>
                  {/* Certificate box */}
                  <rect
                    x="80"
                    y={y}
                    width="200"
                    height="80"
                    rx="10"
                    fill={verified ? `${cert.color}11` : "var(--eng-surface)"}
                    stroke={isActive ? cert.color : verified ? cert.color : "var(--eng-border)"}
                    strokeWidth={isActive ? 3 : 1.5}
                    style={{ transition: "all 0.4s ease" }}
                  />

                  {/* Icon area */}
                  <circle cx="120" cy={y + 30} r="16" fill={`${cert.color}22`} stroke={cert.color} strokeWidth="1.5" />
                  {cert.icon === "shield" && (
                    <g transform={`translate(110, ${y + 18})`}>
                      <path d="M10 0 L20 5 V15 C20 22 10 25 10 25 C10 25 0 22 0 15 V5 Z" fill={cert.color} opacity="0.6" />
                    </g>
                  )}
                  {cert.icon === "fileCheck" && (
                    <g transform={`translate(112, ${y + 20})`}>
                      <rect x="0" y="0" width="16" height="20" rx="2" fill="none" stroke={cert.color} strokeWidth="1.5" />
                      <path d="M 4 12 L 7 15 L 12 8" fill="none" stroke={cert.color} strokeWidth="1.5" />
                    </g>
                  )}
                  {cert.icon === "lock" && (
                    <g transform={`translate(112, ${y + 18})`}>
                      <rect x="2" y="8" width="12" height="10" rx="2" fill={cert.color} opacity="0.6" />
                      <path d="M 4 8 V 5 A 4 4 0 0 1 12 5 V 8" fill="none" stroke={cert.color} strokeWidth="1.5" />
                    </g>
                  )}

                  {/* Text */}
                  <text x="180" y={y + 30} textAnchor="middle" style={{ fontSize: "12px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: cert.color }}>
                    {cert.label}
                  </text>
                  <text x="180" y={y + 50} textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>
                    {cert.detail}
                  </text>

                  {/* Verified badge */}
                  {verified && (
                    <g className="eng-fadeIn">
                      <circle cx="265" cy={y + 20} r="10" fill="var(--eng-success)" />
                      <path
                        d={`M ${260} ${y + 20} L ${263} ${y + 23} L ${270} ${y + 16}`}
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                  )}

                  {/* Chain link arrow */}
                  {i < 2 && (
                    <g>
                      <line
                        x1="180"
                        y1={y + 80}
                        x2="180"
                        y2={y + 120}
                        stroke={verified ? cert.color : "var(--eng-border)"}
                        strokeWidth="2"
                        strokeDasharray={verified ? "0" : "4 4"}
                        style={{ transition: "all 0.4s ease" }}
                      />
                      <text x="200" y={y + 103} style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: verified ? cert.color : "var(--eng-text-muted)", fontWeight: 600 }}>
                        signs
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Browser trust store label */}
            <rect x="80" y="350" width="200" height="25" rx="6" fill="rgba(59,130,246,0.08)" stroke="var(--eng-primary)" strokeWidth="1" strokeDasharray="4 3" />
            <text x="180" y="367" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-primary)" }}>
              Browser Trust Store (pre-installed Root CAs)
            </text>
          </svg>
        </div>
      </div>

      {/* What a certificate contains */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12 }}>
          Inside a Digital Certificate (X.509)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          {[
            { field: "Subject", value: "Who the cert is for", icon: "user" },
            { field: "Issuer", value: "CA that signed it", icon: "stamp" },
            { field: "Public Key", value: "Server's public key", icon: "key" },
            { field: "Validity", value: "Not Before / Not After dates", icon: "calendar" },
            { field: "Signature", value: "CA's digital signature", icon: "sign" },
            { field: "Serial Number", value: "Unique cert identifier", icon: "hash" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--eng-border)",
                background: "var(--eng-surface)",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--eng-primary)", fontFamily: "var(--eng-font)", marginBottom: 2 }}>
                {item.field}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--eng-text-muted)", fontFamily: "var(--eng-font)" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-eng">
        The padlock icon in your browser indicates a valid TLS certificate chain.
        If any link in the chain is broken or expired, the browser warns you with a security error.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — TLS 1.2 vs 1.3                                            */
/* ------------------------------------------------------------------ */

function VersionsTab() {
  const [activeVersion, setActiveVersion] = useState<"1.2" | "1.3">("1.2");

  const tls12Steps = [
    { from: "client", label: "ClientHello" },
    { from: "server", label: "ServerHello + Cert + KeyExchange" },
    { from: "client", label: "ClientKeyExchange + ChangeCipher" },
    { from: "server", label: "ChangeCipherSpec + Finished" },
  ];

  const tls13Steps = [
    { from: "client", label: "ClientHello + KeyShare" },
    { from: "server", label: "ServerHello + KeyShare + Cert + Finished" },
    { from: "client", label: "Finished" },
  ];

  const steps = activeVersion === "1.2" ? tls12Steps : tls13Steps;
  const roundTrips = activeVersion === "1.2" ? 2 : 1;

  return (
    <div className="space-y-6">
      <div className="info-eng">
        <strong>TLS 1.3</strong> (2018) reduced the handshake from <strong>2 round trips to 1</strong>, improving performance
        and removing support for weak cipher suites.
      </div>

      {/* Version toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <button
          className={activeVersion === "1.2" ? "btn-eng" : "btn-eng-outline"}
          onClick={() => setActiveVersion("1.2")}
          style={{ fontSize: "0.85rem" }}
        >
          TLS 1.2
        </button>
        <button
          className={activeVersion === "1.3" ? "btn-eng" : "btn-eng-outline"}
          onClick={() => setActiveVersion("1.3")}
          style={{ fontSize: "0.85rem" }}
        >
          TLS 1.3
        </button>
      </div>

      {/* Side-by-side handshake diagrams */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 4 }}>
          TLS {activeVersion} Handshake
        </h3>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", marginBottom: 16 }}>
          Round trips: <strong style={{ color: activeVersion === "1.3" ? "var(--eng-success)" : "var(--eng-warning)" }}>{roundTrips}</strong>
          {activeVersion === "1.3" && <span style={{ color: "var(--eng-success)", marginLeft: 8 }}>50% faster!</span>}
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox={`0 0 400 ${steps.length * 70 + 80}`} width="100%" style={{ maxWidth: 400 }} key={activeVersion}>
            {/* Client/Server headers */}
            <rect x="30" y="10" width="80" height="30" rx="6" fill="var(--eng-primary)" />
            <text x="70" y="30" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "#fff" }}>Client</text>
            <line x1="70" y1="40" x2="70" y2={steps.length * 70 + 60} stroke="var(--eng-primary)" strokeWidth="1.5" strokeDasharray="4 4" />

            <rect x="290" y="10" width="80" height="30" rx="6" fill="var(--eng-success)" />
            <text x="330" y="30" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "#fff" }}>Server</text>
            <line x1="330" y1="40" x2="330" y2={steps.length * 70 + 60} stroke="var(--eng-success)" strokeWidth="1.5" strokeDasharray="4 4" />

            {steps.map((step, i) => {
              const y = 65 + i * 70;
              const isClient = step.from === "client";
              const x1 = isClient ? 75 : 325;
              const x2 = isClient ? 325 : 75;
              const color = isClient ? "var(--eng-primary)" : "var(--eng-success)";

              return (
                <g key={i} className="eng-fadeIn" style={{ animationDelay: `${i * 0.15}s` }}>
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke={color}
                    strokeWidth="2"
                  />
                  {/* Arrow head */}
                  <polygon
                    points={isClient
                      ? `${x2},${y} ${x2 - 8},${y - 5} ${x2 - 8},${y + 5}`
                      : `${x2},${y} ${x2 + 8},${y - 5} ${x2 + 8},${y + 5}`
                    }
                    fill={color}
                  />
                  <text
                    x={200}
                    y={y - 8}
                    textAnchor="middle"
                    style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: color }}
                  >
                    {step.label}
                  </text>
                </g>
              );
            })}

            {/* Encrypted data */}
            <rect x="80" y={steps.length * 70 + 40} width="240" height="25" rx="6" fill="rgba(16,185,129,0.1)" stroke="var(--eng-success)" strokeWidth="1.5" />
            <text x="200" y={steps.length * 70 + 57} textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-success)" }}>
              Encrypted Application Data
            </text>
          </svg>
        </div>
      </div>

      {/* Key improvements in TLS 1.3 */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12 }}>
          TLS 1.3 Key Improvements
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { title: "1-RTT Handshake", desc: "Reduced from 2 round trips to 1, cutting latency in half", good: true },
            { title: "0-RTT Resumption", desc: "Returning clients can send data immediately (with replay protection)", good: true },
            { title: "Removed Weak Ciphers", desc: "No RSA key exchange, no CBC mode, no RC4, no SHA-1", good: true },
            { title: "Forward Secrecy Required", desc: "All key exchanges use ephemeral Diffie-Hellman (ECDHE)", good: true },
            { title: "Encrypted Handshake", desc: "Server certificate is encrypted (prevents passive fingerprinting)", good: true },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(16,185,129,0.05)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--eng-success)", marginTop: 2 }} />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", fontFamily: "var(--eng-font)" }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--eng-text-muted)", fontFamily: "var(--eng-font)" }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                                */
/* ------------------------------------------------------------------ */

const quiz: EngQuizQuestion[] = [
  {
    question: "What is the primary purpose of the TLS handshake?",
    options: [
      "To transfer application data quickly",
      "To authenticate the server and establish a shared session key",
      "To compress data for faster transmission",
      "To route packets through the network",
    ],
    correctIndex: 1,
    explanation: "The TLS handshake authenticates the server (via certificates), negotiates encryption parameters, and establishes a shared session key.",
  },
  {
    question: "What does a Certificate Authority (CA) do?",
    options: [
      "Encrypts all web traffic",
      "Issues and signs digital certificates, vouching for server identity",
      "Creates firewall rules",
      "Manages DNS records",
    ],
    correctIndex: 1,
    explanation: "A CA verifies the identity of a server owner and issues a signed digital certificate that browsers can verify through the chain of trust.",
  },
  {
    question: "How many round trips does a TLS 1.3 handshake take?",
    options: ["0 round trips", "1 round trip", "2 round trips", "3 round trips"],
    correctIndex: 1,
    explanation: "TLS 1.3 completes the handshake in just 1 round trip (1-RTT), compared to TLS 1.2's 2 round trips.",
  },
  {
    question: "What happens if a certificate in the chain has expired?",
    options: [
      "The connection proceeds normally",
      "The browser shows a security warning/error",
      "Only images are blocked",
      "The server automatically renews it",
    ],
    correctIndex: 1,
    explanation: "If any certificate in the chain is expired, invalid, or untrusted, the browser displays a security warning preventing insecure connections.",
  },
  {
    question: "What does HTTPS provide that HTTP does not?",
    options: [
      "Faster page loads",
      "Better SEO ranking only",
      "Encryption, authentication, and data integrity",
      "Larger file transfer sizes",
    ],
    correctIndex: 2,
    explanation: "HTTPS (HTTP over TLS) provides encryption (confidentiality), server authentication (identity verification), and data integrity (tamper detection).",
  },
];

/* ------------------------------------------------------------------ */
/*  Tabs + Export                                                       */
/* ------------------------------------------------------------------ */

const tabs: EngTabDef[] = [
  {
    id: "handshake",
    label: "Handshake",
    icon: <Shield className="w-4 h-4" />,
    content: <HandshakeTab />,
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: <FileCheck className="w-4 h-4" />,
    content: <CertificatesTab />,
  },
  {
    id: "versions",
    label: "Versions",
    icon: <ArrowRight className="w-4 h-4" />,
    content: <VersionsTab />,
  },
];

export default function CN_L6_TLSSSLActivity() {
  return (
    <EngineeringLessonShell
      title="TLS/SSL -- Secure Communication"
      level={6}
      lessonNumber={2}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Firewalls & VPN"
      gateRelevance="2-3 marks"
      placementRelevance="High"
    />
  );
}
