
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <CurrencyProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background max-w-[100vw] overflow-x-hidden">
          {/* Reserve space for sidebar to prevent layout shift */}
          {!isMobile && (
            <div className="w-60 shrink-0">
              <AppSidebar />
            </div>
          )}
          <div className="flex-1 flex flex-col min-w-0 w-full min-h-screen">
            {/* Reserve space for header to prevent layout shift */}
            <div className="h-16 shrink-0">
              <Header />
            </div>
            <main className="flex-1 w-full min-h-[calc(100vh-200px)]">
              {children}
            </main>
            <div className="shrink-0">
              <Footer />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </CurrencyProvider>
  );
};

export default MainLayout;
