export function EmptyIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="emptyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--brand-from))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="hsl(var(--brand-to))" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="emptyStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--brand-from))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--brand-to))" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <ellipse
        cx="100"
        cy="120"
        rx="70"
        ry="6"
        fill="hsl(var(--muted-foreground))"
        opacity="0.12"
      />

      <g transform="translate(38 26)">
        <rect
          x="0"
          y="14"
          width="124"
          height="78"
          rx="12"
          fill="url(#emptyGrad)"
          stroke="url(#emptyStroke)"
          strokeWidth="1.5"
        />
        <path
          d="M0 26 L0 14 a12 12 0 0 1 12 -12 h28 l10 12 h62 a12 12 0 0 1 12 12 v0"
          fill="hsl(var(--background))"
          stroke="url(#emptyStroke)"
          strokeWidth="1.5"
        />
        <circle
          cx="62"
          cy="58"
          r="18"
          fill="hsl(var(--background))"
          stroke="url(#emptyStroke)"
          strokeWidth="1.5"
        />
        <path
          d="M62 50 V66 M54 58 H70"
          stroke="url(#emptyStroke)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export default EmptyIllustration;
