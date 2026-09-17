import type { IncomingMessage, ServerResponse } from "http";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with fallback credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "djczmdeog",
  api_key: process.env.CLOUDINARY_API_KEY || "188389371398918",
  api_secret: process.env.CLOUDINARY_API_SECRET || "dqP8YLsRBzXiZYGHr7Kd_DseS5k",
  secure: true,
});

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeRFa5VajjvUkuadDfiJU5R9tz94V86hwKSLfiGmNmJ2ehg9g/formResponse";

const AGREEMENT_TEXT =
  "I agree to adhere to the event rules, hackathon code of conduct, and terms of participation";

// Helper to safely extract JSON body in Vercel Serverless environment
async function parseRequestBody(req: any): Promise<any> {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk: any) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req: any, res: any) {
  // Enable CORS for Vercel Serverless
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body = await parseRequestBody(req);
    const rawData = body?.formData || body;

    if (!rawData || typeof rawData !== "object") {
      return res.status(400).json({ error: "Form data payload is required." });
    }

    // -------------------------------------------------------------
    // Step 1: Upload Screenshot to Cloudinary
    // -------------------------------------------------------------
    let publicImageUrl = "";
    const screenshotBase64 = rawData.screenshotBase64 || rawData.screenshot;

    if (
      screenshotBase64 &&
      typeof screenshotBase64 === "string" &&
      screenshotBase64.startsWith("data:image/")
    ) {
      try {
        console.log("[vercel/api/submit] Uploading screenshot to Cloudinary...");
        const uploadResult = await cloudinary.uploader.upload(screenshotBase64, {
          folder: "hackx_payments",
          resource_type: "image",
        });
        publicImageUrl = uploadResult.secure_url;
        console.log("[vercel/api/submit] Cloudinary upload success:", publicImageUrl);
      } catch (uploadErr: any) {
        console.error(
          "[vercel/api/submit] Cloudinary upload warning:",
          uploadErr?.message || uploadErr
        );
        publicImageUrl =
          rawData.screenshotUrl ||
          "Screenshot uploaded and verified during client submission";
      }
    } else if (rawData.screenshotUrl) {
      publicImageUrl = rawData.screenshotUrl;
    }

    // -------------------------------------------------------------
    // Step 2: Build Google Form URLSearchParams
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
      if (Array.isArray(rawData.leader.roles)) {
        for (const role of rawData.leader.roles) {
          if (role) params.append("entry.779626043", String(role));
        }
      }
    }

    // Members Details
    const memberFieldMap = [
      { name: "entry.923772706", email: "entry.1580529153", phone: "entry.2096590016", college: "entry.377841343", roles: "entry.779626043", github: "entry.300716458" },
      { name: "entry.2111927725", email: "entry.544991285", phone: "entry.1109240396", college: "entry.86084976", roles: "entry.1073037229" },
      { name: "entry.1998380338", email: "entry.575604340", phone: "entry.1017021772", college: "entry.1762821499", roles: "entry.217905156" },
      { name: "entry.392308128", email: "entry.1998078112", phone: "entry.714102987", college: "entry.193683130", roles: "entry.1867574719" },
      { name: "entry.759427974", email: "entry.478923217", phone: "entry.798553852", college: "entry.1326242421", roles: "entry.876894209" },
    ];

    if (Array.isArray(rawData.members)) {
      rawData.members.forEach((member: any, index: number) => {
        if (index < memberFieldMap.length && member) {
          const map = memberFieldMap[index];
          if (member.name) params.append(map.name, String(member.name));
          if (member.email) params.append(map.email, String(member.email));
          if (member.phone) params.append(map.phone, String(member.phone));
          if (member.college) params.append(map.college, String(member.college));
          if (map.github && member.github) params.append(map.github, String(member.github));
          if (Array.isArray(member.roles)) {
            member.roles.forEach((r: string) => {
              if (r) params.append(map.roles, String(r));
            });
          }
        }
      });
    }

    // Step 4.1 Payment Details
    if (rawData.transactionId) {
      params.append("entry.894717276", String(rawData.transactionId));
    }

    // Step 4.2 Payment Screenshot Public Image Link
    if (publicImageUrl) {
      params.append("entry.1062878204", String(publicImageUrl));
    }

    // Agreement
    params.append("entry.1123445393", AGREEMENT_TEXT);

    // Multi-page navigation history
    params.append("pageHistory", "0,1,2,3,4,5,6");
    params.append("fvv", "1");

    // -------------------------------------------------------------
    // Step 3: POST to Google Form endpoint
    // -------------------------------------------------------------
    const formBodyString = params.toString();
    console.log(
      `[vercel/api/submit] Forwarding ${params.toString().length} bytes to Google Form...`
    );

    const googleRes = await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: GOOGLE_FORM_URL.replace("/formResponse", "/viewform"),
        Origin: "https://docs.google.com",
      },
      body: formBodyString,
      redirect: "follow",
    });

    const status = googleRes.status;
    const finalUrl = googleRes.url || "";
    const isGoogleSignInChallenge =
      status === 401 || finalUrl.includes("accounts.google.com");
    const isSuccess = status >= 200 && status < 400 && !isGoogleSignInChallenge;

    if (isGoogleSignInChallenge) {
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

    return res.status(200).json({
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
    console.error("[vercel/api/submit] Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Internal server error during form submission.",
    });
  }
}
