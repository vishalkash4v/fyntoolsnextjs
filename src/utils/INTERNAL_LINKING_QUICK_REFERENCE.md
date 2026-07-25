# Internal Linking Quick Reference

## For Tool Pages

### Automatic (No Code Changes Needed)

```tsx
<EnhancedToolPageLayout
  title="Word Counter"
  description="..."
  category="Text Tools"  // ✅ Used to find related tools
  keywords="word counter"  // ✅ Used for keyword matching
  // ✅ Related tools auto-generated
  // ✅ "People also use" auto-generated
/>
```

### Disable Auto-Generation

```tsx
<EnhancedToolPageLayout
  title="Word Counter"
  relatedTools={customTools}  // Your custom tools
  autoGenerateRelatedTools={false}
/>
```

### Hide "People Also Use"

```tsx
<EnhancedToolPageLayout
  title="Word Counter"
  showPeopleAlsoUse={false}
/>
```

## Link Structure

All links are:
- ✅ SEO-friendly (descriptive anchor text)
- ✅ Crawlable (React Router Link)
- ✅ Accessible (ARIA labels)
- ✅ Semantic HTML (`<article>`, `<h3>`)

## Sections

1. **Related Tools** - Same category tools
2. **People Also Use** - Popular tools from other categories

Both sections appear automatically on all tool pages!

