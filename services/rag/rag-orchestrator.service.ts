import {
  ragRecommendResponseSchema,
  ragStoryResponseSchema,
  type RagUserProfile,
} from "@/lib/schemas/rag";
import { knowledgeService } from "@/services/knowledge/knowledge.service";
import { contextBuilder } from "@/services/rag/context-builder.service";
import { llmOrchestrator } from "@/services/llm/orchestrator";
import { aiCacheService } from "@/services/cache/ai-cache.service";
import { isDatabaseAvailable } from "@/lib/prisma";
import { eventsService } from "@/services/events/events.service";
import { hiddenGemsService } from "@/services/hidden-gems/hidden-gems.service";
import { databaseService } from "@/services/database/database.service";
import { fallbackCatalog } from "@/lib/fallback-catalog";

function buildSemanticQuery(profile: RagUserProfile): string {
  return [
    `Travel interests: ${profile.interests.join(", ")}`,
    `Vibe: ${profile.vibe}`,
    `Budget tier: ${profile.budget}`,
    profile.budgetInr ? `Budget INR: ${profile.budgetInr}` : "",
    `${profile.travelDays} days`,
    profile.preferredWeather ? `Weather: ${profile.preferredWeather}` : "",
    profile.accessibilityNeeds ? `Accessibility: ${profile.accessibilityNeeds}` : "",
    "India destinations hidden gems culture food history",
  ]
    .filter(Boolean)
    .join(". ");
}

const RAG_RECOMMEND_PROMPT = (ctx: string, profileJson: string) => `
You are a grounded India travel planner. Use ONLY facts from RETRIEVED_CONTEXT. Do not invent places, prices, or dates not supported by context. If data is missing, say "Not in retrieved sources" briefly.

USER_PROFILE:
${profileJson}

RETRIEVED_CONTEXT:
${ctx}

Return JSON matching this shape exactly:
{
  "summary": "string",
  "destination": { "name": "string", "state": "string", "country": "India" },
  "whyItMatches": "string",
  "suggestedItinerary": [{ "day": 1, "plan": "string" }],
  "bestExperiences": ["string"],
  "thingsToAvoid": ["string"],
  "localEtiquette": ["string"],
  "bestTimeToVisit": "string",
  "estimatedBudgetInr": number,
  "sections": {
    "overview": { "title": "Overview", "content": "string", "sources": ["string"] },
    "history": { "title": "History", "content": "string", "sources": ["string"] },
    "hiddenGems": { "title": "Hidden Gems", "content": "string", "sources": ["string"] },
    "culturalExperiences": { "title": "Cultural Experiences", "content": "string", "sources": ["string"] },
    "localFood": { "title": "Local Food", "content": "string", "sources": ["string"] },
    "events": { "title": "Events", "content": "string", "sources": ["string"] },
    "nearbyAttractions": { "title": "Nearby Attractions", "content": "string", "sources": ["string"] },
    "travelTips": { "title": "Travel Tips", "content": "string", "sources": ["string"] }
  },
  "sources": ["Wikipedia", "Wikivoyage", "Local Database"]
}

Each section's sources must list only providers actually used for that section.
`.trim();

const RAG_STORY_PROMPT = (ctx: string, destination: string, style: string, place: string) => `
Write a ${style} travel story for ${place}, ${destination}.
Use ONLY facts from RETRIEVED_CONTEXT. No invented historical claims.

RETRIEVED_CONTEXT:
${ctx}

Return JSON:
{
  "title": "string",
  "style": "${style}",
  "wordCount": number,
  "story": "200-400 words",
  "narrationTips": ["string"],
  "sources": ["string"]
}
`.trim();

export class RagOrchestratorService {
  async recommend(profile: RagUserProfile) {
    const semanticQuery = buildSemanticQuery(profile);
    const destinationHint = profile.destinationHint;

    const [{ results }, gems, catalog] = await Promise.all([
      knowledgeService.searchAll({
        query: semanticQuery,
        destination: destinationHint,
        limitPerProvider: 6,
      }),
      hiddenGemsService
        .findGems({
          interests: profile.interests,
          vibe: profile.vibe,
          destinationName: destinationHint,
          limit: 6,
        })
        .catch(() => null),
      databaseService.getDestinationCatalog(),
    ]);

    const gemResults = (gems?.gems ?? []).map((g) => ({
      id: g.id,
      title: g.name,
      summary: g.description,
      description: g.description,
      tags: [g.category, "hidden_gem"],
      source: "Hidden Gems" as const,
      destinationName: gems?.destinationName,
    }));

    const merged = knowledgeService.rankResults([...results, ...gemResults]);

    const primaryDest =
      destinationHint ??
      catalog[0]?.name ??
      fallbackCatalog[0]?.name ??
      "Jaipur";

    const destRecord = catalog.find(
      (d) => d.name.toLowerCase() === primaryDest.toLowerCase(),
    );
    if (destRecord?.id) {
      const evt = await eventsService
        .recommendEvents({
          destinationId: destRecord.id,
          interests: profile.interests,
          vibe: profile.vibe,
        })
        .catch(() => null);
      if (evt) {
        for (const e of evt.events) {
          merged.push({
            id: e.id,
            title: e.title,
            summary: e.description,
            description: e.description,
            tags: [e.category, "event"],
            source: "Events",
            destinationName: evt.destinationName,
          });
        }
      }
    }

    const contextJson = contextBuilder.toPromptContext(
      contextBuilder.build({ profile, retrieval: merged, primaryDestination: primaryDest }),
    );
    const profileJson = JSON.stringify(profile);
    const prompt = RAG_RECOMMEND_PROMPT(contextJson, profileJson);

    if (await isDatabaseAvailable()) {
      const cached = await aiCacheService.get<unknown>(prompt).catch(() => null);
      if (cached) return ragRecommendResponseSchema.parse(cached);
    }

    const response = await llmOrchestrator.generateJson(ragRecommendResponseSchema, prompt);
    if (await isDatabaseAvailable()) {
      await aiCacheService.set(prompt, response).catch(() => undefined);
    }
    return response;
  }

  async generateStory(params: {
    destinationName: string;
    attractionName?: string;
    style: string;
  }) {
    const place = params.attractionName ?? params.destinationName;
    const { results } = await knowledgeService.searchAll({
      query: `${place} ${params.destinationName} history culture legends`,
      destination: params.destinationName,
      limitPerProvider: 4,
    });

    const context = contextBuilder.build({
      profile: {
        interests: ["history", "culture"],
        budget: "moderate",
        travelDays: 3,
        vibe: "heritage",
        groupSize: 1,
      },
      retrieval: results,
      primaryDestination: params.destinationName,
    });

    const prompt = RAG_STORY_PROMPT(
      contextBuilder.toPromptContext(context),
      params.destinationName,
      params.style,
      place,
    );

    if (await isDatabaseAvailable()) {
      const cached = await aiCacheService.get<unknown>(prompt).catch(() => null);
      if (cached) return ragStoryResponseSchema.parse(cached);
    }

    const response = await llmOrchestrator.generateJson(ragStoryResponseSchema, prompt);
    if (await isDatabaseAvailable()) {
      await aiCacheService.set(prompt, response).catch(() => undefined);
    }
    return response;
  }
}

export const ragOrchestratorService = new RagOrchestratorService();
