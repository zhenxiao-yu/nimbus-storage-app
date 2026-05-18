"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export const Meteors = ({ number = 20, className }: MeteorsProps) => {
  const [meteors, setMeteors] = useState<
    Array<{ delay: string; duration: string; left: string; top: string }>
  >([]);

  useEffect(() => {
    // Random seeds must run client-side to avoid SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeteors(
      Array.from({ length: number }, () => ({
        left: Math.floor(Math.random() * 100) + "%",
        top: Math.floor(Math.random() * 100) + "%",
        delay: Math.random() * 2 + "s",
        duration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
      })),
    );
  }, [number]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {meteors.map((m, idx) => (
        <span
          key={idx}
          className={cn(
            "absolute size-0.5 rotate-[215deg] animate-meteor rounded-full bg-foreground/60 shadow-[0_0_0_1px_#ffffff10]",
            "before:absolute before:top-1/2 before:h-px before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-foreground/60 before:to-transparent",
            className,
          )}
          style={{
            top: m.top,
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        />
      ))}
    </div>
  );
};
