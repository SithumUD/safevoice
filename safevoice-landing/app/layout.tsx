import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://safevoice.lk"),
  title: "SafeVoice — Sri Lanka's Open Community Forum | Speak Freely, Stay Safe",
  description:
    "SafeVoice is Sri Lanka's free community forum for anonymous discussions, trending topics, community polls, and open conversations in Sinhala and English. Download now for iOS and Android.",
  keywords: [
    "SafeVoice",
    "Sri Lanka forum",
    "anonymous forum Sri Lanka",
    "community app Sri Lanka",
    "Sinhala forum",
    "trending topics Lanka",
    "discussion app",
    "safe voice Lanka",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  authors: [{ name: "SafeVoice" }],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://safevoice.lk/",
  },
  openGraph: {
    type: "website",
    url: "https://safevoice.lk/",
    title: "SafeVoice — Sri Lanka's Open Community Forum",
    description:
      "Speak freely, stay safe, be heard. Sri Lanka's community forum for anonymous discussions, polls, and trending topics.",
    images: ["https://safevoice.lk/og-image.png"],
    locale: "en_LK",
    siteName: "SafeVoice",
  },
  twitter: {
    card: "summary_large_image",
    site: "@safevoicelk",
    title: "SafeVoice — Sri Lanka's Open Community Forum",
    description: "Speak freely, stay safe, be heard. Download now for iOS & Android.",
    images: ["https://safevoice.lk/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "SafeVoice",
  description:
    "Sri Lanka's community forum for anonymous discussions, trending topics, and polls.",
  operatingSystem: "iOS, Android",
  applicationCategory: "SocialNetworkingApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "LKR" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "12400" },
  url: "https://safevoice.lk",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}