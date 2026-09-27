import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";
import CareerForm from "@/components/CareerForm";
import PageHero from "@/components/PageHero";
import { getPageContent } from "@/lib/cms";

function isVideo(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageContent("career");
  return {
    title: pageData?.title || "Careers at DSP Precision",
    description:
      pageData?.heroDescription ||
      "Join our precision engineering and manufacturing team at Baddi, Himachal Pradesh. Explore career opportunities at DSP Precision Products.",
  };
}

export default async function CareerPage() {
  const pageData = await getPageContent("career");
  const workplaceMediaUrl =
    (pageData?.sections?.[0]?.videoUrl as string) ||
    (pageData?.sections?.[0]?.imageUrl as string) ||
    "";

  return (
    <>
      <PageHero
        eyebrow={pageData?.heroEyebrow || "Careers"}
        title={pageData?.heroTitle || "Grow with a precision manufacturing team"}
        description={
          pageData?.heroDescription ||
          "Apply online for openings at DSP Precision Products. Share your profile and the role you’re interested in."
        }
      />

      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[0.85fr_1.15fr] md:px-6">
          <div>
            <h2 className="section-title">
              {(pageData?.sections?.[0]?.heading as string) || "Why DSP"}
            </h2>
            <p className="section-copy">
              {(pageData?.sections?.[0]?.body as string) ||
                "Join a company with decades of ball manufacturing expertise, in-house process capability and a quality-first culture at Baddi, Himachal Pradesh."}
            </p>
            {workplaceMediaUrl ? (
              isVideo(workplaceMediaUrl) ? (
                <video
                  src={workplaceMediaUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="mt-6 rounded-xl border border-[var(--line)] w-full aspect-square object-cover"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={workplaceMediaUrl}
                  alt="DSP Workplace"
                  className="mt-6 rounded-xl border border-[var(--line)] w-full aspect-square object-cover"
                />
              )
            ) : (
              <ComingSoon
                label="Team / workplace image coming soon"
                aspect="square"
                className="mt-6 border border-[var(--line)]"
              />
            )}
          </div>
          <div>
            <h2 className="section-title">Apply online</h2>
            <p className="section-copy mb-6">
              Fields marked with * are essential.
            </p>
            <CareerForm />
          </div>
        </div>
      </section>
    </>
  );
}
