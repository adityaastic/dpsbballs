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

  const storyBody = (typeof pageData?.sections?.[0]?.body === "string" ? pageData.sections[0].body : "") || `
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
              {(pageData?.sections?.[0]?.heading as string) || "Our story"}
            </h2>
            <div className="mt-5 space-y-4 text-[var(--muted)] leading-relaxed">
              {storyBody.split(/\n\n+/).map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
          {pageData?.sections?.[0]?.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={pageData.sections[0].imageUrl as string}
              alt="DSP Precision Leadership & Manufacturing Facility"
              className="rounded-2xl border border-[var(--line)] shadow-md w-full aspect-portrait object-cover"
            />
          ) : (
            <ComingSoon
              label="Leadership / plant image coming soon"
              aspect="portrait"
              className="border border-[var(--line)]"
            />
          )}
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

      {/* Certified Quality & Global Accreditation Highlighted Section */}
      <section className="section bg-gradient-to-b from-[var(--surface)] to-white py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--orange)]/10 text-[var(--orange-deep)] border border-[var(--orange)]/20 shadow-xs mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--orange)] animate-pulse" />
              Certified Quality &amp; Global Accreditation
            </span>
            <h2 className="section-title mt-2">
              ISO 9001:2015 Quality &amp; International Accreditations
            </h2>
            <p className="section-copy mt-3">
              Our precision manufacturing operations adhere strictly to global quality management systems and international accreditation frameworks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* GSCI */}
            <div className="group relative bg-white border border-[var(--line)] rounded-2xl p-6 transition-all duration-300 hover:border-[var(--orange)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1.5 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-xl p-3 bg-white shadow-md border border-slate-100 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/certifications/gsci-cert.jpg"
                  alt="GSCI Certification Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-orange-50 text-[var(--orange-deep)] border border-orange-200/60 mb-2">
                GSCI Certified
              </span>
              <h3 className="font-display text-xl text-[var(--ink)]">GSCI</h3>
              <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                Global Standards Certification
              </p>
              <div className="mt-5 pt-4 border-t border-[var(--line)]/50 w-full text-left text-xs text-[var(--muted)] space-y-1.5">
                <p className="flex items-center gap-2">
                  <span className="text-[var(--orange)] font-bold">✓</span> International Quality Compliance
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[var(--orange)] font-bold">✓</span> Rigorous Audit Certification
                </p>
              </div>
            </div>

            {/* UAF */}
            <div className="group relative bg-white border border-[var(--line)] rounded-2xl p-6 transition-all duration-300 hover:border-[var(--orange)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1.5 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-xl p-3 bg-white shadow-md border border-slate-100 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/certifications/uaf-cert.jpg"
                  alt="United Accreditation Foundation CB-MS-5428"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60 mb-2">
                UAF Accredited
              </span>
              <h3 className="font-display text-xl text-[var(--ink)]">UAF (CB-MS-5428)</h3>
              <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                United Accreditation Foundation CB-MS-5428
              </p>
              <div className="mt-5 pt-4 border-t border-[var(--line)]/50 w-full text-left text-xs text-[var(--muted)] space-y-1.5">
                <p className="flex items-center gap-2">
                  <span className="text-[var(--orange)] font-bold">✓</span> Registered Accreditation CB-MS-5428
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[var(--orange)] font-bold">✓</span> Internationally Recognized
                </p>
              </div>
            </div>

            {/* IAF */}
            <div className="group relative bg-white border border-[var(--line)] rounded-2xl p-6 transition-all duration-300 hover:border-[var(--orange)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1.5 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-xl p-3 bg-white shadow-md border border-slate-100 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/certifications/iaf-cert.jpg"
                  alt="IAF Multilateral Recognition Arrangement Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
                IAF Member
              </span>
              <h3 className="font-display text-xl text-[var(--ink)]">IAF MLA</h3>
              <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                IAF Multilateral Recognition Arrangement
              </p>
              <div className="mt-5 pt-4 border-t border-[var(--line)]/50 w-full text-left text-xs text-[var(--muted)] space-y-1.5">
                <p className="flex items-center gap-2">
                  <span className="text-[var(--orange)] font-bold">✓</span> Multilateral Recognition Arrangement
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[var(--orange)] font-bold">✓</span> Worldwide Buyers Acceptance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
