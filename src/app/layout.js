import "./globals.css";
import AuthSessionProvider from "./providers/SessionProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import LayoutWrapper from "./components/LayoutWrapper";
import ChatWidget from "./components/ChatWidget";
import { Toaster } from "react-hot-toast";

export const metadata = {
  metadataBase: new URL("https://looklify.com"),
  title: {
    default: "Looklify - Beauty & Skincare",
    template: "%s | Looklify",
  },
  description: "Shop premium beauty and skincare products online in Bangladesh. Authentic brands, fast shipping, secure payment.",
  keywords: [
    "beauty",
    "skincare",
    "cosmetics",
    "makeup",
    "original products",
    "Bangladesh",
    "shop online",
  ],
  openGraph: {
    title: "Looklify - Beauty & Skincare",
    description: "Shop premium beauty and skincare products online in Bangladesh.",
    url: "https://looklify.com",
    siteName: "Looklify",
    images: [
      {
        url: "/slider/1.webp",
        width: 1200,
        height: 630,
        alt: "Looklify - Beauty & Skincare",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Looklify - Beauty & Skincare",
    description: "Shop premium beauty and skincare products online in Bangladesh.",
    images: ["/slider/1.webp"],
    creator: "@looklify",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      maxVideoPreview: 120,
      maxImagePreview: "large",
      maxSnippet: -1,
    },
  },
  alternates: {
    canonical: "https://looklify.com",
  },
  themeColor: "#ffffff",
  viewport: {
    width: "device-width",
    initialScale: 1.0,
    maximumScale: 5.0,
  },
  icons: {
    icon: '/favicon/face-mask.png',
    apple: '/favicon/face-mask.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon/Looklify favicon.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/favicon/face-mask.png" />
        <link rel="canonical" href="https://looklify.com" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Looklify",
              "url": "https://looklify.com",
              "logo": "https://looklify.com/favicon/face-mask.png",
              "sameAs": [
                "https://www.facebook.com/",
                "https://www.instagram.com/"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Looklify",
              "url": "https://looklify.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://looklify.com/shop?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body
        className="antialiased bg-white text-gray-900 transition-colors duration-300"
      >
        <AuthSessionProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <div className="min-h-screen flex flex-col bg-white transition-colors duration-300 w-full overflow-x-hidden">
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                        iconTheme: {
                          primary: '#10B981',
                          secondary: '#fff',
                        },
                      },
                      error: {
                        duration: 4000,
                        iconTheme: {
                          primary: '#EF4444',
                          secondary: '#fff',
                        },
                      },
                    }}
                  />
                  <ChatWidget />
                </div>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
