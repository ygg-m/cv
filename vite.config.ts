import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// ADR 0001: one index.html with CSS/JS inlined; images stay as files in assets/.
export default defineConfig({
  base: "./",
  plugins: [viteSingleFile()],
  build: {
    assetsDir: "assets",
    assetsInlineLimit: 0,
  },
});
