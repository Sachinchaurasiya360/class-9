"use client";

/* --------------------------------------------------------------------------
 * /riku - full-page chat interface with our red panda mascot.
 *
 * Canned / rule-based responses powered by src/utils/rikuResponses.ts.
 * Chat history persists to localStorage (last 50 messages) so the stream
 * survives refreshes. A 600ms "thinking" delay makes Riku feel alive.
 * ------------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, Trash2, Sparkles } from "lucide-react";
import RikuAvatar from "@/components/riku/RikuAvatar";
import ChatBubble from "@/components/riku/ChatBubble";
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

const STORAGE_KEY = "riku-chat-v1";
const MAX_HISTORY = 50;
const THINKING_MS = 600;

function nowTime(): string {
  const d = new Date();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${ampm}`;
}

function makeId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadHistory(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-MAX_HISTORY);
  } catch {
    return [];
  }
}

function saveHistory(msgs: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_HISTORY)));
  } catch {
    /* ignore quota errors */
  }
}

export default function RikuChatPage() {
  const g = useGamification();
  const progress = useProgress();
  const lvl = levelFromXp(g.xp);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    const loaded = loadHistory();
    if (loaded.length === 0) {
      const greeting: Message = {
        id: makeId(),
        from: "riku",
        text: "Heyyy! 🐼 I'm Riku. Ask me about neural networks, KNN, your progress, or anything ML. I even tell bad jokes.",
        time: nowTime(),
        suggestions: STARTER_SUGGESTIONS,
      };
      setMessages([greeting]);
    } else {
      setMessages(loaded);
    }
    setHydrated(true);
  }, []);

  /* Persist on every change (after hydration) */
  useEffect(() => {
    if (!hydrated) return;
    saveHistory(messages);
  }, [messages, hydrated]);

  /* Auto-scroll to bottom on new message */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  const context = useMemo(
    () => ({
      level: lvl.level,
      totalLessons: progress.lessons.length,
      streak: g.streak.current,
    }),
    [lvl.level, progress.lessons.length, g.streak.current]
  );

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

      // Fake latency so it feels like Riku is typing
      window.setTimeout(() => {
        const response: RikuResponse = generateResponse(text, context);
        const rikuMsg: Message = {
          id: makeId(),
          from: "riku",
          text: response.text,
          time: nowTime(),
          suggestions: response.suggestions,
        };
        setMessages((prev) => [...prev, rikuMsg]);
        setThinking(false);
      }, THINKING_MS);
    },
    [context]
  );

  const handleClear = useCallback(() => {
    const greeting: Message = {
      id: makeId(),
      from: "riku",
      text: "Cleared! Fresh slate 🧹. What should we talk about now?",
      time: nowTime(),
      suggestions: STARTER_SUGGESTIONS,
    };
    setMessages([greeting]);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  // The latest Riku message's suggestions (shown as chips below input)
  const lastRikuSuggestions = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].from === "riku" && messages[i].suggestions?.length) {
        return messages[i].suggestions ?? [];
      }
    }
    return [];
  }, [messages]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="card-sketchy p-4 flex items-center gap-4"
        style={{ background: "#fff8e7" }}
      >
        <RikuAvatar size={72} expression="happy" />
        <div className="flex-1 min-w-0">
          <h1 className="font-hand text-2xl font-bold text-foreground leading-tight">
            Chat with Riku
          </h1>
          <p className="font-hand text-sm text-muted-foreground">
            Ask me anything about AI! <span aria-hidden>🐼</span>
          </p>
        </div>
        <button
          onClick={handleClear}
          className="btn-sketchy-outline text-xs"
          style={{ padding: "0.4rem 0.8rem" }}
          aria-label="Clear conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Message list */}
      <div
        className="card-sketchy p-4"
        style={{ background: "#fffdf5", minHeight: "50vh" }}
      >
        <div
          ref={scrollRef}
          className="space-y-4 overflow-y-auto pr-1"
          style={{ maxHeight: "55vh" }}
        >
          {messages.map((m) => (
            <ChatBubble key={m.id} from={m.from} text={m.text} time={m.time} />
          ))}

          {thinking && (
            <div className="flex items-end gap-2 justify-start">
              <div className="hidden sm:block shrink-0">
                <RikuAvatar size={36} expression="thinking" />
              </div>
              <div
                className="px-4 py-2.5 font-hand text-sm text-muted-foreground"
                style={{
                  background: "var(--accent-yellow)",
                  border: "2px solid #2b2a35",
                  borderRadius: "16px 20px 18px 6px / 18px 16px 20px 8px",
                  boxShadow: "3px 3px 0 #2b2a35",
                }}
              >
                <span className="inline-flex gap-1">
                  <span className="typing-dot">.</span>
                  <span className="typing-dot">.</span>
                  <span className="typing-dot">.</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestion chips */}
      {lastRikuSuggestions.length > 0 && !thinking && (
        <div className="flex flex-wrap gap-2">
          {lastRikuSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="font-hand text-xs px-3 py-1.5 rounded-full border-2 border-foreground bg-background hover:bg-accent-yellow/40 transition-colors"
              style={{ boxShadow: "2px 2px 0 #2b2a35" }}
            >
              <Sparkles className="inline w-3 h-3 mr-1" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="card-sketchy p-3 flex items-end gap-2"
        style={{ background: "#ffffff" }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask Riku anything..."
          rows={1}
          className="flex-1 resize-none bg-transparent font-hand text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[2rem] max-h-32"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || thinking}
          className="btn-sketchy text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ padding: "0.5rem 0.9rem" }}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

      <style jsx>{`
        .typing-dot {
          animation: riku-bounce 1.2s infinite;
          display: inline-block;
          font-weight: 900;
          font-size: 18px;
          line-height: 0.7;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.15s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes riku-bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
