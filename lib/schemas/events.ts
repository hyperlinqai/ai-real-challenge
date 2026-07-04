import { z } from "zod";
import { TRAVEL_VIBES } from "@/types/travel";

export const eventsRequestSchema = z.object({
  destinationId: z.string(),
  interests: z.array(z.string()).default([]),
  vibe: z.enum(TRAVEL_VIBES).optional(),
});

export const eventRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  eventDate: z.string(),
  whyItSuitsTraveler: z.string(),
});

export const eventsResponseSchema = z.object({
  destinationName: z.string(),
  events: z.array(eventRecommendationSchema).min(1),
});

export type EventsRequest = z.infer<typeof eventsRequestSchema>;
export type EventsResponse = z.infer<typeof eventsResponseSchema>;
