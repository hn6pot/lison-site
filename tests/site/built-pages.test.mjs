import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { COMPLETE_CONFIG, EMPTY_CONFIG, buildWith } from "./build-fixture.mjs";
import { FORBIDDEN } from "../support/forbidden-words.mjs";

const DIRECT_DOWNLOAD = `https://drive.google.com/uc?export=download&amp;id=${COMPLETE_CONFIG.dmg.driveFileId}`;
const PAGES = [
  ["index.html", "fr"],
  ["en/index.html", "en"],
];
const site = buildWith(COMPLETE_CONFIG, { release: true });

const attributes = (html, name) => [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, "g"))].map((m) => m[1]);

for (const [path, lang] of PAGES) {
  const html = site.read(path);

  test(`${path} : la langue, les versions alternées et noindex`, () => {
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    assert.match(html, /<link rel="alternate" hreflang="fr" href="https:\/\/hn6pot\.github\.io\/lison-site\/">/);
    assert.match(html, /<link rel="alternate" hreflang="en" href="https:\/\/hn6pot\.github\.io\/lison-site\/en\/">/);
    assert.match(html, /<link rel="alternate" hreflang="x-default" href="https:\/\/hn6pot\.github\.io\/lison-site\/">/);
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<meta name="description" content="[^"]+">/);
  });

  test(`${path} : aucun script, aucune iframe, rien de chargé ailleurs`, () => {
    assert.doesNotMatch(html, /<script|<iframe|<object|<embed/i);
    for (const src of attributes(html, "src")) assert.doesNotMatch(src, /^(https?:)?\/\//, src);
    for (const [, tag] of html.matchAll(/<link ([^>]*)>/g)) {
      if (/rel="(stylesheet|icon|apple-touch-icon|preload)"/.test(tag)) assert.doesNotMatch(tag, /href="(https?:)?\/\//, tag);
    }
  });

  test(`${path} : chaque lien interne mène à un fichier qui existe`, () => {
    const pageDir = dirname(join(site.outDir, path));
    const internal = [...attributes(html, "href"), ...attributes(html, "src")].filter(
      (url) => !/^(https?:|mailto:|#)/.test(url),
    );
    assert.ok(internal.length > 3);
    for (const url of internal) {
      const target = join(pageDir, url);
      assert.ok(existsSync(url.endsWith("/") || url === "./" ? join(target, "index.html") : target), `${path} → ${url}`);
    }
  });

  test(`${path} : chaque ancre mène à un id de la page`, () => {
    for (const anchor of attributes(html, "href").filter((url) => url.startsWith("#"))) {
      assert.match(html, new RegExp(`id="${anchor.slice(1)}"`), anchor);
    }
  });

  test(`${path} : chaque illustration est nommée, chaque dessin décoratif est caché`, () => {
    const figures = [...html.matchAll(/<[^>]+role="img"[^>]*>/g)].map(([tag]) => tag);
    assert.ok(figures.length > 0);
    for (const tag of figures) assert.match(tag, /aria-label="[^"]+"/, tag);
    for (const [svg] of html.matchAll(/<svg [^>]*>/g)) assert.match(svg, /aria-hidden="true"|aria-label="[^"]+"/, svg);
    for (const [img] of html.matchAll(/<img [^>]*>/g)) assert.match(img, /alt="[^"]+"/, img);
  });

  test(`${path} : aucun mot interdit, et aucune adresse e-mail que celle de contact`, () => {
    assert.doesNotMatch(html, FORBIDDEN, "un mot interdit apparaît");
    const emails = html.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? [];
    assert.deepEqual([...new Set(emails)], [COMPLETE_CONFIG.contactEmail]);
  });

  test(`${path} : le .dmg, le dossier Drive, le formulaire et la version sont là`, () => {
    assert.match(html, new RegExp(`<a class="btn btn-primary" href="${DIRECT_DOWNLOAD.replaceAll(/[.?]/g, "\\$&")}"`));
    assert.match(html, new RegExp(`<p class="fine"><a href="${COMPLETE_CONFIG.driveFolderUrl}"[^>]*>(Toutes les versions|All versions)</a></p>`));
    assert.ok(html.includes(`href="${COMPLETE_CONFIG.waitlistFormUrl}"`));
    assert.match(html, /0\.4\.0 · 155 (Mo|MB)/);
    assert.doesNotMatch(html, /is-soon/);
  });
}

test("le bouton de langue mène de l'une à l'autre", () => {
  assert.match(site.read("index.html"), /class="lang-other" href="en\/" hreflang="en"/);
  assert.match(site.read("en/index.html"), /class="lang-other" href="\.\.\/" hreflang="fr"/);
});

test("sans configuration, les boutons disent « bientôt » et aucun lien Drive n'apparaît", () => {
  const preview = buildWith(EMPTY_CONFIG, { release: false });
  const fr = preview.read("index.html");
  assert.equal(fr.match(/is-soon/g).length, 3);
  assert.doesNotMatch(fr, /drive\.google\.com|tally\.so/);
  assert.match(fr, /Première version bientôt/);
  assert.match(fr, /en répondant à l&#39;un de nos e-mails/);
});

test("sans configuration, la mise en ligne échoue", () => {
  assert.throws(() => buildWith(EMPTY_CONFIG, { release: true }), /driveFolderUrl/);
});

test("version.json est servi à la racine, avec trois clés et aucun mot interdit", () => {
  const raw = site.read("version.json");
  assert.deepEqual(JSON.parse(raw), {
    version: "0.4.0",
    sizeMb: 155,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${COMPLETE_CONFIG.dmg.driveFileId}`,
  });
  assert.doesNotMatch(raw, FORBIDDEN, "un mot interdit apparaît");
});

test("sans configuration, aucun version.json n'est publié", () => {
  const preview = buildWith(EMPTY_CONFIG, { release: false });
  assert.equal(existsSync(join(preview.outDir, "version.json")), false);
});

test("sans identifiant du .dmg, « Télécharger » et version.json mènent au dossier, sans lien secondaire", () => {
  const folderOnly = buildWith({ ...COMPLETE_CONFIG, dmg: { ...COMPLETE_CONFIG.dmg, driveFileId: null } }, { release: true });
  for (const path of ["index.html", "en/index.html"]) {
    const html = folderOnly.read(path);
    assert.ok(html.includes(`<a class="btn btn-primary" href="${COMPLETE_CONFIG.driveFolderUrl}"`), path);
    assert.doesNotMatch(html, /uc\?export=download|Toutes les versions|All versions/, path);
  }
  assert.equal(JSON.parse(folderOnly.read("version.json")).downloadUrl, COMPLETE_CONFIG.driveFolderUrl);
});
