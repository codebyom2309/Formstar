// ============================================================================
// CANONICAL FORM EXPERIENCE SCHEMA — NEXTFORM STUDIO AI-FIRST ENGINE
// Universal representation for forms analyzed by the AI Intelligence Engine
// ============================================================================

export type FormCategory =
  | "quiz"
  | "assessment"
  | "examination"
  | "survey"
  | "feedback"
  | "registration"
  | "event_registration"
  | "hackathon"
  | "competition"
  | "application"
  | "job_application"
  | "internship_application"
  | "scholarship_application"
  | "admission"
  | "onboarding"
  | "evaluation"
  | "poll"
  | "questionnaire"
  | "contact"
  | "data_collection"
  | "payment_registration"
  | "membership"
  | "workshop_registration"
  | "conference_registration"
  | "complaint"
  | "custom";

export type UXPattern =
  | "assessment"   // Card-by-card quiz with progress, tactile choice cards, question navigator, review answers
  | "survey"       // Compact grouped sections, rating scales, choice cards, quick finish
  | "stepper"      // Multi-step wizard with step dots/bars for complex registration
  | "single_page"  // Clean single-view flow for short forms (1-5 fields or contact)
  | "application"  // Multi-step flow with document cards, education, work, portfolio
  | "cards"        // Stacked visual cards
  | "custom";

export type QuestionSemanticRole =
  | "first_name"
  | "last_name"
  | "full_name"
  | "email"
  | "phone"
  | "whatsapp"
  | "roll_number"
  | "student_id"
  | "employee_id"
  | "college"
  | "university"
  | "organization"
  | "department"
  | "branch"
  | "graduation_year"
  | "team_name"
  | "team_size"
  | "team_member"
  | "github"
  | "linkedin"
  | "portfolio"
  | "resume"
  | "document"
  | "terms_acceptance"
  | "payment"
  | "rating"
  | "feedback"
  | "quiz_question"
  | "short_answer"
  | "long_answer"
  | "unknown";

export type CanonicalQuestionType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "date"
  | "time"
  | "url"
  | "single_choice"
  | "multi_choice"
  | "dropdown"
  | "rating"
  | "linear_scale"
  | "file_upload"
  | "quiz_question";

// Trusted Component Registry
export type CanonicalComponentType =
  | "TextInput"
  | "EmailInput"
  | "PhoneInput"
  | "NumberInput"
  | "DatePicker"
  | "TimePicker"
  | "URLInput"
  | "Select"
  | "RadioCards"
  | "CheckboxCards"
  | "RatingCards"
  | "ScaleSelector"
  | "Textarea"
  | "FileDropzone"
  | "QuizOption"
  | "MatrixInput"
  | "Toggle"
  | "InfoCard"
  | "SectionHeader"
  | "DisplayInformation"
  | "ReviewCard";

export interface QuestionValidationRules {
  trim?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  isEmail?: boolean;
  isPhone?: boolean;
  isUrl?: boolean;
  customMessage?: string;
}

export interface ExperienceQuestion {
  id: string;                      // Internal ID (e.g. "q_roll_no", "f_12345")
  sourceQuestionId: string;        // Original question ID or index
  googleEntryId: string;           // Original Google Entry Code (e.g. "entry.182736452") - MANDATORY for headless submission!
  label: string;                   // Clean normalized question label
  originalLabel?: string;          // Verbatim source question
  description?: string;            // Question help/subtext
  helpText?: string;               // AI-generated usability context
  placeholder?: string;
  type: CanonicalQuestionType;
  recommendedComponent?: CanonicalComponentType;
  semanticRole: QuestionSemanticRole;
  required: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  validation?: QuestionValidationRules;
  importance?: "critical" | "standard" | "optional";
  sensitivity?: "public" | "private" | "confidential";
  confidence?: number;
  quizMetadata?: {
    questionNumber?: number;
    points?: number;
    explanation?: string;
  };
}

export interface ExperienceConditionalRule {
  id: string;
  sourceQuestionId: string;
  googleEntryId: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty";
  value: any;
  action: "show" | "hide";
  targetFieldIds: string[];
}

export interface ExperienceSection {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;                   // Semantic icon name (e.g. "user", "book-open", "help-circle", "check-circle", "award", "file-text")
  questions: ExperienceQuestion[];
}

export interface ExperienceOverview {
  title: string;
  subtitle: string;
  purpose: string;
  audience: string;
  estimatedCompletionTime: string; // e.g. "~5 minutes"
  rulesLabel: string;              // Dynamic label e.g. "Assessment Instructions", "Quiz Instructions", "Registration Guidelines", "Survey Overview"
  instructions: string[];
  requirements: string[];          // What you'll need
  tips?: string[];
  warnings?: string[];
  // ZERO FACTUAL HALLUCINATION: Optional source metadata only if explicitly in source
  verifiedSourceDetails?: {
    deadline?: string;
    fee?: string;
    organizer?: string;
    venue?: string;
  };
}

export interface ExperienceTheme {
  personality:
    | "technical"
    | "academic"
    | "professional"
    | "friendly"
    | "minimal"
    | "energetic"
    | "creative"
    | "formal"
    | "event"
    | "neutral";
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  borderRadius: "rounded-lg" | "rounded-xl" | "rounded-2xl" | "rounded-3xl";
  fontFamily: string;
  surfaceStyle?: "glass" | "solid" | "translucent";
  density?: "compact" | "comfortable" | "spacious";
}

export interface ExperienceCompletion {
  headline: string;
  message: string;
  categoryTailoredNote?: string;
  showConfetti?: boolean;
  nextSteps?: string[];
}

export interface AIAnalysisMetadata {
  provider: "gemini" | "groq" | "fallback" | string;
  model: string;                   // e.g. "gemini-3.6-flash" or "openai/gpt-oss-20b"
  latencyMs: number;               // Execution time in milliseconds
  confidence: number;              // 0 to 1
  reasoningSummary: string;        // Why this category and UX was chosen
  analyzedAt: string;
  promptVersion: string;
  tokensUsed?: number;
}

export interface CanonicalExperienceSchema {
  schemaVersion: "1.0";
  source: {
    provider: "google_forms";
    formId: string;
    originalUrl: string;
    targetActionUrl: string;
    rawQuestionsCount: number;
  };
  form: {
    title: string;
    description: string;
    category: FormCategory;
    confidence: number;
    reasoningSummary: string;
    purpose?: string;
    targetAudience?: string;
  };
  ux: {
    pattern: UXPattern;
    showProgressBar: boolean;
    allowQuestionNavigation: boolean;
    requireReviewBeforeSubmit: boolean;
    questionDensity?: "compact" | "comfortable" | "spacious";
    stickyNavigation?: boolean;
  };
  overview: ExperienceOverview;
  sections: ExperienceSection[];
  conditionalRules?: ExperienceConditionalRule[];
  theme: ExperienceTheme;
  completion?: ExperienceCompletion;
  aiMetadata: AIAnalysisMetadata;
}
