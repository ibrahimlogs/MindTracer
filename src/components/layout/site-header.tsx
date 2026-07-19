import Link from "next/link";
import { BrainCircuit } from "lucide-react";

const navigation = [
  { href: "/demo", label: "Demo" },
  { href: "/technology", label: "Technology" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-medium tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-reasoning/10 text-reasoning">
            <BrainCircuit className="size-4" aria-hidden="true" />
          </span>
          MindTrace{" "}
          <span className="hidden text-text-muted sm:inline">
            Reasoning Lab
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-6"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
