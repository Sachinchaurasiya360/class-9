"use client";

/* --------------------------------------------------------------------------
 * ChatBubble - single message in the Riku chat stream.
 *
 * Riku bubbles sit on the left with the accent-yellow fill so they feel
 * like sticky notes. User bubbles sit on the right, white, and carry the
 * same sketchy border treatment. Both use the handwriting font.
 * ------------------------------------------------------------------------ */

import RikuAvatar from "./RikuAvatar";

interface ChatBubbleProps {
  from: "riku" | "user";
  text: string;
  time?: string;
}

export default function ChatBubble({ from, text, time }: ChatBubbleProps) {
  const isRiku = from === "riku";

  return (
    <div
      className={`flex items-end gap-2 ${
        isRiku ? "justify-start" : "justify-end"
      }`}
    >
      {isRiku && (
        <div className="hidden sm:block shrink-0">
          <RikuAvatar size={36} expression="happy" />
        </div>
      )}

      <div
        className={`max-w-[80%] px-4 py-2.5 font-hand text-sm leading-snug text-foreground ${
          isRiku ? "rounded-tl-sm" : "rounded-tr-sm"
        }`}
        style={{
          background: isRiku ? "var(--accent-yellow)" : "#ffffff",
          border: "2px solid #2b2a35",
          borderRadius: isRiku
            ? "16px 20px 18px 6px / 18px 16px 20px 8px"
            : "20px 16px 6px 18px / 16px 18px 8px 20px",
          boxShadow: "3px 3px 0 #2b2a35",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <p>{text}</p>
        {time && (
          <p
            className={`text-[10px] mt-1 text-muted-foreground ${
              isRiku ? "text-left" : "text-right"
            }`}
          >
            {time}
          </p>
        )}
      </div>

      {!isRiku && (
        <div
          className="hidden sm:flex shrink-0 w-9 h-9 rounded-full border-2 border-foreground items-center justify-center font-hand font-bold text-sm"
          style={{
            background: "var(--accent-mint)",
            boxShadow: "2px 2px 0 #2b2a35",
          }}
          aria-hidden
        >
          U
        </div>
      )}
    </div>
  );
}
