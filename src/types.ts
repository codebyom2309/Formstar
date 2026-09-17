import { CanonicalExperienceSchema } from "./types/canonicalExperience";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export type FormStatus = "active" | "paused";

export type FieldType =
  | "text"
  | "paragraph"
  | "radio"
  | "checkbox"
  | "dropdown"
  | "upload"
  | "date";

export type OptionLayoutType = "vertical" | "grid-2" | "grid-3" | "pills";

export type FieldValidationType = "none" | "number" | "phone" | "email" | "url";

export interface FormField {
  id: string;
  entryCode: string; // e.g. "entry.182736452"
  label: string;
  description?: string;
  placeholder?: string;
  helpText?: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  optionLayout?: OptionLayoutType;
  validationType?: FieldValidationType;
  cloudinaryFolder?: string;
}

export interface ConditionalClause {
  fieldId: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: string | number | boolean;
}

export interface ConditionalRule {
  fieldId: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: string | number | boolean;
  action: "show" | "hide";
  logicOperator?: "and" | "or";
  clauses?: ConditionalClause[];
}

export interface FormCard {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  conditionalRule?: ConditionalRule;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  cards: FormCard[];
  conditionalRule?: ConditionalRule;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  borderRadius: "rounded-md" | "rounded-lg" | "rounded-xl" | "rounded-2xl";
  fontFamily: string;
}

export interface PaymentConfig {
  enabled: boolean;
  upiId?: string;
  payeeName?: string;
  amount?: number;
  note?: string;
  qrCodeUrl?: string;
  transactionEntryCode?: string;
  screenshotEntryCode?: string;
}

export interface IntegrationsConfig {
  discordWebhookUrl?: string;
  slackWebhookUrl?: string;
  customWebhookUrl?: string;
}

export interface LogicConfig {
  dynamicTeamMembers?: boolean;
  teamSizeFieldId?: string; // e.g. entry.XXXXX or field ID
  minMembers?: number;
  maxMembers?: number;
  quantityLogicEnabled?: boolean;
  quantityTriggerFieldId?: string;
  quantityCardMappings?: Record<string, string[]>; // e.g. { "2": ["card-2"], "3": ["card-2", "card-3"] }
}

export interface CloudinaryConfig {
  enabled: boolean;
  cloudName?: string;
  apiKey?: string;
  uploadPreset?: string;
  folder?: string;
}

export interface OverviewRulesConfig {
  title?: string;
  organization?: string;
  badge?: string;
  location?: string;
  commencement?: string;
  guidelines?: string[];
  rounds?: { name: string; date: string; details: string }[];
  fee?: string;
  teamSize?: string;
  deadline?: string;
  contacts?: { role: string; name: string; phone: string; email: string }[];
}

export interface FormConfig {
  meta: {
    title: string;
    description: string;
    targetActionUrl: string;
    bannerImageUrl?: string;
    logoUrl?: string;
    confirmationTitle?: string;
    confirmationMessage?: string;
    whatsappGroupUrl?: string;
    discordUrl?: string;
  };
  theme: FormTheme;
  steps: FormStep[];
  payment?: PaymentConfig;
  integrations?: IntegrationsConfig;
  logic?: LogicConfig;
  cloudinary?: CloudinaryConfig;
  overviewRules?: OverviewRulesConfig;
  aiExperience?: CanonicalExperienceSchema;
}

export interface FormSubmissionRecord {
  id: string;
  formId: string;
  submissionCode: string;
  respondentName?: string;
  respondentEmail?: string;
  responses: Record<string, any>;
  status: "verified" | "pending" | "flagged";
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface FormRecord {
  id: string;
  userId: string;
  title: string;
  originalGoogleUrl: string;
  hostedSlug: string;
  status: FormStatus;
  jsonConfig: FormConfig & { aiExperience?: CanonicalExperienceSchema };
  aiExperience?: CanonicalExperienceSchema;
  viewsCount: number;
  submissionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalForms: number;
  activeForms: number;
  totalSubmissions: number;
  totalViews: number;
}

export interface ParsedFieldItem {
  entryId: string;
  entryCode: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

export interface ParsedFormResult {
  success: boolean;
  error?: string;
  isUploadInterception?: boolean;
  offendingField?: string;
  meta: {
    title: string;
    description: string;
    targetActionUrl: string;
    originalUrl: string;
  };
  stats: {
    totalFields: number;
    requiredFields: number;
    totalSteps: number;
    totalCards: number;
  };
  flatFields: ParsedFieldItem[];
  config: FormConfig;
}

