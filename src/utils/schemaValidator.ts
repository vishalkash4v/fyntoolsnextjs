/**
 * Schema validation utilities
 * Ensures JSON-LD schemas are valid and don't have duplicates
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a single JSON-LD schema
 */
export const validateSchema = (schema: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!schema || typeof schema !== 'object') {
    errors.push('Schema must be an object');
    return { isValid: false, errors, warnings };
  }

  // Check required @context
  if (!schema['@context']) {
    errors.push('Schema must have @context property');
  } else if (schema['@context'] !== 'https://schema.org') {
    warnings.push(`@context should be "https://schema.org", got "${schema['@context']}"`);
  }

  // Check required @type
  if (!schema['@type']) {
    errors.push('Schema must have @type property');
  }

  // Validate SoftwareApplication schema
  if (schema['@type'] === 'SoftwareApplication') {
    const requiredFields = ['name', 'description', 'url', 'operatingSystem', 'offers'];
    requiredFields.forEach(field => {
      if (!schema[field]) {
        errors.push(`SoftwareApplication schema missing required field: ${field}`);
      }
    });

    // Validate offers structure
    if (schema.offers) {
      if (!schema.offers['@type'] || schema.offers['@type'] !== 'Offer') {
        errors.push('SoftwareApplication.offers must have @type: "Offer"');
      }
      if (!schema.offers.price) {
        errors.push('SoftwareApplication.offers must have price');
      }
      if (!schema.offers.priceCurrency) {
        errors.push('SoftwareApplication.offers must have priceCurrency');
      }
    }
  }

  // Validate FAQPage schema
  if (schema['@type'] === 'FAQPage') {
    if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
      errors.push('FAQPage schema must have mainEntity array');
    } else {
      schema.mainEntity.forEach((item: any, index: number) => {
        if (!item['@type'] || item['@type'] !== 'Question') {
          errors.push(`FAQPage.mainEntity[${index}] must have @type: "Question"`);
        }
        if (!item.name) {
          errors.push(`FAQPage.mainEntity[${index}] must have name`);
        }
        if (!item.acceptedAnswer) {
          errors.push(`FAQPage.mainEntity[${index}] must have acceptedAnswer`);
        } else {
          if (!item.acceptedAnswer['@type'] || item.acceptedAnswer['@type'] !== 'Answer') {
            errors.push(`FAQPage.mainEntity[${index}].acceptedAnswer must have @type: "Answer"`);
          }
          if (!item.acceptedAnswer.text) {
            errors.push(`FAQPage.mainEntity[${index}].acceptedAnswer must have text`);
          }
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Checks for duplicate schemas in an array
 */
export const findDuplicateSchemas = (schemas: any[]): number[][] => {
  const duplicates: number[][] = [];
  const seen = new Map<string, number[]>();

  schemas.forEach((schema, index) => {
    if (!schema || !schema['@type']) return;

    const key = `${schema['@type']}-${schema.name || schema.url || index}`;
    if (seen.has(key)) {
      const existing = seen.get(key)!;
      if (!duplicates.some(d => d.includes(existing[0]))) {
        duplicates.push([existing[0], index]);
      } else {
        const dupIndex = duplicates.findIndex(d => d.includes(existing[0]));
        duplicates[dupIndex].push(index);
      }
    } else {
      seen.set(key, [index]);
    }
  });

  return duplicates;
};

/**
 * Validates an array of schemas and checks for duplicates
 */
export const validateSchemas = (schemas: any[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(schemas)) {
    errors.push('Schemas must be an array');
    return { isValid: false, errors, warnings };
  }

  // Validate each schema
  schemas.forEach((schema, index) => {
    const result = validateSchema(schema);
    if (!result.isValid) {
      errors.push(`Schema[${index}]: ${result.errors.join(', ')}`);
    }
    if (result.warnings.length > 0) {
      warnings.push(`Schema[${index}]: ${result.warnings.join(', ')}`);
    }
  });

  // Check for duplicates
  const duplicates = findDuplicateSchemas(schemas);
  if (duplicates.length > 0) {
    duplicates.forEach(dup => {
      warnings.push(`Duplicate schemas found at indices: ${dup.join(', ')}`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Removes duplicate schemas from an array
 * Keeps the first occurrence of each unique schema
 * SPECIAL HANDLING: Only ONE FAQPage schema per page (Google requirement)
 */
export const removeDuplicateSchemas = (schemas: any[]): any[] => {
  const seen = new Set<string>();
  const unique: any[] = [];
  let faqPageFound = false; // Track if we've already added a FAQPage schema

  schemas.forEach(schema => {
    if (!schema || !schema['@type']) {
      unique.push(schema);
      return;
    }

    // SPECIAL CASE: Only allow ONE FAQPage schema per page
    if (schema['@type'] === 'FAQPage') {
      if (faqPageFound) {
        // Skip duplicate FAQPage schemas
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Duplicate FAQPage schema detected and removed. Only one FAQPage schema is allowed per page.');
        }
        return;
      }
      faqPageFound = true;
    }

    const key = `${schema['@type']}-${schema.name || schema.url || JSON.stringify(schema)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(schema);
    }
  });

  return unique;
};

