# Ship one static HTML entry; select Locale with a query string

The CV Site builds (Vite, vanilla TypeScript) to a single `index.html` with CSS and JS inlined; images stay as separate files under `assets/`. Both Locales are embedded and switched on the client, with `?lang=pt-BR` as the deep link and English as the default. We rejected separate `/` and `/pt-br/` pages: they give real URLs and `hreflang`, but contradict the single-file goal and double the build output. Tests open `/?lang=pt-BR` directly, which keeps them deterministic.

## Consequences

- No per-Locale URL for search engines; SEO for Portuguese is weaker.
- Inlining every image was rejected: it bloats the file for no real gain.
