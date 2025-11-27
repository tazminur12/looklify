'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

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
  {
    label: 'Message',
    href: '/contact',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();

  const userNavItem = {
    label: session ? 'Profile' : 'Login',
    href: session ? '/profile' : '/login',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 10-6 0 3 3 0 006 0z" />
      </svg>
    ),
  };

  const navItems = [...navItemsConfig, userNavItem];

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
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

