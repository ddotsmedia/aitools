import * as React from "react";
import { cn } from "./cn";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    title: "Discover",
    links: [
      { href: "/tools",       label: "All tools" },
      { href: "/collections", label: "Collections" },
      { href: "/compare",     label: "Compare tools" },
      { href: "/tools?filter=free", label: "Free tools" },
    ],
  },
  {
    title: "Build",
    links: [
      { href: "/stack", label: "Stack Builder" },
      { href: "/api",   label: "Public API" },
      { href: "/mcp",   label: "MCP server catalog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/methodology", label: "Verification method" },
      { href: "/changelog",   label: "Changelog" },
      { href: "/blog",        label: "Blog" },
      { href: "/submit",      label: "Submit a tool" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about",   label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms",   label: "Terms of use" },
    ],
  },
];

export function Footer({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t border-white/10 bg-navy", className)} {...props}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">

          {/* Brand col — spans 2 on md */}
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              The verified AI-tools directory. Every listing is machine-checked
              for live status, real pricing, and genuine free tiers.
            </p>
            {/* Verification trust badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              {["Live-checked", "Real pricing", "Free-tier verified"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-slate-400 transition-colors hover:text-slate-100"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} AI Tools Hub — a{" "}
            <a href="https://ddotsmedia.com" className="hover:text-teal">Ddotsmedia</a> project
          </p>
          <div className="flex gap-4">
            {[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms",   label: "Terms" },
              { href: "/sitemap.xml", label: "Sitemap" },
            ].map((l) => (
              <a key={l.href} href={l.href} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
