import React, { useState, useEffect } from "react";
import { FormRunner } from "./FormRunner";
import { FormWebsite } from "./FormWebsite";
import { AiProcessingScreen } from "./AiProcessingScreen";
import { FormRecord } from "../../types";
import { CanonicalExperienceSchema } from "../../types/canonicalExperience";
import { convertConfigToExperience } from "../../lib/experienceAdapter";
import { useDashboardStore } from "../../store/useDashboardStore";
import { AlertCircle, ArrowLeft } from "lucide-react";

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

  // Loading — show AI Processing Screen
  if (loading) {
    return <AiProcessingScreen formTitle={slug} />;
  }

  // Error state
  if (error || !form) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5 border border-red-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Form Not Available</h3>
        <p className="text-xs text-slate-600 max-w-sm mt-1.5 mb-6 leading-relaxed">
          {error || `We couldn't locate the form "/f/${slug}".`}
        </p>
        <button
          onClick={() => setActiveView("dashboard")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Dashboard</span>
        </button>
      </div>
    );
  }

  // Paused state
  if (form.status === "paused") {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{form.title} is Currently Paused</h3>
        <p className="text-xs text-slate-600 max-w-sm mt-1.5 mb-6 leading-relaxed">
          The creator has paused submissions for this form. Please check back later.
        </p>
        <button
          onClick={() => setActiveView("dashboard")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>
    );
  }

  // Build the config and experience
  const fullConfig = {
    ...form.jsonConfig,
    aiExperience: form.aiExperience || form.jsonConfig?.aiExperience,
  };

  const experience: CanonicalExperienceSchema =
    form.aiExperience || form.jsonConfig?.aiExperience || convertConfigToExperience(fullConfig, form.hostedSlug);

  // Render form inside the FormWebsite shell for the full personalized experience
  return (
    <FormWebsite
      config={fullConfig}
      experience={experience}
      hostedSlug={form.hostedSlug}
      isSandbox={false}
      onExitRunner={() => setActiveView("dashboard")}
    />
  );
};
