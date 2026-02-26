import type { Metadata } from "next";
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
  metadataBase: new URL("https://nuance-translate.vercel.app/"),

  title: {
    default: "Nuance AI Translator",
    template: "%s | Nuance AI Translator",
  },

  description:
    "AI-powered translation that captures dialect, tone, and plurality so you never sound robotic.",

  keywords: [
    "AI translator",
    "nuanced translation",
    "dialect translation",
    "formal informal translation",
    "AI language tool",
  ],

  authors: [{ name: "Hakeem Clarke" }],
  creator: "Hakeem Clarke",

  openGraph: {
    title: "Nuance AI Translator",
    description:
      "Translate with nuance. Control tone, dialect, and plurality effortlessly.",
    url: "https://nuance-translate.vercel.app/",
    siteName: "Nuance AI Translator",
    images: [
      {
        url: "https://nuance-translate.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nuance AI Translator",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Nuance AI Translator",
    description:
      "Translate with nuance. Control tone, dialect, and plurality effortlessly.",
    images: ["https://nuance-translate.vercel.app/og-image.png"],
  },

  icons: {
    icon: "https://nuance-translate.vercel.app/favicon.ico",
    shortcut: "https://nuance-translate.vercel.app/favicon-16x16.png",
    apple: "https://nuance-translate.vercel.app/apple-touch-icon.png",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}