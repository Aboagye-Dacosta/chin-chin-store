import { prisma } from "../prisma/client";
import { unstable_cache } from "next/cache";

export const loadLocations = async () => {
  const locations = await prisma.location.findMany({
    include: {
      store: true,
    },
  });
  return locations;
};

export const fetchLocations = async () => {
  const locations = unstable_cache(loadLocations, ["locations"], {
    tags: ["locations"],
  });
  return locations();
};

export type Locations = Awaited<ReturnType<typeof loadLocations>>;
