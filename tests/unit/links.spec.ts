import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { classify, extractLinks, filePath, missingAnchors, stripScripts } from "../../scripts/links";
import { LOCALES } from "../../src/i18n";
import { pdfFileName, renderContent } from "../../src/render";

describe("link helpers", () => {
  it("TC-LNK-U1 extracts and deduplicates href/src values, decoding entities", () => {
    const html = '<a href="a?x=1&amp;y=2">a</a><a href="a?x=1&amp;y=2">again</a><img src="assets/x.png">';
    expect(extractLinks(html)).toEqual(["a?x=1&y=2", "assets/x.png"]);
  });

  it("TC-LNK-U2 classifies URLs", () => {
    expect(classify("#about")).toBe("anchor");
    expect(classify("mailto:a@b.co")).toBe("mailto");
    expect(classify("https://example.com")).toBe("external");
    expect(classify("cv/file.pdf")).toBe("internal");
  });

  it("TC-LNK-U3 finds anchors without a target", () => {
    const html = '<a href="#a">a</a><a href="#b">b</a><a href="#">top</a><section id="a"></section>';
    expect(missingAnchors(html)).toEqual(["#b"]);
  });

  it("TC-LNK-U8 ignores link-like text inside scripts", () => {
    const html = '<script type="module">const a = `<a href="${x}">`</script><a href="#ok">ok</a>';
    expect(extractLinks(stripScripts(html))).toEqual(["#ok"]);
  });

  it("TC-LNK-U4 strips query and fragment from file paths", () => {
    expect(filePath("reports/index.html?x=1#y")).toBe("reports/index.html");
  });
});

describe("links in the rendered site", () => {
  const shell = stripScripts(readFileSync("index.html", "utf8"));

  it.each(LOCALES)("TC-LNK-U5 every in-page anchor has a target (%s)", (locale) => {
    expect(missingAnchors(`${shell}${renderContent(locale)}`)).toEqual([]);
  });

  it.each(LOCALES)("TC-LNK-U6 every internal file link points to a real or generated file (%s)", (locale) => {
    const generated = new Set(LOCALES.map((l) => `cv/${pdfFileName(l)}`));
    const publishedByCi = new Set(["reports/"]);
    const internal = extractLinks(`${shell}${renderContent(locale)}`).filter((u) => classify(u) === "internal");
    expect(internal.length).toBeGreaterThan(0);
    for (const url of internal) {
      const path = filePath(url);
      const known = generated.has(path) || publishedByCi.has(path) || existsSync(`public/${path}`);
      expect(known, `${url} has no file in public/ and is not generated`).toBe(true);
    }
  });

  it.each(LOCALES)("TC-LNK-U7 external links are https and open safely in new tabs (%s)", (locale) => {
    const html = renderContent(locale);
    for (const url of extractLinks(html).filter((u) => classify(u) === "external")) {
      expect(url.startsWith("https://"), url).toBe(true);
    }
    for (const tag of html.match(/<a [^>]*target="_blank"[^>]*>/g) ?? []) {
      expect(tag, tag).toMatch(/rel="[^"]*noopener/);
    }
  });
});
