import "./globals.css";
import type { Metadata } from "next";
import { Header, Footer, Button } from "@hub/ui";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aitoolshub.example.com";
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "AI Tools Hub — Verified AI tools", template: "%s | AI Tools Hub" },
  description:
    "Discover, compare, verify AI tools. Every listing checked for live status, real pricing, genuine free tiers.",
  openGraph: { type: "website", siteName: "AI Tools Hub" },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-navy text-slate-100 antialiased">
        <Header
          cta={
            <Button size="sm" variant="primary">
              Browse tools
            </Button>
          }
        />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
