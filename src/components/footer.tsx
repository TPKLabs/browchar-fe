import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-border bg-card/60 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} Browchar</p>
        <nav className="flex items-center gap-4">
          <Link href="/games" className="hover:text-foreground">
            Juegos
          </Link>
          <Link href="/playbooks" className="hover:text-foreground">
            Playbooks
          </Link>
        </nav>
      </div>
    </footer>
  );
}
