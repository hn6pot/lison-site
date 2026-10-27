import { test } from "node:test";
import assert from "node:assert/strict";
import { renderTemplate } from "../../scripts/build/render-template.mjs";

test("une valeur est échappée", () => {
  assert.equal(renderTemplate("<p>{{t.text}}</p>", { t: { text: `<b>&"'` } }, {}), "<p>&lt;b&gt;&amp;&quot;&#39;</p>");
});

test("les guillemets français et les accents restent tels quels", () => {
  assert.equal(renderTemplate("{{a}}", { a: "« Réunion » d'équipe" }, {}), "« Réunion » d&#39;équipe");
});

test("le HTML brut n'est pas échappé", () => {
  assert.equal(renderTemplate("{{{html.button}}}", { html: { button: "<a href=\"x\">Go</a>" } }, {}), "<a href=\"x\">Go</a>");
});

test("un partiel est inclus et rendu avec le même contexte", () => {
  const partials = { hero: "<h1>{{t.title}}</h1>" };
  assert.equal(renderTemplate("<main>{{> hero}}</main>", { t: { title: "Bonjour" } }, partials), "<main><h1>Bonjour</h1></main>");
});

test("un partiel peut en inclure un autre", () => {
  const partials = { a: "[{{> b}}]", b: "{{x}}" };
  assert.equal(renderTemplate("{{> a}}", { x: "ok" }, partials), "[ok]");
});

test("une clé absente lève une erreur qui la nomme", () => {
  assert.throws(() => renderTemplate("{{t.missing}}", { t: {} }, {}), /t\.missing/);
});

test("un partiel absent lève une erreur qui le nomme", () => {
  assert.throws(() => renderTemplate("{{> nowhere}}", {}, {}), /nowhere/);
});

test("une valeur qui n'est pas du texte ni un nombre est refusée", () => {
  assert.throws(() => renderTemplate("{{t}}", { t: { a: 1 } }, {}), /« t »/);
});

test("un texte qui ressemble au gabarit n'est jamais relu", () => {
  const partials = { p: "{{a}}" };
  assert.equal(renderTemplate("{{> p}} {{b}}", { a: "{{b}}", b: "{{a}}" }, partials), "{{b}} {{a}}");
});
