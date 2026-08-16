import Link from "next/link";

const certList = [
  {
    name: "GSCI",
    label: "GSCI Certified",
    sub: "Global Standards Certification",
    src: "/images/certifications/gsci-cert.jpg",
    alt: "GSCI Certification Logo",
  },
  {
    name: "UAF",
    label: "UAF Accredited",
    sub: "Accreditation No: CB-MS-5428",
    src: "/images/certifications/uaf-cert.jpg",
    alt: "United Accreditation Foundation CB-MS-5428",
  },
  {
    name: "IAF",
    label: "IAF Member",
    sub: "Multilateral Recognition Arrangement",
    src: "/images/certifications/iaf-cert.jpg",
    alt: "IAF Multilateral Recognition Arrangement Logo",
  },
];

export default function CertificationBadges({
  className = "",
  showDetails = true,
}: {
  className?: string;
  showDetails?: boolean;
}) {
  return (
    <div
      className={`bg-gradient-to-br from-white to-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 md:p-8 shadow-[var(--shadow-md)] relative overflow-hidden ${className}`}
    >
      <div
        className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--orange)]/10 via-[var(--gold)]/5 to-transparent rounded-full blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[var(--line)]/60">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--orange)]/10 text-[var(--orange-deep)]">
              <span className="w-2 h-2 rounded-full bg-[var(--orange)]" />
              Verified Accreditations
            </span>
            <h3 className="mt-2 font-display text-xl md:text-2xl text-[var(--ink)]">
              ISO 9001:2015 Quality Accreditations
            </h3>
          </div>
          <Link
            href="/quality"
            className="text-xs font-bold uppercase tracking-wider text-[var(--orange-deep)] hover:underline inline-flex items-center gap-1"
          >
            View Standards →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {certList.map((c) => (
            <div
              key={c.name}
              className="group bg-white border border-[var(--line)] hover:border-[var(--orange)]/50 rounded-xl p-4 transition-all duration-300 hover:shadow-[var(--shadow-md)] flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg p-2 flex items-center justify-center bg-white shadow-sm border border-slate-100 mb-3 transition-transform group-hover:scale-105">
                <img
                  src={c.src}
                  alt={c.alt}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              {showDetails && (
                <>
                  <h4 className="font-semibold text-sm text-[var(--ink)]">{c.label}</h4>
                  <p className="mt-1 text-[11px] text-[var(--muted)] leading-tight">{c.sub}</p>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--line)]/60 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <p className="flex items-center gap-1.5 font-medium">
            <span className="text-[var(--orange)]">✓</span>
            Authorized Self-Certification Status with Reputed Global Buyers
          </p>
          <span className="font-semibold text-[var(--ink-soft)]">
            AFBMA · DIN · ISO Standards
          </span>
        </div>
      </div>
    </div>
  );
}

export function CertificationStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`py-6 border-y border-[var(--line)] bg-white/70 backdrop-blur-sm ${className}`}>
      <div className="mx-auto max-w-6xl px-4 md:px-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--orange)] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            Certified Quality & Global Accreditation
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          {certList.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-white border border-[var(--line)] p-1 shadow-xs flex items-center justify-center">
                <img src={c.src} alt={c.alt} className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[var(--ink)] leading-none">{c.name}</p>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
