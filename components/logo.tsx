import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { mark: "size-7", text: "text-base" },
  md: { mark: "size-8", text: "text-lg" },
  lg: { mark: "size-10", text: "text-xl" },
};

export function Logo({
  href = "/",
  className,
  showWordmark = true,
  size = "md",
}: LogoProps) {
  const sizes = sizeMap[size];

  const Mark = (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-[10px] shadow-glow",
        sizes.mark,
      )}
    >
      <span className="absolute inset-0 bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500" />
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.55),transparent_55%)]" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10 size-[60%] drop-shadow-sm"
      >
        <path d="M17 17H7a4 4 0 1 1 1.2-7.8A5.5 5.5 0 0 1 18.8 9 4 4 0 0 1 17 17Z" />
      </svg>
    </span>
  );

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {Mark}
      {showWordmark && (
        <span className={cn("font-semibold tracking-tight", sizes.text)}>
          Nimbus
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="Nimbus home" className="ring-focus rounded-md">
      {content}
    </Link>
  );
}
