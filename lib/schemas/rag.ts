import { z } from "zod";
import { BUDGET_LEVELS, TRAVEL_VIBES, STORY_STYLES } from "@/types/travel";

export const ragUserProfileSchema = z.object({
  interests: z.array(z.string().min(1)).min(1).max(12),
  budget: z.enum(BUDGET_LEVELS),
  budgetInr: z.number().positive().optional(),
  travelDays: z.number().int().min(1).max(30),
  vibe: z.enum(TRAVEL_VIBES),
  groupSize: z.number().int().min(1).max(20),
  preferredWeather: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  destinationHint: z.string().optional(),
});

export const knowledgeSearchQuerySchema = z.object({
  q: z.string().min(1),
  destination: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

export const groundedSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  sources: z.array(z.string()),
});

export const ragRecommendResponseSchema = z.object({
  summary: z.string(),
  destination: z.object({
    name: z.string(),
    state: z.string(),
    country: z.string(),
  }),
  whyItMatches: z.string(),
  suggestedItinerary: z.array(
    z.object({
      day: z.number().int(),
      plan: z.string(),
    }),
  ),
  bestExperiences: z.array(z.string()),
  thingsToAvoid: z.array(z.string()),
  localEtiquette: z.array(z.string()),
  bestTimeToVisit: z.string(),
  estimatedBudgetInr: z.number().positive(),
  sections: z.object({
    overview: groundedSectionSchema,
    history: groundedSectionSchema,
    hiddenGems: groundedSectionSchema,
    culturalExperiences: groundedSectionSchema,
    localFood: groundedSectionSchema,
    events: groundedSectionSchema,
    nearbyAttractions: groundedSectionSchema,
    travelTips: groundedSectionSchema,
  }),
  sources: z.array(z.string()),
});

export const ragStoryRequestSchema = z.object({
  destinationName: z.string().min(1),
  attractionName: z.string().optional(),
  style: z.enum([...STORY_STYLES, "documentary"] as const),
});

export const ragStoryResponseSchema = z.object({
  title: z.string(),
  style: z.string(),
  wordCount: z.number().int(),
  story: z.string().min(200),
  narrationTips: z.array(z.string()),
  sources: z.array(z.string()),
});

export type RagStoryResponse = z.infer<typeof ragStoryResponseSchema>;
export type RagUserProfile = z.infer<typeof ragUserProfileSchema>;
export type RagRecommendResponse = z.infer<typeof ragRecommendResponseSchema>;
