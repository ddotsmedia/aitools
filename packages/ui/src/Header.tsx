"use client";
import * as React from "react";
import { cn } from "./cn";
import { Logo } from "./Logo";

export interface NavItem { href: string; label: string; badge?: string }

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  nav?: NavItem[];
  cta?: React.ReactNode;
  /** Active pathname — used to highlight current link */
  activePath?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/tools",       label: "Browse" },
  { href: "/compare",     label: "Compare" },
  { href: "/stack",       label: "Stack Builder", badge: "AI" },
  { href: "/collections", label: "Collections" },
];

export function Header({ nav = PRIMARY_NAV, cta, activePath, className, ...props }: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/10 bg-navy/90 backdrop-blur-md",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">

        {/* Logo */}
        <a href="/" aria-label="AI Tools Hub home" className="flex-shrink-0">
          <Logo />
        </a>

        {/* Primary nav — desktop */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => {
            const active = activePath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-teal/10 text-teal"
                    : "text-slate-300 hover:bg-white/5 hover:text-slate-50",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                {item.badge && (
                  <span className="rounded-full bg-teal/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Submit link — less prominent, desktop only */}
          <a
            href="/submit"
            className="hidden text-sm text-slate-400 transition-colors hover:text-slate-200 lg:block"
          >
            Submit tool
          </a>

          {/* CTA */}
          {cta}

          {/* Mobile hamburger */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/5 hover:text-slate-50 md:hidden"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="3" x2="15" y2="15"/><line x1="15" y1="3" x2="3" y2="15"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="5" x2="15" y2="5"/><line x1="3" y1="9" x2="15" y2="9"/><line x1="3" y1="13" x2="15" y2="13"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-navy/95 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-slate-50"
              >
                {item.label}
                {item.badge && (
                  <span className="rounded-full bg-teal/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
            <a
              href="/submit"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
            >
              Submit a tool
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
