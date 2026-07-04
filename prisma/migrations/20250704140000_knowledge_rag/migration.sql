-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('WIKIPEDIA', 'WIKIVOYAGE', 'LOCAL_DATABASE', 'HIDDEN_GEMS', 'EVENTS', 'TRAVEL_TIPS', 'STORY', 'HOST', 'ATTRACTION');

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" TEXT NOT NULL,
    "source" "KnowledgeSourceType" NOT NULL,
    "external_key" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "destination_name" TEXT,
    "embedding" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingestion_logs" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "item_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingestion_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "knowledge_documents_destination_name_idx" ON "knowledge_documents"("destination_name");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_documents_source_external_key_key" ON "knowledge_documents"("source", "external_key");
