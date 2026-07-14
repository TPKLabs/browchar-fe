"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/games", label: "Juegos" },
  { href: "/playbooks", label: "Playbooks" },
];

function isActiveLink(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-border bg-card/60 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-primary font-heading flex items-center gap-2 text-lg font-semibold tracking-wide"
        >
          <Sparkles className="size-5" aria-hidden />
          Browchar
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => {
            const active = isActiveLink(pathname, link.href);
            return (
              <Button
                key={link.href}
                variant={active ? "secondary" : "ghost"}
                aria-current={active ? "page" : undefined}
                nativeButton={false}
                render={<Link href={link.href} />}
              >
                {link.label}
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/characters/new" />}
          >
            Crear personaje
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="border-border flex flex-col gap-1 border-t px-4 py-3 sm:hidden">
          {NAV_LINKS.map((link) => {
            const active = isActiveLink(pathname, link.href);
            return (
              <Button
                key={link.href}
                variant={active ? "secondary" : "ghost"}
                aria-current={active ? "page" : undefined}
                className="justify-start"
                nativeButton={false}
                render={<Link href={link.href} />}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Button>
            );
          })}
          <Button
            className="mt-2"
            nativeButton={false}
            render={<Link href="/characters/new" />}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Crear personaje
          </Button>
        </nav>
      )}
    </header>
  );
}
