import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";
import ContactForm from "@/components/ContactForm";
import PageHero from "@/components/PageHero";
import { getPageContent, getSiteData } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default async function ContactPage() {
  const [pageData, { site }] = await Promise.all([
    getPageContent("contact"),
    getSiteData(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={pageData?.heroEyebrow || "Contact"}
        title={pageData?.heroTitle || "Talk to our sales team"}
        description={
          pageData?.heroDescription ||
          "Share your requirement for sizes, grades and materials. We respond from sales@dspballs.in."
        }
      />

      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
          <div className="space-y-6">
            <div className="border border-[var(--line)] bg-white p-6">
              <p className="eyebrow" style={{ color: "var(--copper)" }}>
                {site.workOffice.label}
              </p>
              <div className="mt-3 space-y-1 text-[var(--muted)]">
                {site.workOffice.lines.map((line: string, i: number) => (
                  <p key={i}>{line}</p>
                ))}
                <p className="pt-2 text-[var(--ink)]">Phone: {site.phoneWork}</p>
                <p>
                  Email:{" "}
                  <a
                    className="text-[var(--steel)] hover:underline"
                    href={`mailto:${site.email}`}
                  >
                    {site.email}
                  </a>
                </p>
              </div>
            </div>

            <div className="border border-[var(--line)] bg-white p-6">
              <p className="eyebrow" style={{ color: "var(--copper)" }}>
                {site.regdOffice.label}
              </p>
              <div className="mt-3 space-y-1 text-[var(--muted)]">
                {site.regdOffice.lines.map((line: string, i: number) => (
                  <p key={i}>{line}</p>
                ))}
                <p className="pt-2 text-[var(--ink)]">Phone: {site.phoneRegd}</p>
                <p>Fax / Phone: {site.phoneFax}</p>
                <p>Mobile: {site.mobile}</p>
                <p>
                  Email:{" "}
                  <a
                    className="text-[var(--steel)] hover:underline"
                    href={`mailto:${site.email}`}
                  >
                    {site.email}
                  </a>
                </p>
              </div>
            </div>

            <ComingSoon
              label="Map / office photo coming soon"
              aspect="wide"
              className="border border-[var(--line)]"
            />
          </div>

          <div>
            <h2 className="section-title">Enquiry form</h2>
            <p className="section-copy mb-6">
              Fields marked with * are essential. We’ll use this to prepare a
              quote.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
