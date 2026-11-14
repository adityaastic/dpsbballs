import { cache } from "react";
import type { Metadata } from "next";
import { getSupabaseAdmin } from "./supabase";
import { getProducts } from "./cms";
import {
  analyzeSeoContent,
  calculateWordCount,
  extractLinksAndImages,
  extractTableOfContents,
  SeoMetadataPayload,
  TocItem,
} from "./seoAnalyzer";

export type RedirectRule = {
  id: string;
  sourcePath: string;
  destinationUrl: string;
  type: 301 | 302;
  active: boolean;
  createdAt: string;
  note?: string;
};

export type TechnicalSeoConfig = {
  redirects: RedirectRule[];
  robotsTxt: {
    allowIndexing: boolean;
    customRules: string;
    blockAiBots: boolean;
  };
  sitemapConfig: {
    includePages: boolean;
    includeProducts: boolean;
    includeBlogs: boolean;
    excludeNoindex: boolean;
  };
  templates: {
    titleSeparator: string;
    pageTitleTemplate: string;
    productTitleTemplate: string;
    blogTitleTemplate: string;
    defaultOgImage: string;
  };
  schemaConfig: {
    organizationName: string;
    legalName: string;
    foundingYear: string;
    isoCertifications: string[];
    customerServicePhone: string;
    customerServiceEmail: string;
    sameAsSocialUrls: string[];
  };
  integrations: {
    gscConnected: boolean;
    gscPropertyUrl: string;
    gscAccessToken: string;
    googleSiteVerification: string;
    bingVerification: string;
    ga4MeasurementId: string;
  };
};

export type BlogRevision = {
  id: string;
  savedAt: string;
  title: string;
  bodyHtml: string;
  note: string;
};

export type BlogArticleRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  customIntro: string;
  bodyHtml: string;
  featuredImage: string;
  featuredImageAlt: string;
  featuredImageCaption: string;
  featuredImageTitle: string;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  status: "draft" | "published" | "scheduled";
  publishedAt: string;
  scheduledFor?: string;
  updatedAt: string;
  featured: boolean;
  relatedSlugs: string[];
  readingTimeMinutes: number;
  wordCount: number;
  tableOfContents: TocItem[];
  revisions: BlogRevision[];
  seo: SeoMetadataPayload;
};

export type SeoOverrideRecord = {
  entityType: "page" | "product" | "blog";
  entityId: string;
  urlPath: string;
  seo: SeoMetadataPayload;
  updatedAt: string;
};

export type AuditedSeoItem = {
  id: string;
  entityType: "page" | "product" | "blog";
  entityId: string;
  title: string;
  urlPath: string;
  status: "published" | "draft" | "scheduled";
  updatedAt: string;
  wordCount: number;
  readingTimeMinutes: number;
  score: number;
  grade: "good" | "ok" | "poor";
  passCount: number;
  warnCount: number;
  failCount: number;
  internalLinksCount: number;
  externalLinksCount: number;
  incomingInternalLinks: number;
  imagesCount: number;
  imagesMissingAltCount: number;
  isOrphan: boolean;
  issues: string[];
  seo: SeoMetadataPayload;
};

export const DEFAULT_TECHNICAL_SEO: TechnicalSeoConfig = {
  redirects: [
    {
      id: "redir-1",
      sourcePath: "/catalogue",
      destinationUrl: "/products",
      type: 301,
      active: true,
      createdAt: "2025-01-15T08:00:00.000Z",
      note: "Legacy catalogue URL redirect",
    },
    {
      id: "redir-2",
      sourcePath: "/enquire",
      destinationUrl: "/contact",
      type: 301,
      active: true,
      createdAt: "2025-01-15T08:00:00.000Z",
      note: "Legacy enquiry shortcut",
    },
  ],
  robotsTxt: {
    allowIndexing: true,
    customRules: "Disallow: /admin/\nDisallow: /api/",
    blockAiBots: false,
  },
  sitemapConfig: {
    includePages: true,
    includeProducts: true,
    includeBlogs: true,
    excludeNoindex: true,
  },
  templates: {
    titleSeparator: "|",
    pageTitleTemplate: "%title% %sep% %site_name%",
    productTitleTemplate:
      "%title% Manufacturer & Supplier India %sep% %site_name%",
    blogTitleTemplate: "%title% %sep% %site_name%",
    defaultOgImage: "/images/infrastructure/building-front-view.jpg",
  },
  schemaConfig: {
    organizationName: "Durga Steel & Precision Ball (DSP)",
    legalName: "DSP Precision Products Pvt. Ltd.",
    foundingYear: "1984",
    isoCertifications: ["ISO 9001:2015", "ISO 3290", "DIN 5401", "AFBMA"],
    customerServicePhone: "+91-98290-65542",
    customerServiceEmail: "info@dspballs.co.in",
    sameAsSocialUrls: [],
  },
  integrations: {
    gscConnected: false,
    gscPropertyUrl: "https://www.dspballs.co.in/",
    gscAccessToken: "",
    googleSiteVerification: "",
    bingVerification: "",
    ga4MeasurementId: "",
  },
};

export const SEED_BLOG_ARTICLES: BlogArticleRecord[] = [
  {
    id: "blog-aisi-52100-chrome-steel-balls-guide",
    slug: "aisi-52100-chrome-steel-balls-guide",
    title:
      "AISI 52100 Chrome Steel Balls: Complete Engineering, Hardness & ISO 3290 Grade Guide",
    excerpt:
      "An engineering guide to AISI 52100 (100Cr6 / EN31) high-chrome bearing steel balls, covering chemical composition, 60–66 HRC through-hardening, ISO 3290 grades (G3 to G100), and industrial applications.",
    customIntro:
      "AISI 52100 (DIN 100Cr6 / EN31) high-carbon chromium alloy steel is the global benchmark material for precision bearing balls, automotive steering assemblies, ball screws, and high-load industrial valves.",
    bodyHtml: `
      <h2>What Makes AISI 52100 Chrome Steel Balls the Industry Standard?</h2>
      <p><strong>AISI 52100 chrome steel balls</strong> are manufactured from high-carbon, chromium-alloyed bearing steel containing approximately 0.98%–1.10% carbon and 1.30%–1.60% chromium. Through controlled atmosphere austenitizing, oil quenching, sub-zero cryogenic stabilization, and tempering, these precision balls achieve uniform through-hardness of <strong>60 to 66 HRC</strong> across their entire cross-section.</p>
      <p>At <a href="/about">Durga Steel &amp; Precision Ball (DSP)</a>, our automated cold-heading, flashing, soft-grinding, heat-treatment, and multi-stage lapping lines produce <a href="/products/steel-balls">high-chrome alloy steel balls</a> engineered to ISO 3290 and DIN 5401 tolerances.</p>

      <h2>Chemical Composition &amp; Metallurgical Standards</h2>
      <p>International bearing standards (ASTM A295, DIN EN ISO 683-17, JIS SUJ2, and BS EN31) specify strict limits on non-metallic inclusions and carbide segregation to maximize rolling contact fatigue life.</p>
      <table>
        <thead>
          <tr>
            <th>Element</th>
            <th>AISI 52100 / 100Cr6 Range (%)</th>
            <th>Metallurgical Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Carbon (C)</td>
            <td>0.98 – 1.10%</td>
            <td>Delivers 60–66 HRC martensitic hardness and wear resistance</td>
          </tr>
          <tr>
            <td>Chromium (Cr)</td>
            <td>1.30 – 1.60%</td>
            <td>Ensures deep through-hardening and fine chromium carbides</td>
          </tr>
          <tr>
            <td>Manganese (Mn)</td>
            <td>0.25 – 0.45%</td>
            <td>Improves quench hardenability and deoxidation</td>
          </tr>
          <tr>
            <td>Silicon (Si)</td>
            <td>0.15 – 0.35%</td>
            <td>Enhances elastic limit and matrix strength</td>
          </tr>
        </tbody>
      </table>

      <h2>Understanding ISO 3290 / DIN 5401 Ball Grades (G3 to G1000)</h2>
      <p>In precision ball manufacturing, the <strong>Grade (G)</strong> number designates the maximum allowable ball diameter variation, spherical deviation (roundness), and lot diameter variation in micrometers (µm) or millionths of an inch.</p>
      <ul>
        <li><strong>Grades G3, G5 &amp; G10:</strong> Ultra-high precision balls with surface roughness Ra ≤ 0.014 µm for high-speed spindle bearings, aerospace actuators, and precision ball screws.</li>
        <li><strong>Grades G16, G20 &amp; G28:</strong> Standard precision bearing grades used in electric motors, automotive wheel hubs, transmission bearings, and hydraulic pumps.</li>
        <li><strong>Grades G40, G100 &amp; G200:</strong> Semi-precision chrome steel balls suited for caster wheels, drawer slides, bicycles, and general industrial hardware.</li>
      </ul>

      <h2>When to Choose Chrome Steel vs. Stainless Steel Balls</h2>
      <p>While AISI 52100 chrome steel offers superior contact fatigue strength and crush load capacity, it requires oil or grease lubrication to prevent oxidation. For corrosive, chemical, or washdown environments, engineers specify <a href="/products/stainless-steel-balls">AISI 304, 316L, or hardened 440C stainless steel balls</a> or <a href="/products/ceramic-balls">silicon nitride ceramic balls</a>.</p>
      <p>Need help selecting the exact grade and diameter for your bearing or valve assembly? <a href="/contact">Contact our technical engineering team</a> for a custom quotation and inspection certificate.</p>
    `,
    featuredImage: "/images/products/high-chrome-steel-balls.webp",
    featuredImageAlt:
      "AISI 52100 high-chrome steel balls manufactured to ISO 3290 precision grades",
    featuredImageCaption:
      "Mirror-finished AISI 52100 chrome steel balls inspected for sphericity and surface roughness.",
    featuredImageTitle: "AISI 52100 Chrome Steel Balls — DSP India",
    category: "Metallurgy & Materials",
    tags: [
      "AISI 52100",
      "Chrome Steel Balls",
      "ISO 3290",
      "DIN 5401",
      "Bearing Balls",
    ],
    authorName: "DSP Metallurgy & Quality Engineering Team",
    authorRole: "ISO 9001:2015 Certified Precision Ball Specialists",
    status: "published",
    publishedAt: "2026-08-10T09:00:00.000Z",
    updatedAt: "2026-08-15T11:30:00.000Z",
    featured: true,
    relatedSlugs: [
      "stainless-steel-balls-304-vs-316-vs-440c",
      "iso-3290-precision-ball-grades-tolerance-chart",
    ],
    readingTimeMinutes: 4,
    wordCount: 385,
    tableOfContents: [],
    revisions: [],
    seo: {
      focusKeyword: "AISI 52100 chrome steel balls",
      secondaryKeywords: [
        "100Cr6 bearing balls",
        "ISO 3290 ball grades",
        "EN31 steel balls manufacturer India",
      ],
      seoTitle:
        "AISI 52100 Chrome Steel Balls: Hardness, Specs & ISO 3290 Guide",
      metaDescription:
        "Complete technical guide to AISI 52100 (100Cr6 / EN31) chrome steel balls: chemical composition, 60–66 HRC hardness, ISO 3290 grades, and bearing applications.",
      slug: "aisi-52100-chrome-steel-balls-guide",
      canonicalUrl:
        "https://www.dspballs.co.in/blog/aisi-52100-chrome-steel-balls-guide",
      robotsIndex: true,
      robotsFollow: true,
      ogTitle:
        "AISI 52100 Chrome Steel Balls: Complete Engineering & ISO 3290 Grade Guide",
      ogDescription:
        "Explore AISI 52100 (100Cr6) chemical composition, 60–66 HRC through-hardening, and ISO 3290 precision grades.",
      ogImage: "/images/products/high-chrome-steel-balls.webp",
      breadcrumbTitle: "AISI 52100 Chrome Steel Balls Guide",
      schemaType: "TechArticle",
      faqItems: [
        {
          question: "What is the hardness of AISI 52100 chrome steel balls?",
          answer:
            "AISI 52100 chrome steel balls are through-hardened and tempered to 60–66 HRC (Rockwell C scale) for maximum rolling contact fatigue life and wear resistance.",
        },
        {
          question: "Are AISI 52100, 100Cr6, SUJ2, and EN31 equivalent?",
          answer:
            "Yes. AISI 52100 (USA), DIN 100Cr6 (Germany/ISO), JIS SUJ2 (Japan), and EN31 (BS) are international equivalents for high-carbon chromium bearing steel.",
        },
      ],
    },
  },
  {
    id: "blog-stainless-steel-balls-304-vs-316-vs-440c",
    slug: "stainless-steel-balls-304-vs-316-vs-440c",
    title:
      "Stainless Steel Balls Comparison: AISI 304 vs 316L vs 420 vs 440C Selection Guide",
    excerpt:
      "Compare austenitic (AISI 304, 316L) and martensitic (AISI 420, 440C) stainless steel balls across corrosion resistance, hardness, magnetic properties, and valve/bearing applications.",
    customIntro:
      "Choosing between austenitic (304, 316L) and martensitic (420, 440C) stainless steel balls determines whether your check valve, chemical pump, food-grade conveyor, or precision bearing achieves multi-year reliability.",
    bodyHtml: `
      <h2>Austenitic vs. Martensitic Stainless Steel Balls</h2>
      <p><strong>Stainless steel balls</strong> are divided into two primary metallurgical families: <strong>Austenitic grades (AISI 304, 316, 316L)</strong> which prioritize maximum corrosion resistance and non-magnetic performance, and <strong>Martensitic grades (AISI 420, 440C)</strong> which can be heat-treated to high hardness (50–60 HRC) for load-bearing and wear-critical assemblies.</p>
      <p>Explore our complete specification sheets on the <a href="/products/stainless-steel-balls">DSP Stainless Steel Balls product page</a> or compare material families in our <a href="/technical">Technical Reference Center</a>.</p>

      <h2>Side-by-Side Comparison: 304 vs 316L vs 420 vs 440C</h2>
      <table>
        <thead>
          <tr>
            <th>Grade</th>
            <th>Structure</th>
            <th>Hardness</th>
            <th>Corrosion Resistance</th>
            <th>Primary Applications</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>AISI 304 / 304L</td>
            <td>Austenitic (18Cr-8Ni)</td>
            <td>25–39 HRC ( Cold Worked )</td>
            <td>High (Atmospheric, Water, Food)</td>
            <td>Aerosol valves, triggers, food processing, medical devices</td>
          </tr>
          <tr>
            <td>AISI 316 / 316L</td>
            <td>Austenitic (17Cr-12Ni-2Mo)</td>
            <td>25–39 HRC</td>
            <td>Superior (Marine, Chlorides, Acids)</td>
            <td>Pharmaceutical pumps, marine fittings, chemical check valves</td>
          </tr>
          <tr>
            <td>AISI 420</td>
            <td>Martensitic (13% Cr)</td>
            <td>52–55 HRC</td>
            <td>Moderate (Freshwater, Steam, Oil)</td>
            <td>Quick couplings, ball valves, metering pumps, light bearings</td>
          </tr>
          <tr>
            <td>AISI 440C</td>
            <td>Martensitic High-Carbon (17% Cr)</td>
            <td>58–62 HRC</td>
            <td>Good (Mild chemicals, Food, Steam)</td>
            <td>Precision stainless bearings, aerospace actuators, high-pressure valves</td>
          </tr>
        </tbody>
      </table>

      <h2>Why Molybdenum Makes AISI 316L Essential for Chemical &amp; Marine Use</h2>
      <p>The addition of <strong>2.0% to 3.0% Molybdenum (Mo)</strong> in AISI 316 and 316L stainless steel balls dramatically increases resistance to pitting and crevice corrosion in chloride-bearing solutions, seawater, sulfuric compounds, and pharmaceutical sterilization cycles.</p>

      <h2>When to Specify Hardened AISI 440C Stainless Steel Balls</h2>
      <p>When an application demands the surface hardness of <a href="/products/steel-balls">chrome steel balls</a> combined with stainless corrosion protection, <strong>AISI 440C (58–62 HRC)</strong> is the premier choice. For extreme chemical or abrasive service beyond stainless steel limits, consider <a href="/products/tungsten-carbide-balls">tungsten carbide balls</a>. <a href="/contact">Request samples or a technical quote</a> from DSP today.</p>
    `,
    featuredImage: "/images/products/stainless-steel-balls.webp",
    featuredImageAlt:
      "AISI 304, 316L, 420 and 440C stainless steel balls for valves and bearings",
    featuredImageCaption:
      "Passivated austenitic and martensitic stainless steel balls ready for export.",
    featuredImageTitle: "Stainless Steel Balls 304 vs 316L vs 440C",
    category: "Corrosion & Chemical Engineering",
    tags: [
      "Stainless Steel Balls",
      "AISI 304",
      "AISI 316L",
      "AISI 440C",
      "Check Valves",
    ],
    authorName: "DSP Metallurgy & Quality Engineering Team",
    authorRole: "ISO 9001:2015 Certified Precision Ball Specialists",
    status: "published",
    publishedAt: "2026-08-12T10:00:00.000Z",
    updatedAt: "2026-08-16T09:15:00.000Z",
    featured: true,
    relatedSlugs: [
      "aisi-52100-chrome-steel-balls-guide",
      "iso-3290-precision-ball-grades-tolerance-chart",
    ],
    readingTimeMinutes: 4,
    wordCount: 360,
    tableOfContents: [],
    revisions: [],
    seo: {
      focusKeyword: "stainless steel balls",
      secondaryKeywords: [
        "304 vs 316 stainless steel balls",
        "440C hardened stainless balls",
        "SS balls manufacturer India",
      ],
      seoTitle:
        "Stainless Steel Balls: 304 vs 316L vs 420 vs 440C Selection Guide",
      metaDescription:
        "Compare AISI 304, 316L, 420, and 440C stainless steel balls across hardness, corrosion resistance, and magnetic behavior for valves, pumps, and bearings.",
      slug: "stainless-steel-balls-304-vs-316-vs-440c",
      canonicalUrl:
        "https://www.dspballs.co.in/blog/stainless-steel-balls-304-vs-316-vs-440c",
      robotsIndex: true,
      robotsFollow: true,
      ogTitle:
        "Stainless Steel Balls Comparison: AISI 304 vs 316L vs 420 vs 440C",
      ogDescription:
        "Engineering comparison of austenitic and martensitic stainless steel balls for industrial buyers.",
      ogImage: "/images/products/stainless-steel-balls.webp",
      breadcrumbTitle: "304 vs 316L vs 440C Stainless Steel Balls",
      schemaType: "TechArticle",
      faqItems: [
        {
          question:
            "What is the difference between 304 and 316L stainless steel balls?",
          answer:
            "AISI 316L contains 2–3% Molybdenum and lower carbon than 304, providing superior resistance to chloride pitting, marine environments, and chemical acids.",
        },
        {
          question: "Which stainless steel ball has the highest hardness?",
          answer:
            "AISI 440C martensitic stainless steel balls achieve 58–62 HRC after heat treatment, making them ideal for precision bearings and high-pressure check valves.",
        },
      ],
    },
  },
  {
    id: "blog-iso-3290-precision-ball-grades-tolerance-chart",
    slug: "iso-3290-precision-ball-grades-tolerance-chart",
    title:
      "ISO 3290 & DIN 5401 Precision Ball Grades Explained: Sphericity, Ra & Lot Variation",
    excerpt:
      "How to read ISO 3290, DIN 5401, and AFBMA precision ball grade tables — understanding Vdws (ball diameter variation), tdw (sphericity), Ra surface roughness, and lot sorting.",
    customIntro:
      "Specifying the right ISO 3290 ball grade balances acoustic bearing quietness, rotational speed capability, and manufacturing cost.",
    bodyHtml: `
      <h2>What Does an ISO 3290 Ball GradeActually Measure?</h2>
      <p>When engineers specify a <strong>precision ball grade</strong> such as G10, G16, G28, or G100 under <strong>ISO 3290 (DIN 5401 / ANSI/ABMA Std 10)</strong>, they are defining four critical geometric and surface tolerances rather than the nominal diameter alone:</p>
      <ul>
        <li><strong>Ball Diameter Variation (V<sub>Dws</sub>):</strong> The difference between the largest and smallest single diameter measurements on one individual ball.</li>
        <li><strong>Deviation from Spherical Form (t<sub>DW</sub>):</strong> The greatest radial distance in any equatorial plane between a sphere circumscribed around the ball and any point on the ball surface.</li>
        <li><strong>Lot Diameter Variation (V<sub>Dwl</sub>):</strong> The difference between the mean diameter of the largest ball and the smallest ball within a single production lot.</li>
        <li><strong>Surface Roughness (R<sub>a</sub>):</strong> The arithmetic mean deviation of the surface profile, critical for elastohydrodynamic (EHL) lubricant film formation.</li>
      </ul>

      <h2>ISO 3290 Precision Ball Grade Tolerance Reference Table</h2>
      <table>
        <thead>
          <tr>
            <th>Grade</th>
            <th>Sphericity / Dia Variation (µm)</th>
            <th>Max Surface Roughness Ra (µm)</th>
            <th>Lot Variation (µm)</th>
            <th>Typical Industrial Use</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Grade G3</td>
            <td>0.08 µm</td>
            <td>0.010 µm</td>
            <td>0.13 µm</td>
            <td>Gyroscopes, ultra-high-speed CNC spindles, metrology masters</td>
          </tr>
          <tr>
            <td>Grade G5</td>
            <td>0.13 µm</td>
            <td>0.014 µm</td>
            <td>0.25 µm</td>
            <td>Aerospace turbines, dental handpieces, precision ball screws</td>
          </tr>
          <tr>
            <td>Grade G10</td>
            <td>0.25 µm</td>
            <td>0.020 µm</td>
            <td>0.50 µm</td>
            <td>EV traction motors, low-noise deep groove ball bearings</td>
          </tr>
          <tr>
            <td>Grade G16</td>
            <td>0.40 µm</td>
            <td>0.025 µm</td>
            <td>0.80 µm</td>
            <td>Automotive transmissions, industrial gearboxes, pumps</td>
          </tr>
          <tr>
            <td>Grade G28</td>
            <td>0.70 µm</td>
            <td>0.050 µm</td>
            <td>1.40 µm</td>
            <td>Agricultural machinery, general bearings, valves</td>
          </tr>
          <tr>
            <td>Grade G100</td>
            <td>2.50 µm</td>
            <td>0.125 µm</td>
            <td>5.00 µm</td>
            <td>Linear slides, casters, semi-precision mechanisms</td>
          </tr>
        </tbody>
      </table>

      <h2>How DSP Verifies Sub-Micron Roundness &amp; Surface Finish</h2>
      <p>At <a href="/quality">DSP’s ISO 9001:2015 Quality Assurance Laboratory</a> in Jaipur, every batch of <a href="/products">precision balls</a> undergoes Talyrond circular geometry profiling, optical interferometry roughness testing, eddy-current flaw detection, and sub-micron gauge sorting.</p>
      <p>Have a drawing requiring tight gauge sorting or custom lapping? <a href="/contact">Send your specification to our metrology team</a>.</p>
    `,
    featuredImage: "/images/infrastructure/quality-inspection.jpg",
    featuredImageAlt:
      "ISO 3290 precision ball sphericity and micrometer tolerance inspection at DSP lab",
    featuredImageCaption:
      "Sub-micron roundness and surface finish verification in DSP's metrology lab.",
    featuredImageTitle: "ISO 3290 Precision Ball Grades Chart",
    category: "Quality & Metrology",
    tags: [
      "ISO 3290",
      "DIN 5401",
      "Ball Grades",
      "Metrology",
      "Quality Control",
    ],
    authorName: "DSP Metallurgy & Quality Engineering Team",
    authorRole: "ISO 9001:2015 Certified Precision Ball Specialists",
    status: "published",
    publishedAt: "2026-08-14T08:30:00.000Z",
    updatedAt: "2026-08-17T10:00:00.000Z",
    featured: false,
    relatedSlugs: [
      "aisi-52100-chrome-steel-balls-guide",
      "stainless-steel-balls-304-vs-316-vs-440c",
    ],
    readingTimeMinutes: 4,
    wordCount: 375,
    tableOfContents: [],
    revisions: [],
    seo: {
      focusKeyword: "ISO 3290 precision ball grades",
      secondaryKeywords: [
        "DIN 5401 ball tolerance chart",
        "G10 vs G28 ball grade",
        "ball sphericity tolerance",
      ],
      seoTitle:
        "ISO 3290 & DIN 5401 Precision Ball Grades & Tolerance Chart",
      metaDescription:
        "Complete engineering reference for ISO 3290 and DIN 5401 precision ball grades (G3 to G100): sphericity, surface roughness Ra, and lot variation.",
      slug: "iso-3290-precision-ball-grades-tolerance-chart",
      canonicalUrl:
        "https://www.dspballs.co.in/blog/iso-3290-precision-ball-grades-tolerance-chart",
      robotsIndex: true,
      robotsFollow: true,
      ogTitle:
        "ISO 3290 & DIN 5401 Precision Ball Grades Explained (G3 to G100)",
      ogDescription:
        "Understand ball diameter variation, sphericity, surface roughness Ra, and lot sorting tolerances.",
      ogImage: "/images/infrastructure/quality-inspection.jpg",
      breadcrumbTitle: "ISO 3290 Ball Grades Chart",
      schemaType: "TechArticle",
      faqItems: [
        {
          question: "Does a lower G number mean higher ball precision?",
          answer:
            "Yes. Under ISO 3290 and DIN 5401, a smaller grade number (such as G3, G5, or G10) indicates tighter sphericity, lower surface roughness Ra, and smaller lot diameter variation.",
        },
      ],
    },
  },
];

// Enrich seed articles with generated TOCs
for (const seed of SEED_BLOG_ARTICLES) {
  const { toc, htmlWithIds } = extractTableOfContents(seed.bodyHtml);
  seed.tableOfContents = toc;
  seed.bodyHtml = htmlWithIds;
  const wc = calculateWordCount(seed.bodyHtml);
  seed.wordCount = wc.wordCount;
  seed.readingTimeMinutes = wc.readingTimeMinutes;
}

const STATIC_PUBLIC_PAGES: {
  slug: string;
  title: string;
  urlPath: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultFocusKeyword: string;
  bodySummaryHtml: string;
}[] = [
  {
    slug: "home",
    title: "Home Page",
    urlPath: "/",
    defaultTitle:
      "Precision Steel, Stainless, Ceramic & Carbide Balls Manufacturer | Durga Steel & Precision Ball",
    defaultDescription:
      "ISO 9001:2015 certified manufacturer & global exporter of precision balls: High Chrome Steel (AISI 52100), Stainless Steel (304, 316L, 420, 440C), Ceramic, Tungsten Carbide, Brass & Grinding Media since 1984.",
    defaultFocusKeyword: "precision balls manufacturer India",
    bodySummaryHtml: `<h2>Precision Balls Manufacturer in India Since 1984</h2><p>Durga Steel & Precision Ball (DSP) manufactures ISO 3290 and DIN 5401 precision balls in Jaipur, India for automotive bearings, valves, and industrial engineering. Explore <a href="/products">our precision ball products</a>, <a href="/quality">ISO 9001:2015 quality lab</a>, and <a href="/contact">request a technical quote</a>.</p><img src="/images/infrastructure/building-front-view.jpg" alt="Durga Steel & Precision Ball manufacturing plant in Jaipur India" />`,
  },
  {
    slug: "about",
    title: "About DSP",
    urlPath: "/about",
    defaultTitle:
      "About Durga Steel & Precision Ball | Precision Ball Manufacturer Since 1984",
    defaultDescription:
      "Learn about Durga Steel & Precision Ball (DSP), Jaipur — over 40 years of manufacturing excellence in high-precision steel, stainless steel, carbide, and ceramic balls.",
    defaultFocusKeyword: "Durga Steel & Precision Ball",
    bodySummaryHtml: `<h2>About Durga Steel & Precision Ball</h2><p>Established in 1984 in Jaipur, Rajasthan, Durga Steel & Precision Ball is a trusted OEM supplier of <a href="/products">precision balls and rollers</a> with in-house cold heading, heat treatment, lapping, and <a href="/quality">metrology inspection</a>.</p><img src="/images/infrastructure/building-front-view.jpg" alt="DSP Precision Ball facility" />`,
  },
  {
    slug: "products",
    title: "Products Catalogue",
    urlPath: "/products",
    defaultTitle:
      "Industrial Precision Balls & Grinding Media Catalogue | DSP India",
    defaultDescription:
      "Browse DSP's complete range of precision balls: Chrome Steel (AISI 52100), Stainless Steel (304, 316L, 440C), Tungsten Carbide, Ceramic, Brass, Copper, and Burnishing Media.",
    defaultFocusKeyword: "industrial precision balls catalogue",
    bodySummaryHtml: `<h2>Industrial Precision Balls & Grinding Media Catalogue</h2><p>Explore our complete catalogue of industrial precision balls manufactured to ISO 3290, DIN 5401, and AFBMA standards. View <a href="/technical">material specifications</a> or <a href="/contact">request custom diameters</a>.</p><img src="/images/products/high-chrome-steel-balls.webp" alt="Industrial precision balls catalogue" />`,
  },
  {
    slug: "quality",
    title: "Quality Assurance & ISO Certification",
    urlPath: "/quality",
    defaultTitle:
      "Quality Assurance, Metrology & ISO 9001:2015 Certification | DSP Balls",
    defaultDescription:
      "Discover DSP's zero-defect quality management system: sub-micron sphericity testing, optical surface roughness inspection, hardness testing, and ISO 9001:2015 certification.",
    defaultFocusKeyword: "precision ball quality inspection",
    bodySummaryHtml: `<h2>Precision Ball Quality Inspection & Metrology Lab</h2><p>Every batch of precision balls at DSP undergoes strict <a href="/technical">ISO 3290 grade verification</a>, Talyrond roundness measurement, and optical inspection before dispatch. <a href="/contact">Contact our QA department</a>.</p><img src="/images/infrastructure/quality-inspection.jpg" alt="Precision ball quality inspection laboratory" />`,
  },
  {
    slug: "technical",
    title: "Technical Specifications & Metallurgy",
    urlPath: "/technical",
    defaultTitle:
      "Precision Ball Technical Specifications, Manufacturing Process & Material Guide",
    defaultDescription:
      "Engineering reference for precision ball manufacturing processes, chemical compositions, hardness tables, and ISO 3290 / DIN 5401 grade tolerances.",
    defaultFocusKeyword: "precision ball technical specifications",
    bodySummaryHtml: `<h2>Precision Ball Technical Specifications & Material Comparison</h2><p>Compare chemical composition, hardness, and corrosion resistance across <a href="/products">chrome steel, stainless steel, ceramic, and carbide balls</a>, or read our <a href="/blog">engineering blog</a>.</p><img src="/images/infrastructure/manufacturing-process.jpg" alt="Precision ball manufacturing process" />`,
  },
  {
    slug: "clients",
    title: "Industries & OEM Clients",
    urlPath: "/clients",
    defaultTitle:
      "Industries Served & OEM Applications | Durga Steel & Precision Ball",
    defaultDescription:
      "Supplying precision balls to automotive bearing manufacturers, valve & pump OEMs, aerospace, pharmaceutical, food processing, and energy industries worldwide.",
    defaultFocusKeyword: "OEM precision ball supplier",
    bodySummaryHtml: `<h2>OEM Precision Ball Supplier for Global Industries</h2><p>DSP serves tier-1 automotive, bearing, flow-control valve, and industrial OEMs across India and international export markets. View <a href="/products">our product range</a> and <a href="/network">global supply network</a>.</p><img src="/images/infrastructure/building-front-view.jpg" alt="OEM precision ball supplier DSP" />`,
  },
  {
    slug: "network",
    title: "Global Export & Domestic Supply Network",
    urlPath: "/network",
    defaultTitle:
      "Global Export & Domestic Supply Network | Precision Balls Exporter India",
    defaultDescription:
      "Durga Steel & Precision Ball exports ISO-certified precision balls across Europe, USA, Middle East, and Asia alongside pan-India industrial supply hubs.",
    defaultFocusKeyword: "precision balls exporter India",
    bodySummaryHtml: `<h2>Precision Balls Exporter India — Global & Pan-India Network</h2><p>From our manufacturing headquarters in Jaipur, Rajasthan, we supply <a href="/products">precision balls</a> to industrial hubs across India and export globally. <a href="/contact">Enquire for export pricing</a>.</p><img src="/images/infrastructure/building-front-view.jpg" alt="Precision balls exporter India network" />`,
  },
  {
    slug: "career",
    title: "Careers at DSP",
    urlPath: "/career",
    defaultTitle:
      "Careers in Precision Manufacturing & Metallurgy | Durga Steel & Precision Ball",
    defaultDescription:
      "Join the engineering, quality assurance, and manufacturing team at Durga Steel & Precision Ball (DSP) in Jaipur, India.",
    defaultFocusKeyword: "careers at Durga Steel & Precision Ball",
    bodySummaryHtml: `<h2>Careers at Durga Steel & Precision Ball</h2><p>Build your career in precision metallurgy, CNC grinding, quality metrology, and B2B industrial sales in Jaipur. <a href="/contact">Submit your application</a> or learn <a href="/about">about DSP</a>.</p><img src="/images/infrastructure/building-front-view.jpg" alt="Careers at Durga Steel & Precision Ball" />`,
  },
  {
    slug: "contact",
    title: "Contact & Request a Quote",
    urlPath: "/contact",
    defaultTitle:
      "Contact DSP & Request a Precision Ball Quote | Jaipur, India",
    defaultDescription:
      "Request a custom quote or technical consultation from Durga Steel & Precision Ball, Jaipur. Fast response for OEM bulk orders, custom diameters, and export enquiries.",
    defaultFocusKeyword: "contact precision ball manufacturer Jaipur",
    bodySummaryHtml: `<h2>Contact Precision Ball Manufacturer in Jaipur</h2><p>Reach out to Durga Steel & Precision Ball for custom sizes, <a href="/products">standard ISO 3290 grades</a>, and bulk OEM quotations.</p><img src="/images/infrastructure/building-front-view.jpg" alt="Contact DSP Precision Ball Jaipur" />`,
  },
  {
    slug: "disclaimer",
    title: "Legal Disclaimer & Terms",
    urlPath: "/disclaimer",
    defaultTitle: "Legal Disclaimer & Technical Terms | Durga Steel & Precision Ball",
    defaultDescription:
      "Legal disclaimer, technical specification guidance, and terms of use for Durga Steel & Precision Ball (DSP).",
    defaultFocusKeyword: "DSP legal disclaimer",
    bodySummaryHtml: `<h2>Legal Disclaimer & Technical Specification Notice</h2><p>Review standard tolerance terms and consult <a href="/contact">DSP engineering</a> for certified application drawings.</p><img src="/images/infrastructure/building-front-view.jpg" alt="DSP Legal Disclaimer" />`,
  },
];

// ============================================================================
// 1. Technical SEO Config Persistence (stored in site_settings key="seo_technical")
// ============================================================================
export const getTechnicalSeoConfig = cache(async (): Promise<TechnicalSeoConfig> => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", "seo_technical")
      .maybeSingle();

    if (error || !data || !data.work_office) {
      return DEFAULT_TECHNICAL_SEO;
    }

    const stored = data.work_office as unknown as Partial<TechnicalSeoConfig>;
    return {
      redirects: Array.isArray(stored.redirects)
        ? stored.redirects
        : DEFAULT_TECHNICAL_SEO.redirects,
      robotsTxt: {
        ...DEFAULT_TECHNICAL_SEO.robotsTxt,
        ...(stored.robotsTxt || {}),
      },
      sitemapConfig: {
        ...DEFAULT_TECHNICAL_SEO.sitemapConfig,
        ...(stored.sitemapConfig || {}),
      },
      templates: {
        ...DEFAULT_TECHNICAL_SEO.templates,
        ...(stored.templates || {}),
      },
      schemaConfig: {
        ...DEFAULT_TECHNICAL_SEO.schemaConfig,
        ...(stored.schemaConfig || {}),
      },
      integrations: {
        ...DEFAULT_TECHNICAL_SEO.integrations,
        ...(stored.integrations || {}),
      },
    };
  } catch {
    return DEFAULT_TECHNICAL_SEO;
  }
});

export async function saveTechnicalSeoConfig(
  config: TechnicalSeoConfig
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", "seo_technical")
      .maybeSingle();

    const payload = {
      key: "seo_technical",
      name: "Technical SEO Configuration",
      work_office: config as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error } = await supabase
        .from("site_settings")
        .update(payload)
        .eq("id", existing.id);
      return !error;
    } else {
      const { error } = await supabase.from("site_settings").insert(payload);
      return !error;
    }
  } catch {
    return false;
  }
}

// ============================================================================
// 2. Per-Page & Per-Product SEO Overrides (stored in site_settings key="seo_overrides")
// ============================================================================
export const getSeoOverridesMap = cache(async (): Promise<
  Record<string, SeoOverrideRecord>
> => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", "seo_overrides")
      .maybeSingle();

    if (error || !data || !data.work_office) {
      return {};
    }

    const stored = data.work_office as unknown as {
      overrides?: Record<string, SeoOverrideRecord>;
    };
    return stored.overrides || {};
  } catch {
    return {};
  }
});

export async function saveSeoOverridesMap(
  overrides: Record<string, SeoOverrideRecord>
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", "seo_overrides")
      .maybeSingle();

    const payload = {
      key: "seo_overrides",
      name: "Per-Page & Per-Product SEO Overrides",
      work_office: { overrides } as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error } = await supabase
        .from("site_settings")
        .update(payload)
        .eq("id", existing.id);
      return !error;
    } else {
      const { error } = await supabase.from("site_settings").insert(payload);
      return !error;
    }
  } catch {
    return false;
  }
}

// ============================================================================
// 3. Blog Articles Persistence (stored in page_contents with slug="blog:<slug>")
// ============================================================================
function parseDbBlogRow(row: {
  id: string;
  slug: string;
  title: string;
  hero_eyebrow?: string | null;
  hero_title?: string | null;
  hero_description?: string | null;
  sections?: unknown;
  body_html?: string | null;
  updated_at?: string | null;
}): BlogArticleRecord | null {
  const cleanSlug = row.slug.replace(/^blog:/, "");
  const bodyHtml = row.body_html || "";
  const { toc, htmlWithIds } = extractTableOfContents(bodyHtml);
  const { wordCount, readingTimeMinutes } = calculateWordCount(htmlWithIds);

  let metaObj: Partial<BlogArticleRecord> = {};
  if (Array.isArray(row.sections) && row.sections.length > 0) {
    const first = row.sections[0] as Record<string, unknown>;
    if (first && typeof first === "object") {
      metaObj = first as unknown as Partial<BlogArticleRecord>;
    }
  }

  const defaultSeo: SeoMetadataPayload = {
    focusKeyword: metaObj.seo?.focusKeyword || cleanSlug.replace(/-/g, " "),
    secondaryKeywords: metaObj.seo?.secondaryKeywords || [],
    seoTitle: metaObj.seo?.seoTitle || row.hero_title || row.title,
    metaDescription:
      metaObj.seo?.metaDescription || row.hero_description || metaObj.excerpt || "",
    slug: cleanSlug,
    canonicalUrl:
      metaObj.seo?.canonicalUrl ||
      `https://www.dspballs.co.in/blog/${cleanSlug}`,
    robotsIndex: metaObj.seo?.robotsIndex ?? true,
    robotsFollow: metaObj.seo?.robotsFollow ?? true,
    ogTitle: metaObj.seo?.ogTitle || row.title,
    ogDescription:
      metaObj.seo?.ogDescription || row.hero_description || metaObj.excerpt || "",
    ogImage:
      metaObj.seo?.ogImage ||
      metaObj.featuredImage ||
      "/images/infrastructure/building-front-view.jpg",
    breadcrumbTitle: metaObj.seo?.breadcrumbTitle || row.title,
    schemaType: metaObj.seo?.schemaType || "TechArticle",
    faqItems: metaObj.seo?.faqItems || [],
  };

  return {
    id: row.id || `blog-${cleanSlug}`,
    slug: cleanSlug,
    title: row.title || metaObj.title || "Untitled Article",
    excerpt: metaObj.excerpt || row.hero_description || "",
    customIntro: metaObj.customIntro || "",
    bodyHtml: htmlWithIds,
    featuredImage:
      metaObj.featuredImage || "/images/products/high-chrome-steel-balls.webp",
    featuredImageAlt: metaObj.featuredImageAlt || row.title || "",
    featuredImageCaption: metaObj.featuredImageCaption || "",
    featuredImageTitle: metaObj.featuredImageTitle || row.title || "",
    category: row.hero_eyebrow || metaObj.category || "Metallurgy & Materials",
    tags: Array.isArray(metaObj.tags) ? metaObj.tags : [],
    authorName:
      metaObj.authorName || "DSP Metallurgy & Quality Engineering Team",
    authorRole:
      metaObj.authorRole || "ISO 9001:2015 Certified Precision Ball Specialists",
    status: metaObj.status || "published",
    publishedAt:
      metaObj.publishedAt || row.updated_at || new Date().toISOString(),
    scheduledFor: metaObj.scheduledFor,
    updatedAt: row.updated_at || metaObj.updatedAt || new Date().toISOString(),
    featured: Boolean(metaObj.featured),
    relatedSlugs: Array.isArray(metaObj.relatedSlugs)
      ? metaObj.relatedSlugs
      : [],
    readingTimeMinutes,
    wordCount,
    tableOfContents: toc,
    revisions: Array.isArray(metaObj.revisions) ? metaObj.revisions : [],
    seo: defaultSeo,
  };
}

export const getAllBlogArticles = cache(async (): Promise<BlogArticleRecord[]> => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("page_contents")
      .select("*")
      .like("slug", "blog:%")
      .order("updated_at", { ascending: false });

    if (error) {
      return SEED_BLOG_ARTICLES;
    }

    if (!data || data.length === 0) {
      // Auto-seed the initial 3 technical engineering blog articles into Supabase
      for (const seed of SEED_BLOG_ARTICLES) {
        await saveBlogArticle(seed);
      }
      return SEED_BLOG_ARTICLES;
    }

    const parsed = data
      .map((r) => parseDbBlogRow(r))
      .filter((item): item is BlogArticleRecord => Boolean(item));

    return parsed.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch {
    return SEED_BLOG_ARTICLES;
  }
});

export async function getBlogArticleBySlug(
  slug: string
): Promise<BlogArticleRecord | null> {
  const cleanSlug = decodeURIComponent(slug)
    .trim()
    .toLowerCase()
    .replace(/^blog:/, "");
  const all = await getAllBlogArticles();
  return all.find((a) => a.slug === cleanSlug) || null;
}

export async function saveBlogArticle(
  article: Partial<BlogArticleRecord>,
  previousSlug?: string
): Promise<{ success: boolean; article?: BlogArticleRecord; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const cleanSlug = (article.slug || article.title || `article-${Date.now()}`)
      .trim()
      .toLowerCase()
      .replace(/^blog:/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const dbSlug = `blog:${cleanSlug}`;
    const rawBody = article.bodyHtml || "";
    const { toc, htmlWithIds } = extractTableOfContents(rawBody);
    const { wordCount, readingTimeMinutes } = calculateWordCount(htmlWithIds);
    const nowIso = new Date().toISOString();

    const seo: SeoMetadataPayload = {
      focusKeyword: article.seo?.focusKeyword || "",
      secondaryKeywords: article.seo?.secondaryKeywords || [],
      seoTitle: article.seo?.seoTitle || article.title || "",
      metaDescription:
        article.seo?.metaDescription || article.excerpt || "",
      slug: cleanSlug,
      canonicalUrl:
        article.seo?.canonicalUrl ||
        `https://www.dspballs.co.in/blog/${cleanSlug}`,
      robotsIndex: article.seo?.robotsIndex ?? true,
      robotsFollow: article.seo?.robotsFollow ?? true,
      ogTitle: article.seo?.ogTitle || article.seo?.seoTitle || article.title || "",
      ogDescription:
        article.seo?.ogDescription ||
        article.seo?.metaDescription ||
        article.excerpt ||
        "",
      ogImage:
        article.seo?.ogImage ||
        article.featuredImage ||
        "/images/products/high-chrome-steel-balls.webp",
      breadcrumbTitle: article.seo?.breadcrumbTitle || article.title || "",
      schemaType: article.seo?.schemaType || "TechArticle",
      faqItems: article.seo?.faqItems || [],
    };

    const existingRevisions = Array.isArray(article.revisions)
      ? article.revisions
      : [];
    const newRevision: BlogRevision = {
      id: `rev-${Date.now()}`,
      savedAt: nowIso,
      title: article.title || "Untitled",
      bodyHtml: htmlWithIds,
      note: `Saved (${article.status || "published"})`,
    };
    const revisions = [newRevision, ...existingRevisions].slice(0, 12);

    const recordToStore: BlogArticleRecord = {
      id: article.id || `blog-${cleanSlug}`,
      slug: cleanSlug,
      title: article.title || "Untitled Article",
      excerpt: article.excerpt || "",
      customIntro: article.customIntro || "",
      bodyHtml: htmlWithIds,
      featuredImage:
        article.featuredImage || "/images/products/high-chrome-steel-balls.webp",
      featuredImageAlt: article.featuredImageAlt || article.title || "",
      featuredImageCaption: article.featuredImageCaption || "",
      featuredImageTitle: article.featuredImageTitle || article.title || "",
      category: article.category || "Metallurgy & Materials",
      tags: Array.isArray(article.tags) ? article.tags : [],
      authorName:
        article.authorName || "DSP Metallurgy & Quality Engineering Team",
      authorRole:
        article.authorRole ||
        "ISO 9001:2015 Certified Precision Ball Specialists",
      status: article.status || "draft",
      publishedAt: article.publishedAt || nowIso,
      scheduledFor: article.scheduledFor,
      updatedAt: nowIso,
      featured: Boolean(article.featured),
      relatedSlugs: Array.isArray(article.relatedSlugs)
        ? article.relatedSlugs
        : [],
      readingTimeMinutes,
      wordCount,
      tableOfContents: toc,
      revisions,
      seo,
    };

    const { data: existing } = await supabase
      .from("page_contents")
      .select("id")
      .eq("slug", dbSlug)
      .maybeSingle();

    const dbPayload = {
      slug: dbSlug,
      title: recordToStore.title,
      hero_eyebrow: recordToStore.category,
      hero_title: seo.seoTitle,
      hero_description: seo.metaDescription,
      sections: [recordToStore] as unknown as Record<string, unknown>[],
      body_html: htmlWithIds,
      updated_at: nowIso,
    };

    if (existing?.id) {
      const { error } = await supabase
        .from("page_contents")
        .update(dbPayload)
        .eq("id", existing.id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("page_contents").insert(dbPayload);
      if (error) return { success: false, error: error.message };
    }

    // If the slug was changed from an existing published slug, remove old row and auto-create a 301 redirect
    if (previousSlug && previousSlug !== cleanSlug) {
      const oldClean = previousSlug.replace(/^blog:/, "");
      await supabase
        .from("page_contents")
        .delete()
        .eq("slug", `blog:${oldClean}`);

      const techConfig = await getTechnicalSeoConfig();
      const sourcePath = `/blog/${oldClean}`;
      const destinationUrl = `/blog/${cleanSlug}`;
      const alreadyExists = techConfig.redirects.some(
        (r) => r.sourcePath === sourcePath
      );
      if (!alreadyExists) {
        techConfig.redirects.unshift({
          id: `redir-${Date.now()}`,
          sourcePath,
          destinationUrl,
          type: 301,
          active: true,
          createdAt: nowIso,
          note: `Auto-created when blog slug changed from ${oldClean} to ${cleanSlug}`,
        });
        await saveTechnicalSeoConfig(techConfig);
      }
    }

    return { success: true, article: recordToStore };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save blog article",
    };
  }
}

export async function deleteBlogArticle(slug: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const cleanSlug = slug.trim().toLowerCase().replace(/^blog:/, "");
    const { error } = await supabase
      .from("page_contents")
      .delete()
      .eq("slug", `blog:${cleanSlug}`);
    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// 4. Unified SEO Inventory & Audit Engine (Pages + Products + Blogs)
// ============================================================================
export async function getUnifiedSeoInventory(): Promise<{
  items: AuditedSeoItem[];
  summary: {
    totalUrls: number;
    indexedCount: number;
    noindexCount: number;
    missingTitlesCount: number;
    missingDescriptionsCount: number;
    duplicateTitlesCount: number;
    duplicateDescriptionsCount: number;
    missingAltImagesTotal: number;
    orphanPagesCount: number;
    canonicalIssuesCount: number;
    avgScore: number;
    goodCount: number;
    okCount: number;
    poorCount: number;
  };
}> {
  const [products, blogArticles, overridesMap] = await Promise.all([
    getProducts(),
    getAllBlogArticles(),
    getSeoOverridesMap(),
  ]);

  type RawEntity = {
    id: string;
    entityType: "page" | "product" | "blog";
    entityId: string;
    title: string;
    urlPath: string;
    status: "published" | "draft" | "scheduled";
    updatedAt: string;
    bodyHtml: string;
    seo: SeoMetadataPayload;
  };

  const rawEntities: RawEntity[] = [];

  // 1. Static Public Pages
  for (const p of STATIC_PUBLIC_PAGES) {
    const key = `page:${p.slug}`;
    const override = overridesMap[key];
    const seo: SeoMetadataPayload = override?.seo || {
      focusKeyword: p.defaultFocusKeyword,
      secondaryKeywords: ["DSP balls", "precision balls India"],
      seoTitle: p.defaultTitle,
      metaDescription: p.defaultDescription,
      slug: p.slug === "home" ? "" : p.slug,
      canonicalUrl: `https://www.dspballs.co.in${p.urlPath}`,
      robotsIndex: true,
      robotsFollow: true,
      ogTitle: p.defaultTitle,
      ogDescription: p.defaultDescription,
      ogImage: "/images/infrastructure/building-front-view.jpg",
      breadcrumbTitle: p.title,
      schemaType: "WebPage",
      faqItems: [],
    };

    rawEntities.push({
      id: key,
      entityType: "page",
      entityId: p.slug,
      title: p.title,
      urlPath: p.urlPath,
      status: "published",
      updatedAt: override?.updatedAt || "2026-08-01T00:00:00.000Z",
      bodyHtml: p.bodySummaryHtml,
      seo,
    });
  }

  // 2. Products
  for (const prod of products) {
    const key = `product:${prod.slug}`;
    const override = overridesMap[key];
    const urlPath = `/products/${prod.slug}`;
    const defaultSeoTitle = `${prod.title} Manufacturer & Supplier India`;
    const defaultMetaDesc =
      prod.short && prod.short.length >= 110
        ? prod.short
        : `${prod.short || prod.title} Manufactured by Durga Steel & Precision Ball (DSP) in Jaipur, India to ISO 3290 & DIN 5401 precision grades.`;

    const seo: SeoMetadataPayload = override?.seo || {
      focusKeyword: prod.title.toLowerCase(),
      secondaryKeywords: [
        `${prod.title} India`,
        ...(prod.grades || []).slice(0, 3),
      ],
      seoTitle: defaultSeoTitle,
      metaDescription: defaultMetaDesc.slice(0, 160),
      slug: prod.slug,
      canonicalUrl: `https://www.dspballs.co.in${urlPath}`,
      robotsIndex: true,
      robotsFollow: true,
      ogTitle: defaultSeoTitle,
      ogDescription: defaultMetaDesc.slice(0, 160),
      ogImage:
        prod.imageUrl || "/images/products/high-chrome-steel-balls.webp",
      breadcrumbTitle: prod.title,
      schemaType: "Product",
      faqItems: [],
    };

    const prodHtml = `
      <h2>${prod.title} Technical Overview & Specifications</h2>
      <p>${prod.description || prod.short}</p>
      <h3>Key Highlights & Available Grades</h3>
      <ul>${(prod.highlights || []).map((h) => `<li>${h}</li>`).join("")}</ul>
      <p>Manufactured by <a href="/about">Durga Steel & Precision Ball</a>. View <a href="/products">all precision balls</a>, check <a href="/quality">ISO 9001:2015 quality testing</a>, or <a href="/contact">enquire now</a>.</p>
      <img src="${
        prod.imageUrl || "/images/products/high-chrome-steel-balls.webp"
      }" alt="${prod.title} manufactured by DSP India" />
    `;

    rawEntities.push({
      id: key,
      entityType: "product",
      entityId: prod.slug,
      title: prod.title,
      urlPath,
      status: "published",
      updatedAt: override?.updatedAt || "2026-08-05T00:00:00.000Z",
      bodyHtml: prodHtml,
      seo,
    });
  }

  // 3. Blog Articles
  for (const blog of blogArticles) {
    const key = `blog:${blog.slug}`;
    rawEntities.push({
      id: key,
      entityType: "blog",
      entityId: blog.slug,
      title: blog.title,
      urlPath: `/blog/${blog.slug}`,
      status: blog.status,
      updatedAt: blog.updatedAt,
      bodyHtml:
        blog.bodyHtml +
        (blog.featuredImage
          ? `<img src="${blog.featuredImage}" alt="${
              blog.featuredImageAlt || ""
            }" />`
          : ""),
      seo: blog.seo,
    });
  }

  // Compute incoming internal links map across all entities
  const incomingLinksMap: Record<string, number> = {
    "/": 10,
    "/about": 4,
    "/products": 8,
    "/quality": 4,
    "/technical": 4,
    "/clients": 2,
    "/network": 2,
    "/career": 2,
    "/contact": 12,
    "/disclaimer": 1,
    "/blog": 3,
  };

  // Every product is linked from /products catalogue
  for (const prod of products) {
    incomingLinksMap[`/products/${prod.slug}`] =
      (incomingLinksMap[`/products/${prod.slug}`] || 0) + 1;
  }
  // Every published blog is linked from /blog index
  for (const blog of blogArticles) {
    if (blog.status === "published") {
      incomingLinksMap[`/blog/${blog.slug}`] =
        (incomingLinksMap[`/blog/${blog.slug}`] || 0) + 1;
    }
  }

  // Also count contextual internal links inside bodyHtml
  for (const ent of rawEntities) {
    const { internalLinks } = extractLinksAndImages(ent.bodyHtml);
    for (const link of internalLinks) {
      const normalizedTarget =
        link.href.replace("https://www.dspballs.co.in", "").split("?")[0] || "/";
      if (normalizedTarget !== ent.urlPath) {
        incomingLinksMap[normalizedTarget] =
          (incomingLinksMap[normalizedTarget] || 0) + 1;
      }
    }
  }

  const allTitles = rawEntities.map((e) => ({
    id: e.id,
    title: e.seo.seoTitle || e.title,
    description: e.seo.metaDescription || "",
  }));

  const items: AuditedSeoItem[] = rawEntities.map((ent) => {
    const analysis = analyzeSeoContent({
      title: ent.title,
      bodyHtml: ent.bodyHtml,
      urlPath: ent.urlPath,
      seo: ent.seo,
      allTitles,
      currentId: ent.id,
    });

    const incomingCount = incomingLinksMap[ent.urlPath] || 0;
    const isOrphan = incomingCount === 0;

    const issues: string[] = [];
    if (!ent.seo.seoTitle || !ent.seo.seoTitle.trim()) {
      issues.push("Missing SEO Title");
    }
    if (!ent.seo.metaDescription || !ent.seo.metaDescription.trim()) {
      issues.push("Missing Meta Description");
    }
    if (
      analysis.checks.find(
        (c) => c.id === "duplicate-check" && c.status === "fail"
      )
    ) {
      const dupTitle = allTitles.some(
        (t) =>
          t.id !== ent.id &&
          t.title.trim().toLowerCase() ===
            (ent.seo.seoTitle || ent.title).trim().toLowerCase()
      );
      const dupDesc = allTitles.some(
        (t) =>
          t.id !== ent.id &&
          ent.seo.metaDescription.trim().length > 0 &&
          t.description.trim().toLowerCase() ===
            ent.seo.metaDescription.trim().toLowerCase()
      );
      if (dupTitle) issues.push("Duplicate SEO Title");
      if (dupDesc) issues.push("Duplicate Meta Description");
    }
    if (analysis.imagesMissingAltCount > 0) {
      issues.push(`${analysis.imagesMissingAltCount} Image(s) Missing Alt`);
    }
    if (!ent.seo.robotsIndex) {
      issues.push("Noindex Directive");
    }
    if (
      !ent.seo.canonicalUrl ||
      !ent.seo.canonicalUrl.startsWith("https://")
    ) {
      issues.push("Canonical Issue");
    }
    if (isOrphan) {
      issues.push("Orphan Page (0 Incoming Links)");
    }

    return {
      id: ent.id,
      entityType: ent.entityType,
      entityId: ent.entityId,
      title: ent.title,
      urlPath: ent.urlPath,
      status: ent.status,
      updatedAt: ent.updatedAt,
      wordCount: analysis.wordCount,
      readingTimeMinutes: analysis.readingTimeMinutes,
      score: analysis.score,
      grade: analysis.grade,
      passCount: analysis.passCount,
      warnCount: analysis.warnCount,
      failCount: analysis.failCount,
      internalLinksCount: analysis.internalLinksCount,
      externalLinksCount: analysis.externalLinksCount,
      incomingInternalLinks: incomingCount,
      imagesCount: analysis.imagesCount,
      imagesMissingAltCount: analysis.imagesMissingAltCount,
      isOrphan,
      issues,
      seo: ent.seo,
    };
  });

  const totalUrls = items.length;
  const indexedCount = items.filter((i) => i.seo.robotsIndex).length;
  const noindexCount = totalUrls - indexedCount;
  const missingTitlesCount = items.filter((i) =>
    i.issues.includes("Missing SEO Title")
  ).length;
  const missingDescriptionsCount = items.filter((i) =>
    i.issues.includes("Missing Meta Description")
  ).length;
  const duplicateTitlesCount = items.filter((i) =>
    i.issues.includes("Duplicate SEO Title")
  ).length;
  const duplicateDescriptionsCount = items.filter((i) =>
    i.issues.includes("Duplicate Meta Description")
  ).length;
  const missingAltImagesTotal = items.reduce(
    (acc, i) => acc + i.imagesMissingAltCount,
    0
  );
  const orphanPagesCount = items.filter((i) => i.isOrphan).length;
  const canonicalIssuesCount = items.filter((i) =>
    i.issues.includes("Canonical Issue")
  ).length;
  const avgScore =
    totalUrls > 0
      ? Math.round(items.reduce((acc, i) => acc + i.score, 0) / totalUrls)
      : 0;

  return {
    items,
    summary: {
      totalUrls,
      indexedCount,
      noindexCount,
      missingTitlesCount,
      missingDescriptionsCount,
      duplicateTitlesCount,
      duplicateDescriptionsCount,
      missingAltImagesTotal,
      orphanPagesCount,
      canonicalIssuesCount,
      avgScore,
      goodCount: items.filter((i) => i.grade === "good").length,
      okCount: items.filter((i) => i.grade === "ok").length,
      poorCount: items.filter((i) => i.grade === "poor").length,
    },
  };
}

// ============================================================================
// 5. Public Page Next.js Metadata Resolver
// ============================================================================
export async function resolveNextPageMetadata(params: {
  entityType: "page" | "product" | "blog";
  entityId: string;
  urlPath: string;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackImage?: string;
  fallbackKeywords?: string[];
}): Promise<Metadata> {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.dspballs.co.in"
  ).replace(/\/$/, "");

  const [overridesMap, techConfig] = await Promise.all([
    getSeoOverridesMap(),
    getTechnicalSeoConfig(),
  ]);

  const key = `${params.entityType}:${params.entityId}`;
  const override = overridesMap[key]?.seo;

  const title = override?.seoTitle || params.fallbackTitle;
  const description = override?.metaDescription || params.fallbackDescription;
  const canonicalUrl =
    override?.canonicalUrl || `${siteUrl}${params.urlPath}`;
  const ogTitle = override?.ogTitle || title;
  const ogDescription = override?.ogDescription || description;
  const ogImage =
    override?.ogImage ||
    params.fallbackImage ||
    techConfig.templates.defaultOgImage ||
    "/images/infrastructure/building-front-view.jpg";

  const allowGlobal = techConfig.robotsTxt.allowIndexing;
  const index = allowGlobal ? (override?.robotsIndex ?? true) : false;
  const follow = allowGlobal ? (override?.robotsFollow ?? true) : false;

  const keywords = override?.focusKeyword
    ? [override.focusKeyword, ...(override.secondaryKeywords || [])]
    : params.fallbackKeywords || [];

  return {
    title,
    description,
    keywords: keywords.filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index,
      follow,
      googleBot: {
        index,
        follow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName: "Durga Steel & Precision Ball (DSP)",
      type: params.entityType === "blog" ? "article" : "website",
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`],
    },
  };
}
