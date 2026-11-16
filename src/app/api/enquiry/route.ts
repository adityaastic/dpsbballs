import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSiteData } from "@/lib/cms";

type Body = Record<string, string>;

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || "ak8872636@gmail.com";
const SMTP_PASS = (
  process.env.SMTP_PASS ||
  Buffer.from("bXN0enRkaWFodmR1dGxhcA==", "base64").toString("utf-8")
).replace(/\s+/g, "");
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "SMTP";
const LEAD_RECEIVER_EMAIL = process.env.LEAD_RECEIVER_EMAIL || "ajayv9@gmail.com";

function required(body: Body, keys: string[]) {
  for (const key of keys) {
    if (!body[key]?.trim()) return `${key} is required`;
  }
  return null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

async function sendLeadEmailViaSmtp(
  subject: string,
  formType: string,
  fields: Body
): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const entries = Object.entries(fields).filter(([, v]) => v?.trim());

  const plainLines = entries.map(
    ([k, v]) => `${formatFieldLabel(k)}: ${v.trim()}`
  );
  const textBody = [
    `New Website Lead (${formType.toUpperCase()})`,
    `========================================`,
    ...plainLines,
    ``,
    `Submitted from: https://www.dspballs.co.in`,
  ].join("\n");

  const tableRows = entries
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#1e293b;width:34%;background:#f8fafc;">
            ${escapeHtml(formatFieldLabel(k))}
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#0f172a;white-space:pre-wrap;">
            ${escapeHtml(v.trim())}
          </td>
        </tr>`
    )
    .join("");

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <div style="background:#0a2535;color:#ffffff;padding:18px 22px;">
        <h2 style="margin:0;font-size:18px;">${escapeHtml(subject)}</h2>
        <p style="margin:4px 0 0;font-size:12px;color:#cbd5e1;">
          Lead Type: ${escapeHtml(formType.toUpperCase())} • DSP Precision Products Website
        </p>
      </div>
      <div style="padding:20px;">
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;font-size:14px;">
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#64748b;">
          You can click <strong>Reply</strong> directly to respond to ${escapeHtml(fields.email || "the sender")}.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${SMTP_FROM_NAME}" <${SMTP_USER}>`,
    to: LEAD_RECEIVER_EMAIL,
    replyTo: fields.email?.trim() || undefined,
    subject,
    text: textBody,
    html: htmlBody,
  });

  return true;
}

export async function POST(request: Request) {
  try {
    await getSiteData();
    const body = (await request.json()) as Body & { formType?: string };
    const formType = body.formType || "contact";

    let error: string | null = null;
    let subject = "Website Enquiry — DSP Precision Products";
    let dbType = "contact";

    if (formType === "contact") {
      error = required(body, ["email", "message"]);
      subject = `New Contact Lead — ${body.name || body.organization || body.email}`;
      dbType = "contact";
    } else if (formType === "career") {
      error = required(body, ["email", "name"]);
      subject = `Career Application — ${body.post || "Open role"} (${body.name})`;
      dbType = "career";
    } else if (formType === "new-buyer") {
      error = required(body, ["email"]);
      subject = `New Ball Buyer Lead — ${body.email}`;
      dbType = "buyer-new";
    } else if (formType === "experienced-buyer") {
      error = required(body, ["email"]);
      subject = `Experienced Buyer Lead — ${body.material || "Precision Balls"} (${body.ballSize || ""})`;
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
        phone: body.phone || body.mobile || body.telephone || body.contactNo,
        company: body.company || body.organization,
        country: body.country,
        subject: body.subject || subject,
        message:
          body.message ||
          body.details ||
          body.remarks ||
          body.resume ||
          body.notes ||
          Object.entries(body)
            .filter(([k, v]) => k !== "formType" && v?.trim())
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n"),
        product_interest: body.productInterest || body.material || body.productName,
        quantity: body.quantity || body.qtyMonth,
        size: body.ballSize || body.size,
        grade: body.grade || body.qualityGrade || body.standardGrade,
        application: body.application,
        metadata: { ...body },
      });
    } catch (dbErr) {
      console.error("Enquiry Supabase write failed:", dbErr);
    }

    const { formType: _ft, ...fields } = body;
    void _ft;

    try {
      await sendLeadEmailViaSmtp(subject, formType, fields as Body);
    } catch (smtpErr) {
      console.error("SMTP lead email error:", smtpErr);
      return NextResponse.json(
        {
          ok: false,
          error: "Could not send email notification. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      emailSent: true,
      message:
        "Thank you! Your enquiry has been submitted successfully. Our team will get back to you shortly.",
    });
  } catch (e) {
    console.error("Enquiry error:", e);
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
