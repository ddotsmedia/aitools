"use client";
import * as React from "react";
import { cn } from "./cn";
import { Logo } from "./Logo";

export interface NavItem { href: string; label: string; badge?: string }
export interface NavMenuItem { href: string; label: string; hint?: string }
export interface NavMenu { label: string; badge?: string; items: NavMenuItem[]; footer?: { href: string; label: string } }

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  nav?: NavItem[];
  menus?: NavMenu[];
  cta?: React.ReactNode;
  activePath?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/tools", label: "Browse" },
  { href: "/compare", label: "Compare" },
  { href: "/stack", label: "Stack Builder", badge: "AI" },
];

const Sparkle = () => (
  <span aria-hidden="true" className="text-sun">✨</span>
);

export function Header({ nav = PRIMARY_NAV, menus = [], cta, activePath, className, ...props }: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const navRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpenMenu(null); setMenuOpen(false); }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isStack = (label: string) => /stack/i.test(label);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-navy/90 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-b border-transparent bg-navy/50 backdrop-blur-md",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <a href="/" aria-label="AI Tools Hub home" className="flex-shrink-0">
          <Logo />
        </a>

        {/* Desktop nav */}
        <nav ref={navRef} className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => {
            const active = activePath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-teal/10 text-teal" : "text-slate-300 hover:bg-white/5 hover:text-slate-50",
                )}
                aria-current={active ? "page" : undefined}
              >
                {isStack(item.label) && <Sparkle />}
                {item.label}
                {item.badge && !isStack(item.label) && (
                  <span className="rounded-full bg-teal/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal">{item.badge}</span>
                )}
              </a>
            );
          })}

          {menus.map((menu) => {
            const open = openMenu === menu.label;
            return (
              <div key={menu.label} className="relative">
                <button
                  onClick={() => setOpenMenu(open ? null : menu.label)}
                  aria-expanded={open}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    open ? "bg-white/5 text-slate-50" : "text-slate-300 hover:bg-white/5 hover:text-slate-50",
                  )}
                >
                  {menu.label}
                  <svg width="12" height="12" viewBox="0 0 12 12" className={cn("transition-transform", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 4.5 6 7.5 9 4.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {open && (
                  <div className="absolute left-0 top-full mt-1 w-64 rounded-xl border border-white/10 bg-navy/95 p-2 shadow-xl backdrop-blur">
                    {menu.items.map((it) => (
                      <a key={it.href} href={it.href} onClick={() => setOpenMenu(null)} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-teal">
                        <span>{it.label}</span>
                        {it.hint && <span className="font-mono text-xs text-slate-500">{it.hint}</span>}
                      </a>
                    ))}
                    {menu.footer && (
                      <a href={menu.footer.href} onClick={() => setOpenMenu(null)} className="mt-1 block rounded-lg border-t border-white/5 px-3 py-2 text-sm font-medium text-teal hover:bg-teal/10">
                        {menu.footer.label} →
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-2">
          <a
            href="/submit"
            className="submit-pill hidden rounded-full border border-teal/40 bg-teal/10 px-4 py-1.5 text-sm font-semibold text-teal transition-colors hover:bg-teal/20 lg:inline-block"
          >
            Submit tool
          </a>
          {cta}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-200 transition-colors hover:bg-white/5 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="5" x2="15" y2="5" /><line x1="3" y1="9" x2="15" y2="9" /><line x1="3" y1="13" x2="15" y2="13" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-navy/98 backdrop-blur-xl md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Logo />
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-200 hover:bg-white/5"
            >
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="3" x2="15" y2="15" /><line x1="15" y1="3" x2="3" y2="15" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-auto px-6 pb-10 pt-4" aria-label="Mobile">
            {nav.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="nav-stagger flex items-center gap-2 border-b border-white/5 py-4 font-display text-2xl font-bold text-slate-100"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                {isStack(item.label) && <Sparkle />}
                {item.label}
                {item.badge && !isStack(item.label) && (
                  <span className="rounded-full bg-teal/20 px-2 py-0.5 text-xs font-semibold text-teal">{item.badge}</span>
                )}
              </a>
            ))}
            {menus.map((menu, mi) => (
              <div
                key={menu.label}
                className="nav-stagger pt-5"
                style={{ animationDelay: `${(nav.length + mi) * 55}ms` }}
              >
                <p className="font-mono text-xs uppercase tracking-widest text-slate-500">{menu.label}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {menu.items.slice(0, 8).map((it) => (
                    <a key={it.href} href={it.href} onClick={() => setMenuOpen(false)} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300 hover:border-teal/40 hover:text-teal">
                      {it.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <a
              href="/submit"
              onClick={() => setMenuOpen(false)}
              className="nav-stagger mt-6 rounded-full border border-teal/40 bg-teal/10 px-5 py-3 text-center text-base font-semibold text-teal"
              style={{ animationDelay: `${(nav.length + menus.length) * 55}ms` }}
            >
              Submit a tool
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
