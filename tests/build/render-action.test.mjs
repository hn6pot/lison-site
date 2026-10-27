import { test } from "node:test";
import assert from "node:assert/strict";
import { renderAction } from "../../scripts/build/render-action.mjs";

test("avec un lien, le bouton ouvre le lien dans un nouvel onglet", () => {
  assert.equal(
    renderAction("https://tally.so/r/abc", "Rejoindre la liste", "bientôt", "primary"),
    '<a class="btn btn-primary" href="https://tally.so/r/abc" target="_blank" rel="noopener">Rejoindre la liste</a>',
  );
});

test("sans lien, le bouton est désactivé et dit « bientôt »", () => {
  assert.equal(
    renderAction(null, "Télécharger Lison", "bientôt", "ghost"),
    '<span class="btn btn-ghost is-soon" aria-disabled="true">Télécharger Lison · bientôt</span>',
  );
});

test("le libellé et le lien sont échappés", () => {
  const html = renderAction('https://tally.so/r/a"b', "<i>", "x", "primary");
  assert.match(html, /href="https:\/\/tally\.so\/r\/a&quot;b"/);
  assert.match(html, />&lt;i&gt;<\/a>$/);
});
