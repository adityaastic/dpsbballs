import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import NetworkMaps from "@/components/NetworkMaps";
import { getPageContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Network & Locations",
};

export default async function NetworkPage() {
  const pageData = await getPageContent("network");

  return (
    <>
      <PageHero
        eyebrow={pageData?.heroEyebrow || "Network & Locations"}
        title={
          pageData?.heroTitle ||
          "Presence in India & Worldwide Reach"
        }
        description={
          pageData?.heroDescription ||
          "Manufacturing at Baddi Plant with Registered Office in Delhi — supplying precision grade balls to domestic and global buyers."
        }
      />

      <section className="section">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <NetworkMaps />
        </div>
      </section>

      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="border border-[var(--line)] bg-[var(--surface)] p-8 md:p-10 rounded-2xl shadow-sm">
            <h2 className="section-title">Export &amp; Worldwide Supply Chain</h2>
            <p className="section-copy">
              DSP supplies precision balls to reputed OEM and distributor customers across India and
              international markets. Share your destination, AFBMA/DIN/ISO standards and
              custom packing preferences with our sales team for rapid export support.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
