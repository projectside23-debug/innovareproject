"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useState } from "react";

import {
  JoinSession,
  clearServerSession,
  fetchJoinSession,
  isValidEmail,
  submitContactMessage
} from "@/lib/auth";

const CONTACT_EMAIL = "innovarenyu@gmail.com";

const orbitItems = [
  { label: "Research", color: "bg-[#8cc9db]" },
  { label: "CRM", color: "bg-[#d98d4c]" },
  { label: "Startups", color: "bg-[#b8d9ca]" },
  { label: "Roles", color: "bg-[#dfc16c]" },
  { label: "Builders", color: "bg-[#9f9ab8]" },
  { label: "Ideas", color: "bg-white" }
];

function ContactOrbit() {
  return (
    <div className="pointer-events-none relative mx-auto hidden h-[21rem] w-[21rem] items-center justify-center xl:order-3 xl:ml-auto xl:mr-0 xl:flex">
      <div className="absolute inset-0 rounded-full border border-dashed border-[rgba(255,255,255,0.18)]" />
      <div className="absolute inset-10 rounded-full border border-dashed border-[rgba(255,255,255,0.14)]" />
      <div className="absolute inset-20 rounded-full border border-dashed border-[rgba(255,255,255,0.12)]" />

      <div className="absolute h-[18rem] w-[18rem] rounded-full contact-orbit-spin">
        {orbitItems.slice(0, 4).map((item, index) => {
          const angle = index * 90 - 18;
          return (
            <div
              className="absolute left-1/2 top-1/2"
              key={item.label}
              style={{ transform: `rotate(${angle}deg) translateX(9rem) rotate(-${angle}deg)` }}
            >
              <span className="flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.09)] px-3 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="absolute h-[11rem] w-[11rem] rounded-full contact-orbit-spin-reverse">
        {orbitItems.slice(4).map((item, index) => {
          const angle = index * 180 + 34;
          return (
            <div
              className="absolute left-1/2 top-1/2"
              key={item.label}
              style={{ transform: `rotate(${angle}deg) translateX(5.5rem) rotate(-${angle}deg)` }}
            >
              <span className="flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.09)] px-3 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(7,20,29,0.54)] shadow-[0_0_42px_rgba(140,201,219,0.18)] backdrop-blur-xl">
        <span
          className="h-12 w-12 rounded-full bg-[conic-gradient(from_210deg,#d98d4c,#dfc16c,#8cc9db,#071426,#d98d4c)]"
          style={{ clipPath: "polygon(50% 0, 100% 86%, 50% 64%, 0 86%)" } as CSSProperties}
        />
      </div>
    </div>
  );
}

export function JoinTeamSection() {
  const [session, setSession] = useState<JoinSession | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchJoinSession()
      .then((savedSession) => {
        if (isMounted && savedSession) {
          setSession(savedSession);
          setName(savedSession.name);
          setEmail(savedSession.email);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleContactSubmit() {
    if (!name.trim()) {
      setError("Name is required.");
      setSuccessMessage("");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please use a valid email.");
      setSuccessMessage("");
      return;
    }

    if (!message.trim()) {
      setError("Please add a short message.");
      setSuccessMessage("");
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await submitContactMessage({
        email: email.trim(),
        message: message.trim(),
        name: name.trim()
      });
      setSuccessMessage(`Message saved to Neon. For urgent issues, email ${CONTACT_EMAIL}.`);
      setMessage("");
    } catch (contactError) {
      setError(contactError instanceof Error ? contactError.message : "Unable to send message.");
    }
  }

  async function handleSignOut() {
    setSession(null);
    setName("");
    setEmail("");
    setMessage("");
    setError("");
    setSuccessMessage("");

    await clearServerSession();
  }

  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(180deg,#10211f_0%,#0d2530_48%,#071426_100%)] py-20 text-white"
      id="contact"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_32%,rgba(140,201,219,0.16),transparent_24%),radial-gradient(circle_at_18%_12%,rgba(217,141,76,0.12),transparent_22%),linear-gradient(180deg,transparent_0%,rgba(7,20,38,0.78)_100%)]" />
      <div className="page-shell relative z-10">
        <div className="grid gap-10 xl:grid-cols-[0.9fr_0.82fr_0.62fr] xl:items-center">
          <div className="max-w-4xl xl:order-1 xl:max-w-none">
            <p className="eyebrow text-xs text-[rgba(255,255,255,0.64)]">Contact / Join our team</p>
            <h2 className="display-title mt-5 text-4xl font-semibold text-white md:text-5xl">
              Join a team that wants to boost entrepreneurship in universities.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[rgba(255,255,255,0.76)]">
              We welcome initiative from students, operators, founders, and campus builders who want
              to create stronger startup culture, better opportunities, and more collaboration across
              university ecosystems.
            </p>
            <a
              className="mt-5 inline-flex rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[rgba(255,255,255,0.14)]"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[rgba(255,255,255,0.84)]">
                Students
              </span>
              <span className="rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[rgba(255,255,255,0.84)]">
                Founders
              </span>
              <span className="rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[rgba(255,255,255,0.84)]">
                Operators
              </span>
              <span className="rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[rgba(255,255,255,0.84)]">
                Campus builders
              </span>
            </div>
          </div>

          <ContactOrbit />

          <div className="border border-[rgba(255,255,255,0.14)] bg-[rgba(5,15,28,0.34)] p-6 shadow-[0_18px_55px_rgba(8,20,30,0.16)] backdrop-blur-xl md:p-7 xl:order-2">
            {session ? (
              <>
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(255,255,255,0.62)]">
                  Signed in / send a message
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{session.name}</h3>
                <p className="mt-2 text-sm leading-7 text-[rgba(255,255,255,0.8)]">{session.email}</p>
                <p className="mt-4 text-sm leading-7 text-[rgba(255,255,255,0.76)]">
                  Add a note about what you want to build, research, or help with across university ecosystems.
                  Problems and messages can also go directly to {CONTACT_EMAIL}.
                </p>

                <label className="mt-6 grid gap-2">
                  <span className="text-sm text-[rgba(255,255,255,0.78)]">Message</span>
                  <textarea
                    className="min-h-32 w-full border border-[rgba(255,255,255,0.16)] bg-[rgba(7,20,29,0.38)] px-4 py-3 text-white outline-none transition placeholder:text-[rgba(255,255,255,0.38)] focus:border-[rgba(255,255,255,0.28)]"
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Tell us what you want to help build, research, or launch."
                    value={message}
                  />
                </label>

                {error ? <p className="mt-4 text-sm text-[#ffd0c4]">{error}</p> : null}
                {successMessage ? <p className="mt-4 text-sm text-[#cdeee4]">{successMessage}</p> : null}

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    className="rounded-md bg-[rgba(7,20,29,0.7)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[rgba(7,20,29,0.86)]"
                    onClick={handleContactSubmit}
                    type="button"
                  >
                    Send message
                  </button>
                  <Link
                    className="rounded-md border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-5 py-3 text-sm text-white transition hover:bg-[rgba(255,255,255,0.14)]"
                    href={`mailto:${CONTACT_EMAIL}?subject=Innovare%20message`}
                  >
                    Email directly
                  </Link>
                  <Link
                    className="rounded-md border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-5 py-3 text-sm text-white transition hover:bg-[rgba(255,255,255,0.14)]"
                    href="/universities"
                  >
                    Explore opportunities
                  </Link>
                  <button
                    className="rounded-md border border-[rgba(255,255,255,0.14)] bg-transparent px-5 py-3 text-sm text-[rgba(255,255,255,0.84)] transition hover:bg-[rgba(255,255,255,0.06)]"
                    onClick={handleSignOut}
                    type="button"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(255,255,255,0.62)]">
                  Contact us
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  Send your email and a message.
                </h3>
                <p className="mt-2 text-sm leading-7 text-[rgba(255,255,255,0.76)]">
                  Share what you are researching, building, or hoping to contribute. Your note is saved
                  to Neon, and urgent problems can go directly to {CONTACT_EMAIL}.
                </p>

                <div className="mt-6 grid gap-3">
                  <label className="grid gap-2">
                    <span className="text-sm text-[rgba(255,255,255,0.78)]">Name</span>
                    <input
                      className="w-full border border-[rgba(255,255,255,0.16)] bg-[rgba(7,20,29,0.38)] px-4 py-3 text-white outline-none transition placeholder:text-[rgba(255,255,255,0.38)] focus:border-[rgba(255,255,255,0.28)]"
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your name"
                      value={name}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm text-[rgba(255,255,255,0.78)]">Email</span>
                    <input
                      className="w-full border border-[rgba(255,255,255,0.16)] bg-[rgba(7,20,29,0.38)] px-4 py-3 text-white outline-none transition placeholder:text-[rgba(255,255,255,0.38)] focus:border-[rgba(255,255,255,0.28)]"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      value={email}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm text-[rgba(255,255,255,0.78)]">Message</span>
                    <textarea
                      className="min-h-32 w-full border border-[rgba(255,255,255,0.16)] bg-[rgba(7,20,29,0.38)] px-4 py-3 text-white outline-none transition placeholder:text-[rgba(255,255,255,0.38)] focus:border-[rgba(255,255,255,0.28)]"
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Tell us what you want to build, research, or help with."
                      value={message}
                    />
                  </label>
                </div>

                {error ? <p className="mt-4 text-sm text-[#ffd0c4]">{error}</p> : null}
                {successMessage ? <p className="mt-4 text-sm text-[#cdeee4]">{successMessage}</p> : null}

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    className="rounded-md bg-[rgba(7,20,29,0.7)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[rgba(7,20,29,0.86)]"
                    onClick={handleContactSubmit}
                    type="button"
                  >
                    Send message
                  </button>
                  <Link
                    className="rounded-md border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-5 py-3 text-sm text-white transition hover:bg-[rgba(255,255,255,0.14)]"
                    href={`mailto:${CONTACT_EMAIL}?subject=Innovare%20message`}
                  >
                    Email directly
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
