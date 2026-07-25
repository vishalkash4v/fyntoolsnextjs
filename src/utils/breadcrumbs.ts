import { SITE_URL } from '@/lib/seo/site';

export type BreadcrumbItem = { name: string; url: string };

const CATEGORY_HUB_MAP: Record<string, string> = {
  'Text & Writing Tools': '/text-tools',
  'Image Tools': '/image-tools',
  'Typing Tools': '/typing-tools',
  'Utility Tools': '/utility-tools',
  'Number Tools': '/number-tools',
  'Converter Tools': '/converter-tools',
  'Development Tools': '/developer-tools',
  'Timer Tools': '/timer-tools',
  'Network Tools': '/network-tools',
  'Video & Social Media Tools': '/social-media-tools',
  'Period & Cycle Tools': '/period-cycle-tools',
  'Pregnancy Tools': '/pregnancy-tools',
  'Finance Tools': '/finance-tools',
  'Business Tools': '/business-tools',
};

const toAbsoluteUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${SITE_URL}${url}`;
  }
  return `${SITE_URL}/${url}`;
};

export const getCategoryHubUrl = (category?: string): string => {
  if (!category) return `${SITE_URL}/tools`;
  const path = CATEGORY_HUB_MAP[category];
  return path ? `${SITE_URL}${path}` : `${SITE_URL}/tools`;
};

export const getCategoryHubPath = (category?: string): string => {
  if (!category) return '/tools';
  return CATEGORY_HUB_MAP[category] || '/tools';
};

export const buildToolBreadcrumbs = (
  title: string,
  toolUrl: string,
  category?: string
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Tools', url: `${SITE_URL}/tools` },
  ];
  if (category) {
    items.push({ name: category, url: getCategoryHubUrl(category) });
  }
  items.push({ name: title, url: toAbsoluteUrl(toolUrl) });
  return items;
};
