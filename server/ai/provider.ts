import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { CanonicalExperienceSchema } from "../../src/types/canonicalExperience";
import { validateAndRepairExperience } from "./validator";
import { extractRichDescriptionData } from "../../src/lib/descriptionExtractor";

export interface FormAnalysisRequest {
  rawForm: any;
  sourceUrl?: string;
  forceRefresh?: boolean;
}

export interface FormAnalysisResult {
  experience: CanonicalExperienceSchema;
  model: string;
  provider: string;
  latencyMs: number;
  cached: boolean;
}

export interface AIProvider {
  analyzeForm(request: FormAnalysisRequest): Promise<FormAnalysisResult>;
  suggestCopy(prompt: string, context?: string): Promise<{ suggestion: string; latencyMs: number; model: string }>;
}

// In-memory LRU cache for analyzed forms
const analysisCache = new Map<string, { experience: CanonicalExperienceSchema; timestamp: number }>();
const MAX_CACHE_ENTRIES = 100;

export class UniversalAIProvider implements AIProvider {
  private groqApiKey: string;
  private geminiClient: GoogleGenAI | null = null;
  private primaryGroqModel: string = "openai/gpt-oss-20b";
  private fallbackGroqModel: string = "qwen/qwen3.8-27b";
  private geminiModel: string = "gemini-3.6-flash";

  constructor() {
    this.groqApiKey =
      process.env.GROQ_API_KEY ||
      process.env.APIKEY ||
      process.env.API_KEY ||
      process.env.GROQ_KEY ||
      process.env.GROQ_APIKEY ||
      "";
    if (process.env.GEMINI_API_KEY || process.env.GEMINI_KEY) {
      this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || "" });
    }
  }

  private computeFormHash(rawForm: any): string {
    const data = JSON.stringify({
      title: rawForm?.meta?.title || rawForm?.title,
      fields: (rawForm?.flatFields || []).map((f: any) => ({
        c: f.entryCode,
        l: f.label,
        o: f.options,
      })),
    });
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  public async analyzeForm(request: FormAnalysisRequest): Promise<FormAnalysisResult> {
    const { rawForm, forceRefresh = false } = request;
    const rawFields = rawForm?.flatFields || [];
    const rawTitle = rawForm?.meta?.title || rawForm?.title || "Universal Form";
    const rawDesc = rawForm?.meta?.description || rawForm?.description || "";

    const formHash = this.computeFormHash(rawForm);

    // Check cache
    if (!forceRefresh && analysisCache.has(formHash)) {
      const cached = analysisCache.get(formHash)!;
      return {
        experience: cached.experience,
        model: cached.experience.aiMetadata.model,
        provider: cached.experience.aiMetadata.provider || "gemini",
        latencyMs: 12,
        cached: true,
      };
    }

    const startTime = performance.now();

    const systemPrompt = `You are NextForm Studio's AI Form Intelligence Engine.
Analyze the provided Google Form structure (title, description, and raw fields).
Understand what the form is, why it exists, who it is for, and how respondents should experience it.

UNIVERSAL CLASSIFICATION:
Classify into one of:
- "quiz" | "assessment" | "examination"
- "survey" | "feedback" | "evaluation" | "poll" | "questionnaire"
- "registration" | "event_registration" | "hackathon" | "competition" | "membership" | "workshop_registration" | "conference_registration" | "payment_registration"
- "application" | "job_application" | "internship_application" | "scholarship_application" | "admission" | "onboarding"
- "contact" | "data_collection" | "complaint" | "custom"

NEVER assume every form is a hackathon form.
- If it contains questions with options and point values, or academic subject questions (e.g. physics, engineering, math, knowledge tests) -> Category: "quiz" or "assessment", UX Pattern: "assessment", Personality: "academic".
- If it contains ratings, satisfaction scales (1-5, 1-10), reviews, or impressions -> Category: "survey" or "feedback", UX Pattern: "survey", Personality: "friendly".
- If it has 1-5 simple inquiry questions (Name, Email, Message) -> Category: "contact", UX Pattern: "single_page", Personality: "minimal".
- If it collects job/internship details (Education, Experience, Resume, GitHub) -> Category: "application" or "job_application", UX Pattern: "application", Personality: "professional".
- If it is specifically an official hackathon / coding event -> Category: "hackathon", UX Pattern: "stepper", Personality: "energetic".

ZERO FACTUAL HALLUCINATION MANDATE (STRICT):
1. Never invent registration fees, cash prizes, dates, deadlines, event locations, team sizes, or rules unless they are explicitly written in the source title, description, or questions.
2. If not specified in the source, omit them or state "Not specified in source".
3. Never fabricate correct quiz answers or scoring rubrics unless present in the raw input.

QUESTION UNDERSTANDING & COMPONENT REGISTRY:
For each question, select the optimal component from the trusted registry:
"TextInput" | "EmailInput" | "PhoneInput" | "NumberInput" | "DatePicker" | "TimePicker" | "URLInput" | "Select" | "RadioCards" | "CheckboxCards" | "RatingCards" | "ScaleSelector" | "Textarea" | "FileDropzone" | "QuizOption" | "Toggle"

Also provide:
- "normalizedLabel": clean, human-friendly question title
- "helpText": concise, user-friendly helper context that aids clarity WITHOUT changing question intent
- "placeholder": natural placeholder
- "semanticRole": e.g. "full_name", "email", "phone", "roll_number", "student_id", "college", "department", "quiz_question", "rating", "feedback", "github", "resume"
- "validation": { "trim": true, "minLength": number, "maxLength": number, "isEmail": boolean, "isPhone": boolean, "isUrl": boolean }
- "importance": "critical" | "standard" | "optional"
- "sensitivity": "public" | "private" | "confidential"

SECTION PLANNING:
Group questions logically based on their actual meaning. Do NOT invent empty or irrelevant sections.
If it is a 3-question contact form, use 1 section. If it is an assessment, group by subject/part.

OVERVIEW & COMPLETION PLANNING:
- "rulesLabel": dynamic appropriate title, e.g. "Assessment Instructions", "Quiz Guidelines", "About This Survey", "Application Instructions", "Contact Information"
- "instructions": 3-4 clear instructions derived from the form's actual purpose
- "completion": { "headline": "string", "message": "string", "categoryTailoredNote": "string" }

WEBSITE CONTENT GENERATION (CRITICAL):
You must also generate "websiteContent" — personalized landing page content that transforms this form into a complete mini-website experience.
- "heroTitle": A compelling, specific headline derived from the form's actual purpose (NOT generic)
- "heroSubtitle": 1-2 sentence description explaining what this form is about
- "heroBadge": Short badge text (e.g. "Official Registration", "Quick Survey", "Knowledge Assessment")
- "heroMetrics": 2-4 quick-glance metric cards derived from the form content (e.g. {"label": "Questions", "value": "15", "detail": "All required"}, {"label": "Time", "value": "~5 min", "detail": "Average completion"})
- "ctaLabel": Action button text (e.g. "Start Assessment", "Register Now", "Submit Feedback")
- "dynamicInfoSections": An array of 2-5 contextual info sections based on the form type. Each section has:
  - "type": "overview" | "instructions" | "eligibility" | "dates" | "rating_guide" | "steps" | "tips" | "contacts" | "privacy" | "guidelines" | "scoring" | "faq"
  - "title": Section title
  - "icon": lucide icon name
  - "items": Array of { "title": "string", "description": "string" }
  IMPORTANT: Only generate sections that are RELEVANT to this specific form. A feedback form needs a "rating_guide", not "eligibility". A quiz needs "scoring", not "dates".
- "footerTagline": Short tagline for the form footer

SOURCE CONTENT EXTRACTION DIRECTIVE (CRITICAL):
If the original form contains guidelines, instructions, descriptions, rating scale definitions, deadlines, eligibility criteria, resource persons, contact info, or ANY structured information in its title, description, section headers, or question help text — you MUST EXTRACT AND USE THAT INFORMATION in the websiteContent and overview. Do NOT replace it with generic boilerplate content. The original form creator's words are the source of truth.

MANDATORY TECHNICAL PRESERVATION:
Every question MUST retain its exact "googleEntryId" (e.g. "entry.182736452") so that submissions route to Google Forms seamlessly.

Output strictly valid JSON matching this schema:
{
  "form": {
    "title": "string",
    "description": "string",
    "category": "quiz" | "assessment" | "survey" | "feedback" | "registration" | "event_registration" | "hackathon" | "application" | "job_application" | "contact" | "custom",
    "confidence": 0.98,
    "purpose": "Why this form exists",
    "targetAudience": "Who will fill this form",
    "reasoningSummary": "Why this category, layout, and UX was planned"
  },
  "ux": {
    "pattern": "assessment" | "survey" | "stepper" | "single_page" | "application" | "cards",
    "showProgressBar": true,
    "allowQuestionNavigation": true,
    "requireReviewBeforeSubmit": true,
    "questionDensity": "compact" | "comfortable" | "spacious",
    "stickyNavigation": true
  },
  "websiteContent": {
    "heroTitle": "string",
    "heroSubtitle": "Comprehensive 2-3 sentence overview without truncation",
    "heroBadge": "string",
    "heroMetrics": [{"label": "string", "value": "string", "detail": "string"}],
    "ctaLabel": "string",
    "dynamicInfoSections": [
      {
        "id": "info_1",
        "type": "overview" | "instructions" | "eligibility" | "dates" | "rating_guide" | "steps" | "tips" | "contacts" | "privacy" | "guidelines" | "scoring" | "resources" | "faq",
        "title": "string",
        "icon": "string",
        "items": [{"title": "string", "description": "string"}]
      }
    ],
    "footerTagline": "string"
  },
  "overview": {
    "title": "string",
    "subtitle": "string",
    "purpose": "string",
    "audience": "string",
    "estimatedCompletionTime": "e.g. ~5 minutes",
    "rulesLabel": "string",
    "instructions": ["string"],
    "requirements": ["string"],
    "tips": ["string"]
  },
  "sections": [
    {
      "id": "sec_1",
      "title": "Section Title",
      "subtitle": "Optional description",
      "icon": "user" | "book-open" | "help-circle" | "check-circle" | "award" | "file-text",
      "questions": [
        {
          "id": "q_1",
          "googleEntryId": "entry.XXXXX",
          "label": "Normalized question label",
          "originalLabel": "Raw source label",
          "helpText": "Concise helper text",
          "placeholder": "e.g. Enter value",
          "type": "text" | "textarea" | "email" | "phone" | "number" | "date" | "single_choice" | "multi_choice" | "dropdown" | "rating" | "linear_scale" | "quiz_question",
          "recommendedComponent": "TextInput" | "EmailInput" | "PhoneInput" | "RadioCards" | "CheckboxCards" | "RatingCards" | "ScaleSelector" | "Textarea" | "QuizOption" | "Select",
          "semanticRole": "roll_number" | "full_name" | "email" | "quiz_question" | "rating" | "feedback" | "unknown",
          "required": true,
          "options": ["Option A", "Option B"],
          "validation": { "trim": true },
          "importance": "critical" | "standard",
          "quizMetadata": { "questionNumber": 1 }
        }
      ]
    }
  ],
  "theme": {
    "personality": "academic" | "professional" | "technical" | "friendly" | "minimal" | "energetic" | "creative" | "neutral",
    "primaryColor": "#2563eb",
    "accentColor": "#7c3aed",
    "backgroundColor": "#f8fafc",
    "borderRadius": "rounded-2xl",
    "fontFamily": "Plus Jakarta Sans",
    "surfaceStyle": "glass",
    "density": "comfortable"
  },
  "completion": {
    "headline": "Submission Received",
    "message": "Your responses have been successfully submitted to the official database.",
    "categoryTailoredNote": "Thank you for completing this form."
  }
}`;

    // Build enriched context for the AI
    const sectionHeaders = rawForm?.sectionHeaders || [];
    const sectionHeadersText = sectionHeaders.length > 0
      ? `\nForm Section Headers (${sectionHeaders.length} sections):\n${sectionHeaders.map((sh: any, i: number) => `  Section ${i + 1}: "${sh.title}"${sh.description ? ` — Description: "${sh.description}"` : ""}`).join("\n")}`
      : "";

    const fieldsWithContext = rawFields.map((f: any) => {
      const obj: any = {
        entryCode: f.entryCode || `entry.${f.entryId}`,
        label: f.label,
        type: f.type,
        required: f.required,
        options: f.options,
      };
      if (f.helpText) obj.helpText = f.helpText;
      if (f.scaleMinLabel) obj.scaleMinLabel = f.scaleMinLabel;
      if (f.scaleMaxLabel) obj.scaleMaxLabel = f.scaleMaxLabel;
      return obj;
    });

    const richDesc = extractRichDescriptionData(rawDesc);
    const extractedDetails = [
      richDesc.extractedDate ? `Event Date: ${richDesc.extractedDate}` : "",
      richDesc.extractedDeadline ? `Deadline: ${richDesc.extractedDeadline}` : "",
      richDesc.extractedVenue ? `Venue: ${richDesc.extractedVenue}` : "",
      richDesc.extractedFee ? `Fee: ${richDesc.extractedFee}` : "",
      richDesc.extractedAudience ? `Target Audience: ${richDesc.extractedAudience}` : "",
      richDesc.ratingScaleItems.length > 0 ? `Rating Scale: ${richDesc.ratingScaleItems.map(r => r.title).join(" | ")}` : "",
      richDesc.dynamicSections.find(s => s.type === "resources")
        ? `Resource Persons / Dignitaries (${richDesc.dynamicSections.find(s => s.type === "resources")!.items.length}):\n${richDesc.dynamicSections.find(s => s.type === "resources")!.items.map(i => `  • ${i.title} — ${i.description}`).join("\n")}`
        : "",
    ].filter(Boolean).join("\n");

    const userPrompt = `Google Form Title: ${rawTitle}
Description: ${richDesc.cleanedText || rawDesc || "(No description provided)"}
${extractedDetails ? `\nPRE-PARSED SOURCE METADATA:\n${extractedDetails}\n` : ""}Total Questions: ${rawFields.length}
Required Questions: ${rawFields.filter((f: any) => f.required).length}${sectionHeadersText}

Extracted Fields (${rawFields.length} total):
${JSON.stringify(fieldsWithContext, null, 2)}

CRITICAL EXTRACTION MANDATE:
1. You MUST generate "websiteContent" at the top level of the JSON response.
2. If the form description has Resource Persons / Dignitaries, you MUST create a dynamicInfoSection with type "resources", title "Resource Persons & Dignitaries", icon "award", and all the persons listed!
3. If the form description has a Rating Scale, you MUST create a dynamicInfoSection with type "rating_guide" and the exact rating options from the form!
4. If the form description has an Event Date or Deadline, you MUST include it in heroMetrics and as a "dates" dynamicInfoSection!
5. In "heroSubtitle": Write a comprehensive, complete summary of the form's purpose (2-3 sentences). Do NOT truncate or cut off words.`;

    // 1. Try Gemini first if configured
    if (this.geminiClient) {
      try {
        const response = await this.geminiClient.models.generateContent({
          model: this.geminiModel,
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            responseMimeType: "application/json",
            temperature: 0.15,
          },
        });

        const text = response.text?.trim() || "";
        if (text) {
          const parsedAiJson = JSON.parse(text);
          const endTime = performance.now();
          const latencyMs = Math.round(endTime - startTime);

          const validatedExperience = validateAndRepairExperience(parsedAiJson, rawForm, {
            model: this.geminiModel,
            latencyMs,
          });
          validatedExperience.aiMetadata.provider = "gemini";

          // Save to cache
          if (analysisCache.size >= MAX_CACHE_ENTRIES) {
            const firstKey = analysisCache.keys().next().value;
            if (firstKey) analysisCache.delete(firstKey);
          }
          analysisCache.set(formHash, { experience: validatedExperience, timestamp: Date.now() });

          return {
            experience: validatedExperience,
            model: this.geminiModel,
            provider: "gemini",
            latencyMs,
            cached: false,
          };
        }
      } catch (geminiErr: any) {
        console.warn(`[AIProvider] Gemini (${this.geminiModel}) failed, falling back to Groq:`, geminiErr.message);
      }
    }

    // 2. Try Groq if Gemini is unavailable or failed
    if (this.groqApiKey) {
      let selectedModel = this.primaryGroqModel;
      try {
        let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
            max_tokens: 6000,
          }),
        });

        if (!response.ok) {
          console.warn(`[GroqProvider] Primary model ${selectedModel} returned ${response.status}. Retrying with fallback...`);
          selectedModel = this.fallbackGroqModel;
          response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.groqApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              response_format: { type: "json_object" },
              temperature: 0.2,
              max_tokens: 6000,
            }),
          });
        }

        if (response.ok) {
          const resData: any = await response.json();
          const endTime = performance.now();
          const latencyMs = Math.round(endTime - startTime);

          const content = resData?.choices?.[0]?.message?.content || "{}";
          const parsedAiJson = JSON.parse(content);

          const validatedExperience = validateAndRepairExperience(parsedAiJson, rawForm, {
            model: selectedModel,
            latencyMs,
          });
          validatedExperience.aiMetadata.provider = "groq";

          if (analysisCache.size >= MAX_CACHE_ENTRIES) {
            const firstKey = analysisCache.keys().next().value;
            if (firstKey) analysisCache.delete(firstKey);
          }
          analysisCache.set(formHash, { experience: validatedExperience, timestamp: Date.now() });

          return {
            experience: validatedExperience,
            model: selectedModel,
            provider: "groq",
            latencyMs,
            cached: false,
          };
        }
      } catch (groqErr: any) {
        console.warn("[AIProvider] Groq failed, falling back to deterministic normalizer:", groqErr.message);
      }
    }

    // 3. Resilient Deterministic Normalizer Fallback (Zero external dependency)
    const endTime = performance.now();
    const latencyMs = Math.max(5, Math.round(endTime - startTime));

    const fallbackExperience = validateAndRepairExperience({}, rawForm, {
      model: "deterministic-normalizer (fallback)",
      latencyMs,
    });
    fallbackExperience.aiMetadata.provider = "fallback";

    return {
      experience: fallbackExperience,
      model: "deterministic-normalizer",
      provider: "fallback",
      latencyMs,
      cached: false,
    };
  }

  public async suggestCopy(prompt: string, context?: string): Promise<{ suggestion: string; latencyMs: number; model: string }> {
    const startTime = performance.now();

    // 1. Try Gemini
    if (this.geminiClient) {
      try {
        const response = await this.geminiClient.models.generateContent({
          model: this.geminiModel,
          contents: `You are an AI assistant for NextForm Studio, helping form creators optimize titles, descriptions, instructions, and questions for maximum completion rate. Be concise, direct, and helpful.\n\n${context ? `Context: ${context}\n\n` : ""}Request: ${prompt}`,
          config: {
            temperature: 0.6,
            maxOutputTokens: 350,
          },
        });
        const reply = response.text?.trim();
        if (reply) {
          const endTime = performance.now();
          return { suggestion: reply, latencyMs: Math.round(endTime - startTime), model: this.geminiModel };
        }
      } catch (geminiErr: any) {
        console.warn("[AIProvider] Gemini suggestCopy failed, trying Groq:", geminiErr.message);
      }
    }

    // 2. Try Groq
    if (this.groqApiKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.primaryGroqModel,
            messages: [
              {
                role: "system",
                content:
                  "You are an AI assistant for NextForm Studio, helping form creators optimize titles, descriptions, instructions, and questions for maximum completion rate. Be concise, direct, and helpful.",
              },
              {
                role: "user",
                content: `${context ? `Context: ${context}\n\n` : ""}Request: ${prompt}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 350,
          }),
        });

        const data: any = await response.json();
        const endTime = performance.now();
        const latencyMs = Math.round(endTime - startTime);
        const reply = data?.choices?.[0]?.message?.content || "";
        return { suggestion: reply, latencyMs, model: this.primaryGroqModel };
      } catch (err: any) {
        console.warn("[AIProvider] Groq suggestCopy failed:", err.message);
      }
    }

    // Fallback suggestion
    const endTime = performance.now();
    return {
      suggestion: "Please complete all required fields accurately to ensure your submission is registered smoothly.",
      latencyMs: Math.round(endTime - startTime),
      model: "rule-based-assistant",
    };
  }
}

export const groqAiProvider = new UniversalAIProvider();
export const universalAiProvider = groqAiProvider;
