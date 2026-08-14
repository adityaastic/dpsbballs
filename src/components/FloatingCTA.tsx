"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ─── Minimal Icons ─── */
function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="w-5 h-5" aria-hidden>
      <rect width="20" height="16" x="2" y="4" />
      <path d="m22 7-10 7L2 7" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="w-5 h-5" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

type Props = { mobile: string; whatsapp: string; email: string };

export default function FloatingCTA({ mobile, whatsapp, email }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  const waNum = (whatsapp || mobile).replace(/\D/g, "");
  const waMsg = encodeURIComponent(
    "Hi DSP Precision, I would like to enquire about your precision balls."
  );

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Email */}
      {email && (
        <a
          href={`mailto:${email}`}
          title={email}
          aria-label={`Email: ${email}`}
          className="hidden sm:flex items-center gap-2.5 bg-[#0a0a0a] text-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-[#0a0a0a] hover:bg-[#262626] transition-colors"
        >
          <IconMail />
          <span>Email</span>
        </a>
      )}

      {/* Phone */}
      {mobile && (
        <a
          href={`tel:${mobile.replace(/\s/g, "")}`}
          title={`Call: ${mobile}`}
          aria-label={`Call DSP at ${mobile}`}
          className="flex items-center gap-2.5 bg-[#0a0a0a] text-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-[#0a0a0a] hover:bg-[#262626] transition-colors"
        >
          <IconPhone />
          <span className="hidden sm:inline">Call</span>
        </a>
      )}

      {/* WhatsApp */}
      {waNum && (
        <a
          href={`https://wa.me/${waNum}?text=${waMsg}`}
          target="_blank"
          rel="noreferrer"
          title="Chat on WhatsApp"
          aria-label="WhatsApp DSP Precision"
          className="flex items-center gap-2.5 bg-[#f97316] text-white px-4 py-3 text-xs font-bold uppercase tracking-wider border border-[#f97316] hover:bg-[#c2410c] hover:border-[#c2410c] transition-colors"
        >
          <IconWhatsApp />
          <span>WhatsApp</span>
        </a>
      )}

      {/* Quote */}
      <Link
        href="/contact"
        title="Get a Quote"
        aria-label="Get a Quote"
        className="flex items-center gap-2.5 bg-white text-[#0a0a0a] px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
      >
        <IconChat />
        <span className="hidden sm:inline">Get Quote</span>
      </Link>
    </div>
  );
}
