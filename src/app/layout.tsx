import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { FloatingWidgets } from "@/components/floating-widgets";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWidgets />
      </body>
    </html>
  );
}
