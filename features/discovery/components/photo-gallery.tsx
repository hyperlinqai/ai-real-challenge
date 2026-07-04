"use client";

import { TravelImage } from "@/components/ui/travel-image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  title: string;
  className?: string;
};

export function PhotoGallery({ images, title, className }: Props) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

  if (images.length === 0) return null;

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-primary">Photo gallery — {title}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setLightbox(true)}
          >
            <ZoomIn className="mr-1 size-3.5" aria-hidden />
            View all
          </Button>
        </div>
        <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-secondary">
          <TravelImage
            src={images[index]!}
            alt={`${title} photo ${index + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 896px"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
            <p className="text-sm text-white/90">
              {index + 1} / {images.length}
            </p>
          </div>
          {images.length > 1 && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 size-9 -translate-y-1/2 rounded-full bg-white/90 shadow"
                aria-label="Previous photo"
                onClick={() => go(-1)}
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 size-9 -translate-y-1/2 rounded-full bg-white/90 shadow"
                aria-label="Next photo"
                onClick={() => go(1)}
              >
                <ChevronRight className="size-5" />
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 snap-start overflow-hidden rounded-lg ring-2 ring-offset-2 transition",
                i === index ? "ring-primary" : "ring-transparent opacity-80 hover:opacity-100",
              )}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
            >
              <TravelImage src={src} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal
          aria-label={`${title} photos`}
          onClick={() => setLightbox(false)}
        >
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-4 top-4 z-10 rounded-full"
            aria-label="Close gallery"
            onClick={() => setLightbox(false)}
          >
            <X className="size-5" />
          </Button>
          <div
            className="relative max-h-[85vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <TravelImage
                src={images[index]!}
                alt={`${title} enlarged`}
                fill
                className="object-contain"
                sizes="896px"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <Button type="button" variant="outline" onClick={() => go(-1)}>
                  Previous
                </Button>
                <Button type="button" variant="outline" onClick={() => go(1)}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
