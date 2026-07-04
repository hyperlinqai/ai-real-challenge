import { createHash } from "crypto";

export function hashPrompt(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
