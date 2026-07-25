/**
 * Schema Utilities Tests
 * 
 * These tests ensure that:
 * 1. SoftwareApplication schema has all required fields
 * 2. FAQPage schema is generated correctly
 * 3. No duplicate schemas are created
 * 4. All schemas are valid JSON-LD
 */

import { 
  generateSoftwareApplicationSchema, 
  generateFAQPageSchema, 
  generateToolSchemas,
  type SchemaConfig 
} from '../schemaUtils';
import { validateSchemas, removeDuplicateSchemas } from '../schemaValidator';

describe('Schema Generation', () => {
  const baseConfig: SchemaConfig = {
    toolName: 'Word Counter',
    toolUrl: 'https://fyntools.com/word-counter',
    description: 'Count words, characters, and paragraphs in your text.',
    category: 'Text Tools',
    keywords: ['word counter', 'character counter'],
    features: ['Real-time counting', 'Character analysis'],
    faqs: [
      {
        question: 'How accurate is the word count?',
        answer: 'Our word counter uses standard algorithms to accurately count words.'
      },
      {
        question: 'Does this tool store my text?',
        answer: 'No, your text is processed locally in your browser.'
      }
    ]
  };

  describe('generateSoftwareApplicationSchema', () => {
    it('should generate schema with all required fields', () => {
      const schema = generateSoftwareApplicationSchema(baseConfig);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('SoftwareApplication');
      expect(schema.name).toBe('Word Counter');
      expect(schema.description).toBeDefined();
      expect(schema.url).toBe('https://fyntools.com/word-counter');
      expect(schema.operatingSystem).toBe('Web Browser');
      expect(schema.offers).toBeDefined();
      expect(schema.offers['@type']).toBe('Offer');
      expect(schema.offers.price).toBe('0');
      expect(schema.offers.priceCurrency).toBe('USD');
    });

    it('should include optional fields when provided', () => {
      const schema = generateSoftwareApplicationSchema(baseConfig);

      expect(schema.featureList).toEqual(['Real-time counting', 'Character analysis']);
      expect(schema.keywords).toBe('word counter, character counter');
      expect(schema.provider).toBeDefined();
      expect(schema.aggregateRating).toBeDefined();
    });
  });

  describe('generateFAQPageSchema', () => {
    it('should generate FAQPage schema from FAQs', () => {
      const schema = generateFAQPageSchema(baseConfig.faqs!);

      expect(schema).not.toBeNull();
      expect(schema!['@context']).toBe('https://schema.org');
      expect(schema!['@type']).toBe('FAQPage');
      expect(schema!.mainEntity).toHaveLength(2);
      expect(schema!.mainEntity[0]['@type']).toBe('Question');
      expect(schema!.mainEntity[0].name).toBe('How accurate is the word count?');
      expect(schema!.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
      expect(schema!.mainEntity[0].acceptedAnswer.text).toBeDefined();
    });

    it('should return null for empty FAQs', () => {
      const schema = generateFAQPageSchema([]);
      expect(schema).toBeNull();
    });

    it('should filter out invalid FAQs', () => {
      const invalidFaqs = [
        { question: '', answer: 'Answer' },
        { question: 'Question', answer: '' },
        { question: 'Valid Question', answer: 'Valid Answer' }
      ];
      const schema = generateFAQPageSchema(invalidFaqs);
      expect(schema).not.toBeNull();
      expect(schema!.mainEntity).toHaveLength(1);
    });
  });

  describe('generateToolSchemas', () => {
    it('should generate all schemas without duplicates', () => {
      const schemas = generateToolSchemas(baseConfig);

      // Should have SoftwareApplication and FAQPage
      expect(schemas.length).toBeGreaterThanOrEqual(2);
      
      const types = schemas.map(s => s['@type']);
      expect(types).toContain('SoftwareApplication');
      expect(types).toContain('FAQPage');
      
      // Should not have duplicates
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBe(types.length);
    });

    it('should validate all generated schemas', () => {
      const schemas = generateToolSchemas(baseConfig);
      const validation = validateSchemas(schemas);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should not include WebApplication when SoftwareApplication exists', () => {
      const schemas = generateToolSchemas(baseConfig);
      const types = schemas.map(s => s['@type']);
      
      // Should not have both SoftwareApplication and WebApplication
      expect(types.filter(t => t === 'SoftwareApplication').length).toBe(1);
      expect(types).not.toContain('WebApplication');
    });
  });
});

