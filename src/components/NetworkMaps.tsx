"use client";

import { useState } from "react";

type LocationItem = {
  id: string;
  tag: string;
  title: string;
  address: string[];
  phone: string;
  faxPhone?: string;
  mobile?: string;
  email: string;
  mapQuery: string;
  mapEmbedUrl: string;
  coordinates: string;
};

const locations: LocationItem[] = [
  {
    id: "baddi",
    tag: "Works & Manufacturing Unit",
    title: "Baddi Plant",
    address: [
      "18, Industrial Estate, Baddi",
      "Dist. Solan – 173205",
      "Himachal Pradesh, India",
    ],
    phone: "+91-1795-246364",
    email: "sales@dspballs.in",
    mapQuery: "18 Industrial Estate Baddi Solan Himachal Pradesh 173205",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13686.069796245367!2d76.78280654877561!3d30.956041699999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ff51c22fbab09%3A0xc3cfcfa18aa9ad6d!2sBaddi%20Industrial%20Area%2C%20Baddi%2C%20Himachal%20Pradesh%20173205!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    coordinates: "30.9560° N, 76.7828° E",
  },
  {
    id: "delhi",
    tag: "Registered Office",
    title: "Delhi Office",
    address: [
      "E-373, Mayur Vihar, Phase-II",
      "Delhi – 110091, India",
    ],
    phone: "+91-11-43052555",
    faxPhone: "+91-11-22784802",
    mobile: "+91 9313009966",
    email: "sales@dspballs.in",
    mapQuery: "E-373 Mayur Vihar Phase II Delhi 110091",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.825227750849!2d77.29962537633215!3d28.619263684656914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce37c1543bcf5%3A0x6b48fb2eb3c0f6f4!2sMayur%20Vihar%20Phase%20II%2C%20Mayur%20Vihar%2C%20Delhi%2C%20110091!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    coordinates: "28.6192° N, 77.2996° E",
  },
];

export default function NetworkMaps() {
  const [activeTab, setActiveTab] = useState<"all" | "baddi" | "delhi">("all");

  const filteredLocations =
    activeTab === "all"
      ? locations
      : locations.filter((loc) => loc.id === activeTab);

  return (
    <div className="w-full space-y-8">
      {/* 3D Control Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--orange)]/10 text-[var(--orange-deep)]">
            <span className="w-2 h-2 rounded-full bg-[var(--orange)] animate-pulse" />
            3D Interactive Locations
          </span>
          <h2 className="mt-2 font-display text-2xl md:text-3xl text-[var(--ink)]">
            Our Key Offices &amp; Facilities
          </h2>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 p-1.5 bg-[var(--surface-2)]/60 rounded-xl border border-[var(--line)]">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-white text-[var(--orange-deep)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            All Locations (2)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("baddi")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "baddi"
                ? "bg-white text-[var(--orange-deep)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            Baddi Plant
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("delhi")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "delhi"
                ? "bg-white text-[var(--orange-deep)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            Delhi Office
          </button>
        </div>
      </div>

      {/* Grid of 3D Map Cards */}
      <div
        className={`grid gap-8 ${
          filteredLocations.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
        }`}
      >
        {filteredLocations.map((loc) => {
          const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            loc.mapQuery
          )}`;

          return (
            <div
              key={loc.id}
              className="group relative bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-[var(--shadow-md)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(194,65,12,0.18)] hover:-translate-y-1.5 flex flex-col justify-between"
            >
              {/* Card Header & Contact Details */}
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="inline-block px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-orange-50 text-[var(--orange-deep)] border border-orange-200/80">
                    {loc.tag}
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--muted)] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    GPS: {loc.coordinates}
                  </span>
                </div>

                <h3 className="font-display text-2xl text-[var(--ink)] font-bold">
                  {loc.title}
                </h3>

                <div className="mt-4 space-y-1.5 text-sm text-[var(--muted)] leading-relaxed">
                  {loc.address.map((line, idx) => (
                    <p key={idx} className="font-medium text-[var(--ink-soft)]">
                      {line}
                    </p>
                  ))}
                </div>

                {/* Contact numbers */}
                <div className="mt-5 pt-4 border-t border-[var(--line)]/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
                      Phone
                    </span>
                    <a
                      href={`tel:${loc.phone.replace(/\s/g, "")}`}
                      className="font-bold text-[var(--ink)] hover:text-[var(--orange-deep)] transition-colors flex items-center gap-1.5"
                    >
                      <span>📞</span> {loc.phone}
                    </a>
                  </div>

                  {loc.mobile && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
                        Mobile
                      </span>
                      <a
                        href={`tel:${loc.mobile.replace(/\s/g, "")}`}
                        className="font-bold text-[var(--ink)] hover:text-[var(--orange-deep)] transition-colors flex items-center gap-1.5"
                      >
                        <span>📱</span> {loc.mobile}
                      </a>
                    </div>
                  )}

                  {loc.faxPhone && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
                        Fax / Phone
                      </span>
                      <span className="font-semibold text-[var(--ink-soft)]">
                        📠 {loc.faxPhone}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
                      Email
                    </span>
                    <a
                      href={`mailto:${loc.email}`}
                      className="font-bold text-[var(--orange-deep)] hover:underline flex items-center gap-1.5"
                    >
                      <span>✉️</span> {loc.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* 3D Map View Area */}
              <div className="relative w-full h-72 sm:h-80 bg-slate-900 overflow-hidden border-t border-[var(--line)]">
                {/* 3D Pin Badge overlay */}
                <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-white/50 flex items-center gap-2 text-xs font-bold text-[var(--ink)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--orange)] animate-ping" />
                  <span>Interactive 3D Map</span>
                </div>

                {/* Directions Button overlay */}
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-4 right-4 z-20 btn btn-accent text-xs py-2 px-4 shadow-lg flex items-center gap-2"
                >
                  Open 3D Directions →
                </a>

                {/* Google Map iframe */}
                <iframe
                  title={`${loc.title} 3D Map`}
                  src={loc.mapEmbedUrl}
                  className="w-full h-full border-0 grayscale-[25%] contrast-[105%] group-hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
