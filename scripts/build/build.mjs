import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { copyAssets } from "./copy-assets.mjs";
import { loadConfig } from "./load-config.mjs";
import { pageContext } from "./page-context.mjs";
import { renderTemplate } from "./render-template.mjs";
import { versionFeed } from "./version-feed.mjs";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

// Where each language's page lands: French at the root, English under en/.
const PAGES = [
  ["fr", "index.html"],
  ["en", join("en", "index.html")],
];

function readPartials() {
  const dir = join(ROOT, "src", "partials");
  return Object.fromEntries(
    readdirSync(dir)
      .filter((name) => name.endsWith(".html"))
      .map((name) => [basename(name, ".html"), readFileSync(join(dir, name), "utf8").trimEnd()]),
  );
}

// The page the waitlist form sends people to: one page, French first, with the English message.
function writeThanksPage(outDir, config, partials) {
  const read = (lang) => JSON.parse(readFileSync(join(ROOT, "content", `${lang}.json`), "utf8"));
  const template = readFileSync(join(ROOT, "src", "thanks.html"), "utf8");
  const context = { t: read("fr"), en: read("en"), page: { root: "../", url: `${config.siteUrl}merci/` } };
  mkdirSync(join(outDir, "merci"), { recursive: true });
  writeFileSync(join(outDir, "merci", "index.html"), renderTemplate(template, context, partials));
}

/**
 * Builds the site into outDir, which it empties first.
 * @param {{ outDir: string, release: boolean, configPath?: string }} options
 */
export function build({ outDir, release, configPath = join(ROOT, "site.config.json") }) {
  const config = loadConfig(configPath, { release });
  const template = readFileSync(join(ROOT, "src", "page.html"), "utf8");
  const partials = readPartials();
  rmSync(outDir, { recursive: true, force: true });
  for (const [lang, path] of PAGES) {
    const content = JSON.parse(readFileSync(join(ROOT, "content", `${lang}.json`), "utf8"));
    const html = renderTemplate(template, pageContext({ lang, content, config }), partials);
    mkdirSync(dirname(join(outDir, path)), { recursive: true });
    writeFileSync(join(outDir, path), html);
  }
  writeThanksPage(outDir, config, partials);
  const feed = versionFeed(config);
  if (feed) writeFileSync(join(outDir, "version.json"), `${JSON.stringify(feed, null, 2)}\n`);
  copyAssets(outDir);
}

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} attend un chemin`);
  return value;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const release = process.argv.includes("--release");
    const outDir = resolve(option("--out", join(ROOT, "dist")));
    const configPath = option("--config", join(ROOT, "site.config.json"));
    // build() empties outDir first: never let it be the repository or the current folder.
    if ([resolve(ROOT), process.cwd()].includes(outDir)) throw new Error(`--out ne peut pas être ${outDir}`);
    build({ outDir, release, configPath });
    console.log(`Site construit dans ${outDir}${release ? " (mise en ligne)" : " (aperçu local)"}.`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
