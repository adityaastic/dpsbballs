import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSiteData } from "@/lib/cms";

type Body = Record<string, string>;

function required(body: Body, keys: string[]) {
  for (const key of keys) {
    if (!body[key]?.trim()) return `${key} is required`;
  }
  return null;
}

function buildMailto(email: string, subject: string, body: Body) {
  const lines = Object.entries(body)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: ${v.trim()}`);
  const text = lines.join("\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}

export async function POST(request: Request) {
  try {
    const { site } = await getSiteData();
    const body = (await request.json()) as Body & { formType?: string };
    const formType = body.formType || "contact";

    let error: string | null = null;
    let subject = "Website Enquiry — DSP Precision Products";
    let dbType = "contact";

    if (formType === "contact") {
      error = required(body, ["email", "message"]);
      subject = `Contact Enquiry — ${body.name || "Website"}`;
      dbType = "contact";
    } else if (formType === "career") {
      error = required(body, ["email", "name"]);
      subject = `Career Application — ${body.post || "Open role"}`;
      dbType = "career";
    } else if (formType === "new-buyer") {
      error = required(body, ["email"]);
      subject = "New Ball Buyer Enquiry";
      dbType = "buyer-new";
    } else if (formType === "experienced-buyer") {
      error = required(body, ["email"]);
      subject = "Experienced Buyer Enquiry";
      dbType = "buyer-exp";
    }

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("enquiries").insert({
        type: dbType,
        name: body.name || "Anonymous",
        email: body.email,
        phone: body.phone || body.mobile || body.contactNo,
        company: body.company,
        country: body.country,
        subject: body.subject || subject,
        message:
          body.message ||
          body.notes ||
          Object.entries(body)
            .filter(([k, v]) => k !== "formType" && v?.trim())
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n"),
        product_interest: body.productInterest || body.material,
        quantity: body.quantity,
        size: body.ballSize || body.size,
        grade: body.grade,
        application: body.application,
        metadata: { ...body },
      });
    } catch (dbErr) {
      // Don't fail the whole request if DB write fails
      console.error("Enquiry Supabase write failed:", dbErr);
    }

    const { formType: _ft, ...fields } = body;
    void _ft;
    const mailto = buildMailto(site.email, subject, fields as Body);

    return NextResponse.json({
      ok: true,
      message: `Enquiry received. Opening email to ${site.email} so you can send it now.`,
      mailto,
      email: site.email,
    });
  } catch (e) {
    console.error("Enquiry error:", e);
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
