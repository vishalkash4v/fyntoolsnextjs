'use client';
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import { useMemo } from 'react';
import { allTools, type Tool } from '@/data/toolsData';
import { getCanonicalUrlForPath } from '@/utils/canonicalUrl';

/**
 * Hook to get SEO data based on current route
 * Automatically finds tool data from toolsData.ts
 */
export const useSEO = () => {
  const pathname = usePathname();
  const location = { pathname, search: typeof window !== 'undefined' ? window.location.search : '' };
  const siteUrl = 'https://fyntools.com';

  // Find tool data from current route
  const toolData = useMemo(() => {
    return allTools.find((tool: Tool) => tool.path === location.pathname);
  }, [location.pathname]);

  // Generate canonical URL (normalized)
  const canonicalUrl = useMemo(() => {
    return getCanonicalUrlForPath(location.pathname, siteUrl);
  }, [location.pathname, siteUrl]);

  // Generate OG image URL based on route
  const ogImage = useMemo(() => {
    if (toolData) {
      const imageName = toolData.name.toLowerCase().replace(/\s+/g, '-');
      return `${siteUrl}/assets/tool-screenshots/${imageName}.jpg`;
    }
    return `${siteUrl}/assets/og-image.jpg`;
  }, [toolData]);

  return {
    toolData,
    canonicalUrl,
    ogImage,
    currentPath: location.pathname,
    siteUrl,
  };
};

/**
 * Hook to get SEO props for a tool page
 * Returns ready-to-use props for SEOHead component
 */
export const useToolSEO = (customData?: {
  title?: string;
  description?: string;
  keywords?: string | string[];
  ogImage?: string;
}) => {
  const { toolData, canonicalUrl, ogImage: defaultOgImage } = useSEO();

  return useMemo(() => {
    const title = customData?.title || toolData?.name || 'Tool';
    const description = customData?.description || toolData?.description || '';
    const keywords = customData?.keywords || toolData?.keywords || '';
    const ogImage = customData?.ogImage || defaultOgImage;

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage,
      ogTitle: title,
      ogDescription: description,
      ogUrl: canonicalUrl,
    };
  }, [toolData, canonicalUrl, defaultOgImage, customData]);
};

