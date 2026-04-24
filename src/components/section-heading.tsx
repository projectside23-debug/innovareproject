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
      <h2 className="display-title mt-3 text-3xl font-semibold text-[var(--ink)] md:mt-4 md:text-5xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)] md:mt-4 md:text-lg md:leading-7">
        {description}
      </p>
    </div>
  );
}
