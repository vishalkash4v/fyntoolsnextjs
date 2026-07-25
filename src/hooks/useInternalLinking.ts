'use client';
import { useMemo } from 'react';
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import { 
  getRelatedTools, 
  getPeopleAlsoUseTools, 
  toolToRelatedTool 
} from '@/utils/internalLinking';
import { allTools } from '@/data/toolsData';

/**
 * Hook to get internal linking data for tool pages
 * Automatically generates related tools and "People also use" suggestions
 */
export const useInternalLinking = (
  category?: string,
  keywords?: string | string[],
  options?: {
    relatedToolsLimit?: number;
    peopleAlsoUseLimit?: number;
    autoGenerate?: boolean;
  }
) => {
  const pathname = usePathname();
  const location = { pathname, search: typeof window !== 'undefined' ? window.location.search : '' };
  const currentPath = location.pathname;

  const keywordsString = useMemo(() => {
    return Array.isArray(keywords) ? keywords.join(', ') : keywords || '';
  }, [keywords]);

  // Get related tools from same category
  const relatedTools = useMemo(() => {
    if (!options?.autoGenerate && options?.autoGenerate !== undefined) {
      return [];
    }
    
    return getRelatedTools(
      currentPath,
      category,
      keywordsString,
      options?.relatedToolsLimit || 6
    ).map(toolToRelatedTool);
  }, [currentPath, category, keywordsString, options?.relatedToolsLimit, options?.autoGenerate]);

  // Get "People also use" tools
  const peopleAlsoUseTools = useMemo(() => {
    return getPeopleAlsoUseTools(
      currentPath,
      category,
      options?.peopleAlsoUseLimit || 6
    ).map(toolToRelatedTool);
  }, [currentPath, category, options?.peopleAlsoUseLimit]);

  // Get current tool data
  const currentTool = useMemo(() => {
    return allTools.find(tool => tool.path === currentPath);
  }, [currentPath]);

  return {
    relatedTools,
    peopleAlsoUseTools,
    currentTool,
    currentPath
  };
};

