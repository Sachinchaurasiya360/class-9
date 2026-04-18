"use client";

/* --------------------------------------------------------------------------
 * FloatingRiku - a small bottom-right button that opens a compact chat
 * popup. Reuses the same rikuResponses engine as the full /riku page, but
 * keeps its own lightweight message state (not persisted - for a quick
 * chat-on-the-side experience). Includes a link to the full chat page.
 *
 * NOTE: this component is not mounted automatically; import and place it
 * wherever you want the floating button to appear.
 * ------------------------------------------------------------------------ */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, X, ExternalLink, Sparkles } from "lucide-react";
import RikuAvatar from "./RikuAvatar";
import ChatBubble from "./ChatBubble";
import {
  generateResponse,
  STARTER_SUGGESTIONS,
  type RikuResponse,
} from "@/utils/rikuResponses";
import { useGamification, levelFromXp } from "@/utils/gamification";
import { useProgress } from "@/utils/progress";

type Message = {
  id: string;
  from: "riku" | "user";
  text: string;
  time: string;
  suggestions?: string[];
};

const THINKING_MS = 600;

function makeId(): string {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function nowTime(): string {
  const d = new Date();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${ampm}`;
}

export default function FloatingRiku() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const g = useGamification();
  const progress = useProgress();
  const lvl = levelFromXp(g.xp);

  const scrollRef = useRef<HTMLDivElement>(null);

  const context = useMemo(
    () => ({
      level: lvl.level,
      totalLessons: progress.lessons.length,
      streak: g.streak.current,
    }),
    [lvl.level, progress.lessons.length, g.streak.current]
  );

  // Seed the first message when the popup opens for the first time
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: makeId(),
          from: "riku",
          text: "Quick chat mode 🐼! Ask me something short - or hit the full chat link below for the big view.",
          time: nowTime(),
          suggestions: STARTER_SUGGESTIONS.slice(0, 3),
        },
      ]);
    }
  }, [open, messages.length]);

  // Auto-scroll on new message
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, thinking, open]);

  const handleSend = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;

      const userMsg: Message = {
        id: makeId(),
        from: "user",
        text,
        time: nowTime(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setThinking(true);

      window.setTimeout(() => {
        const response: RikuResponse = generateResponse(text, context);
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            from: "riku",
            text: response.text,
            time: nowTime(),
            suggestions: response.suggestions,
          },
        ]);
        setThinking(false);
      }, THINKING_MS);
    },
    [context]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const lastSuggestions = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].from === "riku" && messages[i].suggestions?.length) {
        return messages[i].suggestions ?? [];
      }
    }
    return [];
  }, [messages]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group"
        aria-label="Open Riku chat"
      >
        {/* Peek bubble */}
        <span
          className="hidden sm:block font-hand text-xs px-3 py-1.5 text-foreground"
          style={{
            background: "var(--accent-yellow)",
            border: "2px solid #2b2a35",
            borderRadius: "14px 18px 6px 16px / 16px 14px 8px 18px",
            boxShadow: "3px 3px 0 #2b2a35",
          }}
        >
          Hey! Need help? <span aria-hidden>🐼</span>
        </span>
        <span
          className="rounded-full p-1.5 border-2 border-foreground transition-transform group-hover:scale-105"
          style={{
            background: "#fff8e7",
            boxShadow: "3px 3px 0 #2b2a35",
          }}
        >
          <RikuAvatar size={52} expression="happy" />
        </span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-40 w-[92vw] max-w-sm flex flex-col"
      style={{
        background: "#fffdf5",
        border: "2.5px solid #2b2a35",
        borderRadius: "18px 22px 16px 20px / 20px 16px 22px 18px",
        boxShadow: "4px 4px 0 #2b2a35",
        maxHeight: "80vh",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b-2 border-foreground"
        style={{ background: "var(--accent-yellow)" }}
      >
        <RikuAvatar size={34} expression="happy" />
        <div className="flex-1 min-w-0">
          <p className="font-hand text-sm font-bold text-foreground leading-tight">
            Riku
          </p>
          <p className="font-hand text-[10px] text-muted-foreground leading-tight">
            Quick chat mode
          </p>
        </div>
        <Link
          href="/riku"
          className="font-hand text-[11px] text-foreground hover:underline inline-flex items-center gap-1"
          aria-label="Open full chat"
        >
          <ExternalLink className="w-3 h-3" />
          <span className="hidden sm:inline">Full chat</span>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded hover:bg-background/50"
          aria-label="Close chat"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-3"
        style={{ maxHeight: "50vh" }}
      >
        {messages.map((m) => (
          <ChatBubble key={m.id} from={m.from} text={m.text} />
        ))}
        {thinking && (
          <div className="flex items-end gap-2 justify-start">
            <div
              className="px-3 py-1.5 font-hand text-xs text-muted-foreground"
              style={{
                background: "var(--accent-yellow)",
                border: "2px solid #2b2a35",
                borderRadius: "14px 18px 16px 6px / 16px 14px 18px 8px",
                boxShadow: "2px 2px 0 #2b2a35",
              }}
            >
              typing...
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {lastSuggestions.length > 0 && !thinking && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {lastSuggestions.slice(0, 3).map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="font-hand text-[10px] px-2 py-1 rounded-full border-2 border-foreground bg-background hover:bg-accent-yellow/40 transition-colors"
            >
              <Sparkles className="inline w-2.5 h-2.5 mr-0.5" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 p-2 border-t-2 border-foreground">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask Riku..."
          rows={1}
          className="flex-1 resize-none bg-transparent font-hand text-sm text-foreground placeholder:text-muted-foreground focus:outline-none px-2 py-1 min-h-[1.8rem] max-h-24"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || thinking}
          className="btn-sketchy text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ padding: "0.35rem 0.7rem" }}
          aria-label="Send"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
