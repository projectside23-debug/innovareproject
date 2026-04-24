"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useState } from "react";

import { JoinSession, fetchJoinSession, isValidEmail, loginWithNeon } from "@/lib/auth";

import { CurvedPattern } from "./curved-pattern";

type AuthGateProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export function AuthGate({
  children,
  title = "Login to view the database.",
  description = "Create a local Innovare session before opening the research database and saved-company workflow."
}: AuthGateProps) {
  const [session, setSession] = useState<JoinSession | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchJoinSession()
      .then((nextSession) => {
        if (isMounted) {
          setSession(nextSession);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setHasHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogin() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please use a valid email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const nextSession = await loginWithNeon({
        email: email.trim(),
        name: name.trim(),
        password
      });
      setSession(nextSession);
      setPassword("");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hasHydrated) {
    return (
      <section className="page-shell pb-12 pt-6 md:pb-20 md:pt-8">
        <div className="relative overflow-hidden bg-[#071426] p-5 text-white md:p-8">Loading...</div>
      </section>
    );
  }

  if (session) {
    return <>{children}</>;
  }

  return (
    <section className="page-shell pb-12 pt-6 md:pb-20 md:pt-14">
      <div className="relative overflow-hidden bg-[#071426] p-4 text-white shadow-[0_36px_100px_rgba(4,12,30,0.22)] md:p-10">
        <CurvedPattern />

        <div className="relative z-10 grid gap-5 md:gap-8 lg:grid-cols-[1fr_26rem] lg:items-center">
          <div>
            <p className="eyebrow text-xs text-[rgba(255,255,255,0.62)]">Login required</p>
            <h1 className="display-title mt-3 max-w-3xl text-3xl font-semibold text-white md:mt-4 md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgba(255,255,255,0.74)] md:mt-4 md:text-base md:leading-7">
              {description}
            </p>

            <div className="relative mt-4 min-h-[8.5rem] overflow-hidden rounded-[1.2rem] border border-[rgba(255,255,255,0.12)] md:mt-8 md:min-h-[16rem] md:rounded-[1.8rem]">
              <Image
                alt="Mountain landscape at sunrise"
                className="object-cover"
                fill
                src="/images/discovery-mountain.jpg"
              />
              <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(5,14,28,0.66),rgba(5,14,28,0.16),rgba(5,14,28,0.72))]" />
              <p className="absolute bottom-4 left-4 max-w-lg text-sm font-semibold leading-5 text-white md:bottom-5 md:left-5 md:text-lg md:leading-7">
                Discovery starts after sign-in so the database feels like a private workspace.
              </p>
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] p-4 backdrop-blur-xl md:p-5">
            <label className="grid gap-2">
              <span className="text-sm text-[rgba(255,255,255,0.78)]">Name</span>
              <input
                className="border border-[rgba(255,255,255,0.16)] bg-[rgba(6,16,28,0.55)] px-4 py-2.5 text-sm text-white outline-none placeholder:text-[rgba(255,255,255,0.34)] md:py-3"
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                value={name}
              />
            </label>
            <label className="mt-2.5 grid gap-2 md:mt-3">
              <span className="text-sm text-[rgba(255,255,255,0.78)]">Email</span>
              <input
                className="border border-[rgba(255,255,255,0.16)] bg-[rgba(6,16,28,0.55)] px-4 py-2.5 text-sm text-white outline-none placeholder:text-[rgba(255,255,255,0.34)] md:py-3"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>
            <label className="mt-2.5 grid gap-2 md:mt-3">
              <span className="text-sm text-[rgba(255,255,255,0.78)]">Password</span>
              <input
                className="border border-[rgba(255,255,255,0.16)] bg-[rgba(6,16,28,0.55)] px-4 py-2.5 text-sm text-white outline-none placeholder:text-[rgba(255,255,255,0.34)] md:py-3"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                type="password"
                value={password}
              />
            </label>
            {error ? <p className="mt-3 text-sm text-[#ffd0c4]">{error}</p> : null}
            <button
              className="mt-4 w-full rounded-full bg-[linear-gradient(90deg,#ff8f52_0%,#248cff_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(36,140,255,0.24)] disabled:cursor-not-allowed disabled:opacity-60 md:mt-5 md:py-3"
              disabled={isSubmitting}
              onClick={handleLogin}
              type="button"
            >
              {isSubmitting ? "Opening database..." : "Login and open database"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
