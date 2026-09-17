import React, { useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { X, Copy, Check, Database, Code, ShieldCheck } from "lucide-react";

export const SQL_QUERIES = `-- =====================================================================
-- NextForm Studio - MySQL / TiDB Serverless Database Schema (Phase 1)
-- =====================================================================

-- 1. USERS TABLE (NextAuth / Auth.js Compatible)
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

-- 2. ACCOUNTS TABLE (Google OAuth Provider Credentials)
CREATE TABLE IF NOT EXISTS \`accounts\` (
  \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
  \`user_id\` VARCHAR(191) NOT NULL,
  \`type\` VARCHAR(255) NOT NULL,
  \`provider\` VARCHAR(255) NOT NULL,
  \`provider_account_id\` VARCHAR(255) NOT NULL,
  \`refresh_token\` TEXT NULL,
  \`access_token\` TEXT NULL,
  \`expires_at\` INT NULL,
  \`token_type\` VARCHAR(255) NULL,
  \`scope\` VARCHAR(255) NULL,
  \`id_token\` TEXT NULL,
  \`session_state\` VARCHAR(255) NULL,
  INDEX \`idx_accounts_user_id\` (\`user_id\`),
  UNIQUE KEY \`uniq_provider_account\` (\`provider\`, \`provider_account_id\`),
  CONSTRAINT \`fk_accounts_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. FORMS TABLE (Core Storage for Google Forms, Slugs, & WYSIWYG JSON Tree)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

export const SqlSchemaModal: React.FC = () => {
  const { isSqlModalOpen, setIsSqlModalOpen } = useDashboardStore();
  const [copied, setCopied] = useState(false);

  if (!isSqlModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_QUERIES);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                MySQL / TiDB Serverless Schema Queries
              </h3>
              <p className="text-xs text-slate-500">
                Run these SQL DDL queries in your MySQL or TiDB Serverless console
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSqlModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Badges */}
        <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 flex flex-wrap items-center gap-4 text-xs text-blue-800">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            NextAuth &amp; MySQL 8.0 / TiDB Serverless compatible
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Code className="w-4 h-4 text-blue-600" />
            JSON column for form schema state
          </span>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-900 text-slate-100">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
            {SQL_QUERIES}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            File available at root: <code>/schema.sql</code>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSqlModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy SQL Queries</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
