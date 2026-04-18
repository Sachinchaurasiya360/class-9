"use client";

import { useMemo, useState } from "react";
import { Hammer, Trophy } from "lucide-react";
import { PROJECTS, type ProjectDef } from "@/data/projects";
import { useAllProjectDrafts } from "@/utils/projectDrafts";
import ProjectCard from "@/components/projects/ProjectCard";

type FilterKey = "all" | "guided" | "semi-guided" | "open-ended";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "guided", label: "Guided" },
  { key: "semi-guided", label: "Semi-guided" },
  { key: "open-ended", label: "Open-ended" },
];

export default function ProjectsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const drafts = useAllProjectDrafts();

  const visible: ProjectDef[] = useMemo(() => {
    if (filter === "all") return PROJECTS;
    return PROJECTS.filter((p) => p.type === filter);
  }, [filter]);

  const completedCount = PROJECTS.reduce(
    (n, p) => (drafts[p.slug]?.completed ? n + 1 : n),
    0,
  );
  const total = PROJECTS.length;
  const progressPct = Math.round((completedCount / total) * 100);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <header className="space-y-1">
        <div className="flex items-center gap-2 font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <Hammer className="w-3.5 h-3.5" />
          Projects
        </div>
        <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground">
          <span className="marker-highlight-yellow">Projects</span>
        </h1>
        <p className="font-hand text-base text-muted-foreground max-w-2xl">
          Build real AI projects you can show off. Each one walks you through a problem,
          the data, the approach and what you'd measure - save drafts any time.
        </p>
      </header>

      {/* Progress banner */}
      <div
        className="card-sketchy p-4 flex items-center gap-4"
        style={{ background: "#fff8e7" }}
      >
        <div
          className="w-11 h-11 rounded-full border-2 border-foreground flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-coral)", boxShadow: "2px 2px 0 #2b2a35" }}
          aria-hidden
        >
          <Trophy className="w-5 h-5 text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-hand text-sm font-bold text-foreground">
            Your progress: {completedCount} / {total} completed
          </p>
          <div className="mt-1.5 h-2.5 rounded-full border-2 border-foreground overflow-hidden bg-background">
            <div
              className="h-full transition-all"
              style={{ width: `${progressPct}%`, background: "var(--accent-mint)" }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={completedCount}
              aria-label="Projects completed"
            />
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects by type">
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              role="tab"
              aria-selected={active}
              className={`px-3.5 py-1.5 rounded-full font-hand text-sm font-bold border-2 border-foreground transition-all ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground bg-background hover:text-foreground"
              }`}
              style={{
                background: active ? "var(--accent-yellow)" : undefined,
                boxShadow: active ? "2px 2px 0 #2b2a35" : undefined,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="card-sketchy p-6 text-center">
          <p className="font-hand text-muted-foreground">
            No projects match this filter yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p) => (
            <ProjectCard key={p.slug} project={p} draft={drafts[p.slug] ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}
