# SEO Component Documentation

## SEOHead Component

A reusable SEO component using `react-helmet-async` that dynamically sets meta tags based on route data.

### Features

- ✅ Automatic canonical URL generation from current route
- ✅ Dynamic title, description, and Open Graph tags
- ✅ Twitter Card support
- ✅ Structured data (JSON-LD) support
- ✅ Keywords support (string or array)
- ✅ Customizable OG images
- ✅ Works with all tool pages

### Basic Usage

```tsx
import SEOHead from '@/components/seo/SEOHead';

function MyToolPage() {
  return (
    <>
      <SEOHead
        title="Word Counter"
        description="Free online word counter tool to count words, characters, sentences, and paragraphs."
        keywords={['word counter', 'character counter', 'text analysis']}
        canonicalUrl="https://fyntools.com/word-counter"
      />
      {/* Your page content */}
    </>
  );
}
```

### Advanced Usage

```tsx
<SEOHead
  title="Word Counter"
  description="Free online word counter tool..."
  canonicalUrl="https://fyntools.com/word-counter"
  ogTitle="Word Counter - Count Words Instantly"
  ogDescription="Count words, characters, and more with our free tool"
  ogImage="https://fyntools.com/assets/tool-screenshots/word-counter.jpg"
  ogImageWidth={1200}
  ogImageHeight={630}
  keywords={['word counter', 'character counter']}
  twitterCard="summary_large_image"
  twitterSite="@fyntoolsworldwide"
  structuredData={mySchemaObject}
  additionalMetaTags={[
    { name: 'custom-tag', content: 'value' }
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | Page title |
| `description` | `string` | **required** | Meta description |
| `canonicalUrl` | `string` | Auto-generated | Canonical URL (auto from route if not provided) |
| `ogTitle` | `string` | `title` | Open Graph title |
| `ogDescription` | `string` | `description` | Open Graph description |
| `ogUrl` | `string` | `canonicalUrl` | Open Graph URL |
| `ogImage` | `string` | Default image | Open Graph image URL |
| `ogImageWidth` | `number` | `1200` | OG image width |
| `ogImageHeight` | `number` | `630` | OG image height |
| `ogImageAlt` | `string` | Auto-generated | OG image alt text |
| `keywords` | `string \| string[]` | - | Keywords |
| `twitterCard` | `'summary' \| 'summary_large_image'` | `'summary_large_image'` | Twitter card type |
| `twitterSite` | `string` | `'@fyntoolsworldwide'` | Twitter site handle |
| `twitterCreator` | `string` | - | Twitter creator handle |
| `robots` | `string` | `'index, follow...'` | Robots meta tag |
| `additionalMetaTags` | `Array` | `[]` | Additional meta tags |
| `structuredData` | `object \| object[]` | - | JSON-LD structured data |
| `siteName` | `string` | `'FYN Tools Worldwide'` | Site name |
| `siteUrl` | `string` | `'https://fyntools.com'` | Site URL |
| `titleTemplate` | `string` | Auto-generated | Custom title template |
| `isToolPage` | `boolean` | `true` | Whether this is a tool page |

### Integration with Tool Pages

The component is already integrated into `ToolPageLayout`. For individual tool pages:

```tsx
// src/pages/tools/WordCounterPage.tsx
import SEOHead from '@/components/seo/SEOHead';

const WordCounterPage = () => {
  return (
    <>
      <SEOHead
        title="Word Counter"
        description="Free online word counter tool..."
        keywords="word counter, character counter"
        canonicalUrl="https://fyntools.com/word-counter"
      />
      {/* Tool content */}
    </>
  );
};
```

### Route-Based Usage

The component automatically generates canonical URLs from the current route:

```tsx
// If you're on /word-counter, canonicalUrl will be:
// https://fyntools.com/word-counter (if not provided)
<SEOHead
  title="Word Counter"
  description="..."
  // canonicalUrl is optional - auto-generated from route
/>
```

### Examples

#### Simple Tool Page
```tsx
<SEOHead
  title="QR Code Generator"
  description="Generate QR codes instantly for free"
  keywords={['qr code', 'qr generator', 'free qr']}
/>
```

#### With Custom OG Image
```tsx
<SEOHead
  title="Image Resizer"
  description="Resize images online for free"
  ogImage="https://fyntools.com/assets/tool-screenshots/image-resizer.jpg"
  ogImageAlt="Image Resizer Tool"
/>
```

#### With Structured Data
```tsx
const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Word Counter",
  // ... more schema
};

<SEOHead
  title="Word Counter"
  description="..."
  structuredData={schema}
/>
```

### Notes

- The component uses `useLocation()` from `react-router-dom` to get the current route
- Canonical URLs are automatically generated if not provided
- OG images default to a standard path but can be customized per tool
- All meta tags follow SEO best practices
- Works seamlessly with `react-helmet-async`

