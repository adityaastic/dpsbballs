type ComingSoonProps = {
  label?: string;
  className?: string;
  aspect?: "hero" | "wide" | "square" | "portrait";
};

const aspectClass = {
  hero: "aspect-[16/9] md:aspect-[21/9] min-h-[280px] md:min-h-[420px]",
  wide: "aspect-[16/9]",
  square: "aspect-square",
  portrait: "aspect-[4/5]",
};

export default function ComingSoon({
  label = "Image coming soon",
  className = "",
  aspect = "wide",
}: ComingSoonProps) {
  return (
    <div
      className={`coming-soon relative overflow-hidden ${aspectClass[aspect]} ${className}`}
      role="img"
      aria-label={label}
    >
      <div className="coming-soon-grid absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="coming-soon-orb" aria-hidden />
        <p className="font-display text-sm uppercase tracking-[0.35em] text-[var(--copper)]">
          Coming Soon
        </p>
        <p className="max-w-xs text-sm text-[var(--muted)]">{label}</p>
      </div>
    </div>
  );
}
