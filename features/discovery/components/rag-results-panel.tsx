import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RagRecommendResponse } from "@/lib/schemas/rag";
import { cn } from "@/lib/utils";

function SourceBadges({ sources }: { sources: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {sources.map((s) => (
        <Badge
          key={s}
          variant="secondary"
          className="rounded-full bg-travel-sky text-[11px] font-normal text-primary"
        >
          {s}
        </Badge>
      ))}
    </div>
  );
}

function SectionBlock({
  section,
  className,
}: {
  section: RagRecommendResponse["sections"][keyof RagRecommendResponse["sections"]];
  className?: string;
}) {
  return (
    <Card className={cn("travel-card-shadow border-0", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-primary">{section.title}</CardTitle>
        <SourceBadges sources={section.sources} />
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {section.content}
        </p>
      </CardContent>
    </Card>
  );
}

export function RagResultsPanel({
  data,
  className,
}: {
  data: RagRecommendResponse;
  className?: string;
}) {
  const s = data.sections;

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="travel-card-shadow overflow-hidden border-0">
        <div className="travel-hero-gradient px-6 py-8 text-white">
          <p className="text-sm font-medium text-white/80">Personalized itinerary</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            {data.destination.name}, {data.destination.state}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90">{data.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Badge className="rounded-full bg-white/15 text-white hover:bg-white/20">
              ₹{data.estimatedBudgetInr.toLocaleString("en-IN")} est.
            </Badge>
            <SourceBadges sources={data.sources} />
          </div>
        </div>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Why it fits</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.whyItMatches}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Best time</p>
            <p className="mt-2 text-sm text-muted-foreground">{data.bestTimeToVisit}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionBlock section={s.overview} />
        <SectionBlock section={s.history} />
        <SectionBlock section={s.hiddenGems} />
        <SectionBlock section={s.culturalExperiences} />
        <SectionBlock section={s.localFood} />
        <SectionBlock section={s.events} />
        <SectionBlock section={s.nearbyAttractions} />
        <SectionBlock section={s.travelTips} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="travel-card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-primary">Suggested itinerary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.suggestedItinerary.map((day) => (
              <div key={day.day} className="rounded-xl bg-secondary/80 p-3 text-sm">
                <span className="font-semibold text-primary">Day {day.day}</span>
                <p className="mt-1 text-muted-foreground">{day.plan}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="travel-card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-primary">Experiences & etiquette</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-foreground">Best experiences</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                {data.bestExperiences.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Things to avoid</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                {data.thingsToAvoid.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Local etiquette</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                {data.localEtiquette.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
