"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "sent" | "error";

function Field({
  label,
  name,
  required = false,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
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

export function NewBuyerForm() {
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
        body: JSON.stringify({ formType: "new-buyer", ...data }),
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
      <p className="text-sm text-[var(--muted)]">
        For first-time ball buyers. Fields marked * are compulsory.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email *" name="email" type="email" required />
        <Field label="Application for Balls" name="application" />
        <Field label="Name of your Product" name="productName" />
        <Field label="Balls used As / For" name="usedAs" />
        <Field label="Balls required per piece" name="perPiece" />
        <Field label="Quantity required per month" name="qtyMonth" />
        <Field label="Chemical Composition / Metal %" name="composition" />
        <Field label="Current source of procurement" name="currentSource" />
      </div>
      <label className="block">
        <span className="field-label">Additional details</span>
        <textarea name="details" rows={4} className="field-input mt-1.5 resize-y" />
      </label>
      <FormStatus status={status} message={message} loadingLabel="Sending..." />
    </form>
  );
}

export function ExperiencedBuyerForm() {
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
        body: JSON.stringify({ formType: "experienced-buyer", ...data }),
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
      <p className="text-sm text-[var(--muted)]">
        Essential fields marked *. Do not enter assumed data — leave blank if
        unsure. Send drawings to sales@dspballs.in if available.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email *" name="email" type="email" required />
        <Field label="Ball Size * (mm/inch)" name="ballSize" required />
        <Field label="Material *" name="material" required />
        <Field label="Quantity / month *" name="quantity" required />
        <Field label="Quality Grade" name="qualityGrade" />
        <Field label="AFBMA / DIN / ISI Grade" name="standardGrade" />
        <Field label="Sphericity / Tolerance" name="sphericity" />
        <Field label="Surface Finish / Tolerance" name="surfaceFinish" />
        <Field label="Hardness HRC / Tolerance" name="hardness" />
        <Field label="Tensile Strength / Tolerance" name="tensile" />
        <Field label="Crushing Load / Tolerance" name="crushing" />
        <Field label="Chemical Composition" name="composition" />
        <Field label="Application for Balls" name="application" />
        <Field label="Product name" name="productName" />
        <Field label="Balls used As / For" name="usedAs" />
        <Field label="Balls per piece" name="perPiece" />
        <Field label="Current source" name="currentSource" />
      </div>
      <label className="block">
        <span className="field-label">Remarks</span>
        <textarea name="remarks" rows={4} className="field-input mt-1.5 resize-y" />
      </label>
      <FormStatus status={status} message={message} loadingLabel="Sending..." />
    </form>
  );
}

function FormStatus({
  status,
  message,
  loadingLabel,
}: {
  status: Status;
  message: string;
  loadingLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 pt-2">
      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "loading"}
      >
        {status === "loading" ? loadingLabel : "Send Enquiry"}
      </button>
      {status === "sent" && (
        <p className="text-sm text-[var(--steel)]">{message}</p>
      )}
      {status === "error" && <p className="text-sm text-red-700">{message}</p>}
    </div>
  );
}
