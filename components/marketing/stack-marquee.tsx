import { Marquee } from "@/components/magicui/marquee";

const items = [
  "Next.js 15",
  "React 19",
  "Appwrite Cloud",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "Magic UI",
  "Framer Motion",
  "Zod",
  "React Hook Form",
  "Lucide",
  "Sonner",
];

export function StackMarquee() {
  return (
    <section
      id="stack"
      className="relative border-y border-border/60 bg-card/30 py-12"
    >
      <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
        Built with the modern web platform
      </p>
      <Marquee
        pauseOnHover
        className="[--duration:35s] [--gap:2.5rem] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        {items.map((item) => (
          <span
            key={item}
            className="text-base font-semibold tracking-tight text-muted-foreground/60 hover:text-foreground"
          >
            {item}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
