import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingCardsFieldProps {
  id: string;
  value: any;
  onChange: (val: number) => void;
  max?: number;
  hasError?: boolean;
}

export const RatingCardsField: React.FC<RatingCardsFieldProps> = ({
  id,
  value,
  onChange,
  max = 5,
  hasError,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const currentVal = typeof value === "number" ? value : parseInt(String(value), 10) || 0;

  const labels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  const activeNumber = hoverRating !== null ? hoverRating : currentVal;

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-start sm:justify-start">
        {Array.from({ length: max }, (_, i) => i + 1).map((num) => {
          const isFilled = activeNumber >= num;
          const isSelected = currentVal === num;

          return (
            <button
              key={num}
              type="button"
              id={`${id}-rating-${num}`}
              onClick={() => onChange(num)}
              onMouseEnter={() => setHoverRating(num)}
              onMouseLeave={() => setHoverRating(null)}
              className={`flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border transition-all duration-150 min-h-[44px] active:scale-95 active:translate-y-0.5 ${
                isSelected
                  ? "bg-amber-50 border-amber-400 text-amber-900 shadow-sm ring-2 ring-amber-400/30 scale-105"
                  : isFilled
                  ? "bg-amber-50/60 border-amber-300 text-amber-700"
                  : hasError
                  ? "bg-white border-rose-300 text-slate-400 hover:border-slate-400"
                  : "bg-white/95 backdrop-blur-md border-slate-200/90 hover:border-slate-300 text-slate-400 hover:bg-slate-50 shadow-[0_1.5px_2.5px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]"
              }`}
            >
              <Star
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                  isFilled ? "fill-amber-400 text-amber-500" : "text-slate-300"
                }`}
              />
              <span className="text-[11px] font-bold mt-1 text-slate-700">{num}</span>
            </button>
          );
        })}
      </div>

      {activeNumber > 0 && (
        <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5 animate-in fade-in duration-150">
          <span>Selected: {activeNumber} / {max}</span>
          {labels[activeNumber] && (
            <span className="text-slate-400 font-medium">({labels[activeNumber]})</span>
          )}
        </div>
      )}
    </div>
  );
};
