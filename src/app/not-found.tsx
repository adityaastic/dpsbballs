import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="mx-auto max-w-xl px-4 text-center md:px-6">
        <p className="eyebrow" style={{ color: "var(--copper)" }}>
          404
        </p>
        <h1 className="section-title mt-3">Page not found</h1>
        <p className="section-copy mx-auto">
          The page you are looking for does not exist or has moved.
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Back to home
        </Link>
      </div>
    </section>
  );
}
