/**
 * Sanitize HTML/text before render so Semrush + crawlers see clean links and headings.
 * Applied at render time so API/database blog copies are corrected without DB edits.
 */

const DEAD_MDN_CANVAS =
  /https?:\/\/developer\.mozilla\.org\/[^"'>\s]*Pixel_manipulation[^"'>\s]*/gi;

/**
 * Unwrap anchors whose href is a known-dead MDN canvas tutorial URL → plain text.
 * Also fixes the double-suffix artifact (`…_with_canvas_with_canvas`) from an older replace.
 */
export function fixExternalLinks(html: string | undefined): string {
  if (!html) return html ?? '';
  let out = html;

  // Repair accidental double-append from prior string replace
  out = out.replace(
    /Pixel_manipulation_with_canvas_with_canvas/gi,
    'Pixel_manipulation_with_canvas'
  );

  // Unwrap <a href="…Pixel_manipulation…">label</a> → label (plain text)
  out = out.replace(
    /<a\b[^>]*\bhref=["'][^"']*Pixel_manipulation[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi,
    '$1'
  );

  // Any remaining bare dead MDN canvas URLs in text
  out = out.replace(DEAD_MDN_CANVAS, 'MDN Canvas pixel manipulation guide');

  // Other known dead external URLs → working destinations
  out = out.split('https://www.nhs.uk/conditions/period-tracker/').join('https://www.nhs.uk/conditions/periods/');
  out = out.split('http://www.nhs.uk/conditions/period-tracker/').join('https://www.nhs.uk/conditions/periods/');

  return out;
}

/**
 * Blog pages already render a page-level <h1>. Demote any H1 inside CMS HTML to H2
 * so Semrush “Multiple h1 tags” stays at zero.
 */
export function demoteContentH1ToH2(html: string | undefined): string {
  if (!html) return html ?? '';
  return html
    .replace(/<\s*h1(\s[^>]*)?>/gi, '<h2$1>')
    .replace(/<\s*\/\s*h1\s*>/gi, '</h2>');
}

/** Remove dead social profile URLs from author sameAs lists. */
export function filterAuthorProfiles(urls: string[]): string[] {
  const blocked = new Set([
    'https://twitter.com/fyntoolsworldwide',
    'http://twitter.com/fyntoolsworldwide',
    'https://github.com/fyntools',
    'http://github.com/fyntools',
  ]);
  return urls.filter((u) => !blocked.has(u));
}
