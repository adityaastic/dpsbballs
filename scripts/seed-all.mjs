import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env
const envPath = path.resolve("./.env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runSeed() {
  console.log("Starting full seed...");

  // 1. Seed technical_content
  const { data: existingTech } = await supabase
    .from("technical_content")
    .select("id")
    .eq("key", "main")
    .maybeSingle();

  if (!existingTech) {
    const { error: techErr } = await supabase.from("technical_content").insert({
      key: "main",
      manufacturing_process: [
        { step: "01", title: "Heading & Forming", text: "High precision wire cut and cold heading into near-net spherical blanks.", order: 0 },
        { step: "02", title: "Flashing / Rough Grinding", text: "Removing flashing ring and uniform spherical pre-grinding.", order: 1 },
        { step: "03", title: "Heat Treatment", text: "Atmosphere controlled hardening and tempering to achieve specified HRC/Rockwell hardness.", order: 2 },
        { step: "04", title: "Hard Grinding", text: "High precision dimensional grinding to sub-micron accuracy tolerances.", order: 3 },
        { step: "05", title: "Lapping & Polishing", text: "Final fine abrasive lapping achieving mirror surface finish (Ra < 0.012 µm).", order: 4 },
        { step: "06", title: "100% Inspection & Packing", text: "Automated optical inspection, diameter grading, anti-rust oiling and sealed packaging.", order: 5 },
      ],
      material_comparison: {
        intro: "DSP manufactures precision grade balls across high carbon chrome steel, stainless steel grades, tungsten carbide, ceramics and specialty alloys.",
        rows: [
          { material: "Chrome Steel (AISI 52100)", bestFor: "Bearings, Automotive, High Load", strengths: "High wear resistance, Rockwell HRC 60-66", notes: "Standard for ball bearings, pumps and precision machinery." },
          { material: "Stainless Steel 420/440C", bestFor: "Valves, Medical, Marine, Food", strengths: "Martensitic stainless, high hardness with corrosion resistance", notes: "Hardened to HRC 52-58. Ideal for valves, bearings, pumps in wet environments." },
          { material: "Stainless Steel 304/316", bestFor: "Chemical, Pharma, Food, Extreme Corrosion", strengths: "Austenitic non-magnetic, superior chemical resistance", notes: "Tough and highly resistant to acids, salts and food substances." },
          { material: "Tungsten Carbide", bestFor: "Flowmeters, Linear Bearings, Gauging, Valves", strengths: "Extreme hardness (HRA 90+), high density, wear resistance", notes: "Best for extreme abrasive or high-pressure environments." },
          { material: "Ceramic (Si3N4 / ZrO2)", bestFor: "High Speed Spindles, Aerospace, Non-conductive", strengths: "40% lighter than steel, electrically insulating, zero corrosion", notes: "Operates at speeds up to 3x higher than steel balls." },
          { material: "Brass & Copper", bestFor: "Electrical contacts, artistic, low friction valves", strengths: "Non-sparking, excellent electrical & thermal conductivity", notes: "Widely used in safety equipment and fluid handling." },
        ],
      },
      client_testimonials: [
        { type: "Bearing OEM - Domestic", author: "Quality Head, Auto Component Major", role: "Tier-1 Automotive Supplier", quote: "DSP has consistently met our stringent PPM requirements with zero line rejections across millions of balls.", detail: "Self-certified vendor for over 12 consecutive years." },
        { type: "Valve Manufacturer - Export", author: "Procurement Director", role: "Industrial Valve Manufacturer, Europe", quote: "Excellent surface finish and precise lot grading. On-time delivery makes DSP our preferred Asian supplier.", detail: "Consistently delivering AFBMA Grade 10 and Grade 25 precision." },
        { type: "Flowmeter & Instrumentation", author: "Chief Technical Officer", role: "Instrumentation Equipment Corp", quote: "Tungsten carbide and ceramic balls from DSP gave our flowmeters the exact repeatability needed.", detail: "Supplied with calibrated micrometer tolerance certificates." },
      ],
      ceramic_compare: {
        headers: ["Property", "Silicon Nitride (Si3N4)", "Zirconia (ZrO2)", "Chrome Steel 52100"],
        rows: [
          ["Density (g/cm³)", "3.2", "6.0", "7.8"],
          ["Hardness (HV / HRC)", "1500 HV (75 HRC)", "1200 HV (70 HRC)", "800 HV (64 HRC)"],
          ["Max Operating Temp (°C)", "1000°C", "500°C", "150°C"],
          ["Electrical Insulation", "Yes (Dielectric)", "Yes", "No (Conductor)"],
          ["Corrosion Resistance", "Exceptional", "Very High", "Requires Oil/Rust Protection"],
        ],
      },
    });

    if (techErr) console.error("Error inserting technical content:", techErr);
    else console.log("✅ Technical content seeded successfully.");
  } else {
    console.log("ℹ️ Technical content already exists.");
  }

  // 2. Seed all page_contents
  const pagesToSeed = [
    {
      slug: "home",
      title: "Home Page",
      hero_eyebrow: "DSP Precision",
      hero_title: "Precision Balls Engineered for Demanding Industry",
      hero_description: "Leading manufacturer & exporter of AFBMA, DIN & ISO precision steel, stainless steel, carbide, ceramic, brass, copper and gauge balls from Baddi, India.",
      sections: [
        {
          key: "who_we_are",
          heading: "Precision balls engineered for demanding industry",
          subheading: "Who we are",
          body: "Founded by Mr. Yashpal Verma, DSP is a leading manufacturer of precision-grade balls in high carbon chrome steel, stainless steels, brass, copper, tungsten carbide, ceramics and specialty materials — made to AFBMA, DIN & ISO grades or your drawings.",
          imageUrl: "",
          videoUrl: "",
          features: [
            "Full in-house process capabilities",
            "Self-certification status with reputed customers",
            "QS 9000 & TS 16949 customer ecosystem",
            "ISO 9001 certified quality systems"
          ],
          buttonText: "About DSP",
          buttonLink: "/about",
          order: 0,
        },
        {
          key: "product_range",
          heading: "Built for every grade & material",
          subheading: "Product range",
          body: "From bearing steel to ceramics and gauging balls — explore our core catalogue.",
          imageUrl: "",
          videoUrl: "",
          buttonText: "View all products",
          buttonLink: "/products",
          order: 1,
        },
        {
          key: "quality_circle",
          heading: "Committed to total customer satisfaction",
          subheading: "Quality circle",
          body: "Products are delivered after understanding technical requirements, with continual improvement of the quality management system through teamwork.",
          imageUrl: "",
          videoUrl: "",
          buttonText: "Quality policy",
          buttonLink: "/quality",
          order: 2,
        },
        {
          key: "order_cta",
          heading: "Need a custom size, grade or material?",
          subheading: "Ready to order?",
          body: "Share your drawings or technical requirements. Our engineering team responds within 24 hours.",
          imageUrl: "",
          videoUrl: "",
          buttonText: "Contact sales",
          buttonLink: "/contact",
          order: 3,
        },
      ],
    },
    {
      slug: "about",
      title: "About Us",
      hero_eyebrow: "About DSP",
      hero_title: "Precision manufacturing from the foothills of the Himalayas",
      hero_description: "DSP Precision Products Pvt. Ltd. manufactures and exports precision grade balls for bearing, gauging and industrial applications worldwide.",
      sections: [
        {
          key: "story",
          heading: "Our story",
          subheading: "Decades of Precision",
          body: `DSP is one of the leading manufacturers of precision grade balls from high carbon steel & chrome steel, stainless steels, brass, copper, silver, tungsten carbide, ceramics and other materials against specific demand (glass, plastic, nitride and more).

Products are made as per AFBMA, DIN & ISO grades — and as asked by customers, either from product drawings or after understanding technical requirements. We bring more than 25 years of focused experience in these products.

The unit was established in 1995 by Mr. Yashpal Verma, Chairman of the company. An engineer by profession, he has over 45 years of experience in ball production and was part of the team that started the first three ball manufacturing plants in India.

The company is certified for ISO 9001 and is situated in the foothills of the Himalayas at Baddi, Himachal Pradesh. DSP is proud to hold authorised "Self-Certification" of product quality from valued customers who themselves are certified for QS 9000 & TS 16949, with vendor evaluation ratings over 90% from companies of international repute.`,
          imageUrl: "",
          videoUrl: "",
          order: 0,
        },
        {
          key: "manufacture",
          heading: "What we manufacture",
          subheading: "Product Range",
          body: "A complete range of precision balls and allied products across all industrial grades.",
          imageUrl: "",
          videoUrl: "",
          order: 1,
        },
        {
          key: "certifications",
          heading: "ISO 9001:2015 Quality & International Accreditations",
          subheading: "Certified Quality & Global Accreditation",
          body: "Our precision manufacturing operations adhere strictly to global quality management systems and international accreditation frameworks.",
          imageUrl: "",
          videoUrl: "",
          order: 2,
        },
      ],
    },
    {
      slug: "quality",
      title: "Quality",
      hero_eyebrow: "Quality circle",
      hero_title: "Standards you can measure",
      hero_description: "ISO-aligned grading, disciplined packing and a clear quality policy — built around customer technical needs.",
      sections: [
        {
          key: "policy",
          heading: "Quality policy",
          subheading: "Our Commitment",
          body: "We at DSP Precision Products Pvt. Ltd. are committed to manufacture and supply Precision Balls of consistent quality, meeting customer needs through continual improvement of Quality Management System by our dedicated team work.",
          imageUrl: "",
          videoUrl: "",
          order: 0,
        },
      ],
    },
    {
      slug: "career",
      title: "Career",
      hero_eyebrow: "Careers",
      hero_title: "Grow with a precision manufacturing team",
      hero_description: "Apply online for openings at DSP Precision Products. Share your profile and the role you’re interested in.",
      sections: [
        {
          key: "why_dsp",
          heading: "Why DSP",
          subheading: "Work With Us",
          body: "Join a company with decades of ball manufacturing expertise, in-house process capability and a quality-first culture at Baddi, Himachal Pradesh.",
          imageUrl: "",
          videoUrl: "",
          order: 0,
        },
      ],
    },
    {
      slug: "clients",
      title: "Clients",
      hero_eyebrow: "Client appreciation",
      hero_title: "Trusted by first-time and repeat buyers",
      hero_description: "Feedback from customers who rely on DSP for consistent quality, on-time supply and dependable communication.",
      sections: [
        {
          key: "testimonials_intro",
          heading: "Worldwide Client Relationships",
          subheading: "Trust & Precision",
          body: "Our customer relationships span across global automotive, bearing, valve, aerospace and instrumentation OEMs.",
          imageUrl: "",
          videoUrl: "",
          order: 0,
        },
      ],
    },
    {
      slug: "network",
      title: "Network",
      hero_eyebrow: "Network & Locations",
      hero_title: "Presence in India & Worldwide Reach",
      hero_description: "Manufacturing at Baddi Plant with Registered Office in Delhi — supplying precision grade balls to domestic and global buyers.",
      sections: [
        {
          key: "supply_chain",
          heading: "Export & Worldwide Supply Chain",
          subheading: "Global Distribution",
          body: "DSP supplies precision balls to reputed OEM and distributor customers across India and international markets. Share your destination, AFBMA/DIN/ISO standards and custom packing preferences with our sales team for rapid export support.",
          imageUrl: "",
          videoUrl: "",
          order: 0,
        },
      ],
    },
    {
      slug: "contact",
      title: "Contact Us",
      hero_eyebrow: "Contact",
      hero_title: "Talk to our sales team",
      hero_description: "Share your requirement for sizes, grades and materials. We respond from sales@dspballs.in.",
      sections: [
        {
          key: "office_media",
          heading: "Visit Our Facilities",
          subheading: "Baddi Plant & Delhi Office",
          body: "Located in the foothills of the Himalayas at Baddi, Himachal Pradesh with corporate office in Delhi.",
          imageUrl: "",
          videoUrl: "",
          order: 0,
        },
      ],
    },
    {
      slug: "technical",
      title: "Technical Helpdesk",
      hero_eyebrow: "Helpdesk",
      hero_title: "Technical data & buying support",
      hero_description: "Material comparison, manufacturing process overview, and enquiry forms for new or experienced ball buyers.",
      sections: [
        {
          key: "intro",
          heading: "Material comparison",
          subheading: "Selection Guide",
          body: "Compare characteristics across bearing steel, stainless steels, carbides and ceramics.",
          imageUrl: "",
          videoUrl: "",
          order: 0,
        },
      ],
    },
    {
      slug: "disclaimer",
      title: "Disclaimer",
      hero_eyebrow: "Disclaimer",
      hero_title: "Website disclaimer",
      hero_description: "General reference information and technical policies.",
      sections: [
        {
          key: "body",
          heading: "Disclaimer",
          subheading: "Legal Notice",
          body: "All information on this website is for general reference only. Technical specifications may change without prior notice. For confirmed quotations and specifications, please contact our sales team directly.",
          imageUrl: "",
          videoUrl: "",
          order: 0,
        },
      ],
    },
  ];

  for (const p of pagesToSeed) {
    const { data: existing } = await supabase
      .from("page_contents")
      .select("id")
      .eq("slug", p.slug)
      .maybeSingle();

    if (!existing) {
      const { error: insErr } = await supabase.from("page_contents").insert(p);
      if (insErr) console.error(`Error inserting page '${p.slug}':`, insErr);
      else console.log(`✅ Page '${p.slug}' (${p.title}) seeded successfully.`);
    } else {
      console.log(`ℹ️ Page '${p.slug}' already exists.`);
    }
  }

  console.log("Seed complete!");
}

runSeed();
