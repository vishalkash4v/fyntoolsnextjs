
import React from 'react';
import { useLocation } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { generateToolSchemas, type SchemaConfig } from '@/utils/schemaUtils';
import ToolBreadcrumbs from '@/components/tools/ToolBreadcrumbs';
import { buildToolBreadcrumbs } from '@/utils/breadcrumbs';
import ToolFAQ from '@/components/tools/ToolFAQ';
import { useToolSchema } from '@/hooks/useToolSchema';

interface PageWrapperProps {
  title?: string;
  description?: string;
  keywords?: string;
  pageTitle?: string;
  showBackButton?: boolean;
  backTo?: string | number;
  children: React.ReactNode;
  toolCategory?: string;
  canonicalUrl?: string;
  heroImage?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  title = '',
  description = '',
  keywords,
  children,
  toolCategory = "Online Tool",
  canonicalUrl: providedCanonicalUrl,
  heroImage = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop",
  faqs
}) => {
  const location = useLocation();
  const isNonToolPage = toolCategory === 'About' || toolCategory === 'Contact' || toolCategory === 'Blog';

  const safeTitle = typeof title === 'string' ? title : '';
  const safeDescription = typeof description === 'string' ? description : '';

  const fullTitle = isNonToolPage
    ? `${safeTitle} | FYN Tools Worldwide`
    : `${safeTitle} - Free Online Tool | FYN Tools Worldwide`;
  
  const fullDescription = isNonToolPage
    ? safeDescription
    : `${safeDescription} Use our free ${safeTitle.toLowerCase()} tool for instant results. No registration needed. FYN Tools Worldwide - Your one-stop destination for professional online tools.`;

  // Generate structured data for tool pages
  const toolUrl = providedCanonicalUrl || `https://fyntools.com${location.pathname}`;
  const breadcrumbs = buildToolBreadcrumbs(safeTitle, toolUrl);
  
  const structuredData = !isNonToolPage ? generateToolSchemas({
    toolName: safeTitle,
    toolUrl,
    description: fullDescription,
    category: toolCategory,
    keywords: keywords,
    faqs: faqs,
    breadcrumbs: breadcrumbs
  }) : undefined;

  // Generate schema markup for tools with FAQs (CSR-safe)
  if (!isNonToolPage && faqs && faqs.length > 0) {
    useToolSchema({
      name: safeTitle,
      description: fullDescription,
      url: toolUrl,
      category: toolCategory,
      keywords: keywords,
      faqs: faqs,
      applicationCategory: "WebApplication",
      operatingSystem: "Any",
      breadcrumbs: breadcrumbs
    });
  }
  
  return (
    <>
      <SEOHead
        title={safeTitle}
        description={fullDescription}
        canonicalUrl={providedCanonicalUrl}
        keywords={keywords ? `${keywords}, free online tool, calculator, worldwide, instant results, no registration, fyn tools worldwide` : undefined}
        ogImage={heroImage}
        structuredData={structuredData}
        isToolPage={!isNonToolPage}
        titleTemplate={fullTitle}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        <main className="py-12 relative">
          {!isNonToolPage && (
            <div className="px-4 sm:px-6 md:px-8">
              <ToolBreadcrumbs title={title} showToolsLink />
            </div>
          )}
          <div className="animate-fade-in-up">
            {children}
            {/* FAQ Section for tools with FAQs */}
            {!isNonToolPage && faqs && faqs.length > 0 && (
              <ToolFAQ 
                toolName={safeTitle}
                faqs={faqs}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default PageWrapper;
