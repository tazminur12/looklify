'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

const navItemsConfig = [
  {
    label: 'Home',
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10" />
      </svg>
    ),
  },
  {
    label: 'Wishlist',
    href: '/wishlist',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    badgeKey: 'wishlist',
  },
  {
    label: 'Cart',
    href: '/cart',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h12.9M7 13L5.4 5M9 21a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
    badgeKey: 'cart',
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, isAdmin: userIsAdmin, loading: authLoading } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();

  // Check if user is admin or super admin - use both session and AuthContext
  // Only show dashboard button if session is authenticated (not loading)
  const isAdmin = (status === 'authenticated' && !authLoading) && 
                  (userIsAdmin || (session?.user?.role && ['Super Admin', 'Admin'].includes(session?.user?.role)));

  // Generic handler for protected routes
  const handleProtectedRoute = (route, requiresAdmin = false) => {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Prevent multiple rapid clicks
      const button = e.currentTarget;
      if (button.disabled) return;
      button.disabled = true;
      
      // Re-enable button after navigation attempt
      setTimeout(() => {
        button.disabled = false;
      }, 2000);
      
      // Wait for session if still loading
      if (status === 'loading' || authLoading) {
        setTimeout(() => {
          handleProtectedRoute(route, requiresAdmin)(e);
        }, 300);
        return;
      }

      // Get current authentication state
      const isAuthenticated = status === 'authenticated' || !!session || !!user;
      const userRole = session?.user?.role || user?.role;
      const hasAdminRole = userRole && ['Super Admin', 'Admin'].includes(userRole);

      // If not authenticated, redirect to login
      if (!isAuthenticated || status === 'unauthenticated') {
        const callbackUrl = encodeURIComponent(route);
        window.location.href = `/login?callbackUrl=${callbackUrl}`;
        return;
      }

      // If requires admin but user is not admin
      if (requiresAdmin && !hasAdminRole) {
        router.push('/unauthorized');
        return;
      }

      // Navigate to route - use router.push for better Next.js integration
      // Middleware will verify authentication on server side
      router.push(route);
    };
  };

  // Handle dashboard click (admin only)
  const handleDashboardClick = handleProtectedRoute('/dashboard', true);
  
  // Handle order click (authenticated users)
  const handleOrderClick = handleProtectedRoute('/my-orders', false);
  
  // Handle profile click (authenticated users)
  const handleProfileClick = handleProtectedRoute('/profile', false);

  // Order nav item (authenticated users)
  const orderNavItem = {
    label: 'Order',
    href: '/my-orders',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    onClick: handleOrderClick,
  };

  // Dashboard nav item (only for admins)
  const dashboardNavItem = isAdmin ? {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    onClick: handleDashboardClick,
  } : null;

  const userNavItem = {
    label: session ? 'Profile' : 'Login',
    href: session ? '/profile' : '/login',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 10-6 0 3 3 0 006 0z" />
      </svg>
    ),
    onClick: session ? handleProfileClick : undefined,
  };

  // Build nav items array - include dashboard if user is admin
  const navItems = dashboardNavItem 
    ? [...navItemsConfig, orderNavItem, dashboardNavItem, userNavItem]
    : [...navItemsConfig, orderNavItem, userNavItem];

  const getBadgeValue = (key) => {
    if (key === 'cart') {
      return getCartCount();
    }
    if (key === 'wishlist') {
      return getWishlistCount();
    }
    return 0;
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-purple-100 bg-white/95 backdrop-blur-md shadow-[0_-6px_15px_rgba(0,0,0,0.08)] lg:hidden">
      <ul className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const badgeValue = getBadgeValue(item.badgeKey);

          return (
            <li key={item.label} className="flex-1">
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className={`group flex flex-col items-center gap-1 rounded-xl px-1 py-1 text-[11px] font-semibold transition-all w-full ${
                    isActive ? 'text-purple-600' : 'text-gray-600'
                  }`}
                >
                  <span
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border ${
                      isActive
                        ? 'border-purple-200 bg-purple-50 text-purple-600'
                        : 'border-transparent bg-gray-50 text-gray-600'
                    }`}
                  >
                    {item.icon}
                    {badgeValue > 0 && (
                      <span className="absolute -top-1 -right-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white">
                        {badgeValue}
                      </span>
                    )}
                  </span>
                  <span>{item.label}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`group flex flex-col items-center gap-1 rounded-xl px-1 py-1 text-[11px] font-semibold transition-all ${
                    isActive ? 'text-purple-600' : 'text-gray-600'
                  }`}
                >
                  <span
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border ${
                      isActive
                        ? 'border-purple-200 bg-purple-50 text-purple-600'
                        : 'border-transparent bg-gray-50 text-gray-600'
                    }`}
                  >
                    {item.icon}
                    {badgeValue > 0 && (
                      <span className="absolute -top-1 -right-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white">
                        {badgeValue}
                      </span>
                    )}
                  </span>
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

