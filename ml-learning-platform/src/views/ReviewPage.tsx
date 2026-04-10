"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, Check, X, Eye, Sparkles } from "lucide-react";
import { useDueCards, gradeCard, getAllCards } from "../utils/reviewDeck";

export default function ReviewPage() {
  const due = useDueCards();
  const [revealed, setRevealed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    setRevealed(false);
  }, [due.length === 0]);

  const total = getAllCards().length;
  const card = due[index];

  function handleGrade(correct: boolean) {
    if (!card) return;
    gradeCard(card.id, correct);
    setRevealed(false);
    if (index >= due.length - 1) {
      setIndex(0);
    }
  }

  if (total === 0) {
    return (
      <div className="space-y-5">
        <Header total={0} dueCount={0} />
        <div className="card-sketchy p-8 text-center space-y-3" style={{ background: "#fff8e7" }}>
          <Sparkles className="w-10 h-10 mx-auto text-accent-coral" />
          <p className="font-hand text-lg font-bold text-foreground">No cards yet!</p>
          <p className="font-hand text-sm text-muted-foreground">
            Visit any lesson to start collecting review cards.
          </p>
          <Link href="/level1/machines" className="btn-sketchy text-sm font-hand inline-flex">
            Start Lesson 1
          </Link>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="space-y-5">
        <Header total={total} dueCount={0} />
        <div className="card-sketchy p-8 text-center space-y-3" style={{ background: "#e8fff5" }}>
          <Check className="w-10 h-10 mx-auto text-foreground" />
          <p className="font-hand text-lg font-bold text-foreground">All caught up!</p>
          <p className="font-hand text-sm text-muted-foreground">
            You've reviewed every card that's due. Come back later for more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Header total={total} dueCount={due.length} />

      <div className="card-sketchy p-6 space-y-4" style={{ background: "#fffdf5" }}>
        <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
          Card {index + 1} of {due.length}
        </p>
        <p className="font-hand text-xl text-foreground">{card.question}</p>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="btn-sketchy text-sm font-hand inline-flex"
          >
            <Eye className="w-4 h-4" />
            Show answer
          </button>
        ) : (
          <>
            <div
              className="card-sketchy p-4"
              style={{ background: "#e8fff5" }}
            >
              <p className="font-hand text-base text-foreground">{card.answer}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleGrade(false)}
                className="flex-1 btn-sketchy-outline text-sm font-hand"
              >
                <X className="w-4 h-4" />
                Missed it
              </button>
              <button
                onClick={() => handleGrade(true)}
                className="flex-1 btn-sketchy text-sm font-hand"
              >
                <Check className="w-4 h-4" />
                Got it!
              </button>
            </div>
          </>
        )}
      </div>

      <p className="font-hand text-xs text-center text-muted-foreground">
        Cards you know come back less often. Cards you miss come back sooner.
      </p>
    </div>
  );
}

function Header({ total, dueCount }: { total: number; dueCount: number }) {
  return (
    <div>
      <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Spaced Repetition
      </p>
      <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground mt-1 flex items-center gap-3">
        <Brain className="w-8 h-8 text-accent-coral" />
        <span className="marker-highlight-yellow">Review Deck</span>
      </h1>
      <p className="font-hand text-sm text-muted-foreground mt-2">
        {dueCount} due &middot; {total} total cards
      </p>
    </div>
  );
}
