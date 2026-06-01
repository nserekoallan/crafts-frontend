import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { CartToast } from '@/components/ui/cart-toast';
import { BackToTop } from '@/components/ui/back-to-top';
import { MotionProvider } from '@/components/motion/motion-provider';
import { FlyToCartProvider } from '@/components/motion/fly-to-cart';

/**
 * Store layout — wraps all consumer-facing pages with the storefront chrome:
 * header, footer, mobile bottom nav, cart drawer, cart toast, and back-to-top.
 */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <FlyToCartProvider>
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
        <CartDrawer />
        <CartToast />
        <BackToTop />
      </FlyToCartProvider>
    </MotionProvider>
  );
}
