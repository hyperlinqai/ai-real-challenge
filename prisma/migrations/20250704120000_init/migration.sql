-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BudgetLevel" AS ENUM ('BUDGET', 'MODERATE', 'PREMIUM', 'LUXURY');

-- CreateEnum
CREATE TYPE "TravelVibe" AS ENUM ('OFFBEAT', 'SPIRITUAL', 'ADVENTURE', 'FOODIE', 'HERITAGE', 'NATURE');

-- CreateTable
CREATE TABLE "destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "description" TEXT NOT NULL,
    "vibe" "TravelVibe" NOT NULL,
    "budget_level" "BudgetLevel" NOT NULL,
    "tags" TEXT[],
    "hero_image" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attractions" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "hidden_gem" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "tags" TEXT[],
    "embedding" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],

    CONSTRAINT "attractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_hosts" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specialties" TEXT[],
    "bio" TEXT NOT NULL,

    CONSTRAINT "local_hosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cached_ai_responses" (
    "id" TEXT NOT NULL,
    "prompt_hash" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cached_ai_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attractions_destination_id_idx" ON "attractions"("destination_id");

-- CreateIndex
CREATE INDEX "events_destination_id_idx" ON "events"("destination_id");

-- CreateIndex
CREATE INDEX "local_hosts_destination_id_idx" ON "local_hosts"("destination_id");

-- CreateIndex
CREATE UNIQUE INDEX "cached_ai_responses_prompt_hash_key" ON "cached_ai_responses"("prompt_hash");

-- AddForeignKey
ALTER TABLE "attractions" ADD CONSTRAINT "attractions_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_hosts" ADD CONSTRAINT "local_hosts_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Optional on servers with pgvector installed (enables native vector index):
-- CREATE EXTENSION IF NOT EXISTS vector;
