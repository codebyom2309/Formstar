import React from "react";

interface ScaleSelectorFieldProps {
  id: string;
  value: any;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  hasError?: boolean;
}

export const ScaleSelectorField: React.FC<ScaleSelectorFieldProps> = ({
  id,
  value,
  onChange,
  min = 1,
  max = 10,
  minLabel = "Low",
  maxLabel = "High",
  hasError,
}) => {
  const currentVal = typeof value === "number" ? value : parseInt(String(value), 10) || null;
  const count = max - min + 1;
  const items = Array.from({ length: count }, (_, i) => min + i);

  return (
    <div className="space-y-2.5 w-full">
      {/* Anchor labels */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>{minLabel} ({min})</span>
        <span>{maxLabel} ({max})</span>
      </div>

      {/* Numbers row */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
        {items.map((num) => {
          const isSelected = currentVal === num;

          return (
            <button
              key={num}
              type="button"
              id={`${id}-scale-${num}`}
              onClick={() => onChange(num)}
              className={`flex items-center justify-center h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-150 min-h-[44px] active:scale-95 active:translate-y-0.5 ${
                isSelected
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/20 scale-105"
                  : hasError
                  ? "bg-white border-rose-300 text-slate-700 hover:border-slate-400"
                  : "bg-white/95 backdrop-blur-md border-slate-200/90 hover:border-slate-300 text-slate-700 hover:bg-slate-50 shadow-[0_1.5px_2.5px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]"
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
};
