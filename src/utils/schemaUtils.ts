import { validateSchemas, removeDuplicateSchemas } from './schemaValidator';

export interface SchemaConfig {
  toolName: string;
  toolUrl: string;
  description: string;
  shortIntro?: string;
  category?: string;
  keywords?: string[] | string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
  testimonials?: Array<{
    name: string;
    rating: number;
    text: string;
    title?: string;
  }>;
  features?: string[];
  howToUse?: string[];
  relatedTools?: Array<{
    name: string;
    href: string;
    description?: string;
  }>;
}

/**
 * Generates SoftwareApplication schema with ALL required fields:
 * - name (REQUIRED)
 * - description (REQUIRED)
 * - url (REQUIRED)
 * - applicationCategory (REQUIRED)
 * - operatingSystem (REQUIRED)
 * - offers (REQUIRED)
 * 
 * Validates and ensures all required fields are present for Google Rich Results Test
 */
export const generateSoftwareApplicationSchema = (config: SchemaConfig) => {
  // Validate required fields
  if (!config.toolName || !config.description || !config.toolUrl) {
    console.warn('Missing required fields for SoftwareApplication schema:', {
      toolName: config.toolName,
      description: config.description,
      toolUrl: config.toolUrl
    });
    // Return null if critical fields are missing
    if (!config.toolName || !config.description || !config.toolUrl) {
      return null;
    }
  }

  // Build schema with ALL required fields
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": config.toolName, // REQUIRED
    "description": config.description, // REQUIRED
    "url": config.toolUrl, // REQUIRED
    "applicationCategory": "WebApplication", // REQUIRED - Google expects this
    "operatingSystem": "Any", // REQUIRED - Google expects this
    "offers": { // REQUIRED
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  // Optional but recommended fields
  if (config.features && config.features.length > 0) {
    schema.featureList = config.features;
  }

  if (config.keywords) {
    schema.keywords = Array.isArray(config.keywords) 
      ? config.keywords.join(", ") 
      : config.keywords;
  }

  // Add provider information
  schema.provider = {
    "@type": "Organization",
    "name": "FYN Tools Worldwide",
    "url": "https://fyntools.com/"
  };

  return schema;
};

export const generateWebApplicationSchema = (config: SchemaConfig) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": config.toolName,
    "description": config.description,
    "url": config.toolUrl,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "FYN Tools Worldwide",
      "url": "https://fyntools.com/"
    },
    "featureList": config.features || []
  };
};

export const generateHowToSchema = (config: SchemaConfig) => {
  if (!config.howToUse || config.howToUse.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${config.toolName}`,
    "description": config.description,
    "totalTime": "PT2M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "step": config.howToUse.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": `Step ${index + 1}`,
      "text": step
    }))
  };
};

export const generateItemListSchema = (config: SchemaConfig) => {
  if (!config.relatedTools || config.relatedTools.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Related Tools",
    "description": "Related tools that complement this functionality",
    "numberOfItems": config.relatedTools.length,
    "itemListElement": config.relatedTools.map((tool, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": tool.name,
      "url": `https://fyntools.com${tool.href}`,
      "description": tool.description
    }))
  };
};

/**
 * Generates FAQPage schema from FAQ data
 * Validates that FAQs exist and have required fields
 * Ensures schema matches visible content exactly
 * Removes duplicates and empty entries
 * Ensures Google Rich Results Test compliance
 */
export const generateFAQPageSchema = (faqs: Array<{ question: string; answer: string }>) => {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Step 1: Filter out invalid/empty FAQs
  const validFaqs = faqs.filter(faq => 
    faq.question && faq.answer && 
    typeof faq.question === 'string' &&
    typeof faq.answer === 'string' &&
    faq.question.trim().length > 0 && 
    faq.answer.trim().length > 0
  );

  if (validFaqs.length === 0) {
    return null;
  }

  // Step 2: Remove duplicates based on question text (case-insensitive)
  const seenQuestions = new Set<string>();
  const uniqueFaqs: Array<{ question: string; answer: string }> = [];
  
  for (const faq of validFaqs) {
    const normalizedQuestion = faq.question.trim().toLowerCase();
    
    // Skip if we've seen this question before
    if (!seenQuestions.has(normalizedQuestion)) {
      seenQuestions.add(normalizedQuestion);
      uniqueFaqs.push(faq);
    }
  }

  if (uniqueFaqs.length === 0) {
    return null;
  }

  // Step 3: Generate schema with exact same questions and answers as displayed
  // This ensures 1:1 match between visible content and structured data
  // Google Rich Results Test requirements:
  // - Each Question must have name (string, required)
  // - Each Answer must have text (string, required)
  // - mainEntity must be an array with at least one Question
  const mainEntity = uniqueFaqs.map(faq => {
    // Trim whitespace but preserve content exactly as displayed
    const question = faq.question.trim();
    const answer = faq.answer.trim();
    
    // Validate for Google Rich Results Test compliance
    if (!question || question.length === 0) {
      console.warn('⚠️ FAQ with empty question detected and skipped');
      return null;
    }
    
    if (!answer || answer.length === 0) {
      console.warn('⚠️ FAQ with empty answer detected and skipped');
      return null;
    }
    
    return {
      "@type": "Question",
      "name": question, // Exact match to visible question (required by Google)
      "acceptedAnswer": {
        "@type": "Answer",
        "text": answer // Exact match to visible answer (required by Google)
      }
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  // Final validation: must have at least one FAQ for valid schema
  if (mainEntity.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": mainEntity
  };
};

/**
 * Validates that FAQPage schema matches visible FAQs exactly
 * Returns array of mismatches if any
 */
export const validateFAQPageSchemaMatch = (
  schema: any,
  visibleFaqs: Array<{ question: string; answer: string }>
): string[] => {
  const errors: string[] = [];

  if (!schema || schema['@type'] !== 'FAQPage') {
    errors.push('Schema is not a valid FAQPage');
    return errors;
  }

  if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
    errors.push('FAQPage schema missing mainEntity array');
    return errors;
  }

  // Filter visible FAQs same way schema generation does
  const validVisibleFaqs = visibleFaqs.filter(faq => 
    faq.question && faq.answer && 
    typeof faq.question === 'string' &&
    typeof faq.answer === 'string' &&
    faq.question.trim().length > 0 && 
    faq.answer.trim().length > 0
  );

  if (schema.mainEntity.length !== validVisibleFaqs.length) {
    errors.push(
      `FAQ count mismatch: Schema has ${schema.mainEntity.length} FAQs, ` +
      `but visible content has ${validVisibleFaqs.length} FAQs`
    );
  }

  // Check each FAQ matches
  schema.mainEntity.forEach((schemaFaq: any, index: number) => {
    if (index >= validVisibleFaqs.length) {
      errors.push(`Schema FAQ at index ${index} has no matching visible FAQ`);
      return;
    }

    const visibleFaq = validVisibleFaqs[index];
    const schemaQuestion = schemaFaq.name?.trim() || '';
    const visibleQuestion = visibleFaq.question.trim();
    const schemaAnswer = schemaFaq.acceptedAnswer?.text?.trim() || '';
    const visibleAnswer = visibleFaq.answer.trim();

    if (schemaQuestion !== visibleQuestion) {
      errors.push(
        `FAQ ${index + 1} question mismatch:\n` +
        `  Schema: "${schemaQuestion}"\n` +
        `  Visible: "${visibleQuestion}"`
      );
    }

    if (schemaAnswer !== visibleAnswer) {
      errors.push(
        `FAQ ${index + 1} answer mismatch:\n` +
        `  Schema: "${schemaAnswer.substring(0, 50)}..."\n` +
        `  Visible: "${visibleAnswer.substring(0, 50)}..."`
      );
    }
  });

  return errors;
};

export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }))
  };
};

export const generateTestimonialsSchema = (testimonials: Array<{ name: string; rating: number; text: string; title?: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Online Tool",
    "review": testimonials.map(testimonial => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": testimonial.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": testimonial.rating,
        "bestRating": 5
      },
      "reviewBody": testimonial.text
    }))
  };
};

/**
 * Generates all schemas for a tool page
 * Ensures no duplication and validates all schemas
 * Returns array of valid JSON-LD schemas
 */
export const generateToolSchemas = (config: SchemaConfig) => {
  const schemas: any[] = [];

  // 1. SoftwareApplication schema (required for tool pages)
  // Note: We use SoftwareApplication instead of WebApplication to avoid duplication
  // SoftwareApplication is more specific and includes all WebApplication properties
  const softwareAppSchema = generateSoftwareApplicationSchema(config);
  if (softwareAppSchema) {
    schemas.push(softwareAppSchema);
  }

  // 2. FAQPage schema (if FAQs exist)
  // CRITICAL: Only ONE FAQPage schema per page (Google Rich Results requirement)
  // This prevents "Duplicate field FAQPage" errors in Google Search Console
  if (config.faqs && config.faqs.length > 0) {
    const faqSchema = generateFAQPageSchema(config.faqs);
    if (faqSchema) {
      // Validate that mainEntity exists (required by Google)
      if (!faqSchema.mainEntity || !Array.isArray(faqSchema.mainEntity) || faqSchema.mainEntity.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ FAQPage schema missing mainEntity - skipping invalid schema');
        }
      } else {
        // Check if FAQPage schema already exists (prevent duplicates)
        const existingFAQPage = schemas.find(s => s && s['@type'] === 'FAQPage');
        if (existingFAQPage) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Multiple FAQPage schemas detected. Only one will be kept.');
          }
        } else {
          schemas.push(faqSchema);
        }
      }
    }
  }

  // 3. BreadcrumbList schema (if breadcrumbs exist)
  if (config.breadcrumbs && config.breadcrumbs.length > 0) {
    const breadcrumbSchema = generateBreadcrumbSchema(config.breadcrumbs);
    if (breadcrumbSchema) {
      schemas.push(breadcrumbSchema);
    }
  }

  // 4. HowTo schema (if steps are provided)
  const howToSchema = generateHowToSchema(config);
  if (howToSchema) {
    schemas.push(howToSchema);
  }

  // 5. ItemList schema for related tools (if related tools exist)
  const itemListSchema = generateItemListSchema(config);
  if (itemListSchema) {
    schemas.push(itemListSchema);
  }

  // 6. Product/Review schema (if testimonials exist)
  if (config.testimonials && config.testimonials.length > 0) {
    const testimonialsSchema = generateTestimonialsSchema(config.testimonials);
    if (testimonialsSchema) {
      schemas.push(testimonialsSchema);
    }
  }

  // Remove duplicates
  const uniqueSchemas = removeDuplicateSchemas(schemas);

  // Validate schemas (only in development)
  if (process.env.NODE_ENV === 'development') {
    const validation = validateSchemas(uniqueSchemas);
    if (!validation.isValid) {
      console.error('Schema validation errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn('Schema validation warnings:', validation.warnings);
    }
  }

  // Filter out invalid schemas
  return uniqueSchemas.filter(schema => {
    if (!schema || typeof schema !== 'object') {
      return false;
    }
    // Ensure required fields exist
    if (!schema['@context'] || !schema['@type']) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Invalid schema missing @context or @type:', schema);
      }
      return false;
    }
    return true;
  });
};
