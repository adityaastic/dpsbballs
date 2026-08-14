import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";
import PageHero from "@/components/PageHero";
import { getPageContent, getSiteData } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Network",
};

export default async function NetworkPage() {
  const [pageData, { site }] = await Promise.all([
    getPageContent("network"),
    getSiteData(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={pageData?.heroEyebrow || "Network"}
        title={
          pageData?.heroTitle ||
          "Presence in India & worldwide reach"
        }
        description={
          pageData?.heroDescription ||
          "Manufacturing at Baddi with a registered office in Delhi — supplying customers across India and export markets."
        }
      />

      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 md:px-6">
          <article className="border border-[var(--line)] bg-white p-7">
            <p className="eyebrow" style={{ color: "var(--copper)" }}>
              Network in India
            </p>
            <h2 className="mt-3 font-display text-2xl text-[var(--ink)]">
              Baddi plant
            </h2>
            <div className="mt-4 space-y-1 text-[var(--muted)]">
              {site.workOffice.lines.map((line: string, i: number) => (
                <p key={i}>{line}</p>
              ))}
              <p className="pt-2 text-[var(--ink)]">Phone: {site.phoneWork}</p>
              <p>
                Email:{" "}
                <a href={`mailto:${site.email}`} className="text-[var(--steel)]">
                  {site.email}
                </a>
              </p>
            </div>
            <ComingSoon
              label="India network map coming soon"
              aspect="wide"
              className="mt-6 border border-[var(--line)]"
            />
          </article>

          <article className="border border-[var(--line)] bg-white p-7">
            <p className="eyebrow" style={{ color: "var(--copper)" }}>
              Registered office
            </p>
            <h2 className="mt-3 font-display text-2xl text-[var(--ink)]">
              Delhi
            </h2>
            <div className="mt-4 space-y-1 text-[var(--muted)]">
              {site.regdOffice.lines.map((line: string, i: number) => (
                <p key={i}>{line}</p>
              ))}
              <p className="pt-2 text-[var(--ink)]">Phone: {site.phoneRegd}</p>
              <p>Fax / Phone: {site.phoneFax}</p>
              <p>Mobile: {site.mobile}</p>
              <p>
                Email:{" "}
                <a href={`mailto:${site.email}`} className="text-[var(--steel)]">
                  {site.email}
                </a>
              </p>
            </div>
            <ComingSoon
              label="World network map coming soon"
              aspect="wide"
              className="mt-6 border border-[var(--line)]"
            />
          </article>
        </div>
      </section>

      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="border border-[var(--line)] bg-[var(--surface)] p-8 md:p-10">
            <h2 className="section-title">Export & worldwide supply</h2>
            <p className="section-copy">
              DSP supplies precision balls to customers across India and
              international markets. Share your destination, standards and
              packing preferences with our sales team for export support.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
