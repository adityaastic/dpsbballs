import { getTechnicalSeoConfig } from "@/lib/seoCms";

type SeoSchemaProps = {
  site: {
    name: string;
    shortName: string;
    tagline: string;
    email: string;
    phoneWork?: string;
    phoneRegd?: string;
    mobile?: string;
    logoUrl?: string;
  };
};

export default async function SeoSchema({ site }: SeoSchemaProps) {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.dspballs.co.in"
  ).replace(/\/$/, "");
  const logo = site.logoUrl || `${baseUrl}/images/certifications/gsci-cert.jpg`;

  const techConfig = await getTechnicalSeoConfig();
  const sc = techConfig.schemaConfig;

  const orgName = sc?.organizationName || site.name;
  const legalName = sc?.legalName || site.name;
  const phone = sc?.customerServicePhone || site.phoneWork || site.mobile;
  const email = sc?.customerServiceEmail || site.email;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: orgName,
    legalName,
    alternateName: site.shortName || "DSP Precision",
    foundingDate: sc?.foundingYear || "1984",
    url: baseUrl,
    logo,
    description:
      site.tagline ||
      "Manufacturer & Exporter of Precision Balls & Allied Products",
    email,
    telephone: phone,
    sameAs: Array.isArray(sc?.sameAsSocialUrls) ? sc.sameAsSocialUrls : [],
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: "18, Industrial Estate, Baddi",
        addressLocality: "Baddi",
        addressRegion: "Himachal Pradesh",
        postalCode: "173205",
        addressCountry: "IN",
      },
      {
        "@type": "PostalAddress",
        streetAddress: "E-373, Mayur Vihar, Phase-II",
        addressLocality: "Delhi",
        postalCode: "110091",
        addressCountry: "IN",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: phone,
        contactType: "sales",
        email,
        availableLanguage: ["English", "Hindi"],
      },
      {
        "@type": "ContactPoint",
        telephone: site.mobile || phone,
        contactType: "customer support",
        email,
      },
    ],
    hasCertification: (sc?.isoCertifications?.length
      ? sc.isoCertifications
      : ["ISO 9001:2015 Quality Management System"]
    ).map((cert) => ({
      "@type": "EducationalOccupationalCredential",
      name: cert,
      credentialCategory: "ISO Certification",
    })),
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ManufacturingBusiness",
    "@id": `${baseUrl}/#localbusiness`,
    name: orgName,
    image: logo,
    url: baseUrl,
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "18, Industrial Estate, Baddi",
      addressLocality: "Baddi",
      addressRegion: "Himachal Pradesh",
      postalCode: "173205",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 30.956,
      longitude: 76.7828,
    },
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: orgName,
    description: site.tagline,
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
