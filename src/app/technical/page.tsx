import type { Metadata } from "next";
import Link from "next/link";
import {
  ExperiencedBuyerForm,
  NewBuyerForm,
} from "@/components/BuyerForms";
import ComingSoon from "@/components/ComingSoon";
import PageHero from "@/components/PageHero";
import { getTechnical } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Technical Helpdesk",
};

export default async function TechnicalPage() {
  const data = await getTechnical();

  return (
    <>
      <PageHero
        eyebrow="Helpdesk"
        title="Technical data & buying support"
        description="Material comparison, manufacturing process overview, and enquiry forms for new or experienced ball buyers."
        ctaHref="/docs/catalogue.pdf"
        ctaLabel="Download catalogue"
      />

      <section className="section">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="section-title">Material comparison</h2>
          <p className="section-copy">{data.materialComparison.intro}</p>
          <div className="mt-8 overflow-x-auto">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Best for</th>
                  <th>Strengths</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.materialComparison.rows.map((row: any, i: number) => (
                  <tr key={i}>
                    <td>{row.material}</td>
                    <td>{row.bestFor}</td>
                    <td>{row.strengths}</td>
                    <td>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/quality#grades" className="btn btn-primary">
              ISO grades
            </Link>
            <Link
              href="/quality"
              className="btn btn-primary"
              style={{
                background: "transparent",
                color: "var(--steel-deep)",
                borderColor: "var(--line)",
              }}
            >
              Packing standard
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="section-title">Manufacturing process</h2>
          <p className="section-copy">
            Typical precision ball process flow used across DSP product lines.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.manufacturingProcess.map((item: any, i: number) => (
              <div
                key={i}
                className="border border-[var(--line)] bg-white p-5"
              >
                <p className="font-display text-2xl text-[var(--copper)]">
                  {item.step}
                </p>
                <h3 className="mt-2 font-display text-xl text-[var(--ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="section-title">Ceramics vs steels — property snapshot</h2>
          <p className="section-copy">
            High-level comparison to help shortlist ceramic or steel options.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  {data.ceramicCompareHeaders.map((h: string, i: number) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.ceramicCompareRows.map((row: any[], i: number) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ComingSoon
            label="Technical chart graphic coming soon"
            aspect="wide"
            className="mt-8 border border-[var(--line)]"
          />
        </div>
      </section>

      <section id="enquiry" className="section bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="section-title">Raise a technical enquiry</h2>
          <p className="section-copy mb-8">
            Choose the form that matches you. Submissions open your email client
            addressed to sales@dspballs.in with the filled details.
          </p>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 font-display text-2xl text-[var(--ink)]">
                New ball buyer
              </h3>
              <NewBuyerForm />
            </div>
            <div>
              <h3 className="mb-4 font-display text-2xl text-[var(--ink)]">
                Experienced buyer
              </h3>
              <ExperiencedBuyerForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
