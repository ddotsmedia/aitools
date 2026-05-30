import "./globals.css";
import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import type { NavMenu } from "@hub/ui";
import { Header, Footer, Button, CompareProvider, CompareBar, LangProvider, LangSwitcher } from "@hub/ui";
import { api } from "@/lib/api";
import { COLLECTIONS } from "@/lib/collections";

const display = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://aitoolshub.ddotsmedia.com";

function safeSiteUrl(s: string): URL {
  try { return new URL(s); } catch { return new URL("https://aitoolshub.ddotsmedia.com"); }
}

export const metadata: Metadata = {
  metadataBase: safeSiteUrl(SITE),
  title: { default: "AI Tools Hub — Verified AI tools", template: "%s | AI Tools Hub" },
  description:
    "Discover, compare, verify AI tools. Every listing checked for live status, real pricing, genuine free tiers.",
  openGraph: { type: "website", siteName: "AI Tools Hub" },
  alternates: { canonical: "/" },
};

async function buildMenus(): Promise<NavMenu[]> {
  const cats = await api.categories().catch(() => []);
  const top = cats.filter((c) => c._count.tools > 0).sort((a, b) => b._count.tools - a._count.tools).slice(0, 10);
  return [
    {
      label: "Categories",
      items: top.map((c) => ({ href: `/category/${c.slug}`, label: c.name, hint: String(c._count.tools) })),
      footer: { href: "/categories", label: "All categories" },
    },
    {
      label: "Collections",
      items: COLLECTIONS.slice(0, 8).map((c) => ({ href: `/collections/${c.slug}`, label: c.title })),
      footer: { href: "/collections", label: "All collections" },
    },
  ];
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const menus = await buildMenus();
  return (
    <html lang="en" className={`dark ${display.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col bg-navy text-slate-100 antialiased">
        <LangProvider>
        <CompareProvider>
        <Header
          nav={[
            { href: "/tools", label: "Browse" },
            { href: "/changes", label: "Changes", badge: "Live" },
            { href: "/compare", label: "Compare" },
            { href: "/stack", label: "Stack Builder", badge: "AI" },
            { href: "/saved", label: "Saved" },
          ]}
          menus={menus}
          cta={
            <>
              <LangSwitcher />
              <Link href="/tools">
                <Button size="sm" variant="primary">Browse tools</Button>
              </Link>
            </>
          }
        />
        <div className="flex-1">{children}</div>
        <Footer />
        <CompareBar />
        </CompareProvider>
        </LangProvider>
      </body>
    </html>
  );
}
