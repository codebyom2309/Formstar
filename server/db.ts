import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";
import { FormConfig, FormRecord, User } from "../src/types";

export interface DatabaseAdapter {
  query: (sql: string, params?: any[]) => Promise<[any, any]>;
  getConnection: () => Promise<{
    query: (sql: string, params?: any[]) => Promise<any>;
    release: () => void;
  }>;
  isMock: boolean;
}

const DEFAULT_USER: User = {
  id: "user_google_98234",
  name: "Alex Rivera",
  email: "alex.rivera@gmail.com",
  image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
};

const SEED_HACKATHON_CONFIG: FormConfig = {
  meta: {
    title: "Nagpur Hackathon 2026 Registration",
    description: "Official registration portal for HackX 2026: Central India's Premier Hackathon. Complete all steps to register your team.",
    targetActionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeRFa5VajjvUkuadDfiJU5R9tz94V86hwKSLfiGmNmJ2ehg9g/formResponse",
    bannerImageUrl: "",
    logoUrl: "",
    confirmationTitle: "Registration Confirmed!",
    confirmationMessage: "Thank you for registering for HackX 2026. Join the official participants group for updates.",
    whatsappGroupUrl: "https://chat.whatsapp.com/demo-hackx-2026",
  },
  theme: {
    primaryColor: "#7c3aed",
    backgroundColor: "#f8fafc",
    borderRadius: "rounded-xl",
    fontFamily: "Plus Jakarta Sans",
  },
  steps: [
    {
      id: "step-1",
      title: "Step 1: Team Basics",
      description: "Team identification and problem track selection",
      cards: [
        {
          id: "card-team-basics",
          title: "Team Identification",
          description: "Choose a distinctive team name and select your track",
          fields: [
            {
              id: "f_team_name",
              entryCode: "entry.2117236276",
              label: "Team Name",
              placeholder: "e.g. ByteCraft Innovators",
              type: "text",
              required: true,
              helpText: "Must be unique across all registered teams",
            },
            {
              id: "f_team_size",
              entryCode: "entry.1477679129",
              label: "Team Size (including Team Leader)",
              type: "radio",
              required: true,
              options: ["2 Members", "3 Members", "4 Members", "5 Members"],
              optionLayout: "grid-2",
            },
            {
              id: "f_track",
              entryCode: "entry.1515561563",
              label: "Hackathon Problem Track",
              type: "dropdown",
              required: true,
              options: [
                "AI & Intelligent Systems",
                "Web3 & Decentralized Technologies",
                "Healthcare & Assistive MedTech",
                "Smart Cities, IoT & Sustainability",
                "Open Innovation & Fintech",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "step-2",
      title: "Step 2: Team Leader Details",
      description: "Primary point of contact for team correspondence",
      cards: [
        {
          id: "card-leader-info",
          title: "Leader Contact & Academic Information",
          description: "All official communication will be sent to this email and phone",
          fields: [
            {
              id: "f_leader_name",
              entryCode: "entry.503010795",
              label: "Leader Full Name",
              placeholder: "e.g. Rahul Sharma",
              type: "text",
              required: true,
            },
            {
              id: "f_leader_email",
              entryCode: "entry.1621889209",
              label: "Leader Email Address",
              placeholder: "rahul.sharma@college.edu",
              type: "text",
              validationType: "email",
              required: true,
            },
            {
              id: "f_leader_phone",
              entryCode: "entry.895352131",
              label: "WhatsApp / Contact Phone Number",
              placeholder: "+91 98765 43210",
              type: "text",
              validationType: "phone",
              required: true,
            },
            {
              id: "f_leader_college",
              entryCode: "entry.415838441",
              label: "College / Institute Name",
              placeholder: "e.g. VNIT Nagpur",
              type: "text",
              required: true,
            },
            {
              id: "f_leader_year_branch",
              entryCode: "entry.378728112",
              label: "Year of Study & Engineering Branch",
              placeholder: "e.g. 3rd Year, Computer Science & Engineering",
              type: "text",
              required: true,
            },
            {
              id: "f_leader_github",
              entryCode: "entry.1213909106",
              label: "GitHub / Portfolio Profile Link",
              placeholder: "https://github.com/rahulsharma",
              type: "text",
              validationType: "url",
              required: false,
            },
            {
              id: "f_leader_roles",
              entryCode: "entry.779626043",
              label: "Leader Technical Specialization",
              type: "checkbox",
              required: true,
              options: ["Frontend Development", "Backend & APIs", "AI / Machine Learning", "UI / UX Design", "DevOps & Cloud"],
              optionLayout: "grid-2",
            },
          ],
        },
      ],
    },
    {
      id: "step-3",
      title: "Step 3: Team Members",
      description: "Details for participating team members",
      cards: [
        {
          id: "card-member-2",
          title: "Member 2 Details",
          description: "Required for all team sizes",
          fields: [
            {
              id: "f_m2_name",
              entryCode: "entry.923772706",
              label: "Member 2 Full Name",
              placeholder: "e.g. Ananya Verma",
              type: "text",
              required: true,
            },
            {
              id: "f_m2_email",
              entryCode: "entry.1580529153",
              label: "Member 2 Email Address",
              placeholder: "ananya.verma@college.edu",
              type: "text",
              validationType: "email",
              required: true,
            },
            {
              id: "f_m2_phone",
              entryCode: "entry.2096590016",
              label: "Member 2 Contact Phone",
              placeholder: "+91 98765 12345",
              type: "text",
              validationType: "phone",
              required: true,
            },
            {
              id: "f_m2_college",
              entryCode: "entry.377841343",
              label: "Member 2 College Name",
              placeholder: "e.g. VNIT Nagpur",
              type: "text",
              required: true,
            },
          ],
        },
        {
          id: "card-member-3",
          title: "Member 3 Details",
          description: "Applicable if team size is 3 or more",
          fields: [
            {
              id: "f_m3_name",
              entryCode: "entry.2111927725",
              label: "Member 3 Full Name",
              placeholder: "e.g. Devansh Patel",
              type: "text",
              required: false,
            },
            {
              id: "f_m3_email",
              entryCode: "entry.544991285",
              label: "Member 3 Email Address",
              placeholder: "devansh.patel@college.edu",
              type: "text",
              validationType: "email",
              required: false,
            },
            {
              id: "f_m3_phone",
              entryCode: "entry.1109240396",
              label: "Member 3 Contact Phone",
              placeholder: "+91 98765 67890",
              type: "text",
              validationType: "phone",
              required: false,
            },
            {
              id: "f_m3_college",
              entryCode: "entry.86084976",
              label: "Member 3 College Name",
              placeholder: "e.g. VNIT Nagpur",
              type: "text",
              required: false,
            },
          ],
        },
      ],
    },
    {
      id: "step-4",
      title: "Step 4: Payment & Verification",
      description: "UPI payment verification and terms agreement",
      cards: [
        {
          id: "card-payment",
          title: "Registration Fee & Verification",
          description: "Pay the registration fee using UPI and enter the 12-digit UTR number",
          fields: [
            {
              id: "f_utr",
              entryCode: "entry.894717276",
              label: "UPI Transaction Reference / UTR Number",
              placeholder: "e.g. 412345678901",
              type: "text",
              required: true,
              helpText: "Enter the 12-digit reference number from Google Pay / PhonePe / Paytm",
            },
            {
              id: "f_screenshot",
              entryCode: "entry.1062878204",
              label: "Payment Screenshot Receipt",
              type: "upload",
              required: false,
              helpText: "Upload transaction confirmation screenshot for priority desk verification",
            },
            {
              id: "f_agreement",
              entryCode: "entry.1123445393",
              label: "Participation Agreement & Code of Conduct",
              type: "checkbox",
              required: true,
              options: [
                "I agree to adhere to the event rules, hackathon code of conduct, and terms of participation",
              ],
            },
          ],
        },
      ],
    },
  ],
  payment: {
    enabled: true,
    upiId: "hackx@upi",
    payeeName: "Nagpur Hackathon 2026",
    amount: 350,
    note: "HackX 2026 Team Registration Fee",
    qrCodeUrl: "/images/payment_qr.png",
    transactionEntryCode: "entry.894717276",
    screenshotEntryCode: "entry.1062878204",
  },
  overviewRules: {
    title: "HackX 2026 - Nagpur Hackathon",
    organization: "Nagpur Developers Community & Tech Foundation",
    badge: "Official Registration",
    location: "VNIT Campus, Nagpur, Maharashtra",
    commencement: "April 18-19, 2026",
    fee: "₹350 / team",
    teamSize: "2-5 Members",
    deadline: "April 10, 2026",
    guidelines: [
      "All registered teams must check in at the registration desk by 08:30 AM on April 18.",
      "All team members must carry valid student or institutional ID cards.",
      "Projects must be built during the 36-hour hackathon period; pre-existing source code is not permitted.",
      "Continuous high-speed Wi-Fi, mentorship sessions, food, and refreshments are provided.",
    ],
    contacts: [
      { role: "Event Lead", name: "Vikram Malhotra", phone: "+91 98230 11223", email: "lead@hackx2026.org" },
      { role: "Technical Head", name: "Priya Deshmukh", phone: "+91 98230 44556", email: "tech@hackx2026.org" },
    ],
  },
  logic: {
    dynamicTeamMembers: true,
    teamSizeFieldId: "entry.1477679129",
    minMembers: 2,
    maxMembers: 5,
  },
};

const SEED_SURVEY_CONFIG: FormConfig = {
  meta: {
    title: "Developer Feedback & Feature Request",
    description: "Help us shape the NextForm platform roadmap with your insights and feedback.",
    targetActionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdX8-demo-survey/formResponse",
  },
  theme: {
    primaryColor: "#2563eb",
    backgroundColor: "#f8fafc",
    borderRadius: "rounded-xl",
    fontFamily: "Plus Jakarta Sans",
  },
  steps: [
    {
      id: "survey-step-1",
      title: "Step 1: Experience & Workflow",
      cards: [
        {
          id: "survey-card-1",
          title: "Platform Experience",
          fields: [
            {
              id: "f_exp_rating",
              entryCode: "entry.1001",
              label: "How would you rate your experience building multi-step forms?",
              type: "radio",
              options: ["Excellent", "Good", "Average", "Needs Improvement"],
              required: true,
            },
            {
              id: "f_favorite_feature",
              entryCode: "entry.1002",
              label: "Which feature has been most valuable for your workflow?",
              type: "checkbox",
              options: [
                "Google Form automatic schema scraping",
                "Integrated UPI payment QR collection",
                "Conditional step & card branching",
                "Real-time Discord/Slack webhooks",
              ],
              required: true,
            },
          ],
        },
      ],
    },
    {
      id: "survey-step-2",
      title: "Step 2: Roadmap Suggestions",
      cards: [
        {
          id: "survey-card-2",
          title: "Feature Requests",
          fields: [
            {
              id: "f_feature_request",
              entryCode: "entry.2001",
              label: "What capability should we build next?",
              type: "paragraph",
              placeholder: "Describe the integration, tool, or UI feature you'd like to see...",
              required: true,
            },
            {
              id: "f_contact_email",
              entryCode: "entry.2002",
              label: "Your Email (Optional, if open to brief 15-min chat)",
              type: "text",
              validationType: "email",
              required: false,
            },
          ],
        },
      ],
    },
  ],
};

const SEED_FORMS: FormRecord[] = [
  {
    id: "form_hackathon_2026",
    userId: "user_google_98234",
    title: "Nagpur Hackathon 2026 Registration",
    originalGoogleUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeRFa5VajjvUkuadDfiJU5R9tz94V86hwKSLfiGmNmJ2ehg9g/viewform",
    hostedSlug: "hackathon-2026",
    status: "active",
    jsonConfig: SEED_HACKATHON_CONFIG,
    viewsCount: 142,
    submissionsCount: 28,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "form_feedback_survey",
    userId: "user_google_98234",
    title: "Developer Feedback & Feature Request",
    originalGoogleUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdX8-demo-survey/viewform",
    hostedSlug: "feedback",
    status: "active",
    jsonConfig: SEED_SURVEY_CONFIG,
    viewsCount: 89,
    submissionsCount: 15,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// In-Memory state store
class InMemoryDatabase {
  private users: Map<string, User> = new Map();
  private forms: Map<string, FormRecord> = new Map();

  constructor() {
    this.users.set(DEFAULT_USER.id, { ...DEFAULT_USER });
    for (const f of SEED_FORMS) {
      this.forms.set(f.id, { ...f });
    }
  }

  getUser(id: string): User | null {
    return this.users.get(id) || null;
  }

  upsertUser(user: User): void {
    const existing = this.users.get(user.id);
    this.users.set(user.id, {
      ...existing,
      ...user,
    });
  }

  getFormsByUser(userId: string): FormRecord[] {
    const list: FormRecord[] = [];
    for (const f of this.forms.values()) {
      if (f.userId === userId) {
        list.push({ ...f });
      }
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getFormById(id: string): FormRecord | null {
    const f = this.forms.get(id);
    return f ? { ...f } : null;
  }

  getFormBySlug(slug: string): FormRecord | null {
    for (const f of this.forms.values()) {
      if (f.hostedSlug === slug) {
        return { ...f };
      }
    }
    return null;
  }

  insertForm(form: FormRecord): void {
    this.forms.set(form.id, { ...form });
  }

  updateForm(id: string, updates: Partial<FormRecord>): FormRecord | null {
    const existing = this.forms.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.forms.set(id, updated);
    return { ...updated };
  }

  updateFormStatus(id: string, status: "active" | "paused"): boolean {
    const existing = this.forms.get(id);
    if (!existing) return false;
    existing.status = status;
    existing.updatedAt = new Date().toISOString();
    return true;
  }

  incrementFormViews(slug: string): void {
    for (const f of this.forms.values()) {
      if (f.hostedSlug === slug) {
        f.viewsCount = (f.viewsCount || 0) + 1;
        break;
      }
    }
  }

  incrementFormSubmissions(slug: string): void {
    for (const f of this.forms.values()) {
      if (f.hostedSlug === slug) {
        f.submissionsCount = (f.submissionsCount || 0) + 1;
        break;
      }
    }
  }

  deleteForm(id: string): boolean {
    return this.forms.delete(id);
  }

  async handleQuery(sql: string, params: any[] = []): Promise<[any, any]> {
    const norm = sql.trim().replace(/\s+/g, " ");

    // SELECT 1 as val
    if (/SELECT 1/i.test(norm)) {
      return [[{ val: 1 }], []];
    }

    // SELECT id, name, email, image FROM users WHERE id = ?
    if (/SELECT.*FROM users WHERE id = \?/i.test(norm)) {
      const userId = params[0];
      const user = this.getUser(userId);
      return [user ? [user] : [], []];
    }

    // INSERT INTO users ...
    if (/INSERT INTO users/i.test(norm)) {
      const [id, name, email, image] = params;
      this.upsertUser({ id, name, email, image });
      return [{ affectedRows: 1 }, []];
    }

    // SELECT ... FROM forms WHERE user_id = ? ORDER BY updated_at DESC
    if (/SELECT.*FROM forms WHERE user_id = \?/i.test(norm)) {
      const userId = params[0];
      const forms = this.getFormsByUser(userId);
      const rows = forms.map((f) => ({
        id: f.id,
        userId: f.userId,
        title: f.title,
        originalGoogleUrl: f.originalGoogleUrl,
        hostedSlug: f.hostedSlug,
        status: f.status,
        jsonConfig: f.jsonConfig,
        viewsCount: f.viewsCount,
        submissionsCount: f.submissionsCount,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      }));
      return [rows, []];
    }

    // SELECT ... FROM forms WHERE hosted_slug = ?
    if (/SELECT.*FROM forms WHERE hosted_slug = \?/i.test(norm)) {
      const slug = params[0];
      const form = this.getFormBySlug(slug);
      if (!form) return [[], []];
      return [
        [
          {
            id: form.id,
            userId: form.userId,
            title: form.title,
            originalGoogleUrl: form.originalGoogleUrl,
            hostedSlug: form.hostedSlug,
            status: form.status,
            jsonConfig: form.jsonConfig,
            viewsCount: form.viewsCount,
            submissionsCount: form.submissionsCount,
            createdAt: form.createdAt,
            updatedAt: form.updatedAt,
          },
        ],
        [],
      ];
    }

    // SELECT ... FROM forms WHERE id = ?
    if (/SELECT.*FROM forms WHERE id = \?/i.test(norm)) {
      const id = params[0];
      const form = this.getFormById(id);
      if (!form) return [[], []];
      return [
        [
          {
            id: form.id,
            userId: form.userId,
            title: form.title,
            originalGoogleUrl: form.originalGoogleUrl,
            hostedSlug: form.hostedSlug,
            status: form.status,
            jsonConfig: form.jsonConfig,
            viewsCount: form.viewsCount,
            submissionsCount: form.submissionsCount,
            createdAt: form.createdAt,
            updatedAt: form.updatedAt,
          },
        ],
        [],
      ];
    }

    // INSERT INTO forms (id, user_id, title, original_google_url, hosted_slug, status, json_config, ...)
    if (/INSERT INTO forms/i.test(norm)) {
      const [id, userId, title, originalGoogleUrl, hostedSlug, status, jsonConfigRaw] = params;
      const jsonConfig = typeof jsonConfigRaw === "string" ? JSON.parse(jsonConfigRaw) : jsonConfigRaw;
      const now = new Date().toISOString();
      this.insertForm({
        id,
        userId,
        title,
        originalGoogleUrl,
        hostedSlug,
        status: status || "active",
        jsonConfig,
        viewsCount: 0,
        submissionsCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      return [{ affectedRows: 1 }, []];
    }

    // UPDATE forms SET views_count = views_count + 1 WHERE hosted_slug = ?
    if (/UPDATE forms SET views_count = views_count \+ 1 WHERE hosted_slug = \?/i.test(norm)) {
      this.incrementFormViews(params[0]);
      return [{ affectedRows: 1 }, []];
    }

    // UPDATE forms SET status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?
    if (/UPDATE forms SET status = \?, updated_at = NOW\(\) WHERE id = \?/i.test(norm)) {
      const [status, id] = params;
      this.updateFormStatus(id, status);
      return [{ affectedRows: 1 }, []];
    }

    // DELETE FROM forms WHERE id = ? AND user_id = ?
    if (/DELETE FROM forms WHERE id = \?/i.test(norm)) {
      const [id] = params;
      this.deleteForm(id);
      return [{ affectedRows: 1 }, []];
    }

    // Dynamic UPDATE forms SET ... WHERE id = ? AND user_id = ?
    if (/UPDATE forms SET/i.test(norm) && /WHERE id = \?/i.test(norm)) {
      const id = params[params.length - 2];
      const form = this.getFormById(id);
      if (form) {
        // Parse assignments
        for (let i = 0; i < params.length - 2; i++) {
          const val = params[i];
          if (typeof val === "string") {
            try {
              const parsed = JSON.parse(val);
              if (parsed && typeof parsed === "object") {
                form.jsonConfig = parsed;
                continue;
              }
            } catch {
              // Not JSON
            }
          }
          if (val === "active" || val === "paused") {
            form.status = val;
          } else if (typeof val === "string" && val.length > 0) {
            if (i === 0) form.title = val;
            else form.hostedSlug = val;
          }
        }
        form.updatedAt = new Date().toISOString();
        this.insertForm(form);
      }
      return [{ affectedRows: 1 }, []];
    }

    return [[], []];
  }
}

const memoryDb = new InMemoryDatabase();

let realPool: mysql.Pool | null = null;
let useRealDb = false;

// If DATABASE_URL is explicitly set and points to an external host, try connecting with strict timeout
if (process.env.DATABASE_URL) {
  try {
    const isCloudDb =
      process.env.DATABASE_URL.includes("tidbcloud.com") ||
      process.env.DATABASE_URL.includes("aws") ||
      process.env.DATABASE_URL.includes("ssl");

    realPool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
      ssl: isCloudDb ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
    });

    // Test connection asynchronously
    realPool
      .getConnection()
      .then((conn) => {
        useRealDb = true;
        conn.release();
        console.log("[AI Studio] Successfully connected to configured DATABASE_URL (TiDB Cloud)");
      })
      .catch((err) => {
        console.warn("[AI Studio] DATABASE_URL connection failed (fallback to in-memory store):", err.message);
        useRealDb = false;
      });
  } catch (err: any) {
    console.warn("[AI Studio] Error configuring DATABASE_URL pool:", err.message);
  }
} else {
  console.log("[AI Studio] No DATABASE_URL specified — operating in resilient in-memory store mode.");
}

export const dbPool: DatabaseAdapter = {
  get isMock() {
    return !useRealDb;
  },
  async query(sql: string, params: any[] = []): Promise<[any, any]> {
    if (realPool) {
      try {
        const result = await realPool.query(sql, params);
        useRealDb = true;
        return result;
      } catch (err) {
        console.warn("[AI Studio] Real DB query failed, falling back to in-memory store:", (err as Error).message);
        return await memoryDb.handleQuery(sql, params);
      }
    }
    return await memoryDb.handleQuery(sql, params);
  },
  async getConnection() {
    if (realPool) {
      try {
        const conn = await realPool.getConnection();
        useRealDb = true;
        return {
          query: (s: string, p?: any[]) => conn.query(s, p),
          release: () => conn.release(),
        };
      } catch (err) {
        console.warn("[AI Studio] Real DB getConnection failed, returning in-memory mock connection.");
      }
    }
    return {
      query: async (s: string, p?: any[]) => {
        const [rows] = await memoryDb.handleQuery(s, p);
        return rows;
      },
      release: () => {},
    };
  },
};
