import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Clock,
  ShieldCheck,
  Award,
  Users,
  IndianRupee,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
} from "lucide-react";

interface RulesModalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueRegistration?: () => void;
}

export const RulesModalDrawer: React.FC<RulesModalDrawerProps> = ({
  isOpen,
  onClose,
  onContinueRegistration,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleAction = () => {
    onClose();
    if (onContinueRegistration) {
      onContinueRegistration();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full sm:max-w-3xl max-h-[90dvh] sm:max-h-[85dvh] bg-white dark:bg-[#0C1222] border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
          >
            {/* Mobile Pull Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>HackX 2026 Overview &amp; Rules</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/25">
                      TeleEra@PCE
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Official Hackathon Guidelines, Round Schedules &amp; Regulations
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
              {/* Highlight Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <IndianRupee className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Registration</span>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                    ₹650.00
                  </div>
                  <span className="text-[10px] text-slate-400">Flat fee per squad</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Users className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Team Size</span>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                    2–5 Members
                  </div>
                  <span className="text-[10px] text-slate-400">1 Lead + 1–4 Teammates</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Deadline</span>
                  </div>
                  <div className="text-base font-black text-amber-700 dark:text-amber-400 mt-1">
                    Oct 1, 2026
                  </div>
                  <span className="text-[10px] text-slate-400">Midnight 00:00 IST</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Event Dates</span>
                  </div>
                  <div className="text-base font-black text-indigo-700 dark:text-indigo-400 mt-1">
                    Oct 3–5, 2026
                  </div>
                  <span className="text-[10px] text-slate-400">PCE Nagpur Campus</span>
                </div>
              </div>

              {/* Event Schedule Roadmap */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Official Round Timelines &amp; Workflow
                </h3>

                <div className="space-y-3">
                  {/* Round 1 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        Day 1 &bull; Saturday, October 3, 2026
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-500/25">
                        Round 1 &amp; Judging
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <li><strong>On-Spot Problem Statement Reveal:</strong> Unveiled strictly at the venue to ensure fair play and eliminate pre-coded advantages.</li>
                      <li><strong>Architecture &amp; Prototype Sprint:</strong> Teams ideate, develop base architecture, and create pitch presentation.</li>
                      <li><strong>3:00 PM:</strong> Round 1 Evaluation &amp; Judging begins before jury panels.</li>
                      <li><strong>Same-Day Results:</strong> Shortlist for the grand sprint published on October 3 itself.</li>
                    </ul>
                  </div>

                  {/* Round 2 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        Day 2 &bull; Sunday, October 4, 2026
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-500/25">
                        Deep Sprint &bull; Full Sunday
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Shortlisted teams receive the <strong>entire Sunday</strong> to build out their final working product, integrate live APIs, refine UX, and prepare grand finale slide decks from anywhere.
                    </p>
                  </div>

                  {/* Day 3 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        Day 3 &bull; Monday, October 5, 2026
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                        Grand Finale &amp; Awards
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Assemble at PCE Nagpur campus for final live product demonstrations, jury Q&amp;A, and the grand valedictory ceremony.
                    </p>
                  </div>
                </div>
              </div>

              {/* Strict Rules & Regulations */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Key Rules &amp; Regulations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Fresh Code Mandate
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      All solution code must be written after the problem statements are unveiled on Oct 3. Pre-existing code bases are strictly prohibited.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ID &amp; Eligibility
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      All participants must present valid college or institution ID cards during on-site check-in at PCE Nagpur.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Team Formation
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Squads must consist strictly of 2 to 5 members. Inter-college and cross-disciplinary squads are welcomed.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Submission &amp; IP
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Teams retain full intellectual property of their builds. All repositories must be public during evaluation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Organizer Enquiry Helpdesk */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Organizing Committee Enquiries
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#090F1E] border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>Ujjwal Barange</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300">
                        Organizer
                      </span>
                    </div>
                    <div className="space-y-1 text-slate-600 dark:text-slate-400">
                      <a href="tel:+917987494482" className="flex items-center gap-2 hover:text-cyan-600">
                        <Phone className="w-3 h-3 text-cyan-500" />
                        <span>+91 7987494482</span>
                      </a>
                      <a href="mailto:ujjwall.barange@gmail.com" className="flex items-center gap-2 hover:text-cyan-600">
                        <Mail className="w-3 h-3 text-cyan-500" />
                        <span className="truncate">ujjwall.barange@gmail.com</span>
                      </a>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#090F1E] border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>Om Satange</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-800 dark:text-blue-300">
                        Organizer
                      </span>
                    </div>
                    <div className="space-y-1 text-slate-600 dark:text-slate-400">
                      <a href="tel:+917249346921" className="flex items-center gap-2 hover:text-cyan-600">
                        <Phone className="w-3 h-3 text-cyan-500" />
                        <span>+91 7249346921</span>
                      </a>
                      <a href="mailto:omsatange5788@gmail.com" className="flex items-center gap-2 hover:text-cyan-600">
                        <Mail className="w-3 h-3 text-cyan-500" />
                        <span className="truncate">omsatange5788@gmail.com</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Action */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                Registration closes Oct 1, 2026 (00:00 IST)
              </span>
              <button
                type="button"
                onClick={handleAction}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Continue Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
