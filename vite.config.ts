import { defineConfig } from "vitest/config";
import { viteSingleFile } from "vite-plugin-singlefile";
import { renderContent } from "./src/render";

// ADR 0001: one index.html with CSS/JS inlined; images stay as files in assets/.
export default defineConfig({
  base: "./",
  plugins: [
    {
      // Pre-render the default Locale into the HTML so content shows without JavaScript.
      name: "prerender-content",
      transformIndexHtml: (html) => html.replace("<!--prerender-->", renderContent("en")),
    },
    viteSingleFile(),
  ],
  test: { include: ["tests/unit/**/*.spec.ts"] },
  build: {
    assetsDir: "assets",
    assetsInlineLimit: 0,
  },
});
