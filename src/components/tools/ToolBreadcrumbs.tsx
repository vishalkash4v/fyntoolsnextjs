import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryHubUrl } from '@/utils/breadcrumbs';

interface ToolBreadcrumbsProps {
  title: string;
  category?: string; // Enables Home → Tools → Category → Tool
  showToolsLink?: boolean;
}

const ToolBreadcrumbs: React.FC<ToolBreadcrumbsProps> = ({ title, category, showToolsLink = true }) => {
  const categoryHref = category
    ? getCategoryHubUrl(category).replace('https://fyntools.com', '')
    : '/tools';

  return (
    <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mb-6 ml-[6%] pr-4 max-w-full" aria-label="Breadcrumb">
      <Home className="h-4 w-4 shrink-0" />
      <Link to="/" className="hover:text-primary">Home</Link>
      {showToolsLink && (
        <>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <Link to="/tools" className="hover:text-primary">Tools</Link>
        </>
      )}
      {category && (
        <>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <Link to={categoryHref} className="hover:text-primary">{category}</Link>
        </>
      )}
      <ChevronRight className="h-4 w-4 shrink-0" />
      <span className="text-foreground">{title}</span>
    </nav>
  );
};

export default ToolBreadcrumbs;