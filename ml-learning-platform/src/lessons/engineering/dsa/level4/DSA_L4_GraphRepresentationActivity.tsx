"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import { GraphCanvas, InputEditor } from "@/components/engineering/algo";
import type { GraphNodeData, GraphEdgeData } from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Graph parsing - edge list format: "A-B:5, B-C:3, A-C:10"           */
/* ------------------------------------------------------------------ */

interface ParsedGraph {
  nodeIds: string[];
  edges: { from: string; to: string; weight?: number }[];
}

function parseEdgeList(input: string): ParsedGraph | null {
  const tokens = input.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean);
  if (tokens.length === 0) return null;
  const edges: { from: string; to: string; weight?: number }[] = [];
  const ids = new Set<string>();
  for (const tok of tokens) {
    const m = tok.match(/^([A-Za-z0-9_]+)[-:]([A-Za-z0-9_]+)(?::(-?\d+))?$/);
    if (!m) return null;
    const [, a, b, w] = m;
    edges.push({ from: a, to: b, weight: w !== undefined ? Number(w) : undefined });
    ids.add(a); ids.add(b);
  }
  return { nodeIds: [...ids].sort(), edges };
}

function autoLayout(ids: string[], cx = 340, cy = 170, r = 120): Record<string, { x: number; y: number }> {
  const n = ids.length;
  const out: Record<string, { x: number; y: number }> = {};
  ids.forEach((id, i) => {
    const ang = (2 * Math.PI * i) / Math.max(1, n) - Math.PI / 2;
    out[id] = { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
  });
  return out;
}

/* ------------------------------------------------------------------ */
/*  Visualize tab                                                      */
/* ------------------------------------------------------------------ */

function VisualizeTab() {
  const [inputStr, setInputStr] = useState("A-B:4, A-C:2, B-C:3, B-D:5, C-D:1, D-E:6");
  const [directed, setDirected] = useState(false);
  const parsed = parseEdgeList(inputStr);

  const { nodes, edges, adj, matrix, ids } = useMemo(() => {
    const p = parsed ?? { nodeIds: [], edges: [] };
    const pos = autoLayout(p.nodeIds);
    const nodes: GraphNodeData[] = p.nodeIds.map((id) => ({ id, x: pos[id].x, y: pos[id].y, label: id }));
    const edges: GraphEdgeData[] = p.edges.map((e) => ({ from: e.from, to: e.to, weight: e.weight, directed }));
    const adj: Record<string, { to: string; w?: number }[]> = Object.fromEntries(p.nodeIds.map((id) => [id, []]));
    const matrix: (number | null)[][] = p.nodeIds.map(() => p.nodeIds.map(() => null));
    const idx: Record<string, number> = {};
    p.nodeIds.forEach((id, i) => (idx[id] = i));
    for (const e of p.edges) {
      adj[e.from].push({ to: e.to, w: e.weight });
      matrix[idx[e.from]][idx[e.to]] = e.weight ?? 1;
      if (!directed) {
        adj[e.to].push({ to: e.from, w: e.weight });
        matrix[idx[e.to]][idx[e.from]] = e.weight ?? 1;
      }
    }
    return { nodes, edges, adj, matrix, ids: p.nodeIds };
  }, [parsed, directed]);

  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--eng-border)", background: "var(--eng-surface)" }}>
          <InputEditor
            label="Edge list (A-B:weight - weight optional)"
            value={inputStr}
            placeholder="e.g. A-B:4, B-C:3, A-C:10"
            helper="Comma-separated edges. Toggle directed/undirected below."
            presets={[
              { label: "Triangle", value: "A-B:2, B-C:3, A-C:4" },
              { label: "Path", value: "A-B:1, B-C:2, C-D:3, D-E:4" },
              { label: "Star", value: "A-B, A-C, A-D, A-E" },
              { label: "Dense", value: "A-B:4, A-C:2, B-C:3, B-D:5, C-D:1, D-E:6, A-E:7" },
            ]}
            onApply={(v) => { if (parseEdgeList(v)) setInputStr(v); }}
          />
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Graph type
            </span>
            <button
              onClick={() => setDirected(false)}
              className={directed ? "btn-eng-outline" : "btn-eng"}
              style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            >Undirected</button>
            <button
              onClick={() => setDirected(true)}
              className={directed ? "btn-eng" : "btn-eng-outline"}
              style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            >Directed</button>
          </div>
        </div>

        <div style={{ padding: 16, background: "#fff" }}>
          <GraphCanvas nodes={nodes} edges={edges} />
        </div>
      </div>

      {/* Side-by-side: Matrix + List */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14 }}>
        <div className="card-eng" style={{ padding: 14 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Adjacency Matrix
          </div>
          {ids.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.78rem" }}>
                <thead>
                  <tr>
                    <th style={{ padding: 4 }}></th>
                    {ids.map((id) => (
                      <th key={id} style={{ padding: "4px 8px", fontWeight: 700, color: "var(--eng-text-muted)", fontSize: "0.72rem" }}>{id}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ids.map((rowId, i) => (
                    <tr key={rowId}>
                      <td style={{ padding: "4px 8px", fontWeight: 700, color: "var(--eng-text-muted)", fontSize: "0.72rem" }}>{rowId}</td>
                      {ids.map((_, j) => {
                        const v = matrix[i][j];
                        const has = v !== null;
                        return (
                          <td key={j} style={{
                            width: 34, height: 34, textAlign: "center",
                            border: "1px solid var(--eng-border)",
                            background: has ? "rgba(59,130,246,0.14)" : "var(--eng-surface)",
                            color: has ? "var(--eng-primary)" : "var(--eng-text-muted)",
                            fontWeight: 700,
                            transition: "all 0.3s",
                          }}>
                            {has ? v : "0"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div style={{ fontSize: "0.78rem", color: "var(--eng-text-muted)" }}>Add edges to see matrix.</div>}
          <div style={{ fontSize: "0.7rem", color: "var(--eng-text-muted)", marginTop: 8 }}>
            Space: O(V²). Edge check: O(1).
          </div>
        </div>

        <div className="card-eng" style={{ padding: 14 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Adjacency List
          </div>
          {ids.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ids.map((id) => (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    minWidth: 28, padding: "4px 8px", textAlign: "center",
                    borderRadius: 6, background: "var(--eng-primary)", color: "#fff",
                    fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.78rem", fontWeight: 700,
                  }}>{id}</span>
                  <span style={{ color: "var(--eng-text-muted)", fontSize: "0.8rem" }}>→</span>
                  {adj[id].length === 0 ? (
                    <span style={{ fontSize: "0.75rem", color: "var(--eng-text-muted)", fontStyle: "italic" }}>∅</span>
                  ) : adj[id].map((nb, i) => (
                    <span key={i} style={{
                      padding: "3px 8px", borderRadius: 6,
                      background: "rgba(59,130,246,0.12)", color: "var(--eng-primary)",
                      fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.75rem", fontWeight: 700,
                      border: "1px solid rgba(59,130,246,0.3)",
                    }}>
                      {nb.to}{nb.w !== undefined ? `:${nb.w}` : ""}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : <div style={{ fontSize: "0.78rem", color: "var(--eng-text-muted)" }}>Add edges to see list.</div>}
          <div style={{ fontSize: "0.7rem", color: "var(--eng-text-muted)", marginTop: 8 }}>
            Space: O(V+E). Edge check: O(deg(v)).
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn tab                                                          */
/* ------------------------------------------------------------------ */

function LearnTab() {
  const sections = [
    { title: "What is a graph?", body: "A graph G = (V, E) is a pair: V is a set of vertices (nodes), E is a set of edges (connections between pairs of vertices). Edges can be directed or undirected, weighted or unweighted." },
    { title: "Adjacency matrix", body: "An n×n boolean or integer matrix M where M[u][v] = 1 (or weight) if edge u→v exists. Space O(V²). Checking 'is there an edge?' is O(1) - but iterating neighbors of v takes O(V)." },
    { title: "Adjacency list", body: "Each vertex stores a list of its neighbors. Space O(V + E) - much smaller for sparse graphs. Iterating neighbors is O(deg(v)). Checking a specific edge is O(deg(v)). BFS/DFS love this layout." },
    { title: "When to use which?", body: "Dense graph (|E| ≈ V²) or frequent edge queries → matrix. Sparse graph (|E| ≪ V²) or traversal-heavy → list. Real-world graphs (social, web, road) are sparse - lists dominate." },
  ];
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--eng-text)", margin: "0 0 6px" }}>Mental model</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          A graph is the most general data structure in CS. Trees are graphs, linked lists are graphs, the road network is a graph, the internet is a graph. How you represent it in memory determines whether an algorithm runs in O(V+E) or O(V²).
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {sections.map((s, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-primary)", marginBottom: 4 }}>0{i + 1}</div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--eng-text)", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Try tab                                                            */
/* ------------------------------------------------------------------ */

function TryTab() {
  const problems = [
    { q: "Graph has 5 vertices. Adjacency matrix uses how much space (cells)?", a: "25" },
    { q: "Graph with V=6, E=8 as adjacency list. Total space order (V + 2E for undirected)?", a: "22" },
    { q: "Given edges A-B, B-C, A-C, how many rows in the adjacency list?", a: "3" },
  ];
  const [guesses, setGuesses] = useState<string[]>(problems.map(() => ""));
  const [shown, setShown] = useState<boolean[]>(problems.map(() => false));

  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        Work each out on paper, then reveal. Space accounting matters in interviews.
      </div>
      {problems.map((p, i) => {
        const correct = guesses[i].trim() === p.a;
        return (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.88rem", color: "var(--eng-text)", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "var(--eng-text-muted)" }}>#{i + 1}. </span>{p.q}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text" value={guesses[i]}
                onChange={(e) => { const v = [...guesses]; v[i] = e.target.value; setGuesses(v); }}
                placeholder="your answer"
                style={{ width: 100, padding: "6px 8px", borderRadius: 6, border: "1px solid var(--eng-border)", fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.85rem" }}
              />
              <button onClick={() => { const v = [...shown]; v[i] = true; setShown(v); }} className="btn-eng-outline" style={{ fontSize: "0.78rem", padding: "5px 12px" }}>
                Reveal
              </button>
              {shown[i] && (
                <span style={{
                  fontSize: "0.82rem", fontWeight: 700,
                  color: correct ? "var(--eng-success)" : "var(--eng-danger)",
                  padding: "3px 10px", borderRadius: 6,
                  background: correct ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                }}>
                  {correct ? `Correct - ${p.a}` : `Answer: ${p.a}`}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Insight tab                                                        */
/* ------------------------------------------------------------------ */

function InsightTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Why representation matters</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          BFS/DFS on adjacency list run in O(V+E). On adjacency matrix they run in O(V²) regardless of how few edges exist - the matrix forces you to scan a whole row for each vertex. For a social graph with a billion users and only a few hundred friends each, that&apos;s the difference between seconds and years.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Interview-style quick reference</h3>
        <ul style={{ fontSize: "0.86rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>Matrix: space O(V²), add-edge O(1), has-edge O(1), neighbors O(V).</li>
          <li>List: space O(V+E), add-edge O(1), has-edge O(deg), neighbors O(deg).</li>
          <li>For undirected graphs each edge appears twice in the list.</li>
          <li>Handshaking lemma: Σ deg(v) = 2|E|.</li>
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity                                                           */
/* ------------------------------------------------------------------ */

export default function DSA_L4_GraphRepresentationActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];

  const quiz: EngQuizQuestion[] = [
    {
      question: "Which representation uses Θ(V²) space regardless of the number of edges?",
      options: ["Adjacency list", "Edge list", "Adjacency matrix", "Incidence matrix"],
      correctIndex: 2,
      explanation: "Adjacency matrix is fixed V×V cells. Even a graph with 0 edges still uses V² cells.",
    },
    {
      question: "For a sparse graph with V=10⁴ and E=2·10⁴, which representation is more memory-efficient?",
      options: ["Matrix (faster anyway)", "List - O(V+E) ≈ 5·10⁴ vs 10⁸ cells", "They are equal", "Neither - use hash"],
      correctIndex: 1,
      explanation: "Matrix would need 10⁸ cells. List uses O(V+E) ≈ 3·10⁴ entries. Huge difference for sparse graphs.",
    },
    {
      question: "In an undirected adjacency list, how many total entries across all lists does an edge {u,v} create?",
      options: ["1", "2", "V", "deg(u)"],
      correctIndex: 1,
      explanation: "The edge appears in u's list (pointing to v) and in v's list (pointing to u). Hence Σ deg = 2|E|.",
    },
    {
      question: "Which operation is O(1) on an adjacency matrix but O(deg(v)) on an adjacency list?",
      options: ["Iterate all neighbors of v", "Check whether edge (u,v) exists", "Add a new vertex", "Count total edges"],
      correctIndex: 1,
      explanation: "M[u][v] is a direct lookup - constant time. In a list you must scan u's neighbor list to confirm v is there.",
    },
  ];

  return (
    <EngineeringLessonShell
      title="Graph Representation"
      level={4}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="High - every graph problem starts here"
      nextLessonHint="Breadth-First Search (BFS)"
    />
  );
}
