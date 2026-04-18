"use client";

import { useState, useEffect } from "react";
import { Lock, ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight, Home, Network, Globe, Layers, Shield, Wifi, Radio, Server, MonitorSmartphone, Cloud, Cpu, ArrowLeft } from "lucide-react";
import { useEngProgress, isEngLessonUnlocked } from "../../utils/engineeringProgress";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LessonDef {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface LevelDef {
  level: number;
  title: string;
  lessons: LessonDef[];
}

interface SubjectDef {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  color: string;
  levels: LevelDef[];
}

/* ------------------------------------------------------------------ */
/*  Computer Networks Data                                             */
/* ------------------------------------------------------------------ */

const CN_LEVELS: LevelDef[] = [
  {
    level: 1,
    title: "Foundations of Networking",
    lessons: [
      { path: "/engineering/cn/level1/what-is-network", label: "What is a Computer Network?", icon: <Network className="w-4 h-4" /> },
      { path: "/engineering/cn/level1/topologies", label: "Network Topologies", icon: <Globe className="w-4 h-4" /> },
      { path: "/engineering/cn/level1/osi-model", label: "The OSI Model - 7 Layers", icon: <Layers className="w-4 h-4" /> },
      { path: "/engineering/cn/level1/tcp-ip-model", label: "The TCP/IP Model", icon: <Server className="w-4 h-4" /> },
      { path: "/engineering/cn/level1/switching", label: "Switching Techniques", icon: <Radio className="w-4 h-4" /> },
    ],
  },
  {
    level: 2,
    title: "Physical & Data Link Layer",
    lessons: [
      { path: "/engineering/cn/level2/physical-layer", label: "Physical Layer - Signals", icon: <Radio className="w-4 h-4" /> },
      { path: "/engineering/cn/level2/framing-error-detection", label: "Framing & Error Detection", icon: <Shield className="w-4 h-4" /> },
      { path: "/engineering/cn/level2/arq-protocols", label: "ARQ Protocols", icon: <ArrowLeft className="w-4 h-4" /> },
      { path: "/engineering/cn/level2/mac-protocols", label: "Medium Access Control", icon: <Wifi className="w-4 h-4" /> },
      { path: "/engineering/cn/level2/ethernet-lan", label: "Ethernet & LAN Standards", icon: <MonitorSmartphone className="w-4 h-4" /> },
      { path: "/engineering/cn/level2/network-devices", label: "Network Devices Compared", icon: <Server className="w-4 h-4" /> },
    ],
  },
  {
    level: 3,
    title: "Network Layer",
    lessons: [
      { path: "/engineering/cn/level3/ipv4-addressing", label: "IPv4 Addressing", icon: <Globe className="w-4 h-4" /> },
      { path: "/engineering/cn/level3/subnetting-cidr", label: "Subnetting & CIDR", icon: <Network className="w-4 h-4" /> },
      { path: "/engineering/cn/level3/ip-routing", label: "IP Routing & Forwarding", icon: <Server className="w-4 h-4" /> },
      { path: "/engineering/cn/level3/ipv6", label: "IPv6 Basics", icon: <Globe className="w-4 h-4" /> },
      { path: "/engineering/cn/level3/nat-icmp-arp", label: "NAT, ICMP & ARP", icon: <Layers className="w-4 h-4" /> },
    ],
  },
  {
    level: 4,
    title: "Transport Layer",
    lessons: [
      { path: "/engineering/cn/level4/tcp-connection", label: "TCP - Connection Management", icon: <Network className="w-4 h-4" /> },
      { path: "/engineering/cn/level4/tcp-reliable-transfer", label: "TCP - Reliable Data Transfer", icon: <Shield className="w-4 h-4" /> },
      { path: "/engineering/cn/level4/tcp-congestion", label: "TCP - Congestion Control", icon: <Radio className="w-4 h-4" /> },
      { path: "/engineering/cn/level4/udp", label: "UDP - User Datagram Protocol", icon: <Wifi className="w-4 h-4" /> },
      { path: "/engineering/cn/level4/ports-multiplexing", label: "Port Numbers & Multiplexing", icon: <Layers className="w-4 h-4" /> },
    ],
  },
  {
    level: 5,
    title: "Application Layer",
    lessons: [
      { path: "/engineering/cn/level5/dns", label: "DNS - Domain Name System", icon: <Globe className="w-4 h-4" /> },
      { path: "/engineering/cn/level5/http", label: "HTTP - HyperText Transfer", icon: <MonitorSmartphone className="w-4 h-4" /> },
      { path: "/engineering/cn/level5/smtp-ftp", label: "SMTP, FTP & Email", icon: <Server className="w-4 h-4" /> },
      { path: "/engineering/cn/level5/dhcp", label: "DHCP & Network Config", icon: <Wifi className="w-4 h-4" /> },
    ],
  },
  {
    level: 6,
    title: "Network Security",
    lessons: [
      { path: "/engineering/cn/level6/cryptography", label: "Cryptography Basics", icon: <Shield className="w-4 h-4" /> },
      { path: "/engineering/cn/level6/tls-ssl", label: "TLS/SSL - Secure Comm", icon: <Lock className="w-4 h-4" /> },
      { path: "/engineering/cn/level6/firewalls-vpn", label: "Firewalls & VPN", icon: <Shield className="w-4 h-4" /> },
      { path: "/engineering/cn/level6/network-attacks", label: "Network Attacks & Defenses", icon: <Shield className="w-4 h-4" /> },
    ],
  },
  {
    level: 7,
    title: "Advanced Networking",
    lessons: [
      { path: "/engineering/cn/level7/sdn", label: "Software-Defined Networking", icon: <Cloud className="w-4 h-4" /> },
      { path: "/engineering/cn/level7/cdn", label: "Content Delivery Networks", icon: <Globe className="w-4 h-4" /> },
      { path: "/engineering/cn/level7/cloud-networking", label: "Cloud Networking", icon: <Cloud className="w-4 h-4" /> },
      { path: "/engineering/cn/level7/modern-protocols", label: "WebSockets, gRPC & More", icon: <Network className="w-4 h-4" /> },
      { path: "/engineering/cn/level7/proxy-gateway", label: "Proxy, Reverse Proxy & API Gateway", icon: <Shield className="w-4 h-4" /> },
      { path: "/engineering/cn/level7/url-end-to-end", label: "What Happens When You Type a URL", icon: <Globe className="w-4 h-4" /> },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Data Structures & Algorithms                                       */
/* ------------------------------------------------------------------ */

const DSA_LEVELS: LevelDef[] = [
  {
    level: 1,
    title: "Foundations of Computation",
    lessons: [
      { path: "/engineering/dsa/level1/algorithm-tracer", label: "What is an Algorithm?", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level1/big-o", label: "Time Complexity & Big-O", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level1/space-complexity", label: "Space Complexity", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level1/arrays", label: "Arrays - Fundamentals", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level1/strings", label: "Strings & Pattern Matching", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level1/two-pointer-window", label: "Two Pointer & Sliding Window", icon: <Cpu className="w-4 h-4" /> },
    ],
  },
  {
    level: 2,
    title: "Linear Data Structures",
    lessons: [
      { path: "/engineering/dsa/level2/singly-linked-list", label: "Singly Linked List", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level2/doubly-circular-list", label: "Doubly & Circular Lists", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level2/stacks", label: "Stacks - LIFO", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level2/queues", label: "Queues - FIFO", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level2/hashing", label: "Hashing & Collision Resolution", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level2/deque-special", label: "Deque & Special Queues", icon: <Cpu className="w-4 h-4" /> },
    ],
  },
  {
    level: 3,
    title: "Trees",
    lessons: [
      { path: "/engineering/dsa/level3/binary-tree-traversals", label: "Binary Tree & Traversals", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level3/bst", label: "Binary Search Tree", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level3/avl", label: "AVL - Self-Balancing BST", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level3/heaps", label: "Heaps & Priority Queues", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level3/tries", label: "Tries (Prefix Trees)", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level3/segment-fenwick", label: "Segment & Fenwick Trees", icon: <Cpu className="w-4 h-4" /> },
    ],
  },
  {
    level: 4,
    title: "Graphs",
    lessons: [
      { path: "/engineering/dsa/level4/graph-representation", label: "Graph Representation", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level4/bfs", label: "Breadth-First Search", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level4/dfs", label: "Depth-First Search", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level4/dijkstra", label: "Dijkstra's Shortest Path", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level4/bellman-ford", label: "Bellman-Ford & Negative Cycles", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level4/mst", label: "MST - Kruskal's & Prim's", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level4/topological-sort", label: "Topological Sort", icon: <Cpu className="w-4 h-4" /> },
    ],
  },
  {
    level: 5,
    title: "Sorting & Searching",
    lessons: [
      { path: "/engineering/dsa/level5/bubble-selection", label: "Bubble & Selection Sort", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level5/insertion", label: "Insertion Sort", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level5/merge", label: "Merge Sort", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level5/quick", label: "Quick Sort", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level5/non-comparison", label: "Counting / Radix / Bucket", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level5/binary-search", label: "Binary Search & Variants", icon: <Cpu className="w-4 h-4" /> },
    ],
  },
  {
    level: 6,
    title: "Algorithm Design Paradigms",
    lessons: [
      { path: "/engineering/dsa/level6/recursion", label: "Recursion - Thinking Recursively", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level6/backtracking", label: "Backtracking", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level6/divide-conquer", label: "Divide & Conquer", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level6/greedy", label: "Greedy Algorithms", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level6/dp-1d", label: "Dynamic Programming - 1D", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level6/dp-2d", label: "Dynamic Programming - 2D", icon: <Cpu className="w-4 h-4" /> },
    ],
  },
  {
    level: 7,
    title: "Advanced Topics",
    lessons: [
      { path: "/engineering/dsa/level7/dsu", label: "Disjoint Set Union", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level7/kmp", label: "KMP Pattern Matching", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level7/rabin-karp", label: "Rabin-Karp", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level7/bit-manipulation", label: "Bit Manipulation", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level7/advanced-graphs", label: "Advanced Graph Algorithms", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level7/advanced-ds", label: "Advanced Data Structures", icon: <Cpu className="w-4 h-4" /> },
    ],
  },
  {
    level: 8,
    title: "Problem-Solving Patterns",
    lessons: [
      { path: "/engineering/dsa/level8/sliding-window-advanced", label: "Sliding Window (Advanced)", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level8/binary-search-answer", label: "Binary Search on Answer", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level8/monotonic-stack", label: "Monotonic Stack / Queue", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level8/grid-to-graph", label: "Grid-to-Graph Modeling", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level8/dp-state-design", label: "DP State Design", icon: <Cpu className="w-4 h-4" /> },
      { path: "/engineering/dsa/level8/pattern-recognition", label: "Comprehensive Patterns", icon: <Cpu className="w-4 h-4" /> },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  All Subjects                                                       */
/* ------------------------------------------------------------------ */

export const ENGINEERING_SUBJECTS: SubjectDef[] = [
  {
    id: "cn",
    label: "Computer Networks",
    shortLabel: "CN",
    icon: <Network className="w-4 h-4" />,
    color: "var(--eng-accent-cn)",
    levels: CN_LEVELS,
  },
  {
    id: "dsa",
    label: "Data Structures & Algorithms",
    shortLabel: "DSA",
    icon: <Cpu className="w-4 h-4" />,
    color: "var(--eng-accent-dsa)",
    levels: DSA_LEVELS,
  },
];

/** Flat list of all CN lesson paths for navigation & progress (back-compat) */
export const CN_ALL_LESSONS = CN_LEVELS.flatMap((l) => l.lessons.map((ls) => ls.path));
export const CN_ALL_LESSONS_META = CN_LEVELS.flatMap((l) => l.lessons.map((ls) => ({ path: ls.path, label: ls.label })));
export const DSA_ALL_LESSONS = DSA_LEVELS.flatMap((l) => l.lessons.map((ls) => ls.path));
export const DSA_ALL_LESSONS_META = DSA_LEVELS.flatMap((l) => l.lessons.map((ls) => ({ path: ls.path, label: ls.label })));

/** Pick the subject that owns a given path (defaults to CN). */
export function getSubjectFromPath(pathname: string | null | undefined) {
  const p = pathname ?? "";
  return ENGINEERING_SUBJECTS.find((s) => p.startsWith(`/engineering/${s.id}/`)) ?? ENGINEERING_SUBJECTS[0];
}

/** Flat ordered lesson paths for the subject that owns a given path. */
export function getSubjectLessonPaths(pathname: string | null | undefined): string[] {
  const s = getSubjectFromPath(pathname);
  return s.levels.flatMap((l) => l.lessons.map((ls) => ls.path));
}

/** Lookup lesson label + level + lesson index for a given path. */
export function getLessonMeta(pathname: string | null | undefined): { label: string; level: number; lessonNumber: number; subject: string } | null {
  const s = getSubjectFromPath(pathname);
  for (const lvl of s.levels) {
    const idx = lvl.lessons.findIndex((ls) => ls.path === pathname);
    if (idx >= 0) {
      return { label: lvl.lessons[idx].label, level: lvl.level, lessonNumber: idx + 1, subject: s.label };
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Sidebar Component                                                  */
/* ------------------------------------------------------------------ */

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function EngineeringSidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const progress = useEngProgress();

  const subject = ENGINEERING_SUBJECTS.find((s) => pathname?.includes(`/engineering/${s.id}/`));
  const activeSubject = subject || ENGINEERING_SUBJECTS[0];
  const levels = activeSubject.levels;

  const allLessons = levels.flatMap((l) => l.lessons.map((ls) => ls.path));

  const currentLevelIdx = levels.findIndex((l) =>
    l.lessons.some((ls) => ls.path === pathname)
  );

  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    levels.forEach((_, i) => { init[i] = i === currentLevelIdx; });
    return init;
  });

  useEffect(() => {
    if (currentLevelIdx >= 0) {
      setExpandedLevels((prev) => (prev[currentLevelIdx] ? prev : { ...prev, [currentLevelIdx]: true }));
    }
  }, [currentLevelIdx]);

  function toggleLevel(idx: number) {
    setExpandedLevels((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  const completedCount = allLessons.filter((p) => progress.lessons.includes(p)).length;
  const totalCount = allLessons.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        style={{ fontFamily: "var(--eng-font)" }}
        className={`fixed top-0 left-0 z-50 h-full overflow-y-auto transition-all duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-16" : "w-72"}`}
        css-eng="true"
      >
        <div style={{ background: "var(--eng-surface)", borderRight: "1px solid var(--eng-border)", height: "100%" }}>

          {/* Header */}
          <div className={`p-4 flex items-center ${collapsed ? "justify-center" : "justify-between"}`} style={{ borderBottom: "1px solid var(--eng-border)" }}>
            {!collapsed && (
              <div>
                <Link href="/engineering" className="flex items-center gap-2 no-underline">
                  <Network className="w-5 h-5" style={{ color: "var(--eng-primary)" }} />
                  <span style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.1rem", color: "var(--eng-text)" }}>
                    Engineering
                  </span>
                </Link>
                <p style={{ fontSize: "0.7rem", color: "var(--eng-text-muted)", marginTop: 2 }}>
                  {activeSubject.label}
                </p>
              </div>
            )}
            {collapsed && <Network className="w-5 h-5" style={{ color: "var(--eng-primary)" }} />}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center"
              style={{
                padding: 6, borderRadius: 6, background: "transparent", border: "none", cursor: "pointer",
                color: "var(--eng-text-muted)", transition: "background 0.15s"
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Progress bar */}
          {!collapsed && (
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--eng-border)" }}>
              <div className="flex items-center justify-between" style={{ fontSize: "0.75rem", color: "var(--eng-text-muted)", marginBottom: 6 }}>
                <span>Progress</span>
                <span style={{ fontWeight: 600 }}>{completedCount}/{totalCount} lessons</span>
              </div>
              <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${progressPct}%`,
                    height: "100%",
                    background: activeSubject.color,
                    borderRadius: 3,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          )}

          {/* Home link */}
          <nav className="p-2">
            <Link
              href="/engineering"
              onClick={onClose}
              title={collapsed ? "All Subjects" : undefined}
              className="flex items-center rounded-lg text-sm transition-all no-underline"
              style={{
                padding: collapsed ? "8px 0" : "8px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 8,
                fontFamily: "var(--eng-font)",
                fontWeight: 500,
                color: pathname === "/engineering" ? "var(--eng-primary)" : "var(--eng-text-muted)",
                background: pathname === "/engineering" ? "var(--eng-primary-light)" : "transparent",
                borderRadius: 8,
              }}
            >
              <Home className="w-4 h-4" />
              {!collapsed && "All Subjects"}
            </Link>
          </nav>

          {/* Levels */}
          <nav className={`px-2 pb-4 space-y-0.5 ${collapsed ? "px-1" : ""}`}>
            {!collapsed && (
              <div style={{ padding: "8px 10px 4px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--eng-text-muted)" }}>
                Levels
              </div>
            )}

            {levels.map((lvl, idx) => {
              const levelLessons = lvl.lessons.map((ls) => ls.path);
              const doneInLevel = levelLessons.filter((p) => progress.lessons.includes(p)).length;
              const isCurrentLevel = lvl.lessons.some((ls) => ls.path === pathname);
              const expanded = expandedLevels[idx];

              return (
                <div key={idx}>
                  {/* Level header */}
                  <button
                    onClick={() => toggleLevel(idx)}
                    title={collapsed ? `Level ${lvl.level}: ${lvl.title}` : undefined}
                    className="w-full flex items-center text-left transition-all"
                    style={{
                      padding: collapsed ? "8px 0" : "7px 10px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: 8,
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--eng-font)",
                      fontSize: "0.8rem",
                      fontWeight: isCurrentLevel ? 700 : 500,
                      color: isCurrentLevel ? "var(--eng-primary)" : "var(--eng-text)",
                      background: isCurrentLevel ? "var(--eng-primary-light)" : "transparent",
                    }}
                    onMouseOver={(e) => {
                      if (!isCurrentLevel) e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseOut={(e) => {
                      if (!isCurrentLevel) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {!collapsed && (expanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />)}
                    {collapsed ? (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>{lvl.level}</span>
                    ) : (
                      <span className="flex-1 truncate">L{lvl.level}: {lvl.title}</span>
                    )}
                    {!collapsed && (
                      <span style={{ fontSize: "0.65rem", color: "var(--eng-text-muted)" }}>
                        {doneInLevel}/{lvl.lessons.length}
                      </span>
                    )}
                  </button>

                  {/* Lessons */}
                  {expanded && !collapsed && (
                    <div className="ml-4 pl-3 space-y-0.5" style={{ borderLeft: "1.5px solid var(--eng-border)" }}>
                      {lvl.lessons.map((lesson) => {
                        const isActive = pathname === lesson.path;
                        const unlocked = isEngLessonUnlocked(lesson.path, allLessons, progress);
                        const completed = progress.lessons.includes(lesson.path);

                        return (
                          <Link
                            key={lesson.path}
                            href={unlocked ? lesson.path : "#"}
                            onClick={(e) => {
                              if (!unlocked) e.preventDefault();
                              else onClose();
                            }}
                            className="flex items-center rounded-lg text-sm transition-all no-underline"
                            style={{
                              padding: "6px 10px",
                              gap: 8,
                              fontFamily: "var(--eng-font)",
                              fontWeight: isActive ? 600 : 400,
                              fontSize: "0.8rem",
                              color: !unlocked ? "#cbd5e1" : isActive ? "var(--eng-primary)" : "var(--eng-text)",
                              background: isActive ? "var(--eng-primary-light)" : "transparent",
                              borderRadius: 6,
                              cursor: unlocked ? "pointer" : "not-allowed",
                              opacity: unlocked ? 1 : 0.6,
                            }}
                          >
                            <span className="shrink-0 flex items-center justify-center" style={{ color: isActive ? "var(--eng-primary)" : undefined }}>
                              {!unlocked ? <Lock className="w-3.5 h-3.5" /> : lesson.icon}
                            </span>
                            <span className="flex-1 leading-tight truncate">{lesson.label}</span>
                            {completed && (
                              <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--eng-success)", background: "rgba(16,185,129,0.1)", padding: "1px 6px", borderRadius: 4 }}>
                                Done
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
