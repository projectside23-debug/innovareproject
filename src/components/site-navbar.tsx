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

const mobileLinks = links.slice(0, 4);

function isActivePath(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : href === "/industry"
      ? pathname.startsWith("/industry")
      : href === "/crm"
        ? pathname.startsWith("/crm")
        : href === "/universities"
          ? pathname.startsWith("/universities") || pathname.startsWith("/nyu")
          : pathname === href;
}

export function SiteNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = pathname === "/";
  const onDarkHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={`sticky top-0 z-50 px-3 pt-3 md:px-6 md:pt-5 ${isHome ? "-mb-[4.75rem] md:-mb-[6.4rem]" : ""}`}>
        <div
          className={`relative mx-auto flex w-full max-w-[84rem] items-center justify-between overflow-hidden rounded-[1.8rem] border px-4 py-3 transition duration-300 md:rounded-full md:px-8 md:py-3.5 ${
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

          <Link className="flex min-w-0 items-center gap-3" href="/">
            <span
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border p-1 md:h-14 md:w-14 ${
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
            <div className="relative z-10 min-w-0">
              <p
                className={`truncate text-base font-semibold tracking-[0.16em] md:text-lg md:tracking-[0.2em] ${
                  onDarkHero ? "text-white" : "text-[var(--ink)]"
                }`}
              >
                Innovare
              </p>
              <p
                className={`hidden text-[0.82rem] uppercase tracking-[0.24em] md:block ${
                  onDarkHero ? "text-[rgba(255,255,255,0.8)]" : "text-[rgba(11,24,35,0.72)]"
                }`}
              >
                Ecosystem Database
              </p>
            </div>
          </Link>

          <button
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className={`relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border transition md:hidden ${
              onDarkHero
                ? "border-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.12)] text-white"
                : "border-[rgba(11,24,35,0.1)] bg-[rgba(255,255,255,0.78)] text-[var(--ink)]"
            }`}
            onClick={() => setMobileMenuOpen((current) => !current)}
            type="button"
          >
            <span className="flex flex-col gap-1.5">
              <span className={`block h-0.5 w-5 rounded-full transition ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""} ${onDarkHero ? "bg-white" : "bg-[var(--ink)]"}`} />
              <span className={`block h-0.5 w-5 rounded-full transition ${mobileMenuOpen ? "opacity-0" : ""} ${onDarkHero ? "bg-white" : "bg-[var(--ink)]"}`} />
              <span className={`block h-0.5 w-5 rounded-full transition ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""} ${onDarkHero ? "bg-white" : "bg-[var(--ink)]"}`} />
            </span>
          </button>

          <nav className="relative z-10 hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const active = isActivePath(pathname, link.href);

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

        {mobileMenuOpen ? (
          <div className="mx-auto mt-3 max-w-[84rem] md:hidden">
            <nav
              className={`overflow-hidden rounded-[1.8rem] border px-3 py-3 shadow-[0_24px_60px_rgba(6,12,20,0.16)] backdrop-blur-2xl ${
                onDarkHero
                  ? "border-[rgba(255,255,255,0.18)] bg-[rgba(8,20,32,0.88)]"
                  : "border-[rgba(255,255,255,0.62)] bg-[rgba(255,255,255,0.9)]"
              }`}
            >
              <div className="grid gap-2">
                {links.map((link) => {
                  const active = isActivePath(pathname, link.href);

                  return (
                    <Link
                      className={`rounded-[1rem] px-4 py-3 text-sm font-medium transition ${
                        onDarkHero
                          ? active
                            ? "bg-[rgba(255,255,255,0.14)] text-white"
                            : "text-[rgba(255,255,255,0.88)]"
                          : active
                            ? "bg-[rgba(10,26,39,0.08)] text-[var(--ink)]"
                            : "text-[rgba(11,24,35,0.82)]"
                      }`}
                      href={link.href}
                      key={link.href}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-50 md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-2 rounded-[1.8rem] border border-[rgba(255,255,255,0.68)] bg-[rgba(255,255,255,0.88)] p-2 shadow-[0_26px_70px_rgba(9,18,28,0.16)] backdrop-blur-2xl">
          {mobileLinks.map((link) => {
            const active = isActivePath(pathname, link.href);

            return (
              <Link
                className={`flex min-w-0 flex-1 rounded-[1.2rem] px-3 py-3 text-center text-[0.78rem] font-medium leading-tight transition ${
                  active
                    ? "bg-[linear-gradient(135deg,#0a1a27_0%,#143146_100%)] text-white shadow-[0_12px_28px_rgba(10,24,38,0.22)]"
                    : "text-[rgba(11,24,35,0.78)]"
                }`}
                href={link.href}
                key={link.href}
              >
                <span className="mx-auto">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
