import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { generateObject, generateText, streamText } from "ai";
import type { LanguageModel } from "ai";
import type { ZodType } from "zod";

export type AiProviderName = "openai" | "anthropic" | "google" | "openrouter";

const MAX_RETRIES = 2;

/** Strip inline `#` comments (common in .env files). */
function envValue(key: string, fallback = ""): string {
  const raw = process.env[key] ?? fallback;
  return raw.split("#")[0]?.trim() ?? fallback;
}

function getProviderName(): AiProviderName {
  const name = envValue("AI_PROVIDER", "openai").toLowerCase();
  if (name === "anthropic" || name === "google" || name === "openai" || name === "openrouter") {
    return name;
  }
  return "openai";
}

function requireEnv(key: string, provider: string): string {
  const value = envValue(key);
  if (!value) {
    throw new Error(`${key} is required when AI_PROVIDER=${provider}`);
  }
  return value;
}

function getOpenRouterProvider() {
  const apiKey = requireEnv("OPENROUTER_API_KEY", "openrouter");
  return createOpenAI({
    apiKey,
    baseURL: envValue("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
  });
}

export function getLanguageModel(): LanguageModel {
  const provider = getProviderName();
  switch (provider) {
    case "anthropic":
      requireEnv("ANTHROPIC_API_KEY", "anthropic");
      return anthropic(envValue("ANTHROPIC_MODEL", "claude-sonnet-4-20250514"));
    case "google":
      requireEnv("GOOGLE_GENERATIVE_AI_API_KEY", "google");
      return google(envValue("GOOGLE_MODEL", "gemini-2.0-flash"));
    case "openrouter": {
      const openrouter = getOpenRouterProvider();
      const modelId = envValue("OPENROUTER_MODEL", "google/gemini-2.0-flash-001");
      return openrouter(modelId);
    }
    default:
      requireEnv("OPENAI_API_KEY", "openai");
      return openai(envValue("OPENAI_MODEL", "gpt-4o-mini"));
  }
}

function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("rate limit") ||
    msg.includes("timeout") ||
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("overloaded")
  );
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES && isTransientError(error)) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export class LlmOrchestrator {
  async generateJson<T>(schema: ZodType<T>, prompt: string): Promise<T> {
    return withRetry(async () => {
      const { object } = await generateObject({
        model: getLanguageModel(),
        schema,
        prompt,
        mode: "json",
      });
      return object;
    });
  }

  async generateText(prompt: string): Promise<string> {
    return withRetry(async () => {
      const { text } = await generateText({
        model: getLanguageModel(),
        prompt,
      });
      return text;
    });
  }

  streamStory(prompt: string) {
    return streamText({
      model: getLanguageModel(),
      prompt,
    });
  }

  async embedText(text: string): Promise<number[]> {
    const provider = getProviderName();

    if (provider === "openrouter") {
      const embeddingModel = envValue(
        "OPENROUTER_EMBEDDING_MODEL",
        "openai/text-embedding-3-small",
      );
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({
        apiKey: requireEnv("OPENROUTER_API_KEY", "openrouter"),
        baseURL: envValue("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
      });
      const response = await withRetry(() =>
        client.embeddings.create({
          model: embeddingModel,
          input: text,
        }),
      );
      return response.data[0]?.embedding ?? [];
    }

    if (provider !== "openai" && !envValue("OPENAI_API_KEY")) {
      throw new Error(
        "Embeddings require OPENAI_API_KEY, or set AI_PROVIDER=openrouter with OPENROUTER_API_KEY",
      );
    }

    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY", "openai") });
    const response = await withRetry(() =>
      client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      }),
    );
    return response.data[0]?.embedding ?? [];
  }
}

export const llmOrchestrator = new LlmOrchestrator();
