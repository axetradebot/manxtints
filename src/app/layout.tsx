import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ManxTints LTD | Premium Window Tinting Isle of Man",
    template: "%s | ManxTints LTD",
  },
  description:
    "Professional window tinting services across the Isle of Man. Automotive, residential, and commercial tinting with premium films. UV protection, privacy, and style.",
  keywords: [
    "window tinting",
    "Isle of Man",
    "car tinting",
    "automotive tinting",
    "residential tinting",
    "commercial tinting",
    "UV protection",
    "privacy film",
    "Manx",
    "Douglas",
  ],
  authors: [{ name: "ManxTints LTD" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://manxtints.im",
    title: "ManxTints LTD | Premium Window Tinting Isle of Man",
    description:
      "Professional window tinting services across the Isle of Man.",
    siteName: "ManxTints LTD",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
