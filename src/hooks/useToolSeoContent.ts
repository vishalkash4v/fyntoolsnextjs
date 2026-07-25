'use client';
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import { getToolSeoContent } from '@/data/toolSeoContent';

/**
 * Hook to get SEO content for the current tool page based on the URL path.
 * Use this in tool pages to automatically get introText, useCases, examples,
 * whenToUse, tips, and internalLinkInIntro without hardcoding the path.
 */
export function useToolSeoContent() {
  const pathname = usePathname();
  return getToolSeoContent(pathname);
}
