import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "max-w-[42.5rem]",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <Eyebrow className={cn(align === "center" && "justify-center")}>
        {eyebrow}
      </Eyebrow>
      <h2 className="mt-5 text-3xl leading-tight font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn("max-w-3xl", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-6 max-w-[42.5rem] text-lg leading-8 text-text-secondary">
          {description}
        </p>
      ) : null}
    </header>
  );
}
