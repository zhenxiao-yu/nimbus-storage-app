import { NumberTicker } from "@/components/magicui/number-ticker";

const stats = [
  { value: 2, suffix: " GB", label: "Per-user storage on free tier" },
  { value: 50, suffix: " MB", label: "Max upload per file" },
  { value: 100, suffix: "%", label: "TypeScript, end-to-end" },
  { value: 0, suffix: "", label: "Passwords stored" },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <ul className="grid grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-card/50 p-6 shadow-soft md:grid-cols-4 md:p-10">
        {stats.map((s) => (
          <li key={s.label} className="text-center">
            <p className="bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-5xl">
              <NumberTicker value={s.value} />
              {s.suffix}
            </p>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              {s.label}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
