import type { Metadata } from "next";
import Link from "next/link";
import ComingSoon from "@/components/ComingSoon";
import PageHero from "@/components/PageHero";
import { getPageContent, getProducts, getSiteData } from "@/lib/cms";

export const metadata: Metadata = {
  title: "About Us",
};

export default async function AboutPage() {
  const [pageData, products, { site }] = await Promise.all([
    getPageContent("about"),
    getProducts(),
    getSiteData(),
  ]);

  const storyBody = pageData?.sections?.[0]?.body || `
DSP is one of the leading manufacturers of precision grade balls from high carbon steel & chrome steel, stainless steels, brass, copper, silver, tungsten carbide, ceramics and other materials against specific demand (glass, plastic, nitride and more).

Products are made as per AFBMA, DIN & ISO grades — and as asked by customers, either from product drawings or after understanding technical requirements. We bring more than 25 years of focused experience in these products.

The unit was established in 1995 by Mr. Yashpal Verma, Chairman of the company. An engineer by profession, he has over 45 years of experience in ball production and was part of the team that started the first three ball manufacturing plants in India.

The company is certified for ISO 9001 and is situated in the foothills of the Himalayas at Baddi, Himachal Pradesh. DSP is proud to hold authorised "Self-Certification" of product quality from valued customers who themselves are certified for QS 9000 & TS 16949, with vendor evaluation ratings over 90% from companies of international repute.
`;

  return (
    <>
      <PageHero
        eyebrow={pageData?.heroEyebrow || "About DSP"}
        title={
          pageData?.heroTitle ||
          "Precision manufacturing from the foothills of the Himalayas"
        }
        description={
          pageData?.heroDescription ||
          "DSP Precision Products Pvt. Ltd. manufactures and exports precision grade balls for bearing, gauging and industrial applications worldwide."
        }
      />

      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:px-6">
          <div>
            <h2 className="section-title">
              {pageData?.sections?.[0]?.heading || "Our story"}
            </h2>
            <div className="mt-5 space-y-4 text-[var(--muted)] leading-relaxed">
              {storyBody.split(/\n\n+/).map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
          <ComingSoon
            label="Leadership / plant image coming soon"
            aspect="portrait"
            className="border border-[var(--line)]"
          />
        </div>
      </section>

      <section className="section bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="section-title">What we manufacture</h2>
          <p className="section-copy">
            A complete range of precision balls and allied products.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="flex items-center gap-3 border border-[var(--line)] bg-white px-4 py-3 transition hover:border-[var(--steel)]"
              >
                <span className="font-display text-lg text-[var(--copper)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-medium text-[var(--ink)]">{p.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
