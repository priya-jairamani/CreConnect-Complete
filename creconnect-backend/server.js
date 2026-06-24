const http = require('http');
const app  = require('./src/app');
const { initSocket } = require('./src/config/socket');
const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');
const { PORT } = require('./src/config/env');

const server = http.createServer(app);
initSocket(server);

async function migrate() {
  // Idempotent column / enum additions — safe to run on every restart.

  // ── Pre-existing patches ────────────────────────────────────────────────────
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS location VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "websiteUrl" VARCHAR(255)`);
  await sequelize.query(`ALTER TYPE "enum_notifications_audience" ADD VALUE IF NOT EXISTS 'ADMINS'`);

  // ── creator_profiles: extended identity & contact ──────────────────────────
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "fullName"      VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "headline"      VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "timezone"      VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "nationality"   VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "gender"        VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "phone"         VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "portfolioLink" VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "mediaKitLink"  VARCHAR(255)`);

  // availabilityStatus enum
  await sequelize.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_creator_profiles_availabilityStatus') THEN
        CREATE TYPE "enum_creator_profiles_availabilityStatus" AS ENUM ('AVAILABLE','BUSY','ON_BREAK','NOT_ACCEPTING');
      END IF;
    END $$;
  `);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "availabilityStatus" "enum_creator_profiles_availabilityStatus" DEFAULT 'AVAILABLE'`);

  // ── creator_profiles: social handles ──────────────────────────────────────
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "linkedin"  VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "instagram" VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "tiktok"    VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "youtube"   VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "facebook"  VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "x"         VARCHAR(255)`);

  // ── creator_profiles: specialization arrays ────────────────────────────────
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "niches"                 VARCHAR(255)[] DEFAULT '{}'`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "contentFormats"         VARCHAR(255)[] DEFAULT '{}'`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "contentStyles"          VARCHAR(255)[] DEFAULT '{}'`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "preferredIndustries"    VARCHAR(255)[] DEFAULT '{}'`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "preferredCampaignTypes" VARCHAR(255)[] DEFAULT '{}'`);

  // ── creator_profiles: rates & collaboration preferences ───────────────────
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "budgetMin"          FLOAT DEFAULT 0`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "budgetMax"          FLOAT DEFAULT 0`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "collaborationStyle" VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "remoteOnsite"       VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "travelAvailability" VARCHAR(255)`);

  // ── brand_profiles: extended company info ─────────────────────────────────
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "tagline"            VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "description"        TEXT`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "foundedYear"        INTEGER`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "brandColor"         VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "legalName"          VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "registrationNumber" VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "taxId"              VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "vatNumber"          VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "businessAddress"    TEXT`);

  // ── brand_profiles: public profile visibility ─────────────────────────────
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "publicProfileVisible"     BOOLEAN DEFAULT true`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "displayTeamMembers"       BOOLEAN DEFAULT true`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "displayCampaignResults"   BOOLEAN DEFAULT true`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "displayReviews"           BOOLEAN DEFAULT true`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "displayBudgetRanges"      BOOLEAN DEFAULT false`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "displayContactInfo"       BOOLEAN DEFAULT false`);

  // ── brand_profiles: targeting preferences ────────────────────────────────
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "preferredCategories" VARCHAR(255)[] DEFAULT '{}'`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "preferredPlatforms"  VARCHAR(255)[] DEFAULT '{}'`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "audienceAgeMin"      INTEGER DEFAULT 18`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "audienceAgeMax"      INTEGER DEFAULT 34`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "audienceGenders"     VARCHAR(255)[] DEFAULT '{}'`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "audienceCountries"   VARCHAR(255)[] DEFAULT '{}'`);

  // ── brand_profiles: campaign defaults & budget ────────────────────────────
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "defaultBudgetMin" FLOAT DEFAULT 0`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "defaultBudgetMax" FLOAT DEFAULT 0`);

  // ── brand_profiles: brand safety ─────────────────────────────────────────
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "blockedCategories" VARCHAR(255)[] DEFAULT '{}'`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "contentGuidelines" TEXT`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "fraudDetection"    BOOLEAN DEFAULT true`);

  // ── brand_profiles: notification & automation ─────────────────────────────
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "notificationCategories" JSONB DEFAULT '{}'`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "notificationChannels"   JSONB DEFAULT '{}'`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "autoApproveCreators"    BOOLEAN DEFAULT false`);
  await sequelize.query(`ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS "autoSendInvites"        BOOLEAN DEFAULT false`);

  // ── banner images ──────────────────────────────────────────────────────────
  await sequelize.query(`ALTER TABLE brand_profiles   ADD COLUMN IF NOT EXISTS "bannerUrl" VARCHAR(255)`);
  await sequelize.query(`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "bannerUrl" VARCHAR(255)`);

  // ── ai_matches table (hybrid recommender engine) ───────────────────────────
  await sequelize.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_ai_matches_method') THEN
        CREATE TYPE "enum_ai_matches_method" AS ENUM ('content-based', 'hybrid');
      END IF;
    END $$;
  `);
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ai_matches (
      id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "brandId"          UUID NOT NULL,
      "creatorId"        UUID NOT NULL,
      "matchScore"       FLOAT NOT NULL DEFAULT 0,
      breakdown          JSONB DEFAULT '{}',
      method             "enum_ai_matches_method" DEFAULT 'content-based',
      weights            JSONB DEFAULT '{}',
      "feedbackAccepted" BOOLEAN DEFAULT NULL,
      "feedbackAt"       TIMESTAMPTZ DEFAULT NULL,
      "generatedAt"      TIMESTAMPTZ DEFAULT NOW(),
      "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE ("brandId", "creatorId")
    )
  `);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_ai_matches_brand_score  ON ai_matches ("brandId", "matchScore" DESC)`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_ai_matches_creator      ON ai_matches ("creatorId")`);
}

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected');
    await migrate();

    server.listen(PORT, () => {
      logger.info(`CreConnect API running on http://localhost:${PORT}/api/v1`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await sequelize.close();
    process.exit(0);
  });
});

start();
