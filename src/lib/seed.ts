import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { Product } from "@/models/Product";
import { SiteSetting } from "@/models/SiteSetting";
import { TechnicalContent } from "@/models/TechnicalContent";
import { PageContent } from "@/models/PageContent";
import { products as staticProducts } from "@/data/products";
import { site as staticSite, navLinks as staticNav } from "@/data/site";
import {
  manufacturingProcess,
  materialComparison,
  clientTestimonials,
  ceramicCompareHeaders,
  ceramicCompareRows,
} from "@/data/technical";

export async function seedDatabase() {
  await dbConnect();

  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@12345";
    const hashed = await bcrypt.hash(defaultPassword, 10);
    await Admin.create({
      username: process.env.ADMIN_DEFAULT_USERNAME || "admin",
      email: process.env.ADMIN_DEFAULT_EMAIL || "admin@dspballs.in",
      password: hashed,
      role: "admin",
      name: "Super Admin",
    });
    console.log("✅ Default admin created");
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const withOrder = staticProducts.map((p, i) => ({ ...p, order: i }));
    await Product.insertMany(withOrder);
    console.log(`✅ Inserted ${staticProducts.length} products`);
  }

  const siteCount = await SiteSetting.countDocuments();
  if (siteCount === 0) {
    await SiteSetting.create({
      key: "main",
      name: staticSite.name,
      shortName: staticSite.shortName,
      tagline: staticSite.tagline,
      email: staticSite.email,
      phoneWork: staticSite.phoneWork,
      phoneRegd: staticSite.phoneRegd,
      phoneFax: staticSite.phoneFax,
      mobile: staticSite.mobile,
      workOffice: staticSite.workOffice,
      regdOffice: staticSite.regdOffice,
      highlights: staticSite.highlights,
      navLinks: staticNav.map((n, i) => ({ ...n, order: i })),
      seoTitle: "DSP Precision Products | Precision Balls Manufacturer",
      seoDescription:
        "DSP Precision Products Pvt. Ltd. — manufacturer & exporter of steel, stainless steel, carbide, ceramic, brass, copper, gauge and modified precision balls from Baddi, India.",
    });
    console.log("✅ Site settings inserted");
  }

  const techCount = await TechnicalContent.countDocuments();
  if (techCount === 0) {
    await TechnicalContent.create({
      key: "main",
      manufacturingProcess: manufacturingProcess.map((s, i) => ({ ...s, order: i })),
      materialComparison,
      clientTestimonials,
      ceramicCompare: {
        headers: ceramicCompareHeaders,
        rows: ceramicCompareRows,
      },
    });
    console.log("✅ Technical content inserted");
  }

  const pageCount = await PageContent.countDocuments();
  if (pageCount === 0) {
    const aboutSection = `DSP is one of the leading manufacturers of precision grade balls from high carbon steel & chrome steel, stainless steels, brass, copper, silver, tungsten carbide, ceramics and other materials against specific demand (glass, plastic, nitride and more).

Products are made as per AFBMA, DIN & ISO grades — and as asked by customers, either from product drawings or after understanding technical requirements. We bring more than 25 years of focused experience in these products.

The unit was established in 1995 by Mr. Yashpal Verma, Chairman of the company. An engineer by profession, he has over 45 years of experience in ball production and was part of the team that started the first three ball manufacturing plants in India.

The company is certified for ISO 9001 and is situated in the foothills of the Himalayas at Baddi, Himachal Pradesh. DSP is proud to hold authorised "Self-Certification" of product quality from valued customers who themselves are certified for QS 9000 & TS 16949, with vendor evaluation ratings over 90% from companies of international repute.`;

    await PageContent.insertMany([
      {
        slug: "about",
        title: "About Us",
        heroEyebrow: "About DSP",
        heroTitle: "Precision manufacturing from the foothills of the Himalayas",
        heroDescription:
          "DSP Precision Products Pvt. Ltd. manufactures and exports precision grade balls for bearing, gauging and industrial applications worldwide.",
        sections: [
          { key: "story", heading: "Our story", body: aboutSection, order: 0 },
        ],
      },
      {
        slug: "quality",
        title: "Quality",
        heroEyebrow: "Quality Policy",
        heroTitle: "Committed to total customer satisfaction",
        heroDescription:
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
        heroEyebrow: "Career",
        heroTitle: "Grow with DSP Precision",
        heroDescription:
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
        heroEyebrow: "Clients",
        heroTitle: "Trusted by buyers worldwide",
        heroDescription:
          "Read client appreciation from first-time and repeat buyers around the world.",
        sections: [],
      },
      {
        slug: "network",
        title: "Network",
        heroEyebrow: "Our Network",
        heroTitle: "Global distribution & sales network",
        heroDescription:
          "DSP products are supplied across India and exported to international markets.",
        sections: [],
      },
      {
        slug: "disclaimer",
        title: "Disclaimer",
        heroEyebrow: "Disclaimer",
        heroTitle: "Website disclaimer",
        heroDescription: "",
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
    console.log("✅ Page content inserted");
  }

  console.log("🌱 Seeding complete!");
  return { success: true };
}
