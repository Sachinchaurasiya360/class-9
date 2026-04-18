"use client";

/* --------------------------------------------------------------------------
 * RikuAvatar - inline SVG of our red panda mascot. Kept scrappy on purpose
 * so it matches the sketchy-notebook vibe of the rest of the UI. All paths
 * are built from simple circles/ellipses + a couple of triangles so it
 * renders crisp at any size.
 * ------------------------------------------------------------------------ */

type Expression = "neutral" | "happy" | "thinking";

interface RikuAvatarProps {
  size?: number;
  expression?: Expression;
  className?: string;
}

const FUR = "#c25d4a";
const FUR_DARK = "#9c4435";
const MASK = "#fff5eb";
const INK = "#2b2a35";
const PINK = "#ff8fa3";

export default function RikuAvatar({
  size = 64,
  expression = "neutral",
  className,
}: RikuAvatarProps) {
  const happy = expression === "happy";
  const thinking = expression === "thinking";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-label="Riku the red panda"
      role="img"
    >
      {/* Ears (back layer) */}
      <path
        d="M18,32 Q14,8 32,18 Q28,26 26,36 Z"
        fill={FUR}
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M82,32 Q86,8 68,18 Q72,26 74,36 Z"
        fill={FUR}
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Inner ears */}
      <path d="M22,26 Q20,14 28,20 Q26,24 24,30 Z" fill={INK} />
      <path d="M78,26 Q80,14 72,20 Q74,24 76,30 Z" fill={INK} />

      {/* Head */}
      <ellipse
        cx="50"
        cy="54"
        rx="36"
        ry="34"
        fill={FUR}
        stroke={INK}
        strokeWidth="2.5"
      />

      {/* Face mask - two teardrop shapes meeting in the middle */}
      <path
        d="M50,38 Q30,38 24,58 Q26,76 42,78 Q50,72 50,56 Z"
        fill={MASK}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M50,38 Q70,38 76,58 Q74,76 58,78 Q50,72 50,56 Z"
        fill={MASK}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Cheeks */}
      <circle cx="28" cy="64" r="4" fill={PINK} opacity="0.6" />
      <circle cx="72" cy="64" r="4" fill={PINK} opacity="0.6" />

      {/* Eyes */}
      {happy ? (
        <>
          {/* Happy: closed crescents */}
          <path
            d="M32,54 Q36,50 40,54"
            fill="none"
            stroke={INK}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M60,54 Q64,50 68,54"
            fill="none"
            stroke={INK}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </>
      ) : thinking ? (
        <>
          {/* Thinking: one eye looking up */}
          <circle cx="36" cy="55" r="4" fill={INK} />
          <circle cx="37" cy="53.5" r="1.2" fill="#fff" />
          <circle cx="64" cy="53" r="4" fill={INK} />
          <circle cx="65" cy="51.5" r="1.2" fill="#fff" />
        </>
      ) : (
        <>
          {/* Neutral: two round eyes with highlights */}
          <circle cx="36" cy="55" r="4.2" fill={INK} />
          <circle cx="37.2" cy="53.7" r="1.3" fill="#fff" />
          <circle cx="64" cy="55" r="4.2" fill={INK} />
          <circle cx="65.2" cy="53.7" r="1.3" fill="#fff" />
        </>
      )}

      {/* Nose - small triangle */}
      <path
        d="M46,64 L54,64 L50,70 Z"
        fill={INK}
        stroke={INK}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Mouth */}
      {happy ? (
        <>
          <path
            d="M44,72 Q50,80 56,72"
            fill="none"
            stroke={INK}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Tongue */}
          <path
            d="M46,74 Q50,80 54,74 Q52,78 50,78 Q48,78 46,74 Z"
            fill={PINK}
            stroke={INK}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <path
          d="M46,72 Q50,76 54,72"
          fill="none"
          stroke={INK}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}

      {/* Small fur tuft on forehead */}
      <path
        d="M44,22 Q50,18 56,22 Q53,26 50,24 Q47,26 44,22 Z"
        fill={FUR_DARK}
        stroke={INK}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
