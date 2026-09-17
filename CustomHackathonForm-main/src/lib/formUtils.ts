import {
  RegistrationFormData,
  GOOGLE_FORM_MAPPING,
  GOOGLE_FORM_URL,
  GOOGLE_FORM_VIEW_URL,
  AGREEMENT_TEXT,
  TeamSize,
} from "../types";

export function getTeamSizeCount(sizeStr: TeamSize): number {
  const match = sizeStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 2;
}

export function createEmptyFormData(): RegistrationFormData {
  return {
    teamName: "",
    teamSize: "4 Members",
    track: "AI/ML",
    leader: {
      name: "",
      email: "",
      phone: "",
      college: "",
      yearBranch: "",
      github: "",
    },
    members: [
      {
        name: "",
        email: "",
        phone: "",
        college: "",
        roles: ["Frontend"],
      },
      {
        name: "",
        email: "",
        phone: "",
        college: "",
        roles: ["Backend"],
      },
      {
        name: "",
        email: "",
        phone: "",
        college: "",
        roles: ["UI/UX"],
      },
      {
        name: "",
        email: "",
        phone: "",
        college: "",
        roles: ["AI/ML"],
      },
    ],
    agreementAccepted: false,
    transactionId: "",
  };
}

export function createSampleTeamData(): RegistrationFormData {
  return createEmptyFormData();
}

/**
 * Builds the exact key-value mapping for the form payload
 */
export function buildGoogleFormPayload(data: RegistrationFormData): Record<string, string | string[]> {
  const payload: Record<string, string | string[]> = {};

  // Team Basics
  if (data.teamName) payload[GOOGLE_FORM_MAPPING.teamName] = data.teamName;
  if (data.teamSize) payload[GOOGLE_FORM_MAPPING.teamSize] = data.teamSize;
  if (data.track) payload[GOOGLE_FORM_MAPPING.track] = data.track;

  // Leader Details (questions 4 to 9)
  if (data.leader) {
    if (data.leader.name) payload[GOOGLE_FORM_MAPPING.leader.name] = data.leader.name;
    if (data.leader.email) payload[GOOGLE_FORM_MAPPING.leader.email] = data.leader.email;
    if (data.leader.phone) payload[GOOGLE_FORM_MAPPING.leader.phone] = data.leader.phone;
    if (data.leader.college) payload[GOOGLE_FORM_MAPPING.leader.college] = data.leader.college;
    if (data.leader.yearBranch) payload[GOOGLE_FORM_MAPPING.leader.yearBranch] = data.leader.yearBranch;
    if (data.leader.github) payload[GOOGLE_FORM_MAPPING.leader.github] = data.leader.github;
  }

  // Dynamic Members: based on team size, or all available filled members
  const totalCount = getTeamSizeCount(data.teamSize);
  const slotsCount = Math.max(totalCount - 1, data.members ? data.members.length : 0);
  const additionalSlots = Math.min(slotsCount, GOOGLE_FORM_MAPPING.members.length);

  if (data.members && Array.isArray(data.members)) {
    for (let i = 0; i < additionalSlots; i++) {
      const member = data.members[i];
      const mapping = GOOGLE_FORM_MAPPING.members[i];
      if (member && mapping) {
        if (member.name) payload[mapping.name] = member.name;
        if (member.email) payload[mapping.email] = member.email;
        if (member.phone) payload[mapping.phone] = member.phone;
        if (member.college) payload[mapping.college] = member.college;
        // Roles are checkboxes, passed as multiple values or array of strings
        if (member.roles && member.roles.length > 0) {
          payload[mapping.roles] = member.roles;
        }
        if (mapping.github && member.github) {
          payload[mapping.github] = member.github;
        }
      }
    }
  }

  // Payment and Verification
  if (data.transactionId) {
    payload[GOOGLE_FORM_MAPPING.transactionId] = data.transactionId;
  }
  if (data.screenshotUrl) {
    payload[GOOGLE_FORM_MAPPING.paymentScreenshot] = data.screenshotUrl;
  }

  // Agreement
  if (data.agreementAccepted) {
    payload[GOOGLE_FORM_MAPPING.agreement] = AGREEMENT_TEXT;
  }

  // Mandatory Google Form parameters for multi-page forms (7 pages: 0 to 6)
  payload["fvv"] = "1";
  payload["pageHistory"] = "0,1,2,3,4,5,6";

  return payload;
}

/**
 * Parses any pre-filled Google Form URL into structured RegistrationFormData
 */
export function parsePrefilledGoogleFormUrl(urlOrQuery: string): Partial<RegistrationFormData> {
  let params: URLSearchParams;
  try {
    if (urlOrQuery.includes("?")) {
      const u = new URL(urlOrQuery);
      params = u.searchParams;
    } else {
      params = new URLSearchParams(urlOrQuery);
    }
  } catch {
    params = new URLSearchParams(urlOrQuery);
  }

  const result: Partial<RegistrationFormData> = {};

  const teamName = params.get(GOOGLE_FORM_MAPPING.teamName);
  if (teamName) result.teamName = teamName;

  const teamSize = params.get(GOOGLE_FORM_MAPPING.teamSize);
  if (teamSize && (teamSize.includes("2") || teamSize.includes("3") || teamSize.includes("4") || teamSize.includes("5"))) {
    result.teamSize = teamSize as any;
  }

  const track = params.get(GOOGLE_FORM_MAPPING.track);
  if (track) result.track = track as any;

  // Leader
  const leaderName = params.get(GOOGLE_FORM_MAPPING.leader.name);
  const leaderEmail = params.get(GOOGLE_FORM_MAPPING.leader.email);
  const leaderPhone = params.get(GOOGLE_FORM_MAPPING.leader.phone);
  const leaderCollege = params.get(GOOGLE_FORM_MAPPING.leader.college);
  const leaderYearBranch = params.get(GOOGLE_FORM_MAPPING.leader.yearBranch);
  const leaderGithub = params.get(GOOGLE_FORM_MAPPING.leader.github);

  if (leaderName || leaderEmail || leaderPhone || leaderCollege || leaderYearBranch || leaderGithub) {
    result.leader = {
      name: leaderName || "",
      email: leaderEmail || "",
      phone: leaderPhone || "",
      college: leaderCollege || "",
      yearBranch: leaderYearBranch || "",
      github: leaderGithub || "",
    };
  }

  // Members
  const parsedMembers: any[] = [];
  for (let i = 0; i < GOOGLE_FORM_MAPPING.members.length; i++) {
    const mapping = GOOGLE_FORM_MAPPING.members[i];
    const name = params.get(mapping.name);
    const email = params.get(mapping.email);
    const phone = params.get(mapping.phone);
    const college = params.get(mapping.college);
    const roles = params.getAll(mapping.roles);
    const github = mapping.github ? params.get(mapping.github) || undefined : undefined;

    if (name || email || phone || college || roles.length > 0) {
      parsedMembers.push({
        name: name || "",
        email: email || "",
        phone: phone || "",
        college: college || "",
        roles: roles.length > 0 ? roles : ["Frontend"],
        github,
      });
    }
  }

  if (parsedMembers.length > 0) {
    result.members = parsedMembers;
  }

  const agreement = params.get(GOOGLE_FORM_MAPPING.agreement);
  if (agreement && agreement.includes("agree")) {
    result.agreementAccepted = true;
  }

  return result;
}

/**
 * Generates the Google Forms prefilled link for user inspection
 */
export function generatePrefilledGoogleFormUrl(data: RegistrationFormData): string {
  const payload = buildGoogleFormPayload(data);
  const params = new URLSearchParams();
  params.append("usp", "pp_url");

  for (const [key, value] of Object.entries(payload)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.append(key, value);
    }
  }

  return `${GOOGLE_FORM_VIEW_URL}?${params.toString()}`;
}

/**
 * Validates registration data
 */
export function validateRegistrationData(data: RegistrationFormData): {
  isValid: boolean;
  errors: Record<string, string>;
  missingFields: string[];
} {
  const errors: Record<string, string> = {};
  const missingFields: string[] = [];

  // Team Size Rule: strictly 2 to 5
  const totalCount = getTeamSizeCount(data.teamSize);
  if (totalCount < 2 || totalCount > 5) {
    errors.teamSize = "Total team size must be strictly between 2 and 5 members.";
    missingFields.push("Valid Team Size (2-5)");
  }

  if (!data.teamName.trim()) {
    errors.teamName = "Team name is required.";
    missingFields.push("Team Name");
  }

  if (!data.track) {
    errors.track = "Hackathon theme is required.";
    missingFields.push("Hackathon Theme");
  }

  // Leader validation
  if (!data.leader.name.trim()) {
    errors["leader.name"] = "Leader name is required.";
    missingFields.push("Leader Name");
  }
  if (!data.leader.email.trim() || !/\S+@\S+\.\S+/.test(data.leader.email)) {
    errors["leader.email"] = "Valid leader email is required for hackathon communications.";
    missingFields.push("Leader Email");
  }
  if (!data.leader.phone.trim() || data.leader.phone.replace(/\D/g, "").length < 7) {
    errors["leader.phone"] = "Valid leader contact number is required.";
    missingFields.push("Leader Phone");
  }
  if (!data.leader.college.trim()) {
    errors["leader.college"] = "Leader college or organization is required.";
    missingFields.push("Leader College");
  }

  // Member validation
  const memberSlots = totalCount - 1;
  for (let i = 0; i < memberSlots; i++) {
    const m = data.members[i];
    const memberNum = i + 2;
    if (!m || !m.name.trim()) {
      errors[`member_${i}_name`] = `Member ${memberNum} name is required.`;
      missingFields.push(`Member ${memberNum} Name`);
    }
    if (!m || !m.email.trim() || !/\S+@\S+\.\S+/.test(m.email)) {
      errors[`member_${i}_email`] = `Member ${memberNum} valid email is required.`;
      missingFields.push(`Member ${memberNum} Email`);
    }
    if (!m || m.roles.length === 0) {
      errors[`member_${i}_roles`] = `Select at least one role for Member ${memberNum}.`;
      missingFields.push(`Member ${memberNum} Role(s)`);
    }
  }

  // Step 4: Payment and Verification validation
  if (!data.transactionId || !data.transactionId.trim()) {
    errors.transactionId = "Transaction ID / UTR Number is required.";
    missingFields.push("Transaction ID / UTR Number");
  }

  if (!data.screenshotBase64 && !data.screenshotUrl) {
    errors.screenshot = "Payment screenshot is required.";
    missingFields.push("Payment Screenshot");
  }

  if (!data.agreementAccepted) {
    errors.agreement = "You must confirm agreement with the hackathon rules and code of conduct.";
    missingFields.push("Event Rules Agreement");
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    missingFields,
  };
}

/**
 * Submits the registration payload to the backend proxy
 */
export async function submitRegistration(data: RegistrationFormData): Promise<{
  success: boolean;
  message: string;
  formBodyPreview?: string;
  formEntries?: Record<string, any>;
  status?: number;
  imageUrl?: string;
  errorType?: string;
  details?: string;
  fixSteps?: string[];
}> {
  try {
    // Call the backend proxy route (/api/submit) with the entire formData payload
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: data }),
    });

    const contentType = res.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const rawText = await res.text();
      console.warn("Received non-JSON response from server:", res.status, rawText.slice(0, 150));

      if (
        res.status === 404 ||
        rawText.includes("The page could not be found") ||
        rawText.includes("Cannot POST")
      ) {
        return {
          success: false,
          status: res.status,
          errorType: "API_ROUTE_NOT_FOUND",
          message:
            "The backend submission API route was not found on this deployment. Please verify that /api/submit.ts and vercel.json are committed to your repository.",
        };
      }

      return {
        success: false,
        status: res.status,
        message: `The server returned an unexpected response (status ${res.status}).`,
      };
    }

    const result = await res.json();
    return result;
  } catch (err: any) {
    console.error("Submission error:", err);
    return {
      success: false,
      message:
        err?.message ||
        "Failed to submit registration. Please check your network connection.",
    };
  }
}

/**
 * Direct browser-session submission fallback.
 * If the Google Form requires Google Sign-In and the server cannot authenticate on the user's behalf,
 * this function creates a temporary form in the DOM and submits directly to Google Form with target="_blank"
 * using the user's active browser Google session!
 */
export function submitViaBrowserSession(payload: Record<string, any>) {
  const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSeRFa5VajjvUkuadDfiJU5R9tz94V86hwKSLfiGmNmJ2ehg9g/formResponse";

  const form = document.createElement("form");
  form.method = "POST";
  form.action = GOOGLE_FORM_URL;
  form.target = "_blank";

  for (const [key, value] of Object.entries(payload)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== "") {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(item);
          form.appendChild(input);
        }
      }
    } else if (value !== undefined && value !== null && value !== "") {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    }
  }

  // Ensure pageHistory and fvv are included
  if (!payload.pageHistory) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "pageHistory";
    input.value = "0,1,2,3,4,5,6";
    form.appendChild(input);
  }
  if (!payload.fvv) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "fvv";
    input.value = "1";
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  setTimeout(() => {
    try {
      document.body.removeChild(form);
    } catch (e) {
      // ignore
    }
  }, 1000);
}
