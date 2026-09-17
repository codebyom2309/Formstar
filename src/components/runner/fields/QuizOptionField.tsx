import React from "react";
import { Check, HelpCircle } from "lucide-react";

interface QuizOptionFieldProps {
  id: string;
  options: string[];
  value: any;
  onChange: (val: string) => void;
  hasError?: boolean;
}

export const QuizOptionField: React.FC<QuizOptionFieldProps> = ({
  id,
  options,
  value,
  onChange,
  hasError,
}) => {
  const safeOptions = options && options.length > 0 ? options : ["Option A", "Option B", "Option C", "Option D"];

  return (
    <div className="space-y-2.5 w-full">
      {safeOptions.map((opt, idx) => {
        const isSelected = value === opt;
        const letter = String.fromCharCode(65 + idx);

        return (
          <label
            key={idx}
            className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 cursor-pointer min-h-[54px] select-none active:scale-[0.985] active:translate-y-0.5 ${
              isSelected
                ? "bg-indigo-50/95 border-indigo-500 text-indigo-950 shadow-[0_2px_8px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] ring-2 ring-indigo-500/20"
                : hasError
                ? "bg-white/95 hover:bg-slate-50 border-rose-300 text-slate-800"
                : "bg-white/95 backdrop-blur-md hover:bg-indigo-50/20 border-slate-200/90 hover:border-slate-300 text-slate-800 shadow-[0_1.5px_3px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-3">
              <span
                className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                }`}
              >
                {letter}
              </span>
              <span className="text-xs sm:text-sm font-semibold break-words leading-relaxed">
                {opt}
              </span>
            </div>

            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                isSelected
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-slate-300 bg-white group-hover:border-slate-400"
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            <input
              type="radio"
              name={id}
              value={opt}
              checked={isSelected}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
          </label>
        );
      })}
    </div>
  );
};
