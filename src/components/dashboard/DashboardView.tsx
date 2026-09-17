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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Creator Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your Google Form endpoints, track impressions, and launch the Studio editor.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-quick-sql"
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>MySQL DDL Schema</span>
          </button>

          <button
            id="btn-header-create-form"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all"
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
          <h2 className="text-base font-bold text-slate-900">Your Google Forms</h2>
          <p className="text-xs text-slate-500">
            Click any form to pause, resume, or open in the visual builder.
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
