import { DynamicInfoSection, HeroMetric } from "../types/canonicalExperience";

export interface ExtractedDescriptionData {
  cleanedText: string;
  cleanSubtitle: string;
  extractedDate: string | null;
  extractedDeadline: string | null;
  extractedVenue: string | null;
  extractedFee: string | null;
  extractedTeamSize: string | null;
  extractedAudience: string | null;
  extractedOrganization: string | null;
  extractedEventName: string | null;
  ratingScaleItems: { title: string; description: string }[];
  dynamicSections: DynamicInfoSection[];
  heroMetrics: HeroMetric[];
}

/**
 * Intelligent description parser that extracts dates, rating scales,
 * resource persons/speakers/faculty, guidelines, venue, fees, organization, and clean subtitles
 * from any raw Google Form description text.
 */
export function extractRichDescriptionData(rawDesc?: string | null): ExtractedDescriptionData {
  if (!rawDesc || typeof rawDesc !== "string" || !rawDesc.trim()) {
    return {
      cleanedText: "",
      cleanSubtitle: "",
      extractedDate: null,
      extractedDeadline: null,
      extractedVenue: null,
      extractedFee: null,
      extractedTeamSize: null,
      extractedAudience: null,
      extractedOrganization: null,
      extractedEventName: null,
      ratingScaleItems: [],
      dynamicSections: [],
      heroMetrics: [],
    };
  }

  // 1. Cleaned text without raw label prefixes (e.g. "FORM DESCRIPTION", "DESCRIPTION:")
  const cleanedText = rawDesc
    .replace(/^FORM\s+DESCRIPTION\s*:?/i, "")
    .replace(/^FORM\s+DETAILS\s*:?/i, "")
    .replace(/^DESCRIPTION\s*:?/i, "")
    .replace(/^ABOUT\s+THIS\s+FORM\s*:?/i, "")
    .trim();

  // 2. Extract Date / Deadlines / Venue / Fee / Team Size
  let extractedDate: string | null = null;
  const dateMatch = cleanedText.match(
    /(?:Date|When|Held on|Commencing|Event Date|Schedule|Time & Date):\s*([^\n\r]+)/i
  );
  if (dateMatch) extractedDate = dateMatch[1].trim();

  let extractedDeadline: string | null = null;
  const deadlineMatch = cleanedText.match(
    /(?:Deadline|Due Date|Last Date|Registration Deadline|Submit Before):\s*([^\n\r]+)/i
  );
  if (deadlineMatch) extractedDeadline = deadlineMatch[1].trim();

  let extractedVenue: string | null = null;
  const venueMatch = cleanedText.match(
    /(?:Venue|Location|Place|Room|Campus|Auditorium|Platform):\s*([^\n\r]+)/i
  );
  if (venueMatch) extractedVenue = venueMatch[1].trim();

  let extractedFee: string | null = null;
  const feeMatch = cleanedText.match(
    /(?:Fee|Registration Fee|Cost|Price|Amount|Entry Fee):\s*([^\n\r]+)/i
  );
  if (feeMatch) extractedFee = feeMatch[1].trim();

  let extractedTeamSize: string | null = null;
  const teamMatch = cleanedText.match(
    /(?:Team Size|Squad Size|Members per Team|Group Size):\s*([^\n\r]+)/i
  );
  if (teamMatch) extractedTeamSize = teamMatch[1].trim();

  // 3. Extract Audience / Greeting (e.g. "Dear Student", "Dear Participants")
  let extractedAudience: string | null = null;
  const audienceMatch = cleanedText.match(/Dear\s+([A-Za-z\s]+?)(?:,|\!|\n)/i);
  if (audienceMatch) {
    extractedAudience = audienceMatch[1].trim();
  }

  // 4. Extract Organization & Event Name
  let extractedOrganization: string | null = null;
  const orgMatch1 = cleanedText.match(/through the ([A-Za-z\s]+?)(?:\.|\n|$)/i);
  const deptMatch = cleanedText.match(/Department of ([A-Za-z\s]+?)(?:\.|\n|$|,)/i);
  const directOrgMatch = cleanedText.match(/(?:Organized by|Organised by|Organization|Host):\s*([^\n\r]+)/i);

  if (directOrgMatch) {
    extractedOrganization = directOrgMatch[1].trim();
  } else if (orgMatch1 && deptMatch) {
    extractedOrganization = `${orgMatch1[1].trim()} • Department of ${deptMatch[1].trim()}`;
  } else if (orgMatch1) {
    extractedOrganization = orgMatch1[1].trim();
  } else if (deptMatch) {
    extractedOrganization = `Department of ${deptMatch[1].trim()}`;
  }

  let extractedEventName: string | null = null;
  const eventMatch = cleanedText.match(/participating in the ([A-Za-z\s–—\-]+?)(?:\.|\n|$)/i);
  if (eventMatch) {
    extractedEventName = eventMatch[1].trim();
  }

  // 5. Extract Rating Scale
  const ratingScaleItems: { title: string; description: string }[] = [];
  const ratingMatch = cleanedText.match(/Rating\s*Scale\s*:?\s*([^\n\r]+(?:\n[^\n\r]+)?)/i);
  if (ratingMatch) {
    const scaleStr = ratingMatch[1].trim();
    const parts = scaleStr.split(/\s*\|\s*/);
    if (parts.length >= 2) {
      for (const p of parts) {
        const clean = p.trim();
        let desc = "Rating evaluation option";
        if (/high|excellent|outstanding|5/i.test(clean)) desc = "Exceeds expectations — excellent session quality, high engagement";
        else if (/moderate|average|good|medium|3|4/i.test(clean)) desc = "Meets expectations — satisfactory coverage, met standard expectations";
        else if (/poor|low|needs improvement|1|2/i.test(clean)) desc = "Needs improvement — below expectations, requires future enhancement";
        ratingScaleItems.push({ title: clean, description: desc });
      }
    }
  }

  // 6. Dynamic Info Sections
  const dynamicSections: DynamicInfoSection[] = [];

  // 6a. Resource Persons / Speakers / Faculty / Dignitaries
  const resourceHeaderMatch = cleanedText.match(
    /(?:Resource\s*Persons?|Speakers?|Organizers?|Faculty|Committee|Guests?|Coordinators?|Dignitaries|Mentors?|Jury|Judges?)\s*:?\s*([\s\S]*?)(?=\n\s*\n[A-Z]|\n\s*Thank you|\n\s*Note:|$|\n\s*Rules:)/i
  );
  if (resourceHeaderMatch) {
    const block = resourceHeaderMatch[1].trim();
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const items: { title: string; description: string }[] = [];
    for (const line of lines) {
      const cleanLine = line.replace(/^[•\-\*\d\.\)]\s*/, "").trim();
      if (!cleanLine || /^thank you/i.test(cleanLine)) continue;
      const parts = cleanLine.split(/\s+[–—\-]\s+|\s*:\s*/);
      if (parts.length >= 2) {
        items.push({
          title: parts[0].trim(),
          description: parts.slice(1).join(" — ").trim(),
        });
      } else {
        items.push({
          title: cleanLine,
          description: "Resource Person / Dignitary",
        });
      }
    }
    if (items.length > 0) {
      dynamicSections.push({
        id: "info_resource_persons",
        type: "resources",
        title: "Distinguished Resource Persons & Dignitaries",
        icon: "award",
        items,
      });
    }
  }

  // 6b. Rating Scale Section
  if (ratingScaleItems.length > 0) {
    dynamicSections.push({
      id: "info_rating_scale",
      type: "rating_guide",
      title: "Rating Scale Guide",
      icon: "star",
      items: ratingScaleItems,
    });
  }

  // 6c. Schedule / Date / Venue Section
  if (extractedDate || extractedVenue || extractedDeadline || extractedFee || extractedTeamSize) {
    const scheduleItems: { title: string; description: string }[] = [];
    if (extractedDate) scheduleItems.push({ title: "Event Date", description: extractedDate });
    if (extractedDeadline) scheduleItems.push({ title: "Submission Deadline", description: extractedDeadline });
    if (extractedVenue) scheduleItems.push({ title: "Venue / Platform", description: extractedVenue });
    if (extractedFee) scheduleItems.push({ title: "Registration Fee", description: extractedFee });
    if (extractedTeamSize) scheduleItems.push({ title: "Team Size", description: extractedTeamSize });

    dynamicSections.push({
      id: "info_event_schedule",
      type: "dates",
      title: "Event Details & Schedule",
      icon: "calendar",
      items: scheduleItems,
    });
  }

  // 6d. Guidelines & Steps Section
  dynamicSections.push({
    id: "info_response_guidelines",
    type: "instructions",
    title: "How to Complete Your Evaluation",
    icon: "book-open",
    items: [
      {
        title: "Step 1: Reflect on Sessions",
        description: "Consider the relevance, technical depth, and speaker presentation quality.",
      },
      {
        title: "Step 2: Select Ratings",
        description: "Choose the rating (High, Moderate, or Poor) that best reflects your honest evaluation.",
      },
      {
        title: "Step 3: Provide Suggestions",
        description: "Use the open text suggestion box to share recommendations for future activities.",
      },
      {
        title: "Step 4: Final Submission",
        description: "Review all required responses marked with * before submitting.",
      },
    ],
  });

  // 7. Clean Subtitle: Synthesize coherent introductory text without truncation
  const paragraphs = cleanedText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => {
      if (!p) return false;
      if (/^Date:\s*/i.test(p)) return false;
      if (/^Dear\s+/i.test(p) && p.length < 35) return false;
      if (/^Rating\s*Scale:/i.test(p)) return false;
      if (/^(?:Resource\s*Persons?|Speakers?|Organizers?|Faculty|Committee|Guests?)/i.test(p)) return false;
      if (/^Thank you for your valuable feedback/i.test(p)) return false;
      return true;
    });

  let cleanSubtitle = "";
  if (paragraphs.length > 0) {
    cleanSubtitle = paragraphs.slice(0, 3).join(" ").replace(/\s+/g, " ").trim();
  } else {
    cleanSubtitle = cleanedText.replace(/\s+/g, " ").trim();
  }

  // 8. Hero Metrics from extracted data
  const heroMetrics: HeroMetric[] = [];
  if (extractedDate) {
    heroMetrics.push({ label: "Event Date", value: extractedDate, detail: "Installation session" });
  }
  if (extractedDeadline) {
    heroMetrics.push({ label: "Deadline", value: extractedDeadline, detail: "Final cutoff" });
  }
  if (extractedFee) {
    heroMetrics.push({ label: "Fee", value: extractedFee, detail: "Registration" });
  }
  if (extractedTeamSize) {
    heroMetrics.push({ label: "Team Size", value: extractedTeamSize, detail: "Per squad" });
  }

  return {
    cleanedText,
    cleanSubtitle,
    extractedDate,
    extractedDeadline,
    extractedVenue,
    extractedFee,
    extractedTeamSize,
    extractedAudience,
    extractedOrganization,
    extractedEventName,
    ratingScaleItems,
    dynamicSections,
    heroMetrics,
  };
}
