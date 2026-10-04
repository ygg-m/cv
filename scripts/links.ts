// Pure helpers for link checking. Used by the offline unit tests and by scripts/check-links.ts.

export type LinkKind = "anchor" | "mailto" | "external" | "internal";

const decode = (value: string): string => value.replace(/&amp;/g, "&");

/** Remove <script> blocks: bundled code contains template strings that merely look like links. */
export function stripScripts(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script>/g, "");
}

/** Every href and src value in an HTML string, deduplicated, with HTML entities decoded. */
export function extractLinks(html: string): string[] {
  const urls = [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) => decode(m[1]));
  return [...new Set(urls)];
}

export function classify(url: string): LinkKind {
  if (url.startsWith("#")) return "anchor";
  if (url.startsWith("mailto:")) return "mailto";
  if (/^https?:\/\//.test(url)) return "external";
  return "internal";
}

/** In-page anchors (href="#id") that have no element with that id. */
export function missingAnchors(html: string): string[] {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  return extractLinks(html)
    .filter((url) => classify(url) === "anchor" && url !== "#")
    .filter((url) => !ids.has(url.slice(1)));
}

/** Strip the query string and fragment from a relative URL, leaving the file path. */
export function filePath(url: string): string {
  return url.replace(/[?#].*$/, "");
}
