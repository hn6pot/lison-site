import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

// Concatenated into assets/site.css in this order: each later file builds on the earlier ones.
const STYLESHEETS = ["fonts.css", "tokens.css", "base.css", "layout.css", "sections.css", "recap-card.css", "thanks.css"];

// The fonts the stylesheet names, served by the site itself (no Google Fonts request).
export const FONT_FILES = [
  ...[400, 600, 700, 800].map((weight) => ["schibsted-grotesk", `schibsted-grotesk-latin-${weight}-normal.woff2`]),
  ...[400, 600].map((weight) => ["jetbrains-mono", `jetbrains-mono-latin-${weight}-normal.woff2`]),
];

/** Writes assets/site.css, assets/brand/* and assets/fonts/* under outDir. */
export function copyAssets(outDir) {
  const assets = join(outDir, "assets");
  mkdirSync(join(assets, "brand"), { recursive: true });
  mkdirSync(join(assets, "fonts"), { recursive: true });

  const css = STYLESHEETS.map((name) => readFileSync(join(ROOT, "src", "styles", name), "utf8")).join("\n");
  writeFileSync(join(assets, "site.css"), css);

  for (const name of readdirSync(join(ROOT, "src", "brand"))) {
    copyFileSync(join(ROOT, "src", "brand", name), join(assets, "brand", name));
  }
  for (const [family, file] of FONT_FILES) {
    copyFileSync(join(ROOT, "node_modules", "@fontsource", family, "files", file), join(assets, "fonts", file));
  }
}
