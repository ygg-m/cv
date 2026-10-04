// Nightly link check: requests every external link on the site (both Locales, including modal content)
// and verifies internal files and anchors against the built dist/. Exit code 1 when anything is broken.
import { existsSync, readFileSync } from "node:fs";
import { LOCALES } from "../src/i18n";
import { renderContent } from "../src/render";
import { classify, extractLinks, filePath, missingAnchors, stripScripts } from "./links";

const TIMEOUT_MS = 15_000;
const ATTEMPTS = 3;
const CONCURRENCY = 6;
// Published by CI next to the site; absent from a local dist/.
const PUBLISHED_BY_CI = ["reports/"];
// Sites that block automated requests but whose links are valid.
const BOT_BLOCKED_HOSTS: Record<string, number[]> = { "www.linkedin.com": [999, 403, 429] };

const shell = stripScripts(readFileSync("dist/index.html", "utf8"));
const pages = LOCALES.map((locale) => `${shell}\n${renderContent(locale)}`);
const urls = [...new Set(pages.flatMap(extractLinks))];

const failures: string[] = [];

for (const page of pages) {
  for (const anchor of missingAnchors(page)) failures.push(`anchor without target: ${anchor}`);
}

for (const url of urls.filter((u) => classify(u) === "internal")) {
  const path = filePath(url);
  if (PUBLISHED_BY_CI.includes(path)) continue;
  if (!existsSync(`dist/${path}`)) failures.push(`missing file in dist/: ${path}`);
}

async function request(url: string, method: "HEAD" | "GET"): Promise<number> {
  const response = await fetch(url, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "cv-link-checker (+https://github.com/ygg-m/cv)" },
  });
  await response.body?.cancel();
  return response.status;
}

async function check(url: string): Promise<string | null> {
  const host = new URL(url).hostname;
  const tolerated = BOT_BLOCKED_HOSTS[host] ?? [];
  let last = "no response";
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      let status = await request(url, "HEAD");
      if (status >= 400) status = await request(url, "GET"); // some servers reject HEAD
      if (status < 400 || tolerated.includes(status)) return null;
      last = `HTTP ${status}`;
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }
  return `${url} -> ${last}`;
}

const external = urls.filter((u) => classify(u) === "external");
const queue = [...external];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      const problem = await check(url);
      if (problem) failures.push(problem);
    }
  }),
);

console.log(`Checked ${external.length} external links and ${urls.length - external.length} internal/anchor/mailto links.`);
if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s):\n${failures.map((f) => ` - ${f}`).join("\n")}`);
  process.exit(1);
}
console.log("All links OK.");
