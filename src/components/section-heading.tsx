type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <p className="eyebrow text-xs text-[var(--ink-soft)]">{eyebrow}</p>
      <h2 className="display-title mt-4 text-4xl font-semibold text-[var(--ink)] md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[var(--ink-soft)] md:text-lg">{description}</p>
    </div>
  );
}
