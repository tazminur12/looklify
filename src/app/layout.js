import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Looklify - Beauty & Skincare",
  description: "Your premium destination for beauty and skincare products",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 transition-colors duration-300`}
      >
        <div className="min-h-screen flex flex-col bg-white transition-colors duration-300">
          <Header />
          <main className="flex-grow bg-white transition-colors duration-300">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
