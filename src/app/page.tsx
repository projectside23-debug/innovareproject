import Image from "next/image";
import Link from "next/link";

import { JoinTeamSection } from "@/components/join-team-section";
import { SectionHeading } from "@/components/section-heading";
import { ShaderShowcase } from "@/components/shader-showcase";

const trustedStats = [
  {
    value: "977+",
    label: "live organization profiles",
    cardClass: "bg-[linear-gradient(135deg,#f3f8fb_0%,#ffffff_100%)]",
    valueClass: "text-[#1f6f8f]"
  },
  {
    value: "6",
    label: "starter university ecosystems",
    cardClass: "bg-[linear-gradient(135deg,#f8f4ee_0%,#ffffff_100%)]",
    valueClass: "text-[#9c6530]"
  },
  {
    value: "2",
    label: "ways to browse the database",
    cardClass: "bg-[linear-gradient(135deg,#f7f7ef_0%,#ffffff_100%)]",
    valueClass: "text-[#8b7742]"
  },
  {
    value: "Open",
    label: "room for new roles and ventures",
    cardClass: "bg-[linear-gradient(135deg,#eef7f4_0%,#ffffff_100%)]",
    valueClass: "text-[#2f7367]"
  }
];

const ecosystemLabels = [
  { label: "Private capital", className: "border-[#8cc9db]/24 bg-[#8cc9db]/8 text-[#d9eef4]" },
  { label: "Think tanks", className: "border-[#d9a15f]/24 bg-[#d9a15f]/8 text-[#f4dfc4]" },
  { label: "Studios", className: "border-[#c17869]/24 bg-[#c17869]/8 text-[#efd3ce]" },
  { label: "Research labs", className: "border-[#8fbda9]/24 bg-[#8fbda9]/8 text-[#d8ebe3]" },
  { label: "Filming teams", className: "border-[#9f9ab8]/24 bg-[#9f9ab8]/8 text-[#dedceb]" },
  { label: "University builders", className: "border-white/16 bg-white/8 text-white" }
];

const quickCards = [
  {
    title: "Research first",
    copy: "Find the firms, labs, and teams that actually matter before you reach out.",
    className: "bg-[linear-gradient(135deg,#ffffff_0%,#eaf8ff_100%)]"
  },
  {
    title: "Build with intent",
    copy: "Use the university ecosystem to help grow your startup or work in a startup.",
    className: "bg-[linear-gradient(135deg,#ffffff_0%,#fff2df_100%)]"
  },
  {
    title: "Move between worlds",
    copy: "Track industries and campus ecosystems in one product instead of scattered tabs.",
    className: "bg-[linear-gradient(135deg,#ffffff_0%,#ecfff7_100%)]"
  }
];

const exploreCards = [
  {
    eyebrow: "Industry Database",
    title: "Explore organizations with more taste and less clutter.",
    copy:
      "Search firms, studios, think tanks, labs, filming organizations, and other groups through a cleaner research surface.",
    href: "/industry",
    cta: "Open industry database",
    className: "bg-[linear-gradient(135deg,#ffffff_0%,#edf8ff_54%,#fff5e8_100%)]"
  },
  {
    eyebrow: "University Opportunities",
    title: "Turn interest into projects, roles, and early venture momentum.",
    copy:
      "The opportunity board starts open on purpose so strong posts can define the culture from the beginning.",
    href: "/universities",
    cta: "Open university opportunities",
    className: "bg-[linear-gradient(135deg,#ffffff_0%,#f3edff_48%,#ecfff7_100%)]"
  }
];

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[#07141d] text-white">
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        <div className="hero-grid absolute inset-0 opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(4,12,18,0.94)_18%,rgba(6,17,25,0.74)_50%,rgba(4,12,18,0.9)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(87,192,199,0.18),transparent_26%),radial-gradient(circle_at_22%_14%,rgba(255,255,255,0.08),transparent_18%)]" />

        <div className="page-shell relative z-10 pb-24 pt-36 md:pb-28 md:pt-40">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] px-4 py-2 backdrop-blur-xl">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.12)]">
                <Image
                  alt="Innovare logo"
                  className="h-full w-full object-cover"
                  height={32}
                  src="/branding/innovare-logo.png"
                  width={32}
                />
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-[rgba(255,255,255,0.68)]">
                Innovare / ecosystem platform
              </p>
            </div>

            <h1 className="display-title mt-6 text-[3.6rem] font-semibold leading-[0.9] text-white md:text-[5.9rem] lg:text-[6.7rem]">
              <span className="block">Where careers</span>
              <span className="block">
                <span className="bg-[linear-gradient(90deg,#9dd8eb_0%,#d9eef4_100%)] bg-clip-text text-transparent">
                  begin
                </span>{" "}
                and ideas
              </span>
              <span className="block bg-[linear-gradient(90deg,#d98d4c_0%,#dfc16c_48%,#b8d9ca_100%)] bg-clip-text text-transparent">
                become ventures.
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[rgba(255,255,255,0.74)] md:text-lg md:leading-8">
              Discover firms, research, project-based tasks, and university startups, all in one
              platform built for ambitious students, operators, and founders.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-start gap-2">
              <Link
                className="rounded-full bg-[#071426] px-7 py-3 text-sm font-semibold text-white shadow-[0_0_34px_rgba(140,201,219,0.26),0_18px_48px_rgba(4,12,18,0.24)] ring-1 ring-[#8cc9db]/25 transition hover:-translate-y-0.5 hover:bg-[#0b2031]"
                href="/industry"
              >
                Explore industry database
              </Link>
              <Link
                className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-6 py-3 text-sm text-white transition hover:bg-[rgba(255,255,255,0.12)]"
                href="/universities"
              >
                Explore university opportunities
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {ecosystemLabels.map((item) => (
                <span
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] backdrop-blur-sm ${item.className}`}
                  key={item.label}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell relative z-10 -mt-10 pb-8 md:-mt-14">
        <div className="grid gap-4 rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_26px_80px_rgba(8,20,30,0.08)] md:grid-cols-4 md:p-6">
          {trustedStats.map((stat) => (
            <article
              className={`rounded-[1.5rem] border border-[rgba(11,24,35,0.08)] p-5 shadow-[0_14px_42px_rgba(8,20,30,0.05)] ${stat.cardClass}`}
              key={stat.label}
            >
              <p className={`text-4xl font-semibold tracking-[-0.06em] ${stat.valueClass}`}>{stat.value}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell pb-8">
        <article className="relative min-h-[18rem] overflow-hidden rounded-[2.2rem] border border-[var(--line)] shadow-[0_28px_90px_rgba(8,20,30,0.12)] md:min-h-[22rem]">
          <Image
            alt="New York skyline at night"
            className="object-cover"
            fill
            src="/images/nyc/night-city.jpg"
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(5,14,20,0.76)_14%,rgba(5,14,20,0.34)_48%,rgba(5,14,20,0.78)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(96,205,214,0.16),transparent_22%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <p className="eyebrow text-xs text-[rgba(255,255,255,0.66)]">New York / capital / building</p>
            <p className="mt-3 max-w-2xl text-2xl font-semibold leading-8 text-white md:text-3xl md:leading-10">
              Built for ambitious people moving through cities, campuses, and the earliest stage of new ventures.
            </p>
          </div>
        </article>
      </section>

      <section className="page-shell py-20" id="about">
        <SectionHeading
          description="Innovare is meant to function like an innovation ecosystem: part research surface, part opportunity layer, part launch point."
          eyebrow="Mission / About"
          title="A cleaner place to discover who matters and what to build next."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="surface-card rounded-[2rem] p-6 md:p-8">
            <p className="text-lg leading-8 text-[var(--ink-soft)]">
              The goal is simple: make it easier for ambitious people to move from interest into action,
              whether that means research, outreach, early work experience, or building something of
              their own.
            </p>

            <div className="mt-8 grid gap-4">
              {quickCards.map((card) => (
                <div className={`rounded-[1.5rem] border border-[var(--line)] p-5 ${card.className}`} key={card.title}>
                  <p className="text-sm font-semibold text-[var(--ink)]">{card.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{card.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <article className="relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-[var(--line)] shadow-[0_30px_90px_rgba(8,20,30,0.12)]">
            <Image
              alt="Manhattan Bridge in daylight framed by red-brick buildings"
              className="object-cover"
              fill
              src="/images/nyc/manhattan-bridge.jpg"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,30,0.02)_10%,rgba(8,20,30,0.55)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-[rgba(255,255,255,0.72)]">
                Ground level view
              </p>
              <p className="mt-3 max-w-lg text-2xl font-semibold leading-8 text-white">
                Better discovery should feel close to real cities, real people, and real starting points.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-[var(--background-strong)] py-20" id="why">
        <div className="page-shell">
          <SectionHeading
            description="A premium interface matters, but the point is practical: help people find stronger directions sooner."
            eyebrow="Why Innovare"
            title="Less noise. Better signals. More momentum."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="surface-card rounded-[1.8rem] p-6">
              <p className="display-title text-2xl font-semibold text-[#117ea0]">For serious scanning</p>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                Search, filter, and browse across categories without flattening different ecosystems into the same feed.
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-[rgba(180,95,24,0.12)] bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_100%)] p-6 shadow-[0_28px_84px_rgba(180,95,24,0.08)]">
              <p className="display-title text-2xl font-semibold text-[#b45f18]">For early-career moves</p>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                Use it to spot the kinds of firms, projects, and working opportunities that rarely show up in the right place.
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-[rgba(20,116,95,0.12)] bg-[linear-gradient(180deg,#effff8_0%,#ffffff_100%)] p-6 shadow-[0_28px_84px_rgba(20,116,95,0.08)]">
              <p className="display-title text-2xl font-semibold text-[#14745f]">For venture-minded people</p>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                The mission is to increase entrepreneurship and collaboration, not just organize information.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-20" id="industry">
        <SectionHeading
          description="Two core pages, one design language, and a clearer path from research into action."
          eyebrow="Explore"
          title="Go deeper into the database or start shaping the opportunity layer."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {exploreCards.map((card) => (
            <article
              className={`overflow-hidden rounded-[2rem] border border-[var(--line)] p-6 shadow-[0_24px_80px_rgba(10,20,32,0.08)] md:p-8 ${card.className}`}
              key={card.title}
            >
              <p className="eyebrow text-xs text-[var(--ink-soft)]">{card.eyebrow}</p>
              <h3 className="display-title mt-4 max-w-xl text-4xl font-semibold text-[var(--ink)]">
                {card.title}
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">{card.copy}</p>
              <Link className="cta-dark mt-8 inline-flex rounded-full px-5 py-3 text-sm transition" href={card.href}>
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <JoinTeamSection />
      <ShaderShowcase />
    </div>
  );
}
