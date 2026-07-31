import type { Metadata } from 'next';
import AIBlogGenerationPage from '@/components/admin/pages/AIBlogGenerationPage';

export const metadata: Metadata = {
  title: 'AI Blog Generation',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AIBlogGenerationPage />
  );
}
