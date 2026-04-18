"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Server, GitBranch, Target, Info, Play, RotateCcw } from "lucide-react";
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
/*  Helpers                                                            */
/* ================================================================== */

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return NaN;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}

function maskFromPrefix(prefix: number): number {
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

/* ================================================================== */
/*  Types & Data                                                       */
/* ================================================================== */

interface Router {
  id: string;
  label: string;
  x: number;
  y: number;
  table: { dest: string; mask: string; nextHop: string; iface: string }[];
}

interface Link {
  from: string;
  to: string;
  cost: number;
}

const ROUTERS: Router[] = [
  {
    id: "R1", label: "R1", x: 80, y: 160,
    table: [
      { dest: "10.0.0.0", mask: "/8", nextHop: "direct", iface: "eth0" },
      { dest: "172.16.0.0", mask: "/16", nextHop: "R2", iface: "eth1" },
      { dest: "192.168.0.0", mask: "/24", nextHop: "R2", iface: "eth1" },
      { dest: "0.0.0.0", mask: "/0", nextHop: "R3", iface: "eth2" },
    ],
  },
  {
    id: "R2", label: "R2", x: 280, y: 80,
    table: [
      { dest: "10.0.0.0", mask: "/8", nextHop: "R1", iface: "eth0" },
      { dest: "172.16.0.0", mask: "/16", nextHop: "direct", iface: "eth1" },
      { dest: "192.168.0.0", mask: "/24", nextHop: "R4", iface: "eth2" },
      { dest: "0.0.0.0", mask: "/0", nextHop: "R3", iface: "eth3" },
    ],
  },
  {
    id: "R3", label: "R3", x: 280, y: 240,
    table: [
      { dest: "10.0.0.0", mask: "/8", nextHop: "R1", iface: "eth0" },
      { dest: "172.16.0.0", mask: "/16", nextHop: "R2", iface: "eth1" },
      { dest: "192.168.0.0", mask: "/24", nextHop: "R4", iface: "eth2" },
      { dest: "0.0.0.0", mask: "/0", nextHop: "direct", iface: "eth3" },
    ],
  },
  {
    id: "R4", label: "R4", x: 480, y: 160,
    table: [
      { dest: "10.0.0.0", mask: "/8", nextHop: "R2", iface: "eth0" },
      { dest: "172.16.0.0", mask: "/16", nextHop: "R2", iface: "eth0" },
      { dest: "192.168.0.0", mask: "/24", nextHop: "direct", iface: "eth1" },
      { dest: "0.0.0.0", mask: "/0", nextHop: "R3", iface: "eth2" },
    ],
  },
];

const LINKS: Link[] = [
  { from: "R1", to: "R2", cost: 2 },
  { from: "R1", to: "R3", cost: 5 },
  { from: "R2", to: "R3", cost: 1 },
  { from: "R2", to: "R4", cost: 3 },
  { from: "R3", to: "R4", cost: 4 },
];

function getRouter(id: string): Router | undefined {
  return ROUTERS.find((r) => r.id === id);
}

/* ================================================================== */
/*  Longest-prefix-match algorithm, frame by frame                    */
/* ================================================================== */

interface RouteRow {
  dest: string;
  mask: string;
  nextHop: string;
  iface: string;
  prefix: number;
  destInt: number;
  maskInt: number;
}

interface RoutingFrame {
  line: number;
  vars: Record<string, string | number | boolean | undefined>;
  message: string;
  routerId: string;
  rowStates: ("default" | "active" | "match" | "mismatch" | "done")[];
  bestIdx: number | null;
  bestLen: number;
  pathSoFar: string[];
  currentRouter: string;
  flashKeys?: string[];
}

const ROUTING_PSEUDO = [
  "function route(packet, dest):",
  "  while current != destination-network:",
  "    best = default-route",
  "    for each entry in routingTable:",
  "      if (dest AND entry.mask) == entry.dest:",
  "        if entry.prefix > best.prefix:",
  "          best = entry               // longer match wins",
  "    if best.nextHop == 'direct': deliver; return",
  "    current = best.nextHop; forward(packet)",
];

function routerRows(router: Router): RouteRow[] {
  return router.table.map((t) => ({
    ...t,
    prefix: parseInt(t.mask.replace("/", ""), 10),
    destInt: ipToInt(t.dest),
    maskInt: maskFromPrefix(parseInt(t.mask.replace("/", ""), 10)),
  }));
}

function buildRoutingFrames(destIp: string, startRouter = "R1"): RoutingFrame[] {
  const frames: RoutingFrame[] = [];
  const destInt = ipToInt(destIp);
  if (isNaN(destInt)) {
    frames.push({
      line: 0,
      vars: { error: "Invalid IP" },
      message: `The IP "${destIp}" is not valid. Use dotted-quad format (e.g., 192.168.1.5).`,
      routerId: startRouter,
      rowStates: [],
      bestIdx: null,
      bestLen: -1,
      pathSoFar: [],
      currentRouter: startRouter,
    });
    return frames;
  }

  const path: string[] = [startRouter];
  let current = startRouter;
  const visited = new Set<string>();
  let hopCount = 0;

  frames.push({
    line: 0,
    vars: { dest: destIp, start: startRouter },
    message: `A packet destined for ${destIp} arrives at ${startRouter}. We need to forward it across the network using the routing table.`,
    routerId: current,
    rowStates: Array(getRouter(current)!.table.length).fill("default"),
    bestIdx: null,
    bestLen: -1,
    pathSoFar: [startRouter],
    currentRouter: current,
    flashKeys: ["dest"],
  });

  while (hopCount < 8) {
    if (visited.has(current)) {
      frames.push({
        line: 1,
        vars: { loop: current },
        message: `Loop detected at ${current}. Forwarding aborted.`,
        routerId: current,
        rowStates: Array(getRouter(current)!.table.length).fill("default"),
        bestIdx: null,
        bestLen: -1,
        pathSoFar: [...path],
        currentRouter: current,
      });
      break;
    }
    visited.add(current);
    hopCount++;
    const router = getRouter(current)!;
    const rows = routerRows(router);

    frames.push({
      line: 1,
      vars: { hop: hopCount, at: current, dest: destIp, tableSize: rows.length },
      message: `Hop ${hopCount}: scanning ${current}'s routing table. We'll check each entry for a match and keep the longest-prefix winner.`,
      routerId: current,
      rowStates: Array(rows.length).fill("default"),
      bestIdx: null,
      bestLen: -1,
      pathSoFar: [...path],
      currentRouter: current,
    });

    // Initialize with default route (prefix 0)
    let bestIdx = rows.findIndex((r) => r.prefix === 0);
    let bestLen = rows[bestIdx]?.prefix ?? -1;

    const rowStates: ("default" | "active" | "match" | "mismatch" | "done")[] = Array(rows.length).fill("default");
    if (bestIdx >= 0) rowStates[bestIdx] = "match";

    frames.push({
      line: 2,
      vars: { "best (so far)": rows[bestIdx]?.dest + rows[bestIdx]?.mask, bestLen },
      message: `Start with the default route ${rows[bestIdx]?.dest}${rows[bestIdx]?.mask} as the fallback. We'll upgrade if we find a longer match.`,
      routerId: current,
      rowStates: rowStates.slice(),
      bestIdx,
      bestLen,
      pathSoFar: [...path],
      currentRouter: current,
    });

    // Iterate entries in order
    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      // Mark row as active for this check
      const activeStates = rowStates.slice();
      if (activeStates[idx] !== "match") activeStates[idx] = "active";
      frames.push({
        line: 3,
        vars: {
          entry: `${row.dest}${row.mask}`,
          prefix: row.prefix,
          nextHop: row.nextHop,
        },
        message: `Examining entry ${idx + 1}: destination ${row.dest}${row.mask} (prefix /${row.prefix}).`,
        routerId: current,
        rowStates: activeStates,
        bestIdx,
        bestLen,
        pathSoFar: [...path],
        currentRouter: current,
      });

      const masked = (destInt & row.maskInt) >>> 0;
      const matches = masked === row.destInt;

      // Show the AND result vs entry.dest
      frames.push({
        line: 4,
        vars: {
          "dest AND mask": intToIp(masked),
          "entry.dest": row.dest,
          matches: matches ? "yes" : "no",
        },
        message: matches
          ? `(${destIp}) AND (${intToIp(row.maskInt)}) = ${intToIp(masked)}. That equals ${row.dest} - this entry MATCHES.`
          : `(${destIp}) AND (${intToIp(row.maskInt)}) = ${intToIp(masked)}. That does NOT equal ${row.dest} - skip.`,
        routerId: current,
        rowStates: (() => {
          const s = rowStates.slice();
          s[idx] = matches ? "match" : "mismatch";
          return s;
        })(),
        bestIdx,
        bestLen,
        pathSoFar: [...path],
        currentRouter: current,
        flashKeys: ["matches"],
      });

      if (matches) {
        if (row.prefix > bestLen) {
          // Upgrade
          // Demote previous best visually
          if (bestIdx !== null && bestIdx >= 0 && bestIdx !== idx) {
            rowStates[bestIdx] = "default";
          }
          bestIdx = idx;
          bestLen = row.prefix;
          rowStates[idx] = "match";
          frames.push({
            line: 5,
            vars: {
              "new best": `${row.dest}${row.mask}`,
              bestLen: row.prefix,
              nextHop: row.nextHop,
            },
            message: `Prefix /${row.prefix} is longer than the previous best (/${bestLen === row.prefix ? 0 : bestLen}). Upgrade this entry to the current best.`,
            routerId: current,
            rowStates: rowStates.slice(),
            bestIdx,
            bestLen,
            pathSoFar: [...path],
            currentRouter: current,
            flashKeys: ["new best"],
          });
        } else {
          // Matches but not longer - revert visual state
          rowStates[idx] = "default";
          frames.push({
            line: 5,
            vars: {
              "this prefix": row.prefix,
              "kept best": bestLen,
            },
            message: `Matches, but prefix /${row.prefix} is not longer than current best /${bestLen}. Keep the existing best.`,
            routerId: current,
            rowStates: rowStates.slice(),
            bestIdx,
            bestLen,
            pathSoFar: [...path],
            currentRouter: current,
          });
        }
      } else {
        // Clear mismatch marker on exit
        rowStates[idx] = "default";
      }
    }

    // Announce the winner
    const winner = bestIdx !== null && bestIdx >= 0 ? rows[bestIdx] : null;
    if (!winner) {
      frames.push({
        line: 7,
        vars: { result: "unreachable" },
        message: "No route found and no default. Packet dropped.",
        routerId: current,
        rowStates: Array(rows.length).fill("default"),
        bestIdx: null,
        bestLen: -1,
        pathSoFar: [...path],
        currentRouter: current,
      });
      break;
    }

    const winnerStates = Array(rows.length).fill("default") as (
      | "default"
      | "active"
      | "match"
      | "mismatch"
      | "done"
    )[];
    winnerStates[bestIdx!] = "done";
    frames.push({
      line: 6,
      vars: {
        "winner entry": `${winner.dest}${winner.mask}`,
        nextHop: winner.nextHop,
        iface: winner.iface,
      },
      message: `Longest match is ${winner.dest}${winner.mask} via ${winner.nextHop} on ${winner.iface}. This is the forwarding decision.`,
      routerId: current,
      rowStates: winnerStates,
      bestIdx,
      bestLen,
      pathSoFar: [...path],
      currentRouter: current,
      flashKeys: ["winner entry"],
    });

    if (winner.nextHop === "direct") {
      frames.push({
        line: 7,
        vars: {
          at: current,
          iface: winner.iface,
          dest: destIp,
        },
        message: `The matched network is directly connected on ${winner.iface}. Deliver ${destIp} to the link-layer - routing complete.`,
        routerId: current,
        rowStates: winnerStates,
        bestIdx,
        bestLen,
        pathSoFar: [...path],
        currentRouter: current,
        flashKeys: ["at"],
      });
      break;
    }

    // Forward to next hop
    path.push(winner.nextHop);
    frames.push({
      line: 8,
      vars: {
        from: current,
        to: winner.nextHop,
        hop: hopCount,
      },
      message: `Forward the packet: ${current} -> ${winner.nextHop}. Now ${winner.nextHop} repeats the process.`,
      routerId: winner.nextHop,
      rowStates: Array(getRouter(winner.nextHop)!.table.length).fill("default"),
      bestIdx: null,
      bestLen: -1,
      pathSoFar: [...path],
      currentRouter: winner.nextHop,
      flashKeys: ["to"],
    });

    current = winner.nextHop;
  }

  return frames;
}

/* ================================================================== */
/*  Network Topology SVG (used in Routing tab)                         */
/* ================================================================== */

function TopologyGraph({
  path,
  activeRouter,
}: {
  path: string[];
  activeRouter: string;
}) {
  return (
    <svg viewBox="0 0 560 320" style={{ width: "100%", maxHeight: 300 }}>
      {LINKS.map((link) => {
        const fromR = getRouter(link.from)!;
        const toR = getRouter(link.to)!;
        const isOnPath =
          path.length > 0 &&
          path.some(
            (r, i) =>
              i < path.length - 1 &&
              ((r === link.from && path[i + 1] === link.to) ||
                (r === link.to && path[i + 1] === link.from)),
          );
        return (
          <g key={`${link.from}-${link.to}`}>
            <line
              x1={fromR.x}
              y1={fromR.y}
              x2={toR.x}
              y2={toR.y}
              stroke={isOnPath ? "#3b82f6" : "var(--eng-border)"}
              strokeWidth={isOnPath ? 3 : 1.5}
              style={{ transition: "all 0.3s" }}
            />
            <text
              x={(fromR.x + toR.x) / 2 + 8}
              y={(fromR.y + toR.y) / 2 - 8}
              fontSize={10}
              fill="var(--eng-text-muted)"
              fontFamily="var(--eng-font)"
              fontWeight={500}
            >
              cost: {link.cost}
            </text>
          </g>
        );
      })}

      {ROUTERS.map((router) => {
        const isOnPath = path.includes(router.id);
        const isCurrent = router.id === activeRouter;
        return (
          <g key={router.id}>
            <circle
              cx={router.x}
              cy={router.y}
              r={isCurrent ? 26 : 22}
              fill={isCurrent ? "#3b82f6" : isOnPath ? "#bfdbfe" : "var(--eng-surface)"}
              stroke={isCurrent ? "#3b82f6" : isOnPath ? "#3b82f6" : "var(--eng-border)"}
              strokeWidth={isCurrent ? 3 : 1.5}
              style={{ transition: "all 0.3s" }}
            />
            <text
              x={router.x}
              y={router.y + 4}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill={isCurrent ? "#fff" : "var(--eng-text)"}
              fontFamily="var(--eng-font)"
            >
              {router.label}
            </text>
            {isCurrent && (
              <circle cx={router.x} cy={router.y - 32} r={6} fill="#f59e0b">
                <animate attributeName="r" values="4;8;4" dur="0.8s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}

      <text x={20} y={290} fontSize={10} fill="#3b82f6" fontFamily="var(--eng-font)" fontWeight={500}>
        10.0.0.0/8
      </text>
      <text x={240} y={30} fontSize={10} fill="#8b5cf6" fontFamily="var(--eng-font)" fontWeight={500}>
        172.16.0.0/16
      </text>
      <text x={440} y={290} fontSize={10} fill="#10b981" fontFamily="var(--eng-font)" fontWeight={500}>
        192.168.0.0/24
      </text>
      <text x={240} y={310} fontSize={10} fill="#f59e0b" fontFamily="var(--eng-font)" fontWeight={500}>
        Internet (default)
      </text>
    </svg>
  );
}

/* ================================================================== */
/*  Routing Table Visualization                                       */
/* ================================================================== */

function RoutingTableView({
  router,
  rowStates,
  bestIdx,
}: {
  router: Router;
  rowStates: ("default" | "active" | "match" | "mismatch" | "done")[];
  bestIdx: number | null;
}) {
  const colorFor = (s: string) => {
    switch (s) {
      case "active":
        return { bg: "rgba(59,130,246,0.10)", border: "#3b82f6", text: "var(--eng-text)" };
      case "match":
        return { bg: "rgba(245,158,11,0.12)", border: "#f59e0b", text: "var(--eng-text)" };
      case "mismatch":
        return { bg: "rgba(239,68,68,0.08)", border: "var(--eng-border)", text: "var(--eng-text-muted)" };
      case "done":
        return { bg: "rgba(16,185,129,0.12)", border: "#10b981", text: "var(--eng-text)" };
      default:
        return { bg: "transparent", border: "var(--eng-border)", text: "var(--eng-text)" };
    }
  };

  return (
    <div
      style={{
        padding: 12,
        borderRadius: "var(--eng-radius)",
        border: "1px solid var(--eng-border)",
        background: "var(--eng-bg)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--eng-font)",
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "var(--eng-text)",
          marginBottom: 8,
        }}
      >
        {router.label} Routing Table
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0 4px",
          fontFamily: "var(--eng-font)",
          fontSize: "0.78rem",
        }}
      >
        <thead>
          <tr>
            {["Destination", "Mask", "Next Hop", "Iface"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "4px 8px",
                  textAlign: "left",
                  color: "var(--eng-text-muted)",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {router.table.map((entry, i) => {
            const s = rowStates[i] ?? "default";
            const c = colorFor(s);
            const isWinner = bestIdx === i && s === "done";
            return (
              <tr
                key={i}
                style={{
                  background: c.bg,
                  transition: "all 0.25s ease",
                }}
              >
                <td
                  style={{
                    padding: "6px 8px",
                    fontFamily: "monospace",
                    color: c.text,
                    borderLeft: `3px solid ${c.border}`,
                    borderTop: `1px solid ${c.border}`,
                    borderBottom: `1px solid ${c.border}`,
                    borderRadius: "4px 0 0 4px",
                    fontWeight: isWinner ? 700 : 400,
                  }}
                >
                  {entry.dest}
                </td>
                <td
                  style={{
                    padding: "6px 8px",
                    fontFamily: "monospace",
                    color: c.text,
                    borderTop: `1px solid ${c.border}`,
                    borderBottom: `1px solid ${c.border}`,
                  }}
                >
                  {entry.mask}
                </td>
                <td
                  style={{
                    padding: "6px 8px",
                    color: c.text,
                    borderTop: `1px solid ${c.border}`,
                    borderBottom: `1px solid ${c.border}`,
                    fontWeight: isWinner ? 700 : 400,
                  }}
                >
                  {entry.nextHop}
                </td>
                <td
                  style={{
                    padding: "6px 8px",
                    fontFamily: "monospace",
                    color: c.text,
                    borderTop: `1px solid ${c.border}`,
                    borderRight: `1px solid ${c.border}`,
                    borderBottom: `1px solid ${c.border}`,
                    borderRadius: "0 4px 4px 0",
                  }}
                >
                  {entry.iface}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================== */
/*  Tab 1 - Routing (AlgoCanvas + longest-prefix match)                */
/* ================================================================== */

function RoutingTab() {
  const [destInput, setDestInput] = useState("192.168.0.5");
  const dest = useMemo(() => {
    return isNaN(ipToInt(destInput)) ? "192.168.0.5" : destInput;
  }, [destInput]);

  const frames = useMemo(() => buildRoutingFrames(dest, "R1"), [dest]);
  const player = useStepPlayer(frames);
  const frame = player.current!;
  const currentRouter = getRouter(frame.currentRouter)!;

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>
          Each router scans its table and picks the entry whose <code>(destIP AND mask) == entry.dest</code> with the LONGEST prefix. Then forwards to the next hop. Step through to see the rule applied.
        </span>
      </div>

      <AlgoCanvas
        title={`Longest-Prefix-Match: packet to ${dest}`}
        player={player}
        input={
          <InputEditor
            label="Destination IP"
            value={destInput}
            onApply={setDestInput}
            presets={[
              { label: "10.5.2.1", value: "10.5.2.1" },
              { label: "172.16.3.100", value: "172.16.3.100" },
              { label: "192.168.0.50", value: "192.168.0.50" },
              { label: "8.8.8.8 (internet)", value: "8.8.8.8" },
              { label: "10.1.1.1", value: "10.1.1.1" },
            ]}
            placeholder="e.g. 192.168.0.5"
            helper="Packet enters at R1 and hops via longest-prefix match."
          />
        }
        pseudocode={<PseudocodePanel lines={ROUTING_PSEUDO} activeLine={frame.line} />}
        variables={<VariablesPanel vars={frame.vars} flashKeys={frame.flashKeys} />}
        status={frame.message}
        legend={
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <LegendSwatch color="#3b82f6" label="Being checked" />
            <LegendSwatch color="#f59e0b" label="Current best match" />
            <LegendSwatch color="#10b981" label="Winner (forward)" />
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              padding: 12,
              borderRadius: "var(--eng-radius)",
              background: "var(--eng-surface)",
              border: "1px solid var(--eng-border)",
            }}
          >
            <TopologyGraph path={frame.pathSoFar} activeRouter={frame.currentRouter} />
            {frame.pathSoFar.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.78rem",
                  color: "var(--eng-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--eng-text)" }}>Path:</span>
                {frame.pathSoFar.map((r, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span
                      className="tag-eng"
                      style={{
                        background: "#3b82f6",
                        color: "#fff",
                        padding: "2px 8px",
                        fontSize: "0.72rem",
                      }}
                    >
                      {r}
                    </span>
                    {i < frame.pathSoFar.length - 1 && (
                      <span style={{ color: "var(--eng-text-muted)", fontSize: "0.85rem" }}>-&gt;</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          <RoutingTableView router={currentRouter} rowStates={frame.rowStates} bestIdx={frame.bestIdx} />
        </div>
      </AlgoCanvas>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--eng-font)",
        fontSize: "0.72rem",
        color: "var(--eng-text-muted)",
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

/* ================================================================== */
/*  Tab 2 - Distance Vector vs Link State                              */
/* ================================================================== */

interface DVEntry {
  dest: string;
  cost: number;
  via: string;
}

function AlgorithmsTab() {
  const [algo, setAlgo] = useState<"dv" | "ls">("dv");
  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [dvTables, setDvTables] = useState<Record<string, DVEntry[]>>(() => {
    const init: Record<string, DVEntry[]> = {};
    for (const r of ROUTERS) {
      init[r.id] = ROUTERS.map((dest) => ({
        dest: dest.id,
        cost: r.id === dest.id ? 0 : Infinity,
        via: r.id === dest.id ? "-" : "?",
      }));
      for (const link of LINKS) {
        if (link.from === r.id) {
          const idx = init[r.id].findIndex((e) => e.dest === link.to);
          if (idx >= 0) { init[r.id][idx].cost = link.cost; init[r.id][idx].via = link.to; }
        } else if (link.to === r.id) {
          const idx = init[r.id].findIndex((e) => e.dest === link.from);
          if (idx >= 0) { init[r.id][idx].cost = link.cost; init[r.id][idx].via = link.from; }
        }
      }
    }
    return init;
  });

  const runDVRound = useCallback(() => {
    setDvTables((prev) => {
      const next: Record<string, DVEntry[]> = {};
      for (const r of ROUTERS) {
        next[r.id] = prev[r.id].map((entry) => ({ ...entry }));
      }

      for (const r of ROUTERS) {
        const neighbors: { id: string; cost: number }[] = [];
        for (const link of LINKS) {
          if (link.from === r.id) neighbors.push({ id: link.to, cost: link.cost });
          else if (link.to === r.id) neighbors.push({ id: link.from, cost: link.cost });
        }

        for (const neighbor of neighbors) {
          const neighborTable = prev[neighbor.id];
          for (const nEntry of neighborTable) {
            if (nEntry.cost === Infinity) continue;
            const newCost = neighbor.cost + nEntry.cost;
            const existing = next[r.id].find((e) => e.dest === nEntry.dest);
            if (existing && newCost < existing.cost) {
              existing.cost = newCost;
              existing.via = neighbor.id;
            }
          }
        }
      }

      return next;
    });
    setRound((r) => r + 1);
  }, []);

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      if (animRef.current) clearInterval(animRef.current);
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    animRef.current = setInterval(() => {
      setRound((prev) => {
        if (prev >= 5) {
          if (animRef.current) clearInterval(animRef.current);
          setIsPlaying(false);
          return prev;
        }
        return prev;
      });
      runDVRound();
    }, 1200);
  }, [isPlaying, runDVRound]);

  const handleReset = useCallback(() => {
    if (animRef.current) clearInterval(animRef.current);
    setIsPlaying(false);
    setRound(0);
    const init: Record<string, DVEntry[]> = {};
    for (const r of ROUTERS) {
      init[r.id] = ROUTERS.map((dest) => ({
        dest: dest.id,
        cost: r.id === dest.id ? 0 : Infinity,
        via: r.id === dest.id ? "-" : "?",
      }));
      for (const link of LINKS) {
        if (link.from === r.id) {
          const idx = init[r.id].findIndex((e) => e.dest === link.to);
          if (idx >= 0) { init[r.id][idx].cost = link.cost; init[r.id][idx].via = link.to; }
        } else if (link.to === r.id) {
          const idx = init[r.id].findIndex((e) => e.dest === link.from);
          if (idx >= 0) { init[r.id][idx].cost = link.cost; init[r.id][idx].via = link.from; }
        }
      }
    }
    setDvTables(init);
  }, []);

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>Compare Distance Vector (Bellman-Ford) and Link State (Dijkstra) routing algorithms. Watch routers exchange information and converge round by round.</span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className={algo === "dv" ? "btn-eng" : "btn-eng-outline"} onClick={() => setAlgo("dv")} style={{ fontSize: "0.85rem" }}>
          Distance Vector
        </button>
        <button className={algo === "ls" ? "btn-eng" : "btn-eng-outline"} onClick={() => setAlgo("ls")} style={{ fontSize: "0.85rem" }}>
          Link State
        </button>
      </div>

      {algo === "dv" ? (
        <>
          <div className="card-eng" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span className="tag-eng" style={{ background: "var(--eng-primary-light)", color: "var(--eng-primary)" }}>
                Round {round}
              </span>
              <button className="btn-eng" onClick={runDVRound} style={{ fontSize: "0.8rem" }}>
                Step (1 Round)
              </button>
              <button className="btn-eng-outline" onClick={handlePlay} style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
                <Play className="w-3.5 h-3.5" /> {isPlaying ? "Pause" : "Auto Play"}
              </button>
              <button className="btn-eng-outline" onClick={handleReset} style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <div className="card-eng" style={{ padding: 20 }}>
            <svg viewBox="0 0 560 280" style={{ width: "100%", maxHeight: 280 }}>
              {LINKS.map((link) => {
                const fromR = getRouter(link.from)!;
                const toR = getRouter(link.to)!;
                return (
                  <g key={`${link.from}-${link.to}`}>
                    <line x1={fromR.x} y1={fromR.y} x2={toR.x} y2={toR.y}
                      stroke="var(--eng-border)" strokeWidth={1.5} />
                    {round > 0 && (
                      <>
                        <circle r={4} fill="#f59e0b">
                          <animateMotion
                            path={`M${fromR.x},${fromR.y} L${toR.x},${toR.y}`}
                            dur="1s" repeatCount="indefinite"
                          />
                        </circle>
                        <circle r={4} fill="#8b5cf6">
                          <animateMotion
                            path={`M${toR.x},${toR.y} L${fromR.x},${fromR.y}`}
                            dur="1s" repeatCount="indefinite"
                          />
                        </circle>
                      </>
                    )}
                  </g>
                );
              })}
              {ROUTERS.map((router) => (
                <g key={router.id}>
                  <circle cx={router.x} cy={router.y} r={22} fill="var(--eng-surface)" stroke="#3b82f6" strokeWidth={2} />
                  <text x={router.x} y={router.y + 4} textAnchor="middle" fontSize={12} fontWeight={700}
                    fill="var(--eng-text)" fontFamily="var(--eng-font)">
                    {router.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {ROUTERS.map((router) => (
              <div key={router.id} className="card-eng" style={{ padding: 12 }}>
                <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 700, color: "var(--eng-text)", marginBottom: 8 }}>
                  {router.label} Distance Vector
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.75rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid var(--eng-border)" }}>
                      <th style={{ padding: "4px 6px", textAlign: "left", color: "var(--eng-text-muted)" }}>Dest</th>
                      <th style={{ padding: "4px 6px", textAlign: "center", color: "var(--eng-text-muted)" }}>Cost</th>
                      <th style={{ padding: "4px 6px", textAlign: "left", color: "var(--eng-text-muted)" }}>Via</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dvTables[router.id]?.map((entry) => (
                      <tr key={entry.dest} style={{ borderBottom: "1px solid var(--eng-border)" }}>
                        <td style={{ padding: "4px 6px", fontWeight: 500 }}>{entry.dest}</td>
                        <td style={{ padding: "4px 6px", textAlign: "center", color: entry.cost === Infinity ? "var(--eng-danger)" : "var(--eng-success)", fontWeight: 600 }}>
                          {entry.cost === Infinity ? "INF" : entry.cost}
                        </td>
                        <td style={{ padding: "4px 6px" }}>{entry.via}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card-eng" style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "#3b82f6", margin: "0 0 12px" }}>
                Distance Vector
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--eng-font)", fontSize: "0.85rem" }}>
                {[
                  { label: "Algorithm", value: "Bellman-Ford" },
                  { label: "Knowledge", value: "Neighbors only" },
                  { label: "Shares", value: "Full routing table" },
                  { label: "Convergence", value: "Slow (may loop)" },
                  { label: "Complexity", value: "O(V * E)" },
                  { label: "Problem", value: "Count-to-infinity" },
                  { label: "Example", value: "RIP" },
                ].map((item) => (
                  <div key={item.label} style={{ padding: 8, borderRadius: 6, background: "var(--eng-surface)", border: "1px solid var(--eng-border)" }}>
                    <span style={{ color: "var(--eng-text-muted)", fontSize: "0.75rem" }}>{item.label}: </span>
                    <span style={{ color: "var(--eng-text)", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "#8b5cf6", margin: "0 0 12px" }}>
                Link State
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--eng-font)", fontSize: "0.85rem" }}>
                {[
                  { label: "Algorithm", value: "Dijkstra" },
                  { label: "Knowledge", value: "Entire topology" },
                  { label: "Shares", value: "Link state info only" },
                  { label: "Convergence", value: "Fast (no loops)" },
                  { label: "Complexity", value: "O(V^2) or O(V log V)" },
                  { label: "Problem", value: "High memory/CPU" },
                  { label: "Example", value: "OSPF, IS-IS" },
                ].map((item) => (
                  <div key={item.label} style={{ padding: 8, borderRadius: 6, background: "var(--eng-surface)", border: "1px solid var(--eng-border)" }}>
                    <span style={{ color: "var(--eng-text-muted)", fontSize: "0.75rem" }}>{item.label}: </span>
                    <span style={{ color: "var(--eng-text)", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <svg viewBox="0 0 560 120" style={{ width: "100%" }}>
              <text x={140} y={15} textAnchor="middle" fontSize={10} fontWeight={600} fill="#3b82f6" fontFamily="var(--eng-font)">Distance Vector: Share table with neighbors</text>
              <rect x={40} y={25} width={40} height={30} rx={4} fill="#3b82f6" opacity={0.8} />
              <text x={60} y={44} textAnchor="middle" fontSize={9} fill="#fff" fontFamily="var(--eng-font)" fontWeight={600}>R1</text>
              <line x1={82} y1={40} x2={118} y2={40} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowDV)" />
              <rect x={120} y={25} width={40} height={30} rx={4} fill="#3b82f6" opacity={0.8} />
              <text x={140} y={44} textAnchor="middle" fontSize={9} fill="#fff" fontFamily="var(--eng-font)" fontWeight={600}>R2</text>
              <text x={100} y={68} textAnchor="middle" fontSize={7} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">[full table]</text>

              <text x={420} y={15} textAnchor="middle" fontSize={10} fontWeight={600} fill="#8b5cf6" fontFamily="var(--eng-font)">Link State: Flood link info to all</text>
              {[320, 370, 420, 470].map((x, i) => (
                <g key={i}>
                  <rect x={x} y={25} width={40} height={30} rx={4} fill="#8b5cf6" opacity={0.8} />
                  <text x={x + 20} y={44} textAnchor="middle" fontSize={9} fill="#fff" fontFamily="var(--eng-font)" fontWeight={600}>R{i + 1}</text>
                </g>
              ))}
              {[[340, 390], [340, 440], [340, 490], [390, 440], [390, 490], [440, 490]].map(([x1, x2], i) => (
                <line key={i} x1={x1} y1={57} x2={x2} y2={57} stroke="#8b5cf6" strokeWidth={0.8} opacity={0.5} />
              ))}
              <text x={420} y={80} textAnchor="middle" fontSize={7} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">[everyone knows topology]</text>

              <defs>
                <marker id="arrowDV" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                  <path d="M0,0 L6,2 L0,4" fill="#3b82f6" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 - Practice: Edit Routing Tables                              */
/* ================================================================== */

function PracticeTab() {
  const [editableTable, setEditableTable] = useState([
    { dest: "10.0.0.0/8", nextHop: "R2", interface: "eth1" },
    { dest: "172.16.0.0/16", nextHop: "", interface: "" },
    { dest: "192.168.0.0/24", nextHop: "", interface: "" },
    { dest: "0.0.0.0/0", nextHop: "", interface: "" },
  ]);
  const [packetDest, setPacketDest] = useState("192.168.0.5");
  const [traceResult, setTraceResult] = useState<string>("");

  const handleTableChange = useCallback((idx: number, field: "nextHop" | "interface", value: string) => {
    setEditableTable((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const handleTrace = useCallback(() => {
    const destInt = ipToInt(packetDest);
    if (isNaN(destInt)) {
      setTraceResult(`Invalid IP: "${packetDest}"`);
      return;
    }
    let matchedEntry: typeof editableTable[0] | null = null;
    let bestLen = -1;

    for (const entry of editableTable) {
      const parts = entry.dest.split("/");
      const prefix = parseInt(parts[1], 10);
      const entryInt = ipToInt(parts[0]);
      if (isNaN(entryInt) || isNaN(prefix)) continue;
      const mask = maskFromPrefix(prefix);
      if (((destInt & mask) >>> 0) === entryInt && prefix > bestLen) {
        matchedEntry = entry;
        bestLen = prefix;
      }
    }

    if (matchedEntry && matchedEntry.nextHop) {
      setTraceResult(`Packet to ${packetDest} matched "${matchedEntry.dest}" (longest /${bestLen}) -> forwarded to ${matchedEntry.nextHop} via ${matchedEntry.interface || "?"}`);
    } else {
      setTraceResult("No matching route found or next hop is empty. Fill in the routing table entries!");
    }
  }, [editableTable, packetDest]);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>Complete the routing table for R1 by filling in the next hop and interface fields. Then trace packets to see which route is matched.</span>
      </div>

      <div className="card-eng" style={{ padding: 20, overflowX: "auto" }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
          R1 Routing Table (Edit next hop and interface)
        </h4>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
              {["Destination", "Next Hop", "Interface"].map((h) => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "var(--eng-text-muted)", fontWeight: 600, fontSize: "0.8rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {editableTable.map((entry, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--eng-border)" }}>
                <td style={{ padding: "8px 10px", fontFamily: "monospace", fontWeight: 500 }}>{entry.dest}</td>
                <td style={{ padding: "8px 10px" }}>
                  <input
                    type="text" value={entry.nextHop}
                    onChange={(e) => handleTableChange(i, "nextHop", e.target.value)}
                    placeholder="e.g. R2"
                    style={{ padding: "4px 8px", borderRadius: 4, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", width: 100, background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}
                  />
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <input
                    type="text" value={entry.interface}
                    onChange={(e) => handleTableChange(i, "interface", e.target.value)}
                    placeholder="e.g. eth0"
                    style={{ padding: "4px 8px", borderRadius: 4, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", width: 100, background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-eng" style={{ padding: 20 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 12 }}>
          Trace a Packet
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text" value={packetDest} onChange={(e) => setPacketDest(e.target.value)}
            placeholder="Destination IP"
            style={{ flex: 1, minWidth: 160, padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}
          />
          <button className="btn-eng" onClick={handleTrace} style={{ fontSize: "0.85rem" }}>Trace</button>
        </div>
        {traceResult && (
          <div className="eng-fadeIn" style={{
            marginTop: 12, padding: 12, borderRadius: 8,
            background: traceResult.includes("No matching") || traceResult.includes("Invalid") ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
            border: `1px solid ${traceResult.includes("No matching") || traceResult.includes("Invalid") ? "var(--eng-danger)" : "var(--eng-success)"}`,
            fontFamily: "var(--eng-font)", fontSize: "0.85rem",
            color: traceResult.includes("No matching") || traceResult.includes("Invalid") ? "var(--eng-danger)" : "var(--eng-success)",
          }}>
            {traceResult}
          </div>
        )}
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 8 }}>
          Network Topology Reference
        </p>
        <svg viewBox="0 0 500 200" style={{ width: "100%", maxHeight: 200 }}>
          {LINKS.map((link) => {
            const fromR = getRouter(link.from)!;
            const toR = getRouter(link.to)!;
            return (
              <line key={`${link.from}-${link.to}`} x1={fromR.x} y1={fromR.y} x2={toR.x} y2={toR.y}
                stroke="var(--eng-border)" strokeWidth={1.5} />
            );
          })}
          {ROUTERS.map((r) => (
            <g key={r.id}>
              <circle cx={r.x} cy={r.y} r={18} fill="var(--eng-surface)" stroke="var(--eng-primary)" strokeWidth={1.5} />
              <text x={r.x} y={r.y + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--eng-text)" fontFamily="var(--eng-font)">{r.label}</text>
            </g>
          ))}
          <text x={20} y={200} fontSize={8} fill="#3b82f6" fontFamily="var(--eng-font)">10.0.0.0/8</text>
          <text x={240} y={15} fontSize={8} fill="#8b5cf6" fontFamily="var(--eng-font)">172.16.0.0/16</text>
          <text x={420} y={200} fontSize={8} fill="#10b981" fontFamily="var(--eng-font)">192.168.0.0/24</text>
        </svg>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "What does 'longest prefix match' mean in IP routing?",
    options: [
      "Match the route with the longest destination address",
      "Match the route with the most specific (longest) subnet mask",
      "Match the route that was added first",
      "Match the route with the longest path",
    ],
    correctIndex: 1,
    explanation: "Longest prefix match selects the routing entry with the most specific (longest) matching subnet prefix, providing the most accurate route.",
  },
  {
    question: "In Distance Vector routing, each router shares its routing table with:",
    options: ["All routers in the network", "Only its direct neighbors", "The central controller", "Only the destination router"],
    correctIndex: 1,
    explanation: "In Distance Vector routing (like RIP), each router shares its entire routing table only with its directly connected neighbors.",
  },
  {
    question: "Which routing algorithm uses Dijkstra's algorithm?",
    options: ["RIP", "OSPF", "BGP", "Static routing"],
    correctIndex: 1,
    explanation: "OSPF (Open Shortest Path First) is a link-state protocol that uses Dijkstra's shortest path algorithm.",
  },
  {
    question: "What is the 'count to infinity' problem associated with?",
    options: ["Link State routing", "Distance Vector routing", "Static routing", "Default routing"],
    correctIndex: 1,
    explanation: "The count-to-infinity problem occurs in Distance Vector routing when routers slowly increment the metric for an unreachable destination.",
  },
  {
    question: "Given a routing table with entries for 10.0.0.0/8 and 10.1.0.0/16, a packet to 10.1.5.3 will match:",
    options: ["10.0.0.0/8", "10.1.0.0/16", "Both equally", "Neither"],
    correctIndex: 1,
    explanation: "10.1.0.0/16 is a longer prefix match (more specific) than 10.0.0.0/8, so it takes priority.",
  },
];

/* ================================================================== */
/*  Main Activity Component                                            */
/* ================================================================== */

const tabs: EngTabDef[] = [
  { id: "routing", label: "Routing", icon: <Server className="w-4 h-4" />, content: <RoutingTab /> },
  { id: "algorithms", label: "Algorithms", icon: <GitBranch className="w-4 h-4" />, content: <AlgorithmsTab /> },
  { id: "practice", label: "Practice", icon: <Target className="w-4 h-4" />, content: <PracticeTab /> },
];

export default function CN_L3_IPRoutingActivity() {
  return (
    <EngineeringLessonShell
      title="IP Routing & Forwarding"
      level={3}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="IPv6 Basics"
      placementRelevance="Medium"
    />
  );
}
