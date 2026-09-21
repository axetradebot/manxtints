import type { Metadata } from "next";
import { Inter, Manrope, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { FloatingWidgets } from "@/components/floating-widgets";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { MotionProvider } from "@/components/motion-provider";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { ZoneProvider } from "@/components/zone/zone-provider";
import { getRequestZone } from "@/lib/zone.server";
import { site } from "@/site.config";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const headlineFont = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const defaultTitle = `${site.name} | ${site.tagline} · ${site.areasServed}`;
const defaultDescription = `Window film for homes and businesses across the ${site.areasServed}. Instant online quotes, deposit-protected booking and installation by vetted local ManxTints installers — privacy, heat and UV control, guaranteed.`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: defaultTitle,
    template: `%s | ${site.name}`,
  },
  description: defaultDescription,
  keywords: [
    "window tinting",
    "window film",
    "privacy film",
    "one-way mirror film",
    "solar film",
    "Isle of Man",
    "UK",
    "residential tinting",
    "commercial tinting",
    "UV protection",
    "Manx",
    "Douglas",
  ],
  authors: [{ name: site.legalName }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: site.url,
    title: defaultTitle,
    description: defaultDescription,
    siteName: site.name,
    images: [{ url: site.hero.image, alt: site.hero.alt }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolved by proxy.ts (URL param → cookie → IP default → standard) so the
  // first paint already shows the right area's prices.
  const requestZone = await getRequestZone();

  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${headlineFont.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {META_PIXEL_ID && (
          <>
            {/* Loaded after window.onload so the 250KB pixel bundle doesn't block first interaction; PageView still fires and trackLead awaits fbq.
                autoConfig=false switches off Meta's "automatic configuration": Event Setup Tool button-click rules and
                automatic events defined in Events Manager are ignored, so the only events this site sends are the ones
                in src/lib/metaPixel.ts. (A codeless rule on the calculator's step-1 Continue button was firing Lead.) */}
            <Script id="meta-pixel" strategy="lazyOnload">
              {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('set', 'autoConfig', false, '${META_PIXEL_ID}');
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
        <OrganizationJsonLd />
        <AnalyticsTracker />
        <ZoneProvider initialZone={requestZone.zone} initialSource={requestZone.source}>
          <MotionProvider>
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingWidgets />
          </MotionProvider>
        </ZoneProvider>
      </body>
    </html>
  );
}
