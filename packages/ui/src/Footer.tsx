import * as React from "react";
import { cn } from "./cn";
import { Logo } from "./Logo";

const COLUMNS = [
  { title: "Discover", links: [
    { href: "/tools", label: "All tools" },
    { href: "/compare", label: "Compare" },
    { href: "/collections", label: "Collections" },
  ] },
  { title: "Build", links: [
    { href: "/stack", label: "Stack Builder" },
    { href: "/api", label: "Public API" },
    { href: "/mcp", label: "MCP servers" },
  ] },
  { title: "About", links: [
    { href: "/methodology", label: "Verification method" },
    { href: "/submit", label: "Submit a tool" },
    { href: "/contact", label: "Contact" },
  ] },
];

export function Footer({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t border-white/10 bg-navy", className)} {...props}>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-slate-400">
            Verified AI-tools directory. Every listing machine-checked for live status, real
            pricing, and genuine free tiers.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-slate-200">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-slate-400 transition-colors hover:text-teal">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 px-6 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AI Tools Hub · A Ddotsmedia project
      </div>
    </footer>
  );
}
