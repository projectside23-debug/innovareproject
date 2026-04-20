"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface GlowCardProps {
  children?: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const glowColorMap = {
  blue: { base: 205, spread: 115 },
  purple: { base: 250, spread: 120 },
  green: { base: 155, spread: 95 },
  red: { base: 0, spread: 120 },
  orange: { base: 28, spread: 105 }
};

const sizeMap = {
  sm: "h-64 w-48",
  md: "h-80 w-64",
  lg: "h-96 w-80"
};

const glowStyles = `
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }

  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 68) * 1%) calc(var(--lightness, 54) * 1%) / var(--border-spot-opacity, 0.72)), transparent 100%
    );
    filter: brightness(1.45);
  }

  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity, 0.45)), transparent 100%
    );
  }

  [data-glow] [data-glow] {
    position: absolute;
    inset: 0;
    will-change: filter;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    filter: blur(calc(var(--border-size) * 8));
    background: none;
    pointer-events: none;
    border: none;
  }

  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }
`;

export function GlowCard({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (event: PointerEvent) => {
      const { clientX: x, clientY: y } = event;

      if (cardRef.current) {
        cardRef.current.style.setProperty("--x", x.toFixed(2));
        cardRef.current.style.setProperty("--xp", (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty("--y", y.toFixed(2));
        cardRef.current.style.setProperty("--yp", (y / window.innerHeight).toFixed(2));
      }
    };

    document.addEventListener("pointermove", syncPointer);
    return () => document.removeEventListener("pointermove", syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor];
  const inlineStyles: CSSProperties & Record<string, string | number> = {
    "--backdrop": "hsl(210 24% 98% / 0.72)",
    "--backup-border": "var(--backdrop)",
    "--base": base,
    "--border": 2,
    "--border-size": "calc(var(--border, 2) * 1px)",
    "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
    "--outer": 1,
    "--radius": 24,
    "--size": 190,
    "--spotlight-size": "calc(var(--size, 150) * 1px)",
    "--spread": spread,
    backgroundAttachment: "fixed",
    backgroundColor: "var(--backdrop, transparent)",
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 68) * 1%) calc(var(--lightness, 64) * 1%) / var(--bg-spot-opacity, 0.08)), transparent
    )`,
    backgroundPosition: "50% 50%",
    backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
    border: "var(--border-size) solid var(--backup-border)",
    position: "relative",
    touchAction: "none"
  };

  if (width !== undefined) {
    inlineStyles.width = typeof width === "number" ? `${width}px` : width;
  }

  if (height !== undefined) {
    inlineStyles.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: glowStyles }} />
      <div
        className={`${customSize ? "" : `${sizeMap[size]} aspect-[3/4]`} relative grid gap-4 rounded-2xl p-4 shadow-[0_1rem_2rem_-1rem_black] backdrop-blur-[5px] ${className}`}
        data-glow
        ref={cardRef}
        style={inlineStyles}
      >
        <div data-glow ref={innerRef} />
        {children}
      </div>
    </>
  );
}
