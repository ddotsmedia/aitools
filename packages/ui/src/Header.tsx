"use client";
import * as React from "react";
import { cn } from "./cn";
import { Logo } from "./Logo";

export interface NavItem { href: string; label: string; badge?: string }
export interface NavMenuItem { href: string; label: string; hint?: string }
export interface NavMenu { label: string; badge?: string; items: NavMenuItem[]; footer?: { href: string; label: string } }

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  nav?: NavItem[];
  /** Dropdown menus rendered in the desktop nav (e.g. Categories, Collections). */
  menus?: NavMenu[];
  cta?: React.ReactNode;
  activePath?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/tools",   label: "Browse" },
  { href: "/compare", label: "Compare" },
  { href: "/stack",   label: "Stack Builder", badge: "AI" },
];

export function Header({ nav = PRIMARY_NAV, menus = [], cta, activePath, className, ...props }: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLElement | null>(null);

  // Close dropdowns on outside click or Escape.
  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/10 bg-navy/90 backdrop-blur-md",
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
                {item.label}
                {item.badge && (
                  <span className="rounded-full bg-teal/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal">
                    {item.badge}
                  </span>
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
                    <div className="grid grid-cols-1 gap-0.5">
                      {menu.items.map((it) => (
                        <a
                          key={it.href}
                          href={it.href}
                          onClick={() => setOpenMenu(null)}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-teal"
                        >
                          <span>{it.label}</span>
                          {it.hint && <span className="text-xs text-slate-500">{it.hint}</span>}
                        </a>
                      ))}
                    </div>
                    {menu.footer && (
                      <a
                        href={menu.footer.href}
                        onClick={() => setOpenMenu(null)}
                        className="mt-1 block rounded-lg border-t border-white/5 px-3 py-2 text-sm font-medium text-teal hover:bg-teal/10"
                      >
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
          <a href="/submit" className="hidden text-sm text-slate-400 transition-colors hover:text-slate-200 lg:block">
            Submit tool
          </a>
          {cta}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/5 hover:text-slate-50 md:hidden"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="3" x2="15" y2="15" /><line x1="15" y1="3" x2="3" y2="15" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="5" x2="15" y2="5" /><line x1="3" y1="9" x2="15" y2="9" /><line x1="3" y1="13" x2="15" y2="13" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="max-h-[70vh] overflow-auto border-t border-white/10 bg-navy/95 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {nav.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-slate-50">
                {item.label}
                {item.badge && <span className="rounded-full bg-teal/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal">{item.badge}</span>}
              </a>
            ))}
            {menus.map((menu) => (
              <div key={menu.label} className="mt-1">
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{menu.label}</p>
                {menu.items.map((it) => (
                  <a key={it.href} href={it.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-teal">
                    {it.label}
                  </a>
                ))}
                {menu.footer && (
                  <a href={menu.footer.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-teal hover:bg-teal/10">
                    {menu.footer.label} →
                  </a>
                )}
              </div>
            ))}
            <a href="/submit" onClick={() => setMenuOpen(false)} className="mt-1 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200">
              Submit a tool
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
