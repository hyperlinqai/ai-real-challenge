import { describe, expect, it } from "vitest";

import { getGalleryForDestination, getHeroImage, SPOTLIGHT_DESTINATIONS } from "@/lib/destination-media";

describe("destination-media", () => {
  it("returns spotlight images for known destinations", () => {
    const gallery = getGalleryForDestination("Jaipur");
    expect(gallery.length).toBeGreaterThanOrEqual(3);
    expect(gallery[0]).toContain("images.unsplash.com");
  });

  it("matches partial destination names", () => {
    const gallery = getGalleryForDestination("jaipur pink city");
    expect(gallery).toEqual(getGalleryForDestination("Jaipur"));
  });

  it("falls back to vibe extras", () => {
    const gallery = getGalleryForDestination("Unknown Place", "foodie");
    expect(gallery.length).toBeGreaterThan(0);
  });

  it("getHeroImage returns first gallery image", () => {
    expect(getHeroImage("Munnar")).toBe(getGalleryForDestination("Munnar")[0]);
  });

  it("spotlight catalog covers seed destinations", () => {
    const names = SPOTLIGHT_DESTINATIONS.map((d) => d.name);
    expect(names).toContain("Jaipur");
    expect(names).toContain("Varanasi");
  });
});
