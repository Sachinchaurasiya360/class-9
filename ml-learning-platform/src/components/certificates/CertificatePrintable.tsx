"use client";

import { ACCENT_VAR, type CertificateDef } from "@/data/certificatesCatalog";

interface CertificatePrintableProps {
  cert: CertificateDef;
  studentName: string;
  verificationCode: string;
}

const KIND_LABEL: Record<CertificateDef["kind"], string> = {
  module: "Module Certificate",
  track: "Track Certificate",
  project: "Project Certificate",
  "exam-prep": "Exam Prep Certificate",
};

/**
 * Format today's date as "April 12, 2026".
 * Uses the browser's current date at render time - since this component is
 * only mounted when the user clicks "View", the date is the view date.
 */
function formatToday(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CertificatePrintable({
  cert,
  studentName,
  verificationCode,
}: CertificatePrintableProps) {
  const accent = ACCENT_VAR[cert.accent];
  const date = formatToday();

  return (
    <>
      {/* Print-only CSS - hides everything except this certificate when printing */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5in;
          }
          body * {
            visibility: hidden !important;
          }
          .rpl-certificate-printable,
          .rpl-certificate-printable * {
            visibility: visible !important;
          }
          .rpl-certificate-printable {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .rpl-no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="rpl-certificate-printable relative bg-white mx-auto w-full max-w-4xl aspect-[1.4/1] p-6 sm:p-10"
        style={{
          border: `8px solid var(--accent-yellow)`,
          outline: `2px solid var(--foreground)`,
          outlineOffset: "-14px",
          fontFamily: "var(--font-hand), cursive",
        }}
      >
        {/* Corner decorations */}
        <div
          className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4"
          style={{ borderColor: "var(--foreground)" }}
          aria-hidden
        />
        <div
          className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4"
          style={{ borderColor: "var(--foreground)" }}
          aria-hidden
        />
        <div
          className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4"
          style={{ borderColor: "var(--foreground)" }}
          aria-hidden
        />
        <div
          className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4"
          style={{ borderColor: "var(--foreground)" }}
          aria-hidden
        />

        <div className="relative h-full flex flex-col items-center justify-between text-center py-4 px-4 sm:py-8 sm:px-8">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-3xl" aria-hidden>
              🐼
            </span>
            <span className="font-hand text-xl sm:text-2xl font-bold text-foreground">
              Red Panda Learn
            </span>
          </div>

          {/* Title block */}
          <div className="space-y-1 sm:space-y-2 mt-2">
            <p className="font-hand text-[10px] sm:text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {KIND_LABEL[cert.kind]}
            </p>
            <h1 className="font-hand text-2xl sm:text-4xl font-bold text-foreground">
              Certificate of Achievement
            </h1>
            <div className="mx-auto w-16 sm:w-24 h-1 bg-foreground/80 rounded" aria-hidden />
          </div>

          {/* Recipient */}
          <div className="space-y-1 sm:space-y-2">
            <p className="font-hand text-sm sm:text-base text-muted-foreground italic">
              This certifies that
            </p>
            <p className="font-hand text-2xl sm:text-4xl font-bold text-foreground px-4 py-1 sm:py-2">
              {studentName}
            </p>
            <p className="font-hand text-sm sm:text-base text-muted-foreground italic">
              has successfully completed
            </p>
            <p className="font-hand text-xl sm:text-3xl font-bold text-foreground pt-1 sm:pt-2">
              <span
                className="px-2 py-0.5"
                style={{ background: accent, boxDecorationBreak: "clone" }}
              >
                {cert.title}
              </span>
            </p>
          </div>

          {/* Description */}
          <p className="font-hand text-xs sm:text-sm text-foreground/80 max-w-2xl mx-auto px-2 leading-snug">
            {cert.description}
          </p>

          {/* Bottom row - verification code + date */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-2 text-left text-[10px] sm:text-xs">
            <div>
              <p className="font-hand uppercase tracking-wider text-muted-foreground">
                Verification Code
              </p>
              <p className="font-mono font-bold text-foreground">
                {verificationCode}
              </p>
            </div>

            <div className="flex items-center gap-2" aria-hidden>
              <span className="text-2xl">🐼</span>
              <div className="text-center">
                <div
                  className="w-28 sm:w-40 h-0.5 bg-foreground/60"
                  aria-hidden
                />
                <p className="font-hand text-muted-foreground mt-0.5">
                  Red Panda Learn
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-hand uppercase tracking-wider text-muted-foreground">
                Date Awarded
              </p>
              <p className="font-hand font-bold text-foreground">{date}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
