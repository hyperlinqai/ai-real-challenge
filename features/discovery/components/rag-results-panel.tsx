"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoGallery } from "@/features/discovery/components/photo-gallery";
import { getGalleryForDestination, getHeroImage } from "@/lib/destination-media";
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

const TAB_KEYS = [
  "overview",
  "history",
  "hiddenGems",
  "culturalExperiences",
  "localFood",
  "events",
  "nearbyAttractions",
  "travelTips",
] as const;

type TabKey = (typeof TAB_KEYS)[number];

const TAB_LABELS: Record<TabKey, string> = {
  overview: "Overview",
  history: "History",
  hiddenGems: "Hidden gems",
  culturalExperiences: "Culture",
  localFood: "Food",
  events: "Events",
  nearbyAttractions: "Attractions",
  travelTips: "Tips",
};

export function RagResultsPanel({
  data,
  className,
  vibe,
}: {
  data: RagRecommendResponse;
  className?: string;
  vibe?: string;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [openDays, setOpenDays] = useState<Set<number>>(() => new Set([1]));

  const gallery = useMemo(
    () => getGalleryForDestination(data.destination.name, vibe),
    [data.destination.name, vibe],
  );
  const hero = getHeroImage(data.destination.name);

  const s = data.sections;
  const activeSection = s[activeTab];

  const toggleDay = (day: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="travel-card-shadow overflow-hidden border-0">
        <div className="relative min-h-[220px]">
          <Image
            src={hero}
            alt={`${data.destination.name} travel`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/30" />
          <div className="relative px-6 py-8 text-white md:py-10">
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

      <PhotoGallery images={gallery} title={data.destination.name} />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-primary">Explore sections</p>
        <div
          className="flex gap-2 overflow-x-auto pb-1 snap-x"
          role="tablist"
          aria-label="Itinerary sections"
        >
          {TAB_KEYS.map((key) => (
            <Button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              variant={activeTab === key ? "default" : "outline"}
              size="sm"
              className="shrink-0 snap-start rounded-full"
              onClick={() => setActiveTab(key)}
            >
              {TAB_LABELS[key]}
            </Button>
          ))}
        </div>
        <Card className="travel-card-shadow border-0" role="tabpanel">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-primary">{activeSection.title}</CardTitle>
            <SourceBadges sources={activeSection.sources} />
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {activeSection.content}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="travel-card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-primary">Day-by-day plan</CardTitle>
            <p className="text-xs text-muted-foreground">Tap a day to expand</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.suggestedItinerary.map((day) => {
              const open = openDays.has(day.day);
              return (
                <div key={day.day} className="overflow-hidden rounded-xl border border-border/60">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between bg-secondary/60 px-4 py-3 text-left text-sm font-semibold text-primary transition hover:bg-secondary"
                    aria-expanded={open}
                    onClick={() => toggleDay(day.day)}
                  >
                    <span>Day {day.day}</span>
                    <ChevronDown
                      className={cn("size-4 transition-transform", open && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                  {open && (
                    <p className="border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
                      {day.plan}
                    </p>
                  )}
                </div>
              );
            })}
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
