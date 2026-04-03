import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { playSuccess, playError, playComplete, playClick } from "../utils/sounds";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizCardProps {
  questions: Question[];
  onComplete?: (score: number, total: number) => void;
}

export default function QuizCard({ questions, onComplete }: QuizCardProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correctIndex) {
      setScore((s) => s + 1);
      playSuccess();
    } else {
      playError();
    }
  }

  function handleNext() {
    playClick();
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
      playComplete();
      onComplete?.(score + (selected === q.correctIndex ? 0 : 0), questions.length);
    }
  }

  function handleRestart() {
    playClick();
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    const finalScore = score;
    const pct = Math.round((finalScore / questions.length) * 100);
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4">
        <Trophy className={`w-12 h-12 mx-auto ${pct >= 70 ? "text-yellow-500" : "text-slate-400"}`} />
        <h3 className="text-xl font-bold text-slate-800">Quiz Complete!</h3>
        <p className="text-3xl font-bold text-slate-800">
          {finalScore} / {questions.length}
        </p>
        <p className="text-sm text-slate-600">
          {pct === 100
            ? "Perfect score! You nailed it!"
            : pct >= 70
              ? "Great job! You have a solid understanding."
              : "Keep learning! Review the lesson and try again."}
        </p>
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Question {current + 1} of {questions.length}
        </span>
        <span className="text-xs font-mono text-slate-500">
          Score: {score}
        </span>
      </div>

      <h3 className="text-base font-semibold text-slate-800">{q.question}</h3>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let cls = "border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700";
          if (answered) {
            if (i === q.correctIndex) {
              cls = "border-green-300 bg-green-50 text-green-800";
            } else if (i === selected && i !== q.correctIndex) {
              cls = "border-red-300 bg-red-50 text-red-800";
            } else {
              cls = "border-slate-200 bg-slate-50 text-slate-400";
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${cls} disabled:cursor-default`}
            >
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {answered && i === q.correctIndex && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {answered && i === selected && i !== q.correctIndex && <XCircle className="w-5 h-5 text-red-500" />}
            </button>
          );
        })}
      </div>

      {answered && q.explanation && (
        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
          {q.explanation}
        </p>
      )}

      {answered && (
        <button
          onClick={handleNext}
          className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          {current < questions.length - 1 ? "Next Question" : "See Results"}
        </button>
      )}
    </div>
  );
}
