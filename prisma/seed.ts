import dotenv from "dotenv";
dotenv.config({ path: ".env", override: true });

import { PrismaClient } from "../lib/generated/prisma/client";
import { getPrismaPgAdapter } from "../lib/db/postgres";
import { fallbackCatalog } from "../lib/fallback-catalog";
import { fallbackEvents } from "../lib/fallback-events";
import { fallbackHosts } from "../lib/fallback-hosts";

const prisma = new PrismaClient({ adapter: getPrismaPgAdapter() });

function vibeEnum(v: string) {
  return v.toUpperCase() as
    | "OFFBEAT"
    | "SPIRITUAL"
    | "ADVENTURE"
    | "FOODIE"
    | "HERITAGE"
    | "NATURE";
}

function budgetEnum(b: string) {
  return b.toUpperCase() as "BUDGET" | "MODERATE" | "PREMIUM" | "LUXURY";
}

async function main() {
  for (const dest of fallbackCatalog) {
    await prisma.destination.upsert({
      where: { id: dest.id },
      create: {
        id: dest.id,
        name: dest.name,
        state: dest.state,
        country: dest.country,
        description: dest.description,
        vibe: vibeEnum(dest.vibe),
        budgetLevel: budgetEnum(dest.budgetLevel),
        tags: [...dest.tags],
        heroImage: dest.heroImage,
        location: dest.location,
      },
      update: {
        name: dest.name,
        state: dest.state,
        description: dest.description,
        vibe: vibeEnum(dest.vibe),
        budgetLevel: budgetEnum(dest.budgetLevel),
        tags: [...dest.tags],
        heroImage: dest.heroImage,
        location: dest.location,
      },
    });

    for (const att of dest.attractions) {
      await prisma.attraction.upsert({
        where: { id: att.id },
        create: {
          id: att.id,
          destinationId: dest.id,
          name: att.name,
          description: att.description,
          category: att.category,
          hiddenGem: att.hiddenGem,
          tags: [...att.tags],
        },
        update: {
          name: att.name,
          description: att.description,
          category: att.category,
          hiddenGem: att.hiddenGem,
          tags: [...att.tags],
        },
      });
    }
  }

  for (const evt of fallbackEvents) {
    await prisma.event.upsert({
      where: { id: evt.id },
      create: {
        id: evt.id,
        destinationId: evt.destinationId,
        title: evt.title,
        description: evt.description,
        category: evt.category,
        eventDate: new Date(evt.eventDate),
      },
      update: {
        title: evt.title,
        description: evt.description,
        category: evt.category,
        eventDate: new Date(evt.eventDate),
      },
    });
  }

  for (const host of fallbackHosts) {
    await prisma.localHost.upsert({
      where: { id: host.id },
      create: {
        id: host.id,
        destinationId: host.destinationId,
        name: host.name,
        profession: host.profession,
        specialties: [...host.specialties],
        bio: host.bio,
      },
      update: {
        name: host.name,
        profession: host.profession,
        specialties: [...host.specialties],
        bio: host.bio,
      },
    });
  }

  console.log("Seeded destinations, attractions, events, and local hosts.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
