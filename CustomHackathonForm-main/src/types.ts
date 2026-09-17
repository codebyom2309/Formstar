export type TeamSize = "2 Members" | "3 Members" | "4 Members" | "5 Members";

export type Track = "AI/ML" | "Web3" | "Smart Cities" | "HealthTech" | "Open Innovation";
export type Theme = Track;

export interface ThemeMeta {
  name: Theme;
  colorClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  glowColor: string;
  accentGradient: string;
}

export type MemberRole =
  | "Frontend"
  | "Backend"
  | "UI/UX"
  | "AI/ML"
  | "Mobile Dev"
  | "Hardware/IoT";

export interface LeaderDetails {
  name: string;
  email: string;
  phone: string;
  college: string;
  yearBranch: string;
  github: string;
}

export interface MemberDetails {
  name: string;
  email: string;
  phone: string;
  college: string;
  roles: MemberRole[];
  github?: string;
}

export interface RegistrationFormData {
  teamName: string;
  teamSize: TeamSize;
  track: Track;
  leader: LeaderDetails;
  members: MemberDetails[]; // Length must equal teamSizeNum - 1
  agreementAccepted: boolean;
  transactionId: string;
  screenshotBase64?: string;
  screenshotFileName?: string;
  screenshotFileSize?: number;
  screenshotUrl?: string;
}

export interface GoogleFormMappingDef {
  teamName: string;
  teamSize: string;
  track: string;
  leader: {
    name: string;
    email: string;
    phone: string;
    college: string;
    yearBranch: string;
    github: string;
  };
  members: Array<{
    name: string;
    email: string;
    phone: string;
    college: string;
    roles: string;
    github?: string;
  }>;
  agreement: string;
  transactionId: string;
  paymentScreenshot: string;
}

export const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeRFa5VajjvUkuadDfiJU5R9tz94V86hwKSLfiGmNmJ2ehg9g/formResponse";

export const GOOGLE_FORM_VIEW_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeRFa5VajjvUkuadDfiJU5R9tz94V86hwKSLfiGmNmJ2ehg9g/viewform";

export const AGREEMENT_TEXT =
  "I agree to adhere to the event rules, hackathon code of conduct, and terms of participation";

export const GOOGLE_FORM_MAPPING: GoogleFormMappingDef = {
  teamName: "entry.2117236276",
  teamSize: "entry.1477679129",
  track: "entry.1515561563",
  leader: {
    name: "entry.503010795",
    email: "entry.1621889209",
    phone: "entry.895352131",
    college: "entry.415838441",
    yearBranch: "entry.378728112",
    github: "entry.1213909106",
  },
  members: [
    // Member 2 (1st teammate)
    {
      name: "entry.923772706",
      email: "entry.1580529153",
      phone: "entry.2096590016",
      college: "entry.377841343",
      roles: "entry.779626043",
      github: "entry.300716458",
    },
    // Member 3 (2nd teammate)
    {
      name: "entry.2111927725",
      email: "entry.544991285",
      phone: "entry.1109240396",
      college: "entry.86084976",
      roles: "entry.1073037229",
    },
    // Member 4 (3rd teammate)
    {
      name: "entry.392308128",
      email: "entry.1998078112",
      phone: "entry.714102987",
      college: "entry.193683130",
      roles: "entry.1867574719",
    },
    // Member 5 (4th teammate)
    {
      name: "entry.759427974",
      email: "entry.478923217",
      phone: "entry.798553852",
      college: "entry.1326242421",
      roles: "entry.876894209",
    },
  ],
  agreement: "entry.1123445393",
  transactionId: "entry.894717276",
  paymentScreenshot: "entry.1062878204",
};

export const TRACK_OPTIONS: Track[] = [
  "AI/ML",
  "Web3",
  "Smart Cities",
  "HealthTech",
  "Open Innovation",
];

export const THEME_OPTIONS: Theme[] = TRACK_OPTIONS;

export const THEME_METADATA_MAP: Record<Theme, ThemeMeta> = {
  "AI/ML": {
    name: "AI/ML",
    colorClass: "violet",
    badgeBg: "bg-violet-500/15 dark:bg-violet-500/20",
    badgeBorder: "border-violet-500/30 dark:border-violet-500/40",
    badgeText: "text-violet-700 dark:text-violet-300",
    glowColor: "rgba(139, 92, 246, 0.35)",
    accentGradient: "from-violet-600 to-indigo-600",
  },
  "Web3": {
    name: "Web3",
    colorClass: "emerald",
    badgeBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    badgeBorder: "border-emerald-500/30 dark:border-emerald-500/40",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    glowColor: "rgba(16, 185, 129, 0.35)",
    accentGradient: "from-emerald-600 to-teal-600",
  },
  "Smart Cities": {
    name: "Smart Cities",
    colorClass: "sky",
    badgeBg: "bg-sky-500/15 dark:bg-sky-500/20",
    badgeBorder: "border-sky-500/30 dark:border-sky-500/40",
    badgeText: "text-sky-700 dark:text-sky-300",
    glowColor: "rgba(14, 165, 233, 0.35)",
    accentGradient: "from-cyan-500 to-blue-600",
  },
  "HealthTech": {
    name: "HealthTech",
    colorClass: "rose",
    badgeBg: "bg-rose-500/15 dark:bg-rose-500/20",
    badgeBorder: "border-rose-500/30 dark:border-rose-500/40",
    badgeText: "text-rose-700 dark:text-rose-300",
    glowColor: "rgba(244, 63, 94, 0.35)",
    accentGradient: "from-rose-500 to-pink-600",
  },
  "Open Innovation": {
    name: "Open Innovation",
    colorClass: "amber",
    badgeBg: "bg-amber-500/15 dark:bg-amber-500/20",
    badgeBorder: "border-amber-500/30 dark:border-amber-500/40",
    badgeText: "text-amber-700 dark:text-amber-300",
    glowColor: "rgba(245, 158, 11, 0.35)",
    accentGradient: "from-amber-500 to-orange-600",
  },
};

export const TEAM_SIZE_OPTIONS: TeamSize[] = [
  "2 Members",
  "3 Members",
  "4 Members",
  "5 Members",
];

export const ROLE_OPTIONS: MemberRole[] = [
  "Frontend",
  "Backend",
  "UI/UX",
  "AI/ML",
  "Mobile Dev",
  "Hardware/IoT",
];

export const OFFICIAL_WHATSAPP_GROUP_LINK =
  "https://chat.whatsapp.com/Cmh1MBBS112AY0sOplyBrh?s=cl&p=a&mlu=4&ilr=4";

export function getMemberCountFromSize(teamSize: TeamSize | string): number {
  const match = teamSize.match(/\d+/);
  return match ? parseInt(match[0], 10) : 4;
}

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  step?: 1 | 2 | 3 | 4;
  quickActions?: {
    label: string;
    value: string;
    actionType: "setTrack" | "setSize" | "nextStep" | "setRole" | "fillSample";
  }[];
  customCard?: "teamBasics" | "leaderForm" | "memberForm" | "confirmationCard" | "errorCard";
}
