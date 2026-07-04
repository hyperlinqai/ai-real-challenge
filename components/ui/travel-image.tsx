"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

import { DEFAULT_TRAVEL_IMAGE } from "@/lib/destination-media";
import { cn } from "@/lib/utils";

type TravelImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  fallbackSrc?: string;
};

export function TravelImage({
  src,
  fallbackSrc = DEFAULT_TRAVEL_IMAGE,
  className,
  alt,
  ...props
}: TravelImageProps) {
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  return (
    <Image
      {...props}
      alt={alt}
      src={current}
      className={cn(className)}
      onError={() => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
    />
  );
}
