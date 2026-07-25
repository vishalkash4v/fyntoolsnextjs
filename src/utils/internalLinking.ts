import { allTools, type Tool } from '@/data/toolsData';

/**
 * Get tools from the same category as the current tool
 * Excludes the current tool itself
 */
export const getToolsByCategory = (
  currentToolPath: string,
  category: string,
  limit: number = 6
): Tool[] => {
  return allTools
    .filter(tool => 
      tool.category === category && 
      tool.path !== currentToolPath
    )
    .slice(0, limit);
};

/**
 * Get popular/commonly used tools
 * Based on tool usage patterns and categories
 */
export const getPopularTools = (
  excludePath?: string,
  limit: number = 6
): Tool[] => {
  // Popular tools based on common use cases
  const popularToolIds = [
    'word-counter',
    'qr-code-generator',
    'password-generator',
    'json-formatter',
    'image-resizer',
    'text-case-converter',
    'base64-converter',
    'color-picker-tool',
    'bmi-calculator',
    'currency-converter',
    'url-shortener',
    'html-formatter'
  ];

  return allTools
    .filter(tool => {
      if (excludePath && tool.path === excludePath) return false;
      return popularToolIds.includes(tool.id);
    })
    .slice(0, limit);
};

/**
 * Get related tools based on keywords similarity
 */
export const getRelatedToolsByKeywords = (
  currentTool: Tool,
  limit: number = 6
): Tool[] => {
  if (!currentTool.keywords) return [];

  const currentKeywords = currentTool.keywords
    .toLowerCase()
    .split(',')
    .map(k => k.trim());

  const scoredTools = allTools
    .filter(tool => tool.path !== currentTool.path)
    .map(tool => {
      if (!tool.keywords) return { tool, score: 0 };

      const toolKeywords = tool.keywords
        .toLowerCase()
        .split(',')
        .map(k => k.trim());

      // Calculate similarity score
      const matchingKeywords = currentKeywords.filter(keyword =>
        toolKeywords.some(tk => tk.includes(keyword) || keyword.includes(tk))
      );

      return {
        tool,
        score: matchingKeywords.length
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.tool);

  return scoredTools;
};

/**
 * Get related tools combining multiple strategies:
 * 1. Same category tools
 * 2. Keyword similarity
 * 3. Popular tools as fallback
 */
export const getRelatedTools = (
  currentToolPath: string,
  category?: string,
  keywords?: string,
  limit: number = 6
): Tool[] => {
  const currentTool = allTools.find(tool => tool.path === currentToolPath);
  if (!currentTool) return getPopularTools(currentToolPath, limit);

  const related: Tool[] = [];
  const usedPaths = new Set([currentToolPath]);

  // Strategy 1: Same category tools
  if (category) {
    const categoryTools = getToolsByCategory(currentToolPath, category, limit);
    categoryTools.forEach(tool => {
      if (!usedPaths.has(tool.path) && related.length < limit) {
        related.push(tool);
        usedPaths.add(tool.path);
      }
    });
  }

  // Strategy 2: Keyword similarity
  if (related.length < limit && currentTool.keywords) {
    const keywordTools = getRelatedToolsByKeywords(currentTool, limit - related.length);
    keywordTools.forEach(tool => {
      if (!usedPaths.has(tool.path) && related.length < limit) {
        related.push(tool);
        usedPaths.add(tool.path);
      }
    });
  }

  // Strategy 3: Popular tools as fallback
  if (related.length < limit) {
    const popularTools = getPopularTools(currentToolPath, limit - related.length);
    popularTools.forEach(tool => {
      if (!usedPaths.has(tool.path) && related.length < limit) {
        related.push(tool);
        usedPaths.add(tool.path);
      }
    });
  }

  return related;
};

/**
 * Convert Tool to related tool format for ToolPageLayout
 */
export const toolToRelatedTool = (tool: Tool): {
  name: string;
  href: string;
  description: string;
} => {
  return {
    name: tool.name,
    href: tool.path,
    description: tool.description
  };
};

/**
 * Get "People also use" tools - popular tools from different categories
 */
export const getPeopleAlsoUseTools = (
  currentToolPath: string,
  currentCategory?: string,
  limit: number = 6
): Tool[] => {
  // Get popular tools excluding current tool and same category
  const popularTools = getPopularTools(currentToolPath, limit * 2);
  
  // Filter out same category tools to show variety
  const diverseTools = currentCategory
    ? popularTools.filter(tool => tool.category !== currentCategory)
    : popularTools;

  return diverseTools.slice(0, limit);
};

