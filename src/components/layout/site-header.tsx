import { BrainCircuit, Menu, X } from "lucide-react";
import Link from "next/link";

import { PrimaryButton } from "@/components/ui/actions";

const navigation = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#reasoning-system", label: "Learning system" },
  { href: "/technology", label: "Technology" },
  { href: "/demo", label: "Demo" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/86 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md text-base font-semibold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-reasoning-soft text-reasoning">
            <BrainCircuit className="size-4" aria-hidden="true" />
          </span>
          <span>MindTrace</span>
          <span className="hidden text-text-muted sm:inline">
            Reasoning Lab
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-7"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <PrimaryButton asChild size="sm">
            <Link href="/demo">Try the demo</Link>
          </PrimaryButton>
        </div>

        <details className="group md:hidden">
          <summary
            className="grid size-11 cursor-pointer list-none place-items-center rounded-full text-text-secondary hover:bg-surface-soft hover:text-text-primary [&::-webkit-details-marker]:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="size-5 group-open:hidden" aria-hidden="true" />
            <X className="hidden size-5 group-open:block" aria-hidden="true" />
          </summary>
          <div className="absolute inset-x-0 top-16 border-b border-border bg-background px-5 shadow-xl">
            <nav
              aria-label="Mobile navigation"
              className="mx-auto flex max-w-[90rem] flex-col py-4"
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md border-b border-border/70 py-4 text-base text-text-secondary last:border-0 hover:text-text-primary"
                >
                  {item.label}
                </Link>
              ))}
              <PrimaryButton asChild className="mt-3 w-full">
                <Link href="/demo">Experience the demo</Link>
              </PrimaryButton>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
