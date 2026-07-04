export type KnowledgeSourceLabel =
  | "Wikipedia"
  | "Wikivoyage"
  | "Local Database"
  | "Hidden Gems"
  | "Events"
  | "Travel Tips";

export type KnowledgeResult = {
  id: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  source: KnowledgeSourceLabel;
  url?: string;
  relevanceScore?: number;
  destinationName?: string;
};

export interface KnowledgeProvider {
  readonly name: KnowledgeSourceLabel;
  search(query: string, options?: { destination?: string; limit?: number }): Promise<KnowledgeResult[]>;
}

export type GroundedContext = {
  destination: string;
  history: string;
  culture: string;
  hidden_gems: KnowledgeResult[];
  events: KnowledgeResult[];
  food: string[];
  travel_tips: string[];
  nearby_attractions: KnowledgeResult[];
  sources: KnowledgeSourceLabel[];
  rawSnippets: KnowledgeResult[];
};

export type ProviderErrorLog = {
  provider: string;
  message: string;
};
