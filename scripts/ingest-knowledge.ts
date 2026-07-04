import dotenv from "dotenv";
dotenv.config({ path: ".env", override: true });

import { prisma } from "../lib/prisma";
import { embeddingService } from "../services/embeddings/embedding.service";
import { databaseService } from "../services/database/database.service";
import type { KnowledgeSourceType } from "../lib/generated/prisma/client";

async function upsertDoc(input: {
  source: KnowledgeSourceType;
  externalKey: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  destinationName?: string;
}) {
  const text = `${input.title}. ${input.summary}. ${input.description}. Tags: ${input.tags.join(", ")}`;
  let embedding: number[] = [];
  try {
    embedding = await embeddingService.embed(text);
  } catch {
    /* optional without API key */
  }

  await prisma.knowledgeDocument.upsert({
    where: {
      source_externalKey: { source: input.source, externalKey: input.externalKey },
    },
    create: { ...input, embedding },
    update: {
      title: input.title,
      summary: input.summary,
      description: input.description,
      tags: input.tags,
      destinationName: input.destinationName,
      embedding,
    },
  });
}

async function main() {
  const catalog = await databaseService.getDestinationCatalog();
  let count = 0;

  for (const dest of catalog) {
    await upsertDoc({
      source: "LOCAL_DATABASE",
      externalKey: `dest:${dest.id}`,
      title: dest.name,
      summary: dest.description.slice(0, 300),
      description: dest.description,
      tags: [...dest.tags, dest.vibe],
      destinationName: dest.name,
    });
    count++;

    for (const att of dest.attractions) {
      await upsertDoc({
        source: att.hiddenGem ? "HIDDEN_GEMS" : "ATTRACTION",
        externalKey: `att:${att.id}`,
        title: att.name,
        summary: att.description.slice(0, 300),
        description: att.description,
        tags: [...att.tags, att.category, att.hiddenGem ? "hidden_gem" : "attraction"],
        destinationName: dest.name,
      });
      count++;
    }
  }

  await prisma.ingestionLog.create({
    data: {
      source: "local-sync",
      status: "success",
      itemCount: count,
      message: "Synced destinations and attractions into knowledge_documents",
    },
  });

  console.log(`Ingested ${count} knowledge documents.`);
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.ingestionLog
      .create({
        data: { source: "local-sync", status: "error", message: String(e) },
      })
      .catch(() => undefined);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
