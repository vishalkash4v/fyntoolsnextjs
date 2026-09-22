import type { FullSeoPageContent } from '@/data/seo-pages/types';
import type { ToolReviewStats } from '@/lib/tools/toolReviewStats';
import ToolSeoSections from '@/components/tools/ToolSeoSections';
import ToolCrawlerFallback from '@/components/tools/ToolCrawlerFallback';
import ToolFactCard, { factCardPropsFromSeo } from '@/components/tools/ToolFactCard';
import ToolSeoDepthBlock from '@/components/seo/ToolSeoDepthBlock';
import DeferredAdSense from '@/components/Ads/DeferredAdSense';
import NamezivoAdBanner from '@/components/Ads/NamezivoAdBanner';
import { TOOL_FACT_CARDS } from '@/data/tool-content/toolFactCards';

type Faq = { question: string; answer: string };

type Props = {
  slug: string;
  title: string;
  description: string;
  category: string;
  howToUse: string[];
  features: string[];
  faqs: Faq[];
  fullSeo?: FullSeoPageContent | null;
  reviewStats?: ToolReviewStats | null;
  /** Required dedicated client island — keeps InteractiveToolLoader out of this module. */
  toolClient: React.ReactNode;
};

/**
 * Server Component shell: SEO is RSC; only the passed tool island is client JS.
 */
export default function ToolPageShell({
  slug,
  title,
  description,
  category,
  howToUse,
  features,
  faqs,
  fullSeo,
  reviewStats,
  toolClient,
}: Props) {
  const path = `/${slug}`;
  const card = TOOL_FACT_CARDS[path];
  const factProps = card ? factCardPropsFromSeo(title, card, fullSeo) : null;
  const displayName = fullSeo?.h1 || title;

  return (
    <div className="min-h-screen bg-background">
      <article className="w-full py-4 sm:py-6 md:py-8">
        <ToolSeoSections
          title={title}
          description={description}
          category={category}
          howToUse={howToUse}
          features={features}
          faqs={faqs}
          fullSeo={fullSeo}
          reviewStats={reviewStats}
          toolPath={path}
          toolSlot={
            <section
              id="tool"
              className="mb-8 sm:mb-10 md:mb-12 w-full px-4 sm:px-6 md:px-8 min-h-[560px]"
            >
              <div className="mx-auto w-full max-w-6xl space-y-4">
                {toolClient}
                {factProps ? <ToolFactCard {...factProps} /> : null}
                {/* Visible overview (not sr-only) so Semrush text/HTML ratio counts this copy. */}
                <ToolCrawlerFallback slug={slug} />
              </div>
            </section>
          }
        />
        <ToolSeoDepthBlock
          toolName={displayName.replace(/\s*[—|-].*$/, '').trim() || title}
          category={category}
          toolPath={path}
          description={fullSeo?.metaDescription || description}
          howToUse={fullSeo?.howToUse?.length ? fullSeo.howToUse : howToUse}
          useCases={fullSeo?.useCases}
          overview={fullSeo?.overview}
        />
        <div className="px-4 sm:px-6 md:px-8 mb-6 max-w-4xl mx-auto">
          <NamezivoAdBanner
            sourcePath={path}
            placement="tool_below"
            variant="full"
          />
        </div>
        <div className="px-4 sm:px-6 md:px-8 mb-10 cv-auto-ads">
          <DeferredAdSense className="max-w-3xl mx-auto" minHeight={280} />
        </div>
      </article>
    </div>
  );
}
