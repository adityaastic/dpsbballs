"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "sent" | "error";

export default function CareerForm() {
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
        body: JSON.stringify({ formType: "career", ...data }),
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
        <label className="block md:col-span-2">
          <span className="field-label">Post Applied For *</span>
          <input name="post" required className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="field-label">Your Name *</span>
          <input name="name" required className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="field-label">Email *</span>
          <input
            name="email"
            type="email"
            required
            className="field-input mt-1.5"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="field-label">Address</span>
          <input name="address" className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="field-label">City</span>
          <input name="city" className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="field-label">Pin / Zip</span>
          <input name="zip" className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="field-label">Telephone</span>
          <input name="telephone" className="field-input mt-1.5" />
        </label>
        <label className="block">
          <span className="field-label">Mobile</span>
          <input name="mobile" className="field-input mt-1.5" />
        </label>
      </div>
      <label className="block">
        <span className="field-label">Paste Your Resume / Profile Summary *</span>
        <textarea
          name="resume"
          rows={8}
          required
          className="field-input mt-1.5 min-h-[160px] resize-y"
          placeholder="Education, experience, skills..."
        />
      </label>
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Submitting..." : "Submit Application"}
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
