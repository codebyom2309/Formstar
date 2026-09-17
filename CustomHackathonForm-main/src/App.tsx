import React, { useState, useEffect } from "react";
import { HeaderStepper } from "./components/HeaderStepper";
import { TeamBasicsForm } from "./components/TeamBasicsForm";
import { LeaderDetailsForm } from "./components/LeaderDetailsForm";
import { DynamicMembersForm } from "./components/DynamicMembersForm";
import { PaymentVerificationForm } from "./components/PaymentVerificationForm";
import { FormSubmittedSuccess } from "./components/FormSubmittedSuccess";
import { TeamOverviewDrawer } from "./components/TeamOverviewDrawer";
import { RulesModalDrawer } from "./components/RulesModalDrawer";
import { HackXLogo } from "./components/HackXLogo";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { RegistrationFormData, OFFICIAL_WHATSAPP_GROUP_LINK } from "./types";
import { createEmptyFormData } from "./lib/formUtils";
import {
  validateStep,
  focusAndHighlightField,
} from "./lib/stepValidation";
import { BookOpen, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const AUTOSAVE_STORAGE_KEY = "hackx_registration_form_data";

export default function App() {
  // Navigation view state: "register" | "home"
  const [currentView, setCurrentView] = useState<"register" | "home">(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get("view");
      if (viewParam === "home" || window.location.hash === "#home") {
        return "home";
      }
    }
    return "register";
  });

  // Modal drawer state for in-app Rules & Guidelines
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Lightweight Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Listen for browser popstate / hashchange navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("view") === "home" || window.location.hash === "#home") {
        setCurrentView("home");
      } else {
        setCurrentView("register");
      }
    };
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const navigateToHome = () => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("view", "home");
    window.history.pushState({}, "", newUrl.toString());
    setCurrentView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToRegister = () => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("view");
    newUrl.hash = "";
    window.history.pushState({}, "", newUrl.toString());
    setCurrentView("register");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Initialize form state from sessionStorage / localStorage (Dual Persistence)
  const [formData, setFormData] = useState<RegistrationFormData>(() => {
    const defaultData = createEmptyFormData();
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(AUTOSAVE_STORAGE_KEY) || localStorage.getItem(AUTOSAVE_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const { screenshotBase64, ...textFields } = parsed;
          return {
            ...defaultData,
            ...textFields,
            leader: { ...defaultData.leader, ...(textFields.leader || {}) },
            members:
              Array.isArray(textFields.members) && textFields.members.length > 0
                ? textFields.members
                : defaultData.members,
          };
        }
      } catch (e) {
        console.warn("Could not parse saved form data:", e);
      }
    }
    return defaultData;
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Auto-Save Effect: Persist all text fields to both sessionStorage and localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && !isSubmitted) {
      try {
        const { screenshotBase64, ...textDataToSave } = formData;
        const serialized = JSON.stringify(textDataToSave);
        localStorage.setItem(AUTOSAVE_STORAGE_KEY, serialized);
        sessionStorage.setItem(AUTOSAVE_STORAGE_KEY, serialized);
      } catch (err) {
        console.warn("Failed to auto-save form data:", err);
      }
    }
  }, [formData, isSubmitted]);

  // Ensure app opens and runs exclusively in default light mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      localStorage.removeItem("hackx_theme");
      sessionStorage.removeItem("hackx_theme");
    }
  }, []);

  const handleUpdateForm = (updates: Partial<RegistrationFormData>) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        ...updates,
      };

      // If leader's college is updated, automatically populate member colleges if empty or matching previous
      if (
        updates.leader &&
        updates.leader.college !== undefined &&
        updates.leader.college !== prev.leader.college
      ) {
        const oldCollege = prev.leader.college;
        const newCollege = updates.leader.college;
        next.members = next.members.map((m) => {
          if (!m.college || m.college.trim() === "" || m.college === oldCollege) {
            return { ...m, college: newCollege };
          }
          return m;
        });
      }

      return next;
    });
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
      sessionStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setFormData(createEmptyFormData());
    setCurrentStep(1);
    setIsSubmitted(false);
  };

  // Step Progression Gating check
  const canNavigateToStep = (targetStep: number): boolean => {
    // Backward navigation to previously visited steps is always permitted
    if (targetStep <= currentStep) return true;

    // Check all previous steps up to targetStep - 1
    for (let s = 1; s < targetStep; s++) {
      const res = validateStep(s, formData);
      if (!res.isValid) return false;
    }
    return true;
  };

  // Handle blocked attempt when user clicks a future step header without completing current
  const handleAttemptBlockedStep = (targetStep: number) => {
    for (let s = 1; s < targetStep; s++) {
      const res = validateStep(s, formData);
      if (!res.isValid) {
        setToastMessage(res.message || `Please complete all mandatory fields in Step ${s} before proceeding.`);
        setCurrentStep(s);
        setTimeout(() => {
          if (res.firstErrorFieldId) {
            focusAndHighlightField(res.firstErrorFieldId);
          }
        }, 100);
        return;
      }
    }
  };

  const teamMemberCount = parseInt(formData.teamSize.match(/\d+/)?.[0] || "4", 10) - 1;

  // Standalone Home / Overview & Rules page (Accessible via URL or footer link)
  if (currentView === "home") {
    return (
      <div className="min-h-[100dvh] flex flex-col font-sans">
        <HomePage
          onNavigateRegister={navigateToRegister}
        />
        <Footer
          onNavigateHome={navigateToHome}
          onNavigateRegister={navigateToRegister}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#070D18] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-cyan-500/20 selection:text-cyan-600 dark:selection:text-cyan-400">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
          >
            <div className="p-3.5 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-900/30 border border-rose-400 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="p-1 hover:bg-rose-700 rounded-lg transition-colors focus:outline-hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="bg-white/90 dark:bg-[#0B132B]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <HackXLogo
              size="sm"
              onClick={() => setShowRulesModal(true)}
            />
          </div>

          {/* Right Actions: Distinct Overview & Rules Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              id="overview-rules-modal-btn"
              onClick={() => setShowRulesModal(true)}
              className="px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-[0.98]"
              title="Open HackX 2026 Guidelines, Schedule & Rules"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Overview &amp; Rules</span>
            </button>
          </div>
        </div>
      </header>

      {/* Rules & Guidelines Modal / Drawer Component */}
      <RulesModalDrawer
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        onContinueRegistration={() => setShowRulesModal(false)}
      />

      {/* When submitted successfully, display full dedicated Success Page with WhatsApp Group Call-to-Action */}
      {isSubmitted ? (
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 scroll-pt-28 sm:scroll-pt-32">
          <FormSubmittedSuccess
            data={formData}
            onReset={handleReset}
            whatsappLink={OFFICIAL_WHATSAPP_GROUP_LINK}
          />
        </main>
      ) : (
        <>
          {/* iOS-Style Collapsible Sticky Stepper with Progression Gating */}
          <HeaderStepper
            currentStep={currentStep}
            onSelectStep={setCurrentStep}
            teamSize={formData.teamSize}
            canNavigateToStep={canNavigateToStep}
            onAttemptBlockedStep={handleAttemptBlockedStep}
          />

          {/* Main Scrolling Workspace Layout: Clean, Focused Single-Column Form */}
          <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 scroll-pt-28 sm:scroll-pt-32 pb-24 space-y-6">
            {/* Step Form Card */}
            {currentStep === 1 && (
              <TeamBasicsForm
                data={formData}
                onChange={handleUpdateForm}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <LeaderDetailsForm
                data={formData}
                onChange={handleUpdateForm}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <DynamicMembersForm
                data={formData}
                onChange={handleUpdateForm}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <PaymentVerificationForm
                data={formData}
                onChange={handleUpdateForm}
                onBack={() => setCurrentStep(3)}
                onJumpToStep={setCurrentStep}
                onSubmitSuccess={() => {
                  try {
                    localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
                    sessionStorage.removeItem(AUTOSAVE_STORAGE_KEY);
                  } catch (e) {
                    // ignore
                  }
                  setIsSubmitted(true);
                }}
              />
            )}
          </main>

          {/* Relocated Team Overview Drawer (Triggerable via Floating Pill / Button) */}
          <TeamOverviewDrawer data={formData} />
        </>
      )}

      {/* Comprehensive Footer */}
      <Footer
        onNavigateHome={navigateToHome}
        onNavigateRegister={navigateToRegister}
      />
    </div>
  );
}
