import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import Script from "next/script";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import Header from "@/components/Header";
import SeoSchema from "@/components/SeoSchema";
import "./globals.css";
import { getProducts, getSiteData } from "@/lib/cms";
import { Product as StaticProduct } from "@/data/products";

type NavLink = { href: string; label: string };
type SiteHighlight = { label: string; value: string };
type Office = { label: string; lines: string[] };
type SiteData = {
  name: string;
  shortName: string;
  tagline: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  email: string;
  phoneWork: string;
  phoneRegd?: string;
  phoneFax?: string;
  mobile: string;
  whatsapp?: string;
  workOffice: Office;
  regdOffice: Office;
  highlights: SiteHighlight[];
};

type SeoData = {
  title: string;
  description: string;
  keywords: string;
  ogImageUrl: string;
  googleVerification: string;
  bingVerification: string;
  googleAnalyticsId: string;
  canonicalUrl: string;
  robotsDirective: string;
};

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dspballs.co.in").replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const { seo, site } = (await getSiteData()) as {
    seo: SeoData;
    site: SiteData;
  };

  const title =
    seo.title ||
    "DSP Precision Products Pvt. Ltd. | Precision Balls Manufacturer & Exporter India";
  const description =
    seo.description ||
    "DSP Precision Products Pvt. Ltd. — Leading manufacturer & exporter of AFBMA, DIN & ISO precision steel, stainless steel, carbide, ceramic, brass, copper and gauge balls from Baddi, Himachal Pradesh, India.";

  const faviconUrl = site.faviconUrl || "/favicon.ico";

  const icons = {
    icon: [
      { url: faviconUrl },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: [faviconUrl],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  };

  const ogImage =
    seo.ogImageUrl ||
    site.logoUrl ||
    `${siteUrl}/images/certifications/gsci-cert.jpg`;

  const defaultKeywords = [
    "precision balls manufacturer",
    "steel balls Baddi",
    "stainless steel balls manufacturer India",
    "tungsten carbide balls",
    "ceramic balls manufacturer",
    "brass balls",
    "copper balls",
    "gauge balls",
    "AFBMA balls",
    "DIN ISO precision balls",
    "DSP Precision Products",
    "Baddi Industrial Area manufacturer",
  ];

  const keywords = seo.keywords
    ? seo.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : defaultKeywords;

  return {
    metadataBase: new URL(siteUrl),
    manifest: "/site.webmanifest",
    alternates: {
      canonical: seo.canonicalUrl || "./",
    },
    title: {
      default: title,
      template: `%s | ${site.shortName || "DSP"} Precision Products Pvt. Ltd.`,
    },
    description,
    keywords,
    verification: {
      google: seo.googleVerification || undefined,
      other: seo.bingVerification
        ? { "msvalidate.01": seo.bingVerification }
        : undefined,
    },
    authors: [{ name: "DSP Precision Products Pvt. Ltd.", url: siteUrl }],
    creator: "DSP Precision Products Pvt. Ltd.",
    publisher: "DSP Precision Products Pvt. Ltd.",
    formatDetection: {
      email: true,
      address: true,
      telephone: true,
    },
    icons,
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: siteUrl,
      title,
      description,
      siteName: site.name || "DSP Precision Products Pvt. Ltd.",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "DSP Precision Products - Precision Balls Manufacturer",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: !seo.robotsDirective?.includes("noindex"),
      follow: !seo.robotsDirective?.includes("nofollow"),
      googleBot: {
        index: !seo.robotsDirective?.includes("noindex"),
        follow: !seo.robotsDirective?.includes("nofollow"),
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ site, navLinks, seo }, products] = (await Promise.all([
    getSiteData(),
    getProducts(),
  ])) as [
    { site: SiteData; navLinks: NavLink[]; heroSlides: unknown[]; seo: SeoData },
    StaticProduct[],
  ];

  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} h-full`}>
      <head>
        {seo.googleAnalyticsId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${seo.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <SeoSchema site={site} />
        <Header navLinks={navLinks} site={site} />
        <main className="flex-1">{children}</main>
        <FloatingCTA
          mobile={site.mobile || ""}
          whatsapp={site.whatsapp || site.mobile || ""}
          email={site.email || ""}
        />
        <Footer products={products} site={site} />
      </body>
    </html>
  );
}
