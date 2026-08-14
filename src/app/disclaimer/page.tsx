import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { getPageContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Disclaimer",
};

export default async function DisclaimerPage() {
  const pageData = await getPageContent("disclaimer");
  const body =
    pageData?.sections?.[0]?.body ||
    `Various information & data provided on this site has been gathered from different catalogues, books, periodicals and related references. We do not claim it to be fully correct and authentic in every respect.

To the best of our knowledge it is correct for the purpose of giving an idea of the quality of our products and only to assist you in choosing a direction. For critical applications, please confirm specifications directly with DSP before ordering.`;

  return (
    <>
      <PageHero
        eyebrow={pageData?.heroEyebrow || "Legal"}
        title={pageData?.heroTitle || "Disclaimer"}
        description={
          pageData?.heroDescription ||
          "Please read this note about the technical information published on this website."
        }
      />

      <section className="section">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="border border-[var(--line)] bg-white p-8 leading-relaxed text-[var(--muted)]">
            {body.split(/\n\n+/).map((p: string, i: number) => (
              <p key={i} className={i > 0 ? "mt-4" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
