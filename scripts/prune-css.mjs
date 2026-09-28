import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";
import { PurgeCSS } from "purgecss";

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? htmlFiles(join(directory, entry.name))
        : entry.name.endsWith(".html")
          ? [join(directory, entry.name)]
          : [],
    ),
  );
  return nested.flat();
}

const pages = await Promise.all(
  (await htmlFiles("dist")).map(async (file) => ({
    file,
    html: await readFile(file, "utf8"),
  })),
);
const content = pages.map(({ html }) => {
  const $ = load(html);
  $("style, script").remove();
  return { raw: $.html(), extension: "html" };
});
const stylePattern = /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g;
const styles = [
  ...new Set(
    pages.flatMap(({ html }) =>
      [...html.matchAll(stylePattern)].map((match) => match[2]),
    ),
  ),
];
const results = await new PurgeCSS().purge({
  content: [
    ...content,
    "src/scripts/**/*.{ts,js,mjs}",
    "src/components/*.astro",
  ],
  css: styles.map((raw) => ({ raw })),
  // These states are introduced by the browser, Lenis or the scroll scenes.
  safelist: [
    /^lenis/,
    /^is-/,
    /^flight-/,
    /^has-/,
    "active",
    "visible",
    "hidden",
  ],
  dynamicAttributes: ["open", "data-menu-open", "data-nav-theme"],
  fontFace: false,
  keyframes: false,
  variables: false,
});
const optimized = new Map(
  styles.map((css, index) => [css, results[index].css]),
);
await Promise.all(
  pages.map(({ file, html }) =>
    writeFile(
      file,
      html.replace(
        stylePattern,
        (_, open, css, close) => open + optimized.get(css) + close,
      ),
    ),
  ),
);
const before = styles.reduce((total, css) => total + css.length, 0);
const after = results.reduce((total, result) => total + result.css.length, 0);
console.log(
  `CSS: ${before.toLocaleString()} → ${after.toLocaleString()} bytes across ${styles.length} unique style blocks.`,
);
