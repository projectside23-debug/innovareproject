import type { CSSProperties } from "react";

type CurvedPatternProps = {
  variant?: "blue" | "green" | "copper";
};

const variantClasses = {
  blue: {
    base: "bg-[#071426]",
    glow:
      "bg-[radial-gradient(circle_at_12%_16%,rgba(255,143,82,0.15),transparent_25%),radial-gradient(circle_at_84%_12%,rgba(96,205,255,0.18),transparent_28%)]",
    ribbonA: "bg-[linear-gradient(90deg,rgba(255,120,69,0.58),rgba(255,120,69,0.02))]",
    ribbonB: "bg-[linear-gradient(90deg,rgba(73,183,255,0.06),rgba(65,157,255,0.66))]"
  },
  green: {
    base: "bg-[#10211f]",
    glow:
      "bg-[radial-gradient(circle_at_12%_16%,rgba(255,176,102,0.14),transparent_25%),radial-gradient(circle_at_84%_12%,rgba(98,214,196,0.18),transparent_28%)]",
    ribbonA: "bg-[linear-gradient(90deg,rgba(255,153,83,0.5),rgba(255,153,83,0.02))]",
    ribbonB: "bg-[linear-gradient(90deg,rgba(72,206,177,0.08),rgba(72,206,177,0.56))]"
  },
  copper: {
    base: "bg-[#1b0e07]",
    glow:
      "bg-[radial-gradient(circle_at_12%_16%,rgba(255,176,102,0.18),transparent_25%),radial-gradient(circle_at_84%_12%,rgba(87,164,255,0.15),transparent_28%)]",
    ribbonA: "bg-[linear-gradient(90deg,rgba(255,128,71,0.6),rgba(255,128,71,0.02))]",
    ribbonB: "bg-[linear-gradient(90deg,rgba(55,142,255,0.06),rgba(55,142,255,0.5))]"
  }
};

export function CurvedPattern({ variant = "blue" }: CurvedPatternProps) {
  const classes = variantClasses[variant];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${classes.base}`}>
      <div className={`pattern-glow absolute inset-0 ${classes.glow}`} />
      <div
        className={`pattern-ribbon absolute -bottom-44 -left-28 h-80 w-[52rem] rounded-[100%] ${classes.ribbonA}`}
        style={{ "--ribbon-rotate": "-15deg" } as CSSProperties}
      />
      <div
        className={`pattern-ribbon absolute -bottom-28 right-[-16rem] h-[28rem] w-[52rem] rounded-[100%] ${classes.ribbonB}`}
        style={{ "--ribbon-rotate": "-32deg", animationDelay: "-3s" } as CSSProperties}
      />
    </div>
  );
}
