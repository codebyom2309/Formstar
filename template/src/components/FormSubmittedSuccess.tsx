import React from "react";
import { RegistrationFormData, OFFICIAL_WHATSAPP_GROUP_LINK } from "../types";
import {
  CheckCircle2,
  Users,
  MessageCircle,
  Award,
  ArrowRight,
  Printer,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
} from "lucide-react";

interface FormSubmittedSuccessProps {
  data: RegistrationFormData;
  onReset: () => void;
  whatsappLink?: string;
}

export const FormSubmittedSuccess: React.FC<FormSubmittedSuccessProps> = ({
  data,
  onReset,
  whatsappLink = OFFICIAL_WHATSAPP_GROUP_LINK,
}) => {
  const teamMemberCount = parseInt(data.teamSize.match(/\d+/)?.[0] || "4", 10) - 1;
  const activeMembers = data.members.slice(0, teamMemberCount);
  const submissionTimestamp = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 transition-colors">
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800/90 shadow-sm overflow-hidden transition-colors">
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center mb-4 shadow-lg backdrop-blur-xs">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-2 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" /> Official Registration Recorded
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Form Submitted Successfully!
          </h1>
          <p className="text-sm sm:text-base text-emerald-50 max-w-xl mx-auto mt-2 leading-relaxed">
            Your team registration has been recorded and verified. Welcome to HackX 2026!
          </p>

          <div className="mt-4 inline-block px-4 py-1.5 bg-black/20 rounded-xl text-xs font-mono text-emerald-200 backdrop-blur-xs">
            Recorded at: {submissionTimestamp}
          </div>
        </div>

        {/* WhatsApp Group Highlight Card */}
        <div className="p-6 sm:p-8 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-start gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md mx-auto md:mx-0">
                <MessageCircle className="w-8 h-8 fill-current" />
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Join Official WhatsApp Group
                  </h2>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold rounded-md">
                    Mandatory for All Members
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  Important hackathon announcements, team verification alerts, venue details, and problem statement release links will be shared exclusively on this official WhatsApp group.
                </p>
              </div>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              id="whatsapp-join-button"
              className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BE5C] text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 shrink-0 active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Join WhatsApp Group</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Registration Summary Receipt */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Registration Receipt Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Keep this copy for on-campus check-in and team verification.
              </p>
            </div>
            <span className="px-3 py-1 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-xs font-bold rounded-lg border border-cyan-200 dark:border-cyan-800/70">
              {data.track} Theme
            </span>
          </div>

          {/* Quick Team Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Team Name</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{data.teamName}</p>
            </div>
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Team Size</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{data.teamSize}</p>
            </div>
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Selected Theme</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{data.track}</p>
            </div>
          </div>

          {/* Team Leader Card */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-wider">
                Team Leader (Primary Contact)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Full Name:</span>
                <p className="font-semibold text-slate-900 dark:text-white">{data.leader.name}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Official Email:</span>
                <p className="font-semibold text-slate-900 dark:text-white">{data.leader.email}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                <p className="font-semibold text-slate-900 dark:text-white">{data.leader.phone}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">College:</span>
                <p className="font-semibold text-slate-900 dark:text-white">{data.leader.college}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Branch & Year:</span>
                <p className="font-semibold text-slate-900 dark:text-white">{data.leader.yearBranch || "N/A"}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">GitHub / Portfolio:</span>
                <p className="font-semibold text-slate-900 dark:text-white truncate">{data.leader.github || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Payment & Verification Receipt Details */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                  Payment Verification Record
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded">
                Verified & Recorded
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Registration Fee:</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">₹650.00 (Paid via UPI)</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Transaction ID / UTR:</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white select-all">
                  {data.transactionId || "Recorded with submission"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Payment Screenshot:</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {data.screenshotFileName || "Screenshot Attached & Verified"}
                </p>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h4 className="text-xs font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-wider mb-3">
              Registered Members ({activeMembers.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Member {idx + 2}: {member.name || `[Empty]`}
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded">
                      Member {idx + 2}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{member.email} &bull; {member.phone}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">{member.college}</p>
                  {member.github && (
                    <p className="text-cyan-600 dark:text-cyan-400 text-[11px] font-mono truncate">{member.github}</p>
                  )}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {member.roles.map((r) => (
                      <span
                        key={r}
                        className="px-1.5 py-0.5 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 rounded text-[10px] font-medium"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons (Print / Save & Register Another) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              id="print-receipt-btn"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 transition-all shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Print / Save Receipt</span>
            </button>

            <button
              type="button"
              id="register-another-btn"
              onClick={onReset}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white inline-flex items-center gap-2 transition-all shadow-sm active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Register Another Team</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

