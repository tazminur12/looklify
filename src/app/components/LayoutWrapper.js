'use client';

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  // If it's a dashboard route, don't render Header and Footer
  if (isDashboard) {
    return <>{children}</>;
  }

  // For all other routes, render with Header and Footer
  return (
    <>
      <Header />
      <main className="flex-grow bg-white transition-colors duration-300 pb-24 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
