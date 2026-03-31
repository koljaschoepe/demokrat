-- Phase 017: Baseline Migration
-- Extensions for crypto and trigram search

CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA extensions;
