import React, { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useDashboardStore } from "../../store/useDashboardStore";
import { MetricsRow } from "./MetricsRow";
import { FormsTable } from "./FormsTable";
import { CreateFormModal } from "./CreateFormModal";
import { SqlSchemaModal } from "./SqlSchemaModal";
import { StudioPreviewModal } from "./StudioPreviewModal";
import { SchemaInspectorModal } from "./SchemaInspectorModal";
import { AiSchemaInspectorModal } from "./AiSchemaInspectorModal";
import { FloatingActionButton } from "./FloatingActionButton";
import { LandingHero } from "./LandingHero";
import { Plus, Database, Sparkles } from "lucide-react";

export const DashboardView: React.FC = () => {
  const { user } = useAuthStore();
  const { fetchForms, setIsCreateModalOpen, setIsSqlModalOpen } = useDashboardStore();

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  if (!user) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LandingHero />
        <SqlSchemaModal />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Welcome & Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        {/* Subtle corner light */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-800 text-xs font-extrabold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Interactive Form Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Creator <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
            Manage your Google Form endpoints, inspect extracted metadata, track live views, and launch the visual Studio builder.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0 flex-wrap">
          <button
            id="btn-quick-sql"
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow transition-all active:scale-95"
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>MySQL Schema</span>
          </button>

          <button
            id="btn-header-create-form"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Form</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <MetricsRow />

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Your Google Forms
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Live interactive websites generated from Google Forms. Click any card to launch or configure.
          </p>
        </div>
      </div>

      {/* Forms Table */}
      <FormsTable />

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Modals */}
      <CreateFormModal />
      <SqlSchemaModal />
      <StudioPreviewModal />
      <SchemaInspectorModal />
      <AiSchemaInspectorModal />
    </main>
  );
};
