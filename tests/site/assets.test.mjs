import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { FONT_FILES } from "../../scripts/build/copy-assets.mjs";
import { EMPTY_CONFIG, buildWith } from "./build-fixture.mjs";

const site = buildWith(EMPTY_CONFIG, { release: false });
const css = site.read("assets/site.css");

test("la CSS ne charge rien d'ailleurs", () => {
  assert.doesNotMatch(css, /@import/);
  assert.doesNotMatch(css, /url\(\s*["']?(https?:)?\/\//);
});

test("chaque url() de la CSS mène à un fichier qui existe", () => {
  const urls = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
  assert.ok(urls.length > 0);
  for (const url of urls) assert.ok(existsSync(join(site.outDir, "assets", url)), url);
});

test("chaque police copiée est citée par la CSS", () => {
  for (const [, file] of FONT_FILES) assert.ok(css.includes(`fonts/${file}`), file);
});
