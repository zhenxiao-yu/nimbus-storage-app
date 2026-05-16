import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

/**
 * Local brand icon components. lucide-react v1 removed bundled brand icons
 * (Github, Twitter, etc.) for trademark/licensing reasons. These are simple
 * SVG replacements styled to match lucide's API (size via className, currentColor).
 */
export function Github({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M12 .5C5.73.5.99 5.24.99 11.51c0 4.85 3.15 8.96 7.52 10.41.55.1.75-.24.75-.53 0-.26-.01-.95-.02-1.87-3.06.66-3.71-1.48-3.71-1.48-.5-1.28-1.22-1.62-1.22-1.62-1-.69.08-.68.08-.68 1.11.08 1.69 1.14 1.69 1.14.99 1.69 2.59 1.2 3.22.92.1-.72.39-1.2.7-1.48-2.44-.28-5-1.22-5-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .93-.3 3.04 1.13a10.5 10.5 0 0 1 5.54 0c2.11-1.43 3.03-1.13 3.03-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.23-2.57 5.16-5.02 5.43.4.34.76 1.02.76 2.06 0 1.49-.01 2.69-.01 3.05 0 .29.2.64.76.53 4.36-1.45 7.51-5.56 7.51-10.41C23.01 5.24 18.27.5 12 .5z" />
    </svg>
  );
}

export function Twitter({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
