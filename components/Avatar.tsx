import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  /** Legacy: kept for prop-API compat with older callers. Ignored — the
   *  avatar is always rendered as an inline SVG to avoid network failures. */
  src?: string | null;
  size?: number;
  className?: string;
  alt?: string;
}

const GRADIENT_PAIRS: Array<[string, string]> = [
  ["#6366f1", "#8b5cf6"],
  ["#8b5cf6", "#ec4899"],
  ["#06b6d4", "#3b82f6"],
  ["#10b981", "#06b6d4"],
  ["#f59e0b", "#ef4444"],
  ["#ec4899", "#f43f5e"],
  ["#3b82f6", "#a855f7"],
  ["#14b8a6", "#22c55e"],
  ["#a855f7", "#6366f1"],
  ["#f43f5e", "#f59e0b"],
];

const hash = (input: string) => {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

const getInitials = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/u)
    .filter((p) => /\p{L}|\p{N}/u.test(p));
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Always renders an inline SVG with the user's initials over a deterministic
 * two-tone gradient. No network calls — never breaks, never flashes.
 *
 * The `src` prop is intentionally ignored. Provider profile pictures aren't
 * a required feature, and an inline SVG removes a whole class of failure
 * modes (CORS, ERR_NETWORK_CHANGED, dicebear/Gravatar outages, etc.).
 */
export function Avatar({
  name,
  email,
  size = 40,
  className,
  alt,
}: AvatarProps) {
  const seed = (name || email || "User").trim() || "User";
  const initials = getInitials(name?.trim() || email?.split("@")[0] || "User");
  const [from, to] = GRADIENT_PAIRS[hash(seed) % GRADIENT_PAIRS.length];
  const gradId = `avatar-grad-${seed.length}-${hash(seed)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={alt ?? name ?? "Avatar"}
      className={cn("rounded-full", className)}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="20" fill={`url(#${gradId})`} />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="16"
        fontWeight="600"
        fontFamily="var(--font-inter, ui-sans-serif, system-ui, sans-serif)"
        fill="white"
        letterSpacing="0.5"
      >
        {initials}
      </text>
    </svg>
  );
}
