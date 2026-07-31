'use client';

import ToolSearch from '@/components/tools/ToolSearch';
import { allTools } from '@/data/toolsData';

const SEARCH_TOOLS = allTools.filter(
  (t) => !['/enhanced-unit-converter', '/add-name-date-photo'].includes(t.path)
);

/** Isolated chunk — keeps toolsData + lucide icons out of the default header graph. */
export default function HeaderSearch({
  className,
  onResultClick,
}: {
  className?: string;
  onResultClick?: () => void;
}) {
  return <ToolSearch tools={SEARCH_TOOLS} className={className} onResultClick={onResultClick} />;
}
