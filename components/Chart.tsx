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
import { calculatePercentage, convertFileSize } from "@/lib/utils";

const chartConfig = {
  size: { label: "Size" },
  used: { label: "Used", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export const Chart = ({ used = 0 }: { used: number }) => {
  const percent = Number(calculatePercentage(used)) || 0;
  const chartData = [{ storage: "used", percent, fill: "url(#chartFill)" }];

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-600 text-white shadow-glow">
      <CardContent className="grid items-center gap-2 p-6 md:grid-cols-[200px_1fr]">
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
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-white text-3xl font-bold"
                        >
                          {percent.toFixed(0)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 22}
                          className="fill-white/70 text-xs"
                        >
                          used
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>

        <CardHeader className="space-y-1.5 p-0">
          <CardTitle className="text-xl font-semibold text-white">
            Available storage
          </CardTitle>
          <CardDescription className="text-sm text-white/80">
            {convertFileSize(used) || "0 KB"} of 2 GB used. Upgrade Appwrite to
            scale further.
          </CardDescription>
        </CardHeader>
      </CardContent>
    </Card>
  );
};
