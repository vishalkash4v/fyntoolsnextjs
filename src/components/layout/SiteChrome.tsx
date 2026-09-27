import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker';

/**
 * Server-first site shell. Keep the shared header/footer outside client
 * boundaries so public pages remain server-rendered and the interactive
 * pieces hydrate only where needed.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnalyticsTracker />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
