"use client";

import { ArrowDown } from "lucide-react";

interface SkillTreeProps {
  skills: { name: string; why: string }[];
}

/**
 * Visual skill ordering - not a real tree, just a vertical flow of
 * sketchy cards connected by arrows. Each node shows a skill name and
 * a short justification.
 */
export default function SkillTree({ skills }: SkillTreeProps) {
  if (skills.length === 0) {
    return (
      <p className="font-hand text-sm text-muted-foreground italic">
        No skills listed yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0">
      {skills.map((skill, i) => (
        <div key={`${skill.name}-${i}`} className="w-full flex flex-col items-center">
          <div
            className="card-sketchy p-4 w-full max-w-md text-center"
            style={{
              background:
                i % 3 === 0
                  ? "var(--accent-yellow)"
                  : i % 3 === 1
                    ? "var(--accent-mint)"
                    : "var(--accent-peach)",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-foreground font-hand font-bold text-sm"
                style={{ background: "#fff8e7" }}
              >
                {i + 1}
              </span>
              <h4 className="font-hand text-base font-bold text-foreground">
                {skill.name}
              </h4>
            </div>
            <p className="font-hand text-xs text-foreground/80 leading-snug mt-1">
              {skill.why}
            </p>
          </div>

          {i < skills.length - 1 && (
            <div className="flex flex-col items-center py-2" aria-hidden>
              <ArrowDown className="w-5 h-5 text-foreground/60" strokeWidth={2.5} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
