"use client";

import { CSSProperties, ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
}

export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "linear-gradient(135deg, hsl(262 83% 58%), hsl(239 84% 67%), hsl(217 91% 60%))",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white",
          "[background:var(--bg)] [border-radius:var(--radius)]",
          "transition-all duration-300 hover:scale-[1.02] active:scale-95",
          "shadow-[inset_0_-8px_10px_rgba(255,255,255,0.12)]",
          "before:absolute before:inset-0 before:overflow-hidden before:[border-radius:var(--radius)]",
          className,
        )}
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible [container-type:size]",
          )}
        >
          <div className="absolute inset-0 h-[100cqh] animate-shine [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="absolute -inset-full w-auto rotate-0 [translate:-50%_-50%] [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>
        {children}
        {/* highlight */}
        <div className="absolute -z-20 size-full bg-[var(--bg)] [border-radius:var(--radius)]" />
      </button>
    );
  },
);
ShimmerButton.displayName = "ShimmerButton";
