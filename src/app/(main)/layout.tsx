import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ResponsiveLayout } from '@/components/layout/responsive-layout';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main id="hauptinhalt" className="flex-1 pb-16 md:pb-0">
        <ResponsiveLayout>{children}</ResponsiveLayout>
      </main>
      <BottomNav />
    </div>
  );
}
