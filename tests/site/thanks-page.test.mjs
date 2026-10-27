import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { COMPLETE_CONFIG, buildWith } from "./build-fixture.mjs";
import { FORBIDDEN } from "../support/forbidden-words.mjs";

const site = buildWith(COMPLETE_CONFIG, { release: true });
const PATH = "merci/index.html";
const html = site.read(PATH);
const attributes = (name) => [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, "g"))].map((m) => m[1]);

test("la page Merci existe, en français, non référencée, avec son adresse", () => {
  assert.match(html, /<html lang="fr">/);
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/hn6pot\.github\.io\/lison-site\/merci\/">/);
});

test("la page Merci parle aux deux langues, et vouvoie", () => {
  assert.match(html, /lang="en"/);
  assert.match(html, /Thank you/);
  assert.match(html, /Merci/);
  assert.doesNotMatch(html, /\b(tu es|avec toi|on te)\b/i);
});

test("la page Merci ne charge rien d'ailleurs et ne nomme personne", () => {
  assert.doesNotMatch(html, /<script|<iframe|<object|<embed/i);
  for (const src of attributes("src")) assert.doesNotMatch(src, /^(https?:)?\/\//, src);
  assert.doesNotMatch(html, FORBIDDEN);
});

test("chaque lien interne de la page Merci mène à un fichier qui existe, dont le retour au site", () => {
  const internal = [...attributes("href"), ...attributes("src")].filter((url) => !/^(https?:|mailto:|#)/.test(url));
  assert.ok(internal.includes("../"));
  for (const url of internal) {
    const target = join(dirname(join(site.outDir, PATH)), url);
    assert.ok(existsSync(url.endsWith("/") ? join(target, "index.html") : target), url);
  }
});

test("le dessin de la page Merci est nommé, le reste est décoratif", () => {
  for (const [tag] of html.matchAll(/<[^>]+role="img"[^>]*>/g)) assert.match(tag, /aria-label="[^"]+"/, tag);
  for (const [svg] of html.matchAll(/<svg [^>]*>/g)) assert.match(svg, /aria-hidden="true"|aria-label="[^"]+"/, svg);
});
