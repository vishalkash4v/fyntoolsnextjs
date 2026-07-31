import type { FullSeoPageContent } from '@/data/seo-pages/types';
import ToolSeoSections from '@/components/tools/ToolSeoSections';
import AdSenseUnit from '@/components/Ads/AdSenseUnit';

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
  toolClient,
}: Props) {
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
          toolPath={`/${slug}`}
          toolSlot={
            <section
              id="tool"
              className="mb-8 sm:mb-10 md:mb-12 w-full px-4 sm:px-6 md:px-8 min-h-[560px]"
            >
              {toolClient}
            </section>
          }
        />
        <div
          className="px-4 sm:px-6 md:px-8 mb-10"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '0 280px' }}
        >
          <AdSenseUnit className="max-w-3xl mx-auto" minHeight={280} />
        </div>
      </article>
    </div>
  );
}
