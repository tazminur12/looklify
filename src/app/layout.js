import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "./providers/SessionProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import LayoutWrapper from "./components/LayoutWrapper";
import ChatWidget from "./components/ChatWidget";
import { Toaster } from "react-hot-toast";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

export const metadata = {
  title: "Looklify - Beauty & Skincare",
  description: "Your premium destination for beauty and skincare products",
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
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </head>
      <body
        className={`${robotoSlab.variable} antialiased bg-white text-gray-900 transition-colors duration-300`}
      >
        <AuthSessionProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <div className="min-h-screen flex flex-col bg-white transition-colors duration-300">
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
