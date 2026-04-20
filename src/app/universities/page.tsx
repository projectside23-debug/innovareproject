import Image from "next/image";

import { UniversityOpportunitiesBoard } from "@/components/university-opportunities-board";

export default function UniversitiesPage() {
  return (
    <div className="pt-8">
      <section className="page-shell pb-12 pt-8 md:pt-14">
        <div className="relative overflow-hidden rounded-[2.4rem] border border-[rgba(255,255,255,0.16)] bg-[#081723] p-6 text-white shadow-[0_30px_90px_rgba(8,20,30,0.18)] md:p-10">
          <Image
            alt="New York skyline at night"
            className="object-cover"
            fill
            priority
            src="/images/nyc/night-city.jpg"
          />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(4,12,18,0.88)_14%,rgba(7,20,29,0.58)_48%,rgba(4,12,18,0.84)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(87,192,199,0.18),transparent_24%)]" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-end">
            <div className="max-w-3xl">
              <p className="eyebrow text-xs text-[rgba(255,255,255,0.68)]">University Opportunities</p>
              <h1 className="display-title mt-4 text-4xl font-semibold text-white md:text-5xl">
                A place to post interest-driven opportunities across university ecosystems.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[rgba(255,255,255,0.76)] md:text-lg">
                A university ecosystem layer for startup help, project-based tasks, and more selective
                ways to grow or work in a startup.
              </p>
            </div>

            <div className="rounded-[1.7rem] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-[rgba(255,255,255,0.62)]">Explore opportunities</p>
              <p className="mt-3 text-sm leading-6 text-[rgba(255,255,255,0.8)]">
                Browse campus ecosystems, discover startup-oriented openings, and surface project-based
                roles that feel more intentional than a generic board.
              </p>
            </div>
          </div>
        </div>
      </section>

      <UniversityOpportunitiesBoard />
    </div>
  );
}
