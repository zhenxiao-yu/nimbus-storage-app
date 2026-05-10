import { cn } from "@/lib/utils";

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute -top-1/2 left-1/2 size-[120vw] -translate-x-1/2 animate-aurora rounded-full bg-gradient-to-tr from-violet-500/30 via-indigo-500/20 to-cyan-400/30 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 size-[60vw] animate-aurora rounded-full bg-gradient-to-br from-fuchsia-500/20 via-purple-500/10 to-blue-500/20 blur-3xl [animation-delay:-6s]" />
      <div className="absolute bottom-0 right-0 size-[60vw] animate-aurora rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-violet-500/20 blur-3xl [animation-delay:-12s]" />
    </div>
  );
}
