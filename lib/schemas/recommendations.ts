import { z } from "zod";
import { BUDGET_LEVELS, TRAVEL_VIBES } from "@/types/travel";

export const travelPreferencesSchema = z.object({
  interests: z.array(z.string().min(1)).min(1).max(12),
  budget: z.enum(BUDGET_LEVELS),
  travelDays: z.number().int().min(1).max(30),
  vibe: z.enum(TRAVEL_VIBES),
});

export const recommendedAttractionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  hiddenGem: z.boolean().optional(),
  whyItMatches: z.string(),
});

export const recommendedDestinationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  state: z.string(),
  country: z.string(),
  whyItMatches: z.string(),
  estimatedBudgetInr: z.number().positive(),
  suggestedDurationDays: z.number().int().positive(),
  highlights: z.array(z.string()).min(1),
  attractions: z.array(recommendedAttractionSchema).min(1),
  hiddenGems: z.array(recommendedAttractionSchema).min(0),
});

export const recommendationResponseSchema = z.object({
  summary: z.string(),
  destinations: z.array(recommendedDestinationSchema).min(1).max(5),
});

export type RecommendationResponse = z.infer<typeof recommendationResponseSchema>;
export type TravelPreferencesInput = z.infer<typeof travelPreferencesSchema>;
