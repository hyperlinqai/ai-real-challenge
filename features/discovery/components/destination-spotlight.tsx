"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";

import { TravelImage } from "@/components/ui/travel-image";

import { SPOTLIGHT_DESTINATIONS } from "@/lib/destination-media";
import type { RagUserProfile } from "@/lib/schemas/rag";
import { cn } from "@/lib/utils";

type Props = {
  activeName?: string;
  onPick: (dest: {
    name: string;
    vibe: RagUserProfile["vibe"];
    interests: string[];
  }) => void;
  className?: string;
};

const PICK_INTERESTS: Record<string, string[]> = {
  Jaipur: ["history", "photography", "forts", "crafts"],
  Munnar: ["nature", "trekking", "tea", "wildlife"],
  Varanasi: ["spiritual", "ghats", "culture", "photography"],
};

export function DestinationSpotlight({ activeName, onPick, className }: Props) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-white/90">Explore — tap a destination</p>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {SPOTLIGHT_DESTINATIONS.map((dest, index) => {
          const selected = activeName?.toLowerCase() === dest.name.toLowerCase();
          return (
            <motion.button
              key={dest.id}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { delay: index * 0.08 }}
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              onClick={() =>
                onPick({
                  name: dest.name,
                  vibe: dest.vibe as RagUserProfile["vibe"],
                  interests: PICK_INTERESTS[dest.name] ?? ["culture", "photography"],
                })
              }
              className={cn(
                "group relative h-44 w-56 shrink-0 snap-start overflow-hidden rounded-2xl text-left shadow-lg outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-white",
                selected && "ring-2 ring-accent",
              )}
            >
              <TravelImage
                src={dest.images[0]!}
                alt={`${dest.name}, ${dest.state}`}
                fill
                className="object-cover transition duration-500 group-hover:scale-110"
                sizes="224px"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
              <div className="absolute bottom-0 p-4 text-white">
                <p className="flex items-center gap-1 text-xs text-white/80">
                  <MapPin className="size-3" aria-hidden />
                  {dest.state}
                </p>
                <p className="text-lg font-bold">{dest.name}</p>
                <p className="text-xs text-white/85">{dest.tagline}</p>
              </div>
              {selected && (
                <span className="absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                  Selected
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs text-white/70">
        Selecting a card fills the planner below — then hit{" "}
        <span className="font-medium text-white">Build grounded itinerary</span>.
      </p>
    </div>
  );
}

export function HeroPhotoStrip({ className }: { className?: string }) {
  const urls = SPOTLIGHT_DESTINATIONS.flatMap((d) => d.images.slice(0, 1));
  return (
    <div
      className={cn(
        "mt-8 grid grid-cols-3 gap-2 overflow-hidden rounded-2xl md:grid-cols-3 md:gap-3",
        className,
      )}
    >
      {urls.map((src, i) => (
        <div
          key={src}
          className={cn(
            "relative aspect-[4/3] overflow-hidden rounded-xl",
            i === 1 && "md:-mt-4 md:mb-4",
          )}
        >
          <TravelImage src={src} alt="" fill className="object-cover" sizes="(max-width:768px) 33vw, 240px" />
        </div>
      ))}
    </div>
  );
}
