import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";
import PageHero from "@/components/PageHero";
import { getPageContent, getTechnical } from "@/lib/cms";
import type { ClientTestimonial } from "@/data/technical";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageContent("clients");
  return {
    title: pageData?.title || "Client Appreciation",
    description:
      pageData?.heroDescription ||
      "Feedback from customers who rely on DSP for consistent quality, on-time supply and dependable communication.",
  };
}

export default async function ClientsPage() {
  const [pageData, tech] = await Promise.all([
    getPageContent("clients"),
    getTechnical(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={pageData?.heroEyebrow || "Client appreciation"}
        title={
          pageData?.heroTitle ||
          "Trusted by first-time and repeat buyers"
        }
        description={
          pageData?.heroDescription ||
          "Feedback from customers who rely on DSP for consistent quality, on-time supply and dependable communication."
        }
      />

      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:px-6">
          {(tech.clientTestimonials as (ClientTestimonial & { imageUrl?: string })[]).map((item, i: number) => (
            <article
              key={i}
              className="grid gap-6 border border-[var(--line)] bg-white p-6 md:grid-cols-[1fr_0.7fr] md:p-8 rounded-xl items-center"
            >
              <div>
                <p className="eyebrow" style={{ color: "var(--copper)" }}>
                  {item.type}
                </p>
                <blockquote className="mt-4 text-lg leading-relaxed text-[var(--ink)] md:text-xl">
                  “{item.quote}”
                </blockquote>
                <p className="mt-5 font-display text-xl text-[var(--steel-deep)]">
                  {item.author}
                </p>
                <p className="text-sm text-[var(--muted)]">{item.role}</p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                  {item.detail}
                </p>
              </div>
              {item.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.imageUrl}
                  alt={`${item.author} appreciation`}
                  className="rounded-lg border border-[var(--line)] w-full aspect-square object-cover"
                />
              ) : (
                <ComingSoon
                  label="Client letter / photo coming soon"
                  aspect="square"
                  className="border border-[var(--line)]"
                />
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
