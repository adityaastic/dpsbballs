"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ─── SVG Icons ─────────────────────────────────────────── */

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
      {/* Green circle bg */}
      <circle cx="16" cy="16" r="16" fill="url(#wa-bg)" />
      <defs>
        <radialGradient id="wa-bg" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#60d976" />
          <stop offset="100%" stopColor="#1da851" />
        </radialGradient>
      </defs>
      {/* Official WA phone path */}
      <path
        d="M22.9 19.7c-.3-.2-2-.97-2.31-1.08-.31-.11-.53-.17-.76.17-.23.34-.87 1.08-1.07 1.3-.2.22-.39.25-.72.08-.34-.17-1.42-.52-2.7-1.66-1-.88-1.67-1.97-1.87-2.3-.19-.33-.02-.51.15-.68.15-.15.34-.39.5-.59.17-.19.22-.33.34-.56.11-.22.05-.42-.03-.59-.08-.17-.76-1.82-1.04-2.49-.27-.65-.55-.56-.76-.57l-.64-.01c-.22 0-.58.08-.89.42-.3.34-1.17 1.14-1.17 2.78 0 1.64 1.2 3.22 1.37 3.44.17.22 2.36 3.6 5.72 5.05.8.34 1.43.55 1.91.7.8.26 1.53.22 2.11.13.64-.1 1.98-.81 2.26-1.59.28-.78.28-1.45.19-1.59-.08-.14-.3-.22-.63-.39Z"
        fill="white"
      />
      <path
        d="M16 4.5C9.65 4.5 4.5 9.65 4.5 16c0 2.04.55 3.95 1.5 5.6L4.5 27.5l6.08-1.59A11.42 11.42 0 0 0 16 27.5c6.35 0 11.5-5.15 11.5-11.5S22.35 4.5 16 4.5Zm0 1.8a9.7 9.7 0 0 1 9.7 9.7 9.7 9.7 0 0 1-9.7 9.7 9.67 9.67 0 0 1-5.18-1.5l-.37-.23-3.82 1 1.02-3.72-.24-.38A9.66 9.66 0 0 1 6.3 16 9.7 9.7 0 0 1 16 6.3Z"
        fill="white"
        opacity="0.92"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="url(#ph-bg)" />
      <defs>
        <radialGradient id="ph-bg" cx="30%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#4a9fc8" />
          <stop offset="100%" stopColor="#0a2535" />
        </radialGradient>
      </defs>
      {/* Phone handset */}
      <path
        d="M10.8 13.1c.9 1.8 2.2 3.5 3.8 4.8a13 13 0 0 0 4.7 2.7l1.8-1.8c.2-.2.5-.28.75-.15.9.3 1.88.47 2.88.47.42 0 .75.34.75.75v3.38c0 .42-.33.75-.75.75C14.6 24 8 17.4 8 9.25c0-.42.33-.75.75-.75h3.38c.42 0 .75.33.75.75 0 1.01.17 2 .47 2.88.1.25 0 .53-.18.73L10.8 13.1Z"
        fill="white"
      />
      {/* Signal arcs */}
      <path d="M19.5 9a5.5 5.5 0 0 1 5.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
      <path d="M19.5 12a2.5 2.5 0 0 1 2.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="url(#ml-bg)" />
      <defs>
        <linearGradient id="ml-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
      </defs>
      <rect x="8" y="11" width="16" height="11" rx="2" stroke="white" strokeWidth="1.4" fill="none"/>
      <path d="M8 13l8 5.5L24 13" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="url(#ct-bg)" />
      <defs>
        <linearGradient id="ct-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c06828" />
          <stop offset="100%" stopColor="#7a3d15" />
        </linearGradient>
      </defs>
      <path d="M22 10H10a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8l4 3v-3a2 2 0 0 0 0-2V12a2 2 0 0 0-2-2Z"
        stroke="white" strokeWidth="1.4" fill="rgba(255,255,255,0.12)" strokeLinejoin="round"/>
      <path d="M12 15h8M12 18h5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Pulse Ring ─────────────────────────────────────────── */
function PulseRing({ color, delay = "0s" }: { color: string; delay?: string }) {
  return (
    <span
      aria-hidden
      className="absolute inset-0 rounded-full"
      style={{
        background: color,
        animation: `pulse-ring 2.8s cubic-bezier(0.2,0.6,0.4,1) ${delay} infinite`,
      }}
    />
  );
}

/* ─── Props ──────────────────────────────────────────────── */
type Props = { mobile: string; whatsapp: string; email: string };

export default function FloatingCTA({ mobile, whatsapp, email }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 600);
    return () => clearTimeout(t);
  }, []);

  const waNum = (whatsapp || mobile).replace(/\D/g, "");
  const waMsg = encodeURIComponent(
    "Hi DSP Precision, I would like to enquire about your precision balls."
  );

  const base =
    "group flex items-center rounded-full overflow-hidden cursor-pointer select-none transition-all duration-300";

  return (
    <>
      <style>{`
        @keyframes pop-in {
          0%   { opacity:0; transform: scale(0.3) translateY(50px); }
          60%  { opacity:1; transform: scale(1.07) translateY(-6px);}
          80%  { transform: scale(0.96) translateY(2px); }
          100% { opacity:1; transform: scale(1) translateY(0);      }
        }
        @keyframes pulse-ring {
          0%   { opacity: 0.55; transform: scale(1);   }
          80%  { opacity: 0;    transform: scale(2.05);}
          100% { opacity: 0;    transform: scale(2.05);}
        }
        @keyframes wa-bounce {
          0%,100%{ transform: rotate(0deg) scale(1);    }
          25%    { transform: rotate(-14deg) scale(1.12);}
          50%    { transform: rotate(11deg) scale(1.07); }
          75%    { transform: rotate(-6deg) scale(1.09); }
        }
        @keyframes ph-ring {
          0%,100%{ transform: rotate(0deg);  }
          15%    { transform: rotate(-20deg);}
          35%    { transform: rotate(17deg); }
          50%    { transform: rotate(-11deg);}
          65%    { transform: rotate(7deg);  }
          80%    { transform: rotate(0deg);  }
        }
        .cta-wa:hover .wa-ico { animation: wa-bounce 0.72s ease forwards; }
        .cta-ph:hover .ph-ico { animation: ph-ring  0.80s ease forwards; }

        /* Expand label on hover */
        .cta-lbl {
          max-width: 0;
          overflow: hidden;
          opacity: 0;
          white-space: nowrap;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          transition: max-width 0.38s cubic-bezier(.34,1.56,.64,1),
                      opacity 0.3s ease,
                      padding 0.32s cubic-bezier(.34,1.56,.64,1);
          padding-right: 0;
        }
        .group:hover .cta-lbl {
          max-width: 9rem;
          opacity: 1;
          padding-left: 0.55rem;
          padding-right: 1.1rem;
        }

        /* Pop-in */
        .cta-item { opacity: 0; }
        .cta-item.visible { animation: pop-in 0.65s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <div className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-3">

        {/* ── Email (desktop only) ── */}
        <a
          href={`mailto:${email}`}
          title={email}
          aria-label={`Email: ${email}`}
          className={`${base} cta-item${show ? " visible" : ""} shadow-[0_8px_30px_rgba(17,24,39,0.40)] hover:shadow-[0_14px_40px_rgba(17,24,39,0.55)] hover:-translate-y-1 hidden sm:flex`}
          style={{ animationDelay: "0.7s", background: "linear-gradient(135deg,#7c2d12,#3d0f00)" }}
        >
          <span className="flex items-center justify-center w-12 h-12 shrink-0">
            <span className="w-7 h-7"><IconMail /></span>
          </span>
          <span className="cta-lbl text-white">Email us</span>
        </a>

        {/* ── Phone ── */}
        {mobile && (
          <a
            href={`tel:${mobile.replace(/\s/g, "")}`}
            title={`Call: ${mobile}`}
            aria-label={`Call DSP at ${mobile}`}
            className={`${base} cta-ph cta-item${show ? " visible" : ""} shadow-[0_8px_32px_rgba(10,37,53,0.50)] hover:shadow-[0_14px_44px_rgba(10,37,53,0.65)] hover:-translate-y-1`}
            style={{
              animationDelay: "0.48s",
              background: "linear-gradient(145deg,#ea580c,#7c2d12)",
            }}
          >
            {/* pulse rings behind icon */}
            <span className="relative flex items-center justify-center w-14 h-14 shrink-0">
              <PulseRing color="rgba(234,88,12,0.55)" />
              <PulseRing color="rgba(234,88,12,0.35)" delay="1.4s" />
              <span className="ph-ico relative w-8 h-8 drop-shadow-sm">
                <IconPhone />
              </span>
            </span>
            <span className="cta-lbl text-white">Call us</span>
          </a>
        )}

        {/* ── WhatsApp (largest — hero button) ── */}
        {waNum && (
          <a
            href={`https://wa.me/${waNum}?text=${waMsg}`}
            target="_blank"
            rel="noreferrer"
            title="Chat on WhatsApp"
            aria-label="WhatsApp DSP Precision"
            className={`${base} cta-wa cta-item${show ? " visible" : ""} shadow-[0_10px_36px_rgba(37,211,102,0.55)] hover:shadow-[0_16px_48px_rgba(37,211,102,0.70)] hover:-translate-y-1.5`}
            style={{
              animationDelay: "0.24s",
              background: "linear-gradient(145deg,#25D366,#128C7E)",
            }}
          >
            <span className="relative flex items-center justify-center w-16 h-16 shrink-0">
              <PulseRing color="rgba(45,218,110,0.55)" />
              <PulseRing color="rgba(45,218,110,0.32)" delay="1.4s" />
              <span className="wa-ico relative w-10 h-10 drop-shadow-md">
                <IconWhatsApp />
              </span>
            </span>
            <span className="cta-lbl text-white">WhatsApp</span>
          </a>
        )}

        {/* ── Get Quote ── */}
        <Link
          href="/contact"
          title="Get a Quote"
          aria-label="Get a Quote"
          className={`${base} cta-item${show ? " visible" : ""} shadow-[0_8px_30px_rgba(192,104,40,0.50)] hover:shadow-[0_14px_44px_rgba(192,104,40,0.65)] hover:-translate-y-1`}
          style={{
            animationDelay: "0.04s",
            background: "linear-gradient(145deg,#f97316,#c2410c)",
          }}
        >
          <span className="flex items-center justify-center w-12 h-12 shrink-0">
            <span className="w-7 h-7"><IconChat /></span>
          </span>
          <span className="cta-lbl text-white">Get Quote</span>
        </Link>
      </div>
    </>
  );
}
