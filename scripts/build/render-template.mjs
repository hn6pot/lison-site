// A minimal template language, enough for one page:
//   {{a.b}}    the value, HTML-escaped
//   {{{a.b}}}  raw HTML, reserved for markup the build script produces itself
//   {{> name}} a partial, rendered with the same context
// Anything missing is an error: a page never ships with a hole in it.

import { escapeHtml } from "./escape-html.mjs";

function lookup(context, path) {
  const value = path.split(".").reduce((node, key) => (node == null ? undefined : node[key]), context);
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") throw new Error(`Gabarit : la clé « ${path} » est absente ou n'est pas du texte`);
  return value;
}

/**
 * @param {string} template
 * @param {object} context
 * @param {Record<string, string>} partials
 * @returns {string}
 */
export function renderTemplate(template, context, partials) {
  // One pass, so that rendered text is never read again as template syntax.
  return template.replace(/\{\{>\s*([\w-]+)\s*\}\}|\{\{\{\s*([\w.-]+)\s*\}\}\}|\{\{\s*([\w.-]+)\s*\}\}/g, (_, partial, raw, escaped) => {
    if (partial) {
      if (!(partial in partials)) throw new Error(`Gabarit : le partiel « ${partial} » est absent`);
      return renderTemplate(partials[partial], context, partials);
    }
    return raw ? lookup(context, raw) : escapeHtml(lookup(context, escaped));
  });
}
