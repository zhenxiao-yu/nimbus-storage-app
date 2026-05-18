"use client";

import dynamic from "next/dynamic";

/**
 * Client wrapper that defers loading recharts (large) until the dashboard
 * page renders on the client. The fallback matches the chart's footprint to
 * avoid layout shift.
 */
const Chart = dynamic(
  () => import("@/components/Chart").then((m) => m.Chart),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="h-[240px] w-full animate-pulse rounded-2xl border border-border/60 bg-muted/40"
      />
    ),
  },
);

export default function ChartLazy({ used }: { used: number }) {
  return <Chart used={used} />;
}
