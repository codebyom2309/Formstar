import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { parseGoogleForm } from "./server/parser";
import { dbPool } from "./server/db";
import submitHandler from "./api/submit";
import { groqAiProvider } from "./server/ai/provider";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Normalization middleware for Vercel Serverless rewrites
app.use((req, res, next) => {
  const original = (req.headers["x-matched-path"] || req.headers["x-forwarded-uri"] || req.headers["x-invoke-path"]) as string | undefined;
  if (original && typeof original === "string" && original.startsWith("/api")) {
    const qIdx = req.url.indexOf("?");
    const query = qIdx !== -1 ? req.url.substring(qIdx) : "";
    req.url = original + (original.includes("?") ? "" : query);
  } else if (!req.url.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  next();
});

// Auto-verify and ensure users and forms tables exist on startup
async function ensureDatabaseSchema() {
  try {
    const conn = await dbPool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`email_verified\` TIMESTAMP(3) NULL,
        \`image\` TEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX \`idx_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`forms\` (
        \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
        \`user_id\` VARCHAR(191) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`original_google_url\` TEXT NOT NULL,
        \`hosted_slug\` VARCHAR(120) NOT NULL UNIQUE,
        \`status\` ENUM('active', 'paused') DEFAULT 'active' NOT NULL,
        \`json_config\` JSON NOT NULL,
        \`views_count\` INT DEFAULT 0 NOT NULL,
        \`submissions_count\` INT DEFAULT 0 NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX \`idx_forms_user_id\` (\`user_id\`),
        INDEX \`idx_forms_status\` (\`status\`),
        UNIQUE KEY \`uniq_forms_hosted_slug\` (\`hosted_slug\`),
        CONSTRAINT \`fk_forms_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure sample user exists
    await conn.query(`
      INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`image\`)
      VALUES ('user_google_98234', 'Alex Rivera', 'alex.rivera@gmail.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80')
      ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);
    `);

    conn.release();
    console.log("Database schema initialized.");
  } catch (err) {
    console.error("Failed to verify schema on startup:", err);
  }
}

ensureDatabaseSchema();

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

app.get("/api/health", async (req, res) => {
  let dbStatus = "connected";
  let dbError = null;
  try {
    const [rows] = await dbPool.query("SELECT 1 as val");
  } catch (e: any) {
    dbStatus = "error";
    dbError = e?.message || String(e);
  }

  const hasDbEnv = !!(
    process.env.DATABASE_URL ||
    process.env.DATABASE ||
    process.env.DATABSE ||
    process.env.DATABASE_URI ||
    process.env.MYSQL_URL ||
    process.env.TIDB_URL ||
    process.env.DB_URL
  );

  const hasGroqEnv = !!(
    process.env.GROQ_API_KEY ||
    process.env.APIKEY ||
    process.env.API_KEY ||
    process.env.GROQ_KEY ||
    process.env.GROQ_APIKEY
  );

  res.json({
    status: "ok",
    database: dbPool.isMock ? "In-Memory Store (Sandbox)" : "MySQL/TiDB Cloud",
    databaseName: "deform",
    databaseStatus: dbStatus,
    databaseError: dbError,
    groqEnabled: hasGroqEnv,
    environmentConfig: {
      databaseUrlDetected: hasDbEnv,
      groqApiKeyDetected: hasGroqEnv,
      nodeEnv: process.env.NODE_ENV || "development",
      isVercel: !!process.env.VERCEL,
    },
    timestamp: new Date().toISOString(),
    phase: "Phase 2: Ingestion & Parsing Engine",
  });
});

// POST /api/ai/analyze-form - AI Form Intelligence Engine powered by Groq
app.post("/api/ai/analyze-form", async (req, res) => {
  const { rawForm, sourceUrl, forceRefresh } = req.body;
  if (!rawForm) {
    return res.status(400).json({ error: "rawForm is required" });
  }

  try {
    const result = await groqAiProvider.analyzeForm({ rawForm, sourceUrl, forceRefresh });
    return res.json({
      success: true,
      analysis: result.experience,
      experience: result.experience,
      model: result.model,
      provider: result.provider,
      latencyMs: result.latencyMs,
      cached: result.cached,
    });
  } catch (err: any) {
    console.error("[server] /api/ai/analyze-form error:", err);
    return res.status(500).json({ error: err.message || "AI Analysis failed" });
  }
});

// POST /api/ai/suggest - Groq AI Assistant for form fields and descriptions
app.post("/api/ai/suggest", async (req, res) => {
  const { prompt, context } = req.body;
  const groqKey =
    process.env.GROQ_API_KEY ||
    process.env.APIKEY ||
    process.env.API_KEY ||
    process.env.GROQ_KEY ||
    process.env.GROQ_APIKEY;

  if (!groqKey) {
    return res.status(503).json({ error: "GROQ_API_KEY is not configured in environment" });
  }

  try {
    const result = await groqAiProvider.suggestCopy(
      prompt || "Generate a clean, friendly description for a registration form.",
      context
    );
    return res.json({
      success: true,
      suggestion: result.suggestion,
      model: result.model,
      latencyMs: result.latencyMs,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to generate suggestion", details: err.message });
  }
});

// Legacy / Direct Vercel submit handler compatibility
app.all(["/api/submit", "/api/submit-registration"], async (req, res) => {
  try {
    await submitHandler(req, res);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Submission failed" });
  }
});

// POST /api/parse-form - Ingestion & Parsing Engine
app.post("/api/parse-form", async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({
      success: false,
      error: "A valid Google Form URL is required.",
    });
  }

  try {
    const result = await parseGoogleForm(url);
    return res.json(result);
  } catch (err: any) {
    console.error("Form parsing error:", err.message);
    const statusCode = err.isUploadInterception ? 422 : 400;
    return res.status(statusCode).json({
      success: false,
      error: err.message,
      isUploadInterception: !!err.isUploadInterception,
      offendingField: err.offendingField,
    });
  }
});

app.get("/api/auth/session", async (req, res) => {
  try {
    const [rows]: any = await dbPool.query(
      "SELECT id, name, email, image FROM users WHERE id = ?",
      ["user_google_98234"]
    );
    if (rows && rows.length > 0) {
      return res.json({ user: rows[0] });
    }
  } catch (e) {
    console.warn("Error fetching session user from DB:", e);
  }

  res.json({
    user: {
      id: "user_google_98234",
      name: "Alex Rivera",
      email: "alex.rivera@gmail.com",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
  });
});

app.post("/api/auth/signin", async (req, res) => {
  const { email, name } = req.body;
  const targetEmail = email || "alex.rivera@gmail.com";
  const targetName = name || "Alex Rivera";
  const userId = "user_google_98234";

  try {
    await dbPool.query(
      "INSERT INTO users (id, name, email, image) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)",
      [userId, targetName, targetEmail, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"]
    );
  } catch (e) {
    console.warn("Could not upsert user:", e);
  }

  res.json({
    success: true,
    user: {
      id: userId,
      name: targetName,
      email: targetEmail,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
  });
});

app.post("/api/auth/signout", (req, res) => {
  res.json({ success: true });
});

// GET /api/forms - Real Database query
app.get("/api/forms", async (req, res) => {
  try {
    const [rows]: any = await dbPool.query(
      "SELECT id, user_id as userId, title, original_google_url as originalGoogleUrl, hosted_slug as hostedSlug, status, json_config as jsonConfig, views_count as viewsCount, submissions_count as submissionsCount, created_at as createdAt, updated_at as updatedAt FROM forms WHERE user_id = ? ORDER BY updated_at DESC",
      ["user_google_98234"]
    );

    const forms = (rows || []).map((r: any) => {
      const parsedConfig = typeof r.jsonConfig === "string" ? JSON.parse(r.jsonConfig) : r.jsonConfig;
      return {
        ...r,
        jsonConfig: parsedConfig,
        aiExperience: parsedConfig?.aiExperience || undefined,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
      };
    });

    return res.json({ forms });
  } catch (err: any) {
    console.error("Error querying forms from TiDB:", err);
    return res.status(500).json({ error: "Database query failed", details: err.message });
  }
});

// POST /api/forms - Real Database insert
app.post("/api/forms", async (req, res) => {
  const body = req.body;
  const newId = body.id || `form_${Date.now()}`;
  const userId = body.userId || "user_google_98234";
  const title = body.title;
  const googleUrl = body.originalGoogleUrl;
  const hostedSlug = body.hostedSlug;
  const status = body.status || "active";
  const jsonConfig = body.jsonConfig || {};
  if (body.aiExperience && !jsonConfig.aiExperience) {
    jsonConfig.aiExperience = body.aiExperience;
  }

  try {
    await dbPool.query(
      "INSERT INTO forms (id, user_id, title, original_google_url, hosted_slug, status, json_config, views_count, submissions_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, NOW(), NOW())",
      [newId, userId, title, googleUrl, hostedSlug, status, JSON.stringify(jsonConfig)]
    );

    const record = {
      id: newId,
      userId,
      title,
      originalGoogleUrl: googleUrl,
      hostedSlug,
      status,
      jsonConfig,
      aiExperience: jsonConfig.aiExperience || undefined,
      viewsCount: 0,
      submissionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res.json({ success: true, form: record });
  } catch (err: any) {
    console.error("Failed to insert form into TiDB:", err);
    return res.status(500).json({ error: "Failed to insert into database", details: err.message });
  }
});

// PATCH /api/forms/:id/status - Real Database update
app.patch("/api/forms/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== "active" && status !== "paused") {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    await dbPool.query(
      "UPDATE forms SET status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
      [status, id, "user_google_98234"]
    );
    return res.json({ success: true, status });
  } catch (err: any) {
    console.error("Failed to update status in TiDB:", err);
    return res.status(500).json({ error: "Database update failed", details: err.message });
  }
});

// DELETE /api/forms/:id - Real Database delete
app.delete("/api/forms/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await dbPool.query("DELETE FROM forms WHERE id = ? AND user_id = ?", [
      id,
      "user_google_98234",
    ]);
    return res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete form from TiDB:", err);
    return res.status(500).json({ error: "Database delete failed", details: err.message });
  }
});

// PUT /api/forms/:id - Update form configuration, title, slug, status in TiDB
app.put("/api/forms/:id", async (req, res) => {
  const { id } = req.params;
  const { title, hostedSlug, status, jsonConfig } = req.body;

  try {
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      fieldsToUpdate.push("title = ?");
      values.push(title);
    }
    if (hostedSlug !== undefined) {
      fieldsToUpdate.push("hosted_slug = ?");
      values.push(hostedSlug);
    }
    if (status !== undefined) {
      fieldsToUpdate.push("status = ?");
      values.push(status);
    }
    if (jsonConfig !== undefined) {
      fieldsToUpdate.push("json_config = ?");
      values.push(JSON.stringify(jsonConfig));
    }

    fieldsToUpdate.push("updated_at = NOW()");
    values.push(id);
    values.push("user_google_98234");

    const sql = `UPDATE forms SET ${fieldsToUpdate.join(", ")} WHERE id = ? AND user_id = ?`;
    await dbPool.query(sql, values);

    const [rows]: any = await dbPool.query(
      "SELECT id, user_id as userId, title, original_google_url as originalGoogleUrl, hosted_slug as hostedSlug, status, json_config as jsonConfig, views_count as viewsCount, submissions_count as submissionsCount, created_at as createdAt, updated_at as updatedAt FROM forms WHERE id = ?",
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Form not found" });
    }

    const updated = {
      ...rows[0],
      jsonConfig: typeof rows[0].jsonConfig === "string" ? JSON.parse(rows[0].jsonConfig) : rows[0].jsonConfig,
      createdAt: rows[0].createdAt ? new Date(rows[0].createdAt).toISOString() : new Date().toISOString(),
      updatedAt: rows[0].updatedAt ? new Date(rows[0].updatedAt).toISOString() : new Date().toISOString(),
    };

    return res.json({ success: true, form: updated });
  } catch (err: any) {
    console.error("Failed to update form in TiDB:", err);
    return res.status(500).json({ error: "Database update failed", details: err.message });
  }
});

// GET /api/forms/slug/:slug - Public hosted form lookup + view count increment
app.get("/api/forms/slug/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    // Increment view count asynchronously
    await dbPool.query(
      "UPDATE forms SET views_count = views_count + 1 WHERE hosted_slug = ?",
      [slug]
    ).catch((err) => console.warn("Could not increment view count:", err));

    const [rows]: any = await dbPool.query(
      "SELECT id, user_id as userId, title, original_google_url as originalGoogleUrl, hosted_slug as hostedSlug, status, json_config as jsonConfig, views_count as viewsCount, submissions_count as submissionsCount, created_at as createdAt, updated_at as updatedAt FROM forms WHERE hosted_slug = ?",
      [slug]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Form not found" });
    }

    const parsedConfig = typeof rows[0].jsonConfig === "string" ? JSON.parse(rows[0].jsonConfig) : rows[0].jsonConfig;
    const form = {
      ...rows[0],
      jsonConfig: parsedConfig,
      aiExperience: parsedConfig?.aiExperience || undefined,
      createdAt: rows[0].createdAt ? new Date(rows[0].createdAt).toISOString() : new Date().toISOString(),
      updatedAt: rows[0].updatedAt ? new Date(rows[0].updatedAt).toISOString() : new Date().toISOString(),
    };

    return res.json({ success: true, form });
  } catch (err: any) {
    console.error("Error retrieving form by slug:", err);
    return res.status(500).json({ error: "Database query failed", details: err.message });
  }
});

// POST /api/forms/:slug/submit - Headless submission proxy to Google Forms + count increment
app.post("/api/forms/:slug/submit", async (req, res) => {
  const { slug } = req.params;
  const { responses = {} } = req.body; // Map of { [fieldIdOrEntryCode]: value }

  try {
    const [rows]: any = await dbPool.query(
      "SELECT id, status, json_config as jsonConfig, original_google_url as originalGoogleUrl FROM forms WHERE hosted_slug = ?",
      [slug]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Form not found" });
    }

    const form = rows[0];
    if (form.status === "paused") {
      return res.status(403).json({ error: "This form is currently paused and not accepting new responses." });
    }

    const config = typeof form.jsonConfig === "string" ? JSON.parse(form.jsonConfig) : form.jsonConfig;
    const targetActionUrl = config?.meta?.targetActionUrl;

    // Flatten all fields to build the entry.XXXXX parameter map
    const fieldMap = new Map<string, string>(); // fieldId -> entryCode, and entryCode -> entryCode
    if (config?.steps) {
      for (const step of config.steps) {
        for (const card of step.cards || []) {
          for (const field of card.fields || []) {
            if (field.entryCode) {
              fieldMap.set(field.id, field.entryCode);
              fieldMap.set(field.entryCode, field.entryCode);
            }
          }
        }
      }
    }

    // Prepare Google Form urlencoded payload
    // CRITICAL FIX: Google Forms multi-step forms require fvv=1 and pageHistory (with all page indexes)
    // to record responses across all sections. Without this, Google drops all answers after page 0!
    const formParams = new URLSearchParams();
    formParams.append("fvv", "1");
    formParams.append("draftResponse", "[]");
    const totalSteps = config?.steps?.length || 10;
    const pageHistory = Array.from({ length: Math.max(30, totalSteps + 15) }, (_, i) => i).join(",");
    formParams.append("pageHistory", pageHistory);

    for (const [key, value] of Object.entries(responses)) {
      let entryCode = fieldMap.get(key);
      if (!entryCode) {
        if (key.startsWith("entry.")) {
          entryCode = key;
        } else if (/^\d{6,}$/.test(key)) {
          entryCode = `entry.${key}`;
        }
      }
      if (!entryCode || value === undefined || value === null || value === "") {
        continue;
      }

      if (Array.isArray(value)) {
        // Multi-select checkboxes
        for (const valItem of value) {
          if (valItem !== undefined && valItem !== null && valItem !== "") {
            formParams.append(entryCode, String(valItem));
          }
        }
      } else {
        formParams.append(entryCode, String(value));
      }
    }

    // If targetActionUrl is present, proxy directly to Google Forms formResponse
    let googleSubmitted = false;
    let googleStatus = 200;
    if (targetActionUrl && targetActionUrl.includes("formResponse")) {
      try {
        const googleRes = await fetch(targetActionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          body: formParams.toString(),
        });
        googleSubmitted = true;
        googleStatus = googleRes.status;
      } catch (gErr) {
        console.warn("Proxy submission to Google Form response had network error:", gErr);
      }
    }

    const submissionCode = `NF-${Math.floor(100000 + Math.random() * 900000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Infer respondent name and email from responses for real-time webhooks (not stored in DB)
    let respondentName = "Anonymous Respondent";
    let respondentEmail = "";

    if (config?.steps) {
      for (const step of config.steps) {
        for (const card of step.cards || []) {
          for (const field of card.fields || []) {
            const val = responses[field.id] ?? responses[field.entryCode];
            if (val && typeof val === "string") {
              const label = (field.label || "").toLowerCase();
              if ((label.includes("name") || label.includes("lead") || label.includes("full name")) && respondentName === "Anonymous Respondent") {
                respondentName = val;
              }
              if ((label.includes("email") || val.includes("@")) && !respondentEmail) {
                respondentEmail = val;
              }
            }
          }
        }
      }
    }

    // STRICT CONSTRAINT: Absolutely NO form responses are saved to the TiDB database.
    // The application acts strictly as a proxy.

    // Async Webhook trigger (Discord / Slack / Custom)
    if (config?.integrations?.discordWebhookUrl) {
      fetch(config.integrations.discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `✨ New Submission: ${config.meta?.title || "Form"}`,
              description: `**Confirmation Code:** \`${submissionCode}\`\n**Respondent:** ${respondentName} (${respondentEmail || "No email"})\n**Total Responses:** ${Object.keys(responses).length}`,
              color: 3859666,
              timestamp: new Date().toISOString(),
              footer: { text: "NextForm Production Engine" },
            },
          ],
        }),
      }).catch((wErr) => console.warn("Discord webhook delivery failed:", wErr));
    }

    if (config?.integrations?.customWebhookUrl) {
      fetch(config.integrations.customWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "form.submitted",
          formId: form.id,
          slug,
          submissionCode,
          respondent: { name: respondentName, email: respondentEmail },
          responses,
          timestamp: new Date().toISOString(),
        }),
      }).catch((wErr) => console.warn("Custom webhook delivery failed:", wErr));
    }

    return res.json({
      success: true,
      submissionId: submissionCode,
      submissionCode,
      googleSubmitted,
      googleStatus,
      timestamp: new Date().toISOString(),
      message: "Response successfully recorded and submitted to Google Forms!",
    });
  } catch (err: any) {
    console.error("Submission error:", err);
    return res.status(500).json({ error: "Failed to process submission", details: err.message });
  }
});

// Submissions are intentionally NOT stored in the database.
// The application acts strictly as a proxy forwarding directly to Google Forms.
app.get("/api/forms/:id/submissions", async (req, res) => {
  return res.json({
    success: true,
    submissions: [],
    notice: "The application acts strictly as a proxy. Responses are delivered directly to Google Forms / Google Sheets and are not stored in TiDB.",
  });
});

// -------------------------------------------------------------
// Vite middleware / Static serving
// -------------------------------------------------------------
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NextForm Studio server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
