import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";

import "./globals.css";

export const metadata: Metadata = {
  title: "Where careers begin and ideas become ventures.",
  description:
    "A premium discovery layer for industry databases, university ecosystems, and serious opportunities to research or build.",
  icons: {
    icon: "/branding/innovare-logo.png",
    apple: "/branding/innovare-logo.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--ink)] antialiased">
        <div className="relative isolate overflow-hidden">
          <SiteNavbar />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
