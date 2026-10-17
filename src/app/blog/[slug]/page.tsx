import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogArticles,
  getBlogArticleBySlug,
  resolveNextPageMetadata,
} from "@/lib/seoCms";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);
  if (!article) {
    return { title: "Article Not Found" };
  }

  return resolveNextPageMetadata({
    entityType: "blog",
    entityId: article.slug,
    urlPath: `/blog/${article.slug}`,
    fallbackTitle: article.seo?.seoTitle || article.title,
    fallbackDescription: article.seo?.metaDescription || article.excerpt,
    fallbackImage: article.seo?.ogImage || article.featuredImage,
    fallbackKeywords: [
      article.seo?.focusKeyword,
      ...(article.seo?.secondaryKeywords || []),
      ...(article.tags || []),
    ].filter(Boolean),
  });
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);
  if (!article) notFound();

  const isScheduledReady =
    article.status === "scheduled" &&
    article.scheduledFor &&
    new Date(article.scheduledFor).getTime() <= Date.now();

  if (article.status !== "published" && !isScheduledReady) {
    const adminSession = await verifySession();
    if (!adminSession) {
      notFound();
    }
  }

  const allArticles = await getAllBlogArticles();
  const relatedArticles = allArticles
    .filter(
      (a) =>
        a.slug !== article.slug &&
        a.status === "published" &&
        ((article.relatedSlugs || []).includes(a.slug) ||
          a.category === article.category)
    )
    .slice(0, 3);

  const canonicalUrl =
    article.seo?.canonicalUrl ||
    `https://www.dspballs.co.in/blog/${article.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": article.seo?.schemaType || "TechArticle",
    headline: article.seo?.seoTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
    image: article.featuredImage
      ? article.featuredImage.startsWith("http")
        ? article.featuredImage
        : `https://www.dspballs.co.in${article.featuredImage}`
      : "https://www.dspballs.co.in/images/infrastructure/building-front-view.jpg",
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    wordCount: article.wordCount,
    articleSection: article.category,
    keywords: [
      article.seo?.focusKeyword,
      ...(article.seo?.secondaryKeywords || []),
      ...(article.tags || []),
    ]
      .filter(Boolean)
      .join(", "),
    author: {
      "@type": "Organization",
      name: article.authorName || "DSP Metallurgy & Quality Engineering Team",
      url: "https://www.dspballs.co.in/about",
    },
    publisher: {
      "@type": "Organization",
      name: "Durga Steel & Precision Ball (DSP Precision Products Pvt. Ltd.)",
      logo: {
        "@type": "ImageObject",
        url: "https://www.dspballs.co.in/images/brand/dsp-logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.dspballs.co.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Engineering Blog",
        item: "https://www.dspballs.co.in/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.seo?.breadcrumbTitle || article.title,
        item: canonicalUrl,
      },
    ],
  };

  const faqItems = (article.seo?.faqItems || []).filter(
    (f) => f.question?.trim() && f.answer?.trim()
  );

  const faqSchema =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Draft Banner for Admins */}
      {article.status !== "published" && (
        <div className="bg-amber-500 text-slate-950 text-xs font-bold py-2.5 px-4 text-center">
          ADMIN PREVIEW MODE — This article is currently in &ldquo;
          {article.status.toUpperCase()}&rdquo; state and hidden from public
          visitors &amp; XML sitemaps.{" "}
          <Link
            href={`/admin/blog/${article.slug}`}
            className="underline ml-2"
          >
            Edit in Admin Console →
          </Link>
        </div>
      )}

      {/* Article Header */}
      <section className="bg-slate-900 text-white py-14 border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-4 md:px-6 space-y-5">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs text-slate-400"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white">
              Engineering Blog
            </Link>
            <span>/</span>
            <span className="text-amber-400 font-medium line-clamp-1">
              {article.seo?.breadcrumbTitle || article.title}
            </span>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              {article.category}
            </span>
            <span className="text-slate-300">
              ⏱ {article.readingTimeMinutes} min read ({article.wordCount}{" "}
              words)
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">
              Published{" "}
              {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            {article.updatedAt !== article.publishedAt && (
              <>
                <span className="text-slate-500">·</span>
                <span className="text-emerald-400">
                  Updated{" "}
                  {new Date(article.updatedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-white">
            {article.title}
          </h1>

          {article.customIntro && (
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl border-l-4 border-amber-500 pl-4">
              {article.customIntro}
            </p>
          )}

          <div className="pt-2 flex items-center gap-3 text-xs text-slate-300">
            <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">
              DSP
            </div>
            <div>
              <div className="font-semibold text-white">
                {article.authorName}
              </div>
              <div className="text-slate-400">{article.authorRole}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Sidebar */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left/Main Column */}
          <div className="lg:col-span-8 space-y-8">
            {article.featuredImage && (
              <figure className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.featuredImage}
                  alt={article.featuredImageAlt || article.title}
                  title={article.featuredImageTitle || article.title}
                  className="w-full max-h-[420px] object-cover"
                />
                {article.featuredImageCaption && (
                  <figcaption className="px-4 py-2.5 text-xs text-slate-600 bg-slate-100 border-t border-slate-200">
                    {article.featuredImageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Mobile Table of Contents */}
            {article.tableOfContents && article.tableOfContents.length > 0 && (
              <div className="lg:hidden p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                  Table of Contents
                </div>
                <ul className="space-y-1.5 text-sm">
                  {article.tableOfContents.map((t) => (
                    <li
                      key={t.id}
                      style={{ paddingLeft: `${(t.level - 2) * 14}px` }}
                    >
                      <a
                        href={`#${t.id}`}
                        className="text-slate-700 hover:text-amber-700 font-medium"
                      >
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article HTML Body */}
            <article
              className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-xl prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-amber-700 prose-a:font-semibold hover:prose-a:underline prose-table:w-full prose-table:border-collapse prose-th:bg-slate-900 prose-th:text-white prose-th:p-3 prose-th:text-left prose-th:text-xs prose-td:p-3 prose-td:border prose-td:border-slate-200 prose-td:text-sm prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50/60 prose-blockquote:p-4 prose-blockquote:rounded-r-xl"
              dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
            />

            {/* FAQ Section (Rendered when FAQ Schema items exist) */}
            {faqItems.length > 0 && (
              <div className="pt-8 border-t border-slate-200 space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Frequently Asked Engineering Questions
                </h2>
                <div className="space-y-3">
                  {faqItems.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200"
                    >
                      <h3 className="text-base font-bold text-slate-900">
                        {faq.question}
                      </h3>
                      <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {(article.tags || []).length > 0 && (
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase text-slate-500 mr-1">
                  Topics:
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Sticky Sidebar: TOC + Technical Consultation Box + Related Articles */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {article.tableOfContents &&
                article.tableOfContents.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                      In This Engineering Guide
                    </div>
                    <ul className="space-y-2 text-xs">
                      {article.tableOfContents.map((t) => (
                        <li
                          key={t.id}
                          style={{ paddingLeft: `${(t.level - 2) * 12}px` }}
                        >
                          <a
                            href={`#${t.id}`}
                            className="text-slate-600 hover:text-amber-700 font-medium block leading-snug"
                          >
                            {t.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  ISO 9001:2015 Certified Manufacturer
                </div>
                <h3 className="text-lg font-bold leading-snug">
                  Need Custom Grade or Diameter Precision Balls?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  DSP manufactures Chrome Steel (AISI 52100), Stainless Steel
                  (304, 316L, 420, 440C), Ceramic, Carbide, and Brass balls from
                  0.5 mm to 150 mm with full material test certificates.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    href="/contact"
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-center rounded-xl text-xs font-semibold transition"
                  >
                    Request Technical Quote →
                  </Link>
                  <Link
                    href="/products"
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-center rounded-xl text-xs font-semibold transition"
                  >
                    Browse Product Catalogue
                  </Link>
                </div>
              </div>

              {relatedArticles.length > 0 && (
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Related Technical Articles
                  </div>
                  <div className="divide-y divide-slate-100">
                    {relatedArticles.map((rel) => (
                      <Link
                        key={rel.slug}
                        href={`/blog/${rel.slug}`}
                        className="block py-2.5 group"
                      >
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-amber-700 transition line-clamp-2">
                          {rel.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {rel.readingTimeMinutes} min read · {rel.category}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
