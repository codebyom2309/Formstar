-- =====================================================================
-- NextForm Studio - MySQL / TiDB Serverless Database Schema (Phase 1)
-- =====================================================================

-- 1. USERS TABLE (NextAuth / Auth.js Compatible)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `email_verified` TIMESTAMP(3) NULL,
  `image` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ACCOUNTS TABLE (Google OAuth Provider Credentials)
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `provider` VARCHAR(255) NOT NULL,
  `provider_account_id` VARCHAR(255) NOT NULL,
  `refresh_token` TEXT NULL,
  `access_token` TEXT NULL,
  `expires_at` INT NULL,
  `token_type` VARCHAR(255) NULL,
  `scope` VARCHAR(255) NULL,
  `id_token` TEXT NULL,
  `session_state` VARCHAR(255) NULL,
  INDEX `idx_accounts_user_id` (`user_id`),
  UNIQUE KEY `uniq_provider_account` (`provider`, `provider_account_id`),
  CONSTRAINT `fk_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. FORMS TABLE (Core Storage for Google Forms, Slugs, & WYSIWYG JSON Tree)
CREATE TABLE IF NOT EXISTS `forms` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `original_google_url` TEXT NOT NULL,
  `hosted_slug` VARCHAR(120) NOT NULL UNIQUE,
  `status` ENUM('active', 'paused') DEFAULT 'active' NOT NULL,
  `json_config` JSON NOT NULL,
  `views_count` INT DEFAULT 0 NOT NULL,
  `submissions_count` INT DEFAULT 0 NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_forms_user_id` (`user_id`),
  INDEX `idx_forms_status` (`status`),
  UNIQUE KEY `uniq_forms_hosted_slug` (`hosted_slug`),
  CONSTRAINT `fk_forms_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OPTIONAL SEED DATA FOR IMMEDIATE TESTING:
-- INSERT INTO `users` (`id`, `name`, `email`, `image`) 
-- VALUES ('demo-user-1', 'Demo Creator', 'creator@nextform.studio', 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator');
