import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";
import PageHero from "@/components/PageHero";
import { getPageContent, getSiteData } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Quality",
};

const gradeRows = [
  ["3", "±5", "0.13", "0.500", "0.2", "0.1", "0.08", "0.080", "0.012"],
  ["5", "±5", "0.25", "1.000", "0.4", "0.2", "0.13", "0.130", "0.020"],
  ["10", "±9", "0.50", "1.000", "0.4", "0.2", "0.25", "0.250", "0.025"],
  ["16", "±10", "0.80", "2.000", "0.8", "0.4", "0.40", "0.400", "0.032"],
  ["20", "±10", "1.00", "2.000", "0.8", "0.4", "0.50", "0.500", "0.040"],
  ["28", "±12", "1.40", "2.000", "0.8", "0.4", "0.70", "0.700", "0.050"],
  ["40", "±16", "2.00", "4.000", "1.6", "0.8", "1.00", "1.000", "0.080"],
  ["100", "±40", "5.00", "10.000", "4.0", "2.0", "2.50", "2.500", "0.125"],
  ["200", "±60", "10.00", "15.000", "6.0", "3.0", "5.00", "5.000", "0.200"],
];

const packingRows = [
  ["1.50 – 1.59", "20,000", "8", "Small"],
  ["1.59 – 2.00", "20,000", "8", "Small"],
  ["2.00 – 2.25", "10,000", "8", "Small"],
  ["2.25 – 2.38", "10,000", "6", "Small"],
  ["2.50 – 3.00", "10,000", "5", "Small"],
  ["3.00 – 3.18", "12,500", "2", "Medium"],
  ["3.50 – 3.97", "10,000", "2", "Medium"],
  ["4.00 – 4.50", "12,500", "1", "Big"],
  ["5.00 – 5.50", "7,000", "1", "Big"],
  ["6.00 – 6.35", "4,000", "1", "Big"],
  ["8.00 – 8.10", "1,500", "1", "Big"],
  ["9.53 – 10.00", "1,000", "1", "Big"],
  ["15.88 – 16.00", "200", "1", "Big"],
  ["16.10 – 25.00", "50", "1", "Big"],
];

export default async function QualityPage() {
  const [pageData] = await Promise.all([
    getPageContent("quality"),
    getSiteData(),
  ]);

  const policy =
    pageData?.sections?.[0]?.body ||
    "We at DSP Precision Products Pvt. Ltd. are committed to manufacture and supply Precision Balls of consistent quality, meeting customer needs through continual improvement of Quality Management System by our dedicated team work.";

  return (
    <>
      <PageHero
        eyebrow={pageData?.heroEyebrow || "Quality circle"}
        title={pageData?.heroTitle || "Standards you can measure"}
        description={
          pageData?.heroDescription ||
          "ISO-aligned grading, disciplined packing and a clear quality policy — built around customer technical needs."
        }
      />

      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:px-6">
          <div>
            <h2 className="section-title">Quality policy</h2>
            <blockquote className="mt-5 border-l-4 border-[var(--copper)] bg-white p-6 text-lg leading-relaxed text-[var(--ink)]">
              “{policy}”
            </blockquote>
            <ul className="feature-list mt-6">
              <li>ISO 9001 certified systems</li>
              <li>Self-certification status with reputed customers</li>
              <li>Manufacturing to AFBMA / DIN / ISO</li>
              <li>Customer drawings & special grades supported</li>
            </ul>
          </div>
          <ComingSoon
            label="ISO certificate image coming soon"
            aspect="square"
            className="border border-[var(--line)]"
          />
        </div>
      </section>

      <section id="grades" className="section bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="section-title">ISO 3290 — Standard grades & tolerances</h2>
          <p className="section-copy">
            Reference grades and tolerances (Indian Standards alignment). Values
            are indicative for selection guidance.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Basic Dia Tol.</th>
                  <th>Lot Variation</th>
                  <th>Gauge Interval</th>
                  <th>Sub Gauge</th>
                  <th>Sub Gauge Int.</th>
                  <th>Ball Dia Var.</th>
                  <th>Spherical Form</th>
                  <th>Surface Roughness</th>
                </tr>
              </thead>
              <tbody>
                {gradeRows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="section-title">Packing standard</h2>
          <p className="section-copy">
            Typical pack quantities by ball size. Custom packing available on
            request.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Size range (mm)</th>
                  <th>Balls per pack</th>
                  <th>Packets per box</th>
                  <th>Bag type</th>
                </tr>
              </thead>
              <tbody>
                {packingRows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="border border-[var(--line)] bg-white p-6">
              <h3 className="font-display text-xl text-[var(--ink)]">
                Material selection tip
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                There are two main technical considerations when purchasing
                balls: (1) type of material, and (2) dimensional accuracy
                required. Contact us with your application for a recommended
                grade.
              </p>
            </div>
            <ComingSoon
              label="Packing / QC image coming soon"
              aspect="wide"
              className="border border-[var(--line)]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
