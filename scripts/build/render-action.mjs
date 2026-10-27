import { escapeHtml } from "./escape-html.mjs";

/**
 * A call-to-action button. Without a link yet (the Drive folder or the form does not exist),
 * it renders as a disabled button that says so, instead of a dead link.
 * @param {string | null} href
 * @param {string} label
 * @param {string} soonLabel
 * @param {"primary" | "ghost"} variant
 */
export function renderAction(href, label, soonLabel, variant) {
  if (href == null) {
    return `<span class="btn btn-${variant} is-soon" aria-disabled="true">${escapeHtml(label)} · ${escapeHtml(soonLabel)}</span>`;
  }
  return `<a class="btn btn-${variant}" href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
}
