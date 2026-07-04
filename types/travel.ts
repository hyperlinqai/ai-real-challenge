export const TRAVEL_VIBES = [
  "offbeat",
  "spiritual",
  "adventure",
  "foodie",
  "heritage",
  "nature",
] as const;

export type TravelVibe = (typeof TRAVEL_VIBES)[number];

export const BUDGET_LEVELS = ["budget", "moderate", "premium", "luxury"] as const;
export type BudgetLevel = (typeof BUDGET_LEVELS)[number];

export const STORY_STYLES = [
  "historical",
  "mythological",
  "kids",
  "adventure",
  "poetic",
  "documentary",
] as const;

export type StoryStyle = (typeof STORY_STYLES)[number];

export type TravelPreferences = {
  interests: string[];
  budget: BudgetLevel;
  travelDays: number;
  vibe: TravelVibe;
};
