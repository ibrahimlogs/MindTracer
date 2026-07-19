import type * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrimaryButton(props: ButtonProps) {
  return <Button {...props} />;
}

export function SecondaryButton(props: ButtonProps) {
  return <Button variant="outline" {...props} />;
}

interface IconButtonProps extends Omit<ButtonProps, "size" | "children"> {
  "aria-label": string;
  children: React.ReactNode;
}

export function IconButton({ className, ...props }: IconButtonProps) {
  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}
