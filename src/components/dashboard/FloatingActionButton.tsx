import React from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { Plus } from "lucide-react";

export const FloatingActionButton: React.FC = () => {
  const { setIsCreateModalOpen } = useDashboardStore();

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <button
        id="fab-create-new-form"
        onClick={() => setIsCreateModalOpen(true)}
        className="group flex items-center gap-3 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
        aria-label="Create New Form"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:rotate-90">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-sm tracking-wide">Create New Form</span>
      </button>
    </div>
  );
};
