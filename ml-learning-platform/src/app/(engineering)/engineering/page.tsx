"use client";

import { Network, Cpu, MonitorSmartphone, Database, Code2, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

const SUBJECTS = [
  {
    id: "cn",
    title: "Computer Networks",
    desc: "Full networking stack: physical layer through application layer, security, modern networking. Master OSI, TCP/IP, routing, DNS, HTTP, and cloud networking.",
    icon: <Network className="w-8 h-8" />,
    color: "#3b82f6",
    levels: 7,
    lessons: 35,
    available: true,
    href: "/engineering/cn/level1/what-is-network",
    topics: ["OSI & TCP/IP Models", "IP Addressing & Subnetting", "TCP/UDP", "DNS & HTTP", "Network Security", "Cloud & CDN"],
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    desc: "Arrays, trees, graphs, sorting, searching, dynamic programming - complete DSA mastery for interviews and placements.",
    icon: <Cpu className="w-8 h-8" />,
    color: "#e76f51",
    levels: 8,
    lessons: 43,
    available: true,
    href: "/engineering/dsa/level1/algorithm-tracer",
    topics: ["Arrays & Strings", "Linked Lists & Stacks", "Trees & Graphs", "Sorting & Searching", "DP & Greedy"],
  },
  {
    id: "os",
    title: "Operating Systems",
    desc: "Process scheduling, memory management, deadlocks, file systems - everything for OS mastery.",
    icon: <MonitorSmartphone className="w-8 h-8" />,
    color: "#10b981",
    levels: 7,
    lessons: 35,
    available: false,
    href: "#",
    topics: ["Process Management", "CPU Scheduling", "Deadlocks", "Memory Management", "File Systems"],
  },
  {
    id: "dbms",
    title: "Database Management",
    desc: "SQL, normalization, transactions, indexing, ER diagrams - relational databases inside out.",
    icon: <Database className="w-8 h-8" />,
    color: "#f59e0b",
    levels: 7,
    lessons: 35,
    available: false,
    href: "#",
    topics: ["Relational Model", "SQL & Normalization", "Transactions", "Indexing & B-Trees", "Query Optimization"],
  },
  {
    id: "oop",
    title: "Object-Oriented Programming",
    desc: "Classes, inheritance, polymorphism, design patterns, SOLID principles.",
    icon: <Code2 className="w-8 h-8" />,
    color: "#8b5cf6",
    levels: 6,
    lessons: 30,
    available: false,
    href: "#",
    topics: ["Classes & Objects", "Inheritance", "Polymorphism", "Design Patterns", "SOLID Principles"],
  },
];

export default function EngineeringPage() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", padding: "40px 24px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Network className="w-5 h-5" style={{ color: "#fff" }} />
          </div>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "1.75rem", color: "var(--eng-text)", margin: 0, lineHeight: 1.2 }}>
              Engineering Track
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: 0 }}>
              B.Tech CSE - Placements, Interviews & Semester Exams
            </p>
          </div>
        </div>
      </div>

      {/* Subject grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {SUBJECTS.map((s) => (
          <Link
            key={s.id}
            href={s.available ? s.href : "#"}
            className="no-underline"
            style={{ cursor: s.available ? "pointer" : "not-allowed" }}
            onClick={(e) => { if (!s.available) e.preventDefault(); }}
          >
            <div
              className="card-eng eng-fadeIn"
              style={{
                padding: 24,
                position: "relative",
                overflow: "hidden",
                opacity: s.available ? 1 : 0.6,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseOver={(e) => { if (s.available) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--eng-shadow-lg)"; } }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--eng-shadow)"; }}
            >
              {/* Accent stripe */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />

              <div className="flex items-start gap-4">
                <div style={{ width: 48, height: 48, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--eng-text)", margin: 0 }}>
                      {s.title}
                    </h3>
                    {!s.available && (
                      <span className="tag-eng" style={{ background: "#f1f5f9", color: "var(--eng-text-muted)" }}>
                        <Lock className="w-3 h-3 mr-1" /> Coming Soon
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", margin: "0 0 12px", lineHeight: 1.5 }}>
                    {s.desc}
                  </p>
                  <div className="flex items-center gap-4" style={{ fontSize: "0.75rem", color: "var(--eng-text-muted)", marginBottom: 12 }}>
                    <span style={{ fontWeight: 600 }}>{s.levels} Levels</span>
                    <span style={{ color: "var(--eng-border)" }}>|</span>
                    <span style={{ fontWeight: 600 }}>{s.lessons} Lessons</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.topics.map((t) => (
                      <span key={t} style={{ fontSize: "0.7rem", fontWeight: 500, padding: "2px 8px", borderRadius: 4, background: `${s.color}10`, color: s.color }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {s.available && (
                <div className="flex items-center justify-end gap-1 mt-4" style={{ fontSize: "0.85rem", fontWeight: 600, color: s.color }}>
                  Start Learning <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
