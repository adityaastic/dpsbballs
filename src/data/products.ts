export type Product = {
  slug: string;
  title: string;
  short: string;
  description: string;
  imageUrl?: string;
  highlights?: string[];
  grades?: string[];
  specs?: { label: string; value: string }[];
  tables?: {
    title: string;
    headers: string[];
    rows: string[][];
  }[];
};

export const products: Product[] = [
  {
    slug: "steel-balls",
    title: "Steel Balls",
    short: "HCC, HC & LC precision steel balls for bearings and industrial use.",
    description:
      "DSP manufactures High Carbon Chrome (HCC/EN-31/SAE 52100), High Carbon (HC), and Low Carbon (LC) steel balls on specialized heading, flashing, grinding and lapping lines. Grades follow AFBMA, DIN and ISO standards, with custom sizes on request.",
    highlights: [
      "Bearing steel (HCC / EN-31 / SAE 52100)",
      "High Carbon & Low Carbon options",
      "Sizes from under 2 mm up to 100 mm",
      "AFBMA / DIN / ISO grades",
    ],
    grades: ["HCC Balls", "HC Balls", "LC Balls"],
    tables: [
      {
        title: "HCC (High Carbon Chrome) — SAE 52100 / EN-31",
        headers: ["Element", "Composition"],
        rows: [
          ["Carbon", "0.98% – 1.05%"],
          ["Chromium", "1.30% – 1.60%"],
          ["Manganese", "0.25% – 0.45%"],
          ["Silicon", "0.15% – 0.35%"],
          ["Phosphorus", "0.025% max"],
          ["Sulphur", "0.025% max"],
        ],
      },
      {
        title: "Typical Grade by Size (HCC / HC / LC)",
        headers: ["Size Range", "Grade"],
        rows: [
          ["Up to 2.0 mm", "16"],
          ["2.0 – 4.0 mm", "10"],
          ["4.0 – 8.0 mm", "10"],
          ["8.0 – 16.0 mm", "16"],
          ["16.0 – 25.0 mm", "24"],
          ["25.0 – 100.0 mm", "100"],
        ],
      },
      {
        title: "HC (High Carbon) Steel Balls",
        headers: ["Element", "Composition"],
        rows: [
          ["Carbon", "0.4% – 0.7%"],
          ["Manganese", "0.3% – 0.6%"],
          ["Silicon", "0.10% – 0.4%"],
          ["Phosphorus", "0.5% max"],
          ["Sulphur", "0.50% max"],
        ],
      },
      {
        title: "LC (Low Carbon) Steel Balls",
        headers: ["Element", "Composition"],
        rows: [
          ["Carbon", "0.07% – 0.20%"],
          ["Manganese", "0.3% – 0.6%"],
          ["Silicon", "0.10% – 0.4%"],
          ["Phosphorus", "0.5% max"],
          ["Sulphur", "0.50% max"],
        ],
      },
    ],
  },
  {
    slug: "stainless-steel-balls",
    title: "Stainless Steel Balls",
    short: "Rust-resistant and non-magnetic SS balls in multiple grades.",
    description:
      "Stainless steel balls are used where corrosion resistance or non-magnetic properties are required. Production starts with wire testing and continues through heading, flashing, grinding, heat treatment and lapping with full in-process checks. We are stainless steel ball manufacturers in India.",
    highlights: [
      "SS 202, 302, 304, 316, 316L, 420, 440",
      "Corrosion & rust prevention applications",
      "Non-magnetic options available",
      "Precision finishing & inspection",
    ],
    grades: ["SS 202", "SS 302", "SS 304", "SS 316", "SS 316L", "SS 420", "SS 440"],
    tables: [
      {
        title: "SS 304 — Chemical Composition",
        headers: ["Element", "Composition"],
        rows: [
          ["Carbon", "0.08% max"],
          ["Chromium", "18.0% – 20.0%"],
          ["Manganese", "2.0% max"],
          ["Silicon", "1.0% max"],
          ["Nickel", "8.0% – 10.5%"],
          ["Phosphorus", "0.045% max"],
          ["Sulphur", "0.03% max"],
        ],
      },
      {
        title: "SS 316 — Chemical Composition",
        headers: ["Element", "Composition"],
        rows: [
          ["Carbon", "0.08% max"],
          ["Chromium", "16.0% – 18.0%"],
          ["Manganese", "2.0% max"],
          ["Silicon", "1.0% max"],
          ["Nickel", "10.0% – 14.0%"],
          ["Molybdenum", "2% – 3%"],
          ["Phosphorus", "0.045% max"],
          ["Sulphur", "0.03% max"],
        ],
      },
      {
        title: "Typical Grade by Size (Stainless)",
        headers: ["Size Range", "Grade"],
        rows: [
          ["Up to 2.0 mm", "24"],
          ["2.0 – 4.0 mm", "24"],
          ["4.0 – 8.0 mm", "48"],
          ["8.0 – 16.0 mm", "48"],
          ["16.0 – 25.0 mm", "100"],
          ["25.0 – 100.0 mm", "200"],
        ],
      },
    ],
  },
  {
    slug: "carbide-balls",
    title: "Carbide Balls",
    short: "Tungsten carbide balls with cobalt or nickel binders.",
    description:
      "Cemented carbide offers high compressive strength, hardness and wear resistance. DSP supplies tungsten carbide balls with cobalt or nickel binders for valves, flow meters, ball screws, linear bearings, gauging and ballizing. Nickel-binder grades resist corrosion down to roughly pH 2–3 versus cobalt binder (~pH 7).",
    highlights: [
      "Cobalt & nickel binder options",
      "High hardness & wear resistance",
      "Corrosion-resistant nickel grades",
      "Valves, bearings, gauging & ball pens",
    ],
    specs: [
      { label: "Cobalt binder WC", value: "93–95% WC / 5–7% Co" },
      { label: "Nickel binder WC", value: "90–92% WC / 8–10% Ni" },
      { label: "Hardness (Co)", value: "90.5 – 91.5 HRa" },
      { label: "Hardness (Ni)", value: "88 – 89 HRa" },
      { label: "Density (Co)", value: "14.95 – 15.0 g/cm³" },
      { label: "Transverse rupture @ 20°C", value: "2600 N/mm²" },
    ],
  },
  {
    slug: "ceramics-balls",
    title: "Ceramic Balls",
    short: "Si3N4, ZrO2, SiC and Al2O3 balls for high-performance use.",
    description:
      "Ceramic balls deliver higher stiffness, lower thermal expansion, lighter weight and superior corrosion/electrical resistance versus steel. Available in silicon nitride, zirconia, silicon carbide and alumina. See the Technical Helpdesk for a full property comparison table.",
    highlights: [
      "Si₃N₄, ZrO₂, SiC, Al₂O₃",
      "High stiffness & low expansion",
      "Lightweight & corrosion resistant",
      "Ideal for demanding bearings",
    ],
    grades: ["Si₃N₄", "ZrO₂", "SiC", "Al₂O₃"],
  },
  {
    slug: "brass-copper-balls",
    title: "Brass / Copper Balls",
    short: "Conductive, ductile balls for non-bearing applications.",
    description:
      "Brass and copper balls suit non-bearing uses needing ductility, moisture corrosion resistance, and electrical or thermal conductivity. Alloys and custom grades are available on request. Manufactured via header, flasher, grinder and lapper lines with rigorous wire and finished-product inspection.",
    highlights: [
      "Excellent conductivity",
      "Good corrosion resistance in moisture",
      "Ductile for special applications",
      "Custom alloys on request",
    ],
    tables: [
      {
        title: "Brass Balls — Chemical Composition",
        headers: ["Element", "Composition"],
        rows: [
          ["Copper", "63% – 67%"],
          ["Lead", "0.07% max"],
          ["Iron", "0.05% max"],
          ["Zinc", "Balance"],
        ],
      },
      {
        title: "Copper Balls — Chemical Composition",
        headers: ["Element", "Composition"],
        rows: [
          ["Copper", "99.97%"],
          ["Impurities", "Balance"],
        ],
      },
      {
        title: "Typical Grades by Size",
        headers: ["Size Range", "Brass Grade", "Copper Grade"],
        rows: [
          ["Up to 2.0 mm", "200", "500"],
          ["2.0 – 4.0 mm", "200", "500"],
          ["4.0 – 8.0 mm", "200", "500"],
          ["8.0 – 16.0 mm", "500", "500"],
          ["16.0 – 25.0 mm", "500", "500"],
          ["25.0 – 100.0 mm", "1000", "1000"],
        ],
      },
    ],
  },
  {
    slug: "gauge-balls",
    title: "Gauge Balls",
    short: "Go / No-Go gauging balls for metrology and inspection.",
    description:
      "Gauge balls are made from hardened chrome alloy steel (≈62 HRC), tungsten carbide, or other materials on special order. Self-centering and consistent diameter make them ideal for Go/No-Go gauging, tapers, dovetails, V-grooves, radius measurement and instrument calibration. Calibrated gauging balls can be used like slip gauges in metrology labs, tool rooms and gauge rooms.",
    highlights: [
      "Hardened chrome steel or carbide",
      "Go / No-Go gauging applications",
      "Metrology labs & tool rooms",
      "Calibrated for precision inspection",
    ],
    specs: [
      { label: "Tensile strength", value: "228 kgf/mm²" },
      { label: "Modulus of elasticity", value: "20750 kgf/mm²" },
      { label: "Specific weight", value: "7.83 kgf/cm³" },
      { label: "Hardness", value: "60–67 HRC" },
    ],
  },
  {
    slug: "modified-balls",
    title: "Modified Balls",
    short: "Custom-shaped and modified precision balls to drawing.",
    description:
      "DSP produces modified balls to customer drawings and technical requirements — including holes, flats, threads, half-balls and special geometries for unique assemblies. Share your drawing or sample requirement with sales for feasibility and quote.",
    highlights: [
      "Made to customer drawings",
      "Holes, flats & special features",
      "Multiple base materials",
      "Engineering support available",
    ],
  },
  {
    slug: "burnishing-media",
    title: "Burnishing Media",
    short: "Carbon & stainless media for polishing and mass finishing.",
    description:
      "Burnishing media for metal polishing and mass finishing is offered in carbon and stainless steel. Common shapes include balls, balcones, cones, pins, satellites, double-cones and diagonals.",
    highlights: [
      "Carbon & stainless steel media",
      "Balls, cones, pins & diagonals",
      "Polishing & mass finishing",
      "Wide size range",
    ],
    grades: ["Balls", "Balcones / Cones", "Pins", "Satellites & Double-cones", "Diagonals"],
  },
  {
    slug: "other-materials",
    title: "Other Material Balls",
    short: "Plastic, Monel, zinc, silver alloy, aluminum and more.",
    description:
      "Against specific demand DSP can supply balls in plastic, Monel / K-Monel, zinc, silver alloy, aluminum, glass, nitride and other materials. Share your specification for a tailored quote.",
    highlights: [
      "Plastic balls",
      "Monel / K-Monel",
      "Zinc, silver alloy, aluminum",
      "Glass, nitride & specials",
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
