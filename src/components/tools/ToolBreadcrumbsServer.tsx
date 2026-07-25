import Link from 'next/link';
import { getCategoryHubPath } from '@/utils/breadcrumbs';

interface Props {
  title: string;
  category?: string;
}

/** Server Component breadcrumbs (no client boundary). */
export default function ToolBreadcrumbsServer({ title, category }: Props) {
  const categoryHref = category ? getCategoryHubPath(category) : '/tools';

  return (
    <nav
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mb-6 ml-[6%] pr-4 max-w-full"
      aria-label="Breadcrumb"
    >
      <Link href="/" className="hover:text-primary">
        Home
      </Link>
      <span aria-hidden>/</span>
      <Link href="/tools" className="hover:text-primary">
        Tools
      </Link>
      {category && (
        <>
          <span aria-hidden>/</span>
          <Link href={categoryHref} className="hover:text-primary">
            {category}
          </Link>
        </>
      )}
      <span aria-hidden>/</span>
      <span className="text-foreground">{title}</span>
    </nav>
  );
}
