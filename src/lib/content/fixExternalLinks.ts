/**
 * Replace known dead external URLs in HTML/text content.
 * Applied at render time so blog API/database copies are corrected on output.
 */
const LINK_REPLACEMENTS: [string, string][] = [
  [
    'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation',
    'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas',
  ],
  [
    'https://www.nhs.uk/conditions/period-tracker/',
    'https://www.nhs.uk/conditions/periods/',
  ],
  [
    'http://www.nhs.uk/conditions/period-tracker/',
    'https://www.nhs.uk/conditions/periods/',
  ],
];

export function fixExternalLinks(html: string | undefined): string {
  if (!html) return html ?? '';
  let out = html;
  for (const [from, to] of LINK_REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  return out;
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
