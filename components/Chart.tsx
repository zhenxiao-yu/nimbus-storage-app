"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { calculatePercentage, convertFileSize } from "@/lib/utils";

const chartConfig = {
  size: { label: "Size" },
  used: { label: "Used", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export const Chart = ({ used = 0 }: { used: number }) => {
  const percent = Number(calculatePercentage(used)) || 0;
  const chartData = [{ storage: "used", percent, fill: "url(#chartFill)" }];

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-600 text-white shadow-glow">
      <div aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:[&_div]:!animate-none">
        <div className="absolute -left-20 -top-20 size-72 animate-aurora rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-10 size-72 animate-aurora rounded-full bg-cyan-400/30 blur-3xl [animation-delay:-8s]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_45%)]" />
      </div>

      <CardContent className="relative grid items-center gap-2 p-6 md:grid-cols-[200px_1fr]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[200px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={percent * 3.6 + 90}
            innerRadius={75}
            outerRadius={105}
          >
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
                <stop offset="100%" stopColor="#e0e7ff" stopOpacity={1} />
              </linearGradient>
            </defs>
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-white/15 last:fill-transparent"
              polarRadius={[82, 70]}
            />
            <RadialBar dataKey="percent" background cornerRadius={12} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <foreignObject
                        x={(viewBox.cx ?? 0) - 60}
                        y={(viewBox.cy ?? 0) - 30}
                        width="120"
                        height="60"
                      >
                        <div className="flex size-full flex-col items-center justify-center">
                          <div className="text-3xl font-bold tabular-nums text-white">
                            <NumberTicker
                              value={percent}
                              decimalPlaces={percent < 10 ? 1 : 0}
                            />
                            <span>%</span>
                          </div>
                          <div className="text-xs text-white/70">used</div>
                        </div>
                      </foreignObject>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>

        <CardHeader className="space-y-2 p-0">
          <CardTitle className="text-xl font-semibold text-white">
            Available storage
          </CardTitle>
          <CardDescription className="text-sm text-white/80">
            <span className="font-medium text-white">
              {convertFileSize(used) || "0 KB"}
            </span>{" "}
            of 2 GB used. Upgrade Appwrite to scale further.
          </CardDescription>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white/90 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </CardHeader>
      </CardContent>
    </Card>
  );
};
