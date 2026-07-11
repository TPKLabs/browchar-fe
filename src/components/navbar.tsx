import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/playbooks", label: "Playbooks" },
];

export function Navbar() {
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
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              nativeButton={false}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <Button nativeButton={false} render={<Link href="/characters/new" />}>
          Crear personaje
        </Button>
      </div>
    </header>
  );
}
