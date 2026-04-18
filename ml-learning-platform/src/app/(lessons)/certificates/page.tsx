"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer, X } from "lucide-react";
import { useGamification } from "@/utils/gamification";
import { useProgress } from "@/utils/progress";
import {
  CERTIFICATES,
  ALL_LEVEL_LESSONS,
  LEVEL_1_LESSONS,
  LEVEL_2_LESSONS,
  LEVEL_3_LESSONS,
  LEVEL_4_LESSONS,
  LEVEL_5_LESSONS,
  LEVEL_6_LESSONS,
  LEVEL_7_LESSONS,
  LEVEL_8_LESSONS,
  type CertCheckCtx,
  type CertificateDef,
} from "@/data/certificatesCatalog";
import CertificateCard from "@/components/certificates/CertificateCard";
import CertificatePrintable from "@/components/certificates/CertificatePrintable";

const NAME_KEY = "rpl-display-name";
const DEFAULT_NAME = "Red Panda Learner";

/** Deterministic verification code: RPL-<prefix>-<lessonCount>-X<xp>. */
function makeVerificationCode(
  cert: CertificateDef,
  completedCount: number,
  xp: number,
): string {
  const prefix = cert.id
    .replace(/^rpl-/, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  const count = String(completedCount).padStart(4, "0");
  return `RPL-${prefix}-${count}-X${xp}`;
}

/**
 * Compute a short human "x / N" progress hint for locked certificates so
 * students know how close they are to earning each one.
 */
function progressHint(
  cert: CertificateDef,
  ctx: CertCheckCtx,
): string | undefined {
  const done = (target: string[]) =>
    target.filter((p) => ctx.completedLessons.includes(p)).length;

  switch (cert.id) {
    case "rpl-first-steps":
      return `${done(LEVEL_1_LESSONS)} / ${LEVEL_1_LESSONS.length} lessons`;
    case "rpl-data-literate":
      return `${done(LEVEL_2_LESSONS)} / ${LEVEL_2_LESSONS.length} lessons`;
    case "rpl-prediction-master":
      return `${done(LEVEL_3_LESSONS)} / ${LEVEL_3_LESSONS.length} lessons`;
    case "rpl-classic-ml":
      return `${done(LEVEL_4_LESSONS)} / ${LEVEL_4_LESSONS.length} lessons`;
    case "rpl-unsupervised":
      return `${done(LEVEL_5_LESSONS)} / ${LEVEL_5_LESSONS.length} lessons`;
    case "rpl-neural-architect":
      return `${done(LEVEL_6_LESSONS)} / ${LEVEL_6_LESSONS.length} lessons`;
    case "rpl-trainer":
      return `${done(LEVEL_7_LESSONS)} / ${LEVEL_7_LESSONS.length} lessons`;
    case "rpl-vision-engineer":
      return `${done(LEVEL_8_LESSONS)} / ${LEVEL_8_LESSONS.length} lessons`;
    case "rpl-full-track":
      return `${done(ALL_LEVEL_LESSONS)} / ${ALL_LEVEL_LESSONS.length} lessons`;
    case "rpl-builder":
      return `${ctx.projectsCompleted} / 1 projects`;
    case "rpl-board-ready":
      return `Best score: ${ctx.examBestScore}% · need 80%`;
    case "rpl-elite":
      return `${ctx.xp.toLocaleString()} / 10,000 XP`;
    default:
      return undefined;
  }
}

export default function CertificatesPage() {
  const g = useGamification();
  const p = useProgress();
  const [name, setName] = useState<string>(DEFAULT_NAME);
  const [viewing, setViewing] = useState<CertificateDef | null>(null);

  // Hydrate display name from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NAME_KEY);
      if (stored && stored.trim()) setName(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const handleNameChange = (v: string) => {
    setName(v);
    try {
      localStorage.setItem(NAME_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const ctx: CertCheckCtx = useMemo(
    () => ({
      completedLessons: p.lessons,
      totalLessons: ALL_LEVEL_LESSONS.length,
      xp: g.xp,
      projectsCompleted: g.stats.totalProjects,
      perfectQuizzes: g.stats.totalPerfectQuizzes,
      // No examProgress util exists yet - wire in when src/utils/examProgress.ts ships.
      examBestScore: 0,
    }),
    [p.lessons, g.xp, g.stats.totalProjects, g.stats.totalPerfectQuizzes],
  );

  const earned = useMemo(
    () => CERTIFICATES.filter((c) => c.isEarned(ctx)),
    [ctx],
  );
  const available = useMemo(
    () => CERTIFICATES.filter((c) => !c.isEarned(ctx)),
    [ctx],
  );

  const verificationCode = viewing
    ? makeVerificationCode(viewing, p.lessons.length, g.xp)
    : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Home
        </p>
        <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground mt-1">
          <span className="marker-highlight-mint">Your Certificates</span>
        </h1>
        <p className="font-hand text-sm text-muted-foreground mt-1">
          Proof of your AI journey
        </p>
      </div>

      {/* Stats + name input */}
      <div
        className="card-sketchy p-4 flex flex-col sm:flex-row sm:items-center gap-3"
        style={{ background: "#fff8e7" }}
      >
        <div className="flex-1">
          <p className="font-hand text-[11px] uppercase tracking-wider text-muted-foreground">
            Earned
          </p>
          <p className="font-hand text-2xl font-bold text-foreground leading-tight">
            {earned.length}{" "}
            <span className="text-muted-foreground text-base font-normal">
              / {CERTIFICATES.length}
            </span>
          </p>
        </div>
        <div className="flex-1">
          <label className="font-hand text-[11px] uppercase tracking-wider text-muted-foreground block">
            Name on certificate
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={DEFAULT_NAME}
            className="font-hand text-base font-bold text-foreground bg-background border-2 border-foreground rounded-lg px-3 py-1.5 w-full mt-1"
            maxLength={40}
          />
        </div>
      </div>

      {/* Earned section */}
      <section>
        <h2 className="font-hand text-xl font-bold text-foreground mb-3">
          <span className="marker-highlight-yellow">Earned</span>
          <span className="ml-2 text-sm text-muted-foreground font-normal">
            ({earned.length})
          </span>
        </h2>
        {earned.length === 0 ? (
          <div
            className="card-sketchy p-6 text-center"
            style={{ background: "#fff8e7" }}
          >
            <p className="font-hand text-sm text-muted-foreground">
              Complete your first module to earn a certificate.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {earned.map((cert) => (
              <CertificateCard
                key={cert.id}
                cert={cert}
                earned
                onView={() => setViewing(cert)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Available section */}
      <section>
        <h2 className="font-hand text-xl font-bold text-foreground mb-3">
          <span className="marker-highlight-coral">Available</span>
          <span className="ml-2 text-sm text-muted-foreground font-normal">
            ({available.length})
          </span>
        </h2>
        {available.length === 0 ? (
          <div
            className="card-sketchy p-6 text-center"
            style={{ background: "var(--accent-mint)" }}
          >
            <p className="font-hand text-sm font-bold text-foreground">
              All certificates earned. You&apos;re a Red Panda legend. 🐼
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {available.map((cert) => (
              <CertificateCard
                key={cert.id}
                cert={cert}
                earned={false}
                progressText={progressHint(cert, ctx)}
              />
            ))}
          </div>
        )}
      </section>

      {/* View modal */}
      {viewing && (
        <div
          className="rpl-no-print fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setViewing(null)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 rpl-no-print">
              <h3 className="font-hand text-lg font-bold text-background">
                {viewing.title}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-sketchy flex items-center gap-1.5 font-hand text-xs font-bold px-3 py-1.5"
                  type="button"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save as PDF
                </button>
                <button
                  onClick={() => setViewing(null)}
                  className="btn-sketchy-outline flex items-center gap-1.5 font-hand text-xs font-bold px-3 py-1.5 bg-background"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                  Close
                </button>
              </div>
            </div>

            <CertificatePrintable
              cert={viewing}
              studentName={name || DEFAULT_NAME}
              verificationCode={verificationCode}
            />
          </div>
        </div>
      )}
    </div>
  );
}
