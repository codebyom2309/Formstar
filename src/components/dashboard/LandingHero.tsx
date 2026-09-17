import React from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useDashboardStore } from "../../store/useDashboardStore";
import { ArrowRight, Sparkles, Database, Layers, ShieldCheck, Zap } from "lucide-react";

export const LandingHero: React.FC = () => {
  const { loginWithGoogle } = useAuthStore();
  const { setIsSqlModalOpen } = useDashboardStore();

  return (
    <div className="py-12 sm:py-16 text-center max-w-4xl mx-auto px-4">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Phase 1: Foundation, Google Auth &amp; MySQL TiDB Schema</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
        Supercharge your Google Forms into custom Next.js applications.
      </h1>

      <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
        Scrape Google Form schema, design multi-step form experiences with custom themes, and manage forms with live metrics on our TiDB/MySQL backend.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
        <button
          id="hero-btn-signin"
          onClick={() => loginWithGoogle()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <span>Sign In with Google</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsSqlModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-2xs transition-all"
        >
          <Database className="w-4 h-4 text-blue-600" />
          <span>View MySQL Schema</span>
        </button>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Zero Backend Migration</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            All submissions continue to stream directly into your existing Google Sheets.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">TiDB Serverless Storage</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Fast MySQL 8.0 schema storing users, accounts, slugs, and form JSON trees.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Template Engine Preserved</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Your hackathon form template is stored in <code>/template</code> ready for Phase 3 WYSIWYG wrapping.
          </p>
        </div>
      </div>
    </div>
  );
};
