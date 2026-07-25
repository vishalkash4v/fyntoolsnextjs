import type { FullSeoPageContent } from '@/data/seo-pages/types';
import InteractiveToolLoader from '@/components/tools/InteractiveToolLoader';
import ToolSeoSections from '@/components/tools/ToolSeoSections';

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
};

/**
 * Server Component shell: SEO is RSC; only InteractiveToolLoader is a client island.
 * Visible H1 lives in ToolSeoSections (single H1). Tool island sits between header and body copy.
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
}: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <article className="w-full py-4 sm:py-6 md:py-8">
        <ToolSeoSections
          title={title}
          description={description}
          category={category}
          howToUse={howToUse}
          features={features}
          faqs={faqs}
          fullSeo={fullSeo}
          toolSlot={
            <section id="tool" className="mb-8 sm:mb-10 md:mb-12 w-full px-4 sm:px-6 md:px-8">
              <InteractiveToolLoader slug={slug} />
            </section>
          }
        />
      </article>
    </div>
  );
}
