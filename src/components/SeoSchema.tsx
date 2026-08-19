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

export default function SeoSchema({ site }: SeoSchemaProps) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dspballs.co.in").replace(/\/$/, "");
  const logo = site.logoUrl || `${baseUrl}/images/certifications/gsci-cert.jpg`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: site.name,
    alternateName: site.shortName || "DSP Precision",
    url: baseUrl,
    logo: logo,
    description: site.tagline || "Manufacturer & Exporter of Precision Balls & Allied Products",
    email: site.email,
    telephone: site.phoneWork || site.mobile,
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
        telephone: site.phoneWork,
        contactType: "sales",
        email: site.email,
        availableLanguage: ["English", "Hindi"],
      },
      {
        "@type": "ContactPoint",
        telephone: site.mobile,
        contactType: "customer support",
        email: site.email,
      },
    ],
    hasCertification: [
      {
        "@type": "EducationalOccupationalCredential",
        name: "ISO 9001:2015 Quality Management System",
        credentialCategory: "ISO Certification",
      },
    ],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ManufacturingBusiness",
    "@id": `${baseUrl}/#localbusiness`,
    name: site.name,
    image: logo,
    url: baseUrl,
    telephone: site.phoneWork || site.mobile,
    email: site.email,
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
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: site.name,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
