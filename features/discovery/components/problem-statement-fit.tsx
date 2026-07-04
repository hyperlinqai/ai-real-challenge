import { Badge } from "@/components/ui/badge";

const CAPABILITIES = [
  "Personalized destinations",
  "Hidden gems",
  "RAG-grounded itineraries",
  "Immersive stories",
  "Cultural events",
  "Local hosts",
  "Multi-LLM providers",
  "PostgreSQL + semantic search",
  "Source attribution",
] as const;

export function ProblemStatementFit() {
  return (
    <section
      aria-labelledby="problem-fit-heading"
      className="border-b border-border/70 bg-white/95"
    >
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
        <h2 id="problem-fit-heading" className="sr-only">
          Hackathon problem statement coverage
        </h2>
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Problem statement — delivered in this build
        </p>
        <ul className="flex flex-wrap justify-center gap-2" role="list">
          {CAPABILITIES.map((item) => (
            <li key={item}>
              <Badge
                variant="secondary"
                className="rounded-full bg-travel-sky px-3 py-1 text-[11px] font-normal text-primary"
              >
                {item}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
