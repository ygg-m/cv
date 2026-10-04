# Visual regression runs only inside the Playwright Docker image

Screenshot baselines differ between Windows and Linux CI (fonts, anti-aliasing). Baselines are generated and compared inside the official Playwright Docker image, locally and in CI, over a fixed matrix: Theme × Locale × (desktop, mobile) plus each modal. We rejected CI-only comparison (no local feedback) and skipping visual tests (a core QA layer).
