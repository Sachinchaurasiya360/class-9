"use client";

import Link from "next/link";
import { Sparkles, Compass, Lightbulb, ArrowRight } from "lucide-react";
import { CAREERS } from "@/data/careers";
import CareerCard from "@/components/career/CareerCard";

export default function CareerHubPage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div>
        <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Career Paths
        </p>
        <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground mt-1">
          <span className="marker-highlight-yellow">Your AI Career Starts Here</span>
        </h1>
        <p className="font-hand text-base text-muted-foreground mt-2 max-w-2xl">
          Explore 10 AI careers, see what each one looks like day-to-day, and
          find the Indian colleges and skills that will get you there.
        </p>
      </div>

      {/* Quiz CTA */}
      <Link
        href="/career/quiz"
        className="card-sketchy p-5 flex items-center gap-4 block group"
        style={{ background: "var(--accent-coral)" }}
      >
        <div
          className="w-14 h-14 rounded-xl border-2 border-foreground flex items-center justify-center flex-shrink-0"
          style={{ background: "#fff8e7", boxShadow: "2px 2px 0 #2b2a35" }}
          aria-hidden
        >
          <Compass className="w-7 h-7 text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-foreground" />
            <h2 className="font-hand text-lg sm:text-xl font-bold text-foreground">
              Not sure which career fits?
            </h2>
          </div>
          <p className="font-hand text-sm text-foreground/85 mt-1">
            Take the 15-question quiz - about 2 minutes - and we&apos;ll rank
            your top matches.
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-foreground font-hand text-sm font-bold flex-shrink-0"
          style={{ background: "var(--accent-yellow)", boxShadow: "2px 2px 0 #2b2a35" }}
        >
          Take quiz
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>

      {/* Careers grid */}
      <div>
        <h2 className="font-hand text-xl font-bold text-foreground mb-3">
          Browse all 10 AI careers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAREERS.map((career) => (
            <CareerCard key={career.slug} career={career} />
          ))}
        </div>
      </div>

      {/* Tip */}
      <div
        className="card-sketchy p-4 flex items-start gap-3"
        style={{ background: "var(--accent-mint)" }}
      >
        <Lightbulb className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
        <p className="font-hand text-sm text-foreground leading-snug">
          <span className="font-bold">Don&apos;t stress -</span> your career
          path will evolve. Pick something that excites you now, build a few
          projects, and let your curiosity pull you forward.
        </p>
      </div>
    </div>
  );
}
