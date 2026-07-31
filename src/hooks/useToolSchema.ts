/**
 * CSR-Safe Schema Injection Hook for React
 * 
 * Ensures schemas are:
 * - Injected only once per route
 * - Removed on unmount
 * - Never duplicated on re-render
 * - Valid for Google Rich Results Test
 */

import { useLayoutEffect, useRef } from 'react';
import { generateBreadcrumbSchema } from '@/utils/schemaUtils';

interface ToolSchemaConfig {
  name: string;
  description: string;
  url: string;
  category?: string;
  keywords?: string | string[];
  features?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  howToUse?: string[];
  applicationCategory?: string;
  operatingSystem?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

const SCHEMA_DATA_ATTRIBUTE = 'data-tool-schema';
const SCHEMA_ID_PREFIX = 'tool-schema-';

/**
 * Remove all existing tool schemas from the document head
 * This prevents duplicates when navigating between routes
 */
const removeExistingSchemas = (): void => {
  const existingSchemas = document.querySelectorAll(
    `script[type="application/ld+json"][${SCHEMA_DATA_ATTRIBUTE}]`
  );
  existingSchemas.forEach(schema => schema.remove());

  // Safety: remove any existing FAQPage scripts (prevents duplicates)
  const allLdJson = document.querySelectorAll('script[type="application/ld+json"]');
  allLdJson.forEach(script => {
    const content = script.textContent || '';
    if (!content) return;
    try {
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const hasFAQ = items.some(item => {
        if (!item) return false;
        if (item['@type'] === 'FAQPage') return true;
        if (item['@graph'] && Array.isArray(item['@graph'])) {
          return item['@graph'].some((g: any) => g && g['@type'] === 'FAQPage');
        }
        return false;
      });
      if (hasFAQ) {
        script.remove();
      }
    } catch {
      // Ignore invalid JSON-LD blocks
    }
  });
};

/**
 * Check if a schema with the given ID already exists
 */
const schemaExists = (schemaId: string): boolean => {
  return document.getElementById(schemaId) !== null;
};

/**
 * Inject a JSON-LD schema into the document head
 * Returns the script element ID for cleanup
 */
const injectSchema = (schema: object, schemaId: string): string => {
  // Remove any existing schema with the same ID
  const existing = document.getElementById(schemaId);
  if (existing) {
    existing.remove();
  }

  // Create new script element
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = schemaId;
  script.setAttribute(SCHEMA_DATA_ATTRIBUTE, 'true');
  script.textContent = JSON.stringify(schema, null, 0);

  // Append to head
  document.head.appendChild(script);

  return schemaId;
};

/**
 * Generate valid SoftwareApplication schema with all required fields
 * Validates that all required fields are present before generating
 */
const generateSoftwareApplicationSchema = (config: ToolSchemaConfig): object | null => {
  // Validate required fields
  if (!config.name || !config.description || !config.url) {
    console.error('❌ SoftwareApplication schema missing required fields:', {
      name: config.name,
      description: config.description,
      url: config.url
    });
    return null;
  }

  // Ensure name is not empty or whitespace
  const name = String(config.name).trim();
  if (name.length === 0) {
    console.error('❌ SoftwareApplication schema: name cannot be empty');
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name, // REQUIRED - validated above
    "applicationCategory": config.applicationCategory || "WebApplication", // REQUIRED
    "operatingSystem": config.operatingSystem || "Any", // REQUIRED
    "description": String(config.description).trim(), // REQUIRED
    "url": String(config.url).trim(), // REQUIRED
    "offers": { // REQUIRED
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    ...(config.keywords && {
      "keywords": Array.isArray(config.keywords) 
        ? config.keywords.join(", ") 
        : String(config.keywords)
    }),
    ...(config.features && config.features.length > 0 && {
      "featureList": config.features
    }),
    "provider": {
      "@type": "Organization",
      "name": "FYN Tools Worldwide",
      "url": "https://fyntools.com/"
    }
  };
};

/**
 * Generate valid FAQPage schema with mainEntity
 * Only generates if FAQs exist and are valid
 */
const generateFAQPageSchema = (
  faqs: Array<{ question: string; answer: string }>,
  toolUrl: string
): object | null => {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Filter valid FAQs
  const validFaqs = faqs.filter(
    faq => faq.question && faq.answer && 
    faq.question.trim().length > 0 && 
    faq.answer.trim().length > 0
  );

  if (validFaqs.length === 0) {
    return null;
  }

  // Generate mainEntity array
  const mainEntity = validFaqs.map(faq => ({
    "@type": "Question",
    "name": faq.question.trim(),
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer.trim()
    }
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": mainEntity
  };
};

/**
 * Generate HowTo schema from steps (only when steps exist)
 */
const generateHowToSchema = (config: ToolSchemaConfig): object | null => {
  if (!config.howToUse || config.howToUse.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${config.name}`,
    "description": config.description,
    "totalTime": "PT2M",
    "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "0" },
    "step": config.howToUse.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": `Step ${index + 1}`,
      "text": step
    }))
  };
};

/**
 * CSR-Safe Hook for injecting tool schemas
 * 
 * Usage:
 * ```tsx
 * useToolSchema({
 *   name: "Box Shadow Generator",
 *   description: "Generate CSS box shadows...",
 *   url: "https://fyntools.com/box-shadow-generator",
 *   faqs: [...]
 * });
 * ```
 */
export const useToolSchema = (config: ToolSchemaConfig): void => {
  const injectedRef = useRef<Set<string>>(new Set());
  const schemaIdsRef = useRef<string[]>([]);

  // Use useLayoutEffect for synchronous DOM updates (runs before paint)
  // This ensures schemas are injected before Google's crawler reads the page
  useLayoutEffect(() => {
    // Clean up any existing schemas from previous routes
    removeExistingSchemas();
    injectedRef.current.clear();
    schemaIdsRef.current = [];

    // Generate SoftwareApplication schema (always required)
    const softwareAppSchema = generateSoftwareApplicationSchema(config);
    
    // Only inject if schema is valid (has all required fields)
    if (softwareAppSchema) {
      // Use URL-based ID to ensure consistency and prevent duplicates
      const urlSlug = config.url.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const softwareAppId = `${SCHEMA_ID_PREFIX}softwareapp-${urlSlug}`;
      
      // Inject SoftwareApplication schema (only if it doesn't exist)
      if (!schemaExists(softwareAppId)) {
        injectSchema(softwareAppSchema, softwareAppId);
        injectedRef.current.add(softwareAppId);
        schemaIdsRef.current.push(softwareAppId);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SoftwareApplication schema injected:', {
            name: (softwareAppSchema as any).name,
            url: (softwareAppSchema as any).url,
            id: softwareAppId
          });
        }
      }
    } else {
      console.error('❌ Failed to generate SoftwareApplication schema - missing required fields');
    }

    // Generate FAQPage schema (only if FAQs exist and are valid)
    if (config.faqs && config.faqs.length > 0) {
      const faqSchema = generateFAQPageSchema(config.faqs, config.url);
      
      if (faqSchema) {
        // Use URL-based ID to ensure consistency and prevent duplicates
        const faqId = `${SCHEMA_ID_PREFIX}faq-${config.url.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        // Only inject if it doesn't exist
        if (!schemaExists(faqId)) {
          injectSchema(faqSchema, faqId);
          injectedRef.current.add(faqId);
          schemaIdsRef.current.push(faqId);
        }
      }
    }

    // Generate HowTo schema (only when howToUse steps exist)
    if (config.howToUse && config.howToUse.length > 0) {
      const howToSchema = generateHowToSchema(config);
      if (howToSchema) {
        const howToId = `${SCHEMA_ID_PREFIX}howto-${config.url.replace(/[^a-zA-Z0-9]/g, '-')}`;
        if (!schemaExists(howToId)) {
          injectSchema(howToSchema, howToId);
          injectedRef.current.add(howToId);
          schemaIdsRef.current.push(howToId);
        }
      }
    }

    // Generate BreadcrumbList schema (only if breadcrumbs exist and are valid)
    if (config.breadcrumbs && config.breadcrumbs.length > 0) {
      const breadcrumbSchema = generateBreadcrumbSchema(config.breadcrumbs);
      const breadcrumbId = `${SCHEMA_ID_PREFIX}breadcrumb-${config.url.replace(/[^a-zA-Z0-9]/g, '-')}`;
      if (!schemaExists(breadcrumbId)) {
        injectSchema(breadcrumbSchema, breadcrumbId);
        injectedRef.current.add(breadcrumbId);
        schemaIdsRef.current.push(breadcrumbId);
      }
    }

    // Cleanup function: remove schemas on unmount
    return () => {
      schemaIdsRef.current.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.remove();
        }
      });
      injectedRef.current.clear();
      schemaIdsRef.current = [];
    };
  }, [
    config.url,
    config.name,
    config.description,
    JSON.stringify(config.faqs || []),
    JSON.stringify(config.features || []),
    JSON.stringify(config.keywords || []),
    JSON.stringify(config.breadcrumbs || []),
    JSON.stringify(config.howToUse || [])
  ]);
};

export default useToolSchema;
