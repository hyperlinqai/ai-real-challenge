#!/usr/bin/env node
/**
 * Recover TypeScript sources from Next.js/Turbopack .js.map files.
 * Usage: node scripts/recover-from-sourcemaps.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NEXT_DIR = path.join(ROOT, ".next");

function walkMaps(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkMaps(full, out);
    else if (name.endsWith(".js.map") || name.endsWith(".css.map")) out.push(full);
  }
  return out;
}

function toProjectPath(sourceUrl) {
  if (!sourceUrl) return null;
  let p = sourceUrl;
  if (p.startsWith("file://")) p = fileURLToPath(p);
  // Turbopack often uses [project]/relative/path
  const projectIdx = p.indexOf("[project]/");
  if (projectIdx >= 0) {
    p = p.slice(projectIdx + "[project]/".length);
  }
  const rootName = path.basename(ROOT);
  const volIdx = p.indexOf(`${rootName}/`);
  if (volIdx >= 0) {
    p = p.slice(volIdx + rootName.length + 1);
  }
  if (p.includes("/node_modules/")) return null;
  if (p.startsWith("..")) return null;
  if (!/\.(tsx?|css|json)$/.test(p)) return null;
  return p.replace(/^\.\//, "");
}

const maps = walkMaps(NEXT_DIR);
const files = new Map();

for (const mapPath of maps) {
  try {
    const raw = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    const sources = raw.sources ?? [];
    const contents = raw.sourcesContent ?? [];
    for (let i = 0; i < sources.length; i++) {
      const rel = toProjectPath(sources[i]);
      const content = contents[i];
      if (!rel || content == null || content.length < 20) continue;
      const existing = files.get(rel);
      if (!existing || content.length > existing.length) {
        files.set(rel, content);
      }
    }
  } catch {
    /* skip invalid maps */
  }
}

let written = 0;
for (const [rel, content] of files.entries()) {
  const outPath = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
  written++;
}

console.log(`Recovered ${written} files from ${maps.length} source maps.`);
