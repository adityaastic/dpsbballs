import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import Header from "@/components/Header";
import "./globals.css";
import { getProducts, getSiteData } from "@/lib/cms";

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

export async function generateMetadata(): Promise<Metadata> {
  const { seo, site } = await getSiteData();
  const title =
    seo.title ||
    "DSP Precision Products | Precision Balls Manufacturer";
  const description =
    seo.description ||
    "DSP Precision Products Pvt. Ltd. — manufacturer & exporter of steel, stainless steel, carbide, ceramic, brass, copper, gauge and modified precision balls from Baddi, India.";
  return {
    title: {
      default: title,
      template: `%s | ${site.shortName || "DSP"} Precision Products`,
    },
    description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ site, navLinks }, products] = await Promise.all([
    getSiteData(),
    getProducts(),
  ]);

  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Header navLinks={navLinks} site={site} />
        <main className="flex-1">{children}</main>
        <FloatingCTA />
        <Footer products={products} site={site} />
      </body>
    </html>
  );
}
