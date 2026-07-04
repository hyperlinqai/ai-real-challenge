/** Curated Unsplash URLs verified to return HTTP 200 (no API key). */
export type SpotlightDestination = {
  id: string;
  name: string;
  state: string;
  vibe: string;
  tagline: string;
  images: string[];
};

export const DEFAULT_TRAVEL_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** All IDs verified with HEAD/GET against images.unsplash.com */
export const VERIFIED_PHOTOS = {
  jaipurFort: u("photo-1477587458883-47145ed94245"),
  indiaStreet: u("photo-1573843981267-be1999ff37cd"),
  monument: u("photo-1544984243-ec57ea16fe25"),
  mountains: u("photo-1506905925346-21bda4d32df4"),
  valley: u("photo-1469854523086-cc02fe5d8800"),
  forest: u("photo-1441974231531-c6227db76b6e"),
  ghat: u("photo-1561361513-2d000a50f0dc"),
  temple: u("photo-1512453979798-5ea266f8880c"),
  river: u("photo-1571896349842-33c89424de2d"),
  landscape: u("photo-1469474968028-56623f02e42e"),
  travel: u("photo-1500534314209-a25ddb2bd429"),
  beach: u("photo-1512343879784-a960bf40e7f2"),
} as const;

export const SPOTLIGHT_DESTINATIONS: SpotlightDestination[] = [
  {
    id: "dest-jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    vibe: "heritage",
    tagline: "Pink forts & bazaar nights",
    images: [VERIFIED_PHOTOS.jaipurFort, VERIFIED_PHOTOS.monument, VERIFIED_PHOTOS.indiaStreet],
  },
  {
    id: "dest-munnar",
    name: "Munnar",
    state: "Kerala",
    vibe: "nature",
    tagline: "Tea trails above the clouds",
    images: [VERIFIED_PHOTOS.mountains, VERIFIED_PHOTOS.valley, VERIFIED_PHOTOS.forest],
  },
  {
    id: "dest-varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    vibe: "spiritual",
    tagline: "Ghats, lamps & ancient alleys",
    images: [VERIFIED_PHOTOS.ghat, VERIFIED_PHOTOS.temple, VERIFIED_PHOTOS.river],
  },
];

const EXTRA_BY_VIBE: Record<string, string[]> = {
  heritage: [VERIFIED_PHOTOS.monument, VERIFIED_PHOTOS.jaipurFort],
  nature: [VERIFIED_PHOTOS.forest, VERIFIED_PHOTOS.mountains],
  spiritual: [VERIFIED_PHOTOS.temple, VERIFIED_PHOTOS.ghat],
  foodie: [VERIFIED_PHOTOS.indiaStreet, VERIFIED_PHOTOS.travel],
  adventure: [VERIFIED_PHOTOS.landscape, VERIFIED_PHOTOS.mountains],
  offbeat: [VERIFIED_PHOTOS.travel, VERIFIED_PHOTOS.valley],
};

export function getGalleryForDestination(destinationName: string, vibe?: string): string[] {
  const key = destinationName.trim().toLowerCase();
  const spotlight = SPOTLIGHT_DESTINATIONS.find((d) => d.name.toLowerCase() === key);
  if (spotlight) return [...spotlight.images];

  const partial = SPOTLIGHT_DESTINATIONS.find(
    (d) => key.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(key),
  );
  if (partial) return [...partial.images];

  const vibeExtras = vibe ? EXTRA_BY_VIBE[vibe] : undefined;
  return [
    VERIFIED_PHOTOS.landscape,
    VERIFIED_PHOTOS.travel,
    VERIFIED_PHOTOS.beach,
    ...(vibeExtras ?? [VERIFIED_PHOTOS.jaipurFort]),
  ].slice(0, 6);
}

export function getHeroImage(destinationName: string): string {
  return getGalleryForDestination(destinationName)[0] ?? DEFAULT_TRAVEL_IMAGE;
}
