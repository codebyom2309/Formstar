import React, { useState } from "react";
import {
  RegistrationFormData,
  AGREEMENT_TEXT,
} from "../types";
import {
  validateRegistrationData,
  submitRegistration,
} from "../lib/formUtils";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  UserCheck,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Sparkles,
  Award,
  MessageCircle,
} from "lucide-react";

interface ReviewSubmitFormProps {
  data: RegistrationFormData;
  onChange: (updates: Partial<RegistrationFormData>) => void;
  onBack: () => void;
  onJumpToStep: (step: number) => void;
  onSubmitSuccess?: () => void;
}

export const ReviewSubmitForm: React.FC<ReviewSubmitFormProps> = ({
  data,
  onChange,
  onBack,
  onJumpToStep,
  onSubmitSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const validation = validateRegistrationData(data);

  const handleSubmit = async () => {
    if (!validation.isValid) return;

    setIsSubmitting(true);
    setSubmissionResult(null);

    const res = await submitRegistration(data);
    setIsSubmitting(false);
    setSubmissionResult(res);

    if (res.success && onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  return (
    <div id="review-submit-card" className="w-full bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/90 p-6 sm:p-8 shadow-xs transition-colors">
      {/* Header */}
      <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold mb-2.5 border border-cyan-200 dark:border-cyan-800/70">
          <ClipboardCheck className="w-3.5 h-3.5 text-cyan-500" />
          Review & Submission
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Step 4: Final Confirmation
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Please review your team registration details carefully before official submission.
        </p>
      </div>

      {/* Validation Alert if fields are missing */}
      {!validation.isValid && (
        <div id="missing-fields-alert" className="mt-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300">
                Missing Mandatory Information ({validation.missingFields.length})
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                Please complete all required fields and accept the agreement before submitting:
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {validation.missingFields.map((field, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-1 bg-white/80 dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-medium rounded-lg"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Status Notice */}
      {submissionResult && (
        <div
          id="submission-status-card"
          className={`mt-6 p-5 rounded-2xl border ${
            submissionResult.success
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {submissionResult.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="text-base font-bold">
                {submissionResult.success
                  ? "Registration Successfully Submitted!"
                  : "Submission Notice"}
              </h3>
              <p className="text-xs mt-1">{submissionResult.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Review Cards Grid */}
      <div className="mt-6 space-y-5">
        {/* Team & Theme Summary */}
        <div className="p-5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Details</h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Edit Team Basics
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Team Name</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{data.teamName || "(Not set)"}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Hackathon Theme</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{data.track}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Total Team Size</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{data.teamSize}</span>
            </div>
          </div>
        </div>

        {/* Leader Summary */}
        <div className="p-5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Leader Details</h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Edit Leader
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Name & Email</span>
              <span className="font-bold text-slate-900 dark:text-white block">{data.leader.name || "(Not set)"}</span>
              <span className="text-slate-600 dark:text-slate-300">{data.leader.email || "(Not set)"}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Phone & College</span>
              <span className="font-medium text-slate-900 dark:text-white block">{data.leader.phone || "(Not set)"}</span>
              <span className="text-slate-600 dark:text-slate-300">{data.leader.college || "(Not set)"}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Year/Branch & GitHub</span>
              <span className="font-medium text-slate-900 dark:text-white block">{data.leader.yearBranch || "N/A"}</span>
              <span className="text-slate-600 dark:text-slate-300 truncate block">{data.leader.github || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Teammates Summary */}
        <div className="p-5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Registered Members ({parseInt(data.teamSize.match(/\d+/)?.[0] || "4", 10) - 1} Teammates)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Edit Members
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {data.members.slice(0, parseInt(data.teamSize.match(/\d+/)?.[0] || "4", 10) - 1).map((member, idx) => (
              <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">Member {idx + 2}: {member.name || `[Empty]`}</span>
                  <span className="text-[10px] text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded font-medium border border-cyan-200 dark:border-cyan-800/60">
                    Member {idx + 2}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{member.email || "No email"} &bull; {member.phone || "No phone"}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{member.college || "No college specified"}</p>
                {member.github && (
                  <p className="text-cyan-600 dark:text-cyan-400 text-[11px] mt-0.5 font-mono truncate">
                    {member.github}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {member.roles.map((r) => (
                    <span key={r} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agreement / Terms Checkbox */}
        <div className="p-5 bg-cyan-50/30 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40 rounded-2xl">
          <label className="flex items-start gap-3.5 cursor-pointer">
            <input
              type="checkbox"
              id="agreement-checkbox"
              checked={data.agreementAccepted}
              onChange={(e) => onChange({ agreementAccepted: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 transition-all cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                Hackathon Code of Conduct & Rules Agreement <span className="text-rose-500">*</span>
              </span>
              <p className="text-slate-600 dark:text-slate-400 mt-1 italic">
                "{AGREEMENT_TEXT}"
              </p>
            </div>
          </label>
        </div>

        {/* Official Announcements Notice */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <MessageCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>
              Official communication group link will be presented on the confirmation screen immediately after submission.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            id="back-to-step-3-btn"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Members
          </button>

          <button
            type="button"
            id="final-submit-button"
            onClick={handleSubmit}
            disabled={!validation.isValid || isSubmitting}
            className={`px-8 py-3.5 rounded-xl text-sm font-bold inline-flex items-center gap-2.5 transition-all shadow-md ${
              validation.isValid && !isSubmitting
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white active:scale-98 shadow-cyan-500/20"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting Registration...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit Registration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

