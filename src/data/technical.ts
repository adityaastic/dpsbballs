export const manufacturingProcess = [
  {
    step: "01",
    title: "Heading",
    text: "Wire coils are cold forged into spherical blanks for compact structure on single-stroke headers.",
  },
  {
    step: "02",
    title: "Flashing / Filing",
    text: "Die marks on poles and equator of headed blanks are removed by grinding between hardened plates.",
  },
  {
    step: "03",
    title: "Heat Treatment",
    text: "Balls are heated in a controlled environment to critical temperatures, quenched, then tempered to close limits.",
  },
  {
    step: "04",
    title: "Grinding",
    text: "Balls are ground to close tolerances with graded abrasives, preparing them for final lapping.",
  },
  {
    step: "05",
    title: "Lapping",
    text: "Final size, sphericity, lot variation and surface quality are achieved on specialized lappers.",
  },
  {
    step: "06",
    title: "Cleaning & Inspection",
    text: "Balls are cleaned and tested with sophisticated equipment to ensure DSP quality standards.",
  },
];

export const materialComparison = {
  intro:
    "There are two main technical considerations when purchasing balls: (1) type of material, and (2) dimensional accuracy required. Use this comparison as a starting guide, then confirm grades with our sales team.",
  rows: [
    {
      material: "HCC / Bearing Steel",
      bestFor: "Bearings, high wear applications",
      strengths: "Hardness, wear resistance, load capacity",
      notes: "SAE 52100 / EN-31",
    },
    {
      material: "High / Low Carbon Steel",
      bestFor: "General industrial use, lower wear",
      strengths: "Cost-effective, versatile sizes",
      notes: "HC & LC options",
    },
    {
      material: "Stainless Steel",
      bestFor: "Corrosion / rust prevention, hygiene",
      strengths: "Rust resistance, non-magnetic grades",
      notes: "202, 302, 304, 316, 420, 440",
    },
    {
      material: "Tungsten Carbide",
      bestFor: "Valves, gauging, severe wear",
      strengths: "Extreme hardness & compressive strength",
      notes: "Co or Ni binder",
    },
    {
      material: "Ceramics",
      bestFor: "High-speed / lightweight bearings",
      strengths: "Stiffness, low expansion, insulation",
      notes: "Si₃N₄, ZrO₂, SiC, Al₂O₃",
    },
    {
      material: "Brass / Copper",
      bestFor: "Non-bearing, conductivity needs",
      strengths: "Ductility, electrical / thermal conductivity",
      notes: "Alloys on request",
    },
    {
      material: "Gauge Balls",
      bestFor: "Metrology, Go / No-Go inspection",
      strengths: "Self-centering, uniform diameter",
      notes: "Chrome steel or carbide",
    },
  ],
};

export const clientTestimonials = [
  {
    type: "Repeat Client",
    author: "Kerry Field",
    role: "Float switch manufacturer",
    quote:
      "We have found DSP and Mr. Verma to be exceptionally reliable and easy to deal with. In each transaction they have done what they say they will do, supplied samples, and subsequently supplied bulk product on time and in all respects correct.",
    detail:
      "Supplied ~20,000 pcs each of 3/4\" and 15/16\" balls (grade 500/1000) — consistent, well finished and packed. Previously sourced Italian balls via a local distributor.",
  },
  {
    type: "Repeat Client",
    author: "Zack Wiseman",
    role: "Precision / jewellery components",
    quote:
      "You have done an EXCELLENT job — yet again! We are all very impressed with your work. The two samples of the inset stones were so well done — you really nailed the dimensions!",
    detail:
      "Samples enabled stone-setting trials; the more radical 60° inclination was selected for production jewellery.",
  },
];

export const ceramicCompareHeaders = [
  "Property",
  "Si₃N₄",
  "ZrO₂",
  "SiC",
  "Al₂O₃",
  "Bearing Steel",
  "Stainless",
];

export const ceramicCompareRows = [
  ["Density (g/cm³)", "3.2–3.3", "6.00", "3.1–3.2", "3.95", "7.85", "7.90"],
  ["Linear expansion (10⁻⁶/K)", "3.20", "10.50", "4.50", "8.50", "10.0", "11.0"],
  ["Young's modulus (GPa)", "300–320", "210", "350", "380", "208", "200"],
  ["Hardness (HRC scale equiv.)", "1400–1600", "1000–1200", "≥2500", "1600–1800", "700", "≤30–62"],
  ["Corrosion resistance", "Good", "Good", "Good", "Good", "Poor", "Poor"],
  ["Self-lubrication", "Good", "Good", "Good", "Poor", "Poor", "Poor"],
];
