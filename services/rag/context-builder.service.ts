import type { GroundedContext, KnowledgeResult } from "@/types/knowledge";
import type { RagUserProfile } from "@/lib/schemas/rag";

export class ContextBuilder {
  build(params: {
    profile: RagUserProfile;
    retrieval: KnowledgeResult[];
    primaryDestination?: string;
  }): GroundedContext {
    const destination =
      params.primaryDestination ??
      params.profile.destinationHint ??
      params.retrieval.find((r) => r.destinationName)?.destinationName ??
      "India";

    const bySource = (source: KnowledgeResult["source"]) =>
      params.retrieval.filter((r) => r.source === source);

    const wikipedia = bySource("Wikipedia");
    const wikivoyage = bySource("Wikivoyage");
    const hiddenGems = params.retrieval.filter(
      (r) => r.source === "Hidden Gems" || r.tags.includes("hidden_gem"),
    );
    const events = bySource("Events");
    const local = bySource("Local Database");

    const history = wikipedia[0]?.description ?? local[0]?.description ?? "";
    const culture = wikivoyage[0]?.description ?? wikipedia[1]?.description ?? "";

    const food = params.retrieval
      .filter((r) =>
        [...r.tags, r.title, r.description].join(" ").toLowerCase().includes("food"),
      )
      .slice(0, 6)
      .map((r) => r.title);

    const travel_tips = wikivoyage
      .flatMap((r) => r.description.split(".").slice(0, 3))
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);

    const sources = Array.from(new Set(params.retrieval.map((r) => r.source)));

    return {
      destination,
      history: history.slice(0, 1500),
      culture: culture.slice(0, 1500),
      hidden_gems: hiddenGems.slice(0, 8),
      events: events.slice(0, 6),
      food,
      travel_tips,
      nearby_attractions: local.slice(0, 8),
      sources,
      rawSnippets: params.retrieval.slice(0, 24),
    };
  }

  toPromptContext(context: GroundedContext): string {
    return JSON.stringify(
      {
        destination: context.destination,
        history: context.history,
        culture: context.culture,
        hidden_gems: context.hidden_gems.map((g) => ({
          title: g.title,
          summary: g.summary,
          source: g.source,
        })),
        events: context.events.map((e) => ({
          title: e.title,
          summary: e.summary,
          source: e.source,
        })),
        food: context.food,
        travel_tips: context.travel_tips,
        nearby_attractions: context.nearby_attractions.map((a) => ({
          title: a.title,
          summary: a.summary,
        })),
        sources: context.sources,
      },
      null,
      2,
    );
  }
}

export const contextBuilder = new ContextBuilder();
