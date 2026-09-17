import React, { useState, useEffect } from "react";
import { FormRunner } from "./FormRunner";
import { FormRecord } from "../../types";
import { useDashboardStore } from "../../store/useDashboardStore";
import { Loader2, AlertCircle, ArrowLeft, Sparkles, Database } from "lucide-react";

interface HostedRunnerPageProps {
  slug?: string;
}

export const HostedRunnerPage: React.FC<HostedRunnerPageProps> = ({ slug: propSlug }) => {
  const { activeRunnerSlug, setActiveView } = useDashboardStore();
  const slug = propSlug || activeRunnerSlug || "hackathon-2026";

  const [form, setForm] = useState<FormRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/forms/slug/${slug}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Form with slug "${slug}" not found.`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setForm(data.form);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load form.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Loading Form from TiDB Cloud...</h3>
        <p className="text-xs text-slate-500 mt-1 font-mono">/f/{slug}</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Form Not Available</h3>
        <p className="text-xs text-slate-600 max-w-sm mt-1 mb-6 leading-relaxed">
          {error || `We couldn't locate the form "/f/${slug}" in the database.`}
        </p>
        <button
          onClick={() => setActiveView("dashboard")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to NextForm Dashboard</span>
        </button>
      </div>
    );
  }

  if (form.status === "paused") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{form.title} is Currently Paused</h3>
        <p className="text-xs text-slate-600 max-w-sm mt-1.5 mb-6 leading-relaxed">
          The creator has paused submissions for this form. Please check back later or contact the event organizers.
        </p>
        <button
          onClick={() => setActiveView("dashboard")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 py-4 sm:py-6 md:py-12 px-2.5 sm:px-4 md:px-6 overflow-x-hidden">
      {/* Top Floating Mini-Nav for Quick Exit to Dashboard if logged in */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between gap-2 px-1">
        <button
          onClick={() => setActiveView("dashboard")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>NextForm Studio</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono truncate">
          <Database className="w-3 h-3 text-purple-600 shrink-0" />
          <span className="truncate">TiDB: deform</span>
        </div>
      </div>

      {/* Main Runner */}
      <FormRunner
        config={{
          ...form.jsonConfig,
          aiExperience: form.aiExperience || form.jsonConfig?.aiExperience,
        }}
        hostedSlug={form.hostedSlug}
        isSandbox={false}
        onExitRunner={() => setActiveView("dashboard")}
      />

      {/* Footer Branding */}
      <footer className="mt-12 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>Powered by NextForm Headless Engine</span>
        </div>
      </footer>
    </div>
  );
};
