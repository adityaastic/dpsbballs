import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "./supabase";
import { products as staticProducts } from "@/data/products";
import {
  site as staticSite,
  navLinks as staticNav,
  heroSlides as staticHeroSlides,
} from "@/data/site";
import {
  manufacturingProcess,
  materialComparison,
  clientTestimonials,
  ceramicCompareHeaders,
  ceramicCompareRows,
} from "@/data/technical";

export async function seedDatabase() {
  const supabase = getSupabaseAdmin();

  // 1. Seed Admin
  const { data: admins, error: adminErr } = await supabase
    .from("admins")
    .select("id")
    .limit(1);

  if (!adminErr && (!admins || admins.length === 0)) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@12345";
    const hashed = await bcrypt.hash(defaultPassword, 10);
    await supabase.from("admins").insert({
      username: process.env.ADMIN_DEFAULT_USERNAME || "admin",
      email: process.env.ADMIN_DEFAULT_EMAIL || "admin@dspballs.in",
      password: hashed,
      role: "admin",
      name: "Super Admin",
    });
    console.log("✅ Default admin created in Supabase");
  }

  // 2. Seed Products
  const { data: prods, error: prodErr } = await supabase
    .from("products")
    .select("id")
    .limit(1);

  if (!prodErr && (!prods || prods.length === 0)) {
    const rows = staticProducts.map((p, i) => ({
      slug: p.slug,
      title: p.title,
      short: p.short,
      description: p.description,
      image_url: p.imageUrl || null,
      highlights: p.highlights || [],
      grades: p.grades || [],
      specs: p.specs || [],
      tables: p.tables || [],
      order: i,
      published: true,
    }));
    await supabase.from("products").insert(rows);
    console.log(`✅ Inserted ${staticProducts.length} products into Supabase`);
  }

  // 3. Seed Site Settings
  const { data: settings, error: setErr } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", "main")
    .maybeSingle();

  if (!setErr && !settings) {
    await supabase.from("site_settings").insert({
      key: "main",
      name: staticSite.name,
      short_name: staticSite.shortName,
      tagline: staticSite.tagline,
      email: staticSite.email,
      phone_work: staticSite.phoneWork,
      phone_regd: staticSite.phoneRegd,
      phone_fax: staticSite.phoneFax,
      mobile: staticSite.mobile,
      whatsapp: staticSite.whatsapp || "",
      work_office: staticSite.workOffice,
      regd_office: staticSite.regdOffice,
      highlights: staticSite.highlights,
      nav_links: staticNav.map((n, i) => ({ ...n, order: i })),
      hero_slides: staticHeroSlides.map((h, i) => ({ ...h, order: i })),
      seo_title: "DSP Precision Products | Precision Balls Manufacturer",
      seo_description:
        "DSP Precision Products Pvt. Ltd. — manufacturer & exporter of steel, stainless steel, carbide, ceramic, brass, copper, gauge and modified precision balls from Baddi, India.",
    });
    console.log("✅ Site settings inserted into Supabase");
  }

  // 4. Seed Technical Content
  const { data: tech, error: techErr } = await supabase
    .from("technical_content")
    .select("id")
    .eq("key", "main")
    .maybeSingle();

  if (!techErr && !tech) {
    await supabase.from("technical_content").insert({
      key: "main",
      manufacturing_process: manufacturingProcess.map((s, i) => ({ ...s, order: i })),
      material_comparison: materialComparison,
      client_testimonials: clientTestimonials,
      ceramic_compare: {
        headers: ceramicCompareHeaders,
        rows: ceramicCompareRows,
      },
    });
    console.log("✅ Technical content inserted into Supabase");
  }

  // 5. Seed Page Contents
  const { data: pages, error: pageErr } = await supabase
    .from("page_contents")
    .select("id")
    .limit(1);

  if (!pageErr && (!pages || pages.length === 0)) {
    const aboutSection = `DSP is one of the leading manufacturers of precision grade balls from high carbon steel & chrome steel, stainless steels, brass, copper, silver, tungsten carbide, ceramics and other materials against specific demand (glass, plastic, nitride and more).

Products are made as per AFBMA, DIN & ISO grades — and as asked by customers, either from product drawings or after understanding technical requirements. We bring more than 25 years of focused experience in these products.

The unit was established in 1995 by Mr. Yashpal Verma, Chairman of the company. An engineer by profession, he has over 45 years of experience in ball production and was part of the team that started the first three ball manufacturing plants in India.

The company is certified for ISO 9001 and is situated in the foothills of the Himalayas at Baddi, Himachal Pradesh. DSP is proud to hold authorised "Self-Certification" of product quality from valued customers who themselves are certified for QS 9000 & TS 16949, with vendor evaluation ratings over 90% from companies of international repute.`;

    await supabase.from("page_contents").insert([
      {
        slug: "about",
        title: "About Us",
        hero_eyebrow: "About DSP",
        hero_title: "Precision manufacturing from the foothills of the Himalayas",
        hero_description:
          "DSP Precision Products Pvt. Ltd. manufactures and exports precision grade balls for bearing, gauging and industrial applications worldwide.",
        sections: [
          { key: "story", heading: "Our story", body: aboutSection, order: 0 },
        ],
      },
      {
        slug: "quality",
        title: "Quality",
        hero_eyebrow: "Quality Policy",
        hero_title: "Committed to total customer satisfaction",
        hero_description:
          "Products are delivered after understanding technical requirements, with continual improvement of the quality management system through teamwork.",
        sections: [
          {
            key: "policy",
            heading: "Quality Policy",
            body:
              "We at DSP Precision Products Pvt. Ltd. are committed to manufacture and supply Precision Balls of consistent quality, meeting customer needs through continual improvement of Quality Management System by our dedicated team work.",
            order: 0,
          },
        ],
      },
      {
        slug: "career",
        title: "Career",
        hero_eyebrow: "Career",
        hero_title: "Grow with DSP Precision",
        hero_description:
          "Join our team of precision manufacturing experts. We are always looking for skilled and motivated individuals.",
        sections: [
          {
            key: "intro",
            heading: "Work with us",
            body:
              "If you are interested in a career with DSP Precision Products, please send your resume to the contact email. We review applications on an ongoing basis.",
            order: 0,
          },
        ],
      },
      {
        slug: "clients",
        title: "Clients",
        hero_eyebrow: "Clients",
        hero_title: "Trusted by buyers worldwide",
        hero_description:
          "Read client appreciation from first-time and repeat buyers around the world.",
        sections: [],
      },
      {
        slug: "network",
        title: "Network",
        hero_eyebrow: "Our Network",
        hero_title: "Global distribution & sales network",
        hero_description:
          "DSP products are supplied across India and exported to international markets.",
        sections: [],
      },
      {
        slug: "disclaimer",
        title: "Disclaimer",
        hero_eyebrow: "Disclaimer",
        hero_title: "Website disclaimer",
        hero_description: "",
        sections: [
          {
            key: "body",
            heading: "Disclaimer",
            body:
              "All information on this website is for general reference only. Technical specifications may change without prior notice. For confirmed quotations and specifications, please contact our sales team directly.",
            order: 0,
          },
        ],
      },
    ]);
    console.log("✅ Page content inserted into Supabase");
  }

  console.log("🌱 Supabase seeding complete!");
  return { success: true };
}
