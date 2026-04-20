"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/industry", label: "Overview" },
  { href: "/industry/finance", label: "Finance" },
  { href: "/industry/film", label: "Film" }
];

export function IndustrySectionNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {links.map((link) => {
        const active = pathname === link.href;

        return (
          <Link
            className={`rounded-full px-4 py-2 text-sm transition ${
              active
                ? "bg-[var(--surface-dark)] text-white shadow-[0_14px_36px_rgba(8,20,30,0.16)]"
                : "cta-light text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]"
            }`}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
