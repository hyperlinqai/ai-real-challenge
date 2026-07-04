/** Curated Unsplash URLs for demo visuals (no API key). */
export type SpotlightDestination = {
  id: string;
  name: string;
  state: string;
  vibe: string;
  tagline: string;
  images: string[];
};

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const SPOTLIGHT_DESTINATIONS: SpotlightDestination[] = [
  {
    id: "dest-jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    vibe: "heritage",
    tagline: "Pink forts & bazaar nights",
    images: [
      u("photo-1477587458883-47145ed94245"),
      u("photo-1599669454699-248893623d07"),
      u("photo-1524492412937-28028a016127"),
    ],
  },
  {
    id: "dest-munnar",
    name: "Munnar",
    state: "Kerala",
    vibe: "nature",
    tagline: "Tea trails above the clouds",
    images: [
      u("photo-1593696140826-c4b4acf79963"),
      u("photo-1506905925346-21bda4d32df4"),
      u("photo-1469854523086-cc02fe5d8800"),
    ],
  },
  {
    id: "dest-varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    vibe: "spiritual",
    tagline: "Ghats, lamps & ancient alleys",
    images: [
      u("photo-1561361513-2d000a50f0dc"),
      u("photo-1585137139842-899a397021f2"),
      u("photo-1626621341517-bbf3c7fb5960"),
    ],
  },
];

const EXTRA_BY_VIBE: Record<string, string[]> = {
  heritage: [u("photo-1524492412937-28028a016127"), u("photo-1548013148-79a22324164e")],
  nature: [u("photo-1506905925346-21bda4d32df4"), u("photo-1441974231531-c6227db76b6e")],
  spiritual: [u("photo-1585137139842-899a397021f2"), u("photo-1626621341517-bbf3c7fb5960")],
  foodie: [u("photo-1585937421612-70a08f296772"), u("photo-1601050690597-df9488f0f515")],
  adventure: [u("photo-1464822759844-d150ba1a2a4a"), u("photo-1501785888041-7edeb64de87e")],
  offbeat: [u("photo-1469474968028-56623f02e42e"), u("photo-1500534314209-a25ddb2bd429")],
};

export function getGalleryForDestination(destinationName: string, vibe?: string): string[] {
  const key = destinationName.trim().toLowerCase();
  const spotlight = SPOTLIGHT_DESTINATIONS.find((d) => d.name.toLowerCase() === key);
  if (spotlight) return spotlight.images;

  const partial = SPOTLIGHT_DESTINATIONS.find(
    (d) => key.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(key),
  );
  if (partial) return partial.images;

  const vibeExtras = vibe ? EXTRA_BY_VIBE[vibe] : undefined;
  return [
    u("photo-1524492412937-28028a016127"),
    u("photo-1585937421612-70a08f296772"),
    u("photo-1469474968028-56623f02e42e"),
    ...(vibeExtras ?? [u("photo-1477587458883-47145ed94245")]),
  ].slice(0, 6);
}

export function getHeroImage(destinationName: string): string {
  return getGalleryForDestination(destinationName)[0]!;
}
