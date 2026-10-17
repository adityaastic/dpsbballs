import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { getAllBlogArticles, resolveNextPageMetadata } from "@/lib/seoCms";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return resolveNextPageMetadata({
    entityType: "page",
    entityId: "blog",
    urlPath: "/blog",
    fallbackTitle:
      "Precision Ball Engineering Blog & Metallurgy Guides | Durga Steel & Precision Ball",
    fallbackDescription:
      "Technical engineering articles on AISI 52100 chrome steel balls, ISO 3290 grades (G3 to G1000), stainless steel 304 vs 316L vs 440C selection, bearing tolerances, and industrial applications.",
    fallbackKeywords: [
      "precision ball engineering blog",
      "AISI 52100 chrome steel balls guide",
      "ISO 3290 ball grades chart",
      "stainless steel balls metallurgy",
    ],
  });
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const selectedCategory = sp?.category || "";

  const allArticles = await getAllBlogArticles();
  const now = Date.now();

  // Only show published articles (or scheduled articles whose scheduled time has passed)
  const publishedArticles = allArticles.filter((a) => {
    if (a.status === "published") return true;
    if (
      a.status === "scheduled" &&
      a.scheduledFor &&
      new Date(a.scheduledFor).getTime() <= now
    ) {
      return true;
    }
    return false;
  });

  const categories = Array.from(
    new Set(publishedArticles.map((a) => a.category).filter(Boolean))
  );

  const visibleArticles = selectedCategory
    ? publishedArticles.filter((a) => a.category === selectedCategory)
    : publishedArticles;

  const featuredArticle =
    visibleArticles.find((a) => a.featured) || visibleArticles[0];
  const gridArticles = visibleArticles.filter(
    (a) => a.slug !== featuredArticle?.slug
  );

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
        name: "Engineering Blog & Technical Guides",
        item: "https://www.dspballs.co.in/blog",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHero
        eyebrow="Engineering Knowledge Base"
        title="Precision Ball Metallurgy, ISO 3290 Standards & Application Guides"
        description="In-depth technical resources authored by DSP's metallurgy and quality assurance engineers for bearing, valve, automotive, and industrial buyers."
        ctaHref="/contact"
        ctaLabel="Consult Our Engineers"
      />

      <section className="section">
        <div className="mx-auto max-w-6xl px-4 md:px-6 space-y-10">
          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-5">
              <Link
                href="/blog"
                className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                  !selectedCategory
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Engineering Guides ({publishedArticles.length})
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/blog?category=${encodeURIComponent(cat)}`}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          {/* Featured Hero Article */}
          {featuredArticle && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="lg:col-span-5 bg-slate-100 min-h-[260px] relative overflow-hidden">
                {featuredArticle.featuredImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredArticle.featuredImage}
                    alt={
                      featuredArticle.featuredImageAlt || featuredArticle.title
                    }
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                      ★ Featured Engineering Guide
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                      {featuredArticle.category}
                    </span>
                    <span className="text-slate-500">
                      {featuredArticle.readingTimeMinutes} min read ·{" "}
                      {featuredArticle.wordCount} words
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    <Link
                      href={`/blog/${featuredArticle.slug}`}
                      className="hover:text-amber-700 transition"
                    >
                      {featuredArticle.title}
                    </Link>
                  </h2>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    By{" "}
                    <strong className="text-slate-800">
                      {featuredArticle.authorName}
                    </strong>{" "}
                    · Updated{" "}
                    {new Date(featuredArticle.updatedAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </div>

                  <Link
                    href={`/blog/${featuredArticle.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Read Full Technical Guide →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Remaining Articles */}
          {gridArticles.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gridArticles.map((art) => (
                <article
                  key={art.slug}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition"
                >
                  <div>
                    {art.featuredImage && (
                      <div className="h-48 bg-slate-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={art.featuredImage}
                          alt={art.featuredImageAlt || art.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-amber-700">
                          {art.category}
                        </span>
                        <span>{art.readingTimeMinutes} min read</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        <Link
                          href={`/blog/${art.slug}`}
                          className="hover:text-amber-700 transition"
                        >
                          {art.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {new Date(art.updatedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <Link
                      href={`/blog/${art.slug}`}
                      className="font-semibold text-slate-900 hover:text-amber-700"
                    >
                      Read Article →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
