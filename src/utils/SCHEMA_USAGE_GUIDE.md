# Schema Usage Guide

## Quick Reference

### For Tool Pages Using EnhancedToolPageLayout

**Automatic - No changes needed!**

```tsx
<EnhancedToolPageLayout
  title="Word Counter"
  description="Count words, characters..."
  faqs={[
    { question: "How accurate?", answer: "Very accurate..." }
  ]}
  // ✅ SoftwareApplication schema: Auto-generated
  // ✅ FAQPage schema: Auto-generated from FAQs
  // ✅ All schemas validated and deduplicated
/>
```

### Schema Generation

The following schemas are automatically generated:

1. **SoftwareApplication** - Always generated
   - ✅ name, description, url, operatingSystem, offers (required)
   - ✅ features, keywords, provider, aggregateRating (optional)

2. **FAQPage** - Generated if FAQs provided
   - ✅ Generated from `faqs` prop
   - ✅ Validates question/answer pairs
   - ✅ Filters out empty FAQs

3. **BreadcrumbList** - Generated if breadcrumbs provided
4. **HowTo** - Generated if `howToUse` steps provided
5. **ItemList** - Generated if `relatedTools` provided

### Validation

- ✅ Required fields checked
- ✅ Duplicates removed automatically
- ✅ Invalid data filtered out
- ✅ Development warnings logged

### Testing

View page source and look for:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  ...
}
</script>
```

Test with: https://search.google.com/test/rich-results

