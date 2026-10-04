// Runs the visual regression project inside the official Playwright image (ADR 0003), so baselines are
// identical on every machine. Extra arguments (for example --update-snapshots) are passed to Playwright.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync("node_modules/@playwright/test/package.json", "utf8"));
const image = `mcr.microsoft.com/playwright:v${version}-noble`;
const args = process.argv.slice(2).join(" ");

// A named volume keeps Linux node_modules away from the host's Windows/macOS ones.
const docker = [
  "run", "--rm", "--ipc=host",
  "-v", `${process.cwd()}:/work`,
  "-v", "cv-visual-node-modules:/work/node_modules",
  "-w", "/work",
  "-e", "PLAYWRIGHT_DOCKER=1",
  "-e", "CI=1",
  image,
  "sh", "-c", `npm ci --no-audit --no-fund && npx playwright test --project=visual ${args}`,
];

const result = spawnSync("docker", docker, { stdio: "inherit" });
if (result.error) {
  console.error("Could not run Docker. Install Docker Desktop, or use the 'Update visual baselines' GitHub workflow.");
  process.exit(1);
}
process.exit(result.status ?? 1);
