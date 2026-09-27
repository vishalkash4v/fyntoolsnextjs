/**
 * Sanitize HTML/text before render so Semrush + crawlers see clean links and headings.
 * Applied at render time so API/database blog copies are corrected without DB edits.
 */

const DEAD_MDN_CANVAS =
  /https?:\/\/developer\.mozilla\.org\/[^"'>\s]*Pixel_manipulation[^"'>\s]*/gi;

const NAKED_URL_LABELS: Record<string, string> = {
  'https://tinyurl.com': 'Visit TinyURL',
  'https://www.tinyurl.com': 'Visit TinyURL',
  'https://cutt.ly': 'Visit Cuttly',
  'https://www.cutt.ly': 'Visit Cuttly',
  'https://dub.co': 'Visit Dub.co',
  'https://www.dub.co': 'Visit Dub.co',
  'https://short.io': 'Visit Short.io',
  'https://www.short.io': 'Visit Short.io',
  'https://rebrandly.com': 'Visit Rebrandly',
  'https://www.rebrandly.com': 'Visit Rebrandly',
  'https://is.gd': 'Visit is.gd',
  'https://www.is.gd': 'Visit is.gd',
  'https://bitly.com': 'Visit Bitly',
  'https://www.bitly.com': 'Visit Bitly',
  'https://fyntools.com/url-shortener': 'Open FYN Tools URL Shortener',
  'https://fyntools.com/period-calculator': 'Open Period Calculator',
  'https://fyntools.com/word-counter': 'Open Word Counter',
  'https://fyntools.com/about': 'About FYN Tools',
  'https://fyntools.com/contact': 'Contact FYN Tools',
  'https://fyntools.com/guides': 'FYN Tools Guides',

  'https://en.wikipedia.org/wiki/Node.js': 'Visit Node.js official site',
  'https://www.readingrockets.org/reading-101/reading-and-writing-basics/fluency': 'Read about reading fluency',
};

/**
 * Unwrap anchors whose href is a known-dead MDN canvas tutorial URL → plain text.
 * Rewrite naked URL link text to descriptive anchors for Semrush notice #216.
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

  // Semrush: Wikipedia Node.js misclassified as a .js asset — point to official site
  out = out.split('https://en.wikipedia.org/wiki/Node.js').join('https://nodejs.org/');
  // Semrush Site Audit found the Reading Rockets fluency URL returning 403.
  // Keep the article text but remove the crawler-blocked external destination.
  out = out.replace(
    /<a\b([^>]*\bhref=["']https:\/\/www\.readingrockets\.org\/reading-101\/reading-and-writing-basics\/fluency["'][^>]*)>([\s\S]*?)<\/a>/gi,
    '$2'
  );
  // Reading Speed reference: the old Wikipedia URL must not become a relative URL.
  // Unwrap both the original external link and the malformed href produced by the
  // previous sanitizer version (e.g. href="reading-speed reference"), preserving text.
  out = out.replace(
    /<a\b[^>]*\bhref=["'](?:https:\/\/en\.wikipedia\.org\/wiki\/Reading_speed|(?:https:\/\/fyntools\.com)?(?:\/blog\/)?reading-speed(?:%20|\+|\s)+reference)["'][^>]*>([\s\S]*?)<\/a>/gi,
    '$1'
  );
  out = out.split('https://en.wikipedia.org/wiki/Reading_speed').join('reading speed reference');
  out = out.replace(
    /href=["'](?:reading-speed(?:%20|\+|\s)+reference|\/blog\/reading-speed(?:%20|\+|\s)+reference)["']/gi,
    ''
  );

  // Other known dead external URLs → working destinations
  out = out.split('https://www.nhs.uk/conditions/period-tracker/').join('https://www.nhs.uk/conditions/periods/');
  out = out.split('http://www.nhs.uk/conditions/period-tracker/').join('https://www.nhs.uk/conditions/periods/');

  // Soft-dupe: never leave internal links pointing at the 308 alias
  out = out.split('href="/add-name-date-photo"').join('href="/photo-annotation-tool"');
  out = out.split('href=\'/add-name-date-photo\'').join('href=\'/photo-annotation-tool\'');
  out = out
    .split('https://fyntools.com/add-name-date-photo')
    .join('https://fyntools.com/photo-annotation-tool');

  // Naked URL anchors → descriptive text (Bitly alternatives blog, etc.)
  out = out.replace(
    /<a\b([^>]*\bhref=["']([^"']+)["'][^>]*)>([\s\S]*?)<\/a>/gi,
    (full, attrs: string, href: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, '').trim();
      const cleanHref = href.replace(/\/$/, '');
      const label =
        NAKED_URL_LABELS[href] ||
        NAKED_URL_LABELS[cleanHref] ||
        NAKED_URL_LABELS[href.toLowerCase()] ||
        NAKED_URL_LABELS[cleanHref.toLowerCase()];

      const isNaked =
        !text ||
        text === href ||
        text === cleanHref ||
        /^https?:\/\//i.test(text);

      if (label && isNaked) {
        return `<a${attrs}>${label}</a>`;
      }
      // Wikipedia Node.js label may still say "backend language" — keep label, href already rewritten
      return full;
    }
  );

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
