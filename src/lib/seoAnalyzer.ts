export type SeoCheckStatus = "pass" | "warn" | "fail";

export type SeoCheckCategory =
  | "basic"
  | "additional"
  | "readability"
  | "title-readability"
  | "content-readability"
  | "technical";

export type SeoMetadataPayload = {
  focusKeyword: string;
  secondaryKeywords: string[];
  seoTitle: string;
  metaDescription: string;
  slug: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  breadcrumbTitle: string;
  schemaType:
    | "TechArticle"
    | "BlogPosting"
    | "Article"
    | "Product"
    | "WebPage"
    | "FAQPage"
    | "None";
  faqItems: { question: string; answer: string }[];
};

export interface SeoCheckResult {
  id: string;
  category: SeoCheckCategory;
  status: SeoCheckStatus;
  title: string;
  whyItMatters: string;
  fixAction: string;
  targetField?: string;
  weight: number;
  label?: string;
  message?: string;
  recommendation?: string;
  fieldTarget?:
    | "focusKeyword"
    | "seoTitle"
    | "metaDescription"
    | "slug"
    | "canonicalUrl"
    | "robots"
    | "schema";
}

export interface SeoAnalysisInput {
  title: string;
  seoTitle?: string;
  metaDescription?: string;
  slug?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  bodyHtml: string;
  excerpt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  canonicalUrl?: string;
  robots?: string;
  schemaType?: string;
  contentType?: "blog" | "page" | "product";
  allExistingTitles?: string[];
  allExistingDescriptions?: string[];
  urlPath?: string;
  seo?: Partial<SeoMetadataPayload>;
  allTitles?: { id: string; title: string; description: string }[];
  currentId?: string;
}

export interface SeoAnalysisReport {
  score: number;
  grade: "good" | "ok" | "poor";
  passedCount: number;
  warningCount: number;
  errorCount: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  wordCount: number;
  readingTimeMinutes: number;
  internalLinksCount: number;
  externalLinksCount: number;
  imagesCount: number;
  imagesMissingAlt: number;
  imagesMissingAltCount: number;
  keywordDensity: number;
  checks: SeoCheckResult[];
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function calculateWordCount(html: string): {
  wordCount: number;
  readingTimeMinutes: number;
} {
  const plain = stripHtml(html);
  if (!plain) return { wordCount: 0, readingTimeMinutes: 1 };
  const words = plain.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  return { wordCount, readingTimeMinutes };
}

export function extractTableOfContents(html: string): {
  toc: TocItem[];
  htmlWithIds: string;
} {
  if (!html) return { toc: [], htmlWithIds: "" };
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  const htmlWithIds = html.replace(
    /<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (full, levelStr, attrs, inner) => {
      const level = parseInt(levelStr, 10);
      const text = stripHtml(inner);
      if (!text) return full;

      const existingIdMatch = attrs.match(/id=["']([^"']+)["']/i);
      let id = existingIdMatch
        ? existingIdMatch[1]
        : text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || `section-${toc.length + 1}`;

      let counter = 2;
      const baseId = id;
      while (usedIds.has(id)) {
        id = `${baseId}-${counter++}`;
      }
      usedIds.add(id);

      toc.push({ id, text, level });

      if (existingIdMatch) {
        return full;
      }
      return `<h${levelStr}${attrs} id="${id}">${inner}</h${levelStr}>`;
    }
  );

  return { toc, htmlWithIds };
}

export function extractLinksAndImages(
  html: string,
  siteHost = "dspballs.co.in"
): {
  internalLinks: { href: string; anchor: string }[];
  externalLinks: { href: string; anchor: string }[];
  images: { src: string; alt: string }[];
} {
  const internalLinks: { href: string; anchor: string }[] = [];
  const externalLinks: { href: string; anchor: string }[] = [];
  const images: { src: string; alt: string }[] = [];

  if (!html) return { internalLinks, externalLinks, images };

  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1].trim();
    const anchor = stripHtml(match[2]);
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }
    if (
      href.startsWith("/") ||
      href.includes(siteHost) ||
      href.includes("localhost")
    ) {
      internalLinks.push({ href, anchor });
    } else if (href.startsWith("http://") || href.startsWith("https://")) {
      externalLinks.push({ href, anchor });
    }
  }

  const imgRegex = /<img\s+[^>]*>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const tag = imgMatch[0];
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    const altMatch = tag.match(/alt=["']([^"']*)["']/i);
    images.push({
      src: srcMatch ? srcMatch[1] : "",
      alt: altMatch ? altMatch[1].trim() : "",
    });
  }

  return { internalLinks, externalLinks, images };
}

export function analyzeSeoContent(rawInput: SeoAnalysisInput): SeoAnalysisReport {
  const seoObj = rawInput.seo || {};
  const input: SeoAnalysisInput = {
    ...rawInput,
    seoTitle: rawInput.seoTitle ?? seoObj.seoTitle ?? rawInput.title,
    metaDescription: rawInput.metaDescription ?? seoObj.metaDescription ?? rawInput.excerpt ?? "",
    slug:
      rawInput.slug ??
      seoObj.slug ??
      (rawInput.urlPath ? rawInput.urlPath.split("/").filter(Boolean).pop() || "" : ""),
    focusKeyword: rawInput.focusKeyword ?? seoObj.focusKeyword ?? "",
    secondaryKeywords: rawInput.secondaryKeywords ?? seoObj.secondaryKeywords ?? [],
    canonicalUrl: rawInput.canonicalUrl ?? seoObj.canonicalUrl ?? "",
    robots:
      rawInput.robots ??
      (seoObj.robotsIndex === false ? "noindex, follow" : "index, follow"),
    schemaType: rawInput.schemaType ?? seoObj.schemaType ?? "TechArticle",
  };
  const checks: SeoCheckResult[] = [];
  const effectiveSeoTitle = (input.seoTitle || input.title || "").trim();
  const metaDesc = (input.metaDescription || input.excerpt || "").trim();
  const focusKw = (input.focusKeyword || "").trim().toLowerCase();
  const secondaryKws = (input.secondaryKeywords || [])
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  const slug = (input.slug || "").trim().toLowerCase();
  const plainText = stripHtml(input.bodyHtml || "");
  const plainLower = plainText.toLowerCase();

  const { wordCount, readingTimeMinutes } = calculateWordCount(input.bodyHtml || "");
  const { internalLinks, externalLinks, images } = extractLinksAndImages(input.bodyHtml || "");

  let totalImages = images.length;
  let missingAltCount = images.filter((img) => !img.alt).length;
  if (input.featuredImage) {
    totalImages += 1;
    if (!input.featuredImageAlt || !input.featuredImageAlt.trim()) {
      missingAltCount += 1;
    }
  }

  // Calculate keyword occurrences and density
  let kwCount = 0;
  if (focusKw && plainLower) {
    const escaped = focusKw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = plainLower.match(new RegExp(escaped, "gi"));
    kwCount = matches ? matches.length : 0;
  }
  const kwWords = focusKw ? focusKw.split(/\s+/).length : 1;
  const keywordDensity =
    wordCount > 0 && focusKw
      ? Number((((kwCount * kwWords) / wordCount) * 100).toFixed(2))
      : 0;

  // 1. Focus Keyword Set
  if (!focusKw) {
    checks.push({
      id: "focus-keyword-missing",
      category: "basic",
      status: "fail",
      title: "Focus keyword is not set",
      whyItMatters:
        "Setting a primary focus keyword helps evaluate whether your title, headings, URL, and copy align with user search intent.",
      fixAction: "Add a primary focus keyword in the SEO Panel.",
      targetField: "focusKeyword",
      weight: 10,
    });
  } else {
    checks.push({
      id: "focus-keyword-set",
      category: "basic",
      status: "pass",
      title: `Focus keyword "${input.focusKeyword}" is configured`,
      whyItMatters: "Defines the primary topic for on-page SEO evaluation.",
      fixAction: "Keep focus keyword specific to this page's topic.",
      targetField: "focusKeyword",
      weight: 6,
    });

    // 2. Focus Keyword in SEO Title
    const titleLower = effectiveSeoTitle.toLowerCase();
    if (titleLower.includes(focusKw)) {
      const startsEarly = titleLower.indexOf(focusKw) <= Math.max(15, titleLower.length * 0.35);
      checks.push({
        id: "kw-in-title",
        category: "basic",
        status: startsEarly ? "pass" : "warn",
        title: startsEarly
          ? "Focus keyword appears near the beginning of the SEO title"
          : "Focus keyword is in the SEO title, but could be placed closer to the start",
        whyItMatters:
          "Search engines and users scan the first words of a search result title first.",
        fixAction: startsEarly
          ? "Great placement."
          : "Move the focus keyword closer to the beginning of the SEO title.",
        targetField: "seoTitle",
        weight: 10,
      });
    } else {
      checks.push({
        id: "kw-in-title",
        category: "basic",
        status: "fail",
        title: "Focus keyword does not appear in the SEO title",
        whyItMatters:
          "Including the target keyword in the page title is one of the strongest relevance signals for search users.",
        fixAction: `Include "${input.focusKeyword}" naturally in the SEO title.`,
        targetField: "seoTitle",
        weight: 10,
      });
    }

    // 3. Focus Keyword in Meta Description
    if (metaDesc.toLowerCase().includes(focusKw)) {
      checks.push({
        id: "kw-in-desc",
        category: "basic",
        status: "pass",
        title: "Focus keyword is used in the meta description",
        whyItMatters:
          "Google bolds matching search terms in the snippet description, improving click-through rate.",
        fixAction: "Good job.",
        targetField: "metaDescription",
        weight: 7,
      });
    } else {
      checks.push({
        id: "kw-in-desc",
        category: "basic",
        status: "warn",
        title: "Focus keyword is missing from the meta description",
        whyItMatters:
          "Matching keywords are highlighted in search results, helping searchers see your page is relevant.",
        fixAction: `Incorporate "${input.focusKeyword}" naturally into your meta description.`,
        targetField: "metaDescription",
        weight: 7,
      });
    }

    // 4. Focus Keyword in URL Slug
    const kwSlug = focusKw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const kwTokens = kwSlug.split("-").filter((t) => t.length > 2);
    const slugHasKw =
      slug.includes(kwSlug) ||
      (kwTokens.length > 0 && kwTokens.every((t) => slug.includes(t)));
    checks.push({
      id: "kw-in-slug",
      category: "basic",
      status: slugHasKw ? "pass" : "warn",
      title: slugHasKw
        ? "Focus keyword is present in the URL slug"
        : "Focus keyword is not reflected in the URL slug",
      whyItMatters:
        "Descriptive, keyword-relevant URLs improve user trust and breadcrumb clarity in SERPs.",
      fixAction: slugHasKw
        ? "URL slug is clean and descriptive."
        : `Consider including "${kwSlug}" in the URL slug (if not changing an established URL without a 301 redirect).`,
      targetField: "slug",
      weight: 6,
    });

    // 5. Focus Keyword in First 15% of Content
    const introSlice = plainLower.slice(0, Math.max(350, Math.floor(plainLower.length * 0.15)));
    if (plainLower.length > 0 && introSlice.includes(focusKw)) {
      checks.push({
        id: "kw-in-intro",
        category: "basic",
        status: "pass",
        title: "Focus keyword appears in the opening introduction",
        whyItMatters:
          "Introducing the core topic early reassures readers and search crawlers about the page subject.",
        fixAction: "Well structured introduction.",
        targetField: "bodyHtml",
        weight: 7,
      });
    } else {
      checks.push({
        id: "kw-in-intro",
        category: "basic",
        status: "warn",
        title: "Focus keyword does not appear in the opening paragraph",
        whyItMatters:
          "Mentioning the primary topic early establishes clear topical relevance.",
        fixAction: `Mention "${input.focusKeyword}" in your first paragraph.`,
        targetField: "bodyHtml",
        weight: 7,
      });
    }

    // 6. Focus Keyword in Subheadings (H2/H3)
    const subheadingMatches =
      (input.bodyHtml || "").match(/<h[2-3][^>]*>[\s\S]*?<\/h[2-3]>/gi) || [];
    const subheadingsText = subheadingMatches
      .map((h) => stripHtml(h).toLowerCase())
      .join(" ");
    const kwInSubheading =
      subheadingsText.includes(focusKw) ||
      (kwTokens.length > 1 && kwTokens.some((t) => subheadingsText.includes(t)));

    checks.push({
      id: "kw-in-subheading",
      category: "additional",
      status: kwInSubheading ? "pass" : "warn",
      title: kwInSubheading
        ? "Focus keyword or key terms appear in H2/H3 subheadings"
        : "Focus keyword is not used in any H2 or H3 subheadings",
      whyItMatters:
        "Subheadings structure long-form content and help search engines understand section topics.",
      fixAction: kwInSubheading
        ? "Good heading relevance."
        : "Include your focus keyword or a close variation in at least one H2 or H3 heading.",
      targetField: "bodyHtml",
      weight: 6,
    });

    // 7. Keyword Density
    if (wordCount >= 100) {
      if (kwCount === 0) {
        checks.push({
          id: "kw-density",
          category: "additional",
          status: "fail",
          title: "Focus keyword does not appear in the body content",
          whyItMatters: "Body copy should naturally cover the target topic.",
          fixAction: `Use "${input.focusKeyword}" naturally in the article body.`,
          targetField: "bodyHtml",
          weight: 7,
        });
      } else if (keywordDensity > 3.2) {
        checks.push({
          id: "kw-density",
          category: "additional",
          status: "warn",
          title: `Keyword density is high (${keywordDensity}%, used ${kwCount} times)`,
          whyItMatters:
            "Over-repeating the exact keyword can read unnaturally and trigger keyword-stuffing filters.",
          fixAction: "Replace some repetitions with synonyms or natural phrasing.",
          targetField: "bodyHtml",
          weight: 6,
        });
      } else {
        checks.push({
          id: "kw-density",
          category: "additional",
          status: "pass",
          title: `Natural keyword usage (${kwCount} times, ${keywordDensity}% density)`,
          whyItMatters: "Balanced keyword frequency reads naturally for users.",
          fixAction: "Optimal density.",
          targetField: "bodyHtml",
          weight: 6,
        });
      }
    }
  }

  // 8. Secondary Keywords Check
  if (secondaryKws.length > 0) {
    const usedSecondary = secondaryKws.filter(
      (k) =>
        plainLower.includes(k) ||
        effectiveSeoTitle.toLowerCase().includes(k) ||
        metaDesc.toLowerCase().includes(k)
    );
    checks.push({
      id: "secondary-keywords",
      category: "additional",
      status:
        usedSecondary.length === secondaryKws.length
          ? "pass"
          : usedSecondary.length > 0
          ? "warn"
          : "fail",
      title: `Secondary keywords used: ${usedSecondary.length} of ${secondaryKws.length}`,
      whyItMatters:
        "Related and semantic keywords broaden topical coverage for long-tail queries.",
      fixAction:
        usedSecondary.length === secondaryKws.length
          ? "All secondary keywords are covered."
          : `Include missing secondary keywords: ${secondaryKws
              .filter((k) => !usedSecondary.includes(k))
              .join(", ")}`,
      targetField: "secondaryKeywords",
      weight: 5,
    });
  }

  // 9. SEO Title Presence & Length Guidance
  if (!effectiveSeoTitle) {
    checks.push({
      id: "seo-title-length",
      category: "basic",
      status: "fail",
      title: "SEO title is missing",
      whyItMatters: "Without an SEO title, search results may show an unhelpful or truncated heading.",
      fixAction: "Write a clear, compelling SEO title (typically 40–60 characters).",
      targetField: "seoTitle",
      weight: 10,
    });
  } else if (effectiveSeoTitle.length < 25) {
    checks.push({
      id: "seo-title-length",
      category: "basic",
      status: "warn",
      title: `SEO title is quite short (${effectiveSeoTitle.length} chars)`,
      whyItMatters: "Short titles underutilize valuable SERP space for context and modifiers.",
      fixAction: "Expand the SEO title to 40–60 characters with specifications or brand context.",
      targetField: "seoTitle",
      weight: 7,
    });
  } else if (effectiveSeoTitle.length > 65) {
    checks.push({
      id: "seo-title-length",
      category: "basic",
      status: "warn",
      title: `SEO title may truncate in desktop/mobile SERPs (${effectiveSeoTitle.length} chars)`,
      whyItMatters:
        "Google typically displays ~550–600px (~55–62 characters) before adding an ellipsis.",
      fixAction: "Keep the most important keywords within the first 55–60 characters.",
      targetField: "seoTitle",
      weight: 7,
    });
  } else {
    checks.push({
      id: "seo-title-length",
      category: "basic",
      status: "pass",
      title: `SEO title length is well-balanced (${effectiveSeoTitle.length} chars)`,
      whyItMatters: "Fits comfortably in Google desktop and mobile search snippets.",
      fixAction: "Optimal length.",
      targetField: "seoTitle",
      weight: 8,
    });
  }

  // 10. Meta Description Presence & Length Guidance
  if (!metaDesc) {
    checks.push({
      id: "meta-desc-length",
      category: "basic",
      status: "fail",
      title: "Meta description is missing",
      whyItMatters:
        "A well-written meta description summarizes your page offer and improves organic click-through rate.",
      fixAction: "Add a persuasive meta description (practical guidance: 120–160 characters).",
      targetField: "metaDescription",
      weight: 10,
    });
  } else if (metaDesc.length < 90) {
    checks.push({
      id: "meta-desc-length",
      category: "basic",
      status: "warn",
      title: `Meta description is short (${metaDesc.length} chars)`,
      whyItMatters: "You have room to add technical specs, grades, or a clear call-to-action.",
      fixAction: "Aim for roughly 120–160 characters for a complete search snippet.",
      targetField: "metaDescription",
      weight: 7,
    });
  } else if (metaDesc.length > 170) {
    checks.push({
      id: "meta-desc-length",
      category: "basic",
      status: "warn",
      title: `Meta description exceeds typical snippet length (${metaDesc.length} chars)`,
      whyItMatters: "Descriptions over ~160 characters are often truncated in search results.",
      fixAction: "Front-load key benefits within the first 155 characters.",
      targetField: "metaDescription",
      weight: 7,
    });
  } else {
    checks.push({
      id: "meta-desc-length",
      category: "basic",
      status: "pass",
      title: `Meta description length is optimal (${metaDesc.length} chars)`,
      whyItMatters: "Provides a complete, informative summary in search results.",
      fixAction: "Optimal length.",
      targetField: "metaDescription",
      weight: 8,
    });
  }

  // 11. Content Length / Depth
  const minRecommendedWords = input.contentType === "blog" ? 600 : 250;
  const warnWords = input.contentType === "blog" ? 300 : 120;
  if (wordCount < warnWords) {
    checks.push({
      id: "content-length",
      category: "readability",
      status: "fail",
      title: `Thin content detected (${wordCount} words)`,
      whyItMatters:
        "Comprehensive content that answers technical and buyer questions performs better in organic search.",
      fixAction: `Expand content to at least ${minRecommendedWords}+ words with specifications, applications, or FAQs.`,
      targetField: "bodyHtml",
      weight: 9,
    });
  } else if (wordCount < minRecommendedWords) {
    checks.push({
      id: "content-length",
      category: "readability",
      status: "warn",
      title: `Moderate content length (${wordCount} words)`,
      whyItMatters: `For ${input.contentType || "blog"} content, ${minRecommendedWords}+ words provides deeper topical authority.`,
      fixAction: "Add technical comparisons, tolerances, or buyer FAQs to enrich the article.",
      targetField: "bodyHtml",
      weight: 7,
    });
  } else {
    checks.push({
      id: "content-length",
      category: "readability",
      status: "pass",
      title: `Strong content depth (${wordCount} words, ~${readingTimeMinutes} min read)`,
      whyItMatters: "In-depth coverage helps satisfy technical B2B search intent.",
      fixAction: "Great depth.",
      targetField: "bodyHtml",
      weight: 8,
    });
  }

  // 12. Heading Structure & Hierarchy
  const h2Count = ((input.bodyHtml || "").match(/<h2[\s>]/gi) || []).length;
  const h1InBodyCount = ((input.bodyHtml || "").match(/<h1[\s>]/gi) || []).length;
  if (h1InBodyCount > 1) {
    checks.push({
      id: "heading-hierarchy",
      category: "readability",
      status: "warn",
      title: `Multiple H1 tags found inside article body (${h1InBodyCount})`,
      whyItMatters:
        "The page title already renders as the primary H1. Use H2 and H3 for section headings.",
      fixAction: "Convert body H1 headings to H2 or H3.",
      targetField: "bodyHtml",
      weight: 6,
    });
  } else if (h2Count === 0 && wordCount > 150) {
    checks.push({
      id: "heading-hierarchy",
      category: "readability",
      status: "warn",
      title: "No H2 subheadings found in content",
      whyItMatters:
        "Breaking content into H2/H3 sections improves scannability and enables automatic Table of Contents generation.",
      fixAction: "Add H2 subheadings to divide your article into logical sections.",
      targetField: "bodyHtml",
      weight: 6,
    });
  } else {
    checks.push({
      id: "heading-hierarchy",
      category: "readability",
      status: "pass",
      title: `Clean heading hierarchy (${h2Count} H2 section${h2Count === 1 ? "" : "s"})`,
      whyItMatters: "Structured H2/H3 headings make technical articles easy to scan.",
      fixAction: "Well structured.",
      targetField: "bodyHtml",
      weight: 6,
    });
  }

  // 13. Image Alt Text
  if (totalImages === 0) {
    checks.push({
      id: "image-alt",
      category: "additional",
      status: "warn",
      title: "No featured or inline images added",
      whyItMatters:
        "Visual diagrams, product photos, and specification charts increase engagement and Google Images visibility.",
      fixAction: "Add a featured image or inline product/technical image with descriptive alt text.",
      targetField: "featuredImage",
      weight: 6,
    });
  } else if (missingAltCount > 0) {
    checks.push({
      id: "image-alt",
      category: "additional",
      status: "fail",
      title: `${missingAltCount} of ${totalImages} image(s) missing alt text`,
      whyItMatters:
        "Alt text is essential for screen-reader accessibility and image search indexing.",
      fixAction: "Add descriptive alt text to every image and featured image.",
      targetField: "featuredImageAlt",
      weight: 7,
    });
  } else {
    checks.push({
      id: "image-alt",
      category: "additional",
      status: "pass",
      title: `All ${totalImages} image(s) have descriptive alt text`,
      whyItMatters: "Supports accessibility and Google Image search discovery.",
      fixAction: "Complete.",
      targetField: "featuredImageAlt",
      weight: 7,
    });
  }

  // 14. Internal Links
  if (internalLinks.length === 0) {
    checks.push({
      id: "internal-links",
      category: "additional",
      status: "fail",
      title: "No internal links found in content",
      whyItMatters:
        "Internal links pass authority to product and technical pages and help Google discover related content.",
      fixAction:
        "Use the Internal Link Picker to link to relevant DSP product pages or articles.",
      targetField: "internalLinks",
      weight: 8,
    });
  } else {
    checks.push({
      id: "internal-links",
      category: "additional",
      status: "pass",
      title: `${internalLinks.length} internal link(s) included`,
      whyItMatters: "Strengthens site architecture and guides buyers to product pages.",
      fixAction: "Great internal linking.",
      targetField: "internalLinks",
      weight: 8,
    });
  }

  // 15. External Links / Citations
  checks.push({
    id: "external-links",
    category: "additional",
    status: externalLinks.length > 0 ? "pass" : "warn",
    title:
      externalLinks.length > 0
        ? `${externalLinks.length} external reference link(s) included`
        : "No external reference links (e.g. ISO / DIN / AFBMA standards)",
    whyItMatters:
      "Referencing authoritative industry standards (ISO 3290, DIN 5401, AFBMA) can reinforce technical credibility.",
    fixAction:
      externalLinks.length > 0
        ? "Good external references."
        : "Optionally cite relevant ISO/DIN standard references where helpful.",
    targetField: "bodyHtml",
    weight: 3,
  });

  // 16. Indexability & Canonical Check
  const isNoindex = (input.robots || "").toLowerCase().includes("noindex");
  checks.push({
    id: "indexability",
    category: "technical",
    status: isNoindex ? "warn" : "pass",
    title: isNoindex
      ? "Page is marked 'noindex' (excluded from search engines)"
      : "Page is indexable ('index, follow')",
    whyItMatters:
      "Pages with 'noindex' will not appear in Google search results or XML sitemaps.",
    fixAction: isNoindex
      ? "Change Robots directive to 'index, follow' if this page should rank in Google."
      : "Indexability is properly enabled.",
    targetField: "robots",
    weight: 6,
  });

  // 17. Structured Data (Schema.org)
  checks.push({
    id: "schema-markup",
    category: "technical",
    status: input.schemaType && input.schemaType !== "None" ? "pass" : "warn",
    title:
      input.schemaType && input.schemaType !== "None"
        ? `Structured Data enabled (${input.schemaType} JSON-LD)`
        : "No article/page schema type selected",
    whyItMatters:
      "Schema.org JSON-LD helps search engines understand entities, breadcrumbs, products, and articles.",
    fixAction: "Select Article, BlogPosting, Product, or WebPage schema in the SEO Panel.",
    targetField: "schemaType",
    weight: 5,
  });

  // Calculate weighted score
  let totalWeight = 0;
  let earnedWeight = 0;
  let passedCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  for (const c of checks) {
    totalWeight += c.weight;
    if (c.status === "pass") {
      earnedWeight += c.weight;
      passedCount++;
    } else if (c.status === "warn") {
      earnedWeight += c.weight * 0.5;
      warningCount++;
    } else {
      errorCount++;
    }
  }

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  const grade = score >= 80 ? "good" : score >= 55 ? "ok" : "poor";

  const normalizedChecks: SeoCheckResult[] = checks.map((c) => ({
    ...c,
    label: c.label || c.title,
    message: c.message || c.whyItMatters,
    recommendation: c.recommendation || c.fixAction,
    fieldTarget:
      c.fieldTarget ||
      (c.targetField === "focusKeyword" ||
      c.targetField === "seoTitle" ||
      c.targetField === "metaDescription" ||
      c.targetField === "slug" ||
      c.targetField === "canonicalUrl" ||
      c.targetField === "robots"
        ? (c.targetField as any)
        : c.targetField === "schemaType"
        ? "schema"
        : undefined),
  }));

  return {
    score,
    grade,
    passedCount,
    warningCount,
    errorCount,
    passCount: passedCount,
    warnCount: warningCount,
    failCount: errorCount,
    wordCount,
    readingTimeMinutes,
    internalLinksCount: internalLinks.length,
    externalLinksCount: externalLinks.length,
    imagesCount: totalImages,
    imagesMissingAlt: missingAltCount,
    imagesMissingAltCount: missingAltCount,
    keywordDensity,
    checks: normalizedChecks,
  };
}
