import type { RagRecommendResponse, RagStoryResponse, RagUserProfile } from "@/lib/schemas/rag";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export async function fetchRagRecommend(profile: RagUserProfile) {
  return postJson<RagRecommendResponse>("/api/rag/recommend", profile);
}

export async function fetchRagStory(payload: {
  destinationName: string;
  attractionName?: string;
  style: RagStoryResponse["style"];
}) {
  return postJson<RagStoryResponse>("/api/rag/story", payload);
}

export type { RagRecommendResponse, RagUserProfile };
