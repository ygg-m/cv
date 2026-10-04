import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  // Screenshots are compared only inside the Playwright Docker image (ADR 0003), so one baseline
  // per screenshot is enough: no platform suffix.
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  webServer: {
    command: "npm run build && npm run preview",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", testDir: "tests/e2e", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", testDir: "tests/e2e", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", testDir: "tests/e2e", use: { ...devices["Desktop Safari"] } },
    { name: "visual", testDir: "tests/visual", use: { ...devices["Desktop Chrome"] } },
  ],
});
