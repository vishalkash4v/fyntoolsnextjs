/**
 * FAQ Schema Validator
 * Ensures FAQPage schema matches visible content exactly
 * Validates Google Rich Results Test compliance
 */

import { generateFAQPageSchema, validateFAQPageSchemaMatch } from './schemaUtils';
import { validateFAQPageComplete } from './googleRichResultsValidator';

/**
 * Validates that FAQPage schema will match visible FAQs
 * Call this before rendering to ensure consistency
 * Also validates Google Rich Results Test compliance
 */
export const validateFAQSync = (
  faqs: Array<{ question: string; answer: string }>,
  toolName: string
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  schema: any | null;
  googleRichResultsValid: boolean;
  contentMatch: boolean;
} => {
  const schema = generateFAQPageSchema(faqs);
  
  if (!schema) {
    if (faqs.length === 0) {
      return { 
        isValid: true, 
        errors: [], 
        warnings: [],
        schema: null,
        googleRichResultsValid: true,
        contentMatch: true
      };
    }
    return {
      isValid: false,
      errors: ['Failed to generate FAQPage schema from FAQs'],
      warnings: [],
      schema: null,
      googleRichResultsValid: false,
      contentMatch: false
    };
  }

  // Complete validation: Google Rich Results + Content Match
  const validation = validateFAQPageComplete(schema, faqs);

  if (process.env.NODE_ENV === 'development') {
    if (!validation.isValid) {
      console.warn(`⚠️ FAQPage schema validation failed for ${toolName}:`, validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn(`⚠️ FAQPage schema warnings for ${toolName}:`, validation.warnings);
    }
    if (!validation.contentMatch) {
      console.warn(`⚠️ FAQPage schema content mismatch for ${toolName}:`, validation.contentErrors);
    }
    if (validation.isValid && validation.contentMatch) {
      console.log(`✅ FAQPage schema validated successfully for ${toolName} (Google Rich Results compliant)`);
    }
  }

  return {
    isValid: validation.isValid && validation.contentMatch,
    errors: [...validation.errors, ...validation.contentErrors],
    warnings: validation.warnings,
    schema,
    googleRichResultsValid: validation.isValid,
    contentMatch: validation.contentMatch
  };
};

/**
 * Hook to ensure FAQ schema matches visible content
 * Use in development to catch mismatches
 */
export const useFAQSchemaValidation = (
  faqs: Array<{ question: string; answer: string }>,
  toolName: string
) => {
  if (process.env.NODE_ENV === 'development') {
    const validation = validateFAQSync(faqs, toolName);
    
    if (!validation.isValid) {
      console.warn(
        `⚠️ FAQ Schema Validation Failed for ${toolName}:`,
        validation.errors
      );
    }
    
    return validation;
  }
  
  return { isValid: true, errors: [], schema: null };
};

