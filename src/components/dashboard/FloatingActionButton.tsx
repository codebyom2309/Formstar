import React from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { Plus } from "lucide-react";

export const FloatingActionButton: React.FC = () => {
  const { setIsCreateModalOpen } = useDashboardStore();

  return (
    <div className="fixed bottom-5 sm:bottom-8 right-4 sm:right-8 z-40">
      <button
        id="fab-create-new-form"
        onClick={() => setIsCreateModalOpen(true)}
        className="group flex items-center justify-center gap-2.5 p-3.5 sm:px-5 sm:py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-full shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ring-2 ring-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/40"
        aria-label="Create New Form"
        title="Create New Form from Google URL"
      >
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:rotate-90 shrink-0">
          <Plus className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline text-xs sm:text-sm font-bold tracking-wide">
          New Form
        </span>
      </button>
    </div>
  );
};
