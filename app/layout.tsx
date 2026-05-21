import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🟢 UPGRADED: Dynamic SEO Metadata Template & OpenGraph for WhatsApp/Social Sharing
export const metadata: Metadata = {
  title: {
    default: "Airgo.ng | Secure Luxury Escrow Bookings",
    template: "%s | Airgo.ng", // Child pages automatically insert their title here
  },
  description: "Book verified luxury hotels and executive suites across Nigeria with Airgo Escrow Protection. Your payment is held safely until your stay is confirmed.",
  keywords: ["Luxury Car Rental Nigeria", "Escrow Bookings", "Hotel Reservations Abuja", "VIP Transport", "Airgo Escrow"],
  openGraph: {
    title: "Airgo.ng | Premium Escrow Bookings",
    description: "Secure hotel and luxury car bookings in Nigeria with Airgo Escrow Protection.",
    url: "https://airgo.ng",
    siteName: "Airgo",
    locale: "en_NG",
    type: "website",
  },
};

// 🟢 FIXED: Removed userScalable for WCAG Accessibility & SEO Compliance
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>
          <Navigation />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}