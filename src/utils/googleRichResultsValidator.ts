/**
 * Google Rich Results Test Validator
 * Validates FAQPage schema against Google's requirements
 * Reference: https://developers.google.com/search/docs/appearance/structured-data/faqpage
 */

export interface GoogleRichResultsValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  schema: any | null;
}

/**
 * Validates FAQPage schema for Google Rich Results Test compliance
 */
export const validateFAQPageForGoogleRichResults = (
  schema: any
): GoogleRichResultsValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!schema) {
    return {
      isValid: false,
      errors: ['Schema is null or undefined'],
      warnings: [],
      schema: null
    };
  }

  // Required: @context must be "https://schema.org"
  if (schema['@context'] !== 'https://schema.org') {
    errors.push('@context must be "https://schema.org"');
  }

  // Required: @type must be "FAQPage"
  if (schema['@type'] !== 'FAQPage') {
    errors.push('@type must be "FAQPage"');
  }

  // Required: mainEntity must exist and be an array
  if (!schema.mainEntity) {
    errors.push('mainEntity is required (Google Rich Results requirement)');
    return { isValid: false, errors, warnings, schema };
  }

  if (!Array.isArray(schema.mainEntity)) {
    errors.push('mainEntity must be an array');
    return { isValid: false, errors, warnings, schema };
  }

  // Required: mainEntity must have at least one Question
  if (schema.mainEntity.length === 0) {
    errors.push('mainEntity must contain at least one Question (Google Rich Results requirement)');
    return { isValid: false, errors, warnings, schema };
  }

  // Recommended: mainEntity should have at least 2 Questions for better visibility
  if (schema.mainEntity.length === 1) {
    warnings.push('Consider adding more FAQs (2+ recommended for better visibility)');
  }

  // Validate each Question in mainEntity
  schema.mainEntity.forEach((question: any, index: number) => {
    // Required: Each item must be a Question
    if (!question['@type'] || question['@type'] !== 'Question') {
      errors.push(`mainEntity[${index}] must have @type: "Question"`);
    }

    // Required: Each Question must have a name (the question text)
    if (!question.name) {
      errors.push(`mainEntity[${index}] missing required "name" property (Google Rich Results requirement)`);
    } else if (typeof question.name !== 'string') {
      errors.push(`mainEntity[${index}].name must be a string`);
    } else if (question.name.trim().length === 0) {
      errors.push(`mainEntity[${index}].name cannot be empty (Google Rich Results requirement)`);
    }

    // Required: Each Question must have acceptedAnswer
    if (!question.acceptedAnswer) {
      errors.push(`mainEntity[${index}] missing required "acceptedAnswer" (Google Rich Results requirement)`);
      return;
    }

    // Required: acceptedAnswer must be an Answer
    if (!question.acceptedAnswer['@type'] || question.acceptedAnswer['@type'] !== 'Answer') {
      errors.push(`mainEntity[${index}].acceptedAnswer must have @type: "Answer"`);
    }

    // Required: acceptedAnswer must have text
    if (!question.acceptedAnswer.text) {
      errors.push(`mainEntity[${index}].acceptedAnswer missing required "text" property (Google Rich Results requirement)`);
    } else if (typeof question.acceptedAnswer.text !== 'string') {
      errors.push(`mainEntity[${index}].acceptedAnswer.text must be a string`);
    } else if (question.acceptedAnswer.text.trim().length === 0) {
      errors.push(`mainEntity[${index}].acceptedAnswer.text cannot be empty (Google Rich Results requirement)`);
    }

    // Recommended: Answer text should be at least 20 characters
    if (question.acceptedAnswer.text && question.acceptedAnswer.text.trim().length < 20) {
      warnings.push(`mainEntity[${index}].acceptedAnswer.text is very short (recommended: 20+ characters)`);
    }
  });

  // Check for duplicate questions
  const questionTexts = schema.mainEntity
    .map((q: any) => q.name?.toLowerCase().trim())
    .filter((text: string) => text);
  
  const duplicates = questionTexts.filter((text: string, index: number) => 
    questionTexts.indexOf(text) !== index
  );
  
  if (duplicates.length > 0) {
    warnings.push(`Duplicate questions detected: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    schema
  };
};

/**
 * Validates that FAQPage schema matches visible content exactly
 * and passes Google Rich Results Test
 */
export const validateFAQPageComplete = (
  schema: any,
  visibleFaqs: Array<{ question: string; answer: string }>
): GoogleRichResultsValidation & { contentMatch: boolean; contentErrors: string[] } => {
  // First validate Google Rich Results compliance
  const googleValidation = validateFAQPageForGoogleRichResults(schema);
  
  const contentErrors: string[] = [];
  let contentMatch = true;

  if (googleValidation.isValid && schema && schema.mainEntity) {
    // Filter visible FAQs same way schema generation does
    const validVisibleFaqs = visibleFaqs.filter(faq => 
      faq.question && faq.answer && 
      typeof faq.question === 'string' &&
      typeof faq.answer === 'string' &&
      faq.question.trim().length > 0 && 
      faq.answer.trim().length > 0
    );

    // Remove duplicates from visible FAQs (same logic as schema)
    const seenQuestions = new Set<string>();
    const uniqueVisibleFaqs: Array<{ question: string; answer: string }> = [];
    for (const faq of validVisibleFaqs) {
      const normalizedQuestion = faq.question.trim().toLowerCase();
      if (!seenQuestions.has(normalizedQuestion)) {
        seenQuestions.add(normalizedQuestion);
        uniqueVisibleFaqs.push(faq);
      }
    }

    // Check count match
    if (schema.mainEntity.length !== uniqueVisibleFaqs.length) {
      contentMatch = false;
      contentErrors.push(
        `FAQ count mismatch: Schema has ${schema.mainEntity.length} FAQs, ` +
        `but visible content has ${uniqueVisibleFaqs.length} FAQs`
      );
    }

    // Check each FAQ matches exactly
    schema.mainEntity.forEach((schemaFaq: any, index: number) => {
      if (index >= uniqueVisibleFaqs.length) {
        contentMatch = false;
        contentErrors.push(`Schema FAQ at index ${index} has no matching visible FAQ`);
        return;
      }

      const visibleFaq = uniqueVisibleFaqs[index];
      const schemaQuestion = schemaFaq.name?.trim() || '';
      const visibleQuestion = visibleFaq.question.trim();
      const schemaAnswer = schemaFaq.acceptedAnswer?.text?.trim() || '';
      const visibleAnswer = visibleFaq.answer.trim();

      if (schemaQuestion !== visibleQuestion) {
        contentMatch = false;
        contentErrors.push(
          `FAQ ${index + 1} question mismatch:\n` +
          `  Schema: "${schemaQuestion}"\n` +
          `  Visible: "${visibleQuestion}"`
        );
      }

      if (schemaAnswer !== visibleAnswer) {
        contentMatch = false;
        contentErrors.push(
          `FAQ ${index + 1} answer mismatch:\n` +
          `  Schema: "${schemaAnswer.substring(0, 50)}..."\n` +
          `  Visible: "${visibleAnswer.substring(0, 50)}..."`
        );
      }
    });
  }

  return {
    ...googleValidation,
    contentMatch,
    contentErrors
  };
};

