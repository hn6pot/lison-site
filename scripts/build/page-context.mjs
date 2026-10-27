import { escapeHtml } from "./escape-html.mjs";
import { renderAction } from "./render-action.mjs";

/**
 * Everything one page's template reads: its texts, where it sits, and the markup that
 * depends on the configuration (buttons, contact, version).
 * @param {{ lang: "fr" | "en", content: object, config: object }} input
 */
export function pageContext({ lang, content, config }) {
  const isFrench = lang === "fr";
  const frUrl = config.siteUrl;
  const enUrl = `${config.siteUrl}en/`;
  const soon = content.actions.soon;
  const { version, sizeMb } = config.dmg;
  return {
    t: content,
    page: {
      root: isFrench ? "" : "../",
      url: isFrench ? frUrl : enUrl,
      otherHref: isFrench ? "en/" : "../",
      otherLang: isFrench ? "en" : "fr",
    },
    site: { frUrl, enUrl, imageUrl: `${config.siteUrl}assets/brand/app-icon.png` },
    computed: {
      dmgLine:
        version && sizeMb
          ? `${content.access.versionLabel} ${version} · ${sizeMb} ${content.access.sizeUnit}`
          : content.access.versionSoon,
    },
    html: {
      heroWaitlist: renderAction(config.waitlistFormUrl, content.hero.ctaWaitlist, soon, "ghost"),
      download: renderAction(config.driveFolderUrl, content.access.download, soon, "primary"),
      waitlist: renderAction(config.waitlistFormUrl, content.access.waitlist, soon, "primary"),
      rightsLine: config.contactEmail
        ? `${escapeHtml(content.legal.rights)} <a href="mailto:${escapeHtml(config.contactEmail)}">${escapeHtml(config.contactEmail)}</a>. ${escapeHtml(content.legal.rightsAfter)}`
        : escapeHtml(content.legal.rightsNoContact),
    },
  };
}
