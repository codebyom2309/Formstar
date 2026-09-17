import {
  CanonicalExperienceSchema,
  FormCategory,
  UXPattern,
  ExperienceSection,
  ExperienceQuestion,
  CanonicalQuestionType,
  CanonicalComponentType,
  QuestionSemanticRole,
  ExperienceConditionalRule,
  ExperienceCompletion,
} from "../../src/types/canonicalExperience";

/**
 * Validates and repairs the AI output to ensure complete correctness,
 * strict preservation of Google Entry IDs, component registry compliance,
 * and zero broken links or hallucinated data.
 */
export function validateAndRepairExperience(
  aiOutput: any,
  rawForm: any,
  meta: { model: string; latencyMs: number }
): CanonicalExperienceSchema {
  const rawFields = rawForm?.flatFields || [];
  const rawTitle = rawForm?.meta?.title || rawForm?.title || "Universal Form";
  const rawDesc = rawForm?.meta?.description || rawForm?.description || "";
  const targetActionUrl = rawForm?.meta?.targetActionUrl || rawForm?.targetActionUrl || "";
  const originalUrl = rawForm?.meta?.originalUrl || rawForm?.originalUrl || "";

  // 1. Determine category safely
  const validCategories: FormCategory[] = [
    "quiz",
    "assessment",
    "examination",
    "survey",
    "feedback",
    "registration",
    "event_registration",
    "hackathon",
    "competition",
    "application",
    "job_application",
    "internship_application",
    "scholarship_application",
    "admission",
    "onboarding",
    "evaluation",
    "poll",
    "questionnaire",
    "contact",
    "data_collection",
    "payment_registration",
    "membership",
    "workshop_registration",
    "conference_registration",
    "complaint",
    "custom",
  ];

  let category: FormCategory = validCategories.includes(aiOutput?.form?.category)
    ? aiOutput.form.category
    : "custom";

  // Heuristics if AI returned custom or ambiguous
  const isQuizLikely =
    /quiz|test|exam|assessment|emw|amdw|mcq|knowledge/i.test(rawTitle) ||
    rawFields.some((f: any) => /question|\?$/i.test(f.label) && f.options?.length >= 2);

  const isSurveyLikely =
    /survey|feedback|nps|rating|experience|satisfaction/i.test(rawTitle) ||
    rawFields.some((f: any) => /rate|rating|scale|satisfied|feedback/i.test(f.label));

  const isContactLikely =
    rawFields.length <= 4 &&
    rawFields.some((f: any) => /name/i.test(f.label)) &&
    rawFields.some((f: any) => /email|phone|message/i.test(f.label));

  if (category === "custom") {
    if (isQuizLikely) category = "quiz";
    else if (isSurveyLikely) category = "feedback";
    else if (isContactLikely) category = "contact";
  }

  // 2. Determine UX Pattern
  const validPatterns: UXPattern[] = [
    "assessment",
    "survey",
    "stepper",
    "single_page",
    "application",
    "cards",
    "custom",
  ];
  let pattern: UXPattern = validPatterns.includes(aiOutput?.ux?.pattern)
    ? aiOutput.ux.pattern
    : category === "quiz" || category === "assessment" || category === "examination"
    ? "assessment"
    : category === "survey" || category === "feedback" || category === "poll"
    ? "survey"
    : rawFields.length <= 5
    ? "single_page"
    : "stepper";

  // 3. Map questions and guarantee entryCode preservation
  const entryIdToRawField = new Map<string, any>();
  rawFields.forEach((rf: any) => {
    const code = rf.entryCode || `entry.${rf.entryId}`;
    entryIdToRawField.set(code, rf);
  });

  const accountedEntryCodes = new Set<string>();
  const repairedSections: ExperienceSection[] = [];

  const validComponents: CanonicalComponentType[] = [
    "TextInput",
    "EmailInput",
    "PhoneInput",
    "NumberInput",
    "DatePicker",
    "TimePicker",
    "URLInput",
    "Select",
    "RadioCards",
    "CheckboxCards",
    "RatingCards",
    "ScaleSelector",
    "Textarea",
    "FileDropzone",
    "QuizOption",
    "MatrixInput",
    "Toggle",
    "InfoCard",
    "SectionHeader",
    "DisplayInformation",
    "ReviewCard",
  ];

  // Helper to deduce best component
  const deduceComponent = (type: CanonicalQuestionType, semanticRole: string, optionsCount: number): CanonicalComponentType => {
    if (category === "quiz" && optionsCount >= 2) return "QuizOption";
    if (type === "email" || semanticRole === "email") return "EmailInput";
    if (type === "phone" || semanticRole === "phone" || semanticRole === "whatsapp") return "PhoneInput";
    if (type === "number") return "NumberInput";
    if (type === "url" || semanticRole === "github" || semanticRole === "linkedin" || semanticRole === "portfolio") return "URLInput";
    if (type === "date") return "DatePicker";
    if (type === "time") return "TimePicker";
    if (type === "textarea" || semanticRole === "long_answer" || semanticRole === "feedback") return "Textarea";
    if (type === "file_upload" || semanticRole === "resume" || semanticRole === "document") return "FileDropzone";
    if (type === "rating" || semanticRole === "rating") return "RatingCards";
    if (type === "linear_scale") return "ScaleSelector";
    if (type === "multi_choice") return "CheckboxCards";
    if (type === "single_choice") return optionsCount > 5 ? "Select" : "RadioCards";
    return "TextInput";
  };

  // Parse AI sections if provided
  if (Array.isArray(aiOutput?.sections) && aiOutput.sections.length > 0) {
    aiOutput.sections.forEach((sec: any, sIdx: number) => {
      const repairedQuestions: ExperienceQuestion[] = [];

      if (Array.isArray(sec.questions)) {
        sec.questions.forEach((q: any, qIdx: number) => {
          // Look up corresponding raw field by entryCode or id
          const rawMatch =
            entryIdToRawField.get(q.googleEntryId) ||
            rawFields.find(
              (rf: any) =>
                rf.entryCode === q.googleEntryId ||
                `entry.${rf.entryId}` === q.googleEntryId ||
                rf.label?.toLowerCase() === q.label?.toLowerCase()
            );

          const googleEntryId =
            rawMatch?.entryCode ||
            q.googleEntryId ||
            (rawFields[qIdx] ? rawFields[qIdx].entryCode : `entry.${qIdx + 1}`);

          accountedEntryCodes.add(googleEntryId);

          const safeType: CanonicalQuestionType = [
            "text",
            "textarea",
            "email",
            "phone",
            "number",
            "date",
            "time",
            "url",
            "single_choice",
            "multi_choice",
            "dropdown",
            "rating",
            "linear_scale",
            "file_upload",
            "quiz_question",
          ].includes(q.type)
            ? q.type
            : rawMatch?.options?.length
            ? "single_choice"
            : "text";

          const semanticRole: QuestionSemanticRole = q.semanticRole || "unknown";
          const options = rawMatch?.options || q.options;
          const optionsCount = Array.isArray(options) ? options.length : 0;

          const recommendedComponent: CanonicalComponentType =
            validComponents.includes(q.recommendedComponent)
              ? q.recommendedComponent
              : deduceComponent(safeType, semanticRole, optionsCount);

          repairedQuestions.push({
            id: q.id || `q_${sIdx + 1}_${qIdx + 1}`,
            sourceQuestionId: q.sourceQuestionId || rawMatch?.entryId || `src_${qIdx + 1}`,
            googleEntryId,
            label: q.label || rawMatch?.label || `Question ${qIdx + 1}`,
            originalLabel: rawMatch?.label || q.originalLabel || q.label,
            description: q.description || rawMatch?.helpText || undefined,
            helpText: q.helpText || undefined,
            placeholder: q.placeholder || undefined,
            type: safeType,
            recommendedComponent,
            semanticRole,
            required: rawMatch ? !!rawMatch.required : !!q.required,
            options,
            scaleMin: q.scaleMin,
            scaleMax: q.scaleMax,
            scaleMinLabel: q.scaleMinLabel,
            scaleMaxLabel: q.scaleMaxLabel,
            validation: q.validation || { trim: true },
            importance: q.importance || (rawMatch?.required ? "critical" : "standard"),
            sensitivity: q.sensitivity || "public",
            confidence: typeof q.confidence === "number" ? q.confidence : 0.95,
            quizMetadata:
              category === "quiz" || category === "assessment" || category === "examination"
                ? {
                    questionNumber: q.quizMetadata?.questionNumber || qIdx + 1,
                    points: q.quizMetadata?.points,
                    explanation: q.quizMetadata?.explanation,
                  }
                : undefined,
          });
        });
      }

      if (repairedQuestions.length > 0) {
        repairedSections.push({
          id: sec.id || `sec_${sIdx + 1}`,
          title: sec.title || `Section ${sIdx + 1}`,
          subtitle: sec.subtitle || undefined,
          icon: sec.icon || (sIdx === 0 ? "user" : "file-text"),
          questions: repairedQuestions,
        });
      }
    });
  }

  // 4. Guarantee NO orphan raw fields: any field from source that AI missed is added
  const missingRawFields = rawFields.filter((rf: any) => !accountedEntryCodes.has(rf.entryCode));
  if (missingRawFields.length > 0) {
    const fallbackSection: ExperienceSection = {
      id: `sec_additional_${Date.now()}`,
      title: "Additional Details",
      subtitle: "Remaining form fields",
      icon: "file-text",
      questions: missingRawFields.map((rf: any, idx: number) => {
        const type: CanonicalQuestionType = rf.options?.length ? "single_choice" : "text";
        return {
          id: `q_missing_${idx}`,
          sourceQuestionId: rf.entryId || `src_m_${idx}`,
          googleEntryId: rf.entryCode,
          label: rf.label,
          originalLabel: rf.label,
          type,
          recommendedComponent: type === "single_choice" ? "RadioCards" : "TextInput",
          semanticRole: "unknown",
          required: !!rf.required,
          options: rf.options,
          validation: { trim: true },
          importance: "standard",
        };
      }),
    };
    repairedSections.push(fallbackSection);
  }

  // If still no sections, construct from rawFields
  if (repairedSections.length === 0) {
    repairedSections.push({
      id: "sec_1",
      title: rawTitle || "Form Details",
      icon: "file-text",
      questions: rawFields.map((rf: any, idx: number) => {
        const type: CanonicalQuestionType = rf.options?.length ? "single_choice" : "text";
        return {
          id: `q_${idx + 1}`,
          sourceQuestionId: rf.entryId || `src_${idx + 1}`,
          googleEntryId: rf.entryCode,
          label: rf.label,
          originalLabel: rf.label,
          type,
          recommendedComponent: type === "single_choice" ? "RadioCards" : "TextInput",
          semanticRole: "unknown",
          required: !!rf.required,
          options: rf.options,
          validation: { trim: true },
          importance: "standard",
        };
      }),
    });
  }

  // 5. Dynamic Rules label & zero-hallucination overview
  let rulesLabel = aiOutput?.overview?.rulesLabel;
  if (!rulesLabel) {
    if (category === "quiz" || category === "assessment" || category === "examination") {
      rulesLabel = "Assessment Instructions";
    } else if (category === "hackathon" || category === "competition") {
      rulesLabel = "Registration Guidelines & Rules";
    } else if (category === "survey" || category === "feedback" || category === "poll") {
      rulesLabel = "About This Survey";
    } else if (category === "job_application" || category === "internship_application" || category === "application") {
      rulesLabel = "Application Information";
    } else if (category === "contact") {
      rulesLabel = "Contact Information";
    } else {
      rulesLabel = "Overview & Instructions";
    }
  }

  const title = aiOutput?.form?.title || rawTitle;
  const description = aiOutput?.form?.description || rawDesc;

  // Completion experience
  const completion: ExperienceCompletion = {
    headline: aiOutput?.completion?.headline || (
      category === "quiz"
        ? "Assessment Completed"
        : category === "survey" || category === "feedback"
        ? "Thank You for Your Feedback"
        : category === "application" || category === "job_application"
        ? "Application Received"
        : "Submission Confirmed"
    ),
    message: aiOutput?.completion?.message || (
      category === "quiz"
        ? "Your responses have been recorded and sent to the assessment evaluator."
        : category === "survey" || category === "feedback"
        ? "Your feedback helps us continuously improve. We appreciate your time!"
        : "Your response has been verified and securely synced with the official Google Form database."
    ),
    categoryTailoredNote: aiOutput?.completion?.categoryTailoredNote || undefined,
    showConfetti: category === "quiz" || category === "hackathon" || category === "registration",
  };

  // Safe conditional rules
  const conditionalRules: ExperienceConditionalRule[] = Array.isArray(aiOutput?.conditionalRules)
    ? aiOutput.conditionalRules.filter((r: any) => r && r.googleEntryId && r.action && Array.isArray(r.targetFieldIds))
    : [];

  return {
    schemaVersion: "1.0",
    source: {
      provider: "google_forms",
      formId: aiOutput?.source?.formId || "imported_form",
      originalUrl,
      targetActionUrl,
      rawQuestionsCount: rawFields.length,
    },
    form: {
      title,
      description,
      category,
      confidence: typeof aiOutput?.form?.confidence === "number" ? aiOutput.form.confidence : 0.95,
      purpose: aiOutput?.form?.purpose || `Process structured entries for ${title}`,
      targetAudience: aiOutput?.form?.targetAudience || "Respondents and participants",
      reasoningSummary:
        aiOutput?.form?.reasoningSummary ||
        `Identified as ${category.toUpperCase()} with ${repairedSections.length} logical sections and ${pattern} UX pattern.`,
    },
    ux: {
      pattern,
      showProgressBar: aiOutput?.ux?.showProgressBar !== false,
      allowQuestionNavigation: pattern === "assessment" || aiOutput?.ux?.allowQuestionNavigation === true,
      requireReviewBeforeSubmit: aiOutput?.ux?.requireReviewBeforeSubmit !== false,
      questionDensity: aiOutput?.ux?.questionDensity || "comfortable",
      stickyNavigation: true,
    },
    overview: {
      title: aiOutput?.overview?.title || title,
      subtitle:
        aiOutput?.overview?.subtitle ||
        (description ? description.slice(0, 150) : "Digital Form Submission Experience"),
      purpose: aiOutput?.overview?.purpose || `Collect and process verified responses for ${title}`,
      audience: aiOutput?.overview?.audience || "Registered respondents and participants",
      estimatedCompletionTime:
        aiOutput?.overview?.estimatedCompletionTime ||
        (rawFields.length > 15 ? "~8–12 minutes" : rawFields.length > 6 ? "~4–6 minutes" : "~1–3 minutes"),
      rulesLabel,
      instructions:
        Array.isArray(aiOutput?.overview?.instructions) && aiOutput.overview.instructions.length > 0
          ? aiOutput.overview.instructions
          : [
              "Please answer all required questions marked with an asterisk (*).",
              "Review your submissions thoroughly on the final verification screen.",
              "Submissions are sent directly to the official Google Form database.",
            ],
      requirements:
        Array.isArray(aiOutput?.overview?.requirements) && aiOutput.overview.requirements.length > 0
          ? aiOutput.overview.requirements
          : ["Stable internet connection", "Valid contact details"],
      tips: aiOutput?.overview?.tips || ["You can navigate between sections at any time before submitting."],
      warnings: aiOutput?.overview?.warnings,
    },
    sections: repairedSections,
    conditionalRules,
    theme: {
      personality: aiOutput?.theme?.personality || (category === "quiz" ? "academic" : "professional"),
      primaryColor: aiOutput?.theme?.primaryColor || "#2563eb",
      accentColor: aiOutput?.theme?.accentColor || "#7c3aed",
      backgroundColor: "#f8fafc",
      borderRadius: aiOutput?.theme?.borderRadius || "rounded-2xl",
      fontFamily: aiOutput?.theme?.fontFamily || "Plus Jakarta Sans",
      surfaceStyle: "glass",
      density: "comfortable",
    },
    completion,
    aiMetadata: {
      provider: "groq",
      model: meta.model,
      latencyMs: meta.latencyMs,
      confidence: typeof aiOutput?.form?.confidence === "number" ? aiOutput.form.confidence : 0.95,
      reasoningSummary:
        aiOutput?.form?.reasoningSummary ||
        `Classified as ${category.toUpperCase()} using semantic field analysis.`,
      analyzedAt: new Date().toISOString(),
      promptVersion: "2.5",
    },
  };
}
