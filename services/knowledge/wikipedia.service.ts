import type { KnowledgeProvider, KnowledgeResult } from "@/types/knowledge";
import { hashPrompt } from "@/utils/hash";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";

type WikiSearchResponse = {
  query?: { search?: { title: string; snippet: string; pageid: number }[] };
};

type WikiExtractResponse = {
  query?: { pages?: Record<string, { extract?: string; title?: string }> };
};

async function getWikiCache(key: string): Promise<string | null> {
  if (!(await isDatabaseAvailable())) return null;
  const row = await prisma.cachedAiResponse.findUnique({
    where: { promptHash: hashPrompt(key) },
  });
  return row?.response ?? null;
}

async function setWikiCache(key: string, value: string): Promise<void> {
  if (!(await isDatabaseAvailable())) return;
  const promptHash = hashPrompt(key);
  await prisma.cachedAiResponse
    .upsert({
      where: { promptHash },
      create: { promptHash, response: value },
      update: { response: value },
    })
    .catch(() => undefined);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

abstract class MediaWikiProvider implements KnowledgeProvider {
  abstract readonly name: KnowledgeResult["source"];
  abstract readonly baseUrl: string;

  async search(
    query: string,
    options?: { destination?: string; limit?: number },
  ): Promise<KnowledgeResult[]> {
    const limit = options?.limit ?? 3;
    const searchTerm = options?.destination
      ? `${options.destination} ${query}`.trim()
      : query;
    const cacheKey = `${this.baseUrl}:${searchTerm}:${limit}`;
    const cached = await getWikiCache(cacheKey);
    if (cached) {
      return JSON.parse(cached) as KnowledgeResult[];
    }

    const searchUrl = new URL(`${this.baseUrl}/w/api.php`);
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("list", "search");
    searchUrl.searchParams.set("srsearch", searchTerm);
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("origin", "*");
    searchUrl.searchParams.set("srlimit", String(limit));

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) return [];
    const searchJson = (await searchRes.json()) as WikiSearchResponse;
    const hits = searchJson.query?.search ?? [];
    if (hits.length === 0) return [];

    const titles = hits.map((h) => h.title).join("|");
    const extractUrl = new URL(`${this.baseUrl}/w/api.php`);
    extractUrl.searchParams.set("action", "query");
    extractUrl.searchParams.set("prop", "extracts");
    extractUrl.searchParams.set("explaintext", "1");
    extractUrl.searchParams.set("exintro", "1");
    extractUrl.searchParams.set("titles", titles);
    extractUrl.searchParams.set("format", "json");
    extractUrl.searchParams.set("origin", "*");

    const extractRes = await fetch(extractUrl.toString());
    if (!extractRes.ok) return [];
    const extractJson = (await extractRes.json()) as WikiExtractResponse;
    const pages = extractJson.query?.pages ?? {};

    const results: KnowledgeResult[] = hits.map((hit) => {
      const page = Object.values(pages).find((p) => p.title === hit.title);
      const extract = page?.extract ?? stripHtml(hit.snippet);
      const url = `${this.baseUrl}/wiki/${encodeURIComponent(hit.title.replace(/ /g, "_"))}`;
      return {
        id: `${this.name}-${hit.pageid}`,
        title: hit.title,
        summary: extract.slice(0, 320),
        description: extract.slice(0, 2000),
        tags: [this.name.toLowerCase()],
        source: this.name,
        url,
        destinationName: options?.destination,
      };
    });

    await setWikiCache(cacheKey, JSON.stringify(results));
    return results;
  }
}

export class WikipediaService extends MediaWikiProvider {
  readonly name = "Wikipedia" as const;
  readonly baseUrl = "https://en.wikipedia.org";
}

export class WikivoyageService extends MediaWikiProvider {
  readonly name = "Wikivoyage" as const;
  readonly baseUrl = "https://en.wikivoyage.org";
}

export const wikipediaService = new WikipediaService();
export const wikivoyageService = new WikivoyageService();
