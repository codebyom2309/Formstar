import { RegistrationFormData, TeamSize } from "../types";

export interface StepValidationResult {
  isValid: boolean;
  message?: string;
  firstErrorFieldId?: string;
  errorMemberIndex?: number;
}

export function getMemberCountFromSize(teamSize: TeamSize): number {
  const match = teamSize.match(/\d+/);
  return match ? parseInt(match[0], 10) : 4;
}

/**
 * Validates a specific step in the registration process
 */
export function validateStep(
  step: number,
  data: RegistrationFormData
): StepValidationResult {
  if (step === 1) {
    if (!data.teamName || !data.teamName.trim()) {
      return {
        isValid: false,
        message: "Please enter a valid Team Name.",
        firstErrorFieldId: "teamName",
      };
    }
    if (!data.track) {
      return {
        isValid: false,
        message: "Please select a competition theme.",
        firstErrorFieldId: "theme-select-ai-ml",
      };
    }
    const count = getMemberCountFromSize(data.teamSize);
    if (count < 2 || count > 5) {
      return {
        isValid: false,
        message: "Total team size must be strictly between 2 and 5 members.",
        firstErrorFieldId: "team-size-option-2",
      };
    }
    return { isValid: true };
  }

  if (step === 2) {
    const l = data.leader;
    if (!l.name || !l.name.trim()) {
      return {
        isValid: false,
        message: "Leader Full Name is required.",
        firstErrorFieldId: "leaderName",
      };
    }
    if (!l.email || !l.email.trim() || !/\S+@\S+\.\S+/.test(l.email)) {
      return {
        isValid: false,
        message: "Valid Leader Email address is required.",
        firstErrorFieldId: "leaderEmail",
      };
    }
    const cleanPhone = l.phone ? l.phone.replace(/\D/g, "") : "";
    if (!l.phone || cleanPhone.length < 10) {
      return {
        isValid: false,
        message: "Leader 10-digit Phone Number is required.",
        firstErrorFieldId: "leaderPhone",
      };
    }
    if (!l.college || !l.college.trim()) {
      return {
        isValid: false,
        message: "Leader College / Institute is required.",
        firstErrorFieldId: "leaderCollege",
      };
    }
    return { isValid: true };
  }

  if (step === 3) {
    const totalCount = getMemberCountFromSize(data.teamSize);
    const requiredTeammates = totalCount - 1;

    for (let i = 0; i < requiredTeammates; i++) {
      const m = data.members[i];
      const memberNum = i + 2;

      if (!m || !m.name || !m.name.trim()) {
        return {
          isValid: false,
          message: `Member ${memberNum} Name is required.`,
          firstErrorFieldId: `member-${i}-name`,
          errorMemberIndex: i,
        };
      }
      if (!m.email || !m.email.trim() || !/\S+@\S+\.\S+/.test(m.email)) {
        return {
          isValid: false,
          message: `Member ${memberNum} Valid Email is required.`,
          firstErrorFieldId: `member-${i}-email`,
          errorMemberIndex: i,
        };
      }
      const memberCleanPhone = m.phone ? m.phone.replace(/\D/g, "") : "";
      if (!m.phone || memberCleanPhone.length < 10) {
        return {
          isValid: false,
          message: `Member ${memberNum} 10-digit Phone Number is required.`,
          firstErrorFieldId: `member-${i}-phone`,
          errorMemberIndex: i,
        };
      }
      if (!m.college || !m.college.trim()) {
        return {
          isValid: false,
          message: `Member ${memberNum} College is required.`,
          firstErrorFieldId: `member-${i}-college`,
          errorMemberIndex: i,
        };
      }
      if (!m.roles || m.roles.length === 0) {
        return {
          isValid: false,
          message: `Select at least one role for Member ${memberNum}.`,
          firstErrorFieldId: `member-role-frontend`,
          errorMemberIndex: i,
        };
      }
    }
    return { isValid: true };
  }

  if (step === 4) {
    if (!data.transactionId || !data.transactionId.trim()) {
      return {
        isValid: false,
        message: "Payment Transaction ID / UTR number is required.",
        firstErrorFieldId: "transactionId",
      };
    }
    if (!data.screenshotBase64 && !data.screenshotUrl) {
      return {
        isValid: false,
        message: "Payment receipt screenshot is required.",
        firstErrorFieldId: "payment-upload-dropzone",
      };
    }
    if (!data.agreementAccepted) {
      return {
        isValid: false,
        message: "Please agree to the HackX rules and code of conduct.",
        firstErrorFieldId: "agreementAccepted",
      };
    }
    return { isValid: true };
  }

  return { isValid: true };
}

/**
 * Determines if a given member index in Step 3 has all required fields filled
 */
export function isMemberComplete(member: any): boolean {
  if (!member) return false;
  const hasName = Boolean(member.name && member.name.trim().length > 0);
  const hasEmail = Boolean(
    member.email && member.email.trim().length > 0 && /\S+@\S+\.\S+/.test(member.email)
  );
  const hasPhone = Boolean(
    member.phone && member.phone.replace(/\D/g, "").length >= 10
  );
  const hasCollege = Boolean(member.college && member.college.trim().length > 0);
  const hasRoles = Boolean(member.roles && member.roles.length > 0);

  return hasName && hasEmail && hasPhone && hasCollege && hasRoles;
}

/**
 * Smoothly scrolls to, focuses (on desktop only), and applies an error shake animation to a field
 * Mobile ergonomics: does NOT trigger .focus() on mobile to prevent virtual keyboard from covering context
 */
export function focusAndHighlightField(fieldId: string): boolean {
  if (typeof document === "undefined") return false;
  const el = document.getElementById(fieldId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // CRITICAL MOBILE BEHAVIOR:
    // Do NOT call .focus() directly on text inputs on mobile devices (< 768px or pointer: coarse).
    // Focusing a text input on mobile triggers the on-screen virtual keyboard,
    // which abruptly resizes the viewport and covers the validation context.
    const isMobile =
      (typeof window !== "undefined" && window.innerWidth < 768) ||
      (typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(pointer: coarse)").matches);

    if (!isMobile && typeof el.focus === "function") {
      el.focus();
    }

    el.classList.add("animate-shake", "ring-2", "ring-rose-500", "border-rose-500");
    setTimeout(() => {
      el.classList.remove("animate-shake", "ring-2", "ring-rose-500", "border-rose-500");
    }, 1400);
    return true;
  }
  return false;
}

export interface FormCompletionMetrics {
  totalRequired: number;
  validCount: number;
  percentage: number;
  status: string;
  statusType: "drafting" | "ready" | "awaiting";
  isSteps123Valid: boolean;
  isPaymentAttached: boolean;
  mandatoryPayment: {
    transactionId: boolean;
    screenshot: boolean;
    agreement: boolean;
    missingCount: number;
    items: Array<{
      id: string;
      fieldId: string;
      label: string;
      isComplete: boolean;
    }>;
  };
}

/**
 * Calculates live completion metrics across all form steps for the Digital Pass
 */
export function getFormCompletionMetrics(data: RegistrationFormData): FormCompletionMetrics {
  const teamSizeNum = getMemberCountFromSize(data.teamSize);
  const teammateCount = Math.max(1, teamSizeNum - 1);

  // Field validation checks
  const checks: boolean[] = [];

  // Step 1: Team Name, Theme, Team Size
  checks.push(Boolean(data.teamName && data.teamName.trim().length > 0));
  checks.push(Boolean(data.track));
  checks.push(Boolean(teamSizeNum >= 2 && teamSizeNum <= 5));

  // Step 2: Leader Name, Email, Phone, College
  const l = data.leader;
  checks.push(Boolean(l.name && l.name.trim().length > 0));
  checks.push(Boolean(l.email && l.email.trim().length > 0 && /\S+@\S+\.\S+/.test(l.email)));
  const cleanLeaderPhone = l.phone ? l.phone.replace(/\D/g, "") : "";
  checks.push(Boolean(cleanLeaderPhone.length >= 10));
  checks.push(Boolean(l.college && l.college.trim().length > 0));

  // Step 3: Each required teammate (Name, Email, Phone, College, Roles)
  for (let i = 0; i < teammateCount; i++) {
    const m = data.members[i];
    checks.push(Boolean(m && m.name && m.name.trim().length > 0));
    checks.push(Boolean(m && m.email && m.email.trim().length > 0 && /\S+@\S+\.\S+/.test(m.email)));
    const cleanMemberPhone = m?.phone ? m.phone.replace(/\D/g, "") : "";
    checks.push(Boolean(cleanMemberPhone.length >= 10));
    checks.push(Boolean(m && m.college && m.college.trim().length > 0));
    checks.push(Boolean(m && m.roles && m.roles.length > 0));
  }

  // Step 4: Payment requirements
  const hasTxn = Boolean(data.transactionId && data.transactionId.trim().length > 0);
  const hasScreenshot = Boolean(data.screenshotBase64 || data.screenshotUrl);
  const hasAgreement = Boolean(data.agreementAccepted);

  checks.push(hasTxn);
  checks.push(hasScreenshot);
  checks.push(hasAgreement);

  const totalRequired = checks.length;
  const validCount = checks.filter(Boolean).length;
  const percentage = totalRequired > 0 ? Math.round((validCount / totalRequired) * 100) : 0;

  // Validation states
  const isStep1Valid = validateStep(1, data).isValid;
  const isStep2Valid = validateStep(2, data).isValid;
  const isStep3Valid = validateStep(3, data).isValid;
  const isSteps123Valid = isStep1Valid && isStep2Valid && isStep3Valid;

  const isPaymentAttached = hasTxn && hasScreenshot;

  let status: string;
  let statusType: "drafting" | "ready" | "awaiting";

  if (hasTxn && hasScreenshot && hasAgreement) {
    status = "Awaiting Verification";
    statusType = "awaiting";
  } else if (isSteps123Valid) {
    status = "Ready for Payment";
    statusType = "ready";
  } else {
    status = `Drafting (${percentage}%)`;
    statusType = "drafting";
  }

  const paymentItems = [
    {
      id: "txn",
      fieldId: "transactionId",
      label: "Transaction ID / UTR Number",
      isComplete: hasTxn,
    },
    {
      id: "screenshot",
      fieldId: "payment-upload-dropzone",
      label: "Payment Screenshot",
      isComplete: hasScreenshot,
    },
    {
      id: "agreement",
      fieldId: "agreementAccepted",
      label: "Event Rules Agreement",
      isComplete: hasAgreement,
    },
  ];

  const missingPaymentCount = paymentItems.filter((item) => !item.isComplete).length;

  return {
    totalRequired,
    validCount,
    percentage,
    status,
    statusType,
    isSteps123Valid,
    isPaymentAttached,
    mandatoryPayment: {
      transactionId: hasTxn,
      screenshot: hasScreenshot,
      agreement: hasAgreement,
      missingCount: missingPaymentCount,
      items: paymentItems,
    },
  };
}

/**
 * Normalization helpers
 */
export function normalizeEmail(email: string): string {
  return email.trim();
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(0, 10);
}

export function normalizeGithub(handle: string): string {
  if (!handle) return "";
  let clean = handle.trim();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "");
  clean = clean.replace(/^@+/, "");
  clean = clean.replace(/\/+$/, "");
  return clean.trim();
}
