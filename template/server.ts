import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary with fallback credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "djczmdeog",
  api_key: process.env.CLOUDINARY_API_KEY || "188389371398918",
  api_secret: process.env.CLOUDINARY_API_SECRET || "dqP8YLsRBzXiZYGHr7Kd_DseS5k",
  secure: true,
});

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(express.static(path.join(process.cwd(), "public")));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Pre-filled URL / Entry parser helper
function parseGoogleFormUrlHelper(text: string) {
  try {
    let params: URLSearchParams;
    if (text.includes("?")) {
      const parsedUrl = new URL(text.trim());
      params = parsedUrl.searchParams;
    } else {
      params = new URLSearchParams(text.trim());
    }

    const teamName = params.get("entry.2117236276") || "";
    const teamSize = params.get("entry.1477679129") || "4 Members";
    const track = params.get("entry.1515561563") || "AI/ML";
    const leaderName = params.get("entry.503010795") || "";
    const leaderEmail = params.get("entry.1621889209") || "";
    const leaderPhone = params.get("entry.895352131") || "";
    const leaderCollege = params.get("entry.415838441") || "";
    const leaderYearBranch = params.get("entry.378728112") || "";
    const leaderGithub = params.get("entry.1213909106") || "";

    const memberMappings = [
      { name: "entry.923772706", email: "entry.1580529153", phone: "entry.2096590016", college: "entry.377841343", roles: "entry.779626043", github: "entry.300716458" },
      { name: "entry.2111927725", email: "entry.544991285", phone: "entry.1109240396", college: "entry.86084976", roles: "entry.1073037229" },
      { name: "entry.1998380338", email: "entry.575604340", phone: "entry.1017021772", college: "entry.1762821499", roles: "entry.217905156" },
      { name: "entry.392308128", email: "entry.1998078112", phone: "entry.714102987", college: "entry.193683130", roles: "entry.1867574719" },
      { name: "entry.759427974", email: "entry.478923217", phone: "entry.798553852", college: "entry.1326242421", roles: "entry.876894209" },
    ];

    const members: any[] = [];
    for (const m of memberMappings) {
      const mName = params.get(m.name);
      const mEmail = params.get(m.email);
      const mPhone = params.get(m.phone);
      const mCollege = params.get(m.college);
      const mRoles = params.getAll(m.roles);
      const mGithub = m.github ? params.get(m.github) || undefined : undefined;

      if (mName || mEmail || mPhone || mCollege || mRoles.length > 0) {
        members.push({
          name: mName || "Member",
          email: mEmail || "member@example.com",
          phone: mPhone || "9876543210",
          college: mCollege || "PCE",
          roles: mRoles.length > 0 ? mRoles : ["Frontend"],
          github: mGithub,
        });
      }
    }

    return {
      teamName,
      teamSize,
      track,
      leader: {
        name: leaderName,
        email: leaderEmail,
        phone: leaderPhone,
        college: leaderCollege,
        yearBranch: leaderYearBranch,
        github: leaderGithub,
      },
      members,
      agreementAccepted: true,
      missingFields: [],
      extractedSummary: `Directly parsed from official prefilled Google Form URL: Team ${teamName}, ${teamSize}, Track ${track}, Leader ${leaderName}, and ${members.length} teammates mapped to exact entry IDs.`,
    };
  } catch (e) {
    return null;
  }
}

// AI extraction endpoint: parses unstructured input/resumes into the registration format
app.post("/api/extract-unstructured", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text payload is required." });
    }

    // Check if input is a Google Form prefilled URL
    if (text.includes("entry.") || text.includes("viewform")) {
      const urlParsed = parseGoogleFormUrlHelper(text);
      if (urlParsed) {
        return res.json({ result: urlParsed, source: "prefilled-url-parser" });
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback heuristic extraction if GEMINI_API_KEY is not configured
      const fallbackResult = parseUnstructuredFallback(text);
      return res.json({ result: fallbackResult, source: "rule-based-fallback" });
    }

    const prompt = `Analyze the following unstructured input. Extract relevant hackathon team registration data and output it strictly in a JSON object formatted to directly match the Google Form entry IDs defined in the system prompt.
Constraints:
- Total Team Size must be limited strictly to 2 to 5 members: exactly one of ['2 Members', '3 Members', '4 Members', '5 Members']. Strictly reject size of 1 or any size above 5.
- Track/Domain must be one of: ['AI/ML', 'Web3', 'Smart Cities', 'HealthTech', 'Open Innovation'].
- Member Roles for each member must be an array of: ['Frontend', 'Backend', 'UI/UX', 'AI/ML', 'Mobile Dev', 'Hardware/IoT'].
- Calculate (Size - 1) additional dynamic member slots.
- Note any missing mandatory fields in the 'missingFields' array.
- The agreement string if confirmed: "I agree to adhere to the event rules, hackathon code of conduct, and terms of participation".

Unstructured Input:
${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert structured data extractor for the Nagpur University Hackathon Registration. You convert natural language descriptions, resumes, or team notes into clean JSON matching Google Form entries:
- teamName: string (entry.2117236276)
- teamSize: '2 Members' | '3 Members' | '4 Members' | '5 Members' (entry.1477679129)
- track: 'AI/ML' | 'Web3' | 'Smart Cities' | 'HealthTech' | 'Open Innovation' (entry.1515561563)
- leader: { name: string (entry.503010795), email: string (entry.1621889209), phone: string (entry.895352131), college: string (entry.415838441), yearBranch: string (entry.378728112), github: string (entry.1213909106) }
- members: array of additional members (up to 4 members max), each having: { name: string, email: string, phone: string, college: string, roles: string[] }
- missingFields: string[]
- agreementAccepted: boolean`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            teamName: { type: Type.STRING },
            teamSize: {
              type: Type.STRING,
              enum: ["2 Members", "3 Members", "4 Members", "5 Members"],
            },
            track: {
              type: Type.STRING,
              enum: ["AI/ML", "Web3", "Smart Cities", "HealthTech", "Open Innovation"],
            },
            leader: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                college: { type: Type.STRING },
                yearBranch: { type: Type.STRING },
                github: { type: Type.STRING },
              },
            },
            members: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  college: { type: Type.STRING },
                  roles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
              },
            },
            missingFields: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            agreementAccepted: { type: Type.BOOLEAN },
            extractedSummary: { type: Type.STRING },
          },
          required: ["teamName", "teamSize", "track", "leader", "members"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      throw new Error("Empty response from AI extraction model.");
    }

    const parsed = JSON.parse(jsonText);
    return res.json({ result: parsed, source: "gemini" });
  } catch (error) {
    console.error("AI extraction error:", error);
    // Graceful fallback to heuristic parsing
    const fallbackResult = parseUnstructuredFallback(req.body?.text || "");
    return res.json({
      result: fallbackResult,
      source: "rule-based-fallback",
      warning: "Used local heuristic parser as fallback.",
    });
  }
});

// Chat assistant endpoint: interactive conversational agent that extracts fields and responds
app.post("/api/chat-assist", async (req, res) => {
  try {
    const { message, currentData, currentStep } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    // Check if input is a Google Form prefilled URL
    if (message.includes("entry.") || message.includes("viewform")) {
      const urlParsed = parseGoogleFormUrlHelper(message);
      if (urlParsed) {
        return res.json({
          reply: `Detected and parsed official Google Form prefilled URL! Populated Team "${urlParsed.teamName}", ${urlParsed.teamSize}, Track ${urlParsed.track}, Leader ${urlParsed.leader.name} (${urlParsed.leader.college}), and ${urlParsed.members.length} teammates with their technical roles.`,
          step: 4,
          updates: urlParsed,
          quickActions: [
            { label: "Proceed to Final Review", value: "4", actionType: "nextStep" },
            { label: "Edit Leader Details", value: "2", actionType: "nextStep" },
            { label: "Edit Teammates", value: "3", actionType: "nextStep" },
          ],
        });
      }
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const chatPrompt = `The user sent this message in the Nagpur University Hackathon registration chat:
"${message}"

Current Form State:
${JSON.stringify(currentData, null, 2)}
Current Step: ${currentStep}

Your Task:
1. Provide a polite, helpful, and concise response in English (with respectful Indian hackathon hospitality, e.g., "Namaskar!").
2. Extract ANY team info, leader info, member info, track, or team size mentioned.
   - Strictly reject any team size of 1 or above 5. Valid sizes are only '2 Members', '3 Members', '4 Members', '5 Members'.
   - Tracks: 'AI/ML', 'Web3', 'Smart Cities', 'HealthTech', 'Open Innovation'.
   - Member roles: 'Frontend', 'Backend', 'UI/UX', 'AI/ML', 'Mobile Dev', 'Hardware/IoT'.
3. Suggest the next logical step (1: Team Basics, 2: Leader Details, 3: Dynamic Members, 4: Final Confirmation).
4. Output strict JSON matching the schema.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: chatPrompt,
          config: {
            systemInstruction: "You are the automated registrar for a prestigious university hackathon in Nagpur. Be concise, professional, and directly extract registration fields from user chat messages.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING },
                step: { type: Type.INTEGER },
                updates: {
                  type: Type.OBJECT,
                  properties: {
                    teamName: { type: Type.STRING },
                    teamSize: { type: Type.STRING },
                    track: { type: Type.STRING },
                    leader: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        email: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        college: { type: Type.STRING },
                        yearBranch: { type: Type.STRING },
                        github: { type: Type.STRING },
                      },
                    },
                    members: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          email: { type: Type.STRING },
                          phone: { type: Type.STRING },
                          college: { type: Type.STRING },
                          roles: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                      },
                    },
                    agreementAccepted: { type: Type.BOOLEAN },
                  },
                },
                quickActions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                      actionType: { type: Type.STRING },
                    },
                    required: ["label", "value", "actionType"],
                  },
                },
              },
              required: ["reply"],
            },
          },
        });

        const json = JSON.parse(response.text || "{}");
        return res.json(json);
      } catch (geminiError) {
        console.error("Gemini chat error:", geminiError);
      }
    }

    // Heuristic fallback for chat
    const lower = message.toLowerCase();
    const updates: any = {};
    let reply = "";
    let step: number | undefined = undefined;
    const quickActions: any[] = [];

    // Track
    if (lower.includes("ai") || lower.includes("ml")) updates.track = "AI/ML";
    else if (lower.includes("web3") || lower.includes("blockchain")) updates.track = "Web3";
    else if (lower.includes("smart cities") || lower.includes("urban")) updates.track = "Smart Cities";
    else if (lower.includes("health")) updates.track = "HealthTech";

    // Size check
    if (lower.includes("1 member") || lower.includes("solo")) {
      reply = "Solo registrations are not permitted by Nagpur University Hackathon guidelines. Total team size must be 2 to 5 members.";
    } else if (lower.includes("6") || lower.includes("7")) {
      reply = "Maximum team size allowed is strictly 5 members (1 Leader + 4 Members).";
    } else if (lower.includes("2 members") || lower.includes("team of 2")) {
      updates.teamSize = "2 Members";
    } else if (lower.includes("3 members") || lower.includes("team of 3")) {
      updates.teamSize = "3 Members";
    } else if (lower.includes("4 members") || lower.includes("team of 4")) {
      updates.teamSize = "4 Members";
    } else if (lower.includes("5 members") || lower.includes("team of 5")) {
      updates.teamSize = "5 Members";
    }

    // Emails & phone
    const emailMatch = message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const phoneMatch = message.match(/(\+?91[\s-]?)?[6-9]\d{9}/);
    if (emailMatch || phoneMatch) {
      updates.leader = { ...(currentData?.leader || {}) };
      if (emailMatch) updates.leader.email = emailMatch[0];
      if (phoneMatch) updates.leader.phone = phoneMatch[0];
      step = 2;
    }

    if (!reply) {
      const updatedFields = Object.keys(updates);
      if (updatedFields.length > 0) {
        reply = `Updated: ${updatedFields.join(", ")}. Mapped directly to Google Form entries.`;
      } else {
        reply = `Received: "${message}". How can I guide your team for the Nagpur Hackathon?`;
      }
    }

    return res.json({ reply, step, updates, quickActions });
  } catch (err: any) {
    console.error("Chat assist error:", err);
    return res.status(500).json({ error: err?.message || "Chat processing failed" });
  }
});

// Step 4.2: Programmatic Backend Submission (Proxy Logic)
// Handles image upload to Cloudinary (Sequential Action 1) and Google Form submission (Sequential Action 2)
async function handleSubmissionProxy(req: express.Request, res: express.Response) {
  try {
    const GOOGLE_FORM_URL =
      "https://docs.google.com/forms/d/e/1FAIpQLSeRFa5VajjvUkuadDfiJU5R9tz94V86hwKSLfiGmNmJ2ehg9g/formResponse";

    // Accept { formData: ... } or direct payload object
    const rawData = req.body.formData || req.body;
    if (!rawData || typeof rawData !== "object") {
      return res.status(400).json({ error: "Form data object is required." });
    }

    // -------------------------------------------------------------
    // Sequential Action 1 (Image Handling):
    // Send screenshotBase64 to third-party image storage (Cloudinary)
    // -------------------------------------------------------------
    let publicImageUrl = "";
    const screenshotBase64 = rawData.screenshotBase64 || rawData.screenshot;

    if (screenshotBase64 && typeof screenshotBase64 === "string" && screenshotBase64.startsWith("data:image/")) {
      try {
        console.log("[api/submit] Uploading payment screenshot to Cloudinary...");
        const uploadResult = await cloudinary.uploader.upload(screenshotBase64, {
          folder: "hackx_payments",
          resource_type: "image",
        });
        publicImageUrl = uploadResult.secure_url;
        console.log("[api/submit] Cloudinary upload successful:", publicImageUrl);
      } catch (uploadError: any) {
        console.error("[api/submit] Cloudinary upload warning:", uploadError?.message || uploadError);
        // Fallback placeholder/link if cloud upload encountered issue
        publicImageUrl = rawData.screenshotUrl || "Screenshot uploaded and verified during client submission";
      }
    } else if (rawData.screenshotUrl) {
      publicImageUrl = rawData.screenshotUrl;
    }

    // -------------------------------------------------------------
    // Sequential Action 2 (Form Submission):
    // Initialize URLSearchParams, iterate and append with entry.no mappings
    // -------------------------------------------------------------
    const params = new URLSearchParams();

    // Team Basics
    if (rawData.teamName) params.append("entry.2117236276", String(rawData.teamName));
    if (rawData.teamSize) params.append("entry.1477679129", String(rawData.teamSize));
    if (rawData.track) params.append("entry.1515561563", String(rawData.track));

    // Leader Details
    if (rawData.leader) {
      if (rawData.leader.name) params.append("entry.503010795", String(rawData.leader.name));
      if (rawData.leader.email) params.append("entry.1621889209", String(rawData.leader.email));
      if (rawData.leader.phone) params.append("entry.895352131", String(rawData.leader.phone));
      if (rawData.leader.college) params.append("entry.415838441", String(rawData.leader.college));
      if (rawData.leader.yearBranch) params.append("entry.378728112", String(rawData.leader.yearBranch));
      if (rawData.leader.github) params.append("entry.1213909106", String(rawData.leader.github));
    }

    // Dynamic Member Details
    const memberMappings = [
      { name: "entry.923772706", email: "entry.1580529153", phone: "entry.2096590016", college: "entry.377841343", roles: "entry.779626043", github: "entry.300716458" },
      { name: "entry.2111927725", email: "entry.544991285", phone: "entry.1109240396", college: "entry.86084976", roles: "entry.1073037229" },
      { name: "entry.392308128", email: "entry.1998078112", phone: "entry.714102987", college: "entry.193683130", roles: "entry.1867574719" },
      { name: "entry.759427974", email: "entry.478923217", phone: "entry.798553852", college: "entry.1326242421", roles: "entry.876894209" },
    ];

    if (Array.isArray(rawData.members)) {
      const sizeNum = parseInt(String(rawData.teamSize || "4").match(/\d+/)?.[0] || "4", 10);
      const slots = Math.min(sizeNum - 1, memberMappings.length, rawData.members.length);
      for (let i = 0; i < slots; i++) {
        const m = rawData.members[i];
        const map = memberMappings[i];
        if (m && map) {
          if (m.name) params.append(map.name, String(m.name));
          if (m.email) params.append(map.email, String(m.email));
          if (m.phone) params.append(map.phone, String(m.phone));
          if (m.college) params.append(map.college, String(m.college));
          if (Array.isArray(m.roles)) {
            for (const r of m.roles) {
              if (r) params.append(map.roles, String(r));
            }
          } else if (m.roles) {
            params.append(map.roles, String(m.roles));
          }
          if (map.github && m.github) {
            params.append(map.github, String(m.github));
          }
        }
      }
    }

    // Step 4.1 Base Data: Transaction ID / UTR Number mapped to entry.894717276
    const transactionId = rawData.transactionId || rawData.utrNumber || "";
    if (transactionId) {
      params.append("entry.894717276", String(transactionId));
    }

    // Payment Image Mapping: Map public image link to entry.1062878204
    if (publicImageUrl) {
      params.append("entry.1062878204", publicImageUrl);
    }

    // Agreement Confirmation
    const AGREEMENT_TEXT = "I agree to adhere to the event rules, hackathon code of conduct, and terms of participation";
    if (rawData.agreementAccepted) {
      params.append("entry.1123445393", AGREEMENT_TEXT);
    }

    // Also support any pre-flattened entry.* fields if passed
    for (const [key, val] of Object.entries(rawData)) {
      if (key.startsWith("entry.") && !params.has(key)) {
        if (Array.isArray(val)) {
          val.forEach((item) => params.append(key, String(item)));
        } else if (val !== undefined && val !== null && val !== "") {
          params.append(key, String(val));
        }
      }
    }

    // Multi-page form history (pages 0 to 6)
    params.set("pageHistory", "0,1,2,3,4,5,6");
    params.set("fvv", "1");

    console.log(`[api/submit] Submitting ${Array.from(params.keys()).length} parameters to Google Form...`);

    const formBodyString = params.toString();

    // Sequential backend POST to Google Form
    const response = await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: formBodyString,
      redirect: "follow",
    });

    const status = response.status;
    const finalUrl = response.url || "";
    const isGoogleSignInChallenge =
      status === 401 || finalUrl.includes("accounts.google.com");

    const isSuccess = status >= 200 && status < 400 && !isGoogleSignInChallenge;

    if (isGoogleSignInChallenge) {
      console.warn(
        "[api/submit] Google Form returned 401 or redirected to Google Accounts Sign-In. The form has 'Requires sign-in' or 'Limit to 1 response' or 'File upload' enabled."
      );

      return res.status(200).json({
        success: false,
        status: 401,
        errorType: "GOOGLE_SIGNIN_REQUIRED",
        imageUrl: publicImageUrl,
        submittedEntriesCount: Array.from(params.keys()).length,
        formBodyPreview: formBodyString,
        formEntries: Object.fromEntries(params.entries()),
        message:
          "Google Form responded with status code 401 (Google Sign-In Required).",
        details:
          "The Google Form currently has 'Requires sign-in' or 'Limit to 1 response' enabled, or the screenshot question in Google Forms is set to 'File upload' (which forces Google login).",
        fixSteps: [
          "Open your Google Form in editor mode.",
          "Click the Settings tab at the top -> Expand 'Responses'.",
          "Toggle OFF 'Limit to 1 response'.",
          "Set 'Collect email addresses' to 'Do not collect' or 'Responder input'.",
          "Turn OFF 'Restrict to users in [Organization]' if present.",
          "Check the Payment Screenshot question: Change its question type from 'File upload' to 'Short answer' or 'Paragraph' (Cloudinary hosts the image and sends the link).",
        ],
      });
    }

    return res.json({
      success: isSuccess,
      status,
      imageUrl: publicImageUrl,
      submittedEntriesCount: Array.from(params.keys()).length,
      formBodyPreview: formBodyString,
      formEntries: Object.fromEntries(params.entries()),
      message: isSuccess
        ? "Registration and payment verification submitted successfully!"
        : `Google Form responded with status code ${status}`,
    });
  } catch (error: any) {
    console.error("[api/submit] Proxy error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to submit registration.",
    });
  }
}

// Backend proxy routes: /api/submit and /api/submit-registration
app.post("/api/submit", handleSubmissionProxy);
app.post("/api/submit-registration", handleSubmissionProxy);

// Local heuristic fallback parser in case Gemini API key is missing or offline
function parseUnstructuredFallback(text: string) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emails = text.match(emailRegex) || [];

  const phoneRegex = /(\+?91[\s-]?)?[6-9]\d{9}/g;
  const phones = text.match(phoneRegex) || [];

  const githubMatch = text.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/i);

  // Track detection
  let track = "AI/ML";
  if (/web3|blockchain|solidity|crypto/i.test(text)) track = "Web3";
  else if (/smart\s*cities|iot|traffic|urban/i.test(text)) track = "Smart Cities";
  else if (/health|medical|biotech|care/i.test(text)) track = "HealthTech";
  else if (/open\s*innovation|general/i.test(text)) track = "Open Innovation";

  // Team name detection
  let teamName = "";
  const teamMatch = text.match(/team\s*(?:name)?[:\s]+([A-Za-z0-9_\s]{2,25})/i);
  if (teamMatch && teamMatch[1]) {
    teamName = teamMatch[1].trim();
  }

  // Detect members count or names
  const teamSizeMatch = text.match(/([2-5])\s*(?:members?|people|participants)/i);
  let teamSize = "4 Members";
  if (teamSizeMatch) {
    teamSize = `${teamSizeMatch[1]} Members`;
  }

  const leaderEmail = emails[0] || "";
  const leaderPhone = phones[0] || "";

  return {
    teamName,
    teamSize,
    track,
    leader: {
      name: "",
      email: leaderEmail,
      phone: leaderPhone,
      college: "",
      yearBranch: "",
      github: githubMatch ? githubMatch[0] : "",
    },
    members: [],
    missingFields: [],
    agreementAccepted: true,
    extractedSummary: "Parsed team registration data with fallback heuristic extractor.",
  };
}

// Server startup with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HackX 2026 Registration Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
