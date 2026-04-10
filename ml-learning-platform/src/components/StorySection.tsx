"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Bot, User } from "lucide-react";

interface StorySectionProps {
  paragraphs: string[];
  conceptTitle: string;
  conceptSummary: string;
}

export default function StorySection({ paragraphs, conceptTitle, conceptSummary }: StorySectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-amber-200 overflow-hidden">
      {/* Header  always visible, acts as toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
            The Story
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-amber-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {/* Body  collapsible */}
      {expanded && (
        <div className="px-4 py-4 bg-gradient-to-b from-amber-50/60 to-white space-y-3">
          {/* Story paragraphs */}
          <div className="space-y-2.5">
            {paragraphs.map((p, i) => {
              // Detect dialogue: lines starting with character names
              const aruMatch = p.match(/^Aru:\s*(.*)/);
              const byteMatch = p.match(/^Byte:\s*(.*)/);

              if (aruMatch) {
                return (
                  <div key={i} className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-pink-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wide">Aru</span>
                      <p className="text-sm text-slate-700 leading-relaxed">{aruMatch[1]}</p>
                    </div>
                  </div>
                );
              }

              if (byteMatch) {
                return (
                  <div key={i} className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Byte</span>
                      <p className="text-sm text-slate-700 leading-relaxed">{byteMatch[1]}</p>
                    </div>
                  </div>
                );
              }

              return (
                <p key={i} className="text-sm text-slate-700 leading-relaxed pl-0.5">
                  {p}
                </p>
              );
            })}
          </div>

          {/* Concept summary callout */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 mt-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              {conceptTitle}
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">{conceptSummary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
