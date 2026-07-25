/**
 * Keyword Variations Utility
 * Enhances keywords with natural variations for better SEO
 * Ensures all tools have keyword variations for natural content generation
 */

/**
 * Generate keyword variations from base keywords
 * Example: "image compressor" -> ["image compressor", "compress image online", "reduce image size"]
 */
export const generateKeywordVariations = (
  baseKeywords: string | string[],
  toolName: string,
  category?: string
): string[] => {
  const keywords = Array.isArray(baseKeywords)
    ? baseKeywords
    : baseKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

  if (keywords.length === 0) {
    // Generate basic variations from tool name
    const toolNameLower = toolName.toLowerCase();
    return [
      toolNameLower,
      `${toolNameLower} online`,
      `free ${toolNameLower}`,
      `online ${toolNameLower} tool`
    ];
  }

  const variations: string[] = [...keywords];
  const toolNameLower = toolName.toLowerCase();
  const categoryLower = category?.toLowerCase() || '';

  // Generate natural variations from existing keywords
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    
    // Skip if already a variation
    if (variations.some(v => v.toLowerCase() === keywordLower)) {
      return;
    }

    // Generate common variations
    const variationsToAdd: string[] = [];

    // "X online" variation
    if (!keywordLower.includes('online') && !keywordLower.includes('tool')) {
      variationsToAdd.push(`${keywordLower} online`);
    }

    // "online X" variation
    if (!keywordLower.startsWith('online')) {
      variationsToAdd.push(`online ${keywordLower}`);
    }

    // "free X" variation
    if (!keywordLower.includes('free')) {
      variationsToAdd.push(`free ${keywordLower}`);
    }

    // "X tool" variation
    if (!keywordLower.includes('tool')) {
      variationsToAdd.push(`${keywordLower} tool`);
    }

    // Action-based variations (if keyword contains action words)
    if (keywordLower.includes('compress')) {
      variationsToAdd.push('reduce image size', 'compress image online', 'image size reducer');
    }
    if (keywordLower.includes('resize')) {
      variationsToAdd.push('resize image online', 'change image size', 'image dimension changer');
    }
    if (keywordLower.includes('convert')) {
      variationsToAdd.push('convert online', 'online converter', 'file converter');
    }
    if (keywordLower.includes('generate')) {
      variationsToAdd.push('generator online', 'online generator', 'create online');
    }
    if (keywordLower.includes('count')) {
      variationsToAdd.push('counter online', 'online counter', 'count tool');
    }

    // Add unique variations
    variationsToAdd.forEach(variation => {
      if (!variations.some(v => v.toLowerCase() === variation.toLowerCase())) {
        variations.push(variation);
      }
    });
  });

  // Add category-based variations if category exists
  if (categoryLower && !variations.some(v => v.toLowerCase().includes(categoryLower))) {
    variations.push(`${categoryLower} tool`, `free ${categoryLower}`);
  }

  // Limit to reasonable number (too many variations can look like keyword stuffing)
  return variations.slice(0, 15);
};

/**
 * Enhance keywords for a tool with natural variations
 * Returns enhanced keyword array ready for SEO content generation
 */
export const enhanceToolKeywords = (
  toolName: string,
  existingKeywords?: string | string[],
  category?: string
): string[] => {
  if (!existingKeywords || (Array.isArray(existingKeywords) && existingKeywords.length === 0)) {
    // Generate from tool name if no keywords provided
    return generateKeywordVariations([], toolName, category);
  }

  // Generate variations from existing keywords
  return generateKeywordVariations(existingKeywords, toolName, category);
};

