import { z } from "zod";
import { TRAVEL_VIBES } from "@/types/travel";

export const hostsRequestSchema = z.object({
  destinationId: z.string(),
  interests: z.array(z.string()).default([]),
  vibe: z.enum(TRAVEL_VIBES).optional(),
});

export const hostMatchSchema = z.object({
  id: z.string(),
  name: z.string(),
  profession: z.string(),
  specialties: z.array(z.string()),
  personalizedExplanation: z.string(),
});

export const hostsResponseSchema = z.object({
  destinationName: z.string(),
  hosts: z.array(hostMatchSchema).min(1),
});

export type HostsRequest = z.infer<typeof hostsRequestSchema>;
export type HostsResponse = z.infer<typeof hostsResponseSchema>;
