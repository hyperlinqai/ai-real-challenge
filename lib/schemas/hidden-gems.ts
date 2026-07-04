import { z } from "zod";
import { TRAVEL_VIBES } from "@/types/travel";

export const hiddenGemsRequestSchema = z.object({
  destinationId: z.string().optional(),
  destinationName: z.string().optional(),
  interests: z.array(z.string()).min(1),
  vibe: z.enum(TRAVEL_VIBES),
  limit: z.number().int().min(1).max(12).default(6),
});

export const hiddenGemItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  personalizedReason: z.string(),
  similarityScore: z.number().min(0).max(1).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export const hiddenGemsResponseSchema = z.object({
  destinationName: z.string(),
  gems: z.array(hiddenGemItemSchema).min(1),
  curatorNote: z.string(),
});

export type HiddenGemsRequest = z.infer<typeof hiddenGemsRequestSchema>;
export type HiddenGemsResponse = z.infer<typeof hiddenGemsResponseSchema>;
