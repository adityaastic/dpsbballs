import Link from "next/link";
import { site } from "@/data/site";

export default function FloatingCTA() {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 sm:bottom-6 sm:right-6">
      <a
        href={`tel:${site.mobile.replace(/\s/g, "")}`}
        className="btn btn-primary shadow-lg"
        aria-label="Call DSP"
      >
        Call
      </a>
      <Link href="/contact" className="btn btn-accent shadow-lg">
        Quote
      </Link>
    </div>
  );
}
