"use client";

import { Button } from "@/components/ui/button";
import { openCookiePreferences } from "@/components/CookieConsent";

export function CookiePreferencesButton({
  variant = "outline",
  className,
  children,
}: {
  variant?: "outline" | "ghost" | "default" | "link";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => openCookiePreferences()}
    >
      {children ?? "Manage cookie preferences"}
    </Button>
  );
}
