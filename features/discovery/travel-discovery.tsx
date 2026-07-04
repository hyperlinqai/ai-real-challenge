"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Camera,
  Compass,
  IndianRupee,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RagResultsPanel } from "@/features/discovery/components/rag-results-panel";
import {
  fetchRagRecommend,
  fetchRagStory,
  type RagRecommendResponse,
} from "@/features/discovery/api";
import { ragUserProfileSchema, type RagUserProfile } from "@/lib/schemas/rag";
import { STORY_STYLES, BUDGET_LEVELS, TRAVEL_VIBES } from "@/types/travel";

const vibeLabels: Record<(typeof TRAVEL_VIBES)[number], string> = {
  offbeat: "Offbeat",
  spiritual: "Spiritual",
  adventure: "Adventure",
  foodie: "Foodie",
  heritage: "Heritage",
  nature: "Nature",
};

const TRIP_PRESETS = [
  { label: "Heritage & photos", interests: ["history", "photography", "architecture"] },
  { label: "Food & markets", interests: ["local food", "markets", "street food"] },
  { label: "Offbeat nature", interests: ["trekking", "nature", "hidden gems"] },
];

export function TravelDiscovery() {
  const [interestInput, setInterestInput] = useState("");
  const [ragResult, setRagResult] = useState<RagRecommendResponse | null>(null);
  const [story, setStory] = useState<string | null>(null);
  const [storyTitle, setStoryTitle] = useState<string | null>(null);
  const [storySources, setStorySources] = useState<string[]>([]);
  const [storyStyle, setStoryStyle] = useState<(typeof STORY_STYLES)[number]>("historical");

  const form = useForm<RagUserProfile>({
    resolver: zodResolver(ragUserProfileSchema),
    defaultValues: {
      interests: ["history", "photography", "local food"],
      budget: "moderate",
      budgetInr: 25000,
      travelDays: 4,
      vibe: "heritage",
      groupSize: 2,
      preferredWeather: "pleasant",
      accessibilityNeeds: "",
      destinationHint: "",
    },
  });

  const interests = form.watch("interests");

  const recommendMutation = useMutation({
    mutationFn: fetchRagRecommend,
    onSuccess: (data) => {
      setRagResult(data);
      setStory(null);
      toast.success("Grounded itinerary ready");
    },
    onError: (e) => toast.error(e.message),
  });

  const storyMutation = useMutation({
    mutationFn: fetchRagStory,
    onSuccess: (data) => {
      setStory(data.story);
      setStoryTitle(data.title);
      setStorySources(data.sources);
    },
    onError: (e) => toast.error(e.message),
  });

  const onSubmit = form.handleSubmit((values) => {
    recommendMutation.mutate({
      ...values,
      accessibilityNeeds: values.accessibilityNeeds || undefined,
      destinationHint: values.destinationHint || undefined,
    });
  });

  const addInterest = () => {
    const v = interestInput.trim();
    if (!v) return;
    form.setValue("interests", Array.from(new Set([...interests, v])).slice(0, 12), {
      shouldValidate: true,
    });
    setInterestInput("");
  };

  const generateStory = () => {
    if (!ragResult) return;
    storyMutation.mutate({
      destinationName: ragResult.destination.name,
      style: storyStyle,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#trip-planner"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-primary focus:shadow-lg"
      >
        Skip to trip planner
      </a>
      <header className="sticky top-0 z-20 border-b border-border/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-hidden>
              <Compass className="size-5" />
            </div>
            <div>
              <p className="text-base font-bold text-primary">WanderMind India</p>
              <p className="text-[11px] text-muted-foreground">RAG-powered travel discovery</p>
            </div>
          </div>
          <Badge className="hidden rounded-full bg-accent text-accent-foreground sm:inline-flex">
            Wikipedia · Wikivoyage · Local DB
          </Badge>
        </div>
      </header>

      <section className="travel-hero-gradient text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
              Find your perfect India trip — grounded in real travel knowledge
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
              We search our vector knowledge base, Wikipedia, and Wikivoyage before AI personalizes
              your itinerary. Every section shows its sources.
            </p>
          </motion.div>
        </div>
      </section>

      <main id="trip-planner" className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-6 md:py-10">
        <Card className="travel-card-shadow -mt-12 border-0 md:-mt-16">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-6" aria-labelledby="planner-heading">
              <h2 id="planner-heading" className="sr-only">
                Plan your India trip
              </h2>
              <div className="relative">
                <Label htmlFor="destination-hint" className="sr-only">
                  Destination hint (optional)
                </Label>
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="destination-hint"
                  className="h-14 rounded-2xl border-0 bg-secondary pl-12 text-base shadow-inner"
                  placeholder="Destination hint (optional) — e.g. Jaipur, Kerala, Varanasi"
                  {...form.register("destinationHint")}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {TRIP_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full border-border bg-white"
                    onClick={() => form.setValue("interests", preset.interests, { shouldValidate: true })}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div>
                <Label htmlFor="interest-input">Interests</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="interest-input"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    placeholder="Add interest"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addInterest();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={addInterest}>
                    Add
                  </Button>
                </div>
                <ul className="mt-2 flex flex-wrap gap-2" aria-label="Selected interests">
                  {interests.map((tag) => (
                    <li key={tag}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-7 rounded-full px-3 text-xs font-normal"
                        aria-label={`Remove interest ${tag}`}
                        onClick={() =>
                          form.setValue(
                            "interests",
                            interests.filter((i) => i !== tag),
                            { shouldValidate: true },
                          )
                        }
                      >
                        {tag} ×
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label className="flex items-center gap-1">
                    <IndianRupee className="size-3.5" /> Budget (INR)
                  </Label>
                  <Input
                    type="number"
                    className="mt-2"
                    {...form.register("budgetInr", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label>Budget tier</Label>
                  <Select
                    value={form.watch("budget")}
                    onValueChange={(v) => v && form.setValue("budget", v as RagUserProfile["budget"])}
                  >
                    <SelectTrigger className="mt-2 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_LEVELS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Days</Label>
                  <Input type="number" min={1} max={30} className="mt-2" {...form.register("travelDays", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Users className="size-3.5" /> Group
                  </Label>
                  <Input type="number" min={1} className="mt-2" {...form.register("groupSize", { valueAsNumber: true })} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Travel vibe</Label>
                  <Select
                    value={form.watch("vibe")}
                    onValueChange={(v) => v && form.setValue("vibe", v as RagUserProfile["vibe"])}
                  >
                    <SelectTrigger className="mt-2 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAVEL_VIBES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {vibeLabels[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Preferred weather</Label>
                  <Input className="mt-2" {...form.register("preferredWeather")} />
                </div>
                <div>
                  <Label>Accessibility needs</Label>
                  <Input className="mt-2" placeholder="Optional" {...form.register("accessibilityNeeds")} />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-2xl bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90 md:w-auto md:px-10"
                disabled={recommendMutation.isPending}
              >
                {recommendMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Retrieving knowledge…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" /> Build grounded itinerary
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {recommendMutation.isPending && (
          <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
            <p className="sr-only">Loading your grounded itinerary</p>
            <Skeleton className="h-48 rounded-2xl" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-36 rounded-2xl" />
            </div>
          </div>
        )}

        {ragResult && !recommendMutation.isPending && (
          <div aria-live="polite">
            <RagResultsPanel data={ragResult} />
          </div>
        )}

        {ragResult && (
          <Card className="travel-card-shadow border-0" id="story">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2 text-primary">
                <Camera className="size-5" />
                <h3 className="text-xl font-semibold">AI story (RAG-grounded)</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {STORY_STYLES.map((style) => (
                  <Button
                    key={style}
                    type="button"
                    size="sm"
                    variant={storyStyle === style ? "default" : "outline"}
                    className="rounded-full capitalize"
                    onClick={() => setStoryStyle(style)}
                  >
                    {style}
                  </Button>
                ))}
              </div>
              <Button
                onClick={generateStory}
                disabled={storyMutation.isPending}
                className="rounded-2xl"
              >
                {storyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Generating…
                  </>
                ) : (
                  "Generate historical narrative"
                )}
              </Button>
              {story && (
                <div className="rounded-2xl bg-secondary/60 p-5">
                  <h4 className="text-lg font-semibold text-primary">{storyTitle}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {story}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {storySources.map((s) => (
                      <Badge key={s} variant="secondary" className="rounded-full text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!ragResult && !recommendMutation.isPending && (
          <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
            <MapPin className="mx-auto mb-2 size-8 text-primary/40" />
            Example: history, photography, offbeat places & local food · ₹25,000 · 4 days
          </div>
        )}
      </main>
    </div>
  );
}
