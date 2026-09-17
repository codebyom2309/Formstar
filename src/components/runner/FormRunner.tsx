import React, { useState, useEffect, useRef } from "react";
import { FormConfig, FormField, FormStep, ConditionalRule, ConditionalClause, FormCard } from "../../types";
import { CanonicalExperienceSchema, ExperienceQuestion } from "../../types/canonicalExperience";
import { convertConfigToExperience, convertExperienceToConfig } from "../../lib/experienceAdapter";
import { OverviewDrawer } from "./OverviewDrawer";
import { CanonicalFieldRenderer } from "./CanonicalFieldRenderer";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  UploadCloud,
  FileText,
  AlertCircle,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Check,
  Calendar,
  Layers,
  MessageSquare,
  ShieldCheck,
  QrCode,
  Copy,
  CreditCard,
  Eye,
  X,
  Edit3,
  BookOpen,
  Users,
  Zap,
  Cpu,
  Clock,
  GraduationCap,
  Terminal,
  Smile,
} from "lucide-react";

interface FormRunnerProps {
  config: FormConfig;
  hostedSlug?: string;
  isSandbox?: boolean;
  onSimulateSubmit?: (responses: Record<string, any>) => void;
  onExitRunner?: () => void;
}

export const FormRunner: React.FC<FormRunnerProps> = ({
  config,
  hostedSlug,
  isSandbox = false,
  onSimulateSubmit,
  onExitRunner,
}) => {
  const rawExperience: CanonicalExperienceSchema | undefined =
    config?.aiExperience || (config as any)?.jsonConfig?.aiExperience;
  const experience: CanonicalExperienceSchema =
    rawExperience || convertConfigToExperience(config, hostedSlug);

  // Derive steps prioritizing AI canonical experience sections if available
  const rawSteps = React.useMemo(() => {
    if (rawExperience?.sections && rawExperience.sections.length > 0) {
      return convertExperienceToConfig(rawExperience).steps;
    }
    if (config?.steps && config.steps.length > 0) {
      return config.steps;
    }
    if (experience?.sections && experience.sections.length > 0) {
      return convertExperienceToConfig(experience).steps;
    }
    return [];
  }, [config?.steps, rawExperience, experience]);

  const meta = config?.meta || {
    title: experience.form?.title || "NextForm",
    description: experience.form?.description || "",
    targetActionUrl: experience.source?.targetActionUrl || "",
  };

  const isHackathonCategory = experience.form.category === "hackathon";

  // Visual personality configuration derived from AI schema
  const personality = experience.theme?.personality || (
    isHackathonCategory ? "energetic" :
    experience.form.category === "quiz" || experience.form.category === "assessment" ? "academic" :
    experience.form.category === "survey" || experience.form.category === "feedback" ? "friendly" :
    experience.form.category === "contact" ? "minimal" :
    "professional"
  );

  const theme = {
    primaryColor: experience.theme?.primaryColor || config?.theme?.primaryColor || "#2563eb",
    backgroundColor: experience.theme?.backgroundColor || config?.theme?.backgroundColor || "#f8fafc",
    borderRadius: experience.theme?.borderRadius || config?.theme?.borderRadius || "rounded-2xl",
    fontFamily: experience.theme?.fontFamily || config?.theme?.fontFamily || "Plus Jakarta Sans",
  };
  const logic = config?.logic;
  const payment = config?.payment;
  const cloudinary = config?.cloudinary;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadField, setActiveUploadField] = useState<FormField | null>(null);

  // Pre-index canonical questions for fast metadata & validation lookup
  const questionMap = React.useMemo(() => {
    const map: Record<string, ExperienceQuestion> = {};
    if (experience?.sections) {
      for (const sec of experience.sections) {
        for (const q of sec.questions) {
          if (q.id) map[q.id] = q;
          if (q.sourceQuestionId) map[q.sourceQuestionId] = q;
          if (q.googleEntryId) map[q.googleEntryId] = q;
        }
      }
    }
    return map;
  }, [experience]);

  // Helper to format step display info for clean circle stepper
  const getStepDisplayInfo = (step: FormStep, index: number) => {
    const fullTitle = step.title || `Step ${index + 1}`;
    let shortTitle = fullTitle;
    let subtitle = step.description || "";

    const colonMatch = fullTitle.match(/^Step\s*\d+\s*:\s*(.+)$/i);
    if (colonMatch) {
      shortTitle = colonMatch[1].trim();
    }

    if (isHackathonCategory) {
      const lower = shortTitle.toLowerCase();
      if (lower.includes("general") || lower.includes("basic") || lower.includes("team")) {
        if (!subtitle) subtitle = "Name & Theme";
        if (lower.includes("general")) shortTitle = "Team Basics";
      } else if (lower.includes("leader")) {
        shortTitle = "Leader Details";
        if (!subtitle) subtitle = "Lead Contact";
      } else if (lower.includes("member")) {
        shortTitle = "Members";
        if (!subtitle) subtitle = "Teammates";
      } else if (
        lower.includes("payment") ||
        lower.includes("legal") ||
        lower.includes("consent") ||
        lower.includes("operational")
      ) {
        shortTitle = "Payment & Verify";
        if (!subtitle) subtitle = "UPI & Submit";
      }
    } else {
      if (!subtitle) {
        const fieldCount = step.cards.reduce((acc, c) => acc + c.fields.length, 0);
        subtitle = `${fieldCount} Question${fieldCount === 1 ? "" : "s"}`;
      }
    }

    return { shortTitle, subtitle };
  };

  // Helper to evaluate a single condition clause
  const evaluateClause = (fieldId: string, operator: string, target: any): boolean => {
    if (!fieldId) return true;
    const currentVal = answers[fieldId];
    if (currentVal === undefined || currentVal === null || currentVal === "") return false;

    const strCurrent = String(currentVal).toLowerCase().trim();
    const strTarget = String(target).toLowerCase().trim();

    switch (operator) {
      case "equals":
        return strCurrent === strTarget;
      case "not_equals":
        return strCurrent !== strTarget;
      case "contains":
        return strCurrent.includes(strTarget);
      case "greater_than":
        return parseFloat(String(currentVal)) > parseFloat(String(target));
      case "less_than":
        return parseFloat(String(currentVal)) < parseFloat(String(target));
      default:
        return true;
    }
  };

  // Evaluate rule helper with AND / OR multi-clause logic and show/hide action
  const evaluateRule = (rule?: ConditionalRule): boolean => {
    if (!rule || !rule.fieldId) return true;

    // Evaluate primary clause
    let conditionMet = evaluateClause(rule.fieldId, rule.operator, rule.value);

    // Evaluate secondary clauses if defined
    if (rule.clauses && rule.clauses.length > 0) {
      const clauseResults = rule.clauses.map((c) =>
        evaluateClause(c.fieldId, c.operator, c.value)
      );

      if (rule.logicOperator === "or") {
        conditionMet = conditionMet || clauseResults.some(Boolean);
      } else {
        conditionMet = conditionMet && clauseResults.every(Boolean);
      }
    }

    return rule.action === "hide" ? !conditionMet : conditionMet;
  };

  // Helper to determine whether a card is visible
  const isCardVisible = (card: FormCard, _cardStep?: FormStep): boolean => {
    // 1. Standard conditional rule
    if (!evaluateRule(card.conditionalRule)) return false;

    // 2. Quantity Logic (Option-to-Card Visibility Mapping)
    if (logic?.quantityLogicEnabled && logic?.quantityTriggerFieldId) {
      // Collect all cards that are controlled by quantity logic across any option
      const allQuantityControlledCards = new Set<string>();
      const mappings: Record<string, string[]> = (logic.quantityCardMappings as Record<string, string[]>) || {};
      for (const cardList of Object.values(mappings)) {
        if (Array.isArray(cardList)) {
          for (const cId of cardList) {
            if (cId) allQuantityControlledCards.add(cId);
          }
        }
      }

      // CRITICAL: Quantity Logic ONLY controls cards that are mapped in quantityCardMappings!
      // Standard / non-dynamic cards (e.g. Team Leader, College, Project, Contact, Payment) MUST NEVER be hidden by quantity logic!
      if (allQuantityControlledCards.has(card.id)) {
        const rawTriggerVal = answers[logic.quantityTriggerFieldId];
        const selectedAnswer =
          rawTriggerVal !== undefined && rawTriggerVal !== null
            ? String(rawTriggerVal).trim()
            : "";

        if (!selectedAnswer) {
          // Trigger question not answered yet -> hide dynamic quantity cards until selected
          return false;
        }

        // Look up allowed cards for this option
        let allowedCards: string[] | undefined = mappings[selectedAnswer];

        if (!allowedCards) {
          const lower = selectedAnswer.toLowerCase();
          for (const [optKey, list] of Object.entries(mappings)) {
            if (optKey.trim().toLowerCase() === lower && Array.isArray(list)) {
              allowedCards = list;
              break;
            }
          }
        }

        if (!allowedCards) {
          const numMatch = selectedAnswer.match(/\d+/);
          if (numMatch) {
            for (const [optKey, list] of Object.entries(mappings)) {
              const optNum = optKey.match(/\d+/);
              if (optNum && optNum[0] === numMatch[0] && Array.isArray(list)) {
                allowedCards = list;
                break;
              }
            }
          }
        }

        if (allowedCards && Array.isArray(allowedCards)) {
          if (!allowedCards.includes(card.id)) {
            return false;
          }
        } else {
          return false;
        }
      }
    }

    // 3. Dynamic Team Members rule fallback (if configured)
    if (logic?.dynamicTeamMembers && logic?.teamSizeFieldId) {
      const rawVal = answers[logic.teamSizeFieldId];
      if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
        const selectedSize = parseInt(String(rawVal), 10) || 4;
        const match = card.title.toLowerCase().match(/member\s*(\d+)/i);
        if (match && match[1]) {
          const memberNum = parseInt(match[1], 10);
          if (memberNum > selectedSize) {
            return false;
          }
        }
      }
    }

    return true;
  };

  // Determine active visible steps dynamically
  const steps = rawSteps.filter((step, idx) => {
    // Step 1 (idx === 0) is the root entry point of the form and is ALWAYS visible
    if (idx === 0) return true;

    // 1. Evaluate step-level conditional rule
    if (!evaluateRule(step.conditionalRule)) return false;

    // 2. Evaluate Dynamic Team Members rule
    if (logic?.dynamicTeamMembers && logic?.teamSizeFieldId) {
      const rawVal = answers[logic.teamSizeFieldId];
      if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
        const selectedSize = parseInt(String(rawVal), 10) || 4;
        const titleLower = step.title.toLowerCase();
        const match = titleLower.match(/member\s*(\d+)/i);
        if (match && match[1]) {
          const memberNum = parseInt(match[1], 10);
          if (memberNum > selectedSize) {
            return false;
          }
        }
      }
    }

    // 3. If step has cards, verify at least one card in this step is visible
    if (step.cards && step.cards.length > 0) {
      const hasAnyVisibleCard = step.cards.some((c) => isCardVisible(c, step));
      if (!hasAnyVisibleCard) {
        return false;
      }
    }

    return true;
  });

  // Reset if form configuration or step count changes
  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(Math.max(0, steps.length - 1));
    }
  }, [steps.length, currentStepIndex]);

  const currentStep: FormStep | undefined = steps[currentStepIndex];

  // Visible cards inside current step (evaluates Show/Hide logic and Quantity Logic)
  const visibleCards = (currentStep?.cards || []).filter((card) => isCardVisible(card, currentStep));

  // Check if current step has multiple visible cards requiring a nested "step inside step" tabbed UI
  const isMultiCardStep = Boolean(currentStep && visibleCards.length > 1);

  // Check if this multi-card step is specifically representing team members (for specialized badges/labels)
  const isTeammatesCardStep = Boolean(
    isMultiCardStep &&
      (currentStep?.title.toLowerCase().includes("member") ||
        currentStep?.title.toLowerCase().includes("teammate") ||
        visibleCards.every((c) => /member|teammate/i.test(c.title)))
  );

  // Helper to get field value
  const getValue = (fieldId: string, defaultValue: any = "") => {
    return answers[fieldId] !== undefined ? answers[fieldId] : defaultValue;
  };

  const setValue = (fieldId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  // Dynamic Input Validation function with Canonical rules support
  const validateField = (field: FormField, val: any): string | null => {
    const expQ = questionMap[field.id] || questionMap[field.entryCode || ""];
    const isRequired = expQ?.required ?? field.required;

    if (isRequired) {
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      ) {
        return `"${field.label}" is required.`;
      }
    }

    if (val === undefined || val === null || val === "") return null;
    const str = typeof val === "string" ? val.trim() : String(val);

    // Number validation
    if (
      field.validationType === "number" ||
      expQ?.type === "number" ||
      expQ?.recommendedComponent === "NumberInput"
    ) {
      if (!/^-?\d+(\.\d+)?$/.test(str)) {
        return "Please enter a valid numeric value.";
      }
      const numVal = parseFloat(str);
      if (expQ?.validation?.min !== undefined && numVal < expQ.validation.min) {
        return `Minimum value is ${expQ.validation.min}.`;
      }
      if (expQ?.validation?.max !== undefined && numVal > expQ.validation.max) {
        return `Maximum value is ${expQ.validation.max}.`;
      }
    } else if (
      field.validationType === "phone" ||
      expQ?.type === "phone" ||
      expQ?.recommendedComponent === "PhoneInput" ||
      expQ?.validation?.isPhone
    ) {
      const digits = str.replace(/\D/g, "");
      if (digits.length < 10) {
        return "Please enter a valid phone number (at least 10 digits).";
      }
    } else if (
      field.validationType === "email" ||
      expQ?.type === "email" ||
      expQ?.recommendedComponent === "EmailInput" ||
      expQ?.validation?.isEmail
    ) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
        return "Please enter a valid email address (e.g. name@example.com).";
      }
    } else if (
      field.validationType === "url" ||
      expQ?.type === "url" ||
      expQ?.recommendedComponent === "URLInput" ||
      expQ?.validation?.isUrl
    ) {
      if (!/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(str)) {
        return "Please enter a valid web URL (e.g. https://github.com/profile).";
      }
    }

    // Min / Max length checks
    if (expQ?.validation?.minLength && str.length < expQ.validation.minLength) {
      return `Must be at least ${expQ.validation.minLength} characters.`;
    }
    if (expQ?.validation?.maxLength && str.length > expQ.validation.maxLength) {
      return `Cannot exceed ${expQ.validation.maxLength} characters.`;
    }

    // Custom regex pattern
    if (expQ?.validation?.pattern) {
      try {
        const regex = new RegExp(expQ.validation.pattern);
        if (!regex.test(str)) {
          return expQ.validation.customMessage || "Input does not match the required format.";
        }
      } catch (e) {
        // Ignore invalid regex
      }
    }

    return null;
  };

  // Validate current step fields
  const validateCurrentStep = (): boolean => {
    if (!currentStep) return true;
    const newErrors: Record<string, string> = {};

    for (const card of visibleCards) {
      for (const field of card.fields || []) {
        const val = answers[field.id];
        const errorMsg = validateField(field, val);
        if (errorMsg) {
          newErrors[field.id] = errorMsg;
        }
      }
    }

    // If on final step and UPI payment is enabled, validate UTR
    if (currentStepIndex === steps.length - 1 && payment?.enabled) {
      const utrVal = answers["entry.utr"] || answers["utr"];
      if (!utrVal || String(utrVal).trim().length < 6) {
        newErrors["payment_utr"] = "Please enter a valid Bank Transaction / UTR Ref number.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clamp activeCardIndex when visibleCards changes
  useEffect(() => {
    if (activeCardIndex >= visibleCards.length) {
      setActiveCardIndex(Math.max(0, visibleCards.length - 1));
    }
  }, [visibleCards.length, activeCardIndex]);

  // When step changes, reset activeCardIndex to 0
  useEffect(() => {
    setActiveCardIndex(0);
  }, [currentStepIndex]);

  // Validate a single card's fields
  const validateCard = (card: FormCard): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of card.fields || []) {
      const val = answers[field.id];
      const errorMsg = validateField(field, val);
      if (errorMsg) {
        newErrors[field.id] = errorMsg;
      }
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    // If step has multiple cards in nested sub-step view and we're not on the last card, validate current card and navigate to next card
    if (isMultiCardStep && activeCardIndex < visibleCards.length - 1) {
      const activeCard = visibleCards[activeCardIndex];
      if (activeCard && !validateCard(activeCard)) {
        return;
      }
      setActiveCardIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // On single card step, or when finishing the last card in a multi-card step: validate the entire step
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setActiveCardIndex(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    // If multi-card step and we are past card 0, go back to previous card inside the step
    if (isMultiCardStep && activeCardIndex > 0) {
      setActiveCardIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setActiveCardIndex(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // File Upload Handler (Cloudinary or Simulated)
  const handleTriggerUpload = (field: FormField) => {
    setActiveUploadField(field);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadField) return;

    setUploadingFieldId(activeUploadField.id);

    // If Cloudinary credentials configured, upload to Cloudinary API
    if (cloudinary?.enabled && cloudinary.cloudName && cloudinary.uploadPreset) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", cloudinary.uploadPreset);
        if (cloudinary.folder) {
          formData.append("folder", cloudinary.folder);
        }

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (res.ok) {
          const data = await res.json();
          setValue(activeUploadField.id, data.secure_url || data.url);
          setUploadingFieldId(null);
          return;
        }
      } catch (err) {
        console.warn("Cloudinary upload failed, falling back to CDN preview:", err);
      }
    }

    // Fallback simulated CDN URL
    setTimeout(() => {
      const mockCdnUrl = `https://res.cloudinary.com/deform/image/upload/v${Date.now()}/${encodeURIComponent(
        file.name
      )}`;
      setValue(activeUploadField.id, mockCdnUrl);
      setUploadingFieldId(null);
    }, 700);
  };

  // Final Submission: Compile responses across ALL steps & cards
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    const subId = `NF-${Date.now().toString().slice(-6)}-${Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase()}`;

    // Compile responses across all steps, cards, and fields
    const compiledResponses: Record<string, any> = { ...answers };
    for (const step of rawSteps) {
      for (const card of step.cards || []) {
        for (const field of card.fields || []) {
          const val = answers[field.id];
          if (val !== undefined) {
            compiledResponses[field.id] = val;
            if (field.entryCode) {
              compiledResponses[field.entryCode] = val;
            }
          }
        }
      }
    }

    if (isSandbox) {
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmissionId(subId);
        setIsSuccess(true);
        if (onSimulateSubmit) {
          onSimulateSubmit(compiledResponses);
        }
      }, 700);
      return;
    }

    // Real API submission
    try {
      const targetSlug = hostedSlug || "default";
      const res = await fetch(`/api/forms/${targetSlug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: compiledResponses }),
      });

      const data = await res.json();
      setSubmissionId(data.submissionCode || data.submissionId || subId);
      setIsSuccess(true);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmissionId(subId);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setErrors({});
    setCurrentStepIndex(0);
    setIsSuccess(false);
    setSubmissionId("");
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter advances or submits
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Progress percentage
  const totalSteps = steps.length || 1;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  // UPI payment URI & QR code url
  const upiId = payment?.upiId || "hackathon@upi";
  const payeeName = payment?.payeeName || "NextGen Hackathon";
  const amount = payment?.amount || 500;
  const note = payment?.note || "Hackathon Registration Fee";
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiUri
  )}`;

  // Success view
  if (isSuccess) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 md:p-10 my-4 sm:my-8 bg-white rounded-3xl shadow-xl border border-slate-100 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {meta.confirmationTitle || "Registration Submitted!"}
        </h2>

        <p className="mt-2.5 text-slate-600 text-sm md:text-base max-w-md mx-auto leading-relaxed">
          {meta.confirmationMessage ||
            "Your registration has been successfully recorded in the official event register."}
        </p>

        {/* Verification Tracking Code */}
        <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Verification ID
          </span>
          <span className="text-base font-mono font-extrabold text-slate-900 tracking-wider">
            {submissionId}
          </span>
        </div>

        {/* WhatsApp Group Invite Card */}
        {meta.whatsappGroupUrl && (
          <div className="my-6 p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-950">Join WhatsApp Community</h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Join our official participants group for problem statements and team coordination.
              </p>
              <a
                href={meta.whatsappGroupUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>Join Group Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Submit Another Response</span>
          </button>

          {isSandbox && onExitRunner && (
            <button
              onClick={onExitRunner}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <span>Return to Studio</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Personality Badge config derived from CanonicalExperienceSchema
  const personalityBadge = React.useMemo(() => {
    switch (personality) {
      case "academic":
        return {
          icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />,
          label: "Academic Assessment",
          classes: "bg-indigo-50/90 text-indigo-800 border-indigo-200/80 shadow-2xs",
        };
      case "energetic":
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-violet-600" />,
          label: "Event Experience",
          classes: "bg-violet-50/90 text-violet-800 border-violet-200/80 shadow-2xs",
        };
      case "technical":
        return {
          icon: <Terminal className="w-3.5 h-3.5 text-cyan-600" />,
          label: "Technical Track",
          classes: "bg-cyan-50/90 text-cyan-800 border-cyan-200/80 shadow-2xs",
        };
      case "friendly":
        return {
          icon: <Smile className="w-3.5 h-3.5 text-emerald-600" />,
          label: "Community Survey",
          classes: "bg-emerald-50/90 text-emerald-800 border-emerald-200/80 shadow-2xs",
        };
      case "minimal":
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />,
          label: "Direct Form",
          classes: "bg-zinc-100 text-zinc-800 border-zinc-200/80 shadow-2xs",
        };
      case "professional":
      default:
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />,
          label: "Verified Portal",
          classes: "bg-blue-50/90 text-blue-800 border-blue-200/80 shadow-2xs",
        };
    }
  }, [personality]);

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-5 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6 max-w-[100vw] overflow-x-hidden">
      {/* Hidden file input for real Cloudinary / file uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf"
      />

      {/* Runner Top Bar: Form Header with Logo, Title, and Overview & Rules button */}
      <div className="bg-white/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 space-y-4 sm:space-y-6 overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {meta.logoUrl ? (
              <img
                src={meta.logoUrl}
                alt="Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border border-slate-200 object-contain p-1 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center font-black text-xs sm:text-sm tracking-wider shadow-2xs shrink-0">
                {(meta.title || "Form")
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase())
                  .join("") || "NF"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">
                {meta.title || "NextForm"}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate">
                {meta.description?.slice(0, 60) || `${experience.form.category.replace(/_/g, " ").toUpperCase()} Experience`}
              </p>
              {/* Badges row — visible on larger screens */}
              <div className="hidden sm:flex items-center gap-1.5 mt-2 flex-wrap">
                {isSandbox && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md">
                    Sandbox
                  </span>
                )}
                {personalityBadge && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase border ${personalityBadge.classes}`}>
                    {personalityBadge.icon}
                    <span>{personalityBadge.label}</span>
                  </span>
                )}
                {experience.aiMetadata && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-200/80 rounded-md text-[10px] font-mono font-bold text-indigo-700">
                    <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    <span>{experience.aiMetadata.model}</span>
                    <span className="text-indigo-300">•</span>
                    <span className="text-emerald-700">{experience.aiMetadata.latencyMs} ms</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOverviewOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 hover:text-slate-900 transition-all active:scale-[0.97] shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">{experience.overview?.rulesLabel || "Overview"}</span>
          </button>
        </div>

        {/* Adaptive Mobile Stepper */}
        {steps.length > 1 && (
          <div className="pt-4 border-t border-slate-100 sm:hidden space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-blue-600">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="text-slate-600 font-bold truncate max-w-[170px]">
                {getStepDisplayInfo(steps[currentStepIndex], currentStepIndex).shortTitle}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round(((currentStepIndex + 1) / steps.length) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Stepper with Circles Navigation (Desktop / Tablet) */}
        {steps.length > 1 && (
          <div className="pt-5 border-t border-slate-100 hidden sm:block">
            <div className="relative flex items-start justify-between w-full">
              {/* Connecting line behind circles */}
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0" />

              {steps.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isCompleted = idx < currentStepIndex;
                const { shortTitle, subtitle } = getStepDisplayInfo(step, idx);

                return (
                  <div
                    key={step.id}
                    onClick={() => {
                      if (idx <= currentStepIndex) {
                        setCurrentStepIndex(idx);
                        setActiveCardIndex(0);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className={`relative z-10 flex flex-col items-center text-center flex-1 transition-all ${
                      idx <= currentStepIndex ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                    }`}
                  >
                    {/* Circle Indicator with nested sub-step indicator if multi-card step */}
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                          isCompleted
                            ? "bg-emerald-600 text-white shadow-sm"
                            : isActive
                            ? "bg-sky-500 text-white shadow-md shadow-sky-500/30 ring-4 ring-sky-100"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Sub-steps count badge when step contains multiple cards */}
                      {(step.cards?.length || 0) > 1 && (
                        <span
                          className={`absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4 text-[9px] font-black rounded-full text-center border shadow-xs leading-none flex items-center justify-center ${
                            isActive
                              ? "bg-amber-400 text-slate-900 border-white"
                              : isCompleted
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-slate-200 text-slate-600 border-white"
                          }`}
                          title={`Step contains ${step.cards?.length} cards (Step inside step)`}
                        >
                          {isActive
                            ? `${activeCardIndex + 1}/${visibleCards.length}`
                            : `${step.cards.length}p`}
                        </span>
                      )}
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="mt-2.5 space-y-0.5 px-1">
                      <span
                        className={`block text-xs font-bold leading-tight ${
                          isActive
                            ? "text-sky-600"
                            : isCompleted
                            ? "text-slate-800"
                            : "text-slate-400"
                        }`}
                      >
                        {shortTitle}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium leading-tight">
                        {subtitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active Step Cards Container */}
      {currentStep && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {visibleCards.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500">
              <p className="text-sm">No visible questions in this step based on your current answers.</p>
              <button
                onClick={handleNext}
                className="mt-4 px-4 py-2 bg-sky-500 text-white text-xs font-bold rounded-xl"
              >
                Proceed to Next Step
              </button>
            </div>
          ) : (
            <>
              {/* Step Banner & "Step Inside Step" Nested Navigation (rendered when step has multiple cards) */}
              {isMultiCardStep && (
                <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-sky-50/90 text-sky-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-sky-100 shadow-2xs">
                        {isTeammatesCardStep ? (
                          <>
                            <Users className="w-3.5 h-3.5" />
                            <span>Team Members ({visibleCards.length} Members)</span>
                          </>
                        ) : (
                          <>
                            <Layers className="w-3.5 h-3.5" />
                            <span>Step Inside Step ({visibleCards.length} Sections)</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      Section {activeCardIndex + 1} of {visibleCards.length}: <span className="font-bold text-slate-800">{visibleCards[activeCardIndex]?.title || `Part ${activeCardIndex + 1}`}</span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Step {currentStepIndex + 1}: {getStepDisplayInfo(currentStep, currentStepIndex).shortTitle}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isTeammatesCardStep
                        ? "Enter details for each member. Member 1 is the Team Leader recorded earlier."
                        : currentStep.description || "Complete each section in this step below."}
                    </p>
                  </div>

                  {/* Nested Card Navigation Tabs / Sub-Stepper */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                    {visibleCards.map((card, cIdx) => {
                      const isCardActive = cIdx === activeCardIndex;
                      const isCardIncomplete = (card.fields || []).some(
                        (f) => f.required && !answers[f.id]
                      );
                      const isCardComplete = !isCardIncomplete && (card.fields || []).some((f) => answers[f.id]);
                      const cardTitleMatch = card.title?.match(/member\s*(\d+)/i);
                      const badgeLabel = isTeammatesCardStep
                        ? cardTitleMatch ? cardTitleMatch[1] : String(cIdx + 2)
                        : String(cIdx + 1);

                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => {
                            setActiveCardIndex(cIdx);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border active:scale-[0.98] active:translate-y-0.5 ${
                            isCardActive
                              ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                              : "bg-slate-50/90 hover:bg-slate-100 text-slate-700 border-slate-200/80 shadow-2xs"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                              isCardActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {badgeLabel}
                          </span>
                          <span>{card.title || (isTeammatesCardStep ? `Member ${badgeLabel}` : `Part ${badgeLabel}`)}</span>
                          {isCardComplete ? (
                            <Check className={`w-3 h-3 ${isCardActive ? "text-white" : "text-emerald-600"}`} />
                          ) : isCardIncomplete ? (
                            <span className={`w-1.5 h-1.5 rounded-full ${isCardActive ? "bg-white" : "bg-rose-400"}`} />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Render Cards (nested single-card view for multi-card steps, full list if single card) */}
              {(isMultiCardStep
                ? [visibleCards[activeCardIndex] || visibleCards[0]]
                : visibleCards
              ).map((card) => {
                const cardTitleMatch = card.title?.match(/member\s*(\d+)/i);
                const subBadge = isTeammatesCardStep
                  ? cardTitleMatch ? `M${cardTitleMatch[1]}` : `M${activeCardIndex + 2}`
                  : `${activeCardIndex + 1}.${visibleCards.indexOf(card) + 1}`;

                return (
                <div
                  key={card.id}
                  className="bg-white/85 backdrop-blur-xl rounded-3xl p-4 sm:p-7 md:p-8 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 space-y-6"
                >
                  {/* Card Title & Description */}
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      {isMultiCardStep && (
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-xs shrink-0">
                          {subBadge}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {card.title || (isTeammatesCardStep ? `Member ${subBadge} Details` : currentStep.title)}
                        </h3>
                        {card.description ? (
                          <p className="text-xs text-slate-500 mt-0.5">{card.description}</p>
                        ) : isTeammatesCardStep ? (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Teammate profile &bull; Enter required information
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                {/* Card Fields Rendered with Canonical Component Registry */}
                <div className="space-y-6">
                  {card.fields.map((field) => {
                    const val = getValue(field.id, "");
                    const err = errors[field.id];
                    const expQ = questionMap[field.id] || questionMap[field.entryCode || ""];

                    return (
                      <CanonicalFieldRenderer
                        key={field.id}
                        field={field}
                        experienceQuestion={expQ}
                        value={val}
                        onChange={(newVal) => setValue(field.id, newVal)}
                        error={err}
                        onTriggerUpload={handleTriggerUpload}
                        isUploading={uploadingFieldId === field.id}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
            </>
          )}

          {/* UPI Payment Gateway Card if on final step */}
          {currentStepIndex === steps.length - 1 && payment?.enabled && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-purple-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      Payment Verification Required
                    </h4>
                    <p className="text-xs text-slate-500">Scan QR Code or pay via UPI App</p>
                  </div>
                </div>
                <span className="text-base sm:text-lg font-extrabold text-purple-700">
                  ₹{amount}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <img
                    src={upiQrUrl}
                    alt="UPI QR Code"
                    className="w-40 h-40 mx-auto rounded-xl bg-white p-2 border border-slate-200 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-2">GPay / PhonePe / Paytm / BHIM</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                      Payee UPI ID
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="font-mono text-xs sm:text-sm font-bold text-purple-950">
                        {upiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(upiId);
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="p-1 text-purple-700 hover:text-purple-900"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      Bank Transaction / UTR Ref Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={answers["entry.utr"] || answers["utr"] || ""}
                      onChange={(e) => {
                        setValue("entry.utr", e.target.value);
                        setValue("utr", e.target.value);
                      }}
                      placeholder="e.g. 402918274619"
                      className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 min-h-[44px]"
                    />
                    {errors["payment_utr"] && (
                      <p className="text-xs text-rose-600 font-semibold">{errors["payment_utr"]}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Footer Actions (Mobile Responsive) */}
          <div className="sticky bottom-3 z-30 bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl p-3 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)] ring-1 ring-slate-900/5 flex items-center justify-between gap-2 sm:gap-4">
            <div>
              {currentStepIndex > 0 || (isMultiCardStep && activeCardIndex > 0) ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-slate-700 bg-white/90 hover:bg-slate-50 transition-all min-h-[44px] shadow-[0_1.5px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] active:translate-y-0.5 active:scale-[0.98]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>
                    {isMultiCardStep && activeCardIndex > 0
                      ? isTeammatesCardStep ? `Previous Member` : `Previous Section`
                      : "Previous Step"}
                  </span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-400 font-medium pl-1">
                  Step 1 of {steps.length}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-slate-700 bg-white/90 hover:bg-slate-50 transition-all min-h-[44px] shadow-[0_1.5px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] active:translate-y-0.5 active:scale-[0.98]"
                title="Review all filled answers"
              >
                <Eye className="w-4 h-4 text-sky-500" />
                <span className="hidden sm:inline">Review</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-[0_3px_12px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all min-h-[44px] active:translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting to Google...</span>
                  </>
                ) : currentStepIndex === steps.length - 1 && (!isMultiCardStep || activeCardIndex === visibleCards.length - 1) ? (
                  <>
                    <span>Submit Form</span>
                    <Check className="w-4 h-4" />
                  </>
                ) : isMultiCardStep && activeCardIndex < visibleCards.length - 1 ? (
                  <>
                    <span>{isTeammatesCardStep ? "Next Member" : "Next Section"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Answers Modal Drawer */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-500" />
                <h4 className="text-sm font-bold text-slate-900">Review Your Answers</h4>
              </div>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {steps.map((step, sIdx) => {
                const stepVisibleCards = (step.cards || []).filter((c) => isCardVisible(c, step));
                if (stepVisibleCards.length === 0) return null;

                return (
                  <div key={step.id} className="space-y-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 pb-1">
                      <span className="flex items-center gap-1.5 text-sky-600 font-extrabold uppercase tracking-wider text-[11px]">
                        Step {sIdx + 1}: {step.title}
                      </span>
                      <button
                        onClick={() => {
                          setCurrentStepIndex(sIdx);
                          setIsReviewOpen(false);
                        }}
                        className="text-sky-500 hover:text-sky-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="space-y-4 pl-1">
                      {stepVisibleCards.map((c) => (
                        <div key={c.id} className="space-y-2">
                          {c.title && (stepVisibleCards.length > 1 || step.cards.length > 1) && (
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              {c.title}
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {c.fields.map((f) => {
                              const answerVal = answers[f.id];
                              return (
                                <div key={f.id} className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                  <span className="text-slate-500 font-medium block text-[11px]">{f.label}:</span>
                                  <span className="text-slate-900 font-semibold break-words">
                                    {answerVal === undefined || answerVal === ""
                                      ? "—"
                                      : Array.isArray(answerVal)
                                      ? answerVal.join(", ")
                                      : String(answerVal)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsReviewOpen(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
              >
                Looks Good &bull; Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview and Rules Drawer */}
      <OverviewDrawer
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        config={config}
      />
    </div>
  );
};
