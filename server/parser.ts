import { FormConfig, FormStep, FormCard, FormField } from "../src/types";
import { extractRichDescriptionData, ExtractedDescriptionData } from "../src/lib/descriptionExtractor";

export interface SectionHeader {
  title: string;
  description: string;
}

export interface ParsedGoogleFormResult {
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
  sectionHeaders: SectionHeader[];
  structuredDescription?: ExtractedDescriptionData;
  flatFields: {
    entryId: string;
    entryCode: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    helpText?: string;
    scaleMinLabel?: string;
    scaleMaxLabel?: string;
  }[];
  config: FormConfig;
}

/**
 * Extracts and parses the FB_PUBLIC_LOAD_DATA_ structure from a public Google Form URL.
 */
export async function parseGoogleForm(rawUrl: string): Promise<ParsedGoogleFormResult> {
  let url = rawUrl.trim();

  // Validate URL format
  if (!url.includes("docs.google.com/forms") && !url.includes("forms.gle")) {
    throw new Error("Invalid Google Form URL. Must be a valid docs.google.com/forms or forms.gle link.");
  }

  // If edit URL, transform to viewform
  if (url.includes("/edit")) {
    url = url.replace(/\/edit.*$/, "/viewform");
  }

  // Fetch HTML from Google Form
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to access Google Form (HTTP ${response.status}). Make sure the form is published and set to public access.`
    );
  }

  const html = await response.text();
  const finalUrl = response.url || url;

  // Regex to extract FB_PUBLIC_LOAD_DATA_
  // Matches `var FB_PUBLIC_LOAD_DATA_ = [...];` or `window.FB_PUBLIC_LOAD_DATA_ = [...];`
  const regex = /FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);\s*<\/(?:script|div)>/;
  const match = html.match(regex);

  if (!match || !match[1]) {
    // Check if form requires login or permissions
    if (html.includes("You need permission") || html.includes("Sign in to continue")) {
      throw new Error(
        "Google Form requires sign-in or private domain access. In Google Forms Settings, uncheck 'Restrict to users in domain' and ensure the form is accessible to anyone with the link."
      );
    }
    throw new Error(
      "Could not find FB_PUBLIC_LOAD_DATA_ in Google Form. Ensure the form is publicly accessible and not closed to responses."
    );
  }

  let rawData: any;
  try {
    rawData = JSON.parse(match[1]);
  } catch (err) {
    throw new Error("Failed to parse the Google Form schema payload.");
  }

  // Form metadata — preserve description even when it partially matches title
  const formTitle = (rawData[1]?.[8] || rawData[1]?.[0] || "Untitled Google Form").toString().trim();
  const rawDescCandidate = rawData[1]?.[0] ? rawData[1][0].toString().trim() : "";
  // Also check index [12] for longer description field and [15] for confirmation message
  const altDesc = rawData[1]?.[12] ? rawData[1][12].toString().trim() : "";
  const rawDesc = altDesc || (rawDescCandidate && rawDescCandidate !== formTitle ? rawDescCandidate : "");
  // Sanitize raw label prefixes like "FORM DESCRIPTION"
  const formDescription = rawDesc
    .replace(/^FORM\s+DESCRIPTION\s*:?/i, "")
    .replace(/^FORM\s+DETAILS\s*:?/i, "")
    .replace(/^DESCRIPTION\s*:?/i, "")
    .trim();
  const structuredDescription = extractRichDescriptionData(formDescription);

  // Derive target action URL for submissions (formResponse)
  const targetActionUrl = finalUrl.replace(/\/(viewform|edit|closedform)(\?.*)?$/, "/formResponse");

  const rawElements: any[] = rawData[1]?.[1] || [];
  if (!rawElements || rawElements.length === 0) {
    throw new Error("Google Form contains no questions or elements to parse.");
  }

  // -------------------------------------------------------------
  // Phase 2: Upload Interception
  // -------------------------------------------------------------
  // Detect Google's native file upload field types (Type 13).
  for (const element of rawElements) {
    const title = (element[1] || "Untitled").trim();
    const typeCode = element[3];

    // Check if type code is 13 (Google Drive File Upload)
    if (typeCode === 13) {
      const errorMsg = `Upload Interception: Field "${title}" is a Google Drive File Upload question. Google Forms restricts native file upload questions to Google Workspace domains and blocks headless API submissions. Please change this question's type to "Short Answer" (e.g., "Image URL / Drive Link / Document Link") in your Google Form editor. NextForm Studio will provide an integrated Cloudinary upload widget in your custom form to automatically host files and fill this field.`;
      
      const err: any = new Error(errorMsg);
      err.isUploadInterception = true;
      err.offendingField = title;
      throw err;
    }
  }

  // -------------------------------------------------------------
  // Phase 2: Data Normalization
  // Structure into Stepper inside a Stepper: Steps -> Cards -> Fields
  // -------------------------------------------------------------
  const steps: FormStep[] = [];
  const flatFields: ParsedGoogleFormResult["flatFields"] = [];
  const sectionHeaders: SectionHeader[] = [];

  let currentStep: FormStep = {
    id: "step-1",
    title: "Step 1: General Details",
    description: "",
    cards: [
      {
        id: "card-1-1",
        title: "General Information",
        description: "",
        fields: [],
      },
    ],
  };
  steps.push(currentStep);

  let stepCount = 1;
  let cardCount = 1;
  let requiredCount = 0;

  for (const element of rawElements) {
    const rawTitle = (element[1] || "").toString().trim();
    const cleanTitle = rawTitle.replace(/<[^>]*>?/gm, "").trim();
    const description = element[2] ? element[2].toString().trim() : "";
    const typeCode = element[3];

    // Type 8 represents a Section Header / Page Break in Google Forms
    if (typeCode === 8) {
      stepCount++;
      cardCount = 1;
      // Capture section headers for AI context
      sectionHeaders.push({ title: cleanTitle || `Section ${stepCount}`, description: description || "" });
      currentStep = {
        id: `step-${stepCount}`,
        title: cleanTitle ? `Step ${stepCount}: ${cleanTitle}` : `Step ${stepCount}`,
        description: description || undefined,
        cards: [
          {
            id: `card-${stepCount}-${cardCount}`,
            title: cleanTitle || `Section ${stepCount}`,
            description: description || undefined,
            fields: [],
          },
        ],
      };
      steps.push(currentStep);
      continue;
    }

    // Question item with entry IDs in element[4]
    const subEntries = element[4];
    if (!subEntries || !Array.isArray(subEntries) || subEntries.length === 0) {
      continue;
    }

    for (const sub of subEntries) {
      const entryIdNum = sub[0];
      if (!entryIdNum) continue;

      const entryCode = `entry.${entryIdNum}`;
      const isRequired = sub[2] === 1 || sub[2] === true;
      if (isRequired) requiredCount++;

      // Extract options if applicable (choice list in sub[1])
      let options: string[] | undefined = undefined;
      if (sub[1] && Array.isArray(sub[1])) {
        options = sub[1]
          .map((opt: any) => (Array.isArray(opt) ? opt[0] : opt))
          .filter((opt: any) => typeof opt === "string" && opt.trim().length > 0);
      }

      // Map Google Form typeCode to our normalized FormField type
      let fieldType: FormField["type"] = "text";
      if (typeCode === 1) {
        fieldType = "paragraph";
      } else if (typeCode === 2 || typeCode === 5) {
        fieldType = "radio";
      } else if (typeCode === 3) {
        fieldType = "dropdown";
      } else if (typeCode === 4) {
        fieldType = "checkbox";
      } else if (typeCode === 9) {
        fieldType = "date";
      } else if (
        typeCode === 0 &&
        (/phone|contact|mobile|whatsapp|amount|fee|price|utr|id/i.test(cleanTitle) ||
          /number/i.test(cleanTitle))
      ) {
        // Helpful hint for numerical/ID fields
        fieldType = "text";
      }

      // Extract scale labels for linear scale questions (type 5)
      let scaleMinLabel: string | undefined;
      let scaleMaxLabel: string | undefined;
      if (typeCode === 5 && sub[1] && Array.isArray(sub[1])) {
        // Scale labels are in element[4][x][3] structure or options array
        const scaleOpts = sub[1];
        if (scaleOpts.length >= 2) {
          // Try extracting boundary labels from option metadata
          const firstOpt = scaleOpts[0];
          const lastOpt = scaleOpts[scaleOpts.length - 1];
          if (Array.isArray(firstOpt) && firstOpt[1]) scaleMinLabel = firstOpt[1].toString().trim();
          if (Array.isArray(lastOpt) && lastOpt[1]) scaleMaxLabel = lastOpt[1].toString().trim();
        }
      }

      const field: FormField = {
        id: `f_${entryIdNum}`,
        entryCode,
        label: cleanTitle || `Question ${entryCode}`,
        type: fieldType,
        required: isRequired,
        helpText: description || undefined,
        options: options && options.length > 0 ? options : undefined,
      };

      // Add to current card in current step
      const activeCard = currentStep.cards[currentStep.cards.length - 1];
      activeCard.fields.push(field);

      flatFields.push({
        entryId: String(entryIdNum),
        entryCode,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options,
        helpText: description || undefined,
        scaleMinLabel,
        scaleMaxLabel,
      });
    }
  }

  // Filter out any steps or cards that contain no fields
  const normalizedSteps = steps
    .map((step) => ({
      ...step,
      cards: step.cards.filter((card) => card.fields.length > 0),
    }))
    .filter((step) => step.cards.length > 0);

  // If all fields landed in a single step with 0 section headers, split into neat cards of ~4 fields each
  if (normalizedSteps.length === 1 && normalizedSteps[0].cards.length === 1) {
    const allFields = normalizedSteps[0].cards[0].fields;
    if (allFields.length > 5) {
      const chunkSize = 4;
      const newCards: FormCard[] = [];
      for (let i = 0; i < allFields.length; i += chunkSize) {
        const chunk = allFields.slice(i, i + chunkSize);
        const cardNum = Math.floor(i / chunkSize) + 1;
        newCards.push({
          id: `card-1-${cardNum}`,
          title: `Part ${cardNum}: ${chunk[0]?.label || "Section"}`,
          description: "",
          fields: chunk,
        });
      }
      normalizedSteps[0].cards = newCards;
    }
  }

  const totalCards = normalizedSteps.reduce((acc, s) => acc + s.cards.length, 0);

  const config: FormConfig = {
    meta: {
      title: formTitle,
      description: formDescription,
      targetActionUrl,
      bannerImageUrl: "",
      logoUrl: "",
    },
    theme: {
      primaryColor: "#2563eb",
      backgroundColor: "#f8fafc",
      borderRadius: "rounded-xl",
      fontFamily: "Plus Jakarta Sans",
    },
    steps: normalizedSteps,
  };

  return {
    success: true,
    meta: {
      title: formTitle,
      description: formDescription,
      targetActionUrl,
      originalUrl: url,
    },
    stats: {
      totalFields: flatFields.length,
      requiredFields: requiredCount,
      totalSteps: normalizedSteps.length,
      totalCards,
    },
    sectionHeaders,
    structuredDescription,
    flatFields,
    config,
  };
}
