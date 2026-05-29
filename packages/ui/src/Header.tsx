import * as React from "react";
import { cn } from "./cn";
import { Logo } from "./Logo";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  nav?: { href: string; label: string }[];
  cta?: React.ReactNode;
}

const DEFAULT_NAV = [
  { href: "/tools", label: "Browse" },
  { href: "/compare", label: "Compare" },
  { href: "/collections", label: "Collections" },
  { href: "/submit", label: "Submit tool" },
];

export function Header({ nav = DEFAULT_NAV, cta, className, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/10 bg-navy/80 backdrop-blur-md",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="/" aria-label="AI Tools Hub home">
          <Logo />
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-slate-300 transition-colors hover:text-teal"
            >
              {item.label}
            </a>
          ))}
        </nav>
        {cta}
      </div>
    </header>
  );
}
