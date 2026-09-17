import React from "react";
import { Check } from "lucide-react";

interface CheckboxCardsFieldProps {
  id: string;
  options: string[];
  value: any;
  onChange: (val: string[]) => void;
  hasError?: boolean;
}

export const CheckboxCardsField: React.FC<CheckboxCardsFieldProps> = ({
  id,
  options,
  value,
  onChange,
  hasError,
}) => {
  const safeOptions = options && options.length > 0 ? options : ["Option 1", "Option 2"];
  const checkedArr: string[] = Array.isArray(value) ? value : [];

  const handleToggle = (opt: string) => {
    if (checkedArr.includes(opt)) {
      onChange(checkedArr.filter((item) => item !== opt));
    } else {
      onChange([...checkedArr, opt]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
      {safeOptions.map((opt, idx) => {
        const isChecked = checkedArr.includes(opt);

        return (
          <label
            key={idx}
            className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 cursor-pointer min-h-[52px] select-none active:scale-[0.985] active:translate-y-0.5 ${
              isChecked
                ? "bg-blue-50/95 border-blue-500 text-blue-950 shadow-[0_2px_8px_rgba(37,99,235,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] ring-2 ring-blue-500/20"
                : hasError
                ? "bg-white/95 hover:bg-slate-50 border-rose-300 text-slate-800"
                : "bg-white/95 backdrop-blur-md hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 text-slate-800 shadow-[0_1.5px_3px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <span className="text-xs sm:text-sm font-semibold break-words leading-tight">
                {opt}
              </span>
            </div>

            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                isChecked
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-slate-300 bg-white group-hover:border-slate-400"
              }`}
            >
              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            <input
              type="checkbox"
              name={`${id}_${idx}`}
              checked={isChecked}
              onChange={() => handleToggle(opt)}
              className="sr-only"
            />
          </label>
        );
      })}
    </div>
  );
};
