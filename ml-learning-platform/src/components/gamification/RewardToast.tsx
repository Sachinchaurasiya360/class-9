"use client";

import { useEffect, useState } from "react";
import { Star, Coins, Award, TrendingUp, Flame, X } from "lucide-react";
import {
  useGamification,
  dismissReward,
  type RewardEvent,
} from "../../utils/gamification";

const ICONS: Record<RewardEvent["kind"], React.ReactNode> = {
  xp: <Star className="w-4 h-4" />,
  coins: <Coins className="w-4 h-4" />,
  badge: <Award className="w-4 h-4" />,
  level: <TrendingUp className="w-4 h-4" />,
  streak: <Flame className="w-4 h-4" />,
};

const COLORS: Record<RewardEvent["kind"], string> = {
  xp: "var(--accent-yellow)",
  coins: "var(--accent-yellow)",
  badge: "var(--accent-lav)",
  level: "var(--accent-mint)",
  streak: "var(--accent-coral)",
};

/**
 * Global toast stack - mount once (in lessons layout) and it listens to the
 * gamification store. Only shows events from the last 6 seconds to avoid
 * spamming if state was already primed from a previous visit.
 */
export default function RewardToast() {
  const g = useGamification();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const active = g.rewards.filter((r) => now - r.timestamp < 6000).slice(0, 4);

  if (active.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
      {active.map((r) => (
        <div
          key={r.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-foreground font-hand animate-fadeIn min-w-[220px] max-w-[320px]"
          style={{ background: COLORS[r.kind], boxShadow: "3px 3px 0 #2b2a35" }}
        >
          <div className="shrink-0">{ICONS[r.kind]}</div>
          <div className="flex-1 text-sm">
            <p className="font-bold text-foreground leading-tight">
              {r.kind === "xp" && r.amount != null && `+${r.amount} XP`}
              {r.kind === "coins" && r.amount != null && (r.amount > 0 ? `+${r.amount}` : r.amount) + " coins"}
              {r.kind === "badge" && "Badge unlocked!"}
              {r.kind === "level" && "Level up!"}
              {r.kind === "streak" && r.label}
            </p>
            <p className="text-[11px] text-foreground/80 leading-tight">
              {r.kind === "xp" || r.kind === "coins" ? r.label : r.detail ?? r.label}
            </p>
          </div>
          <button
            onClick={() => dismissReward(r.id)}
            className="shrink-0 text-foreground/60 hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
