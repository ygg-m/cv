/**
 * Link check with a vacuous-pass guard.
 *
 * linkinator exits 0 even when it scans *zero* links — a trap hit while
 * building this repo: a skip pattern accidentally matched every URL (local
 * files are crawled through a temporary http://127.0.0.1 server), so the
 * check reported "0 links" and went green. This wrapper fails unless a sane
 * number of links was actually scanned, and prints broken links on failure.
 *
 * Usage:
 *   node scripts/check-links.mjs             # internal (local files + anchors)
 *   node scripts/check-links.mjs --external  # live site, all outbound links
 */
import { spawnSync } from "node:child_process";

const external = process.argv.includes("--external");
const MIN_LINKS = 20;

const args = [
  "node_modules/linkinator/build/src/cli.js",
  external ? "https://ygg-m.github.io/cv/" : "./index.html",
  "--format",
  "json",
];
if (external) {
  args.push("--config", "linkinator.external.config.json");
}

const result = spawnSync(process.execPath, args, {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
const stdout = result.stdout ?? "";
const stderr = result.stderr ?? "";

function fail(message) {
  console.error(`Link check FAILED: ${message}`);
  if (stderr.trim()) {
    console.error(stderr.trim());
  }
  process.exit(1);
}

const start = stdout.indexOf("{");
const end = stdout.lastIndexOf("}");
if (start === -1 || end <= start) {
  fail(`linkinator produced no JSON output (exit code ${result.status}).`);
}

let report;
try {
  report = JSON.parse(stdout.slice(start, end + 1));
} catch (error) {
  fail(`could not parse linkinator JSON: ${error.message}`);
}

const links = Array.isArray(report.links) ? report.links : [];
const scanned = links.filter((link) => String(link.state).toUpperCase() !== "SKIPPED");
const broken = scanned.filter((link) => String(link.state).toUpperCase() === "BROKEN");

const label = external ? "external" : "internal";

if (scanned.length < MIN_LINKS) {
  fail(
    `only ${scanned.length} ${label} link(s) were scanned (expected at least ${MIN_LINKS}). ` +
      "A skip rule probably matches too much — without this guard the check would pass vacuously.",
  );
}

if (broken.length > 0) {
  console.error(`Found ${broken.length} broken ${label} link(s):`);
  for (const link of broken) {
    console.error(`  [${link.status ?? "?"}] ${link.url} (linked from ${link.parent ?? "?"})`);
  }
  process.exit(1);
}

console.log(`OK: ${label} link check passed — ${scanned.length} links scanned, 0 broken.`);
