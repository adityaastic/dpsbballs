"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<
      string,
      string
    >;

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "contact", ...data }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed");
      if (json.mailto) window.location.href = json.mailto;
      setMessage(json.message);
      setStatus("sent");
      form.reset();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="form-panel space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Your Name" name="name" required />
        <Field label="Email *" name="email" type="email" required />
        <Field label="Designation" name="designation" />
        <Field label="Organization" name="organization" />
        <Field label="City" name="city" />
        <Field label="Pin / Zip" name="zip" />
        <Field label="Country" name="country" />
        <Field label="Telephone" name="telephone" />
        <Field label="Mobile" name="mobile" />
        <Field label="Fax" name="fax" />
      </div>
      <label className="block">
        <span className="field-label">Message / Requirement *</span>
        <textarea
          name="message"
          rows={5}
          className="field-input mt-1.5 min-h-[120px] resize-y"
          placeholder="Tell us about sizes, grades, material and quantity..."
          required
        />
      </label>
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending..." : "Send Enquiry"}
        </button>
        {status === "sent" && (
          <p className="text-sm text-[var(--steel)]">{message}</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-700">{message}</p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="field-input mt-1.5"
      />
    </label>
  );
}
