import { Info, Lightbulb, CheckCircle2, Sparkles } from "lucide-react";

type Variant = "blue" | "amber" | "green" | "indigo";

interface InfoBoxProps {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}

const config: Record<Variant, { bg: string; border: string; titleColor: string; textColor: string; icon: React.ReactNode }> = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    titleColor: "text-blue-900",
    textColor: "text-blue-800",
    icon: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    titleColor: "text-amber-900",
    textColor: "text-amber-800",
    icon: <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    titleColor: "text-green-900",
    textColor: "text-green-800",
    icon: <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />,
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    titleColor: "text-indigo-900",
    textColor: "text-indigo-800",
    icon: <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />,
  },
};

export default function InfoBox({ variant = "blue", title, children }: InfoBoxProps) {
  const c = config[variant];
  return (
    <div className={`${c.bg} border ${c.border} rounded-lg p-3 flex gap-3`}>
      {c.icon}
      <div>
        {title && <h3 className={`text-sm font-semibold ${c.titleColor} mb-0.5`}>{title}</h3>}
        <div className={`text-xs ${c.textColor} leading-relaxed`}>{children}</div>
      </div>
    </div>
  );
}
