import { z } from "zod";
import { STORY_STYLES } from "@/types/travel";

export const storyRequestSchema = z.object({
  attractionId: z.string().optional(),
  attractionName: z.string().min(1),
  destinationName: z.string().min(1),
  style: z.enum(STORY_STYLES),
});

export const storyResponseSchema = z.object({
  title: z.string(),
  style: z.enum(STORY_STYLES),
  wordCount: z.number().int().positive(),
  story: z.string().min(200),
  narrationTips: z.array(z.string()).min(1),
});

export type StoryRequest = z.infer<typeof storyRequestSchema>;
export type StoryResponse = z.infer<typeof storyResponseSchema>;
