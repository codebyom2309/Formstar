import { FormConfig, FormStep, FormCard, FormField } from "../types";
import {
  CanonicalExperienceSchema,
  ExperienceSection,
  ExperienceQuestion,
  FormCategory,
  UXPattern,
  CanonicalQuestionType,
  QuestionSemanticRole,
  CanonicalComponentType,
  WebsiteContent,
  DynamicInfoSection,
  HeroMetric,
} from "../types/canonicalExperience";
import { extractRichDescriptionData } from "./descriptionExtractor";

/**
 * Resolves the canonical component type from question type, role, options, and category
 */
export function resolveRecommendedComponent(
  qType: CanonicalQuestionType,
  role: QuestionSemanticRole,
  options?: string[],
  category?: FormCategory
): CanonicalComponentType {
  if (role === "email" || qType === "email") return "EmailInput";
  if (role === "phone" || role === "whatsapp" || qType === "phone") return "PhoneInput";
  if (qType === "quiz_question" || (category === "quiz" && qType === "single_choice")) return "QuizOption";
  if (qType === "rating" || role === "rating") return "RatingCards";
  if (qType === "linear_scale") return "ScaleSelector";
  if (qType === "single_choice") {
    if (options && options.length > 6) return "Select";
    return "RadioCards";
  }
  if (qType === "multi_choice") return "CheckboxCards";
  if (qType === "textarea" || role === "feedback" || role === "long_answer") return "Textarea";
  if (qType === "dropdown") return "Select";
  if (qType === "date") return "DatePicker";
  if (qType === "time") return "TimePicker";
  if (qType === "url" || role === "github" || role === "linkedin" || role === "portfolio") return "URLInput";
  if (qType === "number" || role === "roll_number" || role === "team_size" || role === "graduation_year") return "NumberInput";
  if (qType === "file_upload" || role === "resume" || role === "document") return "FileDropzone";
  return "TextInput";
}

/**
 * Maps a legacy FormField type to CanonicalQuestionType
 */
function mapLegacyType(type: FormField["type"], label: string): CanonicalQuestionType {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("quiz") || lowerLabel.includes("question") || lowerLabel.includes("choose the correct")) {
    if (type === "radio") return "quiz_question";
  }
  if (type === "radio") return "single_choice";
  if (type === "checkbox") return "multi_choice";
  if (type === "paragraph") return "textarea";
  if (type === "upload") return "file_upload";
  if (type === "dropdown") return "dropdown";
  if (type === "date") return "date";

  if (/email/i.test(lowerLabel)) return "email";
  if (/phone|mobile|whatsapp|contact/i.test(lowerLabel)) return "phone";
  if (/rating|rate/i.test(lowerLabel)) return "rating";
  if (/scale/i.test(lowerLabel)) return "linear_scale";
  if (/url|link|github|linkedin|portfolio/i.test(lowerLabel)) return "url";
  if (/number|roll|year|semester|amount|fee|count|size/i.test(lowerLabel)) return "number";

  return "text";
}

/**
 * Infers semantic role from label
 */
function inferSemanticRole(label: string): QuestionSemanticRole {
  const l = label.toLowerCase();
  if (l.includes("roll")) return "roll_number";
  if (l.includes("student id") || l.includes("prn") || l.includes("enrollment")) return "student_id";
  if (l.includes("first name")) return "first_name";
  if (l.includes("last name")) return "last_name";
  if (l.includes("name") && !l.includes("team") && !l.includes("college")) return "full_name";
  if (l.includes("email")) return "email";
  if (l.includes("whatsapp")) return "whatsapp";
  if (l.includes("phone") || l.includes("contact") || l.includes("mobile")) return "phone";
  if (l.includes("college") || l.includes("institute")) return "college";
  if (l.includes("university")) return "university";
  if (l.includes("branch") || l.includes("department")) return "department";
  if (l.includes("year")) return "graduation_year";
  if (l.includes("team name")) return "team_name";
  if (l.includes("team size")) return "team_size";
  if (l.includes("member")) return "team_member";
  if (l.includes("github")) return "github";
  if (l.includes("linkedin")) return "linkedin";
  if (l.includes("portfolio")) return "portfolio";
  if (l.includes("resume") || l.includes("cv")) return "resume";
  if (l.includes("payment") || l.includes("utr") || l.includes("transaction")) return "payment";
  if (l.includes("agree") || l.includes("consent") || l.includes("conduct") || l.includes("rule")) return "terms_acceptance";
  if (l.includes("rating") || l.includes("rate")) return "rating";
  if (l.includes("feedback") || l.includes("suggestion") || l.includes("improve")) return "feedback";
  if (l.includes("which") || l.includes("what is") || l.includes("calculate") || l.includes("find") || l.includes("choose")) return "quiz_question";
  return "unknown";
}

/**
 * Converts any legacy FormConfig into a CanonicalExperienceSchema for universal rendering
 */
export function convertConfigToExperience(
  config: FormConfig,
  slug: string = "form"
): CanonicalExperienceSchema {
  const meta = config.meta || { title: "Untitled Form", description: "", targetActionUrl: "" };
  const title = meta.title || "Form";
  const desc = meta.description || "";
  const steps = config.steps || [];

  // Extract all questions
  const allFields: FormField[] = [];
  steps.forEach((s) => s.cards.forEach((c) => allFields.push(...c.fields)));

  const titleLower = title.toLowerCase();
  const descLower = desc.toLowerCase();

  // Determine category
  let category: FormCategory = "custom";
  let uxPattern: UXPattern = "stepper";
  let confidence = 0.85;

  const hasQuizQuestions = allFields.some(
    (f) =>
      /question|quiz|emw|amdw|maxwell|calculate|find the|mcq/i.test(f.label) ||
      (f.options && f.options.length >= 2 && /question|\?$/i.test(f.label))
  );

  const isHackathon =
    /hackathon|hackx|hack|codefest/i.test(titleLower) ||
    /hackathon/i.test(descLower) ||
    allFields.some((f) => /team|leader|utr/i.test(f.label.toLowerCase()));

  const isSurvey =
    /survey|feedback|rating|poll/i.test(titleLower) ||
    allFields.some((f) => /satisfied|experience|rating|feedback/i.test(f.label.toLowerCase()));

  if (hasQuizQuestions && !isHackathon) {
    category = "quiz";
    uxPattern = "assessment";
    confidence = 0.94;
  } else if (isHackathon) {
    category = "hackathon";
    uxPattern = "stepper";
    confidence = 0.96;
  } else if (isSurvey) {
    category = "survey";
    uxPattern = "survey";
    confidence = 0.91;
  } else if (allFields.length <= 5) {
    category = "contact";
    uxPattern = "single_page";
    confidence = 0.88;
  }

  // Build sections and questions
  const sections: ExperienceSection[] = [];
  let questionCounter = 1;

  steps.forEach((step, sIdx) => {
    const sectionQuestions: ExperienceQuestion[] = [];

    step.cards.forEach((card) => {
      card.fields.forEach((field) => {
        const qType = mapLegacyType(field.type, field.label);
        const role = inferSemanticRole(field.label);

        const expQ: ExperienceQuestion = {
          id: field.id || `q_${questionCounter}`,
          sourceQuestionId: field.id,
          googleEntryId: field.entryCode || `entry.${field.id.replace(/\D/g, "")}`,
          label: field.label,
          description: field.helpText,
          placeholder: field.placeholder,
          type: qType,
          recommendedComponent: resolveRecommendedComponent(qType, role, field.options, category),
          semanticRole: role,
          required: !!field.required,
          options: field.options,
          quizMetadata:
            category === "quiz" && (qType === "quiz_question" || qType === "single_choice")
              ? { questionNumber: questionCounter }
              : undefined,
        };

        sectionQuestions.push(expQ);
        questionCounter++;
      });
    });

    if (sectionQuestions.length > 0) {
      sections.push({
        id: step.id || `sec_${sIdx + 1}`,
        title: step.title.replace(/^Step\s*\d+\s*:\s*/i, "").trim() || `Section ${sIdx + 1}`,
        subtitle: step.description,
        questions: sectionQuestions,
      });
    }
  });

  // Dynamic Rules label
  let rulesLabel = "Overview & Instructions";
  const catStr = String(category);
  if (catStr === "quiz" || catStr === "assessment") rulesLabel = "Assessment Instructions";
  else if (catStr === "hackathon") rulesLabel = "Registration Guidelines & Rules";
  else if (catStr === "survey" || catStr === "feedback") rulesLabel = "Survey Overview";
  else if (catStr === "application") rulesLabel = "Application Guidelines";

  // Generate fallback websiteContent for forms without AI analysis
  const estimatedTime = allFields.length > 15 ? "~10 min" : allFields.length > 6 ? "~5 min" : "~2 min";
  const requiredCount = allFields.filter(f => f.required).length;
  const richDesc = extractRichDescriptionData(desc);

  const ctaLabelMap: Record<string, string> = {
    quiz: "Start Assessment", assessment: "Begin Evaluation",
    survey: "Take Survey", feedback: "Share Feedback",
    hackathon: "Register Your Team", registration: "Register Now",
    application: "Apply Now", contact: "Send Message", custom: "Get Started",
  };

  const fallbackInfoSections: DynamicInfoSection[] = [{
    id: "info_instructions",
    type: "instructions",
    title: category === "quiz" ? "Assessment Guidelines" : "How to Complete",
    icon: "book-open",
    items: [
      { title: "Read Carefully", description: "Review each section before submitting your responses" },
      { title: "Required Fields", description: "Fields marked with * are mandatory and must be completed" },
      { title: "Review & Submit", description: "Verify your answers on the final screen before submission" },
    ],
  }];

  // Add rich extracted sections (Resource Persons, custom Rating Scale, Dates/Schedule)
  for (const rSec of richDesc.dynamicSections) {
    fallbackInfoSections.push(rSec);
  }

  if (fallbackInfoSections.every(s => s.type !== "rating_guide") && (catStr === "feedback" || catStr === "survey")) {
    fallbackInfoSections.push({
      id: "info_rating",
      type: "rating_guide",
      title: "Rating Scale Guide",
      icon: "star",
      items: [
        { title: "1 — Poor", description: "Significantly below expectations" },
        { title: "3 — Good", description: "Meets expectations" },
        { title: "5 — Excellent", description: "Outstanding, exceeds expectations" },
      ],
    });
  }

  const fallbackHeroMetrics: HeroMetric[] = [...richDesc.heroMetrics];
  fallbackHeroMetrics.push(
    { label: "Questions", value: String(allFields.length), detail: `${requiredCount} required` },
    { label: "Est. Time", value: estimatedTime, detail: "Average completion" },
    { label: "Sections", value: String(sections.length), detail: "Logical groups" }
  );

  const websiteContent: WebsiteContent = {
    heroTitle: title,
    heroSubtitle: richDesc.cleanSubtitle || desc || `Complete this ${category.replace(/_/g, " ")} form`,
    heroBadge: catStr === "quiz" ? "Knowledge Assessment" : catStr === "feedback" ? "Feedback Form" : catStr === "hackathon" ? "Hackathon Registration" : "Official Form",
    heroMetrics: fallbackHeroMetrics,
    ctaLabel: ctaLabelMap[category] || "Get Started",
    dynamicInfoSections: fallbackInfoSections,
    footerTagline: `Powered by NextForm — ${title}`,
  };

  return {
    schemaVersion: "1.0",
    source: {
      provider: "google_forms",
      formId: slug,
      originalUrl: "",
      targetActionUrl: meta.targetActionUrl || "",
      rawQuestionsCount: allFields.length,
    },
    form: {
      title,
      description: desc,
      category,
      confidence,
      reasoningSummary: `Classified as ${category.toUpperCase()} based on form structure and field context.`,
    },
    ux: {
      pattern: uxPattern,
      showProgressBar: true,
      allowQuestionNavigation: category === "quiz",
      requireReviewBeforeSubmit: true,
    },
    overview: {
      title,
      subtitle: richDesc.cleanSubtitle || desc || "Digital Submission Experience",
      purpose: `Collect responses for ${title}`,
      audience: richDesc.extractedAudience ? `${richDesc.extractedAudience}s and participants` : "Registered respondents",
      estimatedCompletionTime: allFields.length > 15 ? "~8-10 minutes" : "~3-5 minutes",
      rulesLabel,
      instructions: [
        "Read each section carefully before submitting.",
        "Ensure all required fields are accurately filled.",
        "Verify your contact information to receive confirmation.",
      ],
      requirements: richDesc.extractedDeadline
        ? [`Submit before ${richDesc.extractedDeadline}`, "Active Internet Connection"]
        : [
            "Active Internet Connection",
            category === "quiz" ? "Valid Student ID / Roll Number" : "Valid Email Address",
          ],
    },
    sections,
    theme: {
      personality: category === "quiz" ? "academic" : category === "hackathon" ? "energetic" : "professional",
      primaryColor: config.theme?.primaryColor || "#2563eb",
      accentColor: "#7c3aed",
      backgroundColor: config.theme?.backgroundColor || "#f8fafc",
      borderRadius: (config.theme?.borderRadius as any) || "rounded-xl",
      fontFamily: config.theme?.fontFamily || "Plus Jakarta Sans",
    },
    websiteContent,
    aiMetadata: {
      provider: "fallback",
      model: "deterministic-adapter",
      latencyMs: 5,
      confidence,
      reasoningSummary: `Derived from structural form elements (${allFields.length} questions, ${sections.length} sections).`,
      analyzedAt: new Date().toISOString(),
      promptVersion: "3.0",
    },
  };
}

/**
 * Converts CanonicalExperienceSchema back to FormConfig for backward compatibility
 */
export function convertExperienceToConfig(exp: CanonicalExperienceSchema): FormConfig {
  const steps: FormStep[] = exp.sections.map((sec, idx) => {
    const fields: FormField[] = sec.questions.map((q) => {
      let fType: FormField["type"] = "text";
      if (q.type === "textarea") fType = "paragraph";
      else if (q.type === "single_choice" || q.type === "quiz_question") fType = "radio";
      else if (q.type === "multi_choice") fType = "checkbox";
      else if (q.type === "dropdown") fType = "dropdown";
      else if (q.type === "date") fType = "date";
      else if (q.type === "file_upload") fType = "upload";

      return {
        id: q.id,
        entryCode: q.googleEntryId,
        label: q.label,
        helpText: q.description,
        placeholder: q.placeholder,
        type: fType,
        required: q.required,
        options: q.options,
      };
    });

    const card: FormCard = {
      id: `card-${idx + 1}-1`,
      title: sec.title,
      description: sec.subtitle,
      fields,
    };

    return {
      id: sec.id || `step-${idx + 1}`,
      title: sec.title,
      description: sec.subtitle,
      cards: [card],
    };
  });

  return {
    meta: {
      title: exp.form.title,
      description: exp.form.description,
      targetActionUrl: exp.source.targetActionUrl,
    },
    theme: {
      primaryColor: exp.theme.primaryColor || "#2563eb",
      backgroundColor: exp.theme.backgroundColor || "#f8fafc",
      borderRadius: exp.theme.borderRadius as any || "rounded-xl",
      fontFamily: exp.theme.fontFamily || "Plus Jakarta Sans",
    },
    steps,
  };
}
