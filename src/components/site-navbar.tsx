"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/industry", label: "Industry Database" },
  { href: "/universities", label: "University Opportunities" },
  { href: "/crm", label: "CRM" },
  { href: "/#about", label: "Mission" },
  { href: "/#contact", label: "Contact" }
];

export function SiteNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const onDarkHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 px-4 pt-5 md:px-6 ${isHome ? "-mb-[5.9rem] md:-mb-[6.4rem]" : ""}`}>
      <div
        className={`relative mx-auto flex w-full max-w-[84rem] items-center justify-between overflow-hidden rounded-full border px-5 py-3.5 transition duration-300 md:px-8 ${
          onDarkHero
            ? "border-[rgba(255,255,255,0.22)] bg-[rgba(245,248,252,0.16)] shadow-[0_22px_70px_rgba(4,10,18,0.22)] backdrop-blur-2xl"
            : "border-[rgba(255,255,255,0.62)] bg-[rgba(255,255,255,0.72)] shadow-[0_20px_60px_rgba(20,21,25,0.08)] backdrop-blur-2xl"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 ${
            onDarkHero
              ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.26)_0%,rgba(255,255,255,0.06)_45%,rgba(255,255,255,0.04)_100%)]"
              : "bg-[linear-gradient(180deg,rgba(255,255,255,0.68)_0%,rgba(255,255,255,0.2)_44%,rgba(255,255,255,0.1)_100%)]"
          }`}
        />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[rgba(255,255,255,0.72)] opacity-70" />

        <Link className="flex items-center gap-3" href="/">
          <span
            className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border p-1 ${
              onDarkHero
                ? "border-[rgba(255,255,255,0.24)] bg-[rgba(255,255,255,0.14)] shadow-[0_16px_35px_rgba(4,10,18,0.18)]"
                : "border-[rgba(255,255,255,0.7)] bg-[rgba(255,255,255,0.78)] shadow-[0_14px_32px_rgba(10,20,32,0.12)]"
            }`}
          >
            <Image
              alt="Innovare logo"
              className="h-full w-full rounded-full object-cover"
              height={56}
              src="/branding/innovare-logo.png"
              width={56}
            />
          </span>
          <div className="relative z-10">
            <p className={`text-lg font-semibold tracking-[0.2em] ${onDarkHero ? "text-white" : "text-[var(--ink)]"}`}>
              Innovare
            </p>
            <p
              className={`text-[0.82rem] uppercase tracking-[0.24em] ${
                onDarkHero ? "text-[rgba(255,255,255,0.8)]" : "text-[rgba(11,24,35,0.72)]"
              }`}
            >
              Ecosystem Database
            </p>
          </div>
        </Link>

        <nav className="relative z-10 hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : link.href === "/industry"
                  ? pathname.startsWith("/industry")
                  : link.href === "/crm"
                    ? pathname.startsWith("/crm")
                  : pathname === link.href;

            return (
              <Link
                className={`rounded-full px-5 py-3 text-base font-medium transition ${
                  onDarkHero
                    ? active
                      ? "bg-[rgba(255,255,255,0.18)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                      : "text-[rgba(255,255,255,0.92)] hover:bg-[rgba(255,255,255,0.12)] hover:text-white"
                    : active
                      ? "bg-[rgba(255,255,255,0.82)] text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]"
                      : "text-[rgba(11,24,35,0.82)] hover:bg-[rgba(255,255,255,0.52)] hover:text-[var(--ink)]"
                }`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
