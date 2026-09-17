import { create } from "zustand";
import { FormRecord, FormStatus, DashboardMetrics, FormConfig, ParsedFormResult, FormSubmissionRecord } from "../types";
import { CanonicalExperienceSchema } from "../types/canonicalExperience";
import { convertExperienceToConfig } from "../lib/experienceAdapter";

interface CreateFormResponse {
  success: boolean;
  formId?: string;
  error?: string;
  isUploadInterception?: boolean;
  offendingField?: string;
}

export type StudioTab = "builder" | "theme" | "overview" | "logic" | "integrations" | "settings" | "share";

interface DashboardState {
  activeView: "dashboard" | "studio" | "runner";
  activeRunnerSlug: string | null;
  forms: FormRecord[];
  isLoading: boolean;
  isParsing: boolean;
  parsedPreview: ParsedFormResult | null;
  searchQuery: string;
  statusFilter: "all" | "active" | "paused";
  isCreateModalOpen: boolean;
  isSqlModalOpen: boolean;
  isInspectorModalOpen: boolean;
  selectedFormForStudio: FormRecord | null;
  currentStudioForm: FormRecord | null;
  activeStudioTab: StudioTab;
  previewViewport: "desktop" | "tablet" | "mobile";
  isSaving: boolean;
  isDirty: boolean;
  activeStepIndex: number;
  metrics: DashboardMetrics;

  // AI Form Intelligence Engine State
  aiAnalysis: CanonicalExperienceSchema | null;
  isAnalyzingWithAi: boolean;
  aiModelUsed: string | null;
  aiLatencyMs: number | null;
  inspectingAiExperience: CanonicalExperienceSchema | null;

  // Submissions state
  submissions: FormSubmissionRecord[];
  isLoadingSubmissions: boolean;

  setActiveView: (view: "dashboard" | "studio" | "runner") => void;
  openRunner: (slug: string) => void;
  openStudio: (form: FormRecord, initialTab?: StudioTab) => void;
  exitStudio: () => void;
  setActiveStudioTab: (tab: StudioTab) => void;
  setPreviewViewport: (vp: "desktop" | "tablet" | "mobile") => void;
  setActiveStepIndex: (index: number) => void;
  updateCurrentStudioForm: (updater: (draft: FormRecord) => FormRecord) => void;
  saveCurrentStudioForm: () => Promise<boolean>;

  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: "all" | "active" | "paused") => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsSqlModalOpen: (open: boolean) => void;
  setIsInspectorModalOpen: (open: boolean) => void;
  setSelectedFormForStudio: (form: FormRecord | null) => void;
  setParsedPreview: (preview: ParsedFormResult | null) => void;
  setAiAnalysis: (analysis: CanonicalExperienceSchema | null) => void;
  setInspectingAiExperience: (exp: CanonicalExperienceSchema | null) => void;
  analyzeFormWithAi: (rawResult?: ParsedFormResult) => Promise<CanonicalExperienceSchema | null>;

  fetchForms: () => Promise<void>;
  parseFormUrl: (url: string) => Promise<ParsedFormResult>;
  createForm: (
    title: string,
    googleUrl: string,
    customConfig?: FormConfig,
    aiExperience?: CanonicalExperienceSchema
  ) => Promise<CreateFormResponse>;
  toggleStatus: (formId: string) => Promise<void>;
  deleteForm: (formId: string) => Promise<void>;

  // Submissions actions
  fetchSubmissions: (formId: string) => Promise<void>;
  updateSubmissionStatus: (submissionId: string, status: "verified" | "pending" | "flagged") => Promise<void>;
  deleteSubmission: (submissionId: string) => Promise<void>;
  exportSubmissionsCsv: (formId: string) => void;
}

function calculateMetrics(forms: FormRecord[]): DashboardMetrics {
  const totalForms = forms.length;
  const activeForms = forms.filter((f) => f.status === "active").length;
  const totalSubmissions = forms.reduce((acc, f) => acc + (f.submissionsCount || 0), 0);
  const totalViews = forms.reduce((acc, f) => acc + (f.viewsCount || 0), 0);
  return { totalForms, activeForms, totalSubmissions, totalViews };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  activeView: "dashboard",
  activeRunnerSlug: null,
  forms: [],
  isLoading: true,
  isParsing: false,
  parsedPreview: null,
  searchQuery: "",
  statusFilter: "all",
  isCreateModalOpen: false,
  isSqlModalOpen: false,
  isInspectorModalOpen: false,
  selectedFormForStudio: null,
  currentStudioForm: null,
  activeStudioTab: "builder",
  previewViewport: "desktop",
  isSaving: false,
  isDirty: false,
  activeStepIndex: 0,
  metrics: {
    totalForms: 0,
    activeForms: 0,
    totalSubmissions: 0,
    totalViews: 0,
  },
  aiAnalysis: null,
  isAnalyzingWithAi: false,
  aiModelUsed: null,
  aiLatencyMs: null,
  inspectingAiExperience: null,
  submissions: [],
  isLoadingSubmissions: false,

  setActiveView: (activeView) => set({ activeView }),
  openRunner: (slug) => set({ activeView: "runner", activeRunnerSlug: slug }),
  openStudio: (form, initialTab = "builder") =>
    set({
      activeView: "studio",
      currentStudioForm: JSON.parse(JSON.stringify(form)),
      isDirty: false,
      activeStudioTab: initialTab,
      activeStepIndex: 0,
    }),
  exitStudio: () => set({ activeView: "dashboard", currentStudioForm: null, isDirty: false }),
  setActiveStudioTab: (activeStudioTab) => set({ activeStudioTab }),
  setPreviewViewport: (previewViewport) => set({ previewViewport }),
  setActiveStepIndex: (activeStepIndex) => set({ activeStepIndex }),

  updateCurrentStudioForm: (updater) => {
    const current = get().currentStudioForm;
    if (!current) return;
    const cloned = JSON.parse(JSON.stringify(current));
    const nextForm = updater(cloned);
    set({ currentStudioForm: nextForm, isDirty: true });
  },

  saveCurrentStudioForm: async () => {
    const current = get().currentStudioForm;
    if (!current) return false;

    set({ isSaving: true });
    try {
      const res = await fetch(`/api/forms/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: current.title,
          hostedSlug: current.hostedSlug,
          status: current.status,
          jsonConfig: current.jsonConfig,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save to database");
      }

      const data = await res.json();
      const updatedForm = data.form || current;

      const updatedForms = get().forms.map((f) => (f.id === updatedForm.id ? updatedForm : f));
      set({
        forms: updatedForms,
        currentStudioForm: updatedForm,
        isDirty: false,
        isSaving: false,
      });
      return true;
    } catch (e) {
      console.error("Failed to save form to TiDB:", e);
      set({ isSaving: false });
      return false;
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setIsCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
  setIsSqlModalOpen: (isSqlModalOpen) => set({ isSqlModalOpen }),
  setIsInspectorModalOpen: (isInspectorModalOpen) => set({ isInspectorModalOpen }),
  setSelectedFormForStudio: (selectedFormForStudio) => set({ selectedFormForStudio }),
  setParsedPreview: (parsedPreview) => set({ parsedPreview }),
  setAiAnalysis: (aiAnalysis) => set({ aiAnalysis }),
  setInspectingAiExperience: (inspectingAiExperience) => set({ inspectingAiExperience }),

  analyzeFormWithAi: async (rawResult?: ParsedFormResult) => {
    const target = rawResult || get().parsedPreview;
    if (!target) return null;

    set({ isAnalyzingWithAi: true });
    try {
      const res = await fetch("/api/ai/analyze-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawForm: target,
          sourceUrl: target.meta?.originalUrl,
          forceRefresh: true,
        }),
      });

      if (!res.ok) {
        throw new Error("AI analysis request failed");
      }

      const data = await res.json();
      if (data.success && data.experience) {
        set({
          aiAnalysis: data.experience,
          aiModelUsed: data.model || "openai/gpt-oss-20b",
          aiLatencyMs: data.latencyMs || 0,
          isAnalyzingWithAi: false,
        });
        return data.experience;
      }
    } catch (err) {
      console.warn("[useDashboardStore] AI Analysis failed:", err);
    }
    set({ isAnalyzingWithAi: false });
    return null;
  },

  fetchForms: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/forms");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.forms)) {
          set({
            forms: data.forms,
            metrics: calculateMetrics(data.forms),
            isLoading: false,
          });
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch forms from /api/forms:", e);
    }
    set({ isLoading: false });
  },

  parseFormUrl: async (url: string): Promise<ParsedFormResult> => {
    set({ isParsing: true });
    try {
      const res = await fetch("/api/parse-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      set({ isParsing: false });

      if (!res.ok || !data.success) {
        const errorResult: ParsedFormResult = {
          success: false,
          error: data.error || "Failed to scrape Google Form schema.",
          isUploadInterception: !!data.isUploadInterception,
          offendingField: data.offendingField,
          meta: { title: "", description: "", targetActionUrl: "", originalUrl: url },
          stats: { totalFields: 0, requiredFields: 0, totalSteps: 0, totalCards: 0 },
          flatFields: [],
          config: {
            meta: { title: "", description: "", targetActionUrl: "" },
            theme: { primaryColor: "#2563eb", backgroundColor: "#f8fafc", borderRadius: "rounded-xl", fontFamily: "Plus Jakarta Sans" },
            steps: [],
          },
        };
        set({ parsedPreview: null });
        return errorResult;
      }

      set({ parsedPreview: data });
      return data;
    } catch (err: any) {
      set({ isParsing: false, parsedPreview: null });
      return {
        success: false,
        error: err.message || "Network error connecting to /api/parse-form.",
        meta: { title: "", description: "", targetActionUrl: "", originalUrl: url },
        stats: { totalFields: 0, requiredFields: 0, totalSteps: 0, totalCards: 0 },
        flatFields: [],
        config: {
          meta: { title: "", description: "", targetActionUrl: "" },
          theme: { primaryColor: "#2563eb", backgroundColor: "#f8fafc", borderRadius: "rounded-xl", fontFamily: "Plus Jakarta Sans" },
          steps: [],
        },
      };
    }
  },

  createForm: async (
    title: string,
    googleUrl: string,
    customConfig?: FormConfig,
    aiExperience?: CanonicalExperienceSchema
  ) => {
    const cleanTitle = title.trim();
    const cleanUrl = googleUrl.trim();

    if (!cleanTitle) {
      return { success: false, error: "Form title is required." };
    }
    if (!cleanUrl || (!cleanUrl.includes("docs.google.com/forms") && !cleanUrl.includes("forms.gle"))) {
      return {
        success: false,
        error: "Please enter a valid Google Form URL (e.g. https://docs.google.com/forms/d/e/.../viewform).",
      };
    }

    let finalConfig = customConfig;
    const finalAiExperience = aiExperience || get().aiAnalysis;

    if (!finalConfig && finalAiExperience) {
      finalConfig = convertExperienceToConfig(finalAiExperience);
    }

    // If no customConfig was pre-parsed, execute Phase 2 parsing engine now
    if (!finalConfig) {
      const parseRes = await get().parseFormUrl(cleanUrl);
      if (!parseRes.success) {
        return {
          success: false,
          error: parseRes.error,
          isUploadInterception: parseRes.isUploadInterception,
          offendingField: parseRes.offendingField,
        };
      }
      finalConfig = parseRes.config;
      // Use custom title if provided
      if (finalConfig?.meta) {
        finalConfig.meta.title = cleanTitle;
      }
    }

    if (finalAiExperience && finalConfig) {
      finalConfig.aiExperience = finalAiExperience;
    }

    const cleanSlug =
      cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") + `-${Math.random().toString(36).substring(2, 6)}`;

    const newFormId = `form_${Date.now()}`;

    const newForm: FormRecord = {
      id: newFormId,
      userId: "user_google_98234",
      title: cleanTitle,
      originalGoogleUrl: cleanUrl,
      hostedSlug: cleanSlug,
      status: "active",
      jsonConfig: finalConfig,
      aiExperience: finalAiExperience || undefined,
      viewsCount: 0,
      submissionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, error: errorData.error || "Failed to save form to database." };
      }

      const resData = await res.json();
      const savedForm = resData.form || newForm;

      const updated = [savedForm, ...get().forms];
      set({
        forms: updated,
        metrics: calculateMetrics(updated),
        isCreateModalOpen: false,
        parsedPreview: null,
        aiAnalysis: null,
        isAnalyzingWithAi: false,
      });

      return { success: true, formId: savedForm.id };
    } catch (e: any) {
      console.error("Backend /api/forms post failed:", e);
      return { success: false, error: e.message || "Failed to connect to database API." };
    }
  },

  toggleStatus: async (formId: string) => {
    const prevForms = get().forms;
    const target = prevForms.find((f) => f.id === formId);
    if (!target) return;

    const nextStatus: FormStatus = target.status === "active" ? "paused" : "active";
    const updated = prevForms.map((f) =>
      f.id === formId ? { ...f, status: nextStatus, updatedAt: new Date().toISOString() } : f
    );

    set({
      forms: updated,
      metrics: calculateMetrics(updated),
    });

    try {
      const res = await fetch(`/api/forms/${formId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        console.warn("Toggle status failed on database");
      }
    } catch (e) {
      console.warn("Toggle API failed:", e);
    }
  },

  deleteForm: async (formId: string) => {
    const updated = get().forms.filter((f) => f.id !== formId);
    set({
      forms: updated,
      metrics: calculateMetrics(updated),
    });

    try {
      const res = await fetch(`/api/forms/${formId}`, { method: "DELETE" });
      if (!res.ok) {
        console.warn("Delete failed on database");
      }
    } catch (e) {
      console.warn("Delete API failed:", e);
    }
  },

  fetchSubmissions: async (formId: string) => {
    set({ isLoadingSubmissions: true });
    try {
      const res = await fetch(`/api/forms/${formId}/submissions`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.submissions)) {
          set({ submissions: data.submissions, isLoadingSubmissions: false });
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch submissions:", e);
    }
    set({ isLoadingSubmissions: false });
  },

  updateSubmissionStatus: async (submissionId: string, status: "verified" | "pending" | "flagged") => {
    const prev = get().submissions;
    const updated = prev.map((s) => (s.id === submissionId ? { ...s, status } : s));
    set({ submissions: updated });

    try {
      await fetch(`/api/submissions/${submissionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.warn("Failed to update status on server:", e);
    }
  },

  deleteSubmission: async (submissionId: string) => {
    const prev = get().submissions;
    const updated = prev.filter((s) => s.id !== submissionId);
    set({ submissions: updated });

    // Also decrement submissionsCount in current form
    const currentForm = get().currentStudioForm;
    if (currentForm) {
      const updatedForms = get().forms.map((f) =>
        f.id === currentForm.id ? { ...f, submissionsCount: Math.max(0, f.submissionsCount - 1) } : f
      );
      set({
        forms: updatedForms,
        currentStudioForm: {
          ...currentForm,
          submissionsCount: Math.max(0, currentForm.submissionsCount - 1),
        },
      });
    }

    try {
      await fetch(`/api/submissions/${submissionId}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Failed to delete submission on server:", e);
    }
  },

  exportSubmissionsCsv: (formId: string) => {
    window.location.href = `/api/forms/${formId}/submissions/export`;
  },
}));
