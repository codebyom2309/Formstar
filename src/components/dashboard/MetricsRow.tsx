import React from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { FileText, CheckCircle2, TrendingUp, Eye } from "lucide-react";

export const MetricsRow: React.FC = () => {
  const { metrics } = useDashboardStore();

  const cards = [
    {
      id: "metric-total-forms",
      label: "Total Forms",
      value: metrics.totalForms,
      icon: FileText,
      gradient: "from-blue-600 to-indigo-600",
      glowBg: "from-blue-500/15 via-indigo-500/5 to-transparent",
      shadowColor: "shadow-blue-500/25",
      badgeText: "Registered",
      description: "Google forms converted",
    },
    {
      id: "metric-active-forms",
      label: "Active Forms",
      value: metrics.activeForms,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      glowBg: "from-emerald-500/15 via-teal-500/5 to-transparent",
      shadowColor: "shadow-emerald-500/25",
      badgeText: "Live Traffic",
      description: "Serving responses now",
      hasPulse: true,
    },
    {
      id: "metric-total-submissions",
      label: "Total Submissions",
      value: metrics.totalSubmissions.toLocaleString(),
      icon: TrendingUp,
      gradient: "from-violet-600 to-purple-600",
      glowBg: "from-violet-500/15 via-purple-500/5 to-transparent",
      shadowColor: "shadow-purple-500/25",
      badgeText: "Google Sheets",
      description: "Real-time sync active",
    },
    {
      id: "metric-total-views",
      label: "Total Views",
      value: metrics.totalViews.toLocaleString(),
      icon: Eye,
      gradient: "from-amber-500 to-orange-600",
      glowBg: "from-amber-500/15 via-orange-500/5 to-transparent",
      shadowColor: "shadow-amber-500/25",
      badgeText: "Impressions",
      description: "Hosted endpoint visits",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-10">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="bg-white/75 backdrop-blur-xl p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/90 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200/80 transition-all duration-300"
          >
            {/* Ambient corner glow */}
            <div
              className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${card.glowBg} pointer-events-none rounded-full blur-xl group-hover:scale-125 transition-transform duration-500`}
            />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center shrink-0 shadow-md ${card.shadowColor} ring-2 ring-white/80 group-hover:scale-105 transition-transform`}
              >
                <IconComponent className="w-6 h-6" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-slate-100/80 text-slate-600 border border-slate-200/70">
                {card.hasPulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                {card.badgeText}
              </span>
            </div>

            <div className="relative z-10 mt-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {card.label}
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mt-1">
                {card.value}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
