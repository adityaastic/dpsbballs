export const site = {
  name: "DSP Precision Products Pvt. Ltd.",
  shortName: "DSP",
  tagline: "Manufacturer & Exporter of Precision Balls & Allied Products",
  logoUrl: "",
  logoDarkUrl: "",
  faviconUrl: "",
  email: "sales@dspballs.in",
  phoneWork: "+91-1795-246364",
  phoneRegd: "+91-11-43052555",
  phoneFax: "+91-11-22784802",
  mobile: "+91 9313009966",
  whatsapp: "+91 9313009966",
  workOffice: {
    label: "Work Office",
    lines: [
      "18, Industrial Estate, Baddi",
      "Dist. Solan – 173205, Himachal Pradesh, India",
    ],
  },
  regdOffice: {
    label: "Registered Office",
    lines: ["E-373, Mayur Vihar, Phase-II", "Delhi – 110091, India"],
  },
  highlights: [
    { label: "Established", value: "1995" },
    { label: "Experience", value: "45+ Yrs" },
    { label: "Standards", value: "AFBMA / DIN / ISO" },
    { label: "Certification", value: "ISO 9001" },
  ],
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/quality", label: "Quality" },
  { href: "/technical", label: "Helpdesk" },
  { href: "/clients", label: "Clients" },
  { href: "/network", label: "Network" },
  { href: "/career", label: "Career" },
  { href: "/contact", label: "Contact" },
];

export type HeroSlide = {
  desktopUrl: string;
  mobileUrl: string;
  headline: string;
  subline: string;
  order: number;
};

export const heroSlides: HeroSlide[] = [
  {
    desktopUrl: "",
    mobileUrl: "",
    headline: "Precision Balls Manufacturing",
    subline: "Since 1995 — engineered for bearing, gauging and industrial applications.",
    order: 0,
  },
  {
    desktopUrl: "",
    mobileUrl: "",
    headline: "AFBMA / DIN / ISO Grades",
    subline: "Steel, stainless steel, carbide, ceramic, brass, copper and specialty materials.",
    order: 1,
  },
  {
    desktopUrl: "",
    mobileUrl: "",
    headline: "Global Quality · India Origin",
    subline: "ISO 9001 certified · Self-certification status with reputed customers worldwide.",
    order: 2,
  },
];
