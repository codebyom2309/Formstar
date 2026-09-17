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
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      description: "Registered Google forms",
    },
    {
      id: "metric-active-forms",
      label: "Active Forms",
      value: metrics.activeForms,
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      description: "Serving live traffic",
    },
    {
      id: "metric-total-submissions",
      label: "Total Submissions",
      value: metrics.totalSubmissions.toLocaleString(),
      icon: TrendingUp,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      description: "Forwarded to Google Sheets",
    },
    {
      id: "metric-total-views",
      label: "Total Views",
      value: metrics.totalViews.toLocaleString(),
      icon: Eye,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      description: "Hosted endpoint impressions",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors"
          >
            <div className={`w-12 h-12 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center flex-shrink-0`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {card.label}
              </p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
                {card.value}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
