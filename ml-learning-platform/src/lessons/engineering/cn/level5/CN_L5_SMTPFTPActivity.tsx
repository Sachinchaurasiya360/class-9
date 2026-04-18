"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Send,
  Server,
  ArrowRight,
  Download,
  Upload,
  FolderOpen,
  Monitor,
  RefreshCw,
  CheckCircle2,
  Layers,
} from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type {
  EngTabDef,
  EngQuizQuestion,
} from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Tab 1 - Email Lifecycle Animation                                   */
/* ================================================================== */

function EmailLifecycleTab() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [retrieval, setRetrieval] = useState<"pop3" | "imap">("imap");

  const steps = [
    {
      label: "Compose",
      desc: "Alice composes an email in her Mail User Agent (MUA) - like Gmail, Outlook, or Thunderbird.",
      activeNode: "mua-sender",
    },
    {
      label: "SMTP Submit",
      desc: "The MUA sends the email via SMTP (port 587 with STARTTLS) to Alice's outgoing mail server (MTA).",
      activeEdge: "mua-mta-sender",
    },
    {
      label: "SMTP Relay",
      desc: "Alice's MTA looks up the MX record for bob@example.com, then relays the email via SMTP (port 25) to Bob's MTA.",
      activeEdge: "mta-sender-mta-receiver",
    },
    {
      label: "Stored in Mailbox",
      desc: "Bob's MTA stores the email in Bob's mailbox on the mail server, waiting for Bob to retrieve it.",
      activeNode: "mta-receiver",
    },
    {
      label: retrieval === "imap" ? "IMAP Retrieve" : "POP3 Retrieve",
      desc: retrieval === "imap"
        ? "Bob's MUA retrieves the email via IMAP (port 993 with TLS). Emails stay on the server - synced across all devices."
        : "Bob's MUA downloads the email via POP3 (port 995 with TLS). Emails are typically removed from the server after download.",
      activeEdge: "mta-receiver-mua-receiver",
    },
    {
      label: "Read",
      desc: "Bob reads the email in his MUA. The email lifecycle is complete!",
      activeNode: "mua-receiver",
    },
  ];

  const playAnim = useCallback(() => {
    setStep(0);
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (step >= steps.length) { setRunning(false); return; }
    const id = setTimeout(() => setStep((s) => s + 1), 1800);
    return () => clearTimeout(id);
  }, [step, running, steps.length]);

  const nodes = {
    "mua-sender": { x: 60, y: 120, label: "Alice's MUA", sublabel: "(Gmail/Outlook)" },
    "mta-sender": { x: 250, y: 120, label: "Sender MTA", sublabel: "smtp.alice.com" },
    "mta-receiver": { x: 470, y: 120, label: "Receiver MTA", sublabel: "smtp.bob.com" },
    "mua-receiver": { x: 660, y: 120, label: "Bob's MUA", sublabel: "(Thunderbird)" },
  };

  const edges = [
    { id: "mua-mta-sender", from: "mua-sender", to: "mta-sender", label: "SMTP (587)", color: "#3b82f6" },
    { id: "mta-sender-mta-receiver", from: "mta-sender", to: "mta-receiver", label: "SMTP (25)", color: "#10b981" },
    { id: "mta-receiver-mua-receiver", from: "mta-receiver", to: "mua-receiver", label: retrieval === "imap" ? "IMAP (993)" : "POP3 (995)", color: "#f59e0b" },
  ];

  const currentStep = step > 0 && step <= steps.length ? steps[step - 1] : null;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Email Lifecycle
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Follow an email from Alice to Bob - through compose, SMTP relay, and retrieval.
      </p>

      <div className="flex gap-2" style={{ marginBottom: 16 }}>
        <button onClick={playAnim} className="btn-eng" style={{ fontSize: "0.85rem" }}>
          <RefreshCw className="w-4 h-4" style={{ marginRight: 4 }} /> Play Animation
        </button>
        <button
          onClick={() => { setRetrieval("imap"); setStep(0); setRunning(false); }}
          className={retrieval === "imap" ? "btn-eng" : "btn-eng-outline"}
          style={{ fontSize: "0.85rem" }}
        >
          IMAP
        </button>
        <button
          onClick={() => { setRetrieval("pop3"); setStep(0); setRunning(false); }}
          className={retrieval === "pop3" ? "btn-eng" : "btn-eng-outline"}
          style={{ fontSize: "0.85rem" }}
        >
          POP3
        </button>
      </div>

      <svg viewBox="0 0 740 240" style={{ width: "100%", maxWidth: 740, display: "block", margin: "0 auto 16px", background: "var(--eng-surface)", borderRadius: 12, border: "1px solid var(--eng-border)" }}>
        {/* Protocol labels at top */}
        <text x={155} y={30} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill="#3b82f6">SMTP</text>
        <text x={360} y={30} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill="#10b981">SMTP Relay</text>
        <text x={565} y={30} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill="#f59e0b">{retrieval === "imap" ? "IMAP" : "POP3"}</text>

        {/* Edges */}
        {edges.map((e) => {
          const fromN = nodes[e.from as keyof typeof nodes];
          const toN = nodes[e.to as keyof typeof nodes];
          const isActive = currentStep?.activeEdge === e.id;
          return (
            <g key={e.id}>
              <line
                x1={fromN.x + 50} y1={fromN.y}
                x2={toN.x - 50} y2={toN.y}
                stroke={isActive ? e.color : "var(--eng-border)"}
                strokeWidth={isActive ? 3 : 1.5}
                strokeDasharray={isActive ? "8 4" : "none"}
                style={{ transition: "stroke 0.4s, stroke-width 0.3s" }}
              >
                {isActive && (
                  <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.8s" repeatCount="indefinite" />
                )}
              </line>
              {isActive && (
                <polygon
                  points={`${toN.x - 55},${toN.y - 5} ${toN.x - 45},${toN.y} ${toN.x - 55},${toN.y + 5}`}
                  fill={e.color}
                >
                  <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
                </polygon>
              )}
              <text
                x={(fromN.x + toN.x) / 2}
                y={fromN.y - 30}
                textAnchor="middle"
                fontSize={9}
                fontFamily="monospace"
                fontWeight={500}
                fill={isActive ? e.color : "var(--eng-text-muted)"}
              >
                {e.label}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {Object.entries(nodes).map(([key, n]) => {
          const isActive = currentStep?.activeNode === key;
          return (
            <g key={key}>
              {isActive && (
                <rect x={n.x - 48} y={n.y - 28} width={96} height={56} rx={12} fill="none" stroke="var(--eng-primary)" strokeWidth={2} opacity={0.4}>
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.5s" repeatCount="indefinite" />
                </rect>
              )}
              <rect
                x={n.x - 44} y={n.y - 24} width={88} height={48} rx={10}
                fill={isActive ? "var(--eng-primary-light)" : "var(--eng-surface)"}
                stroke={isActive ? "var(--eng-primary)" : "var(--eng-border)"}
                strokeWidth={isActive ? 2 : 1.5}
              />
              {key.includes("mua") ? (
                <Monitor x={n.x - 8} y={n.y - 16} width={16} height={16} style={{ color: isActive ? "var(--eng-primary)" : "var(--eng-text-muted)" }} />
              ) : (
                <Server x={n.x - 8} y={n.y - 16} width={16} height={16} style={{ color: isActive ? "var(--eng-primary)" : "var(--eng-text-muted)" }} />
              )}
              <text x={n.x} y={n.y + 8} textAnchor="middle" fontSize={8} fontWeight={600} fontFamily="var(--eng-font)" fill="var(--eng-text)">
                {n.label}
              </text>
              <text x={n.x} y={n.y + 19} textAnchor="middle" fontSize={7} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
                {n.sublabel}
              </text>
            </g>
          );
        })}

        {/* Step indicators */}
        <g>
          {steps.map((s, i) => (
            <g key={i}>
              <circle
                cx={120 + i * 85}
                cy={210}
                r={10}
                fill={i < step ? "var(--eng-primary)" : i === step ? "var(--eng-primary-light)" : "var(--eng-bg)"}
                stroke={i <= step ? "var(--eng-primary)" : "var(--eng-border)"}
                strokeWidth={1.5}
              />
              <text
                x={120 + i * 85} y={214}
                textAnchor="middle" fontSize={8} fontWeight={700}
                fontFamily="var(--eng-font)"
                fill={i < step ? "#fff" : "var(--eng-text-muted)"}
              >
                {i + 1}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Step description */}
      {currentStep ? (
        <div className="info-eng eng-fadeIn" key={step}>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", margin: 0 }}>
            <strong>Step {step}: {currentStep.label}</strong> - {currentStep.desc}
          </p>
        </div>
      ) : (
        <div className="info-eng" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", margin: 0 }}>
            Click &quot;Play Animation&quot; to trace an email from sender to receiver.
          </p>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 - FTP Dual Connection Visualization                          */
/* ================================================================== */

function FTPTab() {
  const [ftpMode, setFtpMode] = useState<"active" | "passive">("active");
  const [animStep, setAnimStep] = useState(0);
  const [running, setRunning] = useState(false);

  const activeSteps = [
    { desc: "Client connects to server on port 21 (control connection)", highlight: "control" },
    { desc: "Client sends PORT command telling server its data port (e.g., 5001)", highlight: "port-cmd" },
    { desc: "Server initiates data connection FROM port 20 TO client's port 5001", highlight: "data-active" },
    { desc: "File data transfers over the data connection, control stays open for commands", highlight: "transfer" },
  ];

  const passiveSteps = [
    { desc: "Client connects to server on port 21 (control connection)", highlight: "control" },
    { desc: "Client sends PASV command asking server to listen on a random data port", highlight: "pasv-cmd" },
    { desc: "Server replies with its data port (e.g., 6789). Client initiates data connection TO that port", highlight: "data-passive" },
    { desc: "File data transfers over the data connection. Client-initiated = firewall-friendly!", highlight: "transfer" },
  ];

  const steps = ftpMode === "active" ? activeSteps : passiveSteps;

  const playAnim = useCallback(() => {
    setAnimStep(0);
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (animStep >= steps.length) { setRunning(false); return; }
    const id = setTimeout(() => setAnimStep((s) => s + 1), 2000);
    return () => clearTimeout(id);
  }, [animStep, running, steps.length]);

  const currentStep = animStep > 0 && animStep <= steps.length ? steps[animStep - 1] : null;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        FTP - Dual Connection Model
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        FTP uses two separate TCP connections: a control connection (commands) and a data connection (file transfers).
      </p>

      <div className="flex gap-2" style={{ marginBottom: 16 }}>
        <button
          onClick={() => { setFtpMode("active"); setAnimStep(0); setRunning(false); }}
          className={ftpMode === "active" ? "btn-eng" : "btn-eng-outline"}
          style={{ fontSize: "0.85rem" }}
        >
          Active Mode
        </button>
        <button
          onClick={() => { setFtpMode("passive"); setAnimStep(0); setRunning(false); }}
          className={ftpMode === "passive" ? "btn-eng" : "btn-eng-outline"}
          style={{ fontSize: "0.85rem" }}
        >
          Passive Mode
        </button>
        <button onClick={playAnim} className="btn-eng-outline" style={{ fontSize: "0.85rem", marginLeft: "auto" }}>
          <RefreshCw className="w-4 h-4" style={{ marginRight: 4 }} /> Play
        </button>
      </div>

      <svg viewBox="0 0 700 280" style={{ width: "100%", maxWidth: 700, display: "block", margin: "0 auto 16px", background: "var(--eng-surface)", borderRadius: 12, border: "1px solid var(--eng-border)" }}>
        {/* Client */}
        <rect x={40} y={40} width={140} height={200} rx={12} fill="var(--eng-bg)" stroke="var(--eng-border)" strokeWidth={1.5} />
        <text x={110} y={65} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="var(--eng-font)" fill="var(--eng-text)">FTP Client</text>
        <rect x={60} y={80} width={100} height={30} rx={6} fill="var(--eng-primary-light)" stroke="var(--eng-primary)" strokeWidth={1}>
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <text x={110} y={100} textAnchor="middle" fontSize={9} fontFamily="monospace" fontWeight={600} fill="var(--eng-primary)">Port: Random</text>

        <rect x={60} y={160} width={100} height={30} rx={6} fill="rgba(245,158,11,0.1)" stroke="#f59e0b" strokeWidth={1}>
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </rect>
        <text x={110} y={180} textAnchor="middle" fontSize={9} fontFamily="monospace" fontWeight={600} fill="#f59e0b">
          {ftpMode === "active" ? "Port: 5001" : "Port: Random"}
        </text>

        {/* Server */}
        <rect x={520} y={40} width={140} height={200} rx={12} fill="var(--eng-bg)" stroke="var(--eng-border)" strokeWidth={1.5} />
        <text x={590} y={65} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="var(--eng-font)" fill="var(--eng-text)">FTP Server</text>
        <rect x={540} y={80} width={100} height={30} rx={6} fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth={1}>
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <text x={590} y={100} textAnchor="middle" fontSize={9} fontFamily="monospace" fontWeight={600} fill="#10b981">Port: 21</text>

        <rect x={540} y={160} width={100} height={30} rx={6} fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth={1}>
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </rect>
        <text x={590} y={180} textAnchor="middle" fontSize={9} fontFamily="monospace" fontWeight={600} fill="#ef4444">
          {ftpMode === "active" ? "Port: 20" : "Port: 6789"}
        </text>

        {/* Control Connection (always shown after step 1) */}
        {animStep >= 1 && (
          <g>
            <line x1={160} y1={95} x2={540} y2={95} stroke="var(--eng-primary)" strokeWidth={2.5} strokeDasharray="8 4">
              <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite" />
            </line>
            <text x={350} y={88} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={700} fill="var(--eng-primary)">
              Control Connection (port 21)
            </text>
          </g>
        )}

        {/* Data Connection */}
        {animStep >= 3 && (
          <g>
            {ftpMode === "active" ? (
              <>
                {/* Active: server initiates TO client */}
                <line x1={540} y1={175} x2={160} y2={175} stroke="#ef4444" strokeWidth={2.5} strokeDasharray="8 4">
                  <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.8s" repeatCount="indefinite" />
                </line>
                <polygon points="165,170 155,175 165,180" fill="#ef4444" />
                <text x={350} y={168} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={700} fill="#ef4444">
                  Data Connection (server port 20 → client 5001)
                </text>
              </>
            ) : (
              <>
                {/* Passive: client initiates TO server */}
                <line x1={160} y1={175} x2={540} y2={175} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="8 4">
                  <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.8s" repeatCount="indefinite" />
                </line>
                <polygon points="535,170 545,175 535,180" fill="#f59e0b" />
                <text x={350} y={168} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={700} fill="#f59e0b">
                  Data Connection (client → server port 6789)
                </text>
              </>
            )}
          </g>
        )}

        {/* Command shown */}
        {animStep >= 2 && animStep < 4 && (
          <g>
            <rect x={240} y={110} width={220} height={28} rx={6} fill="#1e293b" />
            <text x={350} y={128} textAnchor="middle" fontSize={10} fontFamily="monospace" fontWeight={600} fill="#4ade80">
              {ftpMode === "active" ? "PORT 192,168,1,10,19,137" : "PASV → 227 (192,168,1,1,26,133)"}
            </text>
          </g>
        )}

        {/* Labels */}
        <text x={110} y={255} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
          {ftpMode === "active" ? "Client tells server its port" : "Client connects to server's port"}
        </text>
        <text x={590} y={255} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
          {ftpMode === "active" ? "Server opens data conn" : "Server opens passive port"}
        </text>
      </svg>

      {currentStep ? (
        <div className="info-eng eng-fadeIn" key={animStep}>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", margin: 0 }}>
            <strong>Step {animStep}:</strong> {currentStep.desc}
          </p>
        </div>
      ) : (
        <div className="info-eng" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", margin: 0 }}>
            Click &quot;Play&quot; to see the FTP connection setup in {ftpMode} mode.
          </p>
        </div>
      )}

      {/* Active vs Passive comparison */}
      <div className="card-eng p-4" style={{ marginTop: 16 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
          Active vs Passive - Why it matters
        </h4>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", margin: 0, lineHeight: 1.6 }}>
          {ftpMode === "active"
            ? "In Active mode, the server initiates the data connection to the client. This fails if the client is behind a NAT/firewall that blocks incoming connections. That's why passive mode was invented."
            : "In Passive mode, the client initiates BOTH connections. Since the client starts all connections outward, it works through NAT and firewalls. This is the default mode for modern FTP clients."
          }
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 - Protocol Comparison Table                                   */
/* ================================================================== */

function CompareTab() {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  const protocols = [
    {
      name: "SMTP",
      fullName: "Simple Mail Transfer Protocol",
      purpose: "Sending/relaying email between mail servers",
      port: "25 (relay), 587 (submission)",
      transport: "TCP",
      direction: "Push (sender to server)",
      persistent: "Yes",
      secure: "STARTTLS on 587",
      color: "#3b82f6",
    },
    {
      name: "POP3",
      fullName: "Post Office Protocol v3",
      purpose: "Downloading email from server to client",
      port: "110 (plain), 995 (TLS)",
      transport: "TCP",
      direction: "Pull (client downloads)",
      persistent: "No - download and delete",
      secure: "TLS on 995",
      color: "#ef4444",
    },
    {
      name: "IMAP",
      fullName: "Internet Message Access Protocol",
      purpose: "Accessing and managing email on server",
      port: "143 (plain), 993 (TLS)",
      transport: "TCP",
      direction: "Pull (client syncs)",
      persistent: "Yes - emails stay on server",
      secure: "TLS on 993",
      color: "#10b981",
    },
    {
      name: "FTP",
      fullName: "File Transfer Protocol",
      purpose: "Transferring files between client and server",
      port: "21 (control), 20 (data-active)",
      transport: "TCP (two connections)",
      direction: "Bidirectional (upload/download)",
      persistent: "Control: yes, Data: per transfer",
      secure: "FTPS (FTP over TLS) or SFTP (SSH)",
      color: "#f59e0b",
    },
    {
      name: "SFTP",
      fullName: "SSH File Transfer Protocol",
      purpose: "Secure file transfer over SSH tunnel",
      port: "22 (SSH)",
      transport: "TCP (single connection)",
      direction: "Bidirectional",
      persistent: "Yes (SSH session)",
      secure: "Encrypted by default (SSH)",
      color: "#8b5cf6",
    },
  ];

  const selected = selectedProtocol ? protocols.find((p) => p.name === selectedProtocol) : null;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Protocol Comparison
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        Compare email and file transfer protocols side by side. Click a protocol name for details.
      </p>

      {/* Comparison table */}
      <div className="card-eng" style={{ overflow: "auto", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.82rem", minWidth: 600 }}>
          <thead>
            <tr style={{ background: "var(--eng-bg)" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--eng-text)", borderBottom: "2px solid var(--eng-border)" }}>Protocol</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--eng-text)", borderBottom: "2px solid var(--eng-border)" }}>Purpose</th>
              <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "var(--eng-text)", borderBottom: "2px solid var(--eng-border)" }}>Port(s)</th>
              <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "var(--eng-text)", borderBottom: "2px solid var(--eng-border)" }}>Direction</th>
              <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "var(--eng-text)", borderBottom: "2px solid var(--eng-border)" }}>Data on Server?</th>
            </tr>
          </thead>
          <tbody>
            {protocols.map((p) => (
              <tr
                key={p.name}
                onClick={() => setSelectedProtocol(p.name)}
                style={{
                  cursor: "pointer",
                  background: selectedProtocol === p.name ? `${p.color}08` : "transparent",
                  transition: "background 0.15s",
                }}
              >
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--eng-border)" }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: p.color, fontSize: "0.9rem" }}>{p.name}</span>
                </td>
                <td style={{ padding: "10px 14px", color: "var(--eng-text-muted)", borderBottom: "1px solid var(--eng-border)" }}>
                  {p.purpose}
                </td>
                <td style={{ padding: "10px 14px", textAlign: "center", fontFamily: "monospace", color: "var(--eng-text)", borderBottom: "1px solid var(--eng-border)", fontSize: "0.8rem" }}>
                  {p.port}
                </td>
                <td style={{ padding: "10px 14px", textAlign: "center", color: "var(--eng-text-muted)", borderBottom: "1px solid var(--eng-border)" }}>
                  {p.direction}
                </td>
                <td style={{ padding: "10px 14px", textAlign: "center", color: "var(--eng-text-muted)", borderBottom: "1px solid var(--eng-border)" }}>
                  {p.persistent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected protocol details */}
      {selected && (
        <div className="card-eng p-5 eng-fadeIn" key={selected.name}>
          <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
            <span style={{
              fontFamily: "monospace", fontWeight: 800, fontSize: "1.1rem", color: selected.color,
              padding: "4px 12px", borderRadius: 6, background: `${selected.color}15`,
            }}>
              {selected.name}
            </span>
            <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)" }}>
              {selected.fullName}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Purpose", value: selected.purpose },
              { label: "Transport", value: selected.transport },
              { label: "Ports", value: selected.port },
              { label: "Security", value: selected.secure },
            ].map((item) => (
              <div key={item.label} style={{ padding: "8px 12px", borderRadius: 8, background: "var(--eng-bg)" }}>
                <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.72rem", fontWeight: 600, color: "var(--eng-text-muted)", marginBottom: 2, textTransform: "uppercase" }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POP3 vs IMAP quick comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <div className="card-eng p-4" style={{ borderTop: "3px solid #ef4444" }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "#ef4444", margin: "0 0 8px" }}>
            POP3 - Download & Delete
          </h4>
          <ul style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
            <li>Downloads emails to local device</li>
            <li>Typically deletes from server after download</li>
            <li>Single device access</li>
            <li>Simpler protocol, less server resources</li>
            <li>Works offline after download</li>
          </ul>
        </div>
        <div className="card-eng p-4" style={{ borderTop: "3px solid #10b981" }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "#10b981", margin: "0 0 8px" }}>
            IMAP - Sync & Stay
          </h4>
          <ul style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
            <li>Emails remain on the server</li>
            <li>Synced across all devices</li>
            <li>Supports folders, search, flags on server</li>
            <li>Requires more server storage</li>
            <li>Modern default (Gmail, Outlook, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                                */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "Which protocol is used to SEND email from a client to a mail server?",
    options: ["POP3", "IMAP", "SMTP", "FTP"],
    correctIndex: 2,
    explanation: "SMTP (Simple Mail Transfer Protocol) is used for sending and relaying emails. POP3 and IMAP are for retrieving emails.",
  },
  {
    question: "What is the key difference between POP3 and IMAP?",
    options: [
      "POP3 is encrypted, IMAP is not",
      "POP3 downloads and deletes emails; IMAP keeps them on the server",
      "IMAP uses UDP while POP3 uses TCP",
      "POP3 supports folders, IMAP does not",
    ],
    correctIndex: 1,
    explanation: "POP3 typically downloads emails and removes them from the server (single device), while IMAP keeps emails on the server for multi-device access.",
  },
  {
    question: "In FTP active mode, who initiates the data connection?",
    options: ["The client", "The server", "The router", "Both simultaneously"],
    correctIndex: 1,
    explanation: "In active mode, the server initiates the data connection from its port 20 to the client's specified port. This can be blocked by client-side firewalls.",
  },
  {
    question: "Why is FTP passive mode preferred over active mode?",
    options: [
      "It is faster for large files",
      "It uses only one connection instead of two",
      "The client initiates both connections, making it firewall-friendly",
      "It encrypts data automatically",
    ],
    correctIndex: 2,
    explanation: "In passive mode, the client initiates both the control and data connections. Since all connections are outbound from the client, it works well behind NAT and firewalls.",
  },
  {
    question: "What port does SMTP use for email submission (with STARTTLS)?",
    options: ["25", "110", "587", "993"],
    correctIndex: 2,
    explanation: "Port 587 is the standard submission port for SMTP with STARTTLS encryption. Port 25 is used for server-to-server relay.",
  },
];

/* ================================================================== */
/*  Main Export                                                         */
/* ================================================================== */

export default function CN_L5_SMTPFTPActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "email",
      label: "Email",
      icon: <Mail className="w-4 h-4" />,
      content: <EmailLifecycleTab />,
    },
    {
      id: "ftp",
      label: "FTP",
      icon: <FolderOpen className="w-4 h-4" />,
      content: <FTPTab />,
    },
    {
      id: "compare",
      label: "Compare",
      icon: <Layers className="w-4 h-4" />,
      content: <CompareTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="SMTP, FTP & Email Protocols"
      level={5}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="DHCP & Network Configuration"
      placementRelevance="Low"
    />
  );
}
