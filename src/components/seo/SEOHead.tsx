import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { normalizeCanonicalUrl, validateCanonicalUrl } from '@/utils/canonicalUrl';

export interface SEOHeadProps {
  /**
   * Page title (will be appended with site name)
   */
  title: string;
  
  /**
   * Meta description
   */
  description: string;
  
  /**
   * Canonical URL (auto-generated from current route if not provided)
   */
  canonicalUrl?: string;
  
  /**
   * Open Graph title (defaults to title if not provided)
   */
  ogTitle?: string;
  
  /**
   * Open Graph description (defaults to description if not provided)
   */
  ogDescription?: string;
  
  /**
   * Open Graph URL (defaults to canonicalUrl if not provided)
   */
  ogUrl?: string;
  
  /**
   * Open Graph image URL
   */
  ogImage?: string;
  
  /**
   * Open Graph image width (default: 1200)
   */
  ogImageWidth?: number;
  
  /**
   * Open Graph image height (default: 630)
   */
  ogImageHeight?: number;
  
  /**
   * Open Graph image alt text
   */
  ogImageAlt?: string;
  
  /**
   * Keywords (string or array)
   */
  keywords?: string | string[];
  
  /**
   * Twitter card type (default: summary_large_image)
   */
  twitterCard?: 'summary' | 'summary_large_image';
  
  /**
   * Twitter site handle (default: @fyntoolsworldwide)
   */
  twitterSite?: string;
  
  /**
   * Twitter creator handle
   */
  twitterCreator?: string;
  
  /**
   * Robots meta tag (default: index, follow)
   */
  robots?: string;
  
  /**
   * Additional meta tags
   */
  additionalMetaTags?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
  
  /**
   * Structured data (JSON-LD)
   */
  structuredData?: object | object[];
  
  /**
   * Site name (default: FYN Tools Worldwide)
   */
  siteName?: string;
  
  /**
   * Site URL (default: https://fyntools.com)
   */
  siteUrl?: string;
  
  /**
   * Title template (default: "{title} - Free Online Tool | {siteName}")
   */
  titleTemplate?: string;
  
  /**
   * Whether this is a tool page (affects title template)
   */
  isToolPage?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage,
  ogImageWidth = 1200,
  ogImageHeight = 630,
  ogImageAlt,
  keywords,
  twitterCard = 'summary_large_image',
  twitterSite = '@fyntoolsworldwide',
  twitterCreator,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  additionalMetaTags = [],
  structuredData,
  siteName = 'FYN Tools Worldwide',
  siteUrl = 'https://fyntools.com',
  titleTemplate,
  isToolPage = true,
}) => {
  const location = useLocation();
  
  // Normalize canonical URL - ensures consistency and removes trailing slashes
  const finalCanonicalUrl = normalizeCanonicalUrl(
    canonicalUrl,
    location.pathname,
    siteUrl
  );
  
  // Generate full title with template
  const defaultTitleTemplate = isToolPage 
    ? `${title} - Free Online Tool | ${siteName}`
    : `${title} | ${siteName}`;
  const fullTitle = titleTemplate || defaultTitleTemplate;
  
  // Use provided values or fallback to defaults
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;
  const finalOgUrl = ogUrl || finalCanonicalUrl;
  const finalOgImage = ogImage || `${siteUrl}/assets/tool-screenshots/default-og-image.jpg`;
  const finalOgImageAlt = ogImageAlt || `${title} - Free Online Tool`;
  const hasQueryParams = Boolean(location.search && location.search.length > 1);
  const finalRobots = hasQueryParams
    ? 'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    : robots;
  
  // Format keywords
  const keywordsString = Array.isArray(keywords) 
    ? keywords.join(', ') 
    : keywords;
  
  // Format structured data
  // NOTE: For tool pages, schemas are now injected via useToolSchema hook (CSR-safe)
  // This structuredData prop is kept for backward compatibility with non-tool pages
  let structuredDataArray = Array.isArray(structuredData) 
    ? structuredData 
    : structuredData ? [structuredData] : [];

  // Ensure only one FAQPage schema per page (Google Rich Results requirement)
  // This is CRITICAL - Google requires exactly ONE FAQPage schema per page
  const faqPageSchemas = structuredDataArray.filter(s => s && s['@type'] === 'FAQPage');
  if (faqPageSchemas.length > 1) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Multiple FAQPage schemas detected. Keeping only the first valid one with mainEntity.');
    }
    // Remove all but the first VALID FAQPage schema (must have mainEntity)
    let foundFirstValid = false;
    structuredDataArray = structuredDataArray.filter(s => {
      if (s && s['@type'] === 'FAQPage') {
        // Check if this FAQPage has mainEntity (required by Google)
        const hasMainEntity = s.mainEntity && Array.isArray(s.mainEntity) && s.mainEntity.length > 0;
        
        if (!foundFirstValid && hasMainEntity) {
          foundFirstValid = true;
          return true; // Keep first valid one
        }
        // Remove duplicates or invalid ones
        if (process.env.NODE_ENV === 'development' && !hasMainEntity) {
          console.warn('⚠️ Removing invalid FAQPage schema (missing mainEntity)');
        }
        return false;
      }
      return true; // Keep non-FAQPage schemas
    });
  }

  // Ensure only one SoftwareApplication schema per page
  const softwareAppSchemas = structuredDataArray.filter(s => s && s['@type'] === 'SoftwareApplication');
  if (softwareAppSchemas.length > 1) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Multiple SoftwareApplication schemas detected. Keeping only the first valid one.');
    }
    let foundFirst = false;
    structuredDataArray = structuredDataArray.filter(s => {
      if (s && s['@type'] === 'SoftwareApplication') {
        // Validate required fields
        const hasRequiredFields = s.name && s.description && s.url && s.offers && s.applicationCategory && s.operatingSystem;
        if (!foundFirst && hasRequiredFields) {
          foundFirst = true;
          return true;
        }
        return false;
      }
      return true;
    });
  }

  // Development: Warn if canonical URL has issues
  if (process.env.NODE_ENV === 'development' && canonicalUrl) {
    const validation = validateCanonicalUrl(finalCanonicalUrl);
    if (!validation.isValid) {
      console.warn('⚠️ Canonical URL validation issues:', validation.errors);
    }
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywordsString && <meta name="keywords" content={keywordsString} />}
      <link rel="canonical" href={finalCanonicalUrl} />
      <meta name="robots" content={finalRobots} />
      <meta name="author" content={siteName} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:image:width" content={ogImageWidth.toString()} />
      <meta property="og:image:height" content={ogImageHeight.toString()} />
      <meta property="og:image:alt" content={finalOgImageAlt} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={finalOgImage} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      
      {/* Additional Meta Tags */}
      {additionalMetaTags.map((tag, index) => (
        <meta
          key={index}
          {...(tag.name ? { name: tag.name } : {})}
          {...(tag.property ? { property: tag.property } : {})}
          content={tag.content}
        />
      ))}
      
      {/* Structured Data (JSON-LD) */}
      {structuredDataArray.map((schema, index) => {
        // Validate schema before rendering
        if (!schema || typeof schema !== 'object') {
          console.warn('Invalid structured data schema at index', index);
          return null;
        }

        // Special validation for FAQPage schema (Google Rich Results Test compliance)
        if (schema['@type'] === 'FAQPage') {
          // Validate structure for Google Rich Results Test
          if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
            console.warn('⚠️ FAQPage schema missing mainEntity array (required by Google)');
            return null; // Don't render invalid schema
          }

          if (schema.mainEntity.length === 0) {
            console.warn('⚠️ FAQPage schema has empty mainEntity array (required by Google)');
            return null; // Don't render invalid schema
          }

          // Validate each FAQ item
          schema.mainEntity.forEach((faq: any, index: number) => {
            if (!faq['@type'] || faq['@type'] !== 'Question') {
              console.warn(`⚠️ FAQPage mainEntity[${index}] missing or invalid @type: "Question"`);
            }
            if (!faq.name || typeof faq.name !== 'string' || faq.name.trim().length === 0) {
              console.warn(`⚠️ FAQPage mainEntity[${index}] missing or empty "name" (required by Google)`);
            }
            if (!faq.acceptedAnswer) {
              console.warn(`⚠️ FAQPage mainEntity[${index}] missing "acceptedAnswer" (required by Google)`);
            } else {
              if (!faq.acceptedAnswer['@type'] || faq.acceptedAnswer['@type'] !== 'Answer') {
                console.warn(`⚠️ FAQPage mainEntity[${index}].acceptedAnswer missing or invalid @type: "Answer"`);
              }
              if (!faq.acceptedAnswer.text || typeof faq.acceptedAnswer.text !== 'string' || faq.acceptedAnswer.text.trim().length === 0) {
                console.warn(`⚠️ FAQPage mainEntity[${index}].acceptedAnswer missing or empty "text" (required by Google)`);
              }
            }
          });
        }

        try {
          const jsonString = JSON.stringify(schema);
          return (
            <script 
              key={`schema-${index}`} 
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: jsonString }}
            />
          );
        } catch (error) {
          console.error('Error stringifying structured data:', error, schema);
          return null;
        }
      })}
    </Helmet>
  );
};

export default SEOHead;

